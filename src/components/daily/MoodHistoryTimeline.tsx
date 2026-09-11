import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MoodCheckIn } from '../../types';
import {
  Calendar,
  Clock,
  Heart,
  Search,
  Tag,
  User,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface MoodHistoryTimelineProps {
  moods: MoodCheckIn[];
}

export const MoodHistoryTimeline: React.FC<MoodHistoryTimelineProps> = ({ moods }) => {
  const { userProfile, partnerProfile } = useAuth();
  const [filterUser, setFilterUser] = useState<'all' | 'me' | 'partner'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;

  // Filter moods
  const filtered = moods.filter((m) => {
    // User filter
    if (filterUser === 'me' && m.userId !== myUid) return false;
    if (filterUser === 'partner' && m.userId !== partnerUid) return false;

    // Search query filter (tag, note, label, mood)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = m.label?.toLowerCase().includes(q) || m.mood?.toLowerCase().includes(q);
      const matchNote = m.note?.toLowerCase().includes(q);
      const matchTags = m.tags?.some((t) => t.toLowerCase().includes(q));
      const matchAuthor = m.userName?.toLowerCase().includes(q);
      if (!matchLabel && !matchNote && !matchTags && !matchAuthor) return false;
    }

    return true;
  });

  // Calculate mood stats
  const totalCount = moods.length;
  const tagCounts: Record<string, number> = {};
  let totalEnergy = 0;
  let energyCount = 0;

  moods.forEach((m) => {
    if (m.tags) {
      m.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
    if (m.energyLevel) {
      totalEnergy += m.energyLevel;
      energyCount += 1;
    }
  });

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgEnergy = energyCount > 0 ? Math.round((totalEnergy / energyCount) * 20) : 100;

  const formatDateLabel = (dateStr?: string, createdAt?: string) => {
    if (!dateStr && !createdAt) return 'Recent';
    try {
      const d = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date(createdAt!);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr || 'Recent';
    }
  };

  return (
    <div id="mood-history-timeline" className="space-y-5">
      {/* Stats Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Check-Ins
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Saved moments & feelings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Love Energy
          </div>
          <div className="text-2xl font-black text-amber-500 mt-0.5 flex items-center gap-1.5">
            <span>{avgEnergy}%</span>
            <span className="text-base font-normal">💖</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Overall connection resonance</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Top Expressed Feeling
          </div>
          <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400 mt-1 truncate">
            {topTags.length > 0 ? `#${topTags[0][0]} (${topTags[0][1]}x)` : 'Just getting started!'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Most mentioned feeling word</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        {/* User filter tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterUser('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterUser === 'all'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Both of Us ({totalCount})
          </button>
          <button
            onClick={() => setFilterUser('me')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterUser === 'me'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Only Mine
          </button>
          <button
            onClick={() => setFilterUser('partner')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterUser === 'partner'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {partnerProfile?.displayName || 'Partner'}'s
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search moods, words, #tags, or notes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Timeline entries list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 space-y-2">
            <span className="text-3xl">🕊️</span>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No Mood Check-Ins Found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms or filters.'
                : 'Your shared feelings and moods will appear here with exact dates and timestamps.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isMe = item.userId === myUid;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-3 hover:border-rose-200 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header row: Author + Date + Exact Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isMe
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300'
                      }`}
                    >
                      {item.userName ? item.userName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {isMe ? 'You' : item.userName || partnerProfile?.displayName || 'Partner'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDateLabel(item.date, item.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      <span>{item.time || 'Logged'}</span>
                    </span>
                  </div>
                </div>

                {/* Main Mood row */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {item.label || item.mood}
                      </h4>
                      {item.energyLevel && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {'💖'.repeat(item.energyLevel)} ({item.energyLevel * 20}%)
                        </span>
                      )}
                    </div>

                    {item.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{item.note}"
                      </p>
                    )}

                    {/* Feeling tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-[10px] font-semibold border border-rose-100 dark:border-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
