import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  QrCode,
  FileText,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
  Sparkles,
  Heart,
  Globe,
  Download,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { CoupleQRCode } from './CoupleQRCode';
import { InvitationData } from '../utils/invitationPdf';
import { InvitationPreviewModal } from './InvitationPreviewModal';

interface ConnectHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  pairCode: string;
  coupleName?: string;
  creatorName?: string;
  creatorNickname?: string;
  anniversaryDate?: string;
  appUrl: string;
}

export const ConnectHubModal: React.FC<ConnectHubModalProps> = ({
  isOpen,
  onClose,
  pairCode,
  coupleName = 'Our Private Sanctuary',
  creatorName = 'Your Partner',
  creatorNickname,
  anniversaryDate,
  appUrl,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLoveLetter, setCopiedLoveLetter] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  if (!isOpen) return null;

  const invitationData: InvitationData = {
    coupleName,
    creatorName,
    creatorNickname,
    pairCode,
    appUrl,
    anniversaryDate,
  };

  const romanticMessage = `Hey sweetheart! ❤️ I set up our private couple sanctuary "${coupleName}" on ShoonaConnect! ✨\n\nTap this link to join me instantly: ${appUrl}\n\nOr enter our 4-digit secret code: ${pairCode}\n\nCan't wait to see you inside! 💕`;

  // 1. WhatsApp
  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(romanticMessage)}`;
    window.open(url, '_blank');
  };

  // 2. Telegram
  const handleTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(
      `Hey sweetheart! ❤️ Enter our 4-digit code ${pairCode} to join our couple space "${coupleName}"!`
    )}`;
    window.open(url, '_blank');
  };

  // 3. SMS / iMessage
  const handleSms = () => {
    const smsUrl = `sms:?&body=${encodeURIComponent(romanticMessage)}`;
    window.location.href = smsUrl;
  };

  // 4. Email Love Letter
  const handleEmail = () => {
    const subject = encodeURIComponent(`Our Private Couple Sanctuary on ShoonaConnect (${coupleName}) 💕`);
    const body = encodeURIComponent(
      `My dearest love,\n\nI have created a private, encrypted digital haven just for the two of us called "${coupleName}".\n\nHere is how to join me:\n1. Open our sanctuary link: ${appUrl}\n2. Enter our 4-digit secret passcode: ${pairCode}\n\nOur shared memories, daily questions, and love notes are waiting for us.\n\nWith all my love,\n${creatorName}${creatorNickname ? ` ("${creatorNickname}")` : ''}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // 5. Native Web Share API (AirDrop, Nearby Share, Instagram Direct, Messages)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${coupleName} on ShoonaConnect`,
          text: `Enter our 4-digit code ${pairCode} to join our private couple space!`,
          url: appUrl,
        });
      } catch (e) {
        // user dismissed
      }
    } else {
      handleWhatsApp();
    }
  };

  // 6. Copy 4-Digit Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 7. Copy Live Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 8. Copy Full Formatted Love Letter
  const handleCopyLoveLetter = () => {
    navigator.clipboard.writeText(romanticMessage);
    setCopiedLoveLetter(true);
    setTimeout(() => setCopiedLoveLetter(false), 2000);
  };

  // 9. Messenger / Facebook Share
  const handleMessenger = () => {
    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(appUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c0810] border border-rose-200 dark:border-rose-900/40 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-slate-900 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-romantic font-bold text-slate-900 dark:text-white">
                  10 Ways to Connect Hearts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share your 4-digit code & link with your partner via any channel
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick 4-Digit Code & Live Link Banner */}
          <div className="p-4 sm:p-5 bg-rose-50/50 dark:bg-[#150d1b] border-b border-rose-100 dark:border-rose-900/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-[#1e1326] rounded-2xl border border-rose-100 dark:border-rose-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400 block">
                  Secret Code
                </span>
                <span className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                  {pairCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-white dark:bg-[#1e1326] rounded-2xl border border-rose-100 dark:border-rose-800/40 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Live Working Link
                </span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate block">
                  {appUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 10 Connection Methods Grid */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
              Select Your Preferred Connection Method:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* 1. WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    1. WhatsApp Direct
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Formatted text + 4-digit code + link
                  </p>
                </div>
              </button>

              {/* 2. Telegram */}
              <button
                type="button"
                onClick={handleTelegram}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    2. Telegram Share
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Instant Telegram share link
                  </p>
                </div>
              </button>

              {/* 3. SMS / iMessage */}
              <button
                type="button"
                onClick={handleSms}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    3. SMS / iMessage
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Native messaging on iPhone & Android
                  </p>
                </div>
              </button>

              {/* 4. Email Love Letter */}
              <button
                type="button"
                onClick={handleEmail}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">
                    4. Email Love Letter
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Romantic drafted letter with instructions
                  </p>
                </div>
              </button>

              {/* 5. Download Luxury PDF Invitation */}
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="p-3.5 rounded-2xl border-2 border-rose-300 dark:border-rose-800/80 bg-gradient-to-br from-rose-50/80 to-pink-50/40 dark:from-[#201026] dark:to-[#120a17] hover:border-rose-500 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs sm:col-span-2"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-100 group-hover:text-rose-600">
                      5. Download Luxury Invitation PDF & Card
                    </h4>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      Featured
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    300 DPI high-res artwork with gold foil borders, couple title, and scannable QR
                  </p>
                </div>
              </button>

              {/* 6. High-Res QR Code */}
              <button
                type="button"
                onClick={() => setShowQrExpanded(!showQrExpanded)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    6. Scannable QR Code
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Scan directly with phone camera
                  </p>
                </div>
              </button>

              {/* 7. Native Device Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    7. Device Share (AirDrop/Nearby)
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Instagram, AirDrop, Messages & More
                  </p>
                </div>
              </button>

              {/* 8. Copy Full Romantic Message */}
              <button
                type="button"
                onClick={handleCopyLoveLetter}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  {copiedLoveLetter ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">
                    8. Copy Formatted Message
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {copiedLoveLetter ? 'Message Copied!' : 'Copy complete invite text'}
                  </p>
                </div>
              </button>

              {/* 9. Messenger / Facebook Share */}
              <button
                type="button"
                onClick={handleMessenger}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    9. Messenger Link
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Share directly via Messenger dialog
                  </p>
                </div>
              </button>

              {/* 10. Copy Public Web URL */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#140e1a] hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all flex items-center gap-3 text-left cursor-pointer group shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    10. Direct Web URL
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Copy public browser link
                  </p>
                </div>
              </button>
            </div>

            {/* Expandable Live QR Code */}
            {showQrExpanded && (
              <div className="p-4 bg-slate-50 dark:bg-[#160e1d] rounded-2xl border border-purple-200 dark:border-purple-900/40 text-center space-y-3 animate-scale-in">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Scan this QR code with mobile camera to connect:
                </p>
                <div className="flex justify-center">
                  <CoupleQRCode value={appUrl} size={180} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Sanctuary Code: {pairCode}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Luxury PDF & Artwork Preview Modal */}
      {showPdfModal && (
        <InvitationPreviewModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          data={invitationData}
        />
      )}
    </>
  );
};
