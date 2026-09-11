import React from 'react';
import { X, Volume2, VolumeX, Check, Eye, Palette } from 'lucide-react';
import { BOARD_THEMES } from './ChessBoardThemes';
import type { ChessSettings, BoardThemeId, PieceStyleId } from '../../types/chess';
import { setChessSoundMuted } from '../../utils/chessAudio';

interface ChessSettingsModalProps {
  settings: ChessSettings;
  onUpdateSettings: (newSettings: ChessSettings) => void;
  onClose: () => void;
}

export const ChessSettingsModal: React.FC<ChessSettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const handleToggleSound = (enabled: boolean) => {
    setChessSoundMuted(!enabled);
    onUpdateSettings({ ...settings, soundEnabled: enabled });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#191017] border border-[#ff3377]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#ff4d8d]" />
            <h2 className="text-xl font-bold font-fraunces text-white">
              Chess Preferences & Aesthetics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Themes */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Board Visual Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.values(BOARD_THEMES).map((theme) => {
              const isSelected = settings.boardTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ ...settings, boardTheme: theme.id })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-[#ff3377] bg-[#2a1624] shadow-md shadow-pink-500/15'
                      : 'border-white/5 bg-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.darkSquare }}
                    />
                    <div
                      className="w-4 h-4 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.lightSquare }}
                    />
                  </div>
                  <div className="text-xs font-bold text-white truncate">{theme.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{theme.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Piece Styles */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Piece Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'classic', label: 'Classic' },
              { id: 'modern', label: 'Modern' },
              { id: 'elegant', label: 'Golden' },
              { id: 'minimal', label: 'Minimal' },
              { id: 'neon', label: 'Neon Glow' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => onUpdateSettings({ ...settings, pieceStyle: st.id as PieceStyleId })}
                className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  settings.pieceStyle === st.id
                    ? 'bg-[#ff3377] text-white border-[#ff3377]'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Audio & Procedural Chimes</span>
              <p className="text-[11px] text-neutral-400">Moves, captures, checks, and victory fanfare</p>
            </div>
            <button
              onClick={() => handleToggleSound(!settings.soundEnabled)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                settings.soundEnabled ? 'bg-[#ff3377] text-white' : 'bg-white/10 text-neutral-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Show Legal Move Dots</span>
              <p className="text-[11px] text-neutral-400">Highlight reachable destination squares</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showLegalMoves: !settings.showLegalMoves })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showLegalMoves ? 'bg-[#ff3377]' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.showLegalMoves ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">Board Coordinates</span>
              <p className="text-[11px] text-neutral-400">Show rank (1-8) and file (a-h) labels</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showCoordinates: !settings.showCoordinates })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.showCoordinates ? 'bg-[#ff3377]' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.showCoordinates ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white">In-Game Live Chat & Reactions</span>
              <p className="text-[11px] text-neutral-400">Allow sweet romantic messages and reactions during play</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, enableChat: !settings.enableChat })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enableChat ? 'bg-[#ff3377]' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.enableChat ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff3377] to-[#ff4d8d] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-pink-500/25 transition-all cursor-pointer"
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
