import type { BoardThemeId } from '../../types/chess';

export interface BoardThemeConfig {
  id: BoardThemeId;
  name: string;
  subtitle: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  lastMoveSquare: string;
  legalMoveIndicator: string;
  checkGlow: string;
  borderClass: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardThemeConfig> = {
  pink: {
    id: 'pink',
    name: 'Shoona Glow 💕',
    subtitle: 'Signature romantic couple palette',
    lightSquare: '#fff0f6',
    darkSquare: '#f472b6',
    selectedSquare: 'rgba(255, 51, 119, 0.45)',
    lastMoveSquare: 'rgba(255, 105, 180, 0.35)',
    legalMoveIndicator: 'rgba(255, 51, 119, 0.65)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-[#ff3377]/40 shadow-pink-500/20',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Luxury ✨',
    subtitle: 'High-contrast dark obsidian',
    lightSquare: '#38303d',
    darkSquare: '#1b1420',
    selectedSquare: 'rgba(168, 85, 247, 0.45)',
    lastMoveSquare: 'rgba(168, 85, 247, 0.25)',
    legalMoveIndicator: 'rgba(168, 85, 247, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-purple-500/30 shadow-purple-900/40',
  },
  classic: {
    id: 'classic',
    name: 'Classic Oak Wood 🌲',
    subtitle: 'Traditional championship board',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    selectedSquare: 'rgba(130, 151, 105, 0.5)',
    lastMoveSquare: 'rgba(205, 210, 106, 0.5)',
    legalMoveIndicator: 'rgba(100, 110, 64, 0.6)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-amber-900/40 shadow-amber-950/30',
  },
  burgundy: {
    id: 'burgundy',
    name: 'Vintage Burgundy 🍷',
    subtitle: 'Deep wine and soft velvet',
    lightSquare: '#fdf2f4',
    darkSquare: '#881337',
    selectedSquare: 'rgba(244, 63, 94, 0.5)',
    lastMoveSquare: 'rgba(251, 113, 133, 0.4)',
    legalMoveIndicator: 'rgba(244, 63, 94, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.85)',
    borderClass: 'border-rose-800/40 shadow-rose-950/30',
  },
  rose: {
    id: 'rose',
    name: 'Soft Rose Quartz 🌸',
    subtitle: 'Delicate pastel blush',
    lightSquare: '#fff1f2',
    darkSquare: '#fda4af',
    selectedSquare: 'rgba(244, 63, 94, 0.4)',
    lastMoveSquare: 'rgba(253, 164, 175, 0.4)',
    legalMoveIndicator: 'rgba(225, 29, 72, 0.6)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-rose-400/30 shadow-rose-500/20',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Garden 🌿',
    subtitle: 'Tournament green & ivory',
    lightSquare: '#ecfdf5',
    darkSquare: '#047857',
    selectedSquare: 'rgba(16, 185, 129, 0.45)',
    lastMoveSquare: 'rgba(52, 211, 153, 0.35)',
    legalMoveIndicator: 'rgba(5, 150, 105, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-emerald-600/40 shadow-emerald-950/30',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze 🌊',
    subtitle: 'Deep azure and ice blue',
    lightSquare: '#f0f9ff',
    darkSquare: '#0284c7',
    selectedSquare: 'rgba(14, 165, 233, 0.45)',
    lastMoveSquare: 'rgba(56, 189, 248, 0.35)',
    legalMoveIndicator: 'rgba(2, 132, 199, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-sky-600/40 shadow-sky-950/30',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Slate ☕',
    subtitle: 'Subtle clean monochromatic',
    lightSquare: '#f8fafc',
    darkSquare: '#64748b',
    selectedSquare: 'rgba(100, 116, 139, 0.45)',
    lastMoveSquare: 'rgba(148, 163, 184, 0.4)',
    legalMoveIndicator: 'rgba(71, 85, 105, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.8)',
    borderClass: 'border-slate-500/30 shadow-slate-950/30',
  },
  contrast: {
    id: 'contrast',
    name: 'High Contrast ♟️',
    subtitle: 'Pure stark monochrome clarity',
    lightSquare: '#ffffff',
    darkSquare: '#27272a',
    selectedSquare: 'rgba(255, 51, 119, 0.5)',
    lastMoveSquare: 'rgba(255, 255, 255, 0.25)',
    legalMoveIndicator: 'rgba(255, 51, 119, 0.7)',
    checkGlow: 'rgba(239, 68, 68, 0.9)',
    borderClass: 'border-white/30 shadow-black/50',
  },
};
