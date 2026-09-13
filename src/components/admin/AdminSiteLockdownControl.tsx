import React, { useState, useEffect } from 'react';
import {
  Power,
  ShieldAlert,
  ShieldCheck,
  Clock,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  Settings,
  Sparkles,
  Info,
  Radio,
  Sliders,
  Terminal,
} from 'lucide-react';
import {
  SystemAccessControl,
  SiteOperationalStatus,
  AuthAccessStatus,
  ADMIN_EMAIL,
} from '../../types';
import {
  getSystemAccessControl,
  saveSystemAccessControl,
  restoreWebsiteOperational,
  DEFAULT_ACCESS_CONTROL,
} from '../../lib/systemSettings';

interface AdminSiteLockdownControlProps {
  onPreviewSuspensionScreen?: () => void;
}

export const AdminSiteLockdownControl: React.FC<AdminSiteLockdownControlProps> = ({
  onPreviewSuspensionScreen,
}) => {
  const [accessControl, setAccessControl] = useState<SystemAccessControl>(getSystemAccessControl());
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [siteStatus, setSiteStatus] = useState<SiteOperationalStatus>(accessControl.siteStatus);
  const [authStatus, setAuthStatus] = useState<AuthAccessStatus>(accessControl.authStatus);
  const [suspendDurationType, setSuspendDurationType] = useState<'indefinite' | 'timer'>(
    accessControl.suspendDurationType || 'indefinite'
  );
  const [customDays, setCustomDays] = useState<number>(1);
  const [customHours, setCustomHours] = useState<number>(0);
  const [customTargetDate, setCustomTargetDate] = useState<string>(() => {
    if (accessControl.suspendUntil) {
      try {
        return new Date(accessControl.suspendUntil).toISOString().slice(0, 16);
      } catch {}
    }
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().slice(0, 16);
  });
  const [noticeTitle, setNoticeTitle] = useState<string>(
    accessControl.noticeTitle || 'Aniruddha has suspended this website and will not turn on again'
  );
  const [noticeMessage, setNoticeMessage] = useState<string>(
    accessControl.noticeMessage ||
      'All access, sanctuary rooms, partner messaging, and couple data interactions have been administratively halted by Aniruddha.'
  );
  const [adminPasskey, setAdminPasskey] = useState<string>(accessControl.adminPasskey || 'aniruddha2026');

  // Sync state on external update
  useEffect(() => {
    const handleUpdate = () => {
      const current = getSystemAccessControl();
      setAccessControl(current);
      setSiteStatus(current.siteStatus);
      setAuthStatus(current.authStatus);
      setSuspendDurationType(current.suspendDurationType);
      if (current.noticeTitle) setNoticeTitle(current.noticeTitle);
      if (current.noticeMessage) setNoticeMessage(current.noticeMessage);
      if (current.adminPasskey) setAdminPasskey(current.adminPasskey);
      if (current.suspendUntil) {
        try {
          setCustomTargetDate(new Date(current.suspendUntil).toISOString().slice(0, 16));
        } catch {}
      }
    };

    window.addEventListener('shoona_access_control_change', handleUpdate);
    return () => window.removeEventListener('shoona_access_control_change', handleUpdate);
  }, []);

  const handleApplyPreset = (hours: number, days: number, weeks: number) => {
    const totalMs = (hours * 3600 + days * 86400 + weeks * 7 * 86400) * 1000;
    const target = new Date(Date.now() + totalMs);
    setSuspendDurationType('timer');
    setCustomTargetDate(target.toISOString().slice(0, 16));
    setCustomDays(days + weeks * 7);
    setCustomHours(hours);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSavedSuccess(false);

    let calculatedUntil: string | null = null;
    if (siteStatus === 'suspended' && suspendDurationType === 'timer') {
      try {
        calculatedUntil = new Date(customTargetDate).toISOString();
      } catch {
        calculatedUntil = new Date(Date.now() + 86400000).toISOString();
      }
    }

    try {
      const updated = await saveSystemAccessControl({
        siteStatus,
        authStatus,
        suspendDurationType,
        suspendUntil: calculatedUntil,
        noticeTitle: noticeTitle.trim() || 'Aniruddha has suspended this website and will not turn on again',
        noticeMessage: noticeMessage.trim(),
        adminPasskey: adminPasskey.trim() || 'aniruddha2026',
        suspendedBy: 'Aniruddha',
        suspendedAt: siteStatus === 'suspended' ? new Date().toISOString() : undefined,
      });

      setAccessControl(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save access control:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInstantRestore = async () => {
    setSaving(true);
    try {
      const restored = await restoreWebsiteOperational();
      setAccessControl(restored);
      setSiteStatus('operational');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to restore:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
              accessControl.siteStatus === 'suspended'
                ? 'bg-red-950/80 border-red-800 text-rose-500'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
            }`}
          >
            {accessControl.siteStatus === 'suspended' ? (
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-fraunces">
                Master Website Lockdown &amp; Auth Control
              </h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                  accessControl.siteStatus === 'suspended'
                    ? 'bg-red-500/20 text-rose-300 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {accessControl.siteStatus === 'suspended' ? '● CURRENTLY SUSPENDED' : '● ONLINE / OPERATIONAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin authority for Aniruddha (<span className="text-amber-400 font-mono">{ADMIN_EMAIL}</span>).
              Instantly turn off website, schedule timed shutdown, or restrict user sign-in.
            </p>
          </div>
        </div>

        {accessControl.siteStatus === 'suspended' ? (
          <button
            onClick={handleInstantRestore}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center gap-2"
          >
            <Power className="w-4 h-4" />
            <span>Turn Website Back On Now</span>
          </button>
        ) : (
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-mono">Public Status: </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">Accessible to All</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Website Operational Switch */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-bold text-white font-fraunces">
                  1. Website Operational State (Turn Off / On)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Realtime Broadcast</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Operational */}
              <div
                onClick={() => setSiteStatus('operational')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  siteStatus === 'operational'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldCheck className={`w-4 h-4 ${siteStatus === 'operational' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>Website Online (Normal)</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    siteStatus === 'operational' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-700'
                  }`}>
                    {siteStatus === 'operational' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sanctuary is fully functional. Visitors can view features, couples can chat, play games, and share memories.
                </p>
              </div>

              {/* Option: Suspended */}
              <div
                onClick={() => setSiteStatus('suspended')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  siteStatus === 'suspended'
                    ? 'bg-red-500/10 border-red-500 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <ShieldAlert className={`w-4 h-4 ${siteStatus === 'suspended' ? 'text-rose-500' : 'text-slate-500'}`} />
                    <span>Suspend / Turn Off Website</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    siteStatus === 'suspended' ? 'border-red-400 bg-rose-500' : 'border-slate-700'
                  }`}>
                    {siteStatus === 'suspended' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Immediately blocks public visitors and displays: "Aniruddha has suspended this website and will not turn on again".
                </p>
              </div>
            </div>

            {/* If Suspended is Selected: Timer vs Indefinite Controls */}
            {siteStatus === 'suspended' && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-red-900/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>Suspension Duration Strategy</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Until On By Self OR Timer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSuspendDurationType('indefinite')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      suspendDurationType === 'indefinite'
                        ? 'bg-red-500/20 border-red-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">Uptil On by Self (Indefinite)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Website stays off permanently until you manually turn it back on.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSuspendDurationType('timer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      suspendDurationType === 'timer'
                        ? 'bg-amber-500/20 border-amber-500/60 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Automatic Timer</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Automatically turns back on when timer countdown reaches zero.
                    </div>
                  </button>
                </div>

                {/* If Timer Selected: Quick Presets & Custom Picker */}
                {suspendDurationType === 'timer' && (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Quick Preset Durations:
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '30 Minutes', h: 0.5, d: 0, w: 0 },
                        { label: '2 Hours', h: 2, d: 0, w: 0 },
                        { label: '6 Hours', h: 6, d: 0, w: 0 },
                        { label: '12 Hours', h: 12, d: 0, w: 0 },
                        { label: '1 Day', h: 0, d: 1, w: 0 },
                        { label: '2 Days', h: 0, d: 2, w: 0 },
                        { label: '3 Days', h: 0, d: 3, w: 0 },
                        { label: '1 Week', h: 0, d: 0, w: 1 },
                        { label: '2 Weeks', h: 0, d: 0, w: 2 },
                        { label: '1 Month (30d)', h: 0, d: 30, w: 0 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleApplyPreset(preset.h, preset.d, preset.w)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Exact Custom Target Reactivation Date &amp; Time:
                      </label>
                      <input
                        type="datetime-local"
                        value={customTargetDate}
                        onChange={(e) => setCustomTargetDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Selected target: {new Date(customTargetDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Authentication & Login Restrictions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white font-fraunces">
                  2. User Authentication &amp; Sign-in Restrictions
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Registration Guard</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: All Enabled */}
              <div
                onClick={() => setAuthStatus('all_enabled')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  authStatus === 'all_enabled'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Full Access (Normal)</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    authStatus === 'all_enabled' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-700'
                  }`}>
                    {authStatus === 'all_enabled' && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Both new user sign-ups and existing user logins are fully operational.
                </p>
              </div>

              {/* Option 2: Disable Sign-ups Only */}
              <div
                onClick={() => setAuthStatus('disable_signups')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  authStatus === 'disable_signups'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Turn Off New Sign-ups</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    authStatus === 'disable_signups' ? 'border-amber-400 bg-amber-500' : 'border-slate-700'
                  }`}>
                    {authStatus === 'disable_signups' && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Disables registration of new couples. Existing registered users can still sign in freely.
                </p>
              </div>

              {/* Option 3: Disable All Login */}
              <div
                onClick={() => setAuthStatus('disable_all_auth')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  authStatus === 'disable_all_auth'
                    ? 'bg-red-500/10 border-red-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Turn Off All Sign-in</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    authStatus === 'disable_all_auth' ? 'border-red-400 bg-rose-500' : 'border-slate-700'
                  }`}>
                    {authStatus === 'disable_all_auth' && <div className="w-1 h-1 rounded-full bg-slate-950" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Blocks all user logins and sign-ups. Only super admin Aniruddha can sign in.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Suspension Notice Customization & Passkey */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white font-fraunces">
                  3. Suspension Notice Message &amp; Master Passkey
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Visitor Messaging</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Primary Suspension Headline:
                </label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="Aniruddha has suspended this website and will not turn on again"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Detailed Explanation / Secondary Notice:
                </label>
                <textarea
                  rows={2}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Master Admin Emergency Passkey:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Direct Unlock</span>
                </div>
                <input
                  type="text"
                  value={adminPasskey}
                  onChange={(e) => setAdminPasskey(e.target.value)}
                  placeholder="aniruddha2026"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-500">
                  Allows Aniruddha to bypass the lockdown screen or turn the website back on from any browser.
                </p>
              </div>
            </div>
          </div>

          {/* Action Save Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Access control settings published &amp; broadcasted live!</span>
                </span>
              ) : (
                <span>Changes will be applied instantly across all visitor browsers.</span>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
              <span>Apply &amp; Broadcast System State</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Simulator & Audit Specs */}
        <div className="space-y-6">
          {/* Suspension Screen Live Preview Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>Visitor Screen Preview</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Live Mockup</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-red-900/30 text-center space-y-3 shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 mx-auto flex items-center justify-center text-rose-500 shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-white font-fraunces leading-snug">
                  {noticeTitle}
                </h5>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-3">{noticeMessage}</p>
              </div>

              {suspendDurationType === 'timer' && (
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-amber-300 font-mono">
                  Countdown to: {new Date(customTargetDate).toLocaleDateString()}
                </div>
              )}

              <div className="pt-2 border-t border-slate-900 flex justify-center">
                {onPreviewSuspensionScreen && (
                  <button
                    onClick={onPreviewSuspensionScreen}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Fullscreen Simulator</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Policy Summary Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 text-xs">
            <h5 className="font-bold text-white font-fraunces flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Current Policy Summary</span>
            </h5>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Site Status:</span>
                <span
                  className={`font-mono font-bold uppercase ${
                    accessControl.siteStatus === 'suspended' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {accessControl.siteStatus}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Auth Status:</span>
                <span className="font-mono font-bold text-amber-300 uppercase">
                  {accessControl.authStatus.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Suspension Type:</span>
                <span className="font-mono font-bold text-purple-300 uppercase">
                  {accessControl.suspendDurationType}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Admin Authority:</span>
                <span className="font-mono text-slate-200">Aniruddha</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
