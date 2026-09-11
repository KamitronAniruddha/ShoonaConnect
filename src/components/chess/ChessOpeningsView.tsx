import React, { useState, useMemo } from 'react';
import { Chess } from 'chess.js';
import { BookOpen, Sparkles, Trophy, ChevronRight, Zap } from 'lucide-react';
import { CHESS_OPENINGS } from '../../utils/chessOpenings';
import { ChessBoard } from './ChessBoard';
import type { BoardThemeId, PieceStyleId, ChessOpening } from '../../types/chess';

interface ChessOpeningsViewProps {
  themeId?: BoardThemeId;
  pieceStyle?: PieceStyleId;
}

export const ChessOpeningsView: React.FC<ChessOpeningsViewProps> = ({
  themeId = 'pink',
  pieceStyle = 'classic',
}) => {
  const [selectedEco, setSelectedEco] = useState<string>(CHESS_OPENINGS[0].eco);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const selectedOpening = useMemo(() => {
    return CHESS_OPENINGS.find((o) => o.eco === selectedEco) || CHESS_OPENINGS[0];
  }, [selectedEco]);

  // Compute FEN for the selected opening moves
  const openingFen = useMemo(() => {
    const chess = new Chess();
    const cleanMoves = selectedOpening.moves
      .replace(/\d+\./g, '')
      .split(/\s+/)
      .filter(Boolean);

    for (const m of cleanMoves) {
      try {
        chess.move(m);
      } catch {
        // ignore
      }
    }
    return chess.fen();
  }, [selectedOpening]);

  const filteredOpenings = useMemo(() => {
    if (activeCategory === 'all') return CHESS_OPENINGS;
    return CHESS_OPENINGS.filter((o) => o.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['all', 'Open Game', 'Semi-Open', 'Closed Game', 'Indian Defense', 'Flank'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#ff3377] text-white shadow-md shadow-pink-500/20'
                : 'bg-[#160f14] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            {cat === 'all' ? 'All Openings' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Opening List */}
        <div className="lg:col-span-5 bg-[#150f14] border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 pb-2 border-b border-white/5">
            <BookOpen className="w-4 h-4 text-[#ff4d8d]" />
            <span>Master Openings ({filteredOpenings.length})</span>
          </div>

          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredOpenings.map((op) => (
              <button
                key={op.eco}
                onClick={() => setSelectedEco(op.eco)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  selectedOpening.eco === op.eco
                    ? 'bg-gradient-to-r from-[#2a1725] to-[#180f16] border-[#ff3377] shadow-md shadow-pink-500/15'
                    : 'bg-white/5 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-[#ff4d8d] transition-colors">
                      {op.name}
                    </span>
                    <span className="text-[10px] font-mono bg-white/10 text-neutral-300 px-1.5 py-0.2 rounded">
                      {op.eco}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">
                    {op.moves}
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    selectedOpening.eco === op.eco ? 'text-[#ff4d8d] translate-x-0.5' : 'text-neutral-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Opening Board & Theory */}
        <div className="lg:col-span-7 space-y-5">
          {/* Board preview */}
          <div className="flex justify-center">
            <div className="w-full max-w-[420px]">
              <ChessBoard
                fen={openingFen}
                orientation="w"
                interactive={false}
                themeId={themeId}
                pieceStyle={pieceStyle}
                showLegalMoves={false}
              />
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-[#150f14] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-fraunces text-white">
                  {selectedOpening.name}
                </h3>
                <span className="text-xs text-[#ff4d8d] font-semibold">
                  {selectedOpening.category}
                </span>
              </div>
              <span className="text-sm font-mono font-black px-3 py-1 rounded-xl bg-white/10 text-white">
                {selectedOpening.eco}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 font-mono text-xs text-neutral-200">
              {selectedOpening.moves}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {selectedOpening.description}
            </p>

            {/* Win/Draw percentage bar */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                <span>White: {selectedOpening.winRateWhite}%</span>
                <span>Draw: {selectedOpening.drawRate}%</span>
                <span>Black: {selectedOpening.winRateBlack}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-white h-full"
                  style={{ width: `${selectedOpening.winRateWhite}%` }}
                />
                <div
                  className="bg-neutral-500 h-full"
                  style={{ width: `${selectedOpening.drawRate}%` }}
                />
                <div
                  className="bg-neutral-900 h-full"
                  style={{ width: `${selectedOpening.winRateBlack}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
