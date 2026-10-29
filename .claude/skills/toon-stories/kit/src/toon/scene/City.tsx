// Night city behind the window: sky, stars, moon, two layers of buildings whose windows can switch off, snow.
import React from 'react';
import {mulberry32, clamp} from '../lib/anim';

export type Rect = {x: number; y: number; w: number; h: number};

type Win = {x: number; y: number; w: number; h: number; col: string; off: number; flick: number};
type Bld = {x: number; w: number; top: number; col: string; roof: number; wins: Win[]};

const LIT = ['#ffd27a', '#ffe3a3', '#ffc864', '#bfe3ff'];

// deterministic city; `off` is the delay (frames) after the blackout when each window dies
const build = (r: Rect, seed: number, layer: 0 | 1): Bld[] => {
  const rnd = mulberry32(seed);
  const out: Bld[] = [];
  let x = r.x - 30;
  while (x < r.x + r.w + 30) {
    const w = layer ? 70 + rnd() * 70 : 40 + rnd() * 50;
    const top = layer ? r.y + r.h - 70 - rnd() * 150 : r.y + r.h - 130 - rnd() * 170;
    const ww = layer ? 9 : 6, wh = layer ? 12 : 8, gx = layer ? 20 : 13, gy = layer ? 24 : 16;
    const wins: Win[] = [];
    for (let yy = top + 16; yy < r.y + r.h - 6; yy += gy)
      for (let xx = x + 10; xx < x + w - 12; xx += gx)
        if (rnd() < (layer ? 0.5 : 0.42)) {
          const order = layer ? (r.x + r.w - xx) / r.w * 7 : 5 + rnd() * 16; // near block dies first, right to left
          wins.push({x: xx, y: yy, w: ww, h: wh, col: LIT[Math.floor(rnd() * (rnd() < 0.15 ? 4 : 3))], off: order + rnd() * 3, flick: rnd()});
        }
    out.push({x, w, top, col: layer ? '#212955' : '#2d3668', roof: rnd(), wins});
    x += w + (layer ? 6 + rnd() * 20 : 2 + rnd() * 10);
  }
  return out;
};

export const City: React.FC<{r: Rect; f: number; fps: number; offF: number; dark: number; shift: number}> = ({r, f, fps, offF, dark, shift}) => {
  const far = React.useMemo(() => build(r, 7, 0), [r]);
  const near = React.useMemo(() => build(r, 19, 1), [r]);
  const stars = React.useMemo(() => {
    const rnd = mulberry32(3);
    return Array.from({length: 46}, () => ({x: r.x + rnd() * r.w, y: r.y + rnd() * r.h * 0.55, s: 0.8 + rnd() * 1.8, p: rnd() * 6}));
  }, [r]);
  const snow = React.useMemo(() => {
    const rnd = mulberry32(11);
    return Array.from({length: 55}, () => ({x: rnd() * (r.w + 80), y0: rnd() * r.h, v: 22 + rnd() * 26, s: 1.4 + rnd() * 2.2, p: rnd() * 6, near: rnd() < 0.3}));
  }, [r]);
  const t = f / fps;

  const lit = (w: Win) => {
    const d = f - offF - w.off;
    if (d < -3) return 1;
    if (d < 0) return w.flick > 0.5 && Math.floor(f / 2) % 2 ? 0.2 : 1; // short flicker before dying
    return 0;
  };
  const tower = {x: r.x + r.w * 0.24, y: r.y + r.h * 0.28};
  const towerLight = f < offF + 14 ? (Math.sin(t * 3) > 0 ? 1 : 0.25) : 0;

  const layer = (bs: Bld[], k: number) => (
    <g transform={`translate(${shift * k} 0)`}>
      {bs.map((b, i) => (
        <g key={i}>
          <path d={b.roof > 0.7
            ? `M ${b.x} ${r.y + r.h + 40} L ${b.x} ${b.top + 10} L ${b.x + b.w / 2} ${b.top - 8} L ${b.x + b.w} ${b.top + 10} L ${b.x + b.w} ${r.y + r.h + 40} Z`
            : `M ${b.x} ${r.y + r.h + 40} L ${b.x} ${b.top} L ${b.x + b.w} ${b.top} L ${b.x + b.w} ${r.y + r.h + 40} Z`} fill={b.col} />
          {b.roof < 0.2 && <rect x={b.x + b.w * 0.6} y={b.top - 14} width={4} height={14} fill={b.col} />}
          {b.wins.map((w, j) => {
            const v = lit(w);
            return v > 0 ? <rect key={j} x={w.x} y={w.y} width={w.w} height={w.h} rx={1.5} fill={w.col} opacity={0.92 * v} /> : null;
          })}
        </g>
      ))}
    </g>
  );

  return (
    <g>
      <defs>
        <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c44" />
          <stop offset="0.6" stopColor="#2c2f68" />
          <stop offset="1" stopColor="#4d3f7c" />
        </linearGradient>
        <linearGradient id="city-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb36b" stopOpacity="0" />
          <stop offset="1" stopColor="#ff9f5a" stopOpacity="0.38" />
        </linearGradient>
        <radialGradient id="city-moon" r="0.5">
          <stop offset="0.3" stopColor="#dfe6ff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#dfe6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="url(#city-sky)" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x + shift * 0.2} cy={s.y} r={s.s} fill="#f3f0ff"
          opacity={clamp((0.25 + 0.75 * dark) * (0.6 + 0.4 * Math.sin(t * 2.3 + s.p)))} />
      ))}
      <g transform={`translate(${r.x + r.w * 0.78 + shift * 0.25} ${r.y + 78})`}>
        <circle r={90} fill="url(#city-moon)" />
        <circle r={30} fill="#f2f0e6" />
        <circle cx={-9} cy={-6} r={5} fill="#e0ddd0" /><circle cx={8} cy={9} r={3.5} fill="#e0ddd0" />
      </g>
      {/* light pollution over the horizon fades when the city dies */}
      <rect x={r.x} y={r.y + r.h * 0.45} width={r.w} height={r.h * 0.55} fill="url(#city-glow)" opacity={1 - dark * 0.9} />
      <g transform={`translate(${shift * 0.45} 0)`}>
        <path d={`M ${tower.x - 16} ${r.y + r.h} L ${tower.x - 3} ${tower.y + 30} L ${tower.x - 2} ${tower.y} L ${tower.x + 2} ${tower.y} L ${tower.x + 3} ${tower.y + 30} L ${tower.x + 16} ${r.y + r.h} Z`} fill="#2a3263" />
        <circle cx={tower.x} cy={tower.y - 3} r={4} fill="#ff4d4d" opacity={towerLight} />
      </g>
      {layer(far, 0.5)}
      {layer(near, 0.8)}
      {snow.map((s, i) => {
        const y = r.y + ((s.y0 + t * s.v) % (r.h + 20)) - 10;
        const x = r.x - 40 + ((s.x + Math.sin(t * 1.3 + s.p) * 14 + shift * (s.near ? 1 : 0.6)) % (r.w + 80));
        return <circle key={i} cx={x} cy={y} r={s.s * (s.near ? 1.4 : 1)} fill="#f4f6ff" opacity={s.near ? 0.85 : 0.55} />;
      })}
    </g>
  );
};
