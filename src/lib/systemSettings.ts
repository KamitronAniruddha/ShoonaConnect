import { supabase, sendRealtimeBroadcast } from './supabase';
import { SystemAccessControl, SiteOperationalStatus, AuthAccessStatus, ADMIN_EMAIL } from '../types';

const STORAGE_KEY = 'shoona_system_access_control';
const ADMIN_BYPASS_KEY = 'shoona_admin_bypass_token';
const DEFAULT_PASSKEY = 'aniruddha2026';

export const DEFAULT_ACCESS_CONTROL: SystemAccessControl = {
  siteStatus: 'operational',
  authStatus: 'all_enabled',
  suspendedBy: 'Aniruddha',
  suspendDurationType: 'indefinite',
  suspendUntil: null,
  noticeTitle: 'Aniruddha has suspended this website and will not turn on again',
  noticeMessage: 'All access, sanctuary spaces, and services have been administratively halted by Aniruddha.',
  allowAdminBypass: true,
  adminPasskey: DEFAULT_PASSKEY,
  lastUpdated: new Date().toISOString(),
};

/**
 * Checks if a timer-based suspension has elapsed and auto-restores if so.
 */
function evaluateTimerExpiration(data: SystemAccessControl): SystemAccessControl {
  if (
    data.siteStatus === 'suspended' &&
    data.suspendDurationType === 'timer' &&
    data.suspendUntil
  ) {
    const expireTime = new Date(data.suspendUntil).getTime();
    if (!isNaN(expireTime) && Date.now() >= expireTime) {
      const restored: SystemAccessControl = {
        ...data,
        siteStatus: 'operational',
        suspendUntil: null,
        lastUpdated: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
        window.dispatchEvent(new CustomEvent('shoona_access_control_change', { detail: restored }));
      } catch {}
      return restored;
    }
  }
  return data;
}

/**
 * Get the current system access control settings.
 */
export function getSystemAccessControl(): SystemAccessControl {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: SystemAccessControl = {
        ...DEFAULT_ACCESS_CONTROL,
        ...parsed,
      };
      return evaluateTimerExpiration(merged);
    }
  } catch (err) {
    console.error('Error reading access control from storage:', err);
  }
  return DEFAULT_ACCESS_CONTROL;
}

/**
 * Save updated system access control settings and broadcast to all clients in real-time.
 */
export async function saveSystemAccessControl(
  updates: Partial<SystemAccessControl>
): Promise<SystemAccessControl> {
  const current = getSystemAccessControl();
  const next: SystemAccessControl = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };

  // 1. Save to local storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('shoona_access_control_change', { detail: next }));
  } catch (err) {
    console.error('Error writing access control to storage:', err);
  }

  // 2. Broadcast via Supabase Realtime WebSocket
  try {
    sendRealtimeBroadcast('system_access_control', 'update', next);
  } catch (err) {
    console.warn('Realtime broadcast notice:', err);
  }

  // 3. Opportunistically sync to Supabase table if available
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 'access_control', data: next, updated_at: new Date().toISOString() });
    if (error && error.code !== '42P01') {
      // 42P01 means table does not exist, which is fine as local+realtime fallback handles it
      console.info('Supabase settings sync status:', error.message);
    }
  } catch {}

  return next;
}

/**
 * Fetch latest settings from Supabase if available, updating local state.
 */
export async function fetchRemoteSystemAccessControl(): Promise<SystemAccessControl> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('data')
      .eq('id', 'access_control')
      .maybeSingle();

    if (data && data.data) {
      const merged = { ...DEFAULT_ACCESS_CONTROL, ...data.data };
      const evaluated = evaluateTimerExpiration(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluated));
      window.dispatchEvent(new CustomEvent('shoona_access_control_change', { detail: evaluated }));
      return evaluated;
    }
  } catch {}
  return getSystemAccessControl();
}

/**
 * Subscribes to real-time changes to system access control.
 */
export function subscribeToSystemAccessControl(
  callback: (settings: SystemAccessControl) => void
): () => void {
  // 1. Listen for local storage changes across tabs
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(evaluateTimerExpiration({ ...DEFAULT_ACCESS_CONTROL, ...parsed }));
      } catch {}
    }
  };

  // 2. Listen for in-app custom event
  const handleCustom = (e: any) => {
    if (e.detail) {
      callback(e.detail);
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('shoona_access_control_change', handleCustom);

  // 3. Supabase Realtime channel
  const channel = supabase
    .channel('system_access_control')
    .on('broadcast', { event: 'update' }, (payload) => {
      if (payload && payload.payload) {
        const updated = evaluateTimerExpiration({
          ...DEFAULT_ACCESS_CONTROL,
          ...payload.payload,
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        callback(updated);
      }
    })
    .subscribe();

  // 4. Timer evaluation ticker every 10 seconds
  const ticker = setInterval(() => {
    const current = getSystemAccessControl();
    if (
      current.siteStatus === 'suspended' &&
      current.suspendDurationType === 'timer' &&
      current.suspendUntil
    ) {
      const checked = evaluateTimerExpiration(current);
      if (checked.siteStatus === 'operational') {
        callback(checked);
      }
    }
  }, 10000);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('shoona_access_control_change', handleCustom);
    clearInterval(ticker);
    try {
      supabase.removeChannel(channel);
    } catch {}
  };
}

/**
 * Validates whether the given passkey is valid for Administrator Aniruddha.
 */
export function verifyAdminPasskey(passkey: string): boolean {
  const current = getSystemAccessControl();
  const cleanKey = passkey.trim().toLowerCase();
  const storedKey = (current.adminPasskey || DEFAULT_PASSKEY).trim().toLowerCase();

  // Master bypass codes:
  if (
    cleanKey === storedKey ||
    cleanKey === 'aniruddha2026' ||
    cleanKey === 'aniruddha' ||
    cleanKey === 'shoona-admin'
  ) {
    try {
      sessionStorage.setItem(ADMIN_BYPASS_KEY, 'true');
    } catch {}
    return true;
  }
  return false;
}

/**
 * Checks if the current session has an active Admin bypass.
 */
export function hasAdminBypass(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_BYPASS_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Clears the active admin bypass token.
 */
export function clearAdminBypass(): void {
  try {
    sessionStorage.removeItem(ADMIN_BYPASS_KEY);
  } catch {}
}

/**
 * Helper to turn the website back on immediately.
 */
export async function restoreWebsiteOperational(): Promise<SystemAccessControl> {
  return saveSystemAccessControl({
    siteStatus: 'operational',
    suspendUntil: null,
  });
}
