import { Chess } from 'chess.js';
import type { ChessColor } from '../types/chess';

// Standard piece values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables for positional evaluation
// (from white's perspective; flipped for black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_MIDGAME_TABLE = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20,
];

function getSquareIndex(square: string): number {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1], 10);
  return rank * 8 + file;
}

/**
 * Static evaluation of a chess position
 * Positive score favours White; negative score favours Black.
 */
export function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -30000 : 30000;
  }
  if (game.isDraw()) {
    return 0;
  }

  let evaluation = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      const squareIdx = r * 8 + c;
      const flippedIdx = (7 - r) * 8 + c;

      let posBonus = 0;
      switch (piece.type) {
        case 'p':
          posBonus = piece.color === 'w' ? PAWN_TABLE[squareIdx] : PAWN_TABLE[flippedIdx];
          break;
        case 'n':
          posBonus = piece.color === 'w' ? KNIGHT_TABLE[squareIdx] : KNIGHT_TABLE[flippedIdx];
          break;
        case 'b':
          posBonus = piece.color === 'w' ? BISHOP_TABLE[squareIdx] : BISHOP_TABLE[flippedIdx];
          break;
        case 'r':
          posBonus = piece.color === 'w' ? ROOK_TABLE[squareIdx] : ROOK_TABLE[flippedIdx];
          break;
        case 'q':
          posBonus = piece.color === 'w' ? QUEEN_TABLE[squareIdx] : QUEEN_TABLE[flippedIdx];
          break;
        case 'k':
          posBonus = piece.color === 'w' ? KING_MIDGAME_TABLE[squareIdx] : KING_MIDGAME_TABLE[flippedIdx];
          break;
      }

      const totalVal = baseVal + posBonus;
      if (piece.color === 'w') {
        evaluation += totalVal;
      } else {
        evaluation -= totalVal;
      }
    }
  }

  return evaluation;
}

/**
 * Move ordering for faster alpha-beta pruning
 */
function scoreMoveForOrdering(game: Chess, move: any): number {
  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 100;
    const attackerVal = PIECE_VALUES[move.piece] || 100;
    score += 10 * victimVal - attackerVal; // MVV-LVA
  }
  if (move.promotion) {
    score += 800;
  }
  if (game.inCheck()) {
    score += 50;
  }
  return score;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: any } {
  if (depth === 0 || game.isGameOver()) {
    return { score: evaluatePosition(game) };
  }

  const moves = game.moves({ verbose: true });
  moves.sort((a, b) => scoreMoveForOrdering(game, b) - scoreMoveForOrdering(game, a));

  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      game.move(move);
      const result = minimax(game, depth - 1, alpha, beta, false);
      game.undo();

      if (result.score > maxEval) {
        maxEval = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break; // Pruning
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      game.move(move);
      const result = minimax(game, depth - 1, alpha, beta, true);
      game.undo();

      if (result.score < minEval) {
        minEval = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break; // Pruning
    }
    return { score: minEval, bestMove };
  }
}

export interface AIPersonality {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  depth: number;
  randomness: number; // probability of choosing a suboptimal move (0 to 1)
  blunderChance: number;
  style: 'balanced' | 'aggressive' | 'tactical' | 'positional' | 'defensive' | 'beginner';
}

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  beginner: {
    id: 'beginner',
    name: 'The Playful Soul',
    avatar: '🧸',
    tagline: 'Learning the rules and having fun!',
    description: 'Makes casual moves, loves pushing pawns, and occasionally blunders for laughs.',
    depth: 1,
    randomness: 0.6,
    blunderChance: 0.35,
    style: 'beginner',
  },
  strategist: {
    id: 'strategist',
    name: 'The Strategist',
    avatar: '🦉',
    tagline: 'Patient, positional mastery.',
    description: 'Develops slowly, controls the center, and avoids unnecessary complications.',
    depth: 3,
    randomness: 0.1,
    blunderChance: 0.05,
    style: 'positional',
  },
  tactician: {
    id: 'tactician',
    name: 'The Tactician',
    avatar: '⚡',
    tagline: 'Loves forks, pins, and quick attacks.',
    description: 'Always scanning for sharp combinations and tactical shots.',
    depth: 3,
    randomness: 0.1,
    blunderChance: 0.06,
    style: 'tactical',
  },
  aggressor: {
    id: 'aggressor',
    name: 'The Romantic Knight',
    avatar: '⚔️',
    tagline: 'Bold sacrifices and romantic flair.',
    description: 'Launches knights, pushes pawns, and attacks your king with passion.',
    depth: 3,
    randomness: 0.15,
    blunderChance: 0.08,
    style: 'aggressive',
  },
  defender: {
    id: 'defender',
    name: 'The Castle Guardian',
    avatar: '🏰',
    tagline: 'Castles early, solidly fortified.',
    description: 'A fortress mindset. Patiently defends and waits for your counter-mistakes.',
    depth: 3,
    randomness: 0.1,
    blunderChance: 0.05,
    style: 'defensive',
  },
  master: {
    id: 'master',
    name: 'The Grandmaster',
    avatar: '👑',
    tagline: 'Precise calculation, zero mercy.',
    description: 'Calculates 4 to 5 plies ahead. Plays the strongest theoretical moves.',
    depth: 4,
    randomness: 0.01,
    blunderChance: 0.0,
    style: 'balanced',
  },
};

