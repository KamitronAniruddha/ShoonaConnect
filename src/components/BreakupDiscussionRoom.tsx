import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartCrack,
  Send,
  Heart,
  User,
  AlertTriangle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, createSafeChannel } from '../lib/supabase';
import { Message } from '../types';
import { messageRowToMessage } from '../utils/supabaseMappers';

export const BreakupDiscussionRoom: React.FC = () => {
  const {
    currentUser,
    userProfile,
    couple,
    partnerProfile,
    acceptMutualBreakup,
    declineOrCancelMutualBreakup,
  } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!couple || !currentUser) return null;

  // Parse current breakup proposal voting state from relationship_story
  let breakState = {
    initiator: '',
    initiatorAccepted: false,
    partnerAccepted: false,
    proposedAt: '',
  };

  try {
    if (couple.relationshipStory) {
      breakState = JSON.parse(couple.relationshipStory);
    }
  } catch {
    // Fallback if not JSON
  }

  const isCurrentUserInitiator = breakState.initiator === currentUser.uid;
  const userHasAccepted = isCurrentUserInitiator
    ? breakState.initiatorAccepted
    : breakState.partnerAccepted;
  const partnerHasAccepted = isCurrentUserInitiator
    ? breakState.partnerAccepted
    : breakState.initiatorAccepted;

  const myName = userProfile?.nickname || userProfile?.displayName || 'Me';
  const partnerName = partnerProfile?.nickname || partnerProfile?.displayName || 'My Partner';

  const myPhoto = userProfile?.photoURL;
  const partnerPhoto = partnerProfile?.photoURL;

  // Fetch breakup discussion messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', couple.id)
        .eq('type', 'breakup_discussion')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching breakup messages:', error);
      } else if (data) {
        setMessages(data.map(messageRowToMessage));
      }
    } catch (err) {
      console.error('Error in fetchMessages:', err);
    } finally {
      setLoadingMessages(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Setup realtime subscription for messages
    const channel = createSafeChannel(`breakup_messages:${couple.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${couple.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.type === 'breakup_discussion') {
            const newMsg = messageRowToMessage(payload.new);
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const { error } = await supabase.from('messages').insert({
        couple_id: couple.id,
        sender_id: currentUser.uid,
        sender_name: myName,
        sender_photo: myPhoto,
        text: textToSend,
        type: 'breakup_discussion',
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Failed to send breakup message:', error);
      }
    } catch (err) {
      console.error('Error sending breakup message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoteAgree = async () => {
    if (isVoting) return;
    setIsVoting(true);
    setErrorText(null);
    try {
      await acceptMutualBreakup();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to record your response. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDeclineOrCancel = async () => {
    if (isVoting) return;
    setIsVoting(true);
    setErrorText(null);
    try {
      await declineOrCancelMutualBreakup();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to cancel the proposal. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const relationshipAdvice = [
    'Take a breath. Speak with gentle honesty. Mutual closure is a gesture of deep respect.',
    'Listen as much as you speak. Hear the truth of your partner’s feelings without interruption.',
    'It is okay to hold space for sorrow while seeking clarity on the next steps of your journey.',
    'Every beautiful story deserves a soft, dignified closing. Keep your messages peaceful.',
  ];

  const randomAdviceIndex = Math.floor((new Date().getDate()) % relationshipAdvice.length);
  const selectedAdvice = relationshipAdvice[randomAdviceIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-[#080507] text-neutral-100 font-sans select-none overflow-hidden">
      
      {/* LEFT COLUMN: Sidebar with Status of Decision & Advice (1/3 Width) */}
      <div className="w-full md:w-[380px] bg-[#0d090c] border-b md:border-b-0 md:border-r border-red-950/40 flex flex-col justify-between shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Brand/Heading */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center p-0.5 shadow-lg shadow-red-500/10">
              <div className="w-full h-full bg-[#120a10] rounded-[14px] flex items-center justify-center">
                <HeartCrack className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-red-400">Neutral Ground</span>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none mt-0.5">
                Breakup Review Suite
              </h1>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Mutual Decision Policy</span>
            </div>
            <p className="leading-relaxed">
              You are inside an isolated negotiation room. Standard features are on hold. The connection will only dissolve if <strong>both partners agree to let go</strong>.
            </p>
          </div>

          {/* Partner Status Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Response Verification Tracker
            </h3>

            {/* User Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {myPhoto ? (
                  <img
                    src={myPhoto}
                    alt={myName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">{myName} (You)</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {userHasAccepted ? 'Has Agreed' : 'Awaiting response'}
                  </p>
                </div>
              </div>
              <div>
                {userHasAccepted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-red-500/10" />
                    <span>Agreed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
                    <span>Deciding...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Partner Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {partnerPhoto ? (
                  <img
                    src={partnerPhoto}
                    alt={partnerName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">{partnerName}</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {partnerHasAccepted ? 'Has Agreed' : 'Awaiting response'}
                  </p>
                </div>
              </div>
              <div>
                {partnerHasAccepted ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-red-500/10" />
                    <span>Agreed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    <span>Deciding...</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Counseling Quote */}
          <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 space-y-2 text-xs">
            <div className="flex items-center gap-1 text-rose-400 font-medium font-fraunces">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sanctuary Wisdom</span>
            </div>
            <p className="text-neutral-400 italic leading-relaxed text-[11px]">
              "{selectedAdvice}"
            </p>
          </div>
        </div>

        {/* Column Actions Area */}
        <div className="p-6 border-t border-neutral-800/80 space-y-3 bg-[#0a0709]">
          {errorText && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-600/40 text-red-300 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {!userHasAccepted ? (
            <button
              onClick={handleVoteAgree}
              disabled={isVoting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVoting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Decision...</span>
                </>
              ) : (
                <>
                  <HeartCrack className="w-4 h-4" />
                  <span>I Agree to Breakup</span>
                </>
              )}
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/10 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>My Consent Recorded</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Waiting for {partnerName} to also agree. You can withdraw this consent anytime by clicking below.
              </p>
            </div>
          )}

          <button
            onClick={handleDeclineOrCancel}
            disabled={isVoting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20 active:scale-95 text-rose-300 border border-rose-500/20 hover:border-rose-500/40 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner"
          >
            {isVoting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Cancel Proposal & Stay Together</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: The Interactive Negotiation Chat Area (2/3 Width) */}
      <div className="flex-1 flex flex-col bg-[#080507]">
        {/* Top Chat Bar */}
        <div className="h-16 px-6 border-b border-red-950/30 flex items-center justify-between bg-[#0d090c]/40">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-neutral-200">
              Breakup Dialogue Channel
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-neutral-400 font-mono">ENCRYPTED DISCUSSION</span>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="text-xs">Decrypting discussion stream...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/15 flex items-center justify-center text-red-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-neutral-200">Silence is heavy, talk it out</h4>
                <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                  Every shared space deserves a respectful closure. Write what is in your heart or coordinate your parting decisions.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isSystem = m.senderId === 'system' || m.senderName.includes('Advisor');
                const isMe = m.senderId === currentUser.uid;

                if (isSystem) {
                  return (
                    <div key={m.id} className="flex justify-center my-4">
                      <div className="px-4 py-2.5 rounded-2xl bg-neutral-900/60 border border-red-500/10 text-[11px] text-red-200/90 max-w-md text-center shadow-inner leading-relaxed">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      m.senderPhoto ? (
                        <img
                          src={m.senderPhoto}
                          alt={m.senderName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-neutral-800 mt-0.5"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )
                    )}

                    <div className="space-y-1 max-w-[70%]">
                      <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] font-semibold text-neutral-400">
                          {isMe ? 'You' : m.senderName}
                        </span>
                        <span className="text-[8px] text-neutral-500">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-red-600/10 border border-red-500/20 text-red-100 rounded-tr-none'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>

                    {isMe && (
                      m.senderPhoto ? (
                        <img
                          src={m.senderPhoto}
                          alt={m.senderName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-neutral-800 mt-0.5"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-red-950/20 flex gap-2 bg-[#0d090c]/40 items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message of closure or coordination..."
            className="flex-1 px-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-800/80 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 active:scale-95 disabled:opacity-40 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
