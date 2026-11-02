// «Ночная смена» character sheets (no 3D, fast): one for Dima (front, back, emotions, poses, his shadow),
// one for the others (Petrovich, the babushka, Stas in the coat).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Dima, DIMA_REST, DimaState} from './Dima';
import {Babka, BABKA_REST, Petrovich, PETROVICH_REST, Stas, STAS_REST} from './People';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const SHD = {bright: 1, warmRim: 0, coldRim: 0.35, cold: 0.3};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => (
  <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>
);

export const DimaSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: DimaState = {...DIMA_REST, t};
  const calm = {...R, mouth: 0.1, lookX: 0.15};
  const yawn = {...R, mouth: 1, blink: 0.25};
  const scared = {...R, fear: 0.9, mouth: 0.55, hands: 1, lookY: -0.2};
  const note = {...R, note: 1, lookY: 0.7, fear: 0.2};
  const phone = {...R, phone: 1, fear: 0.6, lookX: -0.4};
  const cover = {...R, cover: 1, fear: 0.8, tears: 1, lookY: 0.2};
  const happy = {...R, smile: 1, tears: 0.8, mouth: 0.3};
  const down = {...R, lookY: 1, blink: 0.55, fear: 0.5};
  const shadow = {...R, shade: 1, smile: 1, tilt: 8};
  const xs = [130, 370, 610, 850, 1090, 1330, 1570, 1800];
  const S = 0.27;
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Дима — лист персонажа" />
        {/* close-ups */}
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {[calm, scared, cover, happy, down, shadow].map((st, i) => (
            <g key={i} transform={`translate(${200 + i * 305} ${100 + 1770 * 0.45}) scale(0.45)`}>
              <Dima s={{...st, hands: 0, note: 0, phone: 0, cover: 0}} light={st.shade ? SHD : LIT} id={`c${i}`} crop={-1140} />
            </g>
          ))}
        </g>
        {['спокоен', 'страх', 'плачет', 'радость', 'смотрит в пол', 'тень'].map((l, i) => <Label key={l} x={200 + i * 305} y={466} t={l} />)}
        {/* full figures */}
        {[calm, null, yawn, scared, note, phone, cover, shadow].map((st, i) => (
          <g key={i} transform={`translate(${xs[i]} 1010) scale(${S})`}>
            {st ? <Dima s={st} light={st.shade ? SHD : LIT} id={`f${i}`} /> : <Dima s={calm} light={LIT} id="fb" view="back" />}
          </g>
        ))}
        {['спереди', 'со спины', 'зевает', 'испуг', 'читает записку', 'телефон', 'молчит', 'тень Димы'].map((l, i) => <Label key={l} x={xs[i]} y={1060} t={l} />)}
      </svg>
    </AbsoluteFill>
  );
};

export const PeopleSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const p = {...PETROVICH_REST, t, mouth: 0.2};
  const pSad = {...PETROVICH_REST, t, sad: 1, glasses: 1, lookY: 0.6, mouth: 0.25};
  const pWave = {...PETROVICH_REST, t: 0.2, wave: 1, mouth: 0.5};
  const b = {...BABKA_REST, t};
  const st = {...STAS_REST, t};
  const stEvil = {...STAS_REST, t, smile: 1, coatOpen: 1, reach: 0, tilt: -8, blink: 1};
  const S = 0.3;
  const items: [number, React.ReactNode, string][] = [
    [130, <Petrovich s={p} light={LIT} id="p1" />, 'Петрович'],
    [345, <Petrovich s={pSad} light={LIT} id="p2" />, 'грустит, снял очки'],
    [560, <Petrovich s={pWave} light={LIT} id="p3" />, 'машет'],
    [770, <Petrovich s={p} light={LIT} id="p4" view="back" />, 'со спины'],
    [970, <Babka s={b} light={LIT} id="b1" />, 'бабушка'],
    [1160, <Babka s={b} light={LIT} id="b2" view="back" />, 'со спины'],
    [1380, <Stas s={st} light={LIT} id="s1" />, 'в плаще'],
    [1600, <Stas s={stEvil} light={LIT} id="s2" />, 'улыбается'],
    [1810, <Stas s={st} light={LIT} id="s3" view="back" />, 'со спины'],
  ];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Ночная смена — остальные персонажи" />
        {items.map(([x, node, l], i) => (
          <g key={i}>
            <g transform={`translate(${x} 1000) scale(${S})`}>{node}</g>
            <Label x={x} y={1050} t={l} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
