// Tyoma, 12: big head, huge eyes, messy hair, navy pyjama hoodie. 2D SVG puppet that lives inside the 3D set:
// it is placed by projecting its feet point with the scene camera, and graded by the scene lights
// (bulb brightness, warm rim from the door behind, cold rim from the moonlit doorway).
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';

export const TEMA_LOOK = {
  skin: '#efc4a6', skinShade: '#d39d84', skinDark: '#b77d68', blush: '#e49a8f',
  hair: '#2b1e19', hairLight: '#4a352c',
  top: '#2a3f73', topShade: '#1d2d55', topLight: '#3a5291', cuff: '#22355f', strings: '#d9dde8',
  pants: '#20294a', pantsLight: '#2c3864', socks: '#8d93a6',
  eyeWhite: '#f4f1ec', iris: '#6a8bb5', irisDark: '#3d5a85', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
  ink: '#14121c',
};

export type TemaState = {
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1 left .. 1 right (screen)
  lookY: number;   // -1 up .. 1 down
  fear: number;    // 0 calm .. 1 terrified
  mouth: number;   // 0 closed .. 1 open
  breathe: number; // -1..1 breathing phase
  hands: number;   // 0 hands down .. 1 palms at the mouth
  turn: number;    // -1..1 head turn (features slide, pseudo 3D)
  tremble: number; // px of shiver
  t: number;
};

export type TemaLight = {bright: number; warmRim: number; coldRim: number; cold: number};

const L = TEMA_LOOK;
const OW = 7;

