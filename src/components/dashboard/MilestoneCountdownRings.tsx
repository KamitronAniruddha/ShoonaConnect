import React from 'react';
import { Calendar, Heart, Award, Sparkles, Clock } from 'lucide-react';

interface MilestoneCountdownRingsProps {
  relationshipStartDate?: string;
  partnerName?: string;
}

export const MilestoneCountdownRings: React.FC<MilestoneCountdownRingsProps> = ({
  relationshipStartDate = '2024-02-14',
  partnerName = 'Sweetheart',
}) => {
  const start = new Date(relationshipStartDate).getTime();
  const now = Date.now();
  const daysPassed = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

  // 1. Next monthly anniversary (days remaining in current 30-day month cycle)
  const monthCycleDay = daysPassed % 30;
  const daysToNextMonth = 30 - monthCycleDay;
  const monthProgress = Math.round((monthCycleDay / 30) * 100);

  // 2. Next annual anniversary (days remaining in 365-day year cycle)
  const yearCycleDay = daysPassed % 365;
  const daysToNextYear = 365 - yearCycleDay;
  const yearProgress = Math.round((yearCycleDay / 365) * 100);

  // 3. 1,000 Days milestone
  const daysTo1000 = Math.max(0, 1000 - daysPassed);
  const progress1000 = Math.min(100, Math.round((daysPassed / 1000) * 100));

  // 4. Next planned weekend date (days until Friday/Saturday)
  const dayOfWeek = new Date().getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
  const daysToWeekend = dayOfWeek <= 5 ? 5 - dayOfWeek : 6;
  const weekendProgress = Math.round(((7 - daysToWeekend) / 7) * 100);

  const rings = [
    {
      title: 'Monthly Anniversary',
      daysLeft: daysToNextMonth,
      progress: monthProgress,
      color: 'text-rose-500',
      strokeColor: '#f43f5e',
      icon: Heart,
    },
    {
      title: 'Annual Anniversary',
      daysLeft: daysToNextYear,
      progress: yearProgress,
      color: 'text-pink-500',
      strokeColor: '#ec4899',
      icon: Award,
    },
    {
      title: '1,000 Days in Love',
      daysLeft: daysTo1000,
      progress: progress1000,
      color: 'text-purple-500',
      strokeColor: '#a855f7',
      icon: Sparkles,
    },
    {
      title: 'Next Weekend Date',
      daysLeft: daysToWeekend,
      progress: weekendProgress,
      color: 'text-amber-500',
      strokeColor: '#f59e0b',
      icon: Calendar,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Milestone Horizon & Anniversary Rings</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-extrabold border border-rose-200 dark:border-rose-900/40">
                {daysPassed} Days Deep
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Precise animated circular horizons to upcoming love milestones
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rings.map((ring) => {
          const Icon = ring.icon;
          const radius = 28;
          const circ = 2 * Math.PI * radius;
          const offset = circ - (ring.progress / 100) * circ;

          return (
            <div
              key={ring.title}
              className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center justify-between group hover:border-rose-200 transition-all"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    className="text-slate-200 dark:text-slate-700 stroke-current"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    stroke={ring.strokeColor}
                    strokeWidth="5"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white font-display">
                    {ring.daysLeft}d
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase">left</span>
                </div>
              </div>

              <div className="mt-1.5 sm:mt-2 w-full">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white leading-tight flex items-center justify-center gap-1">
                  <Icon className={`w-3 h-3 shrink-0 ${ring.color}`} />
                  <span className="truncate">{ring.title}</span>
                </h4>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                  {ring.progress}% elapsed
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
