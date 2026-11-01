// Acting library shared by Character and Stickman: named body poses, facial expressions, smooth blends and walk/run cycles.
// Poses are partial Pose objects in the rig's local space (origin = pelvis, up = negative y), measured on the Stickman;
// `forRig(part, 'toon')` stretches the hand targets for the bigger Character rig (wider shoulders, taller torso).
import {Pose, Grip} from '../rig/Character';
import {FACE0, Face} from '../rig/Head';
import {P, easeInOut, lerp, mixP, ramp, smooth} from './anim';

export type PosePart = Partial<Omit<Pose, 'x' | 'y' | 's' | 'face'>>;
type Body = Required<Omit<Pose, 'x' | 'y' | 's' | 'face' | 'knees' | 'elbows'>> & {knees: number; elbows: number};

const STAND = {thigh: 165, shin: 172, footL: {x: -44, y: 330}, footR: {x: 46, y: 332}};
const SEAT = {thigh: 62, shin: 172, footL: {x: -54, y: 232}, footR: {x: 56, y: 234}}; // thighs come toward camera: short in 2D

// everything a pose may leave out falls back to this relaxed standing pose
export const REST: Body = {
  breathe: 0, lift: 2, lean: 0, headTilt: 0, headDx: 0, headDy: 0,
  handL: {x: -98, y: 16}, handR: {x: 100, y: 14}, gripL: 'grip', gripR: 'grip',
  ...STAND, knees: 0, elbows: 0,
};

export const POSES = {
  idle:    {...STAND, handL: {x: -98, y: 16}, handR: {x: 100, y: 14}},
  hips:    {...STAND, handL: {x: -112, y: -40}, handR: {x: 114, y: -40}, gripL: 'grip', gripR: 'grip', lift: 4},           // hands on hips, confident
  think:   {...STAND, handR: {x: 24, y: -196}, handL: {x: 42, y: -98}, gripR: 'grip', gripL: 'open', headTilt: 6, headDx: 4},  // hand under the chin, other arm across
  shrug:   {...STAND, handL: {x: -170, y: -96}, handR: {x: 172, y: -96}, gripL: 'open', gripR: 'open', lift: 18, headTilt: -5},
  whatif:  {...STAND, handL: {x: -176, y: -60}, handR: {x: 178, y: -122}, gripL: 'open', gripR: 'open', lift: 8},             // "imagine…": both palms open, one higher
  point:   {...STAND, handR: {x: 280, y: -236}, gripR: 'grip', handL: {x: -98, y: 16}, lean: 3},                                 // aim at something screen-right
  explain: {...STAND, handR: {x: 168, y: -150}, gripR: 'open', handL: {x: -60, y: -96}, gripL: 'open'},
  wave:    {...STAND, handR: {x: 128, y: -372}, gripR: 'open', handL: {x: -98, y: 16}, headTilt: 4},                             // hand above the head, never at face level
  cheer:   {...STAND, handL: {x: -112, y: -350}, handR: {x: 116, y: -354}, gripL: 'grip', gripR: 'grip', lift: 10},
  scared:  {...STAND, handL: {x: -150, y: -250}, handR: {x: 152, y: -246}, gripL: 'open', gripR: 'open', lift: 20, lean: -3,
            footL: {x: -70, y: 322}, footR: {x: 74, y: 324}},
  facepalm:{...STAND, handR: {x: 26, y: -268}, gripR: 'open', handL: {x: -98, y: 16}, headTilt: 10, headDy: 8},
  sad:     {...STAND, handL: {x: -76, y: 26}, handR: {x: 78, y: 24}, lift: -8, headTilt: 7, headDy: 10},
  crossed: {...STAND, handL: {x: 52, y: -112}, handR: {x: -50, y: -100}, gripL: 'grip', gripR: 'grip'},                       // arms folded on the chest
  sit:     {...SEAT, handL: {x: -60, y: -18}, handR: {x: 62, y: -16}, gripL: 'open', gripR: 'open'},                            // hands on the knees
  sitLean: {...SEAT, handL: {x: -196, y: 6}, handR: {x: 198, y: 6}, gripL: 'open', gripR: 'open', lift: 10},                  // leaning on the hands on the seat
  sitChin: {...SEAT, handL: {x: -60, y: -18}, handR: {x: 28, y: -196}, gripL: 'open', gripR: 'grip', lean: 4, headTilt: 5},
} satisfies Record<string, PosePart>;
export type PoseName = keyof typeof POSES;

