"use client";

import { useRef } from "react";
import { Butterfly } from "@/components/studio/butterfly";
import { defaultConfig, COLOR_SCHEMES, type ButterflyConfig } from "@/lib/butterfly/config";
import type { Puzzle } from "@/lib/game/engine";

interface Props {
  puzzle: Puzzle;
  angle: number;
  flipped: boolean;
  snapped: boolean;
  flap: number;
  onRotate: (deg: number) => void;
}

const R = 500;

function schemeConfig(scheme: string, flipped: boolean): ButterflyConfig {
  const s = scheme as keyof typeof COLOR_SCHEMES;
  return {
    ...defaultConfig(),
    butterfly: { count: 1, size: 0.5, scale: 1 },
    wing: { ...defaultConfig().wing, mirror: flipped },
    color: { scheme: s, stops: COLOR_SCHEMES[s].stops.map((x) => ({ ...x })), frontBackDelta: 0.28 },
    animation: { ...defaultConfig().animation, enabled: false },
  };
}

// Rotatable symmetry puzzle board. Drag anywhere on the disc to rotate the
// broken butterfly toward its ghost target outline.
export function GameBoard({ puzzle, angle, flipped, snapped, flap, onRotate }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastAngle = useRef(0);

  const cfg = schemeConfig(puzzle.scheme, flipped);
  const targetCfg = schemeConfig(puzzle.scheme, puzzle.needsFlip);

  function pointerAngle(clientX: number, clientY: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    lastAngle.current = pointerAngle(e.clientX, e.clientY);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const a = pointerAngle(e.clientX, e.clientY);
    let delta = a - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = a;
    onRotate(((angle + delta) % 360 + 360) % 360);
  }
  function onUp() {
    dragging.current = false;
  }

  return (
    <svg
      ref={svgRef}
      viewBox="-540 -540 1080 1080"
      className="h-full w-full touch-none select-none"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      data-el="game-board"
    >
      <defs>
        <radialGradient id="g-grad" cx="35%" cy="30%" r="80%">
          {cfg.color.stops.map((s, i) => (
            <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} stopOpacity={s.alpha} />
          ))}
        </radialGradient>
        <radialGradient id="g-grad-back" cx="35%" cy="30%" r="80%">
          {cfg.color.stops.map((s, i) => (
            <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} stopOpacity={s.alpha * 0.85} />
          ))}
        </radialGradient>
      </defs>

      {/* boundary disc */}
      <circle cx="0" cy="0" r={R} fill="#FFF7D8" stroke="#69170D" strokeWidth="12" />

      {/* ghost target outline — where the piece must land */}
      <g opacity={snapped ? 0 : 0.22} transform={`rotate(${puzzle.targetAngle}) scale(${R * targetCfg.butterfly.size})`}>
        <Butterfly config={targetCfg} gradientId="g-grad" backGradientId="g-grad-back" flap={0} />
      </g>

      {/* the rotatable / flippable butterfly piece */}
      <g
        transform={`rotate(${angle}) scale(${R * cfg.butterfly.size})`}
        style={{ transition: snapped ? "transform 0.25s cubic-bezier(.2,.8,.2,1)" : undefined }}
      >
        <Butterfly config={cfg} gradientId="g-grad" backGradientId="g-grad-back" flap={snapped ? flap : 0} />
      </g>

      {/* snap glow */}
      {snapped && <circle cx="0" cy="0" r={R} fill="none" stroke="#30A830" strokeWidth="16" opacity="0.9" />}
      <circle cx="0" cy="0" r={R} fill="none" stroke="#69170D" strokeWidth="12" />
    </svg>
  );
}
