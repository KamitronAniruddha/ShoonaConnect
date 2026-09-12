import React, { useState, useEffect } from 'react';
import { Search, Heart, Sparkles, Coffee, Plane, Activity, Smile, Box, Flame } from 'lucide-react';

interface ChatEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  inline?: boolean;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: Smile,
    emojis: [
      '❤️', '🥰', '😍', '😘', '💕', '💖', '💗', '💓', '💞', '💘', '💌', '💋',
      '😊', '🥺', '😉', '😚', '🤗', '🤤', '😻', '🔥', '✨', '🌹', '🌸', '💐',
      '😂', '🤣', '😭', '😆', '😄', '😃', '😋', '😜', '🤪', '😇', '🤩', '🥳',
      '😎', '😌', '😏', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😴', '🥱', '😷',
      '🤫', '🤭', '🤐', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '😢', '😤',
    ],
  },
  {
    id: 'love',
    name: 'Couple & Romance',
    icon: Heart,
    emojis: [
      '💑', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '💏', '👩‍❤️‍💋‍👨', '🫂', '💍', '💎', '💒',
      '🧸', '🎀', '🎁', '🍫', '🍷', '🥂', '🍾', '🕯️', '🕊️', '👑', '🦢', '🦋',
      '🍓', '🍒', '🍑', '🥞', '☕', '🧁', '🍰', '🍿', '🎬', '🛌', '🛁', '🌌',
    ],
  },
  {
    id: 'activities',
    name: 'Activities & Fun',
    icon: Activity,
    emojis: [
      '♟️', '🎮', '🎲', '🎯', '🎳', '🎨', '🎸', '🎹', '🎧', '🎤', '🎬', '🎟️',
      '✈️', '🚗', '🏖️', '⛺', '🎡', '🎢', '🚲', '🛹', '🏊', '💃', '🕺', '🧘',
      '⚽', '🏀', '🎾', '🏸', '🏓', '🥊', '🥋', '🛹', '🏆', '🥇', '🎉', '🎊',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: Coffee,
    emojis: [
      '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🍣', '🍜', '🍲', '🍝', '🥗',
      '☕', '🍵', '🧋', '🥤', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🍦', '🍩',
      '🍪', '🎂', '🧁', '🍫', '🍬', '🍭', '🍿', '🥐', '🥯', '🥞', '🧇', '🧀',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols & Sparks',
    icon: Sparkles,
    emojis: [
      '✨', '⭐', '🌟', '💫', '⚡', '☀️', '🌙', '☁️', '🌈', '🌧️', '❄️', '🔥',
      '💯', '👍', '👏', '🙌', '🙏', '✌️', '🤞', '🤙', '👋', '🤝', '💪', '👀',
      '✔️', '❌', '❓', '❗', '⏰', '⌛', '⏳', '📌', '📍', '💡', '🎵', '🎶',
    ],
  },
];

export const ChatEmojiPicker: React.FC<ChatEmojiPickerProps> = ({
  onSelectEmoji,
  onClose,
  inline = false,
}) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [search, setSearch] = useState('');
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shoona_recent_emojis');
      if (stored) {
        setRecents(JSON.parse(stored));
      } else {
        setRecents(['❤️', '🥰', '😘', '🥺', '✨', '🔥', '😂', '👍']);
      }
    } catch {
      setRecents(['❤️', '🥰', '😘', '🥺', '✨', '🔥']);
    }
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    try {
      const updated = [emoji, ...recents.filter((e) => e !== emoji)].slice(0, 16);
      setRecents(updated);
      localStorage.setItem('shoona_recent_emojis', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const allEmojis = EMOJI_CATEGORIES.flatMap((c) => c.emojis);
  const filteredEmojis = search.trim()
    ? Array.from(new Set(allEmojis))
    : null;

  return (
    <div
      className={`w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-rose-100 dark:border-slate-800 overflow-hidden z-30 flex flex-col ${
        inline ? '' : 'absolute bottom-14 left-0 sm:left-2 animate-in fade-in zoom-in-95'
      }`}
    >
      {/* Search Bar */}
      <div className="p-2 border-b border-rose-100 dark:border-slate-800 flex items-center gap-2 bg-rose-50/50 dark:bg-slate-800/50">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Categories Bar */}
      {!search && (
        <div className="flex items-center justify-between px-2 py-1 bg-slate-50 dark:bg-slate-800/80 border-b border-rose-100 dark:border-slate-800">
          {EMOJI_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                title={cat.name}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-2 overflow-y-auto max-h-56 select-none space-y-3">
        {/* Recents */}
        {!search && recents.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Recently Loved
            </span>
            <div className="grid grid-cols-8 gap-1 mt-1">
              {recents.slice(0, 8).map((em, idx) => (
                <button
                  key={`${em}-${idx}`}
                  type="button"
                  onClick={() => handleEmojiClick(em)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-125 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filtered or Active Category */}
        <div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            {search ? 'Search Results' : EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </span>
          <div className="grid grid-cols-8 gap-1 mt-1">
            {(filteredEmojis || EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis || []).map(
              (em, idx) => (
                <button
                  key={`${em}-${idx}`}
                  type="button"
                  onClick={() => handleEmojiClick(em)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-transform hover:scale-125 cursor-pointer"
                >
                  {em}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
