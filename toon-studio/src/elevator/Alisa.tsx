// Alisa, 12: the heroine of «Лишний этаж». Same build, ink and light filter as Tyoma from «Не отвечай»
// (big head, huge eyes, thin neck), but a dark bob with a fringe, a burgundy hoodie, headphones on the neck, a backpack.
// `uncanny` (0..1) turns her into the double / the reflection: tiny pupils, no eye shine, greyish skin, a too-wide smile.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

export const ALISA_LOOK = {
  skin: '#f0c7aa', skinShade: '#d5a088', skinDark: '#b8806b', blush: '#e8968c',
  hair: '#1d1519', hairLight: '#43303a',
  top: '#7a2236', topShade: '#58172a', topLight: '#963049', cuff: '#64192c', strings: '#eadfe2',
  pants: '#262b3d', pantsLight: '#343b54', shoe: '#e4e0da', sole: '#3a3640',
  phones: '#2a2a33', phonesLight: '#4a4a58', strap: '#2b2b36', pack: '#2f3242', packLight: '#40445a',
  eyeWhite: '#f4f1ec', iris: '#7b5a3d', irisDark: '#4a3222', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
  ink: '#14121c',
};
const GREY = {skin: '#c8bdb8', skinShade: '#a99c98', skinDark: '#8d7f7c', blush: '#b49a98'};

export type AlisaState = {
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1 left .. 1 right (screen)
  lookY: number;   // -1 up .. 1 down
  fear: number;    // 0 calm .. 1 terrified
  mouth: number;   // 0 closed .. 1 open (speech / gasp)
  smile: number;   // 0 .. 1 wide flat smile (the double)
  uncanny: number; // 0 Alisa .. 1 the double
  breathe: number; // -1..1
  hands: number;   // 0 hands down .. 1 palms up at the chest (pressing the glass / the button)
  turn: number;    // -1..1 head turn
  tremble: number; // px of shiver
  t: number;
};

export const ALISA_REST: AlisaState = {blink: 1, lookX: 0, lookY: 0, fear: 0, mouth: 0, smile: 0, uncanny: 0, breathe: 0, hands: 0, turn: 0, tremble: 0, t: 0};

const OW = 7;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};

const TORSO = 'M -170 -962 C -214 -950 -228 -895 -224 -815 L -212 -478 C -145 -458 145 -458 212 -478 L 224 -815 C 228 -895 214 -950 170 -962 C 105 -984 -105 -984 -170 -962 Z';
const HEAD = 'M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z';
// bob: the back layer frames the face down to the jaw; the front layer is the cap, side locks and a jagged fringe
const BOB_BACK = 'M -262 -1036 C -284 -1240 -250 -1470 0 -1528 C 250 -1470 284 -1240 262 -1036 C 200 -1016 130 -1030 96 -1042 L -96 -1042 C -130 -1030 -200 -1016 -262 -1036 Z';
const BOB_FRONT = 'M -258 -1040 C -270 -1200 -258 -1420 -120 -1494 C -40 -1526 40 -1526 120 -1494 C 258 -1420 270 -1200 258 -1040 L 200 -1056 C 206 -1150 210 -1250 192 -1318 L 146 -1330 L 112 -1306 L 72 -1334 L 32 -1310 L -8 -1338 L -50 -1310 L -90 -1334 L -132 -1308 L -192 -1318 C -210 -1250 -206 -1150 -200 -1056 Z';

