import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartCrack, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DissolutionNoticeModal: React.FC = () => {
  const { userProfile, clearDissolutionNotice } = useAuth();

  const notice = userProfile?.lastDissolutionNotice;
  if (!notice) return null;

  const formattedDate = notice.dissolvedAt
    ? new Date(notice.dissolvedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <AnimatePresence>
      <div
        id="dissolution-notice-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      >
        <motion.div
          id="dissolution-notice-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg p-6 sm:p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 space-y-6 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
            <HeartCrack className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-wider text-rose-400 uppercase">
              Connection Notice
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Couple Space Ended
            </h2>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              <strong className="text-neutral-200">{notice.dissolvedByName}</strong> has dissolved your mutual couple space on {formattedDate}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 text-left space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-2 font-medium text-neutral-200">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Two-Way Data Erasure Verified</span>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              In accordance with privacy standards, all shared messages, photo memories, love letters, and mutual milestones have been permanently removed from both accounts and cloud servers.
            </p>

            {notice.reason && (
              <div className="pt-2 mt-2 border-t border-neutral-700/60">
                <span className="text-neutral-400 font-medium">Closure note:</span>
                <p className="italic text-neutral-300 mt-1 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-700/40">
                  "{notice.reason}"
                </p>
              </div>
            )}
          </div>

          <button
            id="btn-acknowledge-dissolution"
            type="button"
            onClick={() => clearDissolutionNotice()}
            className="w-full py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Acknowledge & Continue</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
