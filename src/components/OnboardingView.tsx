import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  Users,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Calendar,
  Briefcase,
  GraduationCap,
  Music,
  Smile,
  LogOut,
  Moon,
  Sun,
  QrCode,
  Share2,
  MapPin,
  Camera,
  RefreshCw,
  Palette,
  ShieldCheck,
  CheckCircle2,
  CalendarHeart,
  Sparkle,
  FileText,
  Send,
  MessageCircle,
  Download,
  UserCheck,
  UserX,
  BellRing,
  Clock,
  ShieldAlert,
  HeartHandshake,
  XCircle,
  Radio,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Couple } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { PinInput4 } from './PinInput4';
import { CoupleQRCode } from './CoupleQRCode';
import { getLiveWorkingAppUrl } from '../utils/appUrl';
import { ConnectHubModal } from './ConnectHubModal';
import { InvitationPreviewModal } from './InvitationPreviewModal';
import { PhotoLightboxModal } from './PhotoLightboxModal';
import { FeatureShowcaseModal } from './FeatureShowcaseModal';
import { InvitationData } from '../utils/invitationPdf';
import { ZoomIn } from 'lucide-react';
import { supabase, createSafeChannel } from '../lib/supabase';
import { motion } from 'motion/react';

// Curated avatar presets with high aesthetic appeal
const AVATAR_PRESETS = [
  { id: 'notion-felix', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffe4e6', label: 'Felix' },
  { id: 'notion-aria', url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aria&backgroundColor=ffedd5', label: 'Aria' },
  { id: 'adventurer-luna', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=fce7f3', label: 'Luna' },
  { id: 'adventurer-jasper', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=e0f2fe', label: 'Jasper' },
  { id: 'lorelei-bella', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bella&backgroundColor=f3e8ff', label: 'Bella' },
  { id: 'lorelei-leo', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Leo&backgroundColor=dcfce7', label: 'Leo' },
  { id: 'micah-milo', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Milo&backgroundColor=fef3c7', label: 'Milo' },
  { id: 'bottts-cupid', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cupid&backgroundColor=ffe4e6', label: 'Cupid' },
];

const LOVE_LANGUAGES = [
  { id: 'words_of_affirmation', label: 'Words of Affirmation', icon: '💬', desc: 'Affirming texts, praise & sweet words' },
  { id: 'quality_time', label: 'Quality Time', icon: '⏳', desc: 'Uninterrupted presence & shared moments' },
  { id: 'receiving_gifts', label: 'Receiving Gifts', icon: '🎁', desc: 'Thoughtful surprises & heartfelt tokens' },
  { id: 'acts_of_service', label: 'Acts of Service', icon: '🤝', desc: 'Actions that ease stress & show care' },
  { id: 'physical_touch', label: 'Physical Touch', icon: '🫂', desc: 'Warm hugs, holding hands & close warmth' },
];

const SONG_SUGGESTIONS = [
  'Lover - Taylor Swift',
  'Until I Found You - Stephen Sanchez',
  'Perfect - Ed Sheeran',
  'Golden Hour - JVKE',
  'Die With A Smile - Bruno Mars',
  'Can’t Help Falling in Love - Elvis Presley',
];

const SANCTUARY_THEMES = [
  { id: 'rose', name: 'Rose Romance', color: 'from-rose-500 to-pink-500', hex: '#f43f5e' },
  { id: 'sunset', name: 'Sunset Glow', color: 'from-amber-500 to-rose-500', hex: '#f59e0b' },
  { id: 'midnight', name: 'Midnight Starlight', color: 'from-indigo-600 to-purple-900', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald Haven', color: 'from-emerald-600 to-teal-600', hex: '#059669' },
  { id: 'lavender', name: 'Lavender Mist', color: 'from-purple-500 to-pink-500', hex: '#a855f7' },
];

export const OnboardingView: React.FC = () => {
  const {
    currentUser,
    userProfile,
    couple,
    createCouple,
    findCoupleByCode,
    requestToJoinCouple,
    approveJoinRequest,
    declineJoinRequest,
    cancelJoinRequest,
    confirmPairCouple,
    cancelPendingCouple,
    logout,
    updateUserProfileData,
    pastRelationships,
    loadingPastRelationships,
    refreshPastRelationships,
    restoreRelationship,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const isPendingCouple = couple?.status === 'pending';
  const isHostWaiting = Boolean(isPendingCouple && couple?.creatorId === currentUser?.uid);
  const incomingJoinRequest = Boolean(isHostWaiting && couple?.pendingJoinRequest && couple.pendingJoinRequest.status === 'pending')
    ? couple?.pendingJoinRequest
    : null;
  const isRequesterWaiting = Boolean(isPendingCouple && couple?.pendingJoinRequest?.requesterId === currentUser?.uid);
  const isRequestDeclined = Boolean(isRequesterWaiting && couple?.pendingJoinRequest?.status === 'declined');

  // Check URL params or saved storage for instant invite code
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('pairCode') || urlParams.get('code');
      if (code && code.trim().length === 4) return code.trim().toUpperCase();
      const stored = localStorage.getItem('shoona_pending_pair_code');
      if (stored && stored.trim().length === 4) return stored.trim().toUpperCase();
    }
    return null;
  });

  // Steps: 'profile' -> 'connection_choice' -> 'create_sanctuary' -> 'create_code' OR 'join_code'
  const [step, setStep] = useState<
    'profile' | 'connection_choice' | 'create_sanctuary' | 'create_code' | 'join_code'
  >(isPendingCouple ? 'connection_choice' : 'profile');

  // Step 1: Personal Persona & Avatar Studio
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [photoURL, setPhotoURL] = useState(
    userProfile?.photoURL || AVATAR_PRESETS[0].url
  );
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [occupationType, setOccupationType] = useState<'profession' | 'student' | 'creator' | 'other'>(
    userProfile?.occupationType || 'profession'
  );
  const [occupation, setOccupation] = useState(userProfile?.occupation || '');
  const [gender, setGender] = useState<string>(userProfile?.gender || 'prefer_not_to_say');
  const [petNameForPartner, setPetNameForPartner] = useState(userProfile?.petNameForPartner || 'Shoona');
  const [petNameForSelf, setPetNameForSelf] = useState(userProfile?.petNameForSelf || '');
  const [pronouns, setPronouns] = useState(userProfile?.pronouns || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [loveLanguage, setLoveLanguage] = useState<any>(userProfile?.loveLanguage || 'quality_time');
  const [bio, setBio] = useState(userProfile?.bio || '');

  // Step 2 (Creator Only): Relationship Details & Sanctuary Vibe
  const [relationshipStatus, setRelationshipStatus] = useState<
    'dating' | 'in_relationship' | 'engaged' | 'married' | 'long_distance'
  >('in_relationship');
  const [anniversaryDate, setAnniversaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [coupleName, setCoupleName] = useState('');
  const [relationshipStory, setRelationshipStory] = useState('');
  const [favoriteSong, setFavoriteSong] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'rose' | 'sunset' | 'midnight' | 'emerald' | 'lavender'>('rose');
  const [enablePinLock, setEnablePinLock] = useState(false);
  const [pinLockCode, setPinLockCode] = useState('');

  // Step 3: Pairing Codes, Modals & QR
  const [custom4DigitCode, setCustom4DigitCode] = useState('');
  const [join4DigitCode, setJoin4DigitCode] = useState(pendingInviteCode || '');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showConnectHub, setShowConnectHub] = useState(false);
  const [showPdfInvitation, setShowPdfInvitation] = useState(false);
  const [showFeatureShowcase, setShowFeatureShowcase] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancellingPending, setIsCancellingPending] = useState(false);

  // Found partner preview with full couple data
  const [foundPartner, setFoundPartner] = useState<{
    coupleId: string;
    profile: UserProfile | null;
    coupleName?: string;
    coupleData?: Couple;
  } | null>(null);

  // Photo lightbox modal state
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  // Past Relationship Messaging & Reconnection State
  const [selectedPastCoupleForChat, setSelectedPastCoupleForChat] = useState<Couple | null>(null);
  const [expandedTimelines, setExpandedTimelines] = useState<Record<string, boolean>>({});
  const [pastMessages, setPastMessages] = useState<any[]>([]);
  const [loadingPastMessages, setLoadingPastMessages] = useState(false);
  const [pastInputText, setPastInputText] = useState('');
  const [isSendingPastMessage, setIsSendingPastMessage] = useState(false);
  const [reconnectError, setReconnectError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const pastChatEndRef = useRef<HTMLDivElement>(null);

  // Load and subscribe to past messages
  useEffect(() => {
    if (!selectedPastCoupleForChat) {
      setPastMessages([]);
      return;
    }

    const fetchPastMsgs = async () => {
      setLoadingPastMessages(true);
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', selectedPastCoupleForChat.id)
        .order('created_at', { ascending: true });

      if (!err && data) {
        setPastMessages(data);
      }
      setLoadingPastMessages(false);
      setTimeout(() => pastChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    fetchPastMsgs();

    const channel = createSafeChannel(`past_messages_onboarding:${selectedPastCoupleForChat.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `couple_id=eq.${selectedPastCoupleForChat.id}` },
        (payload) => {
          if (payload.new) {
            setPastMessages((prev) => {
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            setTimeout(() => pastChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPastCoupleForChat]);

  const handleSendPastMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPastCoupleForChat || !pastInputText.trim() || isSendingPastMessage || !currentUser) return;

    setIsSendingPastMessage(true);
    const textToSend = pastInputText.trim();
    setPastInputText('');

    try {
      const { error: sendErr } = await supabase.from('messages').insert({
        couple_id: selectedPastCoupleForChat.id,
        sender_id: currentUser.uid,
        sender_name: userProfile?.nickname || userProfile?.displayName || 'Me',
        sender_photo: userProfile?.photoURL,
        text: textToSend,
        type: 'text',
        created_at: new Date().toISOString()
      });

      if (sendErr) {
        console.error('Failed to send past relationship message:', sendErr);
      }
    } catch (err) {
      console.error('Error sending past relationship message:', err);
    } finally {
      setIsSendingPastMessage(false);
    }
  };

  const handleExecuteReconnect = async (pastCoupleId: string) => {
    setIsReconnecting(true);
    setReconnectError(null);
    try {
      await restoreRelationship(pastCoupleId);
      setSelectedPastCoupleForChat(null);
    } catch (err: any) {
      console.error('Failed to restore relationship:', err);
      setReconnectError(err.message || 'Failed to reconnect. Please try again.');
    } finally {
      setIsReconnecting(false);
    }
  };

  // Auto-search if code was pre-loaded
  useEffect(() => {
    if (pendingInviteCode && pendingInviteCode.length === 4) {
      setJoin4DigitCode(pendingInviteCode);
      if (userProfile?.displayName) {
        autoSearchPartner(pendingInviteCode);
      }
    }
  }, [pendingInviteCode, userProfile?.displayName]);

  // Load and refresh past relationships on mount
  useEffect(() => {
    refreshPastRelationships();
  }, []);

  // Auto-progress to connection choices if user already has profile details filled
  useEffect(() => {
    if (userProfile?.displayName && step === 'profile' && !isPendingCouple) {
      setStep('connection_choice');
    }
  }, [userProfile?.displayName, isPendingCouple]);

  // Anniversary calculations
  const calculateDaysTogether = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0) {
      const years = Math.floor(diffDays / 365.25);
      const remaining = Math.floor(diffDays % 365.25);
      const months = Math.floor(remaining / 30.44);
      const days = Math.floor(remaining % 30.44);

      let parts: string[] = [];
      if (years > 0) parts.push(`${years}y`);
      if (months > 0) parts.push(`${months}m`);
      parts.push(`${days}d`);

      return {
        isFuture: false,
        days: diffDays,
        headline: `${diffDays.toLocaleString()} Days of Love`,
        subtitle: parts.length ? `(${parts.join(' ')})` : '',
      };
    } else {
      const countdown = Math.abs(diffDays);
      return {
        isFuture: true,
        days: countdown,
        headline: `Counting Down ${countdown} Day${countdown !== 1 ? 's' : ''}`,
        subtitle: 'Until your big celebration!',
      };
    }
  };

  const daysInfo = calculateDaysTogether(anniversaryDate);

  // Photo upload handler with client-side compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setError(null);
    try {
      const compressed = await compressImage(file, 400, 0.85);
      setPhotoURL(compressed);
    } catch (err: any) {
      setError('Could not process photo. Please try a different image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Step 1 -> Next: Save profile and route intelligently
  const handleNextFromProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError('Please enter your full name or what you like to be called.');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfileData({
        displayName: displayName.trim(),
        nickname: nickname.trim() || undefined,
        gender: gender as any,
        petNameForPartner: petNameForPartner.trim() || undefined,
        petNameForSelf: petNameForSelf.trim() || undefined,
        photoURL: photoURL || undefined,
        occupation: occupation.trim() || undefined,
        occupationType,
        pronouns: pronouns.trim() || undefined,
        city: city.trim() || undefined,
        loveLanguage,
        bio: bio.trim() || undefined,
      });

      // If user came with an invite code, jump directly to join step!
      if (pendingInviteCode && pendingInviteCode.length === 4) {
        setJoin4DigitCode(pendingInviteCode);
        setStep('join_code');
        autoSearchPartner(pendingInviteCode);
      } else {
        setStep('connection_choice');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not save your profile.');
    } finally {
      setLoading(false);
    }
  };

  // Creator Sanctuary Form -> Code Setup
  const handleNextFromSanctuary = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('create_code');
  };

  // Host: Create couple with 4-digit code in Firestore
  const handleCreateWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = custom4DigitCode.trim();
    if (cleanCode && cleanCode.length !== 4) {
      setError('Please enter exactly 4 digits, or leave blank to generate a lucky code.');
      return;
    }

    setLoading(true);
    try {
      await createCouple({
        customCode: cleanCode || undefined,
        coupleName: coupleName.trim() || `${nickname || displayName || 'Our'}'s Sanctuary`,
        anniversaryDate,
        relationshipStatus,
        relationshipStory: relationshipStory.trim(),
        favoriteSong: favoriteSong.trim(),
        theme: selectedTheme,
        pinLock: enablePinLock && pinLockCode.length === 4 ? pinLockCode : null,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to create your couple space. Please try another code.');
    } finally {
      setLoading(false);
    }
  };

  // Generate lucky 4-digit code
  const handleGenerateLuckyCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setCustom4DigitCode(random);
  };

  // Auto search partner's couple
  const autoSearchPartner = async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await findCoupleByCode(code);
      setFoundPartner({
        coupleId: result.couple.id,
        profile: result.creatorProfile,
        coupleName: result.couple.coupleName,
        coupleData: result.couple,
      });
    } catch (err: any) {
      setError(err?.message || 'No active couple space found with this 4-digit code.');
      setFoundPartner(null);
    } finally {
      setLoading(false);
    }
  };

  // Search partner manually by 4-digit code
  const handleSearchCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (join4DigitCode.length !== 4) {
      setError('Please enter all 4 digits.');
      return;
    }
    await autoSearchPartner(join4DigitCode);
  };

  // Joining Partner: Send approval request to Host
  const handleSendJoinRequest = async () => {
    if (!foundPartner) return;
    setLoading(true);
    setError(null);
    try {
      const profileToSave = {
        displayName: displayName.trim() || userProfile?.displayName || 'Partner',
        nickname: nickname.trim() || undefined,
        photoURL: photoURL || userProfile?.photoURL || AVATAR_PRESETS[0].url,
        occupation: occupation.trim() || undefined,
        occupationType,
        pronouns: pronouns.trim() || undefined,
        city: city.trim() || undefined,
        loveLanguage,
        bio: bio.trim() || undefined,
      };

      await updateUserProfileData(profileToSave);
      await requestToJoinCouple(foundPartner.coupleId, profileToSave);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('shoona_pending_pair_code');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not send join request to your partner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Host: Approve partner connection request
  const handleApprovePartner = async () => {
    if (!couple?.id) return;
    setApproving(true);
    setError(null);
    try {
      await approveJoinRequest(couple.id);
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#a855f7', '#ec4899', '#f59e0b'],
      });
    } catch (err: any) {
      setError(err?.message || 'Could not approve partner connection.');
    } finally {
      setApproving(false);
    }
  };

  // Host: Decline partner connection request
  const handleDeclinePartner = async () => {
    if (!couple?.id) return;
    setDeclining(true);
    setError(null);
    try {
      await declineJoinRequest(couple.id);
    } catch (err: any) {
      setError(err?.message || 'Could not decline request.');
    } finally {
      setDeclining(false);
    }
  };

  // Requester: Cancel pending request or reset after decline
  const handleCancelJoinRequest = async () => {
    setCancellingRequest(true);
    setError(null);
    try {
      await cancelJoinRequest(couple?.id);
      setFoundPartner(null);
      setJoin4DigitCode('');
      setStep('connection_choice');
    } catch (err: any) {
      setError('Could not reset connection request.');
    } finally {
      setCancellingRequest(false);
    }
  };

  // Legacy direct pair fallback
  const handleConfirmPair = async () => {
    if (!foundPartner) return;
    setLoading(true);
    setError(null);
    try {
      await updateUserProfileData({
        displayName: displayName.trim() || userProfile?.displayName,
        nickname: nickname.trim() || undefined,
        gender: gender as any,
        petNameForPartner: petNameForPartner.trim() || undefined,
        petNameForSelf: petNameForSelf.trim() || undefined,
        photoURL: photoURL || undefined,
        occupation: occupation.trim() || undefined,
        occupationType,
        pronouns: pronouns.trim() || undefined,
        city: city.trim() || undefined,
        loveLanguage,
        bio: bio.trim() || undefined,
      });

      await confirmPairCouple(foundPartner.coupleId);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('shoona_pending_pair_code');
      }

      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af', '#a855f7', '#ec4899', '#f59e0b'],
      });
    } catch (err: any) {
      setError(err?.message || 'Could not connect to couple sanctuary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel pending space so partner can join instead
  const handleCancelPending = async () => {
    setIsCancellingPending(true);
    try {
      await cancelPendingCouple();
      setStep('connection_choice');
    } catch (err: any) {
      setError('Failed to reset pending space.');
    } finally {
      setIsCancellingPending(false);
    }
  };

  // Copy pairing code
  const handleCopyCode = () => {
    if (couple?.pairCode) {
      navigator.clipboard.writeText(couple.pairCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Share link helper - guaranteed public live link that opens on other phones/tablets
  const inviteLink = couple?.pairCode
    ? getLiveWorkingAppUrl(couple.pairCode)
    : getLiveWorkingAppUrl();

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const currentPairCode = couple?.pairCode || custom4DigitCode || 'LOVE';
  const currentSanctuaryName = couple?.coupleName || coupleName || `${nickname || displayName || 'Our'}'s Sanctuary`;

  const activeInvitationData: InvitationData = {
    coupleName: currentSanctuaryName,
    creatorName: displayName || userProfile?.displayName || 'Your Partner',
    creatorNickname: nickname || userProfile?.nickname,
    pairCode: currentPairCode,
    appUrl: inviteLink,
    anniversaryDate: couple?.anniversaryDate || anniversaryDate,
    theme: selectedTheme,
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-rose-50/90 via-pink-50/40 to-amber-50/50 dark:from-[#060408] dark:via-[#0c0812] dark:to-[#060408] flex flex-col items-center justify-center p-4 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="w-full max-w-xl flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white font-display block leading-tight">
              Couple Setup
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              {isRequesterWaiting
                ? isRequestDeclined
                  ? 'Join Request Declined'
                  : 'Waiting for Host Approval'
                : incomingJoinRequest
                ? 'Partner Approval Needed'
                : isPendingCouple
                ? 'Waiting for Partner Connection'
                : step === 'profile'
                ? 'Step 1: Your Persona & Avatar'
                : step === 'connection_choice'
                ? 'Step 2: Choose Setup Mode'
                : step === 'create_sanctuary'
                ? 'Step 3: Our Couple Sanctuary & Anniversary'
                : step === 'create_code'
                ? 'Step 4: Generate 4-Digit Secret Code'
                : 'Connect to Partner’s Sanctuary'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFeatureShowcase(true)}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/25 dark:to-pink-500/25 border border-rose-200/50 dark:border-rose-900/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:scale-105 hover:from-rose-500 hover:to-pink-500 hover:text-white hover:border-transparent transition-all flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Tour Features</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-[#150d1d] border border-slate-200/80 dark:border-rose-900/40 text-slate-600 dark:text-rose-300 hover:scale-105 transition-all cursor-pointer shadow-xs"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-500" />}
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-[#150d1d] border border-slate-200/80 dark:border-rose-900/40 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Modern Progress Bar (Hidden during pending couple) */}
      {!isPendingCouple && (
        <div className="w-full max-w-xl mb-4 px-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 px-1">
            <span
              className={`flex items-center gap-1.5 ${
                step === 'profile' ? 'text-rose-600 dark:text-rose-400 font-extrabold' : ''
              }`}
            >
              1. Persona Studio
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                step === 'connection_choice' || step === 'create_sanctuary'
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : ''
              }`}
            >
              2. Sanctuary Setup
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                step === 'create_code' || step === 'join_code'
                  ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                  : ''
              }`}
            >
              3. Live Binding
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-all duration-500 ease-out"
              style={{
                width:
                  step === 'profile'
                    ? '33.3%'
                    : step === 'connection_choice' || step === 'create_sanctuary'
                    ? '66.6%'
                    : '100%',
              }}
            />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white/95 dark:bg-[#0f0916]/95 backdrop-blur-md rounded-3xl shadow-xl shadow-rose-100/60 dark:shadow-black/80 border border-rose-100/90 dark:border-rose-900/40 p-6 sm:p-8 transition-colors duration-300 relative">
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= CASE 1: REQUESTER WAITING FOR HOST APPROVAL ================= */}
        {isRequesterWaiting ? (
          isRequestDeclined ? (
            /* Requester was declined by host */
            <div className="space-y-6 text-center py-4 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center border-2 border-rose-200 dark:border-rose-800/60">
                <XCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-[11px] font-extrabold uppercase tracking-wider">
                  Request Declined
                </span>
                <h2 className="text-2xl font-romantic font-bold text-slate-800 dark:text-white tracking-tight">
                  Connection Request Declined
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  The host of <span className="font-bold text-slate-700 dark:text-slate-200">{couple?.coupleName || 'this sanctuary'}</span> declined your connection request. If this was a mistake, check the 4-digit code with your partner and try again.
                </p>
              </div>

              <div className="pt-2 max-w-xs mx-auto">
                <button
                  id="btn-retry-after-decline"
                  type="button"
                  onClick={handleCancelJoinRequest}
                  disabled={cancellingRequest}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {cancellingRequest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>Try Another 4-Digit Code</span>
                </button>
              </div>
            </div>
          ) : (
            /* Requester pending approval in real time */
            <div className="space-y-6 text-center py-2 animate-scale-in">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-purple-400/20 dark:bg-purple-500/10 animate-ping opacity-60" />
                <div className="absolute -inset-2 rounded-full border border-purple-300/40 dark:border-purple-500/20 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-300/50 dark:shadow-none z-10">
                  <Clock className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Request Sent to Partner
                </span>
                <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-800 dark:text-white tracking-tight">
                  Waiting for Partner's Approval
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your request has been sent to the host of <span className="font-bold text-purple-600 dark:text-purple-400">"{couple?.coupleName || 'Our Space'}"</span>. As soon as your partner taps <span className="font-bold text-emerald-600 dark:text-emerald-400">"Approve"</span>, your sanctuary opens automatically!
                </p>
              </div>

              {/* Real-time Status Card */}
              <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-[#180f24] border border-purple-200 dark:border-purple-800/60 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                    Real-Time Sanctuary Listener
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-white/90 dark:bg-[#11091a] rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sanctuary:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{couple?.coupleName || 'Private Space'}</span>
                  </div>
                  {couple?.anniversaryDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Anniversary:</span>
                      <span className="font-bold text-rose-500 font-mono">{couple.anniversaryDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pair Code:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{couple?.pairCode}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  ✨ No need to refresh. Keep this screen open; we will transition you into your couple sanctuary instantly once approved!
                </p>
              </div>

              {/* Option to cancel request */}
              <div className="pt-2 max-w-xs mx-auto">
                <button
                  id="btn-cancel-join-request"
                  type="button"
                  onClick={handleCancelJoinRequest}
                  disabled={cancellingRequest}
                  className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors disabled:opacity-50"
                >
                  {cancellingRequest ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowLeft className="w-3.5 h-3.5" />
                  )}
                  <span>Cancel request & enter different code</span>
                </button>
              </div>
            </div>
          )
        ) : incomingJoinRequest ? (
          /* ================= CASE 2: HOST RECEIVES PARTNER REQUEST (APPROVE/DECLINE MODAL/CARD) ================= */
          <div className="space-y-6 text-center py-2 animate-scale-in">
            {/* Urgent Pulsing Alert Icon */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 dark:bg-emerald-500/20 animate-ping opacity-75" />
              <div className="absolute -inset-2 rounded-full border-2 border-emerald-400/50 dark:border-emerald-500/30 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none z-10">
                <BellRing className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Incoming Partner Connection Request!
              </span>
              <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Connect With Your Partner?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                A partner entered your code <span className="font-mono font-bold text-rose-500">{couple?.pairCode}</span> and is requesting to join <span className="font-bold text-slate-800 dark:text-slate-200">"{couple?.coupleName || 'Our Space'}"</span>.
              </p>
            </div>

            {/* Requester Persona Profile Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white dark:from-[#0d1c16] dark:to-[#0a1510] border-2 border-emerald-300 dark:border-emerald-700/70 text-left shadow-lg space-y-4 max-w-md mx-auto">
              <div className="flex items-center gap-4">
                <div
                  className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 group cursor-pointer"
                  onClick={() => {
                    const url =
                      incomingJoinRequest.requesterPhoto ||
                      incomingJoinRequest.requesterPhotoURL ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(incomingJoinRequest.requesterName || 'Partner')}`;
                    setLightboxPhoto({
                      url,
                      title: `${incomingJoinRequest.requesterName || 'Partner'}'s Profile Photo`,
                    });
                  }}
                  title="Click to view full photo & download"
                >
                  <img
                    src={
                      incomingJoinRequest.requesterPhoto ||
                      incomingJoinRequest.requesterPhotoURL ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(incomingJoinRequest.requesterName || 'Partner')}`
                    }
                    alt={incomingJoinRequest.requesterName || 'Partner'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(incomingJoinRequest.requesterName || 'Partner')}`;
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-sm bg-white dark:bg-slate-800 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/30 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0d1c16] flex items-center justify-center text-white shadow-sm">
                    <Check className="w-3 h-3" />
                  </span>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {incomingJoinRequest.requesterName}
                    </h3>
                    {incomingJoinRequest.requesterNickname && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full shrink-0">
                        "{incomingJoinRequest.requesterNickname}"
                      </span>
                    )}
                  </div>

                  {incomingJoinRequest.requesterCity && (
                    <p className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{incomingJoinRequest.requesterCity}</span>
                    </p>
                  )}

                  {incomingJoinRequest.requesterOccupation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-teal-500" />
                      <span>{incomingJoinRequest.requesterOccupation}</span>
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const url =
                        incomingJoinRequest.requesterPhoto ||
                        incomingJoinRequest.requesterPhotoURL ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(incomingJoinRequest.requesterName || 'Partner')}`;
                      setLightboxPhoto({
                        url,
                        title: `${incomingJoinRequest.requesterName || 'Partner'}'s Profile Photo`,
                      });
                    }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>View full photo & download</span>
                  </button>
                </div>
              </div>

              {/* Extra Partner Details */}
              <div className="p-3.5 bg-white/80 dark:bg-[#14261e] rounded-2xl border border-emerald-100 dark:border-emerald-800/50 space-y-2 text-xs">
                {incomingJoinRequest.requesterLoveLanguage && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Love Language:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-300 capitalize">
                      {incomingJoinRequest.requesterLoveLanguage.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {incomingJoinRequest.requesterBio && (
                  <div className="pt-1 border-t border-emerald-100/60 dark:border-emerald-900/40">
                    <span className="text-slate-400 block mb-1">Personal Note:</span>
                    <p className="text-xs italic text-slate-700 dark:text-slate-300">
                      "{incomingJoinRequest.requesterBio}"
                    </p>
                  </div>
                )}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Requested:
                  </span>
                  <span className="font-mono font-medium">
                    {new Date(incomingJoinRequest.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Privacy Confirmation Warning */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Is this your partner? Approving will link both accounts permanently and grant access to all shared memories, notes, and photos.
                </span>
              </div>
            </div>

            {/* Approve / Decline Action Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
              <button
                id="btn-decline-join-request"
                type="button"
                onClick={handleDeclinePartner}
                disabled={declining || approving}
                className="py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {declining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                <span>Decline Request</span>
              </button>

              <button
                id="btn-approve-join-request"
                type="button"
                onClick={handleApprovePartner}
                disabled={approving || declining}
                className="py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {approving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HeartHandshake className="w-4 h-4" />
                )}
                <span>Approve & Bind Hearts</span>
              </button>
            </div>
          </div>
        ) : isPendingCouple ? (
          /* ================= CASE 3: HOST WAITING FOR PARTNER TO ENTER CODE ================= */
          <div className="space-y-6 text-center py-2">
            {/* Pulsing Celestial Radar */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-rose-400/20 dark:bg-rose-500/10 animate-ping opacity-60" />
              <div className="absolute -inset-2 rounded-full border border-rose-300/40 dark:border-rose-500/20 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-300/50 dark:shadow-none z-10">
                <Heart className="w-8 h-8 fill-white" />
              </div>
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 text-[11px] font-extrabold uppercase tracking-wider">
                Sanctuary Created: {couple.coupleName || 'Our Space'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-800 dark:text-white tracking-tight">
                Waiting to Bind Hearts
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Share this 4-digit code with your partner. When they enter it, you'll receive a real-time request to approve and unlock your space together!
              </p>
            </div>

            {/* 4-Digit Code Box */}
            <div className="bg-gradient-to-b from-rose-50/80 to-pink-50/40 dark:from-[#180f22] dark:to-[#120a1b] border-2 border-rose-200 dark:border-rose-800/50 rounded-3xl p-6 relative max-w-xs mx-auto shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-1">
                Your 4-Digit Secret Code
              </span>
              <div
                id="couple-pair-code-display"
                className="text-5xl font-black tracking-widest text-slate-800 dark:text-white font-mono select-all my-2"
              >
                {couple.pairCode}
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  id="btn-copy-pair-code"
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#20142d] rounded-full shadow-xs text-xs font-bold text-slate-700 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 border border-rose-100 dark:border-rose-900/60 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  id="btn-toggle-qr-modal"
                  type="button"
                  onClick={() => setShowQrModal(!showQrModal)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#20142d] rounded-full shadow-xs text-xs font-bold text-slate-700 dark:text-slate-100 hover:text-rose-600 dark:hover:text-rose-400 border border-rose-100 dark:border-rose-900/60 transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-rose-500" />
                  <span>{showQrModal ? 'Hide QR' : 'Show QR'}</span>
                </button>
              </div>
            </div>

            {/* Expandable Live QR Code */}
            {showQrModal && (
              <div className="p-4 bg-white dark:bg-[#180f22] rounded-3xl border border-rose-100 dark:border-rose-900/50 max-w-xs mx-auto shadow-sm space-y-3 animate-scale-in">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Scan with mobile camera to connect instantly:
                </p>
                <div className="flex justify-center">
                  <CoupleQRCode value={inviteLink || couple.pairCode} size={180} />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Code: {couple.pairCode}
                </p>
              </div>
            )}

            {/* Featured Action: 10 Ways to Connect & Luxury PDF Invitation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-1">
              <button
                id="btn-open-10-ways-connect"
                type="button"
                onClick={() => setShowConnectHub(true)}
                className="p-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl font-bold text-xs shadow-md shadow-purple-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>10 Ways to Connect Partner</span>
              </button>

              <button
                id="btn-open-invitation-pdf-modal"
                type="button"
                onClick={() => setShowPdfInvitation(true)}
                className="p-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Download Luxury PDF Invite</span>
              </button>
            </div>

            {/* Public Working Link Box for Partner's Phone */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-[#0d1c16] border border-emerald-200 dark:border-emerald-800/60 text-left space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Working Link for Other Phone
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Public & Ready
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="input-live-working-link"
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#14261e] border border-emerald-200 dark:border-emerald-800/80 rounded-xl font-mono text-slate-700 dark:text-slate-300 select-all focus:outline-none"
                />
                <button
                  id="btn-copy-live-link-field"
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Send this link to your partner to open in Chrome, Safari, or WhatsApp.
              </p>
            </div>

            {/* Live Listening Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 pt-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>Actively listening for {couple.pairCode} connection request...</span>
            </div>

            {/* Safety Reset: Switch / Cancel Code Option */}
            <div className="pt-4 border-t border-slate-100 dark:border-rose-900/30">
              <p className="text-[11px] text-slate-400 mb-2">
                Did your partner already generate a code, or do you want to change yours?
              </p>
              <button
                id="btn-cancel-pending-couple"
                type="button"
                onClick={handleCancelPending}
                disabled={isCancellingPending}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer disabled:opacity-50"
              >
                {isCancellingPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Cancel this code & enter partner's code instead</span>
              </button>
            </div>
          </div>
        ) : step === 'profile' ? (
          /* ================= STEP 1: PERSONA & AVATAR STUDIO (FOR BOTH PARTNERS) ================= */
          <form onSubmit={handleNextFromProfile} className="space-y-6">
            {pendingInviteCode && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 border border-purple-200 dark:border-purple-800/60 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                <p className="text-xs text-purple-900 dark:text-purple-200 font-semibold">
                  Partner Invitation Received (Code: <span className="font-mono font-bold">{pendingInviteCode}</span>)! Set up your personal profile so your partner can see you.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Your Persona Studio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Express yourself so your partner can see your glowing presence across your shared dashboard.
              </p>
            </div>

            {/* Avatar Picker & Studio */}
            <div className="p-4 rounded-3xl bg-rose-50/50 dark:bg-[#150d1e] border border-rose-100 dark:border-rose-900/30 space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={photoURL}
                    alt={displayName || 'Avatar'}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-rose-300 dark:border-rose-600/80 shadow-md bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-110"
                    title="Upload Custom Photo"
                  >
                    {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Profile Avatar
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                    >
                      {showAvatarPresets ? 'Close Presets' : 'Choose Illustrated Preset'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Pick a cute illustrated couple avatar or upload your favorite portrait.
                  </p>
                </div>
              </div>

              {/* Hidden file input for custom photo upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Preset Avatars Grid */}
              {showAvatarPresets && (
                <div className="pt-2 border-t border-rose-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Select a Romantic Preset:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setPhotoURL(preset.url)}
                        className={`p-1 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${
                          photoURL === preset.url
                            ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900 bg-white dark:bg-slate-700'
                            : 'border-transparent bg-white/60 dark:bg-slate-800'
                        }`}
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-lg mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Names: Full Name & Pet Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-rose-500" />
                    Sweet Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Bubba, Sunshine, Babe"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              {/* Gender & Identity Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Your Gender / Identity *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Can be updated anytime</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'female', label: 'Female', pronoun: 'She/Her', emoji: '👩' },
                    { id: 'male', label: 'Male', pronoun: 'He/Him', emoji: '👨' },
                    { id: 'non_binary', label: 'Non-Binary', pronoun: 'They/Them', emoji: '🌈' },
                    { id: 'prefer_not_to_say', label: 'Private/Other', pronoun: 'Heart', emoji: '✨' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        gender === g.id
                          ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-400/20 shadow-xs'
                          : 'border-slate-200 dark:border-rose-900/30 bg-white/60 dark:bg-[#140e1b] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xl mb-0.5">{g.emoji}</div>
                      <div className="text-xs font-bold leading-tight">{g.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{g.pronoun}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pet Names Setup (For Partner & For Yourself) */}
              <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pet Names Setup (Customizable anytime)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What cute pet name do you call your partner?
                  </label>
                  <input
                    type="text"
                    value={petNameForPartner}
                    onChange={(e) => setPetNameForPartner(e.target.value)}
                    placeholder="e.g. Shoona, Baby, Jaanu, Babu, Princess..."
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Shoona', 'Baby', 'Jaanu', 'Babu', 'Princess', 'Prince', 'My Queen', 'Sweetheart'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPetNameForPartner(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all ${
                          petNameForPartner === p
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 border border-rose-100 dark:border-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What pet name do you love being called? (Optional)
                  </label>
                  <input
                    type="text"
                    value={petNameForSelf}
                    onChange={(e) => setPetNameForSelf(e.target.value)}
                    placeholder="e.g. Sweetie, Babu, Prince, Teddy..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              {/* Pronouns & City Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pronouns (Optional)
                  </label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    placeholder="e.g. she/her, he/him, they/them"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Current City / Base
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Tokyo, Paris, New York"
                    className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              {/* Love Language Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Primary Love Language
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LOVE_LANGUAGES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLoveLanguage(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        loveLanguage === item.id
                          ? 'border-rose-500 bg-rose-50/80 dark:bg-[#201026] text-rose-900 dark:text-rose-200 ring-2 ring-rose-200 dark:ring-rose-900/50'
                          : 'border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-700 dark:text-slate-300 hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupation / Student */}
              <div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setOccupationType('profession')}
                    className={`p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      occupationType === 'profession'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-rose-500" />
                    Professional
                  </button>

                  <button
                    type="button"
                    onClick={() => setOccupationType('student')}
                    className={`p-2.5 rounded-2xl border text-left text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                      occupationType === 'student'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        : 'border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                    Student / Campus
                  </button>
                </div>

                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder={
                    occupationType === 'student'
                      ? 'e.g. Architecture Student, Medical Resident'
                      : 'e.g. Product Designer, Software Engineer, Teacher'
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                />
              </div>

              {/* Bio note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  A Sweet Note About You (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Coffee lover, loves evening walks, deep midnight talks, and spontaneous adventures."
                  className="w-full px-4 py-2 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none"
                />
              </div>
            </div>

            <button
              id="btn-next-step-1"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue to Connection</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : step === 'connection_choice' ? (
          /* ================= STEP 2: CHOOSE HOST VS JOIN MODE ================= */
          <div className="space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                How Will You Connect?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                One partner creates the sanctuary details & code, and the other partner joins it.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-1">
              {/* Option A: Create Sanctuary (Host) */}
              <button
                id="btn-choice-create-space"
                type="button"
                onClick={() => setStep('create_sanctuary')}
                className="p-5 text-left rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/60 to-pink-50/30 dark:from-[#1d1024] dark:to-[#0e0813] hover:border-rose-400 dark:hover:border-rose-700 transition-all flex items-start gap-4 cursor-pointer group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                      Create Our Couple Sanctuary
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-extrabold">
                      Host Space
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    I will name our sanctuary, set our anniversary date, and generate a 4-digit secret code for my partner.
                  </p>
                </div>
              </button>

              {/* Option B: Join Partner's Space (Guest) */}
              <button
                id="btn-choice-join-space"
                type="button"
                onClick={() => {
                  setStep('join_code');
                  setFoundPartner(null);
                }}
                className="p-5 text-left rounded-3xl border-2 border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/60 to-indigo-50/30 dark:from-[#191029] dark:to-[#0e0813] hover:border-purple-400 dark:hover:border-purple-700 transition-all flex items-start gap-4 cursor-pointer group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                      I Have Partner's 4-Digit Code
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold">
                      Join Space
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    My partner already created our space. I'll enter their 4-digit code to connect into our shared sanctuary instantly.
                  </p>
                </div>
              </button>
            </div>

            {/* Past Relationships Section */}
            {pastRelationships && pastRelationships.length > 0 && (
              <div className="space-y-4 border-t border-slate-200/60 dark:border-slate-800/60 pt-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200 uppercase tracking-wider">
                    Past Shared Sanctuaries ({pastRelationships.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Archived relationships that ended mutually are stored securely. You can chat with your past partner or instantly step back into your sanctuary.
                </p>

                <div className="space-y-3">
                  {pastRelationships.map((pastCouple) => {
                    const dissolvedAtStr = pastCouple.dissolvedAt ? new Date(pastCouple.dissolvedAt).toLocaleDateString() : '';
                    
                    let historyList: any[] = [];
                    try {
                      if (pastCouple.relationshipStory) {
                        const parsed = JSON.parse(pastCouple.relationshipStory);
                        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.history)) {
                          historyList = parsed.history;
                        }
                      }
                    } catch {
                      // fallback
                    }

                    const isTimelineOpen = !!expandedTimelines[pastCouple.id];

                    return (
                      <div
                        key={pastCouple.id}
                        className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200/80 dark:border-neutral-800/85 space-y-4 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{pastCouple.coupleName || 'Our Shared Sanctuary'}</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                Archived Mutually
                              </span>
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                              Dissolved on {dissolvedAtStr || 'Mutual Agreement'}. No data was deleted.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedPastCoupleForChat(pastCouple)}
                              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200/50 dark:border-neutral-700/50"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Message Partner</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExecuteReconnect(pastCouple.id)}
                              disabled={isReconnecting}
                              className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {isReconnecting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Heart className="w-3.5 h-3.5 fill-white" />
                                  <span>Reconnect</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expandable History Timeline / Love Log */}
                        <div className="border-t border-slate-100 dark:border-neutral-800/80 pt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedTimelines(prev => ({ ...prev, [pastCouple.id]: !prev[pastCouple.id] }))}
                            className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>✨ {isTimelineOpen ? 'Hide' : 'View'} Love Story Timeline & Event Log ({historyList.length + 1})</span>
                          </button>

                          {isTimelineOpen && (
                            <div className="mt-3 pl-2.5 border-l-2 border-dashed border-rose-300/40 dark:border-rose-900/30 space-y-4">
                              {/* Initial creation point */}
                              <div className="relative">
                                <span className="absolute -left-[16px] top-1 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                                <div className="text-[11px] font-bold text-slate-800 dark:text-neutral-200">
                                  ❤️ Sanctuary Founded
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  Started shared love space on {pastCouple.createdAt ? new Date(pastCouple.createdAt).toLocaleDateString() : 'Initial Setup'}.
                                </div>
                              </div>

                              {/* Interleaved events from the relationship_story JSON log */}
                              {historyList.map((evt, idx) => {
                                const isBreak = evt.type === 'breakup';
                                return (
                                  <div key={idx} className="relative">
                                    <span className={`absolute -left-[16px] top-1 w-2 h-2 rounded-full ${isBreak ? 'bg-red-400 ring-4 ring-red-500/20' : 'bg-rose-400 ring-4 ring-rose-500/20'}`} />
                                    <div className="text-[11px] font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                                      <span>{isBreak ? '💔 Mutually Paused' : '💖 Patched Up & Reconnected'}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400">
                                        by {evt.byName || 'Partner'}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                      Executed on {evt.date ? new Date(evt.date).toLocaleString() : 'Mutual Decision'}.
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep('profile')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 mx-auto pt-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to edit personal profile
            </button>
          </div>
        ) : step === 'create_sanctuary' ? (
          /* ================= STEP 3A: RELATIONSHIP & SANCTUARY VIBE (HOST ONLY) ================= */
          <form onSubmit={handleNextFromSanctuary} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('connection_choice')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to choice
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Our Couple Sanctuary & Anniversary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are setting the shared sanctuary identity. Your partner will automatically join this exact space!
              </p>
            </div>

            <div className="space-y-4">
              {/* Couple Sanctuary Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Couple Sanctuary Name *
                </label>
                <input
                  type="text"
                  required
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  placeholder={`e.g. ${nickname || displayName || 'Our'}'s Haven`}
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                />
              </div>

              {/* Anniversary Date with Live Counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    Anniversary / The Day Our Journey Began *
                  </label>
                  {daysInfo && (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                      {daysInfo.headline}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  required
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                />
                {daysInfo && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-1">
                    {daysInfo.subtitle}
                  </p>
                )}
              </div>

              {/* Relationship Status Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Relationship Journey
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'dating', label: 'Dating 💕' },
                    { id: 'in_relationship', label: 'In a Relationship ❤️' },
                    { id: 'engaged', label: 'Engaged 💍' },
                    { id: 'married', label: 'Married 🥂' },
                    { id: 'long_distance', label: 'Long Distance ✈️' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRelationshipStatus(item.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                        relationshipStatus === item.id
                          ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                          : 'border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-700 dark:text-slate-300 hover:border-rose-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sanctuary Theme Palette */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-500" />
                  Sanctuary Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SANCTUARY_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id as any)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedTheme === theme.id
                          ? 'border-slate-900 dark:border-white ring-2 ring-rose-300 dark:ring-rose-700 bg-white dark:bg-[#1e1326]'
                          : 'border-slate-200 dark:border-rose-900/30 bg-white/60 dark:bg-[#140e1b] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-gradient-to-r ${theme.color} shrink-0 shadow-xs`}
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {theme.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Couple Song */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-rose-500" />
                  Our Couple Anthem Song (Optional)
                </label>
                <input
                  type="text"
                  value={favoriteSong}
                  onChange={(e) => setFavoriteSong(e.target.value)}
                  placeholder="e.g. Lover by Taylor Swift"
                  className="w-full px-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all mb-2"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Ideas:</span>
                  {SONG_SUGGESTIONS.slice(0, 3).map((song) => (
                    <button
                      key={song}
                      type="button"
                      onClick={() => setFavoriteSong(song)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer"
                    >
                      {song}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story / Memory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  How We Met / Cherished Memory (Optional)
                </label>
                <textarea
                  rows={2}
                  value={relationshipStory}
                  onChange={(e) => setRelationshipStory(e.target.value)}
                  placeholder="e.g. Met on a cozy rainy evening at the corner cafe and talked until closing time."
                  className="w-full px-4 py-2 text-sm rounded-2xl border border-slate-200 dark:border-rose-900/30 bg-white dark:bg-[#140e1b] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none"
                />
              </div>

              {/* Optional 4-digit privacy lock */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#150d1e] border border-slate-200 dark:border-rose-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      4-Digit Privacy Passcode
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Require a PIN whenever entering the couple sanctuary
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enablePinLock}
                  onChange={(e) => setEnablePinLock(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {enablePinLock && (
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-center space-y-2 animate-scale-in">
                  <label className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                    Choose Your 4-Digit Sanctuary Passcode
                  </label>
                  <PinInput4
                    value={pinLockCode}
                    onChange={setPinLockCode}
                    variant="rose"
                    autoFocus={false}
                  />
                  <p className="text-[10px] text-slate-400">
                    Both of you will use this PIN to unlock the app.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('connection_choice')}
                className="py-3 px-4 rounded-2xl border border-slate-200 dark:border-rose-900/40 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                id="btn-next-step-sanctuary"
                type="submit"
                className="flex-1 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Secret Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : step === 'create_code' ? (
          /* ================= STEP 4A: CREATE CODE WITH 4-DIGIT PIN (HOST ONLY) ================= */
          <form onSubmit={handleCreateWithCode} className="space-y-6">
            <button
              type="button"
              onClick={() => setStep('create_sanctuary')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sanctuary details
            </button>

            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Set Your 4-Digit Secret Code
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Choose a 4-digit code for your partner to enter, or roll a lucky code.
              </p>
            </div>

            <div className="space-y-4 py-2">
              <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-[#180f22] border border-rose-100 dark:border-rose-900/40 text-center space-y-4">
                <PinInput4
                  value={custom4DigitCode}
                  onChange={setCustom4DigitCode}
                  variant="rose"
                  autoFocus={true}
                />

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateLuckyCode}
                    className="px-3 py-1.5 bg-white dark:bg-[#231530] hover:bg-rose-50 dark:hover:bg-[#2c1a3c] text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Roll Lucky Code</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {custom4DigitCode.length === 4
                    ? 'Code ready! Partner will enter this code.'
                    : 'Enter any 4 digits or leave blank to auto-generate.'}
                </p>
              </div>

              {/* Pre-Download Invitation Art Preview Option */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-[#150d1e] border border-purple-100 dark:border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Invitation Document Card
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPdfInvitation(true)}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl hover:bg-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Preview & Download PDF</span>
                </button>
              </div>

              <button
                id="btn-create-couple-space"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span>Create & Open Couple Sanctuary</span>
              </button>
            </div>
          </form>
        ) : (
          /* ================= STEP 3B: ENTER PARTNER'S 4-DIGIT CODE (JOINING PARTNER ONLY) ================= */
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => {
                setStep('connection_choice');
                setFoundPartner(null);
                setError(null);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to choice
            </button>

            {!foundPartner ? (
              <form onSubmit={handleSearchCode} className="space-y-6">
                <div className="space-y-1 text-center">
                  <h2 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                    Enter Partner's 4-Digit Code
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Type the 4-digit code shown on your partner's screen to connect into their sanctuary.
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-purple-50/50 dark:bg-[#180f22] border border-purple-100 dark:border-purple-900/40 text-center space-y-4">
                  <PinInput4
                    value={join4DigitCode}
                    onChange={(val) => {
                      setJoin4DigitCode(val);
                      if (val.length === 4) {
                        autoSearchPartner(val);
                      }
                    }}
                    onComplete={(code) => autoSearchPartner(code)}
                    variant="purple"
                    autoFocus={true}
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste supported! You can copy/paste 4 digits from your partner's message.
                  </p>
                </div>

                <button
                  id="btn-search-partner-code"
                  type="submit"
                  disabled={loading || join4DigitCode.trim().length !== 4}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  <span>Find My Partner's Sanctuary</span>
                </button>
              </form>
            ) : (
              /* High-Fidelity Found Partner & Unified Sanctuary Confirmation Card */
              <div className="text-center space-y-6 animate-scale-in">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider">
                    Partner & Sanctuary Found!
                  </span>
                  <h3 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                    Ready to Connect Hearts?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review your partner's established sanctuary and connect:
                  </p>
                </div>

                {/* Found Partner & Sanctuary Identity Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50/80 via-pink-50/40 to-white dark:from-[#180f22] dark:to-[#120a1a] border border-purple-200 dark:border-purple-800/60 text-left shadow-sm space-y-3.5">
                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-16 h-16 rounded-2xl border-2 border-white dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800 group cursor-pointer shrink-0"
                      onClick={() => {
                        const url =
                          foundPartner.profile?.photoURL ||
                          `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(foundPartner.profile?.displayName || 'partner')}`;
                        setLightboxPhoto({
                          url,
                          title: `${foundPartner.profile?.displayName || 'Partner'}'s Profile Photo`,
                        });
                      }}
                      title="Click to view full photo & download"
                    >
                      <img
                        src={
                          foundPartner.profile?.photoURL ||
                          `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(foundPartner.profile?.displayName || 'partner')}`
                        }
                        alt={foundPartner.profile?.displayName || 'Partner'}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(foundPartner.profile?.displayName || 'partner')}`;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {foundPartner.profile?.displayName || 'Your Partner'}
                        </h4>
                        {foundPartner.profile?.nickname && (
                          <span className="text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full shrink-0">
                            "{foundPartner.profile.nickname}"
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-extrabold truncate">
                        {foundPartner.coupleName || 'Private Couple Space'}
                      </p>
                      {foundPartner.profile?.city && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{foundPartner.profile.city}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Unified Sanctuary Details Display */}
                  <div className="p-3 bg-white/70 dark:bg-[#120a1a] rounded-2xl border border-purple-100 dark:border-rose-900/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <CalendarHeart className="w-3.5 h-3.5 text-rose-500" />
                        Anniversary Date:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {foundPartner.coupleData?.anniversaryDate || 'Set by partner'}
                      </span>
                    </div>

                    {foundPartner.coupleData?.anniversaryDate && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Milestone:</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {calculateDaysTogether(foundPartner.coupleData.anniversaryDate)?.headline}
                        </span>
                      </div>
                    )}

                    {foundPartner.coupleData?.relationshipStatus && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Relationship Journey:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {foundPartner.coupleData.relationshipStatus.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {foundPartner.profile?.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white/60 dark:bg-slate-700/50 p-2.5 rounded-xl border border-purple-100 dark:border-slate-700">
                      "{foundPartner.profile.bio}"
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFoundPartner(null);
                        setJoin4DigitCode('');
                      }}
                      className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
                    >
                      Use Another Code
                    </button>
                    <button
                      id="btn-send-join-request"
                      type="button"
                      onClick={handleSendJoinRequest}
                      disabled={loading}
                      className="flex-2 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send Request to Join Sanctuary</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    🔒 Advanced Approval Flow: Your partner will receive an instant approval request to verify and bind your hearts.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 10 Ways to Connect Modal */}
      {showConnectHub && (
        <ConnectHubModal
          isOpen={showConnectHub}
          onClose={() => setShowConnectHub(false)}
          pairCode={currentPairCode}
          coupleName={currentSanctuaryName}
          creatorName={displayName || userProfile?.displayName || 'Your Partner'}
          creatorNickname={nickname || userProfile?.nickname}
          anniversaryDate={couple?.anniversaryDate || anniversaryDate}
          appUrl={inviteLink}
        />
      )}

      {/* Luxury PDF & Artwork Preview Modal */}
      {showPdfInvitation && (
        <InvitationPreviewModal
          isOpen={showPdfInvitation}
          onClose={() => setShowPdfInvitation(false)}
          data={activeInvitationData}
        />
      )}

      {/* Profile Photo Lightbox Modal */}
      {lightboxPhoto && (
        <PhotoLightboxModal
          isOpen={!!lightboxPhoto}
          onClose={() => setLightboxPhoto(null)}
          imageUrl={lightboxPhoto.url}
          userName={lightboxPhoto.title}
        />
      )}

      {/* Real-time Past Partner Dialogue Overlay */}
      {selectedPastCoupleForChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-2xl h-[80vh] bg-slate-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Dialogue with Past Partner
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    Sanctuary: {selectedPastCoupleForChat.coupleName || 'Our Shared Space'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteReconnect(selectedPastCoupleForChat.id)}
                  disabled={isReconnecting}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isReconnecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-3 h-3 fill-white" />
                      <span>Reconnect Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPastCoupleForChat(null)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a0709]">
              {reconnectError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{reconnectError}</span>
                </div>
              )}

              {loadingPastMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                    <span className="text-xs">Decrypting past dialogue stream...</span>
                  </div>
                </div>
              ) : pastMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <MessageCircle className="w-8 h-8 text-neutral-600" />
                  <p className="text-xs text-neutral-400">
                    No past messages on record. Send a message to re-open the lines of communication.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastMessages.map((m) => {
                    const isMe = m.sender_id === currentUser.uid;
                    return (
                      <div
                        key={m.id}
                        className={`flex items-start gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && m.sender_photo && (
                          <img
                            src={m.sender_photo}
                            alt={m.sender_name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-800 mt-0.5"
                          />
                        )}
                        <div className="space-y-1 max-w-[70%]">
                          <div className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] font-semibold text-neutral-400">
                              {isMe ? 'You' : m.sender_name}
                            </span>
                            <span className="text-[8px] text-neutral-500">
                              {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <div
                            className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-rose-600/20 border border-rose-500/20 text-rose-100 rounded-tr-none'
                                : 'bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-tl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                        {isMe && m.sender_photo && (
                          <img
                            src={m.sender_photo}
                            alt={m.sender_name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-neutral-800 mt-0.5"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div ref={pastChatEndRef} />
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendPastMessage} className="p-4 border-t border-neutral-800 flex gap-2 bg-neutral-950/20">
              <input
                type="text"
                value={pastInputText}
                onChange={(e) => setPastInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!pastInputText.trim() || isSendingPastMessage}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center"
              >
                {isSendingPastMessage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Feature Showcase Tour */}
      {showFeatureShowcase && (
        <FeatureShowcaseModal
          isOpen={showFeatureShowcase}
          onClose={() => setShowFeatureShowcase(false)}
          activeTheme={selectedTheme}
        />
      )}
    </div>
  );
};
