import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2, Heart } from 'lucide-react';

export const ForceGenderSetup: React.FC = () => {
  const { userProfile, updateUserProfileData } = useAuth();
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || gender === 'prefer_not_to_say') {
      setError('Please select a gender to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUserProfileData({ gender: gender as any });
    } catch (err: any) {
      setError(err.message || 'Failed to update gender.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-rose-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
          <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-2 font-display">
          Complete Your Profile
        </h2>
        <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8">
          Please select your gender to continue. This is required to personalize your sanctuary experience.
        </p>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'female', label: 'Female', emoji: '👩' },
              { id: 'male', label: 'Male', emoji: '👨' },
              { id: 'non_binary', label: 'Non-Binary', emoji: '🌈' },
              { id: 'other', label: 'Other', emoji: '✨' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGender(g.id)}
                className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  gender === g.id
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-rose-200 dark:hover:border-rose-900/50'
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !gender || gender === 'prefer_not_to_say'}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
