import type { ChessPuzzle } from '../types/chess';

export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: 'puz-1',
    title: "Scholar's Kiss Checkmate",
    theme: 'checkmate',
    difficulty: 'Easy',
    rating: 800,
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
    moves: ['f3f7'], // Qxf7#
    initialTurn: 'w',
    description: 'White has concentrated the queen and bishop on the weak f7 square.',
    hint: 'Deliver checkmate with Queen on f7.',
  },
  {
    id: 'puz-2',
    title: 'The Back-Rank Romance',
    theme: 'checkmate',
    difficulty: 'Easy',
    rating: 950,
    fen: '6k1/5ppp/8/8/8/8/4rPPP/1R4K1 w - - 0 1',
    moves: ['b1b8', 'e2e8', 'b8e8'], // Rb8+ Re8 Rxe8#
    initialTurn: 'w',
    description: 'Black has no escape flight square for their king on the back rank.',
    hint: 'Infiltrate with the rook to the 8th rank.',
  },
  {
    id: 'puz-3',
    title: 'Royal Knight Fork',
    theme: 'fork',
    difficulty: 'Medium',
    rating: 1200,
    fen: 'r3k2r/pppq1ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 7',
    moves: ['c3d5'],
    initialTurn: 'w',
    description: 'Place your knight on a central outpost that threatens both key pieces.',
    hint: 'Centralize the knight to exert maximum pressure.',
  },
  {
    id: 'puz-4',
    title: 'Absolute Pin on the Queen',
    theme: 'pin',
    difficulty: 'Medium',
    rating: 1350,
    fen: 'r1b1k2r/ppp2ppp/2n5/3qp3/1b6/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 8',
    moves: ['e1g1', 'b4c3', 'b2c3'],
    initialTurn: 'w',
    description: 'Break the pin by castling safety, securing the king.',
    hint: 'Castle your king away from danger.',
  },
  {
    id: 'puz-5',
    title: 'Boden’s Double Bishop Mate',
    theme: 'checkmate',
    difficulty: 'Hard',
    rating: 1600,
    fen: '2kr3r/ppp2ppp/8/2b1P3/4n3/8/PPP2PPP/R1B2RK1 b - - 0 13',
    moves: ['c5f2', 'f1f2', 'd8d1', 'f2f1', 'h8d8'],
    initialTurn: 'b',
    description: 'Decisive breakthrough with active minor pieces against an exposed king.',
    hint: 'Strike the weak f2 pawn first.',
  },
  {
    id: 'puz-6',
    title: 'Greek Gift Sacrifice',
    theme: 'sacrifice',
    difficulty: 'Hard',
    rating: 1750,
    fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 7',
    moves: ['d3h7', 'g8h7', 'f3g5'],
    initialTurn: 'w',
    description: 'The famous bishop sacrifice on h7 opening up the enemy king.',
    hint: 'Bxh7+ followed by Ng5+ creates an irresistible mating net.',
  },
  {
    id: 'puz-7',
    title: 'The Queen & Rook Skewer',
    theme: 'skewer',
    difficulty: 'Medium',
    rating: 1280,
    fen: '8/8/8/3k4/8/2Q5/8/4K2r w - - 0 1',
    moves: ['c3f3', 'd5e5', 'f3h1'],
    initialTurn: 'w',
    description: 'Deliver check to the king, forcing it to step aside and expose the rook behind it.',
    hint: 'Qf3+ skewers the king and the unprotected rook on h1.',
  },
  {
    id: 'puz-8',
    title: 'Endgame King Opposition',
    theme: 'endgame',
    difficulty: 'Medium',
    rating: 1300,
    fen: '8/8/8/3k4/8/3K4/4P3/8 w - - 0 1',
    moves: ['e2e4', 'd5e5', 'd3e3'],
    initialTurn: 'w',
    description: 'Seize the direct opposition to shepherd the passed pawn forward to queen.',
    hint: 'Push the pawn and then step the king directly in front to guard promotion.',
  },
];

export interface PuzzleStreakData {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string;
  totalSolved: number;
  history: { date: string; puzzleId: string; correct: boolean }[];
}

export function getPuzzleStreak(): PuzzleStreakData {
  if (typeof window === 'undefined') {
    return { currentStreak: 0, bestStreak: 0, lastSolvedDate: '', totalSolved: 0, history: [] };
  }
  try {
    const raw = localStorage.getItem('shoonaconnect_puzzle_streak');
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return { currentStreak: 0, bestStreak: 0, lastSolvedDate: '', totalSolved: 0, history: [] };
}

export function recordPuzzleAttempt(puzzleId: string, correct: boolean): PuzzleStreakData {
  const current = getPuzzleStreak();
  const today = new Date().toISOString().split('T')[0];

  let streak = current.currentStreak;
  if (correct) {
    if (current.lastSolvedDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (current.lastSolvedDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
  }

  const updated: PuzzleStreakData = {
    currentStreak: streak,
    bestStreak: Math.max(streak, current.bestStreak),
    lastSolvedDate: correct ? today : current.lastSolvedDate,
    totalSolved: correct ? current.totalSolved + 1 : current.totalSolved,
    history: [{ date: today, puzzleId, correct }, ...current.history.slice(0, 30)],
  };

  try {
    localStorage.setItem('shoonaconnect_puzzle_streak', JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}
