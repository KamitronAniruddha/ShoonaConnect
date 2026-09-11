import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  evaluateAllSaathiAchievements,
  SAATHI_ACHIEVEMENTS,
  EvaluatedBadge,
  AchievementCategory,
  AchievementTier,
  ACHIEVEMENT_CATEGORIES,
  TIER_CONFIG,
  SaathiMetrics,
} from '../utils/achievements';
import { useSaathiAchievementsData } from '../utils/useSaathiAchievementsData';
import { BadgeDetailModal } from './BadgeDetailModal';
import {
  Award,
  Trophy,
  Sparkles,
  Search,
  Filter,
  Lock,
  Unlock,
  Heart,
  Calendar,
  Zap,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Flame,
  Star,
  RefreshCw,
  Clock,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AchievementsView: React.FC = () => {
  const { couple, userProfile, partnerProfile } = useAuth();
  const { metrics: liveMetrics, loading } = useSaathiAchievementsData();

  // Selected filters & search
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'unlocked' | 'in_progress' | 'locked'>('all');
  const [activeTier, setActiveTier] = useState<AchievementTier | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<EvaluatedBadge | null>(null);

  // Simulation mode for couple to preview / test milestones
  const [simulatedDays, setSimulatedDays] = useState<number | null>(null);

  // Merge live metrics with simulation if active
  const effectiveMetrics: SaathiMetrics = useMemo(() => {
    if (simulatedDays === null) {
      return liveMetrics;
    }
    const simYears = Math.floor(simulatedDays / 365);
    return {
      ...liveMetrics,
      daysTogether: simulatedDays,
      yearsTogether: simYears,
      anniversariesCelebrated: Math.max(simYears, 1),
      // Scale other metrics smoothly if simulated
      loveLettersCount: Math.max(liveMetrics.loveLettersCount, simulatedDays >= 30 ? 5 : 1),
      memoriesCount: Math.max(liveMetrics.memoriesCount, simulatedDays >= 100 ? 15 : 2),
      photosCount: Math.max(liveMetrics.photosCount, simulatedDays >= 50 ? 25 : 5),
      datesCount: Math.max(liveMetrics.datesCount, 3),
      dailyAnswersCount: Math.max(liveMetrics.dailyAnswersCount, simulatedDays >= 100 ? 15 : 3),
      moodCount: Math.max(liveMetrics.moodCount, simulatedDays >= 50 ? 14 : 2),
      bucketCount: Math.max(liveMetrics.bucketCount, 4),
      completedBucketCount: Math.max(liveMetrics.completedBucketCount, simulatedDays >= 100 ? 3 : 1),
      gamesPlayedCount: Math.max(liveMetrics.gamesPlayedCount, 5),
      gamesWonCount: Math.max(liveMetrics.gamesWonCount, 3),
      bothBirthdaysSet: true,
      zodiacChecked: true,
      hasPinLock: true,
      customThemeSet: true,
      notesCount: Math.max(liveMetrics.notesCount, 3),
    };
  }, [liveMetrics, simulatedDays]);

  // Evaluate all 69 badges
  const evaluation = useMemo(() => {
    return evaluateAllSaathiAchievements(effectiveMetrics, SAATHI_ACHIEVEMENTS);
  }, [effectiveMetrics]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return evaluation.badges.filter((badge) => {
      // Category filter
      if (activeCategory !== 'all' && badge.category !== activeCategory) {
        return false;
      }
      // Tier filter
      if (activeTier !== 'all' && badge.tier !== activeTier) {
        return false;
      }
      // Status filter
      if (activeStatus === 'unlocked' && !badge.progress.isUnlocked) {
        return false;
      }
      if (activeStatus === 'locked' && badge.progress.isUnlocked) {
        return false;
      }
      if (activeStatus === 'in_progress' && (badge.progress.isUnlocked || badge.progress.progressPercent === 0)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = badge.title.toLowerCase().includes(q);
        const matchHindi = badge.hindiTitle?.toLowerCase().includes(q);
        const matchSub = badge.subtitle.toLowerCase().includes(q);
        const matchDesc = badge.description.toLowerCase().includes(q);
        if (!matchTitle && !matchHindi && !matchSub && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [evaluation.badges, activeCategory, activeTier, activeStatus, searchQuery]);

  // Trigger celebration
  const handleGrandCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#eab308', '#06b6d4', '#8b5cf6'],
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-fade-in font-sans">
      {/* Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
        onCelebrate={handleGrandCelebration}
      />

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#1e1022] to-[#2c0d24] border border-rose-500/30 p-6 sm:p-8 shadow-2xl text-white">
        {/* Glowing cosmic gradient orbs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Saathi Badges System • 69 Total Milestones</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
              <span>Saathi Achievements</span>
              <span className="text-xl sm:text-2xl font-hindi font-semibold text-rose-400">
                (साथी उपलब्धियां 💕)
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Every shared sunrise, love letter, and milestone permanently awarded. Calculate your couple devotion across 69 unique achievements.
            </p>

            {/* Couple Rank & Tier */}
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start pt-1">
              <span className="text-xs text-slate-400">Love Rank:</span>
              <span className={`text-xs sm:text-sm ${evaluation.rankTitle.tierColor}`}>
                {evaluation.rankTitle.hindi}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {evaluation.earnedPoints.toLocaleString()} / {evaluation.totalPoints.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Unlocked Counter Pill & Progress Ring */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[200px] text-center shadow-lg">
            <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
              Badges Unlocked
            </span>
            <div className="text-4xl font-black font-display text-white mt-1">
              <span className="text-rose-400">{evaluation.unlockedCount}</span>
              <span className="text-slate-400 text-2xl font-normal"> / {evaluation.totalBadges}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-3">
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${evaluation.completionPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-300 block mt-1">
                {evaluation.completionPercent}% Completed
              </span>
            </div>

            <button
              onClick={handleGrandCelebration}
              className="mt-3 px-3 py-1 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 text-rose-200 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Celebrate Badges
            </button>
          </div>
        </div>

        {/* Milestone Time Travel / Simulator Toolbar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">Milestone Simulator & Preview:</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Preview future unlocked milestones or test calculation)
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              onClick={() => setSimulatedDays(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatedDays === null
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Live Data ({effectiveMetrics.daysTogether}d)
            </button>
            <button
              onClick={() => setSimulatedDays(100)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatedDays === 100
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              100 Days
            </button>
            <button
              onClick={() => setSimulatedDays(365)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatedDays === 365
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              1 Year (365d)
            </button>
            <button
              onClick={() => setSimulatedDays(730)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatedDays === 730
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              2 Years
            </button>
            <button
              onClick={() => setSimulatedDays(1825)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                simulatedDays === 1825
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              5 Years (1825d)
            </button>
          </div>
        </div>
      </div>

      {/* Next Achievable Badge Spotlight Card */}
      {evaluation.nextBadgeToUnlock && (
        <div
          onClick={() => setSelectedBadge(evaluation.nextBadgeToUnlock)}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-400 dark:hover:border-rose-700 transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-2xl flex items-center justify-center flex-shrink-0">
              {ACHIEVEMENT_CATEGORIES[evaluation.nextBadgeToUnlock.category].icon}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Next Milestone In Sight
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  #{evaluation.nextBadgeToUnlock.num} of 69
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mt-0.5">
                {evaluation.nextBadgeToUnlock.title} ({evaluation.nextBadgeToUnlock.hindiTitle})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {evaluation.nextBadgeToUnlock.howToUnlock}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-right flex-1 sm:flex-none">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                {evaluation.nextBadgeToUnlock.progress.formattedProgress}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {evaluation.nextBadgeToUnlock.progress.progressPercent}% achieved
              </span>
            </div>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-xs">
        {/* Search Bar & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 69 Saathi badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              All (69)
            </button>
            <button
              onClick={() => setActiveStatus('unlocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeStatus === 'unlocked'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <Unlock className="w-3 h-3" />
              <span>Unlocked ({evaluation.unlockedCount})</span>
            </button>
            <button
              onClick={() => setActiveStatus('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeStatus === 'in_progress'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveStatus('locked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeStatus === 'locked'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Locked ({evaluation.lockedCount})</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[10px] opacity-80">(69)</span>
          </button>

          {(Object.entries(ACHIEVEMENT_CATEGORIES) as [AchievementCategory, typeof ACHIEVEMENT_CATEGORIES.time][]).map(
            ([catKey, catVal]) => {
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{catVal.icon}</span>
                  <span>{catVal.name}</span>
                  <span className="text-[10px] opacity-80">({catVal.count})</span>
                </button>
              );
            }
          )}
        </div>

        {/* Tier Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tier:
          </span>
          <button
            onClick={() => setActiveTier('all')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
              activeTier === 'all'
                ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            All Tiers
          </button>
          {(Object.keys(TIER_CONFIG) as AchievementTier[]).map((tierKey) => {
            const isTActive = activeTier === tierKey;
            const t = TIER_CONFIG[tierKey];
            return (
              <button
                key={tierKey}
                onClick={() => setActiveTier(tierKey)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer capitalize ${
                  isTActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : `${t.text} hover:bg-slate-100 dark:hover:bg-slate-800`
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Grid Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Showing {filteredBadges.length} of 69 Badges
        </span>
        {activeCategory !== 'all' && (
          <span className="text-xs text-rose-500 dark:text-rose-400 font-semibold">
            {ACHIEVEMENT_CATEGORIES[activeCategory].desc}
          </span>
        )}
      </div>

      {/* 69 Badges Card Grid */}
      {filteredBadges.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Saathi badges match this filter
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try selecting "All Categories" or clearing your search term to view all 69 milestones.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveStatus('all');
              setActiveTier('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.progress.isUnlocked;
            const tier = TIER_CONFIG[badge.tier];
            const cat = ACHIEVEMENT_CATEGORIES[badge.category];

            return (
              <div
                key={badge.id}
                id={`badge-${badge.id}`}
                onClick={() => setSelectedBadge(badge)}
                className={`relative group rounded-2xl p-3.5 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden text-left ${
                  isUnlocked
                    ? `bg-white dark:bg-slate-900 ${tier.border} ${tier.glow} hover:scale-102 hover:shadow-xl`
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-101 opacity-90'
                }`}
              >
                {/* Top Badge Medallion & Seal */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        isUnlocked
                          ? `${tier.badgeBg} text-white`
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      #{badge.num}
                    </span>

                    <span
                      className={`text-[9px] font-extrabold flex items-center gap-0.5 ${
                        isUnlocked ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {isUnlocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                      <span>{badge.points} XP</span>
                    </span>
                  </div>

                  {/* Visual Medal Icon */}
                  <div className="flex justify-center my-2">
                    <div
                      className={`w-14 h-14 rounded-2xl p-1 border-2 transition-transform transform group-hover:scale-105 flex items-center justify-center relative ${
                        isUnlocked
                          ? `${tier.border} ${tier.badgeBg} ${tier.glow}`
                          : 'border-slate-300 dark:border-slate-700 bg-slate-200/80 dark:bg-slate-800'
                      }`}
                    >
                      <div className="w-full h-full rounded-xl bg-black/25 flex items-center justify-center text-2xl filter drop-shadow-xs">
                        {cat.icon}
                      </div>

                      {/* Unlocked checkmark pill */}
                      {isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Hindi Subtitle */}
                  <div className="text-center mt-1">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-rose-500 transition-colors">
                      {badge.title}
                    </h4>
                    {badge.hindiTitle && (
                      <p className="text-[10px] font-hindi text-rose-500/80 dark:text-rose-400/80 line-clamp-1 font-semibold">
                        {badge.hindiTitle}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Progress Bar */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                    <span className="text-slate-400 truncate max-w-[60%]">
                      {badge.progress.formattedProgress}
                    </span>
                    <span className={isUnlocked ? 'text-emerald-500' : 'text-amber-500'}>
                      {badge.progress.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-amber-400 to-rose-400'
                      }`}
                      style={{ width: `${badge.progress.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
