// YouTube cover for «Маяк Фланнан», 1280×720 (series recipe: curiosity question + a red ring on the clue).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});
type Line = {t: string; c: string; size: number};
const V: Record<'A' | 'B', {img: string; lines: Line[]; bottom: string; ring?: {cx: number; cy: number; rx: number; ry: number; rot: number}}> = {
  A: {img: 'f0-08-coat', lines: [{t: 'ТРОЕ ИСЧЕЗЛИ', c: '#fff', size: 80}, {t: 'С МАЯКА', c: '#ff2e2e', size: 120}],
    bottom: 'ОСТАЛСЯ ОДИН ПЛАЩ', ring: {cx: 405, cy: 150, rx: 125, ry: 80, rot: 0}},
  B: {img: 'f3-04-dark-light', lines: [{t: 'МАЯК ПОГАС.', c: '#fff', size: 92}, {t: 'ГДЕ СМОТРИТЕЛИ?', c: '#ff2e2e', size: 64}],
    bottom: 'ШОТЛАНДИЯ · 1900'},
};

export const FLThumb: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile(`flannan/bg/${v.img}.png`)} style={{position: 'absolute', width: 1280 * 1.06, height: 720 * 1.06, left: variant === 'A' ? -330 : -40, top: -20, objectFit: 'cover',
        filter: 'brightness(1.12) contrast(1.15) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 35%, rgba(5,7,12,0.55) 60%, rgba(5,7,12,0.88) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      {v.ring && (
        <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={v.ring.cx} cy={v.ring.cy} rx={v.ring.rx} ry={v.ring.ry} fill="none" stroke="#ff2e2e" strokeWidth={9}
            transform={`rotate(${v.ring.rot} ${v.ring.cx} ${v.ring.cy})`} style={{filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.9))'}} />
        </svg>
      )}
      <div style={{position: 'absolute', right: 44, top: 70, width: 720, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>МАЯК ФЛАННАН · 1900</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.04, color: l.c, marginTop: i ? 2 : 24, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#ffd27a', whiteSpace: 'nowrap', ...STROKE(7)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
