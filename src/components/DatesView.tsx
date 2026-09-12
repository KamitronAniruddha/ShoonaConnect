import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ImportantDate } from '../types';
import { supabase } from '../lib/supabase';
import { dateRowToImportantDate, dateToRow } from '../utils/supabaseMappers';
import {
  Calendar as CalendarIcon,
  Plus,
  Heart,
  Clock,
  Gift,
  Plane,
  Sparkles,
  Repeat,
  Trash2,
  Edit2,
  X,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Share2,
  Flame,
  CheckCircle2,
  MapPin,
  Bookmark,
  CalendarDays,
  ListFilter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendarExport';

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  anniversary: {
    label: 'Anniversary 💍',
    icon: Heart,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-900/50',
  },
  birthday: {
    label: 'Birthday 🎂',
    icon: Gift,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900/50',
  },
  first_kiss: {
    label: 'First Kiss 💋',
    icon: Sparkles,
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-900/50',
  },
  first_date: {
    label: 'First Date 🥂',
    icon: CalendarIcon,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-900/50',
  },
  first_met: {
    label: 'First Met 🌟',
    icon: Sparkles,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-900/50',
  },
  trip: {
    label: 'Romantic Trip ✈️',
    icon: Plane,
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-200 dark:border-sky-900/50',
  },
  date_night: {
    label: 'Date Night 🍷',
    icon: Sparkles,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-900/50',
  },
  milestone: {
    label: 'Milestone 🏆',
    icon: Heart,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900/50',
  },
  dream: {
    label: 'Dream Wishlist 💭',
    icon: Bookmark,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-900/50',
  },
  other: {
    label: 'Special Day 📌',
    icon: Clock,
    color: 'text-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-700',
  },
};

