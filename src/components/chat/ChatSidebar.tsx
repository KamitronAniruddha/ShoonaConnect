import React from 'react';
import {
  Search,
  Heart,
  Pin,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  Flame,
  CheckCheck,
  Phone,
  Video,
} from 'lucide-react';
import { Message } from '../../types';

interface ChatSidebarProps {
  partnerName: string;
  partnerPhoto?: string;
  partnerPresence?: { isOnline: boolean; lastActiveAt?: string } | null;
  isPartnerTyping: boolean;
  lastMessage?: Message;
  unreadCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: 'all' | 'pinned' | 'media' | 'dates';
  onFilterChange: (filter: 'all' | 'pinned' | 'media' | 'dates') => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenLoveNoteModal: () => void;
  onOpenChat?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  partnerName,
  partnerPhoto,
  partnerPresence,
  isPartnerTyping,
  lastMessage,
  unreadCount,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onStartCall,
  onOpenLoveNoteModal,
  onOpenChat,
}) => {
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 lg:w-88 border-r border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full select-none shrink-0">
      {/* Top Header */}
      <div className="p-4 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-rose-500/15 dark:bg-rose-500/25 flex items-center justify-center text-rose-500">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
              Messages 💕
            </h2>
            <p className="text-[10px] text-slate-400">Private Couple Sanctuary</p>
          </div>
        </div>

        {/* Call quick shortcuts */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStartCall('audio')}
            title="Start Voice Call"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onStartCall('video')}
            title="Start Video Call"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-rose-100/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700/60">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search our conversations..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-rose-100/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Messages' },
          { id: 'pinned', label: 'Pinned', icon: Pin },
          { id: 'media', label: 'Photos', icon: ImageIcon },
          { id: 'dates', label: 'Dates', icon: Calendar },
        ].map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id as any)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-800'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Active Conversation Card */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          onClick={() => onOpenChat?.()}
          className="p-3 rounded-2xl bg-rose-50/70 dark:bg-slate-800/80 border border-rose-200/80 dark:border-slate-700 hover:bg-rose-100/60 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-3 relative shadow-xs"
        >
          {/* Avatar with Presence Indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-rose-200 dark:bg-slate-700 flex items-center justify-center ring-2 ring-rose-400/40">
              {partnerPhoto ? (
                <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-bold text-rose-600">
                  {partnerName ? partnerName[0].toUpperCase() : '💕'}
                </span>
              )}
            </div>

            {partnerPresence?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {partnerName}
              </h4>
              <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                {lastMessage ? formatTimeAgo(lastMessage.createdAt) : ''}
              </span>
            </div>

            {/* Last message or typing state */}
            {isPartnerTyping ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>typing...</span>
              </div>
            ) : lastMessage ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lastMessage.loveNoteData
                  ? '💌 Sent a Love Note'
                  : lastMessage.dateInvite
                  ? '📅 Date Invitation'
                  : lastMessage.gameChallenge
                  ? '🎮 Game Challenge'
                  : lastMessage.pollData
                  ? '📊 Couple Poll'
                  : lastMessage.mediaUrl
                  ? '📸 Photo'
                  : lastMessage.text}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No messages yet</p>
            )}
          </div>

          {/* Unread count badge / mobile indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                {unreadCount}
              </span>
            )}
            <span className="md:hidden text-rose-400 text-xs font-bold">›</span>
          </div>
        </div>
      </div>

      {/* Bottom Love Note Quick Launcher */}
      <div className="p-3 border-t border-rose-100 dark:border-slate-800 bg-rose-50/30 dark:bg-slate-900/30">
        <button
          type="button"
          onClick={() => {
            onOpenLoveNoteModal();
            onOpenChat?.();
          }}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01] cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 fill-current" /> Send Love Note to {partnerName}
        </button>
      </div>
    </div>
  );
};
