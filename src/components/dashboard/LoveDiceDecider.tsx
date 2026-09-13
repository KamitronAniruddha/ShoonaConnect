import React, { useState } from 'react';
import { Dices, Sparkles, Send, RefreshCw, Calendar, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

const ACTIVITIES = [
  'Midnight Stargazing with Blankets',
  'Pillow Fort & 90s Movie Marathon',
  'Cozy Cooking Duel in the Kitchen',
  'Candlelit Bookstore / Cafe Stroll',
  'Board Game & Strip Uno Duel',
  'Rooftop Dessert & Slow Dancing',
  'Drive to Nowhere with Our Playlist',
  'DIY Spa Night with Essential Oils',
];

const FOODS = [
  'Wood-Fired Artisan Pizza',
  'Warm Boba & Matcha Crepes',
  'Sushi Rolls & Miso Soup',
  'Homemade Creamy Pasta',
  'Street Tacos & Churros',
  'Chocolate Fondue & Strawberries',
  'Comfort Burgers & Crispy Fries',
  'Late Night Ramen Bowls',
];

const SPICES = [
  'No phones allowed for 2 hours',
  'Winner gets a 20-min neck massage',
  'Share 3 secret confessions under candlelight',
  'Dress up fancy even if staying inside',
  'Whisper in each other\'s ear only',
  'One person chooses every song',
  'Blindfold food tasting game',
  'Slow dance to our first song before leaving',
];

interface LoveDiceDeciderProps {
  partnerName?: string;
  onSendToChat?: (text: string) => void;
}

export const LoveDiceDecider: React.FC<LoveDiceDeciderProps> = ({
  partnerName = 'Sweetheart',
  onSendToChat,
}) => {
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [food, setFood] = useState(FOODS[0]);
  const [spice, setSpice] = useState(SPICES[0]);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);

    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80, 50, 100]);
    }

    let iterations = 0;
    const interval = setInterval(() => {
      setActivity(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]);
      setFood(FOODS[Math.floor(Math.random() * FOODS.length)]);
      setSpice(SPICES[Math.floor(Math.random() * SPICES.length)]);
      iterations++;

      if (iterations > 12) {
        clearInterval(interval);
        setIsRolling(false);
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#ec4899', '#f43f5e', '#a855f7'],
        });
      }
    }, 75);
  };

  const handleSendDateInvite = () => {
    const text = `🎲 Date Night Decided with ${partnerName}!\n• Activity: ${activity}\n• Food: ${food}\n• Romantic Twist: ${spice}\nAre you in? 💕`;
    if (onSendToChat) {
      onSendToChat(text);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-purple-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Interactive Love Dice & Date Decider</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold border border-purple-200 dark:border-purple-900/40">
                Randomizer
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Can't decide what to do? Let the romantic dice choose your next adventure
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isRolling}
          onClick={handleRoll}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling Dice...' : 'Roll Love Dice 🎲'}</span>
        </button>
      </div>

      {/* 3 Dice Results Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Die 1: Activity */}
        <div className={`p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800/80 border border-purple-100 dark:border-slate-700 transition-all ${isRolling ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
            <span>🎲 Die 1: The Activity</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-1">
            {activity}
          </div>
        </div>

        {/* Die 2: Food */}
        <div className={`p-4 rounded-2xl bg-pink-50/70 dark:bg-slate-800/80 border border-pink-100 dark:border-slate-700 transition-all ${isRolling ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">
            <span>🍕 Die 2: The Treat</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-1">
            {food}
          </div>
        </div>

        {/* Die 3: Romantic Spice */}
        <div className={`p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800/80 border border-amber-100 dark:border-slate-700 transition-all ${isRolling ? 'animate-pulse' : ''}`}>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            <span>🔥 Die 3: Romantic Spice</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mt-1">
            {spice}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSendDateInvite}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send This Date Plan to {partnerName} 💌</span>
        </button>
      </div>
    </div>
  );
};
