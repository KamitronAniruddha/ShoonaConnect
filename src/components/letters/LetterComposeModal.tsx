import React, { useState, useRef } from 'react';
import {
  Mail,
  Heart,
  Lock,
  Flame,
  Clock,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  X,
  HelpCircle,
  AlertTriangle,
  Play,
  Square,
  KeyRound,
  FileText,
} from 'lucide-react';
import { LoveLetter, UserProfile } from '../../types';
import { compressImage } from '../../utils/imageCompressor';
import confetti from 'canvas-confetti';

interface LetterComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (letterData: Partial<LoveLetter>) => Promise<void>;
  userProfile: UserProfile;
  partnerName: string;
  initialReplyTitle?: string;
}

const OCCASIONS = [
  'Just Because I Love You',
  'Open When You Miss Me',
  'Open When You Are Sad',
  'Our Anniversary',
  'Your Birthday',
  'Open When We Have an Argument',
  'Before You Go to Sleep',
  'Open When You Need a Hug',
  'Open on Our Wedding Day',
  'New Year Reflection',
  'Open When You Feel Stressed',
];

const THEMES = [
  { id: 'parchment', name: 'Vintage Parchment 📜', color: 'bg-[#faf6ee] text-[#3d2f21]' },
  { id: 'blush', name: 'Rose Petal Velvet 🌹', color: 'bg-rose-50 text-rose-950' },
  { id: 'midnight', name: 'Midnight Starlight 🌌', color: 'bg-slate-900 text-white' },
  { id: 'airmail', name: 'Airmail Postal ✉️', color: 'bg-white text-slate-900 border-2 border-dashed border-rose-300' },
  { id: 'lavender', name: 'Lavender Breeze 💜', color: 'bg-purple-50 text-purple-950' },
  { id: 'royal_gold', name: 'Royal Gold ✨', color: 'bg-amber-50 text-amber-950' },
];

const WAX_SEALS = [
  { id: 'heart', emoji: '💕', label: 'Heart' },
  { id: 'rose', emoji: '🌹', label: 'Rose' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'infinity', emoji: '♾️', label: 'Infinity' },
  { id: 'kiss', emoji: '💋', label: 'Kiss' },
  { id: 'stars', emoji: '✨', label: 'Stars' },
  { id: 'lock', emoji: '🔐', label: 'Lock' },
];

