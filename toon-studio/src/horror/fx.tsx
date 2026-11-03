// Screen-space horror layers: drifting fog, film grain, vignette, glitch, and big word-by-word subtitles.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, mulberry32, spring01} from '../toon/lib/anim';
import {FONT} from './fonts';

export const Fog: React.FC<{t: number; o?: number; tint?: string}> = ({t, o = 1, tint = '150,165,210'}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
    {[0, 1, 2].map((i) => {
      const x = ((t * (8 + i * 5) + i * 37) % 160) - 30;
      return <div key={i} style={{position: 'absolute', left: `${x - 60}%`, top: `${30 + i * 18}%`, width: '120%', height: '45%',
        background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(${tint},${0.10 - i * 0.02}) 0%, rgba(${tint},0) 70%)`, filter: 'blur(30px)'}} />;
    })}
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(${tint},0.10), rgba(${tint},0) 45%)`}} />
  </AbsoluteFill>
);

export const Grain: React.FC<{f: number; o?: number}> = ({f, o = 0.09}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: o}}>
    <svg width="100%" height="100%">
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

export const Vignette: React.FC<{o?: number}> = ({o = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: o,
    background: 'radial-gradient(ellipse 75% 62% at 50% 45%, rgba(0,0,0,0) 45%, rgba(2,2,8,0.55) 80%, rgba(0,0,0,0.92) 100%)'}} />
);

// 2D glitch for screen layers (the 3D image glitches in its own shader pass): jitter + coloured scan bars, `k` 0..1
export const GlitchBars: React.FC<{f: number; k: number}> = ({f, k}) => {
  if (k <= 0.01) return null;
  const r = mulberry32(f * 13 + 1);
  const bars = Array.from({length: 7}, () => ({y: r() * 100, h: 0.3 + r() * 2.5, c: r() < 0.5 ? '255,40,60' : '60,200,255', o: r()}));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {bars.map((b, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: `${b.y}%`, height: `${b.h}%`, background: `rgba(${b.c},${0.25 * k * b.o})`}} />
      ))}
    </AbsoluteFill>
  );
};
export const jitter = (f: number, k: number) => {
  if (k <= 0.01) return 'none';
  const r = mulberry32(f * 7 + 3);
  return `translate(${(r() - 0.5) * 40 * k}px, ${(r() - 0.5) * 10 * k}px)`;
};

export type Word = {w: string; t: number; red?: boolean};
export type CapLine = {start: number; end: number; words: Word[]};

// one short phrase at a time, words pop in as they are spoken; keywords in red; sits above the Shorts UI
// gapX: space between words; the 12 px black stroke eats ~12 px of it, so long two-word lines can look glued at 22
export const HorrorCaptions: React.FC<{lines: CapLine[]; f: number; fps: number; y?: number; gapX?: number}> = ({lines, f, fps, y = 1370, gapX = 22}) => {
  const t = f / fps;
  const line = lines.find((l) => t >= l.start - 0.05 && t < l.end);
  if (!line) return null;
  const out = clamp((line.end - t) / 0.12);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 70, right: 70, top: y, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `6px ${gapX}px`, opacity: out}}>
        {line.words.map((w, i) => {
          const p = spring01(f, w.t * fps - 1, fps, 3.4, 0.55);
          const shown = f >= w.t * fps - 1;
          return (
            <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.05, letterSpacing: 1,
              color: w.red ? '#ff2a2a' : '#ffffff', opacity: shown ? clamp(p * 1.5) : 0,
              transform: `scale(${shown ? 0.6 + 0.4 * p : 0.6}) translateY(${shown ? (1 - p) * 18 : 18}px)`,
              WebkitTextStroke: '12px #050407', paintOrder: 'stroke fill',
              textShadow: w.red ? '0 0 28px rgba(255,20,20,0.55), 0 6px 0 #050407' : '0 6px 0 #050407, 0 0 24px rgba(0,0,0,0.8)'}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
