import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, RefreshCw, Heart, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const FORTUNES = [
  {
    fortune: 'Today, the stars say a 10-second silent hug with your forehead touching will dissolve all your partner’s stress.',
    dare: 'Whisper three specific things you noticed about them this week.',
    luckyNumber: 7,
    symbol: '🕊️',
  },
  {
    fortune: 'An unexpected gentle kiss on the back of the neck or hand will spark intense romantic butterflies today.',
    dare: 'Send a spontaneous photo of something that reminded you of them.',
    luckyNumber: 22,
    symbol: '✨',
  },
  {
    fortune: 'The bond you two share is building a sanctuary that will outlast any temporary storm.',
    dare: 'Plan a 15-minute midnight slow dance in the living room with no shoes on.',
    luckyNumber: 11,
    symbol: '🌙',
  },
  {
    fortune: 'A shared sweet treat or late-night dessert will create one of your favorite cozy memories this month.',
    dare: 'Feed each other the first bite with eyes closed.',
    luckyNumber: 4,
    symbol: '🍓',
  },
  {
    fortune: 'Your partner loves the sound of your laugh more than any song on the charts.',
    dare: 'Tell the goofiest inside joke that only the two of you understand.',
    luckyNumber: 13,
    symbol: '💫',
  },
  {
    fortune: 'In a world of noise, you two are each other’s absolute peace.',
    dare: 'Write a 1-sentence love note on their mirror or a sticky paper.',
    luckyNumber: 99,
    symbol: '🌹',
  },
];

interface DailyFortuneCapsuleProps {
  partnerName?: string;
  onSendToChat?: (text: string) => void;
}

export const DailyFortuneCapsule: React.FC<DailyFortuneCapsuleProps> = ({
  partnerName = 'My Sweetheart',
  onSendToChat,
}) => {
  const todayKey = `shoona_fortune_${new Date().toDateString()}`;
  const [isCracked, setIsCracked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(todayKey) !== null;
    } catch {
      return false;
    }
  });

  const [fortuneIndex, setFortuneIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      if (saved) return parseInt(saved, 10);
      const dayHash = new Date().getDate() % FORTUNES.length;
      return dayHash;
    } catch {
      return 0;
    }
  });

  const [copied, setCopied] = useState(false);
  const currentFortune = FORTUNES[fortuneIndex] || FORTUNES[0];

  const handleCrackCapsule = () => {
    setIsCracked(true);
    try {
      localStorage.setItem(todayKey, fortuneIndex.toString());
    } catch {
      // ignore
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#fbbf24', '#f59e0b', '#ec4899', '#f43f5e'],
    });
  };

  const handleShuffle = () => {
    const next = (fortuneIndex + 1) % FORTUNES.length;
    setFortuneIndex(next);
    try {
      localStorage.setItem(todayKey, next.toString());
    } catch {
      // ignore
    }
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.8 },
    });
  };

  const handleShare = () => {
    const text = `🥠 Today's Love Fortune for ${partnerName}: "${currentFortune.fortune}" • Couple Mission: ${currentFortune.dare}`;
    if (onSendToChat) {
      onSendToChat(text);
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-amber-500/5 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 rounded-3xl p-4 sm:p-5 border border-amber-200/80 dark:border-amber-900/40 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Daily Romance Fortune & Date Capsule</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-900/40">
                Unlock Daily
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Fresh romantic destiny and cute intimate challenge generated every morning
            </p>
          </div>
        </div>

        {isCracked && (
          <button
            type="button"
            onClick={handleShuffle}
            title="Crack another fortune"
            className="p-1.5 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[10px]">New Capsule</span>
          </button>
        )}
      </div>

      {!isCracked ? (
        <div className="text-center py-6 px-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xs rounded-2xl border border-amber-100 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-200 dark:shadow-none mb-3 animate-bounce">
            🥠
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            Today’s Golden Love Capsule is Sealed
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            Tap the button to break the wax seal and reveal your personalized relationship fortune and intimate dare for {partnerName}.
          </p>
          <button
            type="button"
            onClick={handleCrackCapsule}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Crack Open Capsule ✨</span>
          </button>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded-2xl p-4 border border-amber-200/60 dark:border-slate-700/60 space-y-3 animate-in zoom-in-95">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50">
              {currentFortune.symbol}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                The Romance Oracle Says:
              </span>
              <p className="text-xs sm:text-sm font-editorial italic text-slate-800 dark:text-white leading-relaxed">
                "{currentFortune.fortune}"
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs text-rose-700 dark:text-rose-300">
              <strong className="font-bold">✨ Today’s Intimate Dare:</strong> {currentFortune.dare}
            </div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full shadow-2xs">
              Lucky Resonance: #{currentFortune.luckyNumber}
            </span>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : `Send to ${partnerName}`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
