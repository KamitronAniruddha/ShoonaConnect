import React, { useState } from 'react';
import { CloudSun, Sun, CloudRain, Moon, Sparkles, Coffee, Heart, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MoodAura {
  id: string;
  name: string;
  weather: string;
  emoji: string;
  color: string;
  auraGradient: string;
  comfortTip: string;
}

const AURAS: MoodAura[] = [
  {
    id: 'blissful',
    name: 'Blissful Radiance',
    weather: 'Golden Sunshine & Warm Breeze ☀️',
    emoji: '✨',
    color: 'text-amber-500',
    auraGradient: 'from-amber-400/20 via-rose-400/20 to-pink-500/10',
    comfortTip: 'Celebrate this energy! Perfect time for spontaneous photos and plans.',
  },
  {
    id: 'cozy',
    name: 'Cozy & Cuddly',
    weather: 'Starry Twilight with Soft Mist 🌙',
    emoji: '🧸',
    color: 'text-indigo-500',
    auraGradient: 'from-indigo-400/20 via-purple-400/20 to-rose-400/10',
    comfortTip: 'Wants soft whispers, fuzzy blankets, and gentle back rubs.',
  },
  {
    id: 'tired',
    name: 'Low Battery / Tired',
    weather: 'Overcast & Needs Shelter 🌧️',
    emoji: '🔋',
    color: 'text-blue-500',
    auraGradient: 'from-blue-400/20 via-slate-400/20 to-indigo-400/10',
    comfortTip: 'No heavy decisions today. Just gentle presence, hot tea, and unconditional love.',
  },
  {
    id: 'craving-love',
    name: 'Craving Closeness',
    weather: 'Warm Tropical Rain Shower 🌺',
    emoji: '🥺',
    color: 'text-rose-500',
    auraGradient: 'from-rose-500/25 via-pink-400/20 to-red-400/15',
    comfortTip: 'Needs immediate affirmation: tell them 3 reasons you chose them.',
  },
];

interface CoupleMoodAuraWidgetProps {
  partnerName?: string;
  onSendComfort?: (action: string) => void;
}

export const CoupleMoodAuraWidget: React.FC<CoupleMoodAuraWidgetProps> = ({
  partnerName = 'Sweetheart',
  onSendComfort,
}) => {
  const [myAura, setMyAura] = useState<MoodAura>(() => {
    try {
      const saved = localStorage.getItem('shoona_my_aura');
      if (saved) {
        const found = AURAS.find((a) => a.id === saved);
        if (found) return found;
      }
      return AURAS[0];
    } catch {
      return AURAS[0];
    }
  });

  const [partnerAura] = useState<MoodAura>(AURAS[1]); // Default cozy twilight
  const [sentAction, setSentAction] = useState<string | null>(null);

  const handleSelectAura = (aura: MoodAura) => {
    setMyAura(aura);
    try {
      localStorage.setItem('shoona_my_aura', aura.id);
    } catch {
      // ignore
    }
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
    });
  };

  const handleComfortAction = (actionText: string) => {
    setSentAction(actionText);
    setTimeout(() => setSentAction(null), 3000);
    if (onSendComfort) {
      onSendComfort(actionText);
    }
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className={`w-full bg-gradient-to-br ${myAura.auraGradient} dark:from-slate-900 dark:to-slate-950 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-700`}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/80 dark:bg-slate-800 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-xs">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Live Couple Mood Aura & Weather Sync</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
                Emotional Forecast
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your partner's emotional climate and how to love them best right now
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Partner's Aura */}
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-white dark:border-slate-700/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {partnerName}'s Aura
            </span>
            <span className="text-xs font-bold text-indigo-500">{partnerAura.emoji} {partnerAura.name}</span>
          </div>

          <div className="text-xs font-semibold text-slate-800 dark:text-white">
            Forecast: {partnerAura.weather}
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            "{partnerAura.comfortTip}"
          </p>

          <div className="pt-2 flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleComfortAction('☕ Sent a warm cup of coffee & forehead kiss')}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Coffee className="w-3 h-3" /> Warm Beverage
            </button>
            <button
              type="button"
              onClick={() => handleComfortAction('🫂 Sent an infinite lingering squeeze hug')}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Heart className="w-3 h-3" /> Big Squeeze Hug
            </button>
          </div>
          {sentAction && (
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              ✓ {sentAction}
            </div>
          )}
        </div>

        {/* Set My Aura */}
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-white dark:border-slate-700/60 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Your Current Aura (You)
            </span>
            <span className="text-xs font-bold text-rose-500">{myAura.emoji} {myAura.name}</span>
          </div>

          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Tap to change how you want to be treated today:
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {AURAS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelectAura(a)}
                className={`p-2 rounded-xl text-left text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  myAura.id === a.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-rose-50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{a.emoji}</span>
                <span className="truncate">{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
