export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'celestial';

export type AchievementCategory =
  | 'time'
  | 'letters'
  | 'moments'
  | 'dates'
  | 'daily'
  | 'bucket'
  | 'games'
  | 'sanctuary';

export interface SaathiMetrics {
  daysTogether: number;
  yearsTogether: number;
  loveLettersCount: number;
  timelockedLettersCount: number;
  openedLettersCount: number;
  longLettersCount: number; // letters with >= 500 characters
  memoriesCount: number;
  favoriteMemoriesCount: number;
  taggedMemoriesCount: number;
  photosCount: number;
  datesCount: number;
  dateNightCount: number;
  bothBirthdaysSet: boolean;
  anniversariesCelebrated: number;
  zodiacChecked: boolean;
  moodCount: number;
  dailyAnswersCount: number;
  bucketCount: number;
  completedBucketCount: number;
  travelBucketCount: number;
  gamesPlayedCount: number;
  gamesWonCount: number;
  gameReactionsCount: number;
  gameDrawOrRematch: boolean;
  hasPinLock: boolean;
  customThemeSet: boolean;
  notesCount: number;
  storySet: boolean;
  chatMessagesCount: number;
}

export interface AchievementProgress {
  currentValue: number;
  targetValue: number;
  isUnlocked: boolean;
  progressPercent: number;
  formattedProgress: string;
}

export interface SaathiBadgeDefinition {
  id: string;
  num: number;
  title: string;
  hindiTitle: string;
  subtitle: string;
  description: string;
  howToUnlock: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  iconName: string;
  unit: string;
  targetValue: number;
  checkProgress: (metrics: SaathiMetrics, unlockedCountSoFar?: number) => AchievementProgress;
}

export interface EvaluatedBadge extends SaathiBadgeDefinition {
  progress: AchievementProgress;
}

// Category Configuration & Colors
export const ACHIEVEMENT_CATEGORIES: Record<
  AchievementCategory,
  { name: string; icon: string; color: string; desc: string; count: number }
> = {
  time: {
    name: 'Time & Milestones',
    icon: '⏳',
    color: 'from-amber-500 to-rose-500',
    desc: 'Days, months, and years celebrated together',
    count: 18,
  },
  letters: {
    name: 'Love Letters',
    icon: '💌',
    color: 'from-rose-500 to-pink-600',
    desc: 'Devotion, timelocked scrolls, and written words',
    count: 8,
  },
  moments: {
    name: 'Moments & Memories',
    icon: '📸',
    color: 'from-purple-500 to-indigo-600',
    desc: 'Photographs, places visited, and tagged memories',
    count: 8,
  },
  dates: {
    name: 'Special Dates',
    icon: '📅',
    color: 'from-emerald-500 to-teal-600',
    desc: 'Anniversaries, birthdays, and date nights',
    count: 7,
  },
  daily: {
    name: 'Daily & Mood',
    icon: '💖',
    color: 'from-pink-500 to-rose-500',
    desc: 'Emotional check-ins and daily couple questions',
    count: 8,
  },
  bucket: {
    name: 'Bucket List',
    icon: '✨',
    color: 'from-amber-400 to-orange-500',
    desc: 'Shared dreams, adventures, and milestones fulfilled',
    count: 7,
  },
  games: {
    name: 'Games & Play',
    icon: '🎮',
    color: 'from-fuchsia-500 to-pink-600',
    desc: 'Tic-Tac-Toe matches, playful rivalry, and banter',
    count: 7,
  },
  sanctuary: {
    name: 'Sanctuary & Bond',
    icon: '🏰',
    color: 'from-cyan-500 to-blue-600',
    desc: 'Privacy, themes, shared notes, and the ultimate bond',
    count: 6,
  },
};

// Tier styling details
export const TIER_CONFIG: Record<
  AchievementTier,
  {
    name: string;
    label: string;
    badgeBg: string;
    border: string;
    text: string;
    glow: string;
    ring: string;
    iconColor: string;
  }
> = {
  bronze: {
    name: 'Bronze',
    label: 'Warm Bronze',
    badgeBg: 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900',
    border: 'border-amber-600/70',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.25)]',
    ring: 'ring-amber-500/40',
    iconColor: '#d97706',
  },
  silver: {
    name: 'Silver',
    label: 'Polished Silver',
    badgeBg: 'bg-gradient-to-br from-slate-400 via-slate-600 to-slate-700',
    border: 'border-slate-300/80',
    text: 'text-slate-200',
    glow: 'shadow-[0_0_18px_rgba(226,232,240,0.3)]',
    ring: 'ring-slate-300/50',
    iconColor: '#cbd5e1',
  },
  gold: {
    name: 'Gold',
    label: '24K Radiant Gold',
    badgeBg: 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600',
    border: 'border-yellow-300',
    text: 'text-yellow-200',
    glow: 'shadow-[0_0_22px_rgba(234,179,8,0.45)]',
    ring: 'ring-yellow-400/60',
    iconColor: '#eab308',
  },
  platinum: {
    name: 'Platinum',
    label: 'Iridescent Platinum',
    badgeBg: 'bg-gradient-to-br from-teal-300 via-cyan-500 to-indigo-600',
    border: 'border-cyan-300',
    text: 'text-cyan-200',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)]',
    ring: 'ring-cyan-400/60',
    iconColor: '#06b6d4',
  },
  diamond: {
    name: 'Diamond',
    label: 'Celestial Diamond',
    badgeBg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600',
    border: 'border-sky-300',
    text: 'text-sky-100',
    glow: 'shadow-[0_0_30px_rgba(56,189,248,0.6)]',
    ring: 'ring-sky-400/70',
    iconColor: '#38bdf8',
  },
  celestial: {
    name: 'Celestial Mythic',
    label: 'Supreme Mythic',
    badgeBg: 'bg-gradient-to-br from-rose-500 via-purple-600 to-amber-400',
    border: 'border-rose-300',
    text: 'text-rose-100',
    glow: 'shadow-[0_0_35px_rgba(244,63,94,0.7)]',
    ring: 'ring-rose-400/80',
    iconColor: '#f43f5e',
  },
};

