export type ChessColor = 'w' | 'b';
export type BoardThemeId =
  | 'pink'
  | 'midnight'
  | 'classic'
  | 'burgundy'
  | 'rose'
  | 'ocean'
  | 'emerald'
  | 'minimal'
  | 'contrast';

export type PieceStyleId = 'classic' | 'modern' | 'elegant' | 'minimal' | 'neon';

export type GameStatus =
  | 'waiting'
  | 'in_progress'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'resigned'
  | 'timeout'
  | 'abandoned';

export type GameResult = '1-0' | '0-1' | '1/2-1/2' | '*';

export type TimeControlPreset =
  | '1+0'
  | '2+1'
  | '3+0'
  | '3+2'
  | '5+0'
  | '5+3'
  | '10+0'
  | '10+5'
  | '15+10'
  | '30+0'
  | 'custom'
  | 'casual';

export interface TimeControlConfig {
  id: TimeControlPreset;
  label: string;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'casual';
  baseMinutes: number;
  incrementSeconds: number;
  isCasual: boolean;
}

export interface ChessPlayerInfo {
  uid: string;
  displayName: string;
  photoURL?: string;
  rating?: number;
  color: ChessColor;
}

export interface ChessMoveRecord {
  san: string;
  from: string;
  to: string;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  captured?: string;
  check?: boolean;
  checkmate?: boolean;
  playerUid: string;
  whiteTimeRemaining?: number;
  blackTimeRemaining?: number;
  timestamp: string;
}

export interface ChessGame {
  id: string;
  coupleId: string;
  whitePlayer: ChessPlayerInfo;
  blackPlayer: ChessPlayerInfo;
  fen: string;
  pgn: string;
  currentTurn: ChessColor;
  status: GameStatus;
  result: GameResult;
  winnerId?: string | null;
  winnerName?: string | null;
  winReason?: string;
  timeControl: TimeControlConfig;
  whiteTimeRemaining: number; // in milliseconds
  blackTimeRemaining: number; // in milliseconds
  lastMoveTimestamp?: number; // epoch ms for clock calculation
  isCasual: boolean;
  isRated: boolean;
  isAIGame: boolean;
  aiDifficulty?: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master';
  aiPersonality?: string;
  moveCount: number;
  moves: ChessMoveRecord[];
  drawOfferFrom?: string | null;
  rematchRequestedBy?: string[];
  reactions?: Record<string, string>;
  lastReaction?: {
    playerId: string;
    playerName: string;
    emoji: string;
    message?: string;
    timestamp: number;
  };
  savedToMemories?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChessChallenge {
  id: string;
  coupleId: string;
  challengerId: string;
  challengerName: string;
  challengerPhoto?: string;
  challengedId: string;
  challengedName?: string;
  timeControl: TimeControlConfig;
  preferredColor: 'white' | 'black' | 'random';
  isCasual: boolean;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  gameId?: string;
  createdAt: string;
}

export interface ChessTournament {
  id: string;
  coupleId: string;
  title: string;
  format: 'best_of_3' | 'best_of_5' | 'first_to_10';
  targetWins: number;
  timeControl: TimeControlConfig;
  player1: { uid: string; displayName: string; score: number };
  player2: { uid: string; displayName: string; score: number };
  games: string[]; // gameIds
  status: 'in_progress' | 'completed';
  winnerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChessRatings {
  bullet: number;
  blitz: number;
  rapid: number;
  classical: number;
  puzzle: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt?: string;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  theme: 'checkmate' | 'fork' | 'pin' | 'skewer' | 'discovered' | 'sacrifice' | 'endgame';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  fen: string;
  moves: string[]; // sequence of UCI or SAN moves: e.g. ["e4e5", "g8f6"]
  initialTurn: ChessColor;
  description: string;
  hint: string;
}

export interface ChessOpening {
  eco: string;
  name: string;
  moves: string;
  description: string;
  category: 'Open Game' | 'Semi-Open' | 'Closed Game' | 'Flank' | 'Indian Defense';
  winRateWhite: number;
  winRateBlack: number;
  drawRate: number;
}

export interface ChessChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface ChessSettings {
  boardTheme: BoardThemeId;
  pieceStyle: PieceStyleId;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  autoQueen: boolean;
  confirmResign: boolean;
  confirmDraw: boolean;
  clockWarningSound: boolean;
  enableChat: boolean;
  flipBoard: boolean;
}
