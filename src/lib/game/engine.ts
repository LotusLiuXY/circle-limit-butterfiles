// 对称匠 (Symmetry Smith) core game logic.
// A butterfly appears rotated away from its correct symmetry angle (and maybe
// mirror-flipped). The player rotates/flips it to "complete" the symmetry.
// A snap within tolerance = success chord + score; combo & timer drive scoring.

import type { ColorScheme } from "@/lib/butterfly/config";
import { COLOR_SCHEMES } from "@/lib/butterfly/config";

export interface Puzzle {
  id: number;
  targetAngle: number; // the correct symmetry angle (deg) the piece must reach
  startAngle: number; // where the broken piece begins
  needsFlip: boolean; // true if the piece is mirror-flipped and must be un-flipped
  scheme: ColorScheme;
  noteIndex: number; // pentatonic note for this butterfly
  tolerance: number; // acceptable |angle - target| in deg for a snap
}

export interface GameState {
  status: "idle" | "playing" | "over";
  score: number;
  combo: number;
  bestCombo: number;
  round: number; // solved count
  timeLeft: number; // seconds
  puzzle: Puzzle | null;
}

export const ROUND_TIME = 45; // seconds per game
const SCHEMES = Object.keys(COLOR_SCHEMES) as ColorScheme[];

let seq = 0;

// Tolerance shrinks as the player solves more — the game gets harder.
function toleranceForRound(round: number): number {
  return Math.max(6, 20 - round * 0.8);
}

export function makePuzzle(round: number): Puzzle {
  seq += 1;
  // target is one of the p-fold symmetry angles; use a random multiple of 30°
  const target = Math.round((Math.random() * 11)) * 30 % 360;
  // start offset large enough to require real rotation
  let start = target + (40 + Math.random() * 260);
  start = ((start % 360) + 360) % 360;
  const needsFlip = round > 2 && Math.random() < 0.4;
  return {
    id: seq,
    targetAngle: target,
    startAngle: Math.round(start),
    needsFlip,
    scheme: SCHEMES[Math.floor(Math.random() * SCHEMES.length)],
    noteIndex: seq,
    tolerance: toleranceForRound(round),
  };
}

// Smallest absolute angular difference in [0,180].
export function angleDiff(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

// Is the current piece aligned enough to snap?
export function isSnapped(puzzle: Puzzle, angle: number, flipped: boolean): boolean {
  const flipOk = flipped === puzzle.needsFlip;
  return flipOk && angleDiff(angle, puzzle.targetAngle) <= puzzle.tolerance;
}

// Score for a snap: base + precision bonus + combo multiplier.
export function scoreSnap(puzzle: Puzzle, angle: number, combo: number): number {
  const precision = 1 - angleDiff(angle, puzzle.targetAngle) / puzzle.tolerance; // 0..1
  const base = 100;
  const precisionBonus = Math.round(precision * 80);
  const comboMult = 1 + Math.min(combo, 10) * 0.15;
  return Math.round((base + precisionBonus) * comboMult);
}

export function initialState(): GameState {
  return {
    status: "idle",
    score: 0,
    combo: 0,
    bestCombo: 0,
    round: 0,
    timeLeft: ROUND_TIME,
    puzzle: null,
  };
}
