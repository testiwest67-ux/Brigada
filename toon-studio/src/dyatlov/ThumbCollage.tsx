// «Перевал Дятлова» — обложка-коллаж 1280×720 (стиль по образцу пользователя): холодный сине-серый тон,
// рваные фото на скотче, карта с кругом «?», компас, крупный потёртый засечный шрифт, нижняя строка на полоске бумаги.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile} from 'remotion';

const SERIF = 'GeorgiaBoldLocal';
let loaded = false;
const ensureSerif = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const h = delayRender('serif');
  const ff = new FontFace(SERIF, `url(${staticFile('fonts/georgia-bold.ttf')}) format('truetype')`);
  document.fonts.add(ff);
  ff.load().then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

// jagged polygon (torn paper edge), deterministic
const rnd = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
const torn = (seed: number, amp = 1.6, n = 26) => {
  const p: string[] = [];
  for (let i = 0; i <= n; i++) p.push(`${(i / n) * 100}% ${rnd(seed + i) * amp}%`);
  for (let i = 0; i <= n; i++) p.push(`${100 - rnd(seed + 50 + i) * amp * 0.6}% ${(i / n) * 100}%`);
  for (let i = n; i >= 0; i--) p.push(`${(i / n) * 100}% ${100 - rnd(seed + 100 + i) * amp}%`);
  for (let i = n; i >= 0; i--) p.push(`${rnd(seed + 150 + i) * amp * 0.6}% ${(i / n) * 100}%`);
  return `polygon(${p.join(',')})`;
};

const BG = (f: string) => staticFile(`dyatlov/bg/${f}.png`);
const COLD = 'grayscale(0.75) brightness(1.05) contrast(1.15)';

const Tape: React.FC<{x: number; y: number; r: number; w?: number}> = ({x, y, r, w = 110}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 30, transform: `rotate(${r}deg)`, background: 'rgba(225,228,232,0.55)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)', clipPath: torn(r * 7 + x, 6, 8)}} />
);

const Photo: React.FC<{img: string; x: number; y: number; w: number; h: number; r: number; seed: number; pos?: string; zoom?: number}> = ({img, x, y, w, h, r, seed, pos = 'center', zoom = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${r}deg)`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.7))'}}>
    <div style={{position: 'absolute', inset: 0, background: '#dcdfe3', clipPath: torn(seed)}}>
      <div style={{position: 'absolute', inset: 9, overflow: 'hidden'}}>
        <Img src={BG(img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${zoom})`, filter: COLD}} />
      </div>
    </div>
  </div>
);

type V = {top: string; l1: string; l2: string; s1: number; s2: number};
const VARIANTS: Record<'D' | 'E' | 'F', V> = {
  D: {top: 'ЗАГАДКА 1959', l1: 'ПЕРЕВАЛ', l2: 'ДЯТЛОВА', s1: 150, s2: 150},
  E: {top: 'ПЕРЕВАЛ ДЯТЛОВА', l1: 'ДЕВЯТЬ', l2: 'НЕ ВЕРНУЛИСЬ', s1: 150, s2: 104},
  F: {top: 'ПЕРЕВАЛ ДЯТЛОВА', l1: 'УШЛИ', l2: 'БОСИКОМ', s1: 160, s2: 150},
};