// crop: keep only what is above this y (e.g. -985 = head only, -470 = waist up); view 'back' = seen from behind
export const Tema: React.FC<{s: TemaState; light: TemaLight; id?: string; crop?: number; view?: 'front' | 'back'}> = ({s, light, id = 'tema', crop, view = 'front'}) => {
  if (view === 'back') return <TemaBack s={s} light={light} id={id} crop={crop} />;
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const headY = -1225 + b * 0.6;
  const tx = s.turn * 26, hx = tr * 0.6;

  // eyes
  const eye = (side: number) => {
    const cx = side * 88 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 10;
    const rx = 64 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 76 * (1 + 0.06 * s.fear);
    const irisR = 38 * (1 - 0.22 * s.fear), pupR = 19 * (1 - 0.5 * s.fear);
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const droop = lerp(0.18, 0, clamp(s.fear * 1.6));                // sleepy upper lid when calm
    const open = clamp(s.blink) * (1 - droop);
    const lidY = cy - ry + (1 - open) * ry * 2;
    const clip = `${id}-eye${side}`;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={L.eyeWhite} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
          <circle cx={ix} cy={iy} r={irisR} fill={L.iris} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={7} />
          <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
          <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={9} fill="#fff" />
          <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={L.ink} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={L.ink} strokeWidth={OW} />
        {/* sleepless bags */}
        <path d={`M ${cx - rx * 0.75} ${cy + ry + 10} Q ${cx} ${cy + ry + 30} ${cx + rx * 0.75} ${cy + ry + 10}`} stroke="#9a6e78" strokeWidth={6} fill="none" opacity={0.55} />
      </g>
    );
  };
  const brow = (side: number) => {
    const f = s.fear;
    const ix = side * 34 + tx + hx, ox = side * 150 + tx + hx;
    const iy = headY - 84 - 46 * f, oy = headY - 90 + 22 * f;
    const mx = lerp((ix + ox) / 2, ix + (ox - ix) * 0.3, f), my = lerp(Math.min(iy, oy) - 14, iy - 6, f);
    return <path key={`b${side}`} d={`M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`} stroke={L.hair} strokeWidth={22} strokeLinecap="round" fill="none" />;
  };

  // arms (IK from the shoulder to the hand target)
  const arm = (side: number) => {
    const sh = {x: side * 182, y: -925 + b};
    const rest = {x: side * 236, y: -560};
    const up = {x: side * 62 + tx * 0.8, y: headY + 150};
    const k = clamp(s.hands);
    const hand = {x: lerp(rest.x, up.x, k) + tr, y: lerp(rest.y, up.y, k) + tr * 0.5};
    // elbow is art-directed (hangs low by the ribs when the palms come up), not solved
    const mid = {x: lerp(side * 228, side * 168, k) + tr * 0.5, y: lerp(-735, -790, k) + b};
    const end = hand;
    const d = `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, end.x, 0.5) + side * 10} ${lerp(mid.y, end.y, 0.5)} ${end.x} ${end.y}`;
    return {d, end, mid};
  };
  const aL = arm(-1), aR = arm(1);
  const sleeve = (a: {d: string}) => (
    <>
      <path d={a.d} stroke={L.ink} strokeWidth={76 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={L.top} strokeWidth={76} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
  const hand = (a: {end: {x: number; y: number}}, side: number) => {
    const {x, y} = a.end, k = clamp(s.hands);
    const rot = lerp(side * 10, side * -35, k);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse cx={0} cy={0} rx={34} ry={22} fill={L.cuff} stroke={L.ink} strokeWidth={OW} transform="translate(0 -32)" />
        <ellipse cx={0} cy={6} rx={40} ry={46} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
        {[-24, -8, 8, 24].map((fx, i) => (
          <rect key={i} x={fx - 9} y={k > 0.5 ? -62 + Math.abs(fx) * 0.4 : 30} width={18} height={k > 0.5 ? 48 : 42} rx={9}
            fill={L.skin} stroke={L.ink} strokeWidth={OW * 0.8} />
        ))}
        <path d="M -30 10 Q 0 22 30 10" stroke={L.skinDark} strokeWidth={5} fill="none" opacity={0.6} />
      </g>
    );
  };

  const mo = clamp(s.mouth);
  const mx = tx * 0.9 + hx, my = headY + 128;

  // light grading as an SVG filter: dim + cool tint, then warm rim from the left edge and cold rim from the right edge
  const br = light.bright, c = light.cold;
  const m = (r: number, g: number, bb: number) => `${r * br} 0 0 0 0  0 ${g * br} 0 0 0  0 0 ${bb * br} 0 0  0 0 0 1 0`;
  const grade = m(lerp(1, 0.72, c), lerp(1, 0.8, c), lerp(1, 1.12, c));

  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <filter id={`${id}-light`} x="-20%" y="-10%" width="140%" height="120%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values={grade} result="graded" />
          <feOffset in="SourceAlpha" dx={14} dy={4} result="offL" />
          <feComposite in="SourceAlpha" in2="offL" operator="out" result="edgeL" />
          <feGaussianBlur in="edgeL" stdDeviation={3} result="edgeLb" />
          <feFlood floodColor="#ffb867" floodOpacity={light.warmRim} />
          <feComposite in2="edgeLb" operator="in" result="rimL0" />
          <feComposite in="rimL0" in2="SourceAlpha" operator="in" result="rimL" />
          <feOffset in="SourceAlpha" dx={-12} dy={2} result="offR" />
          <feComposite in="SourceAlpha" in2="offR" operator="out" result="edgeR" />
          <feGaussianBlur in="edgeR" stdDeviation={3} result="edgeRb" />
          <feFlood floodColor="#8fb0ff" floodOpacity={light.coldRim} />
          <feComposite in2="edgeRb" operator="in" result="rimR0" />
          <feComposite in="rimR0" in2="SourceAlpha" operator="in" result="rimR" />
          <feMerge><feMergeNode in="graded" /><feMergeNode in="rimL" /><feMergeNode in="rimR" /></feMerge>
        </filter>
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
        {/* legs */}
        <path d="M -168 -485 L -150 -40 L -30 -40 L -18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M 168 -485 L 150 -40 L 30 -40 L 18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M -120 -470 L -110 -60" stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
        <path d="M -168 -485 L -150 -40 L -30 -40 L -18 -485 Z M 168 -485 L 150 -40 L 30 -40 L 18 -485 Z" fill={`url(#${id}-down)`} />
        <ellipse cx={-92} cy={-22} rx={78} ry={30} fill={L.socks} stroke={L.ink} strokeWidth={OW} />
        <ellipse cx={92} cy={-22} rx={78} ry={30} fill={L.socks} stroke={L.ink} strokeWidth={OW} />
        {/* back arm when hands are down */}
        {s.hands < 0.5 && sleeve(aL)}
        {s.hands < 0.5 && sleeve(aR)}
        {/* torso */}
        <g transform={`translate(0 ${b * 0.5}) scale(${1 + s.breathe * 0.008} 1)`}>
          <path d="M -178 -962 C -222 -950 -236 -895 -232 -815 L -220 -478 C -150 -458 150 -458 220 -478 L 232 -815 C 236 -895 222 -950 178 -962 C 110 -984 -110 -984 -178 -962 Z"
            fill={L.top} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -660 C -150 -560 150 -560 150 -660 L 140 -540 C 60 -526 -60 -526 -140 -540 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW * 0.7} />
          <path d="M -200 -505 C -120 -488 120 -488 200 -505" stroke={L.cuff} strokeWidth={26} fill="none" />
          <path d="M -178 -962 C -222 -950 -236 -895 -232 -815 L -220 -478 C -150 -458 150 -458 220 -478 L 232 -815 C 236 -895 222 -950 178 -962 C 110 -984 -110 -984 -178 -962 Z" fill={`url(#${id}-bodyShade)`} />
          <path d="M -178 -962 C -222 -950 -236 -895 -232 -815 L -220 -478 C -150 -458 150 -458 220 -478 L 232 -815 C 236 -895 222 -950 178 -962 C 110 -984 -110 -984 -178 -962 Z" fill={`url(#${id}-down)`} opacity={0.7} />
          {/* hood around the neck */}
          <path d="M -150 -975 C -120 -925 120 -925 150 -975 C 120 -1005 -120 -1005 -150 -975 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW} />
          <path d={`M -42 -950 L ${-46 + tr * 0.4} -815`} stroke={L.strings} strokeWidth={9} strokeLinecap="round" />
          <path d={`M 42 -950 L ${46 + tr * 0.4} -808`} stroke={L.strings} strokeWidth={9} strokeLinecap="round" />
        </g>
        {/* neck */}
        <rect x={-42 + hx * 0.5} y={headY + 170} width={84} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        {/* head */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + tr * 0.05} 0 -1100)`}>
          <ellipse cx={-212 + tx * 0.4} cy={-1215} rx={30} ry={50} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <ellipse cx={212 + tx * 0.4} cy={-1215} rx={30} ry={50} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d="M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z"
            fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d="M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z"
            fill={`url(#${id}-faceShade)`} />
          <ellipse cx={-130 + tx} cy={-1110} rx={40} ry={20} fill={L.blush} opacity={0.35} />
          <ellipse cx={130 + tx} cy={-1110} rx={40} ry={20} fill={L.blush} opacity={0.35} />
          <g transform={`translate(0 ${-b * 0.6 + 1225 - 1225})`}>
            {eye(-1)}{eye(1)}
          </g>
          <path d={`M ${tx * 1.1 - 10} ${headY + 60} Q ${tx * 1.1 + 6} ${headY + 82} ${tx * 1.1 + 18} ${headY + 66}`} stroke={L.skinDark} strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* mouth */}
          <ellipse cx={mx} cy={my} rx={18 + 10 * mo} ry={5 + 26 * mo} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} />
          {mo > 0.3 && <rect x={mx - 12 - 6 * mo} y={my - 5 - 26 * mo + 4} width={24 + 12 * mo} height={9} rx={4} fill={L.teeth} />}
          {/* hair */}
          <path d="M -228 -1235 C -246 -1385 -152 -1496 0 -1498 C 152 -1500 248 -1392 230 -1236 L 208 -1300 C 192 -1350 150 -1372 120 -1366 L 96 -1346 L 66 -1384 L 30 -1344 L 0 -1390 L -38 -1348 L -72 -1388 L -110 -1352 C -150 -1376 -196 -1342 -208 -1292 Z"
            fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -40 -1490 L -20 -1560 L 10 -1494 M 20 -1496 L 60 -1548 L 70 -1488" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -1420 C -90 -1470 40 -1478 120 -1440" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
          {brow(-1)}{brow(1)}
        </g>
        {/* front arms when the hands come up */}
        {s.hands >= 0.5 && sleeve(aL)}
        {s.hands >= 0.5 && sleeve(aR)}
        {hand(aL, -1)}{hand(aR, 1)}
      </g>
    </g>
  );
};

