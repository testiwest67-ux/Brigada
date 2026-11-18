// Thumbnail «Маяк Фланнан» in the user's «КОРАБЛЬ-ПРИЗРАК» style: photoreal stormy background (ElevenLabs, public/flannan/cover/bg.png),
// three stacked distressed title lines (white / navy on torn paper / red), torn-paper question card top-right.
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

const rnd = (s: number) => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
const torn = (seed: number, amp = 2.2, n = 26) => {
  const pts: string[] = [];
  const side = (fx: (t: number) => [number, number], k: number) => {
    for (let i = 0; i < n; i++) { const [x, y] = fx(i / n); const j = (rnd(seed * 100 + k * 37 + i) - 0.5) * amp; pts.push(`${(x + (k % 2 ? j : 0)).toFixed(2)}% ${(y + (k % 2 ? 0 : j)).toFixed(2)}%`); }
  };
  side((t) => [t * 100, amp / 2], 0); side((t) => [100 - amp / 2, t * 100], 1); side((t) => [100 - t * 100, 100 - amp / 2], 2); side((t) => [amp / 2, 100 - t * 100], 3);
  return `polygon(${pts.join(',')})`;
};

const Line: React.FC<{text: string; size: number; y: number; w: number; x?: number; id: string; fill: string; stroke?: string; cut?: number; glow?: string}> = ({text, size, y, w, x = 0, id, fill, stroke, cut = 10.4, glow}) => (
  <svg width={w} height={size * 1.2} style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    <defs>
      <filter id={id} x="-5%" y="-15%" width="110%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={4} seed={id.length * 7 + 1} result="n" />
        <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -14 ${cut}`} result="holes" />
        <feComposite in="SourceGraphic" in2="holes" operator="in" />
      </filter>
    </defs>
    <text x={w / 2} y={size * 0.95} textAnchor="middle" fontFamily={SLAB} fontWeight={900} fontSize={size} letterSpacing={4}
      fill={fill} stroke={stroke} strokeWidth={stroke ? 10 : 0} paintOrder="stroke fill" filter={`url(#${id})`}
      style={{filter: glow ? `drop-shadow(0 0 18px ${glow})` : undefined}} textLength={w * 0.94} lengthAdjust="spacingAndGlyphs">{text}</text>
  </svg>
);

export const CoverFlannan: React.FC<{bg?: string}> = ({bg = 'flannan/cover/bg-1.png'}) => {
  ensureSlab();
  return (
    <AbsoluteFill style={{background: '#070b12', overflow: 'hidden'}}>
      <Img src={staticFile(bg)} style={{position: 'absolute', width: 1280, height: 720, objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(4,7,12,0.65) 62%, rgba(4,7,12,0.85) 100%)'}} />
      {/* question card, top right */}
      <div style={{position: 'absolute', left: 770, top: 60, width: 340, height: 140, transform: 'rotate(-4deg)', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.7))'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: torn(21, 4, 20), background: 'linear-gradient(170deg,#eef0f2,#c9ced6)'}} />
        <Line text="КУДА ИСЧЕЗЛИ" size={42} y={18} w={340} id="q1" fill="#14213d" cut={11.5} />
        <Line text="СМОТРИТЕЛИ?" size={46} y={70} w={340} id="q22" fill="#c81e1e" cut={11.5} />
      </div>
      <div style={{position: 'absolute', left: 1125, top: 40, fontFamily: SLAB, fontWeight: 900, fontSize: 150, color: '#e9edf2', lineHeight: 1, transform: 'rotate(8deg)', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.9)'}}>?</div>
      {/* title: 3 lines */}
      <Line text="ТРОЕ ИСЧЕЗЛИ" size={112} y={300} w={1000} x={140} id="t1" fill="#eef1f5" stroke="#05070c" cut={10.8} />
      <div style={{position: 'absolute', left: 120, top: 430, width: 1040, height: 128, transform: 'rotate(-1deg)', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.8))'}}>
        <div style={{position: 'absolute', inset: 0, clipPath: torn(31, 3.5, 34), background: 'linear-gradient(170deg, #f1f3f5 0%, #d6dbe1 60%, #c2c8d0 100%)'}} />
        <Line text="С МАЯКА" size={112} y={4} w={1040} id="t2" fill="#14213d" cut={10.4} />
      </div>
      <Line text="ФЛАННАН" size={118} y={562} w={900} x={190} id="t3" fill="#d9241b" stroke="#05070c" cut={10.8} glow="rgba(255,40,30,0.45)" />
    </AbsoluteFill>
  );
};
