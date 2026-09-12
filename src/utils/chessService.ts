import { Chess } from 'chess.js';
import { supabase, createSafeChannel } from '../lib/supabase';
import type {
  ChessGame,
  ChessChallenge,
  ChessMoveRecord,
  TimeControlConfig,
  ChessPlayerInfo,
  GameResult,
  GameStatus,
} from '../types/chess';

export const TIME_CONTROL_PRESETS: TimeControlConfig[] = [
  { id: '1+0', label: '1 min Bullet', category: 'bullet', baseMinutes: 1, incrementSeconds: 0, isCasual: false },
  { id: '2+1', label: '2+1 Bullet', category: 'bullet', baseMinutes: 2, incrementSeconds: 1, isCasual: false },
  { id: '3+0', label: '3 min Blitz', category: 'blitz', baseMinutes: 3, incrementSeconds: 0, isCasual: false },
  { id: '3+2', label: '3+2 Blitz', category: 'blitz', baseMinutes: 3, incrementSeconds: 2, isCasual: false },
  { id: '5+0', label: '5 min Blitz', category: 'blitz', baseMinutes: 5, incrementSeconds: 0, isCasual: false },
  { id: '5+3', label: '5+3 Blitz', category: 'blitz', baseMinutes: 5, incrementSeconds: 3, isCasual: false },
  { id: '10+0', label: '10 min Rapid', category: 'rapid', baseMinutes: 10, incrementSeconds: 0, isCasual: false },
  { id: '10+5', label: '10+5 Rapid', category: 'rapid', baseMinutes: 10, incrementSeconds: 5, isCasual: false },
  { id: '15+10', label: '15+10 Rapid', category: 'rapid', baseMinutes: 15, incrementSeconds: 10, isCasual: false },
  { id: '30+0', label: '30 min Classical', category: 'classical', baseMinutes: 30, incrementSeconds: 0, isCasual: false },
  { id: 'casual', label: 'Casual Untimed 💕', category: 'casual', baseMinutes: 0, incrementSeconds: 0, isCasual: true },
];

export const COUPLE_CHESS_REACTIONS = [
  { emoji: '❤️', label: 'Love move' },
  { emoji: '♟️', label: 'Masterpiece' },
  { emoji: '🔥', label: 'Brilliant!' },
  { emoji: '😂', label: 'Oops haha' },
  { emoji: '🥰', label: 'Cute tactic' },
  { emoji: '👏', label: 'Respect' },
  { emoji: '👑', label: 'My Queen/King' },
  { emoji: '☕', label: 'Deep think' },
];

