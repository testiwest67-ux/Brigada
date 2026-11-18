// Shorts / TikTok cover for «Отражение опаздывает» (1080×1920): the reflection grinning wider than Anya (shot 25 at its
// widest smile), no subtitles; big title on top, the delay tag, a hook line at the bottom.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../horror/fx';
import {ensureFont, FONT} from '../horror/fonts';
import {Ctx, SHOTS} from './shots';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});
const line = (t: string, c: string, size: number, mt = 0) => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.04, color: c, marginTop: mt, whiteSpace: 'nowrap', ...STROKE(size / 7)}}>{t}</div>
);

export const MirrorCover: React.FC = () => {
  ensureFont();
  const s = SHOTS[24];
  const fps = 30, a = Math.round(s.from * fps), g = Math.round((s.from + (s.to - s.from) * 0.95) * fps);
  const c: Ctx = {f: g - a, t: (g - a) / fps, d: s.to - s.from, fps, g};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <s.C c={c} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.9) 0%, rgba(5,7,12,0.2) 26%, rgba(5,7,12,0) 40%, rgba(5,7,12,0) 66%, rgba(5,7,12,0.85) 84%, rgba(5,7,12,0.95) 100%)'}} />
      <Vignette />
      <Grain f={3} o={0.08} />
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
        {line('ТВОЁ ОТРАЖЕНИЕ', '#fff', 84)}
        {line('ОПАЗДЫВАЕТ', '#ff2e2e', 116, 6)}
      </div>
      <div style={{position: 'absolute', top: 1180, left: 70}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#ff2e2e', background: 'rgba(11,13,18,0.85)', border: '6px solid #ff2e2e', borderRadius: 60, padding: '10px 40px', transform: 'rotate(-6deg)'}}>+3 СЕК</div>
      </div>
      <div style={{position: 'absolute', top: 1380, width: '100%', textAlign: 'center'}}>
        {line('НЕ ОТХОДИ', '#ffd27a', 86)}
        {line('ОТ ЗЕРКАЛА', '#ffd27a', 86)}
      </div>
    </AbsoluteFill>
  );
};
