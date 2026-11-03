// «Рейс 19», the commission's report (lines 27–29 of the voice):
//  «Комиссия пишет: виноват пилот.» — a typewriter types the conclusion under «ЗАКЛЮЧЕНИЕ:»;
//  «Но мать Тейлора не верит.» — an envelope from Taylor's mother slides onto the desk;
//  «И причину переписывают.» — a red pencil strikes the conclusion out;
//  «Причины неизвестны.» — a red rubber stamp slams onto the sheet, the camera jolts and pushes in.
// Every moment is tied to a word of the voice (see REPORT_CUES); scripts/flight_report_sfx.py uses the same numbers.
import React from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {ensureHand, HAND} from '../shift/hand';
import {TaylorS} from './Sitcom';
import {TAYLOR_REST} from './People';
import VOICE from '../../public/reys-19/voice.json';

// ---- typewriter font (GNU FreeMono Bold, has Cyrillic) ----
export const TYPE = 'TypeLocal';
let typeLoaded = false;
const ensureType = () => {
  if (typeLoaded || typeof document === 'undefined') return;
  typeLoaded = true;
  const h = delayRender('type-font');
  const ff = new FontFace(TYPE, `url(${staticFile('fonts/freemono-bold.ttf')}) format('truetype')`, {weight: '700'});
  document.fonts.add(ff);
  ff.load().then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
};

type VL = {start: number; end: number; words: {w: string; t: number}[]};
const L = (VOICE as {lines: VL[]}).lines;
const W = (i: number, k: number) => L[i].words[k].t;

export const CONCLUSION = ['Ошибка ведущего —', 'лейт. Ч. Тейлора.'];
export const CHAR_DT = 0.034;
export const REPORT_CUES = {
  from: L[26].start - 0.15,                 // the scene starts just before «Комиссия»
  type: W(26, 2) - 0.08,                     // typing starts on «виноват»
  envelope: W(27, 0) + 0.05,                 // «Но мать Тейлора…»
  strike: W(27, 6) - 0.05,                   // «…причину переписывают»
  stamp: L[28].start + 0.02,                 // impact on «Причины»
  to: L[29].start - 0.1,
};
const NCH = CONCLUSION.join('').length;
export const TYPE_END = REPORT_CUES.type + NCH * CHAR_DT + 0.12; // the line break pause counted below

const INK = '#1f1e26', PAPER = '#efe7d2', RED = '#c3262e';

// camera keyframes: [time, zoom, focusY (page coords)]
const CAM: [number, number, number][] = [
  [REPORT_CUES.from, 1.0, 980],
  [REPORT_CUES.type - 0.5, 1.04, 1000],
  [REPORT_CUES.type + 0.1, 1.38, 1080],
  [REPORT_CUES.envelope - 0.05, 1.38, 1090],
  [REPORT_CUES.envelope + 0.55, 1.08, 1240],
  [REPORT_CUES.strike - 0.35, 1.08, 1220],
  [REPORT_CUES.strike + 0.05, 1.4, 1100],
  [REPORT_CUES.stamp - 0.3, 1.12, 1150],
  [REPORT_CUES.stamp, 1.3, 1165],
  [REPORT_CUES.stamp + 0.35, 1.12, 1165],
  [REPORT_CUES.to + 1, 1.2, 1165],
];
const cam = (t: number) => {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, z0, y0] = CAM[i], [t1, z1, y1] = CAM[i + 1];
  const k = easeInOut(clamp((t - t0) / Math.max(1e-3, t1 - t0)));
  return {z: lerp(z0, z1, k), y: lerp(y0, y1, k)};
};

const Typed: React.FC<{x: number; y: number; text: string; n: number; size: number; seed: number}> = ({x, y, text, n, size, seed}) => {
  const r = mulberry32(seed);
  const cw = size * 0.6;
  return (
    <g>
      {[...text].slice(0, n).map((ch, i) => {
        const dy = (r() - 0.5) * 3, op = 0.78 + r() * 0.22;
        return <text key={i} x={x + i * cw} y={y + dy} fontFamily={TYPE} fontWeight={700} fontSize={size} fill={INK} opacity={op}>{ch}</text>;
      })}
    </g>
  );
};

