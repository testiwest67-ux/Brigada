// Themed outdoor set: sky with stars and moon/sun, two skyline layers with lit windows (no outlines = depth),
// and a flat roof with a sitting-height parapet, a water tank and an antenna (props in ink, like the characters).
// All colours come from a Theme (lib/fx.ts). World = 1920x1080 plus margins, so a camera push never shows an edge.
import React from 'react';
import {INK, OW} from '../rig/style';
import {Theme} from '../lib/fx';
import {mulberry32} from '../lib/anim';

export const ROOF = {parapet: 690, floor: 915, stand: 1000}; // parapet top (a seat), its foot, where standing feet go
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

// sky: gradient, twinkling stars, moon or sun with a wide glow, two soft cloud bands
export const Sky: React.FC<{theme: Theme; t: number; id?: string}> = ({theme: th, t, id = 'sky'}) => {
  const stars = React.useMemo(() => {
    const r = mulberry32(5);
    return Array.from({length: 90}, () => ({x: -100 + r() * 2120, y: -60 + r() * 640, s: 0.8 + r() * 2, p: r() * 6, big: r() < 0.08}));
  }, []);
  const c = th.celestial;
  const n = Math.round(stars.length * th.stars);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.sky[0]} /><stop offset="0.55" stopColor={th.sky[1]} /><stop offset="1" stopColor={th.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={c.x} cy={c.y} r={c.r * 7} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.glow} stopOpacity="0.55" /><stop offset="0.35" stopColor={c.glow} stopOpacity="0.16" /><stop offset="1" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-300} y={-300} width={2520} height={1100} fill={`url(#${id}-g)`} />
      {stars.slice(0, n).map((s, i) => {
        const tw = 0.55 + 0.45 * Math.sin(t * (1.3 + (i % 5) * 0.4) + s.p);
        return s.big
          ? <path key={i} d={`M ${s.x} ${s.y - 7} L ${s.x + 1.6} ${s.y - 1.6} L ${s.x + 7} ${s.y} L ${s.x + 1.6} ${s.y + 1.6} L ${s.x} ${s.y + 7} L ${s.x - 1.6} ${s.y + 1.6} L ${s.x - 7} ${s.y} L ${s.x - 1.6} ${s.y - 1.6} Z`} fill="#ffffff" opacity={tw * 0.9} />
          : <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#ffffff" opacity={tw * 0.75} />;
      })}
      {c.kind !== 'none' && <>
        <circle cx={c.x} cy={c.y} r={c.r * 7} fill={`url(#${id}-glow)`} />
        <circle cx={c.x} cy={c.y} r={c.r} fill={c.color} />
        {c.kind === 'moon' && <>
          <circle cx={c.x - c.r * 0.3} cy={c.y - c.r * 0.2} r={c.r * 0.2} fill="#000" opacity={0.07} />
          <circle cx={c.x + c.r * 0.35} cy={c.y + c.r * 0.3} r={c.r * 0.13} fill="#000" opacity={0.07} />
          <circle cx={c.x + c.r * 0.1} cy={c.y - c.r * 0.5} r={c.r * 0.09} fill="#000" opacity={0.06} />
        </>}
      </>}
      {[{y: 380, w: 900, x: 300, o: 0.1}, {y: 470, w: 1200, x: 1300, o: 0.08}].map((b, i) => (
        <ellipse key={i} cx={b.x + Math.sin(t * 0.05 + i) * 30} cy={b.y} rx={b.w / 2} ry={26} fill={th.fog} opacity={b.o} />
      ))}
    </g>
  );
};

type Bld = {x: number; w: number; top: number; wins: {x: number; y: number; c: string}[]; mast: boolean};
const blocks = (seed: number, base: number, hMin: number, hMax: number, wMin: number, wMax: number, gx: number, gy: number, lit: string[], p: number) => {
  const r = mulberry32(seed);
  const out: Bld[] = [];
  for (let x = -220; x < 2140;) {
    const w = wMin + r() * (wMax - wMin), top = base - hMin - r() * (hMax - hMin);
    const wins: Bld['wins'] = [];
    for (let yy = top + 18; yy < base - 10; yy += gy)
      for (let xx = x + 12; xx < x + w - 14; xx += gx)
        if (r() < p) wins.push({x: xx, y: yy, c: lit[Math.floor(r() * lit.length)]});
    out.push({x, w, top, wins, mast: r() < 0.18});
    x += w + 4 + r() * 18;
  }
  return out;
};

