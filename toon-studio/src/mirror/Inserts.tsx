// 2D inserts for «Отражение опаздывает» (1080×1920 SVG): the tear-off calendar, the shop window at night,
// the dark phone screen, the two moles, and the small «задержка» tag that shows how late the reflection is.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';
import {Anya, AnyaState} from './Anya';
import {TemaLight} from '../horror/Tema';

const W = 1080, H = 1920;

// ---------- the delay tag (top of the frame, like a stopwatch) ----------
export const DelayTag: React.FC<{text: string; on: number; red?: boolean}> = ({text, on, red}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: clamp(on)}}>
    <g transform="translate(540 300)">
      <rect x={-210} y={-52} width={420} height={104} rx={52} fill="#0b0d12" opacity={0.78} stroke={red ? '#ff3a3a' : '#cfd8ea'} strokeWidth={4} />
      <circle cx={-150} cy={0} r={22} fill="none" stroke={red ? '#ff3a3a' : '#cfd8ea'} strokeWidth={5} />
      <path d="M -150 0 L -150 -14 M -150 0 L -140 6" stroke={red ? '#ff3a3a' : '#cfd8ea'} strokeWidth={5} strokeLinecap="round" />
      <text x={30} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={red ? '#ff3a3a' : '#f2f0f6'}>{text}</text>
    </g>
  </svg>
);

