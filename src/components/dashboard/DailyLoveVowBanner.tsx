import React, { useState } from 'react';
import { Heart, Sparkles, Send, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyLoveVowBannerProps {
  partnerName?: string;
  myName?: string;
  onSendVow?: (vow: string) => void;
}

const LOVE_VOWS = [
  'I choose you today, tomorrow, and every tomorrow after that.',
  'I promise to listen to you with patience, tenderness, and an open heart.',
  'I promise to make you laugh even when the world feels heavy.',
  'I vow to celebrate your victories and hold your hand through every storm.',
  'I promise to cherish our tiny moments as much as our grand adventures.',
  'I vow to always be your safest haven and your fiercest supporter.',
];

export const DailyLoveVowBanner: React.FC<DailyLoveVowBannerProps> = ({
  partnerName = 'Sweetheart',
  myName = 'Me',
  onSendVow,
}) => {
  const [dayIndex, setDayIndex] = useState(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return dayOfYear % LOVE_VOWS.length;
  });

  const [hasRecited, setHasRecited] = useState(false);

  const currentVow = LOVE_VOWS[dayIndex];

  const handleRecite = () => {
    setHasRecited(true);
    if (onSendVow) {
      onSendVow(`💍 Today's Sacred Love Vow to ${partnerName}:\n"${currentVow}"\n— Dedicated with all my heart ❤️`);
    }
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="w-full bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-purple-950/40 rounded-3xl p-4 sm:p-5 border border-rose-200/70 dark:border-rose-900/50 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Daily Love Vow & Devotion
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                Today's Promise
              </span>
            </div>
            <p className="font-editorial italic text-sm sm:text-base text-slate-800 dark:text-rose-100 mt-1 leading-relaxed">
              "{currentVow}"
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRecite}
          disabled={hasRecited}
          className={`w-full sm:w-auto shrink-0 px-4 py-2.5 sm:py-2 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
            hasRecited
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md'
          }`}
        >
          {hasRecited ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Vow Dedicated</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Dedicate to {partnerName}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
