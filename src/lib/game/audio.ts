// Web Audio pentatonic chime + harmony engine. No audio files — all synthesized.
// Each butterfly maps to one note of a pentatonic scale; a successful symmetry
// snap plays a harmonious chord.

// Major pentatonic scale (C, D, E, G, A) across two octaves — bright & clear.
const PENTATONIC_HZ = [
  261.63, 293.66, 329.63, 392.0, 440.0, // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.0, // C5 D5 E5 G5 A5
];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  return ctx;
}

// Must be called from a user gesture to unlock audio on mobile browsers.
export function unlockAudio(): void {
  const c = ensureCtx();
  if (c && c.state === "suspended") void c.resume();
}

export function setMuted(v: boolean): void {
  muted = v;
  if (master) master.gain.value = v ? 0 : 0.5;
}

export function isMuted(): boolean {
  return muted;
}

// Pentatonic note index for a butterfly id (stable, wraps across the scale).
export function noteForIndex(index: number): number {
  return PENTATONIC_HZ[((index % PENTATONIC_HZ.length) + PENTATONIC_HZ.length) % PENTATONIC_HZ.length];
}

function playTone(freq: number, when: number, duration: number, gain: number, type: OscillatorType = "sine") {
  const c = ensureCtx();
  if (!c || !master || muted) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + when;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

// A single clear note when a butterfly is highlighted / tapped.
export function playNote(index: number): void {
  playTone(noteForIndex(index), 0, 0.5, 0.28, "triangle");
  // soft octave shimmer
  playTone(noteForIndex(index) * 2, 0, 0.32, 0.06, "sine");
}

// Harmonious chord on a successful symmetry snap. Root from the base note plus
// pentatonic thirds/fifths, arpeggiated slightly for a bright resolve.
export function playSuccessChord(baseIndex: number): void {
  const root = noteForIndex(baseIndex);
  const chord = [root, root * 1.25, root * 1.5, root * 2]; // root, maj3-ish, 5th, octave
  chord.forEach((f, i) => playTone(f, i * 0.045, 0.9, 0.22, "triangle"));
}

// Gentle "not yet" cue for a missed / off snap.
export function playMiss(): void {
  playTone(196.0, 0, 0.18, 0.14, "sawtooth");
  playTone(185.0, 0.06, 0.2, 0.1, "sawtooth");
}

// Rising fanfare when a level / round is cleared.
export function playFanfare(): void {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, i * 0.1, 0.7, 0.22, "triangle"));
}

// Tick for the countdown timer.
export function playTick(): void {
  playTone(880, 0, 0.05, 0.08, "square");
}
