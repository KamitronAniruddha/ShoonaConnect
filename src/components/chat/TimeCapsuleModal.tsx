import React, { useState } from 'react';
import {
  X,
  Lock,
  Unlock,
  Key,
  Calendar,
  Sparkles,
  Send,
  Clock,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimeCapsuleData } from '../../types';

interface TimeCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSealCapsule: (capsule: TimeCapsuleData) => Promise<void>;
  viewCapsule?: TimeCapsuleData;
  onUnlockCapsule?: (capsule: TimeCapsuleData) => Promise<void>;
}

export const TimeCapsuleModal: React.FC<TimeCapsuleModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSealCapsule,
  viewCapsule,
  onUnlockCapsule,
}) => {
  const [title, setTitle] = useState('');
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // View / Unlocking mode
  if (viewCapsule) {
    const isReady = new Date(viewCapsule.unlockDate) <= new Date() || viewCapsule.isUnlocked;
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(viewCapsule.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const handleUnlock = async () => {
      if (onUnlockCapsule) {
        await onUnlockCapsule(viewCapsule);
      }
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/10">
            {isReady ? '🔓' : '⏳'}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-serif">{viewCapsule.title}</h3>
            <p className="text-xs text-amber-300/90 mt-1">
              Sealed by {viewCapsule.sealedBy} • Target: {viewCapsule.unlockDate}
            </p>
          </div>

          {isReady ? (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                Revealed Love Note & Keepsake
              </span>
              <p className="text-sm text-neutral-100 font-serif italic leading-relaxed">
                "{viewCapsule.note}"
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-800/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-bold">
                <Clock className="w-4 h-4" /> {daysLeft} Days Remaining
              </div>
              <p className="text-xs text-neutral-400">
                This digital time capsule is sealed tight until {viewCapsule.unlockDate}!
              </p>
            </div>
          )}

          <div className="pt-2">
            {isReady && !viewCapsule.isUnlocked ? (
              <button
                type="button"
                onClick={handleUnlock}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Perform Ceremonial Opening ✨
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Close Vault
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create & Seal Mode
  const handleSeal = async () => {
    if (!title.trim() || !note.trim()) return;
    setIsSubmitting(true);
    try {
      await onSealCapsule({
        title: title.trim(),
        unlockDate,
        note: note.trim(),
        sealedBy: 'Me',
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#eab308', '#f59e0b', '#ffffff'],
      });

      onClose();
    } catch (err) {
      console.error('Failed to seal time capsule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-950/60 via-neutral-900 to-yellow-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 font-serif">
                Couple Time Capsule ⏳
              </h3>
              <p className="text-[11px] text-neutral-400">
                Seal a secret love note to open with {partnerName} on a future date
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Time Capsule Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Open on Our 1st Anniversary, A Promise for 2027..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Unlock Date (When can {partnerName} open this?)
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Secret Message / Future Prediction / Love Promise
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write what is in your heart right now... It will stay securely locked until the date arrives."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none font-serif italic"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSeal}
            disabled={isSubmitting || !title.trim() || !note.trim()}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" /> Seal Time Capsule 🔐
          </button>
        </div>
      </div>
    </div>
  );
};
