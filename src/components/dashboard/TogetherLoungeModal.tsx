import React, { useState } from 'react';
import { Tv, Play, Pause, Heart, Sparkles, X, MessageSquare, Volume2, Link as LinkIcon } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CuratedStream {
  id: string;
  title: string;
  category: string;
  embedUrl: string;
  thumbnail: string;
}

const STREAMS: CuratedStream[] = [
  {
    id: 'lofi-girl',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    category: 'Lo-Fi Chill',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0',
    thumbnail: '🎧',
  },
  {
    id: 'rain-piano',
    title: 'Peaceful Piano & Gentle Night Rain',
    category: 'Intimate Melodies',
    embedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1',
    thumbnail: '🎹',
  },
  {
    id: 'fireplace-jazz',
    title: 'Warm Fireplace & Cozy Coffee Shop Jazz',
    category: 'Midnight Cozy',
    embedUrl: 'https://www.youtube.com/embed/Dx5qFachd3A?autoplay=1',
    thumbnail: '☕',
  },
];

interface TogetherLoungeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
}

export const TogetherLoungeModal: React.FC<TogetherLoungeModalProps> = ({
  isOpen,
  onClose,
  partnerName = 'Sweetheart',
}) => {
  const [activeStream, setActiveStream] = useState<CuratedStream>(STREAMS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number }[]>([]);

  if (!isOpen) return null;

  const handleSendReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10,
    };
    setReactions((prev) => [...prev.slice(-15), newReaction]);

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.9 },
    });
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    let embed = customUrl;
    if (customUrl.includes('youtube.com/watch?v=')) {
      const vidId = customUrl.split('watch?v=')[1]?.split('&')[0];
      embed = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
    } else if (customUrl.includes('youtu.be/')) {
      const vidId = customUrl.split('youtu.be/')[1]?.split('?')[0];
      embed = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
    }

    setActiveStream({
      id: 'custom',
      title: 'Our Custom Chosen Video',
      category: 'Custom Stream',
      embedUrl: embed,
      thumbnail: '🎬',
    });
    setCustomUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative">
        {/* Floating Heart Reactions */}
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute bottom-16 text-3xl pointer-events-none animate-bounce"
            style={{ left: `${r.x}%`, zIndex: 60 }}
          >
            {r.emoji}
          </div>
        ))}

        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                Together Watch Lounge • {activeStream.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Synchronized lounge for watching & listening alongside {partnerName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            src={activeStream.embedUrl}
            title={activeStream.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Stream Selector & Reaction Controls */}
        <div className="p-4 bg-slate-950 space-y-3">
          {/* Quick presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {STREAMS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStream(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeStream.id === s.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{s.thumbnail}</span>
                <span>{s.category}</span>
              </button>
            ))}
          </div>

          {/* Custom URL Input & Emoji reactions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <form onSubmit={handleApplyCustomUrl} className="flex items-center gap-2 w-full sm:w-auto flex-1">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Paste any YouTube video link to watch together..."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl shrink-0 cursor-pointer"
              >
                Load
              </button>
            </form>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-center sm:justify-start">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">React:</span>
              {['💖', '🥺', '🍿', '🔥', '✨', '🥰'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:scale-125 transition-transform text-sm cursor-pointer active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
