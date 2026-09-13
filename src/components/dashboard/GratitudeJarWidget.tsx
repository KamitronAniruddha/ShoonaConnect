import React, { useState } from 'react';
import { Heart, Sparkles, Plus, RefreshCw, X, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GratitudeNote {
  id: string;
  note: string;
  author: string;
  date: string;
  color: string;
}

const INITIAL_NOTES: GratitudeNote[] = [
  {
    id: 'note-1',
    note: 'The way your eyes light up when you describe your favorite dream.',
    author: 'Me',
    date: 'Yesterday',
    color: '#f43f5e',
  },
  {
    id: 'note-2',
    note: 'How safe and peaceful the entire world feels when I lay my head on your chest.',
    author: 'Partner',
    date: '3 days ago',
    color: '#ec4899',
  },
  {
    id: 'note-3',
    note: 'Making me warm chamomile tea without me even having to ask.',
    author: 'Me',
    date: 'Last week',
    color: '#a855f7',
  },
  {
    id: 'note-4',
    note: 'Your unconditional kindness to waiters and stray animals.',
    author: 'Partner',
    date: 'Last month',
    color: '#f59e0b',
  },
];

interface GratitudeJarWidgetProps {
  partnerName?: string;
  myName?: string;
  onSendToChat?: (text: string) => void;
}

export const GratitudeJarWidget: React.FC<GratitudeJarWidgetProps> = ({
  partnerName = 'Sweetheart',
  myName = 'Me',
  onSendToChat,
}) => {
  const [notes, setNotes] = useState<GratitudeNote[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_gratitude_jar');
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [newText, setNewText] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [drawnNote, setDrawnNote] = useState<GratitudeNote | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleDropNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const colors = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#f59e0b'];
    const newNote: GratitudeNote = {
      id: `gratitude-${Date.now()}`,
      note: newText.trim(),
      author: myName,
      date: 'Just now',
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem('shoona_gratitude_jar', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewText('');
    setShowAdd(false);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
    });
  };

  const handleShakeAndDraw = () => {
    if (notes.length === 0) return;
    setIsShaking(true);

    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40, 30, 80]);
    }

    setTimeout(() => {
      setIsShaking(false);
      const random = notes[Math.floor(Math.random() * notes.length)];
      setDrawnNote(random);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24'],
      });
    }, 600);
  };

  const handleShareDrawn = () => {
    if (!drawnNote) return;
    const text = `⭐ Pulled a gratitude star from our Jar: "${drawnNote.note}" (by ${drawnNote.author}) 💕`;
    if (onSendToChat) {
      onSendToChat(text);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-amber-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Daily Love Gratitude Jar</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-900/40">
                {notes.length} Origami Stars
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Fold sweet tokens of appreciation and shake to pull a glowing memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShakeAndDraw}
            className={`px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 ${
              isShaking ? 'animate-bounce' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isShaking ? 'animate-spin' : ''}`} />
            <span>Shake & Draw Star ⭐</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Star</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleDropNote} className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 mb-3 space-y-2 animate-in fade-in">
          <input
            type="text"
            placeholder={`One thing I deeply love and appreciate about ${partnerName} today...`}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
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
              className="px-4 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl"
            >
              Drop Star into Jar
            </button>
          </div>
        </form>
      )}

      {/* Visual Glass Jar Representation */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/40 via-rose-50/30 to-amber-50/20 dark:from-slate-800/60 dark:to-slate-800/30 border border-amber-100 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-center min-h-24">
        {notes.slice(0, 18).map((n) => (
          <div
            key={n.id}
            onClick={() => setDrawnNote(n)}
            style={{ backgroundColor: `${n.color}20`, borderColor: n.color }}
            className="px-3 py-1 rounded-full border text-[11px] font-bold cursor-pointer hover:scale-110 transition-transform flex items-center gap-1 shadow-2xs"
          >
            <span>⭐</span>
            <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-200">
              {n.note}
            </span>
          </div>
        ))}
      </div>

      {/* Drawn Modal */}
      {drawnNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-amber-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center text-3xl shadow-md">
              ⭐
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Origami Gratitude Token
              </span>
              <p className="text-base font-editorial italic text-slate-800 dark:text-white mt-2 leading-relaxed">
                "{drawnNote.note}"
              </p>
              <span className="text-xs text-slate-400 block mt-2">
                Written by {drawnNote.author} • {drawnNote.date}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDrawnNote(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
              >
                Put Back in Jar
              </button>
              <button
                type="button"
                onClick={handleShareDrawn}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
