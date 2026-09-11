import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Memory } from '../types';
import { supabase, createSafeChannel } from '../lib/supabase';
import { memoryRowToMemory, memoryToRow } from '../utils/supabaseMappers';
import { compressImage } from '../utils/imageCompressor';
import {
  Camera,
  Plus,
  Heart,
  Calendar,
  MapPin,
  Tag,
  Search,
  LayoutGrid,
  List,
  Clock,
  Trash2,
  Edit,
  X,
  Star,
  Sparkles,
  Lock,
  Play,
  Flame,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MemoryStoryModal } from './moments/MemoryStoryModal';

const SAMPLE_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
];

export const MomentsView: React.FC = () => {
  const { userProfile, couple } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'grid' | 'timeline'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyCapsules, setOnlyCapsules] = useState(false);

  // Story mode state
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null);
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [mood, setMood] = useState('blissful');
  const [tagsInput, setTagsInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [capsuleUnlockDate, setCapsuleUnlockDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coupleId = couple?.id;

  // Real-time listener for memories
  useEffect(() => {
    if (!coupleId) return;

    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('date', { ascending: false });

      if (!error && data) {
        setMemories(data.map(memoryRowToMemory));
      }
    };

    fetchMemories();

    const channel = createSafeChannel(`memories:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchMemories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Open modal helpers
  const openAddModal = () => {
    setEditingMemory(null);
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setLocation('');
    setMood('blissful');
    setTagsInput('');
    setPhotoUrls([]);
    setIsTimeCapsule(false);
    setCapsuleUnlockDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (mem: Memory, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMemory(mem);
    setTitle(mem.title);
    setDescription(mem.description || '');
    setDate(mem.date || new Date().toISOString().split('T')[0]);
    setLocation(mem.location || '');
    setMood(mem.mood || 'blissful');
    setTagsInput((mem.tags || []).join(', '));
    setPhotoUrls(mem.mediaUrls || []);
    setIsTimeCapsule(!!mem.isTimeCapsule);
    setCapsuleUnlockDate(mem.capsuleUnlockDate || '');
    setIsModalOpen(true);
  };

  // Upload photo handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i], 1200, 0.85);
        setPhotoUrls((prev) => [...prev, compressed]);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  // Save memory
  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !title.trim()) return;

    setSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const payload: Partial<Memory> = {
        coupleId,
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim() || undefined,
        mood,
        tags,
        mediaUrls: photoUrls,
        isTimeCapsule,
        capsuleUnlockDate: isTimeCapsule && capsuleUnlockDate ? capsuleUnlockDate : null,
      };

      if (editingMemory) {
        const { error } = await supabase
          .from('memories')
          .update(memoryToRow(payload))
          .eq('id', editingMemory.id)
          .eq('couple_id', coupleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('memories')
          .insert(
            memoryToRow({
              ...payload,
              isFavorite: false,
              createdBy: userProfile?.uid,
              createdByName: userProfile?.displayName,
              createdAt: new Date().toISOString(),
            })
          );
        if (error) throw error;

        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving memory:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (mem: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!coupleId) return;
    try {
      await supabase
        .from('memories')
        .update({
          is_favorite: !mem.isFavorite,
        })
        .eq('id', mem.id)
        .eq('couple_id', coupleId);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete memory
  const handleDeleteMemory = async (memId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!coupleId) return;
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await supabase
        .from('memories')
        .delete()
        .eq('id', memId)
        .eq('couple_id', coupleId);
      if (viewingMemory?.id === memId) setViewingMemory(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Check if a time capsule is currently locked
  const isCapsuleLocked = (mem: Memory) => {
    if (!mem.isTimeCapsule || !mem.capsuleUnlockDate) return false;
    const unlockTime = new Date(mem.capsuleUnlockDate).getTime();
    return Date.now() < unlockTime;
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(memories.flatMap((m) => m.tags || []).filter(Boolean))
  );

  // "On This Day" Throwback Memory Finder
  const todayStr = new Date().toISOString().slice(5, 10); // MM-DD
  const currentYear = new Date().getFullYear();
  const throwbackMemories = memories.filter((m) => {
    if (!m.date) return false;
    const memMonthDay = m.date.slice(5, 10);
    const memYear = parseInt(m.date.slice(0, 4), 10);
    return memMonthDay === todayStr && memYear < currentYear;
  });

  // Filter memories
  const filteredMemories = memories.filter((mem) => {
    if (onlyFavorites && !mem.isFavorite) return false;
    if (onlyCapsules && !mem.isTimeCapsule) return false;
    if (selectedTag && !mem.tags?.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mem.title.toLowerCase().includes(q);
      const matchDesc = mem.description?.toLowerCase().includes(q);
      const matchLoc = mem.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-28 text-slate-800 dark:text-slate-100 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <Camera className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Our Moments & Memory Vault
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cherished scrapbook of our adventures, quiet intimacy, and sealed future time capsules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {memories.length > 0 && (
            <button
              type="button"
              onClick={() => setIsStoryOpen(true)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-rose-400 rounded-2xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500" /> Play Couple Story
            </button>
          )}

          <button
            id="btn-add-memory"
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Capture Memory
          </button>
        </div>
      </div>

      {/* "ON THIS DAY" THROWBACK BANNER */}
      {throwbackMemories.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Flame className="w-7 h-7 text-yellow-200 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-white/80 block">
                On This Day Throwback
              </span>
              <h3 className="text-lg font-black">{throwbackMemories[0].title}</h3>
              <p className="text-xs text-white/90">
                {currentYear - parseInt(throwbackMemories[0].date.slice(0, 4), 10)} years ago today! ❤️{' '}
                {throwbackMemories[0].location && `in ${throwbackMemories[0].location}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setViewingMemory(throwbackMemories[0]);
              setViewingPhotoIndex(0);
            }}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-white/90 cursor-pointer shrink-0"
          >
            Relive Memory
          </button>
        </div>
      )}

      {/* Filter and View Toggle Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-moments-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, places..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              onlyFavorites
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
            Favorites
          </button>

          <button
            type="button"
            onClick={() => setOnlyCapsules(!onlyCapsules)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              onlyCapsules
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-purple-500" />
            Time Capsules
          </button>

          {/* View Mode Switches */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Gallery Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 shadow-xs text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Timeline View"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tags scroll bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Tags:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer ${
              selectedTag === null
                ? 'bg-rose-500 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                selectedTag === tag
                  ? 'bg-rose-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Memory Content Presentation */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-slate-800 p-8 space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No moments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedTag || onlyFavorites || onlyCapsules
              ? 'Try clearing your search or filters.'
              : 'Add your first couple memory to cherish forever!'}
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 px-5 py-2.5 bg-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Capture First Memory
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid / Gallery View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredMemories.map((mem) => {
            const locked = isCapsuleLocked(mem);

            return (
              <div
                key={mem.id}
                onClick={() => {
                  if (locked) return;
                  setViewingMemory(mem);
                  setViewingPhotoIndex(0);
                }}
                className={`group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xs cursor-pointer hover:shadow-md transition-all ${
                  locked ? 'cursor-not-allowed opacity-90' : ''
                }`}
              >
                {locked ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-amber-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 text-amber-600">
                    <Lock className="w-8 h-8 mb-2 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">
                      {mem.title}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      Unlocks {new Date(mem.capsuleUnlockDate!).toLocaleDateString()}
                    </span>
                  </div>
                ) : mem.mediaUrls?.[0] ? (
                  <img
                    src={mem.mediaUrls[0]}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-rose-50/60 dark:bg-rose-950/20 text-rose-400">
                    <Heart className="w-6 h-6 mb-1 fill-rose-200" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2">
                      {mem.title}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                  <span className="text-xs font-bold truncate">{mem.title}</span>
                  <span className="text-[10px] opacity-80">{new Date(mem.date).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200 dark:before:bg-rose-900">
          {filteredMemories.map((mem) => {
            const locked = isCapsuleLocked(mem);

            return (
              <div key={mem.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                <div
                  onClick={() => {
                    if (locked) return;
                    setViewingMemory(mem);
                    setViewingPhotoIndex(0);
                  }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-300 transition-all cursor-pointer flex flex-col sm:flex-row gap-4"
                >
                  {mem.mediaUrls?.[0] && !locked && (
                    <img
                      src={mem.mediaUrls[0]}
                      alt={mem.title}
                      className="w-full sm:w-32 h-28 rounded-xl object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-500">
                        {new Date(mem.date).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <button onClick={(e) => handleToggleFavorite(mem, e)}>
                        <Star className={`w-3.5 h-3.5 ${mem.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {mem.title}
                      {locked && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Time Capsule Locked
                        </span>
                      )}
                    </h4>

                    {locked ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic">
                        This memory is locked in a time capsule until{' '}
                        {new Date(mem.capsuleUnlockDate!).toLocaleDateString()}.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {mem.description}
                      </p>
                    )}

                    {mem.location && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-rose-400" /> {mem.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => {
            const locked = isCapsuleLocked(mem);

            return (
              <div
                key={mem.id}
                onClick={() => {
                  if (locked) return;
                  setViewingMemory(mem);
                  setViewingPhotoIndex(0);
                }}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                {locked ? (
                  <div className="p-6 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block tracking-wider">
                          Time Capsule Sealed
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Unlocks {new Date(mem.capsuleUnlockDate!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => openEditModal(mem, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : mem.mediaUrls?.[0] ? (
                  <div className="aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={mem.mediaUrls[0]}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(mem, e)}
                      className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-full shadow-xs text-slate-600 hover:text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${mem.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>

                    {mem.mediaUrls.length > 1 && (
                      <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                        +{mem.mediaUrls.length - 1} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-800 dark:to-slate-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Memory Note</span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(mem, e)}
                      className="text-slate-400 hover:text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${mem.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      {new Date(mem.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {mem.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {mem.location}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                    {mem.title}
                  </h3>

                  {locked ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                      Sealed until {new Date(mem.capsuleUnlockDate!).toLocaleDateString()}. No peeking!
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {mem.description}
                    </p>
                  )}

                  {mem.tags && mem.tags.length > 0 && !locked && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {mem.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 pt-2">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(mem, e)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMemory(mem.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
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

      {/* STORY MODE MODAL */}
      {isStoryOpen && (
        <MemoryStoryModal
          memories={memories.filter((m) => !isCapsuleLocked(m))}
          onClose={() => setIsStoryOpen(false)}
        />
      )}

      {/* ADD / EDIT MEMORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMemory ? 'Edit Memory' : 'Capture New Sacred Memory'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemory} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title *
                </label>
                <input
                  id="memory-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stargazing on the Beach, Cooking Pasta Disaster..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    id="memory-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    id="memory-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Story
                </label>
                <textarea
                  id="memory-desc-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What made this moment unforgettable?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Vacation, Sunset, Anniversary"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Time Capsule Lock Toggle */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimeCapsule}
                    onChange={(e) => setIsTimeCapsule(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-400"
                  />
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Seal as Time Capsule (Lock until a future date)
                  </span>
                </label>

                {isTimeCapsule && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-purple-800 dark:text-purple-300 mb-1">
                      Unlock Date (e.g. Next Anniversary) *
                    </label>
                    <input
                      type="date"
                      required={isTimeCapsule}
                      value={capsuleUnlockDate}
                      onChange={(e) => setCapsuleUnlockDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Photos Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photos
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2 mb-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls(photoUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-400 flex flex-col items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-semibold mt-0.5">Upload</span>
                  </button>
                </div>

                {/* Preset romantic photos */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[10px] text-slate-400 shrink-0">Presets:</span>
                  {SAMPLE_PRESET_IMAGES.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrls((prev) => [...prev, url])}
                      className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 hover:opacity-80"
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
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
                  {saving ? 'Saving...' : editingMemory ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MEMORY LIGHTBOX */}
      {viewingMemory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  {new Date(viewingMemory.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {viewingMemory.title}
                </h3>
                {viewingMemory.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    {viewingMemory.location}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(viewingMemory)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewingMemory(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Photos carousel if present */}
            {viewingMemory.mediaUrls && viewingMemory.mediaUrls.length > 0 && (
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96">
                  <img
                    src={viewingMemory.mediaUrls[viewingPhotoIndex]}
                    alt="Memory"
                    className="w-full h-full object-cover"
                  />
                  {viewingMemory.mediaUrls.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={() =>
                          setViewingPhotoIndex((prev) =>
                            prev === 0 ? viewingMemory.mediaUrls.length - 1 : prev - 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setViewingPhotoIndex((prev) =>
                            prev === viewingMemory.mediaUrls.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="p-2 rounded-full bg-black/60 text-white pointer-events-auto hover:bg-black/80"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {viewingMemory.mediaUrls.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {viewingMemory.mediaUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setViewingPhotoIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          viewingPhotoIndex === i ? 'w-5 bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Story text */}
            {viewingMemory.description && (
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {viewingMemory.description}
              </p>
            )}

            {/* Tags */}
            {viewingMemory.tags && viewingMemory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {viewingMemory.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMemory(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
