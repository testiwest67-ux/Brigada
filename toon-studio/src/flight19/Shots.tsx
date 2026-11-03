// «Рейс 19»: the shot list. Every shot starts on a voice line (S(i)), so a re-voice moves the cuts with it.
// Storyboard composition: frame n shows the key moment of shot n (with subtitles) — the sheet the user reviews.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import VOICE from '../../public/reys-19/voice.json';
import {clamp, easeInOut, lerp, mulberry32} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {CapLine, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import {TaylorS, RadistS} from './Sitcom';
import {RADIST_REST, TAYLOR_REST} from './People';
import {Avenger, Cockpit, Compass, FuelGauge, INK, MapScene, Mariner, Ocean, RadioRoom, Ship, Sky} from './sets';
import {ReportScene} from './Report';

type VL = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const L = (VOICE as {lines: VL[]; total: number}).lines;
export const TOTAL = (VOICE as {total: number}).total;
const S = (i: number) => L[i].start, E = (i: number) => L[i].end;
const W = (i: number, k: number) => L[i].words[k].t;

const DAY = {bright: 1, warmRim: 0.35, coldRim: 0.3, cold: 0.05};
const NIGHT = {bright: 0.72, warmRim: 0.55, coldRim: 0.85, cold: 0.6};
const STORM = {bright: 0.78, warmRim: 0.1, coldRim: 0.75, cold: 0.5};

const Big: React.FC<{y: number; text: string; size?: number; color?: string; o?: number}> = ({y, text, size = 110, color = '#fff', o = 1}) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} stroke="#050407" strokeWidth={size * 0.14} paintOrder="stroke" opacity={o}>{text}</text>
);

// puppets placed by their feet
const Rad: React.FC<{x: number; y: number; s: number; st: Partial<typeof RADIST_REST>; light: typeof DAY; id: string; t: number}> = ({x, y, s, st, light, id, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><RadistS s={{...RADIST_REST, t, breathe: Math.sin(t * 2), ...st}} light={light} id={id} /></g>
);
const Tay: React.FC<{x: number; y: number; s: number; st: Partial<typeof TAYLOR_REST>; light: typeof DAY; id: string; t: number}> = ({x, y, s, st, light, id, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><TaylorS s={{...TAYLOR_REST, t, breathe: Math.sin(t * 2), ...st}} light={light} id={id} /></g>
);

const Formation: React.FC<{t: number; x: number; y: number; s: number; night?: number; n?: number}> = ({t, x, y, s, night = 0, n = 5}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const dx = [0, -260, 260, -520, 520][i], dy = [0, -90, 90, -180, 180][i];
      return <Avenger key={i} x={x + dx * s * 1.4 + Math.sin(t + i) * 6} y={y + dy * s * 1.4 + Math.sin(t * 1.3 + i * 2) * 8} s={s * (1 - i * 0.04)} t={t + i * 0.1} night={night} tilt={Math.sin(t * 0.8 + i) * 1.5} />;
    })}
  </g>
);

type Shot = {from: number; key: number; render: (t: number, k: number) => React.ReactNode; name: string; html?: boolean};
const sh = (name: string, from: number, key: number, render: Shot['render'], html = false): Shot => ({name, from, key, render, html});