export const ReportScene: React.FC<{t: number}> = ({t}) => {
  ensureFont(); ensureHand(); ensureType();
  const C = REPORT_CUES;
  // typing progress: chars of line 1, a carriage return (0.25 s), then line 2
  const n1 = CONCLUSION[0].length;
  const typed = Math.floor(Math.max(0, t - C.type) / CHAR_DT);
  const ret = C.type + n1 * CHAR_DT, n2 = Math.floor(Math.max(0, t - ret - 0.25) / CHAR_DT);
  const c1 = Math.min(n1, typed), c2 = Math.min(CONCLUSION[1].length, n2);
  const typing = t > C.type && c2 < CONCLUSION[1].length;
  const env = easeOut(clamp((t - C.envelope) / 0.5));
  const st1 = clamp((t - C.strike) / 0.32), st2 = clamp((t - C.strike - 0.3) / 0.32);
  // stamp: falls 0.2 s, slams, ink stays
  const fall = clamp((t - (C.stamp - 0.2)) / 0.2), hit = t >= C.stamp;
  const sinceHit = t - C.stamp;
  const shake = hit && sinceHit < 0.5 ? Math.sin(sinceHit * 70) * 16 * Math.exp(-sinceHit * 9) : 0;
  const {z, y: fy} = cam(t);
  const r = mulberry32(19);
  const caretOn = typing || (t > C.type && Math.floor(t * 2.2) % 2 === 0 && t < C.strike);
  const lineX = 150, l1y = 1080, l2y = 1140, cw = 40 * 0.6;
  const caretX = c2 > 0 || n2 > 0 ? lineX + c2 * cw : lineX + c1 * cw;
  const caretY = c2 > 0 || n2 > 0 ? l2y : l1y;
  return (
    <AbsoluteFill style={{background: '#20150d', overflow: 'hidden'}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="rw" x1="0" x2="1" y1="0" y2="0.25">
            <stop offset="0" stopColor="#4f3520" /><stop offset="0.5" stopColor="#64432a" /><stop offset="1" stopColor="#432c19" />
          </linearGradient>
          <radialGradient id="rlamp" cx="0.5" cy="0.42" r="0.75">
            <stop offset="0" stopColor="#fff1cf" stopOpacity={0.18} /><stop offset="0.55" stopColor="#000" stopOpacity={0.1} /><stop offset="1" stopColor="#000" stopOpacity={0.7} />
          </radialGradient>
          <filter id="sepia"><feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" /></filter>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.45" /><feComposite in="SourceGraphic" operator="in" /></filter>
          <clipPath id="photoClip"><rect x={0} y={0} width={200} height={250} /></clipPath>
        </defs>
        <g transform={`translate(${540 + shake * 0.6} ${960 + shake}) scale(${z}) translate(-540 ${-fy})`}>
          {/* desk */}
          <rect x={-800} y={-400} width={2700} height={3200} fill="url(#rw)" />
          {Array.from({length: 30}, (_, i) => <path key={i} d={`M -800 ${-360 + i * 110 + r() * 40} C 200 ${-340 + i * 110} 900 ${-380 + i * 110} 1900 ${-350 + i * 110 + r() * 40}`} stroke="#2a1a0c" strokeWidth={2 + r() * 3} opacity={0.35} fill="none" />)}
          {/* the report sheet */}
          <g transform="rotate(-2 540 960)">
            <rect x={96} y={276} width={890} height={1390} fill="#000" opacity={0.35} />
            <rect x={80} y={258} width={890} height={1390} fill={PAPER} />
            <rect x={80} y={258} width={890} height={1390} fill="none" stroke="#cdbf9e" strokeWidth={3} />
            {Array.from({length: 40}, (_, i) => <circle key={i} cx={100 + r() * 850} cy={280 + r() * 1350} r={2 + r() * 6} fill="#c9b78e" opacity={0.25} />)}
            <text x={525} y={350} textAnchor="middle" fontFamily={TYPE} fontWeight={700} fontSize={42} fill={INK}>ВОЕННО-МОРСКИЕ СИЛЫ США</text>
            <text x={525} y={402} textAnchor="middle" fontFamily={TYPE} fontWeight={700} fontSize={32} fill={INK} opacity={0.85}>КОМИССИЯ ПО РАССЛЕДОВАНИЮ</text>
            <path d="M 130 440 L 920 440 M 130 448 L 920 448" stroke={INK} strokeWidth={3} opacity={0.7} />
            <text x={140} y={530} fontFamily={TYPE} fontWeight={700} fontSize={46} fill={INK}>ДЕЛО: «РЕЙС 19»</text>
            {[
              ['Дата:    5 декабря 1945', 600], ['Пропали: 5 торпедоносцев,', 660], ['         14 человек', 710],
              ['Спасатель PBM «Маринер»,', 770], ['         13 человек', 820], ['Обломки: НЕ НАЙДЕНЫ', 890],
            ].map(([s, y], i) => <Typed key={i} x={140} y={y as number} text={s as string} n={99} size={32} seed={30 + i} />)}
            <path d="M 130 940 L 920 940" stroke={INK} strokeWidth={3} opacity={0.6} />
            <text x={140} y={1010} fontFamily={TYPE} fontWeight={700} fontSize={42} fill={INK}>ЗАКЛЮЧЕНИЕ:</text>
            <Typed x={lineX} y={l1y} text={CONCLUSION[0]} n={c1} size={40} seed={7} />
            <Typed x={lineX} y={l2y} text={CONCLUSION[1]} n={c2} size={40} seed={8} />
            {caretOn && <rect x={caretX + 2} y={caretY + 8} width={22} height={5} fill={INK} opacity={0.8} />}
            {/* red pencil strike-through */}
            {[[l1y - 14, st1, CONCLUSION[0].length], [l2y - 14, st2, CONCLUSION[1].length]].map(([y, k, len], i) => {
              const w = (len as number) * cw + 20, L0 = w + 40;
              return (k as number) > 0 && (
                <path key={i} d={`M ${lineX - 10} ${(y as number) + 6} C ${lineX + w * 0.3} ${(y as number) - 8} ${lineX + w * 0.6} ${(y as number) + 12} ${lineX + w} ${(y as number) - 4}`}
                  stroke={RED} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray={L0} strokeDashoffset={L0 * (1 - (k as number))} opacity={0.92} />
              );
            })}
            <text x={140} y={1560} fontFamily={TYPE} fontWeight={700} fontSize={28} fill={INK} opacity={0.8}>Председатель комиссии</text>
            <path d="M 560 1562 L 900 1562" stroke={INK} strokeWidth={2} opacity={0.7} />
            <path d="M 600 1550 C 640 1500 660 1580 700 1530 C 730 1500 760 1570 800 1540" stroke="#26306e" strokeWidth={5} fill="none" opacity={0.8} />
            {/* Taylor's photo, paper-clipped, sepia */}
            <g transform="translate(690 470) rotate(4)">
              <rect x={-8} y={-8} width={216} height={266} fill="#f6f1e4" stroke="#bdb196" strokeWidth={2} />
              <g clipPath="url(#photoClip)" filter="url(#sepia)">
                <rect x={0} y={0} width={200} height={250} fill="#9aa3a8" />
                <g transform="translate(100 925) scale(0.52)"><TaylorS s={{...TAYLOR_REST, t: 0, smile: 0.5}} light={{bright: 1, warmRim: 0, coldRim: 0, cold: 0}} id="photo" /></g>
              </g>
              <path d="M 150 -30 L 150 60 C 150 80 180 80 180 60 L 180 -20 C 180 -40 160 -40 160 -20 L 160 50" stroke="#8d9196" strokeWidth={7} fill="none" strokeLinecap="round" />
            </g>
          </g>
          {/* the envelope from Taylor's mother */}
          {env > 0 && (
            <g transform={`translate(${lerp(1300, 560, env)} ${lerp(1700, 1430, env)}) rotate(${lerp(18, 7, env)})`}>
              <rect x={10} y={14} width={470} height={290} fill="#000" opacity={0.35} />
              <rect x={0} y={0} width={470} height={290} fill="#e9dcc0" stroke="#bba981" strokeWidth={3} />
              <path d="M 0 0 L 235 150 L 470 0" stroke="#bba981" strokeWidth={3} fill="none" />
              <rect x={370} y={20} width={78} height={92} fill="#7aa0c4" stroke="#fff" strokeWidth={5} strokeDasharray="6 4" />
              <text x={40} y={200} fontFamily={HAND} fontWeight={700} fontSize={40} fill="#26306e">Командованию ВМС США</text>
              <text x={40} y={256} fontFamily={HAND} fontWeight={700} fontSize={34} fill="#26306e">от матери лейт. Ч. Тейлора</text>
            </g>
          )}
          {/* the rubber stamp */}
          {fall > 0 && (
            <g transform={`translate(525 1165) rotate(-9) scale(${hit ? 1 + Math.max(0, 0.06 - sinceHit * 0.4) : lerp(2.4, 1.05, fall * fall)})`} opacity={hit ? 1 : 0.35 + fall * 0.5}>
              <g filter="url(#rough)">
                <rect x={-380} y={-130} width={760} height={260} rx={18} fill="none" stroke={RED} strokeWidth={16} />
                <rect x={-356} y={-106} width={712} height={212} rx={10} fill="none" stroke={RED} strokeWidth={5} />
                <text x={0} y={-12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={RED} letterSpacing={6}>ПРИЧИНЫ</text>
                <text x={0} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={RED} letterSpacing={4}>НЕИЗВЕСТНЫ</text>
              </g>
            </g>
          )}
          {/* dust puff on impact */}
          {hit && sinceHit < 0.7 && Array.from({length: 14}, (_, i) => {
            const a = (i / 14) * Math.PI * 2, d = 380 + easeOut(clamp(sinceHit / 0.7)) * 160;
            return <circle key={i} cx={525 + Math.cos(a) * d} cy={1165 + Math.sin(a) * d * 0.4} r={18 + i % 3 * 8} fill="#d9cbaa" opacity={0.35 * (1 - sinceHit / 0.7)} />;
          })}
        </g>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#rlamp)" />
        {hit && sinceHit < 0.12 && <rect x={0} y={0} width={1080} height={1920} fill="#fff" opacity={0.25 * (1 - sinceHit / 0.12)} />}
      </svg>
    </AbsoluteFill>
  );
};

