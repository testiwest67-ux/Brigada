// Character rig: legs, torso, hood, neck, 2.5D head, two-bone IK arms with hands.
// All pose numbers are in the character's local space (origin = pelvis, up = negative y).
import React from 'react';
import {INK, OW, Look} from './style';
import {Head, Face} from './Head';
import {ik2, P} from '../lib/anim';

export type Grip = 'grip' | 'open';
export type Pose = {
  x: number; y: number; s: number;  // pelvis in world, scale
  breathe: number;                  // -1..1
  lift: number;                     // shoulder shrug, px
  lean: number;                     // torso lean, deg
  headTilt: number; headDx: number; headDy: number;
  face: Face;
  handL: P; handR: P;               // hand targets
  gripL: Grip; gripR: Grip;
  footL: P; footR: P;
  thigh?: number; shin?: number;    // leg lengths: short thigh = seated (foreshortened), ~165/175 = standing
  knees?: number; elbows?: number;  // optional bend side for both knees/elbows: -1 = to screen-left, +1 = to screen-right (walk cycles); default = outward
};

const TORSO = 272, UPPER = 120, FORE = 114, THIGH = 100, SHIN = 172;

// two segments drawn as one outlined tube: outline pass, then fill pass, so the joint has no seam
const Limb: React.FC<{a: P; b: P; c: P; w1: number; w2: number; color: string; cuff?: string}> = ({a, b, c, w1, w2, color, cuff}) => {
  const seg = (p: P, q: P) => `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
  const len = Math.hypot(c.x - b.x, c.y - b.y) || 1;
  const k = Math.max(0, 1 - 16 / len);
  const cs = {x: b.x + (c.x - b.x) * k, y: b.y + (c.y - b.y) * k};
  const cap = {strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none'};
  return (
    <g>
      <path d={seg(a, b)} stroke={INK} strokeWidth={w1 + OW * 2} {...cap} />
      <path d={seg(b, c)} stroke={INK} strokeWidth={w2 + OW * 2} {...cap} />
      <path d={seg(a, b)} stroke={color} strokeWidth={w1} {...cap} />
      <path d={seg(b, c)} stroke={color} strokeWidth={w2} {...cap} />
      {cuff && <path d={seg(cs, c)} stroke={cuff} strokeWidth={w2 - 1} {...cap} />}
    </g>
  );
};

// cartoon hand along the forearm direction; `th` puts the thumb on the upper (-1) or lower (+1) side
const Hand: React.FC<{p: P; ang: number; grip: Grip; th: number; look: Look}> = ({p, ang, grip, th, look}) => {
  const g = grip === 'grip';
  const palm = g ? {cx: 17, rx: 22, ry: 20} : {cx: 21, rx: 25, ry: 17};
  const thumb = g ? {cx: 10, cy: 16 * th, rx: 11, ry: 8} : {cx: 13, cy: 20 * th, rx: 12, ry: 7};
  const sk = {fill: look.skin.base, stroke: INK, strokeWidth: OW};
  const fl = {stroke: look.skin.line, strokeWidth: 3.5, strokeLinecap: 'round' as const, fill: 'none'};
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${ang})`}>
      <ellipse cx={thumb.cx} cy={thumb.cy} rx={thumb.rx} ry={thumb.ry} {...sk} />
      <ellipse cx={palm.cx} cy={0} rx={palm.rx} ry={palm.ry} {...sk} />
      {g
        ? [-8, 0, 8].map((y) => <path key={y} d={`M ${palm.cx + 9} ${y * th - 3 * th} q 8 ${2 * th} 11 ${6 * th}`} {...fl} />)
        : [-6, 2].map((y) => <path key={y} d={`M ${palm.cx + 6} ${y} l 16 0`} {...fl} />)}
    </g>
  );
};

const angOf = (a: P, b: P) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

