import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab } from '../types';
import { getLiveWorkingAppUrl } from '../utils/appUrl';
import {
  Heart,
  Sparkles,
  Gamepad2,
  Calendar,
  Image as ImageIcon,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Star,
  ListTodo,
  CheckCircle2,
  Lock,
  ChevronDown,
  ArrowRight,
  Sun,
  Moon,
  Flame,
  Clock,
  Shuffle,
  Smile,
  Users,
  Send,
  HelpCircle,
  ExternalLink,
  Bell,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandingViewProps {
  onEnterApp?: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
  isInsideApp?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp, setActiveTab, isInsideApp = false }) => {
  const { userProfile, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Phone Mockup interactive tab
  const [mockupTab, setMockupTab] = useState<'daily' | 'pet' | 'chat'>('daily');
  const [mockupAnswer, setMockupAnswer] = useState('');
  const [mockupAnswerSubmitted, setMockupAnswerSubmitted] = useState(false);

  // Interactive Game Drawer / Preview in Games Section
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [wyrSelection, setWyrSelection] = useState<'a' | 'b' | null>(null);
  const [nhieChoice, setNhieChoice] = useState<'have' | 'never' | null>(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Screenshot slider index
  const [activeSlide, setActiveSlide] = useState(0);

  // Check URL params or localStorage for pending couple invite code
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // New Interactive Feature Showcase states
  const [showcaseTab, setShowcaseTab] = useState<'pet' | 'games' | 'countdown' | 'letters' | 'questions' | 'vault'>('pet');
  const [showcasePetLove, setShowcasePetLove] = useState(85);
  const [showcasePetClicks, setShowcasePetClicks] = useState(0);
  const [showcaseTttGrid, setShowcaseTttGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [showcaseTttTurn, setShowcaseTttTurn] = useState<'X' | 'O'>('X');
  const [showcaseLetterSealed, setShowcaseLetterSealed] = useState(true);
  const [showcaseQuestionAnswer, setShowcaseQuestionAnswer] = useState('');
  const [showcaseQuestionSubmitted, setShowcaseQuestionSubmitted] = useState(false);

  // Live ticking milliseconds state for showcase countdown
  const [showcaseMs, setShowcaseMs] = useState(0);

  useEffect(() => {
    const msInterval = setInterval(() => {
      setShowcaseMs(Math.floor(Math.random() * 1000));
    }, 80);
    return () => clearInterval(msInterval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('pairCode') || params.get('code');
      if (code && code.trim().length === 4) {
        const clean = code.trim().toUpperCase();
        setInviteCode(clean);
        localStorage.setItem('shoona_pending_pair_code', clean);
      } else {
        const saved = localStorage.getItem('shoona_pending_pair_code');
        if (saved && saved.trim().length === 4) {
          setInviteCode(saved.trim().toUpperCase());
        }
      }
    }
  }, []);

  const handleEnterAuth = () => {
    if (onEnterApp) onEnterApp();
  };

  const sampleStarters = [
    'What was a moment this past month where you felt most deeply loved by me?',
    'What is the silliest inside joke we share that no one else would understand?',
    'What is our dream trip to take together in the next 12 months?',
    'What outfit of mine is your absolute secret favorite?',
  ];

  // Check Tic Tac Toe winner helper
  const checkShowcaseTttWinner = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }
    if (grid.every(cell => cell !== null)) return 'draw';
    return null;
  };

  const showcaseTttWinner = checkShowcaseTttWinner(showcaseTttGrid);

  const handleShowcaseTttClick = (idx: number) => {
    if (showcaseTttGrid[idx] || showcaseTttWinner) return;
    const newGrid = [...showcaseTttGrid];
    newGrid[idx] = showcaseTttTurn;
    setShowcaseTttGrid(newGrid);
    setShowcaseTttTurn(showcaseTttTurn === 'X' ? 'O' : 'X');
    
    // Play light confetti on turn
    confetti({ particleCount: 8, spread: 30, origin: { y: 0.65 } });
  };

  const resetShowcaseTtt = () => {
    setShowcaseTttGrid(Array(9).fill(null));
    setShowcaseTttTurn('X');
  };

  // Custom photo list for Simulated Vault Showcase
  const [vaultPhotos, setVaultPhotos] = useState([
    { id: 1, src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=400', date: 'Jul 24, 2026', caption: 'Cozy beach sunset 🌅' },
    { id: 2, src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400', date: 'Aug 12, 2026', caption: 'First anniversary coffee date ☕' },
  ]);

  const addSimulatedVaultPhoto = () => {
    const caps = [
      'Strolling in the botanical gardens 🌸',
      'Cooking home-made pasta night! 🍝',
      'Snuggling on a rainy Sunday morning 🌧️💝',
      'Our secret ice-cream midnight escape 🍦',
    ];
    const pics = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    ];
    const newPic = {
      id: Date.now(),
      src: pics[Math.floor(Math.random() * pics.length)],
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      caption: caps[Math.floor(Math.random() * caps.length)],
    };
    setVaultPhotos([newPic, ...vaultPhotos]);
    confetti({ particleCount: 15, spread: 40, origin: { y: 0.6 } });
  };

  const renderInteractiveShowcase = () => {
    return (
      <div className="bg-[#120a10] border border-white/5 rounded-[32px] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff3377]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Head Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff3377]/10 border border-[#ff3377]/20 text-[#ff4d8d] text-[10px] font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3 h-3" /> Live Features Walkthrough
            </div>
            <h3 className="text-2xl font-extrabold font-fraunces text-white">
              Explore Our Real Couples Features
            </h3>
            <p className="text-xs text-neutral-400">
              Test out the exact mechanics that bring couples closer together every single day.
            </p>
          </div>
          
          {/* Made for Couples by Aniruddha Credits Card */}
          <div className="bg-gradient-to-r from-[#ff3377]/15 to-[#ff5c8a]/5 border border-[#ff3377]/30 rounded-2xl p-3 px-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ff3377]/20 flex items-center justify-center text-xs animate-pulse font-bold text-[#ff4d8d]">
              💖
            </div>
            <div>
              <div className="text-[10px] uppercase font-black text-rose-300 tracking-widest">
                PREMIUM COMPANION
              </div>
              <div className="text-xs font-bold text-white">
                Made for Couples by <span className="text-[#ff4d8d] font-extrabold">Aniruddha</span> & Best
              </div>
            </div>
          </div>
        </div>

        {/* Outer Tabs Grid and Interactive Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Menu Selection (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            {[
              {
                id: 'pet',
                title: 'Fox Companion Mochi 🦊',
                tag: 'Virtual Pet Parenting',
                desc: 'Adopt, level up, and care for a shared pet in real-time. Both partners coordinate meals & playtime.'
              },
              {
                id: 'games',
                title: 'Couples Games Lounge 🎮',
                tag: 'Handshake Multiplay',
                desc: 'Play Tic-Tac-Toe, Chess & Number Guess with instant challenge push alerts and zero latency.'
              },
              {
                id: 'countdown',
                title: 'Precise Countdown Hub 🔔',
                tag: 'To-The-Second Tracking',
                desc: 'Ticking countdowns down to the millisecond with active reminder bars and progress bars.'
              },
              {
                id: 'letters',
                title: 'Sealed Future Letters ✉️',
                tag: 'Wax-Sealed Anticipation',
                desc: 'Write time-locked messages that remain sealed under golden wax stamps until your chosen anniversary.'
              },
              {
                id: 'questions',
                title: 'Double-Blind Prompts 💭',
                tag: 'Synchronized Revelations',
                desc: 'Thoughtful couple questions where answers are locked and stay secret until both partners respond!'
              },
              {
                id: 'vault',
                title: 'Encrypted Memory Vault 🔒',
                tag: 'Secure Shared Scraps',
                desc: 'Securely upload milestone memories, private passwords, and anniversary photos behind PIN locks.'
              }
            ].map((tab) => {
              const isSelected = showcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#ff3377]/15 to-[#241421] border-[#ff3377]/50 shadow-md shadow-pink-500/5'
                      : 'bg-[#150f14] hover:bg-[#1b1219] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-[#ff4d8d]' : 'text-neutral-400'}`}>
                      {tab.tag}
                    </span>
                    {isSelected && <span className="text-[10px] text-[#ff4d8d] animate-ping">●</span>}
                  </div>
                  <h4 className={`text-sm sm:text-base font-bold font-fraunces ${isSelected ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                    {tab.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {tab.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Live Interactive Simulator Box (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#090508] border border-white/5 p-6 flex flex-col justify-between min-h-[460px] relative shadow-inner">
            {/* Simulator Watermark */}
            <div className="absolute top-3 right-4 text-[9px] text-neutral-600 font-bold tracking-widest uppercase pointer-events-none select-none">
              Live Mockup Simulator ⚡
            </div>

            {/* Dynamic tab contents */}
            <div className="flex-1 flex flex-col justify-center">
              {/* TAB 1: FOX COMPANION MOCHI */}
              {showcaseTab === 'pet' && (
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <div className="text-6xl animate-bounce duration-1000 mt-2 select-none">🦊</div>
                    <h4 className="text-xl font-black font-fraunces text-white">Mochi (LVL 4)</h4>
                    <p className="text-xs text-rose-300 font-medium">Affection State: {showcasePetLove}%</p>
                  </div>

                  {/* Level gauge */}
                  <div className="max-w-md mx-auto space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                      <span>NEXT LEVEL PROGRESS</span>
                      <span>{showcasePetLove}/100 XP</span>
                    </div>
                    <div className="w-full bg-white/5 border border-white/10 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-[#ff3377] h-full rounded-full transition-all duration-300"
                        style={{ width: `${showcasePetLove}%` }}
                      />
                    </div>
                  </div>

                  {/* Feed Logs simulation */}
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 max-w-sm mx-auto text-[11px] text-neutral-300 space-y-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">🍓</span>
                      <span><strong>Thomas:</strong> Fed a Sweet Berry (+5 affection)</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <span className="text-xs">🎾</span>
                      <span><strong>Deborah:</strong> Played ball with Mochi (+3 affection)</span>
                    </div>
                  </div>

                  {/* Interactions */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowcasePetLove(prev => Math.min(100, prev + 5));
                        setShowcasePetClicks(prev => prev + 1);
                        confetti({ particleCount: 15, spread: 30, origin: { y: 0.6 } });
                      }}
                      className="px-4 py-2 bg-[#ff3377] hover:bg-[#ff4d8d] text-white rounded-full font-bold text-xs transition-all active:scale-95 shadow-lg shadow-pink-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🍖 Feed Snack</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowcasePetLove(prev => Math.min(100, prev + 3));
                        setShowcasePetClicks(prev => prev + 1);
                        confetti({ particleCount: 20, spread: 45, colors: ['#ff4d8d', '#ff73a1'], origin: { y: 0.6 } });
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white rounded-full font-bold text-xs transition-all active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>❤️ Pet Mochi</span>
                    </button>
                    {showcasePetLove === 100 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowcasePetLove(85);
                          setShowcasePetClicks(0);
                        }}
                        className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-semibold"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: COUPLES GAMES LOBBY */}
              {showcaseTab === 'games' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h5 className="text-sm font-bold text-white font-fraunces flex items-center justify-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-[#ff4d8d]" /> Play Live Tic-Tac-Toe
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      {showcaseTttWinner
                        ? showcaseTttWinner === 'draw'
                          ? "It's a draw! 🤝"
                          : `Player ${showcaseTttWinner} Won! 🎉`
                        : `Turn: Player ${showcaseTttTurn}`}
                    </p>
                  </div>

                  {/* 3x3 Grid */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-[200px] mx-auto pt-2">
                    {showcaseTttGrid.map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleShowcaseTttClick(idx)}
                        className={`w-14 h-14 rounded-xl border flex items-center justify-center text-lg font-black font-mono transition-all active:scale-95 ${
                          val === 'X'
                            ? 'bg-[#ff3377]/10 border-[#ff3377]/40 text-[#ff4d8d]'
                            : val === 'O'
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-transparent'
                        }`}
                      >
                        {val || '-'}
                      </button>
                    ))}
                  </div>

                  {/* Reset Game button */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={resetShowcaseTtt}
                      className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-bold text-xs"
                    >
                      Reset Board
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: countdowns with milliseconds */}
              {showcaseTab === 'countdown' && (
                <div className="text-center space-y-6">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-[#ff4d8d] tracking-widest flex items-center justify-center gap-1">
                      <Bell className="w-3 h-3" /> Active Celebration Alert
                    </div>
                    <h4 className="text-xl font-bold font-fraunces text-white">💘 Thomas & Deborah's 1-Year Milestone</h4>
                  </div>

                  {/* High Precision Milliseconds ticking panel */}
                  <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                    {[
                      { label: 'Days', val: 184 },
                      { label: 'Hours', val: 12 },
                      { label: 'Mins', val: 45 },
                      { label: 'Secs', val: 23 },
                      { label: 'Ms', val: showcaseMs }
                    ].map((cell, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center">
                        <span className={`text-lg sm:text-2xl font-black font-mono ${cell.label === 'Ms' || cell.label === 'Secs' ? 'text-[#ff4d8d]' : 'text-white'}`}>
                          {cell.label === 'Ms' ? String(cell.val).padStart(3, '0') : String(cell.val).padStart(2, '0')}
                        </span>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">{cell.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive reminder button */}
                  <div className="max-w-xs mx-auto p-3.5 rounded-2xl bg-[#190f17] border border-[#ff3377]/30 flex items-center justify-between text-xs text-rose-200">
                    <div className="flex items-center gap-2 font-bold">
                      <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
                      <span>Reminder Window: 7 Days</span>
                    </div>
                    <span className="text-[10px] uppercase font-black bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full">
                      ALERT ACTIVE 🔔
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: sealed wax letters */}
              {showcaseTab === 'letters' && (
                <div className="text-center space-y-4">
                  {showcaseLetterSealed ? (
                    <div className="space-y-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-900 to-amber-950 rounded-full flex items-center justify-center border-4 border-amber-600/40 relative shadow-lg select-none cursor-pointer group hover:scale-105 transition-all">
                        {/* Seal Emblem */}
                        <span className="text-3xl text-amber-500 font-bold group-hover:animate-ping absolute">⚜️</span>
                        <span className="text-3xl text-amber-400 font-bold relative z-10">⚜️</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">Wax-Sealed Time Capsule Letter</h4>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                          Click the golden seal below to break it and peek inside this secret love letter!
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowcaseLetterSealed(false);
                          confetti({ particleCount: 30, spread: 60, colors: ['#ff4d8d', '#ffbb33'], origin: { y: 0.6 } });
                        }}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-white rounded-full font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95"
                      >
                        Break Wax Seal 💌
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-[#ffeedd] text-[#4a2e1b] max-w-md mx-auto text-left shadow-2xl relative border-4 border-amber-700/20 font-serif select-none animate-fade-in">
                      {/* Wax Stamp Watermark */}
                      <div className="absolute top-4 right-4 text-xs font-black opacity-30 select-none">
                        ⚜️ SEALED 2026
                      </div>
                      <div className="space-y-3 font-semibold">
                        <p className="text-xs text-amber-900 font-bold uppercase tracking-wider">My Dearest,</p>
                        <p className="text-sm italic leading-relaxed">
                          "From the moment we connected in our special couple space, every day has felt complete. I can't wait to write a million more stories with you. You are my home. Forever yours."
                        </p>
                        <p className="text-xs text-right text-amber-900 font-black">— Thomas 💖</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-amber-900/10 text-center">
                        <button
                          type="button"
                          onClick={() => setShowcaseLetterSealed(true)}
                          className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 hover:text-amber-950 underline"
                        >
                          Seal it back up
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: double blind questions */}
              {showcaseTab === 'questions' && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#ff4d8d] tracking-widest">
                      Double-Blind Connection
                    </span>
                    <h4 className="text-base font-bold text-white font-fraunces">
                      "If we could instantly teleport anywhere in the world right now, where are we going?"
                    </h4>
                  </div>

                  {!showcaseQuestionSubmitted ? (
                    <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase font-bold block">
                          Your Answer (Hidden from partner until you submit)
                        </label>
                        <input
                          type="text"
                          value={showcaseQuestionAnswer}
                          onChange={(e) => setShowcaseQuestionAnswer(e.target.value)}
                          placeholder="Type your secret escape here..."
                          className="w-full bg-[#150f14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff3377]"
                        />
                      </div>

                      <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 rounded-xl">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Partner has already answered! Answer locked until you submit.</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!showcaseQuestionAnswer.trim()) return;
                          setShowcaseQuestionSubmitted(true);
                          confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                        }}
                        disabled={!showcaseQuestionAnswer.trim()}
                        className="w-full py-2 bg-[#ff3377] hover:bg-[#ff4d8d] disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                      >
                        Submit & Reveal Answers 🔑
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Revealed answers */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#ff3377]/10 border border-[#ff3377]/30 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-rose-400 block uppercase">You Answered</span>
                          <p className="text-xs font-bold text-white italic">"{showcaseQuestionAnswer}"</p>
                        </div>
                        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1">
                          <span className="text-[9px] font-bold text-purple-400 block uppercase">Partner Answered</span>
                          <p className="text-xs font-bold text-white italic">"A cozy overwater bungalow in the Maldives with starry nights! 🌴✨"</p>
                        </div>
                      </div>

                      <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-2 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Question Synced! Streak increases to 294 Days! 🔥</span>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowcaseQuestionAnswer('');
                            setShowcaseQuestionSubmitted(false);
                          }}
                          className="text-[10px] font-extrabold text-neutral-400 hover:text-white underline"
                        >
                          Type another answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: secure memories vault */}
              {showcaseTab === 'vault' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white font-fraunces flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-400" /> Thomas & Deborah's Shared Vault
                      </h5>
                      <p className="text-[10px] text-neutral-400">Isolated 100% Google Cloud Secure Encryption</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={addSimulatedVaultPhoto}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-[10px] font-bold text-[#ff4d8d] cursor-pointer"
                    >
                      + Add Simulated Photo 📸
                    </button>
                  </div>

                  {/* Simulated Polaroids row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                    {vaultPhotos.map((photo) => (
                      <div key={photo.id} className="bg-white p-2 rounded-lg shadow-xl border border-neutral-200 transform rotate-[-2deg] hover:rotate-[0deg] transition-all duration-300">
                        <div className="w-full h-24 overflow-hidden rounded-md bg-neutral-100">
                          <img
                            src={photo.src}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="mt-2 text-left">
                          <p className="text-[10px] font-black text-neutral-800 leading-tight truncate">
                            {photo.caption}
                          </p>
                          <span className="text-[8px] text-neutral-400 font-bold block mt-0.5">
                            {photo.date}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-center select-none bg-white/5 opacity-60">
                      <span className="text-xl">🔒</span>
                      <span className="text-[8px] font-bold uppercase text-neutral-400 mt-1">End-To-End Private</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Mobile Device frame info */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-500 font-bold">
              <span>ACTIVE SESSION: THOMAS & DEBORAH</span>
              <span className="text-[#ff4d8d]">SYNCED ON AIRPLANE NETWORK 📡</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isInsideApp) {
    return (
      <div className="min-h-screen bg-[#0d090c] text-neutral-100 font-sans selection:bg-[#ff3377] selection:text-white pb-16">
        {/* Navigation Bar inside App */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d090c]/85 border-b border-white/5 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-[#ff5c8a] flex items-center justify-center p-0.5 shadow-lg shadow-pink-500/20">
                <div className="w-full h-full bg-[#120a10] rounded-[14px] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#ff4d8d] fill-[#ff4d8d]" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold font-fraunces tracking-tight text-white">
                Shoona<span className="text-[#ff4d8d]">Connect</span> Showcase
              </span>
            </div>

            {/* Back action */}
            {setActiveTab && (
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-5 py-2.5 rounded-full bg-[#ff3377]/10 hover:bg-[#ff3377]/20 text-white border border-[#ff3377]/30 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <span>Back to Sanctuary</span>
                <ArrowRight className="w-4 h-4 text-[#ff4d8d]" />
              </button>
            )}
          </div>
        </header>

        {/* Feature Showcase container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderInteractiveShowcase()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d090c] text-neutral-100 font-sans selection:bg-[#ff3377] selection:text-white">
      {/* Dynamic Partner Invite Notification Banner */}
      {inviteCode && (
        <div className="bg-gradient-to-r from-[#ff3377] via-pink-600 to-purple-600 px-4 py-3 text-white text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-center gap-3 shadow-lg z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-white animate-bounce" />
            <span>
              Partner Invite Received! Secret Couple Code: <strong className="font-mono bg-white/20 px-2 py-0.5 rounded-lg text-white font-black">{inviteCode}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnterAuth}
            className="px-4 py-1.5 bg-white text-[#ff3377] rounded-full font-bold text-xs hover:bg-rose-50 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <span>Accept & Step In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. TOP NAVIGATION (Exact layout from 1.png) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d090c]/85 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-[#ff5c8a] flex items-center justify-center p-0.5 shadow-lg shadow-pink-500/20">
              <div className="w-full h-full bg-[#120a10] rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#ff4d8d] fill-[#ff4d8d]" />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold font-fraunces tracking-tight text-white">
              Shoona<span className="text-[#ff4d8d]">Connect</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#games" className="hover:text-white transition-colors">Games</a>
            <a href="#screenshots" className="hover:text-white transition-colors">Website Preview</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            {isInsideApp && setActiveTab ? (
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                Back to Sanctuary <ArrowRight className="w-4 h-4" />
              </button>
            ) : userProfile ? (
              <button
                type="button"
                onClick={onEnterApp}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#ff2b70] hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/25 flex items-center gap-2"
              >
                Enter Couple Space <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnterAuth}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4d8d] to-[#ff2b70] hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-pink-500/25 flex items-center gap-2 active:scale-95"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (Mirroring dark velvet style & interactive mockup) */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle radial glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#ff3377]/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                THE PRIVATE COUPLES SANCTUARY ONLINE
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold font-fraunces tracking-tight text-white leading-[1.08]">
                The couples website that brings you{' '}
                <span className="text-[#ff4d8d] underline decoration-[#ff3377]/50 decoration-wavy decoration-2">
                  closer every day.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Daily questions, shared games, memories, date planner, virtual pet & real-time notifications.
                Everything you and your partner need in one beautiful private website accessible on every device.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleEnterAuth}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#ff2b70] hover:brightness-110 text-white font-bold text-sm sm:text-base shadow-xl shadow-pink-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Begin Our Sanctuary Free</span>
                </button>

                <a
                  href="#games"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#160f14] hover:bg-[#20151f] border border-white/10 text-white font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-5 h-5 text-[#ff4d8d]" />
                  <span>Explore 7 Games</span>
                </a>
              </div>

              {/* Sub-note */}
              <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                Free to use. One shared sanctuary covers both partners. 100% private.
              </p>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 max-w-md">
                  {authError}
                </div>
              )}
            </div>

            {/* Right: Realistic iPhone Mockup in Glowing Card (Exact 1.png structure) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[380px] rounded-[44px] bg-gradient-to-b from-[#ff3377]/30 via-[#2b1625]/60 to-[#120a10] p-4 sm:p-5 shadow-2xl shadow-pink-500/20 border border-[#ff3377]/40 relative">
                {/* Tagline inside container */}
                <div className="text-center pb-3">
                  <h3 className="text-lg sm:text-xl font-bold font-fraunces text-white">
                    Everything Your Relationship Needs
                  </h3>
                </div>

                {/* iPhone Body Frame */}
                <div className="w-full rounded-[38px] bg-[#0c080b] border-[6px] border-[#1e131b] overflow-hidden shadow-2xl flex flex-col min-h-[580px] relative">
                  {/* Status Bar + Dynamic Island */}
                  <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-neutral-300">
                    <span>9:32</span>
                    <div className="w-20 h-5 bg-black rounded-full border border-neutral-800 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80 mr-1.5 animate-pulse" />
                      <Heart className="w-2.5 h-2.5 text-[#ff4d8d] fill-[#ff4d8d]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-neutral-300 rounded-xs p-0.5">
                        <div className="w-full h-full bg-neutral-200" />
                      </div>
                    </div>
                  </div>

                  {/* Inside Screen Content */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    {/* Couple Profile Pill */}
                    <div className="flex items-center justify-between bg-[#190f17] p-2.5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff3377] to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                          T&D
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1">
                            Thomas & Deborah <Heart className="w-2.5 h-2.5 text-[#ff4d8d] fill-[#ff4d8d]" />
                          </div>
                          <div className="text-[10px] text-neutral-400">Together for 110 days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400">
                        <MessageCircle className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                        <Bell className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                      </div>
                    </div>

                    {/* Greeting */}
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white font-fraunces flex items-center gap-1.5">
                        Good evening! 🌙
                      </h4>
                      <p className="text-[10px] text-neutral-400">Here’s what’s happening today</p>
                    </div>

                    {/* Daily Streak Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ff3377]/25 via-[#ff4d8d]/15 to-[#241421] border border-[#ff3377]/40 shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-rose-300 tracking-wider">
                            Daily streak
                          </div>
                          <div className="text-xl font-extrabold font-fraunces text-white flex items-center gap-1.5">
                            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                            293 Days
                          </div>
                        </div>
                        <span className="text-[10px] text-rose-200 font-semibold bg-[#ff3377]/20 px-2 py-0.5 rounded-full">
                          On fire! 💪
                        </span>
                      </div>
                    </div>

                    {/* Interactive Tab Toggle on Phone */}
                    <div className="grid grid-cols-3 gap-1 bg-[#150f14] p-1 rounded-xl border border-white/5 text-[10px] font-bold text-center">
                      <button
                        type="button"
                        onClick={() => setMockupTab('daily')}
                        className={`py-1 rounded-lg transition-all ${
                          mockupTab === 'daily' ? 'bg-[#ff3377] text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Question
                      </button>
                      <button
                        type="button"
                        onClick={() => setMockupTab('pet')}
                        className={`py-1 rounded-lg transition-all ${
                          mockupTab === 'pet' ? 'bg-[#ff3377] text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Pet Mochi 🦊
                      </button>
                      <button
                        type="button"
                        onClick={() => setMockupTab('chat')}
                        className={`py-1 rounded-lg transition-all ${
                          mockupTab === 'chat' ? 'bg-[#ff3377] text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Whisper
                      </button>
                    </div>

                    {/* Phone Tab 1: Daily Question */}
                    {mockupTab === 'daily' && (
                      <div className="p-3.5 rounded-2xl bg-[#190f17] border border-white/10 space-y-2.5">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-[#ff4d8d] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Daily Question
                        </div>
                        <p className="text-xs font-bold text-white font-fraunces">
                          "What’s your dream spontaneous date night? 🌙"
                        </p>

                        {mockupAnswerSubmitted ? (
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                            <span>Answer locked & revealed! 💕</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={mockupAnswer}
                              onChange={(e) => setMockupAnswer(e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full bg-[#0d090c] border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff3377]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setMockupAnswerSubmitted(true);
                                confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
                              }}
                              className="w-full py-2 rounded-xl bg-[#ff3377] hover:bg-[#ff4d8d] text-white text-[11px] font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" /> Answer Question
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Phone Tab 2: Virtual Pet Mochi */}
                    {mockupTab === 'pet' && (
                      <div className="p-3.5 rounded-2xl bg-[#190f17] border border-white/10 space-y-2 text-center">
                        <div className="text-3xl animate-bounce">🦊</div>
                        <div className="text-xs font-bold font-fraunces text-white">Mochi (LVL 4)</div>
                        <p className="text-[10px] text-neutral-400">Happy and purring softly!</p>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => confetti({ particleCount: 20, spread: 45, origin: { y: 0.6 } })}
                            className="py-1.5 rounded-lg bg-[#ff3377]/20 border border-[#ff3377]/30 text-[10px] font-bold text-rose-300"
                          >
                            🍖 Feed Snack
                          </button>
                          <button
                            type="button"
                            onClick={() => confetti({ particleCount: 20, spread: 45, origin: { y: 0.6 } })}
                            className="py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-300"
                          >
                            🎾 Play Ball
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Phone Tab 3: Whisper chat */}
                    {mockupTab === 'chat' && (
                      <div className="p-3 rounded-2xl bg-[#190f17] border border-white/10 space-y-1.5 text-[11px]">
                        <div className="p-2 rounded-xl bg-white/5 text-neutral-300">
                          Deborah: "Can't wait to see you tonight my love ❤️"
                        </div>
                        <div className="p-2 rounded-xl bg-[#ff3377]/30 text-white font-medium text-right">
                          Thomas: "Counting down the hours! ✨"
                        </div>
                      </div>
                    )}

                    {/* Bottom Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-[#160f14] border border-white/5 text-center">
                        <div className="text-[10px] text-neutral-400 font-medium">🥂 Days Together</div>
                        <div className="text-sm font-extrabold font-fraunces text-white">110 Days</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#160f14] border border-white/5 text-center">
                        <div className="text-[10px] text-neutral-400 font-medium">💬 Answered</div>
                        <div className="text-sm font-extrabold font-fraunces text-white">100% Synced</div>
                      </div>
                    </div>
                  </div>

                  {/* Home Bar */}
                  <div className="pb-2 pt-1 flex justify-center">
                    <div className="w-28 h-1 bg-neutral-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRICS BAR (Exact 2.png) */}
      <section className="py-12 border-y border-white/5 bg-[#110b10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-fraunces text-[#ff4d8d]">
                1000+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-400">
                Quiz Questions
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-fraunces text-[#ff4d8d]">
                7
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-400">
                Game Types
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-fraunces text-[#ff4d8d]">
                365
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-400">
                Daily Prompts
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-fraunces text-[#ff4d8d]">
                5.0 ★
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-400">
                Couple Rating (100% Encrypted)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION: INTERACTIVE LIVE SHOWCASE */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {renderInteractiveShowcase()}
        </div>
      </section>

      {/* 5. GAMES SECTION (Exact 4.png with 7 game types) */}
      <section id="games" className="py-24 bg-[#110a10] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              GAMES
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-white tracking-tight">
              7 game types, 1000+ questions
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              From lighthearted fun to deep conversations. Play together in real-time or make a move and come back later.
            </p>
          </div>

          {/* 7 Game Cards Grid (Exact emojis from 4.png) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: 'wyr',
                emoji: '🤥',
                title: 'Would You Rather',
                sub: 'Fun dilemma choices',
                playable: true,
              },
              {
                id: 'sketch',
                emoji: '🎨',
                title: 'Sketch & Guess',
                sub: 'Pictionary-style drawing game',
                playable: true,
              },
              {
                id: 'nhie',
                emoji: '🙈',
                title: 'Never Have I Ever',
                sub: 'Discover new things',
                playable: true,
              },
              {
                id: 'how-well',
                emoji: '💡',
                title: 'How Well Do You Know Me',
                sub: 'Test your partner knowledge',
                playable: true,
              },
              {
                id: 'trivia',
                emoji: '🧠',
                title: 'Trivia',
                sub: 'Fun facts & general knowledge',
                playable: true,
              },
              {
                id: 'starters',
                emoji: '💬',
                title: 'Conversation Starters',
                sub: 'Deep & meaningful topics',
                playable: true,
              },
              {
                id: 'more',
                emoji: '✨',
                title: '& More',
                sub: 'New games added regularly',
                playable: false,
              },
            ].map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (game.playable) {
                    setActiveMiniGame(activeMiniGame === game.id ? null : game.id);
                  }
                }}
                className={`p-6 rounded-3xl bg-[#160f14] border transition-all cursor-pointer flex items-center justify-between ${
                  activeMiniGame === game.id
                    ? 'border-[#ff3377] bg-[#22141e] shadow-xl shadow-pink-500/20'
                    : 'border-white/5 hover:border-white/20 hover:bg-[#1d131a]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl">{game.emoji}</span>
                  <div>
                    <h4 className="text-lg font-bold font-fraunces text-white">{game.title}</h4>
                    <p className="text-xs text-neutral-400">{game.sub}</p>
                  </div>
                </div>

                {game.playable && (
                  <span className="text-xs font-bold text-[#ff4d8d] bg-[#ff3377]/15 px-3 py-1 rounded-full">
                    {activeMiniGame === game.id ? 'Close' : 'Try Live'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Playable Sandbox in Games Section */}
          {activeMiniGame && (
            <div className="p-8 rounded-3xl bg-[#170e15] border border-[#ff3377]/40 shadow-2xl max-w-2xl mx-auto space-y-6">
              {activeMiniGame === 'wyr' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-[#ff4d8d] uppercase tracking-wider">
                    Would You Rather
                  </span>
                  <h3 className="text-xl font-bold font-fraunces text-white">
                    Pick your preference!
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWyrSelection('a');
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                      }}
                      className={`p-5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        wyrSelection === 'a' ? 'bg-[#ff3377] text-white border-[#ff3377]' : 'bg-[#120a10] border-white/10 text-neutral-200'
                      }`}
                    >
                      A. Midnight stargazing on an isolated beach blanket 🌊
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWyrSelection('b');
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                      }}
                      className={`p-5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        wyrSelection === 'b' ? 'bg-[#ff3377] text-white border-[#ff3377]' : 'bg-[#120a10] border-white/10 text-neutral-200'
                      }`}
                    >
                      B. Cozy snowy cabin watching movies by a crackling hearth ❄️
                    </button>
                  </div>
                  {wyrSelection && (
                    <p className="text-xs text-emerald-400 font-semibold pt-2">
                      Answer saved! When your partner answers, it'll reveal both choices together 💕
                    </p>
                  )}
                </div>
              )}

              {activeMiniGame === 'nhie' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-[#ff4d8d] uppercase tracking-wider">
                    Never Have I Ever
                  </span>
                  <p className="text-lg font-bold font-fraunces text-white">
                    "Never have I ever stalked your playlist to see what songs you were listening to."
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNhieChoice('have');
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#ff3377] text-white text-xs font-bold cursor-pointer"
                    >
                      🙈 I Have!
                    </button>
                    <button
                      type="button"
                      onClick={() => setNhieChoice('never')}
                      className="px-6 py-2.5 rounded-xl bg-[#120a10] border border-white/10 text-white text-xs font-bold cursor-pointer"
                    >
                      😇 Never
                    </button>
                  </div>
                </div>
              )}

              {activeMiniGame === 'starters' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-[#ff4d8d] uppercase tracking-wider">
                    Conversation Card
                  </span>
                  <p className="text-lg font-bold font-fraunces text-white">
                    "{sampleStarters[activePromptIndex % sampleStarters.length]}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePromptIndex((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Next Card
                  </button>
                </div>
              )}

              {activeMiniGame !== 'wyr' && activeMiniGame !== 'nhie' && activeMiniGame !== 'starters' && (
                <div className="text-center py-4 space-y-3">
                  <h4 className="text-base font-bold font-fraunces text-white">
                    Full Game Available on Website!
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Sign in to play complete live multiplayer rounds with your partner.
                  </p>
                  <button
                    type="button"
                    onClick={handleEnterAuth}
                    className="px-6 py-2.5 rounded-full bg-[#ff3377] text-white text-xs font-bold cursor-pointer"
                  >
                    Launch Full Games
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 6. "UP AND RUNNING IN 60 SECONDS" */}
      <section id="how-it-works" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              GET STARTED
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-white tracking-tight">
              Up and running in 60 seconds
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              Getting started with ShoonaConnect is simple. Here’s how it works.
            </p>
          </div>

          {/* 3 Step Circles with subtle line */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                desc: 'Open ShoonaConnect for free on any phone, tablet, or desktop browser. Create your account in seconds with your email and custom username.',
              },
              {
                step: '2',
                title: 'Invite Your Partner',
                desc: 'Share your unique invite code via text, WhatsApp, or any messenger. Once your partner enters the code, you’re linked instantly and securely.',
              },
              {
                step: '3',
                title: 'Grow Together',
                desc: 'Answer daily questions, play games, save memories, plan dates, and raise your virtual pet. Stay connected every single day across any distance.',
              },
            ].map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff3377] to-[#ff5c8a] flex items-center justify-center text-white text-xl font-bold font-fraunces shadow-lg shadow-pink-500/25">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold font-fraunces text-white">{s.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WEBSITE SCREENSHOTS & VIRTUAL PET SHOWCASE */}
      <section id="screenshots" className="py-24 bg-[#110a10] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              WEBSITE PREVIEW
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-white tracking-tight">
              See ShoonaConnect in action
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              Explore the full experience: daily questions, digital pet, memories, games, and lock-screen privacy directly on the website.
            </p>
          </div>

          {/* 3 Featured Device Cards from 6.png */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Device 1: Digital Pet Mochi */}
            <div className="rounded-3xl bg-[#160f14] border border-white/5 p-6 space-y-4 shadow-xl">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold font-fraunces text-white">
                  Grow Together with Your Digital Pet
                </h4>
                <p className="text-xs text-neutral-400">Adopt and nurture your shared companion</p>
              </div>

              {/* Mock Screen */}
              <div className="rounded-2xl bg-[#0c080b] border border-white/10 p-5 space-y-4 text-center">
                <div className="text-5xl animate-bounce">🦊</div>
                <div>
                  <div className="text-sm font-bold text-white font-fraunces">Mochi</div>
                  <div className="text-[10px] text-amber-400 font-semibold">Pet Health: 94%</div>
                </div>

                <div className="space-y-2 text-left text-[10px]">
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-1">
                      <span>Hunger</span> <span>85%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-neutral-400 mb-1">
                      <span>Happiness</span> <span>96%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#ff3377] h-full w-[96%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device 2: Daily Questions */}
            <div className="rounded-3xl bg-[#160f14] border border-white/5 p-6 space-y-4 shadow-xl">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold font-fraunces text-white">
                  Deepen Your Bond with Daily Questions
                </h4>
                <p className="text-xs text-neutral-400">Answers stay secret until both respond</p>
              </div>

              <div className="rounded-2xl bg-[#0c080b] border border-white/10 p-5 space-y-3">
                <div className="text-[10px] uppercase font-bold text-[#ff4d8d]">Daily Question</div>
                <p className="text-xs font-bold text-white font-fraunces">
                  "What’s your dream date night? 🌙"
                </p>
                <div className="p-3 rounded-xl bg-white/5 text-[11px] text-neutral-300 italic">
                  "A candlelit picnic on the cliffs overlooking the sea at sunset..."
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Partner unlocked and answered!
                </div>
              </div>
            </div>

            {/* Device 3: Stay Connected on Home Screen */}
            <div className="rounded-3xl bg-[#160f14] border border-white/5 p-6 space-y-4 shadow-xl">
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold font-fraunces text-white">
                  Stay Connected On Your Home Screen
                </h4>
                <p className="text-xs text-neutral-400">iOS & Android home screen widgets</p>
              </div>

              <div className="rounded-2xl bg-[#0c080b] border border-white/10 p-5 space-y-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-950/40 to-rose-950/40 border border-[#ff3377]/30 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase text-rose-300 font-bold">Days in Love</div>
                    <div className="text-base font-extrabold font-fraunces text-white">293 Days</div>
                  </div>
                  <Heart className="w-5 h-5 text-[#ff4d8d] fill-[#ff4d8d]" />
                </div>

                <div className="p-3 rounded-xl bg-[#160f14] border border-white/5 text-[11px] text-neutral-300">
                  💌 Latest Love Note: "Thinking of you every second!"
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. "PERFECT FOR EVERY STAGE" (Exact 6.png) */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              FOR EVERY COUPLE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-white tracking-tight">
              Perfect for every stage of your relationship
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              Whether you just started dating or have been married for years, ShoonaConnect adapts to where you are.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                stage: 'Just Started Dating',
                desc: 'Break the ice with fun trivia, learn each other’s love languages, and find out what makes them smile.',
                emoji: '🌱',
              },
              {
                stage: 'Long Distance (LDR)',
                desc: 'Bridge miles with real-time whispers, mutual streak tracking, scheduled love letters, and shared virtual pet care.',
                emoji: '✈️',
              },
              {
                stage: 'Living Together',
                desc: 'Coordinate shared grocery lists, plan spontaneous date nights, and work through disagreements constructively.',
                emoji: '🏡',
              },
              {
                stage: 'Married for Decades',
                desc: 'Keep the romantic spark electric, revisit old memories in the vault, and celebrate every milestone.',
                emoji: '💍',
              },
            ].map((st, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-[#160f14] border border-white/5 space-y-3 shadow-lg">
                <span className="text-3xl">{st.emoji}</span>
                <h4 className="text-lg font-bold font-fraunces text-white">{st.stage}</h4>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#110a10] border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#ff3377]/15 border border-[#ff3377]/30 text-[#ff4d8d] text-xs font-bold uppercase tracking-widest">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-white tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-base sm:text-lg text-neutral-300">
              Everything you need to know about ShoonaConnect.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What is ShoonaConnect?',
                a: 'ShoonaConnect is a private digital sanctuary crafted exclusively for two partners. Unlike public social media, it provides an intimate, ad-free environment right on the web featuring encrypted messaging, daily couple questions, relationship games, virtual pet care, and shared memory scrapbooks.',
              },
              {
                q: 'Is ShoonaConnect free to use?',
                a: 'Yes! You can get started and use ShoonaConnect for free. One account setup links both partners at no cost.',
              },
              {
                q: 'Does ShoonaConnect work for long distance relationships?',
                a: 'Absolutely! Thousands of long-distance couples rely on ShoonaConnect every day. Features like the live Days in Love counter, mutual virtual pet care, scheduled love letters, and real-time chat help you feel close no matter how many miles lie between you.',
              },
              {
                q: 'How do my partner and I link together on the website?',
                a: 'When you sign in, the website generates a private, unique 4-digit pairing code. Simply share this code with your partner via text, WhatsApp, or messenger. When they enter the code on their screen, your accounts link immediately.',
              },
              {
                q: 'What couple games are included?',
                a: 'The website features 7 game modes with over 1000+ questions: Would You Rather, Never Have I Ever, How Well Do You Know Me, Relationship Trivia, Deep Conversation Starters, Sketch & Guess, and Gottman-inspired Conflict Repair.',
              },
              {
                q: 'How is ShoonaConnect different from other platforms?',
                a: 'ShoonaConnect focuses on genuine privacy, zero clutter, and relationship science. There are no public feeds or algorithms. It includes dedicated features like the wax-sealed future letter vault, custom PIN device lock, and interactive pet parenting.',
              },
              {
                q: 'Is my data private and secure?',
                a: 'Yes, 100%. Cloud security rules strictly isolate all messages, photos, and letters to only the two authenticated Google accounts in your couple partition. No third party or other users can ever view your shared content.',
              },
              {
                q: 'Can I access ShoonaConnect on mobile, tablet, and desktop?',
                a: 'Yes! ShoonaConnect runs seamlessly directly in modern web browsers across iPhone, iPad, Android, Mac, and Windows with instant real-time synchronization and no app store installation required.',
              },
              {
                q: 'Can we use it if we just started dating?',
                a: 'Definitely! The website features dedicated icebreakers, fun dilemma questions, and date planning tools specifically tailored for new relationships.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#160f14] border border-white/5 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <span className="text-base font-bold font-fraunces text-white">{faq.q}</span>
                    <span
                      className={`text-xl font-bold transition-transform text-[#ff4d8d] ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL BOTTOM CTA BANNER */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ff3377] to-[#ff5c8a] mx-auto flex items-center justify-center p-0.5 shadow-2xl shadow-pink-500/30">
            <div className="w-full h-full bg-[#160f14] rounded-[22px] flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#ff4d8d] fill-[#ff4d8d]" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-white tracking-tight">
            Ready to bring your relationship{' '}
            <span className="text-[#ff4d8d] italic">closer?</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto">
            Join thousands of couples creating everyday intimacy, sharing sweet memories, and strengthening their bond.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleEnterAuth}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff4d8d] to-[#ff2b70] hover:brightness-110 text-white font-bold text-base shadow-xl shadow-pink-500/30 transition-all cursor-pointer active:scale-95"
            >
              Create Our Couple Space Free
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="py-16 border-t border-white/10 bg-[#090608]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand column */}
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff3377] to-[#ff5c8a] flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-[#120a10] rounded-[10px] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#ff4d8d] fill-[#ff4d8d]" />
                  </div>
                </div>
                <span className="text-xl font-extrabold font-fraunces text-white">
                  Shoona<span className="text-[#ff4d8d]">Connect</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
                The private couples website that brings you closer every day. Daily questions, games, memories, plans & more for every device.
              </p>
            </div>

            {/* WEBSITE links */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">WEBSITE</h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#games" className="hover:text-white transition-colors">Games</a></li>
                <li><a href="#screenshots" className="hover:text-white transition-colors">Website Preview</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Get Started</a></li>
              </ul>
            </div>

            {/* LEGAL links */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-300">LEGAL</h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Contact Support</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© 2026 ShoonaConnect. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Private & Zero-Knowledge Architecture</span>
              <span>•</span>
              <span>Made with love for couples worldwide</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
