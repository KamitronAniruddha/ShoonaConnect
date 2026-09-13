import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Activity,
  MessageCircle,
  Gamepad2,
  Image as ImageIcon,
  Mail,
  Sparkles,
  Heart,
  Clock,
  Zap,
  Eye,
  UserCheck,
  Flame,
  Cake,
  RefreshCw,
} from 'lucide-react';

export interface LiveActivityEvent {
  id: string;
  type: 'message' | 'game_move' | 'memory_uploaded' | 'letter_sealed' | 'letter_opened' | 'daily_answer' | 'pet_fed' | 'user_joined';
  coupleId?: string;
  coupleName: string;
  userName: string;
  userPhoto?: string;
  description: string;
  detail?: string;
  timestamp: string;
}

interface AdminLiveActivityStreamProps {
  onInspectCouple?: (coupleId: string) => void;
}

export const AdminLiveActivityStream: React.FC<AdminLiveActivityStreamProps> = ({ onInspectCouple }) => {
  const [events, setEvents] = useState<LiveActivityEvent[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Initialize with initial live events
  useEffect(() => {
    const initialEvents: LiveActivityEvent[] = [
      {
        id: 'e1',
        type: 'message',
        coupleName: 'Shoona & Babu',
        userName: 'Shoona',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=shoona',
        description: 'Sent a private love message: "Can\'t wait for our candlelight dinner tonight! 🍝❤️"',
        timestamp: 'Just now',
      },
      {
        id: 'e2',
        type: 'pet_fed',
        coupleName: 'Shoona & Babu',
        userName: 'Babu',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=babu',
        description: 'Fed virtual pet Mochi the Fox (Level 4, Happiness +10) 🦊✨',
        timestamp: '1 min ago',
      },
      {
        id: 'e3',
        type: 'game_move',
        coupleName: 'Alex & Maya',
        userName: 'Alex',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=alex',
        description: 'Made a move in Tic-Tac-Toe match (Placed X at Center) 🎮',
        timestamp: '3 mins ago',
      },
      {
        id: 'e4',
        type: 'letter_sealed',
        coupleName: 'Liam & Emma',
        userName: 'Liam',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=liam',
        description: 'Sealed a Gold-Rose wax love letter timelocked for tonight 8:00 PM 💌🔒',
        timestamp: '6 mins ago',
      },
      {
        id: 'e5',
        type: 'memory_uploaded',
        coupleName: 'Noah & Olivia',
        userName: 'Olivia',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=olivia',
        description: 'Uploaded romantic photo memory: "Sunset at Malibu Beach 🌅"',
        timestamp: '12 mins ago',
      },
      {
        id: 'e6',
        type: 'daily_answer',
        coupleName: 'Lucas & Mia',
        userName: 'Mia',
        userPhoto: 'https://api.dicebear.com/7.x/notionists/svg?seed=mia',
        description: 'Answered Daily Spark: "His sweet laughter when we cook together" 💕',
        timestamp: '18 mins ago',
      },
    ];

    setEvents(initialEvents);

    // Setup live subscription on messages, games, memories, daily_answers
    const channel = supabase
      .channel('admin_global_activity_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new as any;
        setEvents((prev) => [
          {
            id: `msg_${Date.now()}`,
            type: 'message',
            coupleId: newMsg.couple_id,
            coupleName: 'Active Couple',
            userName: newMsg.sender_name || 'Partner',
            description: `Sent chat message: "${newMsg.text?.slice(0, 60) || 'Attachment'}"`,
            timestamp: 'Just now',
          },
          ...prev.slice(0, 30),
        ]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memories' }, (payload) => {
        const newMem = payload.new as any;
        setEvents((prev) => [
          {
            id: `mem_${Date.now()}`,
            type: 'memory_uploaded',
            coupleId: newMem.couple_id,
            coupleName: 'Active Couple',
            userName: 'Partner',
            description: `Saved memory: "${newMem.title || 'New Moment'}" 📸`,
            timestamp: 'Just now',
          },
          ...prev.slice(0, 30),
        ]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'letters' }, (payload) => {
        const newLet = payload.new as any;
        setEvents((prev) => [
          {
            id: `let_${Date.now()}`,
            type: 'letter_sealed',
            coupleId: newLet.couple_id,
            coupleName: 'Active Couple',
            userName: newLet.sender_name || 'Partner',
            description: `Wrote love letter: "${newLet.title || 'Sealed Heart'}" 💌`,
            timestamp: 'Just now',
          },
          ...prev.slice(0, 30),
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (type: LiveActivityEvent['type']) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4 text-amber-400" />;
      case 'game_move':
        return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
      case 'memory_uploaded':
        return <ImageIcon className="w-4 h-4 text-blue-400" />;
      case 'letter_sealed':
      case 'letter_opened':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'daily_answer':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'pet_fed':
        return <Flame className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <span>Global Live Couple Activity Radar</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              REALTIME WEBSOCKET
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Intercepting live actions across all sanctuary rooms</span>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                {getIcon(ev.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{ev.userName}</span>
                  <span className="text-[10px] text-rose-400 font-semibold font-fraunces">
                    ({ev.coupleName})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">• {ev.timestamp}</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">{ev.description}</p>
              </div>
            </div>

            {ev.coupleId && onInspectCouple && (
              <button
                onClick={() => onInspectCouple(ev.coupleId!)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer shrink-0 ml-2"
              >
                Inspect Couple
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
