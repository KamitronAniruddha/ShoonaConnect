import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Converts a Data URL (base64) to a Blob.
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads a media file (Blob, File, or base64 dataUrl) to Supabase Storage.
 * Stores in bucket 'couple-media' under the couple's folder.
 */
export async function uploadCoupleMedia(
  coupleId: string,
  media: Blob | File | string,
  subfolder = 'media',
  preferredExtension = 'jpg'
): Promise<string> {
  if (!isSupabaseConfigured) {
    // If Supabase credentials are not configured yet, return dataUrl directly for local preview
    if (typeof media === 'string') {
      return media;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(media);
    });
  }

  try {
    let blob: Blob;
    let contentType = 'image/jpeg';

    if (typeof media === 'string') {
      if (media.startsWith('data:')) {
        blob = dataURLtoBlob(media);
        contentType = blob.type || 'image/jpeg';
      } else {
        return media; // Already a URL
      }
    } else {
      blob = media;
      contentType = media.type || 'image/jpeg';
    }

    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const filePath = `${coupleId}/${subfolder}/${timestamp}_${randomId}.${preferredExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('couple-media')
      .upload(filePath, blob, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, using local dataUrl:', uploadError.message);
      if (typeof media === 'string') return media;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(media);
      });
    }

    // Try to get public URL or signed URL
    const { data: publicData } = supabase.storage.from('couple-media').getPublicUrl(filePath);
    return publicData.publicUrl;
  } catch (err) {
    console.error('Failed to upload couple media:', err);
    if (typeof media === 'string') return media;
    return '';
  }
}

/**
 * Deletes a media file from Supabase Storage if it's hosted in 'couple-media'.
 */
export async function deleteCoupleMedia(url: string): Promise<boolean> {
  if (!url || typeof url !== 'string' || !isSupabaseConfigured) return false;

  try {
    if (url.includes('/couple-media/')) {
      const parts = url.split('/couple-media/');
      if (parts.length > 1) {
        // Extract raw path, strip query params if any
        const relativePath = decodeURIComponent(parts[1].split('?')[0]);
        const { error } = await supabase.storage.from('couple-media').remove([relativePath]);
        if (error) {
          console.warn('Supabase storage delete warning:', error.message);
          return false;
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Failed to delete couple media from storage:', err);
    return false;
  }
}

/**
 * Uploads a user avatar to the 'avatars' bucket.
 */
export async function uploadAvatar(userId: string, image: File | string): Promise<string> {
  if (!isSupabaseConfigured) {
    if (typeof image === 'string') return image;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(image);
    });
  }

  try {
    let blob: Blob;
    if (typeof image === 'string') {
      if (image.startsWith('data:')) {
        blob = dataURLtoBlob(image);
      } else {
        return image;
      }
    } else {
      blob = image;
    }

    const fileName = `${userId}/avatar_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, blob, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      console.warn('Avatar upload fallback to data url:', error.message);
      if (typeof image === 'string') return image;
      return '';
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error('Avatar upload error:', err);
    return typeof image === 'string' ? image : '';
  }
}
