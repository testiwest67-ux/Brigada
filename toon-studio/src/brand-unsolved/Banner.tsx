// YouTube banner «Неразгаданное» (2560×1440), long-form mysteries channel. Built from the stills of our long videos:
// left «Перевал Дятлова» (tent), centre «Мэри Селест» (ghost ship in fog, behind the title), right «Маяк Фланнан» (lighthouse).
// Everything that must be read sits in the centre safe area 1546×423 (x 507..2053, y 508..931); desktop shows the
// full-width strip y 508..931, TV the whole image.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const SAFE = {x: 507, y: 508, w: 1546, h: 423};
const IW = 2304, IH = 1286; // 2752×1536 stills drawn at 0.837

const Panel: React.FC<{src: string; left: number; top: number; clip: [number, number]; fade: 'right' | 'left' | 'both'; o?: number; f?: string}> = ({src, left, top, clip, fade, o = 1, f}) => {
  // soft top edge so the picture never ends in a hard line on TV (whole 2560×1440 visible)
  const vmask = `linear-gradient(to bottom, transparent ${Math.max(0, top)}px, #000 ${Math.max(0, top) + 260}px)`;
  const [a, b] = clip;
  const mask = fade === 'right' ? 'linear-gradient(to right, #000 60%, transparent 100%)'
    : fade === 'left' ? 'linear-gradient(to left, #000 60%, transparent 100%)'
    : 'linear-gradient(to right, transparent 0%, #000 25%, #000 75%, transparent 100%)';
  return (
    <div style={{position: 'absolute', left: a, width: b - a, top: 0, height: 1440, overflow: 'hidden', WebkitMaskImage: mask, maskImage: mask, opacity: o}}>
      <div style={{position: 'absolute', inset: 0, WebkitMaskImage: vmask, maskImage: vmask}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: left - a, top, width: IW, height: IH, filter: f}} />
      </div>
    </div>
  );
};

export const Banner: React.FC<{guides?: boolean}> = ({guides = false}) => {
  ensureFont();
  const T: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, color: '#fff', textAlign: 'center', WebkitTextStroke: '10px #05070c', paintOrder: 'stroke fill'};
  return (
    <AbsoluteFill style={{background: '#06080d'}}>
      {/* centre: Mary Celeste in fog, dark, behind the title */}
      <Panel src="mary-celeste/bg/m0-11-fog.png" left={1280 - 0.42 * IW} top={760 - 0.5 * IH} clip={[640, 1920]} fade="both" o={0.95} f="brightness(0.9) contrast(1.1)" />
      {/* left: Dyatlov tent */}
      <Panel src="dyatlov/bg/d3-05-tent-evening.png" left={640 - 0.3 * IW} top={770 - 0.55 * IH} clip={[0, 1120]} fade="right" />
      {/* right: Flannan lighthouse, lamp inside the strip */}
      <Panel src="flannan/bg/f1-04-lighthouse-dusk.png" left={1960 - 0.31 * IW} top={600 - 0.2 * IH} clip={[1440, 2560]} fade="left" />
      {/* dark band behind the text + vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 34% 26% at 50% 50%, rgba(4,6,10,0.6) 0%, rgba(4,6,10,0.25) 60%, rgba(4,6,10,0) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.8) 100%)'}} />
      {/* text, all inside the safe area */}
      <div style={{position: 'absolute', left: SAFE.x, width: SAFE.w, top: SAFE.y, height: SAFE.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{...T, fontSize: 132, letterSpacing: 4, lineHeight: 1, textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.9)'}}>НЕРАЗГАДАННОЕ</div>
        <div style={{...T, fontSize: 46, fontWeight: 800, color: '#dfe6f2', WebkitTextStroke: '7px #05070c', marginTop: 22}}>Настоящие загадки, у которых до сих пор нет ответа</div>
        <div style={{...T, fontSize: 34, fontWeight: 800, color: '#ff4a3a', WebkitTextStroke: '6px #05070c', marginTop: 18, letterSpacing: 3}}>ПЕРЕВАЛ ДЯТЛОВА · МЭРИ СЕЛЕСТ · МАЯК ФЛАННАН</div>
      </div>
      {guides && (
        <svg width={2560} height={1440} style={{position: 'absolute', inset: 0}}>
          <rect x={0} y={508} width={2560} height={423} fill="none" stroke="#3cf" strokeWidth={4} strokeDasharray="20 12" />
          <rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} fill="none" stroke="#ff0" strokeWidth={5} strokeDasharray="20 12" />
          <text x={SAFE.x + 10} y={SAFE.y - 14} fontSize={30} fill="#ff0" fontFamily="sans-serif">телефон / все устройства 1546×423</text>
          <text x={10} y={500} fontSize={30} fill="#3cf" fontFamily="sans-serif">компьютер 2560×423</text>
        </svg>
      )}
    </AbsoluteFill>
  );
};
