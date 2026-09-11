import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePresence } from '../hooks/usePresence';
import {
  Message,
  ReplyPreview,
  ChatSettings,
  CallRecord,
  SharedAlbum,
  ActiveTab,
  DateInviteData,
  GameChallengeData,
  PollData,
  LoveNoteData,
  CountdownData,
} from '../types';
import {
  sendChatMessage,
  toggleMessageReaction,
  editChatMessage,
  deleteChatMessage,
  togglePinChatMessage,
  toggleStarChatMessage,
  markChatMessageAsRead,
  respondToDateInvite,
  respondToGameChallenge,
  voteOnCouplePoll,
  answerCoupleQuestion,
  toggleSharedListItem,
  saveMessageToMemories,
  turnMessageIntoLetter,
  createReminderFromMessage,
  setTypingStatus,
  listenToTypingStatus,
  initiateCall,
  answerCall,
  declineCall,
  endCall,
  createSharedAlbum,
  playMessageReceivedSound,
  playLoveNoteChime,
  listenToMessages,
  listenToCalls,
} from '../utils/chatService';
import { supabase } from '../lib/supabase';

// Subcomponents
import { ChatSidebar } from './chat/ChatSidebar';
import { ChatMessageBubble } from './chat/ChatMessageBubble';
import { ChatComposer } from './chat/ChatComposer';
import { ChatRightInfoPanel } from './chat/ChatRightInfoPanel';
import { ChatActionModals } from './chat/ChatActionModals';
import { ChatCallModal } from './chat/ChatCallModal';
import { ChatPhotoViewer } from './chat/ChatPhotoViewer';
import { PartnerProfileModal } from './PartnerProfileModal';

import {
  Phone,
  Video,
  Info,
  Search,
  Pin,
  Heart,
  ChevronDown,
  ArrowLeft,
  X,
  Sparkles,
} from 'lucide-react';

interface ChatViewProps {
  setActiveTab?: (tab: ActiveTab) => void;
}

const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'rose',
  wallpaper: 'hearts',
  readReceipts: true,
  typingIndicators: true,
  onlineStatus: true,
  lastSeen: true,
  disappearingDuration: 'off',
  smartReplies: true,
};

