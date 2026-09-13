import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab } from '../types';
import { LegalModal, LegalTab } from './LegalModal';
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
  EyeOff,
  Database,
  Trash2,
  FileText,
  Copy,
  Check,
  Award,
  HeartHandshake,
  Activity,
  Layers,
  Sparkle,
  Gift,
  Feather,
  Compass,
  Mail,
  Code,
  Terminal,
  Cpu,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandingViewProps {
  onEnterApp?: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
  isInsideApp?: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterApp,
  setActiveTab,
  isInsideApp = false,
}) => {
  const { userProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Legal modal state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTab>('privacy');

  // Interactive Couple Sanctuary Simulator in Hero / Get Started section
  const [simMyName, setSimMyName] = useState('Thomas');
  const [simPartnerName, setSimPartnerName] = useState('Deborah');
  const [simPairCode, setSimPairCode] = useState('LOVE');
  const [codeCopied, setCodeCopied] = useState(false);

  // Phone Mockup interactive tab
  const [mockupTab, setMockupTab] = useState<'daily' | 'pet' | 'chat' | 'doodle'>('daily');
  const [mockupAnswer, setMockupAnswer] = useState('');
  const [mockupAnswerSubmitted, setMockupAnswerSubmitted] = useState(false);

  // Interactive Game Drawer / Preview in Games Section
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>('wyr');
  const [wyrSelection, setWyrSelection] = useState<'a' | 'b' | null>(null);
  const [nhieChoice, setNhieChoice] = useState<'have' | 'never' | null>(null);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Check URL params or localStorage for pending couple invite code
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Live Interactive Feature Showcase states
  const [showcaseTab, setShowcaseTab] = useState<
    'chat' | 'pet' | 'games' | 'countdown' | 'letters' | 'questions' | 'vault' | 'cycle' | 'goals'
  >('chat');
  const [showcasePetLove, setShowcasePetLove] = useState(88);
  const [showcaseTttGrid, setShowcaseTttGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [showcaseTttTurn, setShowcaseTttTurn] = useState<'X' | 'O'>('X');
  const [showcaseLetterSealed, setShowcaseLetterSealed] = useState(true);
  const [showcaseQuestionAnswer, setShowcaseQuestionAnswer] = useState('');
  const [showcaseQuestionSubmitted, setShowcaseQuestionSubmitted] = useState(false);
  const [showcaseDoodleColor, setShowcaseDoodleColor] = useState('#ff3377');
  const [showcaseDoodleSent, setShowcaseDoodleSent] = useState(false);

  // Live ticking milliseconds state for showcase countdown
  const [showcaseMs, setShowcaseMs] = useState(142);

  useEffect(() => {
    const msInterval = setInterval(() => {
      setShowcaseMs(Math.floor(Math.random() * 1000));
    }, 90);
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

  const openLegal = (tab: LegalTab = 'privacy') => {
    setLegalInitialTab(tab);
    setLegalModalOpen(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(simPairCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const generateNewSimCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSimPairCode(res);
    confetti({ particleCount: 15, spread: 30, origin: { y: 0.5 } });
  };

  const sampleStarters = [
    'What was a moment this past month where you felt most deeply loved by me?',
    'What is the silliest inside joke we share that no one else would understand?',
    'What is our dream trip to take together in the next 12 months?',
    'What outfit or look of mine is your secret absolute favorite?',
    'What was the exact moment you knew I was the one for you?',
  ];

  // Tic Tac Toe helper
  const checkShowcaseTttWinner = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }
    if (grid.every((cell) => cell !== null)) return 'draw';
    return null;
  };

  const showcaseTttWinner = checkShowcaseTttWinner(showcaseTttGrid);

  const handleShowcaseTttClick = (idx: number) => {
    if (showcaseTttGrid[idx] || showcaseTttWinner) return;
    const newGrid = [...showcaseTttGrid];
    newGrid[idx] = showcaseTttTurn;
    setShowcaseTttGrid(newGrid);
    setShowcaseTttTurn(showcaseTttTurn === 'X' ? 'O' : 'X');
    confetti({ particleCount: 10, spread: 35, origin: { y: 0.65 } });
  };

  const resetShowcaseTtt = () => {
    setShowcaseTttGrid(Array(9).fill(null));
    setShowcaseTttTurn('X');
  };

  // Custom photo list for Simulated Vault Showcase
  const [vaultPhotos, setVaultPhotos] = useState([
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=400',
      date: 'Jul 24, 2026',
      caption: 'Golden sunset on the cliffs 🌅',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=400',
      date: 'Aug 12, 2026',
      caption: 'Anniversary coffee date ☕',
    },
  ]);

  const addSimulatedVaultPhoto = () => {
    const caps = [
      'Strolling the botanical gardens 🌸',
      'Cooking homemade pasta together! 🍝',
      'Snuggling on a rainy Sunday morning 🌧️💝',
      'Midnight ice-cream escape 🍦',
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
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.6 } });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? 'bg-[#0c080b] text-neutral-100 selection:bg-[#ff3377] selection:text-white'
          : 'bg-gradient-to-b from-rose-50/80 via-white to-pink-50/40 text-slate-800 selection:bg-rose-500 selection:text-white'
      }`}
    >
      {/* 0. PENDING COUPLE INVITE NOTIFICATION BANNER */}
      {inviteCode && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 px-4 py-3 text-white text-xs sm:text-sm font-semibold flex flex-wrap items-center justify-center gap-3 shadow-lg z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-white animate-bounce" />
            <span>
              Partner Invite Waiting! Your Secret Couple Code is:{' '}
              <strong className="font-mono bg-white/20 px-2.5 py-1 rounded-lg text-white font-black">
                {inviteCode}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnterAuth}
            className="px-4 py-1.5 bg-white text-rose-600 rounded-full font-bold text-xs hover:bg-rose-50 transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
          >
            <span>Accept Invite & Step In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. TOP NAVIGATION */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
          isDark ? 'bg-[#0c080b]/85 border-white/10' : 'bg-white/85 border-rose-100 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center p-0.5 shadow-lg shadow-rose-500/25">
              <div className="w-full h-full bg-white dark:bg-[#120a10] rounded-[14px] flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold font-fraunces tracking-tight text-slate-900 dark:text-white">
                Shoona<span className="text-rose-500">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                Couples Sanctuary
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-300">
            <a href="#get-started" className="hover:text-rose-500 dark:hover:text-white transition-colors">
              Get Started
            </a>
            <a href="#features" className="hover:text-rose-500 dark:hover:text-white transition-colors">
              All 12 Features
            </a>
            <a href="#games" className="hover:text-rose-500 dark:hover:text-white transition-colors">
              7 Games Lounge
            </a>
            <a href="#how-it-works" className="hover:text-rose-500 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-rose-500 dark:hover:text-white transition-colors flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy & Legal</span>
            </a>
            <a href="#faq" className="hover:text-rose-500 dark:hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Bar: Theme Toggle + Get Started */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme switch button */}
            <button
              id="btn-landing-theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-neutral-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-rose-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Main Action Button */}
            {isInsideApp && setActiveTab ? (
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md shadow-rose-500/20 flex items-center gap-1.5"
              >
                <span>Back to Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : userProfile ? (
              <button
                type="button"
                onClick={handleEnterAuth}
                className="px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/25 flex items-center gap-2"
              >
                <span>Enter Our Space</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="btn-nav-get-started"
                type="button"
                onClick={handleEnterAuth}
                className="px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/25 flex items-center gap-1.5 active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION & INTERACTIVE GET-STARTED LAUNCHPAD */}
      <section id="get-started" className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        {/* Glow ambient meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-rose-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-pink-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Private Sanctuary Exclusively for 2</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-fraunces tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                The couples website that brings you{' '}
                <span className="text-rose-500 underline decoration-rose-400/40 decoration-wavy decoration-2">
                  closer every single day.
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Everything for your relationship in one intimate, encrypted home: real-time chat with collaborative doodles & voice notes, 7 multiplayer couples games, virtual pet parenting, wax-sealed love letters, precision anniversary countdowns, and secret memory albums.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="btn-hero-get-started"
                  type="button"
                  onClick={handleEnterAuth}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-bold text-base shadow-xl shadow-rose-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Start Our Couple Story Free</span>
                </button>

                <a
                  href="#features"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5 text-rose-500" />
                  <span>Explore 12 Features</span>
                </a>
              </div>

              {/* Security & Guarantee Bullet Points */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs font-semibold text-slate-500 dark:text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Free to Use</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span>Isolated Row-Level Encryption</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-purple-500" />
                  <span>Zero Ads • No Selling Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span>iPhone, Android, Mac & PC</span>
                </div>
              </div>

              {/* Interactive Quick Couple Sanctuary Generator Card */}
              <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-[#160f14] border border-rose-200/80 dark:border-white/10 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    <Sparkle className="w-3.5 h-3.5" />
                    <span>Instant Couple Preview Simulator</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                    Try typing your names
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                      Your First Name
                    </label>
                    <input
                      type="text"
                      value={simMyName}
                      onChange={(e) => setSimMyName(e.target.value)}
                      placeholder="e.g. Thomas"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c080b] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-300">
                      Partner's First Name
                    </label>
                    <input
                      type="text"
                      value={simPartnerName}
                      onChange={(e) => setSimPartnerName(e.target.value)}
                      placeholder="e.g. Deborah"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c080b] border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Generated Couple Preview Card */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d090c] border border-rose-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {simMyName.charAt(0).toUpperCase() || 'U'} &amp;{' '}
                      {simPartnerName.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{simMyName || 'You'} &amp; {simPartnerName || 'Partner'}</span>
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                        Pair Code: <strong className="font-mono text-rose-500">{simPairCode}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                    >
                      {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEnterAuth}
                      className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Claim Space
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[390px] rounded-[44px] bg-gradient-to-b from-rose-400/20 via-pink-500/10 to-transparent dark:from-rose-500/25 dark:via-[#2b1625]/60 dark:to-[#120a10] p-4 sm:p-5 shadow-2xl border border-rose-200/80 dark:border-rose-500/30 relative">
                {/* Title */}
                <div className="text-center pb-3">
                  <h3 className="text-base sm:text-lg font-bold font-fraunces text-slate-900 dark:text-white">
                    Live Couple Sanctuary
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Touch any tab to interact live
                  </p>
                </div>

                {/* iPhone Body */}
                <div className="w-full rounded-[38px] bg-white dark:bg-[#0c080b] border-[6px] border-slate-200 dark:border-[#1e131b] overflow-hidden shadow-2xl flex flex-col min-h-[580px] relative">
                  {/* Status Bar */}
                  <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-neutral-300">
                    <span>9:41</span>
                    <div className="w-20 h-5 bg-slate-900 dark:bg-black rounded-full border border-slate-700 dark:border-neutral-800 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-slate-400 dark:border-neutral-300 rounded-xs p-0.5">
                        <div className="w-full h-full bg-slate-800 dark:bg-neutral-200" />
                      </div>
                    </div>
                  </div>

                  {/* Inside Screen */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    {/* Couple Profile Pill */}
                    <div className="flex items-center justify-between bg-rose-50/70 dark:bg-[#190f17] p-2.5 rounded-2xl border border-rose-100 dark:border-white/5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                          {simMyName.charAt(0) || 'T'}&amp;{simPartnerName.charAt(0) || 'D'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {simMyName} &amp; {simPartnerName}{' '}
                            <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400">
                            Together for 110 days
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-400">
                        <MessageCircle className="w-3.5 h-3.5 hover:text-rose-500 cursor-pointer" />
                        <Bell className="w-3.5 h-3.5 hover:text-rose-500 cursor-pointer" />
                      </div>
                    </div>

                    {/* Daily Streak Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-amber-500/10 border border-rose-200 dark:border-rose-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-300 tracking-wider">
                            Daily intimacy streak
                          </div>
                          <div className="text-xl font-extrabold font-fraunces text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                            293 Days
                          </div>
                        </div>
                        <span className="text-[10px] text-rose-600 dark:text-rose-200 font-semibold bg-rose-500/15 px-2 py-0.5 rounded-full">
                          On fire! 🔥
                        </span>
                      </div>
                    </div>

                    {/* Interactive Mockup Tabs */}
                    <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-[#150f14] p-1 rounded-xl border border-slate-200 dark:border-white/5 text-[10px] font-bold text-center">
                      {[
                        { id: 'daily', label: 'Prompt' },
                        { id: 'pet', label: 'Fox 🦊' },
                        { id: 'chat', label: 'Whisper' },
                        { id: 'doodle', label: 'Doodle 🎨' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMockupTab(t.id as any)}
                          className={`py-1 rounded-lg transition-all cursor-pointer ${
                            mockupTab === t.id
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* TAB: DAILY PROMPT */}
                    {mockupTab === 'daily' && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-2 text-left">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Double-Blind Daily Question
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white font-fraunces">
                          "What is your dream spontaneous date night together? 🌙"
                        </p>
                        {mockupAnswerSubmitted ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                            <span>Answers revealed simultaneously! 💕</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={mockupAnswer}
                              onChange={(e) => setMockupAnswer(e.target.value)}
                              placeholder="Type your secret answer..."
                              className="w-full bg-white dark:bg-[#0d090c] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setMockupAnswerSubmitted(true);
                                confetti({ particleCount: 20, spread: 35, origin: { y: 0.6 } });
                              }}
                              className="w-full py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Lock In Answer 🔑
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: VIRTUAL PET MOCHI */}
                    {mockupTab === 'pet' && (
                      <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-2 text-center">
                        <div className="text-3xl animate-bounce">🦊</div>
                        <div className="text-xs font-bold font-fraunces text-slate-900 dark:text-white">
                          Mochi the Couple Fox (LVL 4)
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400">
                          Affection: {showcasePetLove}% • Happy and purring softly!
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowcasePetLove((prev) => Math.min(100, prev + 4));
                              confetti({ particleCount: 15, spread: 30, origin: { y: 0.6 } });
                            }}
                            className="py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                          >
                            🍖 Feed Berry
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowcasePetLove((prev) => Math.min(100, prev + 3));
                              confetti({ particleCount: 15, spread: 30, origin: { y: 0.6 } });
                            }}
                            className="py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-600 dark:text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                          >
                            ❤️ Pet Mochi
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB: WHISPER CHAT */}
                    {mockupTab === 'chat' && (
                      <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-1.5 text-[11px]">
                        <div className="p-2 rounded-xl bg-white dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-100 dark:border-transparent">
                          {simPartnerName || 'Partner'}: "Can't wait to see you tonight my love ❤️"
                        </div>
                        <div className="p-2 rounded-xl bg-rose-500 text-white font-medium text-right shadow-xs">
                          {simMyName || 'You'}: "Counting down the minutes! Sent you a doodle 🎨"
                        </div>
                      </div>
                    )}

                    {/* TAB: DOODLE */}
                    {mockupTab === 'doodle' && (
                      <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-2 text-center">
                        <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                          Real-time Collaborative Drawing
                        </div>
                        <div className="h-16 rounded-xl bg-white dark:bg-[#0c080b] border border-dashed border-rose-200 dark:border-white/10 flex items-center justify-center">
                          <span className="text-2xl animate-pulse">💖 ✨ ✍️</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            confetti({ particleCount: 25, spread: 40, origin: { y: 0.6 } });
                          }}
                          className="w-full py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Send Doodle Heart to Chat
                        </button>
                      </div>
                    )}

                    {/* Bottom Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#160f14] border border-slate-100 dark:border-white/5">
                        <div className="text-[9px] text-slate-400 dark:text-neutral-400">Milestone</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">110 Days In Love</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#160f14] border border-slate-100 dark:border-white/5">
                        <div className="text-[9px] text-slate-400 dark:text-neutral-400">Security</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Encrypted</div>
                      </div>
                    </div>
                  </div>

                  {/* iPhone Home Bar */}
                  <div className="pb-2 pt-1 flex justify-center">
                    <div className="w-28 h-1 bg-slate-400 dark:bg-neutral-700 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRICS & TRUST BAR */}
      <section className="py-10 border-y border-rose-100 dark:border-white/10 bg-white/60 dark:bg-[#110b10]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-fraunces text-rose-500">
                12 Core
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400">
                Couples Features Built-in
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-fraunces text-rose-500">
                7 Games
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400">
                Live Multiplayer & Dilemmas
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-fraunces text-rose-500">
                1000+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400">
                Deep Prompts & Starters
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-fraunces text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-neutral-400">
                Private Couple RLS Isolation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPREHENSIVE 12 FEATURES SHOWCASE */}
      <section id="features" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Everything You Need For Your Bond</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              12 Complete Features Designed For Couples
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed">
              No generic tools or social feeds. Every single mechanic in ShoonaConnect was built from the ground up to nurture romantic closeness, playful shared memories, and emotional security.
            </p>
          </div>

          {/* Interactive Feature Explorer Box */}
          <div className="rounded-3xl bg-white dark:bg-[#120a10] border border-rose-100 dark:border-white/10 p-5 sm:p-8 shadow-xl">
            {/* Feature Tabs Horizontal Scroller */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-rose-100 dark:border-white/10 text-xs font-bold">
              {[
                { id: 'chat', label: '1. Chat & Doodles 🎨' },
                { id: 'games', label: '2. 7 Couples Games 🎮' },
                { id: 'pet', label: '3. Fox Companion 🦊' },
                { id: 'countdown', label: '4. Milestones & Clock 🔔' },
                { id: 'questions', label: '5. Daily Questions 💭' },
                { id: 'letters', label: '6. Wax Love Letters ✉️' },
                { id: 'goals', label: '7. Bucket List & Goals 🗺️' },
                { id: 'vault', label: '8. Memories Vault 🔒' },
                { id: 'cycle', label: '9. Cycle & Empathy Care 🌸' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                    showcaseTab === tab.id
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Details Display */}
            <div className="pt-8">
              {/* TAB 1: CHAT & CREATIVE EXPRESSIONS */}
              {showcaseTab === 'chat' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Realtime Couple Chat & Multimedia
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Doodles, Voice Notes, Mood Pulses & Empathy Hugs
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Send drawings in real-time with Neon Glow and Calligraphy brushes. Tap into daily emotional check-ins, send haptic heartbeat hugs that gently pulse, schedule Time Capsules, or trigger spontaneous date sparks.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-500" />
                        <span>Interactive drawing studio with instant "Doodle Back" replay cards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-500" />
                        <span>Wax-sealed love note envelopes that crack open with confetti</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-500" />
                        <span>Double-check delivery status with typing indicators & heart read-receipts</span>
                      </li>
                    </ul>
                    <button
                      type="button"
                      onClick={handleEnterAuth}
                      className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-all cursor-pointer shadow-sm"
                    >
                      Try Real-Time Chat Free
                    </button>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>Live Drawing Preview</span>
                      <span className="text-rose-500">Neon Glow Active</span>
                    </div>
                    <div className="h-44 rounded-2xl bg-slate-900 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden shadow-inner">
                      <div className="text-4xl animate-pulse select-none">🎨 💕 ✨</div>
                      <span className="text-xs text-rose-300 font-mono mt-2">
                        "Meet me at the cafe at 6pm? ☕"
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
                      <span>Simulated Touch Canvas</span>
                      <span className="text-emerald-500 font-bold">Zero Latency Sync</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COUPLES GAMES */}
              {showcaseTab === 'games' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      7 Handcrafted Games
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Multiplayer Chess, Tic-Tac-Toe, Trivia & Dilemmas
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Stay playful with 7 couple-specific games. Challenge each other to full timed Chess matches, test how well you know each other's childhood dreams, or reveal scandalous Never Have I Ever answers.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        ♟️ Live Realtime Chess
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        ⭕ Live Tic-Tac-Toe
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        🤥 Would You Rather (1000+)
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        💡 How Well Do You Know Me
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 text-center space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-fraunces">
                      Play Live Tic-Tac-Toe Demo
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {showcaseTttWinner
                        ? showcaseTttWinner === 'draw'
                          ? "It's a draw! 🤝"
                          : `Player ${showcaseTttWinner} Won! 🎉`
                        : `Current Turn: Player ${showcaseTttTurn}`}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 max-w-[190px] mx-auto">
                      {showcaseTttGrid.map((val, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleShowcaseTttClick(idx)}
                          className={`w-14 h-14 rounded-xl border flex items-center justify-center text-lg font-black font-mono transition-all active:scale-95 cursor-pointer ${
                            val === 'X'
                              ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                              : val === 'O'
                              ? 'bg-purple-500/15 border-purple-500 text-purple-500'
                              : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-transparent'
                          }`}
                        >
                          {val || '-'}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={resetShowcaseTtt}
                      className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-rose-500"
                    >
                      Reset Board
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: VIRTUAL FOX PET MOCHI */}
              {showcaseTab === 'pet' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Shared Virtual Companion
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Raise Your Couple Fox Together
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Adopt Mochi, a shared pet that lives on your home screen. When one partner feeds him berries or plays fetch, both partners share the joy and gain joint relationship experience points.
                    </p>
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-xs text-slate-700 dark:text-neutral-300 space-y-1">
                      <div className="font-bold text-rose-600 dark:text-rose-400">Cooperative Care:</div>
                      <p>If you're busy at work, your partner can pet Mochi to keep your relationship streak active.</p>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 text-center space-y-4">
                    <div className="text-5xl animate-bounce">🦊</div>
                    <h4 className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">
                      Mochi (Level 4 Companion)
                    </h4>
                    <div className="max-w-xs mx-auto space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-neutral-400">
                        <span>Affection Gauge</span>
                        <span>{showcasePetLove}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${showcasePetLove}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowcasePetLove((p) => Math.min(100, p + 5));
                          confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
                        }}
                        className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        🍖 Feed Snack
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowcasePetLove((p) => Math.min(100, p + 3));
                          confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
                        }}
                        className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        ❤️ Pet Mochi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: COUNTDOWNS & MILESTONE CLOCK */}
              {showcaseTab === 'countdown' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Down-to-the-Millisecond Precision
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Ticking Anniversaries & Celebration Hub
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Never forget an anniversary or upcoming flight again. Countdowns track days, hours, minutes, seconds, and milliseconds with celebratory confetti when the clock strikes zero.
                    </p>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-neutral-300">
                      📅 Auto-calculates exact days, weeks, and total hours together since your first "Hello".
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 text-center space-y-5">
                    <div className="text-xs font-bold uppercase text-rose-500 tracking-wider">
                      Upcoming 1-Year Milestone
                    </div>
                    <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto">
                      {[
                        { label: 'Days', val: 184 },
                        { label: 'Hours', val: 12 },
                        { label: 'Mins', val: 45 },
                        { label: 'Secs', val: 23 },
                        { label: 'Ms', val: showcaseMs },
                      ].map((c, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#0c080b] border border-slate-200 dark:border-white/10">
                          <div className={`text-base sm:text-xl font-mono font-black ${c.label === 'Ms' || c.label === 'Secs' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                            {c.label === 'Ms' ? String(c.val).padStart(3, '0') : String(c.val).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] uppercase font-bold text-slate-400 mt-1">{c.label}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      Ticking in real-time on both partner devices simultaneously.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 5: DOUBLE-BLIND QUESTIONS */}
              {showcaseTab === 'questions' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Synchronized Intimacy
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Double-Blind Daily Questions
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Every morning, receive a fresh thought-provoking prompt. Your partner cannot read your response until they have typed theirs too. Once both submit, your answers unlock simultaneously!
                    </p>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-3">
                    <div className="text-[10px] font-bold text-rose-500 uppercase">Today's Prompt</div>
                    <div className="text-sm font-bold font-fraunces text-slate-900 dark:text-white">
                      "Where is your favorite hidden spot in the city with me?"
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0c080b] border border-rose-200 dark:border-white/10">
                        <span className="text-[9px] font-bold text-rose-500 block">YOU</span>
                        <span className="italic font-medium text-slate-700 dark:text-neutral-200">
                          "That rooftop overlooking the bridge at twilight."
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0c080b] border border-purple-200 dark:border-white/10">
                        <span className="text-[9px] font-bold text-purple-500 block">PARTNER</span>
                        <span className="italic font-medium text-slate-700 dark:text-neutral-200">
                          "The bench under the willow tree by the lake!"
                        </span>
                      </div>
                    </div>
                    <div className="text-center pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Synced! 294-day couple streak unlocked!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: WAX LOVE LETTERS */}
              {showcaseTab === 'letters' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Time-Locked Future Letters
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Golden Wax-Sealed Anticipation
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Write heartfelt letters to be opened months or years into the future. Each letter is marked with a real golden wax seal stamp that remains locked until the exact anniversary date arrives.
                    </p>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-amber-50/50 dark:bg-[#190f17] border border-amber-200 dark:border-white/10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center text-2xl mx-auto shadow-lg shadow-amber-500/20">
                      💌
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                        "For Our 5th Anniversary"
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        Sealed under golden wax • Opens automatically on Oct 14, 2027
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-amber-200 dark:border-white/10 text-xs text-slate-600 dark:text-neutral-300 italic">
                      "I wrote this during our rainy trip to Kyoto... I hope five years later we are reading this together with a smile."
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: BUCKET LIST & GOALS */}
              {showcaseTab === 'goals' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Shared Aspirations & Dreams
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Bucket List & Vision Board for 2
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Plan trips, future home ideas, and bucket list milestones together. Check off completed adventures, upload proof polaroids, and watch your joint achievement meter grow.
                    </p>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-2.5">
                    {[
                      { text: 'See Northern Lights in Tromsø 🌌', done: true },
                      { text: 'Adopt a rescue puppy together 🐶', done: true },
                      { text: 'Take a cooking masterclass in Tuscany 🍝', done: false },
                      { text: 'Buy our dream sunny plant-filled apartment 🌿', done: false },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                          item.done
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 line-through'
                            : 'bg-white dark:bg-[#0c080b] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white'
                        }`}
                      >
                        <span>{item.text}</span>
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="text-[10px] text-slate-400">In Progress</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: ENCRYPTED VAULT */}
              {showcaseTab === 'vault' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      100% Isolated Keepsake
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Secret Memories Vault & Scrapbook
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Store high-resolution photos, anniversary polaroids, and intimate notes safely. Protected by Row-Level Security, only you and your partner can ever decrypt or view these assets.
                    </p>
                    <button
                      type="button"
                      onClick={addSimulatedVaultPhoto}
                      className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold cursor-pointer hover:bg-rose-600"
                    >
                      + Add Simulated Polaroid 📸
                    </button>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      {vaultPhotos.slice(0, 2).map((photo) => (
                        <div key={photo.id} className="bg-white p-2 rounded-xl shadow-md border border-slate-200">
                          <img
                            src={photo.src}
                            alt={photo.caption}
                            className="w-full h-24 object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[10px] font-bold text-slate-800 mt-2 truncate">{photo.caption}</p>
                          <span className="text-[8px] text-slate-400">{photo.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: CYCLE & EMPATHY CARE */}
              {showcaseTab === 'cycle' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4 text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                      Intimate Health & Care
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold font-fraunces text-slate-900 dark:text-white">
                      Cycle Tracking with Partner Empathy Guide
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                      Empower your partner to understand cycle phases, moods, and energy levels without awkward explanations. ShoonaConnect provides empathetic care recommendations (warm heating pad, chocolate, gentle reassurance).
                    </p>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-2xl bg-rose-50/50 dark:bg-[#190f17] border border-rose-100 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-500">
                      <span>Luteal Phase (Day 22)</span>
                      <span>🌸 Empathy Alert</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c080b] border border-rose-200 dark:border-white/10 text-xs text-slate-700 dark:text-neutral-300 space-y-1 text-left">
                      <div className="font-bold text-rose-600">Partner Care Tip Today:</div>
                      <p>Energy may feel lower this evening. Surprise her with her favorite herbal tea, run a warm bath, and give a gentle shoulder massage.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLAYABLE GAMES LOUNGE SECTION */}
      <section id="games" className="py-24 border-y border-rose-100 dark:border-white/10 bg-rose-50/40 dark:bg-[#110a10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest">
              GAMES LOUNGE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              7 Game Types, 1000+ Questions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed">
              Test your chemistry, discover new quirks, and spark laughter whether sitting side-by-side on the sofa or separated by continents.
            </p>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { id: 'wyr', emoji: '🤥', title: 'Would You Rather', sub: 'Hilarious & romantic dilemmas', playable: true },
              { id: 'chess', emoji: '♟️', title: 'Couples Chess Duel', sub: 'Real-time timed matches', playable: false },
              { id: 'nhie', emoji: '🙈', title: 'Never Have I Ever', sub: 'Playful secret confessions', playable: true },
              { id: 'how-well', emoji: '💡', title: 'How Well Do You Know Me', sub: 'Partner knowledge quiz', playable: false },
              { id: 'trivia', emoji: '🧠', title: 'Relationship Trivia', sub: 'Memory checks on your firsts', playable: false },
              { id: 'starters', emoji: '💬', title: 'Conversation Starters', sub: 'Deep & meaningful intimacy', playable: true },
            ].map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (game.playable) {
                    setActiveMiniGame(activeMiniGame === game.id ? null : game.id);
                  }
                }}
                className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMiniGame === game.id
                    ? 'border-rose-500 bg-white dark:bg-[#1a1018] shadow-xl shadow-rose-500/15'
                    : 'border-rose-100 dark:border-white/5 bg-white dark:bg-[#160f14] hover:border-rose-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl">{game.emoji}</span>
                  <div>
                    <h4 className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">
                      {game.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">{game.sub}</p>
                  </div>
                </div>

                {game.playable ? (
                  <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
                    {activeMiniGame === game.id ? 'Close' : 'Try Live'}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Multiplayer</span>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Playable Sandbox in Games Section */}
          {activeMiniGame && (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#170e15] border border-rose-300 dark:border-rose-500/30 shadow-xl max-w-2xl mx-auto space-y-6">
              {activeMiniGame === 'wyr' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                    Would You Rather Demo
                  </span>
                  <h3 className="text-xl font-bold font-fraunces text-slate-900 dark:text-white">
                    Pick your romantic preference!
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWyrSelection('a');
                        confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
                      }}
                      className={`p-5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        wyrSelection === 'a'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-slate-50 dark:bg-[#120a10] border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      A. Midnight stargazing on an isolated beach blanket 🌊
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWyrSelection('b');
                        confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
                      }}
                      className={`p-5 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                        wyrSelection === 'b'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-slate-50 dark:bg-[#120a10] border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-200'
                      }`}
                    >
                      B. Cozy snowy cabin watching movies by a fireplace ❄️
                    </button>
                  </div>
                  {wyrSelection && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-2">
                      Answer recorded! When your partner answers in the sanctuary, it reveals both choices together 💕
                    </p>
                  )}
                </div>
              )}

              {activeMiniGame === 'nhie' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                    Never Have I Ever Demo
                  </span>
                  <p className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">
                    "Never have I ever re-read our old text messages late at night just to smile."
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNhieChoice('have');
                        confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold cursor-pointer"
                    >
                      🙈 I Definitely Have!
                    </button>
                    <button
                      type="button"
                      onClick={() => setNhieChoice('never')}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-xs font-bold cursor-pointer"
                    >
                      😇 Never
                    </button>
                  </div>
                </div>
              )}

              {activeMiniGame === 'starters' && (
                <div className="space-y-4 text-center">
                  <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                    Conversation Card
                  </span>
                  <p className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">
                    "{sampleStarters[activePromptIndex % sampleStarters.length]}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePromptIndex((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/20 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Shuffle className="w-3.5 h-3.5" /> Next Card
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 6. HOW IT WORKS: GET STARTED IN 60 SECONDS */}
      <section id="how-it-works" className="py-24 sm:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest">
              EASY ONBOARDING
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              Up and running in 60 seconds
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed">
              No complicated setups, no app store hurdles. Just a fast, romantic 3-step connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Sanctuary',
                desc: 'Sign up for free in 15 seconds with your email and chosen couple nickname. No credit card or app installation required.',
              },
              {
                step: '2',
                title: 'Share Secret 4-Digit Code',
                desc: 'Generate your private couple code. Send it via WhatsApp, SMS, or Messenger. When your partner inputs it, your worlds merge.',
              },
              {
                step: '3',
                title: 'Grow Together Forever',
                desc: 'Start answering daily questions, raising Mochi, playing games, and building an encrypted vault of memories that last a lifetime.',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 shadow-lg"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold font-fraunces shadow-md shadow-rose-500/25">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold font-fraunces text-slate-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleEnterAuth}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-500/25 hover:brightness-110 cursor-pointer active:scale-95"
            >
              Get Started Now (Free)
            </button>
          </div>
        </div>
      </section>

      {/* 7. UNCOMPROMISING PRIVACY & LEGAL SECURITY (USER REQUEST HIGHLIGHT) */}
      <section id="privacy" className="py-24 border-y border-rose-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#110a10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Uncompromising Privacy & Legal Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              Your Intimacy Deserves Ironclad Protection
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 leading-relaxed">
              We believe a relationship app must be a vault, not an advertising channel. Here is our legally binding guarantee to you and your partner.
            </p>
          </div>

          {/* 4 Core Legal Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                Row-Level Security (RLS)
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Database-enforced isolation. Only the two verified partner user IDs mapped to your sanctuary can read or write data. No outside user can ever query your messages.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <EyeOff className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                Zero Ads & Zero Data Selling
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                We never monetize your intimacy, sell browsing patterns to data brokers, or train advertising models on your love letters. Ever.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                Hardware & Passcode Lock
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Add an optional 4-digit screen lock to prevent nosy friends or family from peeking if they borrow your phone.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                Right to be Forgotten
              </h4>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                Export your memories at any time. If you ever dissolve your couple space, all associated messages, photos, and records are permanently expunged.
              </p>
            </div>
          </div>

          {/* Legal Quick Links Card with Direct Modal Triggers */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#160f14] border border-emerald-200 dark:border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-bold font-fraunces text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <span>Read Full Legal Terms & Policy Documentation</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Certified GDPR, CCPA, and Zero-Knowledge Compliance documentation.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 font-bold text-xs border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => openLegal('security')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 font-bold text-xs border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
              >
                Security Specs
              </button>
              <button
                type="button"
                onClick={() => openLegal('dissolution')}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20 cursor-pointer transition-colors"
              >
                Dissolution Rules
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-widest">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300">
              Everything you need to know about ShoonaConnect.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What is ShoonaConnect?',
                a: 'ShoonaConnect is an intimate, private couples website crafted exclusively for two partners. Unlike public social media, it provides an ad-free, zero-algorithm environment with encrypted messaging, collaborative doodles, 7 couples games, daily prompts, virtual pet care, and shared memory scrapbooks.',
              },
              {
                q: 'Is ShoonaConnect free to use?',
                a: 'Yes, 100%! You can get started and use ShoonaConnect for free. A single shared sanctuary links both partners without payment or subscriptions.',
              },
              {
                q: 'How do my partner and I link together?',
                a: 'When you sign up, the website gives you a unique 4-digit pairing code (e.g. LOVE). Send this code to your partner. When they enter the code on their screen, your accounts link immediately and securely.',
              },
              {
                q: 'Is our data truly private?',
                a: 'Yes, absolutely. Database-enforced Row-Level Security (RLS) ensures that only the two authenticated partner accounts can read or write your shared messages, photos, and letters. We do not sell data, track you across the web, or serve advertisements.',
              },
              {
                q: 'Does it work on iPhone, Android, and Desktop computers?',
                a: 'Yes! ShoonaConnect runs in any modern browser without needing an app store download. You can install it as a Progressive Web App (PWA) to your home screen on iOS and Android for full-screen native performance.',
              },
              {
                q: 'Does it work for Long Distance Relationships (LDR)?',
                a: 'ShoonaConnect is cherished by thousands of long-distance couples. Features like real-time doodles, time-zone syncing, scheduled future love letters, and shared virtual pet care keep you feeling close no matter how many miles separate you.',
              },
              {
                q: 'What happens if a couple breaks up?',
                a: 'We provide a respectful dissolution protocol inspired by Gottman communication principles. Partners can enter a quiet discussion room, export their memories during a grace window, or request an irrevocable data purge that permanently deletes the couple records.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#160f14] border border-rose-100 dark:border-white/5 overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-rose-50/50 dark:hover:bg-white/5 transition-all"
                  >
                    <span className="text-base font-bold font-fraunces text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span
                      className={`text-xl font-bold transition-transform text-rose-500 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-slate-600 dark:text-neutral-300 leading-relaxed border-t border-rose-100 dark:border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8.5. MEET THE CREATOR & ARCHITECTURE */}
      <section id="creator" className="py-20 bg-gradient-to-b from-rose-50/50 via-white to-pink-50/40 dark:from-[#0f0a14] dark:via-[#130d1a] dark:to-[#0a070f] border-t border-rose-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Crafted with Purpose & Passion
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
              Meet the Creator &amp; System Architect
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Behind ShoonaConnect is an uncompromising philosophy: a private sanctuary for couples should be free of algorithmic feeds, ad trackers, and data harvesting.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Creator Profile Card */}
            <div className="lg:col-span-5 relative">
              <div className="p-8 rounded-3xl bg-white dark:bg-[#181122] border border-rose-100 dark:border-white/10 shadow-xl space-y-6 text-center sm:text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-500/20 to-transparent rounded-bl-full pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/30">
                      <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-extrabold text-2xl font-fraunces">
                        A
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px]" title="Active Architect">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-fraunces">
                      Aniruddha
                    </h3>
                    <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                      Founder, Creator &amp; Lead Architect
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 justify-center sm:justify-start">
                      <Mail className="w-3 h-3 text-rose-400" />
                      <span>kamitronaniruddha@gmail.com</span>
                    </p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 space-y-3 leading-relaxed">
                  <p>
                    "I built ShoonaConnect to solve a fundamental modern problem: couples are surrounded by social apps engineered for public validation and endless scrolling. We needed a digital sanctuary exclusively meant for two people."
                  </p>
                  <p>
                    "Every feature—from timelocked letters to 69 relationship achievement badges and zero-knowledge mutual breakup protocols—is designed to deepen intimacy and preserve your love story forever."
                  </p>
                </div>

                <div className="pt-4 border-t border-rose-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Administrative Governance
                  </span>
                  <a
                    href="mailto:kamitronaniruddha@gmail.com"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Creator</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-rose-100 dark:border-white/10 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Zero-Knowledge Isolation
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Supabase Row-Level Security ensures that only the two paired partners in a couple can decrypt and read messages, memories, and sealed letters.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-rose-100 dark:border-white/10 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Broadcast Engine
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Websocket channels power instant messages, live drawing canvas sync, audio voice note streaming, and turn-based games in milliseconds.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-rose-100 dark:border-white/10 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Permanent Relational Journal
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  Even during relationship transitions, memories and love letters are preserved in a secure archive for mutual reconnection or safe export.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-rose-100 dark:border-white/10 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  100% Ad-Free &amp; Pure
                </h4>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  No advertisements, no algorithmic feeds, no data broking. A pure, clean space built with uncompromising respect for relationship privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL BOTTOM CALL TO ACTION */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-transparent via-rose-500/10 to-rose-500/20 dark:via-rose-500/5 dark:to-[#160f14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 mx-auto flex items-center justify-center p-0.5 shadow-2xl shadow-rose-500/30">
            <div className="w-full h-full bg-white dark:bg-[#160f14] rounded-[22px] flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold font-fraunces text-slate-900 dark:text-white tracking-tight">
            Ready to bring your relationship{' '}
            <span className="text-rose-500 italic">closer?</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-neutral-300 max-w-xl mx-auto">
            Join thousands of couples cultivating everyday romance, playing fun games, and celebrating milestones together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleEnterAuth}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 text-white font-bold text-base shadow-xl shadow-rose-500/30 transition-all cursor-pointer active:scale-95"
            >
              Create Our Couple Sanctuary Free
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER WITH LEGAL LINKS */}
      <footer className="py-16 border-t border-rose-100 dark:border-white/10 bg-white dark:bg-[#090608]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand */}
            <div className="md:col-span-6 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white dark:bg-[#120a10] rounded-[10px] flex items-center justify-center">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  </div>
                </div>
                <span className="text-xl font-extrabold font-fraunces text-slate-900 dark:text-white">
                  Shoona<span className="text-rose-500">Connect</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md leading-relaxed">
                The private couples sanctuary website that brings you closer every day. Daily questions, games, memories, plans &amp; more for every device.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-3 space-y-3 text-left">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-300">
                EXPLORE
              </h5>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-400">
                <li>
                  <a href="#get-started" className="hover:text-rose-500 transition-colors">
                    Get Started Free
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-rose-500 transition-colors">
                    All 12 Features
                  </a>
                </li>
                <li>
                  <a href="#games" className="hover:text-rose-500 transition-colors">
                    7 Couples Games
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-rose-500 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#creator" className="hover:text-rose-500 transition-colors flex items-center gap-1.5 font-medium text-rose-500/90 dark:text-rose-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Meet the Creator</span>
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-rose-500 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-3 space-y-3 text-left">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-neutral-300">
                LEGAL &amp; PRIVACY
              </h5>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-400">
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('privacy')}
                    className="hover:text-rose-500 transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('terms')}
                    className="hover:text-rose-500 transition-colors cursor-pointer text-left"
                  >
                    Terms &amp; Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('security')}
                    className="hover:text-rose-500 transition-colors cursor-pointer text-left"
                  >
                    Security &amp; RLS Architecture
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('dissolution')}
                    className="hover:text-rose-500 transition-colors cursor-pointer text-left"
                  >
                    Mutual Dissolution Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-rose-100 dark:border-white/10 text-xs text-slate-500 dark:text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>© 2026 ShoonaConnect. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Zero-Knowledge Row-Level Security</span>
              <span>•</span>
              <span>Crafted with love for couples worldwide</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 11. INTERACTIVE LEGAL & PRIVACY MODAL */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />
    </div>
  );
};
