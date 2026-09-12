import React from 'react';
import { CycleData, BaselineStats, PredictionConfidence, PredictionRange, CyclePhase } from '../../types/period';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Info, AlertCircle, Droplet, Calendar, Activity, Plus, Lock } from 'lucide-react';

interface Props {
  cycles: CycleData[];
  baselineStats: BaselineStats;
  prediction: { range: PredictionRange | null, confidence: PredictionConfidence };
  currentPhase: { phase: CyclePhase, daysLeft: number, description: string } | null;
  onOpenLog: () => void;
  onOpenDaily: (date: string) => void;
  isTrackerOwner?: boolean;
  sharingMode?: 'none' | 'status' | 'predicted_window' | 'all' | 'symptoms';
}

export const PeriodDashboard: React.FC<Props> = ({ 
  cycles, 
  baselineStats, 
  prediction, 
  currentPhase, 
  onOpenLog, 
  onOpenDaily,
  isTrackerOwner = true,
  sharingMode = 'all'
}) => {
  const currentCycle = cycles.find(c => c.isCurrent);
  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  const todayLog = currentCycle?.dailyLogs.find(l => l.date === todayDateStr);

  const canSeePredictions = isTrackerOwner || sharingMode === 'predicted_window' || sharingMode === 'all' || sharingMode === 'symptoms';
  const canSeeDetails = isTrackerOwner || sharingMode === 'all' || sharingMode === 'symptoms';


  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Disclaimer */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          This is an educational health intelligence tool. Predictions are based on your personal logged history and do not constitute medical advice or a guaranteed diagnostic.
        </p>
      </div>

      {!currentCycle ? (
         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
            <Droplet className="w-12 h-12 text-rose-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {isTrackerOwner ? 'Welcome to Health Intelligence' : 'No Data Shared Yet'}
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {isTrackerOwner 
                ? 'Start tracking your menstrual cycle to unlock personal insights, symptom trends, and phase predictions.'
                : 'Your partner hasn\'t logged any cycle data yet.'}
            </p>
            {isTrackerOwner && (
              <button onClick={onOpenLog} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-xl shadow-rose-500/20 cursor-pointer transition-all">
                Log First Period
              </button>
            )}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Status Hero */}
          <div className="md:col-span-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-500/20 transition-all duration-700" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
               <div>
                 {canSeePredictions && (
                   <p className="text-sm font-bold tracking-wider text-rose-500 uppercase mb-2">Cycle Day {differenceInDays(new Date(), parseISO(currentCycle.startDate)) + 1}</p>
                 )}
                 <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                   {currentPhase ? currentPhase.phase : 'Tracking'}
                 </h3>
                 <p className="text-slate-400 max-w-md text-sm leading-relaxed">
                   {currentPhase ? currentPhase.description : 'Keep logging to unlock biological phase insights.'}
                 </p>
               </div>
               
               {canSeePredictions && (
                 <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 min-w-[200px]">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Next Prediction</p>
                   {prediction.range ? (
                     <>
                       <div className="text-2xl font-bold text-white mb-1">
                          {format(parseISO(prediction.range.targetDate), 'MMM d')}
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full ${
                           prediction.confidence.score === 'High' ? 'bg-emerald-500' :
                           prediction.confidence.score === 'Moderate' ? 'bg-amber-500' : 'bg-rose-500'
                         }`} />
                         <span className="text-xs text-slate-300 font-medium">{prediction.confidence.score} Confidence</span>
                       </div>
                     </>
                   ) : (
                     <div className="text-sm text-slate-400 mt-2">More data needed</div>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Quick Log Today */}
          <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">{isTrackerOwner ? "Today's Log" : "Today's Status"}</h4>
              <p className="text-xs text-slate-400 mb-6">{format(new Date(), 'EEEE, MMMM d')}</p>
              
              {!canSeeDetails ? (
                <div className="flex flex-col items-center justify-center h-24 text-slate-500 text-center">
                  <Lock className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-xs">Symptoms and daily logs are private</span>
                </div>
              ) : todayLog ? (
                <div className="space-y-3">
                  {todayLog.flow && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Flow</span>
                      <span className="text-rose-400 capitalize font-medium">{todayLog.flow}</span>
                    </div>
                  )}
                  {Object.keys(todayLog.symptoms).length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Symptoms</span>
                      <span className="text-indigo-400 font-medium">{Object.keys(todayLog.symptoms).length} logged</span>
                    </div>
                  )}
                  {todayLog.mood && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Mood</span>
                      <span className="text-amber-400 font-medium capitalize">{todayLog.mood}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-slate-500">
                  <Activity className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Nothing logged today</span>
                </div>
              )}
            </div>
            
            {isTrackerOwner && (
              <button 
                onClick={() => onOpenDaily(todayDateStr)}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {todayLog ? <><Activity className="w-4 h-4"/> Update Log</> : <><Plus className="w-4 h-4"/> Log Symptoms</>}
              </button>
            )}
          </div>

          {/* Baseline Cards */}
          {canSeePredictions && (
            <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
               <StatCard label="Avg Cycle Length" value={baselineStats.averageCycleLength} unit="days" icon={Activity} />
               <StatCard label="Avg Period Length" value={baselineStats.averagePeriodLength} unit="days" icon={Droplet} />
               <StatCard label="Cycle Variation" value={`±${baselineStats.stdDevCycleLength}`} unit="days" icon={Calendar} />
               <StatCard label="Regularity Score" value={baselineStats.regularityScore} unit="/100" icon={Activity} />
            </div>
          )}

          {/* Intelligence Feed */}
          {canSeePredictions && (
            <div className="md:col-span-12 bg-slate-900 border border-slate-800 rounded-3xl p-6">
               <h4 className="text-lg font-bold text-white mb-4">Personal Insights</h4>
               <div className="space-y-3">
                  <InsightRow 
                    title="Cycle Consistency"
                    desc={baselineStats.stdDevCycleLength <= 2 ? "Your cycles are highly regular, making predictions very accurate." : baselineStats.stdDevCycleLength <= 5 ? "Your cycles have moderate variation. This is normal." : "Your cycles show high variability. Ovulation may occur at different times each month."}
                  />
                  {cycles.length < 3 && (
                    <InsightRow 
                      title="Learning Pattern"
                      desc="We are still learning your baseline. Analytics will become more personalized after 3 logged cycles."
                    />
                  )}
                  {prediction.confidence.score === 'Moderate' || prediction.confidence.score === 'Low' ? (
                    <InsightRow 
                      title="Prediction Context"
                      desc={prediction.confidence.reason}
                    />
                  ) : null}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, unit, icon: Icon }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col justify-between group">
    <div className="flex items-center justify-between mb-4">
       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
       <Icon className="w-4 h-4 text-slate-600 group-hover:text-rose-500 transition-colors" />
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl md:text-3xl font-black text-white">{value}</span>
      <span className="text-sm font-bold text-slate-500">{unit}</span>
    </div>
  </div>
);

const InsightRow = ({ title, desc }: any) => (
  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 hidden md:block" />
    <div>
      <h5 className="text-sm font-bold text-slate-200 mb-1">{title}</h5>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);
