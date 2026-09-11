import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Heart, Check, Smile, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PetNameCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PET_NAME_PRESETS = [
  'Shoona',
  'Baby',
  'Jaanu',
  'Babu',
  'Princess',
  'Prince',
  'My Queen',
  'My King',
  'Sweetheart',
  'Honey',
  'Sunshine',
  'Cutie',
  'Angel',
  'Teddy',
  'Love of My Life',
  'Bae',
];

const GENDER_OPTIONS = [
  { id: 'female', label: 'Female', pronoun: 'She / Her', emoji: '👩' },
  { id: 'male', label: 'Male', pronoun: 'He / Him', emoji: '👨' },
  { id: 'non_binary', label: 'Non-Binary', pronoun: 'They / Them', emoji: '🌈' },
  { id: 'prefer_not_to_say', label: 'Other / Private', pronoun: 'Heart to Heart', emoji: '✨' },
];

export const PetNameCustomizerModal: React.FC<PetNameCustomizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, partnerProfile, updateUserProfileData } = useAuth();

  const [petNameForPartner, setPetNameForPartner] = useState(
    userProfile?.petNameForPartner || 'Shoona'
  );
  const [petNameForSelf, setPetNameForSelf] = useState(
    userProfile?.petNameForSelf || ''
  );
  const [gender, setGender] = useState<string>(
    userProfile?.gender || 'prefer_not_to_say'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfileData({
        petNameForPartner: petNameForPartner.trim() || '',
        petNameForSelf: petNameForSelf.trim() || '',
        gender: gender as any,
      });

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onClose();
    } catch (err) {
      console.error('Error saving pet names:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Customize Pet Names & Gender
              </h3>
              <p className="text-xs text-slate-400">
                Personalize how you and your love are identified in the Sanctuary
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Live Preview Card */}
          <div className="p-4 bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-purple-50/80 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-rose-200/60 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>You & Yours Live Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-rose-100 dark:border-slate-700">
                <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  YOU
                </span>
                <strong className="text-slate-800 dark:text-white font-bold block text-sm">
                  {userProfile?.displayName || 'You'}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {petNameForSelf ? `"${petNameForSelf}" • ` : ''}
                  {GENDER_OPTIONS.find((g) => g.id === gender)?.emoji}{' '}
                  {GENDER_OPTIONS.find((g) => g.id === gender)?.label}
                </span>
              </div>

              <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 rounded-xl border border-pink-100 dark:border-slate-700">
                <span className="text-[10px] font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-wider block">
                  YOURS
                </span>
                <strong className="text-slate-800 dark:text-white font-bold block text-sm">
                  {partnerProfile?.displayName || 'Your Partner'}
                </strong>
                <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                  You call {partnerProfile?.gender === 'male' ? 'him' : partnerProfile?.gender === 'non_binary' ? 'them' : 'her'} "{petNameForPartner || 'Shoona'}" 💕
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Pet Name for Partner */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pet Name for {partnerProfile?.displayName || 'Your Partner'} (What you call {partnerProfile?.gender === 'male' ? 'him' : partnerProfile?.gender === 'non_binary' ? 'them' : 'her'})
            </label>
            <input
              type="text"
              value={petNameForPartner}
              onChange={(e) => setPetNameForPartner(e.target.value)}
              placeholder="e.g. Shoona, Jaanu, Baby, My Queen..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white font-semibold"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
              {PET_NAME_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPetNameForPartner(preset)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    petNameForPartner === preset
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Pet Name for Yourself */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pet Name for Yourself (What you love to be called)
            </label>
            <input
              type="text"
              value={petNameForSelf}
              onChange={(e) => setPetNameForSelf(e.target.value)}
              placeholder="e.g. Sweetie, Babu, Prince, Teddy..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-white"
            />
          </div>

          {/* Section 3: Gender / Identity Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Gender / Pronouns
              </label>
              <span className="text-[10px] text-slate-400">Can be updated anytime</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGender(opt.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    gender === opt.id
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/20 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{opt.pronoun}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Update Sanctuary'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
