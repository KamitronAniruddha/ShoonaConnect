import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  Swords,
  Trophy,
  Flame,
  BookOpen,
  Sparkles,
  Heart,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { ChessGameView } from './ChessGameView';
import { ChessPuzzlesView } from './ChessPuzzlesView';
import { ChessOpeningsView } from './ChessOpeningsView';
import { ChessChallengeModal } from './ChessChallengeModal';
import {
  createChessGame,
  sendChessChallenge,
  acceptChessChallenge,
  declineChessChallenge,
  listenToChessGames,
  listenToChessChallenges,
} from '../../utils/chessService';
import type {
  ChessGame,
  ChessChallenge,
  TimeControlConfig,
  BoardThemeId,
  PieceStyleId,
} from '../../types/chess';
import { playChessChallengeSound } from '../../utils/chessAudio';

interface ChessDashboardProps {
  onBackToGames?: () => void;
}

export const ChessDashboard: React.FC<ChessDashboardProps> = ({ onBackToGames }) => {
  const { userProfile, partnerProfile, couple } = useAuth();
  const coupleId = couple?.id;

  const [viewMode, setViewMode] = useState<
    'lobby' | 'playing' | 'puzzles' | 'openings'
  >('lobby');

  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Synced games and challenges
  const [recentGames, setRecentGames] = useState<ChessGame[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<ChessChallenge[]>([]);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Listen to couple's chess games
  useEffect(() => {
    if (!coupleId) return;

    const unsubscribe = listenToChessGames(coupleId, (list) => {
      setRecentGames(list);
    });

    return () => unsubscribe();
  }, [coupleId, userProfile?.uid, viewMode]);

  // Listen to couple challenges
  useEffect(() => {
    if (!coupleId) return;

    const unsubscribe = listenToChessChallenges(coupleId, (list) => {
      setPendingChallenges(list);

      // Play alert sound if someone challenged us
      const incoming = list.find((c) => c.challengedId === userProfile?.uid);
      if (incoming) {
        playChessChallengeSound();
      }
    });

    return () => unsubscribe();
  }, [coupleId, userProfile?.uid]);

  // Calculate Head-to-Head stats between user and partner
  const stats = React.useMemo(() => {
    let myWins = 0;
    let partnerWins = 0;
    let draws = 0;

    recentGames.forEach((g) => {
      if (g.status === 'checkmate' || g.status === 'resigned' || g.status === 'timeout') {
        if (g.winnerId === userProfile?.uid) {
          myWins += 1;
        } else if (g.winnerId === partnerProfile?.uid) {
          partnerWins += 1;
        }
      } else if (g.status === 'draw' || g.status === 'stalemate') {
        draws += 1;
      }
    });

    return {
      total: recentGames.length,
      myWins,
      partnerWins,
      draws,
    };
  }, [recentGames, userProfile?.uid, partnerProfile?.uid]);

  // Handle send challenge
  const handleSendChallenge = async (
    timeControl: TimeControlConfig,
    preferredColor: 'white' | 'black' | 'random',
    isCasual: boolean
  ) => {
    if (!coupleId || !userProfile) return;
    const partnerUid = partnerProfile?.uid || 'solo_partner';

    await sendChessChallenge(
      coupleId,
      {
        uid: userProfile.uid,
        displayName: userProfile.displayName || 'You',
        photoURL: userProfile.photoURL,
      },
      partnerUid,
      timeControl,
      preferredColor,
      isCasual
    );
  };

  // Handle start AI Game
  const handleStartAIGame = async (
    timeControl: TimeControlConfig,
    preferredColor: 'white' | 'black' | 'random',
    difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master',
    personalityId: string
  ) => {
    if (!coupleId || !userProfile) return;

    let userIsWhite = preferredColor === 'white';
    if (preferredColor === 'random') {
      userIsWhite = Math.random() < 0.5;
    }

    const whitePlayer = userIsWhite
      ? {
          uid: userProfile.uid,
          displayName: userProfile.displayName || 'You',
          photoURL: userProfile.photoURL,
          color: 'w' as const,
        }
      : {
          uid: 'ai_bot',
          displayName: `AI (${difficulty})`,
          color: 'w' as const,
        };

    const blackPlayer = userIsWhite
      ? {
          uid: 'ai_bot',
          displayName: `AI (${difficulty})`,
          color: 'b' as const,
        }
      : {
          uid: userProfile.uid,
          displayName: userProfile.displayName || 'You',
          photoURL: userProfile.photoURL,
          color: 'b' as const,
        };

    const gameId = await createChessGame(
      coupleId,
      whitePlayer,
      blackPlayer,
      timeControl,
      true,
      difficulty,
      personalityId
    );

    setActiveGameId(gameId);
    setViewMode('playing');
  };

  // Handle accept challenge
  const handleAcceptChallenge = async (challenge: ChessChallenge) => {
    if (!coupleId || !userProfile) return;
    const gameId = await acceptChessChallenge(coupleId, challenge, {
      uid: userProfile.uid,
      displayName: userProfile.displayName || 'You',
      photoURL: userProfile.photoURL,
    });
    setActiveGameId(gameId);
    setViewMode('playing');
  };

  // Handle decline challenge
  const handleDeclineChallenge = async (challengeId: string) => {
    if (!coupleId) return;
    await declineChessChallenge(coupleId, challengeId);
  };

  // If in a game, render game view
  if (viewMode === 'playing' && activeGameId && coupleId && userProfile) {
    return (
      <ChessGameView
        gameId={activeGameId}
        coupleId={coupleId}
        user={{
          uid: userProfile.uid,
          displayName: userProfile.displayName || 'You',
          photoURL: userProfile.photoURL,
        }}
        partnerName={partnerProfile?.displayName || 'Partner'}
        partnerPhoto={partnerProfile?.photoURL}
        partnerPetName={userProfile.petNameForPartner || 'Shoona'}
        onExitGame={() => {
          setActiveGameId(null);
          setViewMode('lobby');
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Grandmaster Couple Chess Sanctuary
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-fraunces tracking-tight text-white">
            Chess & <span className="text-[#ff4d8d] italic">Romantic Strategy</span> ♟️💕
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl">
            Real-time multiplayer chess, rich tactical puzzles, opening masterclass, and game review.
            Save legendary games directly to your couple memories!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBackToGames && (
            <button
              onClick={onBackToGames}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-all cursor-pointer"
            >
              ← Back to All Games
            </button>
          )}

          <button
            onClick={() => setShowChallengeModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-xl shadow-pink-500/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span>New Game / Challenge</span>
          </button>
        </div>
      </div>

      {/* Pending Incoming Challenges Banner */}
      {pendingChallenges.length > 0 && (
        <div className="space-y-3">
          {pendingChallenges.map((chal) => {
            const isForMe = chal.challengedId === userProfile?.uid;
            const isMine = chal.challengerId === userProfile?.uid;

            return (
              <div
                key={chal.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-[#2a1320] via-[#1b1018] to-[#160f14] border border-[#ff3377]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-pink-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ff3377]/20 border border-[#ff3377]/30 flex items-center justify-center text-2xl">
                    ⚔️
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isMine
                        ? `Challenge sent to ${partnerProfile?.displayName || 'Partner'}...`
                        : `${chal.challengerName} has challenged you to Chess!`}
                    </h3>
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[#ff4d8d]" />
                      <span>{chal.timeControl.label}</span>
                      <span>·</span>
                      <span>Color: {chal.preferredColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isForMe ? (
                    <>
                      <button
                        onClick={() => handleDeclineChallenge(chal.id)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptChallenge(chal)}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white font-bold text-xs shadow-md"
                      >
                        Accept & Play ♟️
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-neutral-400 italic">Waiting for partner...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Head-to-Head Couple Match Statistics Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c111b] via-[#21131e] to-[#150f14] border border-[#ff3377]/25 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* User vs Partner */}
          <div className="flex items-center gap-6">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-md mx-auto">
                <div className="w-full h-full bg-[#150f14] rounded-[14px] flex items-center justify-center font-bold text-xl text-white">
                  {userProfile?.displayName ? userProfile.displayName[0] : 'Y'}
                </div>
              </div>
              <span className="text-xs font-bold text-white block">You</span>
              <span className="text-[11px] font-mono text-[#ff4d8d]">{stats.myWins} Wins</span>
            </div>

            <div className="text-center space-y-1">
              <span className="text-2xl font-black font-fraunces text-neutral-500">VS</span>
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                {stats.draws} Draws
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-sky-500 p-0.5 shadow-md mx-auto">
                <div className="w-full h-full bg-[#150f14] rounded-[14px] flex items-center justify-center font-bold text-xl text-white">
                  {partnerProfile?.displayName ? partnerProfile.displayName[0] : 'P'}
                </div>
              </div>
              <span className="text-xs font-bold text-white block truncate max-w-[80px]">
                {partnerProfile?.displayName || 'Partner'}
              </span>
              <span className="text-[11px] font-mono text-purple-400">
                {stats.partnerWins} Wins
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto bg-[#0d090c]/70 p-4 rounded-2xl border border-white/5 text-center">
            <div className="space-y-0.5">
              <div className="text-lg font-bold font-fraunces text-white">{stats.total}</div>
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                Matches
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-bold font-fraunces text-[#ff4d8d]">
                {stats.myWins}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                Your Wins
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg font-bold font-fraunces text-amber-400">
                {stats.draws}
              </div>
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                Draws
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills between Lobby, Puzzles, and Openings */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { id: 'lobby', label: 'Chess Sanctuary', icon: '♟️', desc: 'Live Matches & Bots' },
          { id: 'puzzles', label: 'Tactical Puzzles', icon: '🔥', desc: 'Daily Streaks & Tests' },
          { id: 'openings', label: 'Master Openings', icon: '📖', desc: 'ECO Theory Explorer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as any)}
            className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              viewMode === tab.id
                ? 'bg-gradient-to-r from-[#2a1725] to-[#180f16] border-[#ff3377] shadow-lg shadow-pink-500/15'
                : 'bg-[#150f14] border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs sm:text-sm font-bold text-white">{tab.label}</span>
            </div>
            <p className="text-[11px] text-neutral-400 truncate">{tab.desc}</p>
          </button>
        ))}
      </div>

      {/* VIEW CONTENT */}
      {viewMode === 'lobby' && (
        <div className="space-y-6">
          {/* Quick Match Launcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Challenge Partner */}
            <div className="bg-[#150f14] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden group hover:border-[#ff3377]/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-rose-500 p-0.5 shadow-md flex items-center justify-center text-2xl">
                💕
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-fraunces text-white">
                  Play with {partnerProfile?.displayName || 'Partner'}
                </h3>
                <p className="text-xs text-neutral-400">
                  Real-time multiplayer chess with synchronized clocks, in-game whispers, and floating reactions.
                </p>
              </div>
              <button
                onClick={() => setShowChallengeModal(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Issue Challenge</span>
              </button>
            </div>

            {/* Card 2: AI Practice Bot */}
            <div className="bg-[#150f14] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center text-2xl">
                🤖
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-fraunces text-white">
                  Practice Against AI Bots
                </h3>
                <p className="text-xs text-neutral-400">
                  6 distinct personalities: The Beginner, The Strategist, The Tactician, The Knight, The Guardian, and The Grandmaster.
                </p>
              </div>
              <button
                onClick={() => setShowChallengeModal(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>Play Against AI</span>
              </button>
            </div>
          </div>

          {/* Recent Match History Section */}
          <div className="bg-[#150f14] border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Perpetual Match History
                </h3>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {recentGames.length} matches recorded
              </span>
            </div>

            {recentGames.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <div className="text-3xl">♟️</div>
                <p className="text-xs text-neutral-400">
                  No chess matches recorded yet! Issue a challenge or play an AI bot to begin your love story on the 64 squares.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGames.slice(0, 8).map((g) => {
                  const isWhiteWin = g.result === '1-0';
                  const isBlackWin = g.result === '0-1';
                  const isDraw = g.result === '1/2-1/2';
                  const inProgress = g.status === 'in_progress';

                  return (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-lg shrink-0">
                          {isWhiteWin ? '♔' : isBlackWin ? '♚' : '🤝'}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{g.whitePlayer.displayName}</span>
                            <span className="text-neutral-500 text-[10px]">vs</span>
                            <span>{g.blackPlayer.displayName}</span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {g.timeControl.label} · {g.moveCount} moves · {new Date(g.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                            inProgress
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-black/40 text-neutral-300'
                          }`}
                        >
                          {inProgress ? 'In Progress' : g.result}
                        </span>

                        <button
                          onClick={() => {
                            setActiveGameId(g.id);
                            setViewMode('playing');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#ff3377]/15 hover:bg-[#ff3377]/30 text-xs font-bold text-[#ff4d8d] transition-all cursor-pointer"
                        >
                          {inProgress ? 'Resume Game' : 'Review Match'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TACTICAL PUZZLES VIEW */}
      {viewMode === 'puzzles' && <ChessPuzzlesView />}

      {/* OPENINGS EXPLORER VIEW */}
      {viewMode === 'openings' && <ChessOpeningsView />}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <ChessChallengeModal
          partnerName={partnerProfile?.displayName || 'Partner'}
          isPartnerLinked={Boolean(partnerProfile)}
          onSendChallenge={handleSendChallenge}
          onStartAIGame={handleStartAIGame}
          onClose={() => setShowChallengeModal(false)}
        />
      )}
    </div>
  );
};