export const LetterComposeModal: React.FC<LetterComposeModalProps> = ({
  isOpen,
  onClose,
  onSend,
  userProfile,
  partnerName,
  initialReplyTitle,
}) => {
  const [title, setTitle] = useState(initialReplyTitle || '');
  const [content, setContent] = useState('');
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [theme, setTheme] = useState<LoveLetter['theme']>('parchment');
  const [fontStyle, setFontStyle] = useState<LoveLetter['fontStyle']>('handwriting');
  const [waxSeal, setWaxSeal] = useState<LoveLetter['waxSeal']>('heart');

  // Timelock
  const [enableTimelock, setEnableTimelock] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');

  // Password protection
  const [enablePassword, setEnablePassword] = useState(false);
  const [secretPassword, setSecretPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');

  // Secret Romance Trivia Question (Question right or letter will be deleted)
  const [enableQuestion, setEnableQuestion] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [secretQuestionHint, setSecretQuestionHint] = useState('');
  const [maxAttempts, setMaxAttempts] = useState<number>(3);

  // Polaroid attachment
  const [polaroidUrl, setPolaroidUrl] = useState<string | null>(null);
  const [polaroidCaption, setPolaroidCaption] = useState('');

  // Voice Note attachment
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 1000, 0.85);
      setPolaroidUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setPolaroidUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          setAudioUrl(reader.result as string);
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

  const stopRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (enablePassword && !secretPassword.trim()) {
      alert('Please provide the secret password or uncheck Password Protection.');
      return;
    }

    if (enableQuestion && (!secretQuestion.trim() || !secretAnswer.trim())) {
      alert('Please provide both the secret question and correct answer.');
      return;
    }

    setSaving(true);
    try {
      await onSend({
        title: title.trim(),
        content: content.trim(),
        occasion,
        theme,
        fontStyle,
        waxSeal,
        unlockDate: enableTimelock && unlockDate ? new Date(unlockDate).toISOString() : null,
        isPasswordProtected: enablePassword,
        secretPassword: enablePassword ? secretPassword.trim() : undefined,
        passwordHint: enablePassword && passwordHint.trim() ? passwordHint.trim() : undefined,
        isQuestionProtected: enableQuestion,
        secretQuestion: enableQuestion ? secretQuestion.trim() : undefined,
        secretAnswer: enableQuestion ? secretAnswer.trim() : undefined,
        secretQuestionHint: enableQuestion && secretQuestionHint.trim() ? secretQuestionHint.trim() : undefined,
        maxAttempts: enableQuestion ? maxAttempts : undefined,
        failedAttempts: 0,
        isDeletedOnWrongAnswer: enableQuestion,
        polaroidUrl: polaroidUrl || undefined,
        polaroidCaption: polaroidUrl && polaroidCaption.trim() ? polaroidCaption.trim() : undefined,
        audioUrl: audioUrl || undefined,
        createdAt: new Date().toISOString(),
      });

      confetti({ particleCount: 90, spread: 70 });
      onClose();
    } catch (err) {
      console.error('Error sending letter:', err);
      alert('Failed to send letter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compose Love Letter
              </h3>
              <p className="text-[11px] text-slate-400">
                To <strong className="text-rose-500">{partnerName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compose Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Occasion & Theme Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Occasion / Milestone
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {OCCASIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stationery Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Letter Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. For the keeper of my heart & dreams..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Wax Seal Stamp Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Wax Seal Stamp
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {WAX_SEALS.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setWaxSeal(ws.id as any)}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    waxSeal === ws.id
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:scale-105'
                  }`}
                >
                  <span className="text-base">{ws.emoji}</span>
                  <span>{ws.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Handwriting Font Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Font Style
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'handwriting', label: 'Handwritten ✍️' },
                { id: 'romantic', label: 'Romantic Serif 📖' },
                { id: 'editorial', label: 'Editorial 📰' },
                { id: 'sans', label: 'Modern Sans 🖋️' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontStyle(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    fontStyle === f.id
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Letter Body *
              </label>
              <span className="text-[10px] text-slate-400">
                {content.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pour your sweetest thoughts, inside memories, promises, and love into this letter..."
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400 leading-relaxed font-serif"
            />
          </div>

          {/* ATTACHMENTS (Polaroid & Voice Note) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Romantic Enclosures
            </span>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Photo Polaroid */}
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  polaroidUrl
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{polaroidUrl ? 'Polaroid Attached ✓' : 'Add Polaroid Photo'}</span>
              </button>

              {/* Voice Note */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    audioUrl
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{audioUrl ? 'Voice Note Attached ✓' : 'Record Voice Whisper'}</span>
                </button>
              )}
            </div>

            {/* Polaroid caption input */}
            {polaroidUrl && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={polaroidCaption}
                  onChange={(e) => setPolaroidCaption(e.target.value)}
                  placeholder="Polaroid handwritten caption..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setPolaroidUrl(null)}
                  className="text-xs text-red-500 font-semibold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* ADVANCED PROTECTION ACCORDIONS */}
          <div className="space-y-3 pt-2">
            {/* 1. Timelock */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableTimelock}
                  onChange={(e) => setEnableTimelock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Timelock (Keep sealed until future date)
                </span>
              </label>

              {enableTimelock && (
                <div className="mt-2.5">
                  <input
                    type="datetime-local"
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                    Your partner will see a live countdown clock and cannot open before this time!
                  </p>
                </div>
              )}
            </div>

            {/* 2. SECRET PASSWORD PROTECTION */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(e) => setEnablePassword(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-600" /> Secret Password / PIN Protection 🔐
                </span>
              </label>

              {enablePassword && (
                <div className="mt-2.5 space-y-2">
                  <input
                    type="text"
                    required={enablePassword}
                    value={secretPassword}
                    onChange={(e) => setSecretPassword(e.target.value)}
                    placeholder="Set secret code, PIN, or passphrase..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                  <input
                    type="text"
                    value={passwordHint}
                    onChange={(e) => setPasswordHint(e.target.value)}
                    placeholder="Optional hint (e.g. The year we first traveled together)..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* 3. SECRET ROMANCE TRIVIA QUESTION ("Question right letter otherwise it will be deleted") */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50/70 to-red-50/70 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-900/60">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableQuestion}
                  onChange={(e) => setEnableQuestion(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-600 fill-current" /> High-Stakes Mystery Question (Answer Right or Letter Deletes!) 🔥
                </span>
              </label>

              {enableQuestion && (
                <div className="mt-2.5 space-y-2.5 animate-in fade-in">
                  <div className="p-2 rounded-xl bg-orange-100/60 dark:bg-orange-900/40 text-[11px] text-orange-800 dark:text-orange-200 flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-orange-600" />
                    <span>
                      If {partnerName} answers incorrectly and runs out of attempts, this letter will immediately self-destruct into ashes forever!
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Secret Question *
                    </label>
                    <input
                      type="text"
                      required={enableQuestion}
                      value={secretQuestion}
                      onChange={(e) => setSecretQuestion(e.target.value)}
                      placeholder="e.g. What was the exact name of our favorite cafe?"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correct Answer * (case-insensitive)
                    </label>
                    <input
                      type="text"
                      required={enableQuestion}
                      value={secretAnswer}
                      onChange={(e) => setSecretAnswer(e.target.value)}
                      placeholder="e.g. Cafe Luna"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-orange-300 dark:border-orange-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Optional Hint
                      </label>
                      <input
                        type="text"
                        value={secretQuestionHint}
                        onChange={(e) => setSecretQuestionHint(e.target.value)}
                        placeholder="e.g. Near the old library"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-orange-200 dark:border-orange-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Allowed Attempts
                      </label>
                      <select
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-orange-200 dark:border-orange-800/60 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        <option value={1}>1 Attempt (Extreme Stakes ☠️)</option>
                        <option value={2}>2 Attempts</option>
                        <option value={3}>3 Attempts (Recommended)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{saving ? 'Wax-Sealing...' : 'Seal & Send Love Letter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
