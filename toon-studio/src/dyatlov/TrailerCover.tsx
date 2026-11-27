// Вертикальная обложка трейлера «Перевал Дятлова», 1080×1920 (Shorts / TikTok / Reels).
// Текст — в верхней половине: низ и правый край в Shorts закрывают кнопки и подпись.
// A — вид наружу через разрез (одобренный фон обложки длинного ролика), вопрос из начала трейлера.
// B — разрезанная стенка палатки (первый кадр трейлера), факт «ушли в мороз раздетыми».
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const W = 1080, H = 1920;
const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 10px 0 #05070c, 0 0 50px rgba(0,0,0,0.9)'});
type Line = {t: string; c: string; size: number};
const RED = '#ff2e2e', WHITE = '#fff';
const V: Record<'A' | 'B', {bg: string; bw: number; bh: number; cx: number; lines: Line[]; bottom: string}> = {
  A: {bg: 'dyatlov/thumb/thumb-bg.png', bw: 1376, bh: 768, cx: 0.4,
    lines: [{t: 'ПОЧЕМУ ОНИ', c: WHITE, size: 112}, {t: 'РАЗРЕЗАЛИ', c: RED, size: 140}, {t: 'ПАЛАТКУ', c: WHITE, size: 132}, {t: 'ИЗНУТРИ?', c: RED, size: 150}],
    bottom: '9 ТУРИСТОВ · 1 НОЧЬ'},
  B: {bg: 'dyatlov/bg/d0-02-cut.png', bw: 2752, bh: 1536, cx: 0.5,
    lines: [{t: '9 ЧЕЛОВЕК', c: WHITE, size: 140}, {t: 'УШЛИ', c: RED, size: 170}, {t: 'В МОРОЗ', c: WHITE, size: 130}, {t: 'РАЗДЕТЫМИ', c: RED, size: 124}],
    bottom: 'ДО СИХ ПОР БЕЗ ОТВЕТА'},
};

export const TrailerCover: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  ensureFont();
  const v = V[variant];
  const ih = H, iw = v.bw * H / v.bh;
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <Img src={staticFile(v.bg)} style={{position: 'absolute', width: iw, height: ih, left: W / 2 - v.cx * iw, top: 0,
        filter: 'brightness(1.12) contrast(1.12) saturate(1.1)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.88) 0%, rgba(5,7,12,0.55) 34%, rgba(5,7,12,0) 52%, rgba(5,7,12,0) 70%, rgba(5,7,12,0.85) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,0.8)'}} />
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 50, color: '#cfd8ea', letterSpacing: 3, ...STROKE(7)}}>ПЕРЕВАЛ ДЯТЛОВА · 1959</div>
        {v.lines.map((l, i) => (
          <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: l.size, lineHeight: 1.02, color: l.c, marginTop: i ? 0 : 30, whiteSpace: 'nowrap', ...STROKE(16)}}>{l.t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#ffd27a', ...STROKE(9)}}>{v.bottom}</div>
    </AbsoluteFill>
  );
};
