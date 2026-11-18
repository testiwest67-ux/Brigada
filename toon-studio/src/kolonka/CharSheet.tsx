// «Ева, кто дома?» character sheets (no 3D, fast): Max (front, back, emotions, poses), the Tenant and the speaker «Ева».
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person, PERSON_REST, PersonState} from './People';
import {Eva} from './Eva';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const DARK = {bright: 0.75, warmRim: 0.05, coldRim: 0.9, cold: 0.5};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>;

export const MaxSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: PersonState = {...PERSON_REST, t};
  const heads: [PersonState, string][] = [
    [{...R, happy: 0.7}, 'спокоен'], [{...R, happy: 1, mouth: 0.3, blink: 0.6}, 'смеётся'], [{...R, lookX: -0.7, fear: 0.3}, 'насторожился'],
    [{...R, fear: 0.9, mouth: 0.5}, 'страх'], [{...R, blink: 0, mouth: 0.1}, 'спит'], [{...R, fear: 1, mouth: 0.9, tremble: 5}, 'ужас'],
  ];
  const xs = [120, 350, 580, 810, 1040, 1270, 1500, 1730];
  const poses: [PersonState, string, 'front' | 'back'][] = [
    [{...R, happy: 0.5}, 'спереди', 'front'], [R, 'со спины', 'back'], [{...R, phone: 1, lookY: 0.6}, 'телефон', 'front'],
    [{...R, hands: 1, fear: 0.6, mouth: 0.4}, 'испуг', 'front'], [{...R, lookX: 0.8, turn: 0.5, fear: 0.4}, 'оглядывается', 'front'],
    [{...R, wave: 1, mouth: 0.3}, 'говорит', 'front'], [{...R, sit: 1, fear: 0.5, hands: 0.8}, 'сидит', 'front'], [{...R, shh: 1, fear: 0.6}, 'тише', 'front'],
  ];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Костя, 20 — лист персонажа (живёт один; футболка, треники, носки)" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {heads.map(([st], i) => <g key={i} transform={`translate(${200 + i * 305} ${100 + 1560 * 0.45}) scale(0.45)`}><Person s={st} light={LIT} id={`h${i}`} crop={-950} /></g>)}
        </g>
        {heads.map(([, l], i) => <Label key={l} x={200 + i * 305} y={466} t={l} />)}
        {poses.map(([st, l, v], i) => (
          <g key={i}>
            <g transform={`translate(${xs[i]} 1010) scale(0.27)`}><Person s={st} light={LIT} id={`p${i}`} view={v} /></g>
            <Label x={xs[i]} y={1060} t={l} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const TenantSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: PersonState = {...PERSON_REST, t, uncanny: 0.85, blink: 1};
  const T = {variant: 'tenant' as const, outfit: 'pajama' as const};
  return (
    <AbsoluteFill style={{background: '#2f333d'}}>
      <svg width={1920} height={1080}>
        <Title t="«Он» — существо (жил здесь до Кости) и колонка «Диана»" />
        {/* tenant heads */}
        <clipPath id="ttop"><rect x={0} y={80} width={1300} height={360} /></clipPath>
        <g clipPath="url(#ttop)">
          {([[{...R}, 'смотрит'], [{...R, smile: 1, mouth: 0.9}, 'пасть'], [{...R, smile: 0.7, shh: 1}, '«тсс»'], [{...R, smile: 1, claw: 1}, 'руки-когти']] as [PersonState, string][]).map(([st], i) => (
            <g key={i} transform={`translate(${190 + i * 300} ${100 + 1560 * 0.45}) scale(0.45)`}><Person s={st} light={DARK} id={`t${i}`} crop={-900} {...T} /></g>
          ))}
        </g>
        {['смотрит', 'пасть', '«тсс»', 'руки-когти'].map((l, i) => <Label key={l} x={190 + i * 300} y={476} t={l} />)}
        {/* full body: front, back, next to Max for height */}
        <g transform="translate(160 1010) scale(0.27)"><Person s={{...R, smile: 0.6}} light={DARK} id="tf" {...T} /></g>
        <g transform="translate(400 1010) scale(0.27)"><Person s={R} light={DARK} id="tb" view="back" {...T} /></g>
        <g transform="translate(640 1010) scale(0.27)"><Person s={{...R, smile: 1, claw: 1}} light={DARK} id="th" {...T} /></g>
        <g transform="translate(900 1010) scale(0.27)"><Person s={{...PERSON_REST, t, fear: 0.6}} light={LIT} id="mx" /></g>
        <g transform="translate(1120 1010) scale(0.27 0.293)"><Person s={{...R, smile: 0.4}} light={DARK} id="tt" {...T} /></g>
        {[[160, 'спереди'], [400, 'со спины'], [640, '«сейчас схватит»'], [1010, 'Костя и существо (рост)']].map(([x, l]) => <Label key={l as string} x={x as number} y={1060} t={l as string} />)}
        {/* the speaker */}
        <rect x={1340} y={110} width={540} height={900} rx={24} fill="#1d2027" />
        {([[1480, 520, 1, 0, 'говорит'], [1740, 520, 1, 1, 'красный миг'], [1480, 900, 0.15, 0, 'выключена'], [1740, 900, 1, 0, 'светится без розетки']] as [number, number, number, number, string][]).map(([x, y, ring, red, l], i) => (
          <g key={i}>
            <g transform={`translate(${x} ${y}) scale(1.05)`}><Eva ring={ring} red={red} talk={i === 0 ? 1 : 0} t={t} id={`eva${i}`} /></g>
            <Label x={x} y={y + 60} t={l} />
          </g>
        ))}
        <path d="M 1840 890 C 1870 880 1880 840 1862 820" stroke="#0c0d10" strokeWidth={10} fill="none" /><rect x={1846} y={796} width={30} height={26} rx={4} fill="#0c0d10" />
      </svg>
    </AbsoluteFill>
  );
};
