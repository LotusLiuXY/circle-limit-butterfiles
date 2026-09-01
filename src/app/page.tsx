"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Languages, RotateCcw, Play, Pause, Gamepad2 } from "lucide-react";
import { changeLocale, getLocalePreference, normalizeLocale, type LocaleCode } from "@/i18n";
import { defaultConfig, type ButterflyConfig } from "@/lib/butterfly/config";
import { CircleCanvas } from "@/components/studio/circle-canvas";
import { ControlPanel } from "@/components/studio/control-panel";

type Tab = "compose" | "wing" | "color" | "detail";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<ButterflyConfig>(() => defaultConfig());
  const [tab, setTab] = useState<Tab>("compose");
  const [flap, setFlap] = useState(0);
  const raf = useRef<number | null>(null);

  // Wing-flap / drift animation loop, top-most layer.
  useEffect(() => {
    if (!config.animation.enabled) return;
    let mounted = true;
    const loop = (ts: number) => {
      if (!mounted) return;
      const cycle = config.animation.loopDuration / config.animation.speed;
      const phase = (ts % cycle) / cycle;
      setFlap((Math.sin(phase * Math.PI * 2) + 1) / 2);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [config.animation.enabled, config.animation.loopDuration, config.animation.speed]);

  const toggleLocale = useCallback(async () => {
    const active = normalizeLocale(i18n.resolvedLanguage || i18n.language) ?? "en-US";
    await changeLocale((active === "zh-CN" ? "en-US" : "zh-CN") as LocaleCode);
  }, [i18n]);

  useEffect(() => { void getLocalePreference(); }, []);

  return (
    <div className="pop-checker mx-auto flex min-h-screen w-full max-w-[640px] flex-col" data-el="studio-root">
      {/* Header */}
      <header
        className="flex items-center justify-between gap-2 border-b-[4px] border-[#69170D] bg-[#F7DE07] px-4"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))", paddingBottom: "12px" }}
        data-el="studio-header"
      >
        <div className="min-w-0">
          <h1 className="pop-heading truncate text-2xl leading-none text-[#69170D]">{t("app.title")}</h1>
          <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-[#8A2418]">{t("app.tagline")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/play"
            className="flex items-center gap-1 rounded-[6px] border-[3px] border-[#69170D] bg-[#E82020] px-2.5 py-1 text-xs font-black text-[#FFF7D8]"
            data-el="to-game"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            {t("game.play")}
          </Link>
          <button
            onClick={() => void toggleLocale()}
            className="flex items-center gap-1 rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] px-2 py-1 text-xs font-black text-[#69170D]"
            data-el="lang-toggle"
            aria-label={t("language.label")}
          >
            <Languages className="h-3.5 w-3.5" />
            {(normalizeLocale(i18n.resolvedLanguage || i18n.language) ?? "en-US") === "zh-CN" ? "中" : "EN"}
          </button>
        </div>
      </header>

      {/* Stage: circle-limit canvas */}
      <div className="relative flex items-center justify-center p-2" data-el="stage">
        <div className="relative aspect-square w-full max-w-[560px] rounded-[18px] border-[5px] border-[#69170D] bg-[#FFF7D8] shadow-[0_10px_0_rgba(105,23,13,0.25)]">
          <div className="checker-pulse absolute inset-0 overflow-hidden rounded-[12px]">
            <CircleCanvas config={config} flap={config.animation.enabled ? flap : 0} />
          </div>
          {/* badge param summary */}
          <div className="pointer-events-none absolute right-2 top-2 rounded-[6px] border-[3px] border-[#69170D] bg-[#E82020] px-2 py-1 text-right font-mono text-[10px] font-bold leading-tight text-[#FFF7D8]">
            <div>{`{${config.symmetry.p},${config.symmetry.q}}`}</div>
            <div>×{config.butterfly.count}</div>
          </div>
          {/* animation + reset controls */}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            <button
              onClick={() => setConfig((c) => ({ ...c, animation: { ...c.animation, enabled: !c.animation.enabled } }))}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] text-[#69170D]"
              data-el="anim-toggle"
              aria-label={t("detail.animate")}
            >
              {config.animation.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setConfig(() => defaultConfig())}
              className="flex h-8 w-8 items-center justify-center rounded-[6px] border-[3px] border-[#69170D] bg-[#FFF7D8] text-[#69170D]"
              data-el="reset"
              aria-label={t("app.reset")}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Control panel */}
      <div className="min-h-0 flex-1 border-t-[4px] border-[#69170D] bg-[#F7DE07] px-4 pt-3" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}>
        <ControlPanel config={config} setConfig={setConfig} tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
