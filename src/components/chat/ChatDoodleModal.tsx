import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  Heart,
  Star,
  Shuffle,
  Download,
  Trash2,
  Brush,
  Paintbrush,
  Highlighter,
  Eraser,
  Palette,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { createSafeChannel, supabase } from '../../lib/supabase';
import { playMessageSentSound } from '../../utils/chatService';

interface ChatDoodleModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupleId: string;
  myUid: string;
  myName: string;
  partnerName: string;
  onSendDoodle: (canvasDataUrl: string, prompt?: string) => Promise<void>;
  initialPrompt?: string;
}

const DOODLE_PROMPTS = [
  'Draw where you want our next kiss to be! 💋',
  'Draw our dream cozy Sunday morning ☕',
  'Draw the home we will live in together 🏡',
  'Draw what you love most about my face 🥰',
  'Draw the funniest thing that happened to us 😆',
  'Draw our favorite memory together 📸',
  'Draw what I look like when I am hungry 🍕',
  'Draw our dream holiday vacation destination 🏖️',
  'Draw a cute magical pet we should adopt 🐱',
  'Draw us in 50 years holding hands 👵👴',
  'Draw your favorite meal we cooked together 🍳',
  'Draw my biggest superpower according to you 🦸',
  'Draw a secret love symbol that only we know 🗝️',
  'Draw what your heart feels right this second 💖',
];

const COLOR_PALETTE = [
  { name: 'Rose Gold', color: '#ff4d8d' },
  { name: 'Passion Red', color: '#e11d48' },
  { name: 'Warm Coral', color: '#f43f5e' },
  { name: 'Sunset Orange', color: '#f97316' },
  { name: 'Golden Honey', color: '#eab308' },
  { name: 'Mint Leaf', color: '#10b981' },
  { name: 'Sky Blue', color: '#0ea5e9' },
  { name: 'Lavender Night', color: '#8b5cf6' },
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Obsidian Black', color: '#1e293b' },
];

const CANVAS_BACKGROUNDS = [
  { id: 'dark', label: 'Velvet Midnight', bg: '#0b0f19', grid: 'rgba(255,255,255,0.03)' },
  { id: 'parchment', label: 'Warm Parchment', bg: '#fdf6ec', grid: 'rgba(0,0,0,0.03)' },
  { id: 'rose', label: 'Rose Silk', bg: '#23111b', grid: 'rgba(255,100,160,0.05)' },
  { id: 'galaxy', label: 'Starry Blue', bg: '#070b1e', grid: 'rgba(100,180,255,0.05)' },
];

type ToolType = 'pen' | 'neon' | 'calligraphy' | 'heart' | 'star' | 'eraser';

interface StrokePoint {
  x: number;
  y: number;
}

