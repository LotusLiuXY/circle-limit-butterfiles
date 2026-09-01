"use client";

import { memo } from "react";
import type { ButterflyConfig } from "@/lib/butterfly/config";
import { wingPath, veinPaths, bodyPath, antennaePaths } from "@/lib/butterfly/wing";

interface Props {
  config: ButterflyConfig;
  gradientId: string;
  backGradientId: string;
  flap?: number; // 0..1 animated flap factor
}

// One butterfly drawn in a local coord space (~[-1.4,1.4]). NO eyes.
export const Butterfly = memo(function Butterfly({
  config,
  gradientId,
  backGradientId,
  flap = 0,
}: Props) {
  const { wing, veins, stroke, light } = config;
  const spread = (wing.angle / 90) * 0.5;
  const path = wingPath(wing.nodes, spread);
  const vp = veins.visible ? veinPaths(wing.nodes, config.texture.density) : [];
  const body = bodyPath();
  const antennae = antennaePaths();

  // flap compresses wings horizontally
  const flapScale = 1 - flap * 0.35;
  const strokeW = stroke.width * 0.012;
  const veinW = veins.width * 0.008;
  // light-based highlight opacity
  const hi = 0.15 + light.intensity * 0.3;

  const wingEl = (mirror: boolean, back: boolean) => (
    <g
      transform={`scale(${(mirror ? -1 : 1) * flapScale}, 1)`}
      opacity={back ? 1 - config.color.frontBackDelta * 0.5 : 1}
    >
      <path
        d={path}
        fill={`url(#${back ? backGradientId : gradientId})`}
        stroke={config.tokensStroke ?? "#69170D"}
        strokeWidth={strokeW}
        strokeLinejoin="round"
      />
      {vp.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#69170D"
          strokeOpacity={0.5}
          strokeWidth={veinW}
          strokeLinecap="round"
          transform="scale(1,-1)"
        />
      ))}
      {vp.map((d, i) => (
        <path
          key={`b${i}`}
          d={d}
          fill="none"
          stroke="#69170D"
          strokeOpacity={0.5}
          strokeWidth={veinW}
          strokeLinecap="round"
        />
      ))}
      {/* light highlight */}
      <path d={path} fill="#FFFFFF" fillOpacity={hi * 0.4} />
    </g>
  );

  return (
    <g>
      {/* back wing pair (behind, slightly offset for depth) */}
      <g transform="translate(0,0.04)" opacity={0.9}>
        {wingEl(false, true)}
        {wingEl(true, true)}
      </g>
      {/* front wing pair */}
      {wingEl(config.wing.mirror ? true : false, false)}
      {wingEl(config.wing.mirror ? false : true, false)}
      {/* body + head (head clearly larger, no eyes) */}
      <path d={body} fill="#69170D" stroke="#3d0d06" strokeWidth={strokeW * 0.6} />
      <ellipse cx="0" cy="-0.3" rx="0.11" ry="0.1" fill="#69170D" />
      {antennae.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#69170D" strokeWidth={strokeW * 0.9} strokeLinecap="round" />
      ))}
    </g>
  );
});

// augment the config type inline usage (stroke color token override optional)
declare module "@/lib/butterfly/config" {
  interface ButterflyConfig {
    tokensStroke?: string;
  }
}
