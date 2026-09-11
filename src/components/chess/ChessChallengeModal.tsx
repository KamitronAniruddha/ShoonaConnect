import React, { useState } from 'react';
import { X, Swords, Clock, Bot, Sparkles, Heart, Crown } from 'lucide-react';
import { TIME_CONTROL_PRESETS } from '../../utils/chessService';
import { AI_PERSONALITIES } from '../../utils/chessAi';
import type { TimeControlConfig } from '../../types/chess';

interface ChessChallengeModalProps {
  partnerName: string;
  isPartnerLinked: boolean;
  onSendChallenge: (
    timeControl: TimeControlConfig,
    preferredColor: 'white' | 'black' | 'random',
    isCasual: boolean
  ) => void;
  onStartAIGame: (
    timeControl: TimeControlConfig,
    preferredColor: 'white' | 'black' | 'random',
    difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master',
    personalityId: string
  ) => void;
  onClose: () => void;
}

export const ChessChallengeModal: React.FC<ChessChallengeModalProps> = ({
  partnerName,
  isPartnerLinked,
  onSendChallenge,
  onStartAIGame,
  onClose,
}) => {
  const [playMode, setPlayMode] = useState<'partner' | 'ai'>(
    isPartnerLinked ? 'partner' : 'ai'
  );

  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControlConfig>(
    TIME_CONTROL_PRESETS[6] // 10 min Rapid
  );
  const [preferredColor, setPreferredColor] = useState<'white' | 'black' | 'random'>('random');
  const [isCasual, setIsCasual] = useState(false);

  // AI settings
  const [aiDifficulty, setAiDifficulty] = useState<
    'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert' | 'master'
  >('intermediate');
  const [selectedPersonality, setSelectedPersonality] = useState('strategist');

  const handleStart = () => {
    if (playMode === 'partner') {
      onSendChallenge(selectedTimeControl, preferredColor, isCasual);
    } else {
      onStartAIGame(selectedTimeControl, preferredColor, aiDifficulty, selectedPersonality);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191017] border border-[#ff3377]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3377] to-amber-500 p-0.5 flex items-center justify-center text-xl shadow-md">
              ♟️
            </div>
            <div>
              <h2 className="text-xl font-bold font-fraunces text-white">
                Start a Chess Game
              </h2>
              <p className="text-xs text-neutral-400">
                Play in real-time or practice with charming AI personalities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setPlayMode('partner')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              playMode === 'partner'
                ? 'bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Challenge {partnerName || 'Partner'} 💕</span>
          </button>

          <button
            type="button"
            onClick={() => setPlayMode('ai')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              playMode === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Practice Bots 🤖</span>
          </button>
        </div>

        {/* Time Control Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#ff4d8d]" />
            <span>Time Control</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TIME_CONTROL_PRESETS.map((tc) => {
              const isSelected = selectedTimeControl.id === tc.id;
              return (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTimeControl(tc)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#ff3377]/20 border-[#ff3377] text-white shadow-sm'
                      : 'bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10'
                  }`}
                >
                  <div className="text-xs font-bold">{tc.label}</div>
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">
                    {tc.category}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Color */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Your Starting Color</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'white', label: 'White', icon: '♔', bg: 'bg-white/10' },
              { id: 'random', label: 'Random', icon: '🎲', bg: 'bg-[#ff3377]/15' },
              { id: 'black', label: 'Black', icon: '♚', bg: 'bg-black/30' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPreferredColor(c.id as any)}
                className={`py-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  preferredColor === c.id
                    ? 'border-[#ff3377] bg-[#ff3377]/20 text-white font-bold'
                    : 'border-white/5 bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Personality & Difficulty Options (if AI mode) */}
        {playMode === 'ai' && (
          <div className="space-y-4 border-t border-white/10 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['beginner', 'easy', 'intermediate', 'advanced', 'expert', 'master'] as const).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAiDifficulty(lvl)}
                      className={`py-2 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        aiDifficulty === lvl
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Select Personality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(AI_PERSONALITIES).map((p) => {
                  const isSel = selectedPersonality === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPersonality(p.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSel
                          ? 'border-purple-500 bg-purple-950/30 shadow-md'
                          : 'border-white/5 bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{p.avatar}</span>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-purple-300 font-medium truncate">
                          {p.tagline}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff3377] via-[#ff4d8d] to-amber-500 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Swords className="w-4 h-4" />
          <span>{playMode === 'partner' ? `Send Challenge to ${partnerName || 'Partner'}` : 'Begin AI Match 🤖'}</span>
        </button>
      </div>
    </div>
  );
};
