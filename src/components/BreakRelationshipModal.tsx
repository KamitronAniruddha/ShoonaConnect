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
  RefreshCw,
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
  const { couple, partnerProfile, breakRelationshipAndPurgeData, downloadCoupleArchive } = useAuth();

  const [confirmInput, setConfirmInput] = useState('');
  const [selectedReason, setSelectedReason] = useState('Mutually decided to part ways');
  const [customReason, setCustomReason] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  if (!isOpen || !couple) return null;

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
      setPurgeError(err.message || 'Failed to complete relationship dissolution. Please check connection and try again.');
      setIsPurging(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="break-relationship-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="break-relationship-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl my-8 bg-neutral-900 border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-b from-red-950/60 to-transparent border-b border-red-900/30">
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
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
                <HeartCrack className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider text-red-400 uppercase">
                  Permanent Dissolution
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Break Relationship & Wipe Data
                </h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {isPurging ? (
              /* Active Purge Progress Screen */
              <div id="purge-progress-screen" className="py-8 space-y-6 text-center">
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                  <HeartCrack className="w-8 h-8 text-red-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Dissolving Relationship from Both Sides
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                    {currentStepText || 'Communicating with encrypted cloud space...'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-md mx-auto bg-neutral-800 rounded-full h-3 overflow-hidden p-0.5 border border-neutral-700">
                  <motion.div
                    className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-neutral-400">{progressPercent}% complete</div>

                <p className="text-xs text-neutral-500 italic">
                  Please keep this window open while all shared messages, media, and keys are purged.
                </p>
              </div>
            ) : (
              /* Confirmation & Pre-Purge Flow */
              <>
                {/* Critical Warning Box */}
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-red-300">
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Two-Sided Destruction Notice</span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    Executing this action will <strong>instantly sever the connection on both your device and {partnerName}’s device</strong>.
                    All messages, photo memories, love letters, shared notes, and daily questions will be <strong>permanently deleted from our servers with zero recovery possible</strong>.
                  </p>
                </div>

                {/* What gets deleted list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>All real-time chat messages & reactions</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Vault photos, albums & moments</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Wax-sealed love letters & secret notes</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                    <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Bucket list, moods & daily Q&A answers</span>
                  </div>
                </div>

                {/* Advanced Feature 1: Export Pre-Purge Memory Archive */}
                <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-medium text-sm text-neutral-200">
                        <Archive className="w-4 h-4 text-amber-400" />
                        <span>Optional: Keep a Personal Memory Archive</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Download an encrypted offline copy of your written letters, notes, and milestones before they are wiped forever.
                      </p>
                    </div>

                    <button
                      id="btn-export-memory-archive"
                      type="button"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-700 hover:bg-neutral-600 text-neutral-100 transition-colors border border-neutral-600 shadow-sm"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Exporting...</span>
                        </>
                      ) : hasExported ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Downloaded</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Archive</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Optional Closure Reason */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Closure Note for {partnerName} (Optional)
                  </label>
                  <select
                    id="select-closure-reason"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-red-500 transition-colors"
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
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-red-500 transition-colors mt-2"
                    />
                  )}
                </div>

                {/* Safety Phrase Verification */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <label className="block text-xs font-medium text-neutral-300">
                    To confirm total permanent erasure, type <span className="font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">BREAK</span> below:
                  </label>
                  <input
                    id="input-confirm-break-phrase"
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="Type BREAK to confirm"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 placeholder-neutral-500 font-mono tracking-wider focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-center uppercase"
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
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    Cancel & Keep Space
                  </button>

                  <button
                    id="btn-execute-break-relationship"
                    type="button"
                    disabled={!isTargetMatched}
                    onClick={handleBreakAndPurge}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
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
