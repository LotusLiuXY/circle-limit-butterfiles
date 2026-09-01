// Circle Limit hyperbolic butterfly — central config type & default.
// All tunable parameters live in ONE config object with unified naming.

export interface WingNode {
  x: number; // normalized wing-local coord, roughly [-1, 1]
  y: number;
  tangent: number; // tangent handle length for bezier smoothing
}

export interface ColorStop {
  offset: number; // 0..1 position along the wing gradient
  color: string; // hex
  alpha: number; // 0..1 per-stop opacity
}

export type ColorScheme = "escher" | "aurora" | "ember" | "jade" | "mono";

export interface ButterflyConfig {
  symmetry: { p: number; q: number }; // {p,q} symmetry group
  boundary: { curvatureRadius: number }; // circle-limit boundary curvature radius factor
  recursion: { depth: number }; // recursion depth toward the boundary
  rotation: { angle: number }; // global rotation (deg)
  butterfly: {
    count: number; // butterflies per symmetry ring
    size: number; // overall size scale (fraction of disc radius), clearly visible default
    scale: number; // additional multiplier
  };
  wing: {
    angle: number; // wing spread/open angle (deg)
    scale: number;
    nodes: WingNode[]; // >=16 contour control nodes
    mirror: boolean; // mirror flip left/right
    zOrder: number; // stacking order (kept top-most)
  };
  color: {
    scheme: ColorScheme;
    stops: ColorStop[]; // >=4 gradient stops
    frontBackDelta: number; // hue/brightness diff between front & back wings (0..1)
  };
  texture: { density: number };
  veins: { visible: boolean; width: number };
  light: { angle: number; intensity: number };
  stroke: { width: number };
  animation: {
    enabled: boolean;
    speed: number; // wing-flap / drift speed
    drift: number; // positional drift range
    opacity: number;
    loopDuration: number; // ms
  };
}

// --- Color schemes (front & back sets) ---
export const COLOR_SCHEMES: Record<ColorScheme, { name: string; stops: ColorStop[] }> = {
  escher: {
    name: "埃舍尔棋格",
    stops: [
      { offset: 0, color: "#F7DE07", alpha: 1 },
      { offset: 0.4, color: "#A3DBEE", alpha: 1 },
      { offset: 0.7, color: "#E82020", alpha: 1 },
      { offset: 1, color: "#972311", alpha: 1 },
    ],
  },
  aurora: {
    name: "极光",
    stops: [
      { offset: 0, color: "#5EEAD4", alpha: 1 },
      { offset: 0.35, color: "#38BDF8", alpha: 1 },
      { offset: 0.7, color: "#818CF8", alpha: 0.95 },
      { offset: 1, color: "#C084FC", alpha: 0.9 },
    ],
  },
  ember: {
    name: "余烬",
    stops: [
      { offset: 0, color: "#FCD34D", alpha: 1 },
      { offset: 0.4, color: "#FB923C", alpha: 1 },
      { offset: 0.72, color: "#EF4444", alpha: 0.95 },
      { offset: 1, color: "#7F1D1D", alpha: 0.92 },
    ],
  },
  jade: {
    name: "碧玉",
    stops: [
      { offset: 0, color: "#ECFCCB", alpha: 1 },
      { offset: 0.4, color: "#A3E635", alpha: 1 },
      { offset: 0.72, color: "#22C55E", alpha: 0.95 },
      { offset: 1, color: "#14532D", alpha: 0.92 },
    ],
  },
  mono: {
    name: "单色墨",
    stops: [
      { offset: 0, color: "#FFF7D8", alpha: 1 },
      { offset: 0.4, color: "#D6B8A8", alpha: 1 },
      { offset: 0.72, color: "#8A2418", alpha: 0.95 },
      { offset: 1, color: "#69170D", alpha: 0.95 },
    ],
  },
};

// Default 16-node butterfly wing outline (one wing; mirrored for the other).
// Head-large body-small standard butterfly form. NO eyes anywhere.
function defaultWingNodes(): WingNode[] {
  // Ordered contour around one (upper+lower) wing lobe, wing-local coords.
  const raw: [number, number, number][] = [
    [0.05, -0.02, 0.12],   // 0 near body top
    [0.35, -0.18, 0.22],   // 1
    [0.72, -0.35, 0.28],   // 2 upper wing outer top
    [0.98, -0.28, 0.24],   // 3
    [1.12, -0.05, 0.2],    // 4 upper wing tip
    [1.02, 0.16, 0.22],    // 5
    [0.8, 0.24, 0.24],     // 6 upper/lower notch
    [0.9, 0.42, 0.22],     // 7 lower wing outer
    [0.82, 0.66, 0.24],    // 8
    [0.6, 0.82, 0.22],     // 9 lower wing tip
    [0.36, 0.86, 0.2],     // 10
    [0.16, 0.72, 0.18],    // 11
    [0.08, 0.5, 0.14],     // 12 lower near body
    [0.04, 0.3, 0.12],     // 13
    [0.02, 0.12, 0.1],     // 14
    [0.03, 0.04, 0.1],     // 15 back to body
  ];
  return raw.map(([x, y, tangent]) => ({ x, y, tangent }));
}

export function defaultConfig(): ButterflyConfig {
  return {
    symmetry: { p: 6, q: 4 },
    boundary: { curvatureRadius: 1 },
    recursion: { depth: 3 },
    rotation: { angle: 0 },
    butterfly: { count: 6, size: 0.22, scale: 1 },
    wing: {
      angle: 18,
      scale: 1,
      nodes: defaultWingNodes(),
      mirror: false,
      zOrder: 100,
    },
    color: {
      scheme: "escher",
      stops: COLOR_SCHEMES.escher.stops.map((s) => ({ ...s })),
      frontBackDelta: 0.28,
    },
    texture: { density: 0.5 },
    veins: { visible: true, width: 0.6 },
    light: { angle: 135, intensity: 0.55 },
    stroke: { width: 1.4 },
    animation: {
      enabled: true,
      speed: 1,
      drift: 0.5,
      opacity: 1,
      loopDuration: 4200,
    },
  };
}
