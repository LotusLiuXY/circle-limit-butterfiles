// Poincaré disk hyperbolic geometry helpers for the Circle Limit layout.
// Butterflies are placed on {p,q} symmetry orbits and mapped toward the
// boundary via Möbius transforms so motifs shrink as they approach the edge.

export interface Placement {
  x: number; // disc coord in [-1, 1]
  y: number;
  scale: number; // 0..1 relative motif scale (shrinks toward boundary)
  rot: number; // rotation in radians
  ring: number; // recursion ring index
  key: string;
}

// Euclidean radius (in the unit Poincaré disk) of the {p,q} first ring
// of regular polygon centers. Derived from the standard hyperbolic tiling
// formula. curvatureRadius biases how quickly motifs pack toward the edge.
function baseRingRadius(p: number, q: number, curvatureRadius: number): number {
  const pa = Math.PI / p;
  const qa = Math.PI / q;
  const denom = Math.cos(pa) * Math.cos(pa) - Math.sin(qa) * Math.sin(qa);
  // guard against degenerate (non-hyperbolic) {p,q}
  const safe = Math.max(0.02, denom);
  let r = Math.sqrt(Math.cos(pa + qa) / Math.cos(pa - qa || 1e-3));
  if (!isFinite(r) || r <= 0) r = Math.sqrt(safe) * 0.5;
  r = Math.min(0.86, Math.max(0.22, r));
  // curvatureRadius in ~[0.5,1.6] pushes ring inward/outward
  return Math.min(0.9, r * curvatureRadius);
}

// Generate placements: center motif + `count` per ring, `depth` rings, each
// ring pushed further toward the boundary with progressively smaller scale.
export function generatePlacements(
  p: number,
  q: number,
  count: number,
  depth: number,
  curvatureRadius: number,
  globalRotDeg: number,
): Placement[] {
  const out: Placement[] = [];
  const g = (globalRotDeg * Math.PI) / 180;
  const r0 = baseRingRadius(p, q, curvatureRadius);

  // center motif
  out.push({ x: 0, y: 0, scale: 1, rot: g, ring: 0, key: "c" });

  for (let ring = 1; ring <= depth; ring++) {
    // hyperbolic radius accumulates; convert to Poincaré (tanh-like) so it
    // asymptotes to the boundary and never exceeds it.
    const t = ring / (depth + 0.6);
    const radius = Math.min(0.965, r0 + (1 - r0) * (1 - Math.pow(1 - t, 1.7)));
    // motifs shrink as they approach the edge (conformal compression)
    const scale = Math.max(0.08, (1 - radius) * 1.15) * (1 / (1 + ring * 0.15));
    const n = Math.max(3, Math.round(count * (1 + (ring - 1) * 0.5)));
    const spin = ring * (Math.PI / p);
    for (let i = 0; i < n; i++) {
      const a = g + spin + (i / n) * Math.PI * 2;
      const x = radius * Math.cos(a);
      const y = radius * Math.sin(a);
      // orient motif tangent-ish to the radial direction
      const rot = a + Math.PI / 2;
      out.push({ x, y, scale, rot, ring, key: `${ring}-${i}` });
    }
  }
  return out;
}

// Geodesic arc between two boundary-ish points, expressed as an SVG path in
// disc coords. Used to draw the faint hyperbolic guide lines.
export function geodesicPath(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  R: number,
): string {
  // Map to circle of radius R centered at (cx,cy). Geodesics are circular arcs
  // orthogonal to the boundary. Approximate with a quadratic curve bowing
  // toward the center for a convincing circle-limit look.
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const pull = 0.55; // bow toward center
  const cx = mx * (1 - pull);
  const cy = my * (1 - pull);
  return `M ${ax * R} ${ay * R} Q ${cx * R} ${cy * R} ${bx * R} ${by * R}`;
}
