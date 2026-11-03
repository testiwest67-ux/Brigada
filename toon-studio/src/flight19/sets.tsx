// «Рейс 19» sets in the flat 2D sitcom look: sky & ocean, the TBM Avenger and the PBM Mariner (side views), ships,
// the nautical map with the triangle, the radio room, the cockpit, close-up props (compass, fuel gauge).
// Screen units: 1080 × 1920.
import React from 'react';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';

export const INK = '#1a1414';
const OW = 4;
export type Mood = 'day' | 'dusk' | 'storm' | 'night' | 'dawn';
const SKY: Record<Mood, [string, string, string]> = {
  day: ['#5fa8e0', '#9fd0f0', '#e6f3fa'],
  dusk: ['#3a3f6e', '#c4637a', '#f2b06a'],
  storm: ['#1f2630', '#3a4654', '#5c6a78'],
  night: ['#05070f', '#0e1630', '#1c2a4a'],
  dawn: ['#6b7fa8', '#d9a3a0', '#f6d6a8'],
};
const SEA: Record<Mood, [string, string]> = {
  day: ['#2f7fb8', '#1c4f80'], dusk: ['#3a4a78', '#1d2648'], storm: ['#26333e', '#121a22'],
  night: ['#0b1424', '#03070e'], dawn: ['#5a7ea0', '#2a4464'],
};

export const Sky: React.FC<{mood: Mood; t: number; id?: string; h?: number; clouds?: number; sun?: boolean}> = ({mood, t, id = 'sky', h = 1920, clouds = 1, sun = true}) => {
  const [a, b, c] = SKY[mood];
  const r = mulberry32(7);
  const cl = mood === 'storm' ? '#2b333d' : mood === 'night' ? '#141c33' : mood === 'dusk' ? '#e9a08a' : '#ffffff';
  const sh = mood === 'storm' ? '#151a20' : mood === 'night' ? '#0a0f1e' : mood === 'dusk' ? '#b5687a' : '#cfe3f0';
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="0.6" stopColor={b} /><stop offset="1" stopColor={c} /></linearGradient>
      </defs>
      <rect x={-200} y={-200} width={1480} height={h + 200} fill={`url(#${id}-g)`} />
      {sun && mood === 'day' && <circle cx={820} cy={320} r={90} fill="#fff6c8" stroke={INK} strokeWidth={OW} />}
      {sun && mood === 'dusk' && <circle cx={760} cy={h * 0.62} r={130} fill="#ffcf7a" opacity={0.95} />}
      {sun && mood === 'night' && <><circle cx={800} cy={300} r={60} fill="#f2f0e0" stroke={INK} strokeWidth={OW} /><circle cx={822} cy={286} r={56} fill={a} /></>}
      {mood === 'night' && Array.from({length: 60}, (_, i) => <circle key={i} cx={r() * 1080} cy={r() * h * 0.6} r={1 + r() * 2.2} fill="#fff" opacity={0.4 + r() * 0.5} />)}
      {Array.from({length: Math.round(6 * clouds)}, (_, i) => {
        const w = 160 + r() * 200, x = ((r() * 1400 + t * (4 + i * 2)) % 1500) - 300, y = 260 + r() * h * 0.5;
        return <ellipse key={`f${i}`} cx={x} cy={y} rx={w} ry={w * 0.22} fill={cl} opacity={0.45} filter="url(#b6)" />;
      })}
      {Array.from({length: Math.round(7 * clouds)}, (_, i) => {
        const w = 220 + r() * 260, x = ((r() * 1400 + t * (10 + i * 3)) % 1500) - 300, y = 140 + r() * h * 0.45;
        return (
          <g key={`c${i}`} opacity={0.9}>
            <path d={`M ${x} ${y} c ${w * 0.1} -${w * 0.25} ${w * 0.35} -${w * 0.3} ${w * 0.45} -${w * 0.1} c ${w * 0.12} -${w * 0.2} ${w * 0.38} -${w * 0.18} ${w * 0.42} ${w * 0.02} c ${w * 0.12} 0 ${w * 0.16} ${w * 0.12} ${w * 0.13} ${w * 0.16} Z`} fill={cl} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            <path d={`M ${x + w * 0.1} ${y - 4} L ${x + w * 0.95} ${y - 4}`} stroke={sh} strokeWidth={14} strokeLinecap="round" />
            <path d={`M ${x + w * 0.12} ${y - w * 0.12} c ${w * 0.08} -${w * 0.16} ${w * 0.26} -${w * 0.2} ${w * 0.34} -${w * 0.06}`} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={mood === 'storm' || mood === 'night' ? 0.15 : 0.7} />
          </g>
        );
      })}
    </g>
  );
};

