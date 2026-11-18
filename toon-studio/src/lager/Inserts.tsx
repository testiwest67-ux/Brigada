// «Кто лишний?»: full-frame 2D inserts — the roll-call list on the clipboard, the final choice card.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill'});

// the clipboard with the squad list: «1 отряд — 12 человек», twelve handwritten lines (unreadable on purpose), a pencil
export const ListInsert: React.FC<{k: number; t: number}> = ({k, t}) => {
  const z = lerp(1.0, 1.12, k);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #6a4a3a 0%, #2a1a14 75%)'}}>
      <svg width={1080} height={1920} style={{transform: `scale(${z}) rotate(${lerp(-3, -1, k)}deg)`, transformOrigin: '50% 45%'}}>
        <rect x={150} y={260} width={780} height={1240} rx={26} fill="#8a6a46" stroke="#14121c" strokeWidth={8} />
        <rect x={200} y={330} width={680} height={1120} fill="#f3eee0" stroke="#14121c" strokeWidth={5} />
        <rect x={420} y={220} width={240} height={110} rx={18} fill="#b8bcc4" stroke="#14121c" strokeWidth={7} />
        <text x={540} y={430} textAnchor="middle" fontFamily="'Comic Sans MS', 'Marker Felt', cursive" fontSize={58} fill="#23305a">1 отряд — 12 чел.</text>
        <path d="M 250 465 L 830 465" stroke="#23305a" strokeWidth={4} />
        {Array.from({length: 12}, (_, i) => {
          const y = 530 + i * 72;
          const r = (n: number) => Math.sin(i * 12.9 + n * 7.1) * 0.5 + 0.5;
          const w = 260 + r(1) * 200;
          // a scribbled «name»: a wavy handwritten line, unreadable
          const d = Array.from({length: 18}, (__, j) => `${j ? 'L' : 'M'} ${330 + (j / 17) * w} ${y - 14 + Math.sin(j * 1.9 + i) * 12 + (j % 3 === 0 ? -10 : 0)}`).join(' ');
          return (
            <g key={i}>
              <text x={250} y={y} fontFamily="'Comic Sans MS', cursive" fontSize={40} fill="#23305a">{i + 1}.</text>
              <path d={d} stroke="#23305a" strokeWidth={5} fill="none" strokeLinejoin="round" />
              {/* a tick next to each name */}
              <path d={`M 770 ${y - 20} l 14 18 l 26 -36`} stroke="#b03028" strokeWidth={6} fill="none" opacity={clamp((t - 0.25 - i * 0.12) * 4)} />
            </g>
          );
        })}
        <g transform="translate(690 1380) rotate(-35)">
          <rect x={0} y={-14} width={300} height={28} fill="#e2b93a" stroke="#14121c" strokeWidth={5} />
          <path d="M 0 -14 L -40 0 L 0 14 Z" fill="#e8c9a0" stroke="#14121c" strokeWidth={5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// the final card: «1 · 2 · 3 · 4», «пиши номер в комментариях»
export const ChoiceCard: React.FC<{k: number; t: number}> = ({k, t}) => {
  const pop = (i: number) => clamp((t - 0.2 - i * 0.25) * 4);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: '#ffd27a', letterSpacing: 4, ...STROKE(10), opacity: clamp(t * 3)}}>КТО ЛИШНИЙ?</div>
      <div style={{position: 'absolute', top: 600, width: '100%', display: 'flex', justifyContent: 'center', gap: 34}}>
        {[1, 2, 3, 4].map((n, i) => (
          <div key={n} style={{width: 190, height: 190, borderRadius: 95, border: '8px solid #f2f0ea', background: 'rgba(10,12,20,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 900, fontSize: 130, color: '#f2f0ea', transform: `scale(${lerp(0.4, 1, pop(i))})`, opacity: pop(i), ...STROKE(8)}}>{n}</div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 860, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: '#f2f0ea', ...STROKE(8), opacity: clamp((t - 1.3) * 3) * lerp(0.6, 1, k)}}>ПИШИ НОМЕР В КОММЕНТАРИЯХ</div>
    </AbsoluteFill>
  );
};