// two skyline layers behind the parapet; `shift` = camera parallax in px (the far layer moves less)
export const Skyline: React.FC<{theme: Theme; t: number; shift?: number}> = ({theme: th, t, shift = 0}) => {
  const far = React.useMemo(() => blocks(7, 720, 120, 300, 60, 130, 16, 20, th.lit, 0.35), [th]);
  const near = React.useMemo(() => blocks(19, 740, 60, 190, 110, 210, 24, 28, th.lit, 0.45), [th]);
  const layer = (bs: Bld[], col: string, k: number, ww: number, wh: number) => (
    <g transform={`translate(${shift * k} 0)`}>
      {bs.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.top} width={b.w} height={900 - b.top} fill={col} />
          {b.mast && <>
            <rect x={b.x + b.w * 0.5 - 2} y={b.top - 46} width={4} height={46} fill={col} />
            <circle cx={b.x + b.w * 0.5} cy={b.top - 48} r={3.5} fill="#ff5a4a" opacity={Math.sin(t * 3 + i) > 0.2 ? 0.95 : 0.25} />
          </>}
          {b.wins.map((w, j) => <rect key={j} x={w.x} y={w.y} width={ww} height={wh} rx={1.5} fill={w.c} opacity={0.85} />)}
        </g>
      ))}
    </g>
  );
  return <g>{layer(far, th.far, 0.25, 7, 9)}{layer(near, th.near, 0.5, 10, 13)}</g>;
};

// the roof: floor, parapet (a seat) with coping and faint bricks, water tank on the left, antenna on the right
export const Rooftop: React.FC<{theme: Theme; t: number; tank?: boolean; antenna?: boolean}> = ({theme: th, t, tank = true, antenna = true}) => {
  const P = ROOF.parapet, F = ROOF.floor;
  return (
    <g>
      <defs>
        <linearGradient id="roof-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.ground} /><stop offset="1" stopColor="#05040c" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="roof-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={th.groundTop} stopOpacity="0.5" /><stop offset="0.3" stopColor={th.groundTop} stopOpacity="0" />
        </linearGradient>
      </defs>
      {antenna && (
        <g>
          <path d={`M 1690 ${P} L 1716 330 L 1742 ${P}`} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          {[420, 500, 580, 650].map((y) => {
            const k = (y - 330) / (P - 330);
            return <path key={y} d={`M ${1716 - 26 * k} ${y} L ${1716 + 26 * k} ${y}`} stroke={INK} strokeWidth={5} />;
          })}
          <path d="M 1676 400 L 1756 400 M 1686 360 L 1746 360" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <circle cx={1716} cy={324} r={8} fill={Math.sin(t * 2.4) > 0 ? '#ff5a4a' : '#7a2a2a'} stroke={INK} strokeWidth={3} />
          {Math.sin(t * 2.4) > 0 && <circle cx={1716} cy={324} r={26} fill="#ff5a4a" opacity={0.18} />}
        </g>
      )}
      {/* floor of the roof with tar seams converging to the city */}
      <rect x={-300} y={F - 10} width={2520} height={500} fill="url(#roof-floor)" />
      {[-1400, -700, 0, 700, 1400].map((dx) => <path key={dx} d={`M ${960 + dx * 0.35} ${F} L ${960 + dx * 1.2} 1180`} stroke={th.groundTop} strokeOpacity={0.18} strokeWidth={3} />)}
      {/* parapet: wall face, faint brick rows, coping slab with a lit top edge */}
      <rect x={-300} y={P + 14} width={2520} height={F - P - 14} fill={th.ground} />
      <rect x={-300} y={P + 14} width={2520} height={F - P - 14} fill="url(#roof-wall)" />
      {Array.from({length: 6}, (_, r) => (
        <g key={r} opacity={0.22}>
          <path d={`M -300 ${P + 46 + r * 34} L 2220 ${P + 46 + r * 34}`} stroke={th.near} strokeWidth={3} />
          {Array.from({length: 26}, (_, c) => <path key={c} d={`M ${-300 + c * 100 + (r % 2) * 50} ${P + 14 + r * 34 + 32} l 0 -32`} stroke={th.near} strokeWidth={3} />)}
        </g>
      ))}
      <path d={`M -300 ${F} L 2220 ${F}`} stroke={INK} strokeWidth={OW} />
      <rect x={-300} y={P} width={2520} height={20} fill={th.groundTop} {...st} />
      <path d={`M -300 ${P + 3} L 2220 ${P + 3}`} stroke={th.rim} strokeOpacity={0.45} strokeWidth={3} />
      {tank && (
        <g>
          {/* water tank on short legs, standing on the roof in front of the parapet */}
          {[150, 330].map((x) => <path key={x} d={`M ${x} 770 L ${x - 14} ${F + 40}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />)}
          <path d={`M 100 770 L 380 770`} stroke={INK} strokeWidth={8} />
          <path d={`M 110 770 L 110 470 Q 110 430 240 420 Q 370 430 370 470 L 370 770 Z`} fill={th.near} {...st} />
          <path d={`M 110 470 Q 240 500 370 470`} fill="none" stroke={INK} strokeWidth={4} />
          {[540, 620, 700].map((y) => <path key={y} d={`M 112 ${y} Q 240 ${y + 18} 368 ${y}`} fill="none" stroke={th.ground} strokeWidth={6} />)}
          <path d={`M 350 480 L 350 760`} stroke={th.rim} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
          <path d={`M 98 440 L 240 386 L 382 440 Z`} fill={th.ground} {...st} />
        </g>
      )}
    </g>
  );
};
