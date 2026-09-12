import React, { useState, useEffect, useRef } from 'react';
import { supabase, createSafeChannel, sendRealtimeBroadcast } from '../lib/supabase';
import { TicTacToeChatMessage } from '../types';
import { sendGameChatMessage } from '../utils/tictactoeService';
import { Send, MessageCircle, Sparkles, Heart } from 'lucide-react';

interface GameLiveChatProps {
  coupleId: string;
  gameId: string;
  currentUser: { uid: string; displayName: string; photoURL?: string };
  partnerName?: string;
  isSoloMode?: boolean;
}

const QUICK_ROMANTIC_PHRASES = [
  'Good move! 😌',
  'Watch this! 🔥',
  'Love you! ❤️',
  'No mercy today! 😈',
  'Kisses for you! 😘',
  'Rematch pending! 🏆',
];

export const GameLiveChat: React.FC<GameLiveChatProps> = ({
  coupleId,
  gameId,
  currentUser,
  partnerName,
  isSoloMode,
}) => {
  const [messages, setMessages] = useState<TicTacToeChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener for in-game chat messages using Supabase channel broadcast & postgres changes
  useEffect(() => {
    if (!coupleId || !gameId) return;

    // Fetch initial chat messages from messages table
    supabase
      .from('messages')
      .select('*')
      .eq('couple_id', coupleId)
      .ilike('text', '[Game Chat]%')
      .order('created_at', { ascending: true })
      .limit(30)
      .then(({ data }) => {
        if (data) {
          setMessages(
            data.map((d) => ({
              id: d.id,
              gameId,
              senderId: d.sender_id,
              senderName: d.sender_name,
              senderPhoto: d.sender_photo,
              message: (d.text || '').replace(/^\[Game Chat\]\s*/, ''),
              createdAt: d.created_at,
            }))
          );
        }
      });

    const channel = createSafeChannel(`game_chat:${gameId}`)
      .on('broadcast', { event: 'chat_msg' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId, gameId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || isSending) return;

    setIsSending(true);
    setInputValue('');

    const newMsg: TicTacToeChatMessage = {
      id: `msg-${Date.now()}`,
      gameId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderPhoto: currentUser.photoURL,
      message: clean,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update local
    setMessages((prev) => [...prev, newMsg]);

    try {
      // Broadcast to partner safely using the helper
      sendRealtimeBroadcast(`game_chat:${gameId}`, 'chat_msg', newMsg);

      await sendGameChatMessage(coupleId, gameId, currentUser, clean);
    } catch (e) {
      console.warn('Error sending game chat message:', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#110b10] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="px-3.5 py-2.5 bg-[#170f15] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-3.5 h-3.5 text-[#ff4d8d]" />
          <span className="text-xs font-bold text-white">Live In-Game Chat</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-medium">
          {isSoloMode ? 'Practice Mode' : `With ${partnerName || 'Partner'}`}
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[140px] max-h-[220px] sm:max-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-3 text-neutral-500 text-[11px] space-y-1">
            <Sparkles className="w-4 h-4 text-neutral-600 mb-1" />
            <span>Tease or cheer your partner live as you play! 💕</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  <span className="text-[9px] font-bold text-neutral-400">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[8px] text-neutral-500">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs font-medium break-words leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] text-white rounded-br-xs'
                      : 'bg-[#1c131a] border border-white/10 text-neutral-200 rounded-bl-xs'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick romantic teaser phrases */}
      <div className="px-2 py-1.5 bg-[#0d090c] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        {QUICK_ROMANTIC_PHRASES.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(phrase)}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-neutral-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer border border-white/5"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-2 bg-[#170f15] border-t border-white/10 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Send a whisper or tease..."
          maxLength={120}
          className="flex-1 bg-[#0d090c] border border-white/10 focus:border-[#ff3377] rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isSending}
          className="p-2 rounded-xl bg-[#ff3377] hover:bg-[#ff4d8d] disabled:opacity-40 text-white transition-all cursor-pointer shadow-md shadow-pink-500/20 shrink-0"
          title="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