// expressions: only the face-shape fields; yaw / pitch / look stay with the acting
export const EXPR = {
  neutral:   {open: 1, wide: 0, brow: 0, browTilt: 0, mouthW: 1, mouthOpen: 0, smile: 0.15},
  happy:     {open: 0.9, wide: 0, brow: 0.3, browTilt: 0, mouthW: 1.1, mouthOpen: 0.4, smile: 0.9},
  smug:      {open: 0.62, wide: 0, brow: 0.15, browTilt: -0.45, mouthW: 0.95, mouthOpen: 0, smile: 0.6},
  sad:       {open: 0.78, wide: 0, brow: 0.15, browTilt: 0.85, mouthW: 0.8, mouthOpen: 0, smile: -0.6},
  tired:     {open: 0.45, wide: 0, brow: -0.15, browTilt: 0.45, mouthW: 0.8, mouthOpen: 0, smile: -0.25},
  scared:    {open: 1, wide: 1, brow: 0.9, browTilt: 0.75, mouthW: 0.75, mouthOpen: 0.45, smile: -0.4},
  angry:     {open: 0.82, wide: 0, brow: -0.45, browTilt: -1, mouthW: 0.9, mouthOpen: 0.1, smile: -0.45},
  surprised: {open: 1, wide: 0.8, brow: 1, browTilt: 0.1, mouthW: 0.5, mouthOpen: 0.6, smile: 0},
  shocked:   {open: 1, wide: 1, brow: 1, browTilt: 0.3, mouthW: 0.6, mouthOpen: 1, smile: -0.1},
  thinking:  {open: 0.88, wide: 0, brow: 0.45, browTilt: -0.35, mouthW: 0.6, mouthOpen: 0, smile: -0.1},
  worried:   {open: 0.95, wide: 0.25, brow: 0.5, browTilt: 0.9, mouthW: 0.75, mouthOpen: 0.08, smile: -0.35},
} satisfies Record<string, Partial<Face>>;
export type ExprName = keyof typeof EXPR;

const isP = (v: unknown): v is P => typeof v === 'object' && v !== null && 'x' in v;

// blend two partial poses: numbers and points interpolate, grips switch half way
export const blendPart = (a: PosePart, b: PosePart, k: number): PosePart => {
  const out: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof PosePart>;
  for (const key of keys) {
    const va = a[key] ?? (REST as PosePart)[key], vb = b[key] ?? (REST as PosePart)[key];
    if (typeof va === 'number' && typeof vb === 'number') out[key] = lerp(va, vb, k);
    else if (isP(va) && isP(vb)) out[key] = mixP(va, vb, k);
    else out[key] = k < 0.5 ? va : vb; // grips (and knees/elbows bend side)
  }
  return out as PosePart;
};
export const blendPose = (a: Pose, b: Pose, k: number): Pose =>
  ({...(blendPart(a, b, k) as Body), x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), s: lerp(a.s, b.s, k), face: blendFace(a.face, b.face, k)});

export const blendFace = (a: Face, b: Face, k: number): Face => {
  const o = {...a};
  (Object.keys(a) as (keyof Face)[]).forEach((key) => { o[key] = lerp(a[key], b[key], k); });
  return o;
};

// keyed acting: [[time, pose], ...] -> the pose at t; each change blends over `blend` seconds centred on its key
export const poseAt = (t: number, keys: [number, PoseName | PosePart][], blend = 0.4): PosePart => {
  const get = (v: PoseName | PosePart) => (typeof v === 'string' ? POSES[v] : v) as PosePart;
  let cur = get(keys[0][1]);
  for (let i = 1; i < keys.length; i++) cur = blendPart(cur, get(keys[i][1]), ramp(t, keys[i][0] - blend / 2, keys[i][0] + blend / 2, easeInOut));
  return cur;
};
export const exprAt = (t: number, keys: [number, ExprName | Partial<Face>][], blend = 0.3): Face => {
  const get = (v: ExprName | Partial<Face>) => ({...FACE0, ...(typeof v === 'string' ? EXPR[v] : v)});
  let cur = get(keys[0][1]);
  for (let i = 1; i < keys.length; i++) cur = blendFace(cur, get(keys[i][1]), ramp(t, keys[i][0] - blend / 2, keys[i][0] + blend / 2, easeInOut));
  return cur;
};

// expression + acting overrides (yaw, look, blink) -> full Face
export const face = (e: ExprName | Partial<Face>, o: Partial<Face> = {}): Face => ({...FACE0, ...(typeof e === 'string' ? EXPR[e] : e), ...o});

