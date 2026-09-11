import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ImportantDate, Memory, LoveLetter } from '../types';
import { supabase } from '../lib/supabase';
import { dateRowToImportantDate, memoryRowToMemory, letterRowToLoveLetter, dateToRow } from '../utils/supabaseMappers';
import { compressImage } from '../utils/imageCompressor';
import {
  Clock,
  Heart,
  Plus,
  Sparkles,
  MapPin,
  Calendar,
  X,
  Camera,
  Mail,
  Gift,
  Plane,
  Flame,
  Search,
  Filter,
  Eye,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimelineChapter {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: 'milestone' | 'memory' | 'letter';
  photoUrls?: string[];
  location?: string;
  category?: string;
  authorName?: string;
  waxSeal?: string;
}

export const TimelineView: React.FC = () => {
  const { couple, userProfile, partnerProfile } = useAuth();
  const [chapters, setChapters] = useState<TimelineChapter[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'milestone' | 'memory' | 'letter'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<TimelineChapter | null>(null);

  // Form states for new milestone chapter
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('milestone');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const coupleId = couple?.id;
  const anniversaryDate = couple?.anniversaryDate;

  // Listen to milestones, memories, and love letters in real-time
  useEffect(() => {
    if (!coupleId) return;

    const fetchAllTimeline = async () => {
      const [datesRes, memsRes, lettersRes] = await Promise.all([
        supabase.from('important_dates').select('*').eq('couple_id', coupleId).order('date', { ascending: true }),
        supabase.from('memories').select('*').eq('couple_id', coupleId).order('date', { ascending: true }),
        supabase.from('love_letters').select('*').eq('couple_id', coupleId).order('created_at', { ascending: true }),
      ]);

      const datesList: TimelineChapter[] = (datesRes.data || []).map((row) => {
        const d = dateRowToImportantDate(row);
        return {
          id: `date_${d.id}`,
          title: d.title,
          date: d.date,
          description: d.description,
          category: d.category,
          type: 'milestone',
          photoUrls: d.photos,
        };
      });

      const memsList: TimelineChapter[] = (memsRes.data || []).map((row) => {
        const m = memoryRowToMemory(row);
        return {
          id: `mem_${m.id}`,
          title: m.title,
          date: m.date,
          description: m.description,
          location: m.location,
          photoUrls: m.mediaUrls,
          type: 'memory',
        };
      });

      const lettersList: TimelineChapter[] = (lettersRes.data || []).map((row) => {
        const l = letterRowToLoveLetter(row);
        return {
          id: `letter_${l.id}`,
          title: l.title,
          date: l.createdAt ? l.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          description: l.content ? `Love Letter penned by ${l.senderName}: "${l.content.slice(0, 100)}..."` : undefined,
          authorName: l.senderName,
          waxSeal: l.waxSeal,
          photoUrls: l.polaroidUrl ? [l.polaroidUrl] : undefined,
          type: 'letter',
        };
      });

      const all = [...datesList, ...memsList, ...lettersList].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setChapters(all);
    };

    fetchAllTimeline();

    const channel = supabase
      .channel(`timeline_events:${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'important_dates', filter: `couple_id=eq.${coupleId}` }, () => fetchAllTimeline())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories', filter: `couple_id=eq.${coupleId}` }, () => fetchAllTimeline())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'love_letters', filter: `couple_id=eq.${coupleId}` }, () => fetchAllTimeline())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Days together calculation
  const getDaysTogether = () => {
    const startDate = anniversaryDate || (chapters.length > 0 ? chapters[0].date : null);
    if (!startDate) return null;
    const start = new Date(startDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const daysTogether = getDaysTogether();

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1000, 0.85);
      setPhotoUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !title.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<ImportantDate> = {
        coupleId,
        title: title.trim(),
        date,
        description: description.trim(),
        category: category as any,
        photos: photoUrl ? [photoUrl] : [],
        isRecurring: false,
        createdBy: userProfile?.uid,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('important_dates')
        .insert(dateToRow(payload));

      if (error) throw error;

      confetti({ particleCount: 70, spread: 60 });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPhotoUrl(null);
    } catch (err) {
      console.error('Error adding milestone:', err);
    } finally {
      setSaving(false);
    }
  };

  // Filtered chapters
  const filteredChapters = chapters.filter((ch) => {
    const matchesFilter = filterType === 'all' || ch.type === filterType;
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getChapterIcon = (ch: TimelineChapter) => {
    if (ch.type === 'letter') return Mail;
    if (ch.type === 'memory') return Camera;
    return Heart;
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-28 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <Clock className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Our Love Story Dateline
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            The chronological tapestry of us — every milestone, cherished memory, and penned love letter.
          </p>
        </div>

        <button
          id="btn-add-chapter"
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Chapter
        </button>
      </div>

      {/* Love Story in Numbers Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-rose-500 font-mono block">
            {daysTogether !== null ? daysTogether : '—'}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            Days in Love
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-amber-500 font-mono block">
            {chapters.length}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            Story Chapters
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-sky-500 font-mono block">
            {chapters.filter((c) => c.type === 'memory').length}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            Memories Saved
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-2xl sm:text-3xl font-black text-purple-500 font-mono block">
            {chapters.filter((c) => c.type === 'letter').length}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
            Letters Penned
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Entire Story' },
            { id: 'milestone', label: 'Milestones 🏆' },
            { id: 'memory', label: 'Memories 📷' },
            { id: 'letter', label: 'Love Letters ✉️' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* INTERACTIVE TIMELINE SPINE */}
      <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-rose-500 before:via-pink-400 before:to-amber-400 before:rounded-full">
        {filteredChapters.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-slate-800 p-8 space-y-3">
            <Sparkles className="w-12 h-12 text-rose-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-white">Your Dateline is just beginning</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your first chapter, upload memories, or pen love letters to weave your love story.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Add First Chapter
            </button>
          </div>
        ) : (
          filteredChapters.map((chapter, index) => {
            const Icon = getChapterIcon(chapter);
            const isLetter = chapter.type === 'letter';
            const isMemory = chapter.type === 'memory';

            return (
              <div key={chapter.id} className="relative group">
                {/* Glowing Node on Spine */}
                <div className="absolute -left-6 sm:-left-10 top-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-slate-900 border-4 border-rose-500 shadow-md flex items-center justify-center transition-transform group-hover:scale-110">
                  <Icon className="w-3.5 h-3.5 text-rose-500 fill-current" />
                </div>

                {/* Chapter Card */}
                <div
                  onClick={() => setSelectedChapter(chapter)}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all space-y-3 cursor-pointer group-hover:border-rose-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40">
                        {new Date(chapter.date).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {chapter.type === 'milestone' ? 'Milestone' : chapter.type === 'memory' ? 'Memory' : 'Love Letter'}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-400">
                      Chapter {index + 1} of {filteredChapters.length}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                      {chapter.title}
                    </h3>

                    {chapter.location && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {chapter.location}
                      </p>
                    )}

                    {chapter.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                        {chapter.description}
                      </p>
                    )}
                  </div>

                  {/* Photos Grid if present */}
                  {chapter.photoUrls && chapter.photoUrls.length > 0 && (
                    <div className="pt-1">
                      {chapter.photoUrls.length === 1 ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72">
                          <img
                            src={chapter.photoUrls[0]}
                            alt={chapter.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {chapter.photoUrls.slice(0, 3).map((url, i) => (
                            <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD CHAPTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Chapter to Dateline
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChapter} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Night We Watched Shooting Stars, Adopted Luna..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Our Story / Details
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the magic of this day..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Photo Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100"
                />
                {photoUrl && (
                  <div className="mt-2 w-28 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
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
                  {saving ? 'Adding...' : 'Add to Dateline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAPTER DETAILS LIGHTBOX */}
      {selectedChapter && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                  {selectedChapter.type}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedChapter.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(selectedChapter.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChapter(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedChapter.photoUrls && selectedChapter.photoUrls.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80">
                <img
                  src={selectedChapter.photoUrls[0]}
                  alt={selectedChapter.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {selectedChapter.description && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedChapter.description}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChapter(null)}
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
