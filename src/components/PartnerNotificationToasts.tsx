import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../lib/supabase';
import { ActiveTab } from '../types';
import { messageRowToMessage } from '../utils/supabaseMappers';
import {
  MessageCircleHeart,
  Gamepad2,
  X,
  Send,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Flame,
  Volume2,
} from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'chat' | 'game_invite' | 'game_declined' | 'game_cancelled';
  title: string;
  body: string;
  senderName: string;
  senderPhoto?: string;
  gameType?: 'tictactoe' | 'chess' | 'number-guess';
  gameId?: string;
  timestamp: number;
}

interface PartnerNotificationToastsProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGame?: (gameType: 'tictactoe' | 'chess' | 'number-guess', gameId?: string) => void;
}

export const PartnerNotificationToasts: React.FC<PartnerNotificationToastsProps> = ({
  setActiveTab,
  onOpenGame,
}) => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const coupleId = couple?.id;

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [inlineReplyMap, setInlineReplyMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  // Play audio chime when toast arrives
  const playToastChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime Listeners for Chat Messages & Game Invitations
  useEffect(() => {
    if (!coupleId || !userProfile?.uid) return;

    const channel = createSafeChannel(`partner_notifications:${coupleId}`);

    // 1. Listen for Broadcast Game Events (Invitations, Declines, Cancellations)
    channel
      .on('broadcast', { event: 'game_invitation' }, (event) => {
        const payload = event.payload;
        if (payload && payload.hostUid !== userProfile.uid) {
          window.dispatchEvent(new CustomEvent('game_invitation_declined', { detail: payload }));
          playToastChime();
          window.dispatchEvent(new CustomEvent('game_invitation_cancelled', { detail: payload }));
          const newToast: ToastNotification = {
            id: 'invite_' + Date.now(),
            type: 'game_invite',
            title: `🎮 ${payload.hostName || 'Partner'} invited you to play!`,
            body: payload.title || `Play ${payload.gameType} together now 💕`,
            senderName: payload.hostName || partnerProfile?.displayName || 'Partner',
            senderPhoto: partnerProfile?.photoURL,
            gameType: payload.gameType,
            gameId: payload.gameId,
            timestamp: Date.now(),
          };
          setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
        }
      })
      .on('broadcast', { event: 'game_invitation_declined' }, (event) => {
        const payload = event.payload;
        if (payload && payload.declinedBy !== userProfile.uid) {
          window.dispatchEvent(new CustomEvent('game_invitation_declined', { detail: payload }));
          playToastChime();
          window.dispatchEvent(new CustomEvent('game_invitation_cancelled', { detail: payload }));
          const newToast: ToastNotification = {
            id: 'dec_' + Date.now(),
            type: 'game_declined',
            title: `💔 Game Invitation Declined`,
            body: `${payload.declinedByName || 'Partner'} isn't available to play right now.`,
            senderName: payload.declinedByName || partnerProfile?.displayName || 'Partner',
            senderPhoto: partnerProfile?.photoURL,
            timestamp: Date.now(),
          };
          setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
        }
      })
      .on('broadcast', { event: 'game_invitation_cancelled' }, (event) => {
        const payload = event.payload;
        if (payload && payload.cancelledBy !== userProfile.uid) {
          window.dispatchEvent(new CustomEvent('game_invitation_cancelled', { detail: payload }));
          const newToast: ToastNotification = {
            id: 'can_' + Date.now(),
            type: 'game_cancelled',
            title: `ℹ️ Challenge Cancelled`,
            body: `${payload.cancelledByName || 'Partner'} cancelled the game request.`,
            senderName: payload.cancelledByName || partnerProfile?.displayName || 'Partner',
            senderPhoto: partnerProfile?.photoURL,
            timestamp: Date.now(),
          };
          setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
        }
      })
      .subscribe();

    // 2. Listen for Database Chat Messages
    const messageChannel = createSafeChannel(`toast_db_messages:${coupleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          if (payload.new) {
            const msg = messageRowToMessage(payload.new);
            // Only show toast if message is from partner
            if (msg.senderId !== userProfile.uid) {
              window.dispatchEvent(new CustomEvent('game_invitation_declined', { detail: payload }));
          playToastChime();
          window.dispatchEvent(new CustomEvent('game_invitation_cancelled', { detail: payload }));
          const newToast: ToastNotification = {
                id: 'msg_' + msg.id,
                type: 'chat',
                title: `💬 New message from ${msg.senderName || partnerProfile?.displayName || 'Partner'}`,
                body: msg.text || (msg.mediaUrl ? '📷 Sent a photo / attachment' : 'New love message 💕'),
                senderName: msg.senderName || partnerProfile?.displayName || 'Partner',
                senderPhoto: partnerProfile?.photoURL,
                timestamp: Date.now(),
              };
              setToasts((prev) => [newToast, ...prev.slice(0, 3)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messageChannel);
    };
  }, [coupleId, userProfile?.uid, partnerProfile]);

  // Handle Quick Inline Reply to Chat Message
  const handleSendInlineReply = async (toastId: string) => {
    const text = inlineReplyMap[toastId]?.trim();
    if (!text || !coupleId || !userProfile) return;

    setSendingReplyId(toastId);
    try {
      const now = new Date().toISOString();
      const row = {
        couple_id: coupleId,
        sender_id: userProfile.uid,
        sender_name: userProfile.displayName || 'You',
        content: text,
        created_at: now,
        read_by: [userProfile.uid],
      };

      await supabase.from('messages').insert(row);

      setInlineReplyMap((prev) => ({ ...prev, [toastId]: '' }));
      removeToast(toastId);
    } catch (err) {
      console.error('Failed to send inline reply:', err);
    } finally {
      setSendingReplyId(null);
    }
  };

  // Handle Accepting Game Invitation
  const handleAcceptGameInvite = (toast: ToastNotification) => {
    setActiveTab('games');
    if (onOpenGame && toast.gameType) {
      onOpenGame(toast.gameType, toast.gameId);
    }
    removeToast(toast.id);
  };

  // Handle Declining Game Invitation
  const handleDeclineGameInvite = (toast: ToastNotification) => {
    if (coupleId && userProfile) {
      sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation_declined', {
        declinedBy: userProfile.uid,
        declinedByName: userProfile.displayName || 'Partner',
        gameId: toast.gameId,
      });
    }
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full font-sans pointer-events-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#160f14]/95 backdrop-blur-md border border-[#ff3377]/40 rounded-3xl p-4 shadow-2xl shadow-pink-950/40 text-white space-y-3 relative overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#ff3377]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-md shrink-0">
              {toast.senderPhoto ? (
                <img src={toast.senderPhoto} alt={toast.senderName} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full bg-[#160f14] rounded-[14px] flex items-center justify-center font-black text-rose-400 text-xs">
                  {toast.senderName.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-0.5 pr-6">
              <h4 className="text-xs font-extrabold text-white leading-snug">{toast.title}</h4>
              <p className="text-xs text-neutral-300 line-clamp-2">{toast.body}</p>
            </div>
          </div>

          {/* Chat Toast Actions: Quick Reply + Open Chat */}
          {toast.type === 'chat' && (
            <div className="space-y-2 pt-1">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inlineReplyMap[toast.id] || ''}
                  onChange={(e) =>
                    setInlineReplyMap((prev) => ({ ...prev, [toast.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendInlineReply(toast.id);
                  }}
                  placeholder="Type quick reply..."
                  className="w-full bg-[#0d070b] border border-white/15 rounded-xl px-3 py-1.5 pr-8 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3377]"
                />
                <button
                  onClick={() => handleSendInlineReply(toast.id)}
                  disabled={!inlineReplyMap[toast.id]?.trim() || sendingReplyId === toast.id}
                  className="absolute right-1.5 p-1 rounded-lg bg-[#ff3377] text-white hover:bg-[#ff4d8d] transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => {
                  setActiveTab('chat');
                  removeToast(toast.id);
                }}
                className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageCircleHeart className="w-3.5 h-3.5 text-[#ff4d8d]" />
                <span>Open Full Chat Conversation</span>
              </button>
            </div>
          )}

          {/* Game Invite Toast Actions: Accept or Decline */}
          {toast.type === 'game_invite' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleAcceptGameInvite(toast)}
                className="py-2 rounded-xl bg-gradient-to-r from-[#ff3377] to-amber-500 hover:brightness-110 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Gamepad2 className="w-3.5 h-3.5" /> Accept & Play 🚀
              </button>

              <button
                onClick={() => handleDeclineGameInvite(toast)}
                className="py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                Not Now ❌
              </button>
            </div>
          )}

          {/* Info Toast Actions (Declined / Cancelled) */}
          {(toast.type === 'game_declined' || toast.type === 'game_cancelled') && (
            <div className="pt-1 text-right">
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[11px] text-neutral-400 hover:text-white font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
