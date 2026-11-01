// Fridge in the blackout, drawn over the closed one in Room: the lower door swings open on its right hinge,
// the bulb inside is dead, the freezer above is melting and water runs out onto the floor.
import React from 'react';
import {INK, OW} from '../rig/style';
import {clamp} from '../lib/anim';

export const FR = {x: 1716, y: 176, w: 284, h: 686, split: 420};
const MAX = 112; // door angle at open = 1, deg
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

// handle of the lower door for a given opening (room coords) — the hand follows it
export const fridgeHandle = (open: number) => {
  const c = Math.cos((open * MAX * Math.PI) / 180);
  return {x: FR.x + FR.w - FR.w * c + 26 * c, y: 560};
};

const Jar: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x - 22} y={y - 62} width={44} height={62} rx={8} fill="#8fb98a" {...st} />
    <rect x={x - 24} y={y - 74} width={48} height={14} rx={4} fill="#d9a441" {...st} />
    {[-8, 6].map((d) => <ellipse key={d} cx={x + d} cy={y - 30 + d} rx={6} ry={11} fill="#5f8f5a" />)}
  </g>
);
const Milk: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M ${x - 24} ${y} L ${x - 24} ${y - 78} L ${x - 12} ${y - 96} L ${x + 12} ${y - 96} L ${x + 24} ${y - 78} L ${x + 24} ${y} Z`} fill="#f4f1ea" {...st} />
    <rect x={x - 24} y={y - 52} width={48} height={22} fill="#5b8fd6" />
    <path d={`M ${x - 24} ${y - 52} h 48 M ${x - 24} ${y - 30} h 48`} stroke={INK} strokeWidth={3} />
  </g>
);
const Pot: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M ${x - 44} ${y - 50} L ${x - 40} ${y - 4} Q ${x} ${y + 6} ${x + 40} ${y - 4} L ${x + 44} ${y - 50} Z`} fill="#e3654f" {...st} />
    <path d={`M ${x - 50} ${y - 52} Q ${x} ${y - 70} ${x + 50} ${y - 52} Z`} fill="#c9503c" {...st} />
    <circle cx={x} cy={y - 66} r={6} fill="#3a3f52" stroke={INK} strokeWidth={3} />
  </g>
);
const Cheese: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M ${x - 34} ${y} L ${x - 34} ${y - 30} L ${x + 34} ${y - 44} L ${x + 34} ${y} Z`} fill="#ffd25e" {...st} />
    {[[-14, -14, 5], [10, -20, 4], [18, -8, 3.5]].map(([dx, dy, r], i) => <circle key={i} cx={x + dx} cy={y + dy} r={r} fill="#e9b33f" />)}
  </g>
);

export const OpenFridge: React.FC<{open: number; t: number; melt: number}> = ({open, t, melt}) => {
  const {x, y, w, h, split} = FR;
  const hx = x + w, top = split, bot = y + h;
  const a = (open * MAX * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  const fx = hx - w * c;           // free edge of the door (left of the hinge while closed-ish, right of it past 90°)
  const e = w * s * 0.09;          // the free edge comes toward the camera, so it reads a bit taller
  const ix = x + 16, iw = w - 32, it = top + 10, ib = bot - 16;
  const m = clamp(melt);

  // drops from the melting freezer: fall inside the cavity, then a few run out under the door to the floor
  const inner = [0, 1, 2, 3].map((i) => {
    const ph = (t * 0.8 + i * 0.29) % 1;
    const dx = ix + 34 + i * 62;
    return <ellipse key={i} cx={dx} cy={it + 12 + ph * (ib - it - 30)} rx={6} ry={10} fill="#d4ecff" stroke="#ffffff" strokeWidth={2} opacity={m * (ph < 0.92 ? 1 : 0)} />;
  });
  const out = [0, 1].map((i) => {
    const ph = (t * 1.3 + i * 0.5) % 1;
    return <ellipse key={i} cx={x + 70 + i * 90} cy={bot + 4 + ph * 34} rx={6} ry={9} fill="#d4ecff" opacity={m * (1 - ph)} />;
  });

  return (
    <g>
      <defs>
        <linearGradient id="fr-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f5f6" /><stop offset="1" stopColor="#d7dbe0" />
        </linearGradient>
        <linearGradient id="fr-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5274" /><stop offset="1" stopColor="#2c3150" />
        </linearGradient>
        <linearGradient id="fr-inner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9ced6" /><stop offset="1" stopColor="#e9ecef" />
        </linearGradient>
      </defs>

      {/* puddle spreading on the floor */}
      <ellipse cx={x + w * 0.42} cy={902} rx={30 + 170 * m} ry={7 + 15 * m} fill="#9fc2ff" opacity={Math.min(1, m * 3) * 0.6} />
      <ellipse cx={x + w * 0.36} cy={898} rx={(30 + 170 * m) * 0.45} ry={3 + 4 * m} fill="#e4f0ff" opacity={Math.min(1, m * 3) * 0.45} />

      {/* body */}
      <path d={`M ${x} ${bot} L ${x} ${y + 20} Q ${x} ${y} ${x + 20} ${y} L ${hx} ${y} L ${hx} ${bot} Z`} fill="url(#fr-body)" {...st} />
      {/* freezer door stays shut, with wet streaks under its edge */}
      <line x1={x} y1={split} x2={hx} y2={split} stroke={INK} strokeWidth={OW} />
      <rect x={x + 20} y={300} width={11} height={90} rx={5} fill="#9aa3b0" stroke={INK} strokeWidth={3} />
      {[60, 150, 214].map((dx, i) => (
        <path key={i} d={`M ${x + dx} ${split - 4} q 3 ${-30 - i * 10} 0 ${-50 - i * 16}`} stroke="#b9d6ff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={m * 0.7} />
      ))}

      {/* lower cavity: dark, the bulb is dead */}
      <rect x={ix} y={it} width={iw} height={ib - it} rx={6} fill="url(#fr-in)" stroke={INK} strokeWidth={4} />
      <rect x={ix + iw - 52} y={it + 12} width={30} height={16} rx={8} fill="#8d93a3" stroke={INK} strokeWidth={3} />
      {[560, 690].map((sy) => <rect key={sy} x={ix + 4} y={sy} width={iw - 8} height={7} rx={3} fill="#9fb0c8" opacity={0.8} />)}
      <Pot x={ix + 60} y={560} />
      <Milk x={ix + 170} y={560} />
      <Jar x={ix + 50} y={690} />
      <Cheese x={ix + 150} y={690} />
      <rect x={ix + 8} y={760} width={iw - 16} height={ib - 766} rx={8} fill="#a9c7d8" opacity={0.55} stroke={INK} strokeWidth={3} />
      {[40, 90, 150].map((dx, i) => <circle key={i} cx={ix + dx} cy={800} r={17} fill={i === 1 ? '#7fb36a' : '#e3654f'} stroke={INK} strokeWidth={3} />)}
      {inner}
      {/* water pooling on the bottom shelf edge and leaking out */}
      <rect x={ix + 6} y={ib - 8} width={iw - 12} height={6} rx={3} fill="#bfe0ff" opacity={m * 0.8} />
      {out}

      {/* the lower door */}
      {c > 0 ? (
        <g>
          <path d={`M ${fx - 24 * s} ${top - e + 4} L ${fx} ${top - e} L ${fx} ${bot + e} L ${fx - 24 * s} ${bot + e - 4} Z`} fill="#b8bec8" {...st} />
          <path d={`M ${fx} ${top - e} L ${hx} ${top} L ${hx} ${bot} L ${fx} ${bot + e} Z`} fill="url(#fr-body)" {...st} />
          <rect x={fx + 20 * c} y={470} width={Math.max(3, 11 * c)} height={150} rx={5} fill="#9aa3b0" stroke={INK} strokeWidth={3} />
          <rect x={fx + 56 * c} y={486} width={74 * c} height={34} rx={6} fill="#26304a" stroke={INK} strokeWidth={3} />
        </g>
      ) : (
        <g>
          <path d={`M ${hx} ${top} L ${fx} ${top - e} L ${fx} ${bot + e} L ${hx} ${bot} Z`} fill="url(#fr-inner)" {...st} />
          {/* door bins with a bottle and a ketchup */}
          {[0.36, 0.66].map((k, i) => {
            const yy = top + (bot - top) * k;
            return (
              <g key={i}>
                <path d={`M ${hx + 6} ${yy} L ${fx - 6} ${yy - e * k} L ${fx - 6} ${yy - e * k + 34} L ${hx + 6} ${yy + 30} Z`} fill="#dfe6ee" stroke={INK} strokeWidth={3} />
                <rect x={hx + (fx - hx) * 0.3} y={yy - 64} width={Math.max(8, (fx - hx) * 0.22)} height={64} rx={6} fill={i ? '#e3654f' : '#8fd0a0'} stroke={INK} strokeWidth={3} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};
