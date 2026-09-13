import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  MicOff,
  Image as ImageIcon,
  Heart,
  Calendar,
  Gamepad2,
  BarChart3,
  CheckSquare,
  FileText,
  HelpCircle,
  Clock,
  MapPin,
  Sparkles,
  X,
  CornerUpLeft,
  Square,
  Plus,
  Palette,
  Activity,
  Flame,
  MailOpen,
  Archive,
  EyeOff,
} from 'lucide-react';
import { ReplyPreview } from '../../types';
import { ChatEmojiPicker } from './ChatEmojiPicker';
import { compressImage } from '../../utils/imageCompressor';

interface ChatComposerProps {
  coupleId: string;
  partnerName: string;
  replyingTo: ReplyPreview | null;
  onCancelReply: () => void;
  onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'audio') => void;
  onOpenActionModal: (
    modalType:
      | 'love_note'
      | 'date_invite'
      | 'game_challenge'
      | 'poll'
      | 'countdown'
      | 'shared_list'
      | 'shared_note'
      | 'question'
      | 'connect_ai'
      | 'location'
      | 'doodle'
      | 'time_capsule'
      | 'mood_pulse'
      | 'love_notes_vault'
      | 'love_spark'
      | 'hug_kiss'
  ) => void;
  onTyping: (isTyping: boolean) => void;
  showSmartReplies?: boolean;
}

const SMART_REPLIES = [
  'Love you so much 💕',
  'Can’t wait! 😍',
  'Sounds perfect to me ❤️',
  'Thinking of you 🥰',
  'Let’s do it! ✨',
  'Miss your smile 🥺',
];

