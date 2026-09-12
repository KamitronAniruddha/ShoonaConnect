import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  MessageCircle,
  CalendarDays,
  ShieldCheck,
  History,
  X,
  ArrowRight,
  Clock,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface FeatureShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme?: 'rose' | 'sunset' | 'midnight' | 'emerald' | 'lavender';
}

const THEME_STYLES = {
  rose: 'from-rose-500 to-pink-500 text-rose-500 bg-rose-500/10 border-rose-200 focus:border-rose-500',
  sunset: 'from-amber-500 to-rose-500 text-amber-500 bg-amber-500/10 border-amber-200 focus:border-amber-500',
  midnight: 'from-indigo-600 to-purple-900 text-indigo-400 bg-indigo-500/10 border-indigo-900/40 focus:border-indigo-500',
  emerald: 'from-emerald-600 to-teal-600 text-emerald-500 bg-emerald-500/10 border-emerald-200 focus:border-emerald-500',
  lavender: 'from-purple-500 to-pink-500 text-purple-500 bg-purple-500/10 border-purple-200 focus:border-purple-500',
};

export const FeatureShowcaseModal: React.FC<FeatureShowcaseModalProps> = ({
  isOpen,
  onClose,
  activeTheme = 'rose',
}) => {
  const [activeTab, setActiveTab] = useState<'dating' | 'calendar' | 'breakup' | 'security'>('dating');

  if (!isOpen) return null;

  const currentThemeClasses = THEME_STYLES[activeTheme];

  const features = [
    {
      id: 'dating',
      title: 'Real-time Sanctuary Chat',
      icon: MessageCircle,
      tag: 'Dynamic Presence',
      description: 'Exchange romantic thoughts and coordinate in real-time with your partner, backed by a persistent and beautifully styled message log.',
      mockRender: (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-sans shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Online</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[80%] leading-relaxed">
                Good morning, my love! Did you see the reminder for our weekend getaway? ✈️
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-rose-500 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-[80%] leading-relaxed">
                Yes! I'm counting down the hours! I love you! ❤️
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'calendar',
      title: 'Advanced Dates & Countdowns',
      icon: CalendarDays,
      tag: 'Precise Planning',
      description: 'Track birthdays, anniversaries, and custom events. Enjoy a rich chronological breakdown showing exact remaining days, hours, minutes, and seconds.',
      mockRender: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-sans shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300">Our 1-Year Anniversary</h4>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[9px] font-bold">1st Year</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="text-lg font-bold text-rose-400 font-mono">14</div>
              <div className="text-[9px] text-slate-400 uppercase">Days</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="text-lg font-bold text-rose-400 font-mono">18</div>
              <div className="text-[9px] text-slate-400 uppercase">Hours</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="text-lg font-bold text-rose-400 font-mono">42</div>
              <div className="text-[9px] text-slate-400 uppercase">Mins</div>
            </div>
            <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/40">
              <div className="text-lg font-bold text-rose-400 font-mono">59</div>
              <div className="text-[9px] text-slate-400 uppercase">Secs</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center italic">
            "Every second with you is a lifelong treasure."
          </p>
        </div>
      ),
    },
    {
      id: 'breakup',
      title: 'Advanced Breakup & Archive',
      icon: History,
      tag: 'Two Paths',
      description: 'Safeguard your choices with either a 120-day limited Force Breakup or a Mutual Breakup. Archiving mutual decisions retains your memories and chat logs forever.',
      mockRender: (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-sans shadow-xl">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-[11px]">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Mutual Separation Room</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Enter a shared, private discussion space to reach a decision together. All memories are stored safely.
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Force Breakup Option:</span>
            <span className="text-rose-400 font-bold">Only if &lt; 120 Days</span>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: 'Extreme Shared PIN Protection',
      icon: ShieldCheck,
      tag: 'Absolute Privacy',
      description: 'Lock your shared sanctuary with a private, double-secured PIN code to keep your digital safe-haven perfectly exclusive.',
      mockRender: (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-sans shadow-xl flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sanctuary Lock Active</span>
        </div>
      ),
    },
  ];

  const currentFeature = features.find((f) => f.id === activeTab) || features[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Interactive Showcase View */}
        <div className="flex-1 bg-gradient-to-br from-slate-50 to-rose-50/50 dark:from-slate-950 dark:to-neutral-900/40 p-6 sm:p-8 flex flex-col justify-between border-r border-slate-100 dark:border-slate-900/40 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                <span className="text-xs font-bold text-rose-500 tracking-wider uppercase font-mono">
                  Interactive Showcase
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 bg-white/80 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Shoona
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans max-w-md">
                A secure, beautifully tailored digital sanctuary designed from the ground up to cultivate closeness, track milestones, and preserve memories.
              </p>
            </div>

            {/* Dynamic Live Simulated App Container */}
            <div className="p-1 rounded-3xl bg-slate-100/60 dark:bg-neutral-900/50 border border-slate-200/60 dark:border-slate-800/40">
              <div className="relative aspect-video sm:aspect-auto sm:h-52 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-radial from-rose-500/5 to-transparent pointer-events-none" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-sm"
                  >
                    {currentFeature.mockRender}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Feature Description Panel */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">
                {currentFeature.tag}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentFeature.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentFeature.description}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-slate-850 pt-5 mt-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Made for couples by <span className="text-rose-500 font-romantic">Aniruddha</span>
              </p>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider">
                DESIGNED WITH DEVOTION
              </p>
            </div>
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </div>

        {/* Right Feature Navigation Menu */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-[#070409]/60 p-6 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 border-slate-100 dark:border-slate-900/40">
          <div className="space-y-6">
            <div className="hidden md:flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Explore Features
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any core engine module to view details and simulated app interface.
              </p>
            </div>

            <div className="space-y-2">
              {features.map((f) => {
                const Icon = f.icon;
                const isSelected = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveTab(f.id as any)}
                    className={`w-full p-3.5 text-left rounded-2xl flex items-center gap-3.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-950 text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-rose-500'}`} />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-none mb-1">
                        {f.title}
                      </p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                        {f.tag}
                      </p>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-900/60 mt-6 md:mt-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-850 hover:bg-slate-800 dark:hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Enter Sanctuary Now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
