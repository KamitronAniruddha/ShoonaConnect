import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Heart,
  RotateCcw,
  Sparkles,
  Calendar,
  BookmarkPlus,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import type { ChessGame } from '../../types/chess';
import {
  saveChessGameAsMemory,
  scheduleChessDateNight,
  requestRematch,
} from '../../utils/chessService';
import { playChessVictorySound, playChessDrawSound } from '../../utils/chessAudio';

interface ChessPostGameModalProps {
  game: ChessGame;
  user: { uid: string; displayName: string };
  partnerName: string;
  onClose: () => void;
  onRematchStarted: (newGameId: string) => void;
  onOpenAnalysis: () => void;
}

export const ChessPostGameModal: React.FC<ChessPostGameModalProps> = ({
  game,
  user,
  partnerName,
  onClose,
  onRematchStarted,
  onOpenAnalysis,
}) => {
  const [memoryNote, setMemoryNote] = useState('');
  const [isSavedMemory, setIsSavedMemory] = useState(game.savedToMemories || false);
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  const [dateScheduled, setDateScheduled] = useState(false);
  const [rematchLoading, setRematchLoading] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const isWinner = game.winnerId === user.uid;
  const isDraw = game.result === '1/2-1/2';

  // Trigger celebration effects
  useEffect(() => {
    if (isWinner) {
      playChessVictorySound();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff3377', '#ff66aa', '#ffd700', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } else if (isDraw) {
      playChessDrawSound();
    }
  }, [isWinner, isDraw]);

  const handleSaveMemory = async () => {
    if (isSavedMemory || isSavingMemory) return;
    setIsSavingMemory(true);
    await saveChessGameAsMemory(game.coupleId, game, user, memoryNote);
    setIsSavingMemory(false);
    setIsSavedMemory(true);
  };

  const handleScheduleDate = async () => {
    if (dateScheduled) return;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    await scheduleChessDateNight(game.coupleId, tomorrow, partnerName);
    setDateScheduled(true);
  };

  const handleRematchClick = async () => {
    setRematchLoading(true);
    const newGameId = await requestRematch(game.coupleId, game, user.uid);
    setRematchLoading(false);
    if (newGameId) {
      onRematchStarted(newGameId);
    } else {
      setRematchRequested(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191017] border border-[#ff3377]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ff3377]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-xl shadow-pink-500/25 mx-auto">
            <div className="w-full h-full bg-[#160f14] rounded-[22px] flex items-center justify-center text-3xl">
              {isWinner ? '👑' : isDraw ? '🤝' : '♟️'}
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">
            {isWinner ? 'You Won! 🎉' : isDraw ? "It's a Draw! 🤝" : `Partner (${partnerName}) Won! ❤️`}
          </h2>

          <p className="text-sm text-neutral-300 font-medium">
            {game.winReason || (isWinner ? 'You outplayed your love!' : `${partnerName} claimed victory!`)}
          </p>
          <div className="text-xs text-neutral-400 font-mono">
            {game.moveCount} moves · {game.timeControl.label} · Final: {game.result}
          </div>
        </div>

        {/* Couple Memory Bridge Card */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Heart className="w-4 h-4 text-[#ff4d8d]" />
            <span>Preserve as Shared Couple Memory</span>
          </div>

          {!isSavedMemory ? (
            <div className="space-y-2">
              <input
                type="text"
                value={memoryNote}
                onChange={(e) => setMemoryNote(e.target.value)}
                placeholder="Optional sweet note about this match..."
                className="w-full bg-[#120a10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3377]"
              />
              <button
                onClick={handleSaveMemory}
                disabled={isSavingMemory}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isSavingMemory ? 'Saving...' : 'Save to Couple Memories 💕'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Saved into your shared Couple Memories Sanctuary!</span>
            </div>
          )}
        </div>

        {/* Date Night Scheduler Button */}
        {!dateScheduled ? (
          <button
            onClick={handleScheduleDate}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Schedule Candlelight Chess Date ♟️</span>
          </button>
        ) : (
          <div className="text-center text-xs text-amber-400 bg-amber-400/10 py-2 rounded-xl border border-amber-400/20 font-medium">
            ✨ Chess Date Night added to your calendar!
          </div>
        )}

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onOpenAnalysis}
            className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Game Review</span>
          </button>

          <button
            onClick={handleRematchClick}
            disabled={rematchLoading}
            className="py-3 rounded-xl bg-gradient-to-r from-[#ff3377] to-amber-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${rematchLoading ? 'animate-spin' : ''}`} />
            <span>{rematchRequested ? 'Rematch Sent!' : 'Play Rematch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
