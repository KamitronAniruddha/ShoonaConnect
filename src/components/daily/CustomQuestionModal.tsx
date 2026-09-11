import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { customQuestionToRow } from '../../utils/supabaseMappers';
import { Sparkles, X, Heart, HelpCircle, Send, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUESTION_CATEGORIES } from '../../utils/coupleData';

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayDocId: string;
  todayStr: string;
  onQuestionApplied?: (newQuestion: string) => void;
}

export const CustomQuestionModal: React.FC<CustomQuestionModalProps> = ({
  isOpen,
  onClose,
  todayDocId,
  todayStr,
  onQuestionApplied,
}) => {
  const { couple, userProfile, partnerProfile } = useAuth();
  const [questionText, setQuestionText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'romance' | 'deep' | 'playful' | 'adventures' | 'gratitude' | 'future' | 'nostalgia'>('romance');
  const [setAsToday, setSetAsToday] = useState(true);
  const [saveToVault, setSaveToVault] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const categories = QUESTION_CATEGORIES.filter((c) => c.id !== 'all');

  const samplePrompts = [
    "What outfit of mine is your secret weakness?",
    "If we had a spontaneous 3-day weekend with no budget, where are we flying?",
    "What is something cute I do when I think nobody is watching?",
    "What is your absolute favorite comfort meal for us to eat in bed?",
    "What is one dream you want us to fulfill before this year ends?",
    "What is a silly memory of us that always makes you burst out laughing?",
  ];

  const handleApplySample = (sample: string) => {
    setQuestionText(sample);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !couple?.id || !userProfile) return;

    setSaving(true);
    try {
      const coupleId = couple.id;
      const cleanQuestion = questionText.trim();
      const catObj = categories.find((c) => c.id === selectedCategory) || categories[0];

      // 1. If saveToVault, add to custom_questions collection
      if (saveToVault) {
        const { error: vaultErr } = await supabase
          .from('custom_questions')
          .insert(
            customQuestionToRow({
              coupleId,
              question: cleanQuestion,
              category: selectedCategory,
              categoryLabel: catObj.label,
              authorId: userProfile.uid,
              authorName: userProfile.displayName || 'Partner',
              createdAt: new Date().toISOString(),
            })
          );
        if (vaultErr) throw vaultErr;
      }

      // 2. If setAsToday, update the today's daily question doc
      if (setAsToday) {
        const { error: todayErr } = await supabase
          .from('daily_answers')
          .upsert(
            {
              couple_id: coupleId,
              date: todayStr,
              question_id: `custom-${Date.now()}`,
              question_text: cleanQuestion,
              category: selectedCategory,
              custom_author_id: userProfile.uid,
              custom_author_name: userProfile.displayName || 'Partner',
              changed_by: userProfile.displayName || 'Partner',
              changed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'couple_id,date' }
          );

        if (todayErr) throw todayErr;

        if (onQuestionApplied) {
          onQuestionApplied(cleanQuestion);
        }
      }

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onClose();
      setQuestionText('');
    } catch (err) {
      console.error('Error saving custom question:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Create Our Own Question
              </h3>
              <p className="text-xs text-slate-400">
                Ask your love anything from the heart or curiosity
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Your Question for {partnerProfile?.displayName || 'Your Partner'}
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., What is your favorite memory of our first date together?"
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Quick inspiration prompts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block mb-1.5">
              💡 Need spark inspiration? Click one to insert:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-left transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Vibe / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options checkboxes */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsToday}
                onChange={(e) => setSetAsToday(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 cursor-pointer"
              />
              <span className="font-semibold">
                Set as Today's Question right now for both of us
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={saveToVault}
                onChange={(e) => setSaveToVault(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 cursor-pointer"
              />
              <span>Save into our permanent Shared Question Vault to ask again anytime</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !questionText.trim() || (!setAsToday && !saveToVault)}
              className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{saving ? 'Creating...' : 'Save & Publish Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
