import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { THEMES, getZodiacSign } from '../utils/coupleData';
import { compressImage } from '../utils/imageCompressor';
import { BreakRelationshipModal } from './BreakRelationshipModal';
import {
  Settings,
  Heart,
  Palette,
  User,
  Shield,
  LogOut,
  Calendar,
  Camera,
  Check,
  Moon,
  Sun,
  Briefcase,
  GraduationCap,
  Smile,
  Music,
  FileText,
  Sparkles,
  HeartCrack,
  Trash2,
  Download,
  AlertTriangle,
  QrCode,
  Share2,
  Copy,
  CheckCircle2,
  Smartphone,
  ExternalLink,
  ZoomIn,
  Edit3,
  UserCheck,
  Clock,
  Cake,
  Database,
} from 'lucide-react';
import { getLiveWorkingAppUrl } from '../utils/appUrl';
import { CoupleQRCode } from './CoupleQRCode';
import { ConnectHubModal } from './ConnectHubModal';
import { InvitationPreviewModal } from './InvitationPreviewModal';
import { InvitationData } from '../utils/invitationPdf';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { ChangePhotoModal } from './ChangePhotoModal';
import { PartnerProfileModal } from './PartnerProfileModal';
import { FeatureShowcaseModal } from './FeatureShowcaseModal';
import { SupabaseConnectModal } from './SupabaseConnectModal';
import { isSupabaseConfigured } from '../lib/supabase';

import { ActiveTab } from '../types';

