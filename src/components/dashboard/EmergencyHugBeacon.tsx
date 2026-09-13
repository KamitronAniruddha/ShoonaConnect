import React, { useState } from 'react';
import { AlertCircle, Heart, LifeBuoy, Send, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EmergencyHugBeaconProps {
  partnerName?: string;
  myName?: string;
  onSendAlert?: (msg: string) => void;
}

export const EmergencyHugBeacon: React.FC<EmergencyHugBeaconProps> = ({
  partnerName = 'Sweetheart',
  myName = 'Me',
  onSendAlert,
}) => {
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [reason, setReason] = useState('Feeling overwhelmed & need to feel held');

  const handleActivateBeacon = () => {
    setIsBeaconActive(true);

    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150, 100, 250]);
    }

    const text = `🚨 EMERGENCY HUG BEACON ACTIVATED by ${myName}!\n"I'm feeling down/overwhelmed right now: ${reason}."\nPlease shower me with love and hugs as soon as you see this! 🥺🫂❤️`;
    if (onSendAlert) {
      onSendAlert(text);
    }

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#f97316'],
    });
  };

  const handleDeactivate = () => {
    setIsBeaconActive(false);
  };

  return (
    <div className={`w-full rounded-3xl p-4 sm:p-5 border transition-all duration-500 relative overflow-hidden ${
      isBeaconActive
        ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white border-rose-400 shadow-xl shadow-rose-200 dark:shadow-none animate-pulse'
        : 'bg-white dark:bg-slate-900 border-rose-100 dark:border-slate-800 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left min-w-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold shadow-xs ${
            isBeaconActive ? 'bg-white text-rose-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
          }`}>
            <LifeBuoy className={`w-5 h-5 ${isBeaconActive ? 'animate-spin' : ''}`} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className={`text-sm font-bold truncate ${isBeaconActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                Emergency "Need A Hug" SOS Beacon
              </h3>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isBeaconActive ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300'
              }`}>
                {isBeaconActive ? 'Beacon Pulsing' : 'Priority Comfort'}
              </span>
            </div>
            <p className={`text-xs truncate ${isBeaconActive ? 'text-rose-100' : 'text-slate-400 dark:text-slate-500'}`}>
              {isBeaconActive
                ? `Alert dispatched to ${partnerName}'s screen! Warm comfort incoming.`
                : 'Having a rough day? Press once to summon immediate emergency love.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {isBeaconActive ? (
            <button
              type="button"
              onClick={handleDeactivate}
              className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-white text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors shadow-md cursor-pointer"
            >
              Cancel SOS
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActivateBeacon}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Trigger Hug Beacon 🚨</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