export function chessRowToGame(row: any): ChessGame {
  return {
    id: row.id,
    coupleId: row.couple_id,
    whitePlayer: {
      uid: row.white_player_id,
      displayName: row.white_player_name,
      photoURL: row.white_player_photo || undefined,
      color: 'w',
    },
    blackPlayer: {
      uid: row.black_player_id,
      displayName: row.black_player_name,
      photoURL: row.black_player_photo || undefined,
      color: 'b',
    },
    fen: row.fen,
    pgn: row.pgn || '',
    currentTurn: row.current_turn,
    status: row.status,
    result: row.result,
    winnerId: row.winner_id,
    winnerName: row.winner_name,
    winReason: row.win_reason,
    timeControl: row.time_control || {
      id: '10+0',
      label: '10 min Rapid',
      category: 'rapid',
      baseMinutes: 10,
      incrementSeconds: 0,
      isCasual: false,
    },
    whiteTimeRemaining: row.white_time_remaining ?? 600000,
    blackTimeRemaining: row.black_time_remaining ?? 600000,
    lastMoveTimestamp: row.last_move_timestamp ? Number(row.last_move_timestamp) : undefined,
    isCasual: Boolean(row.is_casual),
    isRated: Boolean(row.is_rated),
    isAIGame: Boolean(row.is_ai_game),
    aiDifficulty: row.ai_difficulty,
    aiPersonality: row.ai_personality,
    moveCount: row.move_count || 0,
    moves: row.moves || [],
    drawOfferFrom: row.draw_offer_from,
    rematchRequestedBy: row.rematch_requested_by || [],
    lastReaction: row.last_reaction,
    savedToMemories: Boolean(row.saved_to_memories),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function chessChallengeRowToChallenge(row: any): ChessChallenge {
  return {
    id: row.id,
    coupleId: row.couple_id,
    challengerId: row.challenger_id,
    challengerName: row.challenger_name,
    challengerPhoto: row.challenger_photo || undefined,
    challengedId: row.challenged_id,
    timeControl: row.time_control,
    preferredColor: row.preferred_color,
    isCasual: Boolean(row.is_casual),
    status: row.status,
    gameId: row.game_id || undefined,
    createdAt: row.created_at,
  };
}

/**
 * Creates a new Chess Game in Supabase
 */
export async function createChessGame(
  coupleId: string,
  whitePlayer: ChessPlayerInfo,
  blackPlayer: ChessPlayerInfo,
  timeControl: TimeControlConfig,
  isAIGame: boolean = false,
  aiDifficulty?: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master',
  aiPersonality?: string
): Promise<string> {
  const newChess = new Chess();
  const totalTimeMs = timeControl.isCasual ? 0 : timeControl.baseMinutes * 60 * 1000;
  const now = new Date().toISOString();

  const row = {
    couple_id: coupleId,
    white_player_id: whitePlayer.uid,
    white_player_name: whitePlayer.displayName || 'Player 1',
    white_player_photo: whitePlayer.photoURL || null,
    black_player_id: blackPlayer.uid,
    black_player_name: blackPlayer.displayName || 'Player 2',
    black_player_photo: blackPlayer.photoURL || null,
    fen: newChess.fen(),
    pgn: '',
    current_turn: 'w',
    status: 'in_progress',
    result: '*',
    time_control: timeControl,
    white_time_remaining: totalTimeMs,
    black_time_remaining: totalTimeMs,
    last_move_timestamp: Date.now(),
    is_casual: Boolean(timeControl.isCasual),
    is_rated: !timeControl.isCasual && !isAIGame,
    is_ai_game: Boolean(isAIGame),
    ai_difficulty: aiDifficulty || null,
    ai_personality: aiPersonality || null,
    move_count: 0,
    moves: [],
    draw_offer_from: null,
    rematch_requested_by: [],
    saved_to_memories: false,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('chess_games')
    .insert(row)
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error creating chess game:', error);
    throw new Error(error?.message || 'Failed to create chess game');
  }

  return data.id;
}

/**
 * Executes a move in an active game
 */
export async function executeChessMove(
  coupleId: string,
  game: ChessGame,
  from: string,
  to: string,
  promotion: string = 'q'
): Promise<{ success: boolean; error?: string; updatedGame?: ChessGame }> {
  try {
    const chess = new Chess(game.fen);
    const turnBefore = chess.turn();

    const moveResult = chess.move({ from, to, promotion });
    if (!moveResult) {
      return { success: false, error: 'Illegal chess move.' };
    }

    const now = Date.now();
    let newWhiteTime = game.whiteTimeRemaining;
    let newBlackTime = game.blackTimeRemaining;

    // Calculate clock deduction if timed
    if (!game.isCasual && game.lastMoveTimestamp && game.moveCount > 0) {
      const elapsedMs = Math.max(0, now - game.lastMoveTimestamp);
      const incMs = (game.timeControl?.incrementSeconds || 0) * 1000;

      if (turnBefore === 'w') {
        newWhiteTime = Math.max(0, newWhiteTime - elapsedMs) + incMs;
      } else {
        newBlackTime = Math.max(0, newBlackTime - elapsedMs) + incMs;
      }
    }

    // Determine status
    let status: GameStatus = 'in_progress';
    let result: GameResult = '*';
    let winnerId: string | null = null;
    let winnerName: string | null = null;
    let winReason: string | undefined = undefined;

    if (chess.isCheckmate()) {
      status = 'checkmate';
      if (turnBefore === 'w') {
        result = '1-0';
        winnerId = game.whitePlayer.uid;
        winnerName = game.whitePlayer.displayName;
        winReason = 'Checkmate! White wins.';
      } else {
        result = '0-1';
        winnerId = game.blackPlayer.uid;
        winnerName = game.blackPlayer.displayName;
        winReason = 'Checkmate! Black wins.';
      }
    } else if (chess.isStalemate()) {
      status = 'stalemate';
      result = '1/2-1/2';
      winReason = 'Stalemate - Draw.';
    } else if (chess.isThreefoldRepetition()) {
      status = 'draw';
      result = '1/2-1/2';
      winReason = 'Draw by threefold repetition.';
    } else if (chess.isInsufficientMaterial()) {
      status = 'draw';
      result = '1/2-1/2';
      winReason = 'Draw by insufficient mating material.';
    } else if (chess.isDraw()) {
      status = 'draw';
      result = '1/2-1/2';
      winReason = 'Draw by 50-move rule.';
    }

    const moveRecord: ChessMoveRecord = {
      san: moveResult.san,
      from: moveResult.from,
      to: moveResult.to,
      fenBefore: game.fen,
      fenAfter: chess.fen(),
      check: chess.inCheck(),
      checkmate: chess.isCheckmate(),
      playerUid: turnBefore === 'w' ? game.whitePlayer.uid : game.blackPlayer.uid,
      whiteTimeRemaining: newWhiteTime,
      blackTimeRemaining: newBlackTime,
      timestamp: new Date().toISOString(),
      ...(moveResult.promotion ? { promotion: moveResult.promotion } : {}),
      ...(moveResult.captured ? { captured: moveResult.captured } : {}),
    };

    const updatedMoves = [...game.moves, moveRecord];
    const isoNow = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      fen: chess.fen(),
      pgn: chess.pgn(),
      current_turn: chess.turn(),
      status,
      result,
      winner_id: winnerId,
      winner_name: winnerName,
      win_reason: winReason || null,
      white_time_remaining: newWhiteTime,
      black_time_remaining: newBlackTime,
      last_move_timestamp: now,
      move_count: game.moveCount + 1,
      moves: updatedMoves,
      draw_offer_from: null,
      updated_at: isoNow,
    };

    const { error: updateError } = await supabase
      .from('chess_games')
      .update(updatePayload)
      .eq('id', game.id)
      .eq('couple_id', coupleId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      updatedGame: {
        ...game,
        fen: chess.fen(),
        pgn: chess.pgn(),
        currentTurn: chess.turn(),
        status,
        result,
        winnerId,
        winnerName,
        winReason,
        whiteTimeRemaining: newWhiteTime,
        blackTimeRemaining: newBlackTime,
        lastMoveTimestamp: now,
        moveCount: game.moveCount + 1,
        moves: updatedMoves,
        drawOfferFrom: null,
        updatedAt: isoNow,
      },
    };
  } catch (err: any) {
    console.error('Error executing move:', err);
    return { success: false, error: err?.message || 'Failed to execute move.' };
  }
}

/**
 * Handle resign
 */
export async function resignChessGame(
  coupleId: string,
  game: ChessGame,
  resigningPlayerUid: string
): Promise<void> {
  const isWhite = resigningPlayerUid === game.whitePlayer.uid;
  const winnerId = isWhite ? game.blackPlayer.uid : game.whitePlayer.uid;
  const winnerName = isWhite ? game.blackPlayer.displayName : game.whitePlayer.displayName;
  const result: GameResult = isWhite ? '0-1' : '1-0';

  await supabase
    .from('chess_games')
    .update({
      status: 'resigned',
      result,
      winner_id: winnerId,
      winner_name: winnerName,
      win_reason: `${isWhite ? game.whitePlayer.displayName : game.blackPlayer.displayName} resigned.`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', game.id)
    .eq('couple_id', coupleId);
}

/**
 * Handle draw offer or acceptance
 */
export async function handleDrawOffer(
  coupleId: string,
  game: ChessGame,
  offeringPlayerUid: string
): Promise<void> {
  if (game.drawOfferFrom && game.drawOfferFrom !== offeringPlayerUid) {
    // Partner accepted draw!
    await supabase
      .from('chess_games')
      .update({
        status: 'draw',
        result: '1/2-1/2',
        win_reason: 'Draw agreed by mutual love and respect 💕',
        draw_offer_from: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', game.id)
      .eq('couple_id', coupleId);
  } else {
    // Offer draw
    await supabase
      .from('chess_games')
      .update({
        draw_offer_from: offeringPlayerUid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', game.id)
      .eq('couple_id', coupleId);
  }
}

/**
 * Handle timeout claim
 */
export async function claimChessTimeout(
  coupleId: string,
  game: ChessGame,
  flaggedColor: 'w' | 'b'
): Promise<void> {
  const isWhiteFlagged = flaggedColor === 'w';
  const winnerId = isWhiteFlagged ? game.blackPlayer.uid : game.whitePlayer.uid;
  const winnerName = isWhiteFlagged ? game.blackPlayer.displayName : game.whitePlayer.displayName;
  const result: GameResult = isWhiteFlagged ? '0-1' : '1-0';

  await supabase
    .from('chess_games')
    .update({
      status: 'timeout',
      result,
      winner_id: winnerId,
      winner_name: winnerName,
      win_reason: `Time expired on clock! ${winnerName} wins.`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', game.id)
    .eq('couple_id', coupleId);
}

/**
 * Send match reaction emoji
 */
export async function sendChessReaction(
  coupleId: string,
  gameId: string,
  player: { uid: string; displayName: string },
  emoji: string,
  message?: string
): Promise<void> {
  await supabase
    .from('chess_games')
    .update({
      last_reaction: {
        playerId: player.uid,
        playerName: player.displayName,
        emoji,
        message: message || '',
        timestamp: Date.now(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .eq('couple_id', coupleId);
}

/**
 * Send in-game live chat message
 */
export async function sendChessChatMessage(
  coupleId: string,
  gameId: string,
  sender: { uid: string; displayName: string; photoURL?: string },
  text: string
): Promise<void> {
  if (!text.trim()) return;
  await supabase.from('messages').insert({
    couple_id: coupleId,
    sender_id: sender.uid,
    sender_name: sender.displayName,
    sender_photo: sender.photoURL || '',
    text: `[Chess Chat] ${text.trim()}`,
    type: 'text',
    created_at: new Date().toISOString(),
  });
}

/**
 * Request or accept rematch
 */
export async function requestRematch(
  coupleId: string,
  game: ChessGame,
  requesterUid: string
): Promise<string | null> {
  const currentRematches = game.rematchRequestedBy || [];
  const partnerUid =
    requesterUid === game.whitePlayer.uid ? game.blackPlayer.uid : game.whitePlayer.uid;

  if (currentRematches.includes(partnerUid)) {
    // Both agreed -> create swapped rematch game!
    const newWhite = game.blackPlayer;
    const newBlack = game.whitePlayer;

    const newGameId = await createChessGame(
      coupleId,
      { ...newWhite, color: 'w' },
      { ...newBlack, color: 'b' },
      game.timeControl,
      game.isAIGame,
      game.aiDifficulty,
      game.aiPersonality
    );

    await supabase
      .from('chess_games')
      .update({
        rematch_requested_by: [...currentRematches, requesterUid],
        updated_at: new Date().toISOString(),
      })
      .eq('id', game.id)
      .eq('couple_id', coupleId);

    return newGameId;
  } else {
    // Mark as requested
    await supabase
      .from('chess_games')
      .update({
        rematch_requested_by: [...currentRematches, requesterUid],
        updated_at: new Date().toISOString(),
      })
      .eq('id', game.id)
      .eq('couple_id', coupleId);
    return null;
  }
}

/**
 * Save game as Couple Shared Memory 💕
 */
export async function saveChessGameAsMemory(
  coupleId: string,
  game: ChessGame,
  user: { uid: string; displayName: string },
  note: string = ''
): Promise<void> {
  try {
    const dateStr = new Date().toISOString().split('T')[0];

    let resultSummary = 'Played an exciting chess match!';
    if (game.result === '1-0') {
      resultSummary = `Victory for ${game.whitePlayer.displayName} playing White!`;
    } else if (game.result === '0-1') {
      resultSummary = `Victory for ${game.blackPlayer.displayName} playing Black!`;
    } else if (game.result === '1/2-1/2') {
      resultSummary = 'A hard-fought draw between partners!';
    }

    await supabase.from('memories').insert({
      couple_id: coupleId,
      user_id: user.uid,
      author_id: user.uid,
      author_name: user.displayName,
      title: `Chess Match: ${game.whitePlayer.displayName} vs ${game.blackPlayer.displayName}`,
      date: dateStr,
      description:
        note.trim() ||
        `${resultSummary}\nMoves: ${game.moveCount} | Time Control: ${game.timeControl.label}\nPlayed with love on ShoonaConnect 💕♟️`,
      mood: 'romantic',
      location: 'Couple Sanctuary ♟️💕',
      tags: ['Chess', 'CoupleGame', 'DateNight', 'Love'],
      photos: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await supabase
      .from('chess_games')
      .update({ saved_to_memories: true })
      .eq('id', game.id)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.error('Error saving chess match to memories:', err);
  }
}

/**
 * Schedule a "Chess Date Night" into Important Dates
 */
export async function scheduleChessDateNight(
  coupleId: string,
  dateString: string,
  partnerName: string
): Promise<void> {
  try {
    await supabase.from('important_dates').insert({
      couple_id: coupleId,
      title: `Candlelight Chess Date ♟️💕`,
      date: dateString,
      description: `Romantic evening playing chess, sharing sweet moments, and laughing together with ${partnerName}!`,
      category: 'date_night',
      is_recurring: false,
      reminder_days: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error scheduling chess date night:', err);
  }
}

/**
 * Send direct Chess Challenge
 */
export async function sendChessChallenge(
  coupleId: string,
  challenger: { uid: string; displayName: string; photoURL?: string },
  challengedId: string,
  timeControl: TimeControlConfig,
  preferredColor: 'white' | 'black' | 'random' = 'random',
  isCasual: boolean = false
): Promise<string> {
  const { data, error } = await supabase
    .from('chess_challenges')
    .insert({
      couple_id: coupleId,
      challenger_id: challenger.uid,
      challenger_name: challenger.displayName || 'You',
      challenger_photo: challenger.photoURL || '',
      challenged_id: challengedId,
      time_control: timeControl,
      preferred_color: preferredColor,
      is_casual: Boolean(isCasual),
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create challenge');
  }

  return data.id;
}

/**
 * Accept Chess Challenge and generate game
 */
export async function acceptChessChallenge(
  coupleId: string,
  challenge: ChessChallenge,
  acceptor: { uid: string; displayName: string; photoURL?: string }
): Promise<string> {
  let whiteUid = challenge.challengerId;
  let whiteName = challenge.challengerName;
  let whitePhoto = challenge.challengerPhoto || '';
  let blackUid = acceptor.uid;
  let blackName = acceptor.displayName;
  let blackPhoto = acceptor.photoURL || '';

  if (challenge.preferredColor === 'black') {
    whiteUid = acceptor.uid;
    whiteName = acceptor.displayName;
    whitePhoto = acceptor.photoURL || '';
    blackUid = challenge.challengerId;
    blackName = challenge.challengerName;
    blackPhoto = challenge.challengerPhoto || '';
  } else if (challenge.preferredColor === 'random') {
    if (Math.random() < 0.5) {
      whiteUid = acceptor.uid;
      whiteName = acceptor.displayName;
      whitePhoto = acceptor.photoURL || '';
      blackUid = challenge.challengerId;
      blackName = challenge.challengerName;
      blackPhoto = challenge.challengerPhoto || '';
    }
  }

  const gameId = await createChessGame(
    coupleId,
    { uid: whiteUid, displayName: whiteName, photoURL: whitePhoto, color: 'w' },
    { uid: blackUid, displayName: blackName, photoURL: blackPhoto, color: 'b' },
    challenge.timeControl,
    false
  );

  await supabase
    .from('chess_challenges')
    .update({
      status: 'accepted',
      game_id: gameId,
    })
    .eq('id', challenge.id)
    .eq('couple_id', coupleId);

  return gameId;
}

/**
 * Decline challenge
 */
export async function declineChessChallenge(
  coupleId: string,
  challengeId: string
): Promise<void> {
  await supabase
    .from('chess_challenges')
    .update({
      status: 'declined',
    })
    .eq('id', challengeId)
    .eq('couple_id', coupleId);
}

/**
 * Cancel outgoing challenge
 */
export async function cancelChessChallenge(
  coupleId: string,
  challengeId: string
): Promise<void> {
  await supabase
    .from('chess_challenges')
    .update({
      status: 'declined',
    })
    .eq('id', challengeId)
    .eq('couple_id', coupleId);
}

/**
 * Realtime subscription to Chess games
 */
export function listenToChessGames(
  coupleId: string,
  callback: (games: ChessGame[]) => void
): () => void {
  const fetchGames = async () => {
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (data) {
      callback(data.map(chessRowToGame));
    }
  };

  fetchGames();

  const channel = createSafeChannel(`chess_games:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chess_games',
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

/**
 * Realtime subscription to an active Chess game by ID
 */
export function listenToActiveChessGame(
  coupleId: string,
  gameId: string,
  callback: (game: ChessGame | null) => void
): () => void {
  const fetchGame = async () => {
    const { data } = await supabase
      .from('chess_games')
      .select('*')
      .eq('id', gameId)
      .eq('couple_id', coupleId)
      .single();

    if (data) {
      callback(chessRowToGame(data));
    } else {
      callback(null);
    }
  };

  fetchGame();

  const channel = createSafeChannel(`chess_game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chess_games',
        filter: `id=eq.${gameId}`,
      },
      () => {
        fetchGame();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Realtime subscription to Chess challenges
 */
export function listenToChessChallenges(
  coupleId: string,
  callback: (challenges: ChessChallenge[]) => void
): () => void {
  const fetchChallenges = async () => {
    const { data } = await supabase
      .from('chess_challenges')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      callback(data.map(chessChallengeRowToChallenge));
    }
  };

  fetchChallenges();

  const channel = createSafeChannel(`chess_challenges:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chess_challenges',
        filter: `couple_id=eq.${coupleId}`,
      },
      () => {
        fetchChallenges();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
