import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DailyAnswer } from '../../types';
import { supabase } from '../../lib/supabase';
import { dailyAnswerToRow } from '../../utils/supabaseMappers';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Shuffle,
  Plus,
  Send,
  Eye,
  EyeOff,
  Star,
  MessageCircleHeart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyQuestionCardProps {
  todayDaily: DailyAnswer | null;
  defaultQuestion: { id: string; question: string; category?: string; categoryLabel?: string };
  todayDocId: string;
  todayStr: string;
  onOpenPicker: () => void;
  onOpenCreate: () => void;
}

export const DailyQuestionCard: React.FC<DailyQuestionCardProps> = ({
  todayDaily,
  defaultQuestion,
  todayDocId,
  todayStr,
  onOpenPicker,
  onOpenCreate,
}) => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const [answerInput, setAnswerInput] = useState('');
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [showMySecretAnswer, setShowMySecretAnswer] = useState(false);

  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;

  const currentQuestionText = todayDaily?.questionText || defaultQuestion.question;
  const currentCategory = todayDaily?.category || defaultQuestion.category || 'romance';
  const customAuthor = todayDaily?.customAuthorName;

  const myAnswerObj = myUid && todayDaily?.answers?.[myUid];
  const partnerAnswerObj = partnerUid && todayDaily?.answers?.[partnerUid];

  const hasMyAnswer = Boolean(myAnswerObj?.answer);
  const hasPartnerAnswer = Boolean(partnerAnswerObj?.answer);
  const isRevealed = Boolean(todayDaily?.isRevealed);

  // Format answered timestamps nicely
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerInput.trim() || !coupleId || !myUid) return;

    setSavingAnswer(true);
    try {
      const existingAnswers = todayDaily?.answers || {};

      const nowIso = new Date().toISOString();
      const updatedAnswers = {
        ...existingAnswers,
        [myUid]: {
          answer: answerInput.trim(),
          answeredAt: nowIso,
          userName: userProfile?.displayName || 'Me',
        },
      };

      const willReveal = partnerUid ? Boolean(updatedAnswers[partnerUid]?.answer) : false;

      const payload: Partial<DailyAnswer> = {
        id: todayDaily?.id,
        coupleId,
        date: todayStr,
        questionId: todayDaily?.questionId || defaultQuestion.id,
        questionText: currentQuestionText,
        category: currentCategory,
        customAuthorId: todayDaily?.customAuthorId || undefined,
        customAuthorName: todayDaily?.customAuthorName || undefined,
        answers: updatedAnswers,
        isRevealed: willReveal,
        isStarred: todayDaily?.isStarred || false,
        updatedAt: nowIso,
        createdAt: todayDaily?.createdAt || nowIso,
      };

      const row = dailyAnswerToRow(payload);
      const { error } = await supabase
        .from('daily_answers')
        .upsert(row, { onConflict: 'couple_id,date' });

      if (error) throw error;

      setAnswerInput('');
      if (willReveal) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error('Error saving answer:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleToggleStar = async () => {
    if (!coupleId || !todayDaily) return;
    try {
      const { error } = await supabase
        .from('daily_answers')
        .update({ is_starred: !todayDaily.isStarred })
        .eq('couple_id', coupleId)
        .eq('date', todayStr);

      if (error) throw error;
    } catch (err) {
      console.error('Error starring daily:', err);
    }
  };

  return (
    <div
      id="daily-question-card"
      className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-rose-50/90 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 rounded-3xl p-6 sm:p-7 border border-purple-200/80 dark:border-purple-900/40 shadow-sm space-y-5"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <span>Today's Couple Question</span>
              {customAuthor && (
                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  ★ By {customAuthor}
                </span>
              )}
            </span>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              Changes every day automatically • Blind reveal system
            </div>
          </div>
        </div>

        {/* Change / Write Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPicker}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Browse or shuffle questions"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreate}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Make your own custom question"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Make Own</span>
            <span className="sm:hidden">Own</span>
          </button>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/80 backdrop-blur-xs border border-purple-100 dark:border-slate-700 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span className="capitalize font-semibold text-purple-600 dark:text-purple-400">
            {currentCategory} Prompt
          </span>
          {todayDaily?.isRevealed && (
            <button
              onClick={handleToggleStar}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                todayDaily.isStarred
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-400 hover:text-amber-500'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${todayDaily.isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span className="text-[10px]">{todayDaily.isStarred ? 'Favorited' : 'Star'}</span>
            </button>
          )}
        </div>

        <h3 className="text-base sm:text-xl font-bold font-fraunces text-slate-800 dark:text-white leading-relaxed">
          "{currentQuestionText}"
        </h3>

        {todayDaily?.changedBy && (
          <div className="text-[10px] text-slate-400 italic pt-1">
            Question updated by {todayDaily.changedBy}
          </div>
        )}
      </div>

      {/* Real-time Status Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-purple-100 dark:border-slate-700 flex items-center gap-2.5">
          {hasMyAnswer ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <div className="text-xs min-w-0">
            <div className="font-bold text-slate-800 dark:text-slate-200">Your Answer</div>
            <div className="text-[10px] text-slate-400 truncate">
              {hasMyAnswer
                ? `Locked in ${formatTime(myAnswerObj?.answeredAt)}`
                : 'Awaiting your answer'}
            </div>
          </div>
        </div>

        <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-purple-100 dark:border-slate-700 flex items-center gap-2.5">
          {hasPartnerAnswer ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
          )}
          <div className="text-xs min-w-0">
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {partnerProfile?.displayName || 'Partner'}'s Answer
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {hasPartnerAnswer
                ? `Locked in ${formatTime(partnerAnswerObj?.answeredAt)}`
                : 'Waiting for partner'}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content: Revealed Answers vs Locked State vs Input Form */}
      {isRevealed ? (
        <div className="space-y-3 pt-3 border-t border-purple-200 dark:border-purple-900/50">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Both of you answered! Secret answers revealed:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* My Answer */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>You:</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {formatTime(myAnswerObj?.answeredAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{myAnswerObj?.answer || ''}"
              </p>
            </div>

            {/* Partner's Answer */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-pink-700 dark:text-pink-400">
                <span>{partnerProfile?.displayName || 'Partner'}:</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {formatTime(partnerAnswerObj?.answeredAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{partnerAnswerObj?.answer || ''}"
              </p>
            </div>
          </div>
        </div>
      ) : hasMyAnswer ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block text-sm">Your answer is securely locked!</strong>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                Your answer is sealed in zero-knowledge style until{' '}
                {partnerProfile?.displayName || 'your partner'} locks in their response. Once both
                submit, the answers will instantly reveal to both of you!
              </p>
            </div>
          </div>

          <div className="pt-1 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowMySecretAnswer(!showMySecretAnswer)}
              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              {showMySecretAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showMySecretAnswer ? 'Hide what I wrote' : 'Peek what I wrote'}</span>
            </button>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              Submitted at {formatTime(myAnswerObj?.answeredAt)}
            </span>
          </div>

          {showMySecretAnswer && (
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-800 text-xs italic text-slate-800 dark:text-slate-200">
              "{myAnswerObj?.answer}"
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleAnswerSubmit} className="space-y-2.5 pt-1">
          <textarea
            rows={3}
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder={`Write your honest, romantic or playful answer for ${partnerProfile?.displayName || 'your love'}...`}
            className="w-full px-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 dark:text-white placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={savingAnswer || !answerInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>{savingAnswer ? 'Locking in response...' : 'Lock In My Answer'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
