import React, { useState, useEffect, useRef } from 'react';
import { massiveNeverHaveIEverData as extendedNeverHaveIEverData, GameCategory, QuestionDef } from '../../data/massiveGamesData';
import { useAuth } from '../../context/AuthContext';
import { createSafeChannel, supabase } from '../../lib/supabase';
import { Sparkles, Plus, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdvancedNeverHaveIEver: React.FC = () => {
  const { couple, userProfile } = useAuth();
  const [category, setCategory] = useState<GameCategory>('Spicy & Intimate');
  const [questions, setQuestions] = useState(extendedNeverHaveIEverData.filter(q => q.category === category));
  const [currentIndex, setCurrentIndex] = useState(0);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  
  const [history, setHistory] = useState<{ prompt: string; myResult?: 'have' | 'never'; partnerResult?: 'have' | 'never' }[]>([]);
  
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    setQuestions(extendedNeverHaveIEverData.filter(q => q.category === category));
    setCurrentIndex(Math.floor(Math.random() * 10)); // Pick random starter
  }, [category]);

  useEffect(() => {
    if (!couple?.id || !userProfile?.uid) return;

    const gameChannel = createSafeChannel(`nhie_game_${couple.id}`)
      .on('broadcast', { event: 'vote' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          setHistory(prev => {
            const newHistory = [...prev];
            if (newHistory.length > 0) {
              newHistory[0] = { ...newHistory[0], partnerResult: payload.vote };
            }
            return newHistory;
          });
          if (payload.vote === 'have') {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
          }
        }
      })
      .on('broadcast', { event: 'next_question' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          if (payload.isCustom) {
            setQuestions([{
              id: 'custom_shared',
              category: 'General',
              text: payload.customText
            }]);
            setCurrentIndex(0);
            setIsCustomMode(false);
          } else {
            const idx = questionsRef.current.findIndex(q => q.id === payload.questionId);
            if (idx !== -1) setCurrentIndex(idx);
          }
        }
      })
      .subscribe();

    setChannel(gameChannel);

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [couple?.id, userProfile?.uid]);

  const currentQ = questions[currentIndex];

  const handleVote = (choice: 'have' | 'never') => {
    setHistory(prev => [{ prompt: currentQ.text, myResult: choice }, ...prev]);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'vote',
        payload: { userId: userProfile?.uid, vote: choice }
      });
    }
    
    if (choice === 'have') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.65 } });
    }

    // Auto next after 1.5s
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const nextQuestion = () => {
    const nextIdx = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIdx);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: { userId: userProfile?.uid, questionId: questions[nextIdx].id }
      });
    }
  };

  const sendCustomQuestion = () => {
    if (!customText) return;
    setQuestions([{
      id: 'custom_local',
      category: 'General',
      text: `Never have I ever ${customText}`
    }]);
    setCurrentIndex(0);
    setIsCustomMode(false);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: { 
          userId: userProfile?.uid, 
          isCustom: true,
          customText: `Never have I ever ${customText}`
        }
      });
    }
  };

  if (!currentQ && !isCustomMode) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Couples Edition Confessions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">Never Have I Ever</h2>
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
          <h3 className="text-lg font-bold text-white mb-4">Custom Confession</h3>
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Never have I ever...</label>
            <input 
              type="text" 
              placeholder="e.g. eaten a whole pizza alone" 
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff3377]"
            />
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
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#21141e] to-[#180e16] border border-[#ff3377]/30 shadow-2xl relative text-center">
             <p className="text-xl sm:text-2xl font-fraunces text-white leading-relaxed">
               "{currentQ.text}"
             </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <button
               onClick={() => handleVote('have')}
               className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-[#ff3377] to-[#ff5c8a] hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
             >
               🙈 I HAVE!
             </button>
             <button
               onClick={() => handleVote('never')}
               className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#1e141c] hover:bg-[#281b26] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
             >
               😇 NEVER
             </button>
          </div>

          {history.length > 0 && (
             <div className="mt-12 text-left border-t border-white/5 pt-6 space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Synced History</h4>
               <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                 {history.map((item, idx) => (
                   <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                     <span className="text-sm text-neutral-300">{item.prompt}</span>
                     <div className="flex gap-2">
                       {item.myResult && (
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.myResult === 'have' ? 'bg-[#ff3377]/20 text-[#ff4d8d]' : 'bg-emerald-500/20 text-emerald-400'}`}>
                           You: {item.myResult}
                         </span>
                       )}
                       {item.partnerResult && (
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.partnerResult === 'have' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                           Partner: {item.partnerResult}
                         </span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </>
      )}
    </div>
  );
};
