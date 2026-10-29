// Visual themes (sky, set and light colours in one place) and transitions around a cut, as pure functions of time.
// Take every set colour from a Theme so one word switches the mood of a whole scene.
// The layers that draw them (Grade, FxGroup, FxOverlay) live in scene/FxLayers.tsx.
import {clamp, easeOut, lerp, ramp} from './anim';

export type Theme = {
  sky: [string, string, string];   // top, middle, horizon
  far: string; near: string;       // distant / near skyline silhouettes (no outlines: depth)
  ground: string; groundTop: string; // floor / roof slab and its lit edge
  lit: string[];                   // lit window colours
  celestial: {kind: 'moon' | 'sun' | 'none'; x: number; y: number; r: number; color: string; glow: string};
  stars: number;                   // 0..1 how many stars / sparkles
  ambient: string; ambientK: number; // colour wash over the whole set (multiply), strength
  rim: string; key: string;        // rim light on characters, key light colour
  accent: string;                  // numbers and highlights in the UI cards
  fog: string;
};

export const THEMES = {
  // purple dusk / early dawn: mauve shadows, amber horizon
  dusk: {sky: ['#241f4a', '#6c4377', '#f09a6c'], far: '#4b3463', near: '#33264a', ground: '#2c2140', groundTop: '#5a4270',
    lit: ['#ffd08a', '#ffb870'], celestial: {kind: 'sun', x: 1480, y: 600, r: 70, color: '#ffd9a0', glow: '#ff9d5c'}, stars: 0.35,
    ambient: '#7a4a86', ambientK: 0.1, rim: '#ffcf9a', key: '#ffb36b', accent: '#ffc46b', fog: '#c27a8a'},
  // cold navy night: blue-white rims, warm lit windows
  night: {sky: ['#0a0f2e', '#18265a', '#33498a'], far: '#1e2a58', near: '#151c40', ground: '#141a36', groundTop: '#2f3c70',
    lit: ['#ffd27a', '#ffe3a3', '#bfe3ff'], celestial: {kind: 'moon', x: 1460, y: 210, r: 56, color: '#f4f1e2', glow: '#9fb4ff'}, stars: 1,
    ambient: '#1c2654', ambientK: 0.16, rim: '#a9bcff', key: '#9fb4ff', accent: '#ffd27a', fog: '#3a4f8f'},
  // golden hour: warm orange key, teal shadows
  gold: {sky: ['#36577e', '#e9945a', '#ffd88e'], far: '#7a586a', near: '#4c3a4e', ground: '#3d2d3d', groundTop: '#8a5a50',
    lit: ['#fff0c0'], celestial: {kind: 'sun', x: 520, y: 640, r: 90, color: '#fff1c8', glow: '#ffb45c'}, stars: 0,
    ambient: '#ff9a4a', ambientK: 0.08, rim: '#ffe2a6', key: '#ffc46b', accent: '#ffd27a', fog: '#f0b07a'},
  // neon: deep blacks, magenta key, teal rim
  neon: {sky: ['#06050e', '#170d36', '#3a0f4f'], far: '#1c1238', near: '#110a24', ground: '#0d0a1c', groundTop: '#4a1f6a',
    lit: ['#ff3fa4', '#3ff0e0', '#ffd27a'], celestial: {kind: 'none', x: 0, y: 0, r: 0, color: '#000', glow: '#000'}, stars: 0.4,
    ambient: '#3b0f4f', ambientK: 0.14, rim: '#47f0e0', key: '#ff3fa4', accent: '#ff5fb4', fog: '#7a2a8a'},
  // fairytale: soft pastel, low contrast, sparkles
  fairytale: {sky: ['#7fa6f0', '#c4b3f2', '#ffd3e6'], far: '#9b8fd8', near: '#7d70c2', ground: '#6a5fae', groundTop: '#a99ae6',
    lit: ['#fff2b0', '#ffd6f0'], celestial: {kind: 'moon', x: 1500, y: 220, r: 48, color: '#fffbe8', glow: '#ffffff'}, stars: 0.6,
    ambient: '#ffd6f0', ambientK: 0.07, rim: '#ffffff', key: '#fff2b0', accent: '#ffe27a', fog: '#ffffff'},
} satisfies Record<string, Theme>;
export type ThemeName = keyof typeof THEMES;

// ---- transitions. Every kind is a function of t around the cut time; the scene before the cut is "out", after it "in".
export type CutKind = 'cut' | 'flash' | 'dip' | 'whip' | 'zoom';
export type CutFx = {dx: number; blur: number; scale: number; flash: number; black: number};
export const NO_FX: CutFx = {dx: 0, blur: 0, scale: 1, flash: 0, black: 0};

// dur = whole transition length in seconds (half before the cut, half after); w = frame width for the whip
export const cutFx = (t: number, cut: number, kind: CutKind, dur = 0.36, w = 1920): CutFx => {
  const h = dur / 2;
  const out = t < cut;
  const k = out ? ramp(t, cut - h, cut, (x) => clamp(x) ** 3) : 1 - ramp(t, cut, cut + h, easeOut); // 0 far from the cut, 1 at it
  switch (kind) {
    case 'flash': // white flash: fast attack, slower decay
      return {...NO_FX, flash: out ? ramp(t, cut - h * 0.4, cut) : 1 - ramp(t, cut, cut + h * 1.6, easeOut)};
    case 'dip':   // through black, symmetric
      return {...NO_FX, black: clamp(1 - Math.abs(t - cut) / h)};
    case 'whip':  // fast pan with horizontal smear: old scene leaves to the left, new one arrives from the right
      return {...NO_FX, dx: (out ? -1 : 1) * k * w * 0.55, blur: k * 46};
    case 'zoom':  // dive in: old scene grows and blurs, new one grows into place from a little smaller
      return {...NO_FX, scale: out ? lerp(1, 1.9, k) : lerp(1, 0.82, k), blur: k * 14, flash: k * 0.35};
    default:
      return NO_FX;
  }
};

// both sides of one cut. For the whip the two scenes travel as one strip (no empty gap), so both are drawn during it:
// {pair.showOut && <FxGroup fx={pair.out}>…old…</FxGroup>}{pair.showIn && <FxGroup fx={pair.in}>…new…</FxGroup>}<FxOverlay fx={pair.overlay} />
export type CutPair = {out: CutFx; in: CutFx; showOut: boolean; showIn: boolean; overlay: CutFx};
export const cutPair = (t: number, cut: number, kind: CutKind, dur = 0.36, w = 1920): CutPair => {
  if (kind === 'whip') {
    const h = dur / 2;
    const p = ramp(t, cut - h, cut + h, (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; });
    const blur = Math.sin(Math.PI * p) * 46;
    return {out: {...NO_FX, dx: -p * w, blur}, in: {...NO_FX, dx: (1 - p) * w, blur}, showOut: p < 1, showIn: p > 0, overlay: NO_FX};
  }
  const fx = cutFx(t, cut, kind, dur, w);
  const out = t < cut;
  return {out: fx, in: fx, showOut: out, showIn: !out, overlay: fx};
};
