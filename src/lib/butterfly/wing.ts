// Build a smooth SVG path for one butterfly from its wing nodes.
// Standard butterfly: large head, small body, two mirrored wing pairs.
// NO eyes — no eye elements or params anywhere.

import type { WingNode } from "./config";

// Catmull-Rom-ish smoothing using each node's tangent handle length to build a
// closed cubic bezier contour for a single wing lobe.
export function wingPath(nodes: WingNode[], spread = 0): string {
  const n = nodes.length;
  if (n < 3) return "";
  // apply a slight vertical spread offset scaling from the wing opening angle
  const s = 1 + spread;
  const pts = nodes.map((p) => ({ x: p.x, y: p.y * s, t: p.tangent }));

  let d = `M ${fmt(pts[0].x)} ${fmt(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const t1 = p1.t;
    const t2 = p2.t;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * (t1 * 3);
    const c1y = p1.y + ((p2.y - p0.y) / 6) * (t1 * 3);
    const c2x = p2.x - ((p3.x - p1.x) / 6) * (t2 * 3);
    const c2y = p2.y - ((p3.y - p1.y) / 6) * (t2 * 3);
    d += ` C ${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(p2.x)} ${fmt(p2.y)}`;
  }
  return d + " Z";
}

// Vein polylines from body toward outer nodes (subset), returned as paths.
export function veinPaths(nodes: WingNode[], density: number): string[] {
  const out: string[] = [];
  const step = Math.max(1, Math.round(nodes.length / (2 + density * 6)));
  for (let i = 1; i < nodes.length; i += step) {
    const p = nodes[i];
    out.push(`M 0.02 0.06 Q ${fmt(p.x * 0.5)} ${fmt(p.y * 0.5)} ${fmt(p.x * 0.92)} ${fmt(p.y * 0.92)}`);
  }
  return out;
}

// Body + head geometry (head clearly larger than the thin body). No eyes.
export function bodyPath(): string {
  // head: large ellipse near top; body: tapering thorax/abdomen.
  return "M 0 -0.34 C 0.11 -0.34 0.12 -0.16 0.055 -0.06 C 0.11 0.02 0.09 0.6 0.03 0.92 C 0 1 0 1 -0.03 0.92 C -0.09 0.6 -0.11 0.02 -0.055 -0.06 C -0.12 -0.16 -0.11 -0.34 0 -0.34 Z";
}

// Two antennae (thin curves) sprouting from the head — no eyes.
export function antennaePaths(): string[] {
  return [
    "M -0.02 -0.32 C -0.14 -0.5 -0.24 -0.62 -0.34 -0.64",
    "M 0.02 -0.32 C 0.14 -0.5 0.24 -0.62 0.34 -0.64",
  ];
}

function fmt(v: number): string {
  return (Math.round(v * 1000) / 1000).toString();
}
