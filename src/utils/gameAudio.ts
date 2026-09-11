// Web Audio API Sound Synthesizer for Couple Tic-Tac-Toe
// Crystal-clear procedural chimes with zero external sound dependencies

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// User requested: "Keep sound OFF by default and provide a mute/unmute control"
export function isSoundMuted(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('shoonaconnect_tictactoe_sound_muted');
  // Default to muted (true) unless explicitly unmuted ('false')
  return stored === null ? true : stored === 'true';
}

export function setSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('shoonaconnect_tictactoe_sound_muted', muted ? 'true' : 'false');
}

/**
 * Play a delicate crystal tap/ping when a move is played.
 */
export function playMoveSound(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Sweet romantic chime frequency jump: 660Hz -> 880Hz
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  } catch (err) {
    console.debug('Audio playMove error:', err);
  }
}

/**
 * Play a celebratory romantic victory arpeggio when a partner wins.
 */
export function playWinSound(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Sweet ascending chord (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, index) => {
      const noteStart = now + index * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.25, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.46);
    });
  } catch (err) {
    console.debug('Audio playWin error:', err);
  }
}

/**
 * Play a gentle soft bell when a draw occurs.
 */
export function playDrawSound(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 392]; // A4 -> G4 gentle resolution

    notes.forEach((freq, index) => {
      const noteStart = now + index * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.18, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.36);
    });
  } catch (err) {
    console.debug('Audio playDraw error:', err);
  }
}