export const Ocean: React.FC<{mood: Mood; t: number; y: number; id?: string; rough?: number}> = ({mood, t, y, id = 'sea', rough = 0}) => {
  const [a, b] = SEA[mood];
  const r = mulberry32(11);
  const lines = 12 + Math.round(rough * 8);
  return (
    <g>
      <defs><linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect x={-200} y={y} width={1480} height={2400 - y} fill={`url(#${id}-g)`} />
      <path d={`M -200 ${y} L 1280 ${y}`} stroke={INK} strokeWidth={OW} />
      {Array.from({length: lines}, (_, i) => {
        const yy = y + 30 + i * i * 9 + i * 20, amp = 4 + i * 1.6 + rough * 10, ph = t * (1.2 + rough) + i * 1.7;
        const x0 = r() * 300 - 300;
        let d = `M ${x0} ${yy}`;
        for (let x = x0; x < 1300; x += 60) d += ` Q ${x + 15} ${yy - amp * Math.sin(ph + x * 0.02)} ${x + 30} ${yy} T ${x + 60} ${yy}`;
        return <path key={i} d={d} stroke={mood === 'day' ? '#a8d4f0' : mood === 'night' ? '#2a3a58' : '#8aa0b8'} strokeWidth={2 + i * 0.25} fill="none" opacity={0.55} />;
      })}
      {mood === 'night' && <path d={`M 760 ${y + 10} L 840 ${y + 10} L 900 ${y + 600} L 700 ${y + 600} Z`} fill="#f2f0e0" opacity={0.08} />}
    </g>
  );
};

// US insignia, 1945: white star in a blue disc with white bars, blue outline
const Insignia: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const star = Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 8 : 20; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(' ');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-46} y={-9} width={92} height={18} fill="#f4f4f0" stroke="#1d3d7a" strokeWidth={4} />
      <circle r={24} fill="#1d3d7a" stroke={INK} strokeWidth={3} />
      <polygon points={star} fill="#f4f4f0" />
    </g>
  );
};

