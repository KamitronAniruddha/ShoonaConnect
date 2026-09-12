export interface DissolutionNotice {
  dissolvedByName: string;
  dissolvedAt: string;
  reason?: string;
}

export interface JoinRequest {
  requesterId: string;
  requesterName: string;
  requesterNickname?: string;
  requesterPhoto?: string;
  requesterPhotoURL?: string;
  requesterCity?: string;
  requesterOccupation?: string;
  requesterOccupationType?: 'profession' | 'student' | 'creator' | 'other';
  requesterBio?: string;
  requesterLoveLanguage?: 'words_of_affirmation' | 'quality_time' | 'receiving_gifts' | 'acts_of_service' | 'physical_touch' | string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'declined';
  declinedAt?: string;
}

export interface UserProfile {
  uid: string;
  email?: string;
  username?: string;
  displayName: string;
  nickname?: string;
  gender?: 'female' | 'male' | 'non_binary' | 'other' | 'prefer_not_to_say' | string;
  genderCustom?: string;
  petNameForPartner?: string;
  petNameForSelf?: string;
  occupation?: string;
  occupationType?: 'profession' | 'student' | 'creator' | 'other';
  photoURL?: string;
  coupleId?: string | null;
  pairCode?: string | null;
  bio?: string;
  status?: string;
  loveLanguage?: 'words_of_affirmation' | 'quality_time' | 'receiving_gifts' | 'acts_of_service' | 'physical_touch';
  birthday?: string;
  pronouns?: string;
  city?: string;
  onboardingCompleted?: boolean;
  lastActiveAt?: string;
  isOnline?: boolean;
  lastDissolutionNotice?: DissolutionNotice | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastActiveAt: string;
  updatedAt: string;
}

export interface Couple {
  id: string;
  pairCode: string;
  userIds: string[];
  userNames?: Record<string, string>;
  userPhotos?: Record<string, string>;
  creatorId: string;
  partnerId?: string | null;
  status: 'pending' | 'connected' | 'dissolved';
  pendingJoinRequest?: JoinRequest | null;
  anniversaryDate?: string;
  anniversaryTime?: string;
  datingStartDate?: string;
  datingStartTime?: string;
  birthdays?: Record<string, string>;
  partner1Birthday?: string;
  partner2Birthday?: string;
  coupleName?: string;
  relationshipStatus?: 'dating' | 'in_relationship' | 'engaged' | 'married' | 'long_distance';
  relationshipStory?: string;
  favoriteSong?: string;
  theme?: 'rose' | 'sunset' | 'midnight' | 'emerald' | 'lavender' | 'velvet_noir' | 'celestial_aurora' | 'cherry_blossom';
  wallpaper?: string;
  pinLock?: string | null;
  customSymbolP1?: string;
  customSymbolP2?: string;
  dissolvedBy?: string;
  dissolvedByName?: string;
  dissolutionReason?: string;
  dissolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  userName?: string;
}

export interface ReplyPreview {
  messageId: string;
  senderName: string;
  text: string;
  mediaType?: string;
}

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'love_note'
  | 'date_invite'
  | 'game_challenge'
  | 'memory'
  | 'letter'
  | 'poll'
  | 'question'
  | 'countdown'
  | 'shared_list'
  | 'shared_note'
  | 'location'
  | 'reminder'
  | 'doodle'
  | 'time_capsule'
  | 'mood_pulse'
  | 'hug_kiss';

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple?: boolean;
  isClosed?: boolean;
  closedAt?: string;
  createdBy?: string;
  allowAddOptions?: boolean;
}

export interface DoodleData {
  canvasData: string; // Base64 PNG image
  canvasDataUrl?: string; // Compatibility alias
  prompt?: string;
  strokeCount?: number;
  canvasTheme?: string;
  createdBy: string;
  senderName?: string;
  drawnBy?: string;
}

export interface TimeCapsuleData {
  id?: string;
  title: string;
  unlockDate: string;
  note?: string;
  sealedBy: string;
  category?: string;
  isUnlocked?: boolean;
  unlockedAt?: string;
  mediaUrl?: string;
  items?: string[];
}

export interface MoodPulseData {
  mood: string;
  emoji: string;
  energyLevel: number; // 1 to 5
  loveLanguageNeed?: string;
  craving?: string;
  note?: string;
}

export interface DateInviteData {
  title: string;
  date: string;
  time?: string;
  location?: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  responses?: Record<string, 'accepted' | 'declined' | 'maybe'>;
}

export interface GameChallengeData {
  gameType: 'chess' | 'tictactoe' | 'would-you-rather';
  gameId?: string;
  status: 'pending' | 'accepted' | 'declined';
  challengedBy: string;
  challengerName: string;
}

