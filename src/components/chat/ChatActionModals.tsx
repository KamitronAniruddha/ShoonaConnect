import React, { useState } from 'react';
import {
  X,
  Heart,
  Calendar,
  Gamepad2,
  BarChart3,
  Clock,
  CheckSquare,
  FileText,
  HelpCircle,
  Sparkles,
  Bell,
  MapPin,
  Send,
  Plus,
  Trash2,
  Shuffle,
  Smile,
  Compass,
} from 'lucide-react';
import { RICH_DAILY_QUESTIONS } from '../../utils/coupleData';
import { DateInviteData, GameChallengeData, PollData, SharedListData, LoveNoteData, CountdownData } from '../../types';

interface ActionModalsProps {
  activeModal:
    | 'love_note'
    | 'date_invite'
    | 'game_challenge'
    | 'poll'
    | 'countdown'
    | 'shared_list'
    | 'shared_note'
    | 'question'
    | 'connect_ai'
    | 'reminder'
    | 'location'
    | null;
  onClose: () => void;
  onSendLoveNote: (data: LoveNoteData) => void;
  onSendDateInvite: (data: DateInviteData) => void;
  onSendGameChallenge: (data: { gameType: 'chess' | 'tictactoe'; notes?: string }) => void;
  onSendPoll: (data: { question: string; options: string[]; allowMultiple: boolean }) => void;
  onSendCountdown: (data: CountdownData) => void;
  onSendSharedList: (data: { title: string; items: string[] }) => void;
  onSendSharedNote: (data: { title: string; content: string }) => void;
  onSendQuestion: (question: string) => void;
  onSendLocation: (data: { address: string; lat: number; lng: number }) => void;
  onSendReminder: (remindAt: string, noteText: string) => void;
  onApplyAISuggestion: (text: string) => void;
  partnerName: string;
}

