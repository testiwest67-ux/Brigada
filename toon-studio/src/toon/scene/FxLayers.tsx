// Layers for lib/fx.ts: the theme colour wash + vignette over a set, the wrapper that moves/blurs a scene during a
// transition, and the screen-space flash / dip.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CutFx, Theme} from '../lib/fx';

// colour wash + vignette over a finished set (inside the scene's <svg>, under the UI)
export const Grade: React.FC<{theme: Theme; w?: number; h?: number; vignette?: number; id?: string}> = ({theme, w = 1920, h = 1080, vignette = 0.45, id = 'grade'}) => (
  <g style={{pointerEvents: 'none'}}>
    <defs>
      <radialGradient id={`${id}-v`} cx="50%" cy="48%" r="72%">
        <stop offset="0.55" stopColor="#05040c" stopOpacity="0" />
        <stop offset="1" stopColor="#05040c" stopOpacity={vignette} />
      </radialGradient>
    </defs>
    <rect x={-200} y={-200} width={w + 400} height={h + 400} fill={theme.ambient} opacity={theme.ambientK} style={{mixBlendMode: 'multiply'}} />
    <rect x={0} y={0} width={w} height={h} fill={`url(#${id}-v)`} />
  </g>
);

// wraps the svg content of one scene and applies dx / scale / blur of a CutFx (cx, cy = zoom centre)
export const FxGroup: React.FC<{fx: CutFx; id: string; cx?: number; cy?: number; children: React.ReactNode}> = ({fx, id, cx = 960, cy = 540, children}) => (
  <>
    {fx.blur > 0.5 && (
      <defs>
        <filter id={`${id}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation={fx.dx !== 0 ? `${fx.blur} ${fx.blur * 0.04}` : fx.blur} />
        </filter>
      </defs>
    )}
    <g transform={`translate(${fx.dx} 0) translate(${cx} ${cy}) scale(${fx.scale}) translate(${-cx} ${-cy})`} filter={fx.blur > 0.5 ? `url(#${id}-blur)` : undefined}>
      {children}
    </g>
  </>
);

// screen-space flash / dip layer (put it above the scene svg, under or over the subtitles as you like)
export const FxOverlay: React.FC<{fx: CutFx}> = ({fx}) => (
  <>
    {fx.black > 0 && <AbsoluteFill style={{background: '#05040c', opacity: fx.black}} />}
    {fx.flash > 0 && <AbsoluteFill style={{background: '#fffaf0', opacity: fx.flash}} />}
  </>
);
