import React, { useState } from 'react';
import { Gift, Plus, Check, EyeOff, Sparkles, ExternalLink, Heart, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WishlistItem {
  id: string;
  title: string;
  addedBy: string;
  category: string;
  isSecretlyClaimed: boolean;
  claimedBy?: string;
  link?: string;
}

const INITIAL_GIFTS: WishlistItem[] = [
  {
    id: 'gift-1',
    title: 'Vintage Leather Travel Journal & Calligraphy Pen',
    addedBy: 'Partner',
    category: 'Creativity',
    isSecretlyClaimed: true,
    claimedBy: 'Me',
  },
  {
    id: 'gift-2',
    title: 'Matching Minimalist Silver Couple Rings',
    addedBy: 'Me',
    category: 'Jewelry',
    isSecretlyClaimed: false,
  },
  {
    id: 'gift-3',
    title: 'Cozy Oversized Lavender Knit Blanket',
    addedBy: 'Partner',
    category: 'Comfort',
    isSecretlyClaimed: false,
  },
];

interface GiftRegistryWidgetProps {
  partnerName?: string;
  myName?: string;
}

export const GiftRegistryWidget: React.FC<GiftRegistryWidgetProps> = ({
  partnerName = 'Sweetheart',
  myName = 'Me',
}) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_gift_registry');
      return saved ? JSON.parse(saved) : INITIAL_GIFTS;
    } catch {
      return INITIAL_GIFTS;
    }
  });

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Surprise');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: WishlistItem = {
      id: `gift-${Date.now()}`,
      title: title.trim(),
      addedBy: myName,
      category,
      isSecretlyClaimed: false,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    try {
      localStorage.setItem('shoona_gift_registry', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setTitle('');
    setShowAdd(false);
  };

  const handleToggleClaim = (itemId: string) => {
    const updated = items.map((it) => {
      if (it.id === itemId) {
        const nextState = !it.isSecretlyClaimed;
        return {
          ...it,
          isSecretlyClaimed: nextState,
          claimedBy: nextState ? myName : undefined,
        };
      }
      return it;
    });

    setItems(updated);
    try {
      localStorage.setItem('shoona_gift_registry', JSON.stringify(updated));
    } catch {
      // ignore
    }

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#f59e0b'],
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-indigo-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Spoiler-Safe Wishlist & Surprise Registry</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-extrabold border border-indigo-200 dark:border-indigo-900/40">
                Secret Surprises
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Claim partner's dream gifts secretly so birthdays & anniversaries stay a magical surprise
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wish</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddItem} className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 mb-3 space-y-2 animate-in fade-in">
          <input
            type="text"
            placeholder="Something I would love or dream of getting..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs text-slate-400 px-3 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl"
            >
              Add to Wishlist
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isAddedByMe = item.addedBy === myName;
          const isClaimedByMe = item.claimedBy === myName;

          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    {item.category}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Wished by: {item.addedBy}
                </div>
              </div>

              {/* Secret Claim Button or Indicator */}
              <div className="shrink-0">
                {isAddedByMe ? (
                  <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                    <EyeOff className="w-3 h-3 text-slate-400" />
                    <span>Secret from you 🤫</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleClaim(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      item.isSecretlyClaimed
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {item.isSecretlyClaimed ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>You Bought This! 🎁</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Secretly Claim</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
