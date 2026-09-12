import React, { useState, useEffect, useRef } from 'react';
import { massiveWouldYouRatherData as extendedWouldYouRatherData, GameCategory } from '../../data/massiveGamesData';
import { useAuth } from '../../context/AuthContext';
import { createSafeChannel, supabase } from '../../lib/supabase';
import { CheckCircle2, Heart, Sparkles, Plus, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameState {
  questionId: string;
  customQuestion?: { text: string; options: [string, string] };
  player1Vote: 'a' | 'b' | null;
  player2Vote: 'a' | 'b' | null;
}

export const AdvancedWouldYouRather: React.FC = () => {
  const { couple, userProfile } = useAuth();
  const [category, setCategory] = useState<GameCategory>('Spicy & Intimate');
  const [questions, setQuestions] = useState(extendedWouldYouRatherData.filter(q => q.category === category));
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [myVote, setMyVote] = useState<'a' | 'b' | null>(null);
  const myVoteRef = useRef(myVote);
  useEffect(() => { myVoteRef.current = myVote; }, [myVote]);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  const [partnerVote, setPartnerVote] = useState<'a' | 'b' | null>(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customQ, setCustomQ] = useState({ text: '', optA: '', optB: '' });
  
  const [channel, setChannel] = useState<any>(null);

  // Filter questions when category changes
  useEffect(() => {
    setQuestions(extendedWouldYouRatherData.filter(q => q.category === category));
    setCurrentIndex(Math.floor(Math.random() * 10)); // Pick random starter
    setMyVote(null);
    setPartnerVote(null);
  }, [category]);

  // Setup Realtime Syncing
  useEffect(() => {
    if (!couple?.id || !userProfile?.uid) return;

    const gameChannel = createSafeChannel(`wyr_game_${couple.id}`)
      .on('broadcast', { event: 'vote' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          setPartnerVote(payload.vote);
          if (myVoteRef.current && payload.vote === myVoteRef.current) {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          }
        }
      })
      .on('broadcast', { event: 'next_question' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          if (payload.isCustom) {
            setQuestions([{
              id: 'custom_shared',
              category: 'General',
              text: payload.customText,
              options: payload.customOptions
            }]);
            setCurrentIndex(0);
            setIsCustomMode(false);
          } else {
            const idx = questionsRef.current.findIndex(q => q.id === payload.questionId);
            if (idx !== -1) setCurrentIndex(idx);
          }
          setMyVote(null);
          setPartnerVote(null);
        }
      })
      .subscribe();

    setChannel(gameChannel);

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [couple?.id, userProfile?.uid]);

  const currentQ = questions[currentIndex];

  const handleVote = (choice: 'a' | 'b') => {
    setMyVote(choice);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'vote',
        payload: { userId: userProfile?.uid, vote: choice }
      });
    }
    if (partnerVote === choice) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  const nextQuestion = () => {
    const nextIdx = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIdx);
    setMyVote(null);
    setPartnerVote(null);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: { userId: userProfile?.uid, questionId: questions[nextIdx].id }
      });
    }
  };

  const sendCustomQuestion = () => {
    if (!customQ.text || !customQ.optA || !customQ.optB) return;
    setQuestions([{
      id: 'custom_local',
      category: 'General',
      text: customQ.text,
      options: [customQ.optA, customQ.optB]
    }]);
    setCurrentIndex(0);
    setMyVote(null);
    setPartnerVote(null);
    setIsCustomMode(false);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: { 
          userId: userProfile?.uid, 
          isCustom: true,
          customText: customQ.text,
          customOptions: [customQ.optA, customQ.optB]
        }
      });
    }
  };

  if (!currentQ && !isCustomMode) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            1000+ Synced Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Would You Rather?</h2>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['Spicy & Intimate', 'Deep & Meaningful', 'Funny & Absurd', 'General'] as GameCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setIsCustomMode(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                category === cat && !isCustomMode ? 'bg-[#ff3377] text-white' : 'bg-[#1a1218] border border-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setIsCustomMode(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-colors ${
              isCustomMode ? 'bg-amber-500 text-white' : 'bg-[#1a1218] border border-white/10 text-amber-400/80 hover:text-amber-400'
            }`}
          >
            <Plus className="w-3 h-3" /> Custom
          </button>
        </div>
      </div>

      {isCustomMode ? (
        <div className="bg-[#1e131b] p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Create Custom Scenario</h3>
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Scenario Context (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. For our next date night..." 
              value={customQ.text}
              onChange={e => setCustomQ({...customQ, text: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff3377]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">Option A</label>
              <textarea 
                placeholder="First option..." 
                value={customQ.optA}
                onChange={e => setCustomQ({...customQ, optA: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#ff3377] uppercase tracking-wider block mb-2">Option B</label>
              <textarea 
                placeholder="Second option..." 
                value={customQ.optB}
                onChange={e => setCustomQ({...customQ, optB: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff3377] h-24 resize-none"
              />
            </div>
          </div>
          <button 
            onClick={sendCustomQuestion}
            className="w-full py-3 bg-[#ff3377] hover:bg-[#ff4d8d] text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send to Partner
          </button>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{currentQ.category}</span>
            <p className="text-lg sm:text-xl font-bold font-fraunces text-white">{currentQ.text}...</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {/* Choice A */}
            <button
              onClick={() => handleVote('a')}
              className={`p-6 sm:p-8 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                myVote === 'a'
                  ? 'bg-gradient-to-br from-purple-600/20 to-[#1a1218] border-purple-500 shadow-xl shadow-purple-500/20'
                  : 'bg-[#1a1218] border-white/10 hover:border-purple-500/50 hover:bg-[#20151f]'
              }`}
            >
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 uppercase tracking-wider mb-4 inline-block">Option A</span>
              <p className="text-lg sm:text-xl font-bold font-fraunces text-white leading-relaxed">{currentQ.options?.[0]}</p>
              
              {myVote === 'a' && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> You selected A
                </div>
              )}
              {partnerVote === 'a' && (
                <div className="mt-2 text-xs text-[#ff4d8d] font-semibold flex items-center gap-1.5 bg-[#ff3377]/10 p-2 rounded-xl border border-[#ff3377]/20">
                  <Heart className="w-3.5 h-3.5 fill-[#ff3377]" /> Partner chose this!
                </div>
              )}
            </button>

            {/* Choice B */}
            <button
              onClick={() => handleVote('b')}
              className={`p-6 sm:p-8 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                myVote === 'b'
                  ? 'bg-gradient-to-br from-[#ff3377]/25 to-[#1a1218] border-[#ff3377] shadow-xl shadow-pink-500/20'
                  : 'bg-[#1a1218] border-white/10 hover:border-[#ff3377]/50 hover:bg-[#20151f]'
              }`}
            >
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#ff3377]/20 text-[#ff3377] uppercase tracking-wider mb-4 inline-block">Option B</span>
              <p className="text-lg sm:text-xl font-bold font-fraunces text-white leading-relaxed">{currentQ.options?.[1]}</p>
              
              {myVote === 'b' && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> You selected B
                </div>
              )}
              {partnerVote === 'b' && (
                <div className="mt-2 text-xs text-[#ff4d8d] font-semibold flex items-center gap-1.5 bg-[#ff3377]/10 p-2 rounded-xl border border-[#ff3377]/20">
                  <Heart className="w-3.5 h-3.5 fill-[#ff3377]" /> Partner chose this!
                </div>
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-[#1e131b] rounded-2xl border border-white/5">
            <div className="text-sm text-neutral-400">
              {myVote && partnerVote ? (
                myVote === partnerVote 
                  ? <span className="text-emerald-400 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Perfect Match!</span>
                  : <span>Contrasting answers! Discuss why over chat.</span>
              ) : myVote ? (
                <span className="animate-pulse">Waiting for partner...</span>
              ) : (
                <span>Pick an option to see partner's choice!</span>
              )}
            </div>
            
            <button
              onClick={nextQuestion}
              className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all w-full sm:w-auto"
            >
              Next Scenario →
            </button>
          </div>
        </>
      )}
    </div>
  );
};
