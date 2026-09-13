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

  useEffect(() => {
    const unsub = subscribeToSystemAccessControl((newSettings) => {
      setAccessControl(newSettings);
    });
    return unsub;
  }, []);

  // Form states
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      setError('Passwords do not match. Please retype carefully.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccessMessage('Password updated successfully! Redirecting to your sanctuary...');
      setTimeout(() => {
        clearPasswordRecovery();
        setAuthMode('login');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Unable to update password. Please request a new recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-amber-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top action buttons */}
      {onBackToLanding && (
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
          <button
            id="btn-auth-back-landing"
            type="button"
            onClick={onBackToLanding}
            className="p-2.5 px-3.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700 shadow-xs text-slate-600 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            <span>Overview</span>
          </button>
        </div>
      )}

      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          id="btn-auth-supabase-config"
          type="button"
          onClick={() => setShowConnectModal(true)}
          aria-label="Supabase Database Settings"
          className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700 shadow-xs text-slate-600 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          title="Supabase Database Settings"
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline font-mono text-[11px]">Database</span>
        </button>

        <button
          id="btn-auth-theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700 shadow-xs text-slate-600 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
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
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl shadow-xl shadow-rose-100/50 dark:shadow-black/50 border border-rose-100 dark:border-slate-800 p-8 sm:p-10 text-center space-y-6 transition-colors duration-300">
        {/* Romantic Emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-400/20 dark:bg-rose-500/20 rounded-full animate-ping opacity-50" />
          <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center">
            <Heart className="w-9 h-9 fill-white" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-romantic font-bold tracking-tight text-slate-900 dark:text-white">
            {authMode === 'reset_password'
              ? 'Reset Password'
              : authMode === 'forgot_password'
              ? 'Recover Access'
              : 'Our Private Space'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto font-sans">
            {authMode === 'reset_password'
              ? 'Enter your new secure password below to regain full access to your sanctuary.'
              : authMode === 'forgot_password'
              ? 'Enter your email to receive a password recovery link directly from Supabase.'
              : 'A quiet, safe sanctuary created exclusively for you and your favorite person.'}
          </p>
        </div>

        {/* Administrative Policy Alerts if restricted */}
        {accessControl.authStatus === 'disable_all_auth' && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 text-left flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>
              <span className="font-bold block">Sign-in Turned Off by Admin (Aniruddha)</span>
              <span>General user login and sign-up are temporarily disabled. Only the platform architect ({ADMIN_EMAIL}) may sign in.</span>
            </div>
          </div>
        )}

        {accessControl.authStatus === 'disable_signups' && authMode === 'signup' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-bold block">New Registrations Paused</span>
              <span>Account creation is temporarily paused by Administrator (Aniruddha). Existing lovers may still sign in.</span>
            </div>
          </div>
        )}

        {/* Auth Mode Toggle Tabs (Only shown for Login / Signup) */}
        {(authMode === 'login' || authMode === 'signup') && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 text-xs font-semibold">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                resetFormState();
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
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
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <span>Sign Up</span>
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
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300 text-left flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 pt-1 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_password');
                    resetFormState();
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Sanctuary</span>
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
                className="text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 pt-1 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Unique Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="signup-username"
                  type="text"
                  required
                  autoCapitalize="none"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                  placeholder="e.g. sweetheart_99"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Letters, numbers, underscores, dashes, dots (min 3 chars).</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Your Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="signup-displayname"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-submit-signup"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
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

            <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  resetFormState();
                }}
                className="text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {authMode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-3.5 pt-1 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Your Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              id="btn-submit-forgot"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
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
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD FORM */}
        {authMode === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 pt-1 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="reset-new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="reset-confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-rose-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              id="btn-submit-reset"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save New Password & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Trust Badges */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100/50 dark:border-slate-800 flex items-start gap-2">
            <Lock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Private to 2</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Only you & your partner have access</div>
            </div>
          </div>

          <div
            onClick={() => setShowConnectModal(true)}
            className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-100/50 dark:border-slate-800 flex items-start gap-2 cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                Supabase DB
                <Settings className="w-3 h-3 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSupabaseConfigured ? 'Live & Connected' : 'Configure Project'}
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Privacy Policy Note */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center text-[11px] text-slate-500 dark:text-neutral-400 flex flex-wrap items-center justify-center gap-1.5">
          <span>By continuing, you agree to our</span>
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

      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
        <span>Made with love for couples • Zero-Knowledge Encryption</span>
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
