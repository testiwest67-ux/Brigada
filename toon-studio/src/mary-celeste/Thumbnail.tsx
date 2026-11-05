// YouTube cover for «Мэри Селест», 1280×720 (same recipe as the Dyatlov cover C: curiosity question + a red ring on the clue).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});
type Line = {t: string; c: string; size: number};
const V: Record<'A' | 'B', {img: string; lines: Line[]; bottom: string; ring?: {cx: number; cy: number; rx: number; ry: number; rot: number}}> = {
  A: {img: 'm0-01-drift', lines: [{t: 'КУДА ИСЧЕЗЛИ', c: '#fff', size: 74}, {t: '10 ЧЕЛОВЕК?', c: '#ff2e2e', size: 92}],
    bottom: 'КОРАБЛЬ-ПРИЗРАК · 1872', ring: {cx: 300, cy: 470, rx: 210, ry: 150, rot: -8}},
  B: {img: 'm0-06-davits', lines: [{t: 'КОРАБЛЬ', c: '#fff', size: 110}, {t: 'БЕЗ ЛЮДЕЙ', c: '#ff2e2e', size: 104}],
    bottom: 'ВСЁ НА МЕСТЕ · КРОМЕ ШЛЮПКИ', ring: {cx: 360, cy: 430, rx: 230, ry: 120, rot: -6}},
};

export const MCThumb: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile(`mary-celeste/bg/${v.img}.png`)} style={{position: 'absolute', width: 1280 * 1.06, height: 720 * 1.06, left: -40, top: -20, objectFit: 'cover',
        filter: 'brightness(1.12) contrast(1.15) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 30%, rgba(5,7,12,0.55) 58%, rgba(5,7,12,0.88) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      {v.ring && (
        <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={v.ring.cx} cy={v.ring.cy} rx={v.ring.rx} ry={v.ring.ry} fill="none" stroke="#ff2e2e" strokeWidth={9}
            transform={`rotate(${v.ring.rot} ${v.ring.cx} ${v.ring.cy})`} style={{filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.9))'}} />
        </svg>
      )}
      <div style={{position: 'absolute', right: 44, top: 70, width: 720, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>«МЭРИ СЕЛЕСТ» · 1872</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.04, color: l.c, marginTop: i ? 2 : 24, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#ffd27a', whiteSpace: 'nowrap', ...STROKE(7)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
