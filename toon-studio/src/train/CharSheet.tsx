// «Последняя электричка» character sheets (no 3D, fast): Kostya (front, back, emotions, poses),
// the three doubles, and mom / the fake mom from the platform.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Kostya, KOSTYA_REST, KostyaState} from './Kostya';
import {Mom, MOM_REST} from './Mom';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
// a train bench behind a seated figure (puppet units, origin between the feet)
const Bench: React.FC = () => (
  <g>
    <rect x={-330} y={-1150} width={660} height={700} rx={40} fill="#6e4a3a" stroke="#14121c" strokeWidth={7} />
    <rect x={-360} y={-500} width={720} height={90} rx={20} fill="#875a46" stroke="#14121c" strokeWidth={7} />
    <rect x={-300} y={-410} width={600} height={410} fill="#2c2a30" stroke="#14121c" strokeWidth={7} />
  </g>
);
const Title: React.FC<{t: string}> = ({t}) => (
  <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>
);

export const KostyaSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: KostyaState = {...KOSTYA_REST, t};
  const calm = {...R, mouth: 0.1, lookX: 0.15};
  const sleepy = {...R, blink: 0.3, mouth: 0.15, tilt: 6};
  const asleep = {...R, blink: 0, mouth: 0.2, tilt: 14, phonesOn: 1};
  const scared = {...R, fear: 0.9, mouth: 0.55, hands: 1, lookY: -0.2};
  const phone = {...R, phone: 1, fear: 0.5, lookY: 0.75, lookX: 0.2};
  const relief = {...R, smile: 1, tears: 0.8, mouth: 0.3};
  const sit = {...R, sit: 1, fear: 0.6, lookX: -0.5};
  const xs = [130, 370, 610, 850, 1090, 1330, 1570, 1800];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Костя — лист персонажа" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {[calm, sleepy, asleep, scared, phone, relief].map((st, i) => (
            <g key={i} transform={`translate(${200 + i * 305} ${100 + 1770 * 0.45}) scale(0.45)`}>
              <Kostya s={{...st, hands: 0, phone: 0}} light={LIT} id={`c${i}`} crop={-1140} />
            </g>
          ))}
        </g>
        {['спокоен', 'засыпает', 'спит', 'страх', 'смотрит в телефон', 'облегчение'].map((l, i) => <Label key={l} x={200 + i * 305} y={466} t={l} />)}
        {[calm, null, asleep, scared, phone, sit, relief].map((st, i) => (
          <g key={i} transform={`translate(${xs[i]} 1010) scale(0.27)`}>
            {st?.sit ? <Bench /> : null}{st ? <Kostya s={st} light={LIT} id={`f${i}`} /> : <Kostya s={calm} light={LIT} id="fb" view="back" />}
          </g>
        ))}
        {['спереди', 'со спины', 'спит в наушниках', 'испуг', 'телефон', 'сидит', 'радость'].map((l, i) => <Label key={l} x={xs[i]} y={1060} t={l} />)}
      </svg>
    </AbsoluteFill>
  );
};

export const DoublesSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: KostyaState = {...KOSTYA_REST, t};
  const k = {...R, mouth: 0.1};
  const wet = {...R, wet: 1, blink: 0.85, lookY: 0.3};
  const wetUp = {...R, wet: 1, blink: 1, lookX: -0.3};
  const mid = {...R, age: 0.5, blink: 0.8, lookY: 0.4};
  const old = {...R, age: 1, blink: 0.75, lookY: 0.5};
  const oldWhisper = {...R, age: 1, mouth: 0.35, lookX: -0.5, reach: 1, fear: 0.3};
  const heads = [k, wetUp, mid, old];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Двойники Кости (та же кукла: «мокрый» и «возраст»)" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {heads.map((st, i) => (
            <g key={i} transform={`translate(${260 + i * 460} ${100 + 1770 * 0.45}) scale(0.45)`}>
              <Kostya s={st} light={LIT} id={`h${i}`} crop={-1140} />
            </g>
          ))}
        </g>
        {['Костя, 19', 'мокрый двойник', 'Костя, ~35', 'старик'].map((l, i) => <Label key={l} x={260 + i * 460} y={466} t={l} />)}
        {([[150, k, 'Костя'], [380, wet, 'мокрый'], [600, {...wet, sit: 1}, 'мокрый сидит'], [830, mid, '~35 лет'], [1050, {...mid, sit: 1}, '~35 сидит'],
          [1290, old, 'старик'], [1530, oldWhisper, 'шепчет'], [1780, {...old, sit: 1}, 'старик сидит']] as [number, KostyaState, string][]).map(([x, st, l], i) => (
          <g key={i}>
            <g transform={`translate(${x} 1010) scale(0.27)`}>{st.sit ? <Bench /> : null}<Kostya s={st} light={LIT} id={`d${i}`} /></g>
            <Label x={x} y={1060} t={l} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const MomSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R = {...MOM_REST, t};
  const items: [number, React.ReactNode, string][] = [
    [140, <Mom s={{...R, smile: 0.6}} light={LIT} id="m1" />, 'мама'],
    [400, <Mom s={{...R, worry: 1, mouth: 0.4, lookX: 0.3}} light={LIT} id="m2" />, 'волнуется'],
    [690, <Mom s={{...R, hug: 1, smile: 1, tears: 0.8}} light={LIT} id="m3" />, 'обнимает'],
    [950, <Mom s={R} light={LIT} id="m4" view="back" />, 'со спины'],
    [1210, <Mom s={{...R, fake: 1, wave: 1}} light={LIT} id="m5" />, '«мама» машет'],
    [1480, <Mom s={{...R, fake: 1, palm: 1}} light={LIT} id="m6" />, 'ладонь на стекле'],
    [1760, <Mom s={{...R, fake: 1}} light={LIT} id="m7" />, 'не моргает'],
  ];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Мама и «мама» с платформы (летнее платье в ноябре)" />
        {items.map(([x, node, l], i) => (
          <g key={i}>
            <g transform={`translate(${x} 1000) scale(0.42)`}>{node}</g>
            <Label x={x} y={1050} t={l} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