/**
 * Compute the next best move for the AI opponent
 */
export async function getAIMove(
  fen: string,
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master' = 'intermediate',
  personalityId: string = 'strategist'
): Promise<{ from: string; to: string; promotion?: string; san: string } | null> {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;

  const personality = AI_PERSONALITIES[personalityId] || AI_PERSONALITIES.strategist;
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Map difficulty to calculation depth
  let searchDepth = personality.depth;
  if (difficulty === 'beginner') searchDepth = 1;
  else if (difficulty === 'easy') searchDepth = 2;
  else if (difficulty === 'intermediate') searchDepth = 3;
  else if (difficulty === 'advanced') searchDepth = 3;
  else if (difficulty === 'expert') searchDepth = 4;
  else if (difficulty === 'master') searchDepth = 4;

  const isWhite = game.turn() === 'w';

  // Apply personality randomness or blunder
  const roll = Math.random();
  if (roll < personality.blunderChance && moves.length > 1) {
    // Pick a suboptimal or random move
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.from,
      to: randomMove.to,
      promotion: randomMove.promotion || 'q',
      san: randomMove.san,
    };
  }

  // Artificial thinking delay (simulate human consideration: 300ms - 800ms)
  await new Promise((res) => setTimeout(res, 350 + Math.random() * 400));

  const { bestMove } = minimax(game, searchDepth, -Infinity, Infinity, isWhite);

  if (!bestMove) {
    const fallback = moves[0];
    return {
      from: fallback.from,
      to: fallback.to,
      promotion: fallback.promotion || 'q',
      san: fallback.san,
    };
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || 'q',
    san: bestMove.san,
  };
}

/**
 * Get position evaluation and hint for the user
 */
export function getPositionHint(fen: string): {
  evalScore: number; // e.g. +1.5 or -0.8
  evalText: string;
  bestMoveSan?: string;
  bestMoveFrom?: string;
  bestMoveTo?: string;
  explanation: string;
} {
  const game = new Chess(fen);
  if (game.isGameOver()) {
    return {
      evalScore: 0,
      evalText: game.isCheckmate() ? 'Checkmate' : 'Game Over',
      explanation: 'The game has concluded.',
    };
  }

  const isWhite = game.turn() === 'w';
  const { score, bestMove } = minimax(game, 3, -Infinity, Infinity, isWhite);

  const centipawns = score;
  const evalInPawns = Math.round((centipawns / 100) * 10) / 10;
  const evalText =
    evalInPawns > 0
      ? `+${evalInPawns} (White advantage)`
      : evalInPawns < 0
      ? `${evalInPawns} (Black advantage)`
      : '0.0 (Equal position)';

  let explanation = 'Look for active piece placement and king safety.';
  if (bestMove) {
    if (bestMove.captured) {
      explanation = `Tactical opportunity: Capture on ${bestMove.to} to gain tempo and material.`;
    } else if (bestMove.san.startsWith('O-O')) {
      explanation = 'Castling secures the king and connects the rooks.';
    } else if (['d4', 'e4', 'd5', 'e5'].includes(bestMove.to)) {
      explanation = `Control the key central square ${bestMove.to}.`;
    } else {
      explanation = `Develop piece to ${bestMove.to} to exert pressure.`;
    }
  }

  return {
    evalScore: evalInPawns,
    evalText,
    bestMoveSan: bestMove?.san,
    bestMoveFrom: bestMove?.from,
    bestMoveTo: bestMove?.to,
    explanation,
  };
}
