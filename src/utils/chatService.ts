import { supabase, isSupabaseConfigured, createSafeChannel } from '../lib/supabase';
import { messageRowToMessage, messageToRow } from './supabaseMappers';
import {
  Message,
  MessageType,
  DateInviteData,
  GameChallengeData,
  PollData,
  SharedListData,
  SharedNoteData,
  LoveNoteData,
  CountdownData,
  LocationData,
  ReminderData,
  ReplyPreview,
  UserProfile,
  CallRecord,
  SharedAlbum,
  SharedAlbumPhoto,
  DoodleData,
  TimeCapsuleData,
  MoodPulseData,
} from '../types';

// ---------------------------------------------------------------------------
// Local Cache & Cross-Tab Broadcast Synchronization
// ---------------------------------------------------------------------------
const CACHE_KEY_PREFIX = 'shoona_messages_';

export function getCachedMessages(coupleId: string): Message[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + coupleId);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setCachedMessages(coupleId: string, messages: Message[]): void {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + coupleId, JSON.stringify(messages));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('shoona_chat_channel_' + coupleId);
      bc.postMessage({ type: 'SYNC_MESSAGES', messages });
      bc.close();
    }
  } catch {}
}

export function updateLocalMessage(coupleId: string, messageId: string, updater: (msg: Message) => Message): void {
  try {
    const list = getCachedMessages(coupleId);
    const updated = list.map((m) => (m.id === messageId ? updater(m) : m));
    setCachedMessages(coupleId, updated);
  } catch {}
}

// ---------------------------------------------------------------------------
// Web Audio Procedural Sounds (Zero external audio file dependencies)
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playMessageSentSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function playMessageReceivedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    [
      { freq: 698.46, start: 0, dur: 0.25 },
      { freq: 880.0, start: 0.1, dur: 0.35 },
    ].forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.1, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + dur);
    });
  } catch {
    // ignore
  }
}

export function playLoveNoteChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    // ignore
  }
}

export function playVoteChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
}

export function playHeartbeatSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { freq: 65, time: 0, dur: 0.12, gainVal: 0.25 },
      { freq: 55, time: 0.18, dur: 0.14, gainVal: 0.2 },
    ].forEach(({ freq, time, dur, gainVal }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(35, now + time + dur);
      gain.gain.setValueAtTime(gainVal, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {}
}

export function playWaxCrackSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { freq: 280, t: 0, dur: 0.05, type: 'sawtooth' as OscillatorType },
      { freq: 440, t: 0.04, dur: 0.06, type: 'triangle' as OscillatorType },
      { freq: 880, t: 0.1, dur: 0.35, type: 'sine' as OscillatorType },
    ].forEach(({ freq, t, dur, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + t);
      gain.gain.setValueAtTime(0.08, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + dur);
    });
  } catch {}
}

let ringtoneInterval: any = null;
export function playRingtoneSound() {
  stopRingtoneSound();
  const playPulse = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch {
      // ignore
    }
  };

  playPulse();
  ringtoneInterval = setInterval(playPulse, 2800);
}

export function stopRingtoneSound() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

