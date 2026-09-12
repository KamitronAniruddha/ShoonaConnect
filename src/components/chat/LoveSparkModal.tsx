import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  DollarSign,
  Send,
  Heart,
  Shuffle,
  MapPin,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DateInviteData } from '../../types';

interface LoveSparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendDateInvite: (invite: DateInviteData) => Promise<void>;
}

interface DateIdea {
  id: string;
  title: string;
  vibe: string;
  budget: 'Free' | '$' | '$$' | '$$$';
  duration: string;
  description: string;
  suggestedLocation: string;
  conversationSpark: string;
  playlistVibe: string;
}

const CURATED_DATE_IDEAS: DateIdea[] = [
  {
    id: 'stargazing',
    title: 'Midnight Blanket & Stargazing Picnic',
    vibe: '🕯️ Romantic & Dreamy',
    budget: 'Free',
    duration: '2-3 hours',
    description: 'Grab our favorite fluffy blankets, thermos of hot cocoa, and lie back finding constellations while listening to our couple songs.',
    suggestedLocation: 'Local park hilltop or backyard roof',
    conversationSpark: 'If we could freeze one moment from our past together in a snowglobe, which one would it be?',
    playlistVibe: 'Acoustic Indie & Dream Pop',
  },
  {
    id: 'cookoff',
    title: 'Secret Ingredient Couple Cook-Off',
    vibe: '🛋️ Cozy At-Home',
    budget: '$',
    duration: '2 hours',
    description: 'Each of us picks 2 mystery ingredients for the other. We cook side-by-side with our favorite playlist and rate each other\'s dishes with kisses!',
    suggestedLocation: 'Our kitchen',
    conversationSpark: 'What is the very first meal you remember having with me?',
    playlistVibe: 'French Bistro & Warm Jazz',
  },
  {
    id: 'art_date',
    title: 'Paint Each Other Blindfolded / Sketch Night',
    vibe: '🎨 Arts & Creative',
    budget: '$',
    duration: '1.5 hours',
    description: 'Set up two canvases facing each other. Paint portraits of each other without looking at the canvas for 10 minutes—pure laughter guaranteed!',
    suggestedLocation: 'Living room floor with fairy lights',
    conversationSpark: 'What is a feature of mine you could recognize with your eyes closed?',
    playlistVibe: 'Lo-Fi Chill Beats',
  },
  {
    id: 'sunrise_coffee',
    title: 'Secret Sunrise & Warm Bakery Hunt',
    vibe: '🌲 Adventure & Outdoors',
    budget: '$',
    duration: '2 hours',
    description: 'Wake up before dawn, drive to a high scenic viewpoint wrapped in a shared jacket, and watch the sun rise before grabbing fresh warm croissants.',
    suggestedLocation: 'Scenic sunrise lookout',
    conversationSpark: 'Where do you see us waking up together five years from today?',
    playlistVibe: 'Gentle Morning Folk',
  },
  {
    id: 'dressed_up',
    title: 'Candlelit 3-Course Dressing Up Date',
    vibe: '🥂 Splurge & Luxury',
    budget: '$$',
    duration: 'Evening (3h)',
    description: 'Full fancy dress code! Handwritten menu cards, table flowers, dim lighting, soft background jazz, and taking romantic polaroids.',
    suggestedLocation: 'Our favorite candlelit dining spot',
    conversationSpark: 'What was your honest first impression of me the day we met?',
    playlistVibe: 'Golden Era Vinyl Classics',
  },
  {
    id: 'bookstore_quest',
    title: 'Quiet Bookstore & Coffee Rendezvous',
    vibe: '🛋️ Cozy & Intellectual',
    budget: '$',
    duration: '2 hours',
    description: 'Explore an old cozy bookstore. Each picks a book that reminds them of the other and leaves a secret love note hidden inside for us to buy.',
    suggestedLocation: 'Vintage bookstore & corner café',
    conversationSpark: 'If our love story was written as a novel, what would the title chapter be?',
    playlistVibe: 'Quiet Piano & Rain Sounds',
  },
];

export const LoveSparkModal: React.FC<LoveSparkModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendDateInvite,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<string>('all');
  const [selectedIdea, setSelectedIdea] = useState<DateIdea>(CURATED_DATE_IDEAS[0]);
  const [dateDay, setDateDay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [dateTime, setDateTime] = useState('19:30');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const filteredIdeas = CURATED_DATE_IDEAS.filter(
    (i) => selectedVibe === 'all' || i.vibe.includes(selectedVibe)
  );

  const handleSendAsInvite = async () => {
    setIsSending(true);
    try {
      await onSendDateInvite({
        title: selectedIdea.title,
        date: dateDay,
        time: dateTime,
        location: selectedIdea.suggestedLocation,
        status: 'pending',
      });

      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#ff4d8d', '#f59e0b', '#10b981'],
      });

      onClose();
    } catch (err) {
      console.error('Failed to send date invite:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-purple-950/60 via-neutral-900 to-rose-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                Love Spark AI Date Planner ✨
              </h3>
              <p className="text-xs text-rose-300/80">
                Curated romantic dates & conversation sparks ready to invite {partnerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vibe Tabs */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-neutral-900/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Vibes' },
            { id: 'Romantic', label: '🕯️ Romance' },
            { id: 'Cozy', label: '🛋️ Cozy Home' },
            { id: 'Creative', label: '🎨 Arts' },
            { id: 'Outdoors', label: '🌲 Outdoors' },
            { id: 'Luxury', label: '🥂 Splurge' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedVibe(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedVibe === tab.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content: Left list & Right detail */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Ideas List */}
          <div className="p-3 sm:p-4 space-y-2 overflow-y-auto max-h-[42vh] md:max-h-[50vh]">
            {filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => setSelectedIdea(idea)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedIdea.id === idea.id
                    ? 'border-rose-500 bg-rose-500/20 shadow-md ring-1 ring-rose-400/40'
                    : 'border-white/10 bg-neutral-800/40 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold text-rose-300">
                  <span>{idea.vibe}</span>
                  <span className="text-amber-400 font-bold">{idea.budget}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                  {idea.title}
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                  ⏱️ {idea.duration} • 📍 {idea.suggestedLocation}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Selected Idea & Schedule */}
          <div className="p-4 sm:p-5 space-y-3.5 bg-neutral-900/50 flex flex-col justify-between overflow-y-auto max-h-[50vh]">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                  Featured Date Plan
                </span>
                <h4 className="text-base font-bold text-white font-serif leading-snug">
                  {selectedIdea.title}
                </h4>
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                  {selectedIdea.description}
                </p>
              </div>

              {/* Spark & Playlist box */}
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-white/5 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">💬</span>
                  <div>
                    <span className="font-bold text-amber-300">Conversation Spark:</span>
                    <p className="text-neutral-300 italic mt-0.5">
                      "{selectedIdea.conversationSpark}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[11px] text-purple-300 font-medium">
                  <span>🎵 Music Vibe:</span>
                  <span>{selectedIdea.playlistVibe}</span>
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateDay}
                    onChange={(e) => setDateDay(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-800 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-800 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSendAsInvite}
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Calendar className="w-3.5 h-3.5" /> Send as Date Invite to {partnerName} 💕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
