import { supabase, createSafeChannel } from '../lib/supabase';
import {
  TicTacToeCell,
  TicTacToeGame,
  TicTacToePlayer,
  TicTacToeStats,
  TicTacToeChatMessage,
} from '../types';

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // row 1
  [3, 4, 5], // row 2
  [6, 7, 8], // row 3
  [0, 3, 6], // col 1
  [1, 4, 7], // col 2
  [2, 5, 8], // col 3
  [0, 4, 8], // diagonal 1
  [2, 4, 6], // diagonal 2
];

export const COUPLE_VICTORY_MESSAGES = [
  'Someone is getting bragging rights tonight 😌💕',
  'Perfect match... except on the scoreboard 😄',
  'Love wins either way 💗',
  'Kisses for the winner, cuddles for the runner-up! 😘',
  'A romantic penalty kiss is due immediately! 💋',
  'Two hearts, one crown... Rematch time? 🏆',
  'Absolute tactical masterclass in love! 🥰',
];

export const COUPLE_DRAW_MESSAGES = [
  "It's a Draw! Truly two minds that think as one 💕",
  'Perfect tie! Neither could bear to defeat the other 💗',
  'Great minds, synchronized hearts! Rematch? ✨',
  'Draw! That just means double the hugs tonight 🤗',
];

export const REACTION_EMOJIS = ['❤️', '😂', '😘', '🔥', '🥰', '👑', '🎉', '💋', '🙈', '⚡', '🥺', '💥'];

/**
 * Check if there is a winner or a draw on a 3x3 board.
 */
export function evaluateBoard(board: TicTacToeCell[]): {
  winner: string | 'draw' | null;
  winningCells: number[] | null;
} {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningCells: combo };
    }
  }

  const isFilled = board.every((cell) => cell !== null);
  if (isFilled) {
    return { winner: 'draw', winningCells: null };
  }

  return { winner: null, winningCells: null };
}

