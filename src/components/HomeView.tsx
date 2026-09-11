import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActiveTab, Memory, ImportantDate, Message, DailyAnswer, MoodCheckIn } from '../types';
import { calculateDaysTogether, getTodayQuestion, MOODS, THEMES } from '../utils/coupleData';
import { supabase, createSafeChannel } from '../lib/supabase';
import {
  memoryRowToMemory,
  dateRowToImportantDate,
  messageRowToMessage,
  dailyAnswerRowToDailyAnswer,
  moodRowToMoodCheckIn,
  moodToRow,
} from '../utils/supabaseMappers';
import {
  Heart,
  Calendar,
  MessageCircle,
  Camera,
  Mail,
  FileText,
  Sparkles,
  Smile,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  Gamepad2,
  ZoomIn,
  UserCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PartnerProfileModal } from './PartnerProfileModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { ChangePhotoModal } from './ChangePhotoModal';
import { DatingTimeModal } from './DatingTimeModal';
import { CoupleBirthdayModal } from './CoupleBirthdayModal';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { SanctuaryLoveCalculator } from './SanctuaryLoveCalculator';
import { SanctuaryBirthdayCard } from './SanctuaryBirthdayCard';
import { SanctuaryAchievementsCard } from './SanctuaryAchievementsCard';
import { PetNameCustomizerModal } from './PetNameCustomizerModal';
import { usePresence } from '../hooks/usePresence';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onQuickAction?: (action: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const {
    userProfile,
    couple,
    partnerProfile,
    updateCoupleSettings,
    updateUserProfileData,
    updatePartnerProfileData,
  } = useAuth();
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<ImportantDate[]>([]);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodCheckIn | null>(null);
  const [myMood, setMyMood] = useState<MoodCheckIn | null>(null);
  const [dailyData, setDailyData] = useState<DailyAnswer | null>(null);
  const [myDailyAnswer, setMyDailyAnswer] = useState('');
  const [answeringDaily, setAnsweringDaily] = useState(false);
  const [showPartnerProfile, setShowPartnerProfile] = useState(false);
  const [showDatingTimeModal, setShowDatingTimeModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPetNameModal, setShowPetNameModal] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    userName: string;
    isPartner: boolean;
  }>({
    isOpen: false,
    imageUrl: '',
    userName: '',
    isPartner: false,
  });
  const [changePhotoData, setChangePhotoData] = useState<{
    isOpen: boolean;
    target: 'user' | 'partner';
    targetName: string;
    currentPhotoUrl?: string;
  }>({
    isOpen: false,
    target: 'partner',
    targetName: '',
  });

  const daysTogether = calculateDaysTogether(couple?.anniversaryDate);
  const todayQuestion = getTodayQuestion();
  const themeKey = couple?.theme || 'rose';
  const theme = THEMES[themeKey] || THEMES.rose;

  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;

  // Real-time zero-lag online presence tracking
  const { isPartnerOnline, partnerStatusText } = usePresence({
    coupleId,
    myUid,
    partnerUid,
  });

  // Listen to couple's recent memories
  useEffect(() => {
    if (!coupleId) return;

    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setRecentMemories(data.map(memoryRowToMemory));
      }
    };

    fetchMemories();

    const channel = createSafeChannel(`home_memories:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` },
        () => {
          fetchMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Listen to upcoming dates
  useEffect(() => {
    if (!coupleId) return;

    const fetchDates = async () => {
      const { data, error } = await supabase
        .from('important_dates')
        .select('*')
        .eq('couple_id', coupleId)
        .order('date', { ascending: true })
        .limit(4);

      if (!error && data) {
        setUpcomingDates(data.map(dateRowToImportantDate));
      }
    };

    fetchDates();

    const channel = createSafeChannel(`home_dates:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'important_dates', filter: `couple_id=eq.${coupleId}` },
        () => {
          fetchDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Listen to last chat message
  useEffect(() => {
    if (!coupleId) return;

    const fetchLastMessage = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setLastMessage(messageRowToMessage(data[0]));
      }
    };

    fetchLastMessage();

    const channel = createSafeChannel(`home_messages:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `couple_id=eq.${coupleId}` },
        () => {
          fetchLastMessage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Listen to today's daily question & answers
  useEffect(() => {
    if (!coupleId) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const fetchDaily = async () => {
      const { data, error } = await supabase
        .from('daily_answers')
        .select('*')
        .eq('couple_id', coupleId)
        .eq('date', todayStr)
        .maybeSingle();

      if (!error && data) {
        setDailyData(dailyAnswerRowToDailyAnswer(data));
      } else {
        setDailyData(null);
      }
    };

    fetchDaily();

    const channel = createSafeChannel(`home_daily:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_answers', filter: `couple_id=eq.${coupleId}` },
        () => {
          fetchDaily();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, todayQuestion.id]);

  // Listen to moods for today
  useEffect(() => {
    if (!coupleId) return;
    const todayStr = new Date().toISOString().split('T')[0];

    const fetchMoods = async () => {
      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        data.forEach((row) => {
          const m = moodRowToMoodCheckIn(row);
          if (m.date === todayStr) {
            if (m.userId === myUid) setMyMood(m);
            if (m.userId === partnerUid) setPartnerMood(m);
          }
        });
      }
    };

    fetchMoods();

    const channel = createSafeChannel(`home_moods:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'moods', filter: `couple_id=eq.${coupleId}` },
        () => {
          fetchMoods();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, myUid, partnerUid]);

  // Handle daily answer submit
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myDailyAnswer.trim() || !coupleId || !myUid) return;
    setAnsweringDaily(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const existingAnswers = dailyData?.answers || {};

      const updatedAnswers = {
        ...existingAnswers,
        [myUid]: {
          answer: myDailyAnswer.trim(),
          answeredAt: new Date().toISOString(),
          userName: userProfile?.displayName,
        },
      };

      // Check if both answered to reveal!
      const partnerAnswered = partnerUid ? !!updatedAnswers[partnerUid] : false;
      const bothAnswered = partnerAnswered;

      const { error } = await supabase
        .from('daily_answers')
        .upsert(
          {
            couple_id: coupleId,
            date: todayStr,
            question_id: todayQuestion.id,
            question_text: dailyData?.questionText || todayQuestion.question,
            category: dailyData?.category || todayQuestion.category || 'romance',
            custom_author_id: dailyData?.customAuthorId || null,
            custom_author_name: dailyData?.customAuthorName || null,
            answers: updatedAnswers,
            is_revealed: bothAnswered,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'couple_id,date' }
        );

      if (error) throw error;

      setMyDailyAnswer('');

      if (bothAnswered) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setAnsweringDaily(false);
    }
  };

  const handleQuickMood = async (moodItem: typeof MOODS[0]) => {
    if (!coupleId || !myUid || !userProfile) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const row = moodToRow({
        coupleId,
        userId: myUid,
        userName: userProfile.displayName,
        userPhoto: userProfile.photoURL || '',
        mood: moodItem.id,
        emoji: moodItem.emoji,
        label: moodItem.label,
        note: `Feeling ${moodItem.label}`,
        tags: [moodItem.label],
        energyLevel: 5,
        time: formattedTime,
        date: todayStr,
        createdAt: now.toISOString(),
      });

      const { error } = await supabase.from('moods').insert(row);
      if (error) throw error;
    } catch (err) {
      console.error(err);
    }
  };

  // Birthday resolution for both partners
  const myBirthday =
    userProfile?.birthday ||
    (myUid ? couple?.birthdays?.[myUid] : undefined) ||
    couple?.partner1Birthday;
  const partnerBirthday =
    partnerProfile?.birthday ||
    (partnerUid ? couple?.birthdays?.[partnerUid] : undefined) ||
    couple?.birthdays?.['partner'] ||
    couple?.partner2Birthday;

  const handleSaveDatingTime = async (dateStr: string, timeStr: string) => {
    await updateCoupleSettings({
      anniversaryDate: dateStr,
      anniversaryTime: timeStr,
      datingStartDate: dateStr,
      datingStartTime: timeStr,
    });
  };

  const handleSaveBirthdays = async (data: {
    mode: 'both' | 'me_only' | 'partner_only';
    myBirthday?: string;
    partnerBirthday?: string;
  }) => {
    const updates: Record<string, any> = {};
    const currentBirthdays = { ...(couple?.birthdays || {}) };

    if (data.myBirthday) {
      await updateUserProfileData({ birthday: data.myBirthday });
      if (myUid) {
        currentBirthdays[myUid] = data.myBirthday;
      }
      updates.partner1Birthday = data.myBirthday;
    }

    if (data.partnerBirthday) {
      if (partnerUid) {
        try {
          await updatePartnerProfileData({ birthday: data.partnerBirthday });
        } catch {
          // ignore if partner profile not initialized yet
        }
        currentBirthdays[partnerUid] = data.partnerBirthday;
      }
      currentBirthdays['partner'] = data.partnerBirthday;
      updates.partner2Birthday = data.partnerBirthday;
    }

    updates.birthdays = currentBirthdays;
    await updateCoupleSettings(updates);
  };

  const handleSelectTheme = async (newTheme: string) => {
    await updateCoupleSettings({
      theme: newTheme as any,
    });
  };

  // Find next upcoming date
  const nextDate = upcomingDates[0];
  const nextDateCountdown = nextDate
    ? Math.ceil((new Date(nextDate.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Incomplete Setup Reminder Banner (if gender or petNameForPartner is missing) */}
      {(!userProfile?.petNameForPartner || !userProfile?.gender) && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-300/40 dark:border-pink-800/40 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>Personalize Your Sanctuary Profile</span>
                <span className="px-1.5 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-[10px]">Quick Setup</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {!userProfile?.petNameForPartner && !userProfile?.gender
                  ? "You haven't set a cute pet name or gender for your partner yet!"
                  : !userProfile?.petNameForPartner
                  ? "What cute pet name do you call your partner?"
                  : "Add your gender so your partner sees your identity!"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPetNameModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Customize Now 💕</span>
          </button>
        </div>
      )}

      {/* Hero Couple Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-lg bg-gradient-to-r ${theme.gradient}`}>
        {/* Subtle decorative heart watermarks */}
        <div className="absolute top-2 right-4 opacity-10 pointer-events-none">
          <Heart className="w-48 h-48 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Connected Avatars */}
            <div className="flex items-center -space-x-4">
              {/* User Avatar */}
              <div
                className="relative group cursor-pointer"
                title="Your profile picture - Click to view or change"
                onClick={() =>
                  setLightboxData({
                    isOpen: true,
                    imageUrl: userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`,
                    userName: userProfile?.displayName || 'Me',
                    isPartner: false,
                  })
                }
              >
                <img
                  src={userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`}
                  alt={userProfile?.displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/80 shadow-md object-cover bg-rose-100 group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 bg-emerald-400 w-4 h-4 rounded-full border-2 border-white" title="Online" />
                <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              {/* Partner Avatar */}
              <div
                className="relative group cursor-pointer"
                title={`Partner's profile (${partnerStatusText}) - Click to view info & photo`}
                onClick={() => setShowPartnerProfile(true)}
              >
                <img
                  src={partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`}
                  alt={partnerProfile?.displayName || 'Partner'}
                  referrerPolicy="no-referrer"
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 shadow-md object-cover bg-pink-100 group-hover:scale-105 transition-transform ${
                    isPartnerOnline ? 'border-emerald-300 ring-2 ring-emerald-400' : 'border-white/80'
                  }`}
                />
                <span
                  className={`absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full border-2 border-white ${
                    isPartnerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`}
                  title={partnerStatusText}
                />
                <span className="absolute -top-1 left-2 bg-white text-rose-500 rounded-full p-1 shadow-sm">
                  <Heart className="w-3 h-3 fill-rose-500" />
                </span>
                <div className="absolute inset-0 bg-black/25 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {/* Live Online / Offline Sync Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-xs mb-1 shadow-2xs ${
                    isPartnerOnline
                      ? 'bg-emerald-500/90 text-white border border-emerald-300/50'
                      : 'bg-white/20 text-white/90'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isPartnerOnline ? 'bg-white animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  <span>{isPartnerOnline ? 'Online Right Now • In Sanctuary' : partnerStatusText}</span>
                </span>

                {partnerProfile && (
                  <button
                    id="btn-home-view-partner-profile"
                    type="button"
                    onClick={() => setShowPartnerProfile(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 hover:bg-white/35 text-[11px] font-bold backdrop-blur-xs mb-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Partner Info</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowPetNameModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-500/80 hover:bg-pink-600/90 text-white text-[11px] font-bold backdrop-blur-xs mb-1 cursor-pointer transition-all shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Pet Names & Gender 💕</span>
                </button>
              </div>

              <h2
                onClick={() => partnerProfile && setShowPartnerProfile(true)}
                className="text-2xl sm:text-3xl font-display font-black tracking-tight cursor-pointer hover:opacity-95"
              >
                {userProfile?.nickname || userProfile?.displayName} & {partnerProfile?.nickname || partnerProfile?.displayName || 'Waiting for Partner'}
              </h2>
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start mt-1 text-white/90">
                {couple?.relationshipStatus && (
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    {couple.relationshipStatus.replace('_', ' ')}
                  </span>
                )}
                {(userProfile?.city || partnerProfile?.city) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-medium backdrop-blur-xs">
                    <MapPin className="w-2.5 h-2.5" />
                    {userProfile?.city && partnerProfile?.city && userProfile.city !== partnerProfile.city
                      ? `${userProfile.city} ⇄ ${partnerProfile.city}`
                      : userProfile?.city || partnerProfile?.city}
                  </span>
                )}
                {couple?.favoriteSong && (
                  <span className="text-[11px] text-white/90 truncate max-w-xs">
                    🎵 {couple.favoriteSong}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/90 mt-1 font-sans">
                {couple?.anniversaryDate ? (
                  <>Together since {new Date(couple.anniversaryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</>
                ) : (
                  <>Our Beautiful Journey</>
                )}
              </p>
            </div>
          </div>

          {/* Days Together Counter Pill */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 text-center min-w-[140px] border border-white/20 shadow-inner">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-white/80 block font-display">
              Days in Love
            </span>
            <div className="text-3xl sm:text-4xl font-romantic font-black tracking-tight text-white mt-0.5">
              {daysTogether}
            </div>
            <span className="text-[11px] text-white/90 font-medium font-sans">and counting forever ❤️</span>
          </div>
        </div>

        {/* Milestone Bar */}
        {nextDate && (
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              <span>
                Next milestone: <strong className="font-bold text-white">{nextDate.title}</strong> ({new Date(nextDate.date).toLocaleDateString()})
              </span>
            </div>
            <span className="bg-white/20 px-2.5 py-1 rounded-full font-semibold text-[11px]">
              {nextDateCountdown !== null && nextDateCountdown >= 0
                ? `${nextDateCountdown} days left`
                : 'Celebrating!'}
            </span>
          </div>
        )}
      </div>

      {/* You & Yours Sanctuary Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-pink-100 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 fill-pink-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                You & Yours Sanctuary Identity
              </h3>
              <p className="text-[11px] text-slate-400">
                Clear view of who you are and who your love is in the Sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPetNameModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customize Pet Names & Gender</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          {/* YOU Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-slate-800/80 border border-purple-200/60 dark:border-purple-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                YOU (Me)
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Now
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`}
                alt={userProfile?.displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-purple-300 dark:border-purple-700 bg-purple-100 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {userProfile?.displayName || 'You'}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  {userProfile?.petNameForSelf && (
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      Called "{userProfile.petNameForSelf}"
                    </span>
                  )}
                  {userProfile?.gender && (
                    <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-purple-100 dark:border-slate-700">
                      {userProfile.gender === 'female'
                        ? '👩 Female'
                        : userProfile.gender === 'male'
                        ? '👨 Male'
                        : userProfile.gender === 'non_binary'
                        ? '🌈 Non-Binary'
                        : '✨ Other'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* YOURS Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-slate-800/80 border border-pink-200/60 dark:border-pink-900/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                YOURS ({userProfile?.petNameForPartner || 'Your Shoona'})
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  isPartnerOnline
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {isPartnerOnline ? 'Online Right Now' : partnerStatusText}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`}
                alt={partnerProfile?.displayName || 'Partner'}
                className="w-11 h-11 rounded-full object-cover border-2 border-pink-300 dark:border-pink-700 bg-pink-100 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {partnerProfile?.displayName || 'Waiting for Partner'}
                </h4>
                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  <span className="font-semibold text-pink-700 dark:text-pink-300">
                    You call {partnerProfile?.gender === 'male' ? 'him' : partnerProfile?.gender === 'non_binary' ? 'them' : 'her'} "{userProfile?.petNameForPartner || 'Shoona'}" 💕
                  </span>
                  {partnerProfile?.gender && (
                    <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-pink-100 dark:border-slate-700">
                      {partnerProfile.gender === 'female'
                        ? '👩 Female'
                        : partnerProfile.gender === 'male'
                        ? '👨 Male'
                        : partnerProfile.gender === 'non_binary'
                        ? '🌈 Non-Binary'
                        : '✨ Other'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Sanctuary Love Calculator (Live Seconds, Overall Weeks, Deep Totals, Next Milestones) */}
      <SanctuaryLoveCalculator
        anniversaryDate={couple?.anniversaryDate}
        anniversaryTime={couple?.anniversaryTime || couple?.datingStartTime}
        themeKey={themeKey}
        onOpenDatingTimeModal={() => setShowDatingTimeModal(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
      />

      {/* Couple Birthdays & Zodiac Tracking */}
      <SanctuaryBirthdayCard
        myBirthday={myBirthday}
        partnerBirthday={partnerBirthday}
        myDisplayName={userProfile?.displayName || 'Me'}
        partnerDisplayName={partnerProfile?.displayName || 'Partner'}
        myPhotoUrl={userProfile?.photoURL}
        partnerPhotoUrl={partnerProfile?.photoURL}
        onOpenBirthdayModal={() => setShowBirthdayModal(true)}
      />

      {/* Saathi Achievements 69 Badges Banner */}
      <SanctuaryAchievementsCard onOpenAchievements={() => setActiveTab('achievements')} />

      {/* Couple Games & Pet Mochi Banner (Featured New System) */}
      <div
        onClick={() => setActiveTab('games')}
        className="p-5 rounded-3xl bg-gradient-to-r from-[#1b1019] via-[#241421] to-[#160f14] border border-[#ff3377]/30 shadow-lg hover:border-[#ff3377]/60 transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-4 text-white"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-[#160f14] rounded-[14px] flex items-center justify-center text-2xl">
              🦊
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff3377]/20 border border-[#ff3377]/40 text-[#ff4d8d] text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" /> 7 Games & Digital Pet
            </div>
            <h3 className="text-base sm:text-lg font-bold font-fraunces text-white">
              Play Couple Games & Feed Mochi
            </h3>
            <p className="text-xs text-neutral-400">
              Would You Rather, Never Have I Ever, How Well Do You Know Me, and daily pet companion quests.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-xl bg-[#ff3377] group-hover:bg-[#ff4d8d] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <Gamepad2 className="w-4 h-4" /> Play Now
        </button>
      </div>

      {/* Quick Action Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            id="action-chat"
            onClick={() => setActiveTab('chat')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Send Message</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Say something sweet</div>
            </div>
          </button>

          <button
            id="action-games"
            onClick={() => setActiveTab('games')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-pink-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-pink-300 dark:hover:border-pink-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Tic-Tac-Toe 💕</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Play with partner</div>
            </div>
          </button>

          <button
            id="action-achievements"
            onClick={() => setActiveTab('achievements')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Saathi Badges</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">69 Milestones</div>
            </div>
          </button>

          <button
            id="action-memory"
            onClick={() => setActiveTab('moments')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Add Memory</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Save a moment</div>
            </div>
          </button>

          <button
            id="action-letter"
            onClick={() => setActiveTab('letters')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Write Letter</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Seal with love</div>
            </div>
          </button>

          <button
            id="action-notes"
            onClick={() => setActiveTab('notes')}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white">Shared Notes</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Lists & ideas</div>
            </div>
          </button>
        </div>
      </div>

      {/* Mood Check-In & Today's Question Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Mood Check-In Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Daily Mood Check-In</h4>
            </div>
            <button
              onClick={() => setActiveTab('daily')}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
            >
              Details
            </button>
          </div>

          {/* Partner's Mood */}
          <div className="p-3.5 bg-rose-50/50 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">
              {partnerProfile?.displayName || 'Partner'}'s Mood Today
            </span>
            {partnerMood ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{partnerMood.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white capitalize">{partnerMood.mood}</div>
                  {partnerMood.note && <div className="text-xs text-slate-500 dark:text-slate-400 italic">"{partnerMood.note}"</div>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {partnerProfile?.displayName || 'Partner'} hasn't shared their mood yet today.
              </p>
            )}
          </div>

          {/* Quick Mood Selection for current user */}
          <div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {myMood ? `Your mood: ${myMood.emoji} ${myMood.mood}` : 'How are you feeling right now?'}
            </div>
            <div className="flex justify-between gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleQuickMood(m)}
                  className={`p-2 rounded-xl text-center flex-1 transition-all cursor-pointer ${
                    myMood?.mood === m.id
                      ? 'bg-rose-500 text-white shadow-xs scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={m.label}
                >
                  <span className="text-lg block">{m.emoji}</span>
                  <span className="text-[9px] font-semibold block mt-0.5">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Question Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-100 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Today's Question</h4>
                  {dailyData?.customAuthorName && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                      ★ By {dailyData.customAuthorName}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('daily')}
                className="text-[10px] font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full hover:bg-purple-100 cursor-pointer"
              >
                Change / Customize →
              </button>
            </div>

            <p className="font-editorial italic text-base sm:text-lg text-slate-800 dark:text-slate-100 mt-1 leading-relaxed bg-purple-50/40 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-purple-100 dark:border-slate-700/60">
              "{dailyData?.questionText || todayQuestion.question}"
            </p>
          </div>

          {/* Answers state */}
          {dailyData?.isRevealed ? (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Both answered! Here are your answers:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(dailyData.answers).map(([uid, item]) => {
                  const ans = item as { answer?: string; userName?: string };
                  return (
                    <div key={uid} className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-xs">
                      <span className="font-bold text-purple-800 dark:text-purple-300">
                        {uid === myUid ? 'You' : partnerProfile?.displayName || 'Partner'}:
                      </span>{' '}
                      <span className="text-slate-700 dark:text-slate-200">{ans.answer || ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : dailyData?.answers?.[myUid || ''] ? (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <strong className="font-bold">Your answer is sealed!</strong> Waiting for {partnerProfile?.displayName || 'partner'} to answer before revealing.
              </div>
            </div>
          ) : (
            <form onSubmit={handleAnswerSubmit} className="space-y-2">
              <input
                type="text"
                value={myDailyAnswer}
                onChange={(e) => setMyDailyAnswer(e.target.value)}
                placeholder="Write your secret answer..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                disabled={answeringDaily || !myDailyAnswer.trim()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                {answeringDaily ? 'Saving...' : 'Lock In Answer'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Recent Chat Snippet */}
      {lastMessage && (
        <div
          onClick={() => setActiveTab('chat')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-100 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>Latest Message</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                  {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                <strong className="font-semibold text-slate-700 dark:text-slate-300">{lastMessage.senderName}:</strong> {lastMessage.text || 'Shared media'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
        </div>
      )}

      {/* Recent Memories Polaroid Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Cherished Memories</h4>
          </div>
          <button
            onClick={() => setActiveTab('moments')}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentMemories.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <Camera className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-medium">No moments saved yet.</p>
            <button
              onClick={() => setActiveTab('moments')}
              className="mt-2 text-xs font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Add your first photo memory together
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentMemories.map((mem) => (
              <div
                key={mem.id}
                onClick={() => setActiveTab('moments')}
                className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer bg-slate-50 dark:bg-slate-800"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  {mem.mediaUrls?.[0] ? (
                    <img
                      src={mem.mediaUrls[0]}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-50 dark:bg-slate-800 text-rose-300">
                      <Heart className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{mem.title}</h5>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>{new Date(mem.date).toLocaleDateString()}</span>
                    {mem.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {mem.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner Profile Modal */}
      <PartnerProfileModal
        isOpen={showPartnerProfile}
        onClose={() => setShowPartnerProfile(false)}
        setActiveTab={setActiveTab}
      />

      {/* High-Res Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        userName={lightboxData.userName}
        isPartner={lightboxData.isPartner}
        onChangePhoto={() => {
          setLightboxData((prev) => ({ ...prev, isOpen: false }));
          setChangePhotoData({
            isOpen: true,
            target: lightboxData.isPartner ? 'partner' : 'user',
            targetName: lightboxData.userName,
            currentPhotoUrl: lightboxData.imageUrl,
          });
        }}
      />

      {/* Change Photo Modal */}
      <ChangePhotoModal
        isOpen={changePhotoData.isOpen}
        onClose={() => setChangePhotoData((prev) => ({ ...prev, isOpen: false }))}
        target={changePhotoData.target}
        targetName={changePhotoData.targetName}
        currentPhotoUrl={changePhotoData.currentPhotoUrl}
      />

      {/* Dating Time Modal */}
      <DatingTimeModal
        isOpen={showDatingTimeModal}
        onClose={() => setShowDatingTimeModal(false)}
        currentDate={couple?.anniversaryDate}
        currentTime={couple?.anniversaryTime || couple?.datingStartTime || '12:00'}
        onSave={handleSaveDatingTime}
      />

      {/* Couple Birthday Modal */}
      <CoupleBirthdayModal
        isOpen={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        myCurrentBirthday={myBirthday}
        partnerCurrentBirthday={partnerBirthday}
        myDisplayName={userProfile?.displayName || 'Me'}
        partnerDisplayName={partnerProfile?.displayName || 'Partner'}
        onSave={handleSaveBirthdays}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={themeKey}
        onSelectTheme={handleSelectTheme}
      />

      {/* Pet Name & Gender Customizer Modal */}
      <PetNameCustomizerModal
        isOpen={showPetNameModal}
        onClose={() => setShowPetNameModal(false)}
      />
    </div>
  );
};