// ---------------------------------------------------------------------------
// Send Message (Dual-Mode: Local Storage & Supabase Sync)
// ---------------------------------------------------------------------------
export async function sendChatMessage(
  coupleId: string,
  params: {
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    text: string;
    type?: MessageType;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'file';
    fileDetails?: { name: string; size: number; mimeType?: string };
    audioDetails?: { duration: number; waveData?: number[] };
    replyTo?: ReplyPreview | null;
    loveNoteData?: LoveNoteData;
    dateInvite?: DateInviteData;
    gameChallenge?: GameChallengeData;
    pollData?: PollData;
    questionData?: { question: string; answers?: Record<string, string> };
    countdownData?: CountdownData;
    sharedListData?: SharedListData;
    sharedNoteData?: SharedNoteData;
    doodleData?: DoodleData;
    timeCapsuleData?: TimeCapsuleData;
    moodPulseData?: MoodPulseData;
    locationData?: LocationData;
    reminderData?: ReminderData;
    scheduledFor?: string;
    expiresAt?: string;
  }
): Promise<string> {
  const now = new Date().toISOString();
  const generatedId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

  // Local object for immediate display & persistence
  const localMsg: Message = {
    id: generatedId,
    coupleId,
    senderId: params.senderId,
    senderName: params.senderName,
    senderPhoto: params.senderPhoto,
    text: params.text || '',
    type: params.type || 'text',
    mediaUrl: params.mediaUrl,
    mediaType: params.mediaType,
    fileDetails: params.fileDetails,
    audioDetails: params.audioDetails,
    replyTo: params.replyTo,
    loveNoteData: params.loveNoteData,
    loveNote: params.loveNoteData,
    dateInvite: params.dateInvite,
    gameChallenge: params.gameChallenge,
    pollData: params.pollData,
    poll: params.pollData,
    questionData: params.questionData,
    countdownData: params.countdownData,
    countdown: params.countdownData,
    sharedListData: params.sharedListData,
    sharedList: params.sharedListData,
    sharedNoteData: params.sharedNoteData,
    sharedNote: params.sharedNoteData,
    doodleData: params.doodleData,
    timeCapsuleData: params.timeCapsuleData,
    moodPulseData: params.moodPulseData,
    locationData: params.locationData,
    location: params.locationData,
    reminderData: params.reminderData,
    reminder: params.reminderData,
    scheduledFor: params.scheduledFor,
    expiresAt: params.expiresAt,
    readBy: [params.senderId],
    createdAt: now,
  };

  // 1. Optimistically append to local cache
  const cached = getCachedMessages(coupleId);
  setCachedMessages(coupleId, [...cached, localMsg]);

  // 2. Prepare database payload
  const msgPayload: Record<string, any> = {
    couple_id: coupleId,
    sender_id: params.senderId,
    sender_name: params.senderName,
    sender_photo: params.senderPhoto || '',
    text: params.text || '',
    type: params.type || 'text',
    read_by: [params.senderId],
    created_at: now,
  };

  if (params.mediaUrl) msgPayload.media_url = params.mediaUrl;
  if (params.mediaType) msgPayload.media_type = params.mediaType;
  if (params.fileDetails) msgPayload.file_details = params.fileDetails;
  if (params.audioDetails) msgPayload.audio_details = params.audioDetails;
  if (params.replyTo) msgPayload.reply_to = params.replyTo;
  if (params.loveNoteData) msgPayload.love_note = params.loveNoteData;
  if (params.dateInvite) msgPayload.date_invite = params.dateInvite;
  if (params.gameChallenge) msgPayload.game_challenge = params.gameChallenge;
  if (params.pollData) msgPayload.poll = params.pollData;
  if (params.questionData) msgPayload.question_data = params.questionData;
  if (params.countdownData) msgPayload.countdown = params.countdownData;
  if (params.sharedListData) msgPayload.shared_list = params.sharedListData;
  if (params.sharedNoteData) msgPayload.shared_note = params.sharedNoteData;
  if (params.doodleData) msgPayload.doodle_data = params.doodleData;
  if (params.timeCapsuleData) msgPayload.time_capsule_data = params.timeCapsuleData;
  if (params.moodPulseData) msgPayload.mood_pulse_data = params.moodPulseData;
  if (params.locationData) msgPayload.location = params.locationData;
  if (params.reminderData) msgPayload.reminder = params.reminderData;
  if (params.scheduledFor) msgPayload.scheduled_for = params.scheduledFor;
  if (params.expiresAt) msgPayload.expires_at = params.expiresAt;

  // 3. Attempt to save in Supabase in background
  try {
    const { data } = await supabase
      .from('messages')
      .insert(msgPayload)
      .select('id')
      .single();

    if (data?.id) {
      // update ID if assigned by DB
      updateLocalMessage(coupleId, generatedId, (m) => ({ ...m, id: data.id }));
      playMessageSentSound();
      return data.id;
    }
  } catch (err) {
    console.warn('Message saved to local resilient store, remote insert warning:', err);
  }

  playMessageSentSound();
  return generatedId;
}

