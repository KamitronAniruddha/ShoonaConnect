import { UserProfile, Couple, Message, Memory, ImportantDate, LoveLetter, SharedNote, BucketItem, DailyAnswer, MoodCheckIn, CustomCoupleQuestion } from '../types';

export function profileRowToUserProfile(row: any): UserProfile {
  if (!row) return null as any;
  return {
    uid: row.id,
    email: row.email || '',
    username: row.username || '',
    displayName: row.display_name || 'Soulmate',
    nickname: row.nickname || '',
    gender: row.gender,
    genderCustom: row.gender_custom,
    petNameForPartner: row.pet_name_for_partner,
    petNameForSelf: row.pet_name_for_self,
    occupation: row.occupation || '',
    occupationType: row.occupation_type || 'profession',
    photoURL: row.photo_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${row.id}`,
    coupleId: row.couple_id || null,
    pairCode: row.pair_code || null,
    bio: row.bio || '',
    status: row.status,
    loveLanguage: row.love_language,
    birthday: row.birthday,
    pronouns: row.pronouns,
    city: row.city,
    onboardingCompleted: Boolean(row.onboarding_completed),
    lastActiveAt: row.last_active_at,
    isOnline: Boolean(row.is_online),
    lastDissolutionNotice: row.last_dissolution_notice || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function userProfileToRow(profile: Partial<UserProfile>): any {
  const row: Record<string, any> = {};
  if (profile.username !== undefined) row.username = profile.username;
  if (profile.displayName !== undefined) row.display_name = profile.displayName;
  if (profile.nickname !== undefined) row.nickname = profile.nickname;
  if (profile.gender !== undefined) row.gender = profile.gender;
  if (profile.genderCustom !== undefined) row.gender_custom = profile.genderCustom;
  if (profile.petNameForPartner !== undefined) row.pet_name_for_partner = profile.petNameForPartner;
  if (profile.petNameForSelf !== undefined) row.pet_name_for_self = profile.petNameForSelf;
  if (profile.occupation !== undefined) row.occupation = profile.occupation;
  if (profile.occupationType !== undefined) row.occupation_type = profile.occupationType;
  if (profile.photoURL !== undefined) row.photo_url = profile.photoURL;
  if (profile.coupleId !== undefined) row.couple_id = profile.coupleId;
  if (profile.pairCode !== undefined) row.pair_code = profile.pairCode;
  if (profile.bio !== undefined) row.bio = profile.bio;
  if (profile.status !== undefined) row.status = profile.status;
  if (profile.loveLanguage !== undefined) row.love_language = profile.loveLanguage;
  if (profile.birthday !== undefined) row.birthday = profile.birthday;
  if (profile.pronouns !== undefined) row.pronouns = profile.pronouns;
  if (profile.city !== undefined) row.city = profile.city;
  if (profile.onboardingCompleted !== undefined) row.onboarding_completed = profile.onboardingCompleted;
  if (profile.lastActiveAt !== undefined) row.last_active_at = profile.lastActiveAt;
  if (profile.isOnline !== undefined) row.is_online = profile.isOnline;
  if (profile.lastDissolutionNotice !== undefined) row.last_dissolution_notice = profile.lastDissolutionNotice;
  row.updated_at = new Date().toISOString();
  return row;
}

export function coupleRowToCouple(row: any): Couple {
  if (!row) return null as any;
  return {
    id: row.id,
    pairCode: row.pair_code,
    userIds: row.user_ids || [],
    userNames: row.user_names || {},
    userPhotos: row.user_photos || {},
    creatorId: row.creator_id,
    partnerId: row.partner_id || null,
    status: row.status || 'pending',
    pendingJoinRequest: row.pending_join_request || null,
    anniversaryDate: row.anniversary_date,
    anniversaryTime: row.anniversary_time,
    datingStartDate: row.dating_start_date,
    datingStartTime: row.dating_start_time,
    birthdays: row.birthdays || {},
    partner1Birthday: row.partner1_birthday,
    partner2Birthday: row.partner2_birthday,
    coupleName: row.couple_name,
    relationshipStatus: row.relationship_status || 'dating',
    relationshipStory: row.relationship_story || '',
    favoriteSong: row.favorite_song || '',
    theme: row.theme || 'rose',
    wallpaper: row.wallpaper,
    pinLock: row.pin_lock || null,
    customSymbolP1: row.custom_symbol_p1 || '❤️',
    customSymbolP2: row.custom_symbol_p2 || '💖',
    dissolvedBy: row.dissolved_by,
    dissolvedByName: row.dissolved_by_name,
    dissolutionReason: row.dissolution_reason,
    dissolvedAt: row.dissolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function coupleToRow(couple: Partial<Couple>): any {
  const row: Record<string, any> = {};
  if (couple.pairCode !== undefined) row.pair_code = couple.pairCode;
  if (couple.userIds !== undefined) row.user_ids = couple.userIds;
  if (couple.userNames !== undefined) row.user_names = couple.userNames;
  if (couple.userPhotos !== undefined) row.user_photos = couple.userPhotos;
  if (couple.creatorId !== undefined) row.creator_id = couple.creatorId;
  if (couple.partnerId !== undefined) row.partner_id = couple.partnerId;
  if (couple.status !== undefined) row.status = couple.status;
  if (couple.pendingJoinRequest !== undefined) row.pending_join_request = couple.pendingJoinRequest;
  if (couple.anniversaryDate !== undefined) row.anniversary_date = couple.anniversaryDate;
  if (couple.anniversaryTime !== undefined) row.anniversary_time = couple.anniversaryTime;
  if (couple.datingStartDate !== undefined) row.dating_start_date = couple.datingStartDate;
  if (couple.datingStartTime !== undefined) row.dating_start_time = couple.datingStartTime;
  if (couple.birthdays !== undefined) row.birthdays = couple.birthdays;
  if (couple.partner1Birthday !== undefined) row.partner1_birthday = couple.partner1Birthday;
  if (couple.partner2Birthday !== undefined) row.partner2_birthday = couple.partner2Birthday;
  if (couple.coupleName !== undefined) row.couple_name = couple.coupleName;
  if (couple.relationshipStatus !== undefined) row.relationship_status = couple.relationshipStatus;
  if (couple.relationshipStory !== undefined) row.relationship_story = couple.relationshipStory;
  if (couple.favoriteSong !== undefined) row.favorite_song = couple.favoriteSong;
  if (couple.theme !== undefined) row.theme = couple.theme;
  if (couple.wallpaper !== undefined) row.wallpaper = couple.wallpaper;
  if (couple.pinLock !== undefined) row.pin_lock = couple.pinLock;
  if (couple.customSymbolP1 !== undefined) row.custom_symbol_p1 = couple.customSymbolP1;
  if (couple.customSymbolP2 !== undefined) row.custom_symbol_p2 = couple.customSymbolP2;
  if (couple.dissolvedBy !== undefined) row.dissolved_by = couple.dissolvedBy;
  if (couple.dissolvedByName !== undefined) row.dissolved_by_name = couple.dissolvedByName;
  if (couple.dissolutionReason !== undefined) row.dissolution_reason = couple.dissolutionReason;
  if (couple.dissolvedAt !== undefined) row.dissolved_at = couple.dissolvedAt;
  row.updated_at = new Date().toISOString();
  return row;
}

export function messageRowToMessage(row: any): Message {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    text: row.text || '',
    type: row.type || 'text',
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    replyTo: row.reply_to || undefined,
    reactions: row.reactions || {},
    isEdited: Boolean(row.is_edited),
    isPinned: Boolean(row.is_pinned),
    isStarred: Boolean(row.is_starred),
    readBy: row.read_by || [],
    dateInvite: row.date_invite || undefined,
    gameChallenge: row.game_challenge || undefined,
    poll: row.poll || undefined,
    sharedList: row.shared_list || undefined,
    sharedNote: row.shared_note || undefined,
    loveNote: row.love_note || undefined,
    countdown: row.countdown || undefined,
    location: row.location || undefined,
    reminder: row.reminder || undefined,
    createdAt: row.created_at,
  };
}

export function messageToRow(msg: Partial<Message>): any {
  const row: Record<string, any> = {};
  if (msg.coupleId !== undefined) row.couple_id = msg.coupleId;
  if (msg.senderId !== undefined) row.sender_id = msg.senderId;
  if (msg.senderName !== undefined) row.sender_name = msg.senderName;
  if (msg.text !== undefined) row.text = msg.text;
  if (msg.type !== undefined) row.type = msg.type;
  if (msg.mediaUrl !== undefined) row.media_url = msg.mediaUrl;
  if (msg.mediaType !== undefined) row.media_type = msg.mediaType;
  if (msg.replyTo !== undefined) row.reply_to = msg.replyTo;
  if (msg.reactions !== undefined) row.reactions = msg.reactions;
  if (msg.isEdited !== undefined) row.is_edited = msg.isEdited;
  if (msg.isPinned !== undefined) row.is_pinned = msg.isPinned;
  if (msg.isStarred !== undefined) row.is_starred = msg.isStarred;
  if (msg.readBy !== undefined) row.read_by = msg.readBy;
  if (msg.dateInvite !== undefined) row.date_invite = msg.dateInvite;
  if (msg.gameChallenge !== undefined) row.game_challenge = msg.gameChallenge;
  if (msg.poll !== undefined) row.poll = msg.poll;
  if (msg.sharedList !== undefined) row.shared_list = msg.sharedList;
  if (msg.sharedNote !== undefined) row.shared_note = msg.sharedNote;
  if (msg.loveNote !== undefined) row.love_note = msg.loveNote;
  if (msg.countdown !== undefined) row.countdown = msg.countdown;
  if (msg.location !== undefined) row.location = msg.location;
  if (msg.reminder !== undefined) row.reminder = msg.reminder;
  if (msg.createdAt !== undefined) row.created_at = msg.createdAt;
  return row;
}

export function memoryRowToMemory(row: any): Memory {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    title: row.title,
    description: row.description || '',
    date: row.date,
    location: row.location || '',
    mediaUrls: row.media_urls || [],
    mood: row.mood || 'blessed',
    tags: row.tags || [],
    isFavorite: Boolean(row.is_favorite),
    isTimeCapsule: Boolean(row.is_capsule),
    capsuleUnlockDate: row.capsule_unlock_date || undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: row.created_at,
  };
}

export function memoryToRow(mem: Partial<Memory>): any {
  const row: Record<string, any> = {};
  if (mem.coupleId !== undefined) row.couple_id = mem.coupleId;
  if (mem.title !== undefined) row.title = mem.title;
  if (mem.description !== undefined) row.description = mem.description;
  if (mem.date !== undefined) row.date = mem.date;
  if (mem.location !== undefined) row.location = mem.location;
  if (mem.mediaUrls !== undefined) row.media_urls = mem.mediaUrls;
  if (mem.mood !== undefined) row.mood = mem.mood;
  if (mem.tags !== undefined) row.tags = mem.tags;
  if (mem.isFavorite !== undefined) row.is_favorite = mem.isFavorite;
  if (mem.capsuleUnlockDate !== undefined) row.capsule_unlock_date = mem.capsuleUnlockDate;
  if (mem.isTimeCapsule !== undefined) row.is_capsule = mem.isTimeCapsule;
  if (mem.createdBy !== undefined) row.created_by = mem.createdBy;
  if (mem.createdByName !== undefined) row.created_by_name = mem.createdByName;
  if (mem.createdAt !== undefined) row.created_at = mem.createdAt;
  return row;
}

export function dateRowToImportantDate(row: any): ImportantDate {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    title: row.title,
    date: row.date,
    time: row.time || undefined,
    description: row.description || '',
    category: row.category || 'anniversary',
    isRecurring: Boolean(row.is_recurring),
    reminderDays: row.reminder_days ?? 0,
    icon: row.icon || 'Heart',
    giftIdeas: row.gift_ideas || '',
    celebrationPlan: row.celebration_notes || '',
    photos: row.photos || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function dateToRow(date: Partial<ImportantDate>): any {
  const row: Record<string, any> = {};
  if (date.coupleId !== undefined) row.couple_id = date.coupleId;
  if (date.title !== undefined) row.title = date.title;
  if (date.date !== undefined) row.date = date.date;
  if (date.description !== undefined) row.description = date.description;
  if (date.category !== undefined) row.category = date.category;
  if (date.isRecurring !== undefined) row.is_recurring = date.isRecurring;
  if (date.reminderDays !== undefined) row.reminder_days = date.reminderDays;
  if (date.icon !== undefined) row.icon = date.icon;
  if (date.giftIdeas !== undefined) row.gift_ideas = date.giftIdeas;
  if (date.celebrationPlan !== undefined) row.celebration_notes = date.celebrationPlan;
  if (date.createdBy !== undefined) row.created_by = date.createdBy;
  if (date.createdAt !== undefined) row.created_at = date.createdAt;
  return row;
}

export function letterRowToLoveLetter(row: any): LoveLetter {
  if (!row) return null as any;
  const meta = row.metadata || {};
  return {
    id: row.id,
    coupleId: row.couple_id,
    authorId: row.author_id,
    authorName: row.author_name,
    senderId: row.author_id,
    senderName: row.author_name,
    recipientId: row.recipient_id || undefined,
    recipientName: meta.recipientName || undefined,
    title: row.title,
    content: row.content,
    occasion: meta.occasion || undefined,
    theme: row.theme || 'parchment',
    fontStyle: row.font_style || 'serif',
    openAt: row.open_at || undefined,
    unlockDate: row.open_at || undefined,
    waxSeal: row.wax_seal || 'heart',
    paperStyle: meta.paperStyle || undefined,
    audioUrl: meta.audioUrl || undefined,
    polaroidUrl: meta.polaroidUrl || undefined,
    polaroidCaption: meta.polaroidCaption || undefined,
    isPasswordProtected: Boolean(meta.isPasswordProtected || row.protection_type === 'password'),
    secretPassword: row.secret_password || undefined,
    passwordHint: meta.passwordHint || undefined,
    isQuestionProtected: Boolean(meta.isQuestionProtected || row.protection_type === 'question'),
    secretQuestion: row.secret_question || undefined,
    secretAnswer: row.secret_answer || undefined,
    secretQuestionHint: meta.secretQuestionHint || undefined,
    maxAttempts: meta.maxAttempts || undefined,
    failedAttempts: meta.failedAttempts || undefined,
    isDeletedOnWrongAnswer: meta.isDeletedOnWrongAnswer || undefined,
    isDraft: Boolean(row.is_draft),
    isRead: Boolean(row.is_read),
    isOpened: Boolean(row.is_read || meta.isOpened),
    openedAt: meta.openedAt || undefined,
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at,
  };
}

export function letterToRow(letter: Partial<LoveLetter>): any {
  const row: Record<string, any> = {};
  if (letter.coupleId !== undefined) row.couple_id = letter.coupleId;
  const authorId = letter.senderId || letter.authorId;
  if (authorId !== undefined) row.author_id = authorId;
  const authorName = letter.senderName || letter.authorName;
  if (authorName !== undefined) row.author_name = authorName;
  if (letter.recipientId !== undefined) row.recipient_id = letter.recipientId;
  if (letter.title !== undefined) row.title = letter.title;
  if (letter.content !== undefined) row.content = letter.content;
  if (letter.theme !== undefined) row.theme = letter.theme;
  if (letter.fontStyle !== undefined) row.font_style = letter.fontStyle;
  const unlockDate = letter.unlockDate || letter.openAt;
  if (unlockDate !== undefined) row.open_at = unlockDate;
  if (letter.waxSeal !== undefined) row.wax_seal = letter.waxSeal;
  if (letter.secretPassword !== undefined) row.secret_password = letter.secretPassword;
  if (letter.secretQuestion !== undefined) row.secret_question = letter.secretQuestion;
  if (letter.secretAnswer !== undefined) row.secret_answer = letter.secretAnswer;
  if (letter.isDraft !== undefined) row.is_draft = letter.isDraft;
  if (letter.isRead !== undefined) row.is_read = letter.isRead;
  if (letter.isFavorite !== undefined) row.is_favorite = letter.isFavorite;
  if (letter.createdAt !== undefined) row.created_at = letter.createdAt;

  row.metadata = {
    recipientName: letter.recipientName,
    occasion: letter.occasion,
    paperStyle: letter.paperStyle,
    audioUrl: letter.audioUrl,
    polaroidUrl: letter.polaroidUrl,
    polaroidCaption: letter.polaroidCaption,
    isPasswordProtected: letter.isPasswordProtected,
    passwordHint: letter.passwordHint,
    isQuestionProtected: letter.isQuestionProtected,
    secretQuestionHint: letter.secretQuestionHint,
    maxAttempts: letter.maxAttempts,
    failedAttempts: letter.failedAttempts,
    isDeletedOnWrongAnswer: letter.isDeletedOnWrongAnswer,
    isOpened: letter.isOpened,
    openedAt: letter.openedAt,
  };

  return row;
}

// ---------------- SHARED NOTES MAPPERS ----------------
export function noteRowToSharedNote(row: any): SharedNote {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    title: row.title,
    content: row.content || '',
    items: row.items || [],
    category: row.category || 'list',
    color: row.color || 'rose',
    isPinned: Boolean(row.is_pinned),
    createdBy: row.updated_by || undefined,
    createdByName: row.created_by_name || undefined,
    updatedBy: row.updated_by || undefined,
    updatedByName: row.updated_by_name || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function noteToRow(note: Partial<SharedNote>): any {
  const row: Record<string, any> = {};
  if (note.coupleId !== undefined) row.couple_id = note.coupleId;
  if (note.title !== undefined) row.title = note.title;
  if (note.content !== undefined) row.content = note.content;
  if (note.items !== undefined) row.items = note.items;
  if (note.category !== undefined) row.category = note.category;
  if (note.color !== undefined) row.color = note.color;
  if (note.isPinned !== undefined) row.is_pinned = note.isPinned;
  if (note.updatedBy !== undefined) row.updated_by = note.updatedBy;
  if (note.createdBy !== undefined && !row.updated_by) row.updated_by = note.createdBy;
  if (note.createdAt !== undefined) row.created_at = note.createdAt;
  if (note.updatedAt !== undefined) row.updated_at = note.updatedAt;
  return row;
}

// ---------------- BUCKET LIST MAPPERS ----------------
export function bucketItemRowToBucketItem(row: any): BucketItem {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    title: row.title,
    description: row.description || '',
    category: row.category || 'travel',
    status: row.is_completed ? 'completed' : 'planned',
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at || null,
    createdBy: row.created_by || undefined,
    createdByName: row.created_by_name || undefined,
    photoUrl: row.photo_url || undefined,
    createdAt: row.created_at,
  };
}

export function bucketItemToRow(item: Partial<BucketItem>): any {
  const row: Record<string, any> = {};
  if (item.coupleId !== undefined) row.couple_id = item.coupleId;
  if (item.title !== undefined) row.title = item.title;
  if (item.description !== undefined) row.description = item.description;
  if (item.category !== undefined) row.category = item.category;
  if (item.isCompleted !== undefined) row.is_completed = item.isCompleted;
  if (item.completedAt !== undefined) row.completed_at = item.completedAt;
  if (item.photoUrl !== undefined) row.photo_url = item.photoUrl;
  if (item.createdBy !== undefined) row.created_by = item.createdBy;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  return row;
}

// ---------------- DAILY ANSWERS MAPPERS ----------------
export function dailyAnswerRowToDailyAnswer(row: any): DailyAnswer {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    date: row.date,
    questionId: row.question_id,
    questionText: row.question_text,
    category: row.category || undefined,
    customAuthorId: row.custom_author_id || undefined,
    customAuthorName: row.custom_author_name || undefined,
    changedBy: row.changed_by || undefined,
    changedAt: row.changed_at || undefined,
    isStarred: Boolean(row.is_starred),
    answers: row.answers || {},
    isRevealed: Boolean(row.is_revealed),
    updatedAt: row.updated_at || row.created_at,
    createdAt: row.created_at,
  };
}

export function dailyAnswerToRow(answer: Partial<DailyAnswer>): any {
  const row: Record<string, any> = {};
  if (answer.id !== undefined) row.id = answer.id;
  if (answer.coupleId !== undefined) row.couple_id = answer.coupleId;
  if (answer.date !== undefined) row.date = answer.date;
  if (answer.questionId !== undefined) row.question_id = answer.questionId;
  if (answer.questionText !== undefined) row.question_text = answer.questionText;
  if (answer.category !== undefined) row.category = answer.category;
  if (answer.customAuthorId !== undefined) row.custom_author_id = answer.customAuthorId;
  if (answer.customAuthorName !== undefined) row.custom_author_name = answer.customAuthorName;
  if (answer.changedBy !== undefined) row.changed_by = answer.changedBy;
  if (answer.changedAt !== undefined) row.changed_at = answer.changedAt;
  if (answer.isStarred !== undefined) row.is_starred = answer.isStarred;
  if (answer.answers !== undefined) row.answers = answer.answers;
  if (answer.isRevealed !== undefined) row.is_revealed = answer.isRevealed;
  if (answer.createdAt !== undefined) row.created_at = answer.createdAt;
  if (answer.updatedAt !== undefined) row.updated_at = answer.updatedAt;
  return row;
}

// ---------------- MOODS MAPPERS ----------------
export function moodRowToMoodCheckIn(row: any): MoodCheckIn {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    userId: row.user_id,
    userName: row.user_name,
    mood: row.mood,
    emoji: row.emoji,
    label: row.label || undefined,
    tags: row.feeling_tags || [],
    note: row.note || undefined,
    date: row.date,
    createdAt: row.created_at,
  };
}

export function moodToRow(mood: Partial<MoodCheckIn>): any {
  const row: Record<string, any> = {};
  if (mood.coupleId !== undefined) row.couple_id = mood.coupleId;
  if (mood.userId !== undefined) row.user_id = mood.userId;
  if (mood.userName !== undefined) row.user_name = mood.userName;
  if (mood.mood !== undefined) row.mood = mood.mood;
  if (mood.emoji !== undefined) row.emoji = mood.emoji;
  if (mood.note !== undefined) row.note = mood.note;
  if (mood.date !== undefined) row.date = mood.date;
  if (mood.tags !== undefined) row.feeling_tags = mood.tags;
  if (mood.createdAt !== undefined) row.created_at = mood.createdAt;
  return row;
}

// ---------------- CUSTOM QUESTIONS MAPPERS ----------------
export function customQuestionRowToCustomQuestion(row: any): CustomCoupleQuestion {
  if (!row) return null as any;
  return {
    id: row.id,
    coupleId: row.couple_id,
    question: row.question,
    category: row.category || 'custom',
    authorId: row.created_by,
    authorName: row.author_name || 'Partner',
    createdAt: row.created_at,
  };
}

export function customQuestionToRow(cq: Partial<CustomCoupleQuestion>): any {
  const row: Record<string, any> = {};
  if (cq.coupleId !== undefined) row.couple_id = cq.coupleId;
  if (cq.question !== undefined) row.question = cq.question;
  if (cq.category !== undefined) row.category = cq.category;
  if (cq.authorId !== undefined) row.created_by = cq.authorId;
  if (cq.createdAt !== undefined) row.created_at = cq.createdAt;
  return row;
}
