import React from 'react';
import { Cake, Sparkles, Heart, Calendar, Plus, Edit2, AlertCircle } from 'lucide-react';
import { getZodiacSign, getDaysUntilBirthday } from '../utils/coupleData';
import confetti from 'canvas-confetti';

interface SanctuaryBirthdayCardProps {
  myBirthday?: string;
  partnerBirthday?: string;
  myDisplayName: string;
  partnerDisplayName?: string;
  myPhotoUrl?: string;
  partnerPhotoUrl?: string;
  onOpenBirthdayModal: () => void;
}

export const SanctuaryBirthdayCard: React.FC<SanctuaryBirthdayCardProps> = ({
  myBirthday,
  partnerBirthday,
  myDisplayName,
  partnerDisplayName = 'Partner',
  myPhotoUrl,
  partnerPhotoUrl,
  onOpenBirthdayModal,
}) => {
  const myZodiac = getZodiacSign(myBirthday);
  const myBdayStatus = getDaysUntilBirthday(myBirthday);

  const partnerZodiac = getZodiacSign(partnerBirthday);
  const partnerBdayStatus = getDaysUntilBirthday(partnerBirthday);

  const isAnyoneBirthdayToday = myBdayStatus.isToday || partnerBdayStatus.isToday;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-pink-50/70 via-white to-rose-50/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800/80 border border-pink-200/80 dark:border-slate-800 shadow-md transition-all">
      {/* Today is Birthday Highlight Banner */}
      {isAnyoneBirthdayToday && (
        <div
          onClick={triggerConfetti}
          className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-lg cursor-pointer animate-pulse flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎂</span>
            <div>
              <h4 className="text-sm sm:text-base font-black font-display">
                {myBdayStatus.isToday && partnerBdayStatus.isToday
                  ? "Double Celebration! It's Both Your Birthdays Today! 🎉"
                  : myBdayStatus.isToday
                  ? `Happy Birthday, ${myDisplayName}! 💖 Celebrating YOU today!`
                  : `🎉 Today is ${partnerDisplayName}'s Birthday! Shower them with love! 💖`}
              </h4>
              <p className="text-xs text-white/90">
                Click anywhere on this banner for birthday confetti! 🎈
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/25 rounded-full text-xs font-bold text-white uppercase tracking-wider backdrop-blur-xs flex-shrink-0">
            Celebrate 🎉
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center text-lg">
            🎂
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Couple Birthdays & Zodiac 💖
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalized countdowns & zodiac sign alignment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBirthdayModal}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Edit2 className="w-3 h-3 text-pink-500" />
          <span>{myBirthday || partnerBirthday ? 'Manage Birthdays' : 'Set Birthdays'}</span>
        </button>
      </div>

      {/* Birthday Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* User Birthday Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={myPhotoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=user`}
              alt={myDisplayName}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-rose-200 dark:border-rose-900 bg-rose-50"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                  {myDisplayName} (You)
                </span>
                {myBirthday && (
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {myZodiac.symbol} {myZodiac.sign}
                  </span>
                )}
              </div>

              {myBirthday ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  🎂 {myBdayStatus.formatted}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenBirthdayModal}
                  className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                >
                  <Plus className="w-3 h-3" /> Add your birthday
                </button>
              )}
            </div>
          </div>

          {myBirthday && (
            <div className="text-right">
              {myBdayStatus.isToday ? (
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  Today! 🎉
                </span>
              ) : (
                <div>
                  <div className="text-base font-black font-romantic text-rose-600 dark:text-rose-400 leading-tight">
                    {myBdayStatus.daysLeft}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">days left</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Partner Birthday Card */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src={partnerPhotoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`}
              alt={partnerDisplayName}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-pink-200 dark:border-pink-900 bg-pink-50"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                  {partnerDisplayName}
                </span>
                {partnerBirthday && (
                  <span className="px-1.5 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950 text-[10px] font-bold text-pink-600 dark:text-pink-400">
                    {partnerZodiac.symbol} {partnerZodiac.sign}
                  </span>
                )}
              </div>

              {partnerBirthday ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  🎂 {partnerBdayStatus.formatted}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenBirthdayModal}
                  className="text-[11px] font-semibold text-pink-500 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                >
                  <Plus className="w-3 h-3" /> Add partner's birthday
                </button>
              )}
            </div>
          </div>

          {partnerBirthday && (
            <div className="text-right">
              {partnerBdayStatus.isToday ? (
                <span className="px-2.5 py-1 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                  Today! 🎉
                </span>
              ) : (
                <div>
                  <div className="text-base font-black font-romantic text-pink-600 dark:text-pink-400 leading-tight">
                    {partnerBdayStatus.daysLeft}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">days left</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
