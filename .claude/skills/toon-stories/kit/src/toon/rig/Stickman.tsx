// Stickman rig, the "what if" look: solid round dark head with a rim light, white eyes, bright hoodie,
// thin dark limbs with ball joints (two-bone IK), mitten hands and sneakers.
// It takes the same Pose and Face as Character, so acting code, lib/poses.ts and the walk cycles are shared.
// Local space: origin = pelvis, up = negative y. Shoulders ~ -160, head centre ~ -282. Leg lengths and foot targets of the pose
// are scaled by LEG (shorter legs than Character), so a standing stickman's soles are at STICK.sole below the pelvis.
import React from 'react';
import {INK, OW} from './style';
import {Face} from './Head';
import {Grip, Pose} from './Character';
import {clamp, ik2, lerp, P} from '../lib/anim';

export type StickLook = {
  head: string; headLight: string;            // head fill: dark base + soft highlight
  limb: string; limbFar: string; limbLight: string; // arms/legs, far side a bit darker, joint glint
  top: string; topShade: string; topLight: string; hood: string; strings: string; // hoodie
  shoe: string; shoeSole: string;
  eyeWhite: string; pupil: string; mouthLine: string; mouthIn: string; tongue: string;
  brows?: boolean; browColor?: string;        // default: light brows on
  hat?: 'cap' | 'beanie'; hatColor?: string; hatShade?: string;
};

const BASE = {
  head: '#23263b', headLight: '#4a4f72', limb: '#2b2e47', limbFar: '#1d2035', limbLight: '#5b6190',
  strings: '#f1eee8', shoe: '#f3efe8', shoeSole: '#a3a8b8',
  eyeWhite: '#ffffff', pupil: '#1f2236', mouthLine: '#f4f1f8', mouthIn: '#5a1f30', tongue: '#e0707a', brows: true, browColor: '#e4e2ee',
};
// ready palettes: one strong hoodie colour per character (keep it the same all video)
export const STICK_RED: StickLook = {...BASE, top: '#e0553b', topShade: '#b23f2c', topLight: '#f2764f', hood: '#cc4a33'};
export const STICK_BLUE: StickLook = {...BASE, top: '#3a7bd5', topShade: '#2c5ea6', topLight: '#5b97e6', hood: '#346fc2'};
export const STICK_YELLOW: StickLook = {...BASE, top: '#f2b632', topShade: '#c98d1f', topLight: '#ffcd5c', hood: '#e2a52a',
  hat: 'cap', hatColor: '#3fae6a', hatShade: '#2f8a52'};
export const STICK_PURPLE: StickLook = {...BASE, top: '#8a5ad6', topShade: '#6a42ad', topLight: '#a47ae6', hood: '#7d4fc6',
  hat: 'beanie', hatColor: '#f29ac0', hatShade: '#d77aa3'};

// rim light: direction from the figure toward the light (deg, 0 = right, -90 = up), colour, strength 0..1
export type Rim = {ang: number; color: string; k?: number};

const TORSO = 190, UPPER = 116, FORE = 110, THIGH = 165, SHIN = 172;
const LEG = 0.78; // leg lengths and foot targets are scaled by this around the hip
export const STICK = {sole: Math.round(12 + (332 - 12) * LEG + 10), head: 282, headR: 92}; // place: y = ground - STICK.sole * s
const HR = 92;  // head radius
const LW = 15;  // limb width (fill; the ink outline adds OW on each side)

// thin limb: one polyline drawn as outline pass + fill pass (no seam at the joint), then a ball joint on top
const Stick: React.FC<{a: P; b: P; c: P; color: string; light: string}> = ({a, b, c, color, light}) => {
  const d = `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y}`;
  const cap = {fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={LW + OW * 2} {...cap} />
      <path d={d} stroke={color} strokeWidth={LW} {...cap} />
      <circle cx={b.x} cy={b.y} r={LW * 0.5 + 4} fill={color} stroke={INK} strokeWidth={OW - 1.5} />
      <circle cx={b.x - 3} cy={b.y - 3} r={2.6} fill={light} />
    </g>
  );
};

