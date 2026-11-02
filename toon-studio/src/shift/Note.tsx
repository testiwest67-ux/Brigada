// Petrovich's note as a full-frame 2D insert (crisp handwriting): the camera pans/zooms to one block of it.
// focus: 0 the name, 1..3 the rules, 4 «Утром я тебя сменю», 5 the whole sheet. `strike` crosses out «Дима» (the finale).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {HAND} from './hand';

const INK = '#23307a', RED = '#b3202a';
type Ln = {t: string; y: number; c?: string; size?: number; block: number};
const LINES: Ln[] = [
  {t: 'Ночью работать можно.', y: 330, block: 0},
  {t: 'Только по правилам:', y: 410, block: 0},
  {t: '1. Покупателю без тени', y: 540, c: RED, block: 1},
  {t: 'ничего не продавай.', y: 615, c: RED, block: 1},
  {t: 'Говори: «Касса закрыта».', y: 690, c: RED, block: 1},
  {t: '2. В 3:33 не смотри', y: 820, block: 2},
  {t: 'в стёкла холодильников.', y: 895, block: 2},
  {t: '3. Зазвонит телефон', y: 1025, block: 3},
  {t: 'на стене — сними трубку', y: 1100, block: 3},
  {t: 'и молчи.', y: 1175, block: 3},
  {t: 'Утром я тебя сменю.', y: 1310, block: 4},
  {t: 'Продержись.', y: 1385, block: 4},
  {t: '— Петрович', y: 1470, block: 4, size: 60},
];
const CENTER = [230, 300, 610, 860, 1100, 1390, 900];

export const NoteInsert: React.FC<{focus: number; k: number; t: number; strike?: number; hand?: number; dim?: number; light?: number}> = ({focus, k, t, strike = 0, hand = 0, dim = 0.35, light = 1}) => {
  const cy = CENTER[Math.min(6, focus === 5 ? 6 : focus)];
  const zoom = focus === 5 ? lerp(0.95, 1.02, k) : lerp(1.15, 1.32, k);
  const shake = Math.sin(t * 3.1) * 4;
  const r = mulberry32(4);
  return (
    <AbsoluteFill style={{background: '#2a1c12', overflow: 'hidden'}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="wood" x1="0" x2="1" y1="0" y2="0.3">
            <stop offset="0" stopColor="#5a3e26" /><stop offset="0.5" stopColor="#6e4c2e" /><stop offset="1" stopColor="#4a321e" />
          </linearGradient>
          <radialGradient id="lampPool" cx="0.5" cy="0.45" r="0.7">
            <stop offset="0" stopColor="#fff3d8" stopOpacity={0.2 * light} /><stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
        </defs>
        <g transform={`translate(540 ${960 + shake}) scale(${zoom}) translate(-540 ${-cy})`}>
          <rect x={-600} y={-600} width={2300} height={3200} fill="url(#wood)" />
          {Array.from({length: 26}, (_, i) => <path key={i} d={`M -600 ${-560 + i * 120 + r() * 40} C 200 ${-540 + i * 120} 900 ${-580 + i * 120} 1700 ${-550 + i * 120 + r() * 40}`} stroke="#2e1e10" strokeWidth={2 + r() * 3} opacity={0.35} fill="none" />)}
          {/* the sheet */}
          <g transform="rotate(-3 540 800)">
            <rect x={110} y={120} width={860} height={1440} fill="#000" opacity={0.35} transform="translate(14 18)" />
            <path d="M 110 120 L 970 112 L 976 1556 L 116 1564 Z" fill="#f1ead8" />
            {Array.from({length: 18}, (_, i) => <path key={i} d={`M 116 ${210 + i * 76} L 972 ${206 + i * 76}`} stroke="#9ab6d6" strokeWidth={2} opacity={0.6} />)}
            <path d="M 200 112 L 200 1560" stroke="#d68a8a" strokeWidth={3} opacity={0.6} />
            {/* sticky tape */}
            <rect x={420} y={84} width={240} height={70} fill="#efe6c0" opacity={0.65} transform="rotate(2 540 120)" />
            {/* the name: «Стас» crossed out, «Дима» on top */}
            <g opacity={focus === 0 || focus === 5 ? 1 : 1 - dim}>
              <text x={240} y={235} fontFamily={HAND} fontWeight={700} fontSize={84} fill={INK}>Стас,</text>
              <path d="M 230 210 C 300 196 360 222 430 200 M 236 228 C 310 214 370 236 428 220" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
              <text x={450} y={185} fontFamily={HAND} fontWeight={700} fontSize={84} fill={INK} transform="rotate(-4 450 185)">Дима,</text>
              {strike > 0 && <path d={`M 440 160 L ${440 + 220 * clamp(strike)} ${150 - 6 * clamp(strike)} M 446 176 L ${446 + 214 * clamp((strike - 0.3) / 0.7)} ${170 - 4 * clamp(strike)}`} stroke="#0a0a0c" strokeWidth={12} strokeLinecap="round" />}
            </g>
            {LINES.map((l, i) => (
              <text key={i} x={240 + (l.block === 4 && l.size ? 260 : 0)} y={l.y} fontFamily={HAND} fontWeight={700} fontSize={l.size ?? 72} fill={l.c ?? INK}
                opacity={focus === 5 || l.block === focus || (focus === 0 && l.block === 0) ? 1 : 1 - dim}>{l.t}</text>
            ))}
            <path d="M 240 560 L 820 556" stroke={RED} strokeWidth={4} opacity={0.5} />
          </g>
          {/* the shadow's black hand with a pen (finale) */}
          {hand > 0 && (
            <g transform={`translate(${lerp(1300, 700, clamp(hand))} ${lerp(60, 200, clamp(hand))}) rotate(-30)`} opacity={clamp(hand * 2)}>
              <path d="M 0 0 C 80 -40 220 -20 320 60 L 900 420 L 820 560 L 220 220 C 120 200 20 120 0 0 Z" fill="#050508" />
              <rect x={-150} y={-12} width={190} height={24} rx={10} fill="#1a1a22" transform="rotate(10)" />
              <ellipse cx={130} cy={40} rx={22} ry={12} fill="#efeae0" opacity={0.0} />
            </g>
          )}
          <rect x={-600} y={-600} width={2300} height={3200} fill="url(#lampPool)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
