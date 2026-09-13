import React, { useState, useEffect } from 'react';
import { Clock, Lock, Unlock, Plus, Sparkles, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TimeCapsuleData } from '../../types';

interface QuickTimeCapsuleWidgetProps {
  coupleId?: string;
  myUid?: string;
  partnerName?: string;
  onOpenCreateModal?: () => void;
}

export const QuickTimeCapsuleWidget: React.FC<QuickTimeCapsuleWidgetProps> = ({
  coupleId,
  myUid,
  partnerName = 'Sweetheart',
  onOpenCreateModal,
}) => {
  const [capsules, setCapsules] = useState<TimeCapsuleData[]>([
    {
      id: 'capsule-1',
      title: 'Our Next Anniversary Secret Letter',
      unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().split('T')[0],
      note: 'Sealed with all my heart for our anniversary dinner.',
      sealedBy: 'Me',
      category: 'anniversary',
      isUnlocked: false,
    },
    {
      id: 'capsule-2',
      title: 'Promise for Our First Future Home',
      unlockDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString().split('T')[0],
      note: 'The exact key we want and the promise we made under the stars.',
      sealedBy: partnerName,
      category: 'future',
      isUnlocked: false,
    },
  ]);

  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsuleData | null>(null);

  const calculateDaysLeft = (targetDateStr: string) => {
    const target = new Date(targetDateStr).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-indigo-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Couple Memory Time Capsules</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/40">
                Sealed Vault
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Letters, promises & photos locked until future anniversaries
            </p>
          </div>
        </div>

        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Seal New Capsule</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 pt-1">
        {capsules.map((capsule) => {
          const daysLeft = calculateDaysLeft(capsule.unlockDate);
          const isReady = daysLeft === 0;

          return (
            <div
              key={capsule.id}
              onClick={() => setSelectedCapsule(capsule)}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    {isReady ? (
                      <>
                        <Unlock className="w-3 h-3 text-emerald-500" />
                        <span>Ready to Unlock!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>{daysLeft} Days Left</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Unlocks {new Date(capsule.unlockDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {capsule.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2 mt-1">
                  {isReady ? capsule.note : '🔒 Contents encrypted and wax-sealed until the unlocking hour.'}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>Sealed by {capsule.sealedBy}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {isReady ? 'Break Seal ➔' : 'Time Locked ⏳'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail preview modal */}
      {selectedCapsule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-indigo-100 dark:border-slate-800 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {selectedCapsule.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCapsule(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                Wax Seal Security Status
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Target date: {new Date(selectedCapsule.unlockDate).toLocaleDateString()}.
                {calculateDaysLeft(selectedCapsule.unlockDate) > 0 ? (
                  <span className="block mt-1 text-slate-500">
                    This capsule cannot be opened early. Love requires patience! ❤️
                  </span>
                ) : (
                  <span className="block mt-1 text-emerald-600 font-bold">
                    The time has arrived! Open and reminisce together.
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCapsule(null)}
              className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
            >
              Close Capsule
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
