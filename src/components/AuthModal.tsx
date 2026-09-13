import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Heart,
  ShieldCheck,
  Moon,
  Sun,
  Lock,
  Mail,
  KeyRound,
  User,
  AtSign,
  Database,
  Settings,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Gamepad2,
  Camera,
  MessageCircleHeart,
  Shield,
  Crown,
  Check,
  Smile,
  Quote,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { SupabaseConnectModal } from './SupabaseConnectModal';
import { LegalModal, LegalTab } from './LegalModal';
import { getSystemAccessControl, subscribeToSystemAccessControl } from '../lib/systemSettings';
import { SystemAccessControl, isAdminEmail, ADMIN_EMAIL } from '../types';

type AuthMode = 'login' | 'signup' | 'forgot_password' | 'reset_password';

interface AuthModalProps {
  onBackToLanding?: () => void;
}

const ROMANTIC_QUOTES = [
  { text: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.', author: 'Maya Angelou' },
  { text: 'Whatever our souls are made of, yours and mine are identical.', author: 'Emily Brontë' },
  { text: 'Two hearts, one private frequency that no one else can hear.', author: 'ShoonaConnect Sanctuary' },
  { text: 'I would find you in any lifetime, in any universe, under any stars.', author: 'Eternal Lovers' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ onBackToLanding }) => {
  const {
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    updatePassword,
    isPasswordRecovery,
    clearPasswordRecovery,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');
  const [accessControl, setAccessControl] = useState<SystemAccessControl>(getSystemAccessControl());

  // Visual enhancements states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'non_binary' | 'other'>('female');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [showQuickFillDrawer, setShowQuickFillDrawer] = useState(false);

  // Form input states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Auto-cycle quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % ROMANTIC_QUOTES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to live access control changes (lockdown or auth disabled)
  useEffect(() => {
    const unsub = subscribeToSystemAccessControl((newSettings) => {
      setAccessControl(newSettings);
    });
    return unsub;
  }, []);

  // Password Recovery detection
  useEffect(() => {
    if (isPasswordRecovery) {
      setAuthMode('reset_password');
    }
  }, [isPasswordRecovery]);

  const resetFormState = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const isAccessAdmin = isAdminEmail(email.trim());

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const passStrength = getPasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 1:
        return { label: 'Gentle (Fair)', color: 'bg-amber-400', text: 'text-amber-500' };
      case 2:
        return { label: 'Good', color: 'bg-emerald-400', text: 'text-emerald-500' };
      case 3:
        return { label: 'Strong', color: 'bg-rose-500', text: 'text-rose-500' };
      case 4:
        return { label: 'Love Shield (Unbreakable)', color: 'bg-gradient-to-r from-rose-500 to-pink-500', text: 'text-rose-500' };
      default:
        return { label: 'Too short (min 6)', color: 'bg-slate-300 dark:bg-slate-700', text: 'text-slate-400' };
    }
  };

  const strengthInfo = getStrengthLabel(passStrength);

  // Quick fill helper for testing & admin
  const applyQuickFill = (type: 'thomas' | 'deborah' | 'admin') => {
    resetFormState();
    if (type === 'admin') {
      setEmail(ADMIN_EMAIL);
      setPassword('admin123456');
      if (authMode === 'signup') {
        setUsername('aniruddha');
        setDisplayName('Aniruddha (Architect)');
        setConfirmPassword('admin123456');
        setSelectedGender('male');
      }
    } else if (type === 'thomas') {
      setEmail('thomas@shoona.love');
      setPassword('lovers1234');
      if (authMode === 'signup') {
        setUsername('thomas_soul');
        setDisplayName('Thomas');
        setConfirmPassword('lovers1234');
        setSelectedGender('male');
      }
    } else if (type === 'deborah') {
      setEmail('deborah@shoona.love');
      setPassword('lovers1234');
      if (authMode === 'signup') {
        setUsername('deborah_heart');
        setDisplayName('Deborah');
        setConfirmPassword('lovers1234');
        setSelectedGender('female');
      }
    }
    setShowQuickFillDrawer(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    // Check if all auth is turned off by Administrator
    if (accessControl.authStatus === 'disable_all_auth' && !isAccessAdmin) {
      setError(
        'User sign-in and login have been turned off by Administrator (Aniruddha). Only the super admin may authenticate at this time.'
      );
      return;
    }

    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    // Check if sign-ups are paused or all auth disabled
    if (accessControl.authStatus === 'disable_signups' || accessControl.authStatus === 'disable_all_auth') {
      setError(
        'New user sign-ups are currently turned off by Administrator (Aniruddha). Registration is paused.'
      );
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters long (letters, numbers, underscores, dashes, dots).');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype carefully.');
      return;
    }

    setLoading(true);
    try {
      // Save selected gender in localStorage so profile picks it up instantly upon first sync
      try {
        localStorage.setItem('shoona_pending_gender', selectedGender);
      } catch (e) {
        // ignore storage errors
      }

      await signUpWithPassword(email.trim(), password, cleanUsername, displayName.trim() || cleanUsername);
    } catch (err: any) {
      setError(err?.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim()) {
      setError('Please enter your email address to receive a recovery link.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setSuccessMessage('Password reset link sent! Please check your inbox and follow the instructions.');
    } catch (err: any) {
      setError(err?.message || 'Unable to send recovery email. Please check the email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!password || password.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccessMessage('Password updated successfully! Welcome back to your sanctuary.');
      clearPasswordRecovery();
      setAuthMode('login');
    } catch (err: any) {
      setError(err?.message || 'Unable to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-slate-50 dark:from-[#060408] dark:via-[#0c0812] dark:to-[#060408] text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-500">
      {/* Ambient glowing background aura orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-rose-500/15 to-pink-500/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-purple-600/10 to-rose-500/15 blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-radial from-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Floating starry dust & romantic particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Top Floating Controls Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-3 mb-6 sm:mb-8 relative z-10">
        {/* Left: Back to Landing / Logo */}
        <div className="flex items-center gap-2">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-rose-200/50 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sanctuary</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight font-display text-slate-900 dark:text-white">
                Shoona<span className="text-rose-500">Connect</span>
              </span>
              <span className="text-[10px] block text-rose-500/80 font-medium">Sacred Couple Sanctum</span>
            </div>
          </div>
        </div>

        {/* Right: DB Status + Quick Theme Switcher */}
        <div className="flex items-center gap-2">
          {/* Quick Fill Menu Toggle */}
          <button
            onClick={() => setShowQuickFillDrawer(!showQuickFillDrawer)}
            type="button"
            className="px-2.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-rose-200/60 dark:border-slate-800 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Fast-Fill Demo & Admin Accounts"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
            <span className="hidden md:inline">Quick Fill</span>
          </button>

          {/* Supabase Database Settings Indicator */}
          <button
            id="btn-auth-supabase-config"
            type="button"
            onClick={() => setShowConnectModal(true)}
            aria-label="Supabase Database Settings"
            className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-emerald-200/60 dark:border-slate-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Supabase Database Health"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline font-mono text-[11px]">Supabase Live</span>
          </button>

          {/* Theme Switcher */}
          <button
            id="btn-auth-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-rose-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-500" />}
          </button>
        </div>
      </div>

      {/* Quick Fill Dropdown Drawer */}
      {showQuickFillDrawer && (
        <div className="w-full max-w-5xl mb-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-rose-200 dark:border-slate-700 shadow-xl relative z-20 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Instant Test &amp; Administrative Fast-Fill</span>
            </div>
            <button
              onClick={() => setShowQuickFillDrawer(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => applyQuickFill('thomas')}
              className="p-2.5 rounded-xl bg-rose-50 dark:bg-slate-800/80 border border-rose-200/60 dark:border-slate-700 hover:border-rose-500 text-left transition-all cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs">
                👦
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Thomas (Boyfriend)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">thomas@shoona.love</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => applyQuickFill('deborah')}
              className="p-2.5 rounded-xl bg-pink-50 dark:bg-slate-800/80 border border-pink-200/60 dark:border-slate-700 hover:border-pink-500 text-left transition-all cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold text-xs">
                👧
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Deborah (Girlfriend)</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">deborah@shoona.love</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => applyQuickFill('admin')}
              className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 hover:border-amber-500 text-left transition-all cursor-pointer flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold text-xs">
                👑
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <span>Aniruddha</span>
                  <span className="text-[9px] px-1 bg-amber-500 text-white rounded font-mono">Admin</span>
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 truncate max-w-[140px]">{ADMIN_EMAIL}</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Column Grand Sanctuary Card */}
      <div className="w-full max-w-5xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-rose-900/15 dark:shadow-black/70 border border-rose-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl transition-all duration-300">
        
        {/* LEFT COLUMN: Grand Visual Sanctuary Showcase (Desktop & Tablet) */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 sm:p-10 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-600/10 dark:from-rose-950/40 dark:via-purple-950/20 dark:to-slate-950 border-b lg:border-b-0 lg:border-r border-rose-200/40 dark:border-slate-800/80 relative overflow-hidden">
          
          {/* Subtle Shimmer top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-400 to-purple-500" />
          
          <div>
            {/* Romantic Emblem Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-300 shadow-xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Sanctuary by Aniruddha</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-romantic font-bold text-slate-900 dark:text-white leading-tight mb-3">
              Where Two Hearts Become One Digital Sanctum.
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
              An uncompromised private paradise built exclusively for you and your favorite person. Zero ads, zero corporate tracking, 100% sacred intimacy.
            </p>

            {/* Feature Mini-Tiles */}
            <div className="space-y-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700/60 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Wax-Sealed Love Letters</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Timelock future anniversary letters with voice memos &amp; polaroids.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700/60 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-pink-500 text-white shadow-xs">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Soul Pet &amp; Couple Arcade</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Feed your virtual pet, play real-time Chess &amp; answer daily questions.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700/60 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-500 text-white shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">PIN-Locked Secret Vault</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">End-to-end private photo albums, intimate notes &amp; memories.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Romantic Quote Widget */}
          <div className="mt-auto pt-6 border-t border-rose-200/50 dark:border-slate-800/80">
            <div className="relative p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-rose-200/50 dark:border-slate-700 shadow-sm">
              <Quote className="w-5 h-5 text-rose-400/40 absolute top-3 right-3" />
              <p className="text-xs italic text-slate-700 dark:text-slate-200 leading-relaxed font-serif pr-4">
                &ldquo;{ROMANTIC_QUOTES[activeQuoteIndex].text}&rdquo;
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-rose-500 font-semibold">
                <span>— {ROMANTIC_QUOTES[activeQuoteIndex].author}</span>
                <div className="flex gap-1">
                  {ROMANTIC_QUOTES.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${idx === activeQuoteIndex ? 'w-4 bg-rose-500' : 'w-1.5 bg-rose-200 dark:bg-slate-700'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                256-Bit SSL Sanctuary
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Private to Two
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form Console */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Mobile Romantic Emblem Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center mb-3">
              <div className="absolute inset-0 bg-rose-400/20 dark:bg-rose-500/20 rounded-full animate-ping opacity-40" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center">
                <Heart className="w-7 h-7 fill-white" />
              </div>
            </div>
            <h1 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white">
              {authMode === 'signup' ? 'Create Your Couple Sanctuary' : 'Enter Our Private Space'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
              A quiet, safe sanctuary created exclusively for you and your favorite person.
            </p>
          </div>

          {/* Desktop Title & Subtitle */}
          <div className="hidden lg:block mb-6 text-left">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white">
                {authMode === 'reset_password'
                  ? 'Reset Your Sanctuary Password'
                  : authMode === 'forgot_password'
                  ? 'Recover Sanctuary Access'
                  : authMode === 'signup'
                  ? 'Begin Our Forever Journey'
                  : 'Welcome Back, Lover'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {authMode === 'reset_password'
                ? 'Enter your new secure password below to regain full access to your sanctuary.'
                : authMode === 'forgot_password'
                ? 'Enter your registered email to receive an instant recovery link directly from Supabase.'
                : authMode === 'signup'
                ? 'Fill in your details below to create your private romantic sanctuary.'
                : 'Sign in to reconnect with your soulmate and access your shared memories.'}
            </p>
          </div>

          {/* Administrative Policy Alerts if restricted */}
          {accessControl.authStatus === 'disable_all_auth' && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 text-left flex items-start gap-2">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-bold block">Sign-in Turned Off by Admin (Aniruddha)</span>
                <span>General user login and sign-up are temporarily disabled. Only the platform architect ({ADMIN_EMAIL}) may sign in.</span>
              </div>
            </div>
          )}

          {accessControl.authStatus === 'disable_signups' && authMode === 'signup' && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <span className="font-bold block">New Registrations Paused</span>
                <span>Account creation is temporarily paused by Administrator (Aniruddha). Existing lovers may still sign in.</span>
              </div>
            </div>
          )}

          {/* Auth Mode Toggle Tabs (Only shown for Login / Signup) */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-semibold mb-5">
              <button
                id="tab-auth-login"
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <span>Sign In</span>
                {accessControl.authStatus === 'disable_all_auth' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 rounded font-mono">
                    Off
                  </span>
                )}
              </button>
              <button
                id="tab-auth-signup"
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  resetFormState();
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <span>Create Sanctuary</span>
                {(accessControl.authStatus === 'disable_signups' || accessControl.authStatus === 'disable_all_auth') && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 rounded font-mono">
                    Paused
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 text-left flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      resetFormState();
                    }}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Device Trust */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-400 border-slate-300 dark:border-slate-700"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Zero-Trace
                </span>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Our Private Space</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    resetFormState();
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  Create couple sanctuary
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unique Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-username"
                      type="text"
                      required
                      autoCapitalize="none"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      placeholder="e.g. sweetheart_99"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-displayname"
                      type="text"
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Persona / Gender Selection during Sign-up */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Identity in Sanctuary
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'female', label: 'Girlfriend', icon: '👧' },
                    { id: 'male', label: 'Boyfriend', icon: '👦' },
                    { id: 'non_binary', label: 'Soulmate', icon: '💜' },
                    { id: 'other', label: 'Custom', icon: '✨' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedGender(item.id as any)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                        selectedGender === item.id
                          ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-300 font-bold shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[11px] truncate w-full">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Strength Meter */}
              {password && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Security Strength:</span>
                    <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all ${
                          passStrength >= step ? strengthInfo.color : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className={password.length >= 6 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      ✓ Min 6 chars
                    </span>
                    {confirmPassword && (
                      <span className={password === confirmPassword ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500'}>
                        {password === confirmPassword ? '✓ Passwords Match' : '✗ Passwords Differ'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                id="btn-submit-signup"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Couple Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-slate-500 dark:text-slate-400">
                Already have a private sanctuary?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetFormState();
                  }}
                  className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                  />
                </div>
              </div>

              <button
                id="btn-submit-forgot"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    resetFormState();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {authMode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-slate-800 dark:text-slate-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-reset"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save New Password &amp; Enter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust Assurances */}
          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-slate-800/50 border border-rose-100/60 dark:border-slate-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Strictly Private to 2</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">No third parties or public search engines</div>
              </div>
            </div>

            <div
              onClick={() => setShowConnectModal(true)}
              className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/50 border border-emerald-100/60 dark:border-slate-800 flex items-start gap-2.5 cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-slate-700/50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  Supabase DB
                  <Settings className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {isSupabaseConfigured ? 'Live & Connected' : 'Configure Project'}
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Privacy Policy Note */}
          <div className="pt-3 text-center text-[11px] text-slate-500 dark:text-neutral-400 flex flex-wrap items-center justify-center gap-1.5">
            <span>By entering, you agree to our</span>
            <button
              type="button"
              onClick={() => {
                setLegalTab('privacy');
                setLegalModalOpen(true);
              }}
              className="text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>&amp;</span>
            <button
              type="button"
              onClick={() => {
                setLegalTab('terms');
                setLegalModalOpen(true);
              }}
              className="text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connection Setup Modal */}
      <SupabaseConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {/* Interactive Legal & Privacy Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
};
