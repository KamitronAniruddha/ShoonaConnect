import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeartReactionCannonProps {
  className?: string;
  partnerName?: string;
  onFired?: () => void;
}

export const HeartReactionCannon: React.FC<HeartReactionCannonProps> = ({
  className = '',
  partnerName = 'Sweetheart',
  onFired,
}) => {
  const triggerCannon = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Haptic
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60, 40, 100]);
    }

    // Left cannon
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#ff4d8d', '#ff1a75', '#fb7185', '#fda4af', '#f43f5e'],
      shapes: ['circle'],
    });

    // Right cannon
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#f43f5e', '#f472b6'],
      shapes: ['circle'],
    });

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#ec4899'],
      });
    }, 200);

    if (onFired) {
      onFired();
    }
  };

  return (
    <button
      type="button"
      onClick={triggerCannon}
      title="Fire Heart Cannon Celebration"
      className={`relative group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-xs shadow-sm hover:shadow-md active:scale-95 transition-all cursor-pointer ${className}`}
    >
      <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
      <span>Heart Cannon 🎉</span>
    </button>
  );
};
