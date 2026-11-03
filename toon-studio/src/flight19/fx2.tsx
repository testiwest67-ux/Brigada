// «Рейс 19» cinematic layer: light rays, dust, sea glints, radar sweep, lens flare, speed lines, rain on glass,
// lamp pools and per-act colour grading. SVG parts go inside the shot's <svg>; Grade is an HTML overlay.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, mulberry32} from '../toon/lib/anim';

export const SvgFx: React.FC = () => (
  <defs>
    <filter id="b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={2} /></filter>
    <filter id="b6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={6} /></filter>
    <filter id="b14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
    <filter id="b30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation={30} /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={10} result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <radialGradient id="softDot"><stop offset="0" stopColor="#fff" stopOpacity={1} /><stop offset="1" stopColor="#fff" stopOpacity={0} /></radialGradient>
  </defs>
);

// god rays fanning from a light source
export const Rays: React.FC<{x: number; y: number; color?: string; o?: number; n?: number; len?: number; t: number; spread?: number; dir?: number}> = ({x, y, color = '#fff6d0', o = 0.18, n = 9, len = 2200, t, spread = 1.2, dir = Math.PI / 2}) => {
  const r = mulberry32(31);
  return (
    <g style={{mixBlendMode: 'screen'}} filter="url(#b14)">
      {Array.from({length: n}, (_, i) => {
        const a = dir - spread / 2 + (i + 0.5) * spread / n + Math.sin(t * 0.3 + i) * 0.02, w = 0.03 + r() * 0.05;
        const p1 = [x + Math.cos(a - w) * len, y + Math.sin(a - w) * len], p2 = [x + Math.cos(a + w) * len, y + Math.sin(a + w) * len];
        return <polygon key={i} points={`${x},${y} ${p1.join(',')} ${p2.join(',')}`} fill={color} opacity={o * (0.5 + r() * 0.8) * (0.85 + 0.15 * Math.sin(t * 0.7 + i * 2))} />;
      })}
    </g>
  );
};

export const Dust: React.FC<{t: number; n?: number; color?: string; o?: number; box?: [number, number, number, number]}> = ({t, n = 40, color = '#fff2c8', o = 0.6, box = [0, 0, 1080, 1920]}) => {
  const r = mulberry32(77);
  const [x0, y0, w, h] = box;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const x = x0 + ((r() * w + Math.sin(t * 0.4 + i) * 30 + t * (4 + r() * 8)) % w), y = y0 + ((r() * h - t * (6 + r() * 10)) % h + h) % h, s = 1.5 + r() * 3.5;
        return <circle key={i} cx={x} cy={y} r={s} fill={color} opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.3 + i)))} />;
      })}
    </g>
  );
};

// sun / moon glints on the water
export const Glints: React.FC<{t: number; x: number; y0: number; y1: number; w?: number; color?: string; n?: number}> = ({t, x, y0, y1, w = 260, color = '#fffbe8', n = 70}) => {
  const r = mulberry32(5);
  return (
    <g style={{mixBlendMode: 'screen'}}>
      {Array.from({length: n}, (_, i) => {
        const yy = y0 + Math.pow(r(), 1.6) * (y1 - y0), spread = w * (0.25 + (yy - y0) / (y1 - y0));
        const xx = x + (r() - 0.5) * spread * 2, on = Math.sin(t * (3 + r() * 4) + i * 1.7);
        return on > 0.2 ? <ellipse key={i} cx={xx} cy={yy} rx={6 + r() * 26 * (0.4 + (yy - y0) / (y1 - y0))} ry={2 + r() * 3} fill={color} opacity={on * 0.85} /> : null;
      })}
    </g>
  );
};

export const LensFlare: React.FC<{x: number; y: number; o?: number; color?: string}> = ({x, y, o = 1, color = '#fff2c0'}) => {
  const cx = 540, cy = 960, dx = cx - x, dy = cy - y;
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={o}>
      <circle cx={x} cy={y} r={220} fill="url(#softDot)" opacity={0.55} />
      <circle cx={x} cy={y} r={60} fill="#fff" opacity={0.9} filter="url(#b6)" />
      <path d={`M ${x - 420} ${y} L ${x + 420} ${y}`} stroke={color} strokeWidth={4} opacity={0.5} filter="url(#b2)" />
      {[[0.5, 40, '#ffd27a'], [0.9, 24, '#7ad0ff'], [1.3, 70, '#ff9a6a'], [1.7, 30, '#b48aff']].map(([k, rr, c], i) => (
        <circle key={i} cx={x + dx * (k as number)} cy={y + dy * (k as number)} r={rr as number} fill={c as string} opacity={0.18} />
      ))}
    </g>
  );
};

export const SpeedLines: React.FC<{t: number; o?: number; color?: string; y0?: number; y1?: number}> = ({t, o = 0.5, color = '#ffffff', y0 = 300, y1 = 1500}) => {
  const r = mulberry32(13);
  return (
    <g opacity={o}>
      {Array.from({length: 26}, (_, i) => {
        const y = y0 + r() * (y1 - y0), len = 120 + r() * 360, x = 1300 - ((t * (1400 + r() * 900) + r() * 1600) % 1800);
        return <path key={i} d={`M ${x} ${y} L ${x + len} ${y}`} stroke={color} strokeWidth={2 + r() * 4} strokeLinecap="round" opacity={0.3 + r() * 0.5} />;
      })}
    </g>
  );
};