// hoodie sleeve over the upper arm (pushed up to just above the elbow) with a cuff band; the forearm stays a thin stick
const Sleeve: React.FC<{a: P; b: P; L: StickLook; far: boolean}> = ({a, b, L, far}) => {
  const at = (k: number) => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k});
  const e = at(0.7), e2 = at(0.55);
  const seg = (p: P, q: P) => `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
  const W = 30;
  return (
    <g>
      <path d={seg(a, e)} stroke={INK} strokeWidth={W + OW * 2} strokeLinecap="round" fill="none" />
      <path d={seg(a, e2)} stroke={far ? L.topShade : L.top} strokeWidth={W} strokeLinecap="round" fill="none" />
      <path d={seg(e2, e)} stroke={far ? L.topShade : L.hood} strokeWidth={W} strokeLinecap="butt" fill="none" />
      <circle cx={e.x} cy={e.y} r={W / 2} fill={far ? L.topShade : L.hood} />
      <path d={seg(e2, at(0.555))} stroke={L.topShade} strokeWidth={W} strokeLinecap="butt" fill="none" opacity={0.7} />
    </g>
  );
};

// mitten along the forearm direction; `th` puts the thumb on the upper (-1) or lower (+1) side
const Mitt: React.FC<{p: P; ang: number; grip: Grip; th: number; color: string; light: string}> = ({p, ang, grip, th, color, light}) => {
  const g = grip === 'grip';
  const st = {fill: color, stroke: INK, strokeWidth: OW - 1};
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${ang})`}>
      {g ? <ellipse cx={6} cy={11 * th} rx={7.5} ry={6} {...st} />
        : <ellipse cx={9} cy={15 * th} rx={9} ry={5.5} transform={`rotate(${-28 * th} 9 ${15 * th})`} {...st} />}
      <ellipse cx={g ? 9 : 12} cy={0} rx={g ? 15.5 : 18} ry={g ? 14.5 : 13} {...st} />
      <path d={`M ${g ? 2 : 4} ${-7} q 6 -4 12 -2`} stroke={light} strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  );
};

// sneaker under the ankle; dir = -1..1 (toe to screen-left/right), side used when the figure faces the camera
const Shoe: React.FC<{p: P; dir: number; side: number; L: StickLook; color?: string}> = ({p, dir, side, L, color}) => {
  const k = Math.abs(dir) > 0.15 ? dir : side * 0.3;
  const g = Math.sign(k) || 1, len = 16 + 22 * Math.abs(k);
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <path d={`M ${-g * 17} 9 C ${-g * 20} -12 ${g * (len - 10)} -16 ${g * len} 1 Q ${g * (len + 3)} 6 ${g * len} 10 L ${-g * 17} 10 Z`}
        fill={color ?? L.shoe} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${-g * 14} 6 L ${g * (len - 1)} 6`} stroke={L.shoeSole} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

// rim crescent: the shape stroked inside its own clip with a gradient that fades away from the light
const RimEdge: React.FC<{id: string; d?: string; circle?: {r: number}; rim: Rim; c: P; r: number; w: number}> = ({id, d, circle, rim, c, r, w}) => {
  const a = (rim.ang * Math.PI) / 180;
  const shape = circle ? <circle cx={c.x} cy={c.y} r={circle.r} /> : <path d={d} />;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-c`}>{shape}</clipPath>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1={c.x + Math.cos(a) * r} y1={c.y + Math.sin(a) * r} x2={c.x - Math.cos(a) * r * 0.2} y2={c.y - Math.sin(a) * r * 0.2}>
          <stop offset="0" stopColor={rim.color} stopOpacity={rim.k ?? 0.9} />
          <stop offset="0.42" stopColor={rim.color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        {circle ? <circle cx={c.x} cy={c.y} r={circle.r} fill="none" stroke={`url(#${id}-g)`} strokeWidth={w * 2} />
          : <path d={d} fill="none" stroke={`url(#${id}-g)`} strokeWidth={w * 2} strokeLinejoin="round" />}
      </g>
    </g>
  );
};

