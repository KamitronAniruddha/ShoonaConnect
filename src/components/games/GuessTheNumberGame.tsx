import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../../lib/supabase';
import confetti from 'canvas-confetti';
import { playWinSound } from '../../utils/gameAudio';
import { WaitingForCoupleModal } from '../WaitingForCoupleModal';
import {
  NumberGuessingGame,
  NumberGuessRecord,
  generateSecretNumber,
  getRangeByDigitMode,
} from '../../utils/numberGuessingService';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Trophy,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  HelpCircle,
  Zap,
  Flame,
  User,
  Volume2,
  VolumeX,
  Send,
  Lock,
} from 'lucide-react';

interface GuessTheNumberGameProps {
  onBackToGames: () => void;
}

export const GuessTheNumberGame: React.FC<GuessTheNumberGameProps> = ({ onBackToGames }) => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const coupleId = couple?.id || 'local_demo_couple';

  // Game configuration
  const [digitMode, setDigitMode] = useState<2 | 3 | 4>(2);
  const [isSoloMode, setIsSoloMode] = useState(!partnerProfile?.uid);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Game State
  const [game, setGame] = useState<NumberGuessingGame | null>(null);
  const [incomingGameInvitation, setIncomingGameInvitation] = useState<NumberGuessingGame | null>(null);
  const [isWaitingForPartner, setIsWaitingForPartner] = useState(false);
  const [currentGuessInput, setCurrentGuessInput] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // Preserve game state inside a ref to avoid infinite subscription resets
  const gameRef = useRef<NumberGuessingGame | null>(null);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Range Narrowing Visualizer helper
  const [narrowedMin, setNarrowedMin] = useState<number>(10);
  const [narrowedMax, setNarrowedMax] = useState<number>(99);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sound feedback
  const playHighLowSound = (isHigher: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigher ? 520 : 320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isHigher ? 780 : 220, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  };

  // Start a new game round
  const handleStartNewGame = (mode: 2 | 3 | 4 = digitMode) => {
    if (!userProfile) return;
    const { min, max } = getRangeByDigitMode(mode);
    const secret = generateSecretNumber(mode);

    const partnerUid = partnerProfile?.uid || 'partner_demo';
    const partnerName = partnerProfile?.displayName || 'My Sweetheart';

    const newGame: NumberGuessingGame = {
      id: 'num_game_' + Date.now(),
      coupleId,
      digitMode: mode,
      minRange: min,
      maxRange: max,
      secretNumber: secret,
      currentTurnPlayerId: userProfile.uid,
      currentTurnPlayerName: userProfile.displayName || 'You',
      status: 'in_progress',
      winnerUid: null,
      winnerName: null,
      guessCount: 0,
      guesses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      player1Uid: userProfile.uid,
      player1Name: userProfile.displayName || 'You',
      player2Uid: partnerUid,
      player2Name: partnerName,
    };

    setDigitMode(mode);
    setGame(newGame);
    setNarrowedMin(min);
    setNarrowedMax(max);
    setFeedbackMessage(null);
    setShowVictoryModal(false);
    setCurrentGuessInput('');
    setIncomingGameInvitation(null);

    if (!isSoloMode && partnerProfile) {
      setIsWaitingForPartner(true);
    } else {
      setIsWaitingForPartner(false);
    }

    // Broadcast update to partner
    broadcastGame(newGame);
  };

  const handleAcceptIncomingInvitation = () => {
    if (!incomingGameInvitation || !userProfile) return;

    const acceptedGame: NumberGuessingGame = {
      ...incomingGameInvitation,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    };

    setGame(acceptedGame);
    const { min, max } = getRangeByDigitMode(acceptedGame.digitMode);
    setDigitMode(acceptedGame.digitMode);
    setNarrowedMin(min);
    setNarrowedMax(max);
    setIncomingGameInvitation(null);
    setIsWaitingForPartner(false);

    // Broadcast acknowledgment and current game state back
    sendRealtimeBroadcast(`num_guess_realtime:${coupleId}`, 'partner_joined', {
      joinedBy: userProfile.uid,
      joinedByName: userProfile.displayName || 'Sweetheart',
    });
    sendRealtimeBroadcast(`num_guess_realtime:${coupleId}`, 'guess_game_state', acceptedGame);
  };

  const handleDeclineIncomingInvitation = () => {
    if (!incomingGameInvitation || !userProfile) return;

    sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation_declined', {
      declinedBy: userProfile.uid,
      declinedByName: userProfile.displayName || 'Partner',
      gameId: incomingGameInvitation.id,
    });

    setIncomingGameInvitation(null);
  };

  // Cancel Game Invitation
  const handleCancelInvitation = () => {
    if (coupleId && userProfile) {
      sendRealtimeBroadcast(`partner_notifications:${coupleId}`, 'game_invitation_cancelled', {
        cancelledBy: userProfile.uid,
        cancelledByName: userProfile.displayName || 'Host',
        gameId: game?.id,
      });
    }
    setIsWaitingForPartner(false);
    setGame(null);
  };

  // Broadcast game state to partner via Supabase Realtime channel
  const broadcastGame = (updatedGame: NumberGuessingGame) => {
    sendRealtimeBroadcast(`num_guess_realtime:${coupleId}`, 'guess_game_state', updatedGame);
  };

  // Listen for real-time broadcasts from partner
  useEffect(() => {
    if (!coupleId) return;

    const channel = createSafeChannel(`num_guess_realtime:${coupleId}`)
      .on('broadcast', { event: 'guess_game_state' }, (event) => {
        if (event.payload) {
          const receivedGame: NumberGuessingGame = event.payload;

          // If this is an active game started by partner and we don't have it or it's a new round, set/auto-accept it!
          if (receivedGame.status === 'in_progress' && receivedGame.player2Uid === userProfile?.uid) {
            const activeGameId = localStorage.getItem('shoona_active_game_id');
            const isNewRound = !gameRef.current || gameRef.current.id !== receivedGame.id;
            
            if (activeGameId === receivedGame.id || isNewRound) {
              localStorage.removeItem('shoona_active_game_id');
              setGame(receivedGame);
              setIncomingGameInvitation(null);
              setIsWaitingForPartner(false);

              // Update narrowed bounds for new game / synced game
              const { min, max } = getRangeByDigitMode(receivedGame.digitMode);
              let currentMin = min;
              let currentMax = max;
              receivedGame.guesses.forEach((g) => {
                if (g.result === 'higher' && g.guessNumber > currentMin) {
                  currentMin = g.guessNumber + 1;
                } else if (g.result === 'lower' && g.guessNumber < currentMax) {
                  currentMax = g.guessNumber - 1;
                }
              });
              setNarrowedMin(currentMin);
              setNarrowedMax(currentMax);

              // Broadcast back that we have joined their lobby
              sendRealtimeBroadcast(`num_guess_realtime:${coupleId}`, 'partner_joined', {
                joinedBy: userProfile?.uid,
                joinedByName: userProfile?.displayName || 'Sweetheart',
              });
              return;
            }
          }

          setGame(receivedGame);
          setIncomingGameInvitation(null);

          // Update narrowed bounds
          const { min, max } = getRangeByDigitMode(receivedGame.digitMode);
          let currentMin = min;
          let currentMax = max;
          receivedGame.guesses.forEach((g) => {
            if (g.result === 'higher' && g.guessNumber > currentMin) {
              currentMin = g.guessNumber + 1;
            } else if (g.result === 'lower' && g.guessNumber < currentMax) {
              currentMax = g.guessNumber - 1;
            }
          });
          setNarrowedMin(currentMin);
          setNarrowedMax(currentMax);

          // If broadcast received from partner or update happens, close waiting modal
          setIsWaitingForPartner(false);

          if (receivedGame.status === 'completed') {
            setShowVictoryModal(true);
            if (receivedGame.winnerUid === userProfile?.uid) {
              confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              playWinSound();
            }
          }
        }
      })
      .on('broadcast', { event: 'request_current_game_state' }, () => {
        // If we are currently hosting a game, broadcast the state back so the joiner gets it
        if (gameRef.current) {
          broadcastGame(gameRef.current);
        }
      })
      .on('broadcast', { event: 'partner_joined' }, () => {
        // Partner has explicitly accepted and joined our lobby
        setIsWaitingForPartner(false);
        if (gameRef.current) {
          // Send them the state immediately
          broadcastGame(gameRef.current);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Ask the partner if they are hosting an active game
          sendRealtimeBroadcast(`num_guess_realtime:${coupleId}`, 'request_current_game_state', {});
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, userProfile?.uid]);

  // Handle Guess Submission
  const handleSubmitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || game.status !== 'in_progress' || !userProfile) return;

    // Turn check (in couple mode)
    if (!isSoloMode && game.currentTurnPlayerId !== userProfile.uid) {
      setFeedbackMessage(`Wait for ${game.currentTurnPlayerName}'s turn! ⏳`);
      setTimeout(() => setFeedbackMessage(null), 2500);
      return;
    }

    const num = parseInt(currentGuessInput, 10);
    if (isNaN(num)) return;

    const { min, max } = getRangeByDigitMode(game.digitMode);
    if (num < min || num > max) {
      setFeedbackMessage(`Please enter a valid ${game.digitMode}-digit number between ${min} and ${max}.`);
      setTimeout(() => setFeedbackMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    let result: 'higher' | 'lower' | 'correct' = 'correct';
    if (num < game.secretNumber) {
      result = 'higher'; // Target number is HIGHER than guess
    } else if (num > game.secretNumber) {
      result = 'lower'; // Target number is LOWER than guess
    }

    const newRecord: NumberGuessRecord = {
      id: 'g_' + Date.now(),
      playerUid: userProfile.uid,
      playerName: userProfile.displayName || 'You',
      guessNumber: num,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const isMatch = result === 'correct';
    const nextTurnPlayerId =
      userProfile.uid === game.player1Uid ? game.player2Uid : game.player1Uid;
    const nextTurnPlayerName =
      userProfile.uid === game.player1Uid ? game.player2Name : game.player1Name;

    // Calculate narrowed range
    let newMin = narrowedMin;
    let newMax = narrowedMax;
    if (result === 'higher' && num >= newMin) {
      newMin = num + 1;
    } else if (result === 'lower' && num <= newMax) {
      newMax = num - 1;
    }
    setNarrowedMin(newMin);
    setNarrowedMax(newMax);

    const updatedGame: NumberGuessingGame = {
      ...game,
      status: isMatch ? 'completed' : 'in_progress',
      winnerUid: isMatch ? userProfile.uid : null,
      winnerName: isMatch ? (userProfile.displayName || 'You') : null,
      guessCount: game.guessCount + 1,
      guesses: [newRecord, ...game.guesses],
      currentTurnPlayerId: isMatch ? game.currentTurnPlayerId : (isSoloMode ? userProfile.uid : nextTurnPlayerId),
      currentTurnPlayerName: isMatch ? game.currentTurnPlayerName : (isSoloMode ? (userProfile.displayName || 'You') : nextTurnPlayerName),
      updatedAt: new Date().toISOString(),
    };

    setGame(updatedGame);
    setCurrentGuessInput('');
    setIsSubmitting(false);

    // Audio & Feedback
    if (isMatch) {
      setShowVictoryModal(true);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
      playWinSound();
    } else {
      playHighLowSound(result === 'higher');
      setFeedbackMessage(
        result === 'higher'
          ? `📈 Target number is HIGHER than ${num}!`
          : `📉 Target number is LOWER than ${num}!`
      );
      setTimeout(() => setFeedbackMessage(null), 3000);
    }

    // Broadcast move to partner
    broadcastGame(updatedGame);
  };

  const isMyTurn = !game || isSoloMode || game.currentTurnPlayerId === userProfile?.uid;

  return (
    <div className="min-h-screen bg-[#0d090c] text-neutral-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button
            onClick={onBackToGames}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Realtime Number Guessing
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Start Game Setup Screen (if no active game) */}
        {!game && incomingGameInvitation ? (
          <div className="bg-gradient-to-br from-[#1c0e18] via-[#2d1223] to-[#140b12] border-2 border-[#ff3377] rounded-3xl p-6 sm:p-8 space-y-6 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden animate-pulse-subtle">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3377]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-pink-500 p-0.5 shadow-xl shadow-pink-500/35 mx-auto flex items-center justify-center text-4xl">
              🎮
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff3377]/20 border border-[#ff3377]/40 text-[#ff4d8d] text-[10px] font-black uppercase tracking-wider">
                💓 Active Challenge Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-fraunces text-white">
                Play Guess the Number!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300">
                Your sweetheart <span className="text-[#ff4d8d] font-extrabold">{incomingGameInvitation.player1Name}</span> challenged you to a <span className="text-amber-400 font-extrabold">{incomingGameInvitation.digitMode}-Digit</span> number guessing match!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleAcceptIncomingInvitation}
                className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-pink-500 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-pink-500/35 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                Accept & Play 💕
              </button>
              <button
                onClick={handleDeclineIncomingInvitation}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
        ) : !game ? (
          <div className="bg-[#160f14] border border-[#ff3377]/30 rounded-3xl p-6 sm:p-8 space-y-6 text-center max-w-lg mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ff3377]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-xl shadow-pink-500/25 mx-auto flex items-center justify-center text-4xl">
              🔢
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black font-fraunces text-white">
                Guess the Secret Number 💕
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300">
                A secret number is generated randomly. Take turns guessing—the game tells you if the secret target is <span className="text-amber-400 font-bold">HIGHER</span> or <span className="text-pink-400 font-bold">LOWER</span>!
              </p>
            </div>

            {/* Digit Selection Mode */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block text-center">
                Select Difficulty / Digit Length
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { mode: 2, label: '2-Digit ⚡', range: '10 to 99', desc: 'Fast & Fun' },
                    { mode: 3, label: '3-Digit 🔮', range: '100 to 999', desc: 'Classic Mystery' },
                    { mode: 4, label: '4-Digit 🧠', range: '1000 to 9999', desc: 'Mastermind' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => setDigitMode(opt.mode)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      digitMode === opt.mode
                        ? 'bg-gradient-to-b from-[#ff3377] to-[#d92662] border-[#ff3377] text-white shadow-lg shadow-pink-500/30 scale-105'
                        : 'bg-white/5 border-white/10 hover:border-pink-500/50 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="text-sm font-black">{opt.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{opt.range}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Option: Partner vs Practice Solo */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSoloMode(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isSoloMode
                    ? 'bg-[#ff3377]/20 border border-[#ff3377] text-[#ff4d8d]'
                    : 'bg-white/5 border border-white/10 text-neutral-400'
                }`}
              >
                👥 Couple Realtime Mode
              </button>
              <button
                type="button"
                onClick={() => setIsSoloMode(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSoloMode
                    ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                    : 'bg-white/5 border border-white/10 text-neutral-400'
                }`}
              >
                🎮 Solo Practice Mode
              </button>
            </div>

            <button
              onClick={() => handleStartNewGame(digitMode)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-amber-500 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-5 h-5" /> Start Secret Number Game!
            </button>
          </div>
        ) : (
          /* Active Gameplay Interface */
          <div className="space-y-6">
            {/* Top Game Status Card */}
            <div className="bg-[#160f14] border border-[#ff3377]/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-md flex items-center justify-center text-3xl shrink-0">
                  🔮
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-bold text-neutral-400">
                      {game.digitMode}-Digit Mode ({game.minRange} - {game.maxRange})
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-amber-300 font-mono">
                      Attempts: {game.guessCount}
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-fraunces text-white mt-0.5">
                    {isMyTurn ? '👉 Your Turn to Guess!' : `⏳ Waiting for ${game.currentTurnPlayerName}...`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartNewGame(game.digitMode)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart Round
                </button>
              </div>
            </div>

            {/* Narrowed Range Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#ff3377]/10 to-purple-500/10 border border-amber-500/30 text-center space-y-1">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400">
                Narrowed Target Range
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-widest">
                Between <span className="text-emerald-400 underline">{narrowedMin}</span> and{' '}
                <span className="text-pink-400 underline">{narrowedMax}</span>
              </div>
            </div>

            {/* Secret Number Mask Display */}
            <div className="bg-[#1a1118] border border-white/10 rounded-3xl p-8 text-center space-y-4">
              <div className="flex justify-center items-center gap-3">
                {Array.from({ length: game.digitMode }).map((_, i) => (
                  <div
                    key={i}
                    className="w-14 h-18 sm:w-16 sm:h-20 bg-gradient-to-b from-[#251722] to-[#160f14] border-2 border-[#ff3377]/40 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black text-[#ff4d8d] shadow-lg shadow-pink-500/10 animate-pulse"
                  >
                    ?
                  </div>
                ))}
              </div>

              {/* Input Form */}
              {game.status === 'in_progress' && (
                <form onSubmit={handleSubmitGuess} className="max-w-md mx-auto space-y-3 pt-2">
                  <div className="relative flex items-center">
                    <input
                      ref={inputRef}
                      type="number"
                      min={game.minRange}
                      max={game.maxRange}
                      disabled={!isMyTurn || isSubmitting}
                      value={currentGuessInput}
                      onChange={(e) => setCurrentGuessInput(e.target.value)}
                      placeholder={`Type your ${game.digitMode}-digit guess...`}
                      className="w-full bg-[#120a10] border-2 border-[#ff3377]/50 focus:border-[#ff3377] text-white placeholder-neutral-500 text-center text-lg font-bold rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-[#ff3377]/20 disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={!isMyTurn || !currentGuessInput.trim() || isSubmitting}
                      className="absolute right-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff3377] to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <span>Submit</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {feedbackMessage && (
                    <div className="p-3 rounded-xl bg-[#ff3377]/20 border border-[#ff3377]/40 text-rose-300 text-xs font-bold animate-in fade-in duration-150">
                      {feedbackMessage}
                    </div>
                  )}

                  {!isMyTurn && (
                    <p className="text-xs text-amber-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Waiting for {game.currentTurnPlayerName} to submit their guess...
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Guesses History Feed */}
            <div className="bg-[#160f14] border border-white/10 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Guess History ({game.guesses.length})
              </h4>

              {game.guesses.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-500">
                  No guesses submitted yet. Type a number above to make your first guess!
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-none">
                  {game.guesses.map((item) => {
                    const isCorrect = item.result === 'correct';
                    const isHigher = item.result === 'higher';

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                            : isHigher
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                            {item.playerName.charAt(0)}
                          </span>
                          <div>
                            <span className="font-bold text-white">{item.playerName}</span> guessed{' '}
                            <span className="font-mono font-black text-sm px-1.5 py-0.5 rounded bg-black/40 text-white">
                              {item.guessNumber}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> MATCH!
                            </span>
                          ) : isHigher ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-amber-400" /> Target is HIGHER 📈
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[10px] flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-purple-400" /> Target is LOWER 📉
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500 font-mono">{item.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Victory Modal */}
      {showVictoryModal && game && game.status === 'completed' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#160f14] rounded-3xl border border-[#ff3377]/40 p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#ff3377]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 mx-auto shadow-xl shadow-pink-500/25 flex items-center justify-center text-4xl">
              🎉
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-fraunces text-white">
                {game.winnerUid === userProfile?.uid
                  ? 'You Won! 🎉'
                  : `Partner (${game.winnerName || 'Partner'}) Won! ❤️`}
              </h3>
              <p className="text-xs text-neutral-300 font-medium">
                The secret number was correctly guessed!
              </p>
            </div>

            {/* Secret Number Reveal Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                Secret Target Number
              </span>
              <div className="text-4xl font-black font-mono text-amber-400 tracking-widest">
                {game.secretNumber}
              </div>
              <div className="text-xs text-neutral-400">
                Guessed in <span className="text-white font-bold">{game.guessCount}</span> total attempt
                {game.guessCount === 1 ? '' : 's'}!
              </div>
            </div>

            {/* Rematch Button */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleStartNewGame(game.digitMode)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-amber-500 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Play Rematch / Next Round
              </button>

              <button
                type="button"
                onClick={() => setGame(null)}
                className="w-full py-2.5 text-xs text-neutral-400 hover:text-white font-semibold cursor-pointer"
              >
                Change Difficulty Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Partner Modal Window */}
      {isWaitingForPartner && (
        <WaitingForCoupleModal
          gameTitle={`${digitMode}-Digit Number Guessing Game 💕`}
          gameSubtitle={`Challenging ${partnerProfile?.displayName || 'Partner'}! Waiting for them to accept & join...`}
          gameType="number-guess"
          gameId={game?.id}
          onCancelGame={handleCancelInvitation}
          onClose={() => setIsWaitingForPartner(false)}
        />
      )}
    </div>
  );
};