export const ThumbCollage: React.FC<{variant: 'D' | 'E' | 'F'}> = ({variant}) => {
  ensureSerif();
  const v = VARIANTS[variant];
  return (
    <AbsoluteFill style={{background: '#0b1018', overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="grunge" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -5.6" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="out" />
        </filter>
      </svg>

      {/* background: snowy mountains + tent below */}
      <Img src={BG('d1-04-ural')} style={{position: 'absolute', width: 1280 * 1.1, height: 720 * 1.1, left: -64, top: -20, objectFit: 'cover', filter: `${COLD} brightness(0.62)`}} />
      <Img src={BG('tent-night')} style={{position: 'absolute', width: 1000, height: 562, left: 640 - 0.27 * 1000, top: 640 - 0.45 * 562, filter: `${COLD} brightness(0.85)`,
        WebkitMaskImage: 'radial-gradient(ellipse 34% 30% at 27% 47%, black 45%, transparent 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(10,14,22,0) 30%, rgba(10,14,22,0.75) 100%)'}} />

      {/* top-left: skiers */}
      <Photo img="d2-03-skitrack" x={-14} y={22} w={380} h={250} r={-3} seed={3} pos="45% 70%" zoom={1.15} />
      <Tape x={70} y={8} r={-12} />
      {/* top-right: map with a ringed question mark */}
      <div style={{position: 'absolute', left: 940, top: -16, width: 370, height: 270, transform: 'rotate(4deg)', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.7))'}}>
        <div style={{position: 'absolute', inset: 0, background: '#d8dbe0', clipPath: torn(11), overflow: 'hidden'}}>
          <Img src={BG('d1-03-map')} style={{position: 'absolute', width: 1000, left: -380, top: -40, filter: `${COLD} brightness(1.25)`}} />
          <svg width={370} height={270} style={{position: 'absolute', inset: 0}}>
            <ellipse cx={175} cy={120} rx={78} ry={52} fill="none" stroke="#14234a" strokeWidth={6} transform="rotate(-10 175 120)" />
            <text x={175} y={142} textAnchor="middle" fontFamily={SERIF} fontSize={66} fill="#14234a">?</text>
            <path d="M 245 150 Q 290 190 300 250" fill="none" stroke="#14234a" strokeWidth={5} strokeDasharray="12 10" />
          </svg>
        </div>
      </div>
      {/* compass cut from the map picture */}
      <div style={{position: 'absolute', left: 1112, top: 268, width: 170, height: 170, borderRadius: '50%', overflow: 'hidden', border: '5px solid #9aa3ad',
        boxShadow: '0 10px 18px rgba(0,0,0,0.75)'}}>
        <Img src={BG('d1-03-map')} style={{position: 'absolute', width: 2752 * 0.5, left: 85 - 401 * 0.5, top: 85 - 1077 * 0.5, filter: `${COLD} brightness(1.2)`}} />
      </div>
      {/* bottom-left: tent at night */}
      <Photo img="d0-03-footprints" x={-10} y={470} w={330} h={235} r={3} seed={21} pos="50% 70%" />
      <Tape x={110} y={458} r={8} w={95} />
      {/* bottom-right: the group */}
      <Photo img="group-ten" x={870} y={478} w={410} h={250} r={-3} seed={31} pos="50% 40%" />
      <Tape x={1150} y={470} r={-10} />

      {/* title */}
      <div style={{position: 'absolute', top: 34, width: '100%', textAlign: 'center'}}>
        <div style={{display: 'inline-block', padding: '10px 34px 14px', background: 'rgba(8,12,20,0.82)', clipPath: torn(41, 5, 14)}}>
          <div style={{fontFamily: SERIF, fontSize: 50, color: '#e9ecef', letterSpacing: 2, filter: 'url(#grunge)'}}>{v.top}</div>
          <div style={{height: 4, background: '#e9ecef', marginTop: 4, opacity: 0.85}} />
        </div>
      </div>
      <div style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: SERIF, fontSize: v.s1, lineHeight: 1, color: '#f1f3f5', letterSpacing: 6,
        textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.9)', filter: 'url(#grunge)'}}>{v.l1}</div>
      <div style={{position: 'absolute', top: 372, width: '100%', textAlign: 'center'}}>
        <div style={{display: 'inline-block', padding: '14px 40px 18px', background: '#e4e6e9', clipPath: torn(57, 4, 20), transform: 'rotate(-1deg)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.6)'}}>
          <div style={{fontFamily: SERIF, fontSize: v.s2, lineHeight: 1, color: '#14234a', letterSpacing: 6, filter: 'url(#grunge)'}}>{v.l2}</div>
        </div>
      </div>
      {/* cold blue grade over everything */}
      <AbsoluteFill style={{background: '#28406e', mixBlendMode: 'color', opacity: 0.35}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 140px rgba(0,0,0,0.7)'}} />
    </AbsoluteFill>
  );
};
