// YouTube cover for «Перевал Дятлова», 1280×720: the approved background (view out through the slash, thumb-bg.png)
// with a big title on the dark right side. Two title variants to choose from.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});

export const Thumbnail: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const lines = variant === 'A' ? [{t: 'ЧТО ИХ', c: '#fff'}, {t: 'НАПУГАЛО?', c: '#ff2e2e'}] : [{t: 'РАЗРЕЗАЛИ', c: '#fff'}, {t: 'ИЗНУТРИ', c: '#ff2e2e'}];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile('dyatlov/thumb/thumb-bg.png')} style={{position: 'absolute', width: 1280 * 1.08, height: 720 * 1.08, left: -60, top: -20, objectFit: 'cover',
        filter: 'brightness(1.15) contrast(1.12) saturate(1.1)'}} />
      {/* darken the right side for the title */}
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 30%, rgba(5,7,12,0.55) 58%, rgba(5,7,12,0.85) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      <div style={{position: 'absolute', right: 44, top: 70, width: 700, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>ПЕРЕВАЛ ДЯТЛОВА · 1959</div>
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.t.length > 7 ? 92 : 112, lineHeight: 1.05, color: l.c, marginTop: i ? 4 : 30, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 40, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#ffd27a', ...STROKE(7)}}>9 ТУРИСТОВ · 1 НОЧЬ</div>
    </AbsoluteFill>
  );
};
