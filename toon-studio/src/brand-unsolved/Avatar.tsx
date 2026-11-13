// Channel avatar «Неразгаданное» (800×800, shown as a circle): a red question mark over the fogged ghost ship,
// readable at 48 px. Nothing important near the corners (YouTube crops a circle).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

export const Avatar: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#06080d', overflow: 'hidden'}}>
      <Img src={staticFile('mary-celeste/bg/m0-11-fog.png')} style={{position: 'absolute', height: 800, left: -560, top: 0, filter: 'brightness(0.55)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, rgba(5,7,12,0.2) 0%, rgba(5,7,12,0.55) 55%, rgba(5,7,12,0.95) 72%)'}} />
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 560, lineHeight: 1, color: '#ff3b2e', WebkitTextStroke: '22px #05070c', paintOrder: 'stroke fill',
          textShadow: '0 0 60px rgba(255,40,30,0.55), 0 14px 0 #05070c', marginTop: 20}}>?</div>
      </AbsoluteFill>
      <svg width={800} height={800} style={{position: 'absolute', inset: 0}}>
        <circle cx={400} cy={400} r={372} fill="none" stroke="#ff3b2e" strokeWidth={10} opacity={0.75} />
      </svg>
    </AbsoluteFill>
  );
};