// TBM Avenger, side view facing right. ~640 px long at s = 1.
export const Avenger: React.FC<{x: number; y: number; s?: number; t: number; flip?: boolean; tilt?: number; night?: number}> = ({x, y, s = 1, t, flip, tilt = 0, night = 0}) => {
  const top = lerp(0, 1, night) > 0.5 ? '#1e2a3c' : '#334a68', side = night > 0.5 ? '#2a3a52' : '#4a6584', belly = night > 0.5 ? '#4a5a6c' : '#a2b4c4';
  const prop = (t * 37) % 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${tilt})`}>
      {/* far wing */}
      <path d="M 160 -6 C 120 -40 -10 -44 -60 -30 L -40 -14 Z" fill={top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {/* tail */}
      <path d="M -240 -24 L -282 -150 L -330 -150 L -318 -12 Z" fill={top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M -300 -120 L -326 -120" stroke="#f4f4f0" strokeWidth={6} />
      {/* fuselage */}
      <path d="M 240 -62 C 120 -74 -100 -54 -300 -20 L -312 8 C -100 34 120 66 240 60 Z" fill={side} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M 240 30 C 120 50 -60 40 -300 2 L -312 8 C -100 34 120 66 240 60 Z" fill={belly} />
      <path d="M 240 -62 C 120 -74 -100 -54 -300 -20 L -300 -10 C -100 -42 120 -60 240 -46 Z" fill={top} />
      <path d="M 240 -62 C 120 -74 -100 -54 -300 -20 L -312 8 C -100 34 120 66 240 60 Z" fill="none" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {/* the long "greenhouse" canopy and the ball turret */}
      <path d="M 170 -64 C 160 -116 60 -126 -70 -106 L -92 -60 Z" fill="#bcd8e8" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[120, 70, 20, -30].map((cx) => <path key={cx} d={`M ${cx} -64 L ${cx + 6} -116`} stroke={side} strokeWidth={6} />)}
      <path d="M 150 -100 C 100 -116 40 -118 0 -112" stroke="#fff" strokeWidth={6} opacity={0.7} />
      <circle cx={-104} cy={-70} r={30} fill="#bcd8e8" stroke={INK} strokeWidth={OW} />
      <path d="M -116 -88 l 12 -8" stroke="#fff" strokeWidth={5} />
      <Insignia x={-150} y={-6} s={0.9} />
      {/* horizontal stabiliser */}
      <ellipse cx={-270} cy={-2} rx={70} ry={12} fill={top} stroke={INK} strokeWidth={OW} />
      {/* near wing (airfoil seen from the side) */}
      <path d="M 180 16 C 150 0 -30 4 -70 22 C -30 40 150 38 180 16 Z" fill={side} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {/* engine cowl + propeller blur */}
      <path d="M 240 -62 L 290 -56 C 310 -30 310 30 290 52 L 240 60 Z" fill="#2a3446" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[-40, -14, 12, 38].map((yy) => <rect key={yy} x={246} y={yy} width={40} height={6} fill="#5a6474" />)}
      <ellipse cx={318} cy={0} rx={10} ry={128} fill="#d8dde2" opacity={0.28 + 0.1 * Math.sin(prop * Math.PI * 2)} />
      <path d={`M 316 0 L ${318 + 4} ${-118 * Math.cos(prop * Math.PI * 2)}`} stroke="#6a6e74" strokeWidth={8} opacity={0.5} />
      <path d="M 296 -20 C 330 -16 330 16 296 20 Z" fill="#c9cdd2" stroke={INK} strokeWidth={OW} />
    </g>
  );
};

// PBM Mariner flying boat, side view facing right. ~720 px at s = 1.
export const Mariner: React.FC<{x: number; y: number; s?: number; t: number; night?: number}> = ({x, y, s = 1, t, night = 1}) => {
  const top = night > 0.5 ? '#1c2a40' : '#33507a', side = night > 0.5 ? '#2a3c58' : '#4a6c94', belly = night > 0.5 ? '#5a6878' : '#c8d2da';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* twin tail with dihedral stabiliser */}
      <path d="M -300 -60 L -380 -110 L -380 -96 L -300 -40 Z" fill={top} stroke={INK} strokeWidth={OW} />
      <path d="M -380 -110 L -400 -210 L -430 -210 L -414 -96 Z" fill={top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {/* boat hull */}
      <path d="M 360 20 C 340 -60 240 -70 40 -70 L -300 -60 L -360 -40 L -350 -10 C -120 40 200 70 360 20 Z" fill={side} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M 360 20 C 200 70 -120 40 -350 -10 L -340 6 C -120 50 200 80 340 34 Z" fill={belly} stroke={INK} strokeWidth={OW} />
      <path d="M 40 26 L 60 50" stroke={INK} strokeWidth={OW} />
      {/* cockpit windows */}
      <path d="M 290 -40 C 280 -66 230 -70 200 -66 L 200 -40 Z" fill="#bcd8e8" stroke={INK} strokeWidth={OW} />
      {[-40, -100, -160].map((xx) => <circle key={xx} cx={xx} cy={-30} r={9} fill={night > 0.5 ? '#ffd27a' : '#bcd8e8'} stroke={INK} strokeWidth={3} />)}
      {/* gull wing on top + engine */}
      <path d="M 80 -70 L 60 -150 L 160 -150 L 150 -70 Z" fill={top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M -60 -150 L 260 -150 L 250 -170 L -40 -172 Z" fill={top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M 90 -176 L 250 -176 C 270 -176 270 -134 250 -134 L 90 -134 Z" fill="#2a3446" stroke={INK} strokeWidth={OW} />
      <ellipse cx={272} cy={-155} rx={8} ry={70} fill="#d8dde2" opacity={0.3 + 0.1 * Math.sin(t * 40)} />
      <Insignia x={-200} y={-20} s={0.8} />
      {/* wing-tip float */}
      <path d="M 120 -150 L 120 -100 M 80 -96 C 100 -110 150 -110 170 -96 C 150 -86 100 -86 80 -96 Z" stroke={INK} strokeWidth={OW} fill={side} />
    </g>
  );
};

// a 1940s Navy ship, side view facing right
export const Ship: React.FC<{x: number; y: number; s?: number; light?: number; beam?: number; t?: number}> = ({x, y, s = 1, light = 0, beam = 0, t = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {beam > 0 && <path d={`M 60 -150 L ${600 * Math.cos(Math.sin(t * 0.6) * 0.4)} ${-40 + 200 * Math.sin(Math.sin(t * 0.6) * 0.4)} L ${600 * Math.cos(Math.sin(t * 0.6) * 0.4 + 0.12)} ${40 + 200 * Math.sin(Math.sin(t * 0.6) * 0.4 + 0.12)} Z`} fill="#fff6c8" opacity={0.18 * beam} />}
    <path d="M -300 -20 L 320 -20 L 280 40 L -270 40 Z" fill="#5a6470" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
    <path d="M -300 -20 L 320 -20 L 316 -8 L -298 -8 Z" fill="#7a8490" />
    <rect x={-120} y={-90} width={200} height={70} fill="#6a7480" stroke={INK} strokeWidth={OW} />
    <rect x={-60} y={-150} width={110} height={60} fill="#6a7480" stroke={INK} strokeWidth={OW} />
    <rect x={10} y={-200} width={30} height={50} fill="#4a525c" stroke={INK} strokeWidth={OW} />
    <path d="M -10 -150 L -10 -260 M -40 -230 L 20 -230" stroke={INK} strokeWidth={OW} />
    {[-100, -60, -20, 30].map((xx) => <rect key={xx} x={xx} y={-74} width={22} height={16} fill={light ? '#ffd27a' : '#2a323c'} stroke={INK} strokeWidth={2} />)}
    <circle cx={60} cy={-150} r={14} fill={beam ? '#fff6c8' : '#2a323c'} stroke={INK} strokeWidth={3} />
  </g>
);

// ---------------- the map ----------------
const MX = (lon: number) => (lon + 84.5) * 45, MY = (lat: number) => 420 + (36 - lat) * 45;
const poly = (pts: number[][]) => 'M ' + pts.map(([lo, la]) => `${MX(lo).toFixed(1)} ${MY(la).toFixed(1)}`).join(' L ') + ' Z';
const FLORIDA = [[-86, 36.5], [-86, 30.4], [-84, 30.0], [-83.0, 29.2], [-82.7, 28.0], [-82.6, 27.0], [-81.8, 26.1], [-81.1, 25.2], [-80.4, 25.2], [-80.1, 26.0], [-80.0, 26.8], [-80.6, 28.4], [-81.2, 29.8], [-81.4, 30.7], [-81.2, 31.6], [-80.6, 32.4], [-79.2, 33.2], [-78.2, 33.9], [-77.2, 34.6], [-76.4, 35.2], [-75.6, 35.8], [-75.8, 36.5]];
const CUBA = [[-84.9, 21.9], [-83.0, 22.9], [-81.0, 23.15], [-79.4, 22.6], [-77.6, 21.8], [-75.6, 20.7], [-74.2, 20.2], [-75.4, 19.9], [-77.6, 19.9], [-78.6, 21.0], [-80.6, 21.7], [-83.0, 22.0], [-84.9, 21.6]];
const HISP = [[-74.4, 19.8], [-72.8, 19.9], [-70.6, 19.8], [-69.3, 19.2], [-68.4, 18.6], [-69.9, 18.3], [-71.4, 17.7], [-72.9, 18.1], [-74.4, 18.4]];
const PR = [[-67.25, 18.5], [-65.6, 18.42], [-65.65, 17.98], [-67.2, 17.95]];
const BAHAMAS = [[-77.9, 24.3, 0.5, 0.9], [-77.5, 25.1, 0.4, 0.3], [-77.4, 26.6, 0.9, 0.25], [-78.4, 26.65, 0.9, 0.2], [-76.4, 24.9, 0.3, 0.9], [-75.9, 23.7, 0.5, 0.3], [-74.6, 22.4, 0.5, 0.3], [-73.6, 21.1, 0.6, 0.3], [-75.5, 24.0, 0.2, 0.5]];
export const MAP_PTS = {miami: [MX(-80.2), MY(25.8)], bermuda: [MX(-64.8), MY(32.3)], sanjuan: [MX(-66.1), MY(18.45)], lauderdale: [MX(-80.1), MY(26.1)]};

export type MapState = {tri: number; planes?: number; gone?: number; arrows?: number; question?: number; glow?: number; t: number; labels?: number; zoom?: number};
export const MapScene: React.FC<{s: MapState}> = ({s}) => {
  const [m, b, p] = [MAP_PTS.miami, MAP_PTS.bermuda, MAP_PTS.sanjuan];
  const perim = Math.hypot(b[0] - m[0], b[1] - m[1]) + Math.hypot(p[0] - b[0], p[1] - b[1]) + Math.hypot(m[0] - p[0], m[1] - p[1]);
  const tri = clamp(s.tri), z = s.zoom ?? 1;
  const r = mulberry32(3);
  const land = '#c9b48a', landShade = '#a8916a';
  return (
    <g transform={`translate(540 ${960}) scale(${z}) translate(-540 -960)`}>
      <rect x={-400} y={-400} width={1880} height={2720} fill="#123049" />
      {Array.from({length: 26}, (_, i) => <path key={`g${i}`} d={`M ${-400 + i * 90} -400 L ${-400 + i * 90} 2400 M -400 ${-400 + i * 120} L 1480 ${-400 + i * 120}`} stroke="#2a5272" strokeWidth={2} opacity={0.5} />)}
      {Array.from({length: 40}, (_, i) => <text key={`d${i}`} x={r() * 1080} y={200 + r() * 1500} fontFamily={FONT} fontWeight={800} fontSize={18} fill="#3c6a8e" opacity={0.6}>{Math.round(200 + r() * 4000)}</text>)}
      {[FLORIDA, CUBA, HISP, PR].map((pts, i) => <path key={i} d={poly(pts)} fill={land} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
      <path d={poly(FLORIDA)} fill="none" stroke={landShade} strokeWidth={14} opacity={0.5} transform="translate(-6 6)" />
      {BAHAMAS.map(([lo, la, w, h], i) => <ellipse key={i} cx={MX(lo)} cy={MY(la)} rx={w * 30} ry={h * 30} fill={land} stroke={INK} strokeWidth={3} />)}
      <circle cx={b[0]} cy={b[1]} r={9} fill={land} stroke={INK} strokeWidth={3} />
      {/* compass rose */}
      <g transform="translate(900 1560)" opacity={0.7}>
        <circle r={70} fill="none" stroke="#c9b48a" strokeWidth={3} />
        <path d="M 0 -90 L 14 0 L 0 90 L -14 0 Z M -90 0 L 0 14 L 90 0 L 0 -14 Z" fill="#c9b48a" />
        <text y={-100} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#c9b48a">С</text>
      </g>
      {/* the triangle, drawn as a red glowing line */}
      {tri > 0 && (
        <g>
          <path d={`M ${m[0]} ${m[1]} L ${b[0]} ${b[1]} L ${p[0]} ${p[1]} Z`} fill="#ff2a2a" opacity={0.12 * tri * (1 + (s.glow ?? 0))} />
          <path d={`M ${m[0]} ${m[1]} L ${b[0]} ${b[1]} L ${p[0]} ${p[1]} L ${m[0]} ${m[1]}`} fill="none" stroke="#ff3030" strokeWidth={18} opacity={0.35} strokeDasharray={perim} strokeDashoffset={perim * (1 - tri)} style={{filter: 'blur(6px)'}} />
          <path d={`M ${m[0]} ${m[1]} L ${b[0]} ${b[1]} L ${p[0]} ${p[1]} L ${m[0]} ${m[1]}`} fill="none" stroke="#ff3a3a" strokeWidth={7} strokeDasharray={perim} strokeDashoffset={perim * (1 - tri)} strokeLinejoin="round" />
        </g>
      )}
      {(s.labels ?? 1) > 0 && [[m, 'Майами', -170, 40], [b, 'Бермуды', -90, -40], [p, 'Пуэрто-Рико', -120, 70]].map(([pt, name, dx, dy], i) => (
        <g key={i} opacity={clamp(s.labels ?? 1)}>
          <circle cx={(pt as number[])[0]} cy={(pt as number[])[1]} r={12} fill="#ffe08a" stroke={INK} strokeWidth={4} />
          <text x={(pt as number[])[0] + (dx as number)} y={(pt as number[])[1] + (dy as number)} fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke">{name as string}</text>
        </g>
      ))}
      {/* six planes vanishing one by one */}
      {(s.planes ?? 0) > 0 && Array.from({length: 6}, (_, i) => {
        const g = clamp((s.gone ?? 0) * 6 - i), cx = MX(-74.0 + (i % 3) * 3.1), cy = MY(26.9 - Math.floor(i / 3) * 2.6); // all six INSIDE the triangle (user fix, 03.11)
        return (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(45) scale(${1 - g * 0.6})`} opacity={1 - g}>
            <path d="M 0 -34 L 6 -10 L 34 4 L 34 12 L 6 6 L 4 26 L 14 34 L 14 38 L 0 34 L -14 38 L -14 34 L -4 26 L -6 6 L -34 12 L -34 4 L -6 -10 Z" fill={i === 5 ? '#ffd27a' : '#f4f4f0'} stroke={INK} strokeWidth={3} />
            {g > 0 && g < 1 && <circle r={40 * g + 10} fill="none" stroke="#ff4a4a" strokeWidth={4} opacity={1 - g} />}
          </g>
        );
      })}
      {/* course arrows: west to the coast vs. where they flew. The flight is INSIDE the triangle (near the Bahamas)
          and their north-east course runs deeper into it — "прямо в сердце треугольника" (user fix, 03.11) */}
      {(s.arrows ?? 0) > 0 && (() => {
        const k = clamp(s.arrows!), a0 = [MX(-76.7), MY(26.0)];
        const west = [MX(-79.6), MY(26.1)], ne = [MX(-71.6), MY(27.9)];
        const heart = clamp((k - 0.85) / 0.15), pulse = (t: number) => (t * 1.6) % 1;
        return (
          <g>
            {heart > 0 && [0, 0.5].map((o) => {
              const q = pulse(s.t + o);
              return <circle key={o} cx={ne[0]} cy={ne[1]} r={20 + q * 90} fill="none" stroke="#ff3a3a" strokeWidth={6} opacity={heart * (1 - q)} />;
            })}
            {heart > 0 && <circle cx={ne[0]} cy={ne[1]} r={16} fill="#ff3a3a" stroke={INK} strokeWidth={4} opacity={heart} />}
            <circle cx={a0[0]} cy={a0[1]} r={16} fill="#ffd27a" stroke={INK} strokeWidth={4} />
            <path d={`M ${a0[0]} ${a0[1]} L ${lerp(a0[0], west[0], clamp(k * 2))} ${lerp(a0[1], west[1], clamp(k * 2))}`} stroke="#4ade80" strokeWidth={14} strokeLinecap="round" />
            {k > 0.5 && <path d={`M ${west[0]} ${west[1]} l 34 -24 l 0 48 Z`} fill="#4ade80" stroke={INK} strokeWidth={3} />}
            {k > 0.3 && <text x={west[0] - 10} y={west[1] - 40} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#4ade80" stroke={INK} strokeWidth={8} paintOrder="stroke">К БЕРЕГУ</text>}
            <path d={`M ${a0[0]} ${a0[1]} L ${lerp(a0[0], ne[0], clamp(k * 2 - 0.6))} ${lerp(a0[1], ne[1], clamp(k * 2 - 0.6))}`} stroke="#ff3a3a" strokeWidth={14} strokeLinecap="round" strokeDasharray="30 18" />
            {k > 0.8 && <text x={ne[0] - 120} y={ne[1] - 40} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#ff5a5a" stroke={INK} strokeWidth={8} paintOrder="stroke">ИХ КУРС</text>}
          </g>
        );
      })()}
      {(s.question ?? 0) > 0 && (
        <text x={(m[0] + b[0] + p[0]) / 3} y={(m[1] + b[1] + p[1]) / 3 + 90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={260} fill="#ff3a3a" stroke={INK} strokeWidth={14} paintOrder="stroke" opacity={clamp(s.question!)}>?</text>
      )}
    </g>
  );
};

// ---------------- radio room ----------------
export const RadioRoom: React.FC<{t: number; night?: number; clock: number; glow?: number; children?: React.ReactNode}> = ({t, night = 0, clock, glow = 0.5, children}) => {
  const n = clamp(night);
  const wall = n > 0.5 ? '#3b4250' : '#c9c2a8', wallShade = n > 0.5 ? '#2a303c' : '#ada68c';
  const hr = (clock / 60) % 12, mn = clock % 60;
  const r = mulberry32(5);
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill={wall} />
      <rect x={0} y={0} width={1080} height={1920} fill={wallShade} opacity={0.3} />
      {/* window */}
      <g>
        <rect x={80} y={240} width={400} height={480} fill={n > 0.5 ? '#0e1630' : '#8fc8ec'} stroke={INK} strokeWidth={OW} />
        {n < 0.5 && <><path d="M 80 620 L 480 620 L 480 720 L 80 720 Z" fill="#e8d8a0" /><path d="M 140 720 C 150 600 170 520 210 470 M 210 470 c -40 -10 -80 10 -100 40 M 210 470 c 30 -30 80 -30 110 0 M 210 470 c -10 -40 10 -70 40 -80" stroke="#2d6a3a" strokeWidth={14} fill="none" strokeLinecap="round" /></>}
        {n > 0.5 && Array.from({length: 14}, (_, i) => <circle key={i} cx={100 + r() * 360} cy={260 + r() * 300} r={2} fill="#fff" opacity={0.7} />)}
        <path d="M 280 240 L 280 720 M 80 480 L 480 480" stroke="#e8e4d8" strokeWidth={14} />
        <rect x={80} y={240} width={400} height={480} fill="none" stroke={INK} strokeWidth={OW} />
      </g>
      {/* a map of the area pinned to the wall */}
      <g transform="translate(560 260) rotate(2)">
        <rect width={400} height={300} fill="#e6dcc0" stroke={INK} strokeWidth={OW} />
        <path d="M 60 40 L 90 60 L 100 120 L 120 200 L 140 240 L 160 220 L 140 160 L 120 80 L 100 40 Z" fill="#c9b48a" stroke={INK} strokeWidth={3} />
        {[[220, 160], [250, 140], [270, 190], [300, 210]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={14} ry={6} fill="#c9b48a" stroke={INK} strokeWidth={2} />)}
        <circle cx={140} cy={210} r={8} fill="#c22" /><path d="M 140 210 L 260 170" stroke="#c22" strokeWidth={3} strokeDasharray="8 6" />
        <circle cx={0} cy={0} r={8} fill="#c22" stroke={INK} strokeWidth={2} transform="translate(200 -4)" />
      </g>
      {/* wall clock */}
      <g transform="translate(860 680)">
        <circle r={86} fill="#f4f1e6" stroke={INK} strokeWidth={OW * 1.5} />
        {Array.from({length: 12}, (_, i) => <path key={i} d={`M ${Math.sin(i * Math.PI / 6) * 70} ${-Math.cos(i * Math.PI / 6) * 70} L ${Math.sin(i * Math.PI / 6) * 78} ${-Math.cos(i * Math.PI / 6) * 78}`} stroke={INK} strokeWidth={5} />)}
        <path d={`M 0 0 L ${Math.sin((hr + mn / 60) * Math.PI / 6) * 42} ${-Math.cos((hr + mn / 60) * Math.PI / 6) * 42}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <path d={`M 0 0 L ${Math.sin(mn * Math.PI / 30) * 64} ${-Math.cos(mn * Math.PI / 30) * 64}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle r={7} fill={INK} />
      </g>
      {children}
      {/* desk and the big radio set */}
      <rect x={-20} y={1260} width={1120} height={700} fill="#5a3e28" stroke={INK} strokeWidth={OW} />
      <rect x={-20} y={1260} width={1120} height={36} fill="#7a5638" stroke={INK} strokeWidth={OW} />
      <g transform="translate(560 1000)">
        <rect x={0} y={0} width={480} height={262} rx={10} fill="#4a4e52" stroke={INK} strokeWidth={OW} />
        <rect x={20} y={20} width={200} height={110} rx={6} fill="#1a1c1e" stroke={INK} strokeWidth={3} />
        <rect x={30} y={30} width={180} height={90} fill="#f2c45a" opacity={0.25 + glow * 0.6} />
        <path d={`M 40 75 ${Array.from({length: 16}, (_, i) => `L ${48 + i * 10} ${75 + Math.sin(t * 20 + i * 1.3) * 30 * glow}`).join(' ')}`} stroke="#3a2a10" strokeWidth={4} fill="none" />
        {[[290, 70], [390, 70], [290, 190], [390, 190]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r={36} fill="#2a2c30" stroke={INK} strokeWidth={3} /><path d={`M ${x} ${y} L ${x + Math.cos(i + t * 0.2) * 28} ${y + Math.sin(i + t * 0.2) * 28}`} stroke="#d8d8d0" strokeWidth={6} /></g>
        ))}
        <rect x={30} y={150} width={180} height={90} rx={6} fill="#2a2c30" stroke={INK} strokeWidth={3} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M 40 ${162 + i * 13} L 200 ${162 + i * 13}`} stroke="#4a4e52" strokeWidth={5} />)}
        <circle cx={460} cy={20} r={10} fill={glow > 0.2 ? '#ff4a2a' : '#5a1a10'} stroke={INK} strokeWidth={2} />
      </g>
      {/* logbook */}
      <g transform="translate(120 1310) rotate(-4)">
        <rect width={300} height={200} fill="#efe7d2" stroke={INK} strokeWidth={OW} />
        {Array.from({length: 7}, (_, i) => <path key={i} d={`M 20 ${30 + i * 24} L ${180 + (i * 37) % 90} ${30 + i * 24}`} stroke="#3a3a6a" strokeWidth={3} opacity={0.6} />)}
      </g>
      {/* desk mic */}
      <g transform="translate(470 1270)">
        <rect x={-50} y={-14} width={100} height={20} rx={6} fill="#2a2a30" stroke={INK} strokeWidth={OW} />
        <path d="M 0 -14 L 0 -120" stroke="#3a3a42" strokeWidth={10} />
        <rect x={-28} y={-200} width={56} height={90} rx={26} fill="#3a3a42" stroke={INK} strokeWidth={OW} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M -18 ${-180 + k * 16} L 18 ${-180 + k * 16}`} stroke="#6a6a74" strokeWidth={4} />)}
      </g>
      {n > 0.5 && <rect x={0} y={0} width={1080} height={1920} fill="#0a1030" opacity={0.25} />}
      {n > 0.5 && <ellipse cx={800} cy={1100} rx={420} ry={300} fill="#f2c45a" opacity={0.12 * glow} />}
    </g>
  );
};

