import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Check,
  CheckCheck,
  Clock,
  Pin,
  Star,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Gamepad2,
  BarChart3,
  CheckSquare,
  FileText,
  HelpCircle,
  MapPin,
  ExternalLink,
  MoreVertical,
  Smile,
  CornerUpLeft,
  Trash2,
  Edit2,
  Bookmark,
  Mail,
  Volume2,
  Lock,
  Unlock,
  Sparkles,
  Activity,
  Coffee,
  Palette,
  Plus,
  Feather,
  X,
} from 'lucide-react';
import { Message, UserProfile, ChatThemeKey, DoodleData, TimeCapsuleData, MoodPulseData } from '../../types';

interface ChatMessageBubbleProps {
  message: Message;
  isMe: boolean;
  partnerName: string;
  partnerPhoto?: string;
  myProfile: UserProfile;
  activeThemeKey: ChatThemeKey;
  onReply: (msg: Message) => void;
  onReact: (messageId: string, emoji: string, currentReactions?: Record<string, string>) => void;
  onEdit: (msg: Message) => void;
  onDelete: (messageId: string, forEveryone: boolean) => void;
  onTogglePin: (messageId: string, currentPinned?: boolean) => void;
  onToggleStar: (messageId: string, currentStarred?: boolean) => void;
  onSaveToMemories: (msg: Message) => void;
  onTurnIntoLetter: (msg: Message) => void;
  onOpenPhoto: (url: string, caption?: string) => void;
  onJumpToReply: (messageId: string) => void;
  onRespondDate: (messageId: string, response: 'accepted' | 'declined' | 'maybe') => void;
  onRespondGame: (messageId: string, response: 'accepted' | 'declined') => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onClosePoll?: (messageId: string, isClosed: boolean) => void;
  onAddPollOption?: (messageId: string, optionText: string) => void;
  onAnswerQuestion: (messageId: string, answer: string) => void;
  onToggleListItem: (messageId: string, itemId: string) => void;
  onLaunchGame?: (gameType: 'chess' | 'tictactoe') => void;
  onOpenLoveNoteModal?: (msg: Message) => void;
  onReactLoveNote?: (messageId: string, reaction: string) => void;
  onOpenDoodleModal?: (doodleData: DoodleData) => void;
  onDoodleBack?: (prompt?: string) => void;
  onOpenTimeCapsule?: (msg: Message) => void;
  onSendEmpathyAction?: (actionType: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isMe,
  partnerName,
  partnerPhoto,
  myProfile,
  activeThemeKey,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleStar,
  onSaveToMemories,
  onTurnIntoLetter,
  onOpenPhoto,
  onJumpToReply,
  onRespondDate,
  onRespondGame,
  onVotePoll,
  onClosePoll,
  onAddPollOption,
  onAnswerQuestion,
  onToggleListItem,
  onLaunchGame,
  onOpenLoveNoteModal,
  onReactLoveNote,
  onOpenDoodleModal,
  onDoodleBack,
  onOpenTimeCapsule,
  onSendEmpathyAction,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickReact, setShowQuickReact] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [newPollOptionText, setNewPollOptionText] = useState('');
  const [showAddOptionInput, setShowAddOptionInput] = useState(false);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio handling
  useEffect(() => {
    if (!message.mediaUrl || message.mediaType !== 'audio') return;
    const audio = new Audio(message.mediaUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
        const mins = Math.floor(audio.currentTime / 60);
        const secs = Math.floor(audio.currentTime % 60);
        setAudioCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [message.mediaUrl, message.mediaType]);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.playbackRate = audioPlaybackRate;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const cycleSpeed = () => {
    const next = audioPlaybackRate === 1 ? 1.5 : audioPlaybackRate === 1.5 ? 2 : 1;
    setAudioPlaybackRate(next as any);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  // Skip deleted messages for current user
  if (message.deletedFor?.includes(myProfile.uid)) {
    return null;
  }

  // Get bubble background for outgoing messages based on theme
  const getThemeGradient = () => {
    switch (activeThemeKey) {
      case 'burgundy':
        return 'from-rose-900 to-red-950 text-white';
      case 'midnight':
        return 'from-indigo-900 to-purple-950 text-white';
      case 'pink_glow':
        return 'from-pink-500 to-rose-400 text-white';
      case 'purple_night':
        return 'from-purple-600 to-indigo-700 text-white';
      case 'ocean_night':
        return 'from-cyan-600 to-blue-700 text-white';
      case 'minimal_dark':
        return 'from-slate-800 to-slate-900 text-white border border-slate-700';
      case 'rose':
      default:
        return 'from-rose-500 to-pink-600 text-white shadow-rose-200/50 dark:shadow-none';
    }
  };

  const formatMessageText = (text: string) => {
    if (!text) return null;

    // Detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold break-all inline-flex items-center gap-0.5 hover:opacity-80"
          >
            {part} <ExternalLink className="w-3 h-3 inline" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isReadByPartner =
    message.readBy && message.readBy.length > 1;

  return (
    <div
      id={`message-${message.id}`}
      className={`group relative flex items-end gap-2 my-1.5 transition-all duration-300 ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
      onMouseLeave={() => {
        setShowMenu(false);
        setShowQuickReact(false);
      }}
    >
      {/* Partner Avatar (for incoming) */}
      {!isMe && (
        <div className="w-7 h-7 rounded-full overflow-hidden bg-rose-200 dark:bg-slate-700 shrink-0 mb-1">
          {partnerPhoto ? (
            <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-rose-600">
              {partnerName ? partnerName[0].toUpperCase() : '💕'}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Menu Button (desktop hover or mobile tap) */}
      <div
        className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10 select-none ${
          isMe ? 'order-first' : 'order-last'
        }`}
      >
        <button
          type="button"
          onClick={() => setShowQuickReact(!showQuickReact)}
          title="React"
          className="p-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onReply(message)}
          title="Reply"
          className="p-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          title="More actions"
          className="p-1 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Reaction Bar */}
      {showQuickReact && (
        <div
          className={`absolute -top-9 bg-white dark:bg-slate-800 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 border border-rose-100 dark:border-slate-700 z-30 animate-in zoom-in-95 ${
            isMe ? 'right-12' : 'left-10'
          }`}
        >
          {['❤️', '🥰', '😂', '🔥', '👍', '🥺', '🌹'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onReact(message.id, emoji, message.reactions);
                setShowQuickReact(false);
              }}
              className="text-base hover:scale-130 transition-transform p-0.5 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* More Options Dropdown */}
      {showMenu && (
        <div
          className={`absolute top-0 bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-1 border border-rose-100 dark:border-slate-700 z-30 w-44 text-xs font-medium space-y-0.5 animate-in fade-in ${
            isMe ? 'right-8' : 'left-8'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onToggleStar(message.id, message.isStarred);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Star className={`w-3.5 h-3.5 ${message.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            {message.isStarred ? 'Unsave' : 'Save message'}
          </button>
          <button
            type="button"
            onClick={() => {
              onTogglePin(message.id, message.isPinned);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Pin className={`w-3.5 h-3.5 ${message.isPinned ? 'text-rose-500' : ''}`} />
            {message.isPinned ? 'Unpin message' : 'Pin to top'}
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveToMemories(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Save to Memories
          </button>
          <button
            type="button"
            onClick={() => {
              onTurnIntoLetter(message);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-pink-500" />
            Turn into Love Letter
          </button>
          {isMe && !message.deletedForEveryone && (
            <button
              type="button"
              onClick={() => {
                onEdit(message);
                setShowMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit message
            </button>
          )}
          <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
          <button
            type="button"
            onClick={() => {
              onDelete(message.id, false);
              setShowMenu(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete for me
          </button>
          {isMe && (
            <button
              type="button"
              onClick={() => {
                onDelete(message.id, true);
                setShowMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 font-bold flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete for everyone
            </button>
          )}
        </div>
      )}

      {/* Main Message Container */}
      <div className="max-w-[85%] sm:max-w-md md:max-w-lg flex flex-col">
        {/* Pinned or Starred indicators */}
        <div className="flex items-center gap-1.5 px-2 mb-0.5 text-[10px] text-slate-400">
          {message.isPinned && (
            <span className="flex items-center gap-0.5 text-rose-500 font-semibold">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}
          {message.isStarred && (
            <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="w-2.5 h-2.5 fill-current" /> Saved
            </span>
          )}
        </div>

        {/* Bubble Box */}
        <div
          className={`relative rounded-3xl p-3 sm:p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed overflow-hidden transition-all ${
            message.deletedForEveryone
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 italic'
              : isMe
              ? `bg-gradient-to-br ${getThemeGradient()} rounded-br-sm shadow-md`
              : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-rose-100/70 dark:border-slate-700/60 shadow-xs'
          }`}
        >
          {/* Reply quote preview */}
          {message.replyTo && (
            <div
              onClick={() => onJumpToReply(message.replyTo!.messageId)}
              className={`mb-2 p-2 rounded-xl text-[11px] border-l-3 cursor-pointer select-none truncate ${
                isMe
                  ? 'bg-black/15 border-white text-white/90'
                  : 'bg-rose-50/80 dark:bg-slate-700/80 border-rose-500 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-bold flex items-center gap-1">
                <CornerUpLeft className="w-2.5 h-2.5" /> {message.replyTo.senderName}
              </div>
              <div className="truncate opacity-85 mt-0.5">{message.replyTo.text}</div>
            </div>
          )}

          {/* 1. DELETED MESSAGE */}
          {message.deletedForEveryone ? (
            <span className="italic opacity-70">This message was deleted</span>
          ) : (
            <>
              {/* 2. IMAGE MESSAGE */}
              {message.mediaUrl && (message.mediaType === 'image' || message.mediaUrl.startsWith('data:image')) && (
                <div
                  onClick={() => onOpenPhoto(message.mediaUrl!, message.text)}
                  className="rounded-2xl overflow-hidden mb-2 max-h-72 cursor-pointer hover:opacity-95 transition-opacity bg-black/5"
                >
                  <img
                    src={message.mediaUrl}
                    alt="attachment"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              )}

              {/* 3. VOICE NOTE MESSAGE */}
              {message.mediaType === 'audio' && message.mediaUrl && (
                <div className="flex items-center gap-2.5 py-1 select-none min-w-[200px]">
                  <button
                    type="button"
                    onClick={togglePlayAudio}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                      isMe
                        ? 'bg-white text-rose-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    {/* Simulated Waveform / Progress bar */}
                    <div className="w-full bg-black/20 dark:bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-150 ${
                          isMe ? 'bg-white' : 'bg-rose-500'
                        }`}
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] opacity-80">
                      <span>{audioCurrentTime}</span>
                      <button
                        type="button"
                        onClick={cycleSpeed}
                        className="font-bold px-1 rounded hover:bg-black/10 transition-colors"
                      >
                        {audioPlaybackRate}x
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. LOVE NOTE SPECIAL CARD (Overhauled with Wax Seal & Themes) */}
              {(message.loveNoteData || message.loveNote) && (() => {
                const note = message.loveNoteData || message.loveNote!;
                const sealEmoji =
                  note.waxSeal === 'heart'
                    ? '💖'
                    : note.waxSeal === 'kiss'
                    ? '💋'
                    : note.waxSeal === 'dove'
                    ? '🕊️'
                    : note.waxSeal === 'crown'
                    ? '👑'
                    : '🌹';
                return (
                  <div
                    onClick={() => onOpenLoveNoteModal && onOpenLoveNoteModal(message)}
                    className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-neutral-900/50 to-pink-950/40 border border-rose-500/30 hover:border-rose-500/60 my-1 space-y-2 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-rose-300">
                        <Heart className="w-3.5 h-3.5 fill-current" /> Sealed Love Note
                      </div>
                      <span className="text-sm shadow-sm p-1 rounded-full bg-rose-500/20 border border-rose-500/40 group-hover:scale-110 transition-transform">
                        {sealEmoji}
                      </span>
                    </div>

                    {note.openWhen && (
                      <div className="text-[11px] text-rose-200/90 italic font-medium">
                        💌 Open When: <span className="font-bold">"{note.openWhen}"</span>
                      </div>
                    )}

                    <p className="font-serif italic text-sm sm:text-base leading-relaxed text-rose-100 line-clamp-3">
                      "{note.note}"
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-rose-500/20 text-[11px]">
                      <span className="text-rose-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Tap to read letter & react
                      </span>
                      {note.reactions && Object.keys(note.reactions).length > 0 && (
                        <div className="flex items-center gap-1">
                          {Object.entries(note.reactions).map(([uid, rx]) => (
                            <span key={uid} className="text-xs bg-rose-500/20 px-1.5 py-0.5 rounded-lg">
                              {rx}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 4b. REALTIME COLLABORATIVE DOODLE CARD */}
              {(message.type === 'doodle' || message.doodleData) && (() => {
                const doodle: Partial<DoodleData> = message.doodleData || {
                  canvasData: message.mediaUrl || '',
                  canvasDataUrl: message.mediaUrl || '',
                  prompt: message.text,
                };
                const imgUrl = doodle.canvasDataUrl || doodle.canvasData || message.mediaUrl || '';
                const creator = doodle.drawnBy || doodle.senderName || message.senderName;
                return (
                  <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-purple-500/30 my-1 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <Palette className="w-3.5 h-3.5" /> Couple Artwork
                      </div>
                      {creator && (
                        <span className="text-[10px] text-neutral-400">By {creator}</span>
                      )}
                    </div>

                    {doodle.prompt && (
                      <p className="text-xs text-rose-300 font-medium italic">
                        🎯 Prompt: "{doodle.prompt}"
                      </p>
                    )}

                    <div
                      onClick={() => onOpenPhoto(imgUrl, doodle.prompt)}
                      className="relative rounded-xl overflow-hidden border border-white/10 aspect-[3/2] bg-neutral-950 cursor-zoom-in group shadow-md"
                    >
                      <img
                        src={imgUrl}
                        alt="Couple Doodle"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onOpenPhoto(imgUrl, doodle.prompt)}
                        className="text-xs text-purple-300 hover:text-white font-semibold flex items-center gap-1"
                      >
                        View Full Canvas
                      </button>
                      {onDoodleBack && (
                        <button
                          type="button"
                          onClick={() => onDoodleBack(doodle.prompt)}
                          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                        >
                          <Palette className="w-3 h-3" /> Doodle Back ✏️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* 4c. TIME CAPSULE CARD */}
              {(message.type === 'time_capsule' || message.timeCapsuleData) && (() => {
                const capsule = message.timeCapsuleData!;
                const isReady =
                  new Date(capsule.unlockDate) <= new Date() || capsule.isUnlocked;
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(capsule.unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                );
                return (
                  <div
                    onClick={() => onOpenTimeCapsule && onOpenTimeCapsule(message)}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-900/60 to-yellow-950/40 border border-amber-500/30 hover:border-amber-500/60 my-1 space-y-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        {isReady ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}{' '}
                        Time Capsule
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                        {isReady ? 'Ready to Open! ✨' : `Unlocks: ${capsule.unlockDate}`}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-serif">{capsule.title}</h4>

                    {isReady ? (
                      <p className="text-xs font-serif italic text-amber-100/90 line-clamp-2">
                        "{capsule.note}"
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{daysLeft} days until ceremonial opening</span>
                      </div>
                    )}

                    <div className="pt-1 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      <span>Tap to inspect time capsule vault ➔</span>
                    </div>
                  </div>
                );
              })()}

              {/* 4d. RELATIONSHIP MOOD PULSE CARD */}
              {(message.type === 'mood_pulse' || message.moodPulseData) && (() => {
                const pulse = message.moodPulseData!;
                return (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-neutral-900/60 to-indigo-950/40 border border-rose-500/30 my-1 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <Activity className="w-3.5 h-3.5" /> Relationship Mood Pulse
                      </div>
                      <span className="text-lg">{pulse.emoji}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">Feeling {pulse.mood}</h4>
                      {pulse.note && (
                        <p className="text-xs italic text-neutral-300 mt-0.5">"{pulse.note}"</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/20 p-2 rounded-xl">
                        <span className="text-[10px] text-neutral-400 block font-semibold">Energy</span>
                        <div className="flex items-center gap-0.5 text-rose-400 mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Heart
                              key={i}
                              className={`w-3 h-3 ${i < pulse.energyLevel ? 'fill-current' : 'opacity-30'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl">
                        <span className="text-[10px] text-neutral-400 block font-semibold">Love Language</span>
                        <span className="text-rose-200 font-bold truncate block mt-0.5">
                          {pulse.loveLanguageNeed}
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/20 p-2 rounded-xl text-xs">
                      <span className="text-[10px] text-neutral-400 block font-semibold">Craving</span>
                      <span className="text-amber-200 font-medium">{pulse.craving}</span>
                    </div>

                    {!isMe && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => onSendEmpathyAction && onSendEmpathyAction('hug')}
                          className="flex-1 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] border border-rose-500/30 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Send Hug 🫂
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendEmpathyAction && onSendEmpathyAction('coffee')}
                          className="flex-1 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Send Coffee ☕
                        </button>
                        <button
                          type="button"
                          onClick={() => onSendEmpathyAction && onSendEmpathyAction('love_note')}
                          className="flex-1 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] border border-purple-500/30 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Send Note 💌
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 4e. HAPTIC HUG & KISS CARD */}
              {message.type === 'hug_kiss' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 via-rose-950/60 to-red-950/60 border border-rose-500/40 my-1 space-y-2 text-center animate-pulse">
                  <div className="text-2xl">💋🫂</div>
                  <h4 className="font-bold text-sm text-white">
                    {isMe ? 'You sent a warm, lingering hug & kiss' : `${partnerName} sent you a warm, lingering hug & kiss!`}
                  </h4>
                  {message.text && (
                    <p className="text-xs text-rose-200 italic font-serif">"{message.text}"</p>
                  )}
                  {!isMe && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => onSendEmpathyAction && onSendEmpathyAction('hug')}
                        className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1"
                      >
                        Send Hug Back 🫂
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 5. DATE INVITATION CARD */}
              {message.dateInvite && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-700 my-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 dark:text-amber-400">
                      <Calendar className="w-3.5 h-3.5" /> Date Invitation
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        message.dateInvite.status === 'accepted'
                          ? 'bg-emerald-500 text-white'
                          : message.dateInvite.status === 'declined'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-400 text-slate-900'
                      }`}
                    >
                      {message.dateInvite.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base">{message.dateInvite.title}</h4>
                    <p className="text-xs opacity-85 mt-0.5">
                      📅 {message.dateInvite.date} {message.dateInvite.time && `• ⏰ ${message.dateInvite.time}`}
                    </p>
                    {message.dateInvite.location && (
                      <p className="text-xs opacity-85">📍 {message.dateInvite.location}</p>
                    )}
                  </div>

                  {/* Actions for receiver */}
                  {!isMe && message.dateInvite.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onRespondDate(message.id, 'accepted')}
                        className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Accept Date 💕
                      </button>
                      <button
                        type="button"
                        onClick={() => onRespondDate(message.id, 'maybe')}
                        className="py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Maybe
                      </button>
                      <button
                        type="button"
                        onClick={() => onRespondDate(message.id, 'declined')}
                        className="py-1.5 px-3 bg-red-500/80 hover:bg-red-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Can't make it
                      </button>
                    </div>
                  )}

                  {message.dateInvite.status === 'accepted' && (
                    <p className="text-[11px] text-emerald-200 font-medium">
                      ✓ Date accepted & added to your Dates calendar!
                    </p>
                  )}
                </div>
              )}

              {/* 6. GAME CHALLENGE CARD */}
              {message.gameChallenge && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-indigo-300" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      {message.gameChallenge.gameType === 'chess' ? 'Chess Duel ♟️' : 'Tic-Tac-Toe Duel 🎮'}
                    </h4>
                  </div>
                  <p className="text-xs opacity-90">
                    {message.senderName} challenged you to a game of{' '}
                    {message.gameChallenge.gameType === 'chess' ? 'Chess' : 'Tic-Tac-Toe'}!
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onLaunchGame) {
                          onLaunchGame(message.gameChallenge!.gameType as any);
                        }
                      }}
                      className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Play Game Now ➔
                    </button>
                  </div>
                </div>
              )}

              {/* 7. COUPLE POLL CARD (Overhauled with Open/Close, Add Option & Live Bar) */}
              {(message.pollData || message.poll) && (() => {
                const poll = message.pollData || message.poll!;
                const totalVotes = poll.options.reduce(
                  (acc, o) => acc + (o.votes?.length || 0),
                  0
                );
                return (
                  <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-2.5 select-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <BarChart3 className="w-3.5 h-3.5" /> Couple Poll
                      </div>
                      <div className="flex items-center gap-1.5">
                        {poll.isClosed ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Closed
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            Active
                          </span>
                        )}
                        {isMe && onClosePoll && (
                          <button
                            type="button"
                            onClick={() => onClosePoll(message.id, !poll.isClosed)}
                            className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
                          >
                            {poll.isClosed ? 'Reopen' : 'Close'}
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm">{poll.question}</h4>

                    <div className="space-y-1.5">
                      {poll.options.map((opt) => {
                        const hasVoted = opt.votes?.includes(myProfile.uid);
                        const count = opt.votes?.length || 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={poll.isClosed}
                            onClick={() => onVotePoll(message.id, opt.id)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs border relative overflow-hidden transition-all cursor-pointer disabled:cursor-default ${
                              hasVoted
                                ? 'border-emerald-400 bg-emerald-500/20 font-bold ring-1 ring-emerald-400/40'
                                : 'border-white/20 bg-black/15 hover:bg-black/25'
                            }`}
                          >
                            <div
                              className="absolute inset-0 bg-emerald-500/20 pointer-events-none transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                {hasVoted && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                {opt.text}
                              </span>
                              <span className="text-[11px] font-semibold opacity-90">
                                {pct}% ({count})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Add option to poll */}
                    {!poll.isClosed && (
                      <div className="pt-1">
                        {!showAddOptionInput ? (
                          <button
                            type="button"
                            onClick={() => setShowAddOptionInput(true)}
                            className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add another option...
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newPollOptionText}
                              onChange={(e) => setNewPollOptionText(e.target.value)}
                              placeholder="New option..."
                              className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/30 border border-white/20 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newPollOptionText.trim() && onAddPollOption) {
                                  onAddPollOption(message.id, newPollOptionText.trim());
                                  setNewPollOptionText('');
                                  setShowAddOptionInput(false);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newPollOptionText.trim() && onAddPollOption) {
                                  onAddPollOption(message.id, newPollOptionText.trim());
                                  setNewPollOptionText('');
                                  setShowAddOptionInput(false);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddOptionInput(false)}
                              className="p-1.5 text-neutral-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 8. COUPLE QUESTION CARD */}
              {message.questionData && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-fuchsia-300">
                    <HelpCircle className="w-3.5 h-3.5" /> Connection Question
                  </div>
                  <h4 className="font-bold text-sm italic">"{message.questionData.question}"</h4>

                  {/* Existing answers */}
                  {message.questionData.answers && (
                    <div className="space-y-1.5 pt-1">
                      {Object.entries(message.questionData.answers).map(([uid, ans]) => (
                        <div
                          key={uid}
                          className="p-2 rounded-xl bg-black/15 text-xs space-y-0.5"
                        >
                          <span className="text-[10px] font-bold opacity-80">
                            {uid === myProfile.uid ? 'You' : partnerName}:
                          </span>
                          <p>{ans}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input my answer if not yet answered */}
                  {(!message.questionData.answers || !message.questionData.answers[myProfile.uid]) && (
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder="Write your answer..."
                        className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/20 text-xs placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (questionInput.trim()) {
                            onAnswerQuestion(message.id, questionInput.trim());
                            setQuestionInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Reveal
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 9. SHARED LIST / CHECKLIST CARD */}
              {message.sharedListData && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-2 select-none">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                    <CheckSquare className="w-3.5 h-3.5" /> {message.sharedListData.title}
                  </div>
                  <div className="space-y-1">
                    {message.sharedListData.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleListItem(message.id, item.id)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-black/10 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            item.completed ? 'bg-sky-500 border-sky-400 text-white' : 'border-white/50'
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3" />}
                        </div>
                        <span
                          className={`text-xs ${
                            item.completed ? 'line-through opacity-60' : 'opacity-95'
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. SHARED NOTE CARD */}
              {message.sharedNoteData && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <FileText className="w-3.5 h-3.5" /> {message.sharedNoteData.title}
                  </div>
                  <p className="whitespace-pre-line text-xs opacity-90 leading-relaxed">
                    {message.sharedNoteData.content}
                  </p>
                </div>
              )}

              {/* 11. COUNTDOWN CARD */}
              {message.countdownData && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-1 text-center">
                  <div className="text-2xl">{message.countdownData.emoji || '⏳'}</div>
                  <h4 className="font-bold text-sm">{message.countdownData.title}</h4>
                  <p className="text-xs opacity-80">
                    Target: {new Date(message.countdownData.targetDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* 12. LOCATION CARD */}
              {message.locationData && (
                <div className="p-3.5 rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/20 my-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-rose-300" /> Location Shared
                  </div>
                  <p className="text-xs opacity-90">{message.locationData.address || 'Coordinates'}</p>
                  <a
                    href={`https://maps.google.com/?q=${message.locationData.lat},${message.locationData.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:opacity-90"
                  >
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Text content */}
              {message.text && !message.loveNoteData && (
                <div className="break-words leading-relaxed">
                  {formatMessageText(message.text)}
                </div>
              )}
            </>
          )}

          {/* Bottom metadata (timestamp + ticks) */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
              isMe ? 'text-white/75' : 'text-slate-400'
            }`}
          >
            {message.isEdited && <span className="italic">(edited)</span>}
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {isMe && (
              <span>
                {isReadByPartner ? (
                  <span title="Read by partner"><CheckCheck className="w-3.5 h-3.5 text-sky-300" /></span>
                ) : (
                  <span title="Delivered"><CheckCheck className="w-3.5 h-3.5 opacity-70" /></span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction badge pills */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div
            className={`flex flex-wrap gap-1 mt-1 px-1 select-none ${
              isMe ? 'justify-end' : 'justify-start'
            }`}
          >
            {(() => {
              const grouped: Record<string, number> = {};
              Object.values(message.reactions || {}).forEach((em) => {
                const key = String(em);
                grouped[key] = (grouped[key] || 0) + 1;
              });

              return Object.entries(grouped).map(([emoji, count]) => {
                const myReaction = message.reactions?.[myProfile.uid] === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReact(message.id, emoji, message.reactions)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                      myReaction
                        ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 text-rose-600 dark:text-rose-300 scale-105'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105'
                    }`}
                  >
                    <span>{emoji}</span>
                    {count > 1 && <span>{count}</span>}
                  </button>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