// Helper to calculate simple count progress
function calcCount(current: number, target: number, unit = ''): AchievementProgress {
  const isUnlocked = current >= target;
  const progressPercent = Math.min(100, Math.round((current / target) * 100));
  return {
    currentValue: current,
    targetValue: target,
    isUnlocked,
    progressPercent,
    formattedProgress: `${current} / ${target}${unit ? ` ${unit}` : ''}`,
  };
}

// Helper to calculate boolean progress
function calcBool(isUnlocked: boolean): AchievementProgress {
  return {
    currentValue: isUnlocked ? 1 : 0,
    targetValue: 1,
    isUnlocked,
    progressPercent: isUnlocked ? 100 : 0,
    formattedProgress: isUnlocked ? 'Completed' : 'Locked',
  };
}

// -------------------------------------------------------------
// ALL 69 SAATHI ACHIEVEMENTS MASTER DEFINITION
// -------------------------------------------------------------
export const SAATHI_ACHIEVEMENTS: SaathiBadgeDefinition[] = [
  // ==========================================
  // Category 1: Time & Milestones (18 badges)
  // ==========================================
  {
    id: 'saathi-1',
    num: 1,
    title: 'First Spark',
    hindiTitle: 'पहला कदम',
    subtitle: '1 Day in Love',
    description: 'The journey of a lifetime begins with a single shared dawn.',
    howToUnlock: 'Spend your 1st day together in the Sanctuary.',
    category: 'time',
    tier: 'bronze',
    points: 50,
    iconName: 'Sparkles',
    unit: 'days',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.daysTogether, 1, 'days'),
  },
  {
    id: 'saathi-2',
    num: 2,
    title: 'First Week of Bliss',
    hindiTitle: 'एक हफ़्ता',
    subtitle: '7 Days in Love',
    description: 'Seven days of butterflies, sweet whispers, and continuous smiles.',
    howToUnlock: 'Complete 7 days together.',
    category: 'time',
    tier: 'bronze',
    points: 75,
    iconName: 'Heart',
    unit: 'days',
    targetValue: 7,
    checkProgress: (m) => calcCount(m.daysTogether, 7, 'days'),
  },
  {
    id: 'saathi-3',
    num: 3,
    title: 'Fortnight of Fondness',
    hindiTitle: 'दो हफ़्ते',
    subtitle: '14 Days in Love',
    description: 'Two beautiful weeks of discovering each other every single day.',
    howToUnlock: 'Reach 14 days together.',
    category: 'time',
    tier: 'bronze',
    points: 100,
    iconName: 'Clock',
    unit: 'days',
    targetValue: 14,
    checkProgress: (m) => calcCount(m.daysTogether, 14, 'days'),
  },
  {
    id: 'saathi-4',
    num: 4,
    title: 'First Lunar Cycle',
    hindiTitle: 'पहला महीना',
    subtitle: '30 Days (1 Month)',
    description: 'A full moon cycle completed hand in hand. One month of pure adoration.',
    howToUnlock: 'Celebrate your 1st month (30 days) together.',
    category: 'time',
    tier: 'silver',
    points: 150,
    iconName: 'Moon',
    unit: 'days',
    targetValue: 30,
    checkProgress: (m) => calcCount(m.daysTogether, 30, 'days'),
  },
  {
    id: 'saathi-5',
    num: 5,
    title: 'Golden Fifty',
    hindiTitle: 'पचास दिन',
    subtitle: '50 Days in Love',
    description: 'Halfway to a century! The roots of your love run deeper every day.',
    howToUnlock: 'Complete 50 days together.',
    category: 'time',
    tier: 'silver',
    points: 200,
    iconName: 'Flame',
    unit: 'days',
    targetValue: 50,
    checkProgress: (m) => calcCount(m.daysTogether, 50, 'days'),
  },
  {
    id: 'saathi-6',
    num: 6,
    title: 'Centurion of Love',
    hindiTitle: 'शतक प्यार का',
    subtitle: '100 Days in Love',
    description: 'A glorious century of love! 100 days of devotion and laughter.',
    howToUnlock: 'Reach the iconic 100 days milestone.',
    category: 'time',
    tier: 'silver',
    points: 250,
    iconName: 'Award',
    unit: 'days',
    targetValue: 100,
    checkProgress: (m) => calcCount(m.daysTogether, 100, 'days'),
  },
  {
    id: 'saathi-7',
    num: 7,
    title: 'Sesquicentennial Spark',
    hindiTitle: '150 सुनहरे दिन',
    subtitle: '150 Days in Love',
    description: 'One hundred and fifty days of unwavering companionship and trust.',
    howToUnlock: 'Complete 150 days together.',
    category: 'time',
    tier: 'silver',
    points: 300,
    iconName: 'Sun',
    unit: 'days',
    targetValue: 150,
    checkProgress: (m) => calcCount(m.daysTogether, 150, 'days'),
  },
  {
    id: 'saathi-8',
    num: 8,
    title: 'Bicentennial Hearts',
    hindiTitle: 'दो सौ दिन',
    subtitle: '200 Days in Love',
    description: '200 days strong. A connection that effortlessly stands the test of time.',
    howToUnlock: 'Complete 200 days together.',
    category: 'time',
    tier: 'gold',
    points: 350,
    iconName: 'Gem',
    unit: 'days',
    targetValue: 200,
    checkProgress: (m) => calcCount(m.daysTogether, 200, 'days'),
  },
  {
    id: 'saathi-9',
    num: 9,
    title: 'Silver Quarter',
    hindiTitle: '250 दिन',
    subtitle: '250 Days in Love',
    description: 'A quarter of a thousand days together. True soulmates in every way.',
    howToUnlock: 'Complete 250 days together.',
    category: 'time',
    tier: 'gold',
    points: 400,
    iconName: 'Medal',
    unit: 'days',
    targetValue: 250,
    checkProgress: (m) => calcCount(m.daysTogether, 250, 'days'),
  },
  {
    id: 'saathi-10',
    num: 10,
    title: 'Triple Century',
    hindiTitle: 'तीन सौ दिन',
    subtitle: '300 Days in Love',
    description: 'Almost an entire revolution around the sun side by side.',
    howToUnlock: 'Complete 300 days together.',
    category: 'time',
    tier: 'gold',
    points: 450,
    iconName: 'Crown',
    unit: 'days',
    targetValue: 300,
    checkProgress: (m) => calcCount(m.daysTogether, 300, 'days'),
  },
  {
    id: 'saathi-11',
    num: 11,
    title: 'Paper Anniversary',
    hindiTitle: 'पहला साल (365 Days)',
    subtitle: '1 Year Completed',
    description: '365 days of true devotion! You have completed your very first year of love.',
    howToUnlock: 'Complete 365 days (1 full year) together.',
    category: 'time',
    tier: 'platinum',
    points: 600,
    iconName: 'Trophy',
    unit: 'days',
    targetValue: 365,
    checkProgress: (m) => calcCount(m.daysTogether, 365, 'days'),
  },
  {
    id: 'saathi-12',
    num: 12,
    title: 'Half-Thousand Suns',
    hindiTitle: '500 दिन',
    subtitle: '500 Days in Love',
    description: 'Five hundred mornings waking up knowing you are loved unconditionally.',
    howToUnlock: 'Complete 500 days together.',
    category: 'time',
    tier: 'platinum',
    points: 700,
    iconName: 'Sparkles',
    unit: 'days',
    targetValue: 500,
    checkProgress: (m) => calcCount(m.daysTogether, 500, 'days'),
  },
  {
    id: 'saathi-13',
    num: 13,
    title: 'Cotton Milestone',
    hindiTitle: 'दो साल (730 Days)',
    subtitle: '2 Years Completed',
    description: 'Two wonderful years woven together like the softest, strongest cotton.',
    howToUnlock: 'Complete 730 days (2 years) together.',
    category: 'time',
    tier: 'platinum',
    points: 800,
    iconName: 'HeartHandshake',
    unit: 'days',
    targetValue: 730,
    checkProgress: (m) => calcCount(m.daysTogether, 730, 'days'),
  },
  {
    id: 'saathi-14',
    num: 14,
    title: 'Leather & Loyalty',
    hindiTitle: 'तीन साल (1095 Days)',
    subtitle: '3 Years Completed',
    description: 'Resilient, enduring, and beautifully seasoned through three whole years.',
    howToUnlock: 'Complete 1,095 days (3 years) together.',
    category: 'time',
    tier: 'diamond',
    points: 1000,
    iconName: 'ShieldCheck',
    unit: 'days',
    targetValue: 1095,
    checkProgress: (m) => calcCount(m.daysTogether, 1095, 'days'),
  },
  {
    id: 'saathi-15',
    num: 15,
    title: 'Wooden Devotion',
    hindiTitle: 'चार साल (1460 Days)',
    subtitle: '4 Years Completed',
    description: 'Deep roots and towering branches that shelter both your hearts.',
    howToUnlock: 'Complete 1,460 days (4 years) together.',
    category: 'time',
    tier: 'diamond',
    points: 1200,
    iconName: 'Trees',
    unit: 'days',
    targetValue: 1460,
    checkProgress: (m) => calcCount(m.daysTogether, 1460, 'days'),
  },
  {
    id: 'saathi-16',
    num: 16,
    title: 'Lustrous Five',
    hindiTitle: 'पांच साल (1825 Days)',
    subtitle: '5 Years Completed',
    description: 'Half a decade of shared life, triumphs, tears, and eternal devotion.',
    howToUnlock: 'Complete 1,825 days (5 years) together.',
    category: 'time',
    tier: 'diamond',
    points: 1500,
    iconName: 'Gem',
    unit: 'days',
    targetValue: 1825,
    checkProgress: (m) => calcCount(m.daysTogether, 1825, 'days'),
  },
  {
    id: 'saathi-17',
    num: 17,
    title: 'Saat Phere / Seven Vows',
    hindiTitle: 'सात साल (2556 Days)',
    subtitle: '7 Years Completed',
    description: 'Seven mystical years. Every vow lived, honored, and treasured.',
    howToUnlock: 'Complete 2,556 days (7 years) together.',
    category: 'time',
    tier: 'celestial',
    points: 2000,
    iconName: 'Crown',
    unit: 'days',
    targetValue: 2556,
    checkProgress: (m) => calcCount(m.daysTogether, 2556, 'days'),
  },
  {
    id: 'saathi-18',
    num: 18,
    title: 'Tin Decade',
    hindiTitle: 'दस साल (3652 Days)',
    subtitle: '10 Years Completed',
    description: 'A full decade of sacred love! Rare, unbreakable, and everlasting.',
    howToUnlock: 'Complete 3,652 days (10 years) together.',
    category: 'time',
    tier: 'celestial',
    points: 2500,
    iconName: 'Trophy',
    unit: 'days',
    targetValue: 3652,
    checkProgress: (m) => calcCount(m.daysTogether, 3652, 'days'),
  },

  // ==========================================
  // Category 2: Love Letters & Written Devotion (8 badges)
  // ==========================================
  {
    id: 'saathi-19',
    num: 19,
    title: 'Pehla Prem Patra',
    hindiTitle: 'पहला प्रेम पत्र',
    subtitle: 'First Love Letter',
    description: 'Putting your soul into ink for the very first time.',
    howToUnlock: 'Write & send your 1st love letter in the Letters tab.',
    category: 'letters',
    tier: 'bronze',
    points: 100,
    iconName: 'Mail',
    unit: 'letters',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.loveLettersCount, 1, 'letters'),
  },
  {
    id: 'saathi-20',
    num: 20,
    title: 'Pen Pal of Passion',
    hindiTitle: 'प्रेम के तीन पत्र',
    subtitle: '3 Love Letters',
    description: 'Love letters are timeless whispers across space and hearts.',
    howToUnlock: 'Write 3 love letters.',
    category: 'letters',
    tier: 'silver',
    points: 150,
    iconName: 'FileText',
    unit: 'letters',
    targetValue: 3,
    checkProgress: (m) => calcCount(m.loveLettersCount, 3, 'letters'),
  },
  {
    id: 'saathi-21',
    num: 21,
    title: 'Soul Calligrapher',
    hindiTitle: 'सच्चा लेखक',
    subtitle: '5 Love Letters',
    description: 'Expressing adoration through poetic prose and sweet paragraphs.',
    howToUnlock: 'Write 5 love letters.',
    category: 'letters',
    tier: 'silver',
    points: 250,
    iconName: 'Edit3',
    unit: 'letters',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.loveLettersCount, 5, 'letters'),
  },
  {
    id: 'saathi-22',
    num: 22,
    title: 'Romantic Novelist',
    hindiTitle: 'प्रेम कहानीकार',
    subtitle: '10 Love Letters',
    description: 'An entire collection of passionate love letters authored together.',
    howToUnlock: 'Write 10 love letters.',
    category: 'letters',
    tier: 'gold',
    points: 400,
    iconName: 'BookOpen',
    unit: 'letters',
    targetValue: 10,
    checkProgress: (m) => calcCount(m.loveLettersCount, 10, 'letters'),
  },
  {
    id: 'saathi-23',
    num: 23,
    title: 'Time Capsule Sealed',
    hindiTitle: 'भविष्य का पत्र',
    subtitle: 'Sealed for Tomorrow',
    description: 'A secret love letter locked away until a future milestone arrives.',
    howToUnlock: 'Create at least 1 timelocked future letter.',
    category: 'letters',
    tier: 'silver',
    points: 200,
    iconName: 'Lock',
    unit: 'letters',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.timelockedLettersCount, 1, 'letters'),
  },
  {
    id: 'saathi-24',
    num: 24,
    title: 'A Letter Unveiled',
    hindiTitle: 'मुहूर्त पर खुला पत्र',
    subtitle: 'Timelock Opened',
    description: 'The magic moment when a sealed future letter finally opens.',
    howToUnlock: 'Open or unlock a timelocked letter.',
    category: 'letters',
    tier: 'silver',
    points: 200,
    iconName: 'Key',
    unit: 'letters',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.openedLettersCount, 1, 'letters'),
  },
  {
    id: 'saathi-25',
    num: 25,
    title: 'Words from the Heart',
    hindiTitle: 'गहराई से लिखा',
    subtitle: '500+ Chars Epistle',
    description: 'When words overflow straight from the chamber of your heart.',
    howToUnlock: 'Write a deep love letter with over 500 characters.',
    category: 'letters',
    tier: 'gold',
    points: 300,
    iconName: 'Scroll',
    unit: 'letters',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.longLettersCount, 1, 'letters'),
  },
  {
    id: 'saathi-26',
    num: 26,
    title: 'Eternal Epistles',
    hindiTitle: 'अमर प्रेम पत्र (15)',
    subtitle: '15 Letters Exchanged',
    description: 'A legendary archive of written romance worthy of Shakespeare.',
    howToUnlock: 'Accumulate 15 love letters in the Sanctuary.',
    category: 'letters',
    tier: 'platinum',
    points: 600,
    iconName: 'MailOpen',
    unit: 'letters',
    targetValue: 15,
    checkProgress: (m) => calcCount(m.loveLettersCount, 15, 'letters'),
  },

  // ==========================================
  // Category 3: Moments & Photographic Memories (8 badges)
  // ==========================================
  {
    id: 'saathi-27',
    num: 27,
    title: 'First Snapshot of Joy',
    hindiTitle: 'पहला लम्हा',
    subtitle: '1st Memory Saved',
    description: 'Freezing time so you can relive this beautiful moment forever.',
    howToUnlock: 'Save your first couple memory in the Moments tab.',
    category: 'moments',
    tier: 'bronze',
    points: 100,
    iconName: 'Camera',
    unit: 'memories',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.memoriesCount, 1, 'memories'),
  },
  {
    id: 'saathi-28',
    num: 28,
    title: 'Pocketful of Sunshine',
    hindiTitle: 'पांच यादें',
    subtitle: '5 Shared Memories',
    description: 'Five cherished memories captured for eternity.',
    howToUnlock: 'Save 5 memories together.',
    category: 'moments',
    tier: 'silver',
    points: 150,
    iconName: 'Image',
    unit: 'memories',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.memoriesCount, 5, 'memories'),
  },
  {
    id: 'saathi-29',
    num: 29,
    title: 'Gallery of Us',
    hindiTitle: 'हमारी गैलरी (10)',
    subtitle: '10 Shared Memories',
    description: 'Ten unforgettable chapters of your journey recorded with love.',
    howToUnlock: 'Save 10 memories together.',
    category: 'moments',
    tier: 'silver',
    points: 250,
    iconName: 'Images',
    unit: 'memories',
    targetValue: 10,
    checkProgress: (m) => calcCount(m.memoriesCount, 10, 'memories'),
  },
  {
    id: 'saathi-30',
    num: 30,
    title: 'Vault of Treasures',
    hindiTitle: 'खज़ाना यादों का (20)',
    subtitle: '20 Shared Memories',
    description: 'A goldmine of nostalgic days, warm hugs, and silly adventures.',
    howToUnlock: 'Save 20 memories together.',
    category: 'moments',
    tier: 'gold',
    points: 400,
    iconName: 'Archive',
    unit: 'memories',
    targetValue: 20,
    checkProgress: (m) => calcCount(m.memoriesCount, 20, 'memories'),
  },
  {
    id: 'saathi-31',
    num: 31,
    title: 'Starred Nostalgia',
    hindiTitle: 'पसंदीदा पल',
    subtitle: 'Favorite Memory',
    description: 'That one moment so pure and perfect that it deserves a golden star.',
    howToUnlock: 'Mark at least 1 memory as a favorite.',
    category: 'moments',
    tier: 'bronze',
    points: 100,
    iconName: 'Star',
    unit: 'starred',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.favoriteMemoriesCount, 1, 'starred'),
  },
  {
    id: 'saathi-32',
    num: 32,
    title: 'Geotagged Romantics',
    hindiTitle: 'स्थान और टैग्स',
    subtitle: 'Tagged Moments',
    description: 'Mapping where your hearts wandered and made magic.',
    howToUnlock: 'Save a memory with a location or custom tags.',
    category: 'moments',
    tier: 'silver',
    points: 150,
    iconName: 'MapPin',
    unit: 'tags',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.taggedMemoriesCount, 1, 'tags'),
  },
  {
    id: 'saathi-33',
    num: 33,
    title: 'Visual Anthology',
    hindiTitle: '25 तसवीरें',
    subtitle: '25+ Photos Saved',
    description: 'Twenty-five photographic smiles, sunset views, and holding hands.',
    howToUnlock: 'Accumulate 25 or more photos in memories and vault.',
    category: 'moments',
    tier: 'gold',
    points: 450,
    iconName: 'Layers',
    unit: 'photos',
    targetValue: 25,
    checkProgress: (m) => calcCount(m.photosCount, 25, 'photos'),
  },
  {
    id: 'saathi-34',
    num: 34,
    title: 'Lifelong Scrapbook',
    hindiTitle: 'यादों की किताब (50)',
    subtitle: '50 Memories Saved',
    description: 'An expansive museum of your private life, fifty entries strong.',
    howToUnlock: 'Save 50 memories together.',
    category: 'moments',
    tier: 'platinum',
    points: 750,
    iconName: 'BookMarked',
    unit: 'memories',
    targetValue: 50,
    checkProgress: (m) => calcCount(m.memoriesCount, 50, 'memories'),
  },

  // ==========================================
  // Category 4: Special Dates & Celebrations (7 badges)
  // ==========================================
  {
    id: 'saathi-35',
    num: 35,
    title: 'The Sacred Calendar',
    hindiTitle: 'पहला विशेष दिन',
    subtitle: '1st Important Date',
    description: 'Marking the days that define the constellation of your story.',
    howToUnlock: 'Add your 1st important date or milestone.',
    category: 'dates',
    tier: 'bronze',
    points: 100,
    iconName: 'Calendar',
    unit: 'dates',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.datesCount, 1, 'dates'),
  },
  {
    id: 'saathi-36',
    num: 36,
    title: 'Trinity of Dates',
    hindiTitle: 'तीन महत्वपूर्ण दिन',
    subtitle: '3 Important Dates',
    description: 'Three sacred occasions on your couple calendar.',
    howToUnlock: 'Save 3 special dates on your calendar.',
    category: 'dates',
    tier: 'silver',
    points: 150,
    iconName: 'CalendarDays',
    unit: 'dates',
    targetValue: 3,
    checkProgress: (m) => calcCount(m.datesCount, 3, 'dates'),
  },
  {
    id: 'saathi-37',
    num: 37,
    title: 'Date Night Connoisseurs',
    hindiTitle: 'डेट नाइट योजना',
    subtitle: 'Date Night Scheduled',
    description: 'Candlelight dinners, stargazing, and uninterrupted intimacy planned.',
    howToUnlock: 'Create a date night entry on your calendar.',
    category: 'dates',
    tier: 'silver',
    points: 200,
    iconName: 'Sparkles',
    unit: 'dates',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.dateNightCount, 1, 'dates'),
  },
  {
    id: 'saathi-38',
    num: 38,
    title: 'Birthday Synchronicity',
    hindiTitle: 'दोनों के जन्मदिन',
    subtitle: 'Birthdays Configured',
    description: 'Both partners’ birth dates synchronized with live countdowns.',
    howToUnlock: 'Set both couple birthdays in the Sanctuary.',
    category: 'dates',
    tier: 'gold',
    points: 350,
    iconName: 'Cake',
    unit: 'sync',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.bothBirthdaysSet),
  },
  {
    id: 'saathi-39',
    num: 39,
    title: 'Anniversary Celebrators',
    hindiTitle: 'सालगिरह का जश्न',
    subtitle: 'Anniversary Set',
    description: 'Honoring the exact day when your destiny aligned.',
    howToUnlock: 'Set your dating/anniversary date in the Sanctuary.',
    category: 'dates',
    tier: 'gold',
    points: 400,
    iconName: 'HeartHandshake',
    unit: 'dates',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.anniversariesCelebrated, 1, 'anniversaries'),
  },
  {
    id: 'saathi-40',
    num: 40,
    title: 'Astrological Alignment',
    hindiTitle: 'राशियों का मिलन',
    subtitle: 'Zodiac Harmony',
    description: 'Discovering how your Western zodiac constellations harmonize.',
    howToUnlock: 'View or check your couple zodiac sign compatibility card.',
    category: 'dates',
    tier: 'silver',
    points: 200,
    iconName: 'Compass',
    unit: 'astrology',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.zodiacChecked),
  },
  {
    id: 'saathi-41',
    num: 41,
    title: 'Milestone Architects',
    hindiTitle: 'त्यौहार और तारीखें (5)',
    subtitle: '5+ Dates Recorded',
    description: 'Never forgetting a single anniversary, trip, or birthday again.',
    howToUnlock: 'Keep 5 or more special dates recorded in Dates.',
    category: 'dates',
    tier: 'gold',
    points: 450,
    iconName: 'Bookmark',
    unit: 'dates',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.datesCount, 5, 'dates'),
  },

  // ==========================================
  // Category 5: Daily Rituals & Mood Connection (8 badges)
  // ==========================================
  {
    id: 'saathi-42',
    num: 42,
    title: 'Emotional Beacon',
    hindiTitle: 'पहला मूड चेक-इन',
    subtitle: '1st Mood Shared',
    description: 'Letting your partner know exactly how your heart feels today.',
    howToUnlock: 'Log your first mood check-in in Daily & Mood.',
    category: 'daily',
    tier: 'bronze',
    points: 100,
    iconName: 'Smile',
    unit: 'check-ins',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.moodCount, 1, 'check-ins'),
  },
  {
    id: 'saathi-43',
    num: 43,
    title: 'Heartbeat Harmony',
    hindiTitle: 'पांच मूड शेयर',
    subtitle: '5 Mood Check-ins',
    description: 'Regularly tuning into each other’s emotional frequencies.',
    howToUnlock: 'Complete 5 mood check-ins.',
    category: 'daily',
    tier: 'silver',
    points: 150,
    iconName: 'HeartPulse',
    unit: 'check-ins',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.moodCount, 5, 'check-ins'),
  },
  {
    id: 'saathi-44',
    num: 44,
    title: 'Fortnight of Feelings',
    hindiTitle: '14 दिन का साथ',
    subtitle: '14 Mood Check-ins',
    description: 'Two weeks of open emotional vulnerability and care.',
    howToUnlock: 'Complete 14 mood check-ins.',
    category: 'daily',
    tier: 'silver',
    points: 250,
    iconName: 'Activity',
    unit: 'check-ins',
    targetValue: 14,
    checkProgress: (m) => calcCount(m.moodCount, 14, 'check-ins'),
  },
  {
    id: 'saathi-45',
    num: 45,
    title: 'Emotional Empathy',
    hindiTitle: 'सच्चा हमसफ़र (30)',
    subtitle: '30 Mood Check-ins',
    description: 'A full month of being there for each other in good days and tough days.',
    howToUnlock: 'Complete 30 mood check-ins.',
    category: 'daily',
    tier: 'gold',
    points: 450,
    iconName: 'HeartHandshake',
    unit: 'check-ins',
    targetValue: 30,
    checkProgress: (m) => calcCount(m.moodCount, 30, 'check-ins'),
  },
  {
    id: 'saathi-46',
    num: 46,
    title: 'Curious Minds',
    hindiTitle: 'पहला सवाल जवाब',
    subtitle: '1st Question Answered',
    description: 'Answering the daily question and uncovering each other’s thoughts.',
    howToUnlock: 'Answer 1 daily couple prompt.',
    category: 'daily',
    tier: 'bronze',
    points: 100,
    iconName: 'HelpCircle',
    unit: 'answers',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.dailyAnswersCount, 1, 'answers'),
  },
  {
    id: 'saathi-47',
    num: 47,
    title: 'Five Truths',
    hindiTitle: 'पांच सवाल जवाब',
    subtitle: '5 Questions Answered',
    description: 'Learning 5 new facets about your partner’s inner universe.',
    howToUnlock: 'Answer 5 daily couple prompts.',
    category: 'daily',
    tier: 'silver',
    points: 150,
    iconName: 'MessageSquare',
    unit: 'answers',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.dailyAnswersCount, 5, 'answers'),
  },
  {
    id: 'saathi-48',
    num: 48,
    title: 'Two Minds, One Soul',
    hindiTitle: 'पंद्रह सवाल जवाब',
    subtitle: '15 Questions Answered',
    description: 'Deep psychological closeness built one daily conversation at a time.',
    howToUnlock: 'Answer 15 daily couple prompts.',
    category: 'daily',
    tier: 'gold',
    points: 400,
    iconName: 'Lightbulb',
    unit: 'answers',
    targetValue: 15,
    checkProgress: (m) => calcCount(m.dailyAnswersCount, 15, 'answers'),
  },
  {
    id: 'saathi-49',
    num: 49,
    title: 'Prompt Masters',
    hindiTitle: 'तीस सवाल जवाब',
    subtitle: '30 Questions Answered',
    description: 'Thirty revealed secrets, sweet dreams, and profound answers.',
    howToUnlock: 'Answer 30 daily couple prompts.',
    category: 'daily',
    tier: 'platinum',
    points: 650,
    iconName: 'Sparkle',
    unit: 'answers',
    targetValue: 30,
    checkProgress: (m) => calcCount(m.dailyAnswersCount, 30, 'answers'),
  },

  // ==========================================
  // Category 6: Bucket List & Shared Adventures (7 badges)
  // ==========================================
  {
    id: 'saathi-50',
    num: 50,
    title: 'A Shared Dream',
    hindiTitle: 'पहला सपना',
    subtitle: '1st Bucket List Item',
    description: 'Daring to dream together and pinning it on your shared destiny.',
    howToUnlock: 'Add 1 dream in the Bucket List tab.',
    category: 'bucket',
    tier: 'bronze',
    points: 100,
    iconName: 'CheckCircle',
    unit: 'items',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.bucketCount, 1, 'items'),
  },
  {
    id: 'saathi-51',
    num: 51,
    title: 'Dream Trio',
    hindiTitle: 'तीन सपने',
    subtitle: '3 Bucket List Items',
    description: 'Building a bucket list full of romantic escapades and goals.',
    howToUnlock: 'Add 3 bucket list items.',
    category: 'bucket',
    tier: 'silver',
    points: 150,
    iconName: 'ListPlus',
    unit: 'items',
    targetValue: 3,
    checkProgress: (m) => calcCount(m.bucketCount, 3, 'items'),
  },
  {
    id: 'saathi-52',
    num: 52,
    title: 'First Dream Realized!',
    hindiTitle: 'पहला सपना पूरा!',
    subtitle: '1 Item Completed',
    description: 'The exhilarating triumph of fulfilling your first dream together.',
    howToUnlock: 'Mark 1 bucket list dream as completed.',
    category: 'bucket',
    tier: 'gold',
    points: 300,
    iconName: 'CheckCircle2',
    unit: 'completed',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.completedBucketCount, 1, 'completed'),
  },
  {
    id: 'saathi-53',
    num: 53,
    title: 'Adventure Triad',
    hindiTitle: 'तीन सपने पूरे!',
    subtitle: '3 Items Completed',
    description: 'Three wild dreams turned into golden memories.',
    howToUnlock: 'Complete 3 bucket list items together.',
    category: 'bucket',
    tier: 'gold',
    points: 450,
    iconName: 'Trophy',
    unit: 'completed',
    targetValue: 3,
    checkProgress: (m) => calcCount(m.completedBucketCount, 3, 'completed'),
  },
  {
    id: 'saathi-54',
    num: 54,
    title: 'Dream Visionaries',
    hindiTitle: 'दस सपने',
    subtitle: '10 Bucket List Items',
    description: 'An ambitious roadmap for a thrilling life together.',
    howToUnlock: 'Add 10 bucket list items.',
    category: 'bucket',
    tier: 'silver',
    points: 350,
    iconName: 'Target',
    unit: 'items',
    targetValue: 10,
    checkProgress: (m) => calcCount(m.bucketCount, 10, 'items'),
  },
  {
    id: 'saathi-55',
    num: 55,
    title: 'Half-Dozen Triumphs',
    hindiTitle: 'छह सपने पूरे!',
    subtitle: '6 Items Completed',
    description: 'Half a dozen goals conquered as an unstoppable couple team.',
    howToUnlock: 'Complete 6 bucket list items together.',
    category: 'bucket',
    tier: 'platinum',
    points: 600,
    iconName: 'Sparkles',
    unit: 'completed',
    targetValue: 6,
    checkProgress: (m) => calcCount(m.completedBucketCount, 6, 'completed'),
  },
  {
    id: 'saathi-56',
    num: 56,
    title: 'Globetrotting Hearts',
    hindiTitle: 'सफ़र का सपना',
    subtitle: 'Travel Dream Added',
    description: 'Plotting a romantic getaway or vacation on your list.',
    howToUnlock: 'Add a travel/trip adventure to your bucket list.',
    category: 'bucket',
    tier: 'gold',
    points: 350,
    iconName: 'Plane',
    unit: 'travel',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.travelBucketCount, 1, 'travel'),
  },

  // ==========================================
  // Category 7: Games, Play & Playful Rivalry (7 badges)
  // ==========================================
  {
    id: 'saathi-57',
    num: 57,
    title: 'Game Night Initiators',
    hindiTitle: 'खेल की शुरुआत',
    subtitle: '1st Game Played',
    description: 'Sparking playful banter and laughter with couple games.',
    howToUnlock: 'Play 1 match of Couple Tic-Tac-Toe or couple games.',
    category: 'games',
    tier: 'bronze',
    points: 100,
    iconName: 'Gamepad2',
    unit: 'games',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.gamesPlayedCount, 1, 'games'),
  },
  {
    id: 'saathi-58',
    num: 58,
    title: 'First Victorious Kiss',
    hindiTitle: 'पहली जीत',
    subtitle: '1st Game Won',
    description: 'Winning bragging rights and a celebratory romantic kiss.',
    howToUnlock: 'Win 1 match in Couple Games or Tic-Tac-Toe.',
    category: 'games',
    tier: 'silver',
    points: 150,
    iconName: 'Award',
    unit: 'wins',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.gamesWonCount, 1, 'wins'),
  },
  {
    id: 'saathi-59',
    num: 59,
    title: 'Playful Rivals',
    hindiTitle: 'पांच मैच खेले',
    subtitle: '5 Games Played',
    description: 'Five rounds of fierce competition and adorable reactions.',
    howToUnlock: 'Play 5 matches of couple games.',
    category: 'games',
    tier: 'silver',
    points: 200,
    iconName: 'Swords',
    unit: 'games',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.gamesPlayedCount, 5, 'games'),
  },
  {
    id: 'saathi-60',
    num: 60,
    title: 'Strategic Sweethearts',
    hindiTitle: 'पांच जीत',
    subtitle: '5 Games Won',
    description: 'A grand strategist of romance! 5 matches won with style.',
    howToUnlock: 'Win 5 matches in Couple Games.',
    category: 'games',
    tier: 'gold',
    points: 350,
    iconName: 'Crown',
    unit: 'wins',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.gamesWonCount, 5, 'wins'),
  },
  {
    id: 'saathi-61',
    num: 61,
    title: 'Double-Digit Duels',
    hindiTitle: 'दस मैच पूरे',
    subtitle: '10 Games Played',
    description: 'Ten epic battles of wit, laughter, and quick moves.',
    howToUnlock: 'Play 10 matches of couple games.',
    category: 'games',
    tier: 'gold',
    points: 450,
    iconName: 'Flame',
    unit: 'games',
    targetValue: 10,
    checkProgress: (m) => calcCount(m.gamesPlayedCount, 10, 'games'),
  },
  {
    id: 'saathi-62',
    num: 62,
    title: 'Emoji Banter Maestro',
    hindiTitle: 'लाइव रिएक्शन',
    subtitle: 'In-Game Reaction Sent',
    description: 'Throwing live emoji reactions or sweet chat messages mid-game.',
    howToUnlock: 'Send an in-game reaction or chat during a match.',
    category: 'games',
    tier: 'silver',
    points: 150,
    iconName: 'SmilePlus',
    unit: 'reactions',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.gameReactionsCount, 1, 'reactions'),
  },
  {
    id: 'saathi-63',
    num: 63,
    title: 'The Friendly Standoff',
    hindiTitle: 'बराबर की टक्कर',
    subtitle: 'Draw or Rematch',
    description: 'Equally matched in intellect and love! A tied game or rematch fought.',
    howToUnlock: 'Complete a tied game or rematch in Couple Tic-Tac-Toe.',
    category: 'games',
    tier: 'silver',
    points: 150,
    iconName: 'RefreshCw',
    unit: 'standoff',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.gameDrawOrRematch || m.gamesPlayedCount >= 2),
  },

  // ==========================================
  // Category 8: Sanctuary Secrets, Notes & Security (6 badges)
  // ==========================================
  {
    id: 'saathi-64',
    num: 64,
    title: 'Fortress of Privacy',
    hindiTitle: 'गुप्त तिजोरी (PIN)',
    subtitle: '4-Digit PIN Enabled',
    description: 'Securing your love sanctuary behind military-grade PIN protection.',
    howToUnlock: 'Set up a 4-digit PIN lock in Settings.',
    category: 'sanctuary',
    tier: 'silver',
    points: 200,
    iconName: 'Lock',
    unit: 'security',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.hasPinLock),
  },
  {
    id: 'saathi-65',
    num: 65,
    title: 'Chameleon of Romance',
    hindiTitle: 'थीम का जादू',
    subtitle: 'Custom Theme Set',
    description: 'Infusing your sanctuary with Velvet Noir, Sakura, or Celestial Aurora.',
    howToUnlock: 'Customize your theme palette in Settings or Home.',
    category: 'sanctuary',
    tier: 'bronze',
    points: 100,
    iconName: 'Palette',
    unit: 'theme',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.customThemeSet),
  },
  {
    id: 'saathi-66',
    num: 66,
    title: 'First Shared Scroll',
    hindiTitle: 'पहला साझा नोट',
    subtitle: '1 Shared Note Created',
    description: 'A collaborative notepad for grocery runs, romantic lists, and ideas.',
    howToUnlock: 'Create 1 shared note in the Shared Notes tab.',
    category: 'sanctuary',
    tier: 'bronze',
    points: 100,
    iconName: 'FileEdit',
    unit: 'notes',
    targetValue: 1,
    checkProgress: (m) => calcCount(m.notesCount, 1, 'notes'),
  },
  {
    id: 'saathi-67',
    num: 67,
    title: 'Life Harmony',
    hindiTitle: 'पांच साझे नोट्स',
    subtitle: '5 Shared Notes',
    description: 'Organizing your shared life with checklists, secrets, and trip plans.',
    howToUnlock: 'Create 5 shared notes in Shared Notes.',
    category: 'sanctuary',
    tier: 'silver',
    points: 200,
    iconName: 'Files',
    unit: 'notes',
    targetValue: 5,
    checkProgress: (m) => calcCount(m.notesCount, 5, 'notes'),
  },
  {
    id: 'saathi-68',
    num: 68,
    title: 'Love Biographers',
    hindiTitle: 'हमारी प्रेम कहानी',
    subtitle: 'Story & Bios Set',
    description: 'Documenting how you met and crafting your personal profiles.',
    howToUnlock: 'Fill in your relationship story and partner bios in Settings.',
    category: 'sanctuary',
    tier: 'silver',
    points: 200,
    iconName: 'Heart',
    unit: 'story',
    targetValue: 1,
    checkProgress: (m) => calcBool(m.storySet),
  },
  {
    id: 'saathi-69',
    num: 69,
    title: 'Saathi Supreme',
    hindiTitle: 'अमर प्यार - The Ultimate Bond',
    subtitle: '35+ Badges Unlocked',
    description: 'The pinnacle of couple devotion! You have achieved celestial legendary status in Saathi Achievements.',
    howToUnlock: 'Unlock 35 or more badges across all categories to attain Saathi Supreme.',
    category: 'sanctuary',
    tier: 'celestial',
    points: 3000,
    iconName: 'Crown',
    unit: 'badges',
    targetValue: 35,
    checkProgress: (_m, unlockedCountSoFar = 0) => calcCount(unlockedCountSoFar, 35, 'badges'),
  },
];

