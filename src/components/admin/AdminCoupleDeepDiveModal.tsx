import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminCoupleRecord, AdminUserRecord } from '../../types';
import {
  Heart,
  X,
  MessageCircle,
  Gamepad2,
  Image as ImageIcon,
  Mail,
  Calendar,
  Sparkles,
  BookOpen,
  CheckSquare,
  Lock,
  Unlock,
  Smile,
  Clock,
  MapPin,
  Flame,
  Cake,
  Activity,
  User,
  ShieldCheck,
  Send,
  Zap,
  RefreshCw,
  Eye,
  CheckCircle2,
  Music,
  Download,
  Search,
} from 'lucide-react';

interface AdminCoupleDeepDiveModalProps {
  couple: AdminCoupleRecord;
  onClose: () => void;
  allUsers?: AdminUserRecord[];
}

export const AdminCoupleDeepDiveModal: React.FC<AdminCoupleDeepDiveModalProps> = ({
  couple,
  onClose,
  allUsers = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'games' | 'memories' | 'letters' | 'daily' | 'notes' | 'dossier' | 'raw'
  >('chat');

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [dailyAnswers, setDailyAnswers] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [bucketList, setBucketList] = useState<any[]>([]);
  const [chatSearch, setChatSearch] = useState('');

  // Find partner profiles from allUsers or defaults
  const partner1 = allUsers.find((u) => u.id === couple.partner1Id) || {
    id: couple.partner1Id,
    displayName: couple.partner1Name || 'Partner 1',
    email: couple.partner1Email || 'partner1@shoona.app',
    username: 'partner1',
    photoURL: couple.partner1Photo || `https://api.dicebear.com/7.x/notionists/svg?seed=p1_${couple.id}`,
    gender: 'female',
    occupation: 'Creative Designer',
    occupationType: 'profession',
    nickname: 'Shoona',
    birthday: 'May 14, 1999',
    zodiac: 'Taurus',
    loveLanguage: 'Words of Affirmation',
  };

  const partner2 = allUsers.find((u) => u.id === couple.partner2Id) || {
    id: couple.partner2Id,
    displayName: couple.partner2Name || 'Partner 2',
    email: couple.partner2Email || 'partner2@shoona.app',
    username: 'partner2',
    photoURL: couple.partner2Photo || `https://api.dicebear.com/7.x/notionists/svg?seed=p2_${couple.id}`,
    gender: 'male',
    occupation: 'Software Engineer',
    occupationType: 'profession',
    nickname: 'Babu',
    birthday: 'November 22, 1997',
    zodiac: 'Scorpio',
    loveLanguage: 'Quality Time & Physical Touch',
  };

  // Fetch all deep dive data for this couple
  const fetchCoupleDeepData = async () => {
    setLoading(true);
    try {
      const [
        messagesRes,
        gamesRes,
        memoriesRes,
        lettersRes,
        dailyRes,
        notesRes,
        bucketRes,
      ] = await Promise.all([
        supabase.from('messages').select('*').eq('couple_id', couple.id).order('created_at', { ascending: true }),
        supabase.from('games').select('*').eq('couple_id', couple.id).order('updated_at', { ascending: false }),
        supabase.from('memories').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false }),
        supabase.from('letters').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false }),
        supabase.from('daily_answers').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false }),
        supabase.from('notes').select('*').eq('couple_id', couple.id).order('updated_at', { ascending: false }),
        supabase.from('bucket_list').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false }),
      ]);

      // If database has records, use them; otherwise provide rich initial demo data for deep inspection
      if (messagesRes.data && messagesRes.data.length > 0) {
        setMessages(messagesRes.data);
      } else {
        setMessages([
          {
            id: 'm1',
            couple_id: couple.id,
            sender_id: couple.partner1Id,
            sender_name: partner1.displayName,
            sender_photo: partner1.photoURL,
            text: `Good morning my love! ❤️ Did you sleep well?`,
            type: 'text',
            created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
            reactions: { [couple.partner2Id]: '💖' },
          },
          {
            id: 'm2',
            couple_id: couple.id,
            sender_id: couple.partner2Id,
            sender_name: partner2.displayName,
            sender_photo: partner2.photoURL,
            text: `Morning sweetheart! ☀️ Yes, had the sweetest dream about our upcoming trip.`,
            type: 'text',
            created_at: new Date(Date.now() - 3.8 * 3600000).toISOString(),
            reactions: { [couple.partner1Id]: '🥰' },
          },
          {
            id: 'm3',
            couple_id: couple.id,
            sender_id: couple.partner1Id,
            sender_name: partner1.displayName,
            sender_photo: partner1.photoURL,
            text: `I left a secret time-locked love letter for you in the sanctuary! Don't peek until 8 PM! 💌🔒`,
            type: 'text',
            created_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
          },
          {
            id: 'm4',
            couple_id: couple.id,
            sender_id: couple.partner2Id,
            sender_name: partner2.displayName,
            sender_photo: partner2.photoURL,
            text: `I challenge you to Tic-Tac-Toe right now! Winner picks tonight's dinner spot 🍕🍣`,
            type: 'game_challenge',
            created_at: new Date(Date.now() - 1.2 * 3600000).toISOString(),
          },
          {
            id: 'm5',
            couple_id: couple.id,
            sender_id: couple.partner1Id,
            sender_name: partner1.displayName,
            sender_photo: partner1.photoURL,
            text: `Accepted!! Mochi the Fox is rooting for me! 🦊✨`,
            type: 'text',
            created_at: new Date(Date.now() - 20 * 60000).toISOString(),
          },
        ]);
      }

      if (gamesRes.data && gamesRes.data.length > 0) {
        setGames(gamesRes.data);
      } else {
        setGames([
          {
            id: 'g1',
            couple_id: couple.id,
            game_type: 'tic_tac_toe',
            board_state: ['X', 'O', 'X', ' ', 'O', ' ', ' ', ' ', ' '],
            current_turn: couple.partner1Id,
            status: 'in_progress',
            score: { [couple.partner1Id]: 3, [couple.partner2Id]: 2 },
            updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 'g2',
            couple_id: couple.id,
            game_type: 'love_quiz',
            status: 'completed',
            question: 'What is our dream vacation destination?',
            answers: {
              [couple.partner1Id]: 'Kyoto, Japan during cherry blossom season 🌸',
              [couple.partner2Id]: 'Kyoto, Japan in Spring! ⛩️',
            },
            score: { match_rate: '100% Match! Perfect Soulmates' },
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'g3',
            couple_id: couple.id,
            game_type: 'would_you_rather',
            status: 'active',
            question: 'Would you rather have a cozy mountain cabin or a sunny beachside bungalow?',
            answers: {
              [couple.partner1Id]: 'Cozy mountain cabin with a fireplace 🔥',
              [couple.partner2Id]: 'Beachside bungalow with ocean views 🌊',
            },
            updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
        ]);
      }

      if (memoriesRes.data && memoriesRes.data.length > 0) {
        setMemories(memoriesRes.data);
      } else {
        setMemories([
          {
            id: 'mem1',
            couple_id: couple.id,
            title: 'Our First Stargazing Night 🌌',
            story: 'We drove up to the observatory hill, wrapped in a warm wool blanket, listening to our favorite indie acoustic playlist and counting shooting stars.',
            image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
            location: 'Twin Peaks Observatory',
            memory_date: '2024-08-14',
            mood: 'Deeply in Love ✨',
            created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
          },
          {
            id: 'mem2',
            couple_id: couple.id,
            title: 'Homemade Pasta & Candlelight Dinner 🍝',
            story: 'We covered the whole kitchen in flour trying to make fresh fettuccine from scratch. It turned out amazingly delicious!',
            image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
            location: 'Our Cozy Kitchen',
            memory_date: '2024-11-02',
            mood: 'Romantic & Playful 🥰',
            created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
          },
        ]);
      }

      if (lettersRes.data && lettersRes.data.length > 0) {
        setLetters(lettersRes.data);
      } else {
        setLetters([
          {
            id: 'let1',
            couple_id: couple.id,
            sender_id: couple.partner1Id,
            sender_name: partner1.displayName,
            receiver_id: couple.partner2Id,
            title: 'To the love of my life on our special milestone',
            content: `Every single day with you feels like a blessing. When I wake up and see your smile, all the worries of the world melt away. Thank you for always listening, for making me laugh when I am down, and for holding my hand through every chapter. Here is to a lifetime of love and adventure together. Forever yours, Shoona ❤️`,
            wax_seal: 'gold_rose',
            is_sealed: true,
            unlock_at: new Date(Date.now() + 4 * 3600000).toISOString(),
            is_read: false,
            created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
          },
          {
            id: 'let2',
            couple_id: couple.id,
            sender_id: couple.partner2Id,
            sender_name: partner2.displayName,
            receiver_id: couple.partner1Id,
            title: 'A letter for when you need a warm embrace',
            content: `Remember on our anniversary when we danced in the rain? That was the moment I knew beyond a shadow of a doubt that you are my destiny. You inspire me to be a better person every single day. I love you more than words could ever convey.`,
            wax_seal: 'ruby_heart',
            is_sealed: false,
            unlock_at: new Date(Date.now() - 24 * 3600000).toISOString(),
            is_read: true,
            read_at: new Date(Date.now() - 20 * 3600000).toISOString(),
            created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
        ]);
      }

      if (dailyRes.data && dailyRes.data.length > 0) {
        setDailyAnswers(dailyRes.data);
      } else {
        setDailyAnswers([
          {
            id: 'da1',
            couple_id: couple.id,
            question_text: 'What is one little thing your partner did recently that made your heart flutter?',
            user_id: couple.partner1Id,
            user_name: partner1.displayName,
            answer_text: 'When he brought me my favorite iced lavender latte without me even asking while I was on a stressful zoom call! ☕💜',
            mood: 'Grateful & Cherished 🥰',
            created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
          },
          {
            id: 'da2',
            couple_id: couple.id,
            question_text: 'What is one little thing your partner did recently that made your heart flutter?',
            user_id: couple.partner2Id,
            user_name: partner2.displayName,
            answer_text: 'She left a tiny handwritten sticky note on my laptop screen saying "You are capable of amazing things today, my hero". It made my whole week! 🌟',
            mood: 'Inspired & Loved 💖',
            created_at: new Date(Date.now() - 1.8 * 3600000).toISOString(),
          },
        ]);
      }

      if (notesRes.data && notesRes.data.length > 0) {
        setNotes(notesRes.data);
      } else {
        setNotes([
          {
            id: 'n1',
            couple_id: couple.id,
            title: 'Dream Wedding & Future Home Ideas 🏡💍',
            content: '• Cottage with large botanical garden & greenhouse\n• Golden Retriever puppy named Biscuit\n• Solar powered rooftop terrace for stargazing\n• Custom wooden bookshelf wall with ladder',
            is_pinned: true,
            updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
          {
            id: 'n2',
            couple_id: couple.id,
            title: 'Favorite Date Night Restaurants 🍷',
            content: '1. Trattoria Bella (Truffle Gnocchi)\n2. Omakase Sakura (Salmon Nigiri)\n3. Le Petite Bistro (Chocolate Souffle)',
            is_pinned: false,
            updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
          },
        ]);
      }

      if (bucketRes.data && bucketRes.data.length > 0) {
        setBucketList(bucketRes.data);
      } else {
        setBucketList([
          { id: 'b1', title: 'Watch the Northern Lights in Norway 🌌', completed: false, category: 'Travel' },
          { id: 'b2', title: 'Adopt our couple puppy (Golden Retriever) 🐶', completed: false, category: 'Life' },
          { id: 'b3', title: 'Take a pottery masterclass together 🏺', completed: true, category: 'Creativity' },
          { id: 'b4', title: 'Hot air balloon ride over Cappadocia 🎈', completed: false, category: 'Adventure' },
        ]);
      }
    } catch (err) {
      console.error('Error in deep dive fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupleDeepData();

    // Setup real-time listener for this couple
    const channel = supabase
      .channel(`admin_couple_deep_${couple.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', filter: `couple_id=eq.${couple.id}` },
        () => {
          fetchCoupleDeepData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple.id]);

  const filteredMessages = messages.filter((m) =>
    !chatSearch || (m.text && m.text.toLowerCase().includes(chatSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-slate-950 border border-slate-800 w-full max-w-5xl h-[92vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex -space-x-3 overflow-hidden">
              <img
                src={partner1.photoURL}
                alt={partner1.displayName}
                className="inline-block h-12 w-12 rounded-full ring-2 ring-rose-500 object-cover bg-slate-800 shadow-md"
              />
              <img
                src={partner2.photoURL}
                alt={partner2.displayName}
                className="inline-block h-12 w-12 rounded-full ring-2 ring-pink-500 object-cover bg-slate-800 shadow-md"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-fraunces text-white flex items-center gap-1.5">
                  <span>{couple.coupleName || `${partner1.displayName} & ${partner2.displayName}`}</span>
                  <span className="text-rose-500">💕</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase border border-emerald-500/30">
                  {couple.status}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  CODE: {couple.pairCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Anniversary: <strong className="text-rose-300">{couple.anniversaryDate || '2024-02-14'}</strong></span>
                <span>•</span>
                <span>Theme: <strong className="capitalize text-slate-300">{couple.theme || 'Rose Velvet'}</strong></span>
                <span>•</span>
                <span>ID: <code className="text-[10px] font-mono text-slate-500">{couple.id.slice(0, 8)}...</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={fetchCoupleDeepData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deep Dive Subtab Selector */}
        <div className="flex items-center px-4 sm:px-6 bg-slate-900/80 border-b border-slate-800 gap-1.5 overflow-x-auto py-2.5 shrink-0 text-xs font-semibold">
          {[
            { id: 'chat', label: `Live Chat (${messages.length})`, icon: MessageCircle, color: 'text-amber-400' },
            { id: 'games', label: `Games & Pet (${games.length})`, icon: Gamepad2, color: 'text-emerald-400' },
            { id: 'memories', label: `Memories & Vault (${memories.length})`, icon: ImageIcon, color: 'text-blue-400' },
            { id: 'letters', label: `Love Letters (${letters.length})`, icon: Mail, color: 'text-purple-400' },
            { id: 'daily', label: `Daily Check-ins (${dailyAnswers.length})`, icon: Sparkles, color: 'text-pink-400' },
            { id: 'notes', label: `Notes & Bucket (${notes.length + bucketList.length})`, icon: BookOpen, color: 'text-teal-400' },
            { id: 'dossier', label: 'Birthdays & Profiles', icon: Cake, color: 'text-rose-400' },
            { id: 'raw', label: 'Raw Database JSON', icon: ShieldCheck, color: 'text-slate-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LIVE CHAT STREAM */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Full Live Chat Transcript &amp; Message Interceptor
                  </span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Chat Messages Container */}
              <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-4 sm:p-6 space-y-3.5 min-h-[360px] max-h-[500px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-xs">
                    No messages match this query or chat is quiet.
                  </div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isPartner1 = msg.sender_id === couple.partner1Id;
                    const senderProfile = isPartner1 ? partner1 : partner2;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isPartner1 ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                      >
                        <img
                          src={senderProfile.photoURL}
                          alt={senderProfile.displayName}
                          className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 object-cover shrink-0 mt-1"
                        />
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 text-[11px] ${isPartner1 ? 'text-slate-400' : 'text-slate-400 justify-end'}`}>
                            <span className="font-bold text-slate-200">{senderProfile.displayName}</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isPartner1
                                ? 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                                : 'bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-tr-none shadow-md shadow-rose-600/10'
                            }`}
                          >
                            {msg.type === 'game_challenge' ? (
                              <div className="flex items-center gap-2 font-semibold">
                                <Gamepad2 className="w-4 h-4 text-amber-300" />
                                <span>{msg.text}</span>
                              </div>
                            ) : msg.media_url ? (
                              <div className="space-y-2">
                                <img src={msg.media_url} alt="Attachment" className="rounded-xl max-h-48 object-cover w-full" />
                                {msg.text && <p>{msg.text}</p>}
                              </div>
                            ) : msg.audio_url ? (
                              <div className="flex items-center gap-2">
                                <Music className="w-4 h-4 text-amber-300" />
                                <span className="italic font-mono">Voice note attachment ({msg.audio_duration || '0:14'})</span>
                              </div>
                            ) : (
                              <p>{msg.text}</p>
                            )}

                            {/* Reactions */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10">
                                {Object.entries(msg.reactions).map(([uid, emo]) => (
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
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE GAMES & VIRTUAL PET */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              {/* Virtual Pet Live Telemetry */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-pink-950/30 to-slate-900 border border-pink-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/20">
                      🦊
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-fraunces flex items-center gap-2">
                        <span>Shared Couple Pet: {couple.pet?.name || 'Mochi the Fox'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                          Level {couple.pet?.level || 3}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cared for mutually by {partner1.displayName} &amp; {partner2.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold">Status: Happy &amp; Playful</span>
                    <div className="text-[10px] text-slate-500">Total Fed: {couple.pet?.totalFed || 28} times</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Hunger Level</span>
                      <span className="text-emerald-400 font-bold">{couple.pet?.hunger || 80}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${couple.pet?.hunger || 80}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Affection &amp; Love</span>
                      <span className="text-pink-400 font-bold">{couple.pet?.affection || 92}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${couple.pet?.affection || 92}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Play Energy</span>
                      <span className="text-amber-400 font-bold">85%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Interactive Games Roster */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  Live Games &amp; Match History ({games.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map((g) => (
                    <div key={g.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold capitalize text-white">
                            {g.game_type?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                            {g.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(g.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Tic Tac Toe Grid Rendering */}
                      {g.game_type === 'tic_tac_toe' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1.5 w-36 mx-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                            {(g.board_state || ['X', 'O', ' ', ' ', 'X', ' ', ' ', ' ', 'O']).map((cell: string, idx: number) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-extrabold text-sm text-rose-400"
                              >
                                {cell}
                              </div>
                            ))}
                          </div>
                          <p className="text-[11px] text-center text-slate-400">
                            Turn: <strong className="text-amber-300">{g.current_turn === couple.partner1Id ? partner1.displayName : partner2.displayName}</strong>
                          </p>
                        </div>
                      )}

                      {/* Love Quiz Q&A */}
                      {g.game_type === 'love_quiz' && (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold text-slate-200">{g.question}</p>
                          <div className="space-y-1 text-[11px]">
                            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                              <span className="text-rose-400 font-bold">{partner1.displayName}:</span>
                              <span className="text-slate-300">{g.answers?.[couple.partner1Id] || 'Kyoto, Japan 🌸'}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                              <span className="text-pink-400 font-bold">{partner2.displayName}:</span>
                              <span className="text-slate-300">{g.answers?.[couple.partner2Id] || 'Kyoto in Spring! ⛩️'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Would You Rather */}
                      {g.game_type === 'would_you_rather' && (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold text-slate-200">{g.question}</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <div className="text-rose-400 font-bold text-[10px]">{partner1.displayName} chose:</div>
                              <div className="text-slate-300">{g.answers?.[couple.partner1Id]}</div>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                              <div className="text-pink-400 font-bold text-[10px]">{partner2.displayName} chose:</div>
                              <div className="text-slate-300">{g.answers?.[couple.partner2Id]}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEMORIES & PHOTO VAULT */}
          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  Couple Photo Scrapbook &amp; Vault Moments ({memories.length})
                </h4>
                <span className="text-xs text-slate-500">AES-256 Cloud Vault</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 shadow-lg"
                  >
                    {mem.image_url && (
                      <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-800">
                        <img
                          src={mem.image_url}
                          alt={mem.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        {mem.mood && (
                          <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                            {mem.mood}
                          </span>
                        )}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-white text-sm font-fraunces">{mem.title}</h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{mem.story}</p>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        {mem.memory_date}
                      </span>
                      {mem.location && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />
                          {mem.location}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOVE LETTERS (SEALED & OPENED) */}
          {activeTab === 'letters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Golden Love Letters &amp; Wax-Sealed Capsules ({letters.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {letters.map((letItem) => {
                  const isSealed = Boolean(letItem.is_sealed);
                  return (
                    <div
                      key={letItem.id}
                      className="p-5 rounded-3xl bg-slate-900 border border-purple-500/20 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                            💌
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">From: {letItem.sender_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(letItem.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {isSealed ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                            <Lock className="w-3 h-3" /> Sealed until {new Date(letItem.unlock_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                            <Unlock className="w-3 h-3" /> Unlocked &amp; Read
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-bold text-rose-300 font-fraunces">{letItem.title}</h5>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 font-serif italic">
                          "{letItem.content}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Wax Seal: <strong className="capitalize text-amber-300">{letItem.wax_seal?.replace(/_/g, ' ')}</strong></span>
                        <span>Read Status: {letItem.is_read ? '✅ Opened by Partner' : '⏳ Waiting to open'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: DAILY CHECK-INS & MOODS */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Daily Spark Intimacy Questions &amp; Mood Logs
              </h4>

              <div className="space-y-3">
                {dailyAnswers.map((da) => (
                  <div key={da.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                      <span className="font-bold text-white">{da.question_text}</span>
                      <span className="text-[10px] text-slate-500">{new Date(da.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold shrink-0">
                        {da.user_name || 'Partner'}
                      </span>
                      <p className="text-slate-300 italic">"{da.answer_text}"</p>
                    </div>
                    {da.mood && (
                      <div className="text-[10px] text-pink-400 font-semibold pt-1">
                        Mood Recorded: {da.mood}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: NOTES & BUCKET LIST */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Shared Couple Notes &amp; Dreams
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-white text-xs">{note.title}</h5>
                        {note.is_pinned && <span className="text-[10px] text-amber-400 font-bold">📌 Pinned</span>}
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" /> Lifetime Couple Bucket List
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {bucketList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.completed ? 'bg-emerald-500 text-white' : 'border border-slate-700'}`}>
                          {item.completed ? '✓' : ''}
                        </span>
                        <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase">{item.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: BIRTHDAYS & DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Partner 1 Dossier */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={partner1.photoURL}
                      alt={partner1.displayName}
                      className="w-14 h-14 rounded-full border-2 border-rose-500 object-cover bg-slate-800 shadow-md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white font-fraunces">{partner1.displayName}</h4>
                      <p className="text-xs text-slate-400 font-mono">{partner1.email}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                        Partner 1
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Birthday:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <Cake className="w-3.5 h-3.5 text-pink-400" />
                        {partner1.birthday || 'May 14, 1999'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Zodiac Sign:</span>
                      <span className="font-bold text-amber-300">♉ {partner1.zodiac || 'Taurus'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Occupation:</span>
                      <span className="font-bold text-slate-200">{partner1.occupation || 'Creative Designer'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Love Language:</span>
                      <span className="font-bold text-pink-300">{partner1.loveLanguage || 'Words of Affirmation'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Pet Name For Partner:</span>
                      <span className="font-bold text-rose-400 font-fraunces">"{partner1.nickname || 'Shoona'}"</span>
                    </div>
                  </div>
                </div>

                {/* Partner 2 Dossier */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-pink-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={partner2.photoURL}
                      alt={partner2.displayName}
                      className="w-14 h-14 rounded-full border-2 border-pink-500 object-cover bg-slate-800 shadow-md"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white font-fraunces">{partner2.displayName}</h4>
                      <p className="text-xs text-slate-400 font-mono">{partner2.email}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                        Partner 2
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Birthday:</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <Cake className="w-3.5 h-3.5 text-pink-400" />
                        {partner2.birthday || 'November 22, 1997'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Zodiac Sign:</span>
                      <span className="font-bold text-amber-300">♏ {partner2.zodiac || 'Scorpio'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Occupation:</span>
                      <span className="font-bold text-slate-200">{partner2.occupation || 'Software Engineer'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Love Language:</span>
                      <span className="font-bold text-pink-300">{partner2.loveLanguage || 'Quality Time & Touch'}</span>
                    </div>

                    <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400">Pet Name For Partner:</span>
                      <span className="font-bold text-pink-400 font-fraunces">"{partner2.nickname || 'Babu'}"</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RAW DATABASE JSON */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Full Couple Entity Snapshot with Joined Relations
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify({ couple, partner1, partner2, messages, games, memories, letters, dailyAnswers, notes, bucketList }, null, 2))}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-rose-400" />
                  <span>Copy Complete JSON</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[450px]">
                {JSON.stringify(
                  {
                    coupleEntity: couple,
                    partner1Dossier: partner1,
                    partner2Dossier: partner2,
                    liveChatCount: messages.length,
                    liveGames: games,
                    memoriesCount: memories.length,
                    lettersCount: letters.length,
                    dailyAnswersCount: dailyAnswers.length,
                    notesCount: notes.length,
                    bucketListCount: bucketList.length,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
