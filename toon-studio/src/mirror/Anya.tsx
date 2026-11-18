// Anya, 21: the heroine of «Отражение опаздывает». Same doll family as Tyoma, Alisa, Dima and Kostya (big head, huge
// eyes, thin neck), built on Alisa's rig: a blonde bob, a mole on one cheek, lilac pyjamas at home or a green jacket
// with a long yellow scarf outside. `uncanny` (0..1) turns her into the reflection that learns to be her: colder skin,
// tiny pupils, no eye shine, a too-wide smile. `variant: 'liza'` is her friend Liza (dark bun, glasses, navy sweater).
// The reflection is drawn mirrored by the scene (scale(-1 1)), so the mole and the scarf flip by themselves.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

const BASE = {
  skin: '#f2c9ad', skinShade: '#d7a28a', skinDark: '#ba836d', blush: '#ea958a',
  hair: '#e0b45e', hairLight: '#f5d995', brow: '#a8782f',
  pants: '#262b3d', pantsLight: '#343b54', shoe: '#e4e0da', sole: '#3a3640',
  eyeWhite: '#f4f1ec', iris: '#4f7d9a', irisDark: '#2c4c62', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
  ink: '#14121c', mole: '#5a3424', scarf: '#f2c230', scarfShade: '#c99a1a', frame: '#2a2230',
};
const OUTFIT = {
  pajama: {top: '#b8a3d8', topShade: '#9581b9', topLight: '#cdbde8', cuff: '#9a86bc', dots: '#efe8f8', pants: '#a994cc', pantsLight: '#c0aee0', shoe: '#f0d6e0', sole: '#c9a8b8'},
  street: {top: '#3f6b4a', topShade: '#2d5037', topLight: '#57885f', cuff: '#2f5238', dots: '', pants: '#262b3d', pantsLight: '#343b54', shoe: '#e4e0da', sole: '#3a3640'},
  liza: {top: '#34416e', topShade: '#263155', topLight: '#4a5a90', cuff: '#2a355c', dots: '', pants: '#2a2a30', pantsLight: '#3a3a44', shoe: '#2b2b30', sole: '#d8d5cf'},
};
const LIZA = {hair: '#2b1d18', hairLight: '#4e3a30', brow: '#2b1d18', iris: '#6b4a2e', irisDark: '#3e2a18', skin: '#e9bc9a', skinShade: '#cc977a', skinDark: '#ad7a60'};
const COLD = {skin: '#d6cfd2', skinShade: '#b4aab0', skinDark: '#968c94', blush: '#bfa6ac'};

export type AnyaState = {
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1 left .. 1 right (screen)
  lookY: number;   // -1 up .. 1 down
  fear: number;    // 0 calm .. 1 terrified
  mouth: number;   // 0 closed .. 1 open (speech / gasp)
  smile: number;   // 0 .. 1 the reflection's flat wide smile
  happy?: number;  // 0 .. 1 Anya's own small warm smile
  uncanny: number; // 0 Anya .. 1 the reflection
  breathe: number; // -1..1
  hands: number;   // 0 hands down .. 1 palms up at the chest (a palm on the glass)
  brush?: number;  // 0..1 the right hand brushes the teeth
  wave?: number;   // 0..1 the right hand waves
  phone?: number;  // 0..1 holds a phone at the chest
  turn: number;    // -1..1 head turn
  tremble: number; // px of shiver
  sit?: number;    // 0 standing .. 1 sitting on the floor, knees up
  t: number;
};

export const ANYA_REST: AnyaState = {blink: 1, lookX: 0, lookY: 0, fear: 0, mouth: 0, smile: 0, uncanny: 0, breathe: 0, hands: 0, turn: 0, tremble: 0, t: 0};

export type AnyaOpts = {
  outfit?: 'pajama' | 'street';
  variant?: 'anya' | 'liza';
  mole?: -1 | 1 | 0;   // screen side of the mole (Anya: -1); 0 = none
  brushColor?: string; // Anya pink, the reflection's glass holds a blue one
};

const OW = 7;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};

