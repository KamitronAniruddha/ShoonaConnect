import React, { useState } from 'react';
import {
  X,
  Heart,
  Download,
  Camera,
  ZoomIn,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  MessageCircle,
  Edit3,
  Check,
  Calendar,
  Smile,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateDaysTogether, formatTimeAgo } from '../utils/coupleData';
import { downloadProfilePhoto } from '../utils/imageDownload';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { ChangePhotoModal } from './ChangePhotoModal';
import { ActiveTab } from '../types';
import { usePresence } from '../hooks/usePresence';

interface PartnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
}

const LOVE_LANG_GUIDES: Record<string, { label: string; icon: string; guide: string; desc: string }> = {
  words_of_affirmation: {
    label: 'Words of Affirmation',
    icon: '💬',
    desc: 'Thrives on verbal compliments, appreciation, and sweet messages.',
    guide: 'Send random "I love you" texts, leave voice notes, and express why you are proud of them.',
  },
  quality_time: {
    label: 'Quality Time',
    icon: '⏳',
    desc: 'Cherishes undivided attention and meaningful conversations without distractions.',
    guide: 'Plan uninterrupted date nights, go on walks together, and listen actively without phones.',
  },
  receiving_gifts: {
    label: 'Receiving Gifts',
    icon: '🎁',
    desc: 'Values visual symbols of love and thoughtfulness, big or small.',
    guide: 'Surprise them with their favorite snacks, souvenirs, handwritten cards, or flowers.',
  },
  acts_of_service: {
    label: 'Acts of Service',
    icon: '🤝',
    desc: 'Feels cherished when you ease their burden through helpful actions.',
    guide: 'Help with daily chores, make them tea/coffee when busy, or solve stressful tasks for them.',
  },
  physical_touch: {
    label: 'Physical Touch',
    icon: '🫂',
    desc: 'Loves emotional closeness through warm physical connection.',
    guide: 'Give warm morning hugs, hold hands while walking, and cuddle during movies.',
  },
};

