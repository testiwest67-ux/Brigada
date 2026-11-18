// «Кто лишний?» character sheets (no 3D, fast): the counsellor (you), the four suspects, the rest of the squad + Uncle Grisha.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Kid, KID_REST, KidState, LOOKS} from './Kid';
import {Grisha, GRISHA_REST} from './Grisha';
import {ensureFont, FONT} from '../horror/fonts';

const LIT = {bright: 1, warmRim: 0.45, coldRim: 0.55, cold: 0.15};
const Label: React.FC<{x: number; y: number; t: string; s?: number}> = ({x, y, t, s = 26}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={s} fill="#e8e6f0">{t}</text>
);
const Title: React.FC<{t: string}> = ({t}) => (
  <text x={40} y={60} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#f2f0f6">{t}</text>
);

export const CounsellorSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: KidState = {...KID_REST, t};
  const lk = LOOKS.counsellor;
  const calm = {...R, mouth: 0.1, lookX: 0.15};
  const count = {...R, lookY: 0.6, fear: 0.3};
  const scared = {...R, fear: 0.9, mouth: 0.55, hands: 1, lookY: -0.2};
  const hand = {...R, reach: 1, fear: 1, lookX: -0.8, mouth: 0.3, tremble: 4};
  const smile = {...R, smile: 0.8};
  const down = {...R, lookY: 1, blink: 0.55, fear: 0.5};
  const xs = [140, 380, 620, 860, 1100, 1340, 1580];
  const S = 0.24;
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Ты, вожатый (19 лет) — лист персонажа" />
        <clipPath id="top"><rect x={0} y={80} width={1920} height={350} /></clipPath>
        <g clipPath="url(#top)">
          {[calm, smile, count, scared, hand, down].map((st, i) => (
            <g key={i} transform={`translate(${200 + i * 305} ${100 + 2070 * 0.45}) scale(0.45)`}>
              <Kid lk={lk} tall={1} s={{...st, hands: 0, reach: 0}} light={LIT} id={`c${i}`} />
            </g>
          ))}
        </g>
        {['спокоен', 'улыбается', 'считает', 'страх', 'в темноте', 'смотрит в пол'].map((l, i) => <Label key={l} x={200 + i * 305} y={466} t={l} />)}
        {[calm, null, count, scared, hand, down, smile].map((st, i) => (
          <g key={i} transform={`translate(${xs[i]} 1010) scale(${S})`}>
            {st ? <Kid lk={lk} tall={1} s={st} light={LIT} id={`f${i}`} /> : <Kid lk={lk} tall={1} s={calm} light={LIT} id="fb" view="back" />}
          </g>
        ))}
        {['спереди', 'со спины', 'со списком', 'испуг', 'держат за руку', 'устал', 'перекличка'].map((l, i) => <Label key={l} x={xs[i]} y={1060} t={l} />)}
      </svg>
    </AbsoluteFill>
  );
};

export const SuspectsSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: KidState = {...KID_REST, t};
  const cols: [string, string, KidState, string][] = [
    ['vova', '1. Вова', {...R, lookY: 0.5, mouth: 0}, 'не ест'],
    ['lena', '2. Лена', {...R, smile: 0.7, lookX: 0.4}, 'знает всех'],
    ['misha', '3. Миша', {...R, lookX: -0.6, fear: 0.2}, 'мокрый, с озера'],
    ['olya', '4. Оля', {...R, smile: 0.5, lookX: 0.3}, 'тихая, рядом'],
  ];
  const S = 0.3;
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Четверо подозреваемых — лист персонажей" />
        {cols.map(([k, name, st, note], i) => {
          const x0 = 70 + i * 470;
          const sing = {...st, sing: 1, t};
          const fear = {...st, fear: 0.9, mouth: 0.5, hands: 1, smile: 0};
          const extra = k === 'olya' ? {...st, uncanny: 1, smile: 0.9, lookX: 0, lookY: 0} : k === 'vova' ? {...st, hands: 1, mouth: 0.4} : k === 'misha' ? {...st, wave: 1, t} : {...st, smile: 1};
          return (
            <g key={k}>
              <Label x={x0 + 200} y={120} t={name} s={38} />
              <Label x={x0 + 200} y={156} t={note} s={24} />
              {/* close-up of the face */}
              <g transform={`translate(${x0 + 200} ${180 + 1600 * 0.3}) scale(0.3)`}><Kid lk={LOOKS[k]} s={st} light={LIT} id={`h${i}`} crop={-985} /></g>
              {/* full: front, back, extra */}
              {[st, null, extra].map((ss, j) => (
                <g key={j} transform={`translate(${x0 + 60 + j * 140} 1000) scale(${S * 0.85})`}>
                  {ss ? <Kid lk={LOOKS[k]} s={ss} light={LIT} id={`s${i}${j}`} /> : <Kid lk={LOOKS[k]} s={st} light={LIT} id={`s${i}b`} view="back" />}
                </g>
              ))}
              <Label x={x0 + 60} y={1050} t="спереди" s={20} />
              <Label x={x0 + 200} y={1050} t="со спины" s={20} />
              <Label x={x0 + 340} y={1050} t={k === 'olya' ? 'не моргает' : k === 'misha' ? 'машет' : k === 'vova' ? 'прячет еду' : 'смеётся'} s={20} />
              {/* small: scared + singing */}
              <g transform={`translate(${x0 + 360} ${250 + 1230 * 0.16}) scale(0.16)`}><Kid lk={LOOKS[k]} s={fear} light={LIT} id={`x${i}`} crop={-985} /></g>
              <g transform={`translate(${x0 + 360} ${470 + 1230 * 0.16}) scale(0.16)`}><Kid lk={LOOKS[k]} s={sing} light={LIT} id={`y${i}`} crop={-985} /></g>
              <Label x={x0 + 360} y={360} t="страх" s={20} />
              <Label x={x0 + 360} y={580} t="поёт" s={20} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const SquadSheet: React.FC = () => {
  ensureFont();
  const t = useCurrentFrame() / 30;
  const R: KidState = {...KID_REST, t};
  const keys = ['k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12', 'k13'];
  const g = {...GRISHA_REST, t};
  return (
    <AbsoluteFill style={{background: '#4c5160'}}>
      <svg width={1920} height={1080}>
        <Title t="Остальной отряд (9 детей) и сторож дядя Гриша" />
        {keys.map((k, i) => (
          <g key={k} transform={`translate(${100 + i * 128} 560) scale(0.26)`}>
            <Kid lk={LOOKS[k]} s={{...R, smile: i % 3 === 0 ? 0.6 : 0, lookX: ((i % 3) - 1) * 0.5, sing: i % 2 ? 0 : 1}} light={LIT} id={`k${i}`} />
          </g>
        ))}
        <Label x={610} y={610} t="фон: у каждого своя одежда — кепки, косынки, банты, сарафаны, тельняшка, олимпийка" s={24} />
        {[
          [1260, {...g, mouth: 0.3}, 'спереди', 'front'],
          [1460, {...g, fingers: 3, mouth: 0.4, narrow: 0.5}, '«три правила»', 'front'],
          [1660, {...g, hush: 1, narrow: 0.6, torch: 0.6}, 'шёпот', 'front'],
          [1840, g, 'со спины', 'back'],
        ].map(([x, st, l, v], i) => (
          <g key={i}>
            <g transform={`translate(${x} 1000) scale(0.24)`}><Grisha s={st as typeof g} light={LIT} id={`g${i}`} view={v as 'front' | 'back'} /></g>
            <Label x={x as number} y={1050} t={l as string} s={22} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
