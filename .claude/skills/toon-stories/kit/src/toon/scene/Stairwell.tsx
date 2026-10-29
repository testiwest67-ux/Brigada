// Stairwell landing in the blackout: two-tone painted wall, flight of stairs with a railing, landing window with candles
// on the sill, an apartment door standing open with warm light inside. Characters are added by the episode.
import React from 'react';
import {INK, OW} from '../rig/style';
import {City, Rect} from './City';
import {Candle} from './Kitchen';

export const SW_WIN: Rect = {x: 1240, y: 150, w: 380, h: 360};
export const SW_CANDLES = [1290, 1430, 1570];
export const SW_SILL = 540;
export const SW_DOOR = {x: 230, y: 300, w: 270, h: 600};
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

export const Stairwell: React.FC<{f: number; fps: number; candles: number}> = ({f, fps, candles}) => {
  const t = f / fps, r = SW_WIN, d = SW_DOOR;
  const steps = Array.from({length: 7}, (_, i) => ({x: 560 + i * 92, y: 900 - i * 62}));
  return (
    <g>
      <defs>
        <clipPath id="sw-glass"><rect x={r.x} y={r.y} width={r.w} height={r.h} /></clipPath>
        <linearGradient id="sw-in" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcf8a" /><stop offset="1" stopColor="#e9a35e" />
        </linearGradient>
      </defs>
      {/* walls: cream top, green paint below with a stripe */}
      <rect x={-300} y={-300} width={2520} height={1680} fill="#e4d3b5" />
      <rect x={-300} y={560} width={2520} height={400} fill="#5f8a78" />
      <rect x={-300} y={552} width={2520} height={10} fill="#4c7262" />
      {/* landing window with the dark city and candles on the sill */}
      <g clipPath="url(#sw-glass)"><City r={r} f={f} fps={fps} offF={-9999} dark={1} shift={0} /></g>
      <path d={`M ${r.x - 20} ${r.y - 20} h ${r.w + 40} v ${r.h + 40} h ${-r.w - 40} Z M ${r.x} ${r.y} v ${r.h} h ${r.w} v ${-r.h} Z`} fill="#f3eee6" fillRule="evenodd" {...st} />
      <rect x={r.x + r.w / 2 - 8} y={r.y} width={16} height={r.h} fill="#f3eee6" {...st} />
      <rect x={r.x - 46} y={SW_SILL - 16} width={r.w + 92} height={22} rx={4} fill="#f6f2ea" {...st} />
      {SW_CANDLES.map((x, i) => <Candle key={x} x={x} y={SW_SILL - 16} flame={candles} t={t + i * 0.7} />)}
      {/* apartment door open, warm light inside */}
      <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="url(#sw-in)" {...st} />
      <rect x={d.x + 30} y={d.y + 60} width={70} height={110} fill="#f4dcb0" opacity={0.7} />
      <path d={`M ${d.x + d.w} ${d.y} L ${d.x + d.w + 90} ${d.y - 30} L ${d.x + d.w + 90} ${d.y + d.h + 30} L ${d.x + d.w} ${d.y + d.h} Z`} fill="#7a4a36" {...st} />
      <circle cx={d.x + d.w + 72} cy={d.y + d.h / 2} r={8} fill="#c9a24a" stroke={INK} strokeWidth={3} />
      <path d={`M ${d.x - 18} ${d.y + d.h} L ${d.x - 18} ${d.y - 18} L ${d.x + d.w + 18} ${d.y - 18} L ${d.x + d.w + 18} ${d.y + d.h}`} fill="none" stroke="#c9b48f" strokeWidth={14} />
      <text x={d.x + d.w / 2} y={d.y - 34} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={34} fill="#3a3f52">27</text>
      {/* flight of stairs up to the right, railing */}
      {steps.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width={92} height={62} fill="#a89a88" {...st} />
          <rect x={s.x} y={s.y} width={92} height={10} fill="#c9bca8" />
        </g>
      ))}
      <path d={`M 560 900 L ${560 + 7 * 92} ${900 - 7 * 62} L ${560 + 7 * 92} 1100 L 560 1100 Z`} fill="#8f8070" {...st} />
      {steps.map((s, i) => <line key={i} x1={s.x + 46} y1={s.y} x2={s.x + 46} y2={s.y - 150} stroke="#3a3f52" strokeWidth={6} />)}
      <path d={`M 590 760 L ${560 + 7 * 92 + 40} ${760 - 7 * 62 - 20}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={`M 590 760 L ${560 + 7 * 92 + 40} ${760 - 7 * 62 - 20}`} stroke="#8a4a36" strokeWidth={14} strokeLinecap="round" />
      {/* landing floor */}
      <rect x={-300} y={900} width={2520} height={400} fill="#8a7a6a" {...st} />
      {[-200, -40, 120, 280, 440, 600, 760, 920, 1080, 1240, 1400, 1560, 1720, 1880].map((x) => <line key={x} x1={x} y1={900} x2={x - 60} y2={1300} stroke="#7a6a5a" strokeWidth={4} />)}
    </g>
  );
};