// ---------------- cockpit (looking at the pilot from the nose) ----------------
export const Cockpit: React.FC<{t: number; mood: Mood; spin?: number; rain?: number; children?: React.ReactNode; ground?: React.ReactNode}> = ({t, mood, spin = 0, rain = 0, children, ground}) => {
  const r = mulberry32(9);
  const frame = '#2f4058';
  return (
    <g>
      <Sky mood={mood} t={t} id="ck" clouds={1.2} sun={mood !== 'storm'} />
      {ground}
      {children}
      <g style={{mixBlendMode: 'screen'}} opacity={mood === 'storm' || mood === 'night' ? 0.25 : 0.5}>
        <polygon points="160,1300 360,1300 760,300 640,300" fill="#ffffff" opacity={0.12} />
        <polygon points="420,1300 470,1300 860,320 820,320" fill="#ffffff" opacity={0.18} />
      </g>
      {/* canopy frame */}
      <path d="M -20 -20 L 1100 -20 L 1100 1960 L -20 1960 Z M 120 380 C 200 200 880 200 960 380 L 1000 1300 L 80 1300 Z" fill={frame} fillRule="evenodd" stroke={INK} strokeWidth={OW} />
      <path d="M 540 220 L 540 380 M 120 380 L 960 380" stroke={frame} strokeWidth={26} />
      {Array.from({length: 14}, (_, i) => <circle key={`rv${i}`} cx={130 + i * 63} cy={380} r={5} fill="#5a6c86" />)}
      <path d="M 180 330 C 260 250 400 236 500 240" stroke="#fff" strokeWidth={10} opacity={0.35} fill="none" strokeLinecap="round" />
      {rain > 0 && Array.from({length: 80}, (_, i) => {
        const x = 120 + r() * 840, y = ((r() * 1100 + t * (500 + r() * 300)) % 1000) + 300;
        return <path key={i} d={`M ${x} ${y} l -10 34`} stroke="#c8d8e8" strokeWidth={3} opacity={0.5 * rain} />;
      })}
      {/* instrument panel */}
      <path d="M -20 1260 C 300 1200 780 1200 1100 1260 L 1100 1960 L -20 1960 Z" fill="#22262c" stroke={INK} strokeWidth={OW} />
      {[[200, 1450], [880, 1450], [330, 1640], [750, 1640]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r={70} fill="#0e1012" stroke="#6a6e74" strokeWidth={8} />
          <path d={`M ${x} ${y} L ${x + Math.cos(i * 1.7 + 0.3) * 54} ${y + Math.sin(i * 1.7 + 0.3) * 54}`} stroke="#f2e8c8" strokeWidth={7} strokeLinecap="round" /></g>
      ))}
      <Compass x={540} y={1520} r={120} heading={spin > 0 ? t * 400 * spin + Math.sin(t * 9) * 40 * spin : 90} />
    </g>
  );
};

