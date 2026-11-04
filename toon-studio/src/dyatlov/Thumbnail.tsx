// YouTube cover for «Перевал Дятлова», 1280×720: the approved background (view out through the slash, thumb-bg.png)
// with a big title on the dark right side. Variants: A — question, B — the scary fact, C — curiosity hook with a red ring
// on the footprints leading into the dark.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #05070c, 0 0 30px rgba(0,0,0,0.8)'});
type Line = {t: string; c: string; size: number};
const V: Record<'A' | 'B' | 'C', {lines: Line[]; bottom: string; ring?: boolean}> = {
  A: {lines: [{t: 'ЧТО ИХ', c: '#fff', size: 112}, {t: 'НАПУГАЛО?', c: '#ff2e2e', size: 92}], bottom: '9 ТУРИСТОВ · 1 НОЧЬ'},
  B: {lines: [{t: 'РАЗРЕЗАЛИ', c: '#fff', size: 92}, {t: 'ИЗНУТРИ', c: '#ff2e2e', size: 112}], bottom: '9 ТУРИСТОВ · 1 НОЧЬ'},
  C: {lines: [{t: 'ПОЧЕМУ ОНИ', c: '#fff', size: 78}, {t: 'УШЛИ', c: '#ff2e2e', size: 128}, {t: 'БОСИКОМ?', c: '#ff2e2e', size: 100}],
    bottom: 'ДО СИХ ПОР БЕЗ ОТВЕТА', ring: true},
};

export const Thumbnail: React.FC<{variant: 'A' | 'B' | 'C'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile('dyatlov/thumb/thumb-bg.png')} style={{position: 'absolute', width: 1280 * 1.08, height: 720 * 1.08, left: -60, top: -20, objectFit: 'cover',
        filter: 'brightness(1.15) contrast(1.12) saturate(1.1)'}} />
      {/* darken the right side for the title */}
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(5,7,12,0) 30%, rgba(5,7,12,0.55) 58%, rgba(5,7,12,0.85) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 160px rgba(0,0,0,0.75)'}} />
      {v.ring && (
        <svg width={1280} height={720} style={{position: 'absolute', inset: 0}}>
          {/* ring around the footprints leading out of the tent into the dark */}
          <ellipse cx={360} cy={455} rx={175} ry={62} fill="none" stroke="#ff2e2e" strokeWidth={9} transform="rotate(-14 360 455)"
            style={{filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.9))'}} />
          <path d="M 640 330 C 590 360 560 390 545 425" fill="none" stroke="#ff2e2e" strokeWidth={10} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.9))'}} />
          <path d="M 520 405 L 543 438 L 570 410" fill="none" stroke="#ff2e2e" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <div style={{position: 'absolute', right: 44, top: 60, width: 700, textAlign: 'right', whiteSpace: 'nowrap'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#cfd8ea', letterSpacing: 2, ...STROKE(6)}}>ПЕРЕВАЛ ДЯТЛОВА · 1959</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.02, color: l.c, marginTop: i ? 2 : 24, ...STROKE(12)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#ffd27a', whiteSpace: 'nowrap', ...STROKE(7)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
