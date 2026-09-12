import React, { useState } from 'react';
import { PeriodLog } from '../../types/period';
import { format, parseISO } from 'date-fns';

interface Props {
  onClose: () => void;
  onSave: (log: PeriodLog) => void;
  existingLog?: PeriodLog;
}

export const LogPeriodModal: React.FC<Props> = ({ onClose, onSave, existingLog }) => {
  const [startDate, setStartDate] = useState(existingLog?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(existingLog?.endDate || '');
  const [notes, setNotes] = useState(existingLog?.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: existingLog?.id || crypto.randomUUID(),
      startDate,
      endDate: endDate || undefined,
      notes,
      createdAt: existingLog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black text-white mb-6">
          {existingLog ? 'Edit Period' : 'Log Period'}
        </h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
              <input 
                type="date" 
                required 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date (Optional)</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cycle Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Unusually stressful month, started new medication..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors cursor-pointer shadow-lg shadow-rose-500/20">
              Save Period
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
