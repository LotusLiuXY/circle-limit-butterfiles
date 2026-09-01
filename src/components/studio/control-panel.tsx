"use client";

import { useTranslation } from "react-i18next";
import type { ButterflyConfig, ColorScheme, WingNode } from "@/lib/butterfly/config";
import { COLOR_SCHEMES } from "@/lib/butterfly/config";
import { PopSlider } from "./pop-slider";
import { NodeEditor } from "./node-editor";

interface Props {
  config: ButterflyConfig;
  setConfig: (updater: (c: ButterflyConfig) => ButterflyConfig) => void;
  tab: "compose" | "wing" | "color" | "detail";
  setTab: (t: "compose" | "wing" | "color" | "detail") => void;
}

export function ControlPanel({ config, setConfig, tab, setTab }: Props) {
  const { t } = useTranslation();

  const set = <K extends keyof ButterflyConfig>(key: K, patch: Partial<ButterflyConfig[K]>) =>
    setConfig((c) => ({ ...c, [key]: { ...c[key], ...patch } }));

  const setNodes = (nodes: WingNode[]) => setConfig((c) => ({ ...c, wing: { ...c.wing, nodes } }));

  const applyScheme = (scheme: ColorScheme) =>
    setConfig((c) => ({
      ...c,
      color: { ...c.color, scheme, stops: COLOR_SCHEMES[scheme].stops.map((s) => ({ ...s })) },
    }));

  const setStop = (i: number, patch: Partial<{ color: string; alpha: number; offset: number }>) =>
    setConfig((c) => ({
      ...c,
      color: { ...c.color, stops: c.color.stops.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) },
    }));

  const tabs: { id: Props["tab"]; label: string }[] = [
    { id: "compose", label: t("tabs.compose") },
    { id: "wing", label: t("tabs.wing") },
    { id: "color", label: t("tabs.color") },
    { id: "detail", label: t("tabs.detail") },
  ];

  return (
    <div className="flex h-full flex-col" data-el="control-panel">
      {/* tab strip — horizontal scroller, never widens page */}
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            data-el={`tab-${tb.id}`}
            onClick={() => setTab(tb.id)}
            className={`shrink-0 rounded-[6px] border-[3px] border-[#69170D] px-3 py-1.5 text-xs font-black uppercase tracking-wide transition ${
              tab === tb.id ? "bg-[#E82020] text-[#FFF7D8]" : "bg-[#FFF7D8] text-[#69170D]"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {tab === "compose" && (
          <div className="space-y-3">
            <PopSlider label={t("compose.p")} value={config.symmetry.p} min={3} max={12} onChange={(v) => set("symmetry", { p: v })} dataEl="param-p" />
            <PopSlider label={t("compose.q")} value={config.symmetry.q} min={3} max={10} onChange={(v) => set("symmetry", { q: v })} dataEl="param-q" />
            <PopSlider label={t("compose.count")} value={config.butterfly.count} min={3} max={16} onChange={(v) => set("butterfly", { count: v })} dataEl="param-count" />
            <PopSlider label={t("compose.depth")} value={config.recursion.depth} min={1} max={6} onChange={(v) => set("recursion", { depth: v })} dataEl="param-depth" />
            <PopSlider label={t("compose.curvature")} value={config.boundary.curvatureRadius} min={0.5} max={1.6} step={0.01} onChange={(v) => set("boundary", { curvatureRadius: v })} format={(v) => v.toFixed(2)} dataEl="param-curvature" />
            <PopSlider label={t("compose.rotation")} value={config.rotation.angle} min={0} max={360} onChange={(v) => set("rotation", { angle: v })} suffix="°" dataEl="param-rotation" />
          </div>
        )}

        {tab === "wing" && (
          <div className="space-y-3">
            <PopSlider label={t("wing.size")} value={Math.round(config.butterfly.size * 100)} min={8} max={45} onChange={(v) => set("butterfly", { size: v / 100 })} suffix="%" dataEl="param-size" />
            <PopSlider label={t("wing.scale")} value={config.butterfly.scale} min={0.5} max={2} step={0.05} onChange={(v) => set("butterfly", { scale: v })} format={(v) => `${v.toFixed(2)}×`} />
            <PopSlider label={t("wing.angle")} value={config.wing.angle} min={0} max={60} onChange={(v) => set("wing", { angle: v })} suffix="°" dataEl="param-wing-angle" />
            <label className="flex items-center justify-between rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] px-3 py-2">
              <span className="text-xs font-black uppercase text-[#69170D]">{t("wing.mirror")}</span>
              <input type="checkbox" checked={config.wing.mirror} onChange={(e) => set("wing", { mirror: e.target.checked })} className="h-5 w-5 accent-[#E82020]" />
            </label>
            <div className="rounded-[6px] border-[3px] border-[#69170D] bg-[#FFF7D8] p-2 text-center text-[11px] font-bold text-[#8A2418]">
              {t("wing.editHint")}
            </div>
            <NodeEditor config={config} onChange={setNodes} />
          </div>
        )}

        {tab === "color" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(COLOR_SCHEMES) as ColorScheme[]).map((s) => (
                <button
                  key={s}
                  data-el={`scheme-${s}`}
                  onClick={() => applyScheme(s)}
                  className={`rounded-[6px] border-[3px] border-[#69170D] p-1.5 text-[10px] font-black ${config.color.scheme === s ? "ring-2 ring-[#E82020] ring-offset-1" : ""}`}
                  style={{ background: `linear-gradient(135deg, ${COLOR_SCHEMES[s].stops.map((x) => x.color).join(",")})` }}
                >
                  <span className="rounded-[2px] bg-[#69170D]/85 px-1 text-[#FFF7D8]">{COLOR_SCHEMES[s].name}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase text-[#69170D]">{t("color.stops")}</div>
              {config.color.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-2 rounded-[6px] border-2 border-[#69170D] bg-[#FFF7D8] p-1.5">
                  <input type="color" value={stop.color} onChange={(e) => setStop(i, { color: e.target.value })} className="h-8 w-9 shrink-0 rounded-[3px] border-2 border-[#69170D]" />
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-bold text-[#8A2418]"><span>{t("color.alpha")}</span><span>{Math.round(stop.alpha * 100)}%</span></div>
                    <input type="range" min={0} max={1} step={0.02} value={stop.alpha} onChange={(e) => setStop(i, { alpha: Number(e.target.value) })} className="pop-range w-full" />
                  </div>
                </div>
              ))}
            </div>

            <PopSlider label={t("color.frontBack")} value={Math.round(config.color.frontBackDelta * 100)} min={0} max={80} onChange={(v) => set("color", { frontBackDelta: v / 100 })} suffix="%" dataEl="param-frontback" />
          </div>
        )}

        {tab === "detail" && (
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] px-3 py-2">
              <span className="text-xs font-black uppercase text-[#69170D]">{t("detail.veins")}</span>
              <input type="checkbox" checked={config.veins.visible} onChange={(e) => set("veins", { visible: e.target.checked })} className="h-5 w-5 accent-[#E82020]" />
            </label>
            <PopSlider label={t("detail.veinWidth")} value={config.veins.width} min={0.2} max={1.5} step={0.05} onChange={(v) => set("veins", { width: v })} format={(v) => v.toFixed(2)} />
            <PopSlider label={t("detail.texture")} value={Math.round(config.texture.density * 100)} min={0} max={100} onChange={(v) => set("texture", { density: v / 100 })} suffix="%" />
            <PopSlider label={t("detail.lightAngle")} value={config.light.angle} min={0} max={360} onChange={(v) => set("light", { angle: v })} suffix="°" />
            <PopSlider label={t("detail.lightIntensity")} value={Math.round(config.light.intensity * 100)} min={0} max={100} onChange={(v) => set("light", { intensity: v / 100 })} suffix="%" />
            <PopSlider label={t("detail.stroke")} value={config.stroke.width} min={0.4} max={3} step={0.1} onChange={(v) => set("stroke", { width: v })} format={(v) => v.toFixed(1)} />
            <div className="my-2 h-[3px] rounded bg-[#69170D]" />
            <label className="flex items-center justify-between rounded-[6px] border-[3px] border-[#69170D] bg-[#A3DBEE] px-3 py-2">
              <span className="text-xs font-black uppercase text-[#69170D]">{t("detail.animate")}</span>
              <input type="checkbox" checked={config.animation.enabled} onChange={(e) => set("animation", { enabled: e.target.checked })} className="h-5 w-5 accent-[#E82020]" />
            </label>
            <PopSlider label={t("detail.speed")} value={config.animation.speed} min={0.2} max={3} step={0.1} onChange={(v) => set("animation", { speed: v })} format={(v) => `${v.toFixed(1)}×`} />
            <PopSlider label={t("detail.opacity")} value={Math.round(config.animation.opacity * 100)} min={20} max={100} onChange={(v) => set("animation", { opacity: v / 100 })} suffix="%" />
            <PopSlider label={t("detail.loop")} value={Math.round(config.animation.loopDuration / 100) / 10} min={1} max={10} step={0.1} onChange={(v) => set("animation", { loopDuration: v * 1000 })} format={(v) => `${v.toFixed(1)}s`} />
          </div>
        )}
      </div>
    </div>
  );
}
