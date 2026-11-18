// «Ева»: the invented smart speaker (no brand). A fabric cylinder with a light ring on top.
// ring: 0 off .. 1 on; red: 0 blue .. 1 red; talk: 0..1 the ring pulses while it speaks. Units: 1 = 1 mm, origin at the base centre.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };

export const Eva: React.FC<{ring: number; red?: number; talk?: number; t: number; id?: string}> = ({ring, red = 0, talk = 0, t, id = 'eva'}) => {
  const col = mix('#3fb6ff', '#ff2a2a', red);
  const glow = clamp(ring) * (1 - 0.35 * talk + 0.35 * talk * (0.5 + 0.5 * Math.sin(t * 18)));
  const W = 110, H = 190;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#1c1e24" /><stop offset="0.45" stopColor="#3a3d46" /><stop offset="1" stopColor="#16171c" />
        </linearGradient>
        <pattern id={`${id}-mesh`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="1.6" fill="#0c0d10" opacity="0.6" />
        </pattern>
        <filter id={`${id}-blur`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>
      {/* light spill on the table */}
      <ellipse cx={0} cy={-4} rx={W * 2.2} ry={34} fill={col} opacity={0.18 * glow} filter={`url(#${id}-blur)`} />
      <ellipse cx={0} cy={0} rx={W} ry={22} fill="#0c0d10" />
      <path d={`M ${-W} 0 L ${-W} ${-H} A ${W} 22 0 0 1 ${W} ${-H} L ${W} 0 A ${W} 22 0 0 1 ${-W} 0 Z`} fill={`url(#${id}-body)`} stroke="#14121c" strokeWidth={6} />
      <path d={`M ${-W} 0 L ${-W} ${-H} A ${W} 22 0 0 1 ${W} ${-H} L ${W} 0 A ${W} 22 0 0 1 ${-W} 0 Z`} fill={`url(#${id}-mesh)`} />
      <ellipse cx={0} cy={-H} rx={W} ry={22} fill="#24262c" stroke="#14121c" strokeWidth={6} />
      {/* the ring */}
      <ellipse cx={0} cy={-H} rx={W * 0.8} ry={16} fill="none" stroke={col} strokeWidth={30} opacity={0.5 * glow} filter={`url(#${id}-blur)`} />
      <ellipse cx={0} cy={-H} rx={W * 0.8} ry={16} fill="none" stroke={mix('#20242c', col, glow)} strokeWidth={12} />
      <ellipse cx={0} cy={-H} rx={W * 0.8} ry={16} fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.6 * glow} />
      {/* the tiny logo-less dot and the cable */}
      <circle cx={0} cy={-40} r={6} fill={col} opacity={0.4 * glow} />
    </g>
  );
};
