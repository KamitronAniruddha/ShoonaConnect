import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSaathiAchievementsData } from '../utils/useSaathiAchievementsData';
import { evaluateAllSaathiAchievements, ACHIEVEMENT_CATEGORIES } from '../utils/achievements';
import { Trophy, Award, Sparkles, ChevronRight, Lock, Unlock } from 'lucide-react';

interface SanctuaryAchievementsCardProps {
  onOpenAchievements: () => void;
}

export const SanctuaryAchievementsCard: React.FC<SanctuaryAchievementsCardProps> = ({
  onOpenAchievements,
}) => {
  const { metrics } = useSaathiAchievementsData();
  const evaluation = evaluateAllSaathiAchievements(metrics);

  const nextBadge = evaluation.nextBadgeToUnlock;

  return (
    <div
      onClick={onOpenAchievements}
      id="sanctuary-saathi-achievements-banner"
      className="p-5 rounded-3xl bg-gradient-to-r from-[#18091a] via-[#2a0e23] to-[#140613] border border-rose-500/40 shadow-xl hover:border-rose-500/70 transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-4 text-white relative overflow-hidden"
    >
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
          <div className="w-full h-full bg-[#140613] rounded-[14px] flex items-center justify-center text-2xl">
            🏆
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Saathi Achievements • 69 Badges</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-fraunces text-white flex items-center justify-center sm:justify-start gap-2">
            <span>{evaluation.unlockedCount} of 69 Badges Unlocked</span>
            <span className="text-xs font-semibold text-rose-300">
              ({evaluation.completionPercent}%)
            </span>
          </h3>

          <p className="text-xs text-slate-300 max-w-md">
            {nextBadge ? (
              <span>
                Next: <strong className="text-white font-bold">{nextBadge.title}</strong> • {nextBadge.progress.formattedProgress}
              </span>
            ) : (
              <span>Celebrate your sacred relationship milestones and earned XP!</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Love XP
          </span>
          <span className="text-sm font-extrabold text-amber-300">
            {evaluation.earnedPoints.toLocaleString()} XP
          </span>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 group-hover:from-rose-600 group-hover:to-pink-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>View 69 Badges</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
