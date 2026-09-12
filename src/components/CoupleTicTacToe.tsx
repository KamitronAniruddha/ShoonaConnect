import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TicTacToeGame,
  TicTacToeStats,
} from '../types';
import {
  evaluateBoard,
  createTicTacToeGame,
  acceptGameChallenge,
  declineGameChallenge,
  cancelGameChallenge,
  executeMove,
  sendMatchReaction,
  requestOrAcceptRematch,
  calculateCoupleStats,
  updatePlayerSymbol,
  listenToTicTacToeGames,
  COUPLE_VICTORY_MESSAGES,
  COUPLE_DRAW_MESSAGES,
  REACTION_EMOJIS,
} from '../utils/tictactoeService';
import {
  playMoveSound,
  playWinSound,
  playDrawSound,
  isSoundMuted,
  setSoundMuted,
} from '../utils/gameAudio';
import { SymbolPickerModal } from './SymbolPickerModal';
import { GameLiveChat } from './GameLiveChat';
import { WaitingForCoupleModal } from './WaitingForCoupleModal';
import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../lib/supabase';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  Flame,
  Swords,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Smile,
  Zap,
  MessageCircle,
  Palette,
  Maximize2,
  Minimize2,
  Send,
} from 'lucide-react';

interface CoupleTicTacToeProps {
  onBackToGames: () => void;
}

