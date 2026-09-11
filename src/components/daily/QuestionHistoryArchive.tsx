import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DailyAnswer } from '../../types';
import { supabase } from '../../lib/supabase';
import {
  Sparkles,
  Calendar,
  Clock,
  Search,
  Star,
  CheckCircle2,
  Lock,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface QuestionHistoryArchiveProps {
  answers: DailyAnswer[];
}

export const QuestionHistoryArchive: React.FC<QuestionHistoryArchiveProps> = ({ answers }) => {
  const { userProfile, partnerProfile, couple } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'revealed' | 'starred' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;

  const handleToggleStar = async (ansDoc: DailyAnswer) => {
    if (!coupleId || !ansDoc.id) return;
    try {
      const { error } = await supabase
        .from('daily_answers')
        .update({ is_starred: !ansDoc.isStarred })
        .eq('id', ansDoc.id)
        .eq('couple_id', coupleId);

      if (error) throw error;
    } catch (err) {
      console.error('Error starring question:', err);
    }
  };

  const filtered = answers.filter((item) => {
    if (filterType === 'revealed' && !item.isRevealed) return false;
    if (filterType === 'starred' && !item.isStarred) return false;
    if (filterType === 'custom' && !item.customAuthorName) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuestion = item.questionText?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      const matchCustomAuthor = item.customAuthorName?.toLowerCase().includes(q);

      let matchAnswers = false;
      if (item.answers) {
        Object.values(item.answers).forEach((val) => {
          const ans = val as { answer?: string; userName?: string };
          if (ans?.answer?.toLowerCase().includes(q) || ans?.userName?.toLowerCase().includes(q)) {
            matchAnswers = true;
          }
        });
      }

      if (!matchQuestion && !matchCategory && !matchCustomAuthor && !matchAnswers) return false;
    }

    return true;
  });

  const formatAnswerTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Past Question';
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="question-history-archive" className="space-y-5">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        {/* Filter Pills */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({answers.length})
          </button>
          <button
            onClick={() => setFilterType('revealed')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'revealed'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Both Answered
          </button>
          <button
            onClick={() => setFilterType('starred')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'starred'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            ⭐ Starred
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterType === 'custom'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Our Custom
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or partner answers..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-2">
            <span className="text-3xl">📖</span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No Questions Found In History
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search query.'
                : 'As you and your partner answer daily questions, every answer and date stamp will be preserved here!'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const myAns = myUid && item.answers?.[myUid];
            const partnerAns = partnerUid && item.answers?.[partnerUid];
            const isRevealed = item.isRevealed;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-purple-100 dark:border-slate-800 shadow-2xs space-y-4 hover:border-purple-200 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span>{formatDate(item.date)}</span>
                    </span>

                    {item.category && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold capitalize">
                        {item.category}
                      </span>
                    )}

                    {item.customAuthorName && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                        ★ By {item.customAuthorName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStar(item)}
                      className={`p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        item.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                      }`}
                      title="Bookmark this special memory"
                    >
                      <Star
                        className={`w-4 h-4 ${item.isStarred ? 'fill-amber-400 text-amber-500' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-relaxed">
                  "{item.questionText}"
                </h4>

                {/* Answers Content */}
                {isRevealed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* My Answer */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-purple-800 dark:text-purple-300">
                        <span>You:</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {formatAnswerTime(myAns?.answeredAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed">
                        "{myAns?.answer || 'No answer recorded'}"
                      </p>
                    </div>

                    {/* Partner Answer */}
                    <div className="p-3.5 rounded-2xl bg-pink-50/60 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/40 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-pink-800 dark:text-pink-300">
                        <span>{partnerProfile?.displayName || 'Partner'}:</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {formatAnswerTime(partnerAns?.answeredAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed">
                        "{partnerAns?.answer || 'No answer recorded'}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs flex items-center justify-between text-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>
                        {myAns ? 'Your answer is locked in. Waiting for partner to reveal!' : 'Awaiting answers'}
                      </span>
                    </div>
                    {myAns && (
                      <span className="text-[10px] text-slate-400">
                        Answered at {formatAnswerTime(myAns.answeredAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