export const Alisa: React.FC<{s: AlisaState; light: TemaLight; id?: string; crop?: number; view?: 'front' | 'back'}> = ({s, light, id = 'alisa', crop, view = 'front'}) => {
  const u = clamp(s.uncanny);
  const L = {...ALISA_LOOK, skin: mix(ALISA_LOOK.skin, GREY.skin, u), skinShade: mix(ALISA_LOOK.skinShade, GREY.skinShade, u),
    skinDark: mix(ALISA_LOOK.skinDark, GREY.skinDark, u), blush: mix(ALISA_LOOK.blush, GREY.blush, u)};
  if (view === 'back') return <AlisaBack s={s} light={light} id={id} crop={crop} L={L} />;
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const headY = -1225 + b * 0.6;
  const tx = s.turn * 26, hx = tr * 0.6;

  const eye = (side: number) => {
    const cx = side * 88 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 14;
    const rx = 66 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 80 * (1 + 0.06 * s.fear);
    const irisR = 40 * (1 - 0.22 * s.fear) * (1 - 0.12 * u), pupR = 19 * (1 - 0.5 * s.fear) * (1 - 0.55 * u);
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const open = clamp(s.blink);
    const lidY = cy - ry + (1 - open) * ry * 2;
    const clip = `${id}-eye${side}`;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={mix(L.eyeWhite, '#e2e0dc', u)} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
          <circle cx={ix} cy={iy} r={irisR} fill={mix(L.iris, '#3a3030', u)} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={7} />
          <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
          {u < 0.5 && <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={10} fill="#fff" />}
          {u < 0.5 && <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={L.ink} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={L.ink} strokeWidth={OW} />
        {/* lashes at the outer upper corner, they ride on the lid */}
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
    // a skin-tone underlay keeps the brow readable where it crosses the fringe
    const d = `M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`;
    return (
      <g key={`b${side}`}>
        <path d={d} stroke={L.skinShade} strokeWidth={27} strokeLinecap="round" fill="none" />
        <path d={d} stroke={L.hair} strokeWidth={15} strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // arms: hands down, or palms raised to the chest / forward (glass, buttons)
  const arm = (side: number) => {
    const sh = {x: side * 176, y: -925 + b};
    const rest = {x: side * 228, y: -560};
    const up = {x: side * 120 + tx * 0.6, y: -900};
    const k = clamp(s.hands);
    const hand = {x: lerp(rest.x, up.x, k) + tr, y: lerp(rest.y, up.y, k) + tr * 0.5};
    const mid = {x: lerp(side * 222, side * 250, k) + tr * 0.5, y: lerp(-735, -760, k) + b};
    const d = `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, hand.x, 0.5) + side * 10} ${lerp(mid.y, hand.y, 0.5)} ${hand.x} ${hand.y}`;
    return {d, end: hand};
  };
  const aL = arm(-1), aR = arm(1);
  const sleeve = (a: {d: string}) => (
    <>
      <path d={a.d} stroke={L.ink} strokeWidth={72 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={L.top} strokeWidth={72} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
  const hand = (a: {end: {x: number; y: number}}, side: number) => {
    const {x, y} = a.end, k = clamp(s.hands);
    const rot = lerp(side * 10, side * -12, k);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse cx={0} cy={-30} rx={32} ry={20} fill={L.cuff} stroke={L.ink} strokeWidth={OW} />
        <ellipse cx={0} cy={6} rx={37} ry={43} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
        {[-22, -7, 8, 23].map((fx, i) => (
          <rect key={i} x={fx - 8} y={k > 0.5 ? -60 + Math.abs(fx) * 0.4 : 28} width={16} height={k > 0.5 ? 46 : 40} rx={8}
            fill={L.skin} stroke={L.ink} strokeWidth={OW * 0.8} />
        ))}
      </g>
    );
  };

  const mo = clamp(s.mouth), sm = clamp(s.smile);
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
        {/* legs + sneakers */}
        <path d="M -160 -485 L -140 -60 L -32 -60 L -18 -485 Z M 160 -485 L 140 -60 L 32 -60 L 18 -485 Z" fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M -112 -470 L -102 -80" stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
        <path d="M -160 -485 L -140 -60 L -32 -60 L -18 -485 Z M 160 -485 L 140 -60 L 32 -60 L 18 -485 Z" fill={`url(#${id}-down)`} />
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 22} -12 L ${sd * 22} -56 C ${sd * 60} -84 ${sd * 150} -76 ${sd * 172} -30 L ${sd * 176} -12 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d={`M ${sd * 18} -4 L ${sd * 182} -4 L ${sd * 180} -20 L ${sd * 20} -20 Z`} fill={L.sole} stroke={L.ink} strokeWidth={OW * 0.8} />
          </g>
        ))}
        {s.hands < 0.5 && sleeve(aL)}
        {s.hands < 0.5 && sleeve(aR)}
        {/* torso: hoodie + backpack straps */}
        <g transform={`translate(0 ${b * 0.5}) scale(${1 + s.breathe * 0.008} 1)`}>
          <path d={TORSO} fill={L.top} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -140 -660 C -140 -560 140 -560 140 -660 L 130 -540 C 55 -526 -55 -526 -130 -540 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW * 0.7} />
          <path d="M -194 -505 C -116 -488 116 -488 194 -505" stroke={L.cuff} strokeWidth={26} fill="none" />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 132} -968 C ${sd * 150} -900 ${sd * 162} -820 ${sd * 168} -700`} stroke={L.strap} strokeWidth={34} fill="none" strokeLinecap="round" />
          ))}
          <path d={TORSO} fill={`url(#${id}-bodyShade)`} />
          <path d={TORSO} fill={`url(#${id}-down)`} opacity={0.7} />
          <path d="M -140 -975 C -112 -925 112 -925 140 -975 C 112 -1005 -112 -1005 -140 -975 Z" fill={L.topShade} stroke={L.ink} strokeWidth={OW} />
          <path d={`M -40 -950 L ${-44 + tr * 0.4} -830`} stroke={L.strings} strokeWidth={9} strokeLinecap="round" />
          <path d={`M 40 -950 L ${44 + tr * 0.4} -822`} stroke={L.strings} strokeWidth={9} strokeLinecap="round" />
        </g>
        {/* bob, back layer */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + tr * 0.05} 0 -1100)`}>
          <path d={BOB_BACK} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        </g>
        {/* neck + headphones resting on it */}
        <rect x={-40 + hx * 0.5} y={headY + 170} width={80} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        <path d="M -128 -990 C -132 -930 132 -930 128 -990" stroke={L.phones} strokeWidth={24} fill="none" strokeLinecap="round" />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 132} -968) rotate(${sd * -18})`}>
            <ellipse cx={0} cy={0} rx={44} ry={56} fill={L.phones} stroke={L.ink} strokeWidth={OW} />
            <ellipse cx={sd * -6} cy={-4} rx={26} ry={36} fill={L.phonesLight} />
          </g>
        ))}
        {/* head */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + tr * 0.05} 0 -1100)`}>
          <path d={HEAD} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d={HEAD} fill={`url(#${id}-faceShade)`} />
          <ellipse cx={-128 + tx} cy={-1100} rx={40} ry={20} fill={L.blush} opacity={0.4} />
          <ellipse cx={128 + tx} cy={-1100} rx={40} ry={20} fill={L.blush} opacity={0.4} />
          {eye(-1)}{eye(1)}
          <path d={`M ${tx * 1.1 - 8} ${headY + 70} Q ${tx * 1.1 + 6} ${headY + 88} ${tx * 1.1 + 16} ${headY + 74}`} stroke={L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* mouth: speech/gasp ellipse, or the double's flat wide smile */}
          {sm < 0.05 ? (
            <>
              <ellipse cx={mx} cy={my} rx={16 + 10 * mo} ry={4 + 24 * mo} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} />
              {mo > 0.3 && <rect x={mx - 11 - 6 * mo} y={my - 4 - 24 * mo + 4} width={22 + 12 * mo} height={8} rx={4} fill={L.teeth} />}
            </>
          ) : (
            <g>
              {/* corners pulled high, a deep crescent, a full row of teeth with gaps */}
              <path d={`M ${mx - smileW} ${my - 40 * sm} Q ${mx} ${my + 70 * sm + 30 * mo} ${mx + smileW} ${my - 40 * sm} Q ${mx} ${my + 6 * sm} ${mx - smileW} ${my - 40 * sm} Z`}
                fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              {sm > 0.4 && <path d={`M ${mx - smileW * 0.9} ${my - 31 * sm} Q ${mx} ${my + 12 * sm} ${mx + smileW * 0.9} ${my - 31 * sm} L ${mx + smileW * 0.8} ${my - 12 * sm} Q ${mx} ${my + 34 * sm} ${mx - smileW * 0.8} ${my - 12 * sm} Z`} fill={L.teeth} stroke={L.ink} strokeWidth={3} />}
              {sm > 0.4 && [-0.6, -0.3, 0, 0.3, 0.6].map((k) => (
                <path key={k} d={`M ${mx + k * smileW} ${my - 8 * sm + Math.abs(k) * -20 * sm} l 0 ${22 * sm}`} stroke={L.ink} strokeWidth={3} opacity={0.6} />
              ))}
            </g>
          )}
          {/* bob, front layer: cap, side locks, fringe */}
          <path d={BOB_FRONT} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -1440 C -80 -1490 50 -1494 130 -1452" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M 222 -1300 C 236 -1220 236 -1140 228 -1080" stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5} />
          {brow(-1)}{brow(1)}
        </g>
        {s.hands >= 0.5 && sleeve(aL)}
        {s.hands >= 0.5 && sleeve(aR)}
        {hand(aL, -1)}{hand(aR, 1)}
      </g>
    </g>
  );
};

