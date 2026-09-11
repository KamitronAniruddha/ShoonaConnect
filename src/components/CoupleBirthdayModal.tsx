import React, { useState, useEffect } from 'react';
import { X, Cake, Calendar, Heart, Sparkles, User, Users, CheckCircle2 } from 'lucide-react';
import { getZodiacSign, getDaysUntilBirthday } from '../utils/coupleData';
import confetti from 'canvas-confetti';

interface CoupleBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  myCurrentBirthday?: string;
  partnerCurrentBirthday?: string;
  myDisplayName: string;
  partnerDisplayName?: string;
  onSave: (data: {
    mode: 'both' | 'me_only' | 'partner_only';
    myBirthday?: string;
    partnerBirthday?: string;
  }) => Promise<void>;
}

export const CoupleBirthdayModal: React.FC<CoupleBirthdayModalProps> = ({
  isOpen,
  onClose,
  myCurrentBirthday = '',
  partnerCurrentBirthday = '',
  myDisplayName,
  partnerDisplayName = 'Partner',
  onSave,
}) => {
  const [mode, setMode] = useState<'both' | 'me_only' | 'partner_only'>('both');
  const [myBday, setMyBday] = useState(myCurrentBirthday);
  const [partnerBday, setPartnerBday] = useState(partnerCurrentBirthday);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMyBday(myCurrentBirthday);
      setPartnerBday(partnerCurrentBirthday);
      // If one is already set and other is not, adapt
      if (myCurrentBirthday && !partnerCurrentBirthday) {
        setMode('both');
      }
    }
  }, [isOpen, myCurrentBirthday, partnerCurrentBirthday]);

  if (!isOpen) return null;

  const myZodiac = getZodiacSign(myBday);
  const myCountdown = getDaysUntilBirthday(myBday);

  const partnerZodiac = getZodiacSign(partnerBday);
  const partnerCountdown = getDaysUntilBirthday(partnerBday);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        mode,
        myBirthday: mode === 'both' || mode === 'me_only' ? myBday : undefined,
        partnerBirthday: mode === 'both' || mode === 'partner_only' ? partnerBday : undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save birthday:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-pink-200 dark:border-pink-900/60 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        {/* Festive Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner text-2xl">
              🎂
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider mb-1 font-display">
                <Sparkles className="w-3 h-3 text-amber-200" /> Couple Milestones
              </span>
              <h2 className="text-xl font-display font-black tracking-tight">
                Birthdays & Celebrations 🎂💕
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-2">
            Never miss each other's special day! You can set both birthdays together or set yours individually.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 px-1">
            Choose What to Set
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('both')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'both'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Set Both Birthdays</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('me_only')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'me_only'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Birthday Only</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('partner_only')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'partner_only'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Partner's Only</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* User's Birthday Section */}
          {(mode === 'both' || mode === 'me_only') && (
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/70 border border-rose-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-rose-500" />
                  {myDisplayName}'s Birthday (You)
                </label>
                {myBday && (
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {myZodiac.symbol} {myZodiac.sign} ({myZodiac.element})
                  </span>
                )}
              </div>

              <input
                type="date"
                required={mode === 'both' || mode === 'me_only'}
                value={myBday}
                onChange={(e) => setMyBday(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              {myBday && myCountdown.daysLeft >= 0 && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {myCountdown.isToday ? (
                    <strong className="text-rose-600 font-bold">🎉 Today is your birthday! Happy Birthday!</strong>
                  ) : (
                    <span>
                      Next birthday on <strong>{myCountdown.formatted}</strong> ({myCountdown.daysLeft} days left)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Partner's Birthday Section */}
          {(mode === 'both' || mode === 'partner_only') && (
            <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-slate-800/70 border border-pink-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  {partnerDisplayName}'s Birthday (Partner)
                </label>
                {partnerBday && (
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-pink-200 dark:border-pink-900 text-[10px] font-bold text-pink-600 dark:text-pink-400">
                    {partnerZodiac.symbol} {partnerZodiac.sign} ({partnerZodiac.element})
                  </span>
                )}
              </div>

              <input
                type="date"
                required={mode === 'both' || mode === 'partner_only'}
                value={partnerBday}
                onChange={(e) => setPartnerBday(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />

              {partnerBday && partnerCountdown.daysLeft >= 0 && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {partnerCountdown.isToday ? (
                    <strong className="text-pink-600 font-bold">🎉 Today is {partnerDisplayName}'s birthday! Shower them with love!</strong>
                  ) : (
                    <span>
                      Next birthday on <strong>{partnerCountdown.formatted}</strong> ({partnerCountdown.daysLeft} days left)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Helpful note */}
          <p className="text-[11px] text-slate-400 dark:text-slate-500 px-1 italic">
            💡 Both partners will see these birthdays with an automatic countdown and sweet reminders on the Home Sanctuary.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving Birthdays...'
                  : mode === 'both'
                  ? 'Save Both Birthdays'
                  : 'Save Birthday'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