// rim + grade filter shared by both views
export const LightFilter: React.FC<{id: string; light: TemaLight}> = ({id, light}) => {
  const br = light.bright, c = light.cold;
  const v = `${lerp(1, 0.72, c) * br} 0 0 0 0  0 ${lerp(1, 0.8, c) * br} 0 0 0  0 0 ${lerp(1, 1.12, c) * br} 0 0  0 0 0 1 0`;
  return (
    <filter id={`${id}-light`} x="-20%" y="-10%" width="140%" height="120%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values={v} result="graded" />
      <feOffset in="SourceAlpha" dx={14} dy={4} result="offL" />
      <feComposite in="SourceAlpha" in2="offL" operator="out" result="edgeL" />
      <feGaussianBlur in="edgeL" stdDeviation={3} result="edgeLb" />
      <feFlood floodColor="#ffb867" floodOpacity={light.warmRim} />
      <feComposite in2="edgeLb" operator="in" result="rimL0" />
      <feComposite in="rimL0" in2="SourceAlpha" operator="in" result="rimL" />
      <feOffset in="SourceAlpha" dx={-12} dy={2} result="offR" />
      <feComposite in="SourceAlpha" in2="offR" operator="out" result="edgeR" />
      <feGaussianBlur in="edgeR" stdDeviation={3} result="edgeRb" />
      <feFlood floodColor="#8fb0ff" floodOpacity={light.coldRim} />
      <feComposite in2="edgeRb" operator="in" result="rimR0" />
      <feComposite in="rimR0" in2="SourceAlpha" operator="in" result="rimR" />
      <feMerge><feMergeNode in="graded" /><feMergeNode in="rimL" /><feMergeNode in="rimR" /></feMerge>
    </filter>
  );
};

