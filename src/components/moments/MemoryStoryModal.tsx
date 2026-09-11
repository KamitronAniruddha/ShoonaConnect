import React, { useState, useEffect } from 'react';
import { Memory } from '../../types';
import { X, ChevronLeft, ChevronRight, Heart, Calendar, MapPin, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryStoryModalProps {
  memories: Memory[];
  onClose: () => void;
}

export const MemoryStoryModal: React.FC<MemoryStoryModalProps> = ({ memories, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentMemory = memories[currentIndex];

  useEffect(() => {
    if (isPaused || !currentMemory) return;

    const interval = 50; // 50ms tick
    const duration = 6000; // 6 seconds per memory
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < memories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            clearInterval(timer);
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, memories.length, currentMemory, onClose]);

  const handleNext = () => {
    if (currentIndex < memories.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
      setProgress(0);
    }
  };

  const handleHeartReaction = () => {
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#fda4af'],
    });
  };

  if (!currentMemory) return null;

  const photo = currentMemory.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none">
      <div className="relative w-full sm:max-w-md h-full sm:h-[88vh] bg-slate-900 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Story Progress Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {memories.map((_, i) => (
            <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75 ease-linear"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Controls Header */}
        <div className="absolute top-6 inset-x-4 z-30 flex items-center justify-between text-white drop-shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500/80 backdrop-blur-md flex items-center justify-center">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-xs font-bold block">{currentMemory.title}</span>
              <span className="text-[10px] text-white/80">
                {new Date(currentMemory.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Background Image / Slide */}
        <div className="relative w-full h-full">
          <img
            src={photo}
            alt={currentMemory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

          {/* Left / Right touch hit areas */}
          <div
            onClick={handlePrev}
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 inset-y-0 w-1/3 z-20 cursor-pointer"
          />
        </div>

        {/* Bottom Story Content */}
        <div className="absolute bottom-4 inset-x-4 z-30 text-white space-y-3">
          <div className="space-y-1">
            {currentMemory.location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white/90">
                <MapPin className="w-3 h-3 text-rose-400" />
                {currentMemory.location}
              </span>
            )}
            <h3 className="text-xl font-bold">{currentMemory.title}</h3>
            {currentMemory.description && (
              <p className="text-xs text-white/90 leading-relaxed max-h-24 overflow-y-auto line-clamp-3">
                {currentMemory.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <span className="text-[10px] text-white/70">
              Memory {currentIndex + 1} of {memories.length}
            </span>

            <button
              type="button"
              onClick={handleHeartReaction}
              className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" /> Send Love
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