export function tictactoeRowToGame(row: any): TicTacToeGame {
  return {
    id: row.id,
    coupleId: row.couple_id,
    playerX: row.player_x,
    playerO: row.player_o,
    board: row.board,
    currentTurn: row.current_turn,
    currentTurnPlayerId: row.current_turn_player_id,
    winner: row.winner,
    winnerSymbol: row.winner_symbol || null,
    winnerName: row.winner_name || null,
    winningCells: row.winning_cells || null,
    status: row.status,
    moveCount: row.move_count || 0,
    rematchRequestedBy: row.rematch_requested_by || [],
    challengeStatus: row.challenge_status || 'accepted',
    challengedBy: row.challenged_by,
    reactions: row.reactions || {},
    lastReaction: row.last_reaction,
    customSymbols: row.custom_symbols,
    timerDurationSeconds: row.timer_duration_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Start a new game or challenge between partners with custom symbols support.
 */
export async function createTicTacToeGame(
  coupleId: string,
  userProfile: { uid: string; displayName: string; photoURL?: string },
  partnerProfile: { uid: string; displayName: string; photoURL?: string } | null,
  options?: {
    isChallenge?: boolean;
    starterSymbol?: string;
    partnerSymbol?: string;
  }
): Promise<string> {
  const mySymbol = options?.starterSymbol || 'X';
  const theirSymbol = options?.partnerSymbol || (mySymbol === 'O' ? 'X' : 'O');

  const playerX: TicTacToePlayer = {
    uid: userProfile.uid,
    displayName: userProfile.displayName,
    photoURL: userProfile.photoURL,
    symbol: mySymbol,
  };

  const playerO: TicTacToePlayer = {
    uid: partnerProfile?.uid || 'solo_partner',
    displayName: partnerProfile?.displayName || 'My Sweetheart',
    photoURL: partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=sweetheart`,
    symbol: theirSymbol,
  };

  const initialBoard: TicTacToeCell[] = Array(9).fill(null);
  const now = new Date().toISOString();

  const gamePayload = {
    couple_id: coupleId,
    player_x: playerX,
    player_o: playerO,
    board: initialBoard,
    current_turn: 'X',
    current_turn_player_id: playerX.uid,
    winner: null,
    winning_cells: null,
    status: options?.isChallenge && partnerProfile ? 'waiting' : 'in_progress',
    move_count: 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('tictactoe_games')
    .insert(gamePayload)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create TicTacToe game:', error.message);
    throw new Error(error.message);
  }

  return data.id;
}

/**
 * Update a player's symbol in the active game.
 */
export async function updatePlayerSymbol(
  coupleId: string,
  gameId: string,
  playerUid: string,
  newSymbol: string
): Promise<void> {
  const { data } = await supabase
    .from('tictactoe_games')
    .select('*')
    .eq('id', gameId)
    .eq('couple_id', coupleId)
    .single();

  if (!data) return;

  const playerX = { ...data.player_x };
  const playerO = { ...data.player_o };

  if (playerX.uid === playerUid) {
    playerX.symbol = newSymbol;
  } else if (playerO.uid === playerUid) {
    playerO.symbol = newSymbol;
  }

  await supabase
    .from('tictactoe_games')
    .update({
      player_x: playerX,
      player_o: playerO,
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .eq('couple_id', coupleId);
}

/**
 * Accept an incoming game challenge from partner.
 */
export async function acceptGameChallenge(coupleId: string, gameId: string): Promise<void> {
  await supabase
    .from('tictactoe_games')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .eq('couple_id', coupleId);
}

/**
 * Decline an incoming game challenge from partner.
 */
export async function declineGameChallenge(coupleId: string, gameId: string): Promise<void> {
  await supabase
    .from('tictactoe_games')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .eq('couple_id', coupleId);
}

/**
 * Execute a move with full verification on board state, turn, and occupied cell.
 */
export async function executeMove(
  coupleId: string,
  gameId: string,
  position: number,
  playerUid: string,
  isSoloMode = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: game, error } = await supabase
      .from('tictactoe_games')
      .select('*')
      .eq('id', gameId)
      .eq('couple_id', coupleId)
      .single();

    if (error || !game) {
      return { success: false, error: 'Game not found.' };
    }

    if (game.status !== 'in_progress') {
      return { success: false, error: 'Game is already completed.' };
    }

    if (position < 0 || position > 8) {
      return { success: false, error: 'Invalid cell position.' };
    }

    if (game.board[position] !== null) {
      return { success: false, error: 'This cell is already occupied.' };
    }

    const playerXSymbol = game.player_x.symbol || 'X';
    const playerOSymbol = game.player_o.symbol || 'O';

    let playerSymbol: string;
    let playerName: string;

    if (isSoloMode) {
      playerSymbol = game.current_turn === 'X' ? playerXSymbol : playerOSymbol;
      playerName = game.current_turn === 'X' ? game.player_x.displayName : game.player_o.displayName;
    } else {
      if (game.player_x.uid === playerUid) {
        playerSymbol = playerXSymbol;
        playerName = game.player_x.displayName;
      } else if (game.player_o.uid === playerUid) {
        playerSymbol = playerOSymbol;
        playerName = game.player_o.displayName;
      } else {
        return { success: false, error: 'You are not a participant in this game.' };
      }

      const isXTurn = game.current_turn === 'X';
      const expectedPlayerId = isXTurn ? game.player_x.uid : game.player_o.uid;

      if (expectedPlayerId !== playerUid) {
        return { success: false, error: "It is not your turn yet! Wait for your partner." };
      }
    }

    const newBoard = [...game.board];
    newBoard[position] = playerSymbol;

    const evaluation = evaluateBoard(newBoard);
    const newMoveCount = (game.move_count || 0) + 1;
    const now = new Date().toISOString();

    let newStatus = 'in_progress';
    let winner: string | 'draw' | null = null;
    const nextTurn = game.current_turn === 'X' ? 'O' : 'X';
    const nextPlayerId = nextTurn === 'X' ? game.player_x.uid : game.player_o.uid;

    if (evaluation.winner && evaluation.winner !== 'draw') {
      newStatus = 'completed';
      if (evaluation.winner === playerXSymbol) {
        winner = game.player_x.uid;
      } else {
        winner = game.player_o.uid;
      }
    } else if (evaluation.winner === 'draw') {
      newStatus = 'completed';
      winner = 'draw';
    }

    const { error: updateError } = await supabase
      .from('tictactoe_games')
      .update({
        board: newBoard,
        current_turn: nextTurn,
        current_turn_player_id: nextPlayerId,
        status: newStatus,
        winner,
        winning_cells: evaluation.winningCells,
        move_count: newMoveCount,
        updated_at: now,
      })
      .eq('id', gameId)
      .eq('couple_id', coupleId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not submit move.' };
  }
}

/**
 * Send an expressive reaction to the active match.
 */
export async function sendMatchReaction(
  coupleId: string,
  gameId: string,
  playerUid: string,
  playerName: string,
  emoji: string
): Promise<void> {
  const now = new Date().toISOString();
  await supabase
    .from('tictactoe_games')
    .update({
      updated_at: now,
    })
    .eq('id', gameId)
    .eq('couple_id', coupleId);
}

/**
 * Send a live in-game chat message during a match.
 */
export async function sendGameChatMessage(
  coupleId: string,
  gameId: string,
  sender: { uid: string; displayName: string; photoURL?: string },
  messageText: string
): Promise<void> {
  if (!messageText.trim()) return;
  // Send into chat messages table tagged for this game
  await supabase.from('messages').insert({
    couple_id: coupleId,
    sender_id: sender.uid,
    sender_name: sender.displayName,
    sender_photo: sender.photoURL || '',
    text: `[Game Chat] ${messageText.trim()}`,
    type: 'text',
    created_at: new Date().toISOString(),
  });
}

/**
 * Request or accept a rematch.
 */
export async function requestOrAcceptRematch(
  coupleId: string,
  currentGame: TicTacToeGame,
  playerUid: string,
  isSoloMode = false
): Promise<string | null> {
  const newPlayerX: TicTacToePlayer = {
    ...currentGame.playerO,
    symbol: currentGame.playerO.symbol || 'O',
  };
  const newPlayerO: TicTacToePlayer = {
    ...currentGame.playerX,
    symbol: currentGame.playerX.symbol || 'X',
  };

  const initialBoard: TicTacToeCell[] = Array(9).fill(null);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('tictactoe_games')
    .insert({
      couple_id: coupleId,
      player_x: newPlayerX,
      player_o: newPlayerO,
      board: initialBoard,
      current_turn: 'X',
      current_turn_player_id: newPlayerX.uid,
      winner: null,
      winning_cells: null,
      status: 'in_progress',
      move_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

/**
 * Calculate match statistics and streaks for the current user.
 */
export function calculateCoupleStats(games: TicTacToeGame[], currentUserId: string): TicTacToeStats {
  const completedGames = games.filter((g) => g.status === 'completed' && g.winner);

  let yourWins = 0;
  let partnerWins = 0;
  let draws = 0;
  let currentWinStreak = 0;
  let bestWinStreak = 0;
  let tempStreak = 0;

  const sortedChrono = [...completedGames].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const game of sortedChrono) {
    if (game.winner === 'draw') {
      draws++;
      tempStreak = 0;
    } else if (game.winner === currentUserId) {
      yourWins++;
      tempStreak++;
      if (tempStreak > bestWinStreak) {
        bestWinStreak = tempStreak;
      }
    } else {
      partnerWins++;
      tempStreak = 0;
    }
  }

  const sortedRecent = [...completedGames].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  for (const game of sortedRecent) {
    if (game.winner === currentUserId) {
      currentWinStreak++;
    } else {
      break;
    }
  }

  return {
    totalGames: completedGames.length,
    yourWins,
    partnerWins,
    draws,
    currentWinStreak,
    bestWinStreak,
  };
}

/**
 * Real-time subscription to TicTacToe games for a couple.
 */
export function listenToTicTacToeGames(
  coupleId: string,
  callback: (games: TicTacToeGame[]) => void
): () => void {
  const fetchGames = async () => {
    const { data } = await supabase
      .from('tictactoe_games')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (data) {
      callback(data.map(tictactoeRowToGame));
    }
  };

  fetchGames();

  const channel = createSafeChannel(`tictactoe:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tictactoe_games',
        filter: `couple_id=eq.${coupleId}`,
      },
      () => {
        fetchGames();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
