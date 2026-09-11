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
} from '../types';

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
// Send Message
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
    locationData?: LocationData;
    reminderData?: ReminderData;
    scheduledFor?: string;
    expiresAt?: string;
  }
): Promise<string> {
  const now = new Date().toISOString();

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
  if (params.locationData) msgPayload.location = params.locationData;
  if (params.reminderData) msgPayload.reminder = params.reminderData;
  if (params.scheduledFor) msgPayload.scheduled_for = params.scheduledFor;
  if (params.expiresAt) msgPayload.expires_at = params.expiresAt;

  const { data, error } = await supabase
    .from('messages')
    .insert(msgPayload)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to send message:', error.message);
    throw new Error(error.message);
  }

  playMessageSentSound();
  return data.id;
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

  await supabase
    .from('messages')
    .update({
      poll: {
        ...pollData,
        options: newOptions,
      },
    })
    .eq('id', messageId)
    .eq('couple_id', coupleId);
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
  // Initial fetch
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true })
      .limit(150);

    if (data) {
      callback(data.map(messageRowToMessage));
    }
  };

  fetchMessages();

  // Realtime subscription
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
        // Re-fetch or merge to maintain chronological order
        fetchMessages();
      }
    )
    .subscribe();

  return () => {
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
