// «Отражение опаздывает» character sheets (no 3D, fast): Anya (front, back, emotions, poses),
// the reflection (same doll, mirrored, `uncanny`) and her friend Liza.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Anya, ANYA_REST, AnyaState} from './Anya';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => (
  <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>
);
// a mirror: the reflection inside, mirrored, behind cold glass
const Mirror: React.FC<{x: number; y: number; w: number; h: number; id: string; children: React.ReactNode}> = ({x, y, w, h, id, children}) => (
  <g>
    <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={10} /></clipPath>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#5a6878" />
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#9fc0d8" opacity={0.18} />
    <path d={`M ${x + w * 0.15} ${y + 20} L ${x + w * 0.05} ${y + 120}`} stroke="#fff" strokeWidth={10} opacity={0.35} />
    <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke="#c9b48a" strokeWidth={14} />
  </g>
);

export const AnyaSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: AnyaState = {...ANYA_REST, t};
  const calm = {...R, happy: 0.6, lookX: 0.15};
  const sleepy = {...R, blink: 0.35, mouth: 0.2};
  const doubt = {...R, lookX: -0.6, fear: 0.3};
  const scared = {...R, fear: 0.9, mouth: 0.55, lookY: -0.2};
  const relief = {...R, happy: 1, blink: 0.6};
  const panic = {...R, fear: 1, mouth: 0.9, tremble: 6};
  const xs = [120, 350, 580, 810, 1040, 1270, 1500, 1730];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Аня, 21 — лист персонажа (родинка слева, пижама / куртка и жёлтый шарф)" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {[calm, sleepy, doubt, scared, relief, panic].map((st, i) => (
            <g key={i} transform={`translate(${200 + i * 305} ${100 + 1560 * 0.45}) scale(0.45)`}>
              <Anya s={st} light={LIT} id={`c${i}`} crop={-950} />
            </g>
          ))}
        </g>
        {['спокойна', 'сонная', 'подозревает', 'страх', 'облегчение', 'ужас'].map((l, i) => <Label key={l} x={200 + i * 305} y={466} t={l} />)}
        {([
          [calm, 'спереди', {}],
          [calm, 'со спины', {view: 'back'}],
          [{...R, brush: 1, blink: 0.7}, 'чистит зубы', {}],
          [{...R, wave: 1, happy: 0.5}, 'машет', {}],
          [{...R, phone: 1, fear: 0.4}, 'телефон', {outfit: 'street'}],
          [{...R, lookX: 0.3}, 'на улице', {outfit: 'street'}],
          [{...R, hands: 1, fear: 0.8, mouth: 0.4}, 'у стекла', {}],
          [{...R, sit: 1, fear: 0.7, hands: 0.8}, 'сидит', {}],
        ] as [AnyaState, string, Record<string, string>][]).map(([st, l, o], i) => (
          <g key={i}>
            <g transform={`translate(${xs[i]} 1010) scale(0.27)`}><Anya s={st} light={LIT} id={`f${i}`} {...o} /></g>
            <Label x={xs[i]} y={1060} t={l} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const MirrorSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: AnyaState = {...ANYA_REST, t};
  // pairs: Anya in front of the mirror, the reflection inside (mirrored)
  const pairs: [AnyaState, AnyaState, string, string?][] = [
    [{...R, blink: 0}, {...R, blink: 1, uncanny: 0.15}, 'моргает позже'],
    [{...R, lookX: 0.9, turn: 0.6, fear: 0.4}, {...R, lookX: 0, uncanny: 0.35}, 'ещё смотрит'],
    [{...R, happy: 0.6}, {...R, smile: 1, uncanny: 0.8, blink: 1}, 'улыбается шире'],
    [{...R, fear: 0.9, hands: 1, mouth: 0.5}, {...R, wave: 1, smile: 0.8, uncanny: 1}, 'поменялись', 'swap'],
  ];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Отражение (та же кукла, зеркально; «учится быть тобой») и Лиза" />
        {pairs.map(([a, r, l, swap], i) => {
          const x0 = 40 + i * 370;
          return (
            <g key={i}>
              <Mirror x={x0} y={100} w={330} h={480} id={`mir${i}`}>
                <g transform={`translate(${x0 + 165} ${130 + 1560 * 0.42}) scale(-0.42 0.42)`}>
                  {/* swap: Anya is now inside the glass (mole on her own side), banging on it */}
                  <Anya s={swap ? a : r} light={LIT} id={`r${i}`} crop={-560} brushColor="#4a8ad8" />
                </g>
              </Mirror>
              <g transform={`translate(${x0 + 165} 1000) scale(0.24)`}>
                {/* in front: from behind for the first three, the stranger with the mole on the other side for the swap */}
                {swap ? <Anya s={r} light={LIT} id={`a${i}`} mole={1} /> : <Anya s={a} light={LIT} id={`a${i}`} view="back" />}
              </g>
              <Label x={x0 + 165} y={1050} t={l} />
            </g>
          );
        })}
        {/* Liza */}
        <g transform="translate(1680 610) scale(0.3)"><Anya s={{...R, happy: 0.5, lookX: -0.3}} light={LIT} id="lz1" variant="liza" crop={-950} /></g>
        <g transform="translate(1540 1000) scale(0.24)"><Anya s={{...R, mouth: 0.4, lookX: -0.4}} light={LIT} id="lz2" variant="liza" /></g>
        <g transform="translate(1790 1000) scale(0.24)"><Anya s={R} light={LIT} id="lz3" variant="liza" view="back" /></g>
        <Label x={1680} y={380} t="Лиза" />
        <Label x={1660} y={1050} t="Лиза: спереди / со спины" />
      </svg>
    </AbsoluteFill>
  );
};
