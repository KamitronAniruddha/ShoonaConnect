import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, createSafeChannel } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { playWinSound } from '../utils/gameAudio';
import {
  Sparkles,
  Plus,
  Heart,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Compass,
  Plane,
  Home,
  Baby,
  Flame,
  Award,
  Calendar,
  DollarSign,
  Lock,
  Search,
  Filter,
  Share2,
  Edit3,
  Star,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye,
  MessageSquare,
  Bookmark,
} from 'lucide-react';

export interface DreamGoal {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  category: 'marriage' | 'home' | 'intimacy' | 'baby' | 'travel' | 'custom';
  status: 'dreaming' | 'in_progress' | 'fulfilled';
  targetDate?: string;
  targetBudget?: string;
  secretNote?: string;
  photoUrl?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  fulfilledAt?: string;
  fulfilledBy?: string;
}

const DREAM_CATEGORIES = [
  { id: 'all', label: 'All Dreams', icon: Sparkles, color: 'from-rose-500 to-pink-500', badgeBg: 'bg-rose-100 text-rose-700' },
  { id: 'marriage', label: 'Marriage & Proposal 💍', icon: Heart, color: 'from-amber-500 to-rose-500', badgeBg: 'bg-amber-100 text-amber-800' },
  { id: 'home', label: 'Dream Home & Living 🏡', icon: Home, color: 'from-emerald-500 to-teal-600', badgeBg: 'bg-emerald-100 text-emerald-800' },
  { id: 'intimacy', label: 'Intimacy & Romance 🔥', icon: Flame, color: 'from-purple-500 to-rose-600', badgeBg: 'bg-purple-100 text-purple-800' },
  { id: 'baby', label: 'Baby & Family 👶', icon: Baby, color: 'from-sky-500 to-indigo-600', badgeBg: 'bg-sky-100 text-sky-800' },
  { id: 'travel', label: 'Travel & Trips ✈️', icon: Plane, color: 'from-blue-500 to-cyan-600', badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'custom', label: 'Custom Goals ✨', icon: Award, color: 'from-fuchsia-500 to-pink-600', badgeBg: 'bg-fuchsia-100 text-fuchsia-800' },
];

const PRESET_DAYDREAMS = [
  {
    title: 'Write & Exchange Private Wedding Vows 💍',
    category: 'marriage',
    description: 'Compose custom written vows under a candlelit sky and seal them in our love sanctuary.',
    photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    targetDate: 'Wedding Day',
  },
  {
    title: 'Build Our Sunlit Sanctuary Home & Garden 🏡',
    category: 'home',
    description: 'Decorate our dream house with cozy reading nooks, outdoor fairy lights, and warm breakfasts.',
    photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    targetDate: 'Future Home',
  },
  {
    title: '3-Day Phone-Free Romantic Spa Getaway 🔥',
    category: 'intimacy',
    description: 'Disconnect from the world for 72 hours of sensual couple massages, hot tubs, and deep intimacy.',
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    targetDate: 'Next Vacation',
  },
  {
    title: 'Create Our Secret Baby Names Notebook 👶',
    category: 'baby',
    description: 'Curate a private list of middle names, bedtime lullabies, and sweet family traditions.',
    photoUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    targetDate: 'Family Planning',
  },
  {
    title: 'Stargaze from a Glass Igloo in Lapland ✈️',
    category: 'travel',
    description: 'Sleep under the Northern Lights bundled up in cozy blankets drinking hot cocoa.',
    photoUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    targetDate: 'Winter Trip',
  },
];

