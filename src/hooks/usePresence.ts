import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured, createSafeChannel } from '../lib/supabase';
import { UserPresence } from '../types';

interface UsePresenceOptions {
  coupleId?: string | null;
  myUid?: string | null;
  partnerUid?: string | null;
}

export function usePresence({ coupleId, myUid, partnerUid }: UsePresenceOptions) {
  const [partnerPresence, setPartnerPresence] = useState<UserPresence | null>(null);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(false);
  const [partnerStatusText, setPartnerStatusText] = useState<string>('Offline');

  const checkActiveIntervalRef = useRef<any>(null);

  // Helper to calculate partner status string
  const calculatePartnerStatus = useCallback((presence: UserPresence | null) => {
    if (!presence) {
      setIsPartnerOnline(false);
      setPartnerStatusText('Offline');
      return;
    }

    const now = Date.now();
    const lastActiveTime = presence.lastActiveAt ? new Date(presence.lastActiveAt).getTime() : 0;
    const diffMs = now - lastActiveTime;

    const isActuallyOnline = presence.isOnline && diffMs < 75000;
    setIsPartnerOnline(isActuallyOnline);

    if (isActuallyOnline) {
      setPartnerStatusText('Online right now • In Sanctuary');
    } else {
      if (diffMs < 60000) {
        setPartnerStatusText('Active just moments ago');
      } else if (diffMs < 3600000) {
        const mins = Math.floor(diffMs / 60000);
        setPartnerStatusText(`Active ${mins}m ago`);
      } else if (diffMs < 86400000) {
        const hours = Math.floor(diffMs / 3600000);
        const timeStr = new Date(lastActiveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setPartnerStatusText(`Active today at ${timeStr}`);
      } else {
        const days = Math.floor(diffMs / 86400000);
        setPartnerStatusText(`Active ${days}d ago`);
      }
    }
  }, []);

  // Update DB presence record
  const updateDbPresence = useCallback(async (isOnline: boolean) => {
    if (!myUid || !isSupabaseConfigured) return;
    const nowIso = new Date().toISOString();
    try {
      await supabase.from('user_presence').upsert({
        user_id: myUid,
        is_online: isOnline,
        last_active_at: nowIso,
        updated_at: nowIso,
      });
      await supabase.from('profiles').update({
        is_online: isOnline,
        last_active_at: nowIso,
        updated_at: nowIso,
      }).eq('id', myUid);
    } catch {
      // Quiet catch
    }
  }, [myUid]);

  // Realtime Presence Channel
  useEffect(() => {
    if (!coupleId || !myUid) return;

    updateDbPresence(true);

    const channelName = `presence:${coupleId}`;
    const channel = createSafeChannel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (partnerUid && state[partnerUid] && state[partnerUid].length > 0) {
          const latest = state[partnerUid][0] as any;
          const pres: UserPresence = {
            userId: partnerUid,
            isOnline: true,
            lastActiveAt: latest.lastActiveAt || new Date().toISOString(),
            updatedAt: latest.lastActiveAt || new Date().toISOString(),
          };
          setPartnerPresence(pres);
          calculatePartnerStatus(pres);
        } else {
          // Check DB fallback
          if (partnerUid) {
            supabase
              .from('user_presence')
              .select('*')
              .eq('user_id', partnerUid)
              .maybeSingle()
              .then(({ data }) => {
                if (data) {
                  const pres: UserPresence = {
                    userId: data.user_id,
                    isOnline: data.is_online,
                    lastActiveAt: data.last_active_at,
                    updatedAt: data.updated_at,
                  };
                  setPartnerPresence(pres);
                  calculatePartnerStatus(pres);
                } else {
                  setPartnerPresence(null);
                  setIsPartnerOnline(false);
                  setPartnerStatusText('Offline');
                }
              });
          }
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === partnerUid) {
          const pres: UserPresence = {
            userId: partnerUid,
            isOnline: true,
            lastActiveAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setPartnerPresence(pres);
          calculatePartnerStatus(pres);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === partnerUid) {
          setIsPartnerOnline(false);
          setPartnerStatusText('Active just moments ago');
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: myUid,
            isOnline: true,
            lastActiveAt: new Date().toISOString(),
          });
        }
      });

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      updateDbPresence(isVisible);
      if (isVisible) {
        channel.track({
          userId: myUid,
          isOnline: true,
          lastActiveAt: new Date().toISOString(),
        });
      }
    };

    const handleBeforeUnload = () => {
      updateDbPresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateDbPresence(false);
      supabase.removeChannel(channel);
    };
  }, [coupleId, myUid, partnerUid, updateDbPresence, calculatePartnerStatus]);

  // Periodic active status tick
  useEffect(() => {
    checkActiveIntervalRef.current = setInterval(() => {
      if (partnerPresence) {
        calculatePartnerStatus(partnerPresence);
      }
    }, 15000);

    return () => {
      if (checkActiveIntervalRef.current) clearInterval(checkActiveIntervalRef.current);
    };
  }, [partnerPresence, calculatePartnerStatus]);

  return {
    isPartnerOnline,
    partnerPresence,
    partnerStatusText,
  };
}
