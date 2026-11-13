// Thumbnail «Перевал Дятлова» in the «torn photo collage» style the user sent as a reference:
// night tent on the slope as background, torn photos from our video pinned around, big distressed slab title on torn paper.
// 1280×720 (render with --scale=1.5 → 1920×1080).
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';

const SLAB = 'RobotoSlabLocal';
let loaded = false;
const ensureSlab = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('slab');
  Promise.all([
    ['roboto-slab-cyrillic-900-normal.woff2', 'U+0400-045F, U+0490-0491, U+2116'],
    ['roboto-slab-latin-900-normal.woff2', 'U+0000-00FF, U+2000-206F'],
  ].map(([f, r]) => { const ff = new FontFace(SLAB, `url(${staticFile(`fonts/${f}`)}) format('woff2')`, {weight: '900', unicodeRange: r}); document.fonts.add(ff); return ff.load(); }))
    .then(() => continueRender(h)).catch(() => continueRender(h));
};

// deterministic jagged edge (torn paper) as a CSS polygon in %
const rnd = (s: number) => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
const torn = (seed: number, amp = 2.2, n = 26) => {
  const pts: string[] = [];
  const side = (fx: (t: number) => [number, number], k: number) => {
    for (let i = 0; i < n; i++) { const [x, y] = fx(i / n); const j = (rnd(seed * 100 + k * 37 + i) - 0.5) * amp; pts.push(`${(x + (k % 2 ? j : 0)).toFixed(2)}% ${(y + (k % 2 ? 0 : j)).toFixed(2)}%`); }
  };
  side((t) => [t * 100, amp / 2], 0); side((t) => [100 - amp / 2, t * 100], 1); side((t) => [100 - t * 100, 100 - amp / 2], 2); side((t) => [amp / 2, 100 - t * 100], 3);
  return `polygon(${pts.join(',')})`;
};

const Tape: React.FC<{x: number; y: number; w?: number; r: number}> = ({x, y, w = 110, r}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 30, background: 'rgba(225,228,232,0.55)', transform: `rotate(${r}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,0.3)', clipPath: torn(x + y, 6, 8)}} />
);

const Photo: React.FC<{src: string; x: number; y: number; w: number; h: number; r: number; seed: number; ox?: string; children?: React.ReactNode}> = ({src, x, y, w, h, r, seed, ox = 'center', children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${r}deg)`, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.75))'}}>
    <div style={{position: 'absolute', inset: 0, background: '#dfe3e8', clipPath: torn(seed, 3)}}>
      <div style={{position: 'absolute', inset: 9, overflow: 'hidden', clipPath: torn(seed + 7, 1.6)}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: ox, filter: 'grayscale(0.55) contrast(1.15) brightness(0.92) sepia(0.1) hue-rotate(180deg) saturate(0.6)'}} />
        {children}
      </div>
    </div>
  </div>
);

