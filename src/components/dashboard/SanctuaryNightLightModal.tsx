import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sparkles, X, Sun, Wind, Volume2, VolumeX, Heart } from 'lucide-react';

interface StarPoint {
  x: number;
  y: number;
  size: number;
  opacity: number;
  id: number;
}

interface SanctuaryNightLightModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
}

export const SanctuaryNightLightModal: React.FC<SanctuaryNightLightModalProps> = ({
  isOpen,
  onClose,
  partnerName = 'My Love',
}) => {
  const [theme, setTheme] = useState<'amber' | 'lavender' | 'aurora'>('amber');
  const [stars, setStars] = useState<StarPoint[]>([]);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Breathing cycle timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        if (prev === 'Exhale') return 'Rest';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStar: StarPoint = {
      x,
      y,
      size: Math.random() * 8 + 6,
      opacity: 1,
      id: Date.now() + Math.random(),
    };

    setStars((prev) => [...prev.slice(-40), newStar]);
  };

  const getBackgroundGradient = () => {
    switch (theme) {
      case 'amber':
        return 'from-amber-950 via-stone-950 to-black';
      case 'lavender':
        return 'from-indigo-950 via-purple-950 to-black';
      case 'aurora':
        return 'from-teal-950 via-emerald-950 to-black';
      default:
        return 'from-stone-950 to-black';
    }
  };

  const getGlowColor = () => {
    switch (theme) {
      case 'amber':
        return 'bg-amber-500/20 shadow-amber-500/30';
      case 'lavender':
        return 'bg-purple-500/20 shadow-purple-500/30';
      case 'aurora':
        return 'bg-emerald-500/20 shadow-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none">
      {/* Dynamic Night Atmosphere */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`w-full h-full sm:rounded-3xl bg-gradient-to-b ${getBackgroundGradient()} relative flex flex-col justify-between p-6 sm:p-8 cursor-crosshair overflow-hidden transition-colors duration-1000`}
      >
        {/* Placed interactive glowing stars */}
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white shadow-lg shadow-white animate-pulse pointer-events-none"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-amber-300 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                Sanctuary Night Light • Goodnight {partnerName}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="sm:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0">
            {/* Theme toggles */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-2xl p-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme('amber');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  theme === 'amber' ? 'bg-amber-500 text-white' : 'text-amber-200 hover:text-white'
                }`}
              >
                Amber Candle
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme('lavender');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  theme === 'lavender' ? 'bg-purple-500 text-white' : 'text-purple-200 hover:text-white'
                }`}
              >
                Lavender Star
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme('aurora');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  theme === 'aurora' ? 'bg-emerald-500 text-white' : 'text-emerald-200 hover:text-white'
                }`}
              >
                Aurora Mist
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="hidden sm:flex p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Breathing Orb */}
        <div className="flex flex-col items-center justify-center my-auto z-10 pointer-events-none">
          <div
            className={`w-44 h-44 sm:w-60 sm:h-60 rounded-full ${getGlowColor()} backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center transition-all duration-1000 shadow-2xl ${
              breathingPhase === 'Inhale'
                ? 'scale-125'
                : breathingPhase === 'Hold'
                ? 'scale-125 ring-8 ring-white/10'
                : breathingPhase === 'Exhale'
                ? 'scale-90'
                : 'scale-95'
            }`}
          >
            <Wind className="w-8 h-8 text-white/80 animate-pulse mb-2" />
            <span className="text-2xl font-bold font-display text-white tracking-widest uppercase">
              {breathingPhase}
            </span>
            <span className="text-xs text-white/60 font-medium mt-1">4-4-4-4 Sleep Cycle</span>
          </div>

          <p className="text-xs text-white/50 text-center mt-6 max-w-sm">
            Tap anywhere to sprinkle glowing constellations. Sleep soundly knowing you are deeply cherished.
          </p>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-white/40 z-10">
          <span>Taps placed: {stars.length} stars</span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current inline" />
            Connected in dreams
          </span>
        </div>
      </div>
    </div>
  );
};
