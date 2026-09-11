import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { ChessPieceIcon } from './ChessPieces';
import { BOARD_THEMES } from './ChessBoardThemes';
import type { BoardThemeId, PieceStyleId, ChessColor } from '../../types/chess';
import {
  playChessMoveSound,
  playChessCaptureSound,
  playChessCheckSound,
  playChessCastleSound,
  playChessPromotionSound,
} from '../../utils/chessAudio';

interface ChessBoardProps {
  fen: string;
  orientation?: 'w' | 'b';
  interactive?: boolean;
  themeId?: BoardThemeId;
  pieceStyle?: PieceStyleId;
  showLegalMoves?: boolean;
  showCoordinates?: boolean;
  lastMove?: { from: string; to: string } | null;
  onMove?: (from: string, to: string, promotion?: string) => void;
  soundEnabled?: boolean;
  customSquareHighlights?: Record<string, string>;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  orientation = 'w',
  interactive = true,
  themeId = 'pink',
  pieceStyle = 'classic',
  showLegalMoves = true,
  showCoordinates = true,
  lastMove = null,
  onMove,
  soundEnabled = true,
  customSquareHighlights = {},
}) => {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<string | null>(null);

  // Reconstruct chess instance from current FEN
  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  const currentTurn = chess.turn();
  const inCheck = chess.inCheck();

  // Find king in check square
  const kingInCheckSquare = useMemo(() => {
    if (!inCheck) return null;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          const file = String.fromCharCode('a'.charCodeAt(0) + c);
          const rank = 8 - r;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [chess, inCheck, currentTurn]);

  // Compute legal moves for the selected square
  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !interactive) return [];
    try {
      const moves = chess.moves({ square: selectedSquare as any, verbose: true });
      return moves;
    } catch {
      return [];
    }
  }, [chess, selectedSquare, interactive]);

  const legalSquaresMap = useMemo(() => {
    const map = new Map<string, { isCapture: boolean; isPromotion: boolean }>();
    legalMovesForSelected.forEach((m) => {
      map.set(m.to, {
        isCapture: Boolean(m.captured),
        isPromotion: Boolean(m.promotion),
      });
    });
    return map;
  }, [legalMovesForSelected]);

  // Grid coordinates based on orientation
  const ranks = orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.pink;

  // Handle piece drop or click move execution
  const executeMove = (from: string, to: string, promo?: string) => {
    if (!onMove) return;

    // Check if it's pawn promotion needing selection
    const piece = chess.get(from as any);
    if (
      piece &&
      piece.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1')) &&
      !promo
    ) {
      setPendingPromotion({ from, to });
      return;
    }

    // Play sounds
    if (soundEnabled) {
      const targetPiece = chess.get(to as any);
      if (promo) {
        playChessPromotionSound();
      } else if (targetPiece) {
        playChessCaptureSound();
      } else if (piece?.type === 'k' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) > 1) {
        playChessCastleSound();
      } else {
        playChessMoveSound();
      }
    }

    onMove(from, to, promo || 'q');
    setSelectedSquare(null);
    setDraggedSquare(null);
  };

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    // If a promotion is currently awaiting modal, do nothing
    if (pendingPromotion) return;

    const clickedPiece = chess.get(square as any);

    // If currently selected, clicking the destination
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        return;
      }

      if (legalSquaresMap.has(square)) {
        // Legal move clicked!
        executeMove(selectedSquare, square);
        return;
      }

      // If clicked own piece, reselect
      if (clickedPiece && clickedPiece.color === orientation) {
        setSelectedSquare(square);
        return;
      }

      // Deselect on empty or illegal square
      setSelectedSquare(null);
      return;
    }

    // First click: select piece if belongs to player turn/orientation
    if (clickedPiece && clickedPiece.color === orientation) {
      setSelectedSquare(square);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (!interactive) return;
    const piece = chess.get(square as any);
    if (piece && piece.color === orientation) {
      setDraggedSquare(square);
      setSelectedSquare(square);
      e.dataTransfer.setData('text/plain', square);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    if (!draggedSquare || !interactive) return;
    if (draggedSquare === targetSquare) return;

    if (legalSquaresMap.has(targetSquare)) {
      executeMove(draggedSquare, targetSquare);
    }
    setDraggedSquare(null);
  };

  return (
    <div className="relative w-full max-w-[560px] aspect-square select-none mx-auto">
      {/* Outer Luxury Frame */}
      <div
        className={`w-full h-full rounded-2xl overflow-hidden border-2 shadow-2xl p-1.5 transition-all duration-300 ${theme.borderClass}`}
        style={{
          background: 'linear-gradient(145deg, #1f141d 0%, #120c11 100%)',
        }}
      >
        {/* The 8x8 Grid */}
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden relative shadow-inner">
          {ranks.map((rank, rankIdx) =>
            files.map((file, fileIdx) => {
              const square = `${file}${rank}`;
              const isLight = (rankIdx + fileIdx) % 2 === 0;
              const squareColor = isLight ? theme.lightSquare : theme.darkSquare;
              const piece = chess.get(square as any);

              const isSelected = selectedSquare === square;
              const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
              const isKingCheck = kingInCheckSquare === square;
              const legalMoveInfo = legalSquaresMap.get(square);
              const customHighlight = customSquareHighlights[square];

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, square)}
                  className="relative w-full h-full flex items-center justify-center cursor-pointer transition-colors duration-100"
                  style={{
                    backgroundColor: customHighlight || squareColor,
                  }}
                >
                  {/* Last move overlay */}
                  {isLastMove && !isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{ backgroundColor: theme.lastMoveSquare }}
                    />
                  )}

                  {/* Selected square overlay */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none ring-2 ring-inset ring-[#ff3377]"
                      style={{ backgroundColor: theme.selectedSquare }}
                    />
                  )}

                  {/* King in Check Red Glow */}
                  {isKingCheck && (
                    <div
                      className="absolute inset-0 pointer-events-none animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0.2) 75%)',
                      }}
                    />
                  )}

                  {/* Legal Move Indicators */}
                  {showLegalMoves && legalMoveInfo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {legalMoveInfo.isCapture || piece ? (
                        // Ring for captures
                        <div
                          className="w-10/12 h-10/12 rounded-full border-4 border-dashed animate-pulse"
                          style={{ borderColor: theme.legalMoveIndicator }}
                        />
                      ) : (
                        // Dot for quiet moves
                        <div
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-md"
                          style={{ backgroundColor: theme.legalMoveIndicator }}
                        />
                      )}
                    </div>
                  )}

                  {/* Coordinate Numbers (Rank) on leftmost file */}
                  {showCoordinates && fileIdx === 0 && (
                    <span
                      className={`absolute top-1 left-1.5 text-[10px] sm:text-xs font-black select-none pointer-events-none ${
                        isLight ? 'text-black/40' : 'text-white/50'
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* Coordinate Letters (File) on bottommost rank */}
                  {showCoordinates && rankIdx === 7 && (
                    <span
                      className={`absolute bottom-0.5 right-1.5 text-[10px] sm:text-xs font-black select-none pointer-events-none ${
                        isLight ? 'text-black/40' : 'text-white/50'
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Piece Representation */}
                  {piece && (
                    <div
                      draggable={interactive && piece.color === orientation}
                      onDragStart={(e) => handleDragStart(e, square)}
                      className={`relative z-20 w-10/12 h-10/12 flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-150 ${
                        isSelected ? 'scale-110 -translate-y-1' : 'hover:scale-105'
                      }`}
                    >
                      <ChessPieceIcon
                        type={piece.type}
                        color={piece.color}
                        styleId={pieceStyle}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#1b1019] border border-[#ff3377]/40 p-5 rounded-2xl shadow-2xl text-center space-y-4 max-w-xs w-full">
            <div className="text-sm font-bold text-white font-fraunces">
              Crown Your Pawn 💕
            </div>
            <p className="text-xs text-neutral-300">Choose promotion piece:</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'q', label: 'Queen' },
                { type: 'r', label: 'Rook' },
                { type: 'b', label: 'Bishop' },
                { type: 'n', label: 'Knight' },
              ].map((p) => (
                <button
                  key={p.type}
                  onClick={() => {
                    executeMove(pendingPromotion.from, pendingPromotion.to, p.type);
                    setPendingPromotion(null);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-[#ff3377]/20 border border-white/10 hover:border-[#ff3377] transition-all flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10">
                    <ChessPieceIcon
                      type={p.type as any}
                      color={orientation}
                      styleId={pieceStyle}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-300 group-hover:text-white font-semibold">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setPendingPromotion(null)}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
