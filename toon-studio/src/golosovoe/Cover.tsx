// Shorts / TikTok cover for «Голосовое в 3:33», 1080×1920: the corrupt double smiling in the dark,
// a lock-screen notification «Я · Голосовое · 0:07» at 3:33.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../horror/fx';
import {ensureFont, FONT} from '../horror/fonts';
import {BlanketInsert} from './Inserts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});
const line = (t: string, c: string, size: number, mt = 0): React.ReactNode => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: c, marginTop: mt, whiteSpace: 'nowrap', ...STROKE(size / 7)}}>{t}</div>
);

export const GolosovoeCover: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: 'translateY(170px)'}}>
        <BlanketInsert t={2} k={0.5} mode="creature" light={1} focus="smile" s={{uncanny: 0.9, blink: 1, smile: 1, mouth: 0}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.95) 0%, rgba(5,7,12,0.55) 22%, rgba(5,7,12,0) 34%, rgba(5,7,12,0) 64%, rgba(5,7,12,0.8) 78%, rgba(5,7,12,0.97) 100%)'}} />
      <Vignette />
      <Grain f={0} o={0.1} />
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
        {line('ГОЛОСОВОЕ В 3:33', '#bfe6ff', 70)}
        {line('ОТ САМОГО', '#fff', 128, 20)}
        {line('СЕБЯ', '#ff2e2e', 150)}
      </div>
      {/* lock-screen notification */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1540, height: 170, borderRadius: 38, background: 'rgba(235,238,245,0.93)',
        boxShadow: '0 0 60px rgba(120,170,255,0.45)', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 28}}>
        <div style={{width: 96, height: 96, borderRadius: 48, background: '#25a35a', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Я</div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#111'}}>Я</div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 38, color: '#444'}}>🎤 Голосовое · 0:07</div>
        </div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#d11'}}>3:33</div>
      </div>
      <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center'}}>{line('НЕ СЛУШАЙ ДО КОНЦА', '#ffd27a', 50)}</div>
    </AbsoluteFill>
  );
};
