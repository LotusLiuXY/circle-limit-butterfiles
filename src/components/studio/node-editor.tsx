"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ButterflyConfig, WingNode } from "@/lib/butterfly/config";
import { wingPath, veinPaths, bodyPath } from "@/lib/butterfly/wing";

interface Props {
  config: ButterflyConfig;
  onChange: (nodes: WingNode[]) => void;
}

const VB = 260; // viewBox half-size; wing-local coords scaled by SCALE
const SCALE = 90;

// Node editor: magnified motif with per-node draggable coords + tangent handles.
export function NodeEditor({ config, onChange }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ index: number; mode: "point" | "tangent" } | null>(null);

  const nodes = config.wing.nodes;
  const path = wingPath(nodes, (config.wing.angle / 90) * 0.5);
  const vp = config.veins.visible ? veinPaths(nodes, config.texture.density) : [];

  function toLocal(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * (VB * 2) - VB;
    const py = ((clientY - rect.top) / rect.height) * (VB * 2) - VB;
    return { x: px / SCALE, y: py / SCALE };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragging.current;
    if (!d) return;
    const { x, y } = toLocal(e.clientX, e.clientY);
    const next = nodes.map((n, i) => {
      if (i !== d.index) return n;
      if (d.mode === "point") return { ...n, x, y };
      // tangent handle: length from node position
      const dx = x - n.x;
      const dy = y - n.y;
      const len = Math.max(0.05, Math.min(0.6, Math.hypot(dx, dy)));
      return { ...n, tangent: Math.round(len * 100) / 100 };
    });
    onChange(next);
  }

  function startDrag(index: number, mode: "point" | "tangent", e: React.PointerEvent) {
    e.stopPropagation();
    setSelected(index);
    dragging.current = { index, mode };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  const sel = nodes[selected];

  function updateField(field: keyof WingNode, value: number) {
    onChange(nodes.map((n, i) => (i === selected ? { ...n, [field]: value } : n)));
  }

  return (
    <div className="space-y-3" data-el="node-editor">
      <svg
        ref={svgRef}
        viewBox={`${-VB} ${-VB} ${VB * 2} ${VB * 2}`}
        className="aspect-square w-full touch-none rounded-[6px] border-[3px] border-[#69170D] bg-[#FFF7D8]"
        onPointerMove={onPointerMove}
        onPointerUp={() => (dragging.current = null)}
      >
        {/* checker close-up */}
        <defs>
          <pattern id="ck" width="52" height="52" patternUnits="userSpaceOnUse">
            <rect width="52" height="52" fill="#FFF7D8" />
            <rect width="26" height="26" fill="#F7DE07" opacity="0.5" />
            <rect x="26" y="26" width="26" height="26" fill="#F7DE07" opacity="0.5" />
          </pattern>
          <radialGradient id="edit-grad" cx="35%" cy="30%" r="80%">
            {config.color.stops.map((s, i) => (
              <stop key={i} offset={`${s.offset * 100}%`} stopColor={s.color} stopOpacity={s.alpha} />
            ))}
          </radialGradient>
        </defs>
        <rect x={-VB} y={-VB} width={VB * 2} height={VB * 2} fill="url(#ck)" />

        <g transform={`scale(${SCALE})`}>
          {/* mirrored wing outline preview */}
          <g transform="scale(-1,1)" opacity={0.85}>
            <path d={path} fill="url(#edit-grad)" stroke="#69170D" strokeWidth={0.02} />
          </g>
          <path d={path} fill="url(#edit-grad)" stroke="#69170D" strokeWidth={0.02} strokeLinejoin="round" />
          {vp.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#69170D" strokeOpacity={0.5} strokeWidth={config.veins.width * 0.008} />
          ))}
          <path d={bodyPath()} fill="#69170D" />
        </g>

        {/* control nodes + tangent handles */}
        {nodes.map((n, i) => {
          const cx = n.x * SCALE;
          const cy = n.y * SCALE;
          const tx = cx + n.tangent * SCALE * 0.8;
          const isSel = i === selected;
          return (
            <g key={i}>
              {isSel && (
                <>
                  <line x1={cx} y1={cy} x2={tx} y2={cy} stroke="#E82020" strokeWidth={2} />
                  <circle
                    cx={tx}
                    cy={cy}
                    r={7}
                    fill="#FFF7D8"
                    stroke="#E82020"
                    strokeWidth={3}
                    style={{ cursor: "ew-resize" }}
                    onPointerDown={(e) => startDrag(i, "tangent", e)}
                  />
                </>
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isSel ? 9 : 6}
                fill={isSel ? "#E82020" : "#F7DE07"}
                stroke="#69170D"
                strokeWidth={3}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => startDrag(i, "point", e)}
              />
            </g>
          );
        })}
      </svg>

      {/* selected-node precise fields */}
      <div className="rounded-[6px] border-[3px] border-[#69170D] bg-[#F7DE07] p-3">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-[3px] bg-[#69170D] px-2 py-0.5 text-[11px] font-black text-[#F7DE07]">
            {t("editor.node")} #{selected + 1}/{nodes.length}
          </span>
          <div className="flex gap-1">
            <button
              className="rounded-[3px] border-2 border-[#69170D] bg-[#FFF7D8] px-2 text-sm font-black text-[#69170D]"
              onClick={() => setSelected((s) => (s - 1 + nodes.length) % nodes.length)}
            >
              ‹
            </button>
            <button
              className="rounded-[3px] border-2 border-[#69170D] bg-[#FFF7D8] px-2 text-sm font-black text-[#69170D]"
              onClick={() => setSelected((s) => (s + 1) % nodes.length)}
            >
              ›
            </button>
          </div>
        </div>
        <NumberRow label="X" value={sel.x} min={-1.5} max={1.5} step={0.01} onChange={(v) => updateField("x", v)} />
        <NumberRow label="Y" value={sel.y} min={-1.5} max={1.5} step={0.01} onChange={(v) => updateField("y", v)} />
        <NumberRow label={t("editor.tangent")} value={sel.tangent} min={0.05} max={0.6} step={0.01} onChange={(v) => updateField("tangent", v)} />
      </div>
    </div>
  );
}

function NumberRow({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="w-14 text-[11px] font-bold text-[#69170D]">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="pop-range flex-1" />
      <span className="w-12 rounded-[3px] bg-[#69170D] px-1 text-right font-mono text-[10px] font-bold text-[#F7DE07]">{value.toFixed(2)}</span>
    </div>
  );
}
