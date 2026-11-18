// YouTube cover for «Эльдорадо», 1280×720 (series recipe: curiosity question + one strong number).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});
type Line = {t: string; c: string; size: number};
const V: Record<'A' | 'B', {img: string; left: number; lines: Line[]; top: string; bottom: string}> = {
  A: {img: 'e1-05-gold-dust', left: -260, top: 'ЗАГАДКА ЭЛЬДОРАДО', lines: [{t: 'ЭЛЬДОРАДО НАШЛИ', c: '#fff', size: 68}, {t: 'НО НЕ ТАМ', c: '#ff2e2e', size: 128}],
    bottom: 'ИСКАЛИ 500 ЛЕТ'},
  B: {img: 'e9-02-map', left: -260, top: 'ЗАГАДКА ЭЛЬДОРАДО', lines: [{t: 'ЛАЗЕР НАШЁЛ', c: '#fff', size: 84}, {t: 'ГОРОДА', c: '#ff2e2e', size: 150}],
    bottom: 'ПОД ДЖУНГЛЯМИ АМАЗОНИИ'},
};

export const ElThumb: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile(`eldorado/bg/${v.img}.png`)} style={{position: 'absolute', width: 1280 * 1.06, height: 720 * 1.06, left: v.left, top: -20, objectFit: 'cover',
        filter: 'brightness(1.1) contrast(1.15) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 30%, rgba(5,7,12,0.55) 58%, rgba(5,7,12,0.9) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      <div style={{position: 'absolute', right: 44, top: 70, width: 760, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>{v.top}</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.04, color: l.c, marginTop: i ? 2 : 24, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#ffd27a', whiteSpace: 'nowrap', ...STROKE(7)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
