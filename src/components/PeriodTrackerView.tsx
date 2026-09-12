import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPeriodLogs, getDailyHealthLogs, getPeriodSettings, savePeriodLogs, saveDailyHealthLogs, savePeriodSettings } from '../lib/periodApi';
import { buildCycles, calculateBaselineStats, calculatePrediction, getCurrentPhase } from '../lib/period/periodCalculations';
import { PeriodLog, DailyHealthLog, PeriodSettings, CycleData, BaselineStats } from '../types/period';
import { ArrowLeft, Droplet, Calendar, Activity, Clock, Settings, Plus, LayoutDashboard, ChevronRight, Lock } from 'lucide-react';
import { PeriodDashboard } from './period/PeriodDashboard';
import { PeriodAnalytics } from './period/PeriodAnalytics';
import { PeriodCalendar } from './period/PeriodCalendar';
import { PeriodHistory } from './period/PeriodHistory';
import { PeriodSettingsView } from './period/PeriodSettingsView';
import { LogPeriodModal } from './period/LogPeriodModal';
import { DailyLogModal } from './period/DailyLogModal';
import { format } from 'date-fns';

type PeriodTab = 'dashboard' | 'calendar' | 'analytics' | 'history' | 'settings';

interface PeriodTrackerViewProps {
  onBack?: () => void;
}