// ---------------------------------------------------------------------------
// Reactions, Pins, Stars, Edits, Deletes
// ---------------------------------------------------------------------------
export async function toggleMessageReaction(
  coupleId: string,
  messageId: string,
  myUid: string,
  emoji: string,
  currentReactions?: Record<string, string>
): Promise<void> {
  const updated = { ...(currentReactions || {}) };
  if (updated[myUid] === emoji) {
    delete updated[myUid];
  } else {
    updated[myUid] = emoji;
  }

  await supabase
    .from('messages')
    .update({ reactions: updated })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

export async function editChatMessage(
  coupleId: string,
  messageId: string,
  newText: string
): Promise<void> {
  await supabase
    .from('messages')
    .update({
      text: newText,
      is_edited: true,
    })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

export async function deleteChatMessage(
  coupleId: string,
  messageId: string,
  forEveryone: boolean,
  myUid: string,
  currentDeletedFor?: string[]
): Promise<void> {
  if (forEveryone) {
    await supabase
      .from('messages')
      .update({
        text: 'This message was deleted',
        media_url: null,
      })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } else {
    const list = currentDeletedFor ? [...currentDeletedFor] : [];
    if (!list.includes(myUid)) list.push(myUid);
    // Delete for self
    await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  }
}

export async function togglePinChatMessage(
  coupleId: string,
  messageId: string,
  currentPinned?: boolean
): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_pinned: !currentPinned })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

export async function toggleStarChatMessage(
  coupleId: string,
  messageId: string,
  currentStarred?: boolean
): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_starred: !currentStarred })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

export async function markChatMessageAsRead(
  coupleId: string,
  messageId: string,
  myUid: string,
  currentReadBy?: string[]
): Promise<void> {
  const list = currentReadBy ? [...currentReadBy] : [];
  if (!list.includes(myUid)) {
    list.push(myUid);
    await supabase
      .from('messages')
      .update({ read_by: list })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  }
}

// ---------------------------------------------------------------------------
// Interactive Message Handlers
// ---------------------------------------------------------------------------

// 1. Respond to Date Invite
export async function respondToDateInvite(
  coupleId: string,
  messageId: string,
  response: 'accepted' | 'declined' | 'maybe',
  inviteData: DateInviteData,
  user: UserProfile
): Promise<void> {
  const updatedResponses = { ...(inviteData.responses || {}), [user.uid]: response };
  const updatedData: DateInviteData = {
    ...inviteData,
    status: response === 'accepted' ? 'accepted' : response === 'declined' ? 'declined' : 'maybe',
    responses: updatedResponses,
  };

  await supabase
    .from('messages')
    .update({ date_invite: updatedData })
    .eq('id', messageId)
    .eq('couple_id', coupleId);

  // If accepted, also auto-add directly to couple's Important Dates!
  if (response === 'accepted') {
    try {
      await supabase.from('important_dates').insert({
        couple_id: coupleId,
        title: `Date: ${inviteData.title} 💕`,
        date: inviteData.date,
        description: `Planned in Messages! Time: ${inviteData.time || 'TBD'}, Location: ${
          inviteData.location || 'Cozy spot'
        }`,
        category: 'date_night',
        is_recurring: false,
        reminder_days: 1,
        created_at: new Date().toISOString(),
        created_by: user.uid,
      });
    } catch (err) {
      console.error('Failed to sync date invite to important_dates:', err);
    }
  }
}

