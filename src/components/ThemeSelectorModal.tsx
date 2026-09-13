import React from 'react';
import { X, Palette, Check, Sparkles } from 'lucide-react';
import { THEMES } from '../utils/coupleData';
import confetti from 'canvas-confetti';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeKey: string) => Promise<void>;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const handleSelect = async (key: string) => {
    try {
      await onSelectTheme(key);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        {/* Header */}
        <div className="p-6 pb-5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-200" /> Atmospheric Visual Themes
              </span>
              <h2 className="text-xl font-display font-black tracking-tight">
                Sanctuary Themes & Colors 🎨
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-2">
            Choose from 11 curated romantic palettes including our new Starlight Diamond, Royal Crimson & Gold, and Amethyst Dream themes.
          </p>
        </div>

        {/* Theme Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[65vh] overflow-y-auto">
          {Object.entries(THEMES).map(([key, t]) => {
            const isSelected = currentTheme === key;
            const isNew = [
              'starlight_diamond',
              'royal_crimson',
              'amethyst_dream',
              'velvet_noir',
              'celestial_aurora',
              'cherry_blossom',
            ].includes(key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-500 bg-rose-50/40 dark:bg-slate-800 shadow-md scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-rose-300 dark:hover:border-rose-700'
                }`}
              >
                {/* Visual Gradient Swatch */}
                <div className={`w-full h-12 rounded-xl bg-gradient-to-r ${t.gradient} mb-3 shadow-inner relative overflow-hidden flex items-center justify-end px-3`}>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {t.name}
                      </h4>
                      {isNew && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                      {t.tag}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Themes synchronize live across both partners' devices.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
