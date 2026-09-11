import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { parseSupabaseError } from '../utils/supabaseErrors';

export function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Remove /rest/v1 or /rest/v1/ suffix if user pasted REST endpoint
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

const DEFAULT_SUPABASE_URL = 'https://berzkommtqfyefragpqv.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_PBAXPerZ8HC_UBuyuDTeyg_4GrINylT';

export function getSupabaseCredentials(): { url: string; key: string } {
  let url = '';
  let key = '';

  // 1. Check environment variables
  try {
    const metaEnv = (import.meta as any)?.env || {};
    url = metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || '';
    key = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY || metaEnv.VITE_SUPABASE_KEY || metaEnv.SUPABASE_KEY || '';
  } catch {}

  try {
    if ((!url || !key) && typeof process !== 'undefined' && process.env) {
      url = url || (process.env as any).VITE_SUPABASE_URL || (process.env as any).SUPABASE_URL || '';
      key = key || (process.env as any).VITE_SUPABASE_ANON_KEY || (process.env as any).SUPABASE_ANON_KEY || '';
    }
  } catch {}

  // 2. Check localStorage override
  if (typeof window !== 'undefined') {
    try {
      const storedUrl = localStorage.getItem('shoona_supabase_url') || localStorage.getItem('VITE_SUPABASE_URL');
      const storedKey = localStorage.getItem('shoona_supabase_anon_key') || localStorage.getItem('VITE_SUPABASE_ANON_KEY');
      if (storedUrl && storedUrl.trim().length > 0) {
        url = storedUrl.trim();
      }
      if (storedKey && storedKey.trim().length > 0) {
        key = storedKey.trim();
      }
    } catch {}
  }

  // 3. Fallback to configured project defaults if unset
  if (!url || url.includes('your-project-id') || url.includes('placeholder-project')) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!key || key.includes('your-anon-public-key') || key.includes('placeholder-anon-key')) {
    key = DEFAULT_SUPABASE_KEY;
  }

  return {
    url: cleanSupabaseUrl(url),
    key: key.trim(),
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    const cleanedUrl = cleanSupabaseUrl(url);
    const cleanedKey = key.trim();
    localStorage.setItem('shoona_supabase_url', cleanedUrl);
    localStorage.setItem('shoona_supabase_anon_key', cleanedKey);
    localStorage.setItem('VITE_SUPABASE_URL', cleanedUrl);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', cleanedKey);
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shoona_supabase_url');
    localStorage.removeItem('shoona_supabase_anon_key');
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
  }
}

const { url: initialUrl, key: initialKey } = getSupabaseCredentials();

export const isSupabaseConfigured = Boolean(
  initialUrl &&
  initialKey &&
  initialUrl.startsWith('http') &&
  !initialUrl.includes('your-project-id') &&
  !initialUrl.includes('placeholder-project') &&
  !initialKey.includes('your-anon-public-key') &&
  !initialKey.includes('placeholder-anon-key') &&
  initialKey.length > 15
);

// Effective credentials
const effectiveUrl = initialUrl || DEFAULT_SUPABASE_URL;
const effectiveKey = initialKey || DEFAULT_SUPABASE_KEY;

export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      apikey: effectiveKey,
      Authorization: `Bearer ${effectiveKey}`,
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Creates a new Supabase Realtime channel, automatically removing any stale
 * existing channel with the same topic to avoid "cannot add callbacks after subscribe()" errors.
 */
export function createSafeChannel(channelName: string, opts?: any) {
  try {
    const existing = supabase.getChannels().find(
      (c) => c.topic === `realtime:${channelName}` || c.topic === channelName
    );
    if (existing) {
      supabase.removeChannel(existing);
    }
  } catch {
    // Quiet catch
  }
  return supabase.channel(channelName, opts);
}

/**
 * High quality client-side image compression to guarantee fast uploads
 * without uploading massive original files.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Utility to test the Supabase backend connectivity safely
 */
export async function testConnection(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.info('Supabase: Running with pending user credentials. Configure VITE_SUPABASE_URL in settings to connect live backend.');
    return false;
  }
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      const parsed = parseSupabaseError(error);
      console.warn('Supabase Connection Notice:', parsed.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase Connection Check:', err);
    return false;
  }
}
