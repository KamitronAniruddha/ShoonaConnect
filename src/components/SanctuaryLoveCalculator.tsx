import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Clock,
  Calendar,
  Sparkles,
  Flame,
  TrendingUp,
  Award,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Palette,
  Sun,
  Activity,
  Timer,
} from 'lucide-react';
import { calculatePreciseLoveTime, PreciseLoveTime, THEMES } from '../utils/coupleData';
import confetti from 'canvas-confetti';

interface SanctuaryLoveCalculatorProps {
  anniversaryDate?: string;
  anniversaryTime?: string;
  themeKey?: string;
  onOpenDatingTimeModal: () => void;
  onOpenThemeModal: () => void;
}

export const SanctuaryLoveCalculator: React.FC<SanctuaryLoveCalculatorProps> = ({
  anniversaryDate,
  anniversaryTime,
  themeKey = 'rose',
  onOpenDatingTimeModal,
  onOpenThemeModal,
}) => {
  const [preciseTime, setPreciseTime] = useState<PreciseLoveTime>(() =>
    calculatePreciseLoveTime(anniversaryDate, anniversaryTime)
  );
  const [activeTab, setActiveTab] = useState<'chronometer' | 'totals' | 'milestones'>('chronometer');
  const [copied, setCopied] = useState(false);

  const currentTheme = THEMES[themeKey as keyof typeof THEMES] || THEMES.rose;

  // Live tick every second
  useEffect(() => {
    const update = () => {
      setPreciseTime(calculatePreciseLoveTime(anniversaryDate, anniversaryTime));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate, anniversaryTime]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff2d78', '#f43f5e', '#ec4899', '#f59e0b', '#8b5cf6'],
    });
  };

  const handleCopyStats = () => {
    const shareText = `💕 Our Love Story in Numbers:
• ${preciseTime.totalDays} Days in Love (${preciseTime.totalWeeks} Weeks, ${preciseTime.remainingDaysInWeek} Days)
• ${preciseTime.totalHours.toLocaleString()} Hours
• ${preciseTime.totalMinutes.toLocaleString()} Minutes
• ${preciseTime.totalSeconds.toLocaleString()} Seconds
• ~${Math.round(preciseTime.heartbeats / 1000000 * 10) / 10} Million Shared Heartbeats ❤️
Started on ${preciseTime.formattedStartDate} at ${preciseTime.formattedStartTime}`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 border ${currentTheme.cardBorder || 'border-rose-200'} shadow-xl bg-gradient-to-br from-white/95 via-rose-50/40 to-pink-50/60 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-800/80 backdrop-blur-md transition-all`}>
      {/* Subtle background ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTheme.accent }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.accent }}
      />

      {/* Top Controls Row */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
                Sanctuary Days & Love Calculator 💕
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-wider">
                Live Seconds ⏱️
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Together since {preciseTime.formattedStartDate} at {preciseTime.formattedStartTime}
            </p>
          </div>
        </div>

        {/* Quick Actions (Set Date/Time & Themes) */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={onOpenDatingTimeModal}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102"
            title="Set exact dating date and start time"
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>Set Dating Time</span>
          </button>

          <button
            type="button"
            onClick={onOpenThemeModal}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-102"
            title="Switch Sanctuary theme"
          >
            <Palette className="w-3.5 h-3.5 text-purple-500" />
            <span>Theme: {currentTheme.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Main High-Visibility Chronometer Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Days Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-rose-100 dark:border-slate-700/80 shadow-md text-center group hover:border-rose-400 transition-all">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-400 block mb-1">
            Days in Love
          </span>
          <div className="text-3xl sm:text-5xl font-black font-romantic tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
            {preciseTime.totalDays}
          </div>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
            {preciseTime.years > 0 ? `${preciseTime.years}y ` : ''}{preciseTime.months}m {preciseTime.days}d
          </span>
        </div>

        {/* Hours Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-pink-100 dark:border-slate-700/80 shadow-md text-center group hover:border-pink-400 transition-all">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-400 block mb-1">
            Hours
          </span>
          <div className="text-3xl sm:text-5xl font-black font-romantic tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
            {String(preciseTime.hours).padStart(2, '0')}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {preciseTime.totalHours.toLocaleString()} total hrs
          </span>
        </div>

        {/* Minutes Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-purple-100 dark:border-slate-700/80 shadow-md text-center group hover:border-purple-400 transition-all">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-400 block mb-1">
            Minutes
          </span>
          <div className="text-3xl sm:text-5xl font-black font-romantic tracking-tight text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
            {String(preciseTime.minutes).padStart(2, '0')}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {preciseTime.totalMinutes.toLocaleString()} total mins
          </span>
        </div>

        {/* Seconds Box (Live Ticking Highlight) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 text-center group hover:scale-[1.02] transition-all relative overflow-hidden">
          <div className="absolute top-1 right-2 opacity-15">
            <Flame className="w-12 h-12 fill-white" />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-rose-100 block mb-1 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Seconds
          </span>
          <div className="text-3xl sm:text-5xl font-black font-romantic tracking-tight text-white drop-shadow-sm">
            {String(preciseTime.seconds).padStart(2, '0')}
          </div>
          <span className="text-[11px] font-medium text-rose-100 mt-1 block">
            Ticking live 💕
          </span>
        </div>
      </div>

      {/* Tab Switcher for In-Depth Visibility */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('chronometer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chronometer'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700'
            }`}
          >
            📊 Overall Weeks & Totals
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-700'
            }`}
          >
            🏆 Next Milestones
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyStats}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:border-rose-400 transition-all cursor-pointer"
            title="Copy couple stats summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Numbers'}</span>
          </button>

          <button
            type="button"
            onClick={handleCelebrate}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:brightness-110 transition-all cursor-pointer"
            title="Shower love confetti"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Celebrate</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overall Weeks, Seconds & Deep Metrics */}
      {activeTab === 'chronometer' && (
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-fadeIn">
          {/* Overall Weeks */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Weeks</span>
            <div className="text-xl sm:text-2xl font-black font-romantic text-rose-600 dark:text-rose-400 mt-0.5">
              {preciseTime.totalWeeks}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">+ {preciseTime.remainingDaysInWeek} days</span>
          </div>

          {/* Total Seconds */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Seconds</span>
            <div className="text-sm sm:text-base font-mono font-black text-slate-800 dark:text-slate-100 mt-1 truncate">
              {preciseTime.totalSeconds.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">ticking live</span>
          </div>

          {/* Total Minutes */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Minutes</span>
            <div className="text-sm sm:text-base font-mono font-black text-slate-800 dark:text-slate-100 mt-1 truncate">
              {preciseTime.totalMinutes.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">shared</span>
          </div>

          {/* Total Months */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Months</span>
            <div className="text-xl sm:text-2xl font-black font-romantic text-purple-600 dark:text-purple-400 mt-0.5">
              {preciseTime.totalMonths}
            </div>
            <span className="text-[10px] text-slate-500">months together</span>
          </div>

          {/* Approximate Heartbeats */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center gap-1">
              <Activity className="w-3 h-3 text-rose-500" /> Heartbeats
            </span>
            <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 mt-1">
              {(preciseTime.heartbeats / 1000000).toFixed(1)}M
            </div>
            <span className="text-[10px] text-slate-500">beats for each other</span>
          </div>

          {/* Sunrises Shared */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center justify-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> Sunrises
            </span>
            <div className="text-xl sm:text-2xl font-black font-romantic text-amber-600 dark:text-amber-400 mt-0.5">
              {preciseTime.sunrises}
            </div>
            <span className="text-[10px] text-slate-500">mornings under one sky</span>
          </div>
        </div>
      )}

      {/* Tab 2: Next Milestone Progress Bar */}
      {activeTab === 'milestones' && (
        <div className="relative z-10 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-rose-100 dark:border-slate-700 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  Next Destination: {preciseTime.nextMilestone.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {preciseTime.nextMilestone.targetDays} total days in love
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs">
              {preciseTime.nextMilestone.daysLeft > 0
                ? `Only ${preciseTime.nextMilestone.daysLeft} days to go!`
                : 'Celebration time! 🎉'}
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
              <span>Progress towards milestone</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {preciseTime.nextMilestone.percent}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.max(4, preciseTime.nextMilestone.percent)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
