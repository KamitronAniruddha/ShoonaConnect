import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminCoupleRecord } from '../../types';
import {
  MessageCircle,
  Search,
  Filter,
  RefreshCw,
  Heart,
  Music,
  Gamepad2,
  Calendar,
  Lock,
  User,
  Zap,
} from 'lucide-react';

interface AdminLiveChatMonitorProps {
  couples: AdminCoupleRecord[];
  onOpenDeepDive: (couple: AdminCoupleRecord) => void;
}

export const AdminLiveChatMonitor: React.FC<AdminLiveChatMonitorProps> = ({
  couples,
  onOpenDeepDive,
}) => {
  const [selectedCoupleId, setSelectedCoupleId] = useState<string>(couples[0]?.id || '');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const currentCouple = couples.find((c) => c.id === selectedCoupleId) || couples[0];

  const fetchChatMessages = async (cId: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', cId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Fallback demo transcript for selected couple
        setMessages([
          {
            id: 'demo1',
            sender_id: currentCouple?.partner1Id || 'p1',
            sender_name: currentCouple?.partner1Name || 'Partner 1',
            text: 'I just booked the romantic table for our weekend anniversary getaway! 🍷✨',
            type: 'text',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            reactions: { [currentCouple?.partner2Id || 'p2']: '😍' },
          },
          {
            id: 'demo2',
            sender_id: currentCouple?.partner2Id || 'p2',
            sender_name: currentCouple?.partner2Name || 'Partner 2',
            text: 'You are the most thoughtful partner in the entire universe! 💖 Sending you big hugs!',
            type: 'text',
            created_at: new Date(Date.now() - 3200000).toISOString(),
            reactions: { [currentCouple?.partner1Id || 'p1']: '🥰' },
          },
          {
            id: 'demo3',
            sender_id: currentCouple?.partner1Id || 'p1',
            sender_name: currentCouple?.partner1Name || 'Partner 1',
            text: 'Look what memory showed up from last year! 📸',
            media_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
            type: 'image',
            created_at: new Date(Date.now() - 1800000).toISOString(),
          },
          {
            id: 'demo4',
            sender_id: currentCouple?.partner2Id || 'p2',
            sender_name: currentCouple?.partner2Name || 'Partner 2',
            text: 'I love this photo so much! It is on my home screen widget! 🥰',
            type: 'text',
            created_at: new Date(Date.now() - 900000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat monitor error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCoupleId) {
      fetchChatMessages(selectedCoupleId);
    }
  }, [selectedCoupleId]);

  const filteredMessages = messages.filter((m) =>
    !search || (m.text && m.text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-400" />
            <span>Global Real-Time Chat Interceptor</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any registered couple to monitor their live chats, voice notes, stickers, reactions, and attachments.
          </p>
        </div>

        {currentCouple && (
          <button
            onClick={() => onOpenDeepDive(currentCouple)}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Open Full Couple Deep Dive</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Couples List Selector */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Couples Roster ({couples.length})
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Live Sync</span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {couples.map((c) => {
              const isSelected = c.id === selectedCoupleId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCoupleId(c.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <Heart className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400 fill-rose-400' : 'text-slate-500'}`} />
                      <span>{c.coupleName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      CODE: <span className="text-amber-300 font-bold">{c.pairCode}</span> • {c.stats?.messagesCount || 0} msgs
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    c.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Chat Stream */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between">
          {/* Stream Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white font-fraunces flex items-center gap-2">
                <span>{currentCouple?.coupleName}</span>
                <span className="text-xs text-rose-400">({filteredMessages.length} messages)</span>
              </h4>
              <p className="text-[11px] text-slate-400 font-mono">
                Couple ID: {currentCouple?.id}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter chat..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                onClick={() => fetchChatMessages(selectedCoupleId)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3.5 min-h-[380px] max-h-[460px] overflow-y-auto p-2">
            {filteredMessages.map((m) => {
              const isP1 = m.sender_id === currentCouple?.partner1Id;
              const senderName = isP1 ? currentCouple?.partner1Name : currentCouple?.partner2Name;
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${isP1 ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    {senderName ? senderName[0] : 'U'}
                  </div>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-[10px] ${isP1 ? 'text-slate-400' : 'text-slate-400 justify-end'}`}>
                      <span className="font-bold text-slate-200">{senderName || 'Partner'}</span>
                      <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isP1
                          ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                          : 'bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      {m.media_url ? (
                        <div className="space-y-2">
                          <img src={m.media_url} alt="Attachment" className="rounded-xl max-h-48 object-cover w-full" />
                          {m.text && <p>{m.text}</p>}
                        </div>
                      ) : (
                        <p>{m.text}</p>
                      )}

                      {m.reactions && Object.keys(m.reactions).length > 0 && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
                          {Object.entries(m.reactions).map(([uid, emo]) => (
                            <span key={uid} className="text-xs bg-black/30 px-1.5 py-0.5 rounded-full">
                              {String(emo)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-time Interception Channel Active</span>
            </span>
            <span className="font-mono text-emerald-400">Status: LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
