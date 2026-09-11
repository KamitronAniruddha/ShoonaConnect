import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import type { ChessMoveRecord } from '../../types/chess';
import { ChessPieceIcon } from './ChessPieces';

interface ChessMoveHistoryProps {
  moves: ChessMoveRecord[];
  currentMoveIndex: number; // -1 means starting position, moves.length - 1 means latest
  onSelectMoveIndex: (index: number) => void;
  pgn: string;
  capturedWhite: string[]; // pieces captured by white
  capturedBlack: string[]; // pieces captured by black
}

export const ChessMoveHistory: React.FC<ChessMoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMoveIndex,
  pgn,
  capturedWhite,
  capturedBlack,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Group moves into turns (white move + black move)
  const movePairs = useMemo(() => {
    const pairs: { moveNumber: number; white?: ChessMoveRecord; black?: ChessMoveRecord; whiteIndex: number; blackIndex?: number }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: moves[i],
        whiteIndex: i,
        black: moves[i + 1],
        blackIndex: i + 1 < moves.length ? i + 1 : undefined,
      });
    }
    return pairs;
  }, [moves]);

  const handleCopyPgn = async () => {
    try {
      await navigator.clipboard.writeText(pgn || 'No moves yet');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-[#150f14] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Header & PGN copy */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1b1219]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            Move Notation
          </span>
          <span className="text-[10px] bg-white/10 text-neutral-400 px-2 py-0.5 rounded-full font-mono">
            {moves.length} plies
          </span>
        </div>

        <button
          onClick={handleCopyPgn}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 transition-all cursor-pointer"
          title="Copy PGN Notation"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'PGN'}</span>
        </button>
      </div>

      {/* Captured Pieces Trays */}
      <div className="px-4 py-2 bg-black/20 border-b border-white/5 space-y-1 text-xs">
        {/* White captures */}
        <div className="flex items-center gap-1.5 h-6 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-neutral-500 font-bold uppercase w-10 shrink-0">
            White:
          </span>
          <div className="flex items-center gap-0.5">
            {capturedWhite.length === 0 ? (
              <span className="text-[11px] text-neutral-600 italic">None</span>
            ) : (
              capturedWhite.map((piece, idx) => (
                <div key={idx} className="w-4 h-4 shrink-0">
                  <ChessPieceIcon type={piece.toLowerCase() as any} color="b" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Black captures */}
        <div className="flex items-center gap-1.5 h-6 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-neutral-500 font-bold uppercase w-10 shrink-0">
            Black:
          </span>
          <div className="flex items-center gap-0.5">
            {capturedBlack.length === 0 ? (
              <span className="text-[11px] text-neutral-600 italic">None</span>
            ) : (
              capturedBlack.map((piece, idx) => (
                <div key={idx} className="w-4 h-4 shrink-0">
                  <ChessPieceIcon type={piece.toLowerCase() as any} color="w" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Moves Scrollable Table */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 max-h-56 sm:max-h-72 font-mono text-xs">
        {movePairs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs italic">
            Game awaiting opening move...
          </div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteSelected = currentMoveIndex === pair.whiteIndex;
            const isBlackSelected = pair.blackIndex !== undefined && currentMoveIndex === pair.blackIndex;

            return (
              <div
                key={pair.moveNumber}
                className="grid grid-cols-12 gap-1 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors items-center"
              >
                <span className="col-span-2 text-neutral-500 font-semibold select-none text-[11px]">
                  {pair.moveNumber}.
                </span>

                {/* White Move */}
                <button
                  onClick={() => onSelectMoveIndex(pair.whiteIndex)}
                  className={`col-span-5 text-left px-2 py-0.5 rounded font-bold transition-all cursor-pointer truncate ${
                    isWhiteSelected
                      ? 'bg-[#ff3377] text-white shadow-sm'
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  {pair.white?.san}
                </button>

                {/* Black Move */}
                {pair.black && pair.blackIndex !== undefined ? (
                  <button
                    onClick={() => onSelectMoveIndex(pair.blackIndex!)}
                    className={`col-span-5 text-left px-2 py-0.5 rounded font-bold transition-all cursor-pointer truncate ${
                      isBlackSelected
                        ? 'bg-[#ff3377] text-white shadow-sm'
                        : 'text-neutral-200 hover:text-white'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                ) : (
                  <span className="col-span-5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Buttons: First, Prev, Next, Last */}
      <div className="flex items-center justify-between p-2.5 bg-[#1b1219] border-t border-white/5">
        <button
          onClick={() => onSelectMoveIndex(-1)}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Beginning of Game"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMoveIndex(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex === -1}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Previous Move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-neutral-400 font-mono">
          {currentMoveIndex + 1} / {moves.length}
        </span>

        <button
          onClick={() => onSelectMoveIndex(Math.min(moves.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Next Move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMoveIndex(moves.length - 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          title="Latest Position"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
