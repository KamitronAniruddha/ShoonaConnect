import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../lib/supabase';

export interface NumberGuessRecord {
  id: string;
  playerUid: string;
  playerName: string;
  guessNumber: number;
  result: 'higher' | 'lower' | 'correct';
  timestamp: string;
}

export interface NumberGuessingGame {
  id: string;
  coupleId: string;
  digitMode: 2 | 3 | 4;
  minRange: number;
  maxRange: number;
  secretNumber: number;
  currentTurnPlayerId: string;
  currentTurnPlayerName: string;
  status: 'waiting' | 'in_progress' | 'completed';
  winnerUid: string | null;
  winnerName: string | null;
  guessCount: number;
  guesses: NumberGuessRecord[];
  createdAt: string;
  updatedAt: string;
  player1Uid: string;
  player1Name: string;
  player2Uid: string;
  player2Name: string;
}

// Helper to generate a random number based on digit mode
export function generateSecretNumber(digitMode: 2 | 3 | 4): number {
  if (digitMode === 2) {
    return Math.floor(Math.random() * 90) + 10; // 10 - 99
  }
  if (digitMode === 3) {
    return Math.floor(Math.random() * 900) + 100; // 100 - 999
  }
  return Math.floor(Math.random() * 9000) + 1000; // 1000 - 9999
}

export function getRangeByDigitMode(digitMode: 2 | 3 | 4): { min: number; max: number } {
  if (digitMode === 2) return { min: 10, max: 99 };
  if (digitMode === 3) return { min: 100, max: 999 };
  return { min: 1000, max: 9999 };
}

// Broadcast helper for instant zero-latency updates
export function broadcastNumberGameUpdate(coupleId: string, game: NumberGuessingGame) {
  sendRealtimeBroadcast(`num_game_broad:${coupleId}`, 'game_state_update', game);
}