export const ChatView: React.FC<ChatViewProps> = ({ setActiveTab }) => {
  const { userProfile, couple, partnerProfile } = useAuth();
  const coupleId = couple?.id;
  const myUid = userProfile?.uid;
  const partnerUid = partnerProfile?.uid;
  const partnerName = partnerProfile?.nickname || partnerProfile?.displayName || 'My Sweetheart';

  // Presence hook
  const { partnerPresence, isPartnerOnline, partnerStatusText } = usePresence({
    coupleId,
    myUid,
    partnerUid,
  });

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [starredMessages, setStarredMessages] = useState<Message[]>([]);
  const [sharedAlbums, setSharedAlbums] = useState<SharedAlbum[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Settings
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    try {
      const stored = localStorage.getItem('shoona_chat_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI state
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingInHeader, setIsSearchingInHeader] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pinned' | 'media' | 'dates'>('all');
  const [replyingTo, setReplyingTo] = useState<ReplyPreview | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [activePhotoViewer, setActivePhotoViewer] = useState<{
    url: string;
    caption?: string;
    senderName?: string;
    date?: string;
  } | null>(null);

  // Active action modal
  const [activeActionModal, setActiveActionModal] = useState<
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
    | null
  >(null);

  // Active call state
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);

  // Scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const lastMessageCountRef = useRef<number>(0);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottomBtn(isUp);
  };

  // Update settings handler
  const handleUpdateSettings = (updates: Partial<ChatSettings>) => {
    setChatSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('shoona_chat_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 1. Listen to Messages
  useEffect(() => {
    if (!coupleId) return;

    const unsub = listenToMessages(coupleId, (list) => {
      const pinned: Message[] = [];
      const starred: Message[] = [];

      list.forEach((m) => {
        if (m.isPinned) pinned.push(m);
        if (m.isStarred) starred.push(m);
      });

      // If new message from partner arrived, play incoming chime
      if (
        list.length > lastMessageCountRef.current &&
        lastMessageCountRef.current > 0
      ) {
        const newest = list[list.length - 1];
        if (newest && newest.senderId !== myUid) {
          if (newest.loveNote) {
            playLoveNoteChime();
          } else {
            playMessageReceivedSound();
          }
        }
      }
      lastMessageCountRef.current = list.length;

      setMessages(list);
      setPinnedMessages(pinned);
      setStarredMessages(starred);

      // Mark unread messages as read
      if (myUid && chatSettings.readReceipts) {
        const unreadIds = list
          .filter((m) => m.senderId !== myUid && (!m.readBy || !m.readBy.includes(myUid)))
          .map((m) => m.id);

        unreadIds.forEach((id) => {
          const currentMsg = list.find((m) => m.id === id);
          markChatMessageAsRead(coupleId, id, myUid, currentMsg?.readBy);
        });
      }

      // Auto scroll on first load or when near bottom
      if (!showScrollBottomBtn) {
        setTimeout(() => scrollToBottom('auto'), 50);
      }
    });

    return () => unsub();
  }, [coupleId, myUid, chatSettings.readReceipts]);

  // 2. Listen to Partner's Typing Status
  useEffect(() => {
    if (!coupleId || !partnerUid) return;
    const unsub = listenToTypingStatus(coupleId, partnerUid, (isTyping) => {
      setIsPartnerTyping(isTyping);
    });
    return () => unsub();
  }, [coupleId, partnerUid]);

  // 3. Listen to Active Calls
  useEffect(() => {
    if (!coupleId || !myUid) return;
    const unsub = listenToCalls(coupleId, (call) => {
      setActiveCall(call);
    });
    return () => unsub();
  }, [coupleId, myUid]);

  // 4. Listen to Shared Albums
  useEffect(() => {
    if (!coupleId) return;
    supabase
      .from('shared_albums')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setSharedAlbums(
            data.map((d) => ({
              id: d.id,
              coupleId: d.couple_id,
              title: d.title,
              description: d.description,
              coverUrl: d.cover_url,
              photos: [],
              createdBy: d.created_by,
              createdAt: d.created_at,
              updatedAt: d.updated_at,
            }))
          );
        }
      });
  }, [coupleId]);

  // Disappearing messages auto-cleaner check
  useEffect(() => {
    if (chatSettings.disappearingDuration === 'off') return;
    const interval = setInterval(() => {
      const durationHours =
        chatSettings.disappearingDuration === '1h'
          ? 1
          : chatSettings.disappearingDuration === '1d'
          ? 24
          : chatSettings.disappearingDuration === '7d'
          ? 168
          : 720;

      const threshold = Date.now() - durationHours * 3600000;
      messages.forEach((m) => {
        if (new Date(m.createdAt).getTime() < threshold && !m.isPinned && !m.isStarred) {
          if (!m.deletedFor?.includes(myUid!)) {
            deleteChatMessage(coupleId!, m.id, false, myUid!, m.deletedFor);
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [chatSettings.disappearingDuration, messages, coupleId, myUid]);

  // Send message handler
  const handleSendMessage = async (
    text: string,
    mediaUrl?: string,
    mediaType?: 'image' | 'audio'
  ) => {
    if (!coupleId || !userProfile) return;

    if (editingMessage) {
      await editChatMessage(coupleId, editingMessage.id, text);
      setEditingMessage(null);
      return;
    }

    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text,
      mediaUrl,
      mediaType,
      replyTo: replyingTo,
    });

    setReplyingTo(null);
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  // Action handlers
  const handleSendLoveNote = async (data: LoveNoteData) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: data.note,
      type: 'love_note',
      loveNoteData: data,
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendDateInvite = async (data: DateInviteData) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Date Invite: ${data.title} on ${data.date}`,
      type: 'date_invite',
      dateInvite: data,
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendGameChallenge = async (data: {
    gameType: 'chess' | 'tictactoe';
    notes?: string;
  }) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Challenged to ${data.gameType === 'chess' ? 'Chess' : 'Tic-Tac-Toe'}!`,
      type: 'game_challenge',
      gameChallenge: {
        gameType: data.gameType,
        status: 'pending',
        challengedBy: userProfile.uid,
        challengerName: userProfile.displayName || 'Me',
      },
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendPoll = async (data: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  }) => {
    if (!coupleId || !userProfile) return;
    const pollOptions = data.options.map((opt, i) => ({
      id: `opt-${i}-${Date.now()}`,
      text: opt,
      votes: [],
    }));

    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Poll: ${data.question}`,
      type: 'poll',
      pollData: {
        question: data.question,
        options: pollOptions,
        allowMultiple: data.allowMultiple,
      },
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendCountdown = async (data: CountdownData) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Countdown: ${data.title}`,
      type: 'countdown',
      countdownData: data,
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendSharedList = async (data: { title: string; items: string[] }) => {
    if (!coupleId || !userProfile) return;
    const items = data.items.map((it, idx) => ({
      id: `item-${idx}-${Date.now()}`,
      text: it,
      completed: false,
    }));

    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Shared List: ${data.title}`,
      type: 'shared_list',
      sharedListData: {
        title: data.title,
        items,
      },
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendSharedNote = async (data: { title: string; content: string }) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Note: ${data.title}`,
      type: 'shared_note',
      sharedNoteData: data,
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendQuestion = async (question: string) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Question: ${question}`,
      type: 'question',
      questionData: {
        question,
        answers: {},
      },
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendLocation = async (data: { address: string; lat: number; lng: number }) => {
    if (!coupleId || !userProfile) return;
    await sendChatMessage(coupleId, {
      senderId: userProfile.uid,
      senderName: userProfile.displayName || 'Me',
      senderPhoto: userProfile.photoURL,
      text: `Location: ${data.address}`,
      type: 'location',
      locationData: data,
    });
    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  const handleSendReminder = async (remindAt: string, noteText: string) => {
    if (!coupleId || !userProfile) return;
    await createReminderFromMessage(
      coupleId,
      { text: noteText } as any,
      userProfile.uid,
      remindAt
    );
  };

  // Call triggers
  const handleStartCall = async (type: 'audio' | 'video') => {
    if (!coupleId || !userProfile || !partnerProfile) return;
    try {
      await initiateCall(coupleId, userProfile, partnerProfile, type);
    } catch (err) {
      console.error('Call initiation error:', err);
    }
  };

  // Typing status trigger
  const handleTypingStatusChange = (isTyping: boolean) => {
    if (!coupleId || !myUid || !chatSettings.typingIndicators) return;
    setTypingStatus(coupleId, myUid, isTyping);
  };

  // Filtered and searched messages
  const displayedMessages = useMemo(() => {
    let list = messages;

    // Filter by type
    if (activeFilter === 'pinned') {
      list = list.filter((m) => m.isPinned);
    } else if (activeFilter === 'media') {
      list = list.filter((m) => m.mediaUrl);
    } else if (activeFilter === 'dates') {
      list = list.filter((m) => m.dateInvite);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.text?.toLowerCase().includes(q) ||
          m.senderName?.toLowerCase().includes(q) ||
          m.loveNoteData?.note.toLowerCase().includes(q) ||
          m.dateInvite?.title.toLowerCase().includes(q)
      );
    }

    return list;
  }, [messages, activeFilter, searchQuery]);

  // Jump to reply / pinned message
  const handleJumpToMessage = (messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-rose-400', 'rounded-3xl');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-rose-400', 'rounded-3xl');
      }, 2000);
    }
  };

  // Wallpaper pattern styling
  const getWallpaperClass = () => {
    switch (chatSettings.wallpaper) {
      case 'hearts':
        return 'bg-[radial-gradient(#fb7185_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0,12px_12px] opacity-95';
      case 'stars':
        return 'bg-[radial-gradient(#fbcfe8_0.8px,transparent_0.8px)] [background-size:20px_20px]';
      case 'bubbles':
        return 'bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:28px_28px]';
      case 'geometric':
        return 'bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] [background-size:24px_24px]';
      case 'floral':
        return 'bg-[radial-gradient(#fecdd3_1.2px,transparent_1.2px)] [background-size:32px_32px]';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto h-[calc(100vh-4.5rem)] flex bg-white dark:bg-slate-900 sm:rounded-3xl sm:my-2 border border-rose-100 dark:border-slate-800 shadow-xl overflow-hidden relative select-none">
      {/* 1. SIDEBAR (Desktop always, Mobile toggleable) */}
      <div className={`h-full ${mobileView === 'sidebar' ? 'block w-full' : 'hidden md:block'}`}>
        <ChatSidebar
          partnerName={partnerName}
          partnerPhoto={partnerProfile?.photoURL}
          partnerPresence={partnerPresence}
          isPartnerTyping={isPartnerTyping}
          lastMessage={messages[messages.length - 1]}
          unreadCount={
            messages.filter(
              (m) => m.senderId !== myUid && (!m.readBy || !m.readBy.includes(myUid!))
            ).length
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onStartCall={handleStartCall}
          onOpenLoveNoteModal={() => setActiveActionModal('love_note')}
        />
      </div>

      {/* 2. MAIN CONVERSATION STREAM */}
      <div
        className={`flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/60 relative ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-rose-100 dark:border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Back to Sidebar */}
            <button
              type="button"
              onClick={() => setMobileView('sidebar')}
              className="md:hidden p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Partner Avatar + Presence */}
            <div
              onClick={() => setShowPartnerModal(true)}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-rose-100 dark:bg-slate-800 ring-2 ring-rose-200 dark:ring-slate-700 flex items-center justify-center">
                  {partnerProfile?.photoURL ? (
                    <img
                      src={partnerProfile.photoURL}
                      alt={partnerName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-base font-bold text-rose-500">
                      {partnerName ? partnerName[0].toUpperCase() : '💕'}
                    </span>
                  )}
                </div>
                {isPartnerOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-rose-500 transition-colors flex items-center gap-1.5">
                  <span>{partnerName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-300 font-semibold border border-rose-100 dark:border-rose-900/40">
                    Profile
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isPartnerTyping ? (
                    <span className="text-rose-500 font-medium">typing...</span>
                  ) : isPartnerOnline ? (
                    <span className="text-emerald-500 font-medium">Online now 🟢</span>
                  ) : (
                    partnerStatusText || 'Private Couple Chat'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStartCall('audio')}
              title="Voice Call"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStartCall('video')}
              title="Video Call"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsSearchingInHeader(!isSearchingInHeader)}
              title="Search"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSearchingInHeader
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowRightPanel(!showRightPanel)}
              title="Conversation details & media"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showRightPanel
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-Header Search Bar */}
        {isSearchingInHeader && (
          <div className="px-4 py-2 bg-rose-50/70 dark:bg-slate-800/80 border-b border-rose-100 dark:border-slate-700 flex items-center gap-2 shrink-0 animate-in slide-in-from-top-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words, dates, love notes..."
              className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Pinned Message Banner */}
        {pinnedMessages.length > 0 && (
          <div
            onClick={() => handleJumpToMessage(pinnedMessages[pinnedMessages.length - 1].id)}
            className="px-4 py-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 cursor-pointer shrink-0 transition-colors hover:bg-amber-100/80"
          >
            <div className="flex items-center gap-2 truncate">
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-[11px] shrink-0">Pinned:</span>
              <span className="truncate italic text-[11px]">
                "{pinnedMessages[pinnedMessages.length - 1].text || '[Media]'}"
              </span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold shrink-0 ml-2">
              {pinnedMessages.length} Pinned ➔
            </span>
          </div>
        )}

        {/* Messages Scroll Container */}
        <div
          ref={chatScrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-4 space-y-2 relative ${getWallpaperClass()}`}
        >
          {displayedMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-slate-800 text-rose-500 flex items-center justify-center shadow-inner">
                <Heart className="w-8 h-8 fill-current text-rose-400" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                Our Private Love Chat 💕
              </h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Everything here is private, encrypted, and shared strictly between {partnerName} and you.
              </p>

              {/* Quick starter chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-2 max-w-md">
                <button
                  type="button"
                  onClick={() => setActiveActionModal('love_note')}
                  className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 text-xs text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-100 cursor-pointer"
                >
                  💌 Send First Love Note
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionModal('date_invite')}
                  className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs text-amber-600 dark:text-amber-400 font-medium hover:bg-amber-100 cursor-pointer"
                >
                  📅 Plan Date Night
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionModal('game_challenge')}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 cursor-pointer"
                >
                  ♟️ Chess Match
                </button>
              </div>
            </div>
          ) : (
            displayedMessages.map((msg, idx) => {
              const isMe = msg.senderId === myUid;
              const showDate =
                idx === 0 ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(displayedMessages[idx - 1].createdAt).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-slate-500 dark:text-slate-400 text-[10px] font-bold border border-rose-100 dark:border-slate-700 shadow-xs">
                        {new Date(msg.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <ChatMessageBubble
                    message={msg}
                    isMe={isMe}
                    partnerName={partnerName}
                    partnerPhoto={partnerProfile?.photoURL}
                    myProfile={userProfile!}
                    activeThemeKey={chatSettings.theme}
                    onReply={(m) =>
                      setReplyingTo({
                        messageId: m.id,
                        senderName: m.senderName,
                        text: m.text || (m.mediaUrl ? '[Photo / Media Attachment]' : ''),
                      })
                    }
                    onReact={(messageId, emoji, currentReactions) =>
                      toggleMessageReaction(coupleId!, messageId, myUid!, emoji, currentReactions)
                    }
                    onEdit={(m) => setEditingMessage(m)}
                    onDelete={(messageId, forEveryone) =>
                      deleteChatMessage(coupleId!, messageId, forEveryone, myUid!, msg.deletedFor)
                    }
                    onTogglePin={(messageId, currentPinned) =>
                      togglePinChatMessage(coupleId!, messageId, currentPinned)
                    }
                    onToggleStar={(messageId, currentStarred) =>
                      toggleStarChatMessage(coupleId!, messageId, currentStarred)
                    }
                    onSaveToMemories={(m) => saveMessageToMemories(coupleId!, m, userProfile!)}
                    onTurnIntoLetter={(m) => turnMessageIntoLetter(coupleId!, m, userProfile!)}
                    onOpenPhoto={(url, caption) =>
                      setActivePhotoViewer({
                        url,
                        caption,
                        senderName: msg.senderName,
                        date: msg.createdAt,
                      })
                    }
                    onJumpToReply={handleJumpToMessage}
                    onRespondDate={(messageId, response) =>
                      respondToDateInvite(
                        coupleId!,
                        messageId,
                        response,
                        msg.dateInvite!,
                        userProfile!
                      )
                    }
                    onRespondGame={(messageId, response) =>
                      respondToGameChallenge(coupleId!, messageId, response, msg.gameChallenge!)
                    }
                    onVotePoll={(messageId, optionId) =>
                      voteOnCouplePoll(coupleId!, messageId, optionId, myUid!, msg.pollData!)
                    }
                    onAnswerQuestion={(messageId, answer) =>
                      answerCoupleQuestion(
                        coupleId!,
                        messageId,
                        myUid!,
                        answer,
                        msg.questionData?.answers
                      )
                    }
                    onToggleListItem={(messageId, itemId) =>
                      toggleSharedListItem(coupleId!, messageId, itemId, myUid!, msg.sharedListData!)
                    }
                    onLaunchGame={(gameType) => {
                      if (setActiveTab) setActiveTab('games');
                    }}
                  />
                </React.Fragment>
              );
            })
          )}

          {/* Typing indicator bubble */}
          {isPartnerTyping && (
            <div className="flex items-center gap-2 text-xs text-rose-500 py-1 px-2 animate-in fade-in">
              <span className="font-semibold">{partnerName} is typing</span>
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Jump to bottom button */}
        {showScrollBottomBtn && (
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 right-6 p-3 rounded-full bg-white dark:bg-slate-800 text-rose-500 shadow-xl border border-rose-100 dark:border-slate-700 hover:scale-110 transition-transform cursor-pointer z-20 flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Rich Composer */}
        <ChatComposer
          coupleId={coupleId || ''}
          partnerName={partnerName}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onSendMessage={handleSendMessage}
          onOpenActionModal={(type) => setActiveActionModal(type)}
          onTyping={handleTypingStatusChange}
          showSmartReplies={chatSettings.smartReplies}
        />
      </div>

      {/* 3. RIGHT INFORMATION & MEDIA PANEL (Desktop toggleable) */}
      {showRightPanel && (
        <ChatRightInfoPanel
          isOpen={showRightPanel}
          onClose={() => setShowRightPanel(false)}
          partnerName={partnerName}
          partnerPhoto={partnerProfile?.photoURL}
          partnerEmail={partnerProfile?.email}
          partnerPresence={partnerPresence}
          messages={messages}
          pinnedMessages={pinnedMessages}
          starredMessages={starredMessages}
          sharedAlbums={sharedAlbums}
          chatSettings={chatSettings}
          onUpdateSettings={handleUpdateSettings}
          onJumpToMessage={handleJumpToMessage}
          onOpenPhoto={(url, caption) =>
            setActivePhotoViewer({ url, caption, senderName: partnerName })
          }
          onCreateAlbum={async () => {
            const title = prompt('Enter Album Title (e.g. Vacation in Paris 💕):');
            if (title && coupleId && userProfile) {
              await createSharedAlbum(coupleId, title, 'Couple Memories', '', userProfile);
            }
          }}
        />
      )}

      {/* 4. ACTION MODALS */}
      <ChatActionModals
        activeModal={activeActionModal}
        onClose={() => setActiveActionModal(null)}
        onSendLoveNote={handleSendLoveNote}
        onSendDateInvite={handleSendDateInvite}
        onSendGameChallenge={handleSendGameChallenge}
        onSendPoll={handleSendPoll}
        onSendCountdown={handleSendCountdown}
        onSendSharedList={handleSendSharedList}
        onSendSharedNote={handleSendSharedNote}
        onSendQuestion={handleSendQuestion}
        onSendLocation={handleSendLocation}
        onSendReminder={handleSendReminder}
        onApplyAISuggestion={(text) => handleSendMessage(text)}
        partnerName={partnerName}
      />

      {/* 5. AUDIO & VIDEO WEBRTC CALL MODAL */}
      {activeCall && (
        <ChatCallModal
          call={activeCall}
          isIncoming={activeCall.receiverId === myUid}
          partnerName={partnerName}
          partnerPhoto={partnerProfile?.photoURL}
          onAnswer={() => answerCall(coupleId!, activeCall.id)}
          onDecline={() => declineCall(coupleId!, activeCall.id)}
          onEndCall={(sec) => endCall(coupleId!, activeCall.id, sec)}
        />
      )}

      {/* 6. PHOTO VIEWER LIGHTBOX */}
      {activePhotoViewer && (
        <ChatPhotoViewer
          photoUrl={activePhotoViewer.url}
          caption={activePhotoViewer.caption}
          senderName={activePhotoViewer.senderName}
          date={activePhotoViewer.date}
          onClose={() => setActivePhotoViewer(null)}
          onSaveToMemories={() =>
            saveMessageToMemories(
              coupleId!,
              {
                mediaUrl: activePhotoViewer.url,
                text: activePhotoViewer.caption || '',
                createdAt: activePhotoViewer.date || new Date().toISOString(),
              } as Message,
              userProfile!
            )
          }
        />
      )}

      {/* 7. PARTNER PROFILE MODAL */}
      <PartnerProfileModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};
