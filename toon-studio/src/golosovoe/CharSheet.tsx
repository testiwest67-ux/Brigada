// «Голосовое в 3:33» character sheets: Kostya (long hair) and his double (same hair and clothes, grey, black eyes).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Person, PERSON_REST, PersonState} from './People';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const DARK = {bright: 0.75, warmRim: 0.05, coldRim: 0.9, cold: 0.5};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>;

export const KostyaSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: PersonState = {...PERSON_REST, t};
  const heads: [PersonState, string][] = [
    [{...R, happy: 0.7}, 'спокоен'], [{...R, blink: 0, mouth: 0.1}, 'спит'], [{...R, lookX: -0.7, fear: 0.3}, 'насторожился'],
    [{...R, fear: 0.9, mouth: 0.5}, 'страх'], [{...R, lookY: 0.9, fear: 0.6}, 'смотрит вниз'], [{...R, fear: 1, mouth: 0.9, tremble: 5}, 'ужас'],
  ];
  const xs = [120, 350, 580, 810, 1040, 1270, 1500, 1730];
  const poses: [PersonState, string, 'front' | 'back'][] = [
    [{...R, happy: 0.5}, 'спереди', 'front'], [R, 'со спины', 'back'], [{...R, phone: 1, lookY: 0.6}, 'телефон', 'front'],
    [{...R, phone: 1, fear: 0.8, lookY: 0.6}, 'голосовое', 'front'], [{...R, lookX: 0.8, turn: 0.5, fear: 0.4}, 'оглядывается', 'front'],
    [{...R, hands: 1, fear: 0.6, mouth: 0.4}, 'испуг', 'front'], [{...R, sit: 1, fear: 0.5, hands: 0.8}, 'сидит', 'front'], [{...R, shh: 1, fear: 0.6}, 'тише', 'front'],
  ];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Костя, 20 — длинные волосы до плеч (футболка, треники, носки)" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {heads.map(([st], i) => <g key={i} transform={`translate(${200 + i * 305} ${100 + 1560 * 0.45}) scale(0.45)`}><Person s={st} light={LIT} id={`h${i}`} crop={-900} /></g>)}
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

export const DoubleSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: PersonState = {...PERSON_REST, t, uncanny: 0.85, blink: 1};
  const D = {variant: 'double' as const, outfit: 'pajama' as const};
  const heads: [PersonState, string][] = [[{...R}, 'смотрит'], [{...R, smile: 1, mouth: 0.9}, 'пасть'], [{...R, smile: 0.7, shh: 1}, '«тсс»'], [{...R, smile: 0.5, mouth: 0.3}, 'шепчет твоим голосом']];
  return (
    <AbsoluteFill style={{background: '#2f333d'}}>
      <svg width={1920} height={1080}>
        <Title t="«Он» — испорченная копия Кости" />
        <clipPath id="dtop"><rect x={0} y={80} width={1920} height={360} /></clipPath>
        <g clipPath="url(#dtop)">
          {heads.map(([st], i) => <g key={i} transform={`translate(${200 + i * 330} ${100 + 1560 * 0.45}) scale(0.45)`}><Person s={st} light={LIT} id={`d${i}`} crop={-900} {...D} /></g>)}
          <g transform={`translate(${1660} ${100 + 1560 * 0.45}) scale(0.45)`}><Person s={{...PERSON_REST, t, fear: 0.7}} light={LIT} id="dk" crop={-900} /></g>
        </g>
        {heads.map(([, l], i) => <Label key={l} x={200 + i * 330} y={476} t={l} />)}
        <Label x={1660} y={476} t="Костя (для сравнения)" />
        <g transform="translate(200 1010) scale(0.27)"><Person s={{...R, smile: 0.6}} light={DARK} id="df" {...D} /></g>
        <g transform="translate(470 1010) scale(0.27)"><Person s={R} light={DARK} id="db" view="back" {...D} /></g>
        <g transform="translate(740 1010) scale(0.27)"><Person s={{...R, smile: 1, claw: 1}} light={DARK} id="dc" {...D} /></g>
        <g transform="translate(1060 1010) scale(0.27)"><Person s={{...PERSON_REST, t, fear: 0.6}} light={LIT} id="kx" /></g>
        <g transform="translate(1300 1010) scale(0.27)"><Person s={{...R, smile: 0.4}} light={DARK} id="dt" {...D} /></g>
        {[[200, 'спереди'], [470, 'со спины'], [740, '«сейчас схватит»'], [1180, 'Костя и двойник']].map(([x, l]) => <Label key={l as string} x={x as number} y={1060} t={l as string} />)}
      </svg>
    </AbsoluteFill>
  );
};

// three looks of the double to choose from: A «almost you», B «faceless», C «shadow»
export const LooksSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: PersonState = {...PERSON_REST, t, uncanny: 1, blink: 1};
  const looks: ['almost' | 'faceless' | 'shadow', string][] = [['almost', 'А · «Почти ты»'], ['faceless', 'Б · «Без лица»'], ['shadow', 'В · «Тень»']];
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Двойник Кости — 3 варианта (волосы и одежда как у Кости)" />
        {looks.map(([lk, name], i) => {
          const x0 = 40 + i * 600;
          return (
            <g key={lk}>
              <rect x={x0} y={90} width={560} height={950} rx={20} fill="#3c404c" />
              <text x={x0 + 280} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#ffd27a">{name}</text>
              <clipPath id={`lh${i}`}><rect x={x0} y={160} width={560} height={330} /></clipPath>
              <g clipPath={`url(#lh${i})`}>
                <g transform={`translate(${x0 + 145} ${170 + 1560 * 0.4}) scale(0.4)`}><Person s={{...R}} light={LIT} id={`la${i}`} crop={-900} variant="double" look={lk} /></g>
                <g transform={`translate(${x0 + 415} ${170 + 1560 * 0.4}) scale(0.4)`}><Person s={{...R, smile: 1, mouth: 0.3}} light={LIT} id={`lb${i}`} crop={-900} variant="double" look={lk} /></g>
              </g>
              <Label x={x0 + 145} y={520} t="смотрит" />
              <Label x={x0 + 415} y={520} t="улыбается" />
              <g transform={`translate(${x0 + 150} 990) scale(0.27)`}><Person s={{...PERSON_REST, t, fear: 0.6}} light={LIT} id={`lk${i}`} /></g>
              <g transform={`translate(${x0 + 410} 990) scale(0.27)`}><Person s={{...R, smile: 0.7, claw: 1}} light={LIT} id={`lc${i}`} variant="double" look={lk} /></g>
              <Label x={x0 + 150} y={1030} t="Костя" />
              <Label x={x0 + 410} y={1030} t="двойник" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
