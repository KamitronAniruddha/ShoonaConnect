import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomCoupleQuestion } from '../../types';
import { supabase } from '../../lib/supabase';
import {
  Sparkles,
  Plus,
  Play,
  Trash2,
  Calendar,
  User,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestionVaultSectionProps {
  customQuestions: CustomCoupleQuestion[];
  todayDocId: string;
  todayStr: string;
  onOpenCreateModal: () => void;
}

export const QuestionVaultSection: React.FC<QuestionVaultSectionProps> = ({
  customQuestions,
  todayDocId,
  todayStr,
  onOpenCreateModal,
}) => {
  const { couple, userProfile } = useAuth();
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const coupleId = couple?.id;

  const handleAskToday = async (q: CustomCoupleQuestion) => {
    if (!coupleId || !userProfile) return;
    setActivatingId(q.id);
    try {
      const { error } = await supabase
        .from('daily_answers')
        .upsert(
          {
            couple_id: coupleId,
            date: todayStr,
            question_id: `vault-${q.id}`,
            question_text: q.question,
            category: q.category || 'romance',
            custom_author_id: q.authorId,
            custom_author_name: q.authorName,
            changed_by: userProfile.displayName || 'Partner',
            changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'couple_id,date' }
        );

      if (error) throw error;
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Error setting custom question as today:', err);
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!coupleId) return;
    try {
      const { error } = await supabase
        .from('custom_questions')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  return (
    <div id="question-vault-section" className="space-y-5">
      {/* Header bar */}
      <div className="p-5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Our Shared Question Vault
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Questions crafted by either of you. Re-ask any prompt anytime as today's question!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Question</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {customQuestions.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-3">
            <span className="text-3xl">✨</span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No Custom Questions in Vault Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Write a question specifically for your partner. You can save it to ask today or keep it in your permanent shared vault!
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Write First Question
            </button>
          </div>
        ) : (
          customQuestions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs hover:border-purple-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold capitalize">
                    {q.categoryLabel || q.category}
                  </span>
                  <span className="text-slate-400 font-medium">
                    By {q.authorName || 'Partner'}
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white leading-relaxed">
                  "{q.question}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove from vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  disabled={activatingId === q.id}
                  onClick={() => handleAskToday(q)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{activatingId === q.id ? 'Setting...' : 'Ask This Today'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