// 2. Respond to Game Challenge
export async function respondToGameChallenge(
  coupleId: string,
  messageId: string,
  response: 'accepted' | 'declined',
  challengeData: GameChallengeData
): Promise<void> {
  await supabase
    .from('messages')
    .update({
      game_challenge: {
        ...challengeData,
        status: response,
      },
    })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

// 3. Vote on Poll
export async function voteOnCouplePoll(
  coupleId: string,
  messageId: string,
  optionId: string,
  myUid: string,
  pollData: PollData
): Promise<void> {
  if (pollData.isClosed) return;

  const newOptions = pollData.options.map((opt) => {
    let votes = [...(opt.votes || [])];
    if (opt.id === optionId) {
      if (votes.includes(myUid)) {
        votes = votes.filter((u) => u !== myUid);
      } else {
        votes.push(myUid);
      }
    } else if (!pollData.allowMultiple) {
      votes = votes.filter((u) => u !== myUid);
    }
    return { ...opt, votes };
  });

  const updatedPoll: PollData = {
    ...pollData,
    options: newOptions,
  };

  // Optimistic local update
  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    pollData: updatedPoll,
    poll: updatedPoll,
  }));
  playVoteChime();

  try {
    await supabase
      .from('messages')
      .update({ poll: updatedPoll })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Poll vote saved locally, remote update warning:', err);
  }
}

// 3b. Close / Reopen Poll
export async function toggleCloseCouplePoll(
  coupleId: string,
  messageId: string,
  pollData: PollData,
  isClosed: boolean
): Promise<void> {
  const updatedPoll: PollData = {
    ...pollData,
    isClosed,
  };

  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    pollData: updatedPoll,
    poll: updatedPoll,
  }));

  try {
    await supabase
      .from('messages')
      .update({ poll: updatedPoll })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Close poll update warning:', err);
  }
}

// 3c. Add Option to Poll
export async function addOptionToCouplePoll(
  coupleId: string,
  messageId: string,
  pollData: PollData,
  optionText: string
): Promise<void> {
  if (!optionText.trim()) return;
  const newOpt = {
    id: 'opt_' + Date.now(),
    text: optionText.trim(),
    votes: [],
  };
  const updatedPoll: PollData = {
    ...pollData,
    options: [...pollData.options, newOpt],
  };

  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    pollData: updatedPoll,
    poll: updatedPoll,
  }));

  try {
    await supabase
      .from('messages')
      .update({ poll: updatedPoll })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Add poll option update warning:', err);
  }
}

// 3d. Open Love Note & Crack Wax Seal
export async function openLoveNoteInChat(
  coupleId: string,
  messageId: string,
  loveNoteData: LoveNoteData
): Promise<void> {
  const updatedData: LoveNoteData = {
    ...loveNoteData,
    isOpened: true,
    openedAt: new Date().toISOString(),
  };

  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    loveNoteData: updatedData,
    loveNote: updatedData,
  }));

  try {
    await supabase
      .from('messages')
      .update({ love_note: updatedData })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Love note opened update warning:', err);
  }
}

// 3e. React to Love Note
export async function reactToLoveNote(
  coupleId: string,
  messageId: string,
  loveNoteData: LoveNoteData,
  myUid: string,
  reaction: string
): Promise<void> {
  const updatedData: LoveNoteData = {
    ...loveNoteData,
    reactions: {
      ...(loveNoteData.reactions || {}),
      [myUid]: reaction,
    },
  };

  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    loveNoteData: updatedData,
    loveNote: updatedData,
  }));

  try {
    await supabase
      .from('messages')
      .update({ love_note: updatedData })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Love note react update warning:', err);
  }
}

// 3f. Send Realtime Doodle to Couple
export async function sendDoodleToCouple(
  coupleId: string,
  user: UserProfile,
  canvasDataUrl: string,
  prompt?: string
): Promise<string> {
  const doodleData: DoodleData = {
    canvasData: canvasDataUrl,
    canvasDataUrl,
    prompt,
    strokeCount: 1,
    createdBy: user.uid,
    senderName: user.displayName,
    drawnBy: user.displayName,
  };

  return sendChatMessage(coupleId, {
    senderId: user.uid,
    senderName: user.displayName,
    senderPhoto: user.photoURL,
    text: prompt ? `🎨 Doodle: "${prompt}"` : '🎨 Shared a love doodle!',
    type: 'doodle',
    mediaUrl: canvasDataUrl,
    mediaType: 'image',
    doodleData,
  });
}

