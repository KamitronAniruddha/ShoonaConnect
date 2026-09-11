import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { customQuestionRowToCustomQuestion } from '../../utils/supabaseMappers';
import {
  Sparkles,
  X,
  Shuffle,
  Check,
  Search,
  BookOpen,
  Heart,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  RICH_DAILY_QUESTIONS,
  QUESTION_CATEGORIES,
  QuestionDefinition,
} from '../../utils/coupleData';
import { CustomCoupleQuestion } from '../../types';

interface QuestionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayDocId: string;
  todayStr: string;
  currentQuestionText?: string;
  onOpenCreateModal: () => void;
}

export const QuestionPickerModal: React.FC<QuestionPickerModalProps> = ({
  isOpen,
  onClose,
  todayDocId,
  todayStr,
  currentQuestionText,
  onOpenCreateModal,
}) => {
  const { couple, userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customQuestions, setCustomQuestions] = useState<CustomCoupleQuestion[]>([]);
  const [applying, setApplying] = useState(false);

  const coupleId = couple?.id;

  // Listen to couple's custom questions
  useEffect(() => {
    if (!coupleId || !isOpen) return;

    const fetchCustomQuestions = async () => {
      const { data, error } = await supabase
        .from('custom_questions')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomQuestions(data.map(customQuestionRowToCustomQuestion));
      }
    };

    fetchCustomQuestions();

    const channel = supabase
      .channel(`custom_questions_picker:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_questions',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchCustomQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, isOpen]);

  if (!isOpen) return null;

  // Filter questions
  const filteredRich = RICH_DAILY_QUESTIONS.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const filteredCustom = customQuestions.filter((item) => {
    const matchCategory = selectedCategory === 'all' || selectedCategory === 'custom' || item.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSelectQuestion = async (
    qText: string,
    cat?: string,
    authorName?: string,
    authorId?: string
  ) => {
    if (!coupleId || !userProfile) return;
    setApplying(true);

    try {
      const { error } = await supabase
        .from('daily_answers')
        .upsert(
          {
            couple_id: coupleId,
            date: todayStr,
            question_id: `picked-${Date.now()}`,
            question_text: qText,
            category: cat || 'romance',
            custom_author_id: authorId || null,
            custom_author_name: authorName || null,
            changed_by: userProfile.displayName || 'Partner',
            changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'couple_id,date' }
        );

      if (error) throw error;

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err) {
      console.error('Error applying question:', err);
    } finally {
      setApplying(false);
    }
  };

  const handleRandomShuffle = () => {
    const available = RICH_DAILY_QUESTIONS.filter(
      (q) => q.question !== currentQuestionText
    );
    if (available.length === 0) return;
    const picked = available[Math.floor(Math.random() * available.length)];
    handleSelectQuestion(picked.question, picked.category);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-purple-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Choose Today's Question
              </h3>
              <p className="text-xs text-slate-400">
                Explore romantic prompts or roll a surprise for both of you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Random & Create */}
        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-slate-800 flex flex-wrap gap-2.5 items-center justify-between">
          <button
            onClick={handleRandomShuffle}
            disabled={applying}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Surprise Us (Random Shuffle)</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Our Own Question</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search romantic prompts, questions or vibes..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {QUESTION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            {customQuestions.length > 0 && (
              <button
                onClick={() => setSelectedCategory('custom')}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'custom'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                <span>⭐</span>
                <span>Our Custom Questions ({customQuestions.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* Custom Questions Section if present and filter matches */}
          {(selectedCategory === 'all' || selectedCategory === 'custom') && filteredCustom.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Written by You Two</span>
              </div>
              {filteredCustom.map((cq) => {
                const isCurrent = cq.question === currentQuestionText;
                return (
                  <div
                    key={cq.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/20'
                        : 'bg-amber-50/40 dark:bg-slate-800/60 border-amber-200/70 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                        <span>⭐ Written by {cq.authorName}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                        "{cq.question}"
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent || applying}
                      onClick={() => handleSelectQuestion(cq.question, cq.category, cq.authorName, cq.authorId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? 'Active Now' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Curated Questions */}
          <div className="space-y-2">
            {filteredRich.length === 0 && filteredCustom.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No matching questions found. Try a different search or write your own!
              </div>
            ) : (
              filteredRich.map((item) => {
                const isCurrent = item.question === currentQuestionText;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                        <span>{item.vibeEmoji}</span>
                        <span>{item.categoryLabel}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                        "{item.question}"
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isCurrent || applying}
                      onClick={() => handleSelectQuestion(item.question, item.category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? 'Active Now' : 'Select'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
