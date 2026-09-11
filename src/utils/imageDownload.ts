/**
 * Utility to download profile photos and couple memories reliably across browsers and devices.
 */
export async function downloadProfilePhoto(
  imageUrl: string,
  filename = 'profile-photo.png'
): Promise<boolean> {
  if (!imageUrl) return false;

  try {
    // If it's a data URL (base64 image), download directly via anchor
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    // Try fetching as blob for cross-origin or external CDN URLs (Dicebear, Unsplash, Firebase, etc.)
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    console.warn('Blob fetch failed, falling back to direct link download:', err);
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (fallbackErr) {
      console.error('All download methods failed:', fallbackErr);
      return false;
    }
  }
}
