import React, { useState } from 'react';
import { CycleData, DailyHealthLog, PredictionRange, PredictionConfidence } from '../../types/period';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isWithinInterval, addDays, isAfter } from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Activity, Lock } from 'lucide-react';

interface Props {
  cycles: CycleData[];
  prediction: { range: PredictionRange | null, confidence: PredictionConfidence } | null;
  onDayClick: (date: string) => void;
  dailyLogs: DailyHealthLog[];
  isTrackerOwner?: boolean;
  sharingMode?: 'none' | 'status' | 'predicted_window' | 'all' | 'symptoms';
}

export const PeriodCalendar: React.FC<Props> = ({ 
  cycles, 
  prediction, 
  onDayClick, 
  dailyLogs,
  isTrackerOwner = true,
  sharingMode = 'all'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const canSeePredictions = isTrackerOwner || sharingMode === 'predicted_window' || sharingMode === 'all' || sharingMode === 'symptoms';
  const canSeeDetails = isTrackerOwner || sharingMode === 'all' || sharingMode === 'symptoms';


  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = addDays(monthStart, -monthStart.getDay());
  const endDate = addDays(monthEnd, 6 - monthEnd.getDay());

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayStatus = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    let isPeriod = false;
    let isPredicted = false;
    
    // Check actual periods
    for (const c of cycles) {
      if (!c.endDate && c.isCurrent) {
        // Ongoing
        if (differenceInDaysSafe(day, parseISO(c.startDate)) >= 0 && differenceInDaysSafe(day, parseISO(c.startDate)) < (c.periodLength || 5)) {
          isPeriod = true;
        }
      } else if (c.periodLength) {
        const pEnd = addDays(parseISO(c.startDate), c.periodLength - 1);
        if (isWithinIntervalSafe(day, parseISO(c.startDate), pEnd)) {
          isPeriod = true;
        }
      }
    }

    // Check prediction
    if (canSeePredictions && prediction?.range) {
      const minD = parseISO(prediction.range.minDate);
      const maxD = parseISO(prediction.range.maxDate);
      if (isWithinIntervalSafe(day, minD, maxD)) {
        isPredicted = true;
      }
    }

    const log = canSeeDetails ? dailyLogs.find(l => l.date === dayStr) : undefined;

    return { isPeriod, isPredicted, hasLog: !!log };
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-slate-500 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((day, i) => {
          const { isPeriod, isPredicted, hasLog } = getDayStatus(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={i}
              onClick={() => onDayClick(format(day, 'yyyy-MM-dd'))}
              className={`
                aspect-square rounded-xl md:rounded-2xl p-1 md:p-2 flex flex-col items-center justify-center relative cursor-pointer transition-all hover:scale-105 active:scale-95
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isPeriod ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
                  isPredicted ? 'bg-rose-500/5 border border-rose-500/20 border-dashed text-slate-300' : 
                  isToday ? 'bg-slate-800 border border-slate-600 text-white' : 'bg-slate-900 border border-transparent hover:border-slate-700 text-slate-300'}
              `}
            >
              <span className={`text-sm md:text-base font-medium z-10 ${isToday && !isPeriod ? 'font-black text-indigo-400' : ''}`}>{format(day, 'd')}</span>
              
              <div className="flex gap-1 mt-1 z-10">
                {isPeriod && <Droplet className="w-2 h-2 md:w-3 md:h-3 fill-rose-500 text-rose-500" />}
                {hasLog && !isPeriod && <Activity className="w-2 h-2 md:w-3 md:h-3 text-indigo-400" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/30"></div> Period</div>
        {canSeePredictions && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500/5 border border-rose-500/20 border-dashed"></div> Predicted</div>}
        {canSeeDetails && <div className="flex items-center gap-2"><Activity className="w-3 h-3 text-indigo-400" /> Logged Data</div>}
      </div>
    </div>
  );
};

function differenceInDaysSafe(dateLeft: Date, dateRight: Date) {
  const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isWithinIntervalSafe(date: Date, start: Date, end: Date) {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}