export const PeriodTrackerView: React.FC<PeriodTrackerViewProps> = ({ onBack }) => {
  const { userProfile, partnerProfile, couple } = useAuth();
  const coupleId = couple?.id;

  // Determine if current user is the owner of the tracker
  const isFemale = userProfile?.gender === 'female';
  const isPartnerFemale = partnerProfile?.gender === 'female';
  const isTrackerOwner = isFemale || (!isPartnerFemale && userProfile?.gender !== 'male');

  const [activeTab, setActiveTab] = useState<PeriodTab>('dashboard');
  
  // Data State
  const [logs, setLogs] = useState<PeriodLog[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyHealthLog[]>([]);
  const [settings, setSettings] = useState<PeriodSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLogPeriod, setShowLogPeriod] = useState(false);
  const [showDailyLog, setShowDailyLog] = useState(false);
  const [editingPeriodLog, setEditingPeriodLog] = useState<PeriodLog | undefined>();
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Load Data
  useEffect(() => {
    async function load() {
      if (coupleId) {
        const [pLogs, dLogs, pSettings] = await Promise.all([
          getPeriodLogs(coupleId),
          getDailyHealthLogs(coupleId),
          getPeriodSettings(coupleId)
        ]);
        setLogs(pLogs);
        setDailyLogs(dLogs);
        setSettings(pSettings);
      }
      setLoading(false);
    }
    load();
  }, [coupleId]);

  // Derived Calculations (Memoized for performance)
  const { cycles, baselineStats, prediction } = useMemo(() => {
    if (!settings) return { cycles: [], baselineStats: null, prediction: null };
    
    const calculatedCycles = buildCycles(logs, dailyLogs);
    const stats = calculateBaselineStats(calculatedCycles, settings.typicalCycleLength, settings.typicalPeriodLength);
    const pred = calculatePrediction(calculatedCycles, stats);
    
    return { cycles: calculatedCycles, baselineStats: stats, prediction: pred };
  }, [logs, dailyLogs, settings]);

  const currentPhase = useMemo(() => {
    if (!cycles || cycles.length === 0 || !baselineStats) return null;
    const current = cycles.find(c => c.isCurrent);
    if (!current) return null;
    return getCurrentPhase(current, baselineStats);
  }, [cycles, baselineStats]);

  // Save Handlers
  const handleSavePeriodLog = async (log: PeriodLog) => {
    if (!coupleId || !userProfile || !isTrackerOwner) return;
    const isEdit = logs.some(l => l.id === log.id);
    const newLogs = isEdit ? logs.map(l => l.id === log.id ? log : l) : [...logs, log];
    setLogs(newLogs);
    setShowLogPeriod(false);
    setEditingPeriodLog(undefined);
    await savePeriodLogs(coupleId, userProfile.uid, newLogs);
  };

  const handleDeletePeriodLog = async (id: string) => {
    if (!coupleId || !userProfile || !isTrackerOwner) return;
    const newLogs = logs.filter(l => l.id !== id);
    setLogs(newLogs);
    await savePeriodLogs(coupleId, userProfile.uid, newLogs);
  };

  const handleSaveDailyLog = async (log: DailyHealthLog) => {
    if (!coupleId || !userProfile || !isTrackerOwner) return;
    const isEdit = dailyLogs.some(l => l.date === log.date);
    const newLogs = isEdit ? dailyLogs.map(l => l.date === log.date ? log : l) : [...dailyLogs, log];
    setDailyLogs(newLogs);
    setShowDailyLog(false);
    await saveDailyHealthLogs(coupleId, userProfile.uid, newLogs);
  };

  const handleSaveSettings = async (newSettings: PeriodSettings) => {
    if (!coupleId || !userProfile || !isTrackerOwner) return;
    setSettings(newSettings);
    await savePeriodSettings(coupleId, userProfile.uid, newSettings);
  };

  if (loading || !settings) {
    return <div className="flex justify-center items-center h-64 text-rose-500"><Activity className="w-8 h-8 animate-spin" /></div>;
  }

  // Partner view when sharing is disabled
  if (!isTrackerOwner && settings.shareWithPartner === 'none') {
    return (
      <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-300 min-h-screen flex flex-col font-sans px-4 md:px-8 pt-8">
        <div className="flex items-center gap-3 mb-8">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-500" />
            Partner Health
          </h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
          <Lock className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Private Tracker</h3>
          <p className="text-slate-400 max-w-sm">
            Your partner has chosen to keep their menstrual health insights private.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-300 min-h-screen flex flex-col font-sans">
      
      {/* Header & Tabs */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 pt-4 pb-0 mb-6 px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Droplet className="w-5 h-5 text-rose-500" />
                {isTrackerOwner ? 'Health Intelligence' : 'Partner Health'}
              </h2>
            </div>
          </div>
          
          {isTrackerOwner && (
            <div className="flex items-center gap-2">
               <button 
                  onClick={() => { setEditingPeriodLog(undefined); setShowLogPeriod(true); }}
                  className="hidden md:flex px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-500/20 items-center gap-2 transition-all cursor-pointer"
               >
                  <Plus className="w-4 h-4" /> Log Period
               </button>
            </div>
          )}
        </div>

        {!isTrackerOwner && (
          <div className="mb-4 text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 inline-block px-3 py-1 rounded-full border border-indigo-500/20">
            Read-Only Partner View
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'history', label: 'History', icon: Clock },
            ...(isTrackerOwner ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PeriodTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-rose-500 text-rose-500' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-t-xl'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-4 md:px-8">
        {activeTab === 'dashboard' && (
          <PeriodDashboard 
            cycles={cycles} 
            baselineStats={baselineStats!} 
            prediction={prediction!} 
            currentPhase={currentPhase}
            onOpenLog={() => { setEditingPeriodLog(undefined); setShowLogPeriod(true); }}
            onOpenDaily={(date) => { setSelectedDailyDate(date); setShowDailyLog(true); }}
            isTrackerOwner={isTrackerOwner}
            sharingMode={settings.shareWithPartner}
          />
        )}
        {activeTab === 'analytics' && <PeriodAnalytics cycles={cycles} baselineStats={baselineStats!} />}
        {activeTab === 'calendar' && (
           <PeriodCalendar 
             cycles={cycles} 
             prediction={prediction} 
             onDayClick={(date) => { 
               if (isTrackerOwner || settings.shareWithPartner === 'all' || settings.shareWithPartner === 'symptoms') {
                 setSelectedDailyDate(date); 
                 setShowDailyLog(true); 
               }
             }}
             dailyLogs={dailyLogs}
             isTrackerOwner={isTrackerOwner}
             sharingMode={settings.shareWithPartner}
           />
        )}
        {activeTab === 'history' && (
           <PeriodHistory 
             cycles={cycles} 
             onEditPeriod={(log) => { setEditingPeriodLog(log); setShowLogPeriod(true); }}
             onDeletePeriod={handleDeletePeriodLog}
             logs={logs}
             isTrackerOwner={isTrackerOwner}
             sharingMode={settings.shareWithPartner}
           />
        )}
        {activeTab === 'settings' && isTrackerOwner && <PeriodSettingsView settings={settings} onSave={handleSaveSettings} />}
      </div>

      {/* Floating Action Button for Mobile */}
      {isTrackerOwner && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
           <button 
              onClick={() => { setEditingPeriodLog(undefined); setShowLogPeriod(true); }}
              className="w-14 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xl shadow-rose-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
           >
              <Plus className="w-6 h-6" />
           </button>
        </div>
      )}

      {/* Modals */}
      {showLogPeriod && isTrackerOwner && (
        <LogPeriodModal 
          onClose={() => setShowLogPeriod(false)} 
          onSave={handleSavePeriodLog} 
          existingLog={editingPeriodLog} 
        />
      )}
      
      {showDailyLog && (
        <DailyLogModal 
          date={selectedDailyDate}
          existingLog={dailyLogs.find(l => l.date === selectedDailyDate)}
          onClose={() => setShowDailyLog(false)}
          onSave={handleSaveDailyLog}
          isReadOnly={!isTrackerOwner}
        />
      )}
    </div>
  );
};
