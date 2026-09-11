import type { ChessOpening } from '../types/chess';

export const CHESS_OPENINGS: ChessOpening[] = [
  {
    eco: 'C50',
    name: 'Italian Game',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bc4',
    description: 'One of the oldest and most romantic openings. White develops the bishop to target the vulnerable f7 square.',
    category: 'Open Game',
    winRateWhite: 54,
    winRateBlack: 42,
    drawRate: 4,
  },
  {
    eco: 'C60',
    name: 'Ruy Lopez (Spanish Opening)',
    moves: '1. e4 e5 2. Nf3 Nc6 3. Bb5',
    description: 'A classical cornerstone of chess strategy. White attacks the knight guarding the central e5 pawn.',
    category: 'Open Game',
    winRateWhite: 55,
    winRateBlack: 40,
    drawRate: 5,
  },
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: '1. e4 c5',
    description: 'The most aggressive and popular counter to 1.e4. Creates asymmetrical imbalances with high fighting spirit.',
    category: 'Semi-Open',
    winRateWhite: 51,
    winRateBlack: 45,
    drawRate: 4,
  },
  {
    eco: 'D06',
    name: "Queen's Gambit",
    moves: '1. d4 d5 2. c4',
    description: 'White offers a flank wing pawn to establish a dominant central pawn presence on d4 and e4.',
    category: 'Closed Game',
    winRateWhite: 56,
    winRateBlack: 39,
    drawRate: 5,
  },
  {
    eco: 'C00',
    name: 'French Defense',
    moves: '1. e4 e6 2. d4 d5',
    description: 'Solid and resilient. Black establishes a strong pawn chain and looks for sharp counter-punches on the queen-side.',
    category: 'Semi-Open',
    winRateWhite: 53,
    winRateBlack: 43,
    drawRate: 4,
  },
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    moves: '1. e4 c6 2. d4 d5',
    description: 'Renowned for solid pawn structure and safe king positions. A favorite of world champions like Karpov.',
    category: 'Semi-Open',
    winRateWhite: 52,
    winRateBlack: 44,
    drawRate: 4,
  },
  {
    eco: 'A10',
    name: 'English Opening',
    moves: '1. c4',
    description: 'A flexible flank opening. White fights for the central d5 square without committing the d or e pawns immediately.',
    category: 'Flank',
    winRateWhite: 53,
    winRateBlack: 41,
    drawRate: 6,
  },
  {
    eco: 'E60',
    name: "King's Indian Defense",
    moves: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7',
    description: 'A hypermodern masterpiece. Black allows White to occupy the center, then launches a ferocious king-side assault.',
    category: 'Indian Defense',
    winRateWhite: 52,
    winRateBlack: 44,
    drawRate: 4,
  },
  {
    eco: 'C45',
    name: 'Scotch Game',
    moves: '1. e4 e5 2. Nf3 Nc6 3. d4',
    description: 'White opens the center immediately on move 3. Dynamic and direct, made famous by Garry Kasparov.',
    category: 'Open Game',
    winRateWhite: 54,
    winRateBlack: 41,
    drawRate: 5,
  },
  {
    eco: 'C25',
    name: 'Vienna Game',
    moves: '1. e4 e5 2. Nc3',
    description: 'White develops the queen knight first, keeping options open for f4 (Vienna Gambit) or quiet Bc4 setups.',
    category: 'Open Game',
    winRateWhite: 53,
    winRateBlack: 42,
    drawRate: 5,
  },
  {
    eco: 'A04',
    name: 'Réti Opening',
    moves: '1. Nf3 d5 2. c4',
    description: 'Hypermodern flank approach developed by Richard Réti, controlling the center from distance with bishops.',
    category: 'Flank',
    winRateWhite: 54,
    winRateBlack: 40,
    drawRate: 6,
  },
  {
    eco: 'B01',
    name: 'Scandinavian Defense',
    moves: '1. e4 d5',
    description: 'Direct challenge to the center on move 1. Leads to open positions with active piece play for Black.',
    category: 'Semi-Open',
    winRateWhite: 53,
    winRateBlack: 43,
    drawRate: 4,
  },
];

/**
 * Identify an opening by move sequence or PGN
 */
export function identifyOpening(movesText: string): ChessOpening | null {
  if (!movesText) return null;
  const clean = movesText.trim().toLowerCase();

  for (const op of CHESS_OPENINGS) {
    const opClean = op.moves.toLowerCase();
    if (clean.includes(opClean) || clean.startsWith(opClean.substring(0, 12))) {
      return op;
    }
  }

  // Fallbacks based on first few plies
  if (clean.includes('e4 c5')) {
    return CHESS_OPENINGS.find((o) => o.name === 'Sicilian Defense') || null;
  }
  if (clean.includes('e4 e5') && clean.includes('bc4')) {
    return CHESS_OPENINGS.find((o) => o.name === 'Italian Game') || null;
  }
  if (clean.includes('d4 d5') && clean.includes('c4')) {
    return CHESS_OPENINGS.find((o) => o.name === "Queen's Gambit") || null;
  }

  return null;
}
