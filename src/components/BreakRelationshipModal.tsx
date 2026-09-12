import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartCrack,
  AlertTriangle,
  Download,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Archive,
  MessageSquare,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BreakRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BreakRelationshipModal: React.FC<BreakRelationshipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    couple,
    partnerProfile,
    breakRelationshipAndPurgeData,
    downloadCoupleArchive,
    proposeMutualBreakup,
  } = useAuth();

  const [breakupStep, setBreakupStep] = useState<'select_mode' | 'force_break_confirm'>('select_mode');
  const [confirmInput, setConfirmInput] = useState('');
  const [selectedReason, setSelectedReason] = useState('Mutually decided to part ways');
  const [customReason, setCustomReason] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isProposingMutual, setIsProposingMutual] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [mutualError, setMutualError] = useState<string | null>(null);

  if (!isOpen || !couple) return null;

  // Calculate duration of relationship in days
  const relationshipCreatedAt = couple.createdAt ? new Date(couple.createdAt) : new Date();
  const relationshipDays = Math.max(
    0,
    Math.floor((new Date().getTime() - relationshipCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
  );
  const canForceBreakup = relationshipDays < 120;

  const partnerName = partnerProfile?.nickname || partnerProfile?.displayName || 'your partner';
  const confirmationTarget = 'BREAK';
  const isTargetMatched = confirmInput.trim().toUpperCase() === confirmationTarget;

  const reasons = [
    'Mutually decided to part ways',
    'Taking time apart for personal growth',
    'Resetting space / Testing fresh start',
    'Personal privacy & data closure',
    'Other / Custom note',
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCoupleArchive();
      setHasExported(true);
    } catch (err: any) {
      console.error('Failed to export archive:', err);
      alert('Could not export archive. You can still proceed with deletion.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleProposeMutual = async () => {
    setIsProposingMutual(true);
    setMutualError(null);
    try {
      await proposeMutualBreakup();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to propose mutual breakup:', err);
      setMutualError(err.message || 'Failed to propose mutual breakup. Please try again.');
    } finally {
      setIsProposingMutual(false);
    }
  };

  const handleBreakAndPurge = async () => {
    if (!isTargetMatched) return;
    setIsPurging(true);
    setPurgeError(null);

    const finalReason = selectedReason === 'Other / Custom note' ? customReason : selectedReason;

    try {
      await breakRelationshipAndPurgeData(finalReason, (step, pct) => {
        setCurrentStepText(step);
        setProgressPercent(pct);
      });

      // Brief delay to show 100% completion before closing
      setTimeout(() => {
        setIsPurging(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('Break relationship failed:', err);
      setPurgeError(
        err.message ||
          'Failed to complete relationship dissolution. Please check connection and try again.'
      );
      setIsPurging(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="break-relationship-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="break-relationship-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl my-8 bg-neutral-900 border border-red-500/20 rounded-3xl shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-b from-red-950/40 to-transparent border-b border-neutral-800/60">
            {!isPurging && (
              <button
                id="btn-close-break-modal"
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-4">
              {breakupStep === 'force_break_confirm' && (
                <button
                  onClick={() => setBreakupStep('select_mode')}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:text-white text-neutral-300 transition-all active:scale-95 border border-neutral-700/80"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner shrink-0">
                <HeartCrack className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-red-400 uppercase">
                  Relationship Resolution Hub
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {breakupStep === 'select_mode'
                    ? 'Choose Separation Path'
                    : 'Force Break Confirmation'}
                </h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {isPurging ? (
              /* Active Purge Progress Screen */
              <div id="purge-progress-screen" className="py-8 space-y-6 text-center">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                  <HeartCrack className="w-6 h-6 text-red-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white">
                    Dissolving Relationship Space
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    {currentStepText || 'Communicating with encrypted cloud space...'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto bg-neutral-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-neutral-700">
                  <motion.div
                    className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{progressPercent}% complete</div>

                <p className="text-[11px] text-neutral-500 italic max-w-xs mx-auto">
                  Please keep this window open while all shared messages, media, and keys are permanently purged.
                </p>
              </div>
            ) : breakupStep === 'select_mode' ? (
              /* Choose Breakup Path (New Requirement) */
              <div className="space-y-5">
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  We believe relationship endings deserve deep care and transparency. Select the path that fits your bond's length and requirements:
                </p>

                {mutualError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{mutualError}</span>
                  </div>
                )}

                {/* Option 1: Mutual Decision Breakup (Always Available) */}
                <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all space-y-4">
                  <div className="flex gap-4.5">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Mutual Separation Room</h4>
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Initiates a private discussion space. You and {partnerName} can chat, share honest closure, and coordinate. Once both accept, the relationship is archived inside <strong>Past Relationships</strong>. All memory files, letters, and chat records remain intact and can be restored if you choose to reconnect later.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleProposeMutual}
                    disabled={isProposingMutual}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    {isProposingMutual ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>Propose Mutual Separation Room</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 2: Force Breakup (Only available < 120 days) */}
                <div className={`p-5 rounded-2xl bg-neutral-900 border transition-all space-y-4 ${
                  canForceBreakup ? 'border-neutral-800 hover:border-red-950' : 'border-neutral-800 opacity-60'
                }`}>
                  <div className="flex gap-4.5">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">Force Breakup & Permanent Wipe</h4>
                        {!canForceBreakup && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Instantly severs the relationship from both sides and permanently deletes all data from the servers with zero recovery possible.
                        {canForceBreakup ? (
                          <span className="block text-red-400 font-medium mt-1">
                            ⚠️ Eligible: Relationship is {relationshipDays} days old (limit: 120 days).
                          </span>
                        ) : (
                          <span className="block text-amber-400 font-medium mt-1">
                            🔒 Unavailable: Your relationship has lasted {relationshipDays} days. Force Breakup is disabled for high-depth bonds older than 120 days.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {canForceBreakup ? (
                    <button
                      onClick={() => setBreakupStep('force_break_confirm')}
                      className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 hover:text-red-400 active:scale-95 text-neutral-300 border border-neutral-700/80 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Proceed to Force Breakup</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-neutral-950/40 text-neutral-400 text-center text-xs border border-neutral-800 flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Force Breakup disabled for relationships &gt; 120 days</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Confirmation & Pre-Purge Flow (Step 2 of Force Break) */
              <>
                {/* Critical Warning Box */}
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-red-300">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Two-Sided Destruction Notice</span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    Executing this action will <strong>instantly sever the connection on both your device and {partnerName}’s device</strong>.
                    All messages, photo memories, love letters, shared notes, and daily questions will be <strong>permanently deleted from our servers with zero recovery possible</strong>.
                  </p>
                </div>

                {/* What gets deleted list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>All real-time chat messages</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Vault photos & memories</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Wax-sealed love letters</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Bucket lists & daily Q&A data</span>
                  </div>
                </div>

                {/* Optional: Export Pre-Purge Memory Archive */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-medium text-xs text-neutral-200">
                        <Archive className="w-4 h-4 text-amber-400" />
                        <span>Optional: Keep a Personal Memory Archive</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Download an offline copy of your written letters, notes, and milestones before they are wiped.
                      </p>
                    </div>

                    <button
                      id="btn-export-memory-archive"
                      type="button"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-neutral-700 hover:bg-neutral-600 text-neutral-100 transition-colors border border-neutral-600 shadow-sm cursor-pointer"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Exporting...</span>
                        </>
                      ) : hasExported ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300 font-bold">Downloaded</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Closure Reason */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Closure Note for {partnerName} (Optional)
                  </label>
                  <select
                    id="select-closure-reason"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    {reasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  {selectedReason === 'Other / Custom note' && (
                    <textarea
                      id="input-custom-closure-reason"
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Write a brief respectful closing note..."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-neutral-200 focus:outline-none focus:border-red-500 transition-colors mt-2"
                    />
                  )}
                </div>

                {/* Safety Phrase Verification */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-medium text-neutral-300">
                    To confirm total permanent erasure, type <span className="font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">BREAK</span> below:
                  </label>
                  <input
                    id="input-confirm-break-phrase"
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Type BREAK to confirm"
                    className="w-full px-4 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 font-mono tracking-wider focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center uppercase"
                  />
                </div>

                {purgeError && (
                  <div className="p-3 rounded-xl bg-red-900/50 border border-red-600 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{purgeError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    id="btn-cancel-break"
                    type="button"
                    onClick={() => setBreakupStep('select_mode')}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Back to Selection
                  </button>

                  <button
                    id="btn-execute-break-relationship"
                    type="button"
                    disabled={!isTargetMatched}
                    onClick={handleBreakAndPurge}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-lg ${
                      isTargetMatched
                        ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-red-900/40 hover:shadow-red-900/60'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Break & Wipe All Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
