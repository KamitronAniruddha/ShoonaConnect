import React, { useState } from 'react';
import { Music, Play, Plus, Heart, ExternalLink, Disc3, Trash2 } from 'lucide-react';

interface LoveSong {
  id: string;
  title: string;
  artist: string;
  tag: string;
  story: string;
  youtubeOrSpotifyUrl?: string;
}

const INITIAL_SONGS: LoveSong[] = [
  {
    id: 'song-1',
    title: 'Can\'t Help Falling in Love',
    artist: 'Kina Grannis',
    tag: 'Our First Dance 🕊️',
    story: 'The song that plays in our hearts whenever we look into each other\'s eyes.',
    youtubeOrSpotifyUrl: 'https://open.spotify.com',
  },
  {
    id: 'song-2',
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    tag: 'When We First Met ✨',
    story: 'Playing softly on the car speakers during our first late-night drive together.',
    youtubeOrSpotifyUrl: 'https://open.spotify.com',
  },
  {
    id: 'song-3',
    title: 'Golden Hour',
    artist: 'JVKE',
    tag: 'Sunset Memory 🌅',
    story: 'Watching the sky turn pink and orange on the rooftop together.',
    youtubeOrSpotifyUrl: 'https://open.spotify.com',
  },
];

interface MelodyVaultWidgetProps {
  partnerName?: string;
}

export const MelodyVaultWidget: React.FC<MelodyVaultWidgetProps> = ({
  partnerName = 'Sweetheart',
}) => {
  const [songs, setSongs] = useState<LoveSong[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_melody_vault');
      return saved ? JSON.parse(saved) : INITIAL_SONGS;
    } catch {
      return INITIAL_SONGS;
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newStory, setNewStory] = useState('');

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSong: LoveSong = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Unknown Artist',
      tag: newTag.trim() || 'Our Memory 🎵',
      story: newStory.trim() || 'A special moment together.',
    };

    const updated = [newSong, ...songs];
    setSongs(updated);
    try {
      localStorage.setItem('shoona_melody_vault', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewTitle('');
    setNewArtist('');
    setNewTag('');
    setNewStory('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    const updated = songs.filter((s) => s.id !== id);
    setSongs(updated);
    try {
      localStorage.setItem('shoona_melody_vault', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Disc3 className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Our Melody Vault & Love Songs</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-extrabold border border-rose-200 dark:border-rose-900/40">
                {songs.length} Tracks
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              The sacred soundtrack of our story and defining moments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Love Song</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSong} className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-slate-800/80 border border-rose-200 dark:border-slate-700 mb-4 space-y-2.5 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Song Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
              required
            />
            <input
              type="text"
              placeholder="Artist..."
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Tag (e.g. First Road Trip, Starry Night)..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Why this song means the world to us..."
              value={newStory}
              onChange={(e) => setNewStory(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
            >
              Save to Vault
            </button>
          </div>
        </form>
      )}

      {/* Song List */}
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-rose-50/50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {song.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 truncate">• {song.artist}</span>
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate mt-0.5">
                  {song.tag}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate mt-0.5">
                  "{song.story}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleDelete(song.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                title="Remove Song"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