// from behind: the bob, headphones band, the backpack on the hoodie
const AlisaBack: React.FC<{s: AlisaState; light: TemaLight; id: string; crop?: number; L: typeof ALISA_LOOK}> = ({s, light, id, crop, L}) => {
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
          <path d={TORSO} fill={`url(#${id}-bdown)`} />
          {/* backpack */}
          <path d="M -150 -930 C -150 -960 150 -960 150 -930 L 162 -600 C 162 -560 -162 -560 -162 -600 Z" fill={L.pack} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -120 -800 L 120 -800 L 126 -640 C 60 -626 -60 -626 -126 -640 Z" fill={L.packLight} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
          <path d="M -110 -860 C -40 -880 40 -880 110 -860" stroke={L.ink} strokeWidth={5} fill="none" opacity={0.7} />
          <rect x={-14} y={-790} width={28} height={40} rx={6} fill={L.strings} stroke={L.ink} strokeWidth={4} />
        </g>
        <rect x={-40} y={-1060} width={80} height={90} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        <path d="M -128 -990 C -132 -1030 132 -1030 128 -990" stroke={L.phones} strokeWidth={24} fill="none" strokeLinecap="round" />
        <g transform={`translate(0 ${b * 0.6}) rotate(${s.turn * 4 + tr * 0.05} 0 -1100)`}>
          <path d="M -262 -1036 C -284 -1240 -250 -1474 0 -1530 C 250 -1474 284 -1240 262 -1036 C 180 -1010 -180 -1010 -262 -1036 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -1440 C -80 -1490 50 -1494 130 -1452" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
          <path d="M -60 -1060 L -60 -1110 M 0 -1050 L 0 -1120 M 60 -1060 L 60 -1110" stroke={L.hairLight} strokeWidth={8} strokeLinecap="round" opacity={0.5} />
        </g>
      </g>
    </g>
  );
};
