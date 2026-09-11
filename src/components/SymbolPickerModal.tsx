import React, { useState, useMemo } from 'react';
import { EMOJI_CATEGORIES, searchAllEmojis } from '../utils/emojiData';
import { Search, Sparkles, Check } from 'lucide-react';

interface SymbolPickerModalProps {
  currentSymbol: string;
  partnerSymbol?: string;
  onSelectSymbol: (symbol: string) => void;
  onClose: () => void;
}

export const SymbolPickerModal: React.FC<SymbolPickerModalProps> = ({
  currentSymbol,
  partnerSymbol,
  onSelectSymbol,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customInput, setCustomInput] = useState('');

  // Filter emojis based on category and search term
  const displayedEmojis = useMemo(() => {
    if (searchTerm.trim()) {
      return searchAllEmojis(searchTerm);
    }
    if (activeCategory === 'all') {
      return EMOJI_CATEGORIES.flatMap((c) => c.emojis);
    }
    const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
    return cat ? cat.emojis : [];
  }, [searchTerm, activeCategory]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const trimmed = Array.from(customInput.trim())[0] || customInput.trim();
    onSelectSymbol(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#160f14] rounded-3xl border border-[#ff3377]/40 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#ff3377]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-fraunces text-white">
                Choose Your Game Symbol
              </h3>
              <p className="text-[11px] text-neutral-400">
                Play with classic X & O, or any romantic & fun emoji!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Current Active Symbol Preview */}
        <div className="flex items-center justify-between bg-[#0d090c] p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ff3377]/20 border border-[#ff3377]/40 flex items-center justify-center text-2xl font-black text-[#ff4d8d] shadow-inner">
              {currentSymbol}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Your Active Mark</span>
              <span className="text-[10px] text-neutral-400">
                Partner is using: <span className="font-bold text-amber-400">{partnerSymbol || 'O'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {['✕', '◯', '❤️', '🔥', '👑'].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => {
                  onSelectSymbol(quick);
                  onClose();
                }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-110 ${
                  currentSymbol === quick
                    ? 'bg-[#ff3377] text-white font-bold'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                {quick}
              </button>
            ))}
          </div>
        </div>

        {/* Type / Paste Any Emoji directly input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type or paste ANY emoji (e.g. 🦄, 💎, 🌸)..."
            className="flex-1 bg-[#0d090c] border border-white/10 focus:border-[#ff3377] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-md shadow-pink-500/20"
          >
            Use Symbol
          </button>
        </form>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search emojis by vibe or name..."
            className="w-full bg-[#0d090c] border border-white/10 focus:border-[#ff3377] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
            }}
            className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold cursor-pointer transition-all ${
              activeCategory === 'all' && !searchTerm
                ? 'bg-[#ff3377] text-white shadow-sm'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            ⭐ All Categories
          </button>
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSearchTerm('');
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                activeCategory === cat.id && !searchTerm
                  ? 'bg-[#ff3377] text-white shadow-sm'
                  : 'bg-white/5 text-neutral-300 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Emoji Grid Scroll Container */}
        <div className="flex-1 overflow-y-auto p-1 max-h-56 sm:max-h-64 rounded-2xl bg-[#0d090c]/70 border border-white/5">
          <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 p-2">
            {displayedEmojis.map((emoji, idx) => {
              const isSelected = currentSymbol === emoji;
              const isPartner = partnerSymbol === emoji;
              return (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectSymbol(emoji);
                    onClose();
                  }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl transition-all cursor-pointer relative hover:scale-125 ${
                    isSelected
                      ? 'bg-[#ff3377]/30 border-2 border-[#ff3377] shadow-lg shadow-pink-500/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                  title={emoji}
                >
                  {emoji}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ff3377] text-white flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  )}
                  {isPartner && !isSelected && (
                    <span className="absolute -bottom-1 -right-1 text-[8px] bg-amber-500/80 text-black px-1 rounded-full font-bold">
                      P
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
          <span>{displayedEmojis.length} emojis ready to play</span>
          <button
            type="button"
            onClick={() => {
              onSelectSymbol('✕');
              onClose();
            }}
            className="text-[#ff4d8d] hover:underline font-bold"
          >
            Reset to Classic ✕
          </button>
        </div>
      </div>
    </div>
  );
};
