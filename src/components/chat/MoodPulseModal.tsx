import React, { useState } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Send,
  Coffee,
  Smile,
  Moon,
  Zap,
  Activity,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MoodPulseData } from '../../types';

interface MoodPulseModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendMoodPulse: (pulseData: MoodPulseData) => Promise<void>;
}

const MOOD_OPTIONS = [
  { mood: 'Madly In Love', emoji: '🥰', desc: 'Heart full of affection for you' },
  { mood: 'Sleepy & Cuddly', emoji: '😴', desc: 'Need a warm blanket & cuddles' },
  { mood: 'Stressed / Overwhelmed', emoji: '🥺', desc: 'Need your calming comfort' },
  { mood: 'Excited & Playful', emoji: '⚡', desc: 'Full of bubbly energy today' },
  { mood: 'Busy & Grinding', emoji: '☕', desc: 'Working hard, thinking of you' },
  { mood: 'A Bit Low / Sensitive', emoji: '🥀', desc: 'A gentle reminder of love would help' },
];

const LOVE_LANGUAGES = [
  { id: 'words', label: 'Words of Affirmation', icon: '💌' },
  { id: 'touch', label: 'Physical Touch & Hugs', icon: '🫂' },
  { id: 'time', label: 'Quality Time Together', icon: '⏳' },
  { id: 'acts', label: 'Acts of Service & Care', icon: '🍵' },
  { id: 'gifts', label: 'A Cute Surprise / Gift', icon: '🎁' },
];

const CRAVINGS = [
  'A warm, tight hug 🫂',
  'A hot cup of coffee ☕',
  'A sweet forehead kiss 💋',
  'Watching our show tonight 🍿',
  'Hearing your voice on call 📞',
  'Sleeping in late tomorrow 🛌',
  'A slice of sweet dessert 🍰',
];

export const MoodPulseModal: React.FC<MoodPulseModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendMoodPulse,
}) => {
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0]);
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [selectedLanguage, setSelectedLanguage] = useState(LOVE_LANGUAGES[0].label);
  const [selectedCraving, setSelectedCraving] = useState(CRAVINGS[0]);
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    try {
      await onSendMoodPulse({
        mood: selectedMood.mood,
        emoji: selectedMood.emoji,
        energyLevel,
        loveLanguageNeed: selectedLanguage,
        craving: selectedCraving,
        note: customNote.trim() || undefined,
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff4d8d', '#fbbf24', '#38bdf8'],
      });

      onClose();
    } catch (err) {
      console.error('Failed to send mood pulse:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-neutral-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-rose-950/50 via-neutral-900 to-indigo-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                Relationship Mood Pulse 💓
              </h3>
              <p className="text-[11px] text-neutral-400">
                Share your emotional heartbeat today with {partnerName}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Section 1: Mood Choice */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <span>How are you feeling right now?</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.mood}
                  type="button"
                  onClick={() => setSelectedMood(m)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedMood.mood === m.mood
                      ? 'border-rose-500 bg-rose-500/20 shadow-md shadow-rose-500/10 scale-[1.02]'
                      : 'border-white/10 bg-neutral-800/60 hover:bg-neutral-800'
                  }`}
                >
                  <div className="text-xl">{m.emoji}</div>
                  <div className="text-xs font-bold text-white mt-1">{m.mood}</div>
                  <div className="text-[10px] text-neutral-400 line-clamp-1">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Energy Meter */}
          <div className="space-y-1.5 bg-neutral-800/40 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300">Energy Level</span>
              <span className="text-rose-400 font-bold">{energyLevel} / 5 Hearts</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    energyLevel >= lvl
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-neutral-800 text-neutral-600 hover:text-neutral-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${energyLevel >= lvl ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Love Language Needed */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              Love language you need most today:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LOVE_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedLanguage === lang.label
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 border border-white/5'
                  }`}
                >
                  <span>{lang.icon}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Craving */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300">
              One thing that would make you smile:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {CRAVINGS.map((cr) => (
                <button
                  key={cr}
                  type="button"
                  onClick={() => setSelectedCraving(cr)}
                  className={`p-2 rounded-xl text-xs text-left transition-colors cursor-pointer truncate ${
                    selectedCraving === cr
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'bg-neutral-800/50 text-neutral-400 hover:text-neutral-200 border border-transparent'
                  }`}
                >
                  {cr}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Sweet note for {partnerName} (optional):
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Can't wait to hug you tonight..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-900 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send Mood Pulse 💓
          </button>
        </div>
      </div>
    </div>
  );
};
