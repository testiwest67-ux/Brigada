// Lighting passes over the finished set: warm lamp, blue blackout, moonlight from the window, phone glow, vignette.
import React from 'react';
import {Rect} from './City';
import {mulberry32} from '../lib/anim';

type L = {lamp: number; dark: number; phone: number; phonePos: {x: number; y: number}; lampPos: {x: number; y: number}; win: Rect;
  rim?: {x: number; y: number}; candle?: number; candlePos?: {x: number; y: number}};

const BIG = {x: -300, y: -300, width: 2520, height: 1680};

export const Light: React.FC<L> = ({lamp, dark, phone, phonePos, lampPos, win, rim = {x: 900, y: 480}, candle = 0, candlePos = {x: 0, y: 0}}) => (
  <g style={{pointerEvents: 'none'}}>
    <defs>
      <radialGradient id="l-lamp" cx={lampPos.x} cy={lampPos.y + 120} r={900} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffcf8f" stopOpacity="0.3" />
        <stop offset="0.45" stopColor="#ffb86b" stopOpacity="0.1" />
        <stop offset="1" stopColor="#ffb86b" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="l-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff0c8" stopOpacity="0.13" /><stop offset="1" stopColor="#fff0c8" stopOpacity="0" />
      </linearGradient>
      <mask id="l-winmask">
        <rect {...BIG} fill="#fff" />
        <rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#5a5a5a" />
      </mask>
      <radialGradient id="l-moon" cx={win.x + win.w / 2} cy={win.y + win.h * 0.6} r={760} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#7f97e8" stopOpacity="0.55" /><stop offset="1" stopColor="#7f97e8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="l-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fb4ff" stopOpacity="0.5" /><stop offset="1" stopColor="#9fb4ff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="l-rim" cx={rim.x} cy={rim.y} r={520} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#6f86d8" stopOpacity="0.6" /><stop offset="1" stopColor="#6f86d8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="l-phone" cx={phonePos.x} cy={phonePos.y - 70} r={250} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#e4f2ff" stopOpacity="0.9" />
        <stop offset="0.4" stopColor="#a9d2ff" stopOpacity="0.38" />
        <stop offset="1" stopColor="#a9d2ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="l-candle" cx={candlePos.x} cy={candlePos.y} r={560} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffd08a" stopOpacity="0.95" />
        <stop offset="0.3" stopColor="#ffa858" stopOpacity="0.4" />
        <stop offset="1" stopColor="#ff9a4a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="l-vig" cx="960" cy="520" r="1150" gradientUnits="userSpaceOnUse">
        <stop offset="0.55" stopColor="#0c0a18" stopOpacity="0" /><stop offset="1" stopColor="#0c0a18" stopOpacity="0.55" />
      </radialGradient>
    </defs>
    <rect {...BIG} fill="url(#l-lamp)" style={{mixBlendMode: 'screen'}} opacity={lamp} />
    <path d={`M ${lampPos.x - 70} ${lampPos.y + 60} L ${lampPos.x + 70} ${lampPos.y + 60} L ${lampPos.x + 420} 800 L ${lampPos.x - 420} 800 Z`}
      fill="url(#l-cone)" style={{mixBlendMode: 'screen'}} opacity={lamp} />
    <rect {...BIG} fill="#4458a6" mask="url(#l-winmask)" style={{mixBlendMode: 'multiply'}} opacity={dark} />
    <rect {...BIG} fill="#0d1230" mask="url(#l-winmask)" opacity={dark * 0.16} />
    <path d={`M ${win.x} ${win.y + win.h} L ${win.x + win.w} ${win.y + win.h} L ${win.x + win.w + 260} 1080 L ${win.x + 120} 1080 Z`} fill="url(#l-beam)" style={{mixBlendMode: 'screen'}} opacity={dark * 0.32} />
    <rect {...BIG} fill="url(#l-rim)" style={{mixBlendMode: 'screen'}} opacity={dark * 0.3} />
    <rect {...BIG} fill="url(#l-moon)" style={{mixBlendMode: 'screen'}} opacity={dark * 0.45} />
    {candle > 0 && <rect {...BIG} fill="url(#l-candle)" style={{mixBlendMode: 'screen'}} opacity={candle} />}
    <rect {...BIG} fill="url(#l-phone)" style={{mixBlendMode: 'screen'}} opacity={phone} />
    <rect {...BIG} fill="url(#l-vig)" opacity={0.6 + dark * 0.4} />
  </g>
);

// dust floating in the lamp cone (and catching the phone light later)
export const Dust: React.FC<{t: number; lamp: number; phone: number; lampX: number}> = ({t, lamp, phone, lampX}) => {
  const motes = React.useMemo(() => {
    const r = mulberry32(23);
    return Array.from({length: 34}, () => ({x: r() * 760 - 380, y: 300 + r() * 420, s: 1.6 + r() * 2.4, p: r() * 9, v: 6 + r() * 10}));
  }, []);
  const o = Math.max(lamp, phone * 0.5);
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      {motes.map((m, i) => {
        const y = 300 + ((m.y - 300 - t * m.v) % 420 + 420) % 420;
        const spread = (y - 260) / 540;
        return <circle key={i} cx={lampX + m.x * spread + Math.sin(t * 0.7 + m.p) * 12} cy={y} r={m.s} fill="#fff4d6" opacity={0.35 + 0.3 * Math.sin(t * 1.9 + m.p)} />;
      })}
    </g>
  );
};