export const ChatDoodleModal: React.FC<ChatDoodleModalProps> = ({
  isOpen,
  onClose,
  coupleId,
  myUid,
  myName,
  partnerName,
  onSendDoodle,
  initialPrompt,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState(
    initialPrompt || DOODLE_PROMPTS[Math.floor(Math.random() * DOODLE_PROMPTS.length)]
  );
  const [tool, setTool] = useState<ToolType>('neon');
  const [color, setColor] = useState('#ff4d8d');
  const [lineWidth, setLineWidth] = useState(4);
  const [bgStyle, setBgStyle] = useState(CANVAS_BACKGROUNDS[0]);
  const [isSending, setIsSending] = useState(false);
  const [partnerDrawing, setPartnerDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Drawing state
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<StrokePoint | null>(null);

  // Channel reference for real-time synchronization
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) setPrompt(initialPrompt);
      setTimeout(initCanvas, 50);
    }
  }, [isOpen, initialPrompt, bgStyle]);

  // Setup BroadcastChannel and Supabase Realtime channel for two-way live strokes
  useEffect(() => {
    if (!isOpen || !coupleId) return;

    // 1. Cross-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel(`shoona_doodle_${coupleId}`);
        bc.onmessage = (e) => {
          if (e.data?.senderId !== myUid) {
            handleRemoteStroke(e.data);
          }
        };
        broadcastChannelRef.current = bc;
      }
    } catch {
      // ignore
    }

    // 2. Supabase Realtime Channel
    const channel = createSafeChannel(`doodle_stream_${coupleId}`)
      .on('broadcast', { event: 'stroke' }, ({ payload }) => {
        if (payload?.senderId !== myUid) {
          handleRemoteStroke(payload);
        }
      })
      .on('broadcast', { event: 'clear' }, ({ payload }) => {
        if (payload?.senderId !== myUid) {
          clearCanvasLocally();
        }
      })
      .subscribe();

    return () => {
      if (bc) bc.close();
      supabase.removeChannel(channel);
    };
  }, [isOpen, coupleId, myUid]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgStyle.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state in history
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryStep(0);
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyStep + 1);
      return [...upToCurrent, data];
    });
    setHistoryStep((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };

  // Broadcast stroke to partner
  const broadcastStroke = (strokePayload: any) => {
    // 1. BroadcastChannel
    try {
      broadcastChannelRef.current?.postMessage(strokePayload);
    } catch {}

    // 2. Supabase channel broadcast
    try {
      const channel = createSafeChannel(`doodle_stream_${coupleId}`);
      channel.send({
        type: 'broadcast',
        event: 'stroke',
        payload: strokePayload,
      });
    } catch {}
  };

  // Draw incoming remote stroke from partner
  const handleRemoteStroke = (data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setPartnerDrawing(true);
    setTimeout(() => setPartnerDrawing(false), 800);

    const { x1, y1, x2, y2, tool: rTool, color: rColor, width: rWidth, type } = data;

    ctx.save();
    if (type === 'stamp') {
      drawStamp(ctx, x1 * canvas.width, y1 * canvas.height, rTool, rColor, rWidth);
    } else {
      applyToolStyle(ctx, rTool, rColor, rWidth);
      ctx.beginPath();
      ctx.moveTo(x1 * canvas.width, y1 * canvas.height);
      ctx.lineTo(x2 * canvas.width, y2 * canvas.height);
      ctx.stroke();
    }
    ctx.restore();
  };

  const applyToolStyle = (
    ctx: CanvasRenderingContext2D,
    curTool: ToolType,
    curColor: string,
    curWidth: number
  ) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (curTool === 'eraser') {
      ctx.strokeStyle = bgStyle.bg;
      ctx.lineWidth = curWidth * 3.5;
      ctx.shadowBlur = 0;
    } else if (curTool === 'neon') {
      ctx.strokeStyle = curColor;
      ctx.lineWidth = curWidth;
      ctx.shadowColor = curColor;
      ctx.shadowBlur = 12;
    } else if (curTool === 'calligraphy') {
      ctx.strokeStyle = curColor;
      ctx.lineWidth = curWidth * 1.8;
      ctx.shadowBlur = 0;
      ctx.lineCap = 'square';
    } else {
      // standard pen
      ctx.strokeStyle = curColor;
      ctx.lineWidth = curWidth;
      ctx.shadowBlur = 0;
    }
  };

  const drawStamp = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    stampType: 'heart' | 'star',
    stampColor: string,
    size: number
  ) => {
    ctx.save();
    ctx.font = `${size * 6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = stampColor;
    ctx.shadowBlur = 10;
    ctx.fillText(stampType === 'heart' ? '💖' : '⭐', x, y);
    ctx.restore();
  };

  // Get canvas-relative coordinates (supports touch & mouse)
  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coords = getCoords(e);
    if (!coords) return;

    isDrawingRef.current = true;
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'heart' || tool === 'star') {
      drawStamp(ctx, coords.x, coords.y, tool, color, lineWidth);
      broadcastStroke({
        senderId: myUid,
        type: 'stamp',
        x1: coords.x / canvas.width,
        y1: coords.y / canvas.height,
        tool,
        color,
        width: lineWidth,
      });
      saveHistoryState();
      isDrawingRef.current = false;
      return;
    }

    ctx.save();
    applyToolStyle(ctx, tool, color, lineWidth);
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'eraser' ? bgStyle.bg : color;
    ctx.fill();
    ctx.restore();
  };

  const handlePointerMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoords(e);
    if (!coords) return;

    ctx.save();
    applyToolStyle(ctx, tool, color, lineWidth);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.restore();

    // Broadcast normalized coordinates
    broadcastStroke({
      senderId: myUid,
      type: 'line',
      x1: lastPointRef.current.x / canvas.width,
      y1: lastPointRef.current.y / canvas.height,
      x2: coords.x / canvas.width,
      y2: coords.y / canvas.height,
      tool,
      color,
      width: lineWidth,
    });

    lastPointRef.current = coords;
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      lastPointRef.current = null;
      saveHistoryState();
    }
  };

  const clearCanvasLocally = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = bgStyle.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const handleClear = () => {
    clearCanvasLocally();
    try {
      broadcastChannelRef.current?.postMessage({ senderId: myUid, event: 'clear' });
      createSafeChannel(`doodle_stream_${coupleId}`).send({
        type: 'broadcast',
        event: 'clear',
        payload: { senderId: myUid },
      });
    } catch {}
  };

  const handleShufflePrompt = () => {
    const next = DOODLE_PROMPTS[Math.floor(Math.random() * DOODLE_PROMPTS.length)];
    setPrompt(next);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Shoona-Doodle-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSending(true);

    try {
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      await onSendDoodle(dataUrl, prompt);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d8d', '#f43f5e', '#ec4899', '#ffffff'],
      });

      playMessageSentSound();
      onClose();
    } catch (err) {
      console.error('Failed to send doodle:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Realtime Couple Doodle Studio 🎨
                </h3>
                {partnerDrawing && (
                  <span className="text-[10px] bg-rose-500/30 text-rose-300 font-semibold px-2 py-0.5 rounded-full animate-pulse">
                    {partnerName} is doodling...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">
                Draw live with {partnerName} & send straight to chat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Card */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-neutral-900 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">🎯</span>
            <p className="text-xs text-rose-200 font-medium truncate">{prompt}</p>
          </div>
          <button
            type="button"
            onClick={handleShufflePrompt}
            className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Shuffle className="w-3 h-3" /> New Prompt
          </button>
        </div>

        {/* Drawing Surface */}
        <div className="relative flex-1 bg-neutral-950 p-2 sm:p-4 flex items-center justify-center overflow-hidden touch-none select-none">
          <canvas
            ref={canvasRef}
            width={720}
            height={480}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
            className="w-full max-h-[50vh] sm:max-h-[56vh] aspect-[3/2] rounded-2xl shadow-inner border border-white/10 cursor-crosshair block touch-none"
            style={{ backgroundColor: bgStyle.bg }}
          />

          {/* Partner indicator overlay */}
          {partnerDrawing && (
            <div className="absolute top-6 right-6 pointer-events-none bg-black/60 backdrop-blur-sm border border-rose-500/30 rounded-xl px-2.5 py-1 text-xs text-rose-300 flex items-center gap-1.5 shadow-lg animate-bounce">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Live Stroke Received
            </div>
          )}
        </div>

        {/* Toolbar & Controls */}
        <div className="p-3 bg-neutral-900 border-t border-white/10 space-y-2.5">
          {/* Row 1: Tools & Sizes */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-neutral-800/80 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setTool('neon')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  tool === 'neon'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Neon Glow Pen"
              >
                <Sparkles className="w-3.5 h-3.5" /> Neon
              </button>
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  tool === 'pen'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Classic Pen"
              >
                <Paintbrush className="w-3.5 h-3.5" /> Pen
              </button>
              <button
                type="button"
                onClick={() => setTool('calligraphy')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  tool === 'calligraphy'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Calligraphy"
              >
                <Highlighter className="w-3.5 h-3.5" /> Chisel
              </button>
              <button
                type="button"
                onClick={() => setTool('heart')}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  tool === 'heart'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Heart Stamp"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => setTool('star')}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  tool === 'star'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
                title="Star Stamp"
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  tool === 'eraser'
                    ? 'bg-neutral-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Eraser"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thickness / Stroke Width */}
            <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2 py-1 rounded-2xl border border-white/5">
              {[2, 4, 8, 14].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setLineWidth(sz)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    lineWidth === sz ? 'bg-rose-500/40 ring-2 ring-rose-400' : 'hover:bg-white/10'
                  }`}
                >
                  <span
                    className="rounded-full bg-white"
                    style={{ width: `${sz}px`, height: `${sz}px` }}
                  />
                </button>
              ))}
            </div>

            {/* Actions: Undo, Clear, Download */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyStep <= 0}
                className="p-2 text-neutral-300 hover:text-white disabled:opacity-30 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Undo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-neutral-300 hover:text-red-400 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 text-neutral-300 hover:text-white rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Save Image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Color Palette & Submit Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    setColor(c.color);
                    if (tool === 'eraser') setTool('neon');
                  }}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer border-2 shrink-0 ${
                    color === c.color && tool !== 'eraser'
                      ? 'scale-110 border-white shadow-lg'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Send Doodle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-1.5">Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Doodle 💕
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
