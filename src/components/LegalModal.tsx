import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Heart,
  X,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Database,
  Trash2,
  ExternalLink,
  Copy,
  Printer,
} from 'lucide-react';

export type LegalTab = 'privacy' | 'terms' | 'security' | 'dissolution' | 'governance';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    const text = `ShoonaConnect Legal & Privacy Commitment (2026):
- 100% Private to 2: Cryptographic Row Level Security isolates every couple.
- Zero Ads, Zero Tracking, Zero Third-Party Data Sales.
- Encrypted in Transit (TLS 1.3) and at Rest (AES-256).
- Complete Right to be Forgotten: Instant, permanent data purge on demand.
Learn more at: https://shoonaconnect.internal/legal`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#120a10] border border-rose-100 dark:border-white/10 shadow-2xl overflow-hidden text-slate-800 dark:text-neutral-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100 dark:border-white/10 flex items-center justify-between bg-rose-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-fraunces text-slate-900 dark:text-white">
                  ShoonaConnect Legal & Privacy Center
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Verified 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Transparent legal terms, zero-knowledge security, and user rights for couples.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
              title="Copy Summary"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-rose-100 dark:border-white/10 px-4 sm:px-6 bg-slate-50/70 dark:bg-[#0c080b] gap-2 overflow-x-auto text-xs font-semibold py-2">
          {[
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'terms', label: 'Terms of Service', icon: FileText },
            { id: 'security', label: 'Security & RLS Architecture', icon: Database },
            { id: 'dissolution', label: 'Mutual Dissolution & Purge', icon: Trash2 },
            { id: 'governance', label: 'Creator & Governance', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as LegalTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm leading-relaxed">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* Highlight Box */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Our Core Privacy Promise
                  </h4>
                  <p className="text-slate-600 dark:text-neutral-300 text-xs mt-1">
                    ShoonaConnect was created specifically to be the exact opposite of public social networks. We do not sell your data, run targeted ads, monetize your private memories, or expose your messages. What happens between you and your partner stays between you and your partner.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  1. Information We Collect
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  To provide our intimate couple sanctuary, we collect only the minimal information necessary:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-neutral-300">
                  <li><strong>Account Credentials:</strong> Email address, hashed password, chosen username, and optional display nickname.</li>
                  <li><strong>Couple Sanctuary Data:</strong> Anniversary date, relationship status, partner connection pairing codes, and shared theme preferences.</li>
                  <li><strong>User-Authored Content:</strong> Messages, collaborative doodles, voice clips, wax-sealed love letters, mood check-ins, bucket list goals, memory photos, and daily question answers.</li>
                  <li><strong>Optional Health Logs:</strong> Intimate period cycle days and symptoms (purely for mutual empathy notifications between partners).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  2. Strict Couple-Only Data Isolation
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  All messages, letters, scrapbooks, and audio recordings are stored in a dedicated couple partition locked with database-level <strong>Row-Level Security (RLS)</strong>. Only the two authenticated accounts belonging to your specific <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-[11px]">couple_id</code> possess cryptographic permission to read or write data. No other users can ever discover or view your shared sanctuary.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  3. Zero Third-Party Advertising & No Data Selling
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  We have a strict <strong>Zero Commercial Tracking</strong> policy. We do not sell, rent, license, or barter your personal intimacy data, messages, photos, or conversation habits to data brokers, advertising networks, or AI model scrapers.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  4. Right to be Forgotten & Data Portability (GDPR & CCPA)
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  You and your partner maintain 100% ownership over your shared history:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-neutral-300">
                  <li><strong>Export Data:</strong> You may download your couple memories and scrapbooks at any time.</li>
                  <li><strong>Permanent Purge:</strong> When either partner chooses to dissolve the couple space or delete their account, all associated messages, photos, notes, and records can be permanently expunged from the database with no lingering backups.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  5. Contact Our Privacy Officer
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  For privacy inquiries, GDPR data requests, or security disclosures, reach our legal team at <span className="font-semibold text-rose-500">privacy@shoonaconnect.internal</span>.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  1. The Sanctuary Agreement
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  By accessing ShoonaConnect ("the Website"), you agree to these Terms of Service. ShoonaConnect is designed exclusively as an intimate digital sanctuary for two consenting partners. You represent that you are at least 16 years of age or the age of majority in your jurisdiction.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  2. Dual Mutual Consent & Account Pairing
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  A couple space is established when one partner generates a 4-digit code and the second partner voluntarily enters it. Linking is entirely consensual. Either partner may disconnect or unpair from the relationship space at any time through the Settings or Sanctuary Dissolution process.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  3. User Content & Ownership
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  You retain complete intellectual property and copyright ownership of all text, drawings, letters, and photos uploaded into your sanctuary. You grant ShoonaConnect only the minimal technical license required to transmit, store, and display your content to your designated partner.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  4. Prohibited Uses
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  You agree never to use ShoonaConnect to stalk, harass, impersonate others, transmit malware, or store illegal materials. Violation of these principles results in immediate termination of the offending account.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  5. Limitation of Liability
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  ShoonaConnect is provided "as is" and "as available". While we maintain high-availability cloud infrastructure and automatic real-time backups, we advise couples to regularly export precious keepsake photos.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: SECURITY & RLS ARCHITECTURE */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Bank-Grade Technical Architecture
                  </h4>
                  <p className="text-slate-600 dark:text-neutral-300 text-xs mt-1">
                    Every message, letter, and memory is defended by enterprise-grade cryptographic standards and row-level database controls.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Row-Level Security (RLS)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Database tables enforce Postgres policies validating that <code className="bg-slate-200 dark:bg-white/10 px-1 py-0.5 rounded text-[10px]">auth.uid()</code> matches either partner 1 or partner 2 on every single query.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Lock className="w-4 h-4 text-rose-500" />
                    <span>Encryption in Transit & Rest</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    All network communications are secured with Transport Layer Security (TLS 1.3) and storage buckets are encrypted using AES-256 standard encryption.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <EyeOff className="w-4 h-4 text-purple-500" />
                    <span>Hardware & PIN Lock</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Couples can configure a private 4-digit PIN lock that shields screen content from curious glances when friends borrow your phone.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Ephemeral & Time-Locked Delivery</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    Wax-sealed letters remain locked until their predetermined timestamp, protected by server-side temporal verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MUTUAL DISSOLUTION */}
          {activeTab === 'dissolution' && (
            <div className="space-y-6">
              <section className="space-y-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-fraunces">
                  Compassionate & Clean Breakup Protocol
                </h4>
                <p className="text-slate-600 dark:text-neutral-300">
                  Relationships evolve, and we believe technology must respect couple boundaries with dignity. When a couple decides to part ways, ShoonaConnect features:
                </p>
              </section>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    1. Calm Discussion Room
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Inspired by Gottman relationship science, partners can enter a quiet, structured reflection space before making hasty permanent deletions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    2. Grace Period & Memory Export
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    A grace window allows both partners to download their personal photos and love letter archives before the couple partition is wiped.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 space-y-1">
                  <h5 className="font-bold text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
                    3. Irrevocable Purge
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Once dissolution is confirmed, all linked chat logs, time capsules, voice notes, and pet states are permanently deleted from database records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CREATOR & GOVERNANCE */}
          {activeTab === 'governance' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Platform Stewardship &amp; Architecture
                  </h4>
                  <p className="text-slate-600 dark:text-neutral-300 text-xs mt-1">
                    ShoonaConnect is created, architected, and maintained by <strong>Aniruddha (kamitronaniruddha@gmail.com)</strong> under strict ethical data stewardship principles.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-slate-600 dark:text-neutral-300">
                <section className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    1. Zero Data Monetization
                  </h5>
                  <p>
                    The platform will never sell, lease, auction, or monetize couple data, chats, or photographs. The infrastructure is solely funded and architected to provide an ad-free, undisturbed relationship haven.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    2. Administrative Access &amp; Privacy Safeguards
                  </h5>
                  <p>
                    Administrative capabilities are restricted to aggregate system health, join timestamp tracking, pairing status diagnostics, and security audits. Personal message contents and sealed love letters remain shielded by cryptographic row policies.
                  </p>
                </section>

                <section className="space-y-1.5">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    3. Direct Creator Inquiries &amp; Legal Requests
                  </h5>
                  <p>
                    For GDPR data subject requests, security audits, or direct architecture queries, contact the creator and administrator directly:
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block text-xs">Aniruddha — Founder &amp; System Architect</span>
                      <span className="text-xs text-rose-500 font-mono">kamitronaniruddha@gmail.com</span>
                    </div>
                    <a
                      href="mailto:kamitronaniruddha@gmail.com"
                      className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
                    >
                      Email Creator
                    </a>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-rose-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-[#0c080b] text-xs">
          <div className="text-slate-500 dark:text-neutral-500 text-center sm:text-left">
            © 2026 ShoonaConnect. Certified for GDPR, CCPA & Private Encrypted Communication.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-md shadow-rose-500/20"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