// Evaluation engine
export function evaluateAllSaathiAchievements(
  metrics: SaathiMetrics,
  customList: SaathiBadgeDefinition[] = SAATHI_ACHIEVEMENTS
): {
  badges: EvaluatedBadge[];
  totalBadges: number;
  unlockedCount: number;
  lockedCount: number;
  totalPoints: number;
  earnedPoints: number;
  completionPercent: number;
  nextBadgeToUnlock: EvaluatedBadge | null;
  rankTitle: { title: string; hindi: string; tierColor: string };
} {
  // First pass: evaluate all badges except the meta badge (saathi-69)
  const firstPass = customList.map((badge) => {
    if (badge.id === 'saathi-69') {
      return {
        ...badge,
        progress: {
          currentValue: 0,
          targetValue: 35,
          isUnlocked: false,
          progressPercent: 0,
          formattedProgress: '0 / 35 badges',
        },
      };
    }
    return {
      ...badge,
      progress: badge.checkProgress(metrics),
    };
  });

  const unlockedWithoutSupreme = firstPass.filter((b) => b.id !== 'saathi-69' && b.progress.isUnlocked).length;

  // Second pass: evaluate saathi-69 with real count
  const badges: EvaluatedBadge[] = firstPass.map((badge) => {
    if (badge.id === 'saathi-69') {
      const progress = badge.checkProgress(metrics, unlockedWithoutSupreme);
      return {
        ...badge,
        progress,
      };
    }
    return badge;
  });

  const totalBadges = badges.length;
  const unlockedCount = badges.filter((b) => b.progress.isUnlocked).length;
  const lockedCount = totalBadges - unlockedCount;

  const totalPoints = badges.reduce((acc, b) => acc + b.points, 0);
  const earnedPoints = badges
    .filter((b) => b.progress.isUnlocked)
    .reduce((acc, b) => acc + b.points, 0);

  const completionPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Find next badge to unlock (the locked badge with highest progress percentage)
  const lockedBadges = badges.filter((b) => !b.progress.isUnlocked);
  lockedBadges.sort((a, b) => b.progress.progressPercent - a.progress.progressPercent);
  const nextBadgeToUnlock = lockedBadges[0] || null;

  // Romantic Rank Titles based on unlocked count
  let rankTitle = {
    title: 'Sweethearts',
    hindi: 'नवप्रेमी (Sweethearts)',
    tierColor: 'text-amber-400',
  };

  if (unlockedCount >= 55) {
    rankTitle = {
      title: 'Celestial Legends',
      hindi: 'अमर प्रेमी (Celestial Legends)',
      tierColor: 'text-rose-400 font-extrabold',
    };
  } else if (unlockedCount >= 40) {
    rankTitle = {
      title: 'Eternal Soulmates',
      hindi: 'अनंत हमसफ़र (Eternal Soulmates)',
      tierColor: 'text-purple-400 font-bold',
    };
  } else if (unlockedCount >= 25) {
    rankTitle = {
      title: 'Inseparable Companions',
      hindi: 'अभिन्न साथी (Inseparable)',
      tierColor: 'text-cyan-400 font-bold',
    };
  } else if (unlockedCount >= 15) {
    rankTitle = {
      title: 'Devoted Partners',
      hindi: 'समर्पित जोड़ी (Devoted)',
      tierColor: 'text-emerald-400 font-bold',
    };
  } else if (unlockedCount >= 5) {
    rankTitle = {
      title: 'Passionate Bond',
      hindi: 'गहरे हमराही (Passionate)',
      tierColor: 'text-rose-400 font-bold',
    };
  }

  return {
    badges,
    totalBadges,
    unlockedCount,
    lockedCount,
    totalPoints,
    earnedPoints,
    completionPercent,
    nextBadgeToUnlock,
    rankTitle,
  };
}
