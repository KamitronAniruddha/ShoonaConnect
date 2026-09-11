import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MoodCheckIn } from '../../types';
import { supabase } from '../../lib/supabase';
import { moodToRow } from '../../utils/supabaseMappers';
import {
  Smile,
  Heart,
  Sparkles,
  Tag,
  Plus,
  X,
  Send,
  BatteryCharging,
  Clock,
  CheckCircle2,
  Bell,
  Coffee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EXTENDED_MOODS,
  MOOD_CATEGORIES,
  SUGGESTED_FEELING_TAGS,
  MoodOption,
} from '../../utils/coupleData';

interface DailyMoodSectionProps {
  partnerMood: MoodCheckIn | null;
  myLatestMood: MoodCheckIn | null;
  todayStr: string;
}

export const DailyMoodSection: React.FC<DailyMoodSectionProps> = ({
  partnerMood,
  myLatestMood,
  todayStr,
}) => {
  const { userProfile, couple, partnerProfile } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMoodId, setSelectedMoodId] = useState<string>('blissful');
  const [customEmoji, setCustomEmoji] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Missing You']);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5); // 1 to 5
  const [moodNote, setMoodNote] = useState<string>('');
  const [savingMood, setSavingMood] = useState<boolean>(false);
  const [reactionSent, setReactionSent] = useState<string | null>(null);

  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;

  // Filter emojis by category
  const filteredMoods = EXTENDED_MOODS.filter(
    (m) => selectedCategory === 'all' || m.category === selectedCategory
  );

  const activeMoodObj = EXTENDED_MOODS.find((m) => m.id === selectedMoodId) || EXTENDED_MOODS[0];
  const activeEmoji = customEmoji.trim() || activeMoodObj.emoji;
  const activeLabel = customEmoji.trim() ? 'Custom Mood' : activeMoodObj.label;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customTagInput.trim().replace(/^#/, '');
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
      setCustomTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handlePostMood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleId || !myUid || !userProfile) return;

    setSavingMood(true);
    try {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const isoTime = now.toISOString();

      const moodData: MoodCheckIn = {
        id: `${Date.now()}_${myUid}`,
        coupleId,
        userId: myUid,
        userName: userProfile.displayName || 'Partner',
        userPhoto: userProfile.photoURL || '',
        mood: activeMoodObj.id,
        emoji: activeEmoji,
        label: activeLabel,
        tags: selectedTags,
        note: moodNote.trim(),
        energyLevel,
        time: formattedTime,
        date: todayStr,
        createdAt: isoTime,
      };

      const { error } = await supabase
        .from('moods')
        .insert(moodToRow(moodData));

      if (error) throw error;

      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
      setMoodNote('');
    } catch (err) {
      console.error('Error recording mood:', err);
    } finally {
      setSavingMood(false);
    }
  };

  // Quick comfort micro-reaction to partner's mood
  const handleSendComfort = async (reactionType: string, label: string) => {
    if (!coupleId || !partnerUid || !userProfile) return;
    try {
      await supabase
        .from('notifications')
        .insert({
          couple_id: coupleId,
          recipient_id: partnerUid,
          type: 'mood',
          title: `${userProfile.displayName || 'Your love'} sent a ${label}!`,
          message: `${userProfile.displayName} saw your mood update and sent: ${reactionType} ${label}.`,
          link_tab: 'daily',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      setReactionSent(label);
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.5 } });
      setTimeout(() => setReactionSent(null), 3000);
    } catch (err) {
      console.error('Error sending comfort reaction:', err);
    }
  };

  return (
    <div id="daily-mood-section" className="space-y-6">
      {/* Partner's Live Mood Pulse Card */}
      <div className="bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-amber-50/60 dark:from-slate-900 dark:via-rose-950/20 dark:to-slate-900 rounded-3xl p-5 sm:p-6 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              {partnerProfile?.displayName || 'Partner'}'s Live Mood Pulse
            </h4>
          </div>
          {partnerMood && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{partnerMood.time || 'Today'}</span>
            </span>
          )}
        </div>

        {partnerMood ? (
          <div className="space-y-3">
            <div className="flex items-start sm:items-center gap-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-4 rounded-2xl border border-rose-100 dark:border-slate-700">
              <div className="w-14 h-14 rounded-2xl bg-rose-100/70 dark:bg-rose-950/80 flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                {partnerMood.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                    {partnerMood.label || partnerMood.mood}
                  </h5>
                  {partnerMood.energyLevel && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                      {'💖'.repeat(partnerMood.energyLevel)} ({partnerMood.energyLevel * 20}%)
                    </span>
                  )}
                </div>

                {partnerMood.note && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1 leading-relaxed">
                    "{partnerMood.note}"
                  </p>
                )}

                {partnerMood.tags && partnerMood.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {partnerMood.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-slate-700 text-rose-700 dark:text-rose-300 text-[10px] font-semibold border border-rose-200/60 dark:border-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Micro comfort reactions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Send comfort:
              </span>
              <button
                onClick={() => handleSendComfort('🫂', 'Warm Tight Hug')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>🫂</span>
                <span>Send Hug</span>
              </button>
              <button
                onClick={() => handleSendComfort('💋', 'Sweet Kiss')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>💋</span>
                <span>Sweet Kiss</span>
              </button>
              <button
                onClick={() => handleSendComfort('☕', 'Warm Tea & TLC')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>☕</span>
                <span>Warm Tea</span>
              </button>
              <button
                onClick={() => handleSendComfort('💖', 'Love & Strength')}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>💖</span>
                <span>Right Here</span>
              </button>

              {reactionSent && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  ✓ Sent {reactionSent}!
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-rose-100 dark:border-slate-700 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {partnerProfile?.displayName || 'Your partner'} hasn't checked in with their mood yet
              today.
            </p>
            <button
              type="button"
              onClick={() => handleSendComfort('💌', 'Gentle Love Nudge')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/60"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Nudge With Love</span>
            </button>
          </div>
        )}
      </div>

      {/* Check In Form: My Mood */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-rose-100 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Smile className="w-5 h-5 text-rose-500" />
              <span>How Is Your Heart Feeling Right Now?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pick your exact emoji, mention feeling words, and log with precise time & date
            </p>
          </div>

          <div className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50">
            Selected: <strong className="text-slate-800 dark:text-white">{activeEmoji} {activeLabel}</strong>
          </div>
        </div>

        <form onSubmit={handlePostMood} className="space-y-5">
          {/* Category Filter for Emojis */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {MOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Emojis Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredMoods.map((m) => {
              const isSelected = selectedMoodId === m.id && !customEmoji.trim();
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMoodId(m.id);
                    setCustomEmoji('');
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/30 scale-102 font-bold shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                  title={m.description}
                >
                  <span className="text-2xl block group-hover:scale-110 transition-transform">
                    {m.emoji}
                  </span>
                  <span className="text-[10px] font-semibold block mt-1 truncate">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Or Type Any Custom Emoji */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Or enter any emoji:
            </span>
            <input
              type="text"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              placeholder="e.g. 🪷 🦄 🌊"
              className="w-24 px-3 py-1 text-center text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white"
            />
            {customEmoji && (
              <span className="text-xs text-rose-500 font-bold">Custom emoji active!</span>
            )}
          </div>

          {/* Mention Feeling Words / Tags Section */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-500" />
                <span>Mention Words For Your Mood</span>
              </label>
              <span className="text-[10px] text-slate-400">Click to add feelings</span>
            </div>

            {/* Currently selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/50 dark:border-rose-900/30">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 mr-1 self-center">
                  Selected words:
                </span>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-2xs"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested quick tags */}
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {SUGGESTED_FEELING_TAGS.map((tag) => {
                const isTagSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      isTagSelected
                        ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Word Tag Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag(e);
                  }
                }}
                placeholder="Type your own feeling word (e.g. 'Craving Pasta', 'Need A Hug')..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Word</span>
              </button>
            </div>
          </div>

          {/* Love Energy Level / Battery Meter */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-amber-500" />
                <span>Love Energy Level</span>
              </label>
              <span className="font-extrabold text-rose-600 dark:text-rose-400">
                {'💖'.repeat(energyLevel)} ({energyLevel * 20}%)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Tender & Low (20%)</span>
              <span>Balanced (60%)</span>
              <span>Overflowing (100%)</span>
            </div>
          </div>

          {/* Sweet Note Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Heartfelt Note (Optional)
            </label>
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="e.g. 'Can't stop smiling thinking about our walk', 'Rough day at work but you make it all okay'..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white"
            />
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Will record with current date & exact local time</span>
            </span>

            <button
              type="submit"
              disabled={savingMood}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{savingMood ? 'Recording Pulse...' : 'Post Mood Check-In'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
