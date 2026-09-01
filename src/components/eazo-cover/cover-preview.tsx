"use client";

import { useEffect, useState } from "react";
import { Butterfly } from "@/components/studio/butterfly";
import { defaultConfig, COLOR_SCHEMES, type ButterflyConfig, type ColorScheme } from "@/lib/butterfly/config";

// Deterministic, privacy-safe preview: a butterfly rotates into symmetry and
// snaps green (the game's core "complete the symmetry" moment). No auth, no state.
const COVER_PREVIEW_DATA: { scheme: ColorScheme }[] = [{ scheme: "escher" }, { scheme: "aurora" }];

const R = 500;
const TARGET = 0;

function cfg(scheme: ColorScheme): ButterflyConfig {
  return {
    ...defaultConfig(),
    butterfly: { count: 1, size: 0.5, scale: 1 },
    color: { scheme, stops: COLOR_SCHEMES[scheme].stops.map((s) => ({ ...s })), frontBackDelta: 0.28 },
    animation: { ...defaultConfig().animation, enabled: false },
  };
}

export function CoverPreview() {
  const [round, setRound] = useState(0);
  const [angle, setAngle] = useState(160);
  const [snapped, setSnapped] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const CYCLE = 2600;
    const loop = (now: number) => {
      const p = ((now - start) % CYCLE) / CYCLE;
      if (p < 0.7) {
        setAngle(160 - (160 * p) / 0.7);
        setSnapped(false);
      } else {
        setAngle(TARGET);
        setSnapped(true);
      }
      if (p > 0.98) setRound((r) => (r + 1) % COVER_PREVIEW_DATA.length);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const config = cfg(COVER_PREVIEW_DATA[round].scheme);

  return (
    <div className="pop-checker flex h-full min-h-screen w-full items-center justify-center p-4">
      <div className="relative aspect-square w-full max-w-[360px] rounded-[16px] border-[4px] border-[#69170D] bg-[#FFF7D8] shadow-[0_8px_0_rgba(105,23,13,0.25)]">
        <div className="absolute inset-0 overflow-hidden rounded-[12px]">
          <svg viewBox="-540 -540 1080 1080" className="h-full w-full">
            <defs>
              <radialGradient id="cp-grad" cx="35%" cy="30%" r="80%">
                {config.color.stops.map((s, i) => (
                  <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} stopOpacity={s.alpha} />
                ))}
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r={R} fill="#FFF7D8" stroke="#69170D" strokeWidth="12" />
            <g opacity={snapped ? 0 : 0.22} transform={`rotate(${TARGET}) scale(${R * 0.5})`}>
              <Butterfly config={config} gradientId="cp-grad" backGradientId="cp-grad" flap={0} />
            </g>
            <g transform={`rotate(${angle}) scale(${R * 0.5})`}>
              <Butterfly config={config} gradientId="cp-grad" backGradientId="cp-grad" flap={0} />
            </g>
            {snapped && <circle cx="0" cy="0" r={R} fill="none" stroke="#30A830" strokeWidth="16" opacity="0.9" />}
            <circle cx="0" cy="0" r={R} fill="none" stroke="#69170D" strokeWidth="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}
