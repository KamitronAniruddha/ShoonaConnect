import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Radio, Sparkles, Music2, Waves, Flame, CloudRain } from 'lucide-react';

interface SoundscapeTrack {
  id: string;
  name: string;
  subtitle: string;
  icon: typeof CloudRain;
  color: string;
  baseFreq: number;
  noiseType: 'rain' | 'fire' | 'ocean' | 'ambient' | 'acoustic';
}

const TRACKS: SoundscapeTrack[] = [
  {
    id: 'tokyo-rain',
    name: 'Starlight Rain & Lo-Fi',
    subtitle: 'Gentle raindrops on glass window',
    icon: CloudRain,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-500',
    baseFreq: 220,
    noiseType: 'rain',
  },
  {
    id: 'cozy-fireplace',
    name: 'Midnight Fireplace',
    subtitle: 'Warm hearth & crackling embers',
    icon: Flame,
    color: 'from-amber-500/20 to-rose-500/20 text-amber-500',
    baseFreq: 174,
    noiseType: 'fire',
  },
  {
    id: 'whispering-ocean',
    name: 'Whispering Ocean & Piano',
    subtitle: 'Tides receding under midnight moon',
    icon: Waves,
    color: 'from-cyan-500/20 to-teal-500/20 text-cyan-500',
    baseFreq: 285,
    noiseType: 'ocean',
  },
  {
    id: 'celestial-ambient',
    name: 'Celestial Soul Dreamscape',
    subtitle: '432Hz deep meditative love harmonic',
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-500',
    baseFreq: 432,
    noiseType: 'ambient',
  },
  {
    id: 'acoustic-sunset',
    name: 'Sunset Rooftop Acoustic',
    subtitle: 'Warm gentle acoustic guitar loops',
    icon: Music2,
    color: 'from-rose-500/20 to-pink-500/20 text-rose-500',
    baseFreq: 330,
    noiseType: 'acoustic',
  },
];

interface RomanticSoundscapesWidgetProps {
  partnerName?: string;
  isPartnerOnline?: boolean;
}

export const RomanticSoundscapesWidget: React.FC<RomanticSoundscapesWidgetProps> = ({
  partnerName = 'Sweetheart',
  isPartnerOnline = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<SoundscapeTrack>(TRACKS[0]);
  const [volume, setVolume] = useState<number>(0.4);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize and update Audio Synthesizer
  const stopAudio = () => {
    try {
      oscNodesRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      oscNodesRef.current = [];

      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop();
          noiseNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        noiseNodeRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  const startAudio = (track: SoundscapeTrack) => {
    stopAudio();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.35, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(track.noiseType === 'rain' ? 1200 : 800, ctx.currentTime);
      filter.connect(masterGain);
      filterNodeRef.current = filter;

      // 1. Chords / Ambient Harmonic Oscillators (Solfege love chord)
      const freqs = [
        track.baseFreq,
        track.baseFreq * 1.25, // Major third
        track.baseFreq * 1.5,  // Perfect fifth
        track.baseFreq * 1.875 // Major seventh
      ];

      const newOscs: OscillatorNode[] = [];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        // Sub-oscillator subtle chorus LFO
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);

        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        newOscs.push(osc);
      });
      oscNodesRef.current = newOscs;

      // 2. Synthesized Pink / Brown Noise generator for natural ambience (rain, fireplace, ocean)
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(
        track.noiseType === 'rain' ? 0.25 : track.noiseType === 'ocean' ? 0.18 : 0.08,
        ctx.currentTime
      );

      whiteNoise.connect(noiseGain);
      noiseGain.connect(filter);
      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;

      setIsPlaying(true);
    } catch (err) {
      console.error('Romantic Radio Audio Synth Error:', err);
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume * 0.35,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Track switch while playing
  const handleSelectTrack = (track: SoundscapeTrack) => {
    setActiveTrack(track);
    if (isPlaying) {
      startAudio(track);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activeTrack);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-rose-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-rose-400/10 via-purple-400/10 to-transparent blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                Sanctuary Lo-Fi & Romantic Radio
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-black text-[9px] uppercase tracking-wider border border-rose-200 dark:border-rose-900/40 shrink-0">
                Live Synth
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {isPlaying ? (
                <span className="text-rose-500 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Playing for both of you • {isPartnerOnline ? `${partnerName} can hear` : 'Private Sanctuary Space'}
                </span>
              ) : (
                'Relaxing soundscapes for late-night talks & intimate study'
              )}
            </p>
          </div>
        </div>

        {/* Master Play / Pause Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950/50'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Radio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-rose-500" />
                <span>Play Soundscape</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Track Selection Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {TRACKS.map((track) => {
          const Icon = track.icon;
          const isSelected = activeTrack.id === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onClick={() => handleSelectTrack(track)}
              className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-2.5 min-w-0 ${
                isSelected
                  ? 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-slate-800 dark:to-rose-950/40 border-rose-300 dark:border-rose-800 shadow-sm ring-1 ring-rose-400'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 ${track.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {track.name}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {track.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Volume & Dynamic Visualizer Bar */}
      <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-24 sm:w-32 accent-rose-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-semibold w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
        </div>

        {/* Animated equalizer waves when playing */}
        <div className="flex items-center gap-1 h-4">
          {[12, 22, 16, 28, 14, 20, 26, 15, 24, 18].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-rose-500 transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'opacity-20'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (h * (isMuted ? 0.2 : volume)))}px` : '4px',
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
          <span className="text-[10px] font-bold text-rose-500/80 ml-2">
            {isPlaying ? `${activeTrack.baseFreq}Hz tuned` : 'Radio Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};