// seen from behind: back of the messy head, ears, hood on the back, arms (hands forward = hidden by the body)
const TemaBack: React.FC<{s: TemaState; light: TemaLight; id: string; crop?: number}> = ({s, light, id, crop}) => {
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const k = clamp(s.hands);
  const arm = (side: number) => {
    const sh = {x: side * 182, y: -925 + b};
    const mid = {x: lerp(side * 228, side * 175, k) + tr * 0.5, y: lerp(-735, -800, k) + b};
    const end = {x: lerp(side * 236, side * 120, k) + tr, y: lerp(-560, -930, k)};
    return `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, end.x, 0.5)} ${lerp(mid.y, end.y, 0.5)} ${end.x} ${end.y}`;
  };
  const torso = 'M -178 -962 C -222 -950 -236 -895 -232 -815 L -220 -478 C -150 -458 150 -458 220 -478 L 232 -815 C 236 -895 222 -950 178 -962 C 110 -984 -110 -984 -178 -962 Z';
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
        <path d="M -168 -485 L -150 -40 L -30 -40 L -18 -485 Z M 168 -485 L 150 -40 L 30 -40 L 18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        <ellipse cx={-92} cy={-30} rx={74} ry={26} fill={L.socks} stroke={L.ink} strokeWidth={OW} />
        <ellipse cx={92} cy={-30} rx={74} ry={26} fill={L.socks} stroke={L.ink} strokeWidth={OW} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={arm(sd)} stroke={L.ink} strokeWidth={76 + OW * 2} strokeLinecap="round" fill="none" />
            <path d={arm(sd)} stroke={L.top} strokeWidth={76} strokeLinecap="round" fill="none" />
          </g>
        ))}
        <g transform={`translate(0 ${b * 0.5})`}>
          <path d={torso} fill={L.top} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d={torso} fill={`url(#${id}-bdown)`} />
          {/* hood lying on the back */}
          <path d="M -150 -975 C -170 -880 -110 -800 0 -790 C 110 -800 170 -880 150 -975 C 100 -1000 -100 -1000 -150 -975 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW} />
          <path d="M -60 -960 C -50 -880 50 -880 60 -960" stroke={L.ink} strokeWidth={5} fill="none" opacity={0.6} />
        </g>
        <rect x={-42} y={-1060} width={84} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        <g transform={`translate(0 ${b * 0.6}) rotate(${s.turn * 4 + tr * 0.05} 0 -1100)`}>
          <ellipse cx={-212} cy={-1215} rx={30} ry={50} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <ellipse cx={212} cy={-1215} rx={30} ry={50} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d="M 0 -1498 C 150 -1500 236 -1392 224 -1236 C 214 -1110 160 -1040 70 -1020 C 30 -1012 -30 -1012 -70 -1020 C -160 -1040 -214 -1110 -224 -1236 C -236 -1392 -150 -1500 0 -1498 Z"
            fill={L.hair} stroke={L.ink} strokeWidth={OW} />
          <path d="M -70 -1030 L -50 -1080 L -25 -1028 L 0 -1085 L 25 -1028 L 50 -1080 L 70 -1030" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -40 -1490 L -20 -1560 L 10 -1494 M 20 -1496 L 60 -1548 L 70 -1488" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -1420 C -90 -1470 40 -1478 120 -1440" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </g>
    </g>
  );
};
