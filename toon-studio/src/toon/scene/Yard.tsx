// Courtyard seen from a high window: neighbours around a bonfire heating water in one big pot.
// Goes into WindowRoom's `yard` slot (drawn inside the glass). One neighbour waves up at you (`wave` 0..1).
import React from 'react';
import {INK} from '../rig/style';
import {Rect} from './City';
import {Flame} from './Kitchen';
import {mulberry32} from '../lib/anim';

export const firePos = (r: Rect) => ({x: r.x + 400, y: r.y + r.h - 64});

type Person = {dx: number; dy: number; k: number; coat: string; hat?: string; waver?: boolean};
const PEOPLE: Person[] = [
  {dx: -128, dy: 4, k: 1, coat: '#7a4a5a', hat: '#c9503c'},
  {dx: -70, dy: -30, k: 0.85, coat: '#4f6a5a'},
  {dx: 96, dy: -6, k: 1, coat: '#4a6a8a', hat: '#e8b04a', waver: true},
  {dx: 156, dy: 10, k: 0.7, coat: '#8a5a3a'},
];

export const Yard: React.FC<{r: Rect; t: number; fire: number; wave: number}> = ({r, t, fire, wave}) => {
  const F = firePos(r);
  const y0 = r.y + r.h - 190;
  const flick = 1 + Math.sin(t * 11) * 0.05 + Math.sin(t * 6.3) * 0.05;
  const sparks = React.useMemo(() => {
    const rnd = mulberry32(77);
    return Array.from({length: 9}, () => ({dx: (rnd() - 0.5) * 30, v: 40 + rnd() * 50, p: rnd(), s: 1.5 + rnd() * 1.8}));
  }, []);
  const ink = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const};
  return (
    <g>
      <defs>
        <radialGradient id="yd-glow" cx={F.x} cy={F.y - 20} r={300} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffc46a" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#ff9a4a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* yard ground, a bench and two bare trees */}
      <path d={`M ${r.x} ${y0 + 20} Q ${r.x + r.w / 2} ${y0 - 10} ${r.x + r.w} ${y0 + 16} L ${r.x + r.w} ${r.y + r.h} L ${r.x} ${r.y + r.h} Z`} fill="#1d2142" />
      <ellipse cx={F.x} cy={F.y + 6} rx={230} ry={46} fill="#ff9a4a" opacity={0.22 * fire * flick} />
      {[r.x + 90, r.x + r.w - 110].map((x, i) => (
        <g key={i} stroke="#141833" strokeLinecap="round" fill="none">
          <path d={`M ${x} ${y0 + 30} L ${x} ${y0 - 120}`} strokeWidth={12} />
          <path d={`M ${x} ${y0 - 60} L ${x - 40} ${y0 - 120} M ${x} ${y0 - 90} L ${x + 36} ${y0 - 150} M ${x} ${y0 - 120} L ${x - 20} ${y0 - 170}`} strokeWidth={7} />
        </g>
      ))}
      <g transform={`translate(${r.x + 640} ${y0 + 70})`}>
        <rect x={-60} y={-14} width={120} height={10} rx={3} fill="#3a2e3a" {...ink} />
        <path d="M -50 -4 v 20 M 50 -4 v 20" stroke={INK} strokeWidth={5} />
      </g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="url(#yd-glow)" style={{mixBlendMode: 'screen'}} opacity={fire * flick} />

      {/* people behind the fire */}
      {PEOPLE.filter((p) => p.dy < 0).map((p, i) => <Neighbour key={i} p={p} F={F} t={t} wave={0} fire={fire} />)}
      {/* logs, tripod, the pot with steam, the fire */}
      <path d={`M ${F.x - 30} ${F.y + 8} L ${F.x + 26} ${F.y - 4} M ${F.x - 26} ${F.y - 4} L ${F.x + 30} ${F.y + 8}`} stroke="#5a3a2a" strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${F.x - 40} ${F.y + 10} L ${F.x} ${F.y - 86} L ${F.x + 40} ${F.y + 10}`} stroke={INK} strokeWidth={4} fill="none" />
      <Flame x={F.x} y={F.y} k={0.95 * fire} t={t} seed={5} />
      <Flame x={F.x - 12} y={F.y + 2} k={0.6 * fire} t={t + 0.4} seed={8} />
      <line x1={F.x} y1={F.y - 86} x2={F.x} y2={F.y - 58} stroke={INK} strokeWidth={3} />
      <path d={`M ${F.x - 26} ${F.y - 60} L ${F.x - 22} ${F.y - 36} Q ${F.x} ${F.y - 28} ${F.x + 22} ${F.y - 36} L ${F.x + 26} ${F.y - 60} Z`} fill="#2e3242" {...ink} />
      <ellipse cx={F.x} cy={F.y - 60} rx={26} ry={6} fill="#4a5060" {...ink} />
      {[0, 1].map((i) => {
        const ph = (t * 0.5 + i * 0.5) % 1;
        return <path key={i} d={`M ${F.x - 6 + i * 12} ${F.y - 66 - ph * 60} c 6 -8 -6 -14 2 -24`} stroke="#ffffff" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.5 * (1 - ph) * Math.min(1, ph * 4)} />;
      })}
      {sparks.map((s, i) => {
        const ph = (t * 0.7 + s.p) % 1;
        return <circle key={i} cx={F.x + s.dx + Math.sin(t * 3 + i) * 6} cy={F.y - 30 - ph * s.v * 2} r={s.s} fill="#ffd27a" opacity={fire * (1 - ph)} />;
      })}
      {/* people in front of the fire */}
      {PEOPLE.filter((p) => p.dy >= 0).map((p, i) => <Neighbour key={i} p={p} F={F} t={t} wave={p.waver ? wave : 0} fire={fire} />)}
    </g>
  );
};

// small neighbour: coat, head, hat; the side facing the fire gets a warm rim
const Neighbour: React.FC<{p: Person; F: {x: number; y: number}; t: number; wave: number; fire: number}> = ({p, F, t, wave, fire}) => {
  const x = F.x + p.dx, y = F.y + 14 + p.dy;
  const side = p.dx < 0 ? 1 : -1; // direction to the fire
  const sway = Math.sin(t * 1.3 + p.dx) * 1.5;
  const ink = {stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const};
  const armA = wave > 0 ? -150 + Math.sin(t * 13) * 22 * wave : 60 * side + 90;
  return (
    <g transform={`translate(${x} ${y}) scale(${p.k}) rotate(${sway})`}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#000" opacity={0.3} />
      {wave > 0 && (
        <g transform={`translate(${-side * 12} -50) rotate(${armA * wave + (1 - wave) * 90})`}>
          <line x1={0} y1={0} x2={34} y2={0} stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <line x1={0} y1={0} x2={34} y2={0} stroke={p.coat} strokeWidth={7} strokeLinecap="round" />
          <circle cx={38} cy={0} r={6} fill="#e8b894" {...ink} />
        </g>
      )}
      <path d="M -16 0 L -18 -48 Q -16 -62 0 -62 Q 16 -62 18 -48 L 16 0 Z" fill={p.coat} {...ink} />
      <path d={`M ${side * 14} -52 Q ${side * 19} -26 ${side * 15} -2`} stroke="#ffb35a" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8 * fire} />
      <circle cx={0} cy={-74} r={13} fill="#e8b894" {...ink} />
      <path d={`M ${side * 8} -84 Q ${side * 14} -74 ${side * 8} -64`} stroke="#ffcf8a" strokeWidth={3} fill="none" opacity={0.8 * fire} />
      {p.hat && <path d="M -14 -78 Q -14 -92 0 -92 Q 14 -92 14 -78 Z" fill={p.hat} {...ink} />}
    </g>
  );
};
