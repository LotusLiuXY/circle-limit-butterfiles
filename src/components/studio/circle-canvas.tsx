"use client";

import { memo, useMemo } from "react";
import type { ButterflyConfig } from "@/lib/butterfly/config";
import { generatePlacements, geodesicPath } from "@/lib/butterfly/hyperbolic";
import { Butterfly } from "./butterfly";

interface Props {
  config: ButterflyConfig;
  flap: number;
  onSelect?: () => void;
}

const R = 500; // disc radius in SVG user units (viewBox -520..520)

export const CircleCanvas = memo(function CircleCanvas({ config, flap, onSelect }: Props) {
  const placements = useMemo(
    () =>
      generatePlacements(
        config.symmetry.p,
        config.symmetry.q,
        config.butterfly.count,
        config.recursion.depth,
        config.boundary.curvatureRadius,
        config.rotation.angle,
      ),
    [config.symmetry.p, config.symmetry.q, config.butterfly.count, config.recursion.depth, config.boundary.curvatureRadius, config.rotation.angle],
  );

  // geodesic guide lines connecting a few boundary anchor points
  const geodesics = useMemo(() => {
    const arcs: string[] = [];
    const n = Math.max(3, config.symmetry.p);
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 + (config.rotation.angle * Math.PI) / 180;
      const a2 = ((i + 2) / n) * Math.PI * 2 + (config.rotation.angle * Math.PI) / 180;
      arcs.push(geodesicPath(Math.cos(a1), Math.sin(a1), Math.cos(a2), Math.sin(a2), R * 0.985));
    }
    return arcs;
  }, [config.symmetry.p, config.rotation.angle]);

  const stops = config.color.stops;
  const motifSize = R * config.butterfly.size * config.butterfly.scale * config.wing.scale;

  return (
    <svg
      viewBox="-520 -520 1040 1040"
      className="h-full w-full"
      style={{ opacity: config.animation.opacity }}
      data-el="circle-canvas"
    >
      <defs>
        <clipPath id="disc-clip">
          <circle cx="0" cy="0" r={R} />
        </clipPath>
        <radialGradient id="wing-grad" cx="35%" cy="30%" r="80%">
          {stops.map((s, i) => (
            <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} stopOpacity={s.alpha} />
          ))}
        </radialGradient>
        <radialGradient id="wing-grad-back" cx="35%" cy="30%" r="80%">
          {stops.map((s, i) => (
            <stop
              key={i}
              offset={`${s.offset * 100}%`}
              stopColor={shade(s.color, config.color.frontBackDelta)}
              stopOpacity={s.alpha}
            />
          ))}
        </radialGradient>
        <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#69170D" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* boundary disc */}
      <circle cx="0" cy="0" r={R} fill="#FFF7D8" stroke="#69170D" strokeWidth="10" />

      <g clipPath="url(#disc-clip)">
        {/* faint geodesic guides */}
        {geodesics.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#69170D" strokeOpacity={0.14} strokeWidth={3} />
        ))}

        {/* butterfly array, top-most (drawn last), largest first for z-order */}
        <g filter="url(#soft-shadow)" onClick={onSelect} style={{ cursor: onSelect ? "pointer" : "default" }}>
          {placements
            .slice()
            .sort((a, b) => b.scale - a.scale)
            .map((pl) => {
              const size = motifSize * pl.scale;
              return (
                <g
                  key={pl.key}
                  transform={`translate(${pl.x * R} ${pl.y * R}) rotate(${(pl.rot * 180) / Math.PI}) scale(${size})`}
                >
                  <Butterfly config={config} gradientId="wing-grad" backGradientId="wing-grad-back" flap={pl.ring === 0 ? flap : flap * 0.6} />
                </g>
              );
            })}
        </g>
      </g>

      {/* boundary rim on top */}
      <circle cx="0" cy="0" r={R} fill="none" stroke="#69170D" strokeWidth="10" />
    </svg>
  );
});

// Lighten or darken a hex color by delta (front/back difference).
function shade(hex: string, delta: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = 1 - delta * 0.6;
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${((c(r) << 16) | (c(g) << 8) | c(b)).toString(16).padStart(6, "0")}`;
}