export const Compass: React.FC<{x: number; y: number; r: number; heading: number}> = ({x, y, r, heading}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r + 14} fill="#3a3e44" stroke={INK} strokeWidth={OW} />
    <circle r={r} fill="#101214" />
    <g transform={`rotate(${-heading})`}>
      {Array.from({length: 36}, (_, i) => <path key={i} d={`M 0 ${-r + 6} L 0 ${-r + (i % 3 ? 18 : 30)}`} stroke="#e8e0c8" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 10})`} />)}
      {['С', 'В', 'Ю', 'З'].map((l, i) => <text key={l} x={0} y={-r + 66} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.3} fill={i === 0 ? '#ff4a3a' : '#e8e0c8'} transform={`rotate(${i * 90})`}>{l}</text>)}
    </g>
    <path d={`M 0 ${-r * 0.75} L 0 ${r * 0.75}`} stroke="#ff9a3a" strokeWidth={6} />
    <circle r={r} fill="#bcd8e8" opacity={0.1} />
    <path d={`M ${-r * 0.6} ${-r * 0.5} Q ${-r * 0.2} ${-r * 0.85} ${r * 0.3} ${-r * 0.75}`} stroke="#fff" strokeWidth={6} opacity={0.4} fill="none" />
  </g>
);

export const FuelGauge: React.FC<{v: number; t: number}> = ({v, t}) => {
  const a = lerp(-120, 120, clamp(v)) + Math.sin(t * 13) * 2;
  return (
    <g transform="translate(540 960)">
      <circle r={380} fill="#2a2e34" stroke={INK} strokeWidth={8} />
      <circle r={330} fill="#0e1012" />
      {Array.from({length: 9}, (_, i) => { const aa = (-120 + i * 30) * Math.PI / 180; return <path key={i} d={`M ${Math.sin(aa) * 280} ${-Math.cos(aa) * 280} L ${Math.sin(aa) * 320} ${-Math.cos(aa) * 320}`} stroke={i < 2 ? '#ff4a3a' : '#e8e0c8'} strokeWidth={10} />; })}
      <text x={-250} y={160} fontFamily={FONT} fontWeight={900} fontSize={90} fill="#ff4a3a">E</text>
      <text x={190} y={160} fontFamily={FONT} fontWeight={900} fontSize={90} fill="#e8e0c8">F</text>
      <text x={0} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#e8e0c8">ТОПЛИВО</text>
      <path d={`M 0 0 L ${Math.sin(a * Math.PI / 180) * 290} ${-Math.cos(a * Math.PI / 180) * 290}`} stroke="#ff9a3a" strokeWidth={16} strokeLinecap="round" />
      <circle r={36} fill="#3a3e44" stroke={INK} strokeWidth={6} />
    </g>
  );
};
