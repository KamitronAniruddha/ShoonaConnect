import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Bookmark, Heart, Check } from 'lucide-react';

interface ChatPhotoViewerProps {
  photoUrl: string | null;
  caption?: string;
  senderName?: string;
  date?: string;
  onClose: () => void;
  onSaveToMemories?: () => void;
}

export const ChatPhotoViewer: React.FC<ChatPhotoViewerProps> = ({
  photoUrl,
  caption,
  senderName,
  date,
  onClose,
  onSaveToMemories,
}) => {
  const [scale, setScale] = useState(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!photoUrl) return null;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `shoona-photo-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveMemory = () => {
    if (onSaveToMemories) {
      onSaveToMemories();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-md animate-in fade-in select-none">
      {/* Top toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border-b border-slate-800 text-white z-10">
        <div>
          {senderName && (
            <p className="text-xs font-semibold text-rose-300">
              Shared by {senderName}
            </p>
          )}
          {date && (
            <p className="text-[10px] text-slate-400">
              {new Date(date).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            title="Download Photo"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
          {onSaveToMemories && (
            <button
              onClick={handleSaveMemory}
              title="Save to Shared Memories"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved!
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 fill-current" /> Save to Memories
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center p-4 relative cursor-grab active:cursor-grabbing"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={photoUrl}
          alt={caption || 'Shared photo'}
          className="max-h-[85vh] max-w-[90vw] object-contain transition-transform duration-150 rounded-lg shadow-2xl"
          style={{ transform: `scale(${scale})` }}
        />
      </div>

      {/* Bottom Caption */}
      {caption && (
        <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-center text-xs sm:text-sm text-slate-200 font-medium">
          {caption}
        </div>
      )}
    </div>
  );
};