export const Character: React.FC<{
  pose: Pose; look: Look; id: string;
  between?: React.ReactNode;                    // world-space items drawn between body and arms (table, mug)
  heldR?: (wrist: P, ang: number) => React.ReactNode; // item in the right hand, drawn under the fingers
  heldL?: (wrist: P, ang: number) => React.ReactNode; // same for the left hand
}> = ({pose: q, look: L, id, between, heldR, heldL}) => {
  const by = 1 + q.breathe * 0.012;
  const T = -TORSO * by - q.lift;
  const tf = `translate(${q.x} ${q.y}) scale(${q.s}) rotate(${q.lean})`;

  const torso = `M -96 20 C -100 ${T * 0.3} -114 ${T * 0.66} -114 ${T + 48} C -114 ${T + 14} -92 ${T} -52 ${T - 4}
    L 52 ${T - 4} C 92 ${T} 114 ${T + 14} 114 ${T + 48} C 114 ${T * 0.66} 100 ${T * 0.3} 96 20 Z`;
  const shL = {x: -97, y: T + 32}, shR = {x: 97, y: T + 32};
  const armL = ik2(shL, q.handL, UPPER, FORE, q.elbows ? -q.elbows : 1);
  const armR = ik2(shR, q.handR, UPPER, FORE, q.elbows ? -q.elbows : -1);
  const hipL = {x: -44, y: 6}, hipR = {x: 44, y: 6};
  const legL = ik2(hipL, q.footL, q.thigh ?? THIGH, q.shin ?? SHIN, q.knees ? -q.knees : 1);
  const legR = ik2(hipR, q.footR, q.thigh ?? THIGH, q.shin ?? SHIN, q.knees ? -q.knees : -1);
  const neckTop = {x: q.headDx * 0.3, y: T - 24};
  const gid = `${id}-top`;

  const shoe = (p: P, s: number) => (
    <g transform={`translate(${p.x} ${p.y})`}>
      <path d={`M ${-26 + s * 4} 2 C ${-28 + s * 4} -16 ${26 + s * 6} -18 ${30 + s * 6} 4 L ${30 + s * 6} 10 L ${-26 + s * 4} 10 Z`} fill={L.shoes} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${-24 + s * 4} 6 L ${28 + s * 6} 6`} stroke={L.shoeSole} strokeWidth={4} />
    </g>
  );

  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.topLight} />
          <stop offset="0.35" stopColor={L.top} />
          <stop offset="1" stopColor={L.topShade} />
        </linearGradient>
      </defs>
      <g transform={tf}>
        <Limb a={hipL} b={legL.mid} c={legL.end} w1={52} w2={44} color={L.pants} />
        <Limb a={hipR} b={legR.mid} c={legR.end} w1={52} w2={44} color={L.pants} />
        {shoe(legL.end, -1)}{shoe(legR.end, 1)}
        <path d={torso} fill={`url(#${gid})`} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {/* pocket seam and side fold in shade colour, not ink */}
        <path d={`M -72 -30 L -60 ${T * 0.42} L 60 ${T * 0.42} L 72 -30`} stroke={L.topShade} strokeWidth={4} fill="none" strokeLinejoin="round" />
        <path d={`M 84 ${T * 0.5} Q 92 ${T * 0.3} 86 ${T * 0.1}`} stroke={L.topShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* hood resting behind the neck (or a round collar) */}
        {L.noHood ? <>
          <rect x={-19 + neckTop.x * 0.5} y={T - 34} width={38} height={44} fill={L.skin.shade} stroke={INK} strokeWidth={OW} />
          <path d={`M -44 ${T - 4} Q 0 ${T + 30} 44 ${T - 4} Q 0 ${T + 12} -44 ${T - 4} Z`} fill={L.topShade} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        </> : <>
        <path d={`M -68 ${T + 4} C -76 ${T - 50} 76 ${T - 50} 68 ${T + 4} C 36 ${T + 14} -36 ${T + 14} -68 ${T + 4} Z`} fill={L.hood} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <rect x={-19 + neckTop.x * 0.5} y={T - 34} width={38} height={44} fill={L.skin.shade} stroke={INK} strokeWidth={OW} />
        <path d={`M -42 ${T - 2} Q 0 ${T + 34} 42 ${T - 2} Q 0 ${T + 16} -42 ${T - 2} Z`} fill={L.hood} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${s * 15} ${T + 16} Q ${s * 19} ${T + 50} ${s * 17} ${T + 80}`} stroke={L.strings} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            <rect x={s * 17 - 3.5} y={T + 78} width={7} height={13} rx={3} fill={L.strings} stroke={INK} strokeWidth={2.5} />
          </g>
        ))}
        </>}
        <g transform={`translate(${neckTop.x} ${neckTop.y}) rotate(${q.headTilt}) translate(${q.headDx} ${-82 + q.headDy})`}>
          <Head face={q.face} look={L} id={`${id}-h`} />
        </g>
      </g>
      {between}
      <g transform={tf}>
        <Limb a={shL} b={armL.mid} c={armL.end} w1={46} w2={40} color={L.top} cuff={L.cuff} />
        <Limb a={shR} b={armR.mid} c={armR.end} w1={46} w2={40} color={L.top} cuff={L.cuff} />
        {heldR?.(armR.end, angOf(armR.mid, armR.end))}
        {heldL?.(armL.end, angOf(armL.mid, armL.end))}
        <Hand p={armL.end} ang={angOf(armL.mid, armL.end)} grip={q.gripL} th={-1} look={L} />
        <Hand p={armR.end} ang={angOf(armR.mid, armR.end)} grip={q.gripR} th={1} look={L} />
      </g>
    </g>
  );
};
