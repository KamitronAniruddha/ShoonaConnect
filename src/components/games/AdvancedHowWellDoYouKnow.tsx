import React, { useState, useEffect, useRef } from 'react';
import { massiveHowWellDoYouKnowData as extendedHowWellDoYouKnowMeData, GameCategory } from '../../data/massiveGamesData';
import { useAuth } from '../../context/AuthContext';
import { createSafeChannel, supabase } from '../../lib/supabase';
import { Sparkles, Plus, Send, CheckCircle2, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdvancedHowWellDoYouKnow: React.FC = () => {
  const { couple, userProfile } = useAuth();
  const [category, setCategory] = useState<GameCategory>('Spicy & Intimate');
  const [questions, setQuestions] = useState(extendedHowWellDoYouKnowMeData.filter(q => q.category === category));
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isAnswerMode, setIsAnswerMode] = useState(true); // true = typing answer, false = guessing
  const [myAnswer, setMyAnswer] = useState('');
  const [partnerGuess, setPartnerGuess] = useState('');
  
  const [partnerAnswer, setPartnerAnswer] = useState(''); // what partner said about themselves
  const [myGuess, setMyGuess] = useState(''); // what I guess about partner
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  const myAnswerRef = useRef(myAnswer);
  useEffect(() => { myAnswerRef.current = myAnswer; }, [myAnswer]);
  const myGuessRef = useRef(myGuess);
  useEffect(() => { myGuessRef.current = myGuess; }, [myGuess]);
  
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customText, setCustomText] = useState('');
  
  const [channel, setChannel] = useState<any>(null);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setQuestions(extendedHowWellDoYouKnowMeData.filter(q => q.category === category));
    setCurrentIndex(Math.floor(Math.random() * 10)); // Pick random starter
    resetState();
  }, [category]);

  const resetState = () => {
    setMyAnswer('');
    setPartnerGuess('');
    setPartnerAnswer('');
    setMyGuess('');
    setReveal(false);
  };

  useEffect(() => {
    if (!couple?.id || !userProfile?.uid) return;

    const gameChannel = createSafeChannel(`howwell_game_${couple.id}`)
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          setPartnerAnswer(payload.answer);
          checkReveal(payload.answer, myGuessRef.current);
        }
      })
      .on('broadcast', { event: 'guess' }, ({ payload }) => {
        if (payload.userId !== userProfile.uid) {
          setPartnerGuess(payload.guess);
          checkReveal(myAnswerRef.current, payload.guess);
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
          resetState();
        }
      })
      .subscribe();

    setChannel(gameChannel);

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [couple?.id, userProfile?.uid]);

  const checkReveal = (ans: string, gs: string) => {
    if (ans && gs) {
      setReveal(true);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  const submitMyAnswer = () => {
    if (!myAnswer) return;
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { userId: userProfile?.uid, answer: myAnswer }
      });
    }
    checkReveal(myAnswer, partnerGuess);
  };

  const submitMyGuess = () => {
    if (!myGuess) return;
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'guess',
        payload: { userId: userProfile?.uid, guess: myGuess }
      });
    }
    checkReveal(partnerAnswer, myGuess);
  };

  const nextQuestion = () => {
    const nextIdx = (currentIndex + 1) % questions.length;
    setCurrentIndex(nextIdx);
    resetState();
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
      text: customText
    }]);
    setCurrentIndex(0);
    setIsCustomMode(false);
    resetState();

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'next_question',
        payload: { 
          userId: userProfile?.uid, 
          isCustom: true,
          customText: customText
        }
      });
    }
  };

  const currentQ = questions[currentIndex];
  if (!currentQ && !isCustomMode) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff4d8d] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            1000+ Deep Prompts
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-fraunces text-white">How Well Do You Know Me?</h2>
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
          <h3 className="text-lg font-bold text-white mb-4">Create Custom Question</h3>
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Your Question</label>
            <input 
              type="text" 
              placeholder="e.g. What is my favorite memory of us?" 
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
          <div className="p-6 rounded-2xl bg-[#1e131b] border border-white/10 text-center">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block mb-2">{currentQ.category}</span>
            <p className="text-xl sm:text-2xl font-bold font-fraunces text-white">
              {currentQ.text}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
             <button 
               onClick={() => setIsAnswerMode(true)}
               className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isAnswerMode ? 'bg-purple-500 text-white' : 'bg-white/5 text-neutral-400'}`}
             >
               Answer For Myself
             </button>
             <button 
               onClick={() => setIsAnswerMode(false)}
               className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnswerMode ? 'bg-[#ff3377] text-white' : 'bg-white/5 text-neutral-400'}`}
             >
               Guess Partner's Answer
             </button>
          </div>

          {!reveal ? (
            <div className="space-y-6">
              {isAnswerMode ? (
                <div className="bg-[#1a1218] p-6 rounded-2xl border border-white/5">
                   <label className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2">My True Answer</label>
                   <textarea 
                     value={myAnswer}
                     onChange={e => setMyAnswer(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 h-24 resize-none mb-4"
                     placeholder="Type the truth here..."
                   />
                   <button 
                     onClick={submitMyAnswer}
                     className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl"
                   >
                     Lock In My Answer
                   </button>
                   {partnerGuess && <p className="text-xs text-neutral-400 mt-2 text-center">Partner has submitted their guess about you!</p>}
                </div>
              ) : (
                <div className="bg-[#1a1218] p-6 rounded-2xl border border-white/5">
                   <label className="text-xs font-bold text-[#ff3377] uppercase tracking-wider block mb-2">My Guess For Partner</label>
                   <textarea 
                     value={myGuess}
                     onChange={e => setMyGuess(e.target.value)}
                     className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#ff3377] h-24 resize-none mb-4"
                     placeholder="I think they will say..."
                   />
                   <button 
                     onClick={submitMyGuess}
                     className="w-full py-3 bg-[#ff3377] hover:bg-[#ff4d8d] text-white font-bold rounded-xl"
                   >
                     Submit Guess
                   </button>
                   {partnerAnswer && <p className="text-xs text-neutral-400 mt-2 text-center">Partner has locked in their true answer!</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-purple-900/20 border border-purple-500/30">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Your True Answer</h4>
                  <p className="text-lg text-white mb-6">{myAnswer}</p>
                  
                  <h4 className="text-xs font-bold text-[#ff3377] uppercase tracking-wider mb-2">Partner's Guess</h4>
                  <p className="text-lg text-white">{partnerGuess}</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-[#ff3377]/10 border border-[#ff3377]/30">
                  <h4 className="text-xs font-bold text-[#ff3377] uppercase tracking-wider mb-2">Partner's True Answer</h4>
                  <p className="text-lg text-white mb-6">{partnerAnswer}</p>
                  
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Your Guess</h4>
                  <p className="text-lg text-white">{myGuess}</p>
                </div>
              </div>
              
              <button
                onClick={nextQuestion}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-sm"
              >
                Next Question →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