// 3g. Seal Time Capsule
export async function sealTimeCapsule(
  coupleId: string,
  user: UserProfile,
  capsuleData: TimeCapsuleData
): Promise<string> {
  return sendChatMessage(coupleId, {
    senderId: user.uid,
    senderName: user.displayName,
    senderPhoto: user.photoURL,
    text: `⏳ Time Capsule Sealed: "${capsuleData.title}" (Unlocks: ${capsuleData.unlockDate})`,
    type: 'time_capsule',
    timeCapsuleData: {
      ...capsuleData,
      sealedBy: user.displayName,
    },
  });
}

// 3h. Unlock Time Capsule
export async function unlockTimeCapsule(
  coupleId: string,
  messageId: string,
  capsuleData: TimeCapsuleData
): Promise<void> {
  const updatedData: TimeCapsuleData = {
    ...capsuleData,
    isUnlocked: true,
  };

  updateLocalMessage(coupleId, messageId, (m) => ({
    ...m,
    timeCapsuleData: updatedData,
  }));

  try {
    await supabase
      .from('messages')
      .update({ time_capsule_data: updatedData })
      .eq('id', messageId)
      .eq('couple_id', coupleId);
  } catch (err) {
    console.warn('Time capsule unlock warning:', err);
  }
}

// 3i. Send Mood Pulse
export async function sendMoodPulse(
  coupleId: string,
  user: UserProfile,
  pulseData: MoodPulseData
): Promise<string> {
  return sendChatMessage(coupleId, {
    senderId: user.uid,
    senderName: user.displayName,
    senderPhoto: user.photoURL,
    text: `💓 Mood Pulse: ${pulseData.emoji} ${pulseData.mood}`,
    type: 'mood_pulse',
    moodPulseData: pulseData,
  });
}

// 3j. Send Haptic Hug & Kiss
export async function sendHapticHugKiss(
  coupleId: string,
  user: UserProfile,
  note?: string
): Promise<string> {
  playHeartbeatSound();
  return sendChatMessage(coupleId, {
    senderId: user.uid,
    senderName: user.displayName,
    senderPhoto: user.photoURL,
    text: note || '💋 Sent a warm, lingering hug & kiss!',
    type: 'hug_kiss',
  });
}

