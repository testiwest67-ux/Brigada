// Small deterministic animation helpers: every value is a pure function of the frame.
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
// 0 -> 1 between frames a and b
export const ramp = (f: number, a: number, b: number, ease = smooth) => ease((f - a) / Math.max(1e-6, b - a));

// damped spring 0 -> 1 started at frame `start` (overshoots like a real spring)
export const spring01 = (f: number, start: number, fps: number, freq = 2.2, damp = 0.32) => {
  const t = (f - start) / fps;
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq;
  return 1 - Math.exp(-damp * w * t) * Math.cos(w * Math.sqrt(1 - damp * damp) * t);
};
// a kick that jumps up and decays back to 0 (startle, shake)
export const kick = (f: number, start: number, fps: number, freq = 3, decay = 5) => {
  const t = (f - start) / fps;
  if (t <= 0) return 0;
  return Math.sin(2 * Math.PI * freq * t) * Math.exp(-decay * t);
};

export const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// soft 1D wobble from a few incommensurate sines, roughly -1..1
export const wobble = (t: number, seed = 0) =>
  (Math.sin(t * 1.13 + seed) * 0.5 + Math.sin(t * 2.71 + seed * 1.7) * 0.3 + Math.sin(t * 0.61 + seed * 3.1) * 0.2);

// blink: 1 = open, dips to 0 around each blink frame
export const blinkAt = (f: number, frames: number[], len = 6) => {
  let v = 1;
  for (const b of frames) {
    const d = f - b;
    if (d >= 0 && d <= len) v = Math.min(v, Math.abs(d - len / 2) / (len / 2));
  }
  return v;
};

export type P = {x: number; y: number};
// two-bone IK: root, target, segment lengths, bend side (+1 / -1). Returns elbow/knee and end point.
export const ik2 = (a: P, t: P, l1: number, l2: number, bend: number) => {
  let dx = t.x - a.x, dy = t.y - a.y;
  let d = Math.hypot(dx, dy);
  const max = (l1 + l2) * 0.999, min = Math.abs(l1 - l2) + 1;
  const dc = clamp(d, min, max);
  if (d < 1e-6) { dx = 0; dy = 1; d = 1; }
  const ux = dx / d, uy = dy / d;
  const end = {x: a.x + ux * dc, y: a.y + uy * dc};
  const along = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const mid = {x: a.x + ux * along - uy * h * bend, y: a.y + uy * along + ux * h * bend};
  return {mid, end};
};
export const mixP = (a: P, b: P, t: number): P => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)});
