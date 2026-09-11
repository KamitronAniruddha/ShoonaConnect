import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BucketItem } from '../types';
import { supabase } from '../lib/supabase';
import { bucketItemRowToBucketItem, bucketItemToRow } from '../utils/supabaseMappers';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Compass,
  Heart,
  Plane,
  Utensils,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'travel', label: 'Travel & Trips', icon: Plane },
  { id: 'dates', label: 'Romantic Dates', icon: Heart },
  { id: 'adventure', label: 'Adventures', icon: Compass },
  { id: 'food', label: 'Food & Cafes', icon: Utensils },
  { id: 'milestone', label: 'Milestones', icon: Trophy },
];

export const BucketListView: React.FC = () => {
  const { userProfile, couple } = useAuth();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'planned' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('travel');
  const [saving, setSaving] = useState(false);

  const coupleId = couple?.id;

  // Listen to bucket list items
  useEffect(() => {
    if (!coupleId) return;

    const fetchBucketList = async () => {
      const { data, error } = await supabase
        .from('bucket_list')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data.map(bucketItemRowToBucketItem));
      }
    };

    fetchBucketList();

    const channel = supabase
      .channel(`bucket_list:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bucket_list',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchBucketList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !title.trim() || !userProfile?.uid) return;

    setSaving(true);
    try {
      const payload: Partial<BucketItem> = {
        coupleId,
        title: title.trim(),
        description: description.trim(),
        category,
        isCompleted: false,
        status: 'planned',
        createdBy: userProfile.uid,
        createdByName: userProfile.displayName,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bucket_list')
        .insert(bucketItemToRow(payload));

      if (error) throw error;

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error adding bucket item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompleted = async (item: BucketItem) => {
    if (!coupleId) return;
    const isNowCompleted = !item.isCompleted;

    try {
      const { error } = await supabase
        .from('bucket_list')
        .update({
          is_completed: isNowCompleted,
          completed_at: isNowCompleted ? new Date().toISOString() : null,
          completed_by: isNowCompleted ? userProfile?.uid : null,
        })
        .eq('id', item.id)
        .eq('couple_id', coupleId);

      if (error) throw error;

      if (isNowCompleted) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!coupleId) return;
    if (!confirm('Delete this dream from your bucket list?')) return;
    try {
      await supabase
        .from('bucket_list')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((it) => {
    if (selectedFilter === 'planned') return it.status === 'planned';
    if (selectedFilter === 'completed') return it.status === 'completed';
    return true;
  });

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Our Couple Bucket List
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dreams, travel destinations, and wild adventures we promise to conquer together.
          </p>
        </div>

        <button
          id="btn-add-bucket-dream"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-semibold shadow-sm shadow-rose-200 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Dream
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-gradient-to-r from-amber-500 to-rose-500 rounded-3xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider opacity-90 block">
            Couple Adventures Accomplished
          </span>
          <h3 className="text-xl font-black mt-0.5">
            {completedCount} of {items.length} Dreams Achieved ({progressPercent}%)
          </h3>
          <p className="text-xs opacity-80 mt-0.5">A lifetime of journeys ahead of us ❤️</p>
        </div>

        <div className="w-full sm:w-48 bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'all' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          All Dreams ({items.length})
        </button>
        <button
          onClick={() => setSelectedFilter('planned')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'planned' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          In Progress ({items.length - completedCount})
        </button>
        <button
          onClick={() => setSelectedFilter('completed')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === 'completed' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Accomplished ({completedCount})
        </button>
      </div>

      {/* Bucket Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100 p-8 space-y-3">
            <Sparkles className="w-12 h-12 text-amber-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No bucket dreams listed</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Add your dream vacation, tandem skydiving, or cooking a 5-course dinner together!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Add First Dream
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isDone = item.status === 'completed';
            const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0];
            const Icon = catObj.icon;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                  isDone
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : 'bg-white border-slate-200/80 shadow-xs hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => handleToggleCompleted(item)}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title={isDone ? 'Mark as planned' : 'Mark as accomplished'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Icon className="w-3 h-3" /> {catObj.label}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {isDone && item.completedAt && (
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
                        Accomplished on {new Date(item.completedAt).toLocaleDateString()} ❤️
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-opacity cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Add Couple Bucket Dream</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dream / Goal *</label>
                <input
                  id="bucket-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Watch northern lights from an igloo in Norway"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details / Notes</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any details, places, or wishlist notes..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-bucket-item"
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs shadow-rose-200 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Add to Bucket List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
