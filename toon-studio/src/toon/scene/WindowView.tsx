// Second set: a big kitchen window seen up close, dark city + street with car lights below. Character is added by the episode.
import React from 'react';
import {INK, OW} from '../rig/style';
import {City, Rect} from './City';
import {mulberry32} from '../lib/anim';

export const WIN2: Rect = {x: 150, y: 110, w: 860, h: 690};
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

// road at the bottom of the view; only the car lights are visible in the blackout
const Street: React.FC<{r: Rect; t: number}> = ({r, t}) => {
  const cars = React.useMemo(() => {
    const rnd = mulberry32(31);
    return Array.from({length: 5}, (_, i) => ({lane: i % 2, x0: rnd() * (r.w + 400), v: 70 + rnd() * 60}));
  }, [r]);
  const y0 = r.y + r.h - 74;
  return (
    <g>
      <rect x={r.x} y={y0} width={r.w} height={80} fill="#151933" />
      <rect x={r.x} y={y0} width={r.w} height={6} fill="#20264a" />
      {Array.from({length: 12}, (_, i) => <rect key={i} x={r.x + i * 90} y={y0 + 40} width={40} height={4} rx={2} fill="#2c3360" />)}
      {cars.map((c, i) => {
        const span = r.w + 400;
        const dir = c.lane ? 1 : -1;
        const x = r.x - 200 + (((c.x0 + dir * c.v * t) % span) + span) % span;
        const y = y0 + (c.lane ? 26 : 58);
        return c.lane ? (
          <g key={i}>
            <ellipse cx={x - 14} cy={y} rx={50} ry={16} fill="#ff4a4a" opacity={0.22} />
            <circle cx={x - 30} cy={y} r={6.5} fill="#ff6a6a" /><circle cx={x} cy={y} r={6.5} fill="#ff6a6a" />
          </g>
        ) : (
          <g key={i}>
            <path d={`M ${x - 4} ${y - 8} L ${x - 220} ${y - 30} L ${x - 220} ${y + 30} L ${x - 4} ${y + 8} Z`} fill="#fff1c4" opacity={0.2} />
            <circle cx={x} cy={y} r={20} fill="#fff1c4" opacity={0.25} />
            <circle cx={x} cy={y - 7} r={7} fill="#fff6d8" /><circle cx={x} cy={y + 7} r={7} fill="#fff6d8" />
          </g>
        );
      })}
    </g>
  );
};

// `yard` replaces the street below the window (e.g. the courtyard with a bonfire, scene/Yard.tsx)
export const WindowRoom: React.FC<{f: number; fps: number; camShift: number; yard?: React.ReactNode}> = ({f, fps, camShift, yard}) => {
  const t = f / fps, r = WIN2;
  return (
    <g>
      <defs>
        <linearGradient id="w2-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a2" /><stop offset="1" stopColor="#e6d2b3" />
        </linearGradient>
        <clipPath id="w2-glass"><rect x={r.x} y={r.y} width={r.w} height={r.h} /></clipPath>
        <linearGradient id="w2-curtain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d28a70" /><stop offset="0.5" stopColor="#e3a083" /><stop offset="1" stopColor="#c97e66" />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill="url(#w2-wall)" />
      <rect x={-200} y={985} width={2320} height={300} fill="#8f6c56" />
      <rect x={-200} y={972} width={2320} height={16} fill="#efe6d8" {...st} />
      <g clipPath="url(#w2-glass)">
        <City r={r} f={f} fps={fps} offF={-9999} dark={1} shift={-camShift * 0.2} />
        {yard ?? <Street r={r} t={t} />}
      </g>
      <path d={`M ${r.x - 26} ${r.y - 26} h ${r.w + 52} v ${r.h + 52} h ${-r.w - 52} Z M ${r.x} ${r.y} v ${r.h} h ${r.w} v ${-r.h} Z`} fill="#f3eee6" fillRule="evenodd" {...st} />
      {[1, 2].map((k) => <rect key={k} x={r.x + (r.w * k) / 3 - 9} y={r.y} width={18} height={r.h} fill="#f3eee6" {...st} />)}
      <rect x={r.x} y={r.y + 200} width={r.w / 3 - 9} height={16} fill="#f3eee6" {...st} />
      <rect x={r.x - 50} y={r.y + r.h + 24} width={r.w + 100} height={30} rx={5} fill="#f6f2ea" {...st} />
      <rect x={r.x - 40} y={r.y + r.h + 54} width={r.w + 80} height={12} fill="#000" opacity={0.08} />
      <rect x={r.x + 120} y={r.y + r.h + 90} width={r.w - 240} height={110} rx={10} fill="#ece7df" {...st} />
      {Array.from({length: 10}, (_, i) => <line key={i} x1={r.x + 160 + i * 60} y1={r.y + r.h + 104} x2={r.x + 160 + i * 60} y2={r.y + r.h + 186} stroke="#cfc8bd" strokeWidth={6} strokeLinecap="round" />)}
      <rect x={r.x - 90} y={r.y - 64} width={r.w + 180} height={12} rx={6} fill="#7b5a48" {...st} />
      {[r.x - 70, r.x + r.w - 40].map((x, i) => {
        const sx = Math.sin(t * 0.9 + i) * 6;
        return (
          <path key={i} d={`M ${x} ${r.y - 56} L ${x + 110} ${r.y - 56} C ${x + 110 + sx * 0.4} ${r.y + 300} ${x + 110 + sx} ${r.y + 500} ${x + 110 + sx} ${r.y + r.h + 20}
            Q ${x + 55 + sx} ${r.y + r.h + 32} ${x + sx} ${r.y + r.h + 20} C ${x + sx} ${r.y + 500} ${x + sx * 0.4} ${r.y + 300} ${x} ${r.y - 56} Z`} fill="url(#w2-curtain)" {...st} />
        );
      })}
    </g>
  );
};
