import React, { useState } from 'react';
import { HelpCircle, Sparkles, X, ChevronRight, ChevronLeft, Send, Heart, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuestionCard {
  id: number;
  category: 'Soulmate' | 'Memories' | 'Playful' | 'Future' | 'Intimacy';
  question: string;
  subtext: string;
  badgeColor: string;
}

const QUESTIONS: QuestionCard[] = [
  {
    id: 1,
    category: 'Soulmate',
    question: 'What is a tiny, ordinary moment with me where you quietly thought "I truly love this person"?',
    subtext: 'Describe the scene, the lighting, and what we were doing.',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 2,
    category: 'Memories',
    question: 'If you could relive exactly one 24-hour day of our relationship on an infinite loop, which day would it be?',
    subtext: 'From the moment you woke up to when you went to sleep.',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    id: 3,
    category: 'Playful',
    question: 'What is a silly habit or expression of mine that makes you smile when nobody else is watching?',
    subtext: 'Be 100% honest, no holding back!',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  {
    id: 4,
    category: 'Future',
    question: 'When we are 80 years old, what does our quiet Sunday morning breakfast together look like?',
    subtext: 'Where do we live? What are we drinking? What are we laughing about?',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    id: 5,
    category: 'Intimacy',
    question: 'What kind of touch from me makes you feel the safest and most cherished?',
    subtext: 'Forehead touches, intertwined fingers, long hugs, or back scratches?',
    badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  },
  {
    id: 6,
    category: 'Soulmate',
    question: 'In what way have I helped you grow into a happier or stronger version of yourself?',
    subtext: 'How do you feel different than before we crossed paths?',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  {
    id: 7,
    category: 'Playful',
    question: 'If we were trapped in a zombie apocalypse together, who would die first and what would be our weapon of choice?',
    subtext: 'Our comedic survival strategy.',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
];

interface DeepSparkQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
  onSendToChat?: (questionText: string) => void;
}

export const DeepSparkQuestionsModal: React.FC<DeepSparkQuestionsModalProps> = ({
  isOpen,
  onClose,
  partnerName = 'Sweetheart',
  onSendToChat,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const filtered = selectedCategory === 'All'
    ? QUESTIONS
    : QUESTIONS.filter((q) => q.category === selectedCategory);

  const card = filtered[currentIndex] || QUESTIONS[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const handleSendQuestion = () => {
    const text = `💭 Deep Spark Question for ${partnerName}: "${card.question}" (${card.subtext})`;
    if (onSendToChat) {
      onSendToChat(text);
    }
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Deep Spark Couple Question Deck
              </h3>
              <p className="text-[10px] text-slate-400">Card #{card.id} of {filtered.length}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Soulmate', 'Memories', 'Playful', 'Future', 'Intimacy'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* The 3D-styled Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="min-h-56 p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-slate-800 dark:via-purple-950/40 dark:to-slate-900 border-2 border-purple-200/80 dark:border-purple-800/60 shadow-md flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${card.badgeColor}`}>
                {card.category}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tap to flip tip
              </span>
            </div>

            {!isFlipped ? (
              <h4 className="text-base sm:text-lg font-editorial font-bold text-slate-800 dark:text-white leading-relaxed">
                "{card.question}"
              </h4>
            ) : (
              <div className="space-y-2 animate-in fade-in">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-pink-600 dark:text-pink-400">
                  Intimate Reflection Prompt:
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 italic leading-relaxed">
                  {card.subtext}
                </p>
                <p className="text-xs text-slate-400 pt-2">
                  Take your time. Listen without interrupting.
                </p>
              </div>
            )}
          </div>

          <div className="text-center pt-4">
            <span className="text-[10px] text-slate-400">
              Question for {partnerName} & You
            </span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendQuestion}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Chat 💬</span>
          </button>
        </div>
      </div>
    </div>
  );
};