// big raindrops on the canopy glass (foreground)
export const GlassDrops: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
  const r = mulberry32(41);
  return (
    <g opacity={o}>
      {Array.from({length: 36}, (_, i) => {
        const x = r() * 1080, y = ((r() * 1900 + t * (r() < 0.3 ? 120 : 8)) % 1900), s = 6 + r() * 18;
        return (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={s} ry={s * 1.25} fill="#a8c4dc" opacity={0.25} />
            <ellipse cx={x} cy={y} rx={s} ry={s * 1.25} fill="none" stroke="#e8f2fa" strokeWidth={2} opacity={0.5} />
            <ellipse cx={x - s * 0.35} cy={y - s * 0.45} rx={s * 0.25} ry={s * 0.18} fill="#fff" opacity={0.8} />
            {r() < 0.3 && <path d={`M ${x} ${y + s} L ${x - 2} ${y + s + 60 + r() * 120}`} stroke="#c8dcec" strokeWidth={s * 0.4} opacity={0.25} />}
          </g>
        );
      })}
    </g>
  );
};

export const RainLayers: React.FC<{t: number; o?: number}> = ({t, o = 1}) => {
  const r = mulberry32(9);
  return (
    <g opacity={o}>
      <g filter="url(#b2)">
        {Array.from({length: 140}, (_, i) => { const x = r() * 1300 - 100, y = (r() * 2000 + t * 1700) % 2000; return <path key={i} d={`M ${x} ${y} l -18 52`} stroke="#c8d8e8" strokeWidth={2} opacity={0.35} />; })}
      </g>
      {Array.from({length: 40}, (_, i) => { const x = r() * 1300 - 100, y = (r() * 2000 + t * 2600) % 2000; return <path key={`n${i}`} d={`M ${x} ${y} l -34 110`} stroke="#e4eef8" strokeWidth={4} opacity={0.5} />; })}
    </g>
  );
};

export const Radar: React.FC<{t: number; x?: number; y?: number; r?: number; color?: string}> = ({t, x = 540, y = 960, r = 900, color = '#4ade80'}) => {
  const a = (t * 1.4) % (Math.PI * 2);
  return (
    <g style={{mixBlendMode: 'screen'}}>
      {[0.25, 0.5, 0.75, 1].map((k) => <circle key={k} cx={x} cy={y} r={r * k} fill="none" stroke={color} strokeWidth={2} opacity={0.15} />)}
      {Array.from({length: 14}, (_, i) => {
        const a0 = a - i * 0.045, a1 = a - (i + 1) * 0.045;
        return <polygon key={i} points={`${x},${y} ${x + Math.cos(a0) * r},${y + Math.sin(a0) * r} ${x + Math.cos(a1) * r},${y + Math.sin(a1) * r}`} fill={color} opacity={0.22 * (1 - i / 14)} />;
      })}
      <path d={`M ${x} ${y} L ${x + Math.cos(a) * r} ${y + Math.sin(a) * r}`} stroke={color} strokeWidth={4} opacity={0.6} />
    </g>
  );
};

// warm pool of light (desk lamp, radio glow on a face)
export const LightPool: React.FC<{x: number; y: number; rx: number; ry: number; color?: string; o?: number}> = ({x, y, rx, ry, color = '#ffcf7a', o = 0.35}) => (
  <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={color} opacity={o} filter="url(#b30)" style={{mixBlendMode: 'screen'}} />
);

export const Flash: React.FC<{k: number; color?: string}> = ({k, color = '#dfe8ff'}) => k <= 0.01 ? null : <rect x={-100} y={-100} width={1280} height={2120} fill={color} opacity={clamp(k) * 0.55} style={{mixBlendMode: 'screen'}} />;

export type GradeName = 'day' | 'gold' | 'dusk' | 'storm' | 'night' | 'alarm' | 'map' | 'paper' | 'dawn' | 'none';
const GRADES: Record<GradeName, [string, string, number]> = {
  day: ['rgba(255,236,190,0.18)', 'rgba(40,80,140,0.12)', 0.3], gold: ['rgba(255,190,90,0.28)', 'rgba(90,40,20,0.25)', 0.45],
  dusk: ['rgba(255,140,90,0.28)', 'rgba(60,20,80,0.35)', 0.5], storm: ['rgba(120,170,220,0.18)', 'rgba(10,20,40,0.5)', 0.6],
  night: ['rgba(90,130,220,0.16)', 'rgba(0,4,20,0.55)', 0.65], alarm: ['rgba(255,60,40,0.22)', 'rgba(40,0,0,0.5)', 0.6],
  map: ['rgba(80,200,255,0.12)', 'rgba(0,10,30,0.5)', 0.55], paper: ['rgba(255,210,140,0.2)', 'rgba(40,20,0,0.45)', 0.5],
  dawn: ['rgba(255,190,170,0.22)', 'rgba(40,40,90,0.3)', 0.4], none: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 0],
};
export const Grade: React.FC<{g: GradeName}> = ({g}) => {
  const [hi, lo, v] = GRADES[g];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, ${hi}, rgba(0,0,0,0) 45%, ${lo})`, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 55% at 50% 42%, rgba(0,0,0,0) 40%, rgba(0,0,0,${v}) 100%)`}} />
    </AbsoluteFill>
  );
};
