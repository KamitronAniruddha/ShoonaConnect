import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Camera,
  Check,
  Link as LinkIcon,
  Loader2,
  Heart,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';

// Curated aesthetic avatar presets for couples
const AVATAR_PRESETS = [
  // Notionist Minimalist
  { id: 'notion-felix', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffe4e6', label: 'Felix' },
  { id: 'notion-aria', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=ffedd5', label: 'Aria' },
  { id: 'notion-oliver', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver&backgroundColor=fce7f3', label: 'Oliver' },
  { id: 'notion-chloe', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe&backgroundColor=e0f2fe', label: 'Chloe' },

  // Lorelei / Romantic Anime
  { id: 'lorelei-bella', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=f3e8ff', label: 'Bella' },
  { id: 'lorelei-leo', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo&backgroundColor=dcfce7', label: 'Leo' },
  { id: 'lorelei-mila', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Mila&backgroundColor=fef3c7', label: 'Mila' },
  { id: 'lorelei-lucas', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lucas&backgroundColor=ffe4e6', label: 'Lucas' },

  // Adventurer / Fun Character
  { id: 'adventurer-luna', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=fce7f3', label: 'Luna' },
  { id: 'adventurer-jasper', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=e0f2fe', label: 'Jasper' },
  { id: 'adventurer-maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffedd5', label: 'Maya' },
  { id: 'adventurer-kai', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kai&backgroundColor=dcfce7', label: 'Kai' },

  // Micah & Cute Bottts
  { id: 'micah-milo', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Milo&backgroundColor=fef3c7', label: 'Milo' },
  { id: 'micah-sophie', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Sophie&backgroundColor=f3e8ff', label: 'Sophie' },
  { id: 'bottts-cupid', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cupid&backgroundColor=ffe4e6', label: 'Cupid Bot' },
  { id: 'bottts-angel', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Angel&backgroundColor=e0f2fe', label: 'Angel Bot' },
];

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'user' | 'partner';
  targetName: string;
  currentPhotoUrl?: string;
  onPhotoSaved?: (newUrl: string) => void;
}

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  target,
  targetName,
  currentPhotoUrl,
  onPhotoSaved,
}) => {
  const { updateUserProfileData, updatePartnerProfilePhoto } = useAuth();
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>(currentPhotoUrl || AVATAR_PRESETS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const compressed = await compressImage(file, 600, 0.85);
      setUploadedPhotoUrl(compressed);
    } catch (err) {
      console.error('Photo compression error:', err);
      setError('Could not process this image. Please choose another photo.');
    }
  };

  const getEffectivePhotoUrl = () => {
    if (activeTab === 'upload' && uploadedPhotoUrl) return uploadedPhotoUrl;
    if (activeTab === 'url' && customPhotoUrl.trim()) return customPhotoUrl.trim();
    return selectedPreset;
  };

  const handleSavePhoto = async () => {
    const photoToSave = getEffectivePhotoUrl();
    if (!photoToSave) {
      setError('Please select or upload a picture');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (target === 'partner') {
        await updatePartnerProfilePhoto(photoToSave);
      } else {
        await updateUserProfileData({ photoURL: photoToSave });
      }

      if (onPhotoSaved) {
        onPhotoSaved(photoToSave);
      }
      onClose();
    } catch (err) {
      console.error('Error updating photo:', err);
      setError('Failed to update picture. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const effectiveUrl = getEffectivePhotoUrl();

  return (
    <div
      id="change-photo-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-rose-100 dark:border-slate-800 shadow-2xl space-y-6 text-slate-800 dark:text-slate-100 relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
              {target === 'partner' ? <Heart className="w-5 h-5 fill-rose-500" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white font-display">
                {target === 'partner' ? `Change ${targetName}'s Picture` : 'Change Your Profile Picture'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {target === 'partner'
                  ? 'Personalize how your partner appears across your couple sanctuary'
                  : 'Select an avatar or upload your favorite portrait'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-change-photo-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Circular Preview Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-850 border border-rose-100 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={effectiveUrl}
                alt="Selected preview"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(targetName || 'Partner')}`;
                }}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-400 dark:border-rose-500 shadow-md bg-white dark:bg-slate-800"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-800">
                <Check className="w-3 h-3" />
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                Preview for {targetName}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Will sync instantly across all devices
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider">
            Live Sync
          </span>
        </div>

        {/* Picker Mode Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image Link</span>
          </button>
        </div>

        {/* Tab 1: Presets Grid */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.url)}
                    className={`relative p-2 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-2 ring-rose-400 scale-102 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-12 h-12 rounded-xl object-cover bg-white dark:bg-slate-800"
                    />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Custom Image */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-rose-200 dark:border-slate-700 hover:border-rose-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-2.5 cursor-pointer transition-colors bg-rose-50/20 dark:bg-slate-800/40 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-white">
                  Click to browse or take a photo
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, HEIC or WEBP (auto-compressed safely)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedPhotoUrl && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Custom photo ready to apply!
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-600">Compressed</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Image Web Link
              </label>
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="https://example.com/partner-photo.jpg"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Paste any HTTPS direct image URL from Unsplash, Google Photos, or your favorite gallery.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-save-photo"
            type="button"
            onClick={handleSavePhoto}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Apply & Save Picture'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
