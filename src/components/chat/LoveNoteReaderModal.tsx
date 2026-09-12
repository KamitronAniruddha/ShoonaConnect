import React, { useState } from 'react';
import {
  X,
  Heart,
  Sparkles,
  Bookmark,
  Smile,
  Send,
  Check,
  Clock,
  Feather,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoveNoteData, UserProfile } from '../../types';
import { playWaxCrackSound, playLoveNoteChime } from '../../utils/chatService';

interface LoveNoteReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  loveNote: LoveNoteData;
  senderName: string;
  senderPhoto?: string;
  sentAt?: string;
  isMe: boolean;
  onReact: (reactionEmoji: string) => void;
  onSaveToVault?: () => void;
}

const WAX_SEALS: Record<string, { emoji: string; color: string; label: string }> = {
  rose: { emoji: '🌹', color: '#be123c', label: 'Rose Seal' },
  heart: { emoji: '💖', color: '#e11d48', label: 'Heart Seal' },
  kiss: { emoji: '💋', color: '#9f1239', label: 'Kiss Seal' },
  dove: { emoji: '🕊️', color: '#b45309', label: 'Golden Dove' },
  crown: { emoji: '👑', color: '#854d0e', label: 'Royal Crown' },
};

const THEME_STYLES: Record<
  string,
  {
    bg: string;
    text: string;
    border: string;
    font: string;
    shadow: string;
    accent: string;
  }
> = {
  rose: {
    bg: 'bg-gradient-to-br from-rose-950 via-neutral-900 to-pink-950',
    text: 'text-rose-100',
    border: 'border-rose-500/30',
    font: 'font-serif',
    shadow: 'shadow-rose-950/50',
    accent: 'text-rose-300',
  },
  golden: {
    bg: 'bg-gradient-to-br from-amber-950 via-neutral-900 to-yellow-950',
    text: 'text-amber-100',
    border: 'border-amber-500/30',
    font: 'font-serif',
    shadow: 'shadow-amber-950/50',
    accent: 'text-amber-300',
  },
  midnight: {
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
    text: 'text-indigo-100',
    border: 'border-indigo-500/30',
    font: 'font-sans',
    shadow: 'shadow-indigo-950/50',
    accent: 'text-indigo-300',
  },
  sunset: {
    bg: 'bg-gradient-to-br from-orange-950 via-neutral-900 to-rose-950',
    text: 'text-orange-100',
    border: 'border-orange-500/30',
    font: 'font-serif',
    shadow: 'shadow-orange-950/50',
    accent: 'text-orange-300',
  },
  parchment: {
    bg: 'bg-[#faf3e0] dark:bg-[#1a1412]',
    text: 'text-amber-950 dark:text-amber-100',
    border: 'border-amber-600/30',
    font: 'font-serif',
    shadow: 'shadow-amber-900/30',
    accent: 'text-amber-800 dark:text-amber-300',
  },
  galaxy: {
    bg: 'bg-gradient-to-br from-[#0c0824] via-[#1a0f3c] to-[#090b1e]',
    text: 'text-purple-100',
    border: 'border-purple-500/30',
    font: 'font-sans',
    shadow: 'shadow-purple-950/50',
    accent: 'text-purple-300',
  },
};