const TORSO = 'M -170 -962 C -214 -950 -228 -895 -224 -815 L -212 -478 C -145 -458 145 -458 212 -478 L 224 -815 C 228 -895 214 -950 170 -962 C 105 -984 -105 -984 -170 -962 Z';
const HEAD = 'M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z';
// Anya: a longer bob down to the chin, a soft side-swept fringe (parted on the screen-right)
const BOB_BACK = 'M -270 -1000 C -296 -1240 -256 -1474 0 -1530 C 256 -1474 296 -1240 270 -1000 C 210 -980 140 -996 100 -1010 L -100 -1010 C -140 -996 -210 -980 -270 -1000 Z';
const BOB_FRONT = 'M -266 -1004 C -280 -1200 -262 -1424 -120 -1496 C -40 -1528 40 -1528 120 -1496 C 262 -1424 280 -1200 266 -1004 L 206 -1020 C 212 -1140 216 -1250 196 -1320 C 150 -1380 90 -1396 60 -1392 C 0 -1330 -90 -1300 -196 -1300 C -214 -1240 -212 -1140 -206 -1020 Z';
// Liza: hair pulled back, a bun on top
const LIZA_BACK = 'M -236 -1150 C -250 -1300 -226 -1460 0 -1500 C 226 -1460 250 -1300 236 -1150 C 180 -1120 -180 -1120 -236 -1150 Z';
const LIZA_FRONT = 'M -230 -1190 C -238 -1330 -200 -1450 -60 -1490 C 0 -1504 60 -1504 120 -1488 C 222 -1450 240 -1330 230 -1190 C 220 -1260 200 -1340 150 -1380 C 80 -1420 -60 -1424 -150 -1380 C -200 -1340 -222 -1260 -230 -1190 Z';

