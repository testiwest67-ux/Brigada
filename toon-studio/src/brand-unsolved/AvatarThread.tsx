// Channel avatar «Неразгаданное», idea 6: investigation board, red thread between pins forms a question mark.
// 800×800, shown as a circle (keep everything inside r≈360). Thread and pins are thick so the «?» reads at 40–48 px.
// Faded photos pinned behind are stills from our long videos (tent, ship, lighthouse), no captions.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

const RED = '#e8261c', INK = '#05070c';
const PINS: [number, number][] = [[262, 318], [318, 206], [430, 168], [535, 222], [548, 330], [470, 418], [405, 512]];
const DOT: [number, number] = [405, 640];

const Photo: React.FC<{src: string; x: number; y: number; w: number; h: number; r: number; ox: number; oy: number; sc: number}> = ({src, x, y, w, h, r, ox, oy, sc}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${r}deg)`, background: '#e6dcc6', padding: 10, boxShadow: '0 10px 18px rgba(0,0,0,0.6)', opacity: 0.55}}>
    <div style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}>
      <Img src={staticFile(src)} style={{position: 'absolute', width: 2752 * sc, left: -ox * sc, top: -oy * sc, filter: 'grayscale(0.5) brightness(0.8)'}} />
    </div>
  </div>
);

const Pin: React.FC<{x: number; y: number; r?: number; c?: string}> = ({x, y, r = 34, c = '#ff4a3a'}) => (
  <g>
    <ellipse cx={x + 8} cy={y + 12} rx={r} ry={r * 0.8} fill="#000" opacity={0.45} />
    <circle cx={x} cy={y} r={r} fill={c} stroke={INK} strokeWidth={9} />
    <circle cx={x - r * 0.32} cy={y - r * 0.32} r={r * 0.28} fill="#fff" opacity={0.75} />
  </g>
);

export const AvatarThread: React.FC = () => {
  const d = 'M' + PINS.map((p) => p.join(' ')).join(' L');
  return (
    <AbsoluteFill style={{background: '#2b1f14', overflow: 'hidden'}}>
      {/* cork board */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, #6b4a2c 0%, #3d2a19 55%, #160f09 100%)'}} />
      <svg width={800} height={800} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
        <filter id="cork"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 1.4 -0.35" /></filter>
        <rect width={800} height={800} filter="url(#cork)" />
      </svg>
      {/* pinned photos from our videos */}
      <Photo src="dyatlov/bg/d3-05-tent-evening.png" x={95} y={420} w={210} h={160} r={-9} ox={500} oy={500} sc={0.12} />
      <Photo src="mary-celeste/bg/m0-11-fog.png" x={150} y={110} w={200} h={150} r={7} ox={900} oy={300} sc={0.11} />
      <Photo src="flannan/bg/f1-04-lighthouse-dusk.png" x={505} y={430} w={200} h={160} r={8} ox={700} oy={250} sc={0.12} />
      <svg width={800} height={800} style={{position: 'absolute', inset: 0}}>
        <defs><filter id="tg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter></defs>
        <g transform="translate(400 395) scale(1.13) translate(-405 -410)">
        {/* thread: shadow, glow, body, twist highlight */}
        <path d={d} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={26} strokeLinejoin="round" transform="translate(8 12)" />
        <path d={d} fill="none" stroke="#ff3020" strokeOpacity={0.55} strokeWidth={40} strokeLinejoin="round" filter="url(#tg)" />
        <path d={d} fill="none" stroke={INK} strokeWidth={30} strokeLinejoin="round" />
        <path d={d} fill="none" stroke={RED} strokeWidth={20} strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#ff8a7a" strokeWidth={4} strokeDasharray="10 14" strokeLinejoin="round" opacity={0.8} />
        {/* loose end of the thread hanging towards the last pin: the answer is missing */}
        <path d={`M${PINS[6][0]} ${PINS[6][1]} q 12 50 -2 92`} fill="none" stroke={RED} strokeWidth={12} strokeDasharray="18 14" strokeLinecap="round" opacity={0.85} />
        {PINS.map(([x, y], i) => <Pin key={i} x={x} y={y} />)}
        <Pin x={DOT[0]} y={DOT[1]} r={44} c="#ffc24a" />
        </g>
      </svg>
      {/* vignette towards the circle edge */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.9) 80%)'}} />
    </AbsoluteFill>
  );
};

// Preview: the avatar as YouTube shows it (circle, large and phone sizes)
export const AvatarThreadPreview: React.FC = () => (
  <AbsoluteFill style={{background: '#0f0f0f', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 60}}>
    {[400, 160, 88, 48].map((s) => (
      <div key={s} style={{width: s, height: s, borderRadius: '50%', overflow: 'hidden', position: 'relative'}}>
        <div style={{width: 800, height: 800, transform: `scale(${s / 800})`, transformOrigin: '0 0', position: 'absolute'}}><AvatarThread /></div>
      </div>
    ))}
  </AbsoluteFill>
);
