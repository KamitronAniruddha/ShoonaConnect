import React, { useState } from 'react';
import { Lock, Heart, Delete } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-romantic font-bold tracking-tight text-white">Our Private Space</h2>
        <p className="text-xs text-slate-400 font-display">Enter your 4-digit couple passcode to unlock</p>
      </div>

      {/* Pin Indicators */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((idx) => {
          const filled = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'border-red-500 bg-red-500 animate-shake'
                  : filled
                  ? 'border-rose-400 bg-rose-400 scale-110'
                  : 'border-slate-600 bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-400 font-semibold mb-4 animate-bounce font-display">
          Incorrect passcode. Please try again.
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-64 max-w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-rose-500/40 border border-white/5 flex items-center justify-center text-2xl font-display font-semibold transition-all cursor-pointer mx-auto"
          >
            {digit}
          </button>
        ))}

        <div className="w-16 h-16" />

        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-rose-500/40 border border-white/5 flex items-center justify-center text-2xl font-display font-semibold transition-all cursor-pointer mx-auto"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer mx-auto"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-12 text-center text-[11px] text-slate-500 flex items-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-rose-500" />
        Strict isolated couple encryption
      </div>
    </div>
  );
};
