import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../lib/supabase';
import { X, Heart, Sparkles, Gamepad2, Volume2, ShieldAlert } from 'lucide-react';

interface WaitingForCoupleModalProps {
  gameTitle: string;
  gameSubtitle?: string;
  gameType: 'tictactoe' | 'chess' | 'number-guess';
  gameId?: string;
  onCancelGame: () => void;
  onClose: () => void;
}

export const WaitingForCoupleModal: React.FC<WaitingForCoupleModalProps> = ({
  gameTitle,
  gameSubtitle,
  gameType,
  gameId,
  onCancelGame,
  onClose,
}) => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const coupleId = couple?.id;

  const [declinedMessage, setDeclinedMessage] = useState<string | null>(null);

  // Send real-time invitation broadcast when modal opens
  useEffect(() => {
    if (!coupleId || !userProfile) return;

    sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation', {
      hostUid: userProfile.uid,
      hostName: userProfile.displayName || 'Your Sweetheart',
      gameType,
      gameId,
      title: gameTitle,
    });
  }, [coupleId, userProfile, gameType, gameId, gameTitle]);

  // Listen for Decline or Cancellation
  useEffect(() => {
    if (!coupleId || !userProfile) return;

    const channel = createSafeChannel(`partner_notifications:${coupleId}`)
      .on('broadcast', { event: 'game_invitation_declined' }, (event) => {
        const payload = event.payload;
        if (payload && payload.declinedBy !== userProfile.uid) {
          setDeclinedMessage(
            `${partnerProfile?.displayName || 'Partner'} isn't available to play right now 💔`
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userProfile, partnerProfile]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#160f14] rounded-3xl border border-[#ff3377]/40 p-6 shadow-2xl space-y-6 text-center relative overflow-hidden text-white">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#ff3377]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!declinedMessage ? (
          <>
            {/* Animated Pulsing Partner Avatar */}
            <div className="relative w-24 h-24 mx-auto my-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 animate-ping opacity-30" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-1 shadow-xl shadow-pink-500/20">
                {partnerProfile?.photoURL ? (
                  <img
                    src={partnerProfile.photoURL}
                    alt={partnerProfile.displayName || 'Partner'}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                ) : (
                  <div className="w-full h-full bg-[#160f14] rounded-[20px] flex items-center justify-center text-3xl font-black text-rose-400">
                    {partnerProfile?.displayName?.charAt(0) || '💕'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Waiting for Partner... ⏳
              </div>

              <h3 className="text-xl font-black font-fraunces text-white mt-1">
                {gameTitle}
              </h3>
              <p className="text-xs text-neutral-300 px-2">
                {gameSubtitle ||
                  `Invitation sent to ${
                    partnerProfile?.displayName || 'My Sweetheart'
                  }! Waiting for them to join...`}
              </p>
            </div>

            {/* Cancel Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onCancelGame}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Cancel Game Invitation ❌</span>
              </button>
            </div>
          </>
        ) : (
          /* Partner Declined View */
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 mx-auto flex items-center justify-center text-3xl text-rose-400">
              💔
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold font-fraunces text-white">Partner Declined</h3>
              <p className="text-xs text-neutral-300 px-2">{declinedMessage}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#ff3377] hover:bg-[#ff4d8d] text-white font-bold text-xs transition-all cursor-pointer"
            >
              Back to Games Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
