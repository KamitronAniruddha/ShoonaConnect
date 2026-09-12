import React from 'react';
import { CycleData, PeriodLog } from '../../types/period';
import { format, parseISO } from 'date-fns';
import { Edit2, Trash2, Droplet, Activity, Clock, Lock } from 'lucide-react';

interface Props {
  cycles: CycleData[];
  logs: PeriodLog[];
  onEditPeriod: (log: PeriodLog) => void;
  onDeletePeriod: (id: string) => void;
  isTrackerOwner?: boolean;
  sharingMode?: 'none' | 'status' | 'predicted_window' | 'all' | 'symptoms';
}

export const PeriodHistory: React.FC<Props> = ({ 
  cycles, 
  logs, 
  onEditPeriod, 
  onDeletePeriod,
  isTrackerOwner = true,
  sharingMode = 'all'
}) => {
  if (logs.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
        <p className="text-slate-400">Your logged periods will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      {cycles.map((cycle) => {
        const logId = cycle.id.replace('cycle_', '');
        const originalLog = logs.find(l => l.id === logId);
        if (!originalLog) return null;

        return (
          <div key={cycle.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 group transition-all hover:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-slate-400">#{cycle.cycleNumber}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {format(parseISO(cycle.startDate), 'MMMM d, yyyy')}
                    {cycle.endDate && ` - ${format(parseISO(cycle.endDate), 'MMM d, yyyy')}`}
                    {cycle.isCurrent && ' (Current)'}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Cycle: {cycle.cycleLength ? `${cycle.cycleLength} days` : 'Ongoing'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Droplet className="w-4 h-4 text-rose-500" />
                      <span>Period: {cycle.periodLength ? `${cycle.periodLength} days` : 'Ongoing'}</span>
                    </div>
                    {(isTrackerOwner || sharingMode === 'all' || sharingMode === 'symptoms') && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span>Logs: {cycle.dailyLogs.length} days recorded</span>
                      </div>
                    )}
                  </div>

                  {(isTrackerOwner || sharingMode === 'all' || sharingMode === 'symptoms') && originalLog.notes && (
                    <p className="mt-4 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                      {originalLog.notes}
                    </p>
                  )}
                </div>
              </div>

              {isTrackerOwner && (
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity self-end md:self-start">
                  <button 
                    onClick={() => onEditPeriod(originalLog)} 
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Delete this period log? This cannot be undone.')) {
                        onDeletePeriod(originalLog.id);
                      }
                    }} 
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
};