// 4. Answer Couple Question
export async function answerCoupleQuestion(
  coupleId: string,
  messageId: string,
  myUid: string,
  answerText: string,
  currentAnswers?: Record<string, string>
): Promise<void> {
  const updatedAnswers = { ...(currentAnswers || {}), [myUid]: answerText.trim() };
  await supabase
    .from('messages')
    .update({
      question_data: {
        answers: updatedAnswers,
      },
    })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

// 5. Toggle Shared List Item in Chat
export async function toggleSharedListItem(
  coupleId: string,
  messageId: string,
  itemId: string,
  myUid: string,
  listData: SharedListData
): Promise<void> {
  const newItems = listData.items.map((item) => {
    if (item.id === itemId) {
      const nextCompleted = !item.completed;
      return {
        ...item,
        completed: nextCompleted,
        completedBy: nextCompleted ? myUid : undefined,
      };
    }
    return item;
  });

  await supabase
    .from('messages')
    .update({
      shared_list: {
        ...listData,
        items: newItems,
      },
    })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
}

// 6. Save message directly into Shared Memories
export async function saveMessageToMemories(
  coupleId: string,
  msg: Message,
  user: UserProfile
): Promise<void> {
  const dateStr = new Date(msg.createdAt).toISOString().split('T')[0];
  await supabase.from('memories').insert({
    couple_id: coupleId,
    title: msg.loveNote ? 'Love Note from Chat 💕' : 'Chat Moment 💖',
    description: msg.text || (msg.mediaUrl ? 'Photo shared in our private chat' : 'Special chat memory'),
    date: dateStr,
    media_urls: msg.mediaUrl ? [msg.mediaUrl] : [],
    mood: 'romantic',
    tags: ['from-chat', 'shoona-connect'],
    is_favorite: true,
    created_by: user.uid,
    created_at: new Date().toISOString(),
  });
}

// 7. Turn message into Private Sealed Letter
export async function turnMessageIntoLetter(
  coupleId: string,
  msg: Message,
  user: UserProfile
): Promise<void> {
  await supabase.from('love_letters').insert({
    couple_id: coupleId,
    title: `Love Note from ${user.displayName} 💌`,
    content: msg.text || 'Thinking of you with all my love.',
    author_id: user.uid,
    author_name: user.displayName,
    theme: 'parchment',
    font_style: 'font-romantic',
    is_draft: false,
    created_at: new Date().toISOString(),
  });
}

// 8. Create Reminder from Message
export async function createReminderFromMessage(
  coupleId: string,
  msg: Message,
  recipientId: string,
  remindTime: string
): Promise<void> {
  await supabase.from('notifications').insert({
    couple_id: coupleId,
    recipient_id: recipientId,
    type: 'message',
    title: 'Chat Reminder ⏰',
    message: `"${msg.text.slice(0, 80)}"`,
    link_tab: 'chat',
    is_read: false,
    created_at: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Real-time Typing Indicator
// ---------------------------------------------------------------------------
export async function setTypingStatus(
  coupleId: string,
  myUid: string,
  isTyping: boolean
): Promise<void> {
  try {
    if (isTyping) {
      await supabase.from('typing_indicators').upsert({
        couple_id: coupleId,
        user_id: myUid,
        is_typing: true,
        updated_at: new Date().toISOString(),
      });
    } else {
      await supabase
        .from('typing_indicators')
        .delete()
        .eq('couple_id', coupleId)
        .eq('user_id', myUid);
    }
  } catch {
    // Non-critical
  }
}

export function listenToTypingStatus(
  coupleId: string,
  partnerUid: string,
  callback: (isTyping: boolean) => void
): () => void {
  const channel = createSafeChannel(`typing:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `couple_id=eq.${coupleId}`,
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          if ((payload.old as any)?.user_id === partnerUid) {
            callback(false);
          }
        } else if (payload.new && (payload.new as any).user_id === partnerUid) {
          const isTyping = Boolean((payload.new as any).is_typing);
          callback(isTyping);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Audio / Video WebRTC Call Signaling
// ---------------------------------------------------------------------------
export async function initiateCall(
  coupleId: string,
  caller: UserProfile,
  receiver: UserProfile,
  type: 'audio' | 'video'
): Promise<string> {
  const newCall = {
    couple_id: coupleId,
    caller_id: caller.uid,
    caller_name: caller.displayName,
    caller_photo: caller.photoURL || '',
    receiver_id: receiver.uid,
    receiver_name: receiver.displayName,
    type,
    status: 'ringing',
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('calls').insert(newCall).select('id').single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function answerCall(coupleId: string, callId: string): Promise<void> {
  await supabase.from('calls').update({ status: 'connected' }).eq('id', callId).eq('couple_id', coupleId);
}

export async function declineCall(coupleId: string, callId: string): Promise<void> {
  await supabase
    .from('calls')
    .update({ status: 'declined', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .eq('couple_id', coupleId);
}

export async function endCall(
  coupleId: string,
  callId: string,
  durationSeconds = 0
): Promise<void> {
  await supabase
    .from('calls')
    .update({
      status: 'ended',
      duration_seconds: durationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq('id', callId)
    .eq('couple_id', coupleId);
}

export function listenToCalls(coupleId: string, callback: (call: CallRecord | null) => void): () => void {
  // Initial fetch
  supabase
    .from('calls')
    .select('*')
    .eq('couple_id', coupleId)
    .in('status', ['ringing', 'connected'])
    .order('created_at', { ascending: false })
    .limit(1)
    .then(({ data }) => {
      if (data && data.length > 0) {
        const c = data[0];
        callback({
          id: c.id,
          coupleId: c.couple_id,
          callerId: c.caller_id,
          callerName: c.caller_name,
          callerPhoto: c.caller_photo,
          receiverId: c.receiver_id,
          receiverName: c.receiver_name,
          type: c.type,
          status: c.status,
          createdAt: c.created_at,
        });
      } else {
        callback(null);
      }
    });

  const channel = createSafeChannel(`calls:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'calls',
        filter: `couple_id=eq.${coupleId}`,
      },
      (payload) => {
        if (payload.new) {
          const c = payload.new as any;
          if (c.status === 'ringing' || c.status === 'connected') {
            callback({
              id: c.id,
              coupleId: c.couple_id,
              callerId: c.caller_id,
              callerName: c.caller_name,
              callerPhoto: c.caller_photo,
              receiverId: c.receiver_id,
              receiverName: c.receiver_name,
              type: c.type,
              status: c.status,
              createdAt: c.created_at,
            });
          } else {
            callback(null);
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Shared Albums
// ---------------------------------------------------------------------------
export async function createSharedAlbum(
  coupleId: string,
  title: string,
  description: string,
  coverUrl: string,
  user: UserProfile
): Promise<string> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('shared_albums')
    .insert({
      couple_id: coupleId,
      title,
      description,
      cover_url: coverUrl,
      created_by: user.uid,
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function addPhotoToSharedAlbum(
  coupleId: string,
  albumId: string,
  photoUrl: string,
  caption: string,
  user: UserProfile
): Promise<void> {
  await supabase.from('shared_photos').insert({
    album_id: albumId,
    couple_id: coupleId,
    url: photoUrl,
    caption,
    added_by: user.uid,
    added_by_name: user.displayName,
    created_at: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Realtime Messages Subscription
// ---------------------------------------------------------------------------
export function listenToMessages(
  coupleId: string,
  callback: (messages: Message[]) => void
): () => void {
  // 1. Instantly return local cached messages
  const initialCached = getCachedMessages(coupleId);
  if (initialCached.length > 0) {
    callback(initialCached);
  }

  // 2. BroadcastChannel for instant cross-tab sync
  let bc: BroadcastChannel | null = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('shoona_chat_channel_' + coupleId);
      bc.onmessage = (e) => {
        if (e.data?.type === 'SYNC_MESSAGES' && Array.isArray(e.data?.messages)) {
          callback(e.data.messages);
        }
      };
    }
  } catch {}

  // 3. Initial and incremental fetch from Supabase
  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: true })
        .limit(150);

      if (data && data.length > 0) {
        const mapped = data.map(messageRowToMessage);
        // Merge with any unsynced local messages
        const currentLocal = getCachedMessages(coupleId);
        const mapById = new Map<string, Message>();
        mapped.forEach((m) => mapById.set(m.id, m));
        currentLocal.forEach((m) => {
          if (!mapById.has(m.id)) {
            mapById.set(m.id, m);
          }
        });

        const merged = Array.from(mapById.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setCachedMessages(coupleId, merged);
        callback(merged);
      }
    } catch (err) {
      console.warn('Could not fetch messages from Supabase, using local store:', err);
    }
  };

  fetchMessages();

  // 4. Supabase Realtime subscription
  const channel = createSafeChannel(`messages:${coupleId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `couple_id=eq.${coupleId}`,
      },
      () => {
        fetchMessages();
      }
    )
    .subscribe();

  return () => {
    if (bc) bc.close();
    supabase.removeChannel(channel);
  };
}

// ---------------------------------------------------------------------------
// Export Chat Data
// ---------------------------------------------------------------------------
export function exportChatHistory(messages: Message[], partnerName: string): void {
  const lines = messages.map((m) => {
    const time = new Date(m.createdAt).toLocaleString();
    const sender = m.senderName;
    const text = m.text || (m.mediaUrl ? '[Photo / Media Attachment]' : '');
    return `[${time}] ${sender}: ${text}`;
  });

  const content = `ShoonaConnect Private Love Chat with ${partnerName}\nExported on: ${new Date().toLocaleString()}\nTotal Messages: ${
    messages.length
  }\n------------------------------------------------------------\n\n` + lines.join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ShoonaConnect-Chat-${partnerName}-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
