"use client";

import { useEffect, useState } from "react";
import { CircleCanvas } from "@/components/studio/circle-canvas";
import { defaultConfig, COLOR_SCHEMES, type ButterflyConfig, type ColorScheme } from "@/lib/butterfly/config";

// Deterministic, privacy-safe preview data. No auth, no product state.
const COVER_PREVIEW_DATA: { p: number; q: number; count: number; rot: number; scheme: ColorScheme }[] = [
  { p: 5, q: 4, count: 5, rot: 0, scheme: "escher" },
  { p: 6, q: 4, count: 7, rot: 30, scheme: "aurora" },
  { p: 7, q: 3, count: 6, rot: 60, scheme: "ember" },
  { p: 8, q: 3, count: 8, rot: 90, scheme: "jade" },
];

export function CoverPreview() {
  const [step, setStep] = useState(0);
  const [flap, setFlap] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % COVER_PREVIEW_DATA.length), 1200);
    let raf: number;
    const loop = (ts: number) => {
      setFlap((Math.sin((ts / 900) * Math.PI * 2) + 1) / 2);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  const d = COVER_PREVIEW_DATA[step];
  const config: ButterflyConfig = {
    ...defaultConfig(),
    symmetry: { p: d.p, q: d.q },
    butterfly: { count: d.count, size: 0.24, scale: 1 },
    rotation: { angle: d.rot },
    recursion: { depth: 3 },
    color: { scheme: d.scheme, stops: COLOR_SCHEMES[d.scheme].stops.map((s) => ({ ...s })), frontBackDelta: 0.28 },
  };

  return (
    <div className="pop-checker flex h-full min-h-screen w-full items-center justify-center p-4">
      <div className="relative aspect-square w-full max-w-[360px] rounded-[16px] border-[4px] border-[#69170D] bg-[#FFF7D8] shadow-[0_8px_0_rgba(105,23,13,0.25)]">
        <div className="absolute inset-0 overflow-hidden rounded-[12px] transition-all duration-700">
          <CircleCanvas config={config} flap={flap} />
        </div>
        <div className="pointer-events-none absolute right-2 top-2 rounded-[6px] border-[3px] border-[#69170D] bg-[#E82020] px-2 py-1 text-right font-mono text-[10px] font-bold leading-tight text-[#FFF7D8]">
          {`{${d.p},${d.q}}`}
        </div>
      </div>
    </div>
  );
}
