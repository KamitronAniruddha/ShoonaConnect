import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import {
  Flame,
  Trophy,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ChessBoard } from './ChessBoard';
import {
  CHESS_PUZZLES,
  getPuzzleStreak,
  recordPuzzleAttempt,
  type PuzzleStreakData,
} from '../../utils/chessPuzzles';
import type { BoardThemeId, PieceStyleId } from '../../types/chess';
import { playChessVictorySound, playChessMoveSound } from '../../utils/chessAudio';

interface ChessPuzzlesViewProps {
  themeId?: BoardThemeId;
  pieceStyle?: PieceStyleId;
}

export const ChessPuzzlesView: React.FC<ChessPuzzlesViewProps> = ({
  themeId = 'pink',
  pieceStyle = 'classic',
}) => {
  const [selectedPuzzleIndex, setSelectedPuzzleIndex] = useState(0);
  const [streakData, setStreakData] = useState<PuzzleStreakData>(getPuzzleStreak());

  const currentPuzzle = CHESS_PUZZLES[selectedPuzzleIndex];

  const [currentFen, setCurrentFen] = useState(currentPuzzle.fen);
  const [currentMovePly, setCurrentMovePly] = useState(0);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Reset state on puzzle switch
  useEffect(() => {
    setCurrentFen(currentPuzzle.fen);
    setCurrentMovePly(0);
    setSolved(false);
    setFailed(false);
    setShowHint(false);
    setFeedbackMessage(`Find the best sequence for ${currentPuzzle.initialTurn === 'w' ? 'White' : 'Black'}.`);
  }, [currentPuzzle]);

  const handleUserMove = (from: string, to: string, promo?: string) => {
    if (solved || failed) return;

    const uciMove = `${from}${to}${promo && promo !== 'q' ? promo : ''}`;
    const expectedMove = currentPuzzle.moves[currentMovePly];

    // Check if move matches
    if (uciMove === expectedMove || `${from}${to}` === expectedMove) {
      // Correct player move!
      const chess = new Chess(currentFen);
      chess.move({ from, to, promotion: promo || 'q' });
      playChessMoveSound();

      const nextPly = currentMovePly + 1;

      if (nextPly >= currentPuzzle.moves.length) {
        // Puzzle fully completed!
        setCurrentFen(chess.fen());
        setSolved(true);
        setFeedbackMessage('Brilliant! Puzzle Solved! 🎉💕');
        playChessVictorySound();
        const updated = recordPuzzleAttempt(currentPuzzle.id, true);
        setStreakData(updated);
      } else {
        // Opponent counter-move
        const replyUci = currentPuzzle.moves[nextPly];
        const replyFrom = replyUci.substring(0, 2);
        const replyTo = replyUci.substring(2, 4);
        const replyPromo = replyUci.length > 4 ? replyUci[4] : 'q';

        setCurrentFen(chess.fen());
        setFeedbackMessage('Great move! Keep going...');

        setTimeout(() => {
          try {
            chess.move({ from: replyFrom, to: replyTo, promotion: replyPromo });
            playChessMoveSound();
            setCurrentFen(chess.fen());
            setCurrentMovePly(nextPly + 1);
          } catch {
            // ignore
          }
        }, 500);
      }
    } else {
      setFailed(true);
      setFeedbackMessage('Not quite the winning move! Try resetting to find the solution.');
      const updated = recordPuzzleAttempt(currentPuzzle.id, false);
      setStreakData(updated);
    }
  };

  const handleReset = () => {
    setCurrentFen(currentPuzzle.fen);
    setCurrentMovePly(0);
    setSolved(false);
    setFailed(false);
    setShowHint(false);
    setFeedbackMessage(`Find the best sequence for ${currentPuzzle.initialTurn === 'w' ? 'White' : 'Black'}.`);
  };

  const handleNextPuzzle = () => {
    setSelectedPuzzleIndex((prev) => (prev + 1) % CHESS_PUZZLES.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Daily Streak & Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-md flex items-center justify-center text-2xl">
            🔥
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Daily Streak
            </div>
            <div className="text-xl font-bold text-white font-fraunces">
              {streakData.currentStreak} Days
            </div>
            <span className="text-[10px] text-neutral-400">Best: {streakData.bestStreak} days</span>
          </div>
        </div>

        <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#ff3377] to-purple-500 p-0.5 shadow-md flex items-center justify-center text-2xl">
            🧩
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Solved Puzzles
            </div>
            <div className="text-xl font-bold text-white font-fraunces">
              {streakData.totalSolved} Completed
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">Keep sharpening tactics!</span>
          </div>
        </div>

        <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-0.5 shadow-md flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Current Puzzle
            </div>
            <div className="text-xl font-bold text-white font-fraunces">
              {currentPuzzle.rating} ELO
            </div>
            <span className="text-[10px] text-sky-400 font-semibold uppercase">
              {currentPuzzle.difficulty} · {currentPuzzle.theme}
            </span>
          </div>
        </div>
      </div>

      {/* Main Puzzle Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chess Board */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-[500px]">
            <ChessBoard
              fen={currentFen}
              orientation={currentPuzzle.initialTurn}
              interactive={!solved && !failed}
              themeId={themeId}
              pieceStyle={pieceStyle}
              onMove={handleUserMove}
            />
          </div>
        </div>

        {/* Right: Puzzle Details & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#150f14] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {currentPuzzle.theme} Tactics
              </div>
              <h3 className="text-xl font-bold font-fraunces text-white">
                {currentPuzzle.title}
              </h3>
              <p className="text-xs text-neutral-300">
                {currentPuzzle.description}
              </p>
            </div>

            {/* Feedback Banner */}
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                solved
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : failed
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : 'bg-white/5 border-white/10 text-neutral-300'
              }`}
            >
              {solved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : failed ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <HelpCircle className="w-5 h-5 text-[#ff4d8d] shrink-0" />
              )}
              <span>{feedbackMessage}</span>
            </div>

            {/* Hint Reveal */}
            {showHint ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                💡 <span className="font-semibold">Hint:</span> {currentPuzzle.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Show tactical hint</span>
              </button>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleNextPuzzle}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Puzzle List Selector */}
          <div className="bg-[#150f14] border border-white/10 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Puzzle Catalog ({CHESS_PUZZLES.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {CHESS_PUZZLES.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPuzzleIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between border transition-all cursor-pointer ${
                    selectedPuzzleIndex === idx
                      ? 'bg-[#ff3377]/15 border-[#ff3377]/40 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <span className="truncate max-w-[170px]">{p.title}</span>
                  <span className="text-[10px] font-mono text-[#ff4d8d]">{p.rating}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
