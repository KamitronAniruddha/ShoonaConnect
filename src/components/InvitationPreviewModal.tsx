import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Check,
  Palette,
  Eye,
  Share2,
  Heart,
  QrCode,
  Copy,
} from 'lucide-react';
import {
  InvitationData,
  generateInvitationCanvas,
  downloadInvitationPdf,
  downloadInvitationImage,
} from '../utils/invitationPdf';

interface InvitationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InvitationData;
}

export const InvitationPreviewModal: React.FC<InvitationPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [style, setStyle] = useState<'midnight_obsidian' | 'royal_parchment'>('midnight_obsidian');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate live preview whenever data or style changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingPreview(true);

    generateInvitationCanvas(data, style)
      .then((canvas) => {
        if (isMounted) {
          setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85));
          setLoadingPreview(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate invitation preview:', err);
        if (isMounted) setLoadingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, data, style]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await downloadInvitationPdf(data, style);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    setIsDownloadingImage(true);
    try {
      await downloadInvitationImage(data, style);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(data.pairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0e0a12] border border-rose-200/80 dark:border-rose-900/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/90 transition-all cursor-pointer backdrop-blur-xs"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Interactive Canvas Preview */}
        <div className="w-full md:w-1/2 p-6 bg-gradient-to-b from-rose-50/50 to-pink-50/30 dark:from-[#08050a] dark:to-[#120b16] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-rose-100 dark:border-slate-800/80 relative">
          <div className="w-full flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-700 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              Live Art Preview
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              300 DPI Vector-Ready
            </span>
          </div>

          <div className="relative w-full max-w-[340px] aspect-[12/17] rounded-2xl overflow-hidden shadow-2xl border-2 border-rose-300/40 dark:border-rose-500/20 bg-black flex items-center justify-center">
            {loadingPreview ? (
              <div className="flex flex-col items-center gap-2 text-rose-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold">Rendering luxury invitation...</span>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Sanctuary Invitation Preview"
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <p className="text-xs text-rose-400">Could not render preview</p>
            )}
          </div>
        </div>

        {/* Right: Controls & Download Options */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Luxury Couple Keepsake
              </span>
              <h3 className="text-2xl font-romantic font-bold text-slate-900 dark:text-white tracking-tight">
                Sanctuary Invitation Art
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                A custom love-letter document featuring your couple name, sacred 4-digit code, scannable QR code, and milestone anniversary.
              </p>
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                Choose Art Theme Style
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setStyle('midnight_obsidian')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    style === 'midnight_obsidian'
                      ? 'border-rose-500 bg-[#160d1b] text-white ring-2 ring-rose-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-900 to-black border border-rose-500" />
                    <span className="text-xs font-bold">Midnight Obsidian</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Velvet dark with gold & neon foil
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyle('royal_parchment')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    style === 'royal_parchment'
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#faf7f2] border border-amber-400" />
                    <span className="text-xs font-bold">Royal Parchment</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Warm ivory with champagne gold
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Details Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#150e1b] border border-slate-200 dark:border-rose-900/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sanctuary:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {data.coupleName || 'Our Space'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">4-Digit Passcode:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600 dark:text-rose-400">
                  <span>{data.pairCode}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-md cursor-pointer transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              id="btn-download-invitation-pdf"
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>Download Luxury PDF Document</span>
            </button>

            <button
              id="btn-download-invitation-image"
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className="w-full py-3 px-4 bg-white dark:bg-[#1a1122] hover:bg-rose-50 dark:hover:bg-[#23172e] border border-slate-200 dark:border-rose-900/50 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isDownloadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-purple-500" />
              )}
              <span>Save as High-Res Image (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