export const Anya: React.FC<{s: AnyaState; light: TemaLight; id?: string; crop?: number; view?: 'front' | 'back'} & AnyaOpts> = (props) => {
  const {s, light, id = 'anya', crop, view = 'front', outfit = 'pajama', variant = 'anya'} = props;
  const liza = variant === 'liza';
  const mole = props.mole ?? (liza ? 0 : -1);
  const u = clamp(s.uncanny);
  const O = OUTFIT[liza ? 'liza' : outfit];
  const B0 = liza ? {...BASE, ...LIZA} : BASE;
  const L = {...B0, ...O, skin: mix(B0.skin, COLD.skin, u), skinShade: mix(B0.skinShade, COLD.skinShade, u),
    skinDark: mix(B0.skinDark, COLD.skinDark, u), blush: mix(B0.blush, COLD.blush, u)};
  const scarf = !liza && outfit === 'street';
  if (view === 'back') return <AnyaBack s={s} light={light} id={id} crop={crop} L={L} liza={liza} scarf={scarf} />;
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const headY = -1225 + b * 0.6;
  const tx = s.turn * 26, hx = tr * 0.6;
  const sit = clamp(s.sit ?? 0);
  const brush = clamp(s.brush ?? 0), wave = clamp(s.wave ?? 0), phone = clamp(s.phone ?? 0);
  const hk = Math.max(clamp(s.hands), phone);

  const eye = (side: number) => {
    const cx = side * 88 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 14;
    const rx = 66 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 80 * (1 + 0.06 * s.fear);
    const irisR = 40 * (1 - 0.22 * s.fear) * (1 - 0.12 * u), pupR = 19 * (1 - 0.5 * s.fear) * (1 - 0.55 * u);
    const lookY = phone > 0.5 ? Math.max(s.lookY, 0.7) : s.lookY;
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + lookY * (ry - irisR - 10);
    const open = clamp(s.blink);
    const lidY = cy - ry + (1 - open) * ry * 2;
    const clip = `${id}-eye${side}`;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={mix(L.eyeWhite, '#e2e0dc', u)} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
          <circle cx={ix} cy={iy} r={irisR} fill={mix(L.iris, '#2e3a40', u)} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={7} />
          <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
          {u < 0.5 && <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={10} fill="#fff" />}
          {u < 0.5 && <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={L.ink} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={L.ink} strokeWidth={OW} />
        {open > 0.15 && [0, 1, 2].map((k) => {
          const a = (-0.62 + k * 0.24) * Math.PI / 2;
          const px = cx + side * Math.cos(a) * rx * 0.98, py = Math.max(lidY, cy + Math.sin(a) * ry * 0.98);
          return <path key={k} d={`M ${px} ${py} l ${side * (18 + k * 4)} ${-16 + k * 8}`} stroke={L.ink} strokeWidth={8} strokeLinecap="round" />;
        })}
      </g>
    );
  };
  const brow = (side: number) => {
    const f = s.fear;
    const ix = side * 40 + tx + hx, ox = side * 140 + tx + hx;
    const iy = headY - 92 - 34 * f, oy = headY - 98 + 16 * f;
    const mx = lerp((ix + ox) / 2, ix + (ox - ix) * 0.3, f), my = lerp(Math.min(iy, oy) - 12, iy - 6, f);
    const d = `M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`;
    return (
      <g key={`b${side}`}>
        <path d={d} stroke={L.skinShade} strokeWidth={27} strokeLinecap="round" fill="none" />
        <path d={d} stroke={L.brow} strokeWidth={15} strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // arms: hands down / palms at the chest, the right one can brush the teeth or wave
  const arm = (side: number) => {
    const sh = {x: side * 176, y: -925 + b};
    const rest = {x: side * 228, y: -560};
    const up = {x: side * 120 + tx * 0.6, y: phone > 0.5 ? -860 : -900};
    let hand = {x: lerp(rest.x, up.x, hk) + tr, y: lerp(rest.y, up.y, hk) + tr * 0.5};
    let mid = {x: lerp(side * 222, side * 250, hk) + tr * 0.5, y: lerp(-735, -760, hk) + b};
    if (side === 1 && brush > 0) {
      const wob = Math.sin(s.t * 18) * 14 * brush;
      hand = {x: lerp(hand.x, 120 + tx + wob, brush), y: lerp(hand.y, headY + 175, brush)};
      mid = {x: lerp(mid.x, 300, brush), y: lerp(mid.y, -800, brush)};
    }
    if (side === 1 && wave > 0) {
      const sw = Math.sin(s.t * 9) * 40 * wave;
      hand = {x: lerp(hand.x, 330 + sw, wave), y: lerp(hand.y, -1230, wave)};
      mid = {x: lerp(mid.x, 330, wave), y: lerp(mid.y, -960, wave)};
    }
    const d = `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, hand.x, 0.5) + side * 10} ${lerp(mid.y, hand.y, 0.5)} ${hand.x} ${hand.y}`;
    return {d, end: hand};
  };
  const aL = arm(-1), aR = arm(1);
  const front = (side: number) => hk >= 0.5 || (side === 1 && (brush > 0.4 || wave > 0.4));
  const armW = (side: number) => { const a = arm(side); return {d: a.d, end: {x: a.end.x, y: a.end.y + 446 * sit}}; };
  const sleeve = (a: {d: string}) => (
    <>
      <path d={a.d} stroke={L.ink} strokeWidth={72 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={L.top} strokeWidth={72} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
  const hand = (a: {end: {x: number; y: number}}, side: number) => {
    const {x, y} = a.end;
    const raised = hk > 0.5 || (side === 1 && (brush > 0.5 || wave > 0.5));
    const rot = side === 1 && brush > 0.5 ? -70 : lerp(side * 10, side * -12, hk);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {side === 1 && brush > 0.5 && (
          <g>
            <rect x={-10} y={-150} width={20} height={150} rx={9} fill={props.brushColor ?? '#e8588a'} stroke={L.ink} strokeWidth={5} />
            <rect x={-14} y={-176} width={28} height={34} rx={5} fill="#f4f4f6" stroke={L.ink} strokeWidth={4} />
          </g>
        )}
        <ellipse cx={0} cy={-30} rx={32} ry={20} fill={L.cuff} stroke={L.ink} strokeWidth={OW} />
        <ellipse cx={0} cy={6} rx={37} ry={43} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
        {[-22, -7, 8, 23].map((fx, i) => (
          <rect key={i} x={fx - 8} y={raised ? -60 + Math.abs(fx) * 0.4 : 28} width={16} height={raised ? 46 : 40} rx={8}
            fill={L.skin} stroke={L.ink} strokeWidth={OW * 0.8} />
        ))}
      </g>
    );
  };

  const mo = clamp(s.mouth), sm = clamp(s.smile), hp = clamp(s.happy ?? 0);
  const mx = tx * 0.9 + hx, my = headY + 132;
  const smileW = lerp(30, 118, sm);

  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <radialGradient id={`${id}-faceShade`} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1030" stopOpacity={0.45} />
        </radialGradient>
        <linearGradient id={`${id}-down`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id={`${id}-bodyShade`} x1="0" x2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.45} />
          <stop offset="0.45" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.25} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>
        <g transform={`scale(1 ${1 - 0.92 * sit})`} opacity={sit > 0.75 ? 0 : 1}>
        <path d="M -160 -485 L -140 -60 L -32 -60 L -18 -485 Z M 160 -485 L 140 -60 L 32 -60 L 18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M -112 -470 L -102 -80" stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
        <path d="M -160 -485 L -140 -60 L -32 -60 L -18 -485 Z M 160 -485 L 140 -60 L 32 -60 L 18 -485 Z" fill={`url(#${id}-down)`} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 22} -12 L ${sd * 22} -56 C ${sd * 60} -84 ${sd * 150} -76 ${sd * 172} -30 L ${sd * 176} -12 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d={`M ${sd * 18} -4 L ${sd * 182} -4 L ${sd * 180} -20 L ${sd * 20} -20 Z`} fill={L.sole} stroke={L.ink} strokeWidth={OW * 0.8} />
          </g>
        ))}
        </g>
        <g transform={`translate(0 ${446 * sit})`}>
        {!front(-1) && sleeve(aL)}
        {!front(1) && sleeve(aR)}
        {/* torso: pyjama top with dots / the green jacket with a zip / Liza's sweater */}
        <g transform={`translate(0 ${b * 0.5}) scale(${1 + s.breathe * 0.008} 1)`}>
          <path d={TORSO} fill={L.top} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {L.dots && [[-120, -880], [-40, -820], [60, -870], [140, -800], [-150, -720], [-60, -660], [40, -720], [130, -640], [-110, -560], [80, -560]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={13} fill={L.dots} opacity={0.85} />
          ))}
          {!liza && outfit === 'street' && (
            <>
              <path d="M 0 -960 L 0 -478" stroke={L.ink} strokeWidth={6} />
              <path d="M -150 -760 L -60 -760 M 150 -760 L 60 -760" stroke={L.topShade} strokeWidth={10} strokeLinecap="round" />
            </>
          )}
          {liza && <path d="M -200 -600 C -100 -580 100 -580 200 -600" stroke={L.topLight} strokeWidth={14} fill="none" opacity={0.6} />}
          <path d="M -194 -505 C -116 -488 116 -488 194 -505" stroke={L.cuff} strokeWidth={26} fill="none" />
          <path d={TORSO} fill={`url(#${id}-bodyShade)`} />
          <path d={TORSO} fill={`url(#${id}-down)`} opacity={0.7} />
          <path d="M -140 -975 C -112 -925 112 -925 140 -975 C 112 -1005 -112 -1005 -140 -975 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW} />
        </g>
        {/* hair, back layer */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + tr * 0.05} 0 -1100)`}>
          <path d={liza ? LIZA_BACK : BOB_BACK} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {liza && <circle cx={0} cy={-1560} r={92} fill={L.hair} stroke={L.ink} strokeWidth={OW} />}
          {liza && <path d="M -50 -1600 C -10 -1630 40 -1620 60 -1590" stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" />}
        </g>
        <rect x={-40 + hx * 0.5} y={headY + 170} width={80} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        {/* the long yellow scarf: wrapped round the neck, one end hangs on the screen-left */}
        {scarf && (
          <g>
            <path d="M -150 -1000 C -160 -930 160 -930 150 -1000 C 150 -1050 -150 -1050 -150 -1000 Z" fill={L.scarf} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d="M -130 -960 C -60 -940 60 -940 130 -960" stroke={L.scarfShade} strokeWidth={12} fill="none" />
            <path d={`M -120 -960 C -140 -860 -130 -760 ${-118 + tr * 0.3} -640 L ${-40 + tr * 0.3} -640 C -48 -760 -50 -860 -40 -950 Z`} fill={L.scarf} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            {[-110, -95, -80, -65, -50].map((x) => <path key={x} d={`M ${x + tr * 0.3} -640 l 0 34`} stroke={L.scarfShade} strokeWidth={9} strokeLinecap="round" />)}
          </g>
        )}
        {/* head */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + tr * 0.05} 0 -1100)`}>
          <path d={HEAD} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d={HEAD} fill={`url(#${id}-faceShade)`} />
          <ellipse cx={-128 + tx} cy={-1100} rx={40} ry={20} fill={L.blush} opacity={0.4 + 0.2 * hp} />
          <ellipse cx={128 + tx} cy={-1100} rx={40} ry={20} fill={L.blush} opacity={0.4 + 0.2 * hp} />
          {mole !== 0 && <circle cx={mole * 150 + tx} cy={headY + 104} r={9} fill={L.mole} />}
          {eye(-1)}{eye(1)}
          {liza && [-1, 1].map((sd) => (
            <ellipse key={sd} cx={sd * 88 + tx + hx} cy={headY + 14} rx={84} ry={92} fill="none" stroke={L.frame} strokeWidth={12} />
          ))}
          {liza && <path d={`M ${-8 + tx} ${headY + 4} Q ${tx} ${headY - 8} ${8 + tx} ${headY + 4}`} stroke={L.frame} strokeWidth={10} fill="none" />}
          <path d={`M ${tx * 1.1 - 8} ${headY + 70} Q ${tx * 1.1 + 6} ${headY + 88} ${tx * 1.1 + 16} ${headY + 74}`} stroke={L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* mouth: speech/gasp, Anya's small smile, or the reflection's flat wide smile */}
          {sm < 0.05 ? (
            hp > 0.05 && mo < 0.2 ? (
              <path d={`M ${mx - 34 - 10 * hp} ${my - 6} Q ${mx} ${my + 26 * hp} ${mx + 34 + 10 * hp} ${my - 6}`} stroke={L.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx={mx} cy={my} rx={16 + 10 * mo} ry={4 + 24 * mo} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} />
                {mo > 0.3 && <rect x={mx - 11 - 6 * mo} y={my - 4 - 24 * mo + 4} width={22 + 12 * mo} height={8} rx={4} fill={L.teeth} />}
              </>
            )
          ) : (
            <g>
              <path d={`M ${mx - smileW} ${my - 40 * sm} Q ${mx} ${my + 70 * sm + 30 * mo} ${mx + smileW} ${my - 40 * sm} Q ${mx} ${my + 6 * sm} ${mx - smileW} ${my - 40 * sm} Z`}
                fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              {sm > 0.4 && <path d={`M ${mx - smileW * 0.9} ${my - 31 * sm} Q ${mx} ${my + 12 * sm} ${mx + smileW * 0.9} ${my - 31 * sm} L ${mx + smileW * 0.8} ${my - 12 * sm} Q ${mx} ${my + 34 * sm} ${mx - smileW * 0.8} ${my - 12 * sm} Z`} fill={L.teeth} stroke={L.ink} strokeWidth={3} />}
              {sm > 0.4 && [-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
                <path key={k} d={`M ${mx + k * smileW} ${my - 8 * sm + Math.abs(k) * -20 * sm} l 0 ${22 * sm}`} stroke={L.ink} strokeWidth={3} opacity={0.6} />
              ))}
            </g>
          )}
          {/* hair, front layer */}
          <path d={liza ? LIZA_FRONT : BOB_FRONT} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {!liza && <path d="M -170 -1330 C -100 -1360 -20 -1380 50 -1420" stroke={L.hairLight} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.8} />}
          <path d="M -150 -1440 C -80 -1490 50 -1494 130 -1452" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
          {!liza && <path d="M 230 -1300 C 246 -1200 246 -1100 236 -1030" stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5} />}
          {brow(-1)}{brow(1)}
        </g>
        </g>
        {sit > 0.6 && (
          <g opacity={clamp((sit - 0.6) / 0.25)}>
            {[-1, 1].map((sd) => (
              <g key={sd}>
                <path d={`M ${sd * 30} -40 L ${sd * 20} -470 C ${sd * 30} -560 ${sd * 160} -560 ${sd * 170} -470 L ${sd * 175} -40 Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
                <path d={`M ${sd * 22} -470 C ${sd * 30} -540 ${sd * 160} -540 ${sd * 168} -470`} stroke={L.pantsLight} strokeWidth={12} fill="none" opacity={0.6} />
                <path d={`M ${sd * 20} -6 L ${sd * 20} -60 C ${sd * 60} -84 ${sd * 160} -76 ${sd * 185} -30 L ${sd * 188} -6 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
              </g>
            ))}
            <path d="M 30 -40 L 20 -470 C 30 -560 160 -560 170 -470 L 175 -40 Z M -30 -40 L -20 -470 C -30 -560 -160 -560 -170 -470 L -175 -40 Z" fill={`url(#${id}-down)`} />
            {hand(armW(-1), -1)}{hand(armW(1), 1)}
          </g>
        )}
        <g transform={`translate(0 ${446 * sit})`}>
        {front(-1) && sleeve(aL)}
        {front(1) && sleeve(aR)}
        {phone > 0.05 && (
          <g opacity={phone} transform={`translate(${tx * 0.6} -900) rotate(-8)`}>
            <rect x={-62} y={-110} width={124} height={210} rx={18} fill="#16161c" stroke={L.ink} strokeWidth={OW} />
            <rect x={-50} y={-96} width={100} height={182} rx={10} fill="#3c4a66" />
          </g>
        )}
        {sit <= 0.6 && <>{hand(aL, -1)}{hand(aR, 1)}</>}
        </g>
      </g>
    </g>
  );
};