// full Pose from a place in the world, a body part (name or blend result) and a face; `extra` overrides anything
export const makePose = (at: {x: number; y: number; s?: number}, body: PoseName | PosePart, f: Face = FACE0, extra: PosePart = {}): Pose => {
  const b = typeof body === 'string' ? POSES[body] : body;
  return {...REST, ...b, ...extra, x: at.x, y: at.y, s: at.s ?? 1, face: f} as Pose;
};

// Character has wider shoulders (±97 vs ±64) and a taller torso: stretch hand targets that are above the hips
export const forRig = (p: PosePart, rig: 'stick' | 'toon'): PosePart => {
  if (rig === 'stick') return p;
  const fix = (h?: P) => (h ? {x: h.x * 1.3, y: h.y < 0 ? h.y * 1.25 : h.y} : h);
  return {...p, handL: fix(p.handL), handR: fix(p.handR)};
};

// breathing + a tiny sway so nobody is frozen; add the result to a pose (seed varies per character)
export const alive = (t: number, seed = 0, amt = 1): PosePart => ({
  breathe: Math.sin((t * 2 * Math.PI) / (2.6 + seed * 0.3) + seed) * amt,
  headTilt: Math.sin(t * 0.9 + seed * 2) * 1.2 * amt,
});
export const addPart = (a: PosePart, d: PosePart): PosePart => {
  const o: Record<string, unknown> = {...a};
  for (const [k, v] of Object.entries(d)) o[k] = typeof v === 'number' ? ((a as Record<string, number>)[k] ?? (REST as Record<string, unknown>)[k] as number ?? 0) + v : v;
  return o as PosePart;
};

// ---- walk / run cycles (side view). Feet stay planted while on the ground: move the pelvis by `speed` px/s * s.
export type Cycle = {footL: P; footR: P; handL: P; handR: P; knees: number; elbows: number; lean: number; bob: number; speed: number;
  thigh: number; shin: number; gripL: Grip; gripR: Grip};

const step = (ph: number, stance: number, S: number, lift: number) => {
  ph = ((ph % 1) + 1) % 1;
  if (ph < stance) return {x: S - 2 * S * (ph / stance), y: 0};                // planted: slides back under the moving body
  const u = (ph - stance) / (1 - stance);
  return {x: -S + 2 * S * smooth(u), y: -lift * Math.sin(Math.PI * u)};        // swing: arcs forward
};

// cadence = full cycles (two steps) per second; dir = +1 walks to screen-right, -1 to screen-left
export const walkCycle = (t: number, o: {cadence?: number; stride?: number; dir?: number; lift?: number; arms?: number} = {}): Cycle => {
  const cad = o.cadence ?? 0.95, S = o.stride ?? 62, dir = o.dir ?? 1, lift = o.lift ?? 34, arms = o.arms ?? 0.75;
  const ph = t * cad, stance = 0.6;
  const fl = step(ph, stance, S, lift), fr = step(ph + 0.5, stance, S, lift);
  const hand = (f: P, side: number) => ({x: dir * -f.x * arms + side * 14, y: 22 - Math.abs(f.x) * 0.18});
  return {
    footL: {x: dir * fl.x - 10, y: 330 + fl.y}, footR: {x: dir * fr.x + 10, y: 332 + fr.y},
    handL: hand(fl, -1), handR: hand(fr, 1), knees: dir, elbows: -dir, lean: dir * 2.5,
    bob: Math.cos(ph * 4 * Math.PI) * 5, speed: (2 * S * cad) / stance, thigh: 165, shin: 172, gripL: 'grip', gripR: 'grip',
  };
};

// run: shorter ground contact, high knees, pumping bent arms, strong forward lean
export const runCycle = (t: number, o: {cadence?: number; stride?: number; dir?: number} = {}): Cycle => {
  const cad = o.cadence ?? 1.5, S = o.stride ?? 96, dir = o.dir ?? 1;
  const ph = t * cad, stance = 0.38;
  const fl = step(ph, stance, S, 92), fr = step(ph + 0.5, stance, S, 92);
  // the hand opposite the forward foot swings forward and up, elbows stay bent
  const pump = (f: P, side: number) => ({x: dir * (-f.x * 0.55 + 26) + side * 10, y: -92 - Math.max(0, -f.x) * 0.5});
  return {
    footL: {x: dir * fl.x - 8, y: 322 + fl.y}, footR: {x: dir * fr.x + 8, y: 324 + fr.y},
    handL: pump(fl, -1), handR: pump(fr, 1), knees: dir, elbows: -dir, lean: dir * 9,
    bob: Math.cos(ph * 4 * Math.PI) * 10 - 6, speed: (2 * S * cad) / stance, thigh: 165, shin: 172, gripL: 'grip', gripR: 'grip',
  };
};
