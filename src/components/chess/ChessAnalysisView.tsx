import React, { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Zap,
  HelpCircle,
  AlertCircle,
  Award,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import type { ChessGame, BoardThemeId, PieceStyleId } from '../../types/chess';
import { getPositionHint, evaluatePosition } from '../../utils/chessAi';
import { identifyOpening } from '../../utils/chessOpenings';

interface ChessAnalysisViewProps {
  game: ChessGame;
  onBack: () => void;
  themeId?: BoardThemeId;
  pieceStyle?: PieceStyleId;
}

export const ChessAnalysisView: React.FC<ChessAnalysisViewProps> = ({
  game,
  onBack,
  themeId = 'pink',
  pieceStyle = 'classic',
}) => {
  const [currentPlyIndex, setCurrentPlyIndex] = useState(game.moves.length - 1);
  const [copiedPgn, setCopiedPgn] = useState(false);
  const [copiedFen, setCopiedFen] = useState(false);

  // Compute position at current ply
  const currentPosition = useMemo(() => {
    const chess = new Chess();
    if (currentPlyIndex === -1) {
      return { fen: chess.fen(), lastMove: null, currentMove: null };
    }

    let lastMove: { from: string; to: string } | null = null;
    let currentMove = null;

    for (let i = 0; i <= currentPlyIndex && i < game.moves.length; i++) {
      const m = game.moves[i];
      try {
        chess.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
        if (i === currentPlyIndex) {
          lastMove = { from: m.from, to: m.to };
          currentMove = m;
        }
      } catch {
        // ignore
      }
    }

    return {
      fen: chess.fen(),
      lastMove,
      currentMove,
    };
  }, [game.moves, currentPlyIndex]);

  // Position evaluation & hint
  const hint = useMemo(() => {
    return getPositionHint(currentPosition.fen);
  }, [currentPosition.fen]);

  // Opening detection
  const opening = useMemo(() => {
    return identifyOpening(game.pgn || game.moves.map((m) => m.san).join(' '));
  }, [game.pgn, game.moves]);

  // Evaluation bar height (-10 to +10 range -> 0% to 100% for white)
  const evalPercentage = useMemo(() => {
    const clamped = Math.max(-10, Math.min(10, hint.evalScore));
    return ((clamped + 10) / 20) * 100;
  }, [hint.evalScore]);

  const copyPgn = async () => {
    try {
      await navigator.clipboard.writeText(game.pgn);
      setCopiedPgn(true);
      setTimeout(() => setCopiedPgn(false), 2000);
    } catch {}
  };

  const copyFen = async () => {
    try {
      await navigator.clipboard.writeText(currentPosition.fen);
      setCopiedFen(true);
      setTimeout(() => setCopiedFen(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return</span>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-fraunces text-white">
              Game Review & Analysis
            </h2>
            <p className="text-xs text-neutral-400">
              {game.whitePlayer.displayName} vs {game.blackPlayer.displayName} · {game.timeControl.label} · Final: {game.result}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyPgn}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedPgn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPgn ? 'PGN Copied' : 'Export PGN'}</span>
          </button>
          <button
            onClick={copyFen}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedFen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFen ? 'FEN Copied' : 'Export FEN'}</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Eval Bar + Chess Board */}
        <div className="lg:col-span-8 flex gap-3 sm:gap-4 items-center justify-center">
          {/* Vertical Evaluation Bar */}
          <div className="w-4 sm:w-5 h-[340px] sm:h-[480px] bg-neutral-900 border border-white/15 rounded-full overflow-hidden flex flex-col justify-end relative shadow-lg shrink-0">
            <div
              className="w-full bg-white transition-all duration-300"
              style={{ height: `${evalPercentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black text-neutral-400 -rotate-90">
                {hint.evalScore > 0 ? `+${hint.evalScore}` : hint.evalScore}
              </span>
            </div>
          </div>

          {/* Board */}
          <div className="flex-1 max-w-[500px]">
            <ChessBoard
              fen={currentPosition.fen}
              orientation="w"
              interactive={false}
              themeId={themeId}
              pieceStyle={pieceStyle}
              lastMove={currentPosition.lastMove}
              showLegalMoves={false}
            />
          </div>
        </div>

        {/* Right Column: Engine Analysis, Opening Info, and Ply Nav */}
        <div className="lg:col-span-4 space-y-4">
          {/* Position Assessment Card */}
          <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Engine Assessment
                </h3>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                {hint.evalText}
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              {hint.explanation}
            </p>

            {hint.bestMoveSan && (
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Best engine continuation:</span>
                <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {hint.bestMoveSan}
                </span>
              </div>
            )}
          </div>

          {/* Opening Info Card */}
          {opening && (
            <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Identified Opening</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-fraunces">{opening.name}</h4>
                  <span className="text-[10px] font-mono bg-white/10 text-neutral-300 px-1.5 py-0.5 rounded">
                    {opening.eco}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#ff4d8d]">{opening.moves}</div>
                <p className="text-xs text-neutral-400 pt-1">{opening.description}</p>
              </div>
            </div>
          )}

          {/* Move Stepper Navigator */}
          <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Ply Navigation</span>
              <span className="font-mono">
                {currentPlyIndex + 1} / {game.moves.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrentPlyIndex(-1)}
                disabled={currentPlyIndex === -1}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPlyIndex(Math.max(-1, currentPlyIndex - 1))}
                disabled={currentPlyIndex === -1}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPlyIndex(Math.min(game.moves.length - 1, currentPlyIndex + 1))}
                disabled={currentPlyIndex >= game.moves.length - 1}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPlyIndex(game.moves.length - 1)}
                disabled={currentPlyIndex >= game.moves.length - 1}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
