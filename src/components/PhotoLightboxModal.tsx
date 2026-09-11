import React, { useState } from 'react';
import { X, Download, Camera, Check, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { downloadProfilePhoto } from '../utils/imageDownload';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName: string;
  isPartner?: boolean;
  onChangePhoto?: () => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  userName,
  isPartner = false,
  onChangePhoto,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const sanitizedName = userName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `${sanitizedName}-profile-photo.png`;
      const success = await downloadProfilePhoto(imageUrl, filename);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to download photo:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      id="photo-lightbox-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
    >
      {/* Top Controls Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl flex items-center justify-between text-white pt-2 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {userName}&apos;s Profile Picture
            </h3>
            <p className="text-xs text-slate-300">
              {isPartner ? 'Your connected soulmate' : 'Your private profile picture'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-full p-1 backdrop-blur-xs border border-white/10">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              title="Zoom Out"
              className="p-1.5 rounded-full hover:bg-white/20 text-white disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="px-2 text-xs font-mono font-medium hover:bg-white/20 rounded-md text-white cursor-pointer"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
              title="Zoom In"
              className="p-1.5 rounded-full hover:bg-white/20 text-white disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-close-photo-lightbox"
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-xs transition-colors cursor-pointer"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main High-Res Image Display Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex-1 w-full max-w-2xl flex items-center justify-center my-4 overflow-hidden relative"
      >
        <div
          className="relative transition-transform duration-150 ease-out max-h-full flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src={imageUrl}
            alt={userName}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] sm:max-h-[70vh] max-w-[90vw] sm:max-w-md object-contain rounded-3xl shadow-2xl border-4 border-white/20 bg-slate-900"
          />
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3 pb-2 z-10"
      >
        {/* Download Button */}
        <button
          id="btn-download-profile-photo"
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Downloaded to Device!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-rose-300" />
              <span>{downloading ? 'Downloading...' : 'Download Picture'}</span>
            </>
          )}
        </button>

        {/* Change Picture Button */}
        {onChangePhoto && (
          <button
            id="btn-lightbox-change-photo"
            type="button"
            onClick={() => {
              onClose();
              onChangePhoto();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>{isPartner ? `Change ${userName}'s Picture` : 'Change Your Picture'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
