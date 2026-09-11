import React, { useState } from 'react';
import {
  X,
  Heart,
  Image as ImageIcon,
  Mic,
  FileText,
  Link as LinkIcon,
  Pin,
  Star,
  Calendar,
  Palette,
  Shield,
  Download,
  Plus,
  Flame,
  Check,
  ChevronRight,
  Play,
  Pause,
  FolderHeart,
} from 'lucide-react';
import { Message, SharedAlbum, ChatThemeKey, ChatWallpaperPattern, ChatSettings, UserProfile } from '../../types';
import { exportChatHistory } from '../../utils/chatService';

interface ChatRightInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerPhoto?: string;
  partnerEmail?: string;
  partnerPresence?: { isOnline: boolean; lastActiveAt?: string } | null;
  messages: Message[];
  pinnedMessages: Message[];
  starredMessages: Message[];
  sharedAlbums: SharedAlbum[];
  chatSettings: ChatSettings;
  onUpdateSettings: (settings: Partial<ChatSettings>) => void;
  onJumpToMessage: (messageId: string) => void;
  onOpenPhoto: (url: string, caption?: string) => void;
  onCreateAlbum: () => void;
}

export const ChatRightInfoPanel: React.FC<ChatRightInfoPanelProps> = ({
  isOpen,
  onClose,
  partnerName,
  partnerPhoto,
  partnerPresence,
  messages,
  pinnedMessages,
  starredMessages,
  sharedAlbums,
  chatSettings,
  onUpdateSettings,
  onJumpToMessage,
  onOpenPhoto,
  onCreateAlbum,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'albums' | 'pinned' | 'starred' | 'theme' | 'privacy'>('overview');
  const [mediaFilter, setMediaFilter] = useState<'photos' | 'voice' | 'files' | 'links'>('photos');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter messages
  const photoMessages = messages.filter((m) => m.mediaUrl && (m.mediaType === 'image' || (!m.mediaType && m.mediaUrl.startsWith('data:image'))));
  const voiceMessages = messages.filter((m) => m.mediaType === 'audio' || m.audioDetails);
  const fileMessages = messages.filter((m) => m.mediaType === 'file' || m.fileDetails);
  const linkMessages = messages.filter((m) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return m.text && urlRegex.test(m.text);
  });

  // Calculate statistics
  const totalMessagesCount = messages.length;
  const photosCount = photoMessages.length;
  const voiceCount = voiceMessages.length;
  const datesCount = messages.filter((m) => m.dateInvite).length;
  const gamesCount = messages.filter((m) => m.gameChallenge).length;

  return (
    <div className="w-80 md:w-96 border-l border-rose-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col h-full z-20 shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-rose-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Us & Conversation
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-rose-100 dark:border-slate-800 px-2 py-1.5 bg-rose-50/30 dark:bg-slate-800/40 overflow-x-auto scrollbar-none gap-1">
        {[
          { id: 'overview', label: 'Us 💕' },
          { id: 'media', label: `Media (${photosCount})` },
          { id: 'albums', label: 'Albums' },
          { id: 'pinned', label: `Pinned (${pinnedMessages.length})` },
          { id: 'starred', label: `Saved (${starredMessages.length})` },
          { id: 'theme', label: 'Theme 🎨' },
          { id: 'privacy', label: 'Privacy 🔒' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700 dark:text-slate-200">
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Partner Profile Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-rose-100 dark:border-slate-700 text-center relative">
              <div className="w-20 h-20 rounded-full mx-auto relative mb-2 p-1 bg-white dark:bg-slate-900 shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden bg-rose-100 dark:bg-slate-800 flex items-center justify-center">
                  {partnerPhoto ? (
                    <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-rose-500">
                      {partnerName ? partnerName[0].toUpperCase() : '💕'}
                    </span>
                  )}
                </div>
                {partnerPresence?.isOnline && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">{partnerName}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {partnerPresence?.isOnline ? 'Active right now 🟢' : 'Partner in love 💕'}
              </p>
            </div>

            {/* Couple Stats Grid */}
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 px-1">
                Our Chat Milestones 💖
              </h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-slate-800/60 border border-rose-100/80 dark:border-slate-700/50">
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                    {totalMessagesCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Messages Together</div>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-800/60 border border-purple-100/80 dark:border-slate-700/50">
                  <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {photosCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Photos Shared</div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100/80 dark:border-slate-700/50">
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {datesCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Dates Planned</div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-100/80 dark:border-slate-700/50">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {gamesCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Games Played</div>
                </div>
              </div>
            </div>

            {/* Export Chat */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => exportChatHistory(messages, partnerName)}
                className="w-full py-2.5 px-4 rounded-2xl border border-rose-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Chat Archive (.txt)
              </button>
            </div>
          </div>
        )}

        {/* 2. MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            {/* Sub-filter */}
            <div className="flex gap-1 border-b border-rose-100 dark:border-slate-800 pb-2">
              {[
                { id: 'photos', label: `Photos (${photosCount})` },
                { id: 'voice', label: `Voice (${voiceCount})` },
                { id: 'files', label: `Files (${fileMessages.length})` },
                { id: 'links', label: `Links (${linkMessages.length})` },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setMediaFilter(sub.id as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium cursor-pointer ${
                    mediaFilter === sub.id
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            {mediaFilter === 'photos' && (
              photoMessages.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No photos shared yet</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photoMessages.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onOpenPhoto(m.mediaUrl!, m.text)}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity group relative"
                    >
                      <img src={m.mediaUrl} alt="shared" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Voice notes */}
            {mediaFilter === 'voice' && (
              voiceMessages.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No voice notes sent yet</p>
              ) : (
                <div className="space-y-2">
                  {voiceMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-white">
                            {m.senderName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <audio controls src={m.mediaUrl} className="h-8 w-32 max-w-[140px]" />
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Files */}
            {mediaFilter === 'files' && (
              fileMessages.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No files shared yet</p>
              ) : (
                <div className="space-y-2">
                  {fileMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate text-xs">{m.fileDetails?.name || 'Document'}</span>
                      </div>
                      <a
                        href={m.mediaUrl}
                        download
                        className="text-xs font-semibold text-rose-500 hover:underline shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Links */}
            {mediaFilter === 'links' && (
              linkMessages.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No links shared yet</p>
              ) : (
                <div className="space-y-2">
                  {linkMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4 text-sky-500 shrink-0" />
                      <p className="text-xs truncate text-sky-600 dark:text-sky-400 hover:underline">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* 3. SHARED ALBUMS */}
        {activeTab === 'albums' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-500 dark:text-slate-400">
                Couple Photo Albums
              </span>
              <button
                type="button"
                onClick={onCreateAlbum}
                className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Album
              </button>
            </div>

            {sharedAlbums.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FolderHeart className="w-10 h-10 text-rose-300 mx-auto" />
                <p className="text-xs text-slate-400">No shared albums created yet</p>
                <button
                  type="button"
                  onClick={onCreateAlbum}
                  className="px-4 py-1.5 bg-rose-500 text-white rounded-full text-xs font-semibold cursor-pointer hover:bg-rose-600"
                >
                  Create First Album ❤️
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedAlbums.map((album) => (
                  <div
                    key={album.id}
                    className="p-3 rounded-2xl bg-rose-50/40 dark:bg-slate-800/40 border border-rose-100 dark:border-slate-700 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-rose-200 dark:bg-slate-700 shrink-0">
                        {album.coverUrl ? (
                          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold">
                            📸
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                          {album.title}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {album.photos?.length || 0} photos
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. PINNED MESSAGES */}
        {activeTab === 'pinned' && (
          <div className="space-y-2">
            {pinnedMessages.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No pinned messages</p>
            ) : (
              pinnedMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onJumpToMessage(m.id)}
                  className="p-3 rounded-2xl bg-rose-50/50 dark:bg-slate-800/60 border border-rose-200 dark:border-slate-700 hover:border-rose-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-rose-500 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Pin className="w-3 h-3" /> {m.senderName}
                    </span>
                    <span className="text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                    {m.text || '[Photo / Media Attachment]'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. STARRED MESSAGES */}
        {activeTab === 'starred' && (
          <div className="space-y-2">
            {starredMessages.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No saved messages yet</p>
            ) : (
              starredMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onJumpToMessage(m.id)}
                  className="p-3 rounded-2xl bg-amber-50/40 dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-500 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {m.senderName}
                    </span>
                    <span className="text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                    {m.text || '[Photo / Media Attachment]'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 6. CHAT THEMES & WALLPAPERS */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Chat Bubble Color Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'rose', name: 'Rose Romance 💕', color: 'from-rose-500 to-pink-600' },
                  { id: 'burgundy', name: 'Velvet Wine 🍷', color: 'from-rose-900 to-red-950' },
                  { id: 'midnight', name: 'Midnight Glow 🌌', color: 'from-indigo-900 to-purple-950' },
                  { id: 'pink_glow', name: 'Sweet Peach 🍑', color: 'from-pink-500 to-orange-400' },
                  { id: 'purple_night', name: 'Purple Dream 💜', color: 'from-purple-600 to-indigo-700' },
                  { id: 'ocean_night', name: 'Ocean Twilight 🌊', color: 'from-cyan-600 to-blue-800' },
                  { id: 'minimal_dark', name: 'Minimal Obsidian 🖤', color: 'from-slate-800 to-slate-900' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id as ChatThemeKey })}
                    className={`p-2 rounded-2xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      chatSettings.theme === t.id
                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/50 dark:bg-slate-800'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${t.color} shrink-0`} />
                    <span className="text-[11px] font-medium truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Chat Background Wallpaper Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Clean' },
                  { id: 'hearts', label: 'Hearts 💕' },
                  { id: 'stars', label: 'Stars ✨' },
                  { id: 'bubbles', label: 'Bubbles 🫧' },
                  { id: 'geometric', label: 'Geometric 📐' },
                  { id: 'floral', label: 'Floral 🌸' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onUpdateSettings({ wallpaper: w.id as ChatWallpaperPattern })}
                    className={`py-2 px-1 rounded-xl text-center border text-[11px] font-medium transition-all cursor-pointer ${
                      chatSettings.wallpaper === w.id
                        ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. PRIVACY & DISAPPEARING MESSAGES */}
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Disappearing Messages
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'off', label: 'Off' },
                  { id: '1h', label: '1 Hour' },
                  { id: '1d', label: '24 Hours' },
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onUpdateSettings({ disappearingDuration: d.id as any })}
                    className={`py-2 px-1 rounded-xl text-center border text-[11px] font-medium transition-all cursor-pointer ${
                      chatSettings.disappearingDuration === d.id
                        ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                New messages automatically clean up after the timer expires.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-rose-100 dark:border-slate-800">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                    Read Receipts
                  </span>
                  <span className="text-[11px] text-slate-400">Show blue checkmarks when read</span>
                </div>
                <input
                  type="checkbox"
                  checked={chatSettings.readReceipts}
                  onChange={(e) => onUpdateSettings({ readReceipts: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                    Typing Indicator
                  </span>
                  <span className="text-[11px] text-slate-400">Show typing dots to partner</span>
                </div>
                <input
                  type="checkbox"
                  checked={chatSettings.typingIndicators}
                  onChange={(e) => onUpdateSettings({ typingIndicators: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer select-none">
                <div>
                  <span className="font-semibold text-xs block text-slate-800 dark:text-slate-200">
                    Online Presence
                  </span>
                  <span className="text-[11px] text-slate-400">Share active status</span>
                </div>
                <input
                  type="checkbox"
                  checked={chatSettings.onlineStatus}
                  onChange={(e) => onUpdateSettings({ onlineStatus: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
