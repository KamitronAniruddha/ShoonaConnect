import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Gamepad2,
  Sparkles,
  Heart,
  Smile,
  Brain,
  HelpCircle,
  Shuffle,
  Trophy,
  Palette,
  Compass,
  CheckCircle2,
  RotateCcw,
  Flame,
  Award,
  Send,
  Coffee,
  Sun,
  Shield,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleTicTacToe } from './CoupleTicTacToe';
import { ChessDashboard } from './chess/ChessDashboard';

interface GameProps {
  onBack?: () => void;
}

type GameType = 'chess' | 'tictactoe' | 'would-you-rather' | 'never-have-i-ever' | 'how-well' | 'starters' | 'doodle' | 'conflict' | 'pet';

export const CoupleGamesView: React.FC<GameProps> = () => {
  const { userProfile, partnerProfile } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameType>('would-you-rather');

  // Virtual Pet State
  const [petName, setPetName] = useState('Mochi');
  const [petHunger, setPetHunger] = useState(85);
  const [petHappiness, setPetHappiness] = useState(92);
  const [petEnergy, setPetEnergy] = useState(78);
  const [petLevel, setPetLevel] = useState(4);
  const [petMessage, setPetMessage] = useState('Mochi is happy and purring softly!');

  // Would You Rather State
  const wouldYouRatherDilemmas = [
    {
      id: 1,
      a: 'Have a private candlelit rooftop dinner in Paris',
      b: 'Stay in a cozy mountain glass cabin with snow and a fireplace',
      category: 'Romantic Vacation',
    },
    {
      id: 2,
      a: 'Re-live the exact moment we first kissed for an hour',
      b: 'Travel 40 years into our future to see our golden anniversary',
      category: 'Love & Memories',
    },
    {
      id: 3,
      a: 'Wake up early and watch the sunrise together with fresh coffee',
      b: 'Stay up until 3:00 AM talking about universe mysteries in bed',
      category: 'Daily Vibe',
    },
    {
      id: 4,
      a: 'Cook a 5-course gourmet meal together and make a mess in the kitchen',
      b: 'Order midnight takeout in our pajamas and binge our favorite show',
      category: 'Date Night',
    },
    {
      id: 5,
      a: 'Never have morning breath again',
      b: 'Never have bedtime blanket-stealing wars again',
      category: 'Playful',
    },
  ];
  const [wyrIndex, setWyrIndex] = useState(0);
  const [myWyrVote, setMyWyrVote] = useState<'a' | 'b' | null>(null);
  const [partnerWyrVote, setPartnerWyrVote] = useState<'a' | 'b' | null>(null);

  // Never Have I Ever State
  const nhiePrompts = [
    'Never have I ever rehearsed what to say to you in front of a mirror before our date.',
    'Never have I ever secretly sniffed your sweater or hoodie because it smells like you.',
    'Never have I ever screenshot our sweetest text conversation to look back on it.',
    'Never have I ever smiled like a fool in public while reading your message.',
    'Never have I ever looked at romantic places and daydreamed of traveling there with you.',
    'Never have I ever checked your astrological zodiac compatibility on night one.',
    'Never have I ever planned our future home layout or pet names in my head.',
  ];
  const [nhieIndex, setNhieIndex] = useState(0);
  const [nhieHistory, setNhieHistory] = useState<{ prompt: string; result: 'have' | 'never' }[]>([]);

  // How Well Do You Know Me State
  const howWellQuestions = [
    {
      q: 'What is my absolute go-to comfort order when I had a stressful day?',
      options: ['Cheesy pasta or pizza', 'Spicy ramen or soup', 'Sweet pastry & iced latte', 'Burgers and extra fries'],
      correct: 0,
    },
    {
      q: 'What was my initial first thought when we first locked eyes?',
      options: ['They are way out of my league!', 'Such a warm, captivating smile.', 'I wonder what music they love.', 'My heart literally skipped a beat.'],
      correct: 1,
    },
    {
      q: 'If we were gifted an all-expense paid spontaneous 2-week trip tomorrow, where would I choose?',
      options: ['Tropical secluded beach resort', 'Historic European towns and museums', 'Misty Nordic fjords & cabin', 'Bustling Tokyo night markets & temples'],
      correct: 2,
    },
  ];
  const [hwIndex, setHwIndex] = useState(0);
  const [hwSelected, setHwSelected] = useState<number | null>(null);
  const [hwScore, setHwScore] = useState(0);

  // Conversation Starters State
  const [starterCategory, setStarterCategory] = useState<'deep' | 'fun' | 'future' | 'spicy'>('deep');
  const starters = {
    deep: [
      'What was a moment this past month where you felt most deeply loved by me?',
      'Is there an emotion or thought you’ve had recently that you were hesitant to share?',
      'What is something about your childhood that still shapes the way you love today?',
      'If you could give our relationship an award for this year, what would it be for?',
    ],
    fun: [
      'If we were characters in a heist movie, what would our respective roles and code names be?',
      'What is the silliest inside joke we share that nobody else in the world would understand?',
      'If we opened a cafe or restaurant together, what would we name it and what is the signature dish?',
      'What ridiculous superstition or habit do I have that secretly makes you chuckle?',
    ],
    future: [
      'What does our ideal Sunday morning look like 10 years from now?',
      'What is one bucket list country we absolutely have to explore hand-in-hand?',
      'What tradition would you love us to start together this upcoming holiday season?',
      'How do you envision us celebrating our 25th anniversary together?',
    ],
    spicy: [
      'What outfit or look of mine drives you completely crazy in the best way?',
      'Describe your favorite physical memory of us in three vivid words.',
      'Where is an adventurous or romantic place you’ve secretly fantasized about kissing?',
      'What is a subtle touch of mine that gives you goosebumps every time?',
    ],
  };
  const [starterIndex, setStarterIndex] = useState(0);

  // Canvas Doodle Pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [doodleColor, setDoodleColor] = useState('#ff3377');
  const [doodlePrompt, setDoodlePrompt] = useState('Draw your favorite memory of us together!');

  // Handle Feed Pet
  const feedPet = () => {
    setPetHunger((prev) => Math.min(100, prev + 15));
    setPetHappiness((prev) => Math.min(100, prev + 8));
    setPetMessage('Mochi happily munched the tasty treat! *nom nom* 🍖');
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
  };

  const petCuddle = () => {
    setPetHappiness((prev) => Math.min(100, prev + 15));
    setPetEnergy((prev) => Math.min(100, prev + 5));
    setPetMessage('Mochi curled up in your lap and purred with love! 💕');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  const petPlay = () => {
    if (petEnergy < 15) {
      setPetMessage('Mochi is a little tired! Let Mochi rest before playing more.');
      return;
    }
    setPetEnergy((prev) => Math.max(0, prev - 15));
    setPetHappiness((prev) => Math.min(100, prev + 15));
    setPetHunger((prev) => Math.max(0, prev - 10));
    setPetMessage('Mochi chased the glowing ball of yarn with excitement! 🎾');
    confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } });
  };

  const handleWyrVote = (choice: 'a' | 'b') => {
    setMyWyrVote(choice);
    // Simulate partner vote after 600ms
    setTimeout(() => {
      setPartnerWyrVote(choice === 'a' ? (Math.random() > 0.3 ? 'a' : 'b') : (Math.random() > 0.3 ? 'b' : 'a'));
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
    }, 600);
  };

  const nextWyr = () => {
    setMyWyrVote(null);
    setPartnerWyrVote(null);
    setWyrIndex((prev) => (prev + 1) % wouldYouRatherDilemmas.length);
  };

  const handleNhie = (res: 'have' | 'never') => {
    setNhieHistory((prev) => [{ prompt: nhiePrompts[nhieIndex], result: res }, ...prev]);
    if (res === 'have') {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
    }
    setNhieIndex((prev) => (prev + 1) % nhiePrompts.length);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = doodleColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (selectedGame === 'chess') {
    return (
      <div className="min-h-screen bg-[#0d090c] text-neutral-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ChessDashboard onBackToGames={() => setSelectedGame('would-you-rather')} />
        </div>
      </div>
    );
  }

  if (selectedGame === 'tictactoe') {
    return <CoupleTicTacToe onBackToGames={() => setSelectedGame('would-you-rather')} />;
  }

  return (
    <div className="min-h-screen bg-[#0d090c] text-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header matching ShoonaConnect dark luxury look */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              7 Game Types · 1000+ Questions & Companion
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-fraunces tracking-tight text-white">
              Couple Games & <span className="text-[#ff4d8d] italic">Connection</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl">
              From lighthearted laughter to deep soul-to-soul conversations. Play in real-time or take turns across any distance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#160f14] border border-white/10 rounded-2xl px-4 py-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-300 font-medium">
                {partnerProfile?.displayName ? `${partnerProfile.displayName} linked` : 'Solo Mode (Testing)'}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Pet "Mochi" Banner (Featured from ShoonaConnect companion system) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1b1019] via-[#20131e] to-[#160f14] border border-[#ff3377]/25 p-6 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#ff3377]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
            {/* Left: Pet Avatar & Greeting */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-1 shadow-lg shadow-pink-500/20">
                  <div className="w-full h-full bg-[#160f14] rounded-[22px] flex items-center justify-center text-4xl sm:text-5xl select-none animate-bounce">
                    🦊
                  </div>
                </div>
                <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-[#ff4d8d] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                  LVL {petLevel}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-fraunces text-white">{petName}</h3>
                  <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Couple Digital Pet
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 font-medium">{petMessage}</p>
                <div className="text-[11px] text-neutral-400 flex items-center gap-3 pt-1">
                  <span>Take turns feeding and playing daily to keep Mochi healthy!</span>
                </div>
              </div>
            </div>

            {/* Middle: Pet Stats */}
            <div className="w-full lg:w-72 grid grid-cols-3 gap-3 bg-[#0d090c]/70 p-3.5 rounded-2xl border border-white/5">
              <div className="space-y-1 text-center">
                <div className="text-[11px] font-bold text-rose-400 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3" /> Happiness
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#ff3377] h-full rounded-full transition-all duration-500" style={{ width: `${petHappiness}%` }} />
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold">{petHappiness}%</span>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1">
                  🍖 Hunger
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${petHunger}%` }} />
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold">{petHunger}%</span>
              </div>

              <div className="space-y-1 text-center">
                <div className="text-[11px] font-bold text-blue-400 flex items-center justify-center gap-1">
                  ⚡ Energy
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${petEnergy}%` }} />
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold">{petEnergy}%</span>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={feedPet}
                className="px-3.5 py-2 rounded-xl bg-[#ff3377]/20 border border-[#ff3377]/40 hover:bg-[#ff3377] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                🍖 Feed Treat
              </button>
              <button
                type="button"
                onClick={petCuddle}
                className="px-3.5 py-2 rounded-xl bg-[#251823] border border-white/10 hover:border-pink-400 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                💕 Cuddle
              </button>
              <button
                type="button"
                onClick={petPlay}
                className="px-3.5 py-2 rounded-xl bg-[#251823] border border-white/10 hover:border-amber-400 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                🎾 Play Catch
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Game Card: Grandmaster Couple Chess */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2a1320] via-[#3a152d] to-[#1e0e1a] border-2 border-[#ff3377]/50 hover:border-[#ff3377] p-6 sm:p-7 shadow-2xl transition-all group">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#ff3377]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#ff3377] via-[#ff4d8d] to-amber-500 p-0.5 shadow-xl shadow-pink-500/25 flex items-center justify-center text-3xl sm:text-4xl shrink-0 group-hover:scale-105 transition-transform">
                ♟️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold font-fraunces text-white">
                    Grandmaster Couple Chess ♟️💕
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff3377] to-amber-500 text-white shadow-sm">
                    New Live System
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
                  Full 64-square multiplayer chess sanctuary: synchronized clocks, procedural chimes, AI bots with unique personalities, daily tactical puzzles, opening masterclass, and one-click saving to couple memories!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGame('chess')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-amber-500 hover:brightness-110 text-white font-bold text-xs shadow-xl shadow-pink-500/25 flex items-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Enter Chess Sanctuary ♟️ →
            </button>
          </div>
        </div>

        {/* Dedicated Game Card: Couple Tic-Tac-Toe */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#261020] via-[#35152d] to-[#1a0e18] border-2 border-[#ff3377]/40 hover:border-[#ff3377] p-6 shadow-2xl transition-all">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#ff3377]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 shadow-lg shadow-pink-500/20 flex items-center justify-center text-3xl shrink-0">
                🎮
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-fraunces text-white">
                    Couple Tic-Tac-Toe 💕
                  </h2>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ff3377] text-white shadow-sm">
                    Live 3×3
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300">
                  Classic 3×3 competition for two. Take turns in real-time, celebrate wins, send match reactions, and track your streaks!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedGame('tictactoe')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white font-bold text-xs shadow-xl shadow-pink-500/25 flex items-center gap-2 shrink-0 transition-all cursor-pointer active:scale-95"
            >
              Play Now →
            </button>
          </div>
        </div>

        {/* Game Mode Switcher Navigation (Pill tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {[
            { id: 'chess', label: 'Grand Chess ♟️', icon: '♟️', badge: 'Live AI & Real' },
            { id: 'tictactoe', label: 'Tic-Tac-Toe 💕', icon: '🎮', badge: 'Live 3×3' },
            { id: 'would-you-rather', label: 'Would You Rather', icon: '🤥', badge: 'Popular' },
            { id: 'never-have-i-ever', label: 'Never Have I Ever', icon: '🙈', badge: 'Juicy' },
            { id: 'how-well', label: 'How Well Do You Know', icon: '💡', badge: 'Quiz' },
            { id: 'starters', label: 'Deep Starters', icon: '💬', badge: 'Intimate' },
            { id: 'doodle', label: 'Sketch & Guess', icon: '🎨', badge: 'Creative' },
            { id: 'conflict', label: 'Conflict Repair', icon: '❤️', badge: 'Psychology' },
            { id: 'pet', label: 'Pet Quests', icon: '🐾', badge: 'Daily' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSelectedGame(mode.id as GameType)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                selectedGame === mode.id
                  ? 'bg-gradient-to-b from-[#2a1725] to-[#190f17] border-[#ff3377] shadow-lg shadow-pink-500/15'
                  : 'bg-[#150f14] border-white/5 hover:border-white/15 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{mode.icon}</span>
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                    selectedGame === mode.id ? 'bg-[#ff3377] text-white' : 'bg-white/10 text-neutral-400'
                  }`}
                >
                  {mode.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">{mode.label}</div>
            </button>
          ))}
        </div>

        {/* GAME CONTENT SECTION */}
        <div className="bg-[#150f14] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* MODE 1: WOULD YOU RATHER */}
          {selectedGame === 'would-you-rather' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                    Dilemma {wyrIndex + 1} of {wouldYouRatherDilemmas.length} · {wouldYouRatherDilemmas[wyrIndex].category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Would You Rather...</h2>
                </div>
                <button
                  type="button"
                  onClick={nextWyr}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Next Dilemma
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4">
                {/* Option A */}
                <button
                  type="button"
                  onClick={() => handleWyrVote('a')}
                  className={`p-6 sm:p-8 rounded-3xl text-left border-2 transition-all cursor-pointer relative overflow-hidden group ${
                    myWyrVote === 'a'
                      ? 'bg-gradient-to-br from-[#ff3377]/25 to-[#241320] border-[#ff3377] shadow-xl shadow-pink-500/20'
                      : 'bg-[#1a1218] border-white/10 hover:border-[#ff3377]/50 hover:bg-[#20151f]'
                  }`}
                >
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#ff3377]/20 text-[#ff4d8d] uppercase tracking-wider mb-4 inline-block">
                    Choice A
                  </span>
                  <p className="text-lg sm:text-xl font-bold font-fraunces text-white leading-relaxed">
                    {wouldYouRatherDilemmas[wyrIndex].a}
                  </p>

                  {myWyrVote === 'a' && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> You selected Choice A
                    </div>
                  )}

                  {partnerWyrVote === 'a' && (
                    <div className="mt-2 text-xs text-[#ff4d8d] font-semibold flex items-center gap-1.5 bg-[#ff3377]/10 p-2 rounded-xl border border-[#ff3377]/20">
                      <Heart className="w-3.5 h-3.5 fill-[#ff3377]" /> Partner also chose this! (Match! 💕)
                    </div>
                  )}
                </button>

                {/* Option B */}
                <button
                  type="button"
                  onClick={() => handleWyrVote('b')}
                  className={`p-6 sm:p-8 rounded-3xl text-left border-2 transition-all cursor-pointer relative overflow-hidden group ${
                    myWyrVote === 'b'
                      ? 'bg-gradient-to-br from-[#ff3377]/25 to-[#241320] border-[#ff3377] shadow-xl shadow-pink-500/20'
                      : 'bg-[#1a1218] border-white/10 hover:border-[#ff3377]/50 hover:bg-[#20151f]'
                  }`}
                >
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 uppercase tracking-wider mb-4 inline-block">
                    Choice B
                  </span>
                  <p className="text-lg sm:text-xl font-bold font-fraunces text-white leading-relaxed">
                    {wouldYouRatherDilemmas[wyrIndex].b}
                  </p>

                  {myWyrVote === 'b' && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> You selected Choice B
                    </div>
                  )}

                  {partnerWyrVote === 'b' && (
                    <div className="mt-2 text-xs text-[#ff4d8d] font-semibold flex items-center gap-1.5 bg-[#ff3377]/10 p-2 rounded-xl border border-[#ff3377]/20">
                      <Heart className="w-3.5 h-3.5 fill-[#ff3377]" /> Partner also chose this! (Match! 💕)
                    </div>
                  )}
                </button>
              </div>

              {myWyrVote && (
                <div className="text-center p-4 bg-[#1e131b] rounded-2xl border border-white/10 text-xs text-neutral-300">
                  {myWyrVote === partnerWyrVote ? (
                    <span className="text-emerald-400 font-bold">
                      🎉 Perfect compatibility! Both of you picked the exact same answer!
                    </span>
                  ) : (
                    <span>
                      💬 Contrasts make life exciting! Ask your partner why they felt differently over dinner tonight.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: NEVER HAVE I EVER */}
          {selectedGame === 'never-have-i-ever' && (
            <div className="space-y-6 text-center max-w-2xl mx-auto py-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                  Card {nhieIndex + 1} of {nhiePrompts.length} · Couple Confessions
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Never Have I Ever...</h2>
              </div>

              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#21141e] to-[#180e16] border border-[#ff3377]/30 shadow-2xl relative">
                <p className="text-xl sm:text-2xl font-fraunces text-white leading-relaxed">
                  "{nhiePrompts[nhieIndex]}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleNhie('have')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff3377] to-[#ff5c8a] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  🙈 I HAVE!
                </button>
                <button
                  type="button"
                  onClick={() => handleNhie('never')}
                  className="px-8 py-4 rounded-2xl bg-[#1e141c] hover:bg-[#281b26] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  😇 NEVER
                </button>
              </div>

              {nhieHistory.length > 0 && (
                <div className="mt-8 text-left border-t border-white/10 pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Previous Rounds</h4>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                    {nhieHistory.map((item, idx) => (
                      <div key={idx} className="text-xs p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
                        <span className="text-neutral-300 truncate max-w-sm">{item.prompt}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] uppercase ${
                            item.result === 'have' ? 'bg-[#ff3377]/20 text-[#ff4d8d]' : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {item.result}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: HOW WELL DO YOU KNOW ME */}
          {selectedGame === 'how-well' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                    Question {hwIndex + 1} of {howWellQuestions.length}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-fraunces text-white">How Well Do You Know Me?</h2>
                </div>
                <div className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  Score: {hwScore}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#1e131b] border border-white/10">
                <p className="text-lg font-bold font-fraunces text-white">
                  {howWellQuestions[hwIndex].q}
                </p>
              </div>

              <div className="space-y-3">
                {howWellQuestions[hwIndex].options.map((opt, i) => {
                  const isChosen = hwSelected === i;
                  const isCorrect = i === howWellQuestions[hwIndex].correct;
                  let btnStyle = 'bg-[#1a1218] border-white/10 hover:border-[#ff3377]/40';

                  if (hwSelected !== null) {
                    if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    else if (isChosen) btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  }

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={hwSelected !== null}
                      onClick={() => {
                        setHwSelected(i);
                        if (i === howWellQuestions[hwIndex].correct) {
                          setHwScore((s) => s + 10);
                          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                        }
                      }}
                      className={`w-full p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <span className="text-sm">{opt}</span>
                      {hwSelected !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {hwSelected !== null && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHwSelected(null);
                      setHwIndex((prev) => (prev + 1) % howWellQuestions.length);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#ff3377] hover:bg-[#ff4d8d] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Next Question →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 4: DEEP CONVERSATION STARTERS */}
          {selectedGame === 'starters' && (
            <div className="space-y-6 max-w-2xl mx-auto text-center py-2">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                  Intimacy & Vulnerability
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Conversation Starters</h2>
              </div>

              {/* Category Pills */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[
                  { id: 'deep', label: '💖 Deep Intimacy' },
                  { id: 'fun', label: '😂 Silly & Fun' },
                  { id: 'future', label: '🔮 Dreams & Future' },
                  { id: 'spicy', label: '🔥 Spicy & Playful' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setStarterCategory(c.id as any);
                      setStarterIndex(0);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      starterCategory === c.id
                        ? 'bg-[#ff3377] text-white shadow-md shadow-pink-500/25'
                        : 'bg-[#1e131b] text-neutral-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Card */}
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#21141e] via-[#1a1017] to-[#150f14] border border-[#ff3377]/30 shadow-2xl relative min-h-56 flex flex-col items-center justify-center">
                <p className="text-xl sm:text-2xl font-fraunces text-white leading-relaxed">
                  "{starters[starterCategory][starterIndex % starters[starterCategory].length]}"
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStarterIndex((prev) => prev + 1)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff3377] to-[#ff5c8a] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" /> Next Conversation Card
                </button>
              </div>
            </div>
          )}

          {/* MODE 5: SKETCH & GUESS / DOODLE PAD */}
          {selectedGame === 'doodle' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                    Creative Collaboration
                  </span>
                  <h3 className="text-xl font-bold font-fraunces text-white">Sketch & Guess Love Pad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const prompts = [
                      'Draw our first date location!',
                      'Draw our dream holiday vacation!',
                      'Draw the pet we should adopt next!',
                      'Draw how you look when you wake up!',
                      'Draw what you love most about my face!',
                    ];
                    setDoodlePrompt(prompts[Math.floor(Math.random() * prompts.length)]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 flex items-center gap-1 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> New Prompt
                </button>
              </div>

              <div className="p-3 bg-[#1e131b] rounded-xl border border-white/5 text-xs text-amber-300 font-medium">
                🎯 Prompt: <strong>{doodlePrompt}</strong>
              </div>

              {/* Drawing Canvas */}
              <div className="relative border-2 border-white/10 rounded-2xl overflow-hidden bg-neutral-950">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={320}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-80 bg-neutral-950 cursor-crosshair block touch-none"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  {['#ff3377', '#38bdf8', '#fbbf24', '#4ade80', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDoodleColor(c)}
                      className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 ${
                        doodleColor === c ? 'scale-110 border-white' : 'border-transparent opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 font-semibold cursor-pointer"
                  >
                    Clear Pad
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                      alert('Doodle saved to couple album! Partner will see it in notifications.');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-[#ff3377] hover:bg-[#ff4d8d] text-white text-xs font-bold cursor-pointer"
                  >
                    Send to Partner 💕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 6: CONFLICT REPAIR & GOTTMAN PROTOCOL */}
          {selectedGame === 'conflict' && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="space-y-1 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d]">
                  Relationship Psychology
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Conflict Repair Guide</h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  De-escalate friction, build understanding, and replace defensiveness with connection.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: '1. Soft Startup',
                    desc: 'Express feelings without blame. Replace "You never listen!" with "I am feeling overwhelmed and would really love 15 minutes of quiet time with you."',
                  },
                  {
                    step: '2. Repair Attempt',
                    desc: 'Offer a peace bridge: "I want to understand your perspective. Can we take a deep breath and start over?"',
                  },
                  {
                    step: '3. Validate the Emotion',
                    desc: 'Even if you disagree on facts, validate feelings: "I can understand why you felt hurt or ignored in that moment."',
                  },
                  {
                    step: '4. Reconnection Ritual',
                    desc: 'Hold hands for 60 seconds without speaking. Let oxytocin quiet down the nervous system.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#1e131b] border border-white/5 space-y-1">
                    <h4 className="text-sm font-bold text-[#ff4d8d] font-fraunces">{item.step}</h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 7: PET QUESTS */}
          {selectedGame === 'pet' && (
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="space-y-1 text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Daily Habit Builder
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Mochi’s Daily Quests</h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Complete mutual relationship rituals together each day to level up your pet!
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { task: 'Answer today’s Daily Question together', xp: '+25 XP', completed: true },
                  { task: 'Send an encrypted sweet love note or photo', xp: '+20 XP', completed: true },
                  { task: 'Complete 1 round of Would You Rather', xp: '+30 XP', completed: myWyrVote !== null },
                  { task: 'Check-in on your partner’s mood status', xp: '+15 XP', completed: false },
                  { task: 'Give your partner a 20-second hug today', xp: '+50 XP', completed: false },
                ].map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      q.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-neutral-300'
                        : 'bg-[#1e131b] border-white/5 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          q.completed ? 'bg-emerald-500 text-white' : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {q.completed ? '✓' : idx + 1}
                      </div>
                      <span className={`text-xs sm:text-sm ${q.completed ? 'line-through text-neutral-400' : 'text-white'}`}>
                        {q.task}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
                      {q.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
