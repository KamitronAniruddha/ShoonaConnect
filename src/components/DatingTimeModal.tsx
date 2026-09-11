import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Heart, Sparkles, Check, Flame } from 'lucide-react';
import { calculatePreciseLoveTime } from '../utils/coupleData';
import confetti from 'canvas-confetti';

interface DatingTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: string;
  currentTime?: string;
  onSave: (dateStr: string, timeStr: string) => Promise<void>;
}

export const DatingTimeModal: React.FC<DatingTimeModalProps> = ({
  isOpen,
  onClose,
  currentDate = '',
  currentTime = '12:00',
  onSave,
}) => {
  const [dateVal, setDateVal] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [timeVal, setTimeVal] = useState(currentTime || '12:00');
  const [saving, setSaving] = useState(false);
  const [previewTicker, setPreviewTicker] = useState(() =>
    calculatePreciseLoveTime(dateVal, timeVal)
  );

  useEffect(() => {
    if (isOpen) {
      setDateVal(currentDate || new Date().toISOString().split('T')[0]);
      setTimeVal(currentTime || '12:00');
    }
  }, [isOpen, currentDate, currentTime]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPreviewTicker(calculatePreciseLoveTime(dateVal, timeVal));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, dateVal, timeVal]);

  if (!isOpen) return null;

  const handleApplyPreset = (monthsAgo: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthsAgo);
    setDateVal(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateVal) return;
    setSaving(true);
    try {
      await onSave(dateVal, timeVal || '00:00');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err) {
      console.error('Failed to save dating date & time:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 transition-all">
        {/* Top romantic decorative header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
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
              <Clock className="w-6 h-6 animate-pulse text-amber-200" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-amber-200" /> Sanctuary Precision Timer
              </span>
              <h2 className="text-xl font-display font-black tracking-tight">
                When Did You Start Dating? 💕
              </h2>
            </div>
          </div>
          <p className="text-xs text-white/90 mt-2">
            Record the exact date and time your love story began. The calculator will track every second, minute, and week together.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                Date Started Dating *
              </label>
              <input
                type="date"
                required
                value={dateVal}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateVal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-500" />
                Exact Time Started Dating
              </label>
              <input
                type="time"
                value={timeVal}
                onChange={(e) => setTimeVal(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                Default: 12:00 PM if time is approximate
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Quick Date Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Today', months: 0 },
                { label: '1 Month Ago', months: 1 },
                { label: '6 Months Ago', months: 6 },
                { label: '1 Year Ago', months: 12 },
                { label: '2 Years Ago', months: 24 },
                { label: '3 Years Ago', months: 36 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p.months)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-amber-50/40 dark:from-slate-800/90 dark:to-slate-800/50 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Live Calculator Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Ticking live ⏱️
              </span>
            </div>

            {/* Big Ticker row */}
            <div className="grid grid-cols-4 gap-2 text-center py-2">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-rose-100/80 dark:border-slate-700">
                <div className="text-xl font-black font-romantic text-rose-600 dark:text-rose-400">
                  {previewTicker.totalDays}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Days</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-rose-100/80 dark:border-slate-700">
                <div className="text-xl font-black font-romantic text-rose-600 dark:text-rose-400">
                  {previewTicker.hours}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Hours</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-rose-100/80 dark:border-slate-700">
                <div className="text-xl font-black font-romantic text-rose-600 dark:text-rose-400">
                  {previewTicker.minutes}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Mins</div>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 shadow-xs border border-rose-100/80 dark:border-slate-700">
                <div className="text-xl font-black font-romantic text-rose-600 dark:text-rose-400">
                  {previewTicker.seconds}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-400">Secs</div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-rose-200/50 dark:border-slate-700/50 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>
                🗓️ <strong>{previewTicker.totalWeeks}</strong> overall weeks & {previewTicker.remainingDaysInWeek} days
              </span>
              <span>
                ⚡ <strong>{previewTicker.totalSeconds.toLocaleString()}</strong> seconds in love
              </span>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{saving ? 'Saving Love Date...' : 'Save Dating Date & Time'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
