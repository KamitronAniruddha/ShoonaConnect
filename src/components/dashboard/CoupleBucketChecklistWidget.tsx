import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BucketItem {
  id: string;
  title: string;
  completed: boolean;
  category: 'romantic' | 'adventure' | 'cozy' | 'travel';
}

const DEFAULT_BUCKET_ITEMS: BucketItem[] = [
  { id: 'b1', title: 'Midnight skinny-dip under summer stars', completed: true, category: 'romantic' },
  { id: 'b2', title: 'Cook authentic homemade pasta from scratch', completed: true, category: 'cozy' },
  { id: 'b3', title: 'Watch sunrise from a scenic mountain peak', completed: false, category: 'adventure' },
  { id: 'b4', title: 'Take a spontaneous weekend road trip with zero plans', completed: false, category: 'travel' },
  { id: 'b5', title: 'Build a giant living-room blanket fort and watch movies', completed: true, category: 'cozy' },
  { id: 'b6', title: 'Dance barefoot together in a warm summer rain shower', completed: false, category: 'romantic' },
];

interface CoupleBucketChecklistWidgetProps {
  partnerName?: string;
  myName?: string;
  onShareMilestone?: (msg: string) => void;
}

export const CoupleBucketChecklistWidget: React.FC<CoupleBucketChecklistWidgetProps> = ({
  partnerName = 'Sweetheart',
  myName = 'Me',
  onShareMilestone,
}) => {
  const [items, setItems] = useState<BucketItem[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_micro_bucket_items');
      return saved ? JSON.parse(saved) : DEFAULT_BUCKET_ITEMS;
    } catch {
      return DEFAULT_BUCKET_ITEMS;
    }
  });

  const [newItemText, setNewItemText] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  const toggleItem = (id: string) => {
    const updated = items.map((i) => {
      if (i.id === id) {
        const nextState = !i.completed;
        if (nextState) {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.8 },
          });
          if (onShareMilestone) {
            onShareMilestone(`🎉 We just unlocked a bucket list dream together: "${i.title}"! ❤️✨`);
          }
        }
        return { ...i, completed: nextState };
      }
      return i;
    });

    setItems(updated);
    try {
      localStorage.setItem('shoona_micro_bucket_items', JSON.stringify(updated));
    } catch {}
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: BucketItem = {
      id: `b-${Date.now()}`,
      title: newItemText.trim(),
      completed: false,
      category: 'romantic',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    try {
      localStorage.setItem('shoona_micro_bucket_items', JSON.stringify(updated));
    } catch {}

    setNewItemText('');
    setShowAdd(false);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-purple-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>Couple Bucket Dreams</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-extrabold border border-purple-200 dark:border-purple-900/40">
                  {completedCount}/{items.length} Done
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Shared bucket list adventures to complete together in life
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="p-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            title="Add bucket dream"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {showAdd && (
          <form onSubmit={handleAddItem} className="mb-3 flex items-center gap-2 animate-in fade-in">
            <input
              type="text"
              placeholder="Dream goal together..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-purple-50/50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
            >
              Add
            </button>
          </form>
        )}

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer select-none ${
                item.completed
                  ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-300'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-200'
              }`}
            >
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={`text-xs ${item.completed ? 'line-through opacity-70' : 'font-medium'}`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