export const CoupleTicTacToe: React.FC<CoupleTicTacToeProps> = ({ onBackToGames }) => {
  const { userProfile, partnerProfile, couple } = useAuth();
  const coupleId = couple?.id;
  const isSoloMode = !partnerProfile;

  // Active game state and complete perpetual history
  const [activeGame, setActiveGame] = useState<TicTacToeGame | null>(null);
  const [allGames, setAllGames] = useState<TicTacToeGame[]>([]);
  const [loadingGame, setLoadingGame] = useState(true);

  // Symbol picker & Chat toggle
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [myCustomSymbol, setMyCustomSymbol] = useState<string>(() => {
    return localStorage.getItem('shoona_tictactoe_symbol') || '✕';
  });

  // Animated floating reaction state for bottom-right corner
  const [floatingReaction, setFloatingReaction] = useState<{
    emoji: string;
    senderName: string;
    id: number;
  } | null>(null);
  const lastProcessedReactionTimestampRef = useRef<number>(0);

  // UI modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [viewingPastGame, setViewingPastGame] = useState<TicTacToeGame | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastResultMessage, setLastResultMessage] = useState<string>('');
  const [moveError, setMoveError] = useState<string | null>(null);
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  // Sound preferences
  const [soundMuted, setSoundMutedState] = useState<boolean>(() => isSoundMuted());

  // Confetti trigger tracking so confetti only fires once per game conclusion
  const celebratedGameIdRef = useRef<string | null>(null);

  // Partner Presence: check if partner updated last active in last 3 minutes
  const isPartnerOnline = useMemo(() => {
    if (!partnerProfile) return false;
    if (!partnerProfile.updatedAt) return true;
    const lastActive = new Date(partnerProfile.updatedAt).getTime();
    const now = Date.now();
    return now - lastActive < 3 * 60 * 1000;
  }, [partnerProfile]);

  // Periodic heartbeat
  useEffect(() => {
    if (!userProfile?.uid) return;
    const heartbeat = setInterval(() => {
      try {
        supabase
          .from('profiles')
          .update({
            last_active_at: new Date().toISOString(),
          })
          .eq('id', userProfile.uid)
          .then(() => {});
      } catch (e) {
        // silent
      }
    }, 60 * 1000);

    return () => clearInterval(heartbeat);
  }, [userProfile?.uid]);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMutedState(next);
    setSoundMuted(next);
  };

  // Real-time listener for perpetual games under this couple
  useEffect(() => {
    if (!coupleId) {
      setLoadingGame(false);
      return;
    }

    const unsubscribe = listenToTicTacToeGames(coupleId, (gamesList) => {
      // Store all games in state: perpetual history never erased!
      setAllGames(gamesList);

      // Active game is the most recent game that is either in_progress or waiting
      const ongoing = gamesList.find((g) => g.status === 'in_progress' || g.status === 'waiting');
      const latest = ongoing || gamesList[0] || null;

      setActiveGame(latest);
      setLoadingGame(false);

      // Check for latest animated reaction sent by other player
      if (latest?.lastReaction && latest.lastReaction.timestamp > lastProcessedReactionTimestampRef.current) {
        lastProcessedReactionTimestampRef.current = latest.lastReaction.timestamp;
        // Trigger floating popup on right bottom side
        setFloatingReaction({
          emoji: latest.lastReaction.emoji,
          senderName: latest.lastReaction.playerId === userProfile?.uid ? 'You' : latest.lastReaction.playerName,
          id: latest.lastReaction.timestamp,
        });

        // Auto clear animation after 3.5 seconds
        setTimeout(() => {
          setFloatingReaction((cur) => (cur?.id === latest.lastReaction?.timestamp ? null : cur));
        }, 3500);
      }

      // Check if latest game just completed and needs victory celebration
      if (latest && latest.status === 'completed' && latest.winner) {
        if (celebratedGameIdRef.current !== latest.id) {
          celebratedGameIdRef.current = latest.id;
          setShowResultModal(true);

          if (latest.winner === 'draw') {
            playDrawSound();
            const randomDrawMsg = COUPLE_DRAW_MESSAGES[Math.floor(Math.random() * COUPLE_DRAW_MESSAGES.length)];
            setLastResultMessage(randomDrawMsg);
          } else {
            playWinSound();
            const randomWinMsg = COUPLE_VICTORY_MESSAGES[Math.floor(Math.random() * COUPLE_VICTORY_MESSAGES.length)];
            setLastResultMessage(randomWinMsg);

            try {
              confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff3377', '#ff4d8d', '#fbbf24', '#ffffff'],
              });
            } catch (e) {
              // fallback
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [coupleId, userProfile?.uid]);

  // Compute stats across all completed games
  const stats: TicTacToeStats = useMemo(() => {
    return calculateCoupleStats(allGames, userProfile?.uid || '');
  }, [allGames, userProfile?.uid]);

  // Determine active symbols for player X and player O
  const playerXSymbol = activeGame?.playerX.symbol || activeGame?.customSymbols?.[activeGame?.playerX.uid] || '✕';
  const playerOSymbol = activeGame?.playerO.symbol || activeGame?.customSymbols?.[activeGame?.playerO.uid] || '◯';

  // Determine current turn
  const isMyTurn = useMemo(() => {
    if (!activeGame || activeGame.status !== 'in_progress') return false;
    if (isSoloMode) return true;
    return activeGame.currentTurnPlayerId === userProfile?.uid;
  }, [activeGame, userProfile?.uid, isSoloMode]);

  const activeTurnName = useMemo(() => {
    if (!activeGame) return '';
    if (activeGame.currentTurn === 'X') {
      return activeGame.playerX.displayName;
    }
    return activeGame.playerO.displayName;
  }, [activeGame]);

  const activeTurnSymbol = useMemo(() => {
    if (!activeGame) return '';
    return activeGame.currentTurn === 'X' ? playerXSymbol : playerOSymbol;
  }, [activeGame, playerXSymbol, playerOSymbol]);

  // Change symbol handler
  const handleSelectSymbol = (newSymbol: string) => {
    setMyCustomSymbol(newSymbol);
    localStorage.setItem('shoona_tictactoe_symbol', newSymbol);

    if (activeGame && coupleId && userProfile) {
      updatePlayerSymbol(coupleId, activeGame.id, userProfile.uid, newSymbol);
    }
  };

  // Start / Challenge New Game
  const handleStartNewGame = async (isChallenge = false) => {
    if (!coupleId || !userProfile) return;
    setMoveError(null);
    try {
      const gameId = await createTicTacToeGame(coupleId, userProfile, partnerProfile, {
        isChallenge,
        starterSymbol: myCustomSymbol,
      });
      setShowResultModal(false);

      // Send realtime notification toast broadcast to partner
      if (partnerProfile) {
        sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation', {
          hostUid: userProfile.uid,
          hostName: userProfile.displayName || 'Your Sweetheart',
          gameType: 'tictactoe',
          gameId,
          title: 'Tic-Tac-Toe 3x3 Match 💕',
        });
      }
    } catch (err) {
      setMoveError('Could not start game. Check your connection.');
    }
  };

  // Cancel outgoing challenge
  const handleCancelGame = async () => {
    if (!activeGame || !coupleId || !userProfile) return;
    try {
      await cancelGameChallenge(coupleId, activeGame.id);
      sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation_cancelled', {
        cancelledBy: userProfile.uid,
        cancelledByName: userProfile.displayName || 'Host',
        gameId: activeGame.id,
      });
    } catch (err) {
      console.warn('Cancel challenge error:', err);
    }
  };

  // Handle cell click (Fast, zero lag)
  const handleCellClick = async (position: number) => {
    if (!activeGame || !coupleId || !userProfile) return;
    if (activeGame.status !== 'in_progress') return;

    if (!isMyTurn && !isSoloMode) {
      setMoveError(`Wait for ${activeTurnName}'s turn! 💗`);
      setTimeout(() => setMoveError(null), 2500);
      return;
    }

    if (activeGame.board[position] !== null) {
      return; // already occupied
    }

    setIsProcessingMove(true);
    setMoveError(null);

    // Immediate sound feedback
    playMoveSound();

    const res = await executeMove(coupleId, activeGame.id, position, userProfile.uid, isSoloMode);
    setIsProcessingMove(false);

    if (!res.success && res.error) {
      setMoveError(res.error);
      setTimeout(() => setMoveError(null), 3000);
    }
  };

  // Rematch request
  const handleRematchClick = async () => {
    if (!activeGame || !coupleId || !userProfile) return;
    try {
      const newGameId = await requestOrAcceptRematch(coupleId, activeGame, userProfile.uid, isSoloMode);
      if (newGameId) {
        setShowResultModal(false);
      }
    } catch (err) {
      console.warn('Rematch error:', err);
    }
  };

  // Send reaction (Instant, triggers bottom right animation on partner's screen)
  const handleSendReaction = async (emoji: string) => {
    if (!activeGame || !coupleId || !userProfile) return;

    // Trigger local immediate floating reaction
    setFloatingReaction({
      emoji,
      senderName: 'You',
      id: Date.now(),
    });
    setTimeout(() => {
      setFloatingReaction(null);
    }, 3000);

    try {
      await sendMatchReaction(
        coupleId,
        activeGame.id,
        userProfile.uid,
        userProfile.displayName || 'You',
        emoji
      );
    } catch (err) {
      console.warn('Reaction error:', err);
    }
  };

  const incomingChallenge =
    activeGame &&
    activeGame.status === 'waiting' &&
    activeGame.challengeStatus === 'pending' &&
    activeGame.challengedBy !== userProfile?.uid
      ? activeGame
      : null;

  const [selectedWinnerReaction, setSelectedWinnerReaction] = useState<string>('❤️');
  const [reactionSentConfirmation, setReactionSentConfirmation] = useState(false);

  const hasSentRematch = activeGame?.rematchRequestedBy?.includes(userProfile?.uid || '');
  const hasPendingRematchFromPartner =
    activeGame?.rematchRequestedBy &&
    activeGame.rematchRequestedBy.length > 0 &&
    !hasSentRematch;

  const handleSendSelectedReaction = async () => {
    if (!selectedWinnerReaction) return;
    await handleSendReaction(selectedWinnerReaction);
    setReactionSentConfirmation(true);
    setTimeout(() => setReactionSentConfirmation(false), 2500);
  };

  return (
    <div className="h-screen w-full bg-[#0a0709] text-neutral-100 flex flex-col overflow-hidden relative select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff3377]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="px-3 sm:px-6 py-2.5 bg-[#120c11]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToGames}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Back to Games</span>
          </button>

          <div className="leading-tight pl-1">
            <h1 className="text-xs sm:text-sm font-black font-fraunces text-white flex items-center gap-1.5">
              💕 Couple Tic-Tac-Toe
            </h1>
            <span className="text-[10px] text-neutral-400 italic">
              "Just a little friendly competition."
            </span>
          </div>
        </div>

        {/* Top Quick Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Change Symbol Button */}
          <button
            type="button"
            onClick={() => setShowSymbolPicker(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a1118] border border-[#ff3377]/30 hover:border-[#ff3377] text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Choose Symbol or Emoji"
          >
            <Palette className="w-3.5 h-3.5 text-[#ff4d8d]" />
            <span className="text-sm font-black text-[#ff4d8d]">{myCustomSymbol}</span>
            <span className="hidden md:inline text-[11px] text-neutral-400">Mark</span>
          </button>

          {/* Chat Toggle Button */}
          <button
            type="button"
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showChatPanel
                ? 'bg-[#ff3377] border-[#ff3377] text-white shadow-md shadow-pink-500/30'
                : 'bg-[#1a1118] border-white/10 hover:border-pink-500/40 text-neutral-300 hover:text-white'
            }`}
            title="Toggle Live In-Game Chat"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Game History & Stats Button */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#1a1118] border border-white/10 hover:border-amber-400/40 text-xs font-bold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="View Perpetual Game History & Streaks"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Game History</span>
            <span className="text-[10px] font-bold text-amber-400">({allGames.length})</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-[#1a1118] border border-white/10 hover:border-pink-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
            title={soundMuted ? 'Sound is Muted (Click to Unmute)' : 'Sound is On (Click to Mute)'}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#ff4d8d]" />
            )}
          </button>
        </div>
      </header>

      {/* COMPACT STATS STRIP */}
      <div className="px-3 sm:px-6 py-1.5 bg-[#0e090d]/80 border-b border-white/5 flex items-center justify-between text-[11px] shrink-0 z-10">
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Played:</span>
            <span className="font-bold text-white">{stats.totalGames}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400">Your Wins:</span>
            <span className="font-bold text-[#ff4d8d]">{stats.yourWins}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">Partner Wins:</span>
            <span className="font-bold text-amber-400">{stats.partnerWins}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Draws:</span>
            <span className="font-bold text-neutral-300">{stats.draws}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-purple-300 font-bold shrink-0">
          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>Current Streak: {stats.currentWinStreak}</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400 font-normal">Best: {stats.bestWinStreak}</span>
        </div>
      </div>

      {/* MAIN GAMEPLAY STAGE */}
      <main className="flex-1 min-h-0 flex flex-col md:flex-row items-stretch justify-center p-2 sm:p-4 gap-3 relative z-10 overflow-hidden">
        {/* LEFT / CENTER: MATCH BOARD & PLAYER HEADS */}
        <div className="flex-1 flex flex-col items-center justify-between max-w-xl mx-auto w-full h-full min-h-0 py-1">
          {/* GAME INVITATION / INCOMING CHALLENGE BANNER */}
          {incomingChallenge && (
            <div className="w-full bg-gradient-to-r from-[#2a1324] via-[#38162e] to-[#1e0f1a] border border-[#ff3377] rounded-2xl p-2.5 sm:p-3 text-center shadow-lg flex items-center justify-between gap-3 shrink-0 mb-1 animate-pulse">
              <div className="text-left">
                <span className="text-xs font-bold text-white block">
                  Your partner challenged you to Tic-Tac-Toe 🎮💕
                </span>
                <span className="text-[10px] text-neutral-300">Ready for a little friendly match?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => acceptGameChallenge(coupleId!, incomingChallenge.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#ff3377] hover:bg-[#ff4d8d] text-white font-bold text-[11px] shadow-sm cursor-pointer"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => declineGameChallenge(coupleId!, incomingChallenge.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 text-[11px] cursor-pointer"
                >
                  Not Now
                </button>
              </div>
            </div>
          )}

          {/* PARTNER DISCONNECT NOTICE IF IN-PROGRESS */}
          {activeGame && activeGame.status === 'in_progress' && !isSoloMode && !isPartnerOnline && (
            <div className="w-full bg-amber-950/40 border border-amber-500/30 rounded-xl px-3 py-1 text-center shrink-0 mb-1 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[11px] text-amber-200 font-medium">
                Waiting for your partner...
              </span>
            </div>
          )}

          {/* PLAYER AREA */}
          {activeGame ? (
            <div className="w-full flex items-center justify-between gap-2 sm:gap-4 bg-[#140d13]/90 border border-white/10 rounded-2xl p-2 sm:p-2.5 shrink-0 shadow-lg">
              {/* Player X Area */}
              <div
                className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all ${
                  activeGame.currentTurn === 'X' && activeGame.status === 'in_progress'
                    ? 'bg-[#2a1323] border border-[#ff3377] shadow-[0_0_15px_rgba(255,51,119,0.35)]'
                    : 'bg-[#181116] border border-white/5 opacity-85'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#ff3377] to-rose-400 p-0.5 shadow-sm">
                    {activeGame.playerX.photoURL ? (
                      <img
                        src={activeGame.playerX.photoURL}
                        alt={activeGame.playerX.displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-[10px] object-cover bg-[#0d090c]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[10px] bg-[#1a0e18] flex items-center justify-center text-xs font-black text-white">
                        {activeGame.playerX.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-[#ff3377] text-white text-[11px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#0d090c]">
                    {playerXSymbol}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate block">
                      [X] {activeGame.playerX.displayName}
                    </span>
                    {activeGame.playerX.uid === userProfile?.uid && (
                      <span className="text-[8px] font-black bg-white/10 text-neutral-300 px-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] flex items-center gap-1 font-medium">
                    {activeGame.playerX.uid === userProfile?.uid ? (
                      <span className="text-emerald-400">● Online</span>
                    ) : isPartnerOnline ? (
                      <span className="text-emerald-400">● Partner Online</span>
                    ) : (
                      <span className="text-neutral-400">○ Partner Offline</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Center VS Indicator */}
              <div className="flex flex-col items-center shrink-0 px-1">
                <span className="text-xs font-black text-[#ff4d8d] tracking-wider">VS</span>
              </div>

              {/* Player O Area */}
              <div
                className={`flex-1 flex items-center gap-2 p-1.5 sm:p-2 rounded-xl transition-all ${
                  activeGame.currentTurn === 'O' && activeGame.status === 'in_progress'
                    ? 'bg-[#261c16] border border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                    : 'bg-[#181116] border border-white/5 opacity-85'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-sm">
                    {activeGame.playerO.photoURL ? (
                      <img
                        src={activeGame.playerO.photoURL}
                        alt={activeGame.playerO.displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-[10px] object-cover bg-[#0d090c]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[10px] bg-[#1a120c] flex items-center justify-center text-xs font-black text-amber-300">
                        {activeGame.playerO.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[11px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#0d090c]">
                    {playerOSymbol}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate block">
                      [O] {activeGame.playerO.displayName}
                    </span>
                    {activeGame.playerO.uid === userProfile?.uid && (
                      <span className="text-[8px] font-black bg-white/10 text-neutral-300 px-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] flex items-center gap-1 font-medium">
                    {activeGame.playerO.uid === userProfile?.uid ? (
                      <span className="text-emerald-400">● Online</span>
                    ) : isPartnerOnline ? (
                      <span className="text-emerald-400">● Partner Online</span>
                    ) : (
                      <span className="text-neutral-400">○ Partner Offline</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* BEAUTIFUL EMPTY STATE */
            <div className="w-full bg-[#160f14] border border-[#ff3377]/30 rounded-3xl p-6 text-center space-y-3 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 mx-auto shadow-lg shadow-pink-500/25 flex items-center justify-center text-3xl">
                🎮
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-fraunces text-white">
                  Ready for a little competition? 💕
                </h3>
                <p className="text-xs text-neutral-300">
                  Challenge your partner to Tic-Tac-Toe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleStartNewGame(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-pink-500/25 cursor-pointer active:scale-95 transition-all"
              >
                Start Game
              </button>
            </div>
          )}

          {/* CURRENT TURN INDICATOR */}
          {activeGame && (
            <div className="text-center my-1 shrink-0">
              {activeGame.status === 'in_progress' ? (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
                    isMyTurn
                      ? 'bg-[#ff3377]/20 border-[#ff3377] text-white shadow-md shadow-pink-500/25 animate-pulse'
                      : 'bg-white/5 border-white/10 text-neutral-300'
                  }`}
                >
                  <span>{`${activeTurnName}'s turn 💗`}</span>
                  <span className="text-neutral-400 text-[10px]">
                    (Mark: <strong className="text-white text-xs">{activeTurnSymbol}</strong>)
                  </span>
                </div>
              ) : activeGame.status === 'completed' ? (
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-xs font-bold">
                  {activeGame.winner === 'draw'
                    ? "It's a Draw! 💕"
                    : `${activeGame.winnerName} Wins! 🎉`}
                </div>
              ) : null}

              {moveError && (
                <div className="text-[11px] font-bold text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-0.5 rounded-full inline-block mt-1 animate-bounce">
                  {moveError}
                </div>
              )}
            </div>
          )}

          {/* 3x3 TIC-TAC-TOE BOARD */}
          {activeGame && (
            <div className="w-full flex items-center justify-center flex-1 min-h-0 py-1">
              <div className="w-[min(65vw,310px)] sm:w-[min(45vh,350px)] aspect-square grid grid-cols-3 gap-2.5 sm:gap-3.5 p-2.5 sm:p-3.5 bg-[#120b10] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                {activeGame.board.map((cellValue, idx) => {
                  const isWinningCell = activeGame.winningCells?.includes(idx);
                  const isOccupied = cellValue !== null;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isOccupied || activeGame.status !== 'in_progress' || isProcessingMove}
                      onClick={() => handleCellClick(idx)}
                      className={`aspect-square rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-150 cursor-pointer relative overflow-hidden group select-none active:scale-95 ${
                        isWinningCell
                          ? 'bg-gradient-to-br from-[#ff3377]/40 via-[#ff4d8d]/30 to-[#ff3377]/40 border-2 border-[#ff3377] shadow-[0_0_25px_rgba(255,51,119,0.7)] animate-pulse'
                          : isOccupied
                          ? 'bg-[#191017] border border-white/10'
                          : 'bg-[#180f16]/90 hover:bg-[#251522] border border-white/10 hover:border-[#ff3377]/60 hover:shadow-lg hover:shadow-pink-500/20'
                      }`}
                    >
                      {/* Ghost preview on player's turn */}
                      {!isOccupied && activeGame.status === 'in_progress' && isMyTurn && (
                        <span className="opacity-0 group-hover:opacity-30 text-2xl sm:text-3xl font-black text-[#ff3377] transition-opacity">
                          {activeTurnSymbol}
                        </span>
                      )}

                      {/* Placed mark: Supports standard symbols or custom emoji */}
                      {cellValue && (
                        <span className="text-3xl sm:text-4xl font-black drop-shadow-[0_0_8px_rgba(255,51,119,0.5)] transform scale-100 transition-transform">
                          {cellValue}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS & REACTIONS */}
          <div className="w-full flex flex-col items-center gap-2 shrink-0 pt-1">
            {/* Quick Reactions Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#120b10] border border-white/10 px-3 py-1.5 rounded-full shadow-lg overflow-x-auto scrollbar-none max-w-full">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1 hidden sm:inline">
                React:
              </span>
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendReaction(emoji)}
                  className="text-base sm:text-lg p-1 hover:scale-130 active:scale-95 transition-transform cursor-pointer"
                  title={`Send ${emoji} to partner`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* GAME CONTROLS: New Game, Rematch, Game History, Back to Games */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleStartNewGame(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 hover:text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#ff4d8d]" />
                New Game
              </button>

              {activeGame && activeGame.status === 'completed' && (
                <button
                  type="button"
                  onClick={handleRematchClick}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] text-white font-bold text-xs shadow-md shadow-pink-500/20 hover:brightness-110 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {hasSentRematch ? 'Waiting for partner... ⏳' : 'Rematch? 💕'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Game History
              </button>

              <button
                type="button"
                onClick={onBackToGames}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-neutral-200 font-bold text-xs cursor-pointer transition-colors"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: LIVE IN-GAME CHAT */}
        {showChatPanel && (
          <div className="w-full md:w-80 h-64 md:h-full shrink-0 z-20 animate-in slide-in-from-bottom md:slide-in-from-right duration-200">
            {activeGame ? (
              <GameLiveChat
                coupleId={coupleId!}
                gameId={activeGame.id}
                currentUser={{
                  uid: userProfile?.uid || '',
                  displayName: userProfile?.displayName || 'Me',
                  photoURL: userProfile?.photoURL,
                }}
                partnerName={partnerProfile?.displayName}
                isSoloMode={isSoloMode}
              />
            ) : (
              <div className="h-full bg-[#110b10] border border-white/10 rounded-2xl flex items-center justify-center text-xs text-neutral-500">
                Start a game to chat live!
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING REACTION NOTIFICATION */}
      {floatingReaction && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#1d121b]/95 border-2 border-[#ff3377] shadow-[0_0_25px_rgba(255,51,119,0.4)] backdrop-blur-xl">
            <span className="text-3xl animate-bounce">{floatingReaction.emoji}</span>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Reaction from
              </span>
              <span className="text-xs font-black text-white">
                {floatingReaction.senderName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHOOSE SYMBOLS / EMOJI PICKER */}
      {showSymbolPicker && (
        <SymbolPickerModal
          currentSymbol={myCustomSymbol}
          partnerSymbol={activeGame?.playerO.symbol}
          onSelectSymbol={handleSelectSymbol}
          onClose={() => setShowSymbolPicker(false)}
        />
      )}

      {/* MODAL: MATCH RESULT & CELEBRATION */}
      {showResultModal && activeGame && activeGame.status === 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#160f14] rounded-3xl border border-[#ff3377]/40 p-5 sm:p-6 shadow-2xl space-y-4 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#ff3377]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 mx-auto shadow-lg shadow-pink-500/25 flex items-center justify-center text-3xl">
              {activeGame.winner === 'draw' ? '💕' : '🎉'}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black font-fraunces text-white">
                {activeGame.winner === 'draw'
                  ? "It's a Draw! 🤝"
                  : activeGame.winner === userProfile?.uid
                  ? "You Won! 🎉"
                  : `${activeGame.winnerName || partnerProfile?.displayName || 'Partner'} Won! ❤️`}
              </h3>
              <p className="text-xs text-neutral-300 font-medium px-2">
                {lastResultMessage}
              </p>
            </div>

            {/* Winner reactions with Send Reaction button */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Choose Winner Reaction
              </span>
              <div className="flex items-center justify-center gap-2">
                {['❤️', '😂', '😘', '🔥', '🥰'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedWinnerReaction(emoji)}
                    className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer ${
                      selectedWinnerReaction === emoji
                        ? 'bg-[#ff3377] scale-125 shadow-md shadow-pink-500/30'
                        : 'bg-white/5 hover:bg-white/10 hover:scale-110'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSendSelectedReaction}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {reactionSentConfirmation ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sent! 💕</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 text-[#ff4d8d]" />
                    <span>Send Reaction</span>
                  </>
                )}
              </button>
            </div>

            {/* REMATCH SECTION: "Rematch? 💕" -> Rematch / Maybe Later */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-white block">
                Rematch? 💕
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRematchClick}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:brightness-110 cursor-pointer active:scale-95"
                >
                  {hasSentRematch ? 'Waiting for Partner... ⏳' : 'Rematch'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300 font-bold text-xs cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </div>

            {/* Play Again & Back to Games */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  handleStartNewGame(false);
                }}
                className="text-[11px] text-[#ff4d8d] hover:underline font-bold cursor-pointer"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  onBackToGames();
                }}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MATCH HISTORY & REPLAY (Never erases past matches) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#160f14] rounded-3xl border border-white/15 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-fraunces text-white">
                    Perpetual Match History
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    All games played are saved permanently and never erased!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setViewingPastGame(null);
                }}
                className="text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Stats summary bar */}
            <div className="grid grid-cols-4 gap-2 text-center bg-[#0d090c] p-2.5 rounded-2xl border border-white/5 shrink-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-400 block">Total Games</span>
                <span className="text-sm font-black text-white">{stats.totalGames}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-rose-400 block">Your Wins</span>
                <span className="text-sm font-black text-[#ff4d8d]">{stats.yourWins}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-400 block">Partner Wins</span>
                <span className="text-sm font-black text-amber-400">{stats.partnerWins}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-purple-400 block">Best Streak</span>
                <span className="text-sm font-black text-purple-300">{stats.bestWinStreak}</span>
              </div>
            </div>

            {/* Match replay view if selected */}
            {viewingPastGame && (
              <div className="bg-[#1e131b] border border-[#ff3377]/40 rounded-2xl p-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ff4d8d]">
                    Match Replay · {new Date(viewingPastGame.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingPastGame(null)}
                    className="text-[10px] text-neutral-400 hover:text-white"
                  >
                    Hide Replay
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 w-32 mx-auto bg-[#0d090c] p-2 rounded-xl border border-white/10">
                  {viewingPastGame.board.map((val, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center font-black text-sm ${
                        viewingPastGame.winningCells?.includes(i)
                          ? 'bg-[#ff3377]/30 border border-[#ff3377] text-white'
                          : 'bg-white/5 text-neutral-300'
                      }`}
                    >
                      {val || ''}
                    </div>
                  ))}
                </div>
                <div className="text-center text-[11px] text-neutral-300">
                  Winner: <strong className="text-white">{viewingPastGame.winner === 'draw' ? "Draw 💕" : `${viewingPastGame.winnerName} 🏆`}</strong>
                </div>
              </div>
            )}

            {/* Scrollable list of past games */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Recorded Games ({allGames.length})
              </span>
              {allGames.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">
                  No games played yet. Play your first match!
                </div>
              ) : (
                allGames.map((match) => (
                  <div
                    key={match.id}
                    className="p-2.5 rounded-xl bg-[#0d090c] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {match.playerX.displayName} ({match.playerX.symbol || '✕'}) vs{' '}
                          {match.playerO.displayName} ({match.playerO.symbol || '◯'})
                        </span>
                        {match.winner === 'draw' ? (
                          <span className="px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-300 text-[9px] font-bold">
                            Draw
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full bg-[#ff3377]/20 border border-[#ff3377]/30 text-[#ff4d8d] text-[9px] font-bold">
                            🏆 {match.winnerName} Won
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(match.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span>• {match.moveCount || 0} moves</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewingPastGame(match)}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {/* Waiting for Couple Modal Overlay */}
      {activeGame &&
        activeGame.status === 'waiting' &&
        activeGame.playerX.uid === userProfile?.uid && (
          <WaitingForCoupleModal
            gameTitle="Tic-Tac-Toe 3x3 Match 💕"
            gameSubtitle={`Challenging ${partnerProfile?.displayName || 'Partner'}! Waiting for them to accept & join...`}
            gameType="tictactoe"
            gameId={activeGame.id}
            onCancelGame={handleCancelGame}
            onClose={handleCancelGame}
          />
        )}
    </div>
  );
};