// from behind: the hair, the scarf end over the back
const AnyaBack: React.FC<{s: AnyaState; light: TemaLight; id: string; crop?: number; L: Record<string, string>; liza: boolean; scarf: boolean}> = ({s, light, id, crop, L, liza, scarf}) => {
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const k = clamp(s.hands);
  const arm = (side: number) => {
    const sh = {x: side * 176, y: -925 + b};
    const mid = {x: lerp(side * 222, side * 240, k) + tr * 0.5, y: lerp(-735, -770, k) + b};
    const end = {x: lerp(side * 228, side * 150, k) + tr, y: lerp(-560, -900, k)};
    return `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, end.x, 0.5)} ${lerp(mid.y, end.y, 0.5)} ${end.x} ${end.y}`;
  };
  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <linearGradient id={`${id}-bdown`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.1} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.6} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -160 -485 L -140 -60 L -32 -60 L -18 -485 Z M 160 -485 L 140 -60 L 32 -60 L 18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 24} -6 L ${sd * 24} -64 L ${sd * 160} -64 L ${sd * 166} -6 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        ))}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={arm(sd)} stroke={L.ink} strokeWidth={72 + OW * 2} strokeLinecap="round" fill="none" />
            <path d={arm(sd)} stroke={L.top} strokeWidth={72} strokeLinecap="round" fill="none" />
          </g>
        ))}
        <g transform={`translate(0 ${b * 0.5})`}>
          <path d={TORSO} fill={L.top} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {L.dots && [[-120, -880], [60, -870], [-60, -700], [130, -660], [-110, -560], [80, -560]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={13} fill={L.dots} opacity={0.85} />
          ))}
          <path d={TORSO} fill={`url(#${id}-bdown)`} />
        </g>
        <rect x={-40} y={-1060} width={80} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        {scarf && (
          <g>
            <path d="M -150 -1000 C -160 -950 160 -950 150 -1000 C 150 -1050 -150 -1050 -150 -1000 Z" fill={L.scarf} stroke={L.ink} strokeWidth={OW} />
            <path d="M 40 -980 C 50 -880 60 -780 70 -700 L 140 -700 C 130 -790 120 -890 110 -990 Z" fill={L.scarf} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          </g>
        )}
        <g transform={`translate(0 ${b * 0.6}) rotate(${s.turn * 4 + tr * 0.05} 0 -1100)`}>
          {liza ? (
            <>
              <path d="M -236 -1150 C -250 -1300 -226 -1474 0 -1506 C 226 -1474 250 -1300 236 -1150 C 180 -1060 -180 -1060 -236 -1150 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} />
              <circle cx={0} cy={-1560} r={92} fill={L.hair} stroke={L.ink} strokeWidth={OW} />
            </>
          ) : (
            <path d="M -270 -1000 C -296 -1240 -256 -1474 0 -1530 C 256 -1474 296 -1240 270 -1000 C 180 -976 -180 -976 -270 -1000 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          )}
          <path d="M -150 -1440 C -80 -1490 50 -1494 130 -1452" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </g>
    </g>
  );
};
