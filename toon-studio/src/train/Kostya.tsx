// Kostya, 19: the hero of «Последняя электричка». Same doll family as Tyoma, Alisa and Dima (big head, huge eyes,
// thin neck): dark curly hair, a navy jacket over a grey hoodie, big headphones round the neck, a backpack with a
// yellow lightning pin. The doubles are the same doll: `age` 0 → 19, 0.5 → ~35 (grey temples, stubble),
// 1 → an old man (white hair, wrinkles, the jacket too big); `wet` 0..1 → the grey, soaked double dripping water.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

export const KOSTYA_LOOK = {
  skin: '#efc6a6', skinShade: '#d39f82', skinDark: '#b17a60', blush: '#e8937f',
  hair: '#3b2a22', hairLight: '#5f4636', hairDark: '#1f1510',
  hood: '#9a9ca6', hoodShade: '#7a7c86', jacket: '#25365a', jacketShade: '#1a2742', jacketLight: '#3a5082',
  pants: '#2e3a4c', pantsLight: '#435269', shoe: '#2b2b30', sole: '#d8d5cf',
  eyeWhite: '#f4f1ec', iris: '#6b4a2e', irisDark: '#3e2a18', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
  ink: '#14121c', phones: '#1b1c22', phonesLight: '#3a3c48', pin: '#f2c230', strap: '#2a2f2c', pack: '#4a5246', packShade: '#363c33',
};

export type KostyaState = {
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1..1
  lookY: number;   // -1 up .. 1 down
  fear: number;    // 0..1
  mouth: number;   // 0..1
  smile: number;   // 0..1
  breathe: number; // -1..1
  hands: number;   // 0 down .. 1 palms up at the chest
  phone?: number;  // 0..1 holds a smartphone at the chest, looking at it
  reach?: number;  // 0..1 the left hand reaches out to the side (the old man grabs a wrist)
  sit?: number;    // 0 stands .. 1 sits on the bench
  turn: number;    // -1..1
  tilt?: number;   // degrees (head on the window when asleep)
  tremble: number;
  tears?: number;
  age?: number;    // 0 = 19 .. 0.5 = 35 .. 1 = old man
  wet?: number;    // 0..1 the soaked grey double
  phonesOn?: number; // 0 headphones round the neck .. 1 on the ears
  t: number;
};
export const KOSTYA_REST: KostyaState = {blink: 1, lookX: 0, lookY: 0, fear: 0, mouth: 0, smile: 0, breathe: 0, hands: 0, turn: 0, tremble: 0, t: 0};

const OW = 7;
const LEG = 170;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};
const lookFor = (age: number, wet: number) => {
  const o: typeof KOSTYA_LOOK = {...KOSTYA_LOOK};
  // age: hair greys (temples first, see the patches), skin a bit paler, the jacket fades
  const grey = clamp((age - 0.45) / 0.55);
  o.hair = mixC(o.hair, '#dcd8d0', grey); o.hairLight = mixC(o.hairLight, '#f2efe8', grey); o.hairDark = mixC(o.hairDark, '#a9a49a', grey);
  o.skin = mixC(o.skin, '#e3c0a8', age * 0.6); o.skinShade = mixC(o.skinShade, '#c49a84', age * 0.6);
  o.jacket = mixC(o.jacket, '#3b4660', age * 0.5); o.jacketShade = mixC(o.jacketShade, '#2c3448', age * 0.5);
  o.pin = mixC(o.pin, '#a49a78', age);
  o.iris = mixC(o.iris, '#7d7466', age * 0.4);
  if (wet > 0) {
    const grey2 = '#b8bcbc';
    o.skin = mixC(o.skin, grey2, wet); o.skinShade = mixC(o.skinShade, '#959a9c', wet); o.skinDark = mixC(o.skinDark, '#7b8082', wet);
    o.blush = mixC(o.blush, grey2, wet);
    o.hair = mixC(o.hair, '#15110f', wet * 0.7);
    o.jacket = mixC(o.jacket, '#141d33', wet * 0.8); o.jacketShade = mixC(o.jacketShade, '#0d1424', wet * 0.8);
    o.hood = mixC(o.hood, '#5d6068', wet); o.hoodShade = mixC(o.hoodShade, '#45474e', wet);
    o.pants = mixC(o.pants, '#1d2531', wet);
    o.iris = mixC(o.iris, '#8a8f90', wet * 0.8); o.irisDark = mixC(o.irisDark, '#55595a', wet * 0.8);
    o.mouth = mixC(o.mouth, '#3a3d48', wet);
  }
  return o;
};

