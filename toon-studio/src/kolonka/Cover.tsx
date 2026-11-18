// Shorts / TikTok cover for «Диана, кто дома?», 1080×1920: the creature under the blanket, finger to its lips,
// the speaker with a red ring and «ЖИЛЬЦОВ: 2».
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain, Vignette} from '../horror/fx';
import {ensureFont, FONT} from '../horror/fonts';
import {BlanketInsert} from './Inserts';
import {Eva} from './Eva';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});
const line = (t: string, c: string, size: number, mt = 0): React.ReactNode => (
  <div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, color: c, marginTop: mt, whiteSpace: 'nowrap', ...STROKE(size / 7)}}>{t}</div>
);

export const KolonkaCover: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: 'translateY(190px)'}}><BlanketInsert t={2} k={0.4} mode="creature" light={1} focus="shh" s={{uncanny: 0.9, blink: 1, smile: 0.6, shh: 1, mouth: 0}} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.95) 0%, rgba(5,7,12,0.55) 22%, rgba(5,7,12,0) 34%, rgba(5,7,12,0) 66%, rgba(5,7,12,0.8) 80%, rgba(5,7,12,0.97) 100%)'}} />
      <Vignette />
      <Grain f={0} o={0.1} />
      <div style={{position: 'absolute', top: 110, width: '100%', textAlign: 'center'}}>
        {line('«ДИАНА, КТО ДОМА?»', '#bfe6ff', 62)}
        {line('ОН ПРОСИТ', '#fff', 122, 20)}
        {line('НЕ ГОВОРИТЬ', '#ff2e2e', 122)}
      </div>
      {/* the speaker with a red ring + status */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id="cvGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ff2e2e" stopOpacity={0.45} /><stop offset="1" stopColor="#ff2e2e" stopOpacity={0} /></radialGradient>
        </defs>
        <ellipse cx={250} cy={1630} rx={260} ry={200} fill="url(#cvGlow)" />
        <g transform="translate(250 1700) scale(1.25)"><Eva ring={1} red={1} t={2} id="cvEva" /></g>
      </svg>
      <div style={{position: 'absolute', left: 450, top: 1580}}>
        {line('ЖИЛЬЦОВ: 2', '#ff3a3a', 76)}
        {line('А ТЫ ЖИВЁШЬ ОДИН', '#ffd27a', 46, 14)}
      </div>
    </AbsoluteFill>
  );
};