// ---------- the tear-off calendar ----------
// day: the number on the top page (fractional = the page flying off); errs: «ошибок» under the date (undefined = none)
export const CalendarInsert: React.FC<{day: number; errs?: number; k: number; t: number}> = ({day, errs, k, t}) => {
  const d0 = Math.floor(day), fly = day - d0;
  const WD = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
  const page = (d: number, dy = 0, rot = 0, op = 1) => (
    <g transform={`translate(540 ${960 + dy}) rotate(${rot})`} opacity={op}>
      <rect x={-300} y={-360} width={600} height={720} rx={18} fill="#f4f0e6" stroke="#14121c" strokeWidth={8} />
      <rect x={-300} y={-360} width={600} height={150} rx={18} fill="#c0302a" stroke="#14121c" strokeWidth={8} />
      <text x={0} y={-262} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill="#fff">НОЯБРЬ</text>
      <text x={0} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={300} fill="#1c1c28">{d}</text>
      <text x={0} y={230} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={64} fill="#5a5a66">{WD[(d + 6) % 7]}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #c9d6dc 0%, #6a7c86 80%)'}}>
      <svg width={W} height={H}>
        <g transform={`translate(540 960) scale(${lerp(1, 1.08, k)}) translate(-540 -960)`}>
          {[-260, -130, 0, 130, 260].map((x) => <circle key={x} cx={540 + x} cy={600} r={14} fill="#14121c" />)}
          {page(d0 + 1)}
          {fly > 0.01 ? page(d0, -fly * 700, -fly * 40, 1 - fly) : page(d0)}
        </g>
        {errs !== undefined && (
          <g transform="translate(540 1520)">
            <rect x={-330} y={-80} width={660} height={160} rx={30} fill="#0b0d12" opacity={0.85} stroke={errs === 0 ? '#ff3a3a' : '#cfd8ea'} strokeWidth={5} />
            <text x={0} y={28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={errs === 0 ? '#ff3a3a' : '#f2f0f6'}>{`ОШИБОК: ${errs}`}</text>
          </g>
        )}
        {void t}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the shop window at night ----------
// Anya from behind in front of the glass; her reflection faint inside it, lagging behind her by `lag` seconds
export const ShopWindowInsert: React.FC<{k: number; t: number; a: (t: number) => AnyaState; lag: number; light: TemaLight}> = ({k, t, a, lag, light}) => {
  const r = mulberry32(7);
  const s = lerp(1, 1.1, k);
  return (
    <AbsoluteFill style={{background: '#07080c'}}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="shopIn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2a2430" /><stop offset="1" stopColor="#141016" /></linearGradient>
          <clipPath id="shopGlass"><rect x={120} y={360} width={840} height={980} /></clipPath>
        </defs>
        <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
          {/* the facade */}
          <rect x={0} y={0} width={W} height={H} fill="#1c1e26" />
          {Array.from({length: 40}, (_, i) => <rect key={i} x={r() * W} y={r() * 300} width={60 + r() * 120} height={6} fill="#262832" />)}
          <rect x={90} y={230} width={900} height={110} fill="#3a1418" stroke="#14121c" strokeWidth={8} />
          <text x={540} y={312} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill="#ff5a6a" opacity={0.85 + 0.15 * Math.sin(t * 20)}>ОДЕЖДА</text>
          <rect x={110} y={350} width={860} height={1000} fill="url(#shopIn)" stroke="#5a5e6a" strokeWidth={16} />
          {/* dim mannequins inside */}
          {[260, 820].map((x) => (
            <g key={x} opacity={0.5}>
              <ellipse cx={x} cy={600} rx={50} ry={60} fill="#4a4450" />
              <path d={`M ${x - 90} 700 L ${x + 90} 700 L ${x + 70} 1150 L ${x - 70} 1150 Z`} fill="#3c3644" />
            </g>
          ))}
          {/* the reflection in the glass: mirrored, faint, cold, late */}
          <g clipPath="url(#shopGlass)" opacity={0.55} style={{mixBlendMode: 'screen'}}>
            <g transform="translate(540 1600) scale(-0.62 0.62)">
              <Anya s={{...a(t - lag), uncanny: 0.35}} light={{...light, cold: 0.6}} id="shopR" outfit="street" />
            </g>
          </g>
          <rect x={120} y={360} width={840} height={980} fill="#9fc0d8" opacity={0.06} />
          {/* the street: wet asphalt, a lamp's glow */}
          <rect x={0} y={1350} width={W} height={H - 1350} fill="#14161c" />
          <ellipse cx={540} cy={1500} rx={500} ry={70} fill="#ff5a6a" opacity={0.08} />
        </g>
        {/* Anya from behind, in front of the window */}
        <g transform="translate(540 2050) scale(0.82)">
          <Anya s={a(t)} light={light} id="shopA" outfit="street" view="back" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the dark phone screen: her face in it, late ----------
export const PhoneInsert: React.FC<{k: number; t: number; a: (t: number) => AnyaState; lag: number; light: TemaLight}> = ({k, t, a, lag, light}) => {
  const pw = 660, ph = 1300, px = (W - pw) / 2, py = 330;
  const s = lerp(1, 1.12, k);
  const shake = Math.sin(t * 9) * 3;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #232a36 0%, #07090c 75%)'}}>
      <svg width={W} height={H}>
        <defs><clipPath id="pscr"><rect x={px + 22} y={py + 22} width={pw - 44} height={ph - 44} rx={46} /></clipPath></defs>
        <g transform={`translate(${540 + shake} 960) scale(${s}) translate(-540 -960)`}>
          <rect x={px} y={py} width={pw} height={ph} rx={70} fill="#14151a" stroke="#3a3c46" strokeWidth={6} />
          <g clipPath="url(#pscr)">
            <rect x={px} y={py} width={pw} height={ph} fill="#050608" />
            <g opacity={0.5} style={{mixBlendMode: 'screen'}} transform={`translate(540 ${py + 1950}) scale(-1.05 1.05)`}>
              <Anya s={{...a(t - lag), uncanny: 0.45}} light={{...light, cold: 0.7}} id="phR" crop={-900} />
            </g>
            <path d={`M ${px} ${py + 200} L ${px + pw} ${py + 40}`} stroke="#fff" strokeWidth={60} opacity={0.05} />
          </g>
          {[-1, 1].map((sd) => (
            <ellipse key={sd} cx={540 + sd * 360} cy={py + ph - 260} rx={80} ry={140} fill="#f2c9ad" stroke="#14121c" strokeWidth={7} transform={`rotate(${sd * 18} ${540 + sd * 360} ${py + ph - 260})`} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the two moles: «было» (left) / «сейчас» (right) ----------
export const MolesInsert: React.FC<{t: number; k: number; light: TemaLight; base: AnyaState}> = ({t, k, light, base}) => {
  const ring = (cx: number, cy: number, on: number) => (
    <ellipse cx={cx} cy={cy} rx={70} ry={60} fill="none" stroke="#ff3a3a" strokeWidth={10} opacity={on} strokeDasharray={`${on * 420} 420`} />
  );
  return (
    <AbsoluteFill style={{background: '#0b0d12'}}>
      <svg width={W} height={H}>
        <defs>
          <clipPath id="mTop"><rect x={0} y={0} width={W} height={950} /></clipPath>
          <clipPath id="mBot"><rect x={0} y={970} width={W} height={950} /></clipPath>
        </defs>
        <g clipPath="url(#mTop)">
          <rect width={W} height={950} fill="#2a3036" />
          <g transform="translate(540 1830) scale(1.25)"><Anya s={{...base, happy: 0.4}} light={light} id="mo1" mole={-1} crop={-950} /></g>
          {ring(540 - 150 * 1.25, 1830 + (-1225 + 104) * 1.25, clamp(k * 3))}
          <text x={60} y={110} fontFamily={FONT} fontWeight={900} fontSize={66} fill="#f2f0f6">РАНЬШЕ</text>
        </g>
        <g clipPath="url(#mBot)">
          <rect y={970} width={W} height={950} fill="#2a3036" />
          <g transform="translate(540 2800) scale(1.25)"><Anya s={{...base, smile: 0.35 + 0.1 * Math.sin(t), uncanny: 0.2}} light={light} id="mo2" mole={1} crop={-950} /></g>
          {ring(540 + 150 * 1.25, 2800 + (-1225 + 104) * 1.25, clamp(k * 3 - 1))}
          <text x={60} y={1080} fontFamily={FONT} fontWeight={900} fontSize={66} fill="#ff3a3a">СЕЙЧАС</text>
        </g>
        <rect x={0} y={950} width={W} height={20} fill="#0b0d12" />
      </svg>
    </AbsoluteFill>
  );
};
