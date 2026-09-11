import React from 'react';
import { EvaluatedBadge, TIER_CONFIG, ACHIEVEMENT_CATEGORIES } from '../utils/achievements';
import {
  X,
  Sparkles,
  Lock,
  Unlock,
  Award,
  CheckCircle2,
  Share2,
  Calendar,
  Heart,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeDetailModalProps {
  badge: EvaluatedBadge | null;
  onClose: () => void;
  onCelebrate?: () => void;
}

export const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const tier = TIER_CONFIG[badge.tier];
  const cat = ACHIEVEMENT_CATEGORIES[badge.category];
  const isUnlocked = badge.progress.isUnlocked;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#eab308', '#38bdf8', '#a855f7'],
    });
  };

  const handleCopyQuote = () => {
    const text = `🏆 Saathi Achievement: "${badge.title} (${badge.hindiTitle})"\n"${badge.description}"\nUnlocked in our Private Couple Sanctuary! 💕`;
    navigator.clipboard.writeText(text);
    alert('Achievement copied to clipboard! Share it with your love! 💕');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div
          className={`absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 blur-3xl pointer-events-none ${
            isUnlocked ? 'bg-rose-500' : 'bg-slate-600'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Hero Medallion */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative mb-4 group">
            {/* Medallion outer frame */}
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1.5 border-2 ${tier.border} ${tier.glow} ${
                isUnlocked ? tier.badgeBg : 'bg-slate-800/90 border-slate-700'
              } flex items-center justify-center relative shadow-2xl transition-transform transform group-hover:scale-105`}
            >
              <div className="w-full h-full rounded-2xl bg-black/30 backdrop-blur-xs flex flex-col items-center justify-center p-3 relative overflow-hidden">
                {/* Floating particle effect */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none animate-pulse" />
                )}

                <div className="text-4xl sm:text-5xl mb-1 filter drop-shadow-md">
                  {cat.icon}
                </div>

                <div className="text-[10px] font-black uppercase tracking-wider text-white/90">
                  #{badge.num} / 69
                </div>
              </div>

              {/* Status Badge Ring Seal */}
              <div
                className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 border-slate-900 shadow-md ${
                  isUnlocked ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
            </div>
          </div>

          {/* Tier & Category Pill */}
          <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
            <span
              className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${tier.border} ${tier.text} bg-white/5`}
            >
              {tier.label}
            </span>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10">
              {cat.name}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20">
              +{badge.points} XP
            </span>
          </div>

          {/* Titles */}
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
            {badge.title}
          </h2>
          {badge.hindiTitle && (
            <p className="text-xs sm:text-sm font-hindi font-bold text-rose-300/90 mt-0.5">
              {badge.hindiTitle}
            </p>
          )}
          <p className="text-xs font-medium text-slate-400 mt-1">{badge.subtitle}</p>

          {/* Description Box */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic">
              "{badge.description}"
            </p>

            <div className="pt-2 border-t border-white/10 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block font-medium">How to unlock:</span>
                <span className="text-white font-semibold">{badge.howToUnlock}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full mt-4 space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Unlock Progress</span>
              <span className={isUnlocked ? 'text-emerald-400' : 'text-amber-400'}>
                {badge.progress.formattedProgress} ({badge.progress.progressPercent}%)
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500'
                }`}
                style={{ width: `${badge.progress.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isUnlocked ? (
              <button
                type="button"
                onClick={handleCelebrate}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Trophy className="w-4 h-4" />
                <span>Celebrate & Confetti</span>
              </button>
            ) : (
              <div className="w-full py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-medium text-xs flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Locked Milestone</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyQuote}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Copy Achievement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