export interface SharedListItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
}

export interface SharedListData {
  title: string;
  items: SharedListItem[];
}

export interface SharedNoteData {
  title: string;
  content: string;
}

export interface LoveNoteData {
  note: string;
  style: 'rose' | 'golden' | 'midnight' | 'sunset' | 'parchment' | 'galaxy';
  senderMood?: string;
  waxSeal?: string;
  openWhen?: string;
  isOpened?: boolean;
  openedAt?: string;
  reactions?: Record<string, string>;
  fontFamily?: string;
  senderId?: string;
  senderName?: string;
  senderPhoto?: string;
}

export interface CountdownData {
  title: string;
  targetDate: string;
  emoji?: string;
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  mapUrl?: string;
}

export interface ReminderData {
  title: string;
  remindAt: string;
  isCompleted?: boolean;
}

export interface FileDetails {
  name: string;
  size: number;
  mimeType?: string;
}

export interface AudioDetails {
  duration: number;
  waveData?: number[];
}

export interface Message {
  id: string;
  coupleId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  type?: MessageType;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'file';
  fileDetails?: FileDetails;
  audioDetails?: AudioDetails;
  reactions?: Record<string, string>; // userId -> emoji
  replyTo?: ReplyPreview | null;
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  readBy?: string[];
  deletedForEveryone?: boolean;
  deletedFor?: string[];
  dateInvite?: DateInviteData;
  gameChallenge?: GameChallengeData;
  pollData?: PollData;
  poll?: PollData;
  questionData?: { question: string; answers?: Record<string, string> };
  countdownData?: CountdownData;
  countdown?: CountdownData;
  sharedListData?: SharedListData;
  sharedList?: SharedListData;
  sharedNoteData?: SharedNoteData;
  sharedNote?: SharedNoteData;
  loveNoteData?: LoveNoteData;
  loveNote?: LoveNoteData;
  doodleData?: DoodleData;
  timeCapsuleData?: TimeCapsuleData;
  moodPulseData?: MoodPulseData;
  locationData?: LocationData;
  location?: LocationData;
  reminderData?: ReminderData;
  reminder?: ReminderData;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ChatThemeKey =
  | 'rose'
  | 'midnight'
  | 'burgundy'
  | 'pink_glow'
  | 'purple_night'
  | 'ocean_night'
  | 'minimal_dark';

export type ChatWallpaperPattern = 'none' | 'hearts' | 'stars' | 'bubbles' | 'geometric' | 'floral';

export interface ChatSettings {
  theme: ChatThemeKey;
  wallpaper: ChatWallpaperPattern;
  readReceipts: boolean;
  typingIndicators: boolean;
  onlineStatus: boolean;
  lastSeen: boolean;
  disappearingDuration: 'off' | '1h' | '1d' | '7d' | '30d';
  smartReplies: boolean;
}

export interface CallRecord {
  id: string;
  coupleId: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined' | 'missed';
  offer?: any;
  answer?: any;
  durationSeconds?: number;
  createdAt: string;
  endedAt?: string;
}

export interface SharedAlbumPhoto {
  id: string;
  url: string;
  caption?: string;
  addedBy: string;
  addedByName: string;
  createdAt: string;
}

export interface SharedAlbum {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  photos: SharedAlbumPhoto[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Memory {
  id: string;
  coupleId: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  mediaUrls: string[];
  mood?: string;
  tags?: string[];
  isFavorite?: boolean;
  isTimeCapsule?: boolean;
  capsuleUnlockDate?: string | null;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface ImportantDate {
  id: string;
  coupleId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  category:
    | 'anniversary'
    | 'birthday'
    | 'date_night'
    | 'trip'
    | 'milestone'
    | 'first_kiss'
    | 'first_date'
    | 'first_met'
    | 'dream'
    | 'other';
  isRecurring: boolean;
  reminderDays?: number;
  icon?: string;
  photos?: string[];
  giftIdeas?: string;
  celebrationPlan?: string;
  createdBy?: string;
  createdAt: string;
}

export interface LoveLetter {
  id: string;
  coupleId: string;
  authorId?: string;
  authorName?: string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  title: string;
  content: string;
  occasion?: string;
  theme?:
    | 'parchment'
    | 'midnight'
    | 'blush'
    | 'vintage'
    | 'lavender'
    | 'royal_gold'
    | 'airmail';
  fontStyle?: 'serif' | 'handwriting' | 'sans' | 'editorial';
  waxSeal?: 'heart' | 'rose' | 'crown' | 'infinity' | 'kiss' | 'stars' | 'lock';
  openAt?: string;
  unlockDate?: string | null;
  isDraft?: boolean;
  isRead?: boolean;
  isOpened?: boolean;
  openedAt?: string;
  paperStyle?: string;
  isFavorite?: boolean;
  audioUrl?: string;
  polaroidUrl?: string;
  polaroidCaption?: string;
  // Secret Password Protection
  isPasswordProtected?: boolean;
  secretPassword?: string;
  passwordHint?: string;
  // Secret Trivia Question (must answer correctly or letter deletes)
  isQuestionProtected?: boolean;
  secretQuestion?: string;
  secretAnswer?: string;
  secretQuestionHint?: string;
  maxAttempts?: number;
  failedAttempts?: number;
  isDeletedOnWrongAnswer?: boolean;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type NoteItem = ChecklistItem;

export interface SharedNote {
  id: string;
  coupleId: string;
  title: string;
  content?: string;
  items?: ChecklistItem[];
  category?: string;
  color?: string;
  isPinned?: boolean;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BucketItem {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  category: string;
  status?: 'planned' | 'in-progress' | 'completed';
  isCompleted?: boolean;
  completedAt?: string | null;
  createdBy?: string;
  createdByName?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface DailyAnswer {
  id: string;
  coupleId: string;
  date: string; // YYYY-MM-DD
  questionId: string;
  questionText: string;
  category?: string;
  customAuthorId?: string;
  customAuthorName?: string;
  changedBy?: string;
  changedAt?: string;
  isStarred?: boolean;
  answers: Record<string, { answer: string; answeredAt: string; userName?: string }>;
  isRevealed: boolean;
  updatedAt: string;
  createdAt?: string;
}

export interface MoodCheckIn {
  id: string;
  coupleId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  mood: string;
  emoji: string;
  label?: string;
  tags?: string[];
  note?: string;
  energyLevel?: number; // 1 to 5
  time?: string; // e.g. "06:18 PM"
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export interface CustomCoupleQuestion {
  id: string;
  coupleId: string;
  question: string;
  category: string;
  categoryLabel?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface CoupleNotification {
  id: string;
  coupleId: string;
  recipientId: string;
  type: 'message' | 'memory' | 'date' | 'letter' | 'mood' | 'partner_joined';
  title: string;
  message: string;
  linkTab?: string;
  isRead: boolean;
  createdAt: string;
}

export type TicTacToeCell = string | null;

export interface TicTacToePlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
  symbol: string; // 'X', 'O', or any chosen emoji
}

export interface TicTacToeReaction {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  emoji: string;
  createdAt: string;
}

export interface TicTacToeChatMessage {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  message: string;
  createdAt: string;
}

export interface TicTacToeMove {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  position: number;
  symbol: string;
  timestamp: string;
}

export interface TicTacToeGame {
  id: string;
  coupleId: string;
  playerX: TicTacToePlayer;
  playerO: TicTacToePlayer;
  board: TicTacToeCell[];
  currentTurn: 'X' | 'O';
  currentTurnPlayerId: string;
  winner: string | 'draw' | null;
  winnerSymbol?: string | 'draw' | null;
  winnerName?: string | null;
  winningCells: number[] | null;
  status: 'waiting' | 'in_progress' | 'completed';
  moveCount: number;
  rematchRequestedBy?: string[];
  challengeStatus?: 'pending' | 'accepted' | 'declined';
  challengedBy?: string;
  reactions?: Record<string, string>;
  lastReaction?: {
    playerId: string;
    playerName: string;
    emoji: string;
    timestamp: number;
  };
  customSymbols?: {
    [playerUid: string]: string;
  };
  timerDurationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicTacToeStats {
  totalGames: number;
  yourWins: number;
  partnerWins: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

export type ActiveTab =
  | 'home'
  | 'chat'
  | 'games'
  | 'moments'
  | 'dates'
  | 'letters'
  | 'notes'
  | 'vault'
  | 'daily'
  | 'bucket'
  | 'dreams'
  | 'timeline'
  | 'settings'
  | 'features'
  | 'achievements'
  | 'period';

export interface PeriodLog {
  id: string;
  coupleId: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  flowIntensity?: 'light' | 'medium' | 'heavy' | 'spotting';
  symptoms?: string[];
  moods?: string[];
  notes?: string;
  loggedBy: string;
  loggedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PeriodCycleAnalytics {
  averageCycleLength: number;
  averagePeriodLength: number;
  nextPeriodStartPredicted: string; // YYYY-MM-DD
  currentPhase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';
  phaseDaysLeft: number;
}
