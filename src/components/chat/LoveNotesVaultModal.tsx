import React, { useState } from 'react';
import {
  X,
  Heart,
  Search,
  Sparkles,
  Calendar,
  Bookmark,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Message, LoveNoteData } from '../../types';

interface LoveNotesVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  partnerName: string;
  onOpenNote: (msg: Message) => void;
}

export const LoveNotesVaultModal: React.FC<LoveNotesVaultModalProps> = ({
  isOpen,
  onClose,
  messages,
  partnerName,
  onOpenNote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');

  if (!isOpen) return null;

  // Extract all messages that contain a love note
  const loveNoteMessages = messages.filter(
    (m) => (m.type === 'love_note' || m.loveNoteData || m.loveNote) && (m.loveNoteData?.note || m.loveNote?.note || m.text)
  );

  const filteredNotes = loveNoteMessages.filter((msg) => {
    const noteData = msg.loveNoteData || msg.loveNote;
    const noteText = (noteData?.note || msg.text || '').toLowerCase();
    const matchesSearch = noteText.includes(searchTerm.toLowerCase()) || msg.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyle === 'all' || (noteData?.style || 'rose') === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neutral-900 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-rose-950/60 via-neutral-900 to-purple-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Bookmark className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
                Our Sanctuary Love Vault 💌
              </h2>
              <p className="text-xs text-rose-300/80">
                {loveNoteMessages.length} sealed letters & notes exchanged with {partnerName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-neutral-900/60 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search words of love..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-800/80 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['all', 'rose', 'golden', 'midnight', 'sunset', 'parchment'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStyle(st)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStyle === st
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Collection List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl">
                💌
              </div>
              <h4 className="text-sm font-bold text-neutral-300">No Love Notes Found</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {loveNoteMessages.length === 0
                  ? 'Send your first private sealed love note to your partner from the chat composer!'
                  : 'No notes match your current search filter.'}
              </p>
            </div>
          ) : (
            filteredNotes.map((msg) => {
              const note = msg.loveNoteData || msg.loveNote || { note: msg.text, style: 'rose' as const };
              return (
                <div
                  key={msg.id}
                  onClick={() => onOpenNote(msg)}
                  className="p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" /> {msg.senderName}
                      </span>
                      {note.openWhen && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 font-medium truncate max-w-[200px]">
                          {note.openWhen}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 ml-auto sm:ml-0">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-serif italic text-neutral-200 line-clamp-2 leading-relaxed">
                      "{note.note}"
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all self-center">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
