import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Volume2,
  VolumeX,
  Printer,
  Trash2,
  Play,
  Pause,
  CornerUpLeft,
  Calendar,
  Sparkles,
  Award,
  Download,
} from 'lucide-react';
import { LoveLetter } from '../../types';
import { romanticAudio } from '../../utils/romanticAudio';

interface LetterReaderModalProps {
  letter: LoveLetter;
  onClose: () => void;
  onDelete: (letterId: string) => void;
  onReply: (letter: LoveLetter) => void;
}

export const LetterReaderModal: React.FC<LetterReaderModalProps> = ({
  letter,
  onClose,
  onDelete,
  onReply,
}) => {
  const [fontFamily, setFontFamily] = useState<'handwriting' | 'romantic' | 'editorial' | 'sans'>(
    letter.fontStyle as any || 'handwriting'
  );
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isAmbiancePlaying, setIsAmbiancePlaying] = useState(false);

  // Audio voice note playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!letter.audioUrl) return;
    const audio = new Audio(letter.audioUrl);
    setAudioElement(audio);

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    };

    return () => {
      audio.pause();
      romanticAudio.toggleReadingAmbiance(false);
    };
  }, [letter.audioUrl]);

  const toggleVoicePlay = () => {
    if (!audioElement) return;
    if (isPlayingAudio) {
      audioElement.pause();
      setIsPlayingAudio(false);
    } else {
      audioElement.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const toggleAmbiance = () => {
    const nextState = romanticAudio.toggleReadingAmbiance();
    setIsAmbiancePlaying(nextState);
  };

  const handlePrint = () => {
    window.print();
  };

  // Paper styling class
  const getPaperStyleClass = () => {
    switch (letter.theme as string) {
      case 'rose':
      case 'blush':
        return 'bg-gradient-to-b from-rose-50 via-pink-50/80 to-rose-50 border-rose-200/80 text-rose-950 shadow-rose-200/50';
      case 'midnight':
        return 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-indigo-900/60 text-slate-100 shadow-indigo-950/50';
      case 'lavender':
        return 'bg-gradient-to-b from-purple-50 via-indigo-50/50 to-purple-50 border-purple-200 text-purple-950 shadow-purple-200/50';
      case 'royal_gold':
        return 'bg-gradient-to-b from-amber-50 via-yellow-50/40 to-amber-50 border-amber-300 text-amber-950 shadow-amber-200/50';
      case 'airmail':
        return 'bg-white border-2 border-dashed border-rose-300 text-slate-900 shadow-xl';
      case 'parchment':
      case 'vintage':
      default:
        return 'bg-[#faf6ee] border-[#e8ddc8] text-[#3d2f21] shadow-xl';
    }
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case 'handwriting':
        return 'font-handwriting text-2xl sm:text-3xl leading-relaxed';
      case 'romantic':
        return 'font-romantic text-lg sm:text-xl leading-relaxed';
      case 'editorial':
        return 'font-editorial text-base sm:text-lg leading-relaxed';
      case 'sans':
      default:
        return 'font-sans text-sm sm:text-base leading-relaxed';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'scale-90 origin-top';
      case 'lg':
        return 'scale-110 origin-top';
      case 'xl':
        return 'scale-120 origin-top';
      case 'base':
      default:
        return '';
    }
  };

  const getWaxSealEmoji = () => {
    switch (letter.waxSeal) {
      case 'rose':
        return '🌹';
      case 'crown':
        return '👑';
      case 'infinity':
        return '♾️';
      case 'kiss':
        return '💋';
      case 'stars':
        return '✨';
      case 'lock':
        return '🔐';
      case 'heart':
      default:
        return '💕';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div
        className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-10 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 transition-colors duration-300 ${getPaperStyleClass()}`}
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Font selector */}
            {(['handwriting', 'romantic', 'editorial', 'sans'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFontFamily(f)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  fontFamily === f
                    ? 'bg-black/15 text-current font-bold'
                    : 'bg-black/5 hover:bg-black/10 text-current opacity-70'
                }`}
              >
                {f === 'handwriting'
                  ? 'Handwritten'
                  : f === 'romantic'
                  ? 'Romantic Serif'
                  : f === 'editorial'
                  ? 'Editorial'
                  : 'Modern'}
              </button>
            ))}

            {/* Cozy Ambiance Toggle */}
            <button
              type="button"
              onClick={toggleAmbiance}
              title="Toggle rain & fireplace ambiance"
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isAmbiancePlaying ? 'bg-rose-500 text-white' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              {isAmbiancePlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAmbiancePlaying ? 'Ambiance On' : 'Cozy Audio'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              title="Print / Save Keepsake"
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(letter.id)}
              title="Delete letter"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>
          </div>
        </div>

        {/* Letter Head with Wax Seal */}
        <div className="text-center pb-6 border-b border-black/10 dark:border-white/10 mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500 text-white text-xl shadow-md border-2 border-white/50 mb-1">
            {getWaxSealEmoji()}
          </div>

          <div className="text-[11px] uppercase tracking-widest font-bold opacity-75">
            {letter.occasion || 'Private Love Letter'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight px-4">
            {letter.title}
          </h2>

          <p className="text-xs opacity-75">
            Written with devotion by <strong className="font-semibold">{letter.senderName}</strong> on{' '}
            {new Date(letter.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Voice Note Attachment Player */}
        {letter.audioUrl && (
          <div className="mb-6 p-3 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 flex items-center gap-3">
            <button
              type="button"
              onClick={toggleVoicePlay}
              className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>🎙️ Voice Note from {letter.senderName}</span>
                <span className="text-[10px] opacity-70">
                  {isPlayingAudio ? 'Playing...' : 'Tap to listen'}
                </span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-150"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Letter Body */}
        <div className={`px-2 whitespace-pre-wrap ${getFontClass()} ${getFontSizeClass()}`}>
          {letter.content}
        </div>

        {/* Polaroid Attachment */}
        {letter.polaroidUrl && (
          <div className="my-8 flex justify-center">
            <div className="bg-white p-3 pb-6 rounded shadow-xl border border-black/10 max-w-xs rotate-[-2deg] hover:rotate-0 transition-transform">
              <div className="w-full h-56 rounded bg-black/5 overflow-hidden">
                <img
                  src={letter.polaroidUrl}
                  alt="Polaroid Memory"
                  className="w-full h-full object-cover"
                />
              </div>
              {letter.polaroidCaption && (
                <p className="font-handwriting text-lg text-slate-800 text-center mt-3">
                  {letter.polaroidCaption}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Letter Sign-off */}
        <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 text-center space-y-2">
          <p className="font-handwriting text-2xl sm:text-3xl text-rose-600 block">
            With all my love forever and always 💕
          </p>
          <p className="text-xs opacity-60">
            {letter.senderName} • {new Date(letter.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Bottom Reply Action */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => onReply(letter)}
            className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <CornerUpLeft className="w-4 h-4" /> Reply with a Love Letter
          </button>
        </div>
      </div>
    </div>
  );
};
