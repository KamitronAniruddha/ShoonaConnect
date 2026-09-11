import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  HelpCircle,
  AlertTriangle,
  Flame,
  Clock,
  X,
  Heart,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { LoveLetter } from '../../types';
import { supabase } from '../../lib/supabase';
import { romanticAudio } from '../../utils/romanticAudio';
import confetti from 'canvas-confetti';

interface LetterUnlockModalProps {
  letter: LoveLetter;
  coupleId: string;
  onClose: () => void;
  onUnlocked: (letter: LoveLetter) => void;
  onDestroyed?: (letterId: string) => void;
}

export const LetterUnlockModal: React.FC<LetterUnlockModalProps> = ({
  letter,
  coupleId,
  onClose,
  onUnlocked,
  onDestroyed,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [isBurned, setIsBurned] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Remaining attempts state tracking
  const maxAttempts = letter.maxAttempts && letter.maxAttempts > 0 ? letter.maxAttempts : 3;
  const [failedAttempts, setFailedAttempts] = useState(letter.failedAttempts || 0);
  const remainingAttempts = Math.max(0, maxAttempts - failedAttempts);

  // Check timelock
  const isTimelocked = letter.unlockDate && new Date(letter.unlockDate).getTime() > Date.now();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const entered = passwordInput.trim();
    const actual = (letter.secretPassword || '').trim();

    if (entered === actual) {
      // Success!
      setIsSuccess(true);
      romanticAudio.playWaxSealBreak();
      romanticAudio.playUnlockSuccess();
      confetti({ particleCount: 70, spread: 60 });
      setTimeout(() => {
        onUnlocked(letter);
      }, 700);
    } else {
      setErrorMessage('Incorrect secret password. Think back to your sweet memories!');
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isBurning || isBurned) return;

    const entered = questionInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const actual = (letter.secretAnswer || '').trim().toLowerCase().replace(/\s+/g, ' ');

    if (entered === actual) {
      // Correct answer!
      setIsSuccess(true);
      romanticAudio.playWaxSealBreak();
      romanticAudio.playUnlockSuccess();
      confetti({ particleCount: 100, spread: 80 });

      // Mark question passed in database
      try {
        await supabase
          .from('love_letters')
          .update({
            secret_question: null,
            secret_answer: null,
          })
          .eq('id', letter.id);
      } catch (err) {
        console.error('Error updating letter status:', err);
      }

      setTimeout(() => {
        onUnlocked({ ...letter, isQuestionProtected: false });
      }, 800);
    } else {
      // Wrong answer!
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      const left = maxAttempts - newFails;

      if (left <= 0) {
        // SELF-DESTRUCT PENALTY!
        setIsBurning(true);
        romanticAudio.playBurnSound();

        // 1. Delete letter permanently from Supabase database
        try {
          const { error } = await supabase
            .from('love_letters')
            .delete()
            .eq('id', letter.id);

          if (error) {
            console.error('Supabase deletion error:', error.message);
          }
        } catch (err) {
          console.error('Error deleting letter from Supabase:', err);
        }

        // 2. Notify parent container immediately
        if (onDestroyed) {
          onDestroyed(letter.id);
        }

        setTimeout(() => {
          setIsBurning(false);
          setIsBurned(true);
        }, 1800);
      } else {
        // Update failed attempts in Supabase metadata for persistence
        try {
          const currentMeta = (letter as any).metadata || {};
          await supabase
            .from('love_letters')
            .update({
              metadata: {
                ...currentMeta,
                failedAttempts: newFails,
              },
            })
            .eq('id', letter.id);
        } catch {
          // ignore
        }
        setErrorMessage(
          `Incorrect answer! ⚠️ Caution: Only ${left} attempt${left === 1 ? '' : 's'} remaining before this letter self-destructs!`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 overflow-hidden relative animate-in zoom-in-95">
        {/* Burning flame overlay if self-destructing */}
        {isBurning && (
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-red-600/90 via-orange-500/80 to-amber-400/90 flex flex-col items-center justify-center text-white text-center p-6 animate-pulse">
            <Flame className="w-16 h-16 animate-bounce text-yellow-200 mb-2" />
            <h3 className="text-xl font-bold uppercase tracking-wider">Letter Incinerating...</h3>
            <p className="text-xs text-yellow-100 mt-1">
              Wrong answer limit reached. Reducing love letter to ashes!
            </p>
          </div>
        )}

        {/* Burned Result Screen */}
        {isBurned ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center border border-slate-300">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Letter Destroyed Forever
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              You ran out of attempts for this high-stakes romantic challenge. The letter has vanished into thin air.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {letter.isQuestionProtected ? 'Romance Trivia Vault 🔥' : 'Protected Love Letter'}
                  </h3>
                  <p className="text-[10px] text-slate-400">From {letter.senderName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timelock notice if applicable */}
            {isTimelocked && (
              <div className="my-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200">
                  <span className="font-bold block">Timelocked Envelope</span>
                  This letter is sealed until{' '}
                  <strong className="underline">
                    {new Date(letter.unlockDate!).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                  .
                </div>
              </div>
            )}

            {/* 1. SECRET TRIVIA QUESTION FORM (HIGH STAKES) */}
            {letter.isQuestionProtected ? (
              <form onSubmit={handleQuestionSubmit} className="space-y-4 mt-4">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40 border border-orange-200/80 dark:border-orange-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 fill-current" /> High-Stakes Question
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        remainingAttempts === 1
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                      }`}
                    >
                      {remainingAttempts} of {maxAttempts} attempts left
                    </span>
                  </div>

                  <p className="font-serif italic text-sm text-slate-800 dark:text-slate-100 pt-1">
                    "{letter.secretQuestion}"
                  </p>

                  <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Answer correctly to read! If you run out of attempts, this letter burns forever!
                  </p>
                </div>

                {/* Optional Hint */}
                {letter.secretQuestionHint && (
                  <div>
                    {showHint ? (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
                        💡 Hint: {letter.secretQuestionHint}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowHint(true)}
                        className="text-[11px] text-rose-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" /> Need a hint?
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Answer
                  </label>
                  <input
                    type="text"
                    required
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    Submit Answer ➔
                  </button>
                </div>
              </form>
            ) : (
              /* 2. SECRET PASSWORD FORM */
              <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4">
                <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <KeyRound className="w-3.5 h-3.5" /> Secret Password Required
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {letter.senderName} protected this letter with a private password or code only you two know.
                  </p>
                </div>

                {/* Password hint if available */}
                {letter.passwordHint && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1">
                    <span>💡 Hint: {letter.passwordHint}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enter Password / PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Secret code or phrase..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none hover:scale-[1.02] transition-transform cursor-pointer"
                  >
                    Unlock Letter 💕
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
