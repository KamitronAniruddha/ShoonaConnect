import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoveLetter } from '../types';
import { supabase } from '../lib/supabase';
import { letterRowToLoveLetter, letterToRow } from '../utils/supabaseMappers';
import {
  Mail,
  Plus,
  Heart,
  Lock,
  Unlock,
  Clock,
  Trash2,
  X,
  Sparkles,
  Gift,
  CheckCheck,
  Eye,
  Flame,
  KeyRound,
  Mic,
  Camera,
  Search,
  Filter,
  Star,
} from 'lucide-react';
import { LetterComposeModal } from './letters/LetterComposeModal';
import { LetterUnlockModal } from './letters/LetterUnlockModal';
import { LetterReaderModal } from './letters/LetterReaderModal';

export const LettersView: React.FC = () => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');

  // Modals state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [unlockingLetter, setUnlockingLetter] = useState<LoveLetter | null>(null);
  const [readingLetter, setReadingLetter] = useState<LoveLetter | null>(null);
  const [replyLetter, setReplyLetter] = useState<LoveLetter | null>(null);

  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerName = partnerProfile?.displayName || 'My Love';

  // Listen to letters in real-time
  useEffect(() => {
    if (!coupleId) return;

    const fetchLetters = async () => {
      const { data, error } = await supabase
        .from('love_letters')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLetters(data.map(letterRowToLoveLetter));
      }
    };

    fetchLetters();

    const channel = supabase
      .channel(`love_letters:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_letters',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          fetchLetters();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Handle saving new letter
  const handleSendLetter = async (letterData: Partial<LoveLetter>) => {
    if (!coupleId || !myUid) return;

    try {
      const payload: Partial<LoveLetter> = {
        coupleId,
        senderId: myUid,
        authorId: myUid,
        senderName: userProfile?.displayName || 'My Love',
        authorName: userProfile?.displayName || 'My Love',
        recipientId: partnerProfile?.uid || undefined,
        recipientName: partnerName,
        isOpened: false,
        isRead: false,
        ...letterData,
        createdAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('love_letters')
        .insert(letterToRow(payload));

      if (error) throw error;
    } catch (err) {
      console.error('Error sending letter:', err);
      throw err;
    }
  };

  // Handle opening / unlocking letter
  const handleLetterClick = (letter: LoveLetter) => {
    // If sender wrote it, they can read it anytime
    if (letter.senderId === myUid) {
      setReadingLetter(letter);
      return;
    }

    // Check if timelocked
    const isTimelocked = letter.unlockDate && new Date(letter.unlockDate).getTime() > Date.now();

    // Check if password or secret question protected
    const isProtected = isTimelocked || letter.isPasswordProtected || letter.isQuestionProtected;

    if (isProtected) {
      setUnlockingLetter(letter);
    } else {
      markAsReadAndOpen(letter);
    }
  };

  const markAsReadAndOpen = async (letter: LoveLetter) => {
    setReadingLetter(letter);
    if (!letter.isOpened && coupleId && letter.recipientId === myUid) {
      try {
        await supabase
          .from('love_letters')
          .update({
            is_read: true,
          })
          .eq('id', letter.id)
          .eq('couple_id', coupleId);
      } catch {
        // ignore
      }
    }
  };

  // Delete letter
  const handleDeleteLetter = async (id: string) => {
    if (!coupleId) return;
    if (!confirm('Are you sure you want to delete this love letter?')) return;
    try {
      await supabase
        .from('love_letters')
        .delete()
        .eq('id', id)
        .eq('couple_id', coupleId);
      if (readingLetter?.id === id) setReadingLetter(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (e: React.MouseEvent, letter: LoveLetter) => {
    e.stopPropagation();
    if (!coupleId) return;
    try {
      await supabase
        .from('love_letters')
        .update({
          is_favorite: !letter.isFavorite,
        })
        .eq('id', letter.id)
        .eq('couple_id', coupleId);
    } catch {
      // ignore
    }
  };

  // Reply handler
  const handleReplyToLetter = (letter: LoveLetter) => {
    setReadingLetter(null);
    setReplyLetter(letter);
    setIsComposeOpen(true);
  };

  // Filter letters
  const inboxLetters = letters.filter((l) => l.senderId !== myUid);
  const sentLetters = letters.filter((l) => l.senderId === myUid);
  const currentPool = activeTab === 'inbox' ? inboxLetters : sentLetters;

  const filteredLetters = currentPool.filter((l) => {
    const matchesSearch =
      (l.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOccasion = selectedOccasion === 'all' || l.occasion === selectedOccasion;
    return matchesSearch && matchesOccasion;
  });

  const getWaxSealEmoji = (ws?: string) => {
    switch (ws) {
      case 'rose':
        return '🌹';
      case 'crown':
        return '👑';
      case 'infinity':
        return '♾️';
      case 'kiss':
        return '💋';
      case 'stars':
        return '✨';
      case 'lock':
        return '🔐';
      case 'heart':
      default:
        return '💕';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-500">
              <Mail className="w-6 h-6" />
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Wax-Sealed Love Letters
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Handwritten correspondence, secret password envelopes, and high-stakes romance trivia.
          </p>
        </div>

        <button
          id="btn-write-letter"
          type="button"
          onClick={() => {
            setReplyLetter(null);
            setIsComposeOpen(true);
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Pen a Love Letter
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Inbox vs Sent Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            id="tab-letters-inbox"
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Received Envelopes ({inboxLetters.length})
          </button>
          <button
            type="button"
            id="tab-letters-sent"
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            Letters Penned ({sentLetters.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search letters..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>
      </div>

      {/* Envelopes Grid */}
      {filteredLetters.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-slate-800 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-400 mx-auto flex items-center justify-center">
            <Mail className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            {activeTab === 'inbox' ? 'No love letters received yet' : 'You have not written any letters yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Pour your heartfelt thoughts, timelock a surprise for an anniversary, or challenge your love to a romance trivia puzzle!
          </p>
          <button
            type="button"
            onClick={() => setIsComposeOpen(true)}
            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-200 cursor-pointer"
          >
            Write Your First Love Letter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLetters.map((letter) => {
            const isLocked = letter.unlockDate && new Date(letter.unlockDate).getTime() > Date.now();
            const isProtec = isLocked || letter.isPasswordProtected || letter.isQuestionProtected;

            return (
              <div
                key={letter.id}
                onClick={() => handleLetterClick(letter)}
                className={`group relative rounded-3xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
                  letter.isQuestionProtected
                    ? 'bg-gradient-to-br from-orange-50/90 to-red-50/80 dark:from-orange-950/30 dark:to-red-950/20 border-orange-200 dark:border-orange-900/50'
                    : isLocked
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/70 dark:from-amber-950/30 dark:to-slate-900 border-amber-200 dark:border-amber-900/40'
                    : letter.theme === 'midnight'
                    ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-indigo-900/60'
                    : letter.theme === 'blush'
                    ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-slate-900 border-rose-200 dark:border-rose-900/40'
                    : 'bg-[#faf6ee] dark:bg-slate-900 border-[#e8ddc8] dark:border-slate-800'
                }`}
              >
                {/* Envelope Top Header with Stamp & Wax Seal */}
                <div>
                  <div className="flex items-start justify-between">
                    {/* Wax Seal Badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-lg shadow-md border-2 border-white/50 group-hover:scale-110 transition-transform">
                        {getWaxSealEmoji(letter.waxSeal)}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">
                          {letter.occasion || 'Love Letter'}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Favorite star */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, letter)}
                      className="p-1 rounded-full text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${letter.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Letter Title */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold font-serif line-clamp-1 group-hover:text-rose-500 transition-colors">
                      {letter.title}
                    </h3>

                    {/* Protected/Locked indicator */}
                    {letter.isQuestionProtected ? (
                      <div className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>High-Stakes Trivia Lock 🔥</span>
                      </div>
                    ) : letter.isPasswordProtected ? (
                      <div className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Password Protected 🔐</span>
                      </div>
                    ) : isLocked ? (
                      <div className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Sealed until {new Date(letter.unlockDate!).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <p className="text-xs opacity-75 line-clamp-2 mt-1.5 font-serif italic">
                        "{letter.content.slice(0, 90)}..."
                      </p>
                    )}
                  </div>
                </div>

                {/* Enclosures / Attachments badges */}
                <div className="flex items-center gap-1.5 my-2 flex-wrap">
                  {letter.polaroidUrl && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Polaroid
                    </span>
                  )}
                  {letter.audioUrl && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Voice Note
                    </span>
                  )}
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-black/5 dark:border-white/10 opacity-80">
                  <span>From: {letter.senderName}</span>
                  {letter.isOpened ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5" /> Broken Seal
                    </span>
                  ) : (
                    <span className="text-rose-500 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Wax Sealed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPOSE MODAL */}
      <LetterComposeModal
        isOpen={isComposeOpen}
        onClose={() => {
          setIsComposeOpen(false);
          setReplyLetter(null);
        }}
        onSend={handleSendLetter}
        userProfile={userProfile!}
        partnerName={partnerName}
        initialReplyTitle={replyLetter ? `Re: ${replyLetter.title}` : ''}
      />

      {/* UNLOCK MODAL (Password, Trivia Question, Timelock) */}
      {unlockingLetter && (
        <LetterUnlockModal
          letter={unlockingLetter}
          coupleId={coupleId!}
          onClose={() => setUnlockingLetter(null)}
          onUnlocked={(unlocked) => {
            setUnlockingLetter(null);
            markAsReadAndOpen(unlocked);
          }}
          onDestroyed={(destroyedId) => {
            setLetters((prev) => prev.filter((l) => l.id !== destroyedId));
            setUnlockingLetter(null);
          }}
        />
      )}

      {/* READ MODAL (Full parchment, audio player, polaroid, print, reply) */}
      {readingLetter && (
        <LetterReaderModal
          letter={readingLetter}
          onClose={() => setReadingLetter(null)}
          onDelete={handleDeleteLetter}
          onReply={handleReplyToLetter}
        />
      )}
    </div>
  );
};