export const SHOTS: Shot[] = [
  sh('1 карта: треугольник', 0, E(0) + 0.1, (t) => (
    <MapScene s={{t, tri: clamp((t - S(0)) / Math.max(0.5, E(0) - S(0))), planes: 1, gone: 0, labels: clamp((t - S(0)) / 0.6)}} />
  )),
  sh('2 карта: исчезают самолёты', S(1) - 0.1, E(1) - 0.2, (t) => (
    <g>
      <MapScene s={{t, tri: 1, planes: 1, gone: clamp((t - S(1)) / (W(1, 6) - S(1))), glow: 0.5}} />
      <Big y={330} text="6 САМОЛЁТОВ" o={clamp((t - W(1, 5)) / 0.3)} />
      <Big y={470} text="27 ЧЕЛОВЕК" color="#ff3a3a" o={clamp((t - W(1, 8)) / 0.3)} />
    </g>
  )),
  sh('3 пустой ночной океан', S(2) - 0.1, E(2), (t) => (
    <g><Sky mood="night" t={t} h={900} /><Ocean mood="night" t={t} y={900} rough={0.3} /></g>
  )),
  sh('4 компас крутится (голос Тейлора)', S(3) - 0.15, E(3) - 0.3, (t) => (
    <g>
      <rect width={1080} height={1920} fill="#050608" />
      <g transform="translate(0 -500) scale(1)"><Compass x={540} y={960} r={330} heading={t * 520 + Math.sin(t * 7) * 60} /></g>
      <path d={`M 80 1260 ${Array.from({length: 46}, (_, i) => `L ${80 + i * 20} ${1260 + Math.sin(t * 30 + i * 0.9) * (20 + 40 * Math.abs(Math.sin(i * 0.37 + t * 3)))}`).join(' ')}`} stroke="#4ade80" strokeWidth={5} fill="none" opacity={0.8} />
    </g>
  )),
  sh('5 радист слушает ночью', S(4) - 0.1, E(4) - 0.3, (t) => (
    <RadioRoom t={t} night={1} clock={18 * 60 + 20} glow={0.8}>
      <Rad x={330} y={2000} s={0.78} st={{listen: 1, worry: 0.6, lookX: -0.3}} light={NIGHT} id="r5" t={t} />
    </RadioRoom>
  )),
  sh('6 титр: 5 декабря 1945, Флорида', S(5) - 0.1, E(5) - 0.2, (t) => (
    <g>
      <Sky mood="day" t={t} h={1250} />
      <rect x={-20} y={1250} width={1120} height={700} fill="#9a9a8e" stroke={INK} strokeWidth={4} />
      <path d="M -20 1250 L 1100 1250" stroke={INK} strokeWidth={4} />
      <path d="M 40 1250 L 40 860 C 160 740 520 740 640 860 L 640 1250 Z" fill="#8a8f96" stroke={INK} strokeWidth={4} />
      <rect x={110} y={980} width={460} height={270} fill="#2a2e34" stroke={INK} strokeWidth={4} />
      <text x={340} y={930} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#f4f4f0">NAS FORT LAUDERDALE</text>
      {[0, 1, 2, 3, 4].map((i) => <Avenger key={i} x={300 + i * 170} y={1420 + i * 60} s={0.28 + i * 0.03} t={0} />)}
      <Big y={420} text="5 ДЕКАБРЯ 1945" size={100} />
      <Big y={540} text="ФЛОРИДА" size={90} color="#ffd27a" />
    </g>
  )),
  sh('7 ты — радист (день)', S(6) - 0.1, E(6) - 0.2, (t) => (
    <RadioRoom t={t} night={0} clock={14 * 60 + 5} glow={0.4}>
      <Rad x={330} y={2000} s={0.78} st={{smile: 0.5, lookX: 0.3}} light={DAY} id="r7" t={t} />
    </RadioRoom>
  )),
  sh('8 пять торпедоносцев в небе', S(7) - 0.1, E(7) - 0.3, (t) => (
    <g>
      <Sky mood="day" t={t} h={1400} /><Ocean mood="day" t={t} y={1400} />
      <Formation t={t} x={560 + (t - S(7)) * 30} y={900} s={0.62} />
      <Big y={420} text="14 ЧЕЛОВЕК" o={clamp((t - W(7, 7)) / 0.3)} />
    </g>
  )),
  sh('9 спокойный океан', S(8) - 0.1, E(8) - 0.3, (t) => (
    <g><Sky mood="day" t={t} h={1100} /><Ocean mood="day" t={t} y={1100} /><Formation t={t} x={300 + (t - S(8)) * 50} y={760} s={0.18} /></g>
  )),
  sh('10 лейтенант Тейлор в кабине', S(9) - 0.1, E(9) - 0.3, (t) => (
    <Cockpit t={t} mood="day">
      <Tay x={540} y={2150} s={0.85} st={{smile: 0.7, lookX: 0.2}} light={DAY} id="t10" t={t} />
    </Cockpit>
  )),
  sh('11 треск в наушниках', S(10) - 0.1, E(10), (t) => (
    <RadioRoom t={t} night={0.2} clock={15 * 60 + 45} glow={0.9}>
      <Rad x={330} y={2000} s={0.78} st={{listen: 1, worry: 0.8, lookY: -0.2}} light={DAY} id="r11" t={t} />
    </RadioRoom>
  )),
  sh('12 «Оба компаса отказали»', S(11) - 0.1, E(11) - 0.3, (t) => (
    <Cockpit t={t} mood="dusk" spin={1}>
      <Tay x={540} y={2150} s={0.85} st={{talk: 1, mouth: 0.4 + 0.4 * Math.abs(Math.sin(t * 9)), worry: 0.7, sweat: 0.8}} light={DAY} id="t12" t={t} />
    </Cockpit>
  )),
  sh('13 острова внизу', S(12) - 0.1, E(12) - 0.3, (t) => {
    const r = mulberry32(21);
    return (
      <g>
        <rect width={1080} height={1920} fill="#1f6f9e" />
        {Array.from({length: 7}, (_, i) => {
          const x = 120 + r() * 840, y = 300 + i * 220 + r() * 80, w = 80 + r() * 160;
          return <g key={i}><ellipse cx={x} cy={y} rx={w * 1.6} ry={w * 0.7} fill="#4cc3c9" opacity={0.6} /><ellipse cx={x} cy={y} rx={w} ry={w * 0.4} fill="#e8d8a0" stroke={INK} strokeWidth={4} /><ellipse cx={x - w * 0.2} cy={y - 4} rx={w * 0.5} ry={w * 0.18} fill="#5a9a4a" /></g>;
        })}
        {Array.from({length: 6}, (_, i) => <ellipse key={`c${i}`} cx={(r() * 1200 + t * 40) % 1300 - 100} cy={200 + r() * 1500} rx={200} ry={90} fill="#fff" opacity={0.75} />)}
        <Big y={300} text="«ЭТО ОСТРОВА ФЛОРИДЫ…»" size={64} color="#ffd27a" />
      </g>
    );
  }),
  sh('14 «Летите на запад!»', S(13) - 0.1, E(13) - 0.3, (t) => (
    <RadioRoom t={t} night={0.4} clock={16 * 60 + 30} glow={1}>
      <Rad x={330} y={2000} s={0.78} st={{shout: 1, mouth: 0.9, anger: 0.6, fear: 0.3}} light={DAY} id="r14" t={t} />
    </RadioRoom>
  )),
  sh('15 карта: запад против северо-востока', S(14) - 0.1, E(15) - 0.2, (t) => (
    <MapScene s={{t, tri: 1, arrows: clamp((t - S(14)) / (E(15) - S(14))), glow: 0.4, zoom: 1.25}} />
  )),
  sh('16 шторм', S(16) - 0.1, E(16) - 0.2, (t) => (
    <g>
      <Sky mood="storm" t={t} h={1350} clouds={2} /><Ocean mood="storm" t={t} y={1350} rough={1} />
      <Formation t={t} x={540} y={800} s={0.5} night={0.6} />
      {Array.from({length: 120}, (_, i) => { const r = mulberry32(i); const x = r() * 1200, y = (r() * 2000 + t * 1400) % 2000; return <path key={i} d={`M ${x} ${y} l -24 60`} stroke="#c8d8e8" strokeWidth={3} opacity={0.45} />; })}
      <path d="M 820 0 L 760 220 L 820 230 L 730 520" stroke="#fffbe0" strokeWidth={10} fill="none" opacity={Math.sin(t * 3) > 0.7 ? 1 : 0} />
    </g>
  )),
  sh('17 топливо на 20 минут', S(17) - 0.1, E(17) - 0.2, (t) => (
    <g><rect width={1080} height={1920} fill="#0a0c10" /><FuelGauge v={lerp(0.22, 0.12, clamp((t - S(17)) / 2))} t={t} /><Big y={300} text="20 МИНУТ" color="#ff3a3a" /></g>
  )),
  sh('18 «Садимся на воду. Все вместе»', S(18) - 0.1, E(18) - 0.4, (t) => (
    <Cockpit t={t} mood="storm" rain={1}>
      <Tay x={540} y={2150} s={0.85} st={{talk: 1, mouth: 0.3 + 0.3 * Math.abs(Math.sin(t * 8)), worry: 1, blink: 0.55, lookY: 0.4}} light={STORM} id="t18" t={t} />
    </Cockpit>
  )),
  sh('19 эфир замолкает', S(19) - 0.1, E(19) + 1.0, (t) => (
    <RadioRoom t={t} night={1} clock={19 * 60 + 5} glow={0}>
      <Rad x={330} y={2000} s={0.78} st={{listen: 1, fear: 0.7, lookY: 0.2}} light={NIGHT} id="r19" t={t} />
    </RadioRoom>
  )),
  sh('20 вылетает самолёт-спасатель', S(20) - 0.1, E(20) - 0.2, (t) => (
    <g><Sky mood="night" t={t} h={1300} /><Ocean mood="night" t={t} y={1300} /><Mariner x={420 + (t - S(20)) * 60} y={900 - (t - S(20)) * 30} s={0.9} t={t} /><Big y={420} text="13 ЧЕЛОВЕК" o={clamp((t - W(20, 3)) / 0.3)} /></g>
  )),
  sh('21 моряки видят вспышку', S(21) - 0.1, E(22) - 0.3, (t) => {
    const f = clamp((t - W(22, 6)) / 0.3);
    return (
      <g>
        <Sky mood="night" t={t} h={1100} sun={false} /><Ocean mood="night" t={t} y={1100} rough={0.5} />
        <circle cx={760} cy={1030} r={60 + f * 120} fill="#ffb24a" opacity={0.25 * f} />
        <circle cx={760} cy={1030} r={20 + f * 40} fill="#fff1c0" opacity={f} />
        <path d="M -20 1500 L 1100 1440 L 1100 1960 L -20 1960 Z" fill="#0b0e14" stroke={INK} strokeWidth={4} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${260 + i * 260} ${1480 - i * 14})`}>
            <path d="M -70 0 C -70 -180 70 -180 70 0 Z" fill="#1c2534" stroke="#ffb24a" strokeWidth={4} strokeOpacity={0.6} />
            <circle cx={0} cy={-220} r={56} fill="#1c2534" stroke="#ffb24a" strokeWidth={4} strokeOpacity={0.6} />
            <path d="M -50 -262 C -40 -300 40 -300 50 -262 Z" fill="#d8dce2" />
          </g>
        ))}
        <path d="M -20 1380 L 1100 1330" stroke="#0b0e14" strokeWidth={14} />
      </g>
    );
  }),
  sh('22 шесть самолётов, 27 человек', S(23) - 0.1, E(23) - 0.2, (t) => (
    <g>
      <rect width={1080} height={1920} fill="#050608" />
      {Array.from({length: 6}, (_, i) => <g key={i} transform={`translate(${200 + (i % 3) * 340} ${820 + Math.floor(i / 3) * 260}) scale(${i === 5 ? 0.3 : 0.24}) ${i === 5 ? '' : ''}`} opacity={0.85}>{i === 5 ? <Mariner x={0} y={0} t={t} /> : <Avenger x={0} y={0} t={t} />}</g>)}
      <Big y={360} text="6 САМОЛЁТОВ" size={120} />
      <Big y={510} text="27 ЧЕЛОВЕК" size={120} color="#ff3a3a" />
    </g>
  )),
  sh('23 утро: поиски', S(24) - 0.1, E(24) - 0.2, (t) => (
    <g>
      <Sky mood="dawn" t={t} h={1150} /><Ocean mood="dawn" t={t} y={1150} />
      <Ship x={260} y={1230} s={0.45} t={t} /><Ship x={760} y={1300} s={0.7} t={t} /><Ship x={480} y={1600} s={1.1} t={t} beam={0.6} />
      <Avenger x={300 + (t - S(24)) * 80} y={520} s={0.3} t={t} /><Avenger x={820 - (t - S(24)) * 60} y={700} s={0.22} t={t} flip />
      <Mariner x={600} y={360} s={0.25} t={t} night={0} />
    </g>
  )),
  sh('24 ни одного обломка', S(25) - 0.1, E(25) - 0.2, (t) => (
    <g><Sky mood="dawn" t={t} h={700} clouds={0.6} /><Ocean mood="dawn" t={t} y={700} rough={0.2} /><Big y={420} text="0 ОБЛОМКОВ" color="#ff3a3a" o={clamp((t - W(25, 2)) / 0.3)} /></g>
  )),
  sh('25 отчёт комиссии', S(26) - 0.15, S(28) + 0.7, (t) => <ReportScene t={t} />, true),
  sh('26 журнал 1964', S(29) - 0.1, W(29, 8) + 0.6, (t) => (
    <g>
      <rect width={1080} height={1920} fill="#3a2a1c" />
      <g transform={`translate(540 780) rotate(-3) scale(${lerp(0.88, 0.94, clamp((t - S(29)) / 4))})`}>
        <rect x={-360} y={-500} width={720} height={1000} fill="#000" opacity={0.4} transform="translate(16 18)" />
        <rect x={-360} y={-500} width={720} height={1000} fill="#e9dcb8" stroke={INK} strokeWidth={4} />
        <rect x={-360} y={-500} width={720} height={150} fill="#b3202a" />
        <text x={0} y={-440} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#f4ecd4">ЖУРНАЛ ПРИКЛЮЧЕНИЙ</text>
        <text x={0} y={-380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#f4ecd4">ФЕВРАЛЬ 1964 · 35¢</text>
        <rect x={-320} y={-320} width={640} height={540} fill="#0e1a2a" stroke={INK} strokeWidth={4} />
        <path d="M -200 120 L 220 -40 L -40 -250 Z" fill="none" stroke="#ff3a3a" strokeWidth={10} />
        <g transform="translate(40 -40) rotate(30) scale(0.3)"><Avenger x={0} y={0} t={0} night={1} /></g>
        <path d="M -320 160 Q -160 120 0 160 T 320 160 L 320 220 L -320 220 Z" fill="#1d3b5a" />
        <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#1a1414">СМЕРТЕЛЬНЫЙ</text>
        <text x={0} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#b3202a">БЕРМУДСКИЙ</text>
        <text x={0} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#b3202a">ТРЕУГОЛЬНИК</text>
      </g>
    </g>
  )),
  sh('27 «Так что же случилось?»', S(31) - 0.1, E(31) - 0.1, (t) => (
    <MapScene s={{t, tri: 1, question: clamp((t - S(31)) / 0.6), glow: 1.5, labels: 0.4}} />
  )),
  ...(['А', 'Б', 'В'] as const).map((letter, n) => sh(`${28 + n} версия ${letter}`, S(32 + n) - 0.1, E(32 + n) - 0.4, (t) => (
    <g>
      <rect width={1080} height={1920} fill={['#1a1414', '#101828', '#1a0e1e'][n]} />
      <Big y={330} text={`ВЕРСИЯ ${letter}`} size={120} color={['#ffd27a', '#7ad0ff', '#ff6a8a'][n]} />
      {n === 0 && <g><Tay x={540} y={2050} s={0.62} st={{worry: 1, blink: 0.2}} light={NIGHT} id="tA" t={t} /><g transform="translate(800 760) scale(0.32)"><g transform="translate(-540 -960)"><FuelGauge v={0.02} t={t} /></g></g></g>}
      {n === 1 && <g><Compass x={540} y={880} r={260} heading={t * 300 + Math.sin(t * 5) * 80} />{[0, 1, 2].map((i) => <circle key={i} cx={540} cy={880} r={300 + i * 60 + ((t * 80) % 60)} fill="none" stroke="#7ad0ff" strokeWidth={6} opacity={0.4 - i * 0.1} />)}</g>}
      {n === 2 && <g><Ocean mood="night" t={t} y={1000} rough={0.4} />{Array.from({length: 8}, (_, i) => <ellipse key={i} cx={540} cy={1150} rx={420 - i * 50} ry={120 - i * 14} fill="none" stroke="#ff6a8a" strokeWidth={5} opacity={0.15 + i * 0.08} transform={`rotate(${t * 40 + i * 20} 540 1150)`} />)}<path d="M 540 640 L 860 1120 L 220 1120 Z" fill="none" stroke="#ff3a3a" strokeWidth={10} opacity={0.8} /></g>}
      <Big y={450} text={['ОШИБКА И ТОПЛИВО', 'МАГНИТНАЯ АНОМАЛИЯ', 'НЕЧТО НЕОБЪЯСНИМОЕ'][n]} size={66} color="#f4f1ea" />
    </g>
  ))),
  sh('31 пиши букву в комментариях', S(35) - 0.1, E(36) - 0.2, (t) => (
    <g>
      <rect width={1080} height={1920} fill="#101420" />
      <Rad x={540} y={2350} s={0.95} st={{smile: 0.8, lookX: 0, lookY: 0.1}} light={NIGHT} id="r31" t={t} />
      {['А', 'Б', 'В'].map((l, i) => (
        <g key={l} transform={`translate(${240 + i * 300} ${360 + Math.sin(t * 3 + i) * 12})`}>
          <circle r={110} fill={['#ffd27a', '#7ad0ff', '#ff6a8a'][i]} stroke={INK} strokeWidth={8} />
          <text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#1a1414">{l}</text>
        </g>
      ))}
    </g>
  )),
];
SHOTS.forEach((s, i) => { (s as Shot & {to: number}).to = i + 1 < SHOTS.length ? SHOTS[i + 1].from : TOTAL; });

// subtitles: keywords in red
const RED = ['треугольник', 'исчезли', 'обломка', 'компас', 'отказали', 'запад', 'северо-восток', 'шторм', 'топлива', 'замолкает', 'спасатель', 'вспышку',
  'неизвестны', 'пилот', 'комментариях', 'шесть', 'двадцать', 'тринадцать', 'четырнадцать', 'пропадает', 'сердце'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
export const CAPTIONS: CapLine[] = [];
L.forEach((l, k) => {
  const next = L[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const ws = l.text.split(' ').map((w, j) => ({w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: RED.some((r) => clean(w).startsWith(r))})).filter((w) => w.w !== '—');
  // chunks of up to 3 words / 18 letters, broken after punctuation
  const chunks: typeof ws[] = [];
  let cur: typeof ws = [];
  ws.forEach((w) => {
    if (cur.length && (cur.length >= 3 || cur.map((c) => c.w).join(' ').length + w.w.length > 18)) { chunks.push(cur); cur = []; }
    cur.push(w);
    if (/[.!?,:…»]$/.test(w.w)) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  chunks.forEach((c, n) => CAPTIONS.push({start: c[0].t - 0.04, end: n + 1 < chunks.length ? chunks[n + 1][0].t - 0.05 : lineEnd, words: c}));
});

export const ShotAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
  ensureFont();
  let i = SHOTS.findIndex((s, n) => t >= s.from && (n + 1 >= SHOTS.length || t < SHOTS[n + 1].from));
  if (i < 0) i = 0;
  const s = SHOTS[i] as Shot & {to: number};
  const k = clamp((t - s.from) / Math.max(0.1, s.to - s.from));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.html ? s.render(t, easeInOut(k)) : <svg width={1080} height={1920} viewBox="0 0 1080 1920">{s.render(t, easeInOut(k))}</svg>}
      <Vignette o={0.6} />
      <Grain f={f} o={0.07} />
      {caps && <HorrorCaptions lines={CAPTIONS} f={Math.round(t * 30)} fps={30} y={1370} />}
    </AbsoluteFill>
  );
};

export const Storyboard: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(f, SHOTS.length - 1)];
  return <ShotAt t={s.key} f={f} />;
};