export const DreamsAndGoalsView: React.FC = () => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const coupleId = couple?.id;

  const [dreams, setDreams] = useState<DreamGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'dreaming' | 'in_progress' | 'fulfilled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<DreamGoal | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<DreamGoal['category']>('marriage');
  const [formStatus, setFormStatus] = useState<DreamGoal['status']>('dreaming');
  const [formDescription, setFormDescription] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formTargetBudget, setFormTargetBudget] = useState('');
  const [formSecretNote, setFormSecretNote] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');

  // Selected Detail Modal
  const [selectedDream, setSelectedDream] = useState<DreamGoal | null>(null);

  // Helper to parse stored description JSON or legacy plain text
  const parseDescriptionPayload = (rawDesc: string = ''): { text: string; date?: string; budget?: string; note?: string } => {
    try {
      if (rawDesc.startsWith('{') && rawDesc.endsWith('}')) {
        const parsed = JSON.parse(rawDesc);
        return {
          text: parsed.text || '',
          date: parsed.date || '',
          budget: parsed.budget || '',
          note: parsed.note || '',
        };
      }
    } catch {
      // ignore
    }
    return { text: rawDesc };
  };

  const serializeDescriptionPayload = (text: string, date?: string, budget?: string, note?: string) => {
    return JSON.stringify({
      text: text.trim(),
      date: date?.trim() || '',
      budget: budget?.trim() || '',
      note: note?.trim() || '',
    });
  };

  // Fetch Dreams from Supabase
  const fetchDreams = async () => {
    if (!coupleId) return;
    try {
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dreams:', error);
        return;
      }

      if (data) {
        const mapped: DreamGoal[] = data.map((row) => {
          const payload = parseDescriptionPayload(row.description);
          let rawStatus: DreamGoal['status'] = 'dreaming';
          if (row.is_completed) {
            rawStatus = 'fulfilled';
          } else if (row.status === 'in-progress' || row.category?.includes('progress')) {
            rawStatus = 'in_progress';
          }

          let cat = (row.category || 'marriage').toLowerCase();
          if (!['marriage', 'home', 'intimacy', 'baby', 'travel', 'custom'].includes(cat)) {
            cat = 'custom';
          }

          return {
            id: row.id,
            coupleId: row.couple_id,
            title: row.title,
            description: payload.text,
            category: cat as DreamGoal['category'],
            status: rawStatus,
            targetDate: payload.date,
            targetBudget: payload.budget,
            secretNote: payload.note,
            photoUrl: row.photo_url || undefined,
            createdBy: row.created_by,
            createdByName: row.created_by_name || (row.created_by === userProfile?.uid ? userProfile?.displayName : partnerProfile?.displayName),
            createdAt: row.created_at,
            fulfilledAt: row.completed_at || undefined,
          };
        });

        setDreams(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDreams();

    if (!coupleId) return;

    const channel = createSafeChannel(`dreams_realtime:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bucket_list', filter: `couple_id=eq.${coupleId}` },
        () => fetchDreams()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Open modal for creating or editing
  const handleOpenModal = (dream?: DreamGoal) => {
    if (dream) {
      setEditingDream(dream);
      setFormTitle(dream.title);
      setFormCategory(dream.category);
      setFormStatus(dream.status);
      setFormDescription(dream.description);
      setFormTargetDate(dream.targetDate || '');
      setFormTargetBudget(dream.targetBudget || '');
      setFormSecretNote(dream.secretNote || '');
      setFormPhotoUrl(dream.photoUrl || '');
    } else {
      setEditingDream(null);
      setFormTitle('');
      setFormCategory('marriage');
      setFormStatus('dreaming');
      setFormDescription('');
      setFormTargetDate('');
      setFormTargetBudget('');
      setFormSecretNote('');
      setFormPhotoUrl('');
    }
    setIsModalOpen(true);
  };

  // Add preset inspiration with 1 click
  const handleAddPreset = async (preset: (typeof PRESET_DAYDREAMS)[0]) => {
    if (!coupleId || !userProfile) return;
    try {
      const payload = {
        couple_id: coupleId,
        title: preset.title,
        description: serializeDescriptionPayload(
          preset.description,
          preset.targetDate,
          '',
          'Added with love from Relationship Daydreams ✨'
        ),
        category: preset.category,
        is_completed: false,
        photo_url: preset.photoUrl,
        created_by: userProfile.uid,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('bucket_list').insert(payload);
      if (error) throw error;

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      await fetchDreams();
    } catch (err) {
      console.error('Error adding preset daydream:', err);
    }
  };

  // Save Dream
  const handleSaveDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !formTitle.trim() || !userProfile?.uid) return;

    setSaving(true);
    try {
      const isFulfilled = formStatus === 'fulfilled';
      const serializedDesc = serializeDescriptionPayload(
        formDescription,
        formTargetDate,
        formTargetBudget,
        formSecretNote
      );

      if (editingDream) {
        const { error } = await supabase
          .from('bucket_list')
          .update({
            title: formTitle.trim(),
            description: serializedDesc,
            category: formCategory,
            is_completed: isFulfilled,
            completed_at: isFulfilled ? new Date().toISOString() : null,
            photo_url: formPhotoUrl.trim() || null,
          })
          .eq('id', editingDream.id)
          .eq('couple_id', coupleId);

        if (error) throw error;
      } else {
        const payload = {
          couple_id: coupleId,
          title: formTitle.trim(),
          description: serializedDesc,
          category: formCategory,
          is_completed: isFulfilled,
          completed_at: isFulfilled ? new Date().toISOString() : null,
          photo_url: formPhotoUrl.trim() || null,
          created_by: userProfile.uid,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('bucket_list').insert(payload);
        if (error) throw error;
      }

      if (isFulfilled) {
        playWinSound();
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      }

      setIsModalOpen(false);
      setSelectedDream(null);
      await fetchDreams();
    } catch (err: any) {
      console.error('Error saving dream:', err);
      alert('Failed to save dream: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Toggle Fulfillment Status
  const handleToggleFulfilled = async (dream: DreamGoal) => {
    if (!coupleId) return;
    const isNowFulfilled = dream.status !== 'fulfilled';

    try {
      const { error } = await supabase
        .from('bucket_list')
        .update({
          is_completed: isNowFulfilled,
          completed_at: isNowFulfilled ? new Date().toISOString() : null,
        })
        .eq('id', dream.id)
        .eq('couple_id', coupleId);

      if (error) throw error;

      if (isNowFulfilled) {
        playWinSound();
        confetti({ particleCount: 100, spread: 85, origin: { y: 0.6 } });
      }

      if (selectedDream?.id === dream.id) {
        setSelectedDream({
          ...dream,
          status: isNowFulfilled ? 'fulfilled' : 'dreaming',
          fulfilledAt: isNowFulfilled ? new Date().toISOString() : undefined,
        });
      }

      await fetchDreams();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Delete Dream
  const handleDeleteDream = async (id: string) => {
    if (!coupleId) return;
    if (!confirm('Are you sure you want to remove this dream goal?')) return;

    try {
      const { error } = await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);

      if (error) throw error;

      if (selectedDream?.id === id) {
        setSelectedDream(null);
      }
      await fetchDreams();
    } catch (err) {
      console.error('Failed to delete dream:', err);
    }
  };

  // Filter dreams list
  const filteredDreams = dreams.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.secretNote?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Category info lookup
  const getCategoryDetails = (catId: string) => {
    return DREAM_CATEGORIES.find((c) => c.id === catId) || DREAM_CATEGORIES[0];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              Shared Relationship Dreams & Life Aspirations
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-fraunces tracking-tight">
              Our Future Dreams & Milestones 💕
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
              From our wedding vows & dream sanctuary home to romantic getaways, intimacy desires, and starting our happy family—manifest your lifetime journey together.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-3.5 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add Custom Dream Goal
          </button>
        </div>
      </div>

      {/* Preset Daydreams Inspiration Carousel */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Quick Daydream Inspirations (1-Click Add)
          </h3>
          <span className="text-[11px] text-rose-500 font-semibold">Tap any card to add to our board</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {PRESET_DAYDREAMS.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleAddPreset(preset)}
              className="min-w-[240px] max-w-[260px] bg-white dark:bg-slate-900 rounded-2xl p-3 border border-rose-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between shrink-0 group relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="h-24 rounded-xl overflow-hidden relative bg-slate-100">
                  <img src={preset.photoUrl} alt={preset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {preset.targetDate}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{preset.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{preset.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-rose-500 font-bold">
                <span>+ Add to Dreams Board</span>
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs & Search Filter Controls */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {DREAM_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'all' ? dreams.length : dreams.filter((d) => d.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-md`
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dreams & secrets..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Status' },
                { id: 'dreaming', label: '💭 Dreaming' },
                { id: 'in_progress', label: '🚀 In Progress' },
                { id: 'fulfilled', label: '✨ Fulfilled' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dreams Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-medium">Loading our shared relationship dreams...</p>
        </div>
      ) : filteredDreams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              {searchQuery ? 'No matching dreams found' : 'No dreams in this category yet'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Start adding your shared marriage vows, home desires, romantic adventures, or baby plans to build your dream roadmap together.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 cursor-pointer"
          >
            Create First Dream Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDreams.map((dream) => {
            const catInfo = getCategoryDetails(dream.category);
            const isFulfilled = dream.status === 'fulfilled';

            return (
              <div
                key={dream.id}
                onClick={() => setSelectedDream(dream)}
                className={`group bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 shadow-xs hover:shadow-xl cursor-pointer flex flex-col justify-between overflow-hidden relative ${
                  isFulfilled
                    ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-rose-300'
                }`}
              >
                {/* Top Image or Header Gradient */}
                {dream.photoUrl ? (
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={dream.photoUrl}
                      alt={dream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md shadow-xs ${
                        isFulfilled
                          ? 'bg-emerald-500 text-white'
                          : dream.status === 'in_progress'
                          ? 'bg-amber-500 text-white'
                          : 'bg-black/60 text-white'
                      }`}
                    >
                      {isFulfilled ? '✨ Fulfilled' : dream.status === 'in_progress' ? '🚀 In Progress' : '💭 Dreaming'}
                    </span>

                    {/* Category Pill */}
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white rounded-full text-[10px] font-bold shadow-xs">
                      {catInfo.label.split(' ')[0]}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-sm font-black truncate">{dream.title}</h4>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${catInfo.badgeBg}`}>
                        {catInfo.label}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          isFulfilled
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : dream.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isFulfilled ? '✨ Fulfilled' : dream.status === 'in_progress' ? '🚀 In Progress' : '💭 Dreaming'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{dream.title}</h4>
                  </div>
                )}

                {/* Card Content Details */}
                <div className="p-5 pt-2 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {dream.description || 'No description added yet.'}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      {dream.targetDate ? (
                        <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold">
                          <Calendar className="w-3 h-3" />
                          {dream.targetDate}
                        </span>
                      ) : (
                        <span>Target: Someday</span>
                      )}

                      {dream.targetBudget && (
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="w-3 h-3" />
                          {dream.targetBudget}
                        </span>
                      )}
                    </div>

                    {dream.secretNote && (
                      <div className="p-2 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl text-[11px] text-rose-700 dark:text-rose-300 italic flex items-start gap-1.5">
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{dream.secretNote}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">By {dream.createdByName || 'Partner'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFulfilled(dream);
                    }}
                    className={`font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isFulfilled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 hover:text-rose-600'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isFulfilled ? 'fill-emerald-500 text-white' : ''}`} />
                    <span>{isFulfilled ? 'Fulfilled ✨' : 'Mark Fulfilled'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Lightbox Modal */}
      {selectedDream && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-rose-100 dark:border-slate-800 p-6 space-y-5 my-auto">
            <button
              onClick={() => setSelectedDream(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedDream.photoUrl && (
              <div className="h-48 -mx-6 -mt-6 relative overflow-hidden bg-slate-900 mb-2">
                <img src={selectedDream.photoUrl} alt={selectedDream.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {getCategoryDetails(selectedDream.category).label}
                  </span>
                  <h3 className="text-xl font-black mt-1">{selectedDream.title}</h3>
                </div>
              </div>
            )}

            {!selectedDream.photoUrl && (
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {getCategoryDetails(selectedDream.category).label}
                </span>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{selectedDream.title}</h3>
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs text-slate-700 dark:text-slate-200">
              <p className="leading-relaxed whitespace-pre-wrap">{selectedDream.description || 'No description.'}</p>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 font-medium text-[11px]">
                <div>
                  <span className="text-slate-400 block">Target Timeframe</span>
                  <span className="font-bold text-rose-500">{selectedDream.targetDate || 'Flexible'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Estimated Budget/Target</span>
                  <span className="font-bold text-emerald-600">{selectedDream.targetBudget || 'Not set'}</span>
                </div>
              </div>
            </div>

            {selectedDream.secretNote && (
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50 space-y-1">
                <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  Partner Secret Promise
                </h4>
                <p className="text-xs text-rose-900 dark:text-rose-200 italic">"{selectedDream.secretNote}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleOpenModal(selectedDream);
                  setSelectedDream(null);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Dream
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteDream(selectedDream.id)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleFulfilled(selectedDream)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer ${
                    selectedDream.status === 'fulfilled'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedDream.status === 'fulfilled' ? 'Mark Unfulfilled' : 'Celebrate Fulfillment ✨'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Custom Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border border-rose-100 dark:border-slate-800 my-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingDream ? 'Edit Dream Goal' : 'Create Custom Dream Goal'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Define marriage plans, home sanctuary, intimacy desires, or family milestones.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDream} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dream Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Candlelit Rooftop Proposal / Buying Our Dream Cottage"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DreamGoal['category'])}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="marriage">💍 Marriage & Proposal</option>
                    <option value="home">🏡 Dream Home & Living</option>
                    <option value="intimacy">🔥 Intimacy & Romance</option>
                    <option value="baby">👶 Baby & Family</option>
                    <option value="travel">✈️ Travel & Adventures</option>
                    <option value="custom">✨ Custom Goal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DreamGoal['status'])}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="dreaming">💭 Dreaming</option>
                    <option value="in_progress">🚀 In Progress</option>
                    <option value="fulfilled">✨ Fulfilled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Date / Season</label>
                  <input
                    type="text"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    placeholder="e.g. Summer 2027"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Savings/Budget</label>
                  <input
                    type="text"
                    value={formTargetBudget}
                    onChange={(e) => setFormTargetBudget(e.target.value)}
                    placeholder="e.g. $5,000 / ₹1,00,000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description & Vision</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe your vision together..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Secret Partner Promise / Note</span>
                  <span className="text-[10px] text-rose-500">Private sweet message</span>
                </label>
                <input
                  type="text"
                  value={formSecretNote}
                  onChange={(e) => setFormSecretNote(e.target.value)}
                  placeholder="e.g. I promise to hold your hand through every single step..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Photo Image URL (Optional)</label>
                <input
                  type="url"
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving Goal...' : 'Save Dream Goal 💕'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