export const ChatActionModals: React.FC<ActionModalsProps> = ({
  activeModal,
  onClose,
  onSendLoveNote,
  onSendDateInvite,
  onSendGameChallenge,
  onSendPoll,
  onSendCountdown,
  onSendSharedList,
  onSendSharedNote,
  onSendQuestion,
  onSendLocation,
  onSendReminder,
  onApplyAISuggestion,
  partnerName,
}) => {
  // Love note state
  const [loveNoteText, setLoveNoteText] = useState('Thinking of you and smiling. You have my whole heart today and always 💕');
  const [loveNoteStyle, setLoveNoteStyle] = useState<'rose' | 'golden' | 'midnight' | 'sunset'>('rose');

  // Date invite state
  const [dateTitle, setDateTitle] = useState('Candlelight Dinner & Rooftop Walk');
  const [dateDay, setDateDay] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [dateTime, setDateTime] = useState('07:30 PM');
  const [dateLocation, setDateLocation] = useState('Our favorite cozy corner');

  // Game challenge state
  const [selectedGame, setSelectedGame] = useState<'chess' | 'tictactoe'>('chess');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('What should we do together this weekend? 💕');
  const [pollOptions, setPollOptions] = useState(['Cozy Movie & Popcorn 🍿', 'Romantic Dinner Date 🍷', 'Spontaneous Long Drive 🚗', 'Cook a New Recipe Together 🍝']);
  const [pollMulti, setPollMulti] = useState(false);

  // Countdown state
  const [countdownTitle, setCountdownTitle] = useState('Our Next Romantic Getaway');
  const [countdownDate, setCountdownDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16)
  );
  const [countdownEmoji, setCountdownEmoji] = useState('✈️');

  // Shared List state
  const [listTitle, setListTitle] = useState('Weekend Date Grocery & Snacks 🛒');
  const [listItems, setListItems] = useState(['Strawberries & Whipped Cream', 'Sparkling Peach Cider', 'Gourmet Dark Chocolates', 'Candles']);
  const [newItemInput, setNewItemInput] = useState('');

  // Shared Note state
  const [noteTitle, setNoteTitle] = useState('Our Dream Travel Bucket List 🌟');
  const [noteContent, setNoteContent] = useState('1. Watch sunrise from a hot air balloon\n2. Stargaze in the quiet hills\n3. Walk barefoot in the rain');

  // Question state
  const [questionText, setQuestionText] = useState(
    RICH_DAILY_QUESTIONS[Math.floor(Math.random() * RICH_DAILY_QUESTIONS.length)].question
  );

  // AI assistant state
  const [aiTab, setAiTab] = useState<'date' | 'messages' | 'starters' | 'apology'>('date');

  // Reminder state
  const [remindOption, setRemindOption] = useState<'3h' | 'tomorrow' | 'custom'>('3h');
  const [customRemindDate, setCustomRemindDate] = useState('');

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-pink-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-2">
            {activeModal === 'love_note' && <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />}
            {activeModal === 'date_invite' && <Calendar className="w-5 h-5 text-rose-500" />}
            {activeModal === 'game_challenge' && <Gamepad2 className="w-5 h-5 text-indigo-500" />}
            {activeModal === 'poll' && <BarChart3 className="w-5 h-5 text-emerald-500" />}
            {activeModal === 'countdown' && <Clock className="w-5 h-5 text-amber-500" />}
            {activeModal === 'shared_list' && <CheckSquare className="w-5 h-5 text-sky-500" />}
            {activeModal === 'shared_note' && <FileText className="w-5 h-5 text-teal-500" />}
            {activeModal === 'question' && <HelpCircle className="w-5 h-5 text-fuchsia-500" />}
            {activeModal === 'connect_ai' && <Sparkles className="w-5 h-5 text-amber-500" />}
            {activeModal === 'reminder' && <Bell className="w-5 h-5 text-rose-500" />}
            {activeModal === 'location' && <MapPin className="w-5 h-5 text-rose-500" />}

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeModal === 'love_note' && 'Send Love Note 💕'}
              {activeModal === 'date_invite' && 'Plan a Date Night 📅'}
              {activeModal === 'game_challenge' && 'Challenge Partner to Game 🎮'}
              {activeModal === 'poll' && 'Create Couple Poll 📊'}
              {activeModal === 'countdown' && 'Create Live Countdown ⏳'}
              {activeModal === 'shared_list' && 'Send Shared List / Todo 🛒'}
              {activeModal === 'shared_note' && 'Send Shared Note 📝'}
              {activeModal === 'question' && 'Ask Partner a Question ❓'}
              {activeModal === 'connect_ai' && 'Connect AI Assistant ✨'}
              {activeModal === 'reminder' && 'Set Message Reminder ⏰'}
              {activeModal === 'location' && 'Share Voluntary Location 📍'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* 1. Love Note */}
          {activeModal === 'love_note' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Card Style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'rose', name: 'Rose Petal', bg: 'from-rose-500 to-pink-600 text-white' },
                    { id: 'golden', name: 'Golden Hour', bg: 'from-amber-400 to-rose-500 text-white' },
                    { id: 'midnight', name: 'Midnight Velvet', bg: 'from-slate-900 via-indigo-950 to-purple-900 text-white' },
                    { id: 'sunset', name: 'Sunset Glow', bg: 'from-fuchsia-600 to-pink-500 text-white' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLoveNoteStyle(style.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        loveNoteStyle === style.id
                          ? 'border-rose-500 ring-2 ring-rose-400'
                          : 'border-slate-200 dark:border-slate-700 hover:opacity-80'
                      }`}
                    >
                      <div className={`h-8 rounded-lg bg-gradient-to-br ${style.bg} mb-1 flex items-center justify-center shadow-xs`}>
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[10px] font-medium">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Your Love Note for {partnerName}
                </label>
                <textarea
                  rows={4}
                  value={loveNoteText}
                  onChange={(e) => setLoveNoteText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white placeholder-slate-400 leading-relaxed resize-none"
                  placeholder="Pour your heart out in a few loving words..."
                />
              </div>

              {/* Live Preview Card */}
              <div
                className={`p-5 rounded-3xl bg-gradient-to-br shadow-md text-white ${
                  loveNoteStyle === 'rose'
                    ? 'from-rose-500 via-pink-500 to-rose-600'
                    : loveNoteStyle === 'golden'
                    ? 'from-amber-400 via-orange-500 to-rose-500'
                    : loveNoteStyle === 'midnight'
                    ? 'from-slate-900 via-indigo-950 to-purple-900 border border-indigo-500/30'
                    : 'from-fuchsia-600 to-pink-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2 opacity-90">
                  <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current" /> Private Love Note
                  </span>
                  <span className="text-[10px]">Just for {partnerName}</span>
                </div>
                <p className="font-serif italic text-sm sm:text-base leading-relaxed">
                  "{loveNoteText || 'Thinking of you...'}"
                </p>
              </div>
            </div>
          )}

          {/* 2. Date Invite */}
          {activeModal === 'date_invite' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Date Title
                </label>
                <input
                  type="text"
                  value={dateTitle}
                  onChange={(e) => setDateTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="e.g. Candlelight Dinner, Sunset Picnic..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateDay}
                    onChange={(e) => setDateDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                    placeholder="e.g. 7:30 PM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Location / Atmosphere
                </label>
                <input
                  type="text"
                  value={dateLocation}
                  onChange={(e) => setDateLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  placeholder="e.g. Rooftop Cafe, Beachwalk, Cozy living room"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * When {partnerName} clicks Accept in chat, this date is automatically scheduled into your couple's Dates & Milestones tab!
              </p>
            </div>
          )}

          {/* 3. Game Challenge */}
          {activeModal === 'game_challenge' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Choose Game to Challenge {partnerName}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGame('chess')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedGame === 'chess'
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl mb-1">♟️</div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Chess Match</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time couple chess with live clocks and romantic post-game memories.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGame('tictactoe')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedGame === 'tictactoe'
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl mb-1">⭕❌</div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tic-Tac-Toe</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Quick cute duel with custom love symbols & streaks.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* 4. Poll */}
          {activeModal === 'poll' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Poll Question
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Options
                </label>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[idx] = e.target.value;
                        setPollOptions(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pollMulti}
                  onChange={(e) => setPollMulti(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Allow multiple choices
                </span>
              </label>
            </div>
          )}

          {/* 5. Countdown */}
          {activeModal === 'countdown' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Event / Milestone
                </label>
                <input
                  type="text"
                  value={countdownTitle}
                  onChange={(e) => setCountdownTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="e.g. Paris Trip, Anniversary, Movie Date..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={countdownDate}
                    onChange={(e) => setCountdownDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Emoji Badge
                  </label>
                  <div className="flex items-center gap-1">
                    {['✈️', '🎂', '💍', '🍿', '🏖️', '❤️'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCountdownEmoji(em)}
                        className={`p-1.5 rounded-lg text-base hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          countdownEmoji === em ? 'bg-amber-100 dark:bg-amber-950/60 ring-1 ring-amber-400' : ''
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. Shared List */}
          {activeModal === 'shared_list' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  List Title
                </label>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Items (Both of you can check items off in real time!)
                </label>
                {listItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 shrink-0" />
                    <span className="flex-1 text-xs truncate">{item}</span>
                    <button
                      type="button"
                      onClick={() => setListItems(listItems.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newItemInput.trim()) {
                        e.preventDefault();
                        setListItems([...listItems, newItemInput.trim()]);
                        setNewItemInput('');
                      }
                    }}
                    placeholder="Add an item and press Enter..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newItemInput.trim()) {
                        setListItems([...listItems, newItemInput.trim()]);
                        setNewItemInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. Shared Note */}
          {activeModal === 'shared_note' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Note Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Note Content
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none leading-relaxed"
                  placeholder="Share a thought, itinerary, or cute reminder..."
                />
              </div>
            </div>
          )}

          {/* 8. Couple Question */}
          {activeModal === 'question' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Question for {partnerName}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const rnd = RICH_DAILY_QUESTIONS[Math.floor(Math.random() * RICH_DAILY_QUESTIONS.length)];
                    setQuestionText(rnd.question);
                  }}
                  className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Random Suggestion
                </button>
              </div>
              <textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * When sent, both you and {partnerName} will have an interactive answer field inside chat to reveal your thoughts to each other!
              </p>
            </div>
          )}

          {/* 9. Connect AI Assistant */}
          {activeModal === 'connect_ai' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Connect AI helps craft romantic plans and sweet words. Private messages are never auto-shared.
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                {[
                  { id: 'date', label: 'Date Ideas 🍷' },
                  { id: 'messages', label: 'Sweet Messages 💌' },
                  { id: 'starters', label: 'Starters 💬' },
                  { id: 'apology', label: 'Kind Reassurance 🕊️' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAiTab(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                      aiTab === t.id
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Suggestions list */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {aiTab === 'date' && (
                  <>
                    {[
                      'Cozy indoor blanket fort with fairy lights, homemade hot chocolate, and our favorite movie.',
                      'Surprise late-night dessert run to a 24/7 cafe followed by a slow drive listening to our favorite album.',
                      'Sunset painting date: we each get a mini canvas and paint our favorite memory together.',
                      'DIY homemade pizza night where each of us designs a half for the other person to taste test.',
                    ].map((idea, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onApplyAISuggestion(`Idea: ${idea}`);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-colors cursor-pointer text-xs leading-relaxed"
                      >
                        <p>{idea}</p>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-1 inline-block">
                          Tap to insert into chat ➔
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {aiTab === 'messages' && (
                  <>
                    {[
                      `Just wanted to remind you that seeing your name on my screen still gives me the sweetest butterflies. Love you endlessly 💕`,
                      `Taking a quiet moment in the middle of a busy day just to think of your smile. You make everything brighter ✨`,
                      `Counting down the minutes until I can hold your hand and hear about your whole day. You're my safe haven 🏡`,
                      `Thank you for being you, for loving me so gently, and for filling my life with so much happiness ❤️`,
                    ].map((msg, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onApplyAISuggestion(msg);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 transition-colors cursor-pointer text-xs leading-relaxed"
                      >
                        <p>{msg}</p>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-1 inline-block">
                          Tap to insert into chat ➔
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {aiTab === 'starters' && (
                  <>
                    {[
                      'If we could pause time for 3 hours right now, what would you want us to do together?',
                      'What was the highest high and the lowest low of your day today?',
                      'What is a song that instantly makes you think of our love?',
                      'If we could pack our bags tonight and wake up anywhere in the world tomorrow, where are we going?',
                    ].map((st, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onApplyAISuggestion(st);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/40 border border-slate-200 dark:border-slate-700 hover:border-fuchsia-300 transition-colors cursor-pointer text-xs leading-relaxed"
                      >
                        <p>{st}</p>
                        <span className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-semibold mt-1 inline-block">
                          Tap to insert into chat ➔
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {aiTab === 'apology' && (
                  <>
                    {[
                      'I care about you so deeply, and the last thing I ever want is to hurt your heart. Let’s talk whenever you feel ready, I’m listening with love 🤍',
                      'I’m so sorry for being distracted earlier. You are my absolute priority and I want to hear how you’re feeling.',
                      'No matter what stressful things happen outside, we are always on the same team. Big warm hug whenever you need it 🫂',
                    ].map((ap, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          onApplyAISuggestion(ap);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-xs leading-relaxed"
                      >
                        <p>{ap}</p>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-block">
                          Tap to insert into chat ➔
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 10. Reminder */}
          {activeModal === 'reminder' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                When should we remind you?
              </label>
              <div className="space-y-2">
                {[
                  { id: '3h', label: 'In 3 hours' },
                  { id: 'tomorrow', label: 'Tomorrow morning at 9:00 AM' },
                  { id: 'custom', label: 'Custom date & time' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="remindOption"
                      checked={remindOption === opt.id}
                      onChange={() => setRemindOption(opt.id as any)}
                      className="text-rose-500 focus:ring-rose-400"
                    />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {remindOption === 'custom' && (
                <input
                  type="datetime-local"
                  value={customRemindDate}
                  onChange={(e) => setCustomRemindDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              )}
            </div>
          )}

          {/* 11. Location */}
          {activeModal === 'location' && (
            <div className="space-y-3 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Share Voluntary Location with {partnerName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Location is shared only once upon clicking Send and is never continuously tracked.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        onSendLocation({
                          address: 'Current Location',
                          lat: pos.coords.latitude,
                          lng: pos.coords.longitude,
                        });
                        onClose();
                      },
                      () => {
                        // fallback sample coordinates
                        onSendLocation({
                          address: 'Near City Center',
                          lat: 18.5204,
                          lng: 73.8567,
                        });
                        onClose();
                      }
                    );
                  } else {
                    onSendLocation({
                      address: 'Near City Center',
                      lat: 18.5204,
                      lng: 73.8567,
                    });
                    onClose();
                  }
                }}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Send My Current Coordinates 📍
              </button>
            </div>
          )}
        </div>

        {/* Footer actions for modals with direct send */}
        {activeModal !== 'connect_ai' && activeModal !== 'location' && (
          <div className="p-4 border-t border-rose-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeModal === 'love_note') {
                  onSendLoveNote({ note: loveNoteText, style: loveNoteStyle });
                } else if (activeModal === 'date_invite') {
                  onSendDateInvite({
                    title: dateTitle,
                    date: dateDay,
                    time: dateTime,
                    location: dateLocation,
                    status: 'pending',
                  });
                } else if (activeModal === 'game_challenge') {
                  onSendGameChallenge({ gameType: selectedGame });
                } else if (activeModal === 'poll') {
                  onSendPoll({
                    question: pollQuestion,
                    options: pollOptions.filter((o) => o.trim()),
                    allowMultiple: pollMulti,
                  });
                } else if (activeModal === 'countdown') {
                  onSendCountdown({
                    title: countdownTitle,
                    targetDate: countdownDate,
                    emoji: countdownEmoji,
                  });
                } else if (activeModal === 'shared_list') {
                  onSendSharedList({
                    title: listTitle,
                    items: listItems.filter((i) => i.trim()),
                  });
                } else if (activeModal === 'shared_note') {
                  onSendSharedNote({
                    title: noteTitle,
                    content: noteContent,
                  });
                } else if (activeModal === 'question') {
                  onSendQuestion(questionText);
                } else if (activeModal === 'reminder') {
                  const remindTime =
                    remindOption === '3h'
                      ? new Date(Date.now() + 3 * 3600000).toISOString()
                      : remindOption === 'tomorrow'
                      ? new Date(Date.now() + 24 * 3600000).toISOString()
                      : customRemindDate || new Date().toISOString();
                  onSendReminder(remindTime, 'Message reminder');
                }
                onClose();
              }}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-rose-200 dark:shadow-none transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send into Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
