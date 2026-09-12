import React, { useState } from 'react';
import { PeriodSettings } from '../../types/period';
import { Shield, Save } from 'lucide-react';

interface Props {
  settings: PeriodSettings;
  onSave: (settings: PeriodSettings) => void;
}

export const PeriodSettingsView: React.FC<Props> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<PeriodSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localSettings);
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-6">Tracking Preferences</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Typical Cycle Length (days)</label>
              <input 
                type="number"
                min="15"
                max="60"
                value={localSettings.typicalCycleLength}
                onChange={e => setLocalSettings({...localSettings, typicalCycleLength: parseInt(e.target.value) || 28})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-xs text-slate-500 mt-2">Used as a fallback when insufficient data exists.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Typical Period Length (days)</label>
              <input 
                type="number"
                min="1"
                max="14"
                value={localSettings.typicalPeriodLength}
                onChange={e => setLocalSettings({...localSettings, typicalPeriodLength: parseInt(e.target.value) || 5})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Partner Sharing</h3>
            <p className="text-sm text-slate-400">Control what your partner can see.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { id: 'none', label: 'Share Nothing', desc: 'Your partner cannot see any period information.' },
            { id: 'status', label: 'Share Phase Only', desc: 'Shows "Menstrual", "Follicular", etc. No dates or symptoms.' },
            { id: 'predicted_window', label: 'Share Phase & Dates', desc: 'Shows current phase and predicted next period.' },
            { id: 'all', label: 'Share Everything', desc: 'Shares full analytics, symptoms, and logs.' }
          ].map(opt => (
            <label key={opt.id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
              localSettings.shareWithPartner === opt.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="pt-0.5">
                <input 
                  type="radio" 
                  name="sharing" 
                  value={opt.id} 
                  checked={localSettings.shareWithPartner === opt.id}
                  onChange={() => setLocalSettings({...localSettings, shareWithPartner: opt.id as any})}
                  className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                />
              </div>
              <div>
                <div className={`font-bold ${localSettings.shareWithPartner === opt.id ? 'text-indigo-400' : 'text-white'}`}>{opt.label}</div>
                <div className="text-sm text-slate-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-8 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4"/> Save Settings</>}
        </button>
      </div>

    </div>
  );
};