interface SettingsViewProps {
  onSetLockPin?: (pin: string | null) => void;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSetLockPin, setActiveTab }) => {
  const {
    userProfile,
    couple,
    partnerProfile,
    updateCoupleSettings,
    updateUserProfileData,
    updatePartnerProfileData,
    logout,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [showFeatureShowcase, setShowFeatureShowcase] = useState(false);

  // Settings states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [gender, setGender] = useState<string>(userProfile?.gender || 'prefer_not_to_say');
  const [petNameForPartner, setPetNameForPartner] = useState(userProfile?.petNameForPartner || 'Shoona');
  const [petNameForSelf, setPetNameForSelf] = useState(userProfile?.petNameForSelf || '');
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');
  const [occupationType, setOccupationType] = useState<'profession' | 'student' | 'creator' | 'other'>(
    userProfile?.occupationType || 'profession'
  );
  const [bio, setBio] = useState(userProfile?.bio || '');

  // Couple states
  const [coupleName, setCoupleName] = useState(couple?.coupleName || '');
  const [anniversaryDate, setAnniversaryDate] = useState(couple?.anniversaryDate || '');
  const [anniversaryTime, setAnniversaryTime] = useState(couple?.anniversaryTime || couple?.datingStartTime || '12:00');
  const [myBirthday, setMyBirthday] = useState(
    userProfile?.birthday ||
    (userProfile?.uid ? couple?.birthdays?.[userProfile.uid] : '') ||
    couple?.partner1Birthday ||
    ''
  );
  const [partnerBirthday, setPartnerBirthday] = useState(
    partnerProfile?.birthday ||
    (partnerProfile?.uid ? couple?.birthdays?.[partnerProfile.uid] : '') ||
    couple?.birthdays?.['partner'] ||
    couple?.partner2Birthday ||
    ''
  );
  const [relationshipStatus, setRelationshipStatus] = useState(couple?.relationshipStatus || 'in_relationship');
  const [relationshipStory, setRelationshipStory] = useState(couple?.relationshipStory || '');
  const [favoriteSong, setFavoriteSong] = useState(couple?.favoriteSong || '');
  const [selectedTheme, setSelectedTheme] = useState(couple?.theme || 'rose');
  const [pinCode, setPinCode] = useState(couple?.pinLock || '');
  const [enablePin, setEnablePin] = useState(!!couple?.pinLock);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isExportingArchive, setIsExportingArchive] = useState(false);
  const [copiedLiveUrl, setCopiedLiveUrl] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [showConnectHub, setShowConnectHub] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    userName: string;
    isPartner: boolean;
  }>({
    isOpen: false,
    imageUrl: '',
    userName: '',
    isPartner: false,
  });
  const [changePhotoData, setChangePhotoData] = useState<{
    isOpen: boolean;
    target: 'user' | 'partner';
    targetName: string;
    currentPhotoUrl: string;
  }>({
    isOpen: false,
    target: 'user',
    targetName: '',
    currentPhotoUrl: '',
  });
  const { downloadCoupleArchive } = useAuth();

  const liveWorkingUrl = couple?.pairCode
    ? getLiveWorkingAppUrl(couple.pairCode)
    : getLiveWorkingAppUrl();

  const handleCopyLiveUrl = () => {
    navigator.clipboard.writeText(liveWorkingUrl);
    setCopiedLiveUrl(true);
    setTimeout(() => setCopiedLiveUrl(false), 2000);
  };

  const handleShareLiveUrl = async () => {
    const shareText = couple?.pairCode
      ? `Hey sweetheart! ❤️ Open our private couple sanctuary on ShoonaConnect: ${liveWorkingUrl} (Code: ${couple.pairCode})`
      : `Hey sweetheart! ❤️ Open our private couple sanctuary on ShoonaConnect: ${liveWorkingUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ShoonaConnect Couple Sanctuary',
          text: shareText,
          url: liveWorkingUrl,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleExportArchive = async () => {
    setIsExportingArchive(true);
    try {
      await downloadCoupleArchive();
    } catch (err) {
      console.error('Failed to export memory archive:', err);
    } finally {
      setIsExportingArchive(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const currentBirthdays = { ...(couple?.birthdays || {}) };
      if (userProfile?.uid && myBirthday) {
        currentBirthdays[userProfile.uid] = myBirthday;
      }
      if (partnerBirthday) {
        if (partnerProfile?.uid) {
          currentBirthdays[partnerProfile.uid] = partnerBirthday;
        }
        currentBirthdays['partner'] = partnerBirthday;
      }

      await updateCoupleSettings({
        coupleName: coupleName.trim(),
        anniversaryDate,
        anniversaryTime,
        datingStartDate: anniversaryDate,
        datingStartTime: anniversaryTime,
        partner1Birthday: myBirthday,
        partner2Birthday: partnerBirthday,
        birthdays: currentBirthdays,
        relationshipStatus: relationshipStatus as any,
        relationshipStory: relationshipStory.trim(),
        favoriteSong: favoriteSong.trim(),
        theme: selectedTheme,
        pinLock: enablePin && pinCode.trim().length === 4 ? pinCode.trim() : null,
      });

      await updateUserProfileData({
        displayName: displayName.trim(),
        nickname: nickname.trim(),
        gender: gender as any,
        petNameForPartner: petNameForPartner.trim() || '',
        petNameForSelf: petNameForSelf.trim() || '',
        occupation: occupation.trim(),
        occupationType,
        bio: bio.trim(),
        birthday: myBirthday,
      });

      if (partnerBirthday && partnerProfile?.uid) {
        try {
          await updatePartnerProfileData({ birthday: partnerBirthday });
        } catch {
          // ignore if partner profile not initialized
        }
      }

      if (onSetLockPin) {
        onSetLockPin(enablePin && pinCode.trim().length === 4 ? pinCode.trim() : null);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 400, 0.85);
      await updateUserProfileData({
        photoURL: compressed,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-28 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2 font-display">
            <Settings className="w-6 h-6 text-rose-500" />
            Settings & Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your profile, relationship questions, appearance, and privacy passcode.
          </p>
        </div>

        {/* Action Quick Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowFeatureShowcase(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 border border-rose-200 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:scale-105 hover:from-rose-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Tour Features</span>
          </button>
          
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold hover:border-rose-300 transition-all cursor-pointer shadow-xs"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-500" />}
            <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Live Working Website Link & Multi-Device Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-cyan-50/30 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 rounded-3xl p-6 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Live Working Link for Other Phone
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live & Public
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Open this public link on any smartphone, iPhone, Android, or tablet without access restrictions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowQrCode(!showQrCode)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{showQrCode ? 'Hide QR' : 'Show QR'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareLiveUrl}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* URL Input with Copy Action */}
        <div className="flex items-center gap-2">
          <input
            id="settings-live-url-input"
            type="text"
            readOnly
            value={liveWorkingUrl}
            className="flex-1 px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 rounded-xl font-mono text-slate-700 dark:text-slate-300 select-all focus:outline-none"
          />
          <button
            id="btn-settings-copy-live-url"
            type="button"
            onClick={handleCopyLiveUrl}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            {copiedLiveUrl ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLiveUrl ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Expandable QR Code */}
        {showQrCode && (
          <div className="p-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-emerald-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
              Scan with camera on any other phone to open instantly:
            </p>
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <CoupleQRCode value={liveWorkingUrl} size={180} colorDark="#059669" />
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {liveWorkingUrl}
            </p>
          </div>
        )}

        {/* 10 Ways to Connect & Luxury PDF Invitation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowConnectHub(true)}
            className="p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>10 Ways to Share / Connect</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="p-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Download Luxury PDF Invite</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        
        {/* User Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-rose-500" />
              Your Profile
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLightboxData({
                    isOpen: true,
                    imageUrl: userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`,
                    userName: userProfile?.displayName || 'Me',
                    isPartner: false,
                  })
                }
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
                <span>View Full Photo</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setChangePhotoData({
                    isOpen: true,
                    target: 'user',
                    targetName: userProfile?.displayName || 'Me',
                    currentPhotoUrl: userProfile?.photoURL || '',
                  })
                }
                className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change Photo</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative group mx-auto sm:mx-0">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`}
                alt="Profile"
                referrerPolicy="no-referrer"
                onClick={() =>
                  setLightboxData({
                    isOpen: true,
                    imageUrl: userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`,
                    userName: userProfile?.displayName || 'Me',
                    isPartner: false,
                  })
                }
                className="w-18 h-18 rounded-full object-cover border-2 border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-slate-800 cursor-pointer group-hover:opacity-90 transition-opacity"
              />
              <button
                type="button"
                onClick={() =>
                  setChangePhotoData({
                    isOpen: true,
                    target: 'user',
                    targetName: userProfile?.displayName || 'Me',
                    currentPhotoUrl: userProfile?.photoURL || '',
                  })
                }
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-rose-500" />
                    Your Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Honey, Babe"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              {/* Gender & Identity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Gender / Identity
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'female', label: 'Female 👩' },
                    { id: 'male', label: 'Male 👨' },
                    { id: 'non_binary', label: 'Non-Binary 🌈' },
                    { id: 'prefer_not_to_say', label: 'Private ✨' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        gender === g.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Names Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pet name you call your partner 💕
                  </label>
                  <input
                    type="text"
                    value={petNameForPartner}
                    onChange={(e) => setPetNameForPartner(e.target.value)}
                    placeholder="e.g. Shoona, Baby, Jaanu, Babu, Princess..."
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Will show on Home Page: "YOURS ({petNameForPartner || 'Shoona'})"
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pet name you love being called ✨
                  </label>
                  <input
                    type="text"
                    value={petNameForSelf}
                    onChange={(e) => setPetNameForSelf(e.target.value)}
                    placeholder="e.g. Sweetie, Prince, Teddy..."
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your personal preferred pet name
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What You Do
                  </label>
                  <div className="flex gap-2 mb-1.5">
                    <button
                      type="button"
                      onClick={() => setOccupationType('profession')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                        occupationType === 'profession'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Briefcase className="w-3 h-3" /> Work
                    </button>
                    <button
                      type="button"
                      onClick={() => setOccupationType('student')}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                        occupationType === 'student'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <GraduationCap className="w-3 h-3" /> Student
                    </button>
                  </div>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder={occupationType === 'student' ? 'e.g. Medical Student' : 'e.g. Product Designer'}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Short Bio / Note
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="A little note about you..."
                    className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                Connected Google Account: <span className="font-mono text-slate-600 dark:text-slate-300">{userProfile?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Profile & Photo Management Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-pink-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              Partner's Profile & Picture
            </h3>
            {partnerProfile && (
              <button
                type="button"
                onClick={() => setShowPartnerModal(true)}
                className="px-2.5 py-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                <span>View Full Info</span>
              </button>
            )}
          </div>

          {partnerProfile ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative group mx-auto sm:mx-0">
                <img
                  src={partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`}
                  alt={partnerProfile?.displayName || 'Partner'}
                  referrerPolicy="no-referrer"
                  onClick={() =>
                    setLightboxData({
                      isOpen: true,
                      imageUrl: partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`,
                      userName: partnerProfile?.displayName || 'Partner',
                      isPartner: true,
                    })
                  }
                  className="w-18 h-18 rounded-full object-cover border-2 border-pink-200 dark:border-pink-900 bg-pink-50 dark:bg-slate-800 cursor-pointer group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLightboxData({
                      isOpen: true,
                      imageUrl: partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`,
                      userName: partnerProfile?.displayName || 'Partner',
                      isPartner: true,
                    })
                  }
                  className="absolute inset-0 bg-black/35 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Click to view & download full photo"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>{partnerProfile.displayName}</span>
                      {partnerProfile.nickname && (
                        <span className="text-xs font-normal text-pink-500 font-serif italic">
                          "{partnerProfile.nickname}"
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {partnerProfile.occupation || 'Your Partner in Life'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxData({
                          isOpen: true,
                          imageUrl: partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`,
                          userName: partnerProfile?.displayName || 'Partner',
                          isPartner: true,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-300 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-pink-500" />
                      <span>View & Download Picture</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setChangePhotoData({
                          isOpen: true,
                          target: 'partner',
                          targetName: partnerProfile?.displayName || 'Partner',
                          currentPhotoUrl: partnerProfile?.photoURL || '',
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Partner's Picture</span>
                    </button>
                  </div>
                </div>

                {partnerProfile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-pink-50/50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-pink-100/50 dark:border-slate-700/50">
                    "{partnerProfile.bio}"
                  </p>
                )}

                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Partner's Account: <span className="font-mono text-slate-600 dark:text-slate-300">{partnerProfile.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500">
              <Heart className="w-8 h-8 mx-auto text-pink-300 dark:text-slate-600 mb-2 animate-pulse" />
              <p className="text-xs font-medium">Waiting for your partner to join with your couple code.</p>
              <p className="text-[11px] text-slate-400 mt-1">Once joined, you will be able to see their full profile, photo, download it, or update it together!</p>
            </div>
          )}
        </div>

        {/* Relationship Questions & Couple Space Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Our Relationship Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Couple Space Name
              </label>
              <input
                type="text"
                value={coupleName}
                onChange={(e) => setCoupleName(e.target.value)}
                placeholder="e.g. Alex & Taylor's Space"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                Anniversary / Dating Date
              </label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Exact Dating Start Time
              </label>
              <input
                type="time"
                value={anniversaryTime}
                onChange={(e) => setAnniversaryTime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Couple Birthdays & Zodiac Alignment */}
          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-pink-500" />
                Couple Birthdays & Zodiac Alignment
              </span>
              <span className="text-[10px] text-slate-400">Syncs to Home Sanctuary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Your Birthday ({displayName || 'You'})
                  </label>
                  {myBirthday && (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {getZodiacSign(myBirthday).symbol} {getZodiacSign(myBirthday).sign}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={myBirthday}
                  onChange={(e) => setMyBirthday(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Partner's Birthday ({partnerProfile?.displayName || 'Partner'})
                  </label>
                  {partnerBirthday && (
                    <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400">
                      {getZodiacSign(partnerBirthday).symbol} {getZodiacSign(partnerBirthday).sign}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={partnerBirthday}
                  onChange={(e) => setPartnerBirthday(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Relationship Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'dating', label: 'Dating' },
                { id: 'in_relationship', label: 'Relationship' },
                { id: 'engaged', label: 'Engaged' },
                { id: 'married', label: 'Married' },
                { id: 'long_distance', label: 'Long Distance' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRelationshipStatus(item.id as any)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    relationshipStatus === item.id
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                About Our Relationship / How We Met
              </label>
              <textarea
                rows={2}
                value={relationshipStory}
                onChange={(e) => setRelationshipStory(e.target.value)}
                placeholder="Share your sweet story..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Music className="w-3.5 h-3.5 text-rose-500" />
                Our Couple Song
              </label>
              <input
                type="text"
                value={favoriteSong}
                onChange={(e) => setFavoriteSong(e.target.value)}
                placeholder="e.g. Perfect - Ed Sheeran"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* Connected partner badge */}
          <div className="p-3.5 bg-rose-50/60 dark:bg-slate-800/60 rounded-2xl border border-rose-100 dark:border-slate-700 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between">
            <div>
              <span className="font-bold block">Connected Partner:</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {partnerProfile?.displayName || 'Soulmate'} {partnerProfile?.nickname ? `("${partnerProfile.nickname}")` : ''}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold">
              Connected & Private
            </span>
          </div>
        </div>

        {/* Romantic Theme Palette */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-rose-500" />
              Sanctuary Color Theme
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">8 Visual Styles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(THEMES).map(([key, t]) => {
              const isSelected = selectedTheme === key;
              const isNew = ['velvet_noir', 'celestial_aurora', 'cherry_blossom'].includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedTheme(key as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-500 scale-102 shadow-xs bg-rose-50/20 dark:bg-slate-800/80'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-slate-50/30 dark:bg-slate-800/30'
                  }`}
                >
                  {isNew && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-[9px] font-black text-white uppercase tracking-wider">
                      New
                    </span>
                  )}
                  <div className={`w-full h-9 rounded-xl bg-gradient-to-r ${t.gradient} mb-2 shadow-inner`} />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{t.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5 font-sans">{t.accent}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4-Digit Passcode PIN Security */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-100 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">4-Digit Passcode Lock</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Require a 4-digit code to open your space
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enablePin}
              onChange={(e) => setEnablePin(e.target.checked)}
              className="w-5 h-5 text-rose-500 rounded cursor-pointer"
            />
          </div>

          {enablePin && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter 4-Digit Passcode
              </label>
              <input
                type="password"
                maxLength={4}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-36 px-3 py-2 text-center tracking-widest text-xl font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            id="btn-save-settings"
            type="submit"
            disabled={saving}
            className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              'Saving Changes...'
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Details Saved Successfully!
              </>
            ) : (
              'Save All Changes'
            )}
          </button>
        </div>
      </form>

      {/* Feature Showcase & Security Guide Link */}
      {setActiveTab && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-rose-200/70 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Website Feature Showcase & Encryption Guide
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View visual mockups, privacy architecture, interactive sandbox, and best usage tips.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className="px-4 py-2 bg-white dark:bg-slate-700 border border-rose-200 dark:border-slate-600 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-all cursor-pointer shadow-xs"
          >
            Explore Showcase
          </button>
        </div>
      )}

      {/* Supabase Database Connection Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50/70 to-teal-50/50 dark:from-slate-900 dark:to-slate-800 border border-emerald-200/70 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Supabase Database Connection
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
              isSupabaseConfigured
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
            }`}>
              {isSupabaseConfigured ? 'Active & Storing All Data' : 'Action Required'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Signups, logins, profiles, chat messages, and shared memories are stored in your Supabase backend.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSupabaseModal(true)}
          className="px-4 py-2 bg-white dark:bg-slate-700 border border-emerald-200 dark:border-slate-600 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          Database Settings
        </button>
      </div>

      {/* Danger Zone: Break Relationship & Data Purge */}
      {couple && (
        <div
          id="danger-zone-break-relationship"
          className="p-6 rounded-3xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-inner">
                <HeartCrack className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-300">
                    Danger Zone: Break Relationship
                  </h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900/70 text-red-800 dark:text-red-300 font-bold">
                    Two-Sided Destruction
                  </span>
                </div>
                <p className="text-xs text-red-700/85 dark:text-red-300/75 max-w-xl leading-relaxed">
                  Permanently sever this connection on both accounts. Wipes all shared chat history, photos, love letters, shared notes, and couple milestones from cloud servers with zero recovery possible.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              id="btn-open-break-modal"
              type="button"
              onClick={() => setIsBreakModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Break Relationship & Purge Data</span>
            </button>

            <button
              id="btn-download-archive-settings"
              type="button"
              onClick={handleExportArchive}
              disabled={isExportingArchive}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>{isExportingArchive ? 'Generating Archive...' : 'Download Memory Archive (.JSON)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Break Relationship Modal */}
      <BreakRelationshipModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
      />

      {/* 10 Ways Connect Hub Modal */}
      {showConnectHub && (
        <ConnectHubModal
          isOpen={showConnectHub}
          onClose={() => setShowConnectHub(false)}
          pairCode={couple?.pairCode || 'LOVE'}
          coupleName={couple?.coupleName || 'Our Private Sanctuary'}
          creatorName={displayName || userProfile?.displayName || 'Your Partner'}
          creatorNickname={nickname || userProfile?.nickname}
          anniversaryDate={couple?.anniversaryDate}
          appUrl={liveWorkingUrl}
        />
      )}

      {/* Luxury PDF & Invitation Card Modal */}
      {showPdfModal && (
        <InvitationPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          data={{
            coupleName: couple?.coupleName || 'Our Private Sanctuary',
            creatorName: displayName || userProfile?.displayName || 'Your Partner',
            creatorNickname: nickname || userProfile?.nickname,
            pairCode: couple?.pairCode || 'LOVE',
            appUrl: liveWorkingUrl,
            anniversaryDate: couple?.anniversaryDate,
            theme: selectedTheme as any,
          }}
        />
      )}

      {/* Partner Profile Modal */}
      <PartnerProfileModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        setActiveTab={setActiveTab}
      />

      {/* High-Res Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        userName={lightboxData.userName}
        isPartner={lightboxData.isPartner}
        onChangePhoto={() => {
          setLightboxData((prev) => ({ ...prev, isOpen: false }));
          setChangePhotoData({
            isOpen: true,
            target: lightboxData.isPartner ? 'partner' : 'user',
            targetName: lightboxData.userName,
            currentPhotoUrl: lightboxData.imageUrl,
          });
        }}
      />

      {/* Change Photo Modal */}
      <ChangePhotoModal
        isOpen={changePhotoData.isOpen}
        onClose={() => setChangePhotoData((prev) => ({ ...prev, isOpen: false }))}
        target={changePhotoData.target}
        targetName={changePhotoData.targetName}
        currentPhotoUrl={changePhotoData.currentPhotoUrl}
      />

      {/* Supabase Connection Setup Modal */}
      <SupabaseConnectModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />

      {/* Sign Out Card */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Private Couple Sanctuary • Strictly Isolated for 2
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
      {/* Feature Showcase Tour */}
      {showFeatureShowcase && (
        <FeatureShowcaseModal
          isOpen={showFeatureShowcase}
          onClose={() => setShowFeatureShowcase(false)}
          activeTheme={(couple?.theme as any) || 'rose'}
        />
      )}
    </div>
  );
};