export const ChatComposer: React.FC<ChatComposerProps> = ({
  coupleId,
  partnerName,
  replyingTo,
  onCancelReply,
  onSendMessage,
  onOpenActionModal,
  onTyping,
  showSmartReplies = true,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isWhisperMode, setIsWhisperMode] = useState(false);

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(`shoona_draft_${coupleId}`);
      if (draft) setText(draft);
    } catch {
      // ignore
    }
  }, [coupleId]);

  // Save draft on change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    try {
      localStorage.setItem(`shoona_draft_${coupleId}`, val);
    } catch {
      // ignore
    }

    // Typing status notify
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2500);
  };

  // Image selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice recording logic
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result as string;
          onSendMessage('Voice note 🎙️', base64Audio, 'audio');
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access is required to record voice notes.');
    }
  };

  const stopVoiceRecording = (send: boolean) => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      if (!send) {
        mediaRecorderRef.current.onstop = null; // discard
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleSend = () => {
    if (imagePreview) {
      onSendMessage(imageCaption || text, imagePreview, 'image');
      setImagePreview(null);
      setImageCaption('');
      setText('');
      localStorage.removeItem(`shoona_draft_${coupleId}`);
      return;
    }

    if (!text.trim()) return;

    const messageText = isWhisperMode ? `[SECRET WHISPER] ${text.trim()}` : text.trim();
    onSendMessage(messageText);
    setText('');
    setIsWhisperMode(false);
    try {
      localStorage.removeItem(`shoona_draft_${coupleId}`);
    } catch {
      // ignore
    }

    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative border-t border-rose-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 select-none">
      {/* Smart replies chips */}
      {showSmartReplies && !text && !imagePreview && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
          {SMART_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onSendMessage(reply)}
              className="px-3 py-1 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-slate-700 whitespace-nowrap transition-colors cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-2xl bg-rose-50 dark:bg-slate-800 border-l-4 border-rose-500 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="truncate text-xs">
            <span className="font-bold text-rose-600 dark:text-rose-400 block">
              Replying to {replyingTo.senderName}
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate block">
              {replyingTo.text}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 rounded-full hover:bg-rose-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Preview Card before sending */}
      {imagePreview && (
        <div className="mb-2 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/10 shrink-0">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <input
            type="text"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            placeholder="Add a sweet caption..."
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Secret Whisper Mode Banner */}
      {isWhisperMode && (
        <div className="mb-2 p-2 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/15 to-purple-500/15 border border-rose-300 dark:border-rose-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-bold px-2">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Secret Whisper Mode Active • Message will be frosted until tapped (10s peek)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsWhisperMode(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-500 text-white animate-in zoom-in-95">
          <div className="flex items-center gap-2 px-2">
            <span className="w-3 h-3 rounded-full bg-white animate-ping" />
            <span className="text-xs font-bold">
              Recording voice note • {Math.floor(recordingSeconds / 60)}:
              {(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stopVoiceRecording(false)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => stopVoiceRecording(true)}
              className="px-4 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold shadow-md cursor-pointer hover:bg-rose-50"
            >
              Send ➔
            </button>
          </div>
        </div>
      ) : (
        /* Regular Message Input Row */
        <div className="flex items-end gap-2">
          {/* Quick Actions (+) Button */}
          <div className="relative">
            {showActionsMenu && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowActionsMenu(false)}
              />
            )}
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              title="Add Love Card, Date, Poll..."
              className={`p-2 rounded-full transition-transform cursor-pointer relative z-40 ${
                showActionsMenu
                  ? 'bg-rose-500 text-white rotate-45'
                  : 'bg-rose-50 dark:bg-slate-800 text-rose-500 hover:bg-rose-100 dark:hover:bg-slate-700'
              }`}
            >
              <Plus className="w-5 h-5 transition-transform" />
            </button>

            {/* Actions Menu Popover */}
            {showActionsMenu && (
              <div className="absolute bottom-12 left-0 w-72 max-w-[calc(100vw-2rem)] max-h-[55vh] overflow-y-auto p-2 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-rose-100 dark:border-slate-700 z-40 space-y-1 animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsWhisperMode(true);
                    setShowActionsMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-rose-500">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-slate-800 dark:text-white">
                      Secret Whisper 🤫
                    </span>
                    <span className="text-[10px] text-slate-400 block">Frosted message with 10s tap-to-peek</span>
                  </div>
                </button>

                {[
                  { id: 'doodle', label: 'Realtime Doodle 🎨', desc: 'Live collaborative drawing & send', icon: Palette, color: 'text-purple-500' },
                  { id: 'mood_pulse', label: 'Mood Pulse 💓', desc: 'Emotional check-in & love language', icon: Activity, color: 'text-rose-500' },
                  { id: 'time_capsule', label: 'Time Capsule ⏳', desc: 'Seal message for future date', icon: Clock, color: 'text-amber-500' },
                  { id: 'love_spark', label: 'Love Sparks ✨', desc: 'Romantic sparks & date generators', icon: Flame, color: 'text-orange-500' },
                  { id: 'love_notes_vault', label: 'Love Letters Vault 💌', desc: 'Wax-sealed love notes archive', icon: MailOpen, color: 'text-pink-500' },
                  { id: 'hug_kiss', label: 'Send Lingering Hug 🫂', desc: 'Haptic heartbeat vibration', icon: Heart, color: 'text-red-500' },
                  { id: 'love_note', label: 'Love Note 💕', desc: 'Heartfelt card with custom style', icon: Heart, color: 'text-rose-500' },
                  { id: 'poll', label: 'Couple Poll 📊', desc: 'Live voting for plans & choices', icon: BarChart3, color: 'text-emerald-500' },
                  { id: 'date_invite', label: 'Plan Date 📅', desc: 'Invite partner with Accept button', icon: Calendar, color: 'text-amber-500' },
                  { id: 'game_challenge', label: 'Play Game 🎮', desc: 'Chess or Tic-Tac-Toe duel', icon: Gamepad2, color: 'text-indigo-500' },
                  { id: 'shared_list', label: 'Shared List 🛒', desc: 'Interactive shopping & checklists', icon: CheckSquare, color: 'text-sky-500' },
                  { id: 'shared_note', label: 'Shared Note 📝', desc: 'Collaborative note in chat', icon: FileText, color: 'text-teal-500' },
                  { id: 'question', label: 'Ask Partner ❓', desc: 'Connection question with answers', icon: HelpCircle, color: 'text-fuchsia-500' },
                  { id: 'countdown', label: 'Countdown ⏳', desc: 'Live event milestone timer', icon: Clock, color: 'text-orange-500' },
                  { id: 'connect_ai', label: 'Connect AI Assistant ✨', desc: 'Date ideas & romantic words', icon: Sparkles, color: 'text-amber-500' },
                  { id: 'location', label: 'Share Location 📍', desc: 'Send voluntary coordinates', icon: MapPin, color: 'text-rose-500' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onOpenActionModal(item.id as any);
                        setShowActionsMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className={`p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-slate-800 dark:text-white">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Photo upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach photo"
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Emoji Picker toggle */}
          <div className="relative shrink-0">
            {showEmojiPicker && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowEmojiPicker(false)}
              />
            )}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Emoji"
              className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative z-40"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showEmojiPicker && (
              <div className="relative z-40">
                <ChatEmojiPicker
                  onSelectEmoji={(em) => {
                    setText((prev) => prev + em);
                    setShowEmojiPicker(false);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Text Input area */}
          <div className="flex-1 min-w-0 bg-slate-100 dark:bg-slate-800 rounded-3xl p-2 px-3 border border-transparent focus-within:border-rose-300 dark:focus-within:border-rose-500/50 transition-colors flex items-center">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${partnerName}...`}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-28 overflow-y-auto leading-relaxed"
            />
          </div>

          {/* Send or Voice Record button */}
          {text.trim() || imagePreview ? (
            <button
              type="button"
              onClick={handleSend}
              className="p-2 sm:p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-300 dark:shadow-none transition-transform hover:scale-105 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceRecording}
              title="Hold or tap to record voice note"
              className="p-2 sm:p-2.5 rounded-full bg-rose-50 dark:bg-slate-800 text-rose-500 hover:bg-rose-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