// distressed slab text (holes eaten by noise)
const Distressed: React.FC<{text: string; size: number; y: number; w: number; id: string; color?: string; spacing?: number; cut?: number}> = ({text, size, y, w, id, color = '#14213d', spacing = 6, cut = 10.4}) => (
  <svg width={w} height={size * 1.15} style={{position: 'absolute', left: 0, top: y, overflow: 'visible'}}>
    <defs>
      <filter id={id} x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={4} seed={id.length * 7} result="n" />
        <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -14 ${cut}`} result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" result="eaten" />
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="w" />
        <feDisplacementMap in="eaten" in2="w" scale={3} />
      </filter>
    </defs>
    <text x={w / 2} y={size * 0.92} textAnchor="middle" fontFamily={SLAB} fontWeight={900} fontSize={size} letterSpacing={spacing} fill={color} filter={`url(#${id})`} textLength={w * 0.9} lengthAdjust="spacingAndGlyphs">{text}</text>
  </svg>
);

export const CoverDyatlov: React.FC = () => {
  ensureSlab();
  return (
    <AbsoluteFill style={{background: '#0b1018', overflow: 'hidden'}}>
      {/* background: mountains on top, night tent on the slope below */}
      <Img src={staticFile('dyatlov/bg/d0-05-ridge.png')} style={{position: 'absolute', width: 1280, top: -40, left: 0, filter: 'grayscale(0.4) brightness(0.7) contrast(1.2)'}} />
      <div style={{position: 'absolute', left: 0, top: 260, width: 1280, height: 460, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 35%)', maskImage: 'linear-gradient(to bottom, transparent 0%, #000 35%)'}}>
        <Img src={staticFile('dyatlov/bg/tent-night-v4.png')} style={{position: 'absolute', width: 1280, top: 94, left: 218, filter: 'grayscale(0.3) brightness(0.85) contrast(1.15)'}} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,16,26,0) 30%, rgba(5,8,14,0.85) 100%)'}} />

      {/* torn photos around */}
      <Photo src="dyatlov/bg/d2-03-skitrack.png" x={-14} y={-10} w={330} h={235} r={-3} seed={1} />
      <Tape x={70} y={-6} r={-6} />
      <Photo src="dyatlov/bg/d1-03-map.png" x={990} y={-14} w={310} h={225} r={4} seed={2} ox="40% 50%">
        <svg width={292} height={207} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={170} cy={95} rx={62} ry={44} fill="none" stroke="#c81e1e" strokeWidth={5} transform="rotate(-10 170 95)" />
          <text x={170} y={117} textAnchor="middle" fontFamily={SLAB} fontWeight={900} fontSize={62} fill="#c81e1e">?</text>
          <path d="M215 130 q 20 40 70 60" fill="none" stroke="#c81e1e" strokeWidth={4} strokeDasharray="10 8" />
        </svg>
      </Photo>
      <Tape x={1070} y={-4} r={5} w={90} />
      <Photo src="dyatlov/bg/d0-03-footprints-socks.png" x={-24} y={505} w={300} h={230} r={4} seed={3} />
      <Photo src="dyatlov/bg/group-ten.png" x={968} y={492} w={330} h={235} r={-4} seed={4} ox="50% 40%" />
      <Tape x={1040} y={482} r={-8} />

      {/* channel label on a dark torn strip */}
      <div style={{position: 'absolute', left: 400, top: 34, width: 480, height: 84, background: '#0d131d', clipPath: torn(9, 5, 18), boxShadow: '0 6px 16px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', left: 400, top: 34, width: 480, height: 84}}>
        <Distressed text="НЕРАЗГАДАННОЕ" size={50} y={12} w={480} id="lbl" color="#e6ebf2" spacing={3} cut={11} />
      </div>
      <div style={{position: 'absolute', left: 470, top: 120, width: 340, height: 4, background: '#c81e1e', transform: 'rotate(-1deg)', clipPath: torn(5, 30, 10)}} />

      {/* title on torn paper */}
      <div style={{position: 'absolute', left: 150, top: 205, width: 980, height: 320, transform: 'rotate(-1.5deg)', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.8))'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: torn(11, 3.5, 34), background: 'linear-gradient(170deg, #f1f3f5 0%, #d9dee4 55%, #c6ccd4 100%)'}}>
          <svg width={980} height={320} style={{position: 'absolute', inset: 0, opacity: 0.35}}>
            <filter id="pp"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves={3} seed={8} /><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.35  0 0 0 0 0.42  0 0 0 0.9 -0.25" /></filter>
            <rect width={980} height={320} filter="url(#pp)" />
          </svg>
        </div>
        <Distressed text="ПЕРЕВАЛ" size={150} y={4} w={980} id="t1" />
        <Distressed text="ДЯТЛОВА" size={150} y={150} w={980} id="t2" />
      </div>
      {/* red stamp */}
      <div style={{position: 'absolute', left: 300, top: 528, transform: 'rotate(-8deg)', border: '5px solid #c81e1e', padding: '2px 16px', borderRadius: 6, opacity: 0.92}}>
        <Distressed text="1959" size={52} y={0} w={130} id="st" color="#c81e1e" spacing={4} />
        <div style={{width: 130, height: 60}} />
      </div>
    </AbsoluteFill>
  );
};
