import React, { useState, useEffect } from 'react';
import { Heart, Activity, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, createSafeChannel } from '../../lib/supabase';
import { playHeartbeatSound } from '../../utils/chatService';

interface HeartbeatPulseButtonProps {
  coupleId?: string;
  myUid?: string;
  myName?: string;
  partnerName?: string;
  isPartnerOnline?: boolean;
}

export const HeartbeatPulseButton: React.FC<HeartbeatPulseButtonProps> = ({
  coupleId,
  myUid,
  myName = 'Me',
  partnerName = 'My Love',
  isPartnerOnline = false,
}) => {
  const [pulseCount, setPulseCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`shoona_pulse_count_${new Date().toDateString()}`);
      return saved ? parseInt(saved, 10) : 12;
    } catch {
      return 12;
    }
  });

  const [isPulsing, setIsPulsing] = useState(false);
  const [lastReceivedFromPartner, setLastReceivedFromPartner] = useState<string | null>(null);

  // Broadcast channel for real-time instant pulse
  useEffect(() => {
    if (!coupleId) return;

    const channel = createSafeChannel(`couple_pulse:${coupleId}`)
      .on('broadcast', { event: 'heartbeat_pulse' }, (payload) => {
        const { senderId, senderName } = payload.payload || {};
        if (senderId && senderId !== myUid) {
          // Play sound and trigger screen pulse
          playHeartbeatSound();

          // Haptic vibration
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }

          setLastReceivedFromPartner(`${senderName || partnerName} felt your pulse right now!`);
          setIsPulsing(true);
          setTimeout(() => setIsPulsing(false), 2000);

          confetti({
            particleCount: 25,
            spread: 45,
            origin: { y: 0.8 },
            colors: ['#ff4d8d', '#ff1a75', '#ff85b3'],
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, myUid, partnerName]);

  const handleSendHeartbeat = async () => {
    // 1. Audio & local haptic
    playHeartbeatSound();
    if (navigator.vibrate) {
      navigator.vibrate([120, 80, 150]);
    }

    // 2. Animate
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 1600);

    const newCount = pulseCount + 1;
    setPulseCount(newCount);
    try {
      localStorage.setItem(`shoona_pulse_count_${new Date().toDateString()}`, newCount.toString());
    } catch {
      // ignore
    }

    // 3. Heart fireworks
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.85 },
      colors: ['#f43f5e', '#ec4899', '#fb7185'],
    });

    // 4. Send real-time broadcast to partner
    if (coupleId) {
      const channel = createSafeChannel(`couple_pulse:${coupleId}`);
      await channel.send({
        type: 'broadcast',
        event: 'heartbeat_pulse',
        payload: {
          senderId: myUid,
          senderName: myName,
          timestamp: Date.now(),
        },
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Background ripples */}
      {isPulsing && (
        <div className="absolute inset-0 bg-white/20 animate-ping rounded-3xl pointer-events-none duration-1000" />
      )}

      <div className="flex items-center gap-3.5 text-center sm:text-left min-w-0">
        <div className="relative">
          <button
            type="button"
            onClick={handleSendHeartbeat}
            className={`w-14 h-14 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center shadow-inner cursor-pointer transition-transform ${
              isPulsing ? 'scale-125' : 'hover:scale-105 active:scale-95'
            }`}
            title="Tap to send real-time heartbeat to partner"
          >
            <Heart className={`w-7 h-7 text-white fill-white ${isPulsing ? 'animate-bounce' : ''}`} />
          </button>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black flex items-center justify-center shadow-xs">
            {pulseCount > 99 ? '99+' : pulseCount}
          </span>
        </div>

        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs mb-1">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>"Thinking of You" Heartbeat Transmitter</span>
          </div>
          <h3 className="text-base font-bold font-display tracking-tight text-white truncate">
            {lastReceivedFromPartner || `Send instant cardiac vibration to ${partnerName}`}
          </h3>
          <p className="text-xs text-rose-100/90 truncate">
            {isPartnerOnline
              ? `${partnerName} is online • Partner phone will vibrate right now!`
              : 'Tap to transmit your heartbeat presence across the distance.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSendHeartbeat}
        className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer hover:shadow-lg active:scale-95"
      >
        <Send className="w-4 h-4" />
        <span>Nudge Partner's Heart ❤️</span>
      </button>
    </div>
  );
};