export const LoveNoteReaderModal: React.FC<LoveNoteReaderModalProps> = ({
  isOpen,
  onClose,
  loveNote,
  senderName,
  senderPhoto,
  sentAt,
  isMe,
  onReact,
  onSaveToVault,
}) => {
  const [isCracked, setIsCracked] = useState(Boolean(loveNote.isOpened));
  const [savedToVault, setSavedToVault] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  if (!isOpen) return null;

  const sealType = loveNote.waxSeal || 'rose';
  const sealConfig = WAX_SEALS[sealType] || WAX_SEALS.rose;
  const theme = THEME_STYLES[loveNote.style] || THEME_STYLES.rose;

  const handleCrackSeal = () => {
    if (isCracked) return;
    playWaxCrackSound();
    setIsCracked(true);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#ff4d8d', '#e11d48', '#fbbf24', '#ffffff'],
    });

    setTimeout(() => {
      playLoveNoteChime();
    }, 200);
  };

  const handleReactionClick = (emoji: string) => {
    setSelectedReaction(emoji);
    onReact(emoji);

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.7 },
    });
  };

  const handleSaveVault = () => {
    setSavedToVault(true);
    if (onSaveToVault) {
      onSaveToVault();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border ${theme.border} ${theme.bg} ${theme.shadow} shadow-2xl overflow-hidden flex flex-col transition-all duration-500`}
      >
        {/* Top bar */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
              <Heart className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                Private Love Note from {senderName}
              </h3>
              {loveNote.openWhen && (
                <p className="text-[10px] text-rose-300 font-medium italic">
                  💌 Prompt: {loveNote.openWhen}
                </p>
              )}
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

        {/* Note Body or Sealed Envelope */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[280px] text-center relative select-none">
          {!isCracked && !isMe ? (
            <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="relative cursor-pointer group" onClick={handleCrackSeal}>
                {/* Envelope Backing */}
                <div className="w-44 h-32 bg-rose-900/40 rounded-2xl border-2 border-rose-500/40 shadow-xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-x-0 top-0 h-16 bg-rose-900/60 border-b border-rose-500/30 transform rotate-180 -skew-y-3 opacity-60" />
                  <div className="text-center p-3 relative z-10">
                    <p className="text-[11px] font-medium text-rose-200 uppercase tracking-widest">
                      Sealed with Love
                    </p>
                    <p className="text-[10px] text-rose-300/80 mt-1">
                      {loveNote.openWhen ? `"${loveNote.openWhen}"` : 'For your eyes only'}
                    </p>
                  </div>
                </div>

                {/* Wax Seal Button */}
                <button
                  type="button"
                  onClick={handleCrackSeal}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-2xl border-2 border-white/40 cursor-pointer transform hover:scale-110 active:scale-95 transition-all"
                  style={{
                    backgroundColor: sealConfig.color,
                    boxShadow: `0 8px 24px ${sealConfig.color}66`,
                  }}
                  title="Click to break the wax seal"
                >
                  <span className="drop-shadow-md">{sealConfig.emoji}</span>
                </button>
              </div>

              <div className="pt-6">
                <p className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Tap the wax seal to unwrap
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full animate-in fade-in duration-500">
              {/* Sender Quote Header */}
              <div className="flex items-center justify-center gap-2 opacity-60">
                <Feather className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-semibold">
                  Written with all my heart
                </span>
                <Feather className="w-4 h-4 -scale-x-100" />
              </div>

              {/* Romantic Note Text */}
              <div className="max-w-md mx-auto py-2">
                <p
                  className={`text-base sm:text-xl md:text-2xl leading-relaxed italic ${theme.font} ${theme.text}`}
                >
                  "{loveNote.note}"
                </p>
              </div>

              {/* Signature */}
              <div className="pt-2 flex flex-col items-center">
                <span className="text-xs font-serif font-bold text-rose-300">
                  Forever yours, {senderName} 💕
                </span>
                {sentAt && (
                  <span className="text-[10px] text-neutral-400 mt-0.5">
                    {new Date(sentAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reaction Bar & Save to Vault */}
        {(isCracked || isMe) && (
          <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mr-1">
                React:
              </span>
              {[
                { emoji: '💋', label: 'Kiss' },
                { emoji: '💖', label: 'Melted' },
                { emoji: '🥺', label: 'Tears' },
                { emoji: '💍', label: 'Marry' },
                { emoji: '🫂', label: 'Hug' },
              ].map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReactionClick(emoji)}
                  className={`p-2 rounded-xl text-lg hover:bg-white/10 transition-transform active:scale-125 cursor-pointer ${
                    selectedReaction === emoji ? 'bg-rose-500/30 scale-110 ring-1 ring-rose-400' : ''
                  }`}
                  title={label}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveVault}
                disabled={savedToVault}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  savedToVault
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-neutral-200'
                }`}
              >
                {savedToVault ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> In Love Vault
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Save in Vault
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
