import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DailyAnswer, MoodCheckIn, CustomCoupleQuestion } from '../types';
import { getTodayQuestion } from '../utils/coupleData';
import { supabase } from '../lib/supabase';
import {
  dailyAnswerRowToDailyAnswer,
  moodRowToMoodCheckIn,
  customQuestionRowToCustomQuestion,
} from '../utils/supabaseMappers';
import {
  Smile,
  Sparkles,
  Heart,
  History,
  BookOpen,
  Bookmark,
  Calendar,
  Layers,
} from 'lucide-react';
import { DailyQuestionCard } from './daily/DailyQuestionCard';
import { DailyMoodSection } from './daily/DailyMoodSection';
import { MoodHistoryTimeline } from './daily/MoodHistoryTimeline';
import { QuestionHistoryArchive } from './daily/QuestionHistoryArchive';
import { QuestionVaultSection } from './daily/QuestionVaultSection';
import { CustomQuestionModal } from './daily/CustomQuestionModal';
import { QuestionPickerModal } from './daily/QuestionPickerModal';

export const DailyAndMoodView: React.FC = () => {
  const { userProfile, couple, partnerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'today' | 'mood_history' | 'question_archive' | 'vault'>('today');

  // Modals
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Supabase Data states
  const [todayDaily, setTodayDaily] = useState<DailyAnswer | null>(null);
  const [pastDailyAnswers, setPastDailyAnswers] = useState<DailyAnswer[]>([]);
  const [allMoods, setAllMoods] = useState<MoodCheckIn[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomCoupleQuestion[]>([]);

  const defaultQuestion = getTodayQuestion();
  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Listen to Today's Question & Answers document
  useEffect(() => {
    if (!coupleId) return;

    const fetchToday = async () => {
      const { data, error } = await supabase
        .from('daily_answers')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('date', todayStr)
        .maybeSingle();

      if (!error && data) {
        setTodayDaily(dailyAnswerRowToDailyAnswer(data));
      } else {
        setTodayDaily(null);
      }
    };

    fetchToday();

    const channel = supabase
      .channel(`daily_answers_today:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_answers',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchToday();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, todayStr]);

  // 2. Listen to Past Daily Answers
  useEffect(() => {
    if (!coupleId) return;

    const fetchPast = async () => {
      const { data, error } = await supabase
        .from('daily_answers')
        .select('*')
        .eq('couple_id', coupleId)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setPastDailyAnswers(data.map(dailyAnswerRowToDailyAnswer));
      }
    };

    fetchPast();

    const channel = supabase
      .channel(`daily_answers_past:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_answers',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchPast();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // 3. Listen to all Mood Check-Ins (with precise time and date)
  useEffect(() => {
    if (!coupleId) return;

    const fetchMoods = async () => {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setAllMoods(data.map(moodRowToMoodCheckIn));
      }
    };

    fetchMoods();

    const channel = supabase
      .channel(`moods:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moods',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchMoods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // 4. Listen to Custom Questions Vault
  useEffect(() => {
    if (!coupleId) return;

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
      .channel(`custom_questions:${coupleId}`)
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
  }, [coupleId]);

  // Derive latest moods
  const myLatestMood = allMoods.find((m) => m.userId === myUid) || null;
  const partnerLatestMood = allMoods.find((m) => m.userId === partnerUid) || null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-fraunces text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Smile className="w-5 h-5" />
            </div>
            <span>Daily Mood & Couple Question</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deepen emotional intimacy with rotating questions, custom prompts, and mood check-ins.
          </p>
        </div>

        {/* Quick Question Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPickerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shuffle Question</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Make Own Question</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'today'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Today's Connection</span>
        </button>

        <button
          onClick={() => setActiveTab('mood_history')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'mood_history'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4 text-rose-500" />
          <span>Mood Journey ({allMoods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('question_archive')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'question_archive'
              ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-500" />
          <span>Question Archive ({pastDailyAnswers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vault')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'vault'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span>Our Question Vault ({customQuestions.length})</span>
        </button>
      </div>

      {/* Tab 1: Today's Connection */}
      {activeTab === 'today' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Today's Question Card */}
          <DailyQuestionCard
            todayDaily={todayDaily}
            defaultQuestion={defaultQuestion}
            todayDocId={defaultQuestion.id}
            todayStr={todayStr}
            onOpenPicker={() => setIsPickerOpen(true)}
            onOpenCreate={() => setIsCreateOpen(true)}
          />

          {/* Advanced Mood Check-In & Pulse */}
          <DailyMoodSection
            partnerMood={partnerLatestMood}
            myLatestMood={myLatestMood}
            todayStr={todayStr}
          />
        </div>
      )}

      {/* Tab 2: Mood Journey & History */}
      {activeTab === 'mood_history' && (
        <div className="animate-in fade-in duration-200">
          <MoodHistoryTimeline moods={allMoods} />
        </div>
      )}

      {/* Tab 3: Question History Archive */}
      {activeTab === 'question_archive' && (
        <div className="animate-in fade-in duration-200">
          <QuestionHistoryArchive answers={pastDailyAnswers} />
        </div>
      )}

      {/* Tab 4: Question Vault */}
      {activeTab === 'vault' && (
        <div className="animate-in fade-in duration-200">
          <QuestionVaultSection
            customQuestions={customQuestions}
            todayDocId={defaultQuestion.id}
            todayStr={todayStr}
            onOpenCreateModal={() => setIsCreateOpen(true)}
          />
        </div>
      )}

      {/* Modals */}
      <QuestionPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        todayDocId={defaultQuestion.id}
        todayStr={todayStr}
        currentQuestionText={todayDaily?.questionText || defaultQuestion.question}
        onOpenCreateModal={() => setIsCreateOpen(true)}
      />

      <CustomQuestionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        todayDocId={defaultQuestion.id}
        todayStr={todayStr}
      />
    </div>
  );
};
export default DailyAndMoodView;
