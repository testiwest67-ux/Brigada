// YouTube cover for «Кольская сверхглубокая», 1280×720 (channel recipe: creepy concrete detail + name of the mystery).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});
type Line = {t: string; c: string; size: number};
const V: Record<'A' | 'B', {img: string; left: number; lines: Line[]; top: string; bottom: string}> = {
  A: {img: 'k0-03-cap', left: -60, top: 'КОЛЬСКАЯ СВЕРХГЛУБОКАЯ', lines: [{t: 'ОПУСТИЛИ МИКРОФОН', c: '#fff', size: 66}, {t: 'И УСЛЫШАЛИ', c: '#ff2e2e', size: 104}, {t: 'КРИКИ?', c: '#ff2e2e', size: 130}],
    bottom: '12 262 МЕТРА ВНИЗ'},
  B: {img: 'k0-04-cap-wide', left: -60, top: 'КОЛЬСКАЯ СВЕРХГЛУБОКАЯ', lines: [{t: 'ПОЧЕМУ ЕЁ', c: '#fff', size: 92}, {t: 'ЗАВАРИЛИ?', c: '#ff2e2e', size: 116}],
    bottom: 'САМАЯ ГЛУБОКАЯ ДЫРА В МИРЕ'},
};

export const KlThumb: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile(`kolskaya/bg/${v.img}.png`)} style={{position: 'absolute', width: 1280 * 1.06, height: 720 * 1.06, left: v.left, top: -20, objectFit: 'cover',
        filter: 'brightness(1.1) contrast(1.15) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 25%, rgba(5,7,12,0.55) 52%, rgba(5,7,12,0.9) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      <div style={{position: 'absolute', right: 44, top: 60, width: 900, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>{v.top}</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.04, color: l.c, marginTop: i ? 2 : 24, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#ffd27a', whiteSpace: 'nowrap', ...STROKE(7)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