// the head: features sit on a cylinder and slide with yaw (front to 3/4 with one drawing)
export const StickHead: React.FC<{face: Face; look: StickLook; id: string; rim?: Rim}> = ({face: f, look: L, id, rim}) => {
  const yaw = clamp(f.yaw, -0.8, 0.8), sy = Math.sin(yaw);
  const py = f.pitch * 13;
  const gid = `${id}-hg`;
  const fill = `url(#${gid})`;

  // eyes
  const eyeY = -6 + py;
  const cheek = clamp((f.smile - 0.35) / 0.65); // a big smile pushes the lower lids up (happy squint)
  const eyes = [-1, 1].map((s) => {
    const a = s * 0.4 + yaw;
    const c = Math.cos(a);
    if (c < 0.25) return null;
    const x = 60 * Math.sin(a);
    const rx = 17 * (0.45 + 0.55 * c) * (1 + f.wide * 0.16);
    const ry = 22 * (1 + f.wide * 0.2);
    const pr = 8.8 * (1 - f.wide * 0.36);
    const px = x + f.lookX * rx * 0.45 + sy * rx * 0.15;
    const ppy = eyeY + f.lookY * ry * 0.42;
    const open = clamp(f.open);
    const lidH = 2 * ry * (1 - open);
    const lowH = 2 * ry * cheek * 0.32;
    const cid = `${id}-eye${s}`;
    return (
      <g key={s} opacity={clamp((c - 0.25) / 0.2)}>
        <clipPath id={cid}><ellipse cx={x} cy={eyeY} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={x} cy={eyeY} rx={rx} ry={ry} fill={L.eyeWhite} />
        <g clipPath={`url(#${cid})`}>
          <circle cx={px} cy={ppy} r={pr} fill={L.pupil} />
          <circle cx={px - pr * 0.38} cy={ppy - pr * 0.42} r={pr * 0.34} fill="#fff" />
          <rect x={x - rx - 3} y={eyeY - ry - 4} width={rx * 2 + 6} height={lidH + 4} fill={fill} />
          {lowH > 0.5 && <ellipse cx={x} cy={eyeY + ry + lowH * 0.6} rx={rx * 1.3} ry={lowH * 1.2} fill={fill} />}
        </g>
        {/* closed eye: a light curved line, so a blink still reads on the dark head */}
        {open < 0.3 && <path d={`M ${x - rx * 0.95} ${eyeY + 2} Q ${x} ${eyeY + 10 - cheek * 14} ${x + rx * 0.95} ${eyeY + 2}`}
          stroke={L.eyeWhite} strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={clamp(1 - open / 0.3)} />}
      </g>
    );
  });

  const brows = L.brows === false ? null : [-1, 1].map((s) => {
    const a = s * 0.4 + yaw;
    const c = Math.cos(a);
    if (c < 0.3) return null;
    const x = 60 * Math.sin(a);
    const by = eyeY - 22 * (1 + f.wide * 0.2) - 11 - f.brow * 8;
    const len = 14 * (0.5 + 0.5 * c);
    const ix = x - s * len, ox = x + s * len;
    const iy = by - f.browTilt * 6, oy = by + f.browTilt * 3;
    return <path key={s} d={`M ${ox} ${oy} Q ${x} ${by - 4} ${ix} ${iy}`} stroke={L.browColor ?? '#e4e2ee'} strokeWidth={6} strokeLinecap="round" fill="none" />;
  });

  // mouth: one closed cubic shape; small width + open = round "o", wide = lens/grin, negative smile = frown
  const mx = 66 * sy, my = 44 + py * 0.8;
  const w = 17 * f.mouthW * (0.75 + 0.25 * Math.cos(yaw));
  const o = clamp(f.mouthOpen), sm = f.smile;
  const lx = mx - w, rx = mx + w, ey = my - sm * 4;
  let mouth: React.ReactNode;
  if (o < 0.04) {
    mouth = <path d={`M ${lx} ${ey} Q ${mx} ${my + sm * 12} ${rx} ${ey}`} stroke={L.mouthLine} strokeWidth={5} strokeLinecap="round" fill="none" />;
  } else {
    const round = clamp((0.95 - f.mouthW) / 0.45) * clamp(o * 3);
    const top = (o * 9 - sm * 4) * lerp(1, 1.6, round), bot = (o * 24 + sm * 6) * lerp(1, 0.75, round);
    const ins = lerp(0.42, 0, round) * w;
    const shape = `M ${lx} ${ey} C ${lx + ins} ${ey - top * 1.33} ${rx - ins} ${ey - top * 1.33} ${rx} ${ey} C ${rx - ins} ${ey + bot * 1.33} ${lx + ins} ${ey + bot * 1.33} ${lx} ${ey} Z`;
    const mid = `${id}-mouth`;
    mouth = (
      <g>
        <clipPath id={mid}><path d={shape} /></clipPath>
        <path d={shape} fill={L.mouthIn} />
        <g clipPath={`url(#${mid})`}>
          <ellipse cx={mx} cy={ey + bot * 0.95} rx={w * 0.62} ry={Math.max(3, bot * 0.42)} fill={L.tongue} />
          {sm > 0.3 && <rect x={lx - 4} y={ey - top - 2} width={w * 2 + 8} height={top * 0.5 + 6} fill="#ffffff" />}
        </g>
        <path d={shape} fill="none" stroke={L.mouthLine} strokeWidth={4.5} strokeLinejoin="round" />
      </g>
    );
  }

  // hats are drawn on the same cylinder: the cap visor follows the yaw and sticks out in 3/4
  const hc = L.hatColor ?? '#3fae6a', hs = L.hatShade ?? '#2f8a52';
  const hat = L.hat === 'cap' ? (
    <g>
      <path d={`M -88 -34 C -96 -112 96 -112 88 -34 Q 0 -50 -88 -34 Z`} fill={hc} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${-40 + sy * 30} -88 Q ${-6 + sy * 30} -100 ${30 + sy * 30} -90`} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={6} strokeLinecap="round" fill="none" />
      <circle cx={sy * 20} cy={-102} r={6} fill={hs} stroke={INK} strokeWidth={3} />
      {(() => {
        const cx = 78 * sy * 1.18, hw = 60 - Math.abs(sy) * 14, dip = 16 - Math.abs(sy) * 8;
        return <path d={`M ${cx - hw} -38 Q ${cx} ${-38 + dip + 6} ${cx + hw} -38 Q ${cx + hw * 0.4} -50 ${cx} -48 Q ${cx - hw * 0.4} -50 ${cx - hw} -38 Z`}
          fill={hs} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />;
      })()}
    </g>
  ) : L.hat === 'beanie' ? (
    <g>
      <circle cx={sy * 16} cy={-118} r={17} fill={hs} stroke={INK} strokeWidth={OW} />
      <path d={`M -86 -40 C -96 -128 96 -128 86 -40 Z`} fill={hc} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[-0.9, -0.45, 0, 0.45, 0.9].map((u) => {
        const x = 70 * Math.sin(u + yaw);
        return Math.cos(u + yaw) > 0.2 ? <path key={u} d={`M ${x} -98 Q ${x * 1.08} -74 ${x * 1.12} -58`} stroke={hs} strokeWidth={4} fill="none" strokeLinecap="round" /> : null;
      })}
      <path d={`M -92 -30 Q 0 -44 92 -30 L 90 -56 Q 0 -70 -90 -56 Z`} fill={hs} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
    </g>
  ) : null;

  return (
    <g>
      <defs>
        <radialGradient id={gid} gradientUnits="userSpaceOnUse" cx={-30 + sy * 24} cy={-44} r={HR * 1.5}>
          <stop offset="0" stopColor={L.headLight} />
          <stop offset="0.45" stopColor={L.head} />
          <stop offset="1" stopColor={INK} />
        </radialGradient>
      </defs>
      <circle r={HR} fill={fill} />
      {/* soft highlight on the dome */}
      <ellipse cx={-34 + sy * 22} cy={-52} rx={26} ry={14} transform={`rotate(-32 ${-34 + sy * 22} -52)`} fill="#ffffff" opacity={0.1} />
      {rim && <RimEdge id={`${id}-rim`} circle={{r: HR}} rim={rim} c={{x: 0, y: 0}} r={HR} w={7} />}
      <circle r={HR} fill="none" stroke={INK} strokeWidth={OW} />
      {brows}
      {eyes}
      {mouth}
      {hat}
    </g>
  );
};

// elbows: hanging arms bend outward; arms reaching sideways or up keep the elbow under the shoulder-hand line (gravity),
// blended by how horizontal the arm is, so pose blends never flip the elbow in one frame. `force` = Pose.elbows
const arm2 = (sh: P, hand: P, outward: number, force?: number) => {
  if (force) return ik2(sh, hand, UPPER, FORE, -force);
  const d = Math.hypot(hand.x - sh.x, hand.y - sh.y) || 1;
  const ux = (hand.x - sh.x) / d, uy = (hand.y - sh.y) / d;
  const g = ux >= 0 ? 1 : -1;
  const out = ik2(sh, hand, UPPER, FORE, outward);
  if (g === outward) return out;
  const k = clamp(Math.max((Math.abs(ux) - 0.18) / 0.3, -uy / 0.3)); // sideways or raised -> gravity
  if (k <= 0) return out;
  const grav = ik2(sh, hand, UPPER, FORE, g);
  return {end: out.end, mid: {x: lerp(out.mid.x, grav.mid.x, k), y: lerp(out.mid.y, grav.mid.y, k)}};
};

const angOf = (a: P, b: P) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

export const Stickman: React.FC<{
  pose: Pose; look: StickLook; id: string;
  rim?: Rim;                                     // rim light from the key light (strongly recommended on dark sets)
  shadow?: number;                               // contact shadow opacity under the feet (0 = none), default 0.3
  between?: React.ReactNode;                     // world-space items between body and arms (table, ledge front)
  heldR?: (wrist: P, ang: number) => React.ReactNode;
  heldL?: (wrist: P, ang: number) => React.ReactNode;
}> = ({pose: q, look: L, id, rim, shadow = 0.3, between, heldR, heldL}) => {
  const by = 1 + q.breathe * 0.014;
  const T = -TORSO * by - q.lift;
  const tf = `translate(${q.x} ${q.y}) scale(${q.s}) rotate(${q.lean})`;
  const yaw = q.face.yaw;
  const dir = yaw > 0.18 ? 1 : yaw < -0.18 ? -1 : 0;   // where the body faces: toes and far side follow it

  const torso = `M -64 30 C -68 ${T * 0.4} -88 ${T * 0.72} -84 ${T + 38} C -84 ${T + 10} -66 ${T - 6} -38 ${T - 8}
    L 38 ${T - 8} C 66 ${T - 6} 84 ${T + 10} 84 ${T + 38} C 88 ${T * 0.72} 68 ${T * 0.4} 64 30 Q 0 38 -64 30 Z`;
  const shL = {x: -68, y: T + 30}, shR = {x: 68, y: T + 30};
  const armL = arm2(shL, q.handL, 1, q.elbows);
  const armR = arm2(shR, q.handR, -1, q.elbows);
  const hipL = {x: -30, y: 12}, hipR = {x: 30, y: 12};
  const sc = (h: P, p: P) => ({x: h.x + (p.x - h.x) * LEG, y: h.y + (p.y - h.y) * LEG});
  const th = (q.thigh ?? THIGH) * LEG, sh = (q.shin ?? SHIN) * LEG;
  const legL = ik2(hipL, sc(hipL, q.footL), th, sh, q.knees ? -q.knees : 1);
  const legR = ik2(hipR, sc(hipR, q.footR), th, sh, q.knees ? -q.knees : -1);
  const neck = {x: q.headDx * 0.3, y: T - 6};
  const gid = `${id}-top`;
  // in 3/4 the arm and leg on the far side go behind the torso and get darker
  const farL = dir > 0, farR = dir < 0;
  const groundY = Math.max(legL.end.y, legR.end.y) + 10;

  const arm = (side: 'L' | 'R', far: boolean) => {
    const a = side === 'L' ? armL : armR, sh = side === 'L' ? shL : shR;
    const held = side === 'L' ? heldL : heldR;
    return (
      <g key={side}>
        <Stick a={sh} b={a.mid} c={a.end} color={far ? L.limbFar : L.limb} light={L.limbLight} />
        <Sleeve a={sh} b={a.mid} L={L} far={far} />
        {held?.(a.end, angOf(a.mid, a.end))}
        <Mitt p={a.end} ang={angOf(a.mid, a.end)} grip={side === 'L' ? q.gripL : q.gripR} th={side === 'L' ? -1 : 1} color={far ? L.limbFar : L.limb} light={L.limbLight} />
      </g>
    );
  };
  const leg = (side: 'L' | 'R', far: boolean) => {
    const g = side === 'L' ? legL : legR, hip = side === 'L' ? hipL : hipR;
    return (
      <g key={side}>
        <Stick a={hip} b={g.mid} c={g.end} color={far ? L.limbFar : L.limb} light={L.limbLight} />
        <Shoe p={g.end} dir={dir} side={side === 'L' ? -1 : 1} L={L} color={far ? L.shoeSole : undefined} />
      </g>
    );
  };

  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.topLight} />
          <stop offset="0.4" stopColor={L.top} />
          <stop offset="1" stopColor={L.topShade} />
        </linearGradient>
        <clipPath id={`${id}-tc`}><path d={torso} /></clipPath>
      </defs>
      {shadow > 0 && <ellipse cx={q.x + (legL.end.x + legR.end.x) * 0.5 * q.s} cy={q.y + groundY * q.s} rx={(Math.abs(legR.end.x - legL.end.x) * 0.5 + 60) * q.s} ry={13 * q.s} fill="#05040c" opacity={shadow} />}
      <g transform={tf}>
        {farL && arm('L', true)}{farR && arm('R', true)}
        {leg('L', farL)}{leg('R', farR)}
        <path d={torso} fill={`url(#${gid})`} />
        {/* far side of the body in shade; pocket, hem band and side fold in shade colour, not ink */}
        <g clipPath={`url(#${id}-tc)`}>
          <ellipse cx={dir >= 0 ? -92 : 92} cy={T * 0.45} rx={46} ry={-T * 0.75} fill={L.topShade} opacity={dir === 0 ? 0.35 : 0.6} />
          <path d={`M -90 32 L -90 8 Q 0 20 90 8 L 90 32 Z`} fill={L.topShade} />
          <path d={`M -46 4 L -40 ${T * 0.3} Q 0 ${T * 0.3 - 6} 40 ${T * 0.3} L 46 4`} stroke={L.topShade} strokeWidth={4.5} fill="none" strokeLinejoin="round" />
          <path d={`M -40 ${T * 0.3} Q -30 ${T * 0.18} -36 ${T * 0.06}`} stroke={L.topShade} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d={`M 40 ${T * 0.3} Q 30 ${T * 0.18} 36 ${T * 0.06}`} stroke={L.topShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {rim && <RimEdge id={`${id}-trim`} d={torso} rim={rim} c={{x: 0, y: T * 0.5}} r={110} w={6} />}
        <path d={torso} fill="none" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {/* hood lying on the shoulders + drawstrings */}
        <path d={`M -66 ${T + 10} C -74 ${T - 26} -40 ${T - 34} 0 ${T - 34} C 40 ${T - 34} 74 ${T - 26} 66 ${T + 10} C 40 ${T + 28} -40 ${T + 28} -66 ${T + 10} Z`}
          fill={L.hood} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M -30 ${T + 8} Q 0 ${T + 34} 30 ${T + 8}`} stroke={L.topShade} strokeWidth={5} fill="none" strokeLinecap="round" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 13} ${T + 20} Q ${s * 16} ${T + 46} ${s * 14} ${T + 70}`} stroke={L.strings} strokeWidth={4} fill="none" strokeLinecap="round" />
            <rect x={s * 14 - 3.5} y={T + 68} width={7} height={12} rx={3} fill={L.strings} stroke={INK} strokeWidth={2.5} />
          </g>
        ))}
        <g transform={`translate(${neck.x} ${neck.y}) rotate(${q.headTilt}) translate(${q.headDx} ${-HR + 6 + q.headDy})`}>
          <StickHead face={q.face} look={L} id={`${id}-h`} rim={rim} />
        </g>
      </g>
      {between}
      <g transform={tf}>
        {!farL && arm('L', false)}{!farR && arm('R', false)}
      </g>
    </g>
  );
};
