import React, { useState, useRef } from 'react';
import { Radio, Heart, Volume2, Sparkles, Send, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoveTapMorsePadProps {
  partnerName?: string;
  onSendToChat?: (text: string) => void;
}

const PRESET_PATTERNS = [
  { name: 'I Love You', morse: '..  .-.. --- ...- .  -.-- --- ..-', preview: '💖 I Love You' },
  { name: 'Miss You', morse: '-- .. ... ...  -.-- --- ..-', preview: '🥺 Miss You' },
  { name: 'Kiss Me', morse: '-.- .. ... ...  -- .', preview: '💋 Kiss Me' },
  { name: 'Sweet Dreams', morse: '... .-- . . -  -.. .-. . .- -- ...', preview: '🌙 Sweet Dreams' },
];

export const LoveTapMorsePad: React.FC<LoveTapMorsePadProps> = ({
  partnerName = 'Sweetheart',
  onSendToChat,
}) => {
  const [taps, setTaps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const pressStartTimeRef = useRef<number>(0);

  // Synthesizer beep
  const playBeep = (durationMs: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // ignore
    }
  };

  const handlePointerDown = () => {
    setIsPressing(true);
    pressStartTimeRef.current = Date.now();
  };

  const handlePointerUp = () => {
    if (!isPressing) return;
    setIsPressing(false);
    const duration = Date.now() - pressStartTimeRef.current;
    const isDash = duration > 200;
    const symbol = isDash ? '-' : '.';

    playBeep(isDash ? 250 : 80);
    if (navigator.vibrate) {
      navigator.vibrate(isDash ? 180 : 70);
    }

    setTaps((prev) => [...prev.slice(-24), symbol]);
  };

  const handleApplyPreset = (preset: typeof PRESET_PATTERNS[0]) => {
    const chars = preset.morse.split('');
    setTaps(chars);
    playBeep(120);
  };

  const handleClear = () => {
    setTaps([]);
  };

  const morseString = taps.join('');

  const handleSendOrCopy = () => {
    if (!morseString) return;
    const message = `📡 Secret Love Code for ${partnerName}: ${morseString} 💕`;
    if (onSendToChat) {
      onSendToChat(message);
    } else {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#f43f5e'],
    });
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-purple-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Secret Love Tap & Morse Pad</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-900/40">
                Touch Rhythms
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Tap quickly for dot (•), hold for dash (—) to encode romantic signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {PRESET_PATTERNS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[10px] font-semibold px-2 py-1 rounded-xl bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-300 transition-colors cursor-pointer"
            >
              {p.preview}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Tap Drum */}
      <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
        <div className="w-full sm:w-auto flex-1 text-center sm:text-left">
          <div className="min-h-12 p-3 rounded-2xl bg-purple-50/50 dark:bg-slate-800/60 border border-purple-100 dark:border-slate-700/60 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="font-mono text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300 tracking-widest break-all">
              {morseString || (
                <span className="text-xs font-sans text-slate-400 italic">
                  Tap the heart below to compose secret pulses...
                </span>
              )}
            </div>
            {morseString && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-slate-400 hover:text-rose-500 font-bold px-2 py-1 cursor-pointer shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Big Tap Button */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className={`w-28 h-14 sm:w-36 sm:h-16 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none shadow-md ${
            isPressing
              ? 'bg-purple-700 text-white scale-95 ring-4 ring-purple-300 dark:ring-purple-900'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isPressing ? 'scale-125 fill-white' : ''}`} />
          <span className="text-[10px] uppercase tracking-wider font-extrabold">
            {isPressing ? 'Recording...' : 'Tap or Hold'}
          </span>
        </button>
      </div>

      {morseString && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSendOrCopy}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Love Code!' : `Send Code to ${partnerName}`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