export const PartnerProfileModal: React.FC<PartnerProfileModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const { partnerProfile, userProfile, couple, updatePartnerProfileData } = useAuth();
  const [showLightbox, setShowLightbox] = useState(false);
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Edit custom nickname & romantic note state
  const [isEditingCustomInfo, setIsEditingCustomInfo] = useState(false);
  const [editNickname, setEditNickname] = useState(partnerProfile?.nickname || '');
  const [editBio, setEditBio] = useState(partnerProfile?.bio || '');
  const [savingCustom, setSavingCustom] = useState(false);

  const { isPartnerOnline, partnerStatusText } = usePresence({
    coupleId: couple?.id,
    myUid: userProfile?.uid,
    partnerUid: partnerProfile?.uid,
  });

  if (!isOpen) return null;

  const partnerName = partnerProfile?.displayName || 'My Soulmate';
  const partnerNickname = partnerProfile?.nickname || '';
  const photoUrl =
    partnerProfile?.photoURL ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(partnerName)}`;

  const daysTogether = calculateDaysTogether(couple?.anniversaryDate);
  const loveLangKey = partnerProfile?.loveLanguage || 'quality_time';
  const loveLangInfo = LOVE_LANG_GUIDES[loveLangKey] || LOVE_LANG_GUIDES.quality_time;

  const handleDownloadPhoto = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const filename = `${partnerName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-photo.png`;
      const success = await downloadProfilePhoto(photoUrl, filename);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveCustomPartnerInfo = async () => {
    setSavingCustom(true);
    try {
      await updatePartnerProfileData({
        nickname: editNickname.trim() || undefined,
        bio: editBio.trim() || undefined,
      });
      setIsEditingCustomInfo(false);
    } catch (err) {
      console.error('Failed to update partner custom info:', err);
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <>
      <div
        id="partner-profile-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-45 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-rose-100 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 relative my-8"
        >
          {/* Romantic Banner Header */}
          <div className="relative h-28 sm:h-32 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 p-4 flex items-start justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Partner Profile
              </span>
            </div>

            <button
              id="btn-close-partner-profile-modal"
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-xs transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 pb-6 pt-0 space-y-6 relative">
            {/* Avatar & Key Profile Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16">
              <div className="relative group">
                <img
                  src={photoUrl}
                  alt={partnerName}
                  referrerPolicy="no-referrer"
                  onClick={() => setShowLightbox(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-white dark:border-slate-900 object-cover bg-rose-50 dark:bg-slate-800 shadow-xl cursor-pointer group-hover:scale-103 transition-transform"
                />

                {/* Click to zoom badge */}
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  title="View Full Picture"
                  className="absolute inset-0 bg-black/30 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>

                {/* Online / Active status beacon */}
                <span
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-sm ${
                    isPartnerOnline ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-slate-400'
                  }`}
                  title={partnerStatusText}
                >
                  <Heart className="w-3 h-3 fill-white" />
                </span>
              </div>

              {/* Photo Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <button
                  id="btn-view-full-partner-photo"
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-rose-500" />
                  <span>View Full Photo</span>
                </button>

                <button
                  id="btn-download-partner-photo"
                  type="button"
                  onClick={handleDownloadPhoto}
                  disabled={downloading}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {downloadSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-purple-500" />
                  )}
                  <span>{downloadSuccess ? 'Downloaded!' : 'Download'}</span>
                </button>

                <button
                  id="btn-change-partner-photo"
                  type="button"
                  onClick={() => setShowChangePhoto(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-200 dark:shadow-none"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Picture</span>
                </button>
              </div>
            </div>

            {/* Names, Status & Taglines */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-800 dark:text-white tracking-tight">
                  {partnerName}
                </h2>
                {userProfile?.petNameForPartner && (
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300 text-xs font-bold">
                    You call {partnerProfile?.gender === 'male' ? 'him' : partnerProfile?.gender === 'non_binary' ? 'them' : 'her'} &quot;{userProfile.petNameForPartner}&quot; 💕
                  </span>
                )}
                {partnerNickname && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 text-xs font-bold">
                    &quot;{partnerNickname}&quot;
                  </span>
                )}
                {partnerProfile?.gender && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[11px] font-medium">
                    {partnerProfile.gender === 'female' ? '👩 Female' : partnerProfile.gender === 'male' ? '👨 Male' : partnerProfile.gender === 'non_binary' ? '🌈 Non-Binary' : '✨ Other'}
                  </span>
                )}
                {partnerProfile?.pronouns && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                    {partnerProfile.pronouns}
                  </span>
                )}
              </div>

              {/* Real-time Online / Offline status badge */}
              <div className="flex items-center justify-center sm:justify-start">
                {isPartnerOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online Right Now • In Sanctuary
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    {partnerStatusText}
                  </span>
                )}
              </div>

              {/* Location & Occupation Meta */}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap justify-center sm:justify-start pt-1">
                {partnerProfile?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{partnerProfile.city}</span>
                  </span>
                )}
                {partnerProfile?.occupation && (
                  <span className="flex items-center gap-1">
                    {partnerProfile.occupationType === 'student' ? (
                      <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    ) : (
                      <Briefcase className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                    <span>{partnerProfile.occupation}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>Day {daysTogether} in Love</span>
                </span>
              </div>
            </div>

            {/* Partner Bio / Romantic Note */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bio & Sweet Note
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingCustomInfo(!isEditingCustomInfo);
                    setEditNickname(partnerProfile?.nickname || '');
                    setEditBio(partnerProfile?.bio || '');
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingCustomInfo ? 'Cancel' : 'Edit Note'}</span>
                </button>
              </div>

              {isEditingCustomInfo ? (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Romantic Nickname for Partner
                    </label>
                    <input
                      type="text"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="e.g. My Honey, Sweetheart, Bunny"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Special Note About Them
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Add a romantic note or reminder about them..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCustomPartnerInfo}
                    disabled={savingCustom}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingCustom ? 'Saving...' : 'Save Details'}</span>
                  </button>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
                  {partnerProfile?.bio ? `"${partnerProfile.bio}"` : '"The sweetest soul in my life."'}
                </p>
              )}
            </div>

            {/* Love Language Section with Guide */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 via-pink-50/30 to-rose-50/40 dark:from-slate-800/80 dark:to-slate-850 border border-purple-100 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <span>{loveLangInfo.icon}</span>
                  Love Language: {loveLangInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {loveLangInfo.desc}
              </p>
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-purple-100 dark:border-slate-700 text-[11px] text-purple-900 dark:text-purple-200">
                <strong className="font-bold">💡 How to love them best:</strong> {loveLangInfo.guide}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center gap-3 pt-2">
              {setActiveTab && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveTab('chat');
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-200 dark:shadow-none transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Love Message</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        imageUrl={photoUrl}
        userName={partnerName}
        isPartner={true}
        onChangePhoto={() => setShowChangePhoto(true)}
      />

      {/* Change Photo Modal for Partner */}
      <ChangePhotoModal
        isOpen={showChangePhoto}
        onClose={() => setShowChangePhoto(false)}
        target="partner"
        targetName={partnerName}
        currentPhotoUrl={photoUrl}
      />
    </>
  );
};