export const DatesView: React.FC = () => {
  const { couple, userProfile } = useAuth();
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar' | 'list'>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null);
  const [expandedDateId, setExpandedDateId] = useState<string | null>(null);
  const [expandedBreakdownId, setExpandedBreakdownId] = useState<string | null>(null);

  // Live timer tick for high-precision countdown
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Form states
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('');
  const [category, setCategory] = useState<ImportantDate['category']>('anniversary');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [giftIdeas, setGiftIdeas] = useState('');
  const [celebrationPlan, setCelebrationPlan] = useState('');
  const [saving, setSaving] = useState(false);

  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const coupleId = couple?.id;

  // Listen to important dates
  useEffect(() => {
    if (!coupleId) return;

    const fetchDates = async () => {
      const { data, error } = await supabase
        .from('important_dates')
        .select('*')
        .eq('couple_id', coupleId)
        .order('date', { ascending: true });

      if (!error && data) {
        setDates(data.map(dateRowToImportantDate));
      }
    };

    fetchDates();

    const channel = supabase
      .channel(`important_dates:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'important_dates',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Calculate precise countdown
  const getPreciseCountdown = (targetDateStr: string, timeStr?: string, recurring = true) => {
    const orig = new Date(targetDateStr);
    let target = new Date(orig.getFullYear(), orig.getMonth(), orig.getDate());

    if (timeStr) {
      const [h, m] = timeStr.split(':');
      target.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
    } else {
      target.setHours(0, 0, 0, 0);
    }

    if (recurring) {
      target.setFullYear(now.getFullYear());
      if (target.getTime() < now.getTime()) {
        target.setFullYear(now.getFullYear() + 1);
      }
    }

    const diff = target.getTime() - now.getTime();
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

    const isToday = days === 0 && target.getDate() === now.getDate() && target.getMonth() === now.getMonth();

    return {
      days,
      hours,
      minutes,
      seconds,
      isToday,
      isPast,
      targetDate: target,
    };
  };

  const openAddModal = (presetTitle?: string, presetCat?: ImportantDate['category']) => {
    setEditingDate(null);
    setTitle(presetTitle || '');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('19:00');
    setCategory(presetCat || 'anniversary');
    setDescription('');
    setIsRecurring(true);
    setReminderDays(7);
    setGiftIdeas('');
    setCelebrationPlan('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ImportantDate) => {
    setEditingDate(item);
    setTitle(item.title);
    setEventDate(item.date);
    setEventTime(item.time || '');
    setCategory(item.category);
    setDescription(item.description || '');
    setIsRecurring(item.isRecurring);
    setReminderDays(item.reminderDays || 7);
    setGiftIdeas(item.giftIdeas || '');
    setCelebrationPlan(item.celebrationPlan || '');
    setIsModalOpen(true);
  };

  const handleSaveDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !title.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<ImportantDate> = {
        coupleId,
        title: title.trim(),
        date: eventDate,
        time: eventTime || undefined,
        category,
        description: description.trim(),
        isRecurring,
        reminderDays: Number(reminderDays),
        giftIdeas: giftIdeas.trim() || undefined,
        celebrationPlan: celebrationPlan.trim() || undefined,
        icon: category,
        createdBy: userProfile?.uid,
        createdAt: editingDate?.createdAt || new Date().toISOString(),
      };

      if (editingDate) {
        const { error } = await supabase
          .from('important_dates')
          .update(dateToRow(payload))
          .eq('id', editingDate.id)
          .eq('couple_id', coupleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('important_dates')
          .insert(dateToRow(payload));
        if (error) throw error;
        confetti({ particleCount: 70, spread: 60 });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving date:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!coupleId) return;
    if (!confirm('Are you sure you want to delete this special date?')) return;
    try {
      await supabase
        .from('important_dates')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);
      if (expandedDateId === id) setExpandedDateId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Synthesize dynamic dates from couple profiles (Anniversary + Partner Birthdays)
  const synthesizedDates: ImportantDate[] = [];

  if (couple) {
    if (couple.anniversaryDate) {
      synthesizedDates.push({
        id: 'anniversary-couple',
        coupleId: couple.id,
        title: `${couple.coupleName || 'Our'} Anniversary 💍`,
        date: couple.anniversaryDate,
        time: couple.anniversaryTime || '12:00',
        category: 'anniversary',
        isRecurring: true,
        reminderDays: 7,
        description: 'The magical day our private couple sanctuary began!',
        createdAt: new Date().toISOString()
      });
    }

    const partnerNames = couple.userNames || {};
    const keys = Object.keys(partnerNames);

    if (couple.partner1Birthday) {
      const p1Id = couple.creatorId;
      const p1Name = partnerNames[p1Id] || 'Partner 1';
      synthesizedDates.push({
        id: 'birthday-p1',
        coupleId: couple.id,
        title: `${p1Name}'s Birthday 🎂`,
        date: couple.partner1Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: `Celebrating the birth of the most beautiful soul: ${p1Name}! 🎉`,
        createdAt: new Date().toISOString()
      });
    }

    if (couple.partner2Birthday) {
      const p2Id = couple.partnerId || keys.find(k => k !== couple.creatorId);
      const p2Name = p2Id ? partnerNames[p2Id] || 'Partner 2' : 'Partner 2';
      synthesizedDates.push({
        id: 'birthday-p2',
        coupleId: couple.id,
        title: `${p2Name}'s Birthday 🎂`,
        date: couple.partner2Birthday,
        time: '00:00',
        category: 'birthday',
        isRecurring: true,
        reminderDays: 7,
        description: `Celebrating the birth of the most beautiful soul: ${p2Name}! 🎉`,
        createdAt: new Date().toISOString()
      });
    }
  }

  // Sort dates by upcoming days remaining
  const allDatesIncludingSynthesized = [...dates, ...synthesizedDates];
  const sortedDates = allDatesIncludingSynthesized.sort((a, b) => {
    const cdA = getPreciseCountdown(a.date, a.time, a.isRecurring);
    const cdB = getPreciseCountdown(b.date, b.time, b.isRecurring);
    return cdA.targetDate.getTime() - cdB.targetDate.getTime();
  });

  const activeReminders = sortedDates.filter((item) => {
    const cd = getPreciseCountdown(item.date, item.time, item.isRecurring);
    if (cd.isPast || cd.isToday) return false;
    return cd.days <= (item.reminderDays || 7);
  });

  const filteredDates = sortedDates.filter((d) => {
    if (selectedCategory === 'all') return true;
    return d.category === selectedCategory;
  });

  const nextMilestone = sortedDates[0];
  const nextCountdown = nextMilestone
    ? getPreciseCountdown(nextMilestone.date, nextMilestone.time, nextMilestone.isRecurring)
    : null;

  // Calendar generation helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const { firstDay, totalDays } = getDaysInMonth(calendarMonth);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-28 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <CalendarIcon className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Important Dates & Milestones Storer
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time countdown clocks, gift ideas tracker, celebration itineraries, and calendar sync.
          </p>
        </div>

        <button
          id="btn-add-date"
          type="button"
          onClick={() => openAddModal()}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Save Special Date
        </button>
      </div>

      {/* FEATURED NEXT COUNTDOWN BANNER (LIVE TICKING) */}
      {nextMilestone && nextCountdown && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-current text-yellow-300" />
                <span>Next Couple Celebration</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{nextMilestone.title}</h3>
              <p className="text-xs text-white/90 flex items-center justify-center md:justify-start gap-2">
                <span>
                  {nextCountdown.targetDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {nextMilestone.time && <span>• {nextMilestone.time}</span>}
                {nextMilestone.isRecurring && <span>(Repeats Yearly)</span>}
              </p>
            </div>

            {/* Live Countdown Ticker */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {[
                { label: 'Days', val: nextCountdown.days },
                { label: 'Hours', val: nextCountdown.hours },
                { label: 'Mins', val: nextCountdown.minutes },
                { label: 'Secs', val: nextCountdown.seconds },
              ].map((slot) => (
                <div
                  key={slot.label}
                  className="w-16 sm:w-20 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/25 text-center"
                >
                  <span className="text-2xl sm:text-3xl font-black block leading-none font-mono">
                    {String(slot.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider block mt-1">
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RELATIONSHIP REMINDERS HUB */}
      {activeReminders.length > 0 && (
        <div className="bg-[#fff9fa] dark:bg-[#1a0e14] border-2 border-rose-300 dark:border-rose-950 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500 animate-bounce-subtle">
              <Bell className="w-5 h-5 text-rose-500" />
            </span>
            <div>
              <h4 className="text-sm font-black text-rose-950 dark:text-rose-100 uppercase tracking-wider flex items-center gap-1.5">
                Relationship Reminders Hub 💝
              </h4>
              <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                You have {activeReminders.length} active countdown alert{activeReminders.length > 1 ? 's' : ''} with customized reminder windows!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeReminders.map((item) => {
              const cd = getPreciseCountdown(item.date, item.time, item.isRecurring);
              const totalWindow = item.reminderDays || 7;
              const progressPercent = Math.max(0, Math.min(100, ((totalWindow - cd.days) / totalWindow) * 100));
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;

              return (
                <div
                  key={`reminder-${item.id}`}
                  className="bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl p-4 space-y-3 shadow-xs hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{cfg.label.split(' ')[1] || '📌'}</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white truncate max-w-[140px]">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      In {cd.days} Day{cd.days !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Real-time Ticking Ticker with Days, Hours, Minutes, Seconds */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-rose-50/50 dark:bg-rose-950/20 rounded-xl py-2 px-1.5 border border-rose-100/50 dark:border-rose-950/30">
                    <div>
                      <span className="text-sm font-black text-slate-800 dark:text-white font-mono block">
                        {String(cd.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block">DAYS</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 dark:text-white font-mono block">
                        {String(cd.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block">HRS</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800 dark:text-white font-mono block">
                        {String(cd.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 block">MINS</span>
                    </div>
                    <div>
                      <span className="text-sm font-black text-rose-500 font-mono block animate-pulse">
                        {String(cd.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-bold text-rose-400 block">SECS</span>
                    </div>
                  </div>

                  {/* Visual Progress gauge based on customized reminderDays */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                      <span>Window: {totalWindow}d</span>
                      <span>{Math.round(progressPercent)}% Passed</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Add Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Quick Add:</span>
        {[
          { title: 'Our Anniversary', cat: 'anniversary' as const, emoji: '💍' },
          { title: 'First Kiss', cat: 'first_kiss' as const, emoji: '💋' },
          { title: 'First Date', cat: 'first_date' as const, emoji: '🥂' },
          { title: 'The Day We Met', cat: 'first_met' as const, emoji: '🌟' },
          { title: 'Dream Vacation', cat: 'trip' as const, emoji: '✈️' },
        ].map((preset) => (
          <button
            key={preset.title}
            type="button"
            onClick={() => openAddModal(preset.title, preset.cat)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-rose-300 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            <span>{preset.emoji}</span>
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* View Switcher & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Milestones ({dates.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const count = dates.filter((d) => d.category === key).length;
            if (count === 0 && selectedCategory !== key) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === key
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Countdowns
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Calendar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* 1. COUNTDOWN CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDates.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-slate-800 p-8 space-y-3">
              <CalendarIcon className="w-12 h-12 text-rose-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-white">No dates found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Add your relationship milestones to track the countdown to every magical anniversary!
              </p>
              <button
                type="button"
                onClick={() => openAddModal()}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Add Milestone Now
              </button>
            </div>
          ) : (
            filteredDates.map((item) => {
              const cd = getPreciseCountdown(item.date, item.time, item.isRecurring);
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
              const Icon = cfg.icon;
              const isExpanded = expandedDateId === item.id;
              const isBreakdownExpanded = expandedBreakdownId === item.id;
              const isVirtual = item.id.startsWith('anniversary') || item.id.startsWith('birthday');

              // Advanced breakdowns
              const absDiff = Math.abs(cd.targetDate.getTime() - now.getTime());
              const totalWeeks = Math.floor(absDiff / (1000 * 60 * 60 * 24 * 7));
              const totalHours = Math.floor(absDiff / (1000 * 60 * 60));
              const totalMinutes = Math.floor(absDiff / (1000 * 60));
              const totalSeconds = Math.floor(absDiff / 1000);

              // Cycle Progress bar (only for recurring events)
              let yearProgress = 0;
              if (item.isRecurring) {
                const targetYear = cd.targetDate.getFullYear();
                const lastYearDate = new Date(cd.targetDate);
                lastYearDate.setFullYear(targetYear - 1);
                
                const totalCycleTime = cd.targetDate.getTime() - lastYearDate.getTime();
                const elapsedCycleTime = now.getTime() - lastYearDate.getTime();
                yearProgress = Math.min(100, Math.max(0, (elapsedCycleTime / totalCycleTime) * 100));
              }

              // Next 3 occurrences
              const occurrences: { year: number; weekday: string }[] = [];
              const origDate = new Date(item.date);
              const baseYear = now.getFullYear();
              for (let i = 0; i < 3; i++) {
                const occYear = baseYear + i;
                const occDate = new Date(occYear, origDate.getMonth(), origDate.getDate());
                occurrences.push({
                  year: occYear,
                  weekday: occDate.toLocaleDateString(undefined, { weekday: 'long' })
                });
              }

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-2xl ${cfg.bg} ${cfg.color} flex items-center justify-center border ${cfg.border}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {cfg.label}
                            </span>
                            {isVirtual && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/35 text-rose-500 text-[8px] font-bold uppercase tracking-wide">
                                Profile Sync 🔄
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isVirtual ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">Auto-sync</span>
                        )}
                      </div>
                    </div>

                    {/* Date info */}
                    <div className="my-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: item.isRecurring ? undefined : 'numeric',
                        })}
                      </span>
                      {item.isRecurring && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                          <Repeat className="w-3 h-3" /> Yearly
                        </span>
                      )}
                      {item.time && <span>• {item.time}</span>}
                    </div>

                    {/* Active Reminder Alert inside Card */}
                    {!cd.isPast && !cd.isToday && cd.days <= (item.reminderDays || 7) && (
                      <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1.5 animate-pulse-subtle">
                        <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Reminder Alert: {cd.days} day{cd.days !== 1 ? 's' : ''} left! 🔔</span>
                      </div>
                    )}

                    {/* Countdown Display */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 my-2">
                      {cd.isToday ? (
                        <div className="text-center py-1">
                          <span className="text-lg font-black text-rose-500 animate-pulse block">
                            🎉 Celebrating Today! ❤️
                          </span>
                          <span className="text-[10px] text-rose-400 font-semibold">
                            Happy {item.title}!
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-1 text-center items-center">
                          <div>
                            <span className="text-lg font-black text-slate-800 dark:text-white font-mono block">
                              {cd.days}
                            </span>
                            <span className="text-[8px] uppercase font-bold text-slate-400 block">
                              Days
                            </span>
                          </div>
                          <div>
                            <span className="text-lg font-black text-slate-800 dark:text-white font-mono block">
                              {cd.hours}
                            </span>
                            <span className="text-[8px] uppercase font-bold text-slate-400 block">
                              Hours
                            </span>
                          </div>
                          <div>
                            <span className="text-lg font-black text-slate-800 dark:text-white font-mono block">
                              {cd.minutes}
                            </span>
                            <span className="text-[8px] uppercase font-bold text-slate-400 block">
                              Mins
                            </span>
                          </div>
                          <div>
                            <span className="text-lg font-black text-rose-500 dark:text-rose-400 font-mono block animate-pulse">
                              {cd.seconds}
                            </span>
                            <span className="text-[8px] uppercase font-bold text-slate-400 block">
                              Secs
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description if present */}
                    {item.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 my-2 italic">
                        "{item.description}"
                      </p>
                    )}

                    {/* Advanced Breakdown Toggle Button */}
                    <div className="my-2.5">
                      <button
                        type="button"
                        onClick={() => setExpandedBreakdownId(isBreakdownExpanded ? null : item.id)}
                        className="w-full py-1 px-3 rounded-lg border border-rose-100 dark:border-slate-800 bg-rose-50/20 dark:bg-slate-800/40 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50/55 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Clock className="w-3 h-3" />
                        <span>{isBreakdownExpanded ? 'Hide Advanced Analytics' : 'Show Advanced Analytics & Depth'}</span>
                      </button>
                    </div>

                    {/* Advanced Countdown Analytics & Progression Gauge */}
                    {isBreakdownExpanded && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/45 border border-slate-100 dark:border-slate-800 space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
                        {/* Progressive Gauge */}
                        {item.isRecurring && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span className="font-bold uppercase tracking-wider">Yearly Progress Cycle</span>
                              <span className="font-mono text-rose-500">{yearProgress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                style={{ width: `${yearProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Precise Math metrics */}
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-slate-400 block">Total Weeks</span>
                            <span className="font-black text-slate-800 dark:text-neutral-200 font-mono text-xs">{totalWeeks.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-slate-400 block">Total Hours</span>
                            <span className="font-black text-slate-800 dark:text-neutral-200 font-mono text-xs">{totalHours.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-slate-400 block">Total Minutes</span>
                            <span className="font-black text-slate-800 dark:text-neutral-200 font-mono text-xs">{totalMinutes.toLocaleString()}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-slate-400 block">Total Seconds</span>
                            <span className="font-black text-rose-500 font-mono text-xs">{totalSeconds.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Future Occurrences */}
                        <div className="space-y-1 border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Milestone Depth & Next Weekdays:
                          </span>
                          <div className="space-y-1 text-[10px]">
                            {occurrences.map((occ, oIdx) => (
                              <div key={oIdx} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">Year {occ.year}</span>
                                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-500">
                                  {occ.weekday}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expandable Gift & Celebration Notes */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs animate-in fade-in">
                        {item.giftIdeas && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                            <span className="font-bold block flex items-center gap-1">
                              <Gift className="w-3.5 h-3.5" /> Gift Ideas:
                            </span>
                            <p className="mt-0.5 whitespace-pre-wrap">{item.giftIdeas}</p>
                          </div>
                        )}

                        {item.celebrationPlan && (
                          <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 text-purple-900 dark:text-purple-200">
                            <span className="font-bold block flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> Celebration Plan:
                            </span>
                            <p className="mt-0.5 whitespace-pre-wrap">{item.celebrationPlan}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 text-xs">
                    {(item.giftIdeas || item.celebrationPlan) ? (
                      <button
                        type="button"
                        onClick={() => setExpandedDateId(isExpanded ? null : item.id)}
                        className="text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Hide Notes' : 'View Notes & Gifts'}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No notes added</span>
                    )}

                    <div className="flex items-center gap-2">
                      <a
                        href={generateGoogleCalendarUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        title="Add to Google Calendar"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(item)}
                        title="Download .ICS file"
                        className="p-1 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. CALENDAR MONTH VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                }
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                }
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 py-1 border-b border-slate-100 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[70px] p-1 opacity-20" />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const dayNum = i + 1;
              const cellMonth = calendarMonth.getMonth();
              const isToday =
                now.getDate() === dayNum &&
                now.getMonth() === cellMonth &&
                now.getFullYear() === calendarMonth.getFullYear();

              const dayEvents = dates.filter((d) => {
                const orig = new Date(d.date);
                if (d.isRecurring) {
                  return orig.getDate() === dayNum && orig.getMonth() === cellMonth;
                }
                return (
                  orig.getDate() === dayNum &&
                  orig.getMonth() === cellMonth &&
                  orig.getFullYear() === calendarMonth.getFullYear()
                );
              });

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border transition-colors flex flex-col justify-between ${
                    isToday
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400'
                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="space-y-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => openEditModal(ev)}
                        className="px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold truncate cursor-pointer hover:scale-105 transition-transform"
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
          {filteredDates.map((item) => {
            const cd = getPreciseCountdown(item.date, item.time, item.isRecurring);
            const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;
            const Icon = cfg.icon;

            return (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: item.isRecurring ? undefined : 'numeric',
                      })}
                      {item.isRecurring && ' • Repeats Yearly'}
                      {item.time && ` • ${item.time}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    {cd.isToday ? (
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full animate-pulse">
                        Today! 🎉
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5 select-none">
                        <span className="text-xs font-black text-rose-500 dark:text-rose-400 font-mono">
                          {cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                          Remaining
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingDate ? 'Edit Milestone Date' : 'Save Special Milestone Date'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2nd Anniversary, First Date at Seaside Cafe..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Repeats Yearly (Annual celebration)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Inside Memory
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes on how special this date is..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Gift Ideas Storer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-500" /> Gift Ideas Storer (Wishlist & Hints)
                </label>
                <textarea
                  rows={2}
                  value={giftIdeas}
                  onChange={(e) => setGiftIdeas(e.target.value)}
                  placeholder="What gifts to give or subtle hints dropped..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Celebration Plan Itinerary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Celebration Plan & Itinerary
                </label>
                <textarea
                  rows={2}
                  value={celebrationPlan}
                  onChange={(e) => setCelebrationPlan(e.target.value)}
                  placeholder="Dinner reservations, surprise plans, outfits..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingDate ? 'Update Date' : 'Save Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