const TORSO = 'M -170 -962 C -214 -950 -228 -895 -224 -815 L -212 -478 C -145 -458 145 -458 212 -478 L 224 -815 C 228 -895 214 -950 170 -962 C 105 -984 -105 -984 -170 -962 Z';
// one half of the open jacket (sd = -1 left / 1 right), longer than the hoodie
const JACKET = (sd: number) => `M ${sd * 172} -966 C ${sd * 222} -952 ${sd * 238} -895 ${sd * 236} -815 L ${sd * 230} -440 C ${sd * 170} -426 ${sd * 100} -422 ${sd * 40} -424 L ${sd * 44} -780 L ${sd * 92} -972 C ${sd * 126} -972 ${sd * 152} -970 ${sd * 172} -966 Z`;
const HEAD = 'M 0 -1460 C 130 -1460 216 -1378 218 -1255 C 220 -1150 180 -1060 100 -1012 C 60 -990 -60 -990 -100 -1012 C -180 -1060 -220 -1150 -218 -1255 C -216 -1378 -130 -1460 0 -1460 Z';

// curly hair: a scalloped crown, then a fringe of small curls along the forehead
const scallop = (pts: number[][], r: number) => pts.slice(1).map((p) => `A ${r} ${r} 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
const curlyFront = (lift: number, shrink = 0) => {
  const cy = -1250, crown: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI, r = 292 - shrink + (i % 2) * 14 * (1 - shrink / 80);
    crown.push([Math.cos(a) * r, cy + Math.sin(a) * r * 0.98]);
  }
  const fr = [[226, -1170], [206, -1210], [196, -1300 + lift], [130, -1346 + lift], [44, -1356 + lift], [-44, -1356 + lift], [-130, -1346 + lift], [-196, -1300 + lift], [-206, -1210], [-226, -1170]];
  return `M ${crown[0][0].toFixed(1)} ${crown[0][1].toFixed(1)} ${scallop(crown, 62)} L ${fr[0].join(' ')} ${scallop(fr, 52)} Z`;
};
const curlyBack = (shrink = 0) => {
  const pts: number[][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI * 0.92 + (i / 12) * Math.PI * 1.16, r = 300 - shrink;
    pts.push([Math.cos(a) * r, -1250 + Math.sin(a) * r]);
  }
  return `M -236 -1120 L ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} ${scallop(pts, 64 - shrink * 0.4)} L 236 -1120 Z`;
};
const CURLY_BACK = curlyBack();

type P = {x: number; y: number};
const lp = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});

const Bolt: React.FC<{x: number; y: number; c: string; s?: number}> = ({x, y, c, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={34} fill="#1d2233" stroke={KOSTYA_LOOK.ink} strokeWidth={4} />
    <path d="M 6 -24 L -14 4 L 0 4 L -6 24 L 14 -4 L 0 -4 Z" fill={c} />
  </g>
);

// water drips falling from the hem / sleeves / hair of the soaked double
const Drips: React.FC<{t: number; wet: number; pts: number[][]}> = ({t, wet, pts}) => (
  <g opacity={wet}>
    {pts.map(([x, y], i) => {
      const ph = ((t * 0.9 + i * 0.37) % 1);
      return <ellipse key={i} cx={x} cy={y + ph * 260} rx={9} ry={15} fill="#aac8de" opacity={0.85 * (1 - ph)} />;
    })}
  </g>
);

export const Kostya: React.FC<{s: KostyaState; light: TemaLight; id?: string; crop?: number; view?: 'front' | 'back'}> = ({s, light, id = 'kostya', crop, view = 'front'}) => {
  const age = clamp(s.age ?? 0), wet = clamp(s.wet ?? 0), sit = clamp(s.sit ?? 0);
  const L = lookFor(age, wet);
  if (view === 'back') return <KostyaBack s={s} light={light} id={id} crop={crop} L={L} />;
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const stoop = age * age * 40; // the old man's head sinks forward
  const headY = -1225 + b * 0.6 + stoop;
  const tx = s.turn * 26, hx = tr * 0.6;
  const ph = clamp(s.phone ?? 0), reach = clamp(s.reach ?? 0), pOn = clamp(s.phonesOn ?? 0);
  const big = 1 + age * age * 0.07; // the old man drowns in the jacket
  const upY = lerp(-LEG, 60, sit); // the upper body sinks when he sits

  const eye = (side: number) => {
    const cx = side * 86 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 14;
    const rx = 62 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 74 * (1 + 0.06 * s.fear) * (1 - age * 0.12);
    const irisR = 37 * (1 - 0.22 * s.fear), pupR = 18 * (1 - 0.5 * s.fear) * (1 - wet * 0.35);
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const open = clamp(s.blink) * (1 - age * 0.18) + age * 0.18 * clamp(s.blink); // heavier lids with age
    const lidY = cy - ry + (1 - open) * ry * 2 + age * 18;
    const clip = `${id}-eye${side}`;
    if (open < 0.12) {
      return (
        <g key={side}>
          <path d={`M ${cx - rx * 0.85} ${cy + 6} Q ${cx} ${cy + 40} ${cx + rx * 0.85} ${cy + 6}`} stroke={L.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
          {[-0.5, 0, 0.5].map((k) => <path key={k} d={`M ${cx + k * rx * 0.8} ${cy + 22 + (1 - Math.abs(k)) * 10} l ${k * 14} 18`} stroke={L.ink} strokeWidth={6} strokeLinecap="round" />)}
        </g>
      );
    }
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={wet > 0.5 ? '#e4e6e4' : L.eyeWhite} />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
          <circle cx={ix} cy={iy} r={irisR} fill={L.iris} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={7} />
          <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
          {wet < 0.6 && <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={10} fill="#fff" />}
          <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />
          {(s.tears ?? 0) > 0 && <ellipse cx={cx} cy={cy + ry - 8} rx={rx * 0.9} ry={14} fill="#bfe3ff" opacity={0.75 * clamp(s.tears ?? 0)} />}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          {s.smile > 0.2 && <ellipse cx={cx} cy={cy + ry + 10} rx={rx + 6} ry={ry * 0.5 * clamp(s.smile)} fill={L.skin} />}
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={L.ink} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={L.ink} strokeWidth={OW} />
        {/* bags under the eyes: tired at 35, deep in the old man, dark in the soaked double */}
        {(age > 0.2 || wet > 0.2) && (
          <path d={`M ${cx - rx * 0.8} ${cy + ry + 10} Q ${cx} ${cy + ry + 34} ${cx + rx * 0.8} ${cy + ry + 10}`}
            stroke={wet > 0.2 ? '#6d7377' : L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" opacity={Math.max(clamp(age * 1.4), wet * 0.9)} />
        )}
      </g>
    );
  };
  const brow = (side: number) => {
    const f = s.fear;
    const ix = side * 36 + tx + hx, ox = side * 140 + tx + hx;
    const iy = headY - 94 - 34 * f, oy = headY - 98 + 16 * f + age * 14;
    const mx = lerp((ix + ox) / 2, ix + (ox - ix) * 0.3, f), my = lerp(Math.min(iy, oy) - 12, iy - 6, f);
    const d = `M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`;
    const w = 18 + age * 12; // bushy old brows
    return (
      <g key={`b${side}`}>
        <path d={d} stroke={L.skinShade} strokeWidth={w + 12} strokeLinecap="round" fill="none" />
        <path d={d} stroke={L.hairDark} strokeWidth={w} strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // arms in the upper-body coords; the jacket sleeve covers the whole arm down to the wrist
  const arm = (side: number) => {
    const shp = {x: side * 184 * big, y: -925 + b};
    let hand: P = {x: side * 236 * big, y: -545}, mid: P = {x: side * 232 * big, y: -735};
    const k = clamp(s.hands);
    hand = lp(hand, {x: side * 120 + tx * 0.6, y: -900}, k); mid = lp(mid, {x: side * 260, y: -760}, k);
    let raise = k;
    if (side > 0) { hand = lp(hand, {x: 70, y: -820}, ph); mid = lp(mid, {x: 250, y: -700}, ph); raise = Math.max(raise, ph); }
    if (side < 0) { hand = lp(hand, {x: -440, y: -760}, reach); mid = lp(mid, {x: -330, y: -840}, reach); }
    const free = k < 0.5 && !(side > 0 && ph > 0.5) && !(side < 0 && reach > 0.5);
    if (sit > 0 && free) {
      // sitting: the hands rest on the knees
      hand = lp(hand, {x: side * 110, y: -500}, sit); mid = lp(mid, {x: side * 250, y: -640}, sit);
    }
    hand = {x: hand.x + tr, y: hand.y + tr * 0.5};
    mid = {x: mid.x + tr * 0.5, y: mid.y + b};
    const d = `M ${shp.x} ${shp.y} Q ${lerp(shp.x, mid.x, 0.5) + side * 14} ${lerp(shp.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, hand.x, 0.5) + side * 10} ${lerp(mid.y, hand.y, 0.5)} ${hand.x} ${hand.y}`;
    return {d, end: hand, raise};
  };
  const aL = arm(-1), aR = arm(1);
  const sleeveW = 74 + age * 14;
  const limb = (a: ReturnType<typeof arm>) => (
    <>
      <path d={a.d} stroke={L.ink} strokeWidth={sleeveW + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={L.jacket} strokeWidth={sleeveW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  );
  const handG = (a: ReturnType<typeof arm>, side: number) => {
    const {x, y} = a.end;
    const k = clamp(s.hands);
    const holds = side > 0 && ph > 0.5;
    const rot = holds ? -70 : lerp(side * 10, side * -12, k) + (side < 0 ? reach * 60 : 0);
    const up = k > 0.5;
    const hs = 1 - age * 0.12; // the sleeve swallows the old man's hands
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${hs})`}>
        {holds && (
          <g transform="rotate(70) translate(-46 -150)">
            <rect x={0} y={0} width={92} height={170} rx={14} fill={L.phones} stroke={L.ink} strokeWidth={OW} />
            <rect x={8} y={10} width={76} height={148} rx={8} fill="#cfe6ff" opacity={0.95} />
            <rect x={14} y={30} width={50} height={14} rx={7} fill="#7fa8d8" />
            <rect x={28} y={56} width={50} height={14} rx={7} fill="#9ad08a" />
          </g>
        )}
        <ellipse cx={0} cy={6} rx={35} ry={41} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
        {[-21, -7, 7, 21].map((fx, i) => (
          <rect key={i} x={fx - 8} y={up ? -58 + Math.abs(fx) * 0.4 : 26} width={16} height={up ? 46 : 40} rx={8}
            fill={L.skin} stroke={L.ink} strokeWidth={OW * 0.8} />
        ))}
        {/* the jacket cuff */}
        <ellipse cx={0} cy={-36} rx={44} ry={20} fill={L.jacketShade} stroke={L.ink} strokeWidth={OW * 0.8} />
      </g>
    );
  };

  const mo = clamp(s.mouth), sm = clamp(s.smile);
  const mx = tx * 0.9 + hx, my = headY + 130;
  const legs = sit < 0.5 ? (
    <>
      <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M -104 ${-470 - LEG} L -96 -80 M 104 ${-470 - LEG} L 96 -80`} stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
      <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={`url(#${id}-down)`} />
    </>
  ) : (
    // seated, seen from the front: short foreshortened thighs, knees, shins straight down
    <>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 20} -60 L ${sd * 26} -400 L ${sd * 160} -400 L ${sd * 150} -60 Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M ${sd * 20} -60 L ${sd * 26} -400 L ${sd * 160} -400 L ${sd * 150} -60 Z`} fill={`url(#${id}-down)`} />
        </g>
      ))}
    </>
  );

  const body = (
    <>
      {legs}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 22} -12 L ${sd * 22} -58 C ${sd * 60} -88 ${sd * 160} -80 ${sd * 184} -30 L ${sd * 188} -12 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M ${sd * 18} -4 L ${sd * 194} -4 L ${sd * 192} -20 L ${sd * 20} -20 Z`} fill={L.sole} stroke={L.ink} strokeWidth={OW * 0.8} />
        </g>
      ))}
      <g transform={`translate(0 ${upY})`}>
        {aL.raise < 0.5 && limb(aL)}
        {aR.raise < 0.5 && limb(aR)}
        <g transform={`translate(0 ${b * 0.5}) translate(0 ${-700 * (1 - big)}) scale(${(1 + s.breathe * 0.008) * big} ${big})`}>
          {/* hoodie, its hood behind the neck */}
          <path d={TORSO} fill={L.hood} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -150 -985 C -150 -1060 150 -1060 150 -985 C 100 -950 -100 -950 -150 -985 Z" fill={L.hoodShade} stroke={L.ink} strokeWidth={OW} />
          <path d="M -30 -950 L -36 -840 M 30 -950 L 36 -840" stroke="#e8e6ee" strokeWidth={8} strokeLinecap="round" opacity={wet > 0.5 ? 0.4 : 0.9} />
          {/* the open jacket + backpack straps */}
          {[-1, 1].map((sd) => <path key={sd} d={JACKET(sd)} fill={L.jacket} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />)}
          {[-1, 1].map((sd) => <path key={`c${sd}`} d={`M ${sd * 92} -972 L ${sd * 150} -900 L ${sd * 80} -880 Z`} fill={L.jacketShade} stroke={L.ink} strokeWidth={OW * 0.7} strokeLinejoin="round" />)}
          {[-1, 1].map((sd) => <path key={`s${sd}`} d={`M ${sd * 150} -960 L ${sd * 166} -620`} stroke={L.strap} strokeWidth={34} strokeLinecap="round" />)}
          {[-1, 1].map((sd) => <path key={`z${sd}`} d={`M ${sd * 44} -780 L ${sd * 40} -428`} stroke={L.jacketLight} strokeWidth={6} opacity={0.6} />)}
          <path d="M 120 -900 L 132 -560" stroke={L.jacketLight} strokeWidth={8} opacity={0.5} />
          <Bolt x={-150} y={-800} c={L.pin} s={0.9} />
          <path d={TORSO} fill={`url(#${id}-bodyShade)`} opacity={0.8} />
        </g>
        {/* hair back layer */}
        <g transform={`translate(${hx} ${b * 0.6 + stoop}) rotate(${s.turn * 3 + (s.tilt ?? 0) + tr * 0.05} 0 -1100)`}>
          <path d={curlyBack(age * age * 56)} fill={L.hairDark} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        </g>
        <rect x={-38 + hx * 0.5} y={headY + 170} width={76} height={100 - stoop} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        {/* headphones round the neck */}
        {pOn < 0.5 && (
          <g>
            <path d={`M -130 ${headY + 250} C -110 ${headY + 330} 110 ${headY + 330} 130 ${headY + 250}`} stroke={L.phones} strokeWidth={26} fill="none" strokeLinecap="round" />
            {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 140} cy={headY + 252} rx={52} ry={64} fill={L.phones} stroke={L.ink} strokeWidth={OW} />)}
            {[-1, 1].map((sd) => <ellipse key={`l${sd}`} cx={sd * 140 - sd * 14} cy={headY + 240} rx={20} ry={30} fill={L.phonesLight} />)}
          </g>
        )}
        <g transform={`translate(${hx} ${b * 0.6 + stoop}) rotate(${s.turn * 3 + (s.tilt ?? 0) + tr * 0.05} 0 -1100)`}>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <ellipse cx={sd * 218 + tx * 0.5} cy={-1205} rx={34 + age * 6} ry={48 + age * 8} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
              <path d={`M ${sd * 222 + tx * 0.5} -1230 q ${sd * 10} 20 0 40`} stroke={L.skinDark} strokeWidth={6} fill="none" />
            </g>
          ))}
          <path d={HEAD} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d={HEAD} fill={`url(#${id}-faceShade)`} />
          {wet < 0.5 && <>
            <ellipse cx={-126 + tx} cy={-1098} rx={42} ry={20} fill={L.blush} opacity={0.35 * (1 - age * 0.6)} />
            <ellipse cx={126 + tx} cy={-1098} rx={42} ry={20} fill={L.blush} opacity={0.35 * (1 - age * 0.6)} />
          </>}
          {/* stubble (35) and the old man's white bristle */}
          {age > 0.3 && Array.from({length: 46}, (_, i) => {
            const a = Math.PI * (0.12 + (i / 45) * 0.76), r = 150 + ((i * 37) % 23);
            return <circle key={i} cx={Math.cos(a) * r + tx} cy={-1120 + Math.sin(a) * r * 0.62} r={4.5} fill={age > 0.75 ? '#d8d4cc' : L.hairDark} opacity={0.55} />;
          })}
          {/* wrinkles */}
          {age > 0.35 && <path d={`M ${-80 + tx} -1352 Q ${tx} -1366 ${80 + tx} -1352`} stroke={L.skinDark} strokeWidth={6} fill="none" strokeLinecap="round" opacity={clamp((age - 0.35) * 2)} />}
          {age > 0.7 && <>
            <path d={`M ${-100 + tx} -1380 Q ${tx} -1394 ${100 + tx} -1380`} stroke={L.skinDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d={`M ${-70 + tx} ${headY + 80} Q ${-96 + tx} ${headY + 130} ${-70 + tx} ${headY + 168} M ${70 + tx} ${headY + 80} Q ${96 + tx} ${headY + 130} ${70 + tx} ${headY + 168}`} stroke={L.skinDark} strokeWidth={6} fill="none" strokeLinecap="round" />
            {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 152 + tx} ${headY - 10} l ${sd * 26} -10 M ${sd * 152 + tx} ${headY + 10} l ${sd * 28} 4 M ${sd * 150 + tx} ${headY + 30} l ${sd * 24} 16`} stroke={L.skinDark} strokeWidth={5} strokeLinecap="round" />)}
          </>}
          <path d={`M ${tx * 1.1 - 10} ${headY + 66} Q ${tx * 1.1 + 8} ${headY + 90} ${tx * 1.1 + 20} ${headY + 72}`} stroke={L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
          {eye(-1)}{eye(1)}
          {sm > 0.05 ? (
            <g>
              <path d={`M ${mx - 60 * sm - 20} ${my - 14} Q ${mx} ${my + 40 + 40 * mo} ${mx + 60 * sm + 20} ${my - 14} Q ${mx} ${my + 4} ${mx - 60 * sm - 20} ${my - 14} Z`} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              <path d={`M ${mx - 50 * sm - 12} ${my - 8} Q ${mx} ${my + 6} ${mx + 50 * sm + 12} ${my - 8} L ${mx + 40 * sm + 8} ${my + 6} Q ${mx} ${my + 16} ${mx - 40 * sm - 8} ${my + 6} Z`} fill={L.teeth} />
            </g>
          ) : (
            <>
              <ellipse cx={mx} cy={my} rx={18 + 12 * mo} ry={4 + 28 * mo} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} />
              {mo > 0.3 && <rect x={mx - 12 - 6 * mo} y={my - 28 * mo + 2} width={24 + 12 * mo} height={8} rx={4} fill={L.teeth} />}
            </>
          )}
          {/* curly hair, front layer; the old man's hairline creeps up */}
          <path d={curlyFront(-age * age * 70, age * age * 52)} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {wet > 0.3 ? (
            // wet hair: flat dark strands stuck to the forehead
            <path d="M -120 -1340 L -126 -1290 M -50 -1350 L -58 -1286 M 30 -1352 L 26 -1294 M 110 -1342 L 118 -1296" stroke={L.hair} strokeWidth={22} strokeLinecap="round" opacity={wet} />
          ) : (
            <>
              {[[-150, -1440], [-60, -1490], [40, -1494], [130, -1450], [-170, -1360], [170, -1370]].map(([cx, cy], i) => (
                <path key={i} d={`M ${cx - 18} ${cy + 8} q 18 -26 36 0`} stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.75} />
              ))}
            </>
          )}
          {/* grey temples at 35 */}
          {age > 0.25 && age < 0.8 && [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 214} -1340 Q ${sd * 228} -1270 ${sd * 214} -1206 M ${sd * 244} -1380 Q ${sd * 256} -1320 ${sd * 246} -1270`} stroke="#a9a49b" strokeWidth={11} fill="none" strokeLinecap="round" opacity={clamp((age - 0.25) * 4)} />)}
          {/* headphones on the ears */}
          {pOn >= 0.5 && (
            <g>
              <path d="M -238 -1210 C -260 -1560 260 -1560 238 -1210" stroke={L.phones} strokeWidth={28} fill="none" strokeLinecap="round" />
              {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 232} cy={-1205} rx={56} ry={74} fill={L.phones} stroke={L.ink} strokeWidth={OW} />)}
            </g>
          )}
          {brow(-1)}{brow(1)}
          <Drips t={s.t} wet={wet} pts={[[-150, -1300], [60, -1320], [180, -1250]]} />
        </g>
        {sit >= 0.5 && [-1, 1].map((sd) => (
          // knees (in the upper-body coords, so shift back by upY): they sit in front of the jacket hem
          <path key={`k${sd}`} transform={`translate(0 ${-upY})`} d={`M ${sd * 8} -400 C ${sd * 4} -520 ${sd * 196} -520 ${sd * 192} -400 L ${sd * 186} -380 C ${sd * 140} -350 ${sd * 40} -350 ${sd * 14} -380 Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        ))}
        {aL.raise >= 0.5 && limb(aL)}
        {aR.raise >= 0.5 && limb(aR)}
        {handG(aL, -1)}{handG(aR, 1)}
        <Drips t={s.t + 0.5} wet={wet} pts={[[-200, -440], [-90, -425], [60, -425], [190, -440], [aL.end.x, aL.end.y + 40], [aR.end.x, aR.end.y + 40]]} />
      </g>
      {wet > 0 && <ellipse cx={0} cy={0} rx={260} ry={26} fill="#5b7a92" opacity={0.35 * wet} />}
    </>
  );

  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <radialGradient id={`${id}-faceShade`} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1030" stopOpacity={0.4} />
        </radialGradient>
        <linearGradient id={`${id}-down`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={`${id}-bodyShade`} x1="0" x2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.4} />
          <stop offset="0.45" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>{body}</g>
    </g>
  );
};

// from behind: curly back of the head, the hood, the backpack with the lightning pin
const KostyaBack: React.FC<{s: KostyaState; light: TemaLight; id: string; crop?: number; L: typeof KOSTYA_LOOK}> = ({s, light, id, crop, L}) => {
  const b = s.breathe * 6, age = clamp(s.age ?? 0), wet = clamp(s.wet ?? 0);
  const stoop = age * age * 40;
  const arm = (side: number) => {
    const shp = {x: side * 184, y: -925 + b}, mid = {x: side * 232, y: -735 + b}, end = {x: side * 236, y: -545};
    return {d: `M ${shp.x} ${shp.y} Q ${lerp(shp.x, mid.x, 0.5) + side * 14} ${lerp(shp.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, end.x, 0.5)} ${lerp(mid.y, end.y, 0.5)} ${end.x} ${end.y}`, end};
  };
  return (
    <g clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <linearGradient id={`${id}-bdown`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.1} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>
        <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 24} -6 L ${sd * 24} -66 L ${sd * 166} -66 L ${sd * 172} -6 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />)}
        <g transform={`translate(0 ${-LEG})`}>
          {[-1, 1].map((sd) => {
            const a = arm(sd);
            return (
              <g key={sd}>
                <path d={a.d} stroke={L.ink} strokeWidth={74 + OW * 2} strokeLinecap="round" fill="none" />
                <path d={a.d} stroke={L.jacket} strokeWidth={74} strokeLinecap="round" fill="none" />
                <ellipse cx={a.end.x} cy={a.end.y + 10} rx={35} ry={41} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
              </g>
            );
          })}
          <g transform={`translate(0 ${b * 0.5})`}>
            <path d="M -236 -966 C -250 -900 -246 -820 -240 -440 C -160 -420 160 -420 240 -440 C 246 -820 250 -900 236 -966 C 120 -990 -120 -990 -236 -966 Z" fill={L.jacket} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            {/* the hood lying on the shoulders */}
            <path d="M -160 -980 C -170 -880 170 -880 160 -980 C 100 -1010 -100 -1010 -160 -980 Z" fill={L.hood} stroke={L.ink} strokeWidth={OW} />
            {/* backpack */}
            <rect x={-170} y={-900} width={340} height={400} rx={60} fill={L.pack} stroke={L.ink} strokeWidth={OW} />
            <rect x={-120} y={-700} width={240} height={160} rx={30} fill={L.packShade} stroke={L.ink} strokeWidth={OW * 0.8} />
            <path d="M -110 -880 C -60 -930 60 -930 110 -880" stroke={L.strap} strokeWidth={22} fill="none" strokeLinecap="round" />
            <Bolt x={90} y={-800} c={L.pin} />
            <path d="M -236 -966 L -240 -440 L 240 -440 L 236 -966 Z" fill={`url(#${id}-bdown)`} opacity={0.5} />
          </g>
          <rect x={-38} y={-1060 + stoop} width={76} height={100 - stoop} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
          <g transform={`translate(0 ${b * 0.6 + stoop}) rotate(${s.turn * 4 + (s.tilt ?? 0)} 0 -1100)`}>
            {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 218} cy={-1205} rx={34} ry={48} fill={L.skin} stroke={L.ink} strokeWidth={OW} />)}
            <path d={curlyBack(age * age * 56)} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d="M -226 -1180 C -230 -1100 -150 -1050 -60 -1046 L 60 -1046 C 150 -1050 230 -1100 226 -1180 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            {wet < 0.3 && [[-120, -1420], [0, -1470], [120, -1420], [-160, -1280], [160, -1280], [0, -1330]].map(([cx, cy], i) => (
              <path key={i} d={`M ${cx - 20} ${cy + 8} q 20 -28 40 0`} stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
            ))}
            {/* headphones band over the neck */}
            <path d="M -150 -1010 C -120 -960 120 -960 150 -1010" stroke={L.phones} strokeWidth={26} fill="none" strokeLinecap="round" />
          </g>
          <Drips t={s.t} wet={wet} pts={[[-200, -440], [0, -430], [200, -440]]} />
        </g>
      </g>
    </g>
  );
};
