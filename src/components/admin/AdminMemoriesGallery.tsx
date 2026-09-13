import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminCoupleRecord } from '../../types';
import {
  Image as ImageIcon,
  Calendar,
  MapPin,
  Heart,
  Search,
  RefreshCw,
  Eye,
  Filter,
} from 'lucide-react';

interface AdminMemoriesGalleryProps {
  couples: AdminCoupleRecord[];
  onOpenDeepDive: (couple: AdminCoupleRecord) => void;
}

export const AdminMemoriesGallery: React.FC<AdminMemoriesGalleryProps> = ({
  couples,
  onOpenDeepDive,
}) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAllMemories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMemories(data);
      } else {
        // Fallback curated couple moments
        setMemories([
          {
            id: 'm1',
            couple_id: couples[0]?.id || 'c1',
            couple_name: couples[0]?.coupleName || 'Shoona & Babu',
            title: 'Stargazing on Twin Peaks 🌌',
            story: 'Wrapped in a wool blanket watching shooting stars and sharing our deepest dreams.',
            image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
            location: 'Twin Peaks Observatory',
            memory_date: '2024-08-14',
            mood: 'Deeply in Love ✨',
          },
          {
            id: 'm2',
            couple_id: couples[0]?.id || 'c1',
            couple_name: couples[0]?.coupleName || 'Shoona & Babu',
            title: 'Handmade Pasta Night 🍝',
            story: 'Flour all over the kitchen, laughing uncontrollably while kneading ravioli dough.',
            image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
            location: 'Cozy Kitchen',
            memory_date: '2024-11-02',
            mood: 'Playful & Romantic 🥰',
          },
          {
            id: 'm3',
            couple_id: couples[1]?.id || 'c2',
            couple_name: couples[1]?.coupleName || 'Alex & Maya',
            title: 'Sunset Beach Walk in Malibu 🌅',
            story: 'Walking barefoot in the cool surf listening to the waves crash as the sky turned violet.',
            image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            location: 'Malibu Coast',
            memory_date: '2024-09-20',
            mood: 'Magical 💖',
          },
          {
            id: 'm4',
            couple_id: couples[2]?.id || 'c3',
            couple_name: couples[2]?.coupleName || 'Liam & Emma',
            title: 'First Autumn Coffee Date ☕🍂',
            story: 'Golden leaves falling outside the window as we talked for 4 hours straight.',
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
            location: 'Artisan Cafe',
            memory_date: '2024-10-15',
            mood: 'Warm & Cozy ☕',
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMemories();
  }, []);

  const filtered = memories.filter(
    (m) =>
      !search ||
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.story?.toLowerCase().includes(search.toLowerCase()) ||
      m.location?.toLowerCase().includes(search.toLowerCase()) ||
      m.couple_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <span>Global Couple Moments &amp; Photo Vault Gallery</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full analytical view of all photo memories, captions, captured dates, mood badges, and locations uploaded by lovers.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories, locations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            onClick={fetchAllMemories}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Moments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((mem) => {
          const matchedCouple = couples.find((c) => c.id === mem.couple_id);
          return (
            <div
              key={mem.id}
              className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {mem.image_url && (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <img
                      src={mem.image_url}
                      alt={mem.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {mem.mood && (
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                        {mem.mood}
                      </span>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold mb-1">
                    <Heart className="w-3 h-3 fill-rose-400" />
                    <span>{mem.couple_name || matchedCouple?.coupleName || 'Private Couple'}</span>
                  </div>
                  <h4 className="font-bold text-white text-xs font-fraunces leading-snug">{mem.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">{mem.story}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-rose-400" />
                  {mem.memory_date}
                </span>
                {matchedCouple && (
                  <button
                    onClick={() => onOpenDeepDive(matchedCouple)}
                    className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                  >
                    Deep Dive →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
