import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  Clock,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Power,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { SystemAccessControl } from '../types';
import {
  verifyAdminPasskey,
  restoreWebsiteOperational,
  getSystemAccessControl,
} from '../lib/systemSettings';
import { useAuth } from '../context/AuthContext';

interface WebsiteSuspendedScreenProps {
  accessControl: SystemAccessControl;
  onAdminBypassSuccess: () => void;
  onWebsiteRestored: () => void;
}

export const WebsiteSuspendedScreen: React.FC<WebsiteSuspendedScreenProps> = ({
  accessControl,
  onAdminBypassSuccess,
  onWebsiteRestored,
}) => {
  const { userProfile, currentUser, signInWithPassword } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Time remaining state for countdown
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    if (accessControl.suspendDurationType !== 'timer' || !accessControl.suspendUntil) {
      return;
    }

    const updateTimer = () => {
      const target = new Date(accessControl.suspendUntil!).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        // Trigger check
        const current = getSystemAccessControl();
        if (current.siteStatus === 'operational') {
          onWebsiteRestored();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [accessControl.suspendDurationType, accessControl.suspendUntil, onWebsiteRestored]);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);

    if (!passkeyInput.trim()) {
      setPasskeyError('Please enter the administrator passkey.');
      return;
    }

    const isValid = verifyAdminPasskey(passkeyInput);
    if (isValid) {
      setShowAdminModal(false);
      onAdminBypassSuccess();
    } else {
      setPasskeyError('Invalid administrative passkey. Access denied.');
    }
  };

  const handleDirectRestore = async () => {
    setRestoring(true);
    try {
      await restoreWebsiteOperational();
      setRestoreSuccess(true);
      setTimeout(() => {
        onWebsiteRestored();
      }, 800);
    } catch (err) {
      console.error('Failed to restore website:', err);
    } finally {
      setRestoring(false);
    }
  };

  const isAniruddhaLoggedIn =
    currentUser?.email === 'kamitronaniruddha@gmail.com' ||
    userProfile?.email === 'kamitronaniruddha@gmail.com';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-rose-950/40 via-red-950/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-950/20 blur-3xl pointer-events-none" />

      {/* Top Bar Status */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-rose-500 shadow-inner">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-wide font-display">
              ShoonaConnect Sanctuary
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              STATUS CODE: 503_SYSTEM_SUSPENDED
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            SUSPENDED
          </span>
        </div>
      </header>

      {/* Main Lockdown Centerpiece */}
      <main className="relative z-10 max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Warning Icon Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-red-950/80 to-slate-900 border border-red-700/50 shadow-2xl shadow-red-950/80 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-md">
            <Power className="w-4 h-4" />
          </div>
        </div>

        {/* Primary Suspension Headline Requested */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-rose-300 text-xs font-mono font-semibold tracking-wider uppercase">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            <span>Administrative Enforcement Notice</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight leading-tight sm:leading-snug">
            {accessControl.noticeTitle || 'Aniruddha has suspended this website and will not turn on again'}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            {accessControl.noticeMessage ||
              'All access, sanctuary rooms, partner messaging, and couple data interactions have been administratively halted by Aniruddha.'}
          </p>
        </div>

        {/* Timer Box or Indefinite Status Card */}
        {accessControl.suspendDurationType === 'timer' && accessControl.suspendUntil ? (
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900/90 border border-red-900/40 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="flex items-center gap-1.5 font-semibold text-rose-300">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Scheduled Reactivation Timer</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">Auto-Recovery Active</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center shadow-inner"
                >
                  <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              Target Restoration Date:{' '}
              <span className="text-amber-300 font-bold">
                {new Date(accessControl.suspendUntil).toLocaleString()}
              </span>
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>LOCKDOWN MODE: INDEFINITE SUSPENSION</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This sanctuary will remain offline until explicitly restored by the Creator and Super
              Administrator (Aniruddha).
            </p>
          </div>
        )}

        {/* Action Panel for Authenticated Admin or Direct Bypass */}
        {isAniruddhaLoggedIn ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-md w-full space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Recognized Administrator: Aniruddha</span>
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">Super Admin Active</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                onClick={handleDirectRestore}
                disabled={restoring || restoreSuccess}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {restoring ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : restoreSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                <span>{restoreSuccess ? 'Website Restored!' : 'Turn Website Back On Now'}</span>
              </button>

              <button
                onClick={onAdminBypassSuccess}
                className="w-full sm:w-auto whitespace-nowrap py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Admin Bypass View →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowAdminModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <KeyRound className="w-3.5 h-3.5 text-rose-400" />
              <span>Administrator Portal (Aniruddha)</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Status</span>
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-2">
          <span>Architect &amp; Administrator:</span>
          <span className="font-mono text-slate-400 font-bold">Aniruddha (kamitronaniruddha@gmail.com)</span>
        </div>
        <div className="text-[11px] font-mono text-slate-600">
          Last policy update: {new Date(accessControl.lastUpdated).toLocaleString()}
        </div>
      </footer>

      {/* Emergency Admin Passkey Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Administrator Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify ownership to restore sanctuary access or bypass suspension.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasskeySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Enter Administrator Passkey / Master Bypass Code:
                </label>
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter passkey (e.g. aniruddha2026)"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono"
                />
                {passkeyError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{passkeyError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Passkey</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-slate-300 block">Default Master Passkey:</span>
              <p className="text-slate-500">
                You can use <code className="text-amber-300 font-mono">aniruddha2026</code> or sign in with{' '}
                <code className="text-amber-300 font-mono">kamitronaniruddha@gmail.com</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
