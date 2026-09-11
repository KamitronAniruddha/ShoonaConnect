export interface QuestionDefinition {
  id: string;
  question: string;
  category: 'romance' | 'deep' | 'playful' | 'adventures' | 'gratitude' | 'future' | 'nostalgia';
  categoryLabel: string;
  vibeEmoji: string;
}

export const QUESTION_CATEGORIES = [
  { id: 'all', label: 'All Vibes', emoji: '✨' },
  { id: 'romance', label: 'Romance & Chemistry', emoji: '💖' },
  { id: 'deep', label: 'Deep Soul & Life', emoji: '🌌' },
  { id: 'playful', label: 'Playful & Silly', emoji: '🤪' },
  { id: 'adventures', label: 'Date Nights & Adventures', emoji: '🍿' },
  { id: 'gratitude', label: 'Gratitude & Care', emoji: '🕊️' },
  { id: 'future', label: 'Dreams & Future Us', emoji: '🌟' },
  { id: 'nostalgia', label: 'Origin Story & Memories', emoji: '💭' },
] as const;

export const RICH_DAILY_QUESTIONS: QuestionDefinition[] = [
  // Romance & Chemistry
  { id: 'q-rom-1', question: "What is your favorite little memory of us from this past month?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '💖' },
  { id: 'q-rom-2', question: "What is one thing I do that always gives you butterflies or makes your heart skip a beat?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '🦋' },
  { id: 'q-rom-3', question: "What made you realize that I was the one for you?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '💘' },
  { id: 'q-rom-4', question: "What is the sweetest or most affectionate thing I've whispered or texted to you?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '💌' },
  { id: 'q-rom-5', question: "What is your favorite way to be kissed or cuddled by me?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '💋' },
  { id: 'q-rom-6', question: "What outfit or style of mine is your secret weakness?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '👗' },
  { id: 'q-rom-7', question: "When did you feel closest to my soul recently?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '💫' },
  { id: 'q-rom-8', question: "If we had an entire 24 hours locked in a cozy room with no phones, how would we spend it?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '🕯️' },
  { id: 'q-rom-9', question: "What song or melody instantly transports you back into my arms?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '🎶' },
  { id: 'q-rom-10', question: "What is your favorite physical feature of mine and your favorite personality trait?", category: 'romance', categoryLabel: 'Romance & Chemistry', vibeEmoji: '🥰' },

  // Deep Soul & Life
  { id: 'q-deep-1', question: "What are three words that best capture the sacred sanctuary of our bond?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '🌌' },
  { id: 'q-deep-2', question: "In what ways do you feel we have helped each other grow into better human beings?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '🌱' },
  { id: 'q-deep-3', question: "What is a vulnerable fear or burden on your heart right now that you want me to hold for you?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '🫂' },
  { id: 'q-deep-4', question: "What does true unconditional love feel like to you in our daily lives?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '🤍' },
  { id: 'q-deep-5', question: "What is a promise to yourself and to us that you want to hold sacred forever?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '💍' },
  { id: 'q-deep-6', question: "What is something you never used to believe about love until we met?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '✨' },
  { id: 'q-deep-7', question: "How do you best feel understood and emotionally safe when life gets chaotic?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '🛡️' },
  { id: 'q-deep-8', question: "What is a lesson our journey together has taught your heart so far?", category: 'deep', categoryLabel: 'Deep Soul & Life', vibeEmoji: '📜' },

  // Playful & Silly
  { id: 'q-play-1', question: "If a zombie apocalypse started right now, what roles would each of us take in our survival team?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🧟' },
  { id: 'q-play-2', question: "What is the funniest or most absurd habit of mine that you secretly find adorable?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '😜' },
  { id: 'q-play-3', question: "If we were contestants on a reality show together, which one would we win and which one would we fail miserably?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🏆' },
  { id: 'q-play-4', question: "What is an inside joke or secret nickname of ours that nobody else on earth would ever understand?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🤫' },
  { id: 'q-play-5', question: "If you could trade places with me for one single day, what is the first thing you would do?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🔄' },
  { id: 'q-play-6', question: "Which fictional cartoon or movie couple represents our energy best?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🎬' },
  { id: 'q-play-7', question: "What snack or food could I bribe you with anytime, anywhere?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '🍕' },
  { id: 'q-play-8', question: "If we had a joint superpower, what would it be?", category: 'playful', categoryLabel: 'Playful & Silly', vibeEmoji: '⚡' },

  // Date Nights & Adventures
  { id: 'q-adv-1', question: "If we could teleport anywhere in the world right this second, where would you take us?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '✈️' },
  { id: 'q-adv-2', question: "What is your all-time favorite date we have ever been on together?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '🍷' },
  { id: 'q-adv-3', question: "What is a delicious meal or dessert you wish we could cook together tonight?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '🍝' },
  { id: 'q-adv-4', question: "Describe your ideal lazy Sunday with me from morning coffee to bedtime.", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '☕' },
  { id: 'q-adv-5', question: "What is an adventurous activity you've been secretly wanting us to try together?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '🧗' },
  { id: 'q-adv-6', question: "If we planned a spontaneous road trip this weekend, where are we driving?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '🚗' },
  { id: 'q-adv-7', question: "What is our dream stargazing or bonfire night look like?", category: 'adventures', categoryLabel: 'Date Nights & Adventures', vibeEmoji: '🌌' },

  // Gratitude & Care
  { id: 'q-grat-1', question: "How can I make you feel even more cherished, supported, and loved this week?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '🕊️' },
  { id: 'q-grat-2', question: "What is a small, quiet thing I do that you appreciate more than you say?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '🌷' },
  { id: 'q-grat-3', question: "What was the most comforting moment of being held by me?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '🛋️' },
  { id: 'q-grat-4', question: "What is something you are deeply grateful for in our lives today?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '🙏' },
  { id: 'q-grat-5', question: "What is your favorite ritual or routine we share each morning or evening?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '☀️' },
  { id: 'q-grat-6', question: "When you have a hard day, what is the single best thing I can do to lift your spirit?", category: 'gratitude', categoryLabel: 'Gratitude & Care', vibeEmoji: '🍵' },

  // Dreams & Future Us
  { id: 'q-fut-1', question: "What is one dream or milestone you want us to accomplish together this year?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '🌟' },
  { id: 'q-fut-2', question: "When we are 80 years old, sitting on our porch in rocking chairs, what will we laugh about most?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '👵' },
  { id: 'q-fut-3', question: "What does our dream home look and feel like?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '🏡' },
  { id: 'q-fut-4', question: "What kind of legacy or love story do you want us to be remembered for?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '👑' },
  { id: 'q-fut-5', question: "What is an international country or magical city you want to experience holding my hand?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '🗼' },
  { id: 'q-fut-6', question: "What is a tradition you want us to create for our future holidays?", category: 'future', categoryLabel: 'Dreams & Future Us', vibeEmoji: '🎄' },

  // Origin Story & Memories
  { id: 'q-nost-1', question: "What was your very first impression or thought the moment our eyes first met?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '👀' },
  { id: 'q-nost-2', question: "What was the exact moment you realized your feelings for me had become deep love?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '💘' },
  { id: 'q-nost-3', question: "What is your absolute favorite photo or snapshot of us and why?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '📸' },
  { id: 'q-nost-4', question: "Remember our first awkward or butterflies moment? What do you remember most about it?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '🤭' },
  { id: 'q-nost-5', question: "If our love story was made into a book, what would chapter one be titled?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '📖' },
  { id: 'q-nost-6', question: "What is a sweet memory from early in our relationship that still gives you a warm glow?", category: 'nostalgia', categoryLabel: 'Origin Story & Memories', vibeEmoji: '🌸' },
];

export const DAILY_QUESTIONS = RICH_DAILY_QUESTIONS.map((q) => q.question);

export function getQuestionForDate(dateStr: string): QuestionDefinition {
  // Derive a deterministic daily index from date string YYYY-MM-DD
  const parts = dateStr.split('-');
  const y = parseInt(parts[0] || '2026', 10);
  const m = parseInt(parts[1] || '1', 10);
  const d = parseInt(parts[2] || '1', 10);
  const seed = y * 365 + m * 31 + d;
  const index = Math.abs(seed) % RICH_DAILY_QUESTIONS.length;
  return RICH_DAILY_QUESTIONS[index];
}

export function getTodayQuestion(): { id: string; question: string; category?: string; categoryLabel?: string } {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const def = getQuestionForDate(dateStr);
  return {
    id: `q-${dateStr}`,
    question: def.question,
    category: def.category,
    categoryLabel: def.categoryLabel,
  };
}

export interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  category: 'romantic' | 'joyful' | 'peaceful' | 'playful' | 'tender' | 'tired';
  color: string;
  description: string;
}

export const MOOD_CATEGORIES = [
  { id: 'all', label: 'All Moods', emoji: '✨' },
  { id: 'romantic', label: 'Romantic & In Love', emoji: '🥰' },
  { id: 'joyful', label: 'Joyful & Radiant', emoji: '😊' },
  { id: 'peaceful', label: 'Cozy & Peaceful', emoji: '☕' },
  { id: 'playful', label: 'Playful & Mischievous', emoji: '🤪' },
  { id: 'tender', label: 'Tender & Sensitive', emoji: '🥺' },
  { id: 'tired', label: 'Tired & Low Battery', emoji: '😴' },
] as const;

export const EXTENDED_MOODS: MoodOption[] = [
  // Romantic & In Love
  { id: 'blissful', label: 'Blissful & In Love', emoji: '🥰', category: 'romantic', color: 'bg-rose-100 text-rose-700 border-rose-300', description: 'Floating on clouds with love' },
  { id: 'kiss_craving', label: 'Craving Kisses', emoji: '😘', category: 'romantic', color: 'bg-pink-100 text-pink-700 border-pink-300', description: 'Sending sweet kisses to you' },
  { id: 'missing_you', label: 'Missing You Dearly', emoji: '🥺', category: 'romantic', color: 'bg-rose-100 text-rose-700 border-rose-300', description: 'Counting minutes till I see you' },
  { id: 'heart_overflowing', label: 'Heart Overflowing', emoji: '💖', category: 'romantic', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300', description: 'Bursting with affection' },
  { id: 'devoted', label: 'Forever Devoted', emoji: '💍', category: 'romantic', color: 'bg-amber-100 text-amber-700 border-amber-300', description: 'Grateful for our sacred bond' },
  { id: 'passionate', label: 'Sparks Flying', emoji: '🔥', category: 'romantic', color: 'bg-red-100 text-red-700 border-red-300', description: 'Intense romantic energy' },
  { id: 'cuddle_crave', label: 'Need Your Arms', emoji: '🫂', category: 'romantic', color: 'bg-purple-100 text-purple-700 border-purple-300', description: 'Wanting to melt in your hugs' },

  // Joyful & Radiant
  { id: 'happy', label: 'Happy & Radiant', emoji: '😊', category: 'joyful', color: 'bg-amber-100 text-amber-700 border-amber-300', description: 'Warm and smiling inside out' },
  { id: 'grinning', label: 'Grinning Big', emoji: '😁', category: 'joyful', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', description: 'Pure uninhibited laughter' },
  { id: 'celebrating', label: 'Celebrating Wins', emoji: '🥳', category: 'joyful', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', description: 'Cheering on our good news' },
  { id: 'magical', label: 'Feeling Magical', emoji: '✨', category: 'joyful', color: 'bg-violet-100 text-violet-700 border-violet-300', description: 'Glowy and inspired today' },
  { id: 'dancing', label: 'Dancing Joy', emoji: '💃', category: 'joyful', color: 'bg-pink-100 text-pink-700 border-pink-300', description: 'High vibrant energy' },
  { id: 'sunny', label: 'Sunny Vibes', emoji: '☀️', category: 'joyful', color: 'bg-orange-100 text-orange-700 border-orange-300', description: 'Bright optimism & smiles' },

  // Peaceful & Cozy
  { id: 'calm', label: 'Peaceful & Serene', emoji: '☕', category: 'peaceful', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', description: 'Grounded and balanced' },
  { id: 'cozy_nest', label: 'Warm & Cozy', emoji: '🛋️', category: 'peaceful', color: 'bg-amber-100 text-amber-700 border-amber-300', description: 'Soft blankets and warmth' },
  { id: 'mindful', label: 'Mindful & Present', emoji: '🧘', category: 'peaceful', color: 'bg-teal-100 text-teal-700 border-teal-300', description: 'Deep breath, calm heart' },
  { id: 'gentle_evening', label: 'Quiet & Reflective', emoji: '🕯️', category: 'peaceful', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', description: 'Peaceful romantic dusk' },
  { id: 'nature_calm', label: 'Fresh & Restored', emoji: '🌿', category: 'peaceful', color: 'bg-green-100 text-green-700 border-green-300', description: 'Clean fresh energy' },

  // Playful & Mischievous
  { id: 'silly', label: 'Goofy & Silly', emoji: '🤪', category: 'playful', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', description: 'Ready to tease and joke' },
  { id: 'cheeky', label: 'Flirty & Cheeky', emoji: '😜', category: 'playful', color: 'bg-rose-100 text-rose-700 border-rose-300', description: 'Playful mischief mode' },
  { id: 'giggling', label: 'Giggle Monster', emoji: '🤭', category: 'playful', color: 'bg-purple-100 text-purple-700 border-purple-300', description: 'Thinking of inside jokes' },
  { id: 'foodie', label: 'Yummy Cravings', emoji: '🍕', category: 'playful', color: 'bg-amber-100 text-amber-700 border-amber-300', description: 'Hungry for date food' },
  { id: 'game_on', label: 'Game Time Rival', emoji: '🎮', category: 'playful', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', description: 'Ready to challenge you' },

  // Tender & Sensitive
  { id: 'need_love', label: 'Need Extra Hugs', emoji: '🥺', category: 'tender', color: 'bg-pink-100 text-pink-700 border-pink-300', description: 'Gentle TLC requested' },
  { id: 'vulnerable', label: 'Soft & Tender', emoji: '🌸', category: 'tender', color: 'bg-rose-100 text-rose-700 border-rose-300', description: 'Needs your gentle voice' },
  { id: 'gloomy', label: 'A Bit Gloomy', emoji: '🌧️', category: 'tender', color: 'bg-slate-100 text-slate-700 border-slate-300', description: 'Grey clouds passing through' },
  { id: 'unwell', label: 'Rest & Care Needed', emoji: '🤕', category: 'tender', color: 'bg-amber-100 text-amber-700 border-amber-300', description: 'Needing soup and rest' },

  // Tired & Stressed
  { id: 'tired', label: 'Sleepyhead', emoji: '😴', category: 'tired', color: 'bg-indigo-100 text-indigo-700 border-indigo-300', description: 'Ready for sweet dreams' },
  { id: 'stressed', label: 'Heavy Work Stress', emoji: '😤', category: 'tired', color: 'bg-orange-100 text-orange-700 border-orange-300', description: 'Tough day at work' },
  { id: 'low_battery', label: 'Low Battery', emoji: '🪫', category: 'tired', color: 'bg-red-100 text-red-700 border-red-300', description: 'Need to recharge with you' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😣', category: 'tired', color: 'bg-slate-100 text-slate-700 border-slate-300', description: 'Deep breath needed' },
];

export const MOODS = EXTENDED_MOODS.slice(0, 6);

export const SUGGESTED_FEELING_TAGS = [
  'Missing You',
  'Need Long Hugs',
  'Counting The Hours',
  'Craving Kisses',
  'Heart Full',
  'Proud Of You',
  'Cozy Vibes',
  'Excited For Tonight',
  'Sleepyhead',
  'Grateful For Us',
  'Long Work Day',
  'Butterflies',
  'Need Soup & TLC',
  'Dreaming Of You',
  'Romantic Dinner Craving',
  'Best Day Ever',
  'You Are My Peace',
  'Need Your Laugh',
];

export const THEMES = {
  rose: {
    name: 'Blush Rose',
    primary: 'rose',
    accent: '#f43f5e',
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'bg-rose-50/60',
    banner: 'bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500',
    cardBorder: 'border-rose-200 dark:border-rose-900/60',
    tag: 'Classic Romance',
  },
  sunset: {
    name: 'Sunset Gold',
    primary: 'amber',
    accent: '#f59e0b',
    gradient: 'from-amber-500 to-rose-500',
    lightBg: 'bg-amber-50/60',
    banner: 'bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500',
    cardBorder: 'border-amber-200 dark:border-amber-900/60',
    tag: 'Warm & Golden',
  },
  midnight: {
    name: 'Midnight Romance',
    primary: 'indigo',
    accent: '#6366f1',
    gradient: 'from-indigo-600 to-purple-700',
    lightBg: 'bg-slate-900/90 text-slate-100',
    banner: 'bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700',
    cardBorder: 'border-indigo-200 dark:border-indigo-900/60',
    tag: 'Starry & Deep',
  },
  emerald: {
    name: 'Secret Garden',
    primary: 'emerald',
    accent: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50/60',
    banner: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600',
    cardBorder: 'border-emerald-200 dark:border-emerald-900/60',
    tag: 'Serene & Nature',
  },
  lavender: {
    name: 'Lavender Dusk',
    primary: 'purple',
    accent: '#a855f7',
    gradient: 'from-purple-500 to-indigo-500',
    lightBg: 'bg-purple-50/60',
    banner: 'bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-400',
    cardBorder: 'border-purple-200 dark:border-purple-900/60',
    tag: 'Dreamy & Soft',
  },
  velvet_noir: {
    name: 'Velvet Noir & Neon 💕',
    primary: 'fuchsia',
    accent: '#ff2d78',
    gradient: 'from-[#150614] via-[#320a2a] to-[#ff2d78]',
    lightBg: 'bg-[#150614] text-pink-100',
    banner: 'bg-gradient-to-r from-[#140513] via-[#350d2d] to-[#e11d48]',
    cardBorder: 'border-[#ff2d78]/50 shadow-[0_0_15px_rgba(255,45,120,0.2)]',
    tag: 'Dark Luxury & Neon Glow',
  },
  celestial_aurora: {
    name: 'Celestial Aurora 🌌',
    primary: 'cyan',
    accent: '#06b6d4',
    gradient: 'from-[#050f24] via-[#0e274a] to-[#06b6d4]',
    lightBg: 'bg-[#061226] text-cyan-100',
    banner: 'bg-gradient-to-r from-[#040b1b] via-[#092244] to-[#0284c7]',
    cardBorder: 'border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    tag: 'Northern Lights & Cosmos',
  },
  cherry_blossom: {
    name: 'Sakura Kyoto 🌸',
    primary: 'rose',
    accent: '#fb7185',
    gradient: 'from-[#be123c] via-[#f43f5e] to-[#fb923c]',
    lightBg: 'bg-rose-50/70',
    banner: 'bg-gradient-to-r from-[#9f1239] via-[#e11d48] to-[#f59e0b]',
    cardBorder: 'border-rose-200 dark:border-rose-800/60 shadow-[0_0_15px_rgba(251,113,133,0.2)]',
    tag: 'Japanese Sakura & Champagne',
  },
};

export interface PreciseLoveTime {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  totalWeeks: number;
  remainingDaysInWeek: number;
  totalMonths: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  heartbeats: number;
  sunrises: number;
  formattedStartDate: string;
  formattedStartTime: string;
  nextMilestone: {
    title: string;
    targetDays: number;
    daysLeft: number;
    percent: number;
  };
}

export function calculatePreciseLoveTime(
  anniversaryDateStr?: string,
  anniversaryTimeStr?: string
): PreciseLoveTime {
  const now = new Date();
  let startDate = new Date();

  if (anniversaryDateStr) {
    try {
      const timePart = anniversaryTimeStr && anniversaryTimeStr.trim() ? anniversaryTimeStr.trim() : '00:00';
      const [hoursStr, minsStr] = timePart.split(':');
      const h = parseInt(hoursStr, 10) || 0;
      const m = parseInt(minsStr, 10) || 0;

      const [yearStr, monthStr, dayStr] = anniversaryDateStr.split('-');
      if (yearStr && monthStr && dayStr) {
        startDate = new Date(
          parseInt(yearStr, 10),
          parseInt(monthStr, 10) - 1,
          parseInt(dayStr, 10),
          h,
          m,
          0
        );
      } else {
        startDate = new Date(anniversaryDateStr);
      }
    } catch {
      startDate = new Date(anniversaryDateStr);
    }
  } else {
    // Default to today if unset
    startDate = new Date(now.getTime() - 24 * 3600 * 1000);
  }

  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysInWeek = totalDays % 7;
  const totalMonths = Math.floor(totalDays / 30.4375);

  // Approximate human heartbeats (~72 beats/minute)
  const heartbeats = totalMinutes * 72;
  const sunrises = totalDays;

  // Breakdown (Years, Months, Days, Hours, Minutes, Seconds)
  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;

  let y = now.getFullYear() - startDate.getFullYear();
  let mo = now.getMonth() - startDate.getMonth();
  let d = now.getDate() - startDate.getDate();

  if (d < 0) {
    mo -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    d += prevMonthDays;
  }
  if (mo < 0) {
    y -= 1;
    mo += 12;
  }
  y = Math.max(0, y);
  mo = Math.max(0, mo);
  d = Math.max(0, d);

  // Milestones list (in days)
  const milestones = [
    { title: '100 Days in Love', targetDays: 100 },
    { title: '6 Months Anniversary', targetDays: 182 },
    { title: '1 Year Anniversary', targetDays: 365 },
    { title: '500 Days of Bliss', targetDays: 500 },
    { title: '2 Years Together', targetDays: 730 },
    { title: '1,000 Days Milestone', targetDays: 1000 },
    { title: '3 Years Together', targetDays: 1095 },
    { title: '5 Years Jubilee', targetDays: 1825 },
    { title: '10 Years Golden Love', targetDays: 3650 },
  ];

  let nextMilestone = milestones.find((m) => m.targetDays > totalDays);
  if (!nextMilestone) {
    const nextThousands = (Math.floor(totalDays / 1000) + 1) * 1000;
    nextMilestone = {
      title: `${nextThousands.toLocaleString()} Days Milestone`,
      targetDays: nextThousands,
    };
  }

  const prevMilestoneDays = milestones.filter((m) => m.targetDays <= totalDays).pop()?.targetDays || 0;
  const span = Math.max(1, nextMilestone.targetDays - prevMilestoneDays);
  const currentProgress = totalDays - prevMilestoneDays;
  const percent = Math.min(100, Math.max(0, Math.round((currentProgress / span) * 100)));
  const daysLeft = Math.max(0, nextMilestone.targetDays - totalDays);

  const formattedStartDate = anniversaryDateStr
    ? new Date(startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not set yet';

  const formattedStartTime = anniversaryTimeStr
    ? (() => {
        const [hStr, mStr] = anniversaryTimeStr.split(':');
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        const displayM = m < 10 ? `0${m}` : m;
        return `${displayH}:${displayM} ${ampm}`;
      })()
    : '12:00 AM (Midnight)';

  return {
    totalSeconds,
    totalMinutes,
    totalHours,
    totalDays: Math.max(1, totalDays),
    totalWeeks,
    remainingDaysInWeek,
    totalMonths,
    years: y,
    months: mo,
    days: d,
    hours,
    minutes,
    seconds,
    heartbeats,
    sunrises,
    formattedStartDate,
    formattedStartTime,
    nextMilestone: {
      title: nextMilestone.title,
      targetDays: nextMilestone.targetDays,
      daysLeft,
      percent,
    },
  };
}

export function getZodiacSign(dateStr?: string): { sign: string; symbol: string; element: string } {
  if (!dateStr) return { sign: 'Unknown', symbol: '✨', element: 'Cosmic' };
  try {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1; // 1-12

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
      return { sign: 'Aquarius', symbol: '♒', element: 'Air' };
    } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
      return { sign: 'Pisces', symbol: '♓', element: 'Water' };
    } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
      return { sign: 'Aries', symbol: '♈', element: 'Fire' };
    } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
      return { sign: 'Taurus', symbol: '♉', element: 'Earth' };
    } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
      return { sign: 'Gemini', symbol: '♊', element: 'Air' };
    } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
      return { sign: 'Cancer', symbol: '♋', element: 'Water' };
    } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
      return { sign: 'Leo', symbol: '♌', element: 'Fire' };
    } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
      return { sign: 'Virgo', symbol: '♍', element: 'Earth' };
    } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
      return { sign: 'Libra', symbol: '♎', element: 'Air' };
    } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
      return { sign: 'Scorpio', symbol: '♏', element: 'Water' };
    } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
      return { sign: 'Sagittarius', symbol: '♐', element: 'Fire' };
    } else {
      return { sign: 'Capricorn', symbol: '♑', element: 'Earth' };
    }
  } catch {
    return { sign: 'Unknown', symbol: '✨', element: 'Cosmic' };
  }
}

export function getDaysUntilBirthday(dateStr?: string): { daysLeft: number; isToday: boolean; formatted: string } {
  if (!dateStr) return { daysLeft: -1, isToday: false, formatted: 'Unset' };
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bday = new Date(dateStr);
    const bMonth = bday.getMonth();
    const bDate = bday.getDate();

    let nextBday = new Date(today.getFullYear(), bMonth, bDate);
    if (nextBday.getTime() < today.getTime()) {
      nextBday = new Date(today.getFullYear() + 1, bMonth, bDate);
    }

    const diffMs = nextBday.getTime() - today.getTime();
    const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isToday = daysLeft === 0;

    const formatted = bday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    return { daysLeft, isToday, formatted };
  } catch {
    return { daysLeft: -1, isToday: false, formatted: 'Unset' };
  }
}

export function calculateDaysTogether(anniversaryDateStr?: string): number {
  if (!anniversaryDateStr) return 1;
  const start = new Date(anniversaryDateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
