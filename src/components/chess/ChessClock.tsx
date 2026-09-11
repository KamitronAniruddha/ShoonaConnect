import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import type { ChessColor } from '../../types/chess';
import { playChessTickSound } from '../../utils/chessAudio';

interface ChessClockProps {
  player: {
    uid: string;
    displayName: string;
    photoURL?: string;
    petName?: string;
    color: ChessColor;
  };
  timeRemainingMs: number;
  isActiveTurn: boolean;
  isUntimed?: boolean;
  capturedMaterialDiff?: number; // e.g. +3
  onFlag?: () => void;
  soundEnabled?: boolean;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  player,
  timeRemainingMs,
  isActiveTurn,
  isUntimed = false,
  capturedMaterialDiff = 0,
  onFlag,
  soundEnabled = true,
}) => {
  const [currentMs, setCurrentMs] = useState(timeRemainingMs);

  // Sync with prop updates
  useEffect(() => {
    setCurrentMs(timeRemainingMs);
  }, [timeRemainingMs]);

  // Live countdown timer when active
  useEffect(() => {
    if (isUntimed || !isActiveTurn || currentMs <= 0) return;

    const interval = setInterval(() => {
      setCurrentMs((prev) => {
        const next = prev - 100;
        if (next <= 0) {
          clearInterval(interval);
          if (onFlag) onFlag();
          return 0;
        }

        // Ticking audio under 10 seconds
        if (next < 10000 && next % 1000 < 100 && soundEnabled) {
          playChessTickSound();
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActiveTurn, isUntimed, onFlag, soundEnabled]);

  // Format mm:ss
  const formatTime = (ms: number) => {
    if (isUntimed) return '∞';
    if (ms <= 0) return '00:00';
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    // Show tenths if under 15 seconds
    if (totalSec < 15) {
      return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = !isUntimed && currentMs > 0 && currentMs <= 30000;
  const isCriticalTime = !isUntimed && currentMs > 0 && currentMs <= 10000;
  const isFlagged = !isUntimed && currentMs <= 0;

  const isWhite = player.color === 'w';

  return (
    <div
      className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${
        isActiveTurn
          ? 'bg-gradient-to-r from-[#2a1725] to-[#180f16] border-[#ff3377] shadow-lg shadow-pink-500/20'
          : 'bg-[#150f14]/80 border-white/5 opacity-85'
      }`}
    >
      {/* Player identity & pieces */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-md border ${
              isWhite
                ? 'bg-gradient-to-b from-white to-neutral-200 text-neutral-900 border-neutral-300'
                : 'bg-gradient-to-b from-neutral-800 to-neutral-950 text-white border-white/20'
            }`}
          >
            {player.photoURL ? (
              <img
                src={player.photoURL}
                alt={player.displayName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span>{isWhite ? '♔' : '♚'}</span>
            )}
          </div>
          {isActiveTurn && (
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#150f14] animate-pulse" />
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide truncate max-w-[120px] sm:max-w-[160px]">
              {player.displayName}
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isWhite ? 'bg-white/20 text-white' : 'bg-black/40 text-neutral-300'
              }`}
            >
              {isWhite ? 'White' : 'Black'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            {player.petName && (
              <span className="text-[#ff4d8d] font-semibold italic">
                "{player.petName}"
              </span>
            )}
            {capturedMaterialDiff > 0 && (
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                +{capturedMaterialDiff}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock Digital Display */}
      <div
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-base sm:text-lg font-black tracking-wider transition-all duration-200 ${
          isFlagged
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            : isCriticalTime
            ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 animate-pulse'
            : isLowTime
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : isActiveTurn
            ? 'bg-[#ff3377]/15 text-white border border-[#ff3377]/30'
            : 'bg-black/30 text-neutral-400 border border-white/5'
        }`}
      >
        <Clock className={`w-4 h-4 ${isActiveTurn ? 'text-[#ff4d8d] animate-spin' : 'text-neutral-500'}`} />
        <span>{formatTime(currentMs)}</span>
      </div>
    </div>
  );
};
