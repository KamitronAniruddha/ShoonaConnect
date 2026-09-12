import React, { useState } from 'react';
import { DailyHealthLog, FlowIntensity } from '../../types/period';
import { format, parseISO } from 'date-fns';
import { Activity, Smile, Thermometer } from 'lucide-react';

interface Props {
  date: string;
  onClose: () => void;
  onSave: (log: DailyHealthLog) => void;
  existingLog?: DailyHealthLog;
  isReadOnly?: boolean;
}

const COMMON_SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Backache', 'Tender Breasts', 'Nausea', 'Cravings'];
const MOODS = ['Happy', 'Sensitive', 'Sad', 'Anxious', 'Angry', 'Calm', 'Energetic'];

export const DailyLogModal: React.FC<Props> = ({ date, onClose, onSave, existingLog, isReadOnly }) => {
  const [flow, setFlow] = useState<FlowIntensity | undefined>(existingLog?.flow);
  const [symptoms, setSymptoms] = useState<Record<string, { severity: number }>>(existingLog?.symptoms || {});
  const [mood, setMood] = useState<string | undefined>(existingLog?.mood);

  const toggleSymptom = (symp: string) => {
    if (isReadOnly) return;
    const newSymps = { ...symptoms };
    if (newSymps[symp]) {
      delete newSymps[symp];
    } else {
      newSymps[symp] = { severity: 5 }; // default severity
    }
    setSymptoms(newSymps);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onClose();
      return;
    }
    onSave({
      date,
      flow,
      symptoms,
      mood,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4">
      <div className="bg-slate-900 border-t md:border border-slate-700 rounded-t-3xl md:rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative h-[85vh] md:h-auto overflow-y-auto animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 no-scrollbar">
        
        <div className="sticky top-0 bg-slate-900 pb-4 mb-4 border-b border-slate-800 z-10 flex justify-between items-center">
           <div>
              <h3 className="text-xl font-black text-white">{isReadOnly ? 'Daily Log (Read Only)' : 'Daily Log'}</h3>
              <p className="text-sm text-slate-400">{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</p>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-8 pb-20 md:pb-0">
          
          {/* Flow */}
          <section>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
              <DropletIcon /> Flow Intensity
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['none', 'spotting', 'light', 'medium', 'heavy'] as FlowIntensity[]).map(f => (
                <button
                  key={f}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setFlow(flow === f ? undefined : f)}
                  className={`py-3 text-xs font-bold rounded-xl capitalize transition-colors ${
                    flow === f 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  {f === 'none' ? 'None' : f}
                </button>
              ))}
            </div>
          </section>

          {/* Symptoms */}
          <section>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
              <Activity className="w-4 h-4 text-indigo-400" /> Symptoms
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_SYMPTOMS.map(s => (
                <button
                  key={s}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => toggleSymptom(s)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    symptoms[s] 
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            
            {Object.keys(symptoms).length > 0 && (
              <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</p>
                {Object.entries(symptoms).map(([sName, sData]) => (
                   <div key={sName} className="flex items-center gap-4">
                     <span className="text-sm text-slate-300 w-24 truncate">{sName}</span>
                     <input 
                       type="range" 
                       min="1" max="10" 
                       value={sData.severity}
                       disabled={isReadOnly}
                       onChange={(e) => setSymptoms({...symptoms, [sName]: { severity: parseInt(e.target.value) }})}
                       className={`flex-1 accent-indigo-500 ${isReadOnly ? 'opacity-50' : ''}`}
                     />
                     <span className="text-xs text-indigo-400 font-bold w-4">{sData.severity}</span>
                   </div>
                ))}
              </div>
            )}
          </section>

          {/* Mood */}
          <section>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-3">
              <Smile className="w-4 h-4 text-amber-400" /> Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setMood(mood === m ? undefined : m)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                    mood === m 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                      : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  } ${isReadOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </section>

          <div className="fixed md:static bottom-0 left-0 right-0 p-4 md:p-0 bg-slate-900 md:bg-transparent border-t border-slate-800 md:border-t-0 mt-8 flex items-center gap-3">
            {isReadOnly ? (
              <button type="button" onClick={onClose} className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer shadow-lg">
                Close
              </button>
            ) : (
              <>
                <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-500/20">
                  Save Daily Log
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const DropletIcon = () => (
  <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);
