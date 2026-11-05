// TikTok / Shorts cover for «Последняя электричка», 1080×1920: the ticket on the pillow, no subtitles.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../horror/fx';
import {ensureFont, FONT} from '../horror/fonts';
import {TicketInsert} from './Inserts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});
const line = (t: string, c: string, size: number, mt = 0): React.ReactNode => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: c, marginTop: mt, whiteSpace: 'nowrap', ...STROKE(size / 7)}}>{t}</div>
);

export const TrainCover: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <TicketInsert k={0.55} reveal={1} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.92) 0%, rgba(5,7,12,0.35) 30%, rgba(5,7,12,0) 42%, rgba(5,7,12,0) 62%, rgba(5,7,12,0.85) 80%, rgba(5,7,12,0.95) 100%)'}} />
      <Vignette />
      <Grain f={0} o={0.1} />
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center'}}>
        {line('ПОСЛЕДНЯЯ ЭЛЕКТРИЧКА · 00:47', '#cfd8ea', 46)}
        {line('НЕ ВЫХОДИ', '#fff', 150, 30)}
        {line('НА СВОЕЙ', '#ff2e2e', 150)}
      </div>
      <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center'}}>
        {line('СТАНЦИИ «ТИХАЯ»', '#ffd27a', 72)}
        {line('НЕТ НА СХЕМЕ', '#ffd27a', 72)}
      </div>
    </AbsoluteFill>
  );
};
