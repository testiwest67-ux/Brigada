// «Рейс 19» character sheets: Taylor and the radioman — front, back, emotions, poses.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Radist, RADIST_REST, RadistState, Taylor, TAYLOR_REST, TaylorState} from './People';
import {RadistS, TaylorS} from './Sitcom';

type TC = typeof Taylor; type RC = typeof Radist;
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const Label: React.FC<{x: number; y: number; t: string}> = ({x, y, t}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => (
  <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>
);

type Row<S> = [S, string][];
function Sheet<S>({title, faces, full, render, headY}: {
  title: string; faces: Row<S>; full: [S | null, string][];
  render: (s: S, id: string, view?: 'front' | 'back') => React.ReactNode; headY: number;
}) {
  const xs = full.map((_, i) => 140 + i * (1640 / Math.max(1, full.length - 1)));
  const S = 0.27, F = 0.5;
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t={title} />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={370} /></clipPath>
        <g clipPath="url(#top)">
          {faces.map(([st, ], i) => (
            <g key={i} transform={`translate(${200 + i * 305} ${265 - headY * F}) scale(${F})`}>{render(st, `c${i}`)}</g>
          ))}
        </g>
        {faces.map(([, l], i) => <Label key={l} x={200 + i * 305} y={486} t={l} />)}
        {full.map(([st, ], i) => (
          <g key={i} transform={`translate(${xs[i]} 1000) scale(${S})`}>
            {st ? render(st, `f${i}`) : render(faces[0][0], 'fb', 'back')}
          </g>
        ))}
        {full.map(([, l], i) => <Label key={l} x={xs[i]} y={1050} t={l} />)}
      </svg>
    </AbsoluteFill>
  );
}

const taylorSheet = (T: TC, look: string): React.FC => () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: TaylorState = {...TAYLOR_REST, t};
  const calm = {...R, smile: 0.6, lookX: 0.15};
  const worry = {...R, worry: 0.8, lookY: 0.4};
  const scared = {...R, fear: 0.9, mouth: 0.5, sweat: 1};
  const talk = {...R, talk: 1, mouth: 0.6, worry: 0.5};
  const resign = {...R, blink: 0.15, worry: 1, lookY: 0.6};
  const shout = {...R, mouth: 0.9, anger: 0.7, talk: 1};
  const compass = {...R, point: 1, lookY: 0.9, lookX: -0.6, worry: 0.6};
  const gog = {...R, goggles: 1, smile: 0.4};
  return (
    <Sheet<TaylorState>
      title={`Лейтенант Чарльз Тейлор — лист персонажа${look}`}
      headY={-1560}
      faces={[[calm, 'спокоен'], [worry, 'тревога'], [scared, 'страх'], [talk, 'говорит в рацию'], [shout, 'кричит'], [resign, 'смирился']]}
      full={[[calm, 'спереди'], [null, 'со спины'], [gog, 'очки на глазах'], [talk, 'рация'], [compass, 'на компас'], [scared, 'испуг'], [resign, 'последние слова']]}
      render={(s, id, view) => <T s={s} light={LIT} id={id} view={view} />}
    />
  );
};

const radistSheet = (R0: RC, look: string): React.FC => () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: RadistState = {...RADIST_REST, t};
  const calm = {...R, smile: 0.5, lookX: 0.2};
  const listen = {...R, listen: 1, worry: 0.5, lookX: -0.3, lookY: -0.2};
  const shout = {...R, shout: 1, mouth: 1, anger: 0.6, fear: 0.3};
  const scared = {...R, fear: 1, mouth: 0.45, sweat: 1};
  const sad = {...R, worry: 1, lookY: 0.7, blink: 0.6};
  const silence = {...R, listen: 1, fear: 0.6, lookY: 0.3};
  const off = {...R, headsOff: 1, worry: 1, blink: 0.4, lookY: 0.8};
  return (
    <Sheet<RadistState>
      title={`Радист («ты») — лист персонажа${look}`}
      headY={-1600}
      faces={[[calm, 'спокоен'], [listen, 'слушает эфир'], [shout, 'кричит в микрофон'], [scared, 'страх'], [silence, 'тишина'], [sad, 'горе']]}
      full={[[calm, 'спереди'], [null, 'со спины'], [listen, 'слушает'], [shout, '«На запад!»'], [scared, 'испуг'], [off, 'снял наушники']]}
      render={(s, id, view) => <R0 s={s} light={LIT} id={id} view={view} />}
    />
  );
};

export const TaylorSheet = taylorSheet(Taylor, '');
export const RadistSheet = radistSheet(Radist, '');
export const TaylorSheet2 = taylorSheet(TaylorS, ' (стиль ситкома)');
export const RadistSheet2 = radistSheet(RadistS, ' (стиль ситкома)');
