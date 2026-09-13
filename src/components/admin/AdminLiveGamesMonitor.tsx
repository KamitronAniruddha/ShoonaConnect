import React, { useState } from 'react';
import { AdminCoupleRecord } from '../../types';
import {
  Gamepad2,
  Sparkles,
  Flame,
  Heart,
  Trophy,
  Activity,
  CheckCircle2,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface AdminLiveGamesMonitorProps {
  couples: AdminCoupleRecord[];
  onOpenDeepDive: (couple: AdminCoupleRecord) => void;
}

export const AdminLiveGamesMonitor: React.FC<AdminLiveGamesMonitorProps> = ({
  couples,
  onOpenDeepDive,
}) => {
  const [selectedGameType, setSelectedGameType] = useState<string>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>Global Live Games, Quizzes &amp; Virtual Pets Radar</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor real-time game matches, Tic-Tac-Toe turns, Connect 4, Love Quizzes, Would You Rather, and couple pet states across all sanctuaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'tic_tac_toe', 'love_quiz', 'pet'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedGameType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedGameType === type
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Couple Game Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {couples.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white font-fraunces flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{c.coupleName}</span>
                </h4>
                <div className="text-[10px] text-slate-400 font-mono">CODE: {c.pairCode}</div>
              </div>
              <button
                onClick={() => onOpenDeepDive(c)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
              >
                Inspect
              </button>
            </div>

            {/* Virtual Pet Dial */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-pink-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🦊</span>
                  <div>
                    <span className="text-xs font-bold text-white">{c.pet?.name || 'Mochi the Fox'}</span>
                    <span className="text-[10px] text-pink-400 font-mono block">Level {c.pet?.level || 3} Virtual Companion</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Hunger {c.pet?.hunger || 85}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: `${c.pet?.affection || 90}%` }} />
              </div>
            </div>

            {/* Interactive Game State Widget */}
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Tic-Tac-Toe Live Match</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Match in Progress</span>
              </div>

              {/* Mini 3x3 visual board */}
              <div className="grid grid-cols-3 gap-1 w-24 mx-auto p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                {['X', 'O', ' ', ' ', 'X', ' ', 'O', ' ', ' '].map((sq, i) => (
                  <div key={i} className="w-6 h-6 rounded bg-slate-950 flex items-center justify-center font-bold text-[10px] text-rose-400">
                    {sq}
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>{c.partner1Name || 'P1'}: 3 Wins</span>
                <span>{c.partner2Name || 'P2'}: 2 Wins</span>
              </div>
            </div>

            {/* Love Quiz Answer Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Latest Couple Quiz Q&amp;A</span>
              </div>
              <p className="text-[11px] text-slate-300 italic">"What is our favorite inside joke?"</p>
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Both answered: "The accidental pizza dough explosion 🍕"</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
