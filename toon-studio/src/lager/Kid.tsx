// «Кто лишний?»: one doll for every camper and the counsellor. Same family as Tyoma (big head, huge eyes, thin neck),
// built on Tyoma's rig. A `KidLook` picks the hair (hedgehog / braids / wet / long / bowl / bob / bun), clothes
// (tee + shorts or a dress, or the counsellor's shirt), colours and extras (panama, glasses, towel, whistle, clipboard).
// `tall` (0..1) stretches the legs and body for the 19-year-old counsellor. `uncanny` (0..1): Olya's little tells —
// no eye shine, a fixed smile, slightly paler skin (used only for 1–2 frames, the answer of the puzzle).
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

export type Hair = 'hedgehog' | 'braids' | 'wet' | 'long' | 'bowl' | 'bob' | 'bun' | 'curly' | 'counsellor';
export type KidLook = {
  hair: Hair; hairC: string; hairL: string;
  skin?: string; skinShade?: string; skinDark?: string;
  top: string; topShade: string;        // tee / dress / shirt
  bottom: string;                       // shorts / skirt colour (ignored for a dress)
  dress?: boolean; shirt?: boolean;     // white dress (Olya) / counsellor's shirt with a collar
  stripe?: string;                      // a stripe across the tee
  socks?: string; shoe?: string;
  iris?: string; freckles?: boolean;
  panama?: string; glasses?: boolean; towel?: string; whistle?: boolean; clipboard?: boolean;
  chubby?: number;                      // 0..1 rounder body (Vova)
  // 1980s camp wardrobe
  topType?: 'tee' | 'tank' | 'blouse' | 'tel' | 'plaid' | 'sailor' | 'track';
  pat?: string;                         // stripe / check / collar colour of the top
  bottomType?: 'shorts' | 'skirt' | 'trousers' | 'suspenders';
  sundress?: string;                    // sundress colour over the blouse (lk.top = blouse)
  dots?: string;                        // polka dots on the dress / sundress / skirt
  hat?: 'cap' | 'kerchief' | 'bows' | 'headband'; hatC?: string;
  shoes?: 'sandals' | 'keds' | 'shoes';
  kneeSocks?: boolean; zelenka?: boolean; plaster?: boolean;
  prop?: 'net' | 'ball' | 'book';
};

export const LOOKS: Record<string, KidLook> = {
  // 1. Vova: white panama, a white vest (майка), shorts on suspenders, green-dotted knees, sandals with socks
  vova: {hair: 'hedgehog', hairC: '#6b4a2e', hairL: '#8c6643', top: '#f2f0ea', topShade: '#d2cfc6', topType: 'tank', bottom: '#5a4a3a', bottomType: 'suspenders', pat: '#3a5a8a',
    socks: '#f3f3f3', shoes: 'sandals', shoe: '#7a4e2c', panama: '#f2ecd8', chubby: 1, zelenka: true, iris: '#5d4430'},
  // 2. Lena: braids with big white bows, round glasses, a yellow polka-dot sundress over a white blouse, knee socks, a book
  lena: {hair: 'braids', hairC: '#a8522b', hairL: '#cf7443', top: '#f4f2ec', topShade: '#d6d3cb', bottom: '#e1b93a', dress: true, sundress: '#e1b93a', dots: '#fff6d8',
    hat: 'bows', hatC: '#f6f6f6', glasses: true, freckles: true, socks: '#f6f6f6', kneeSocks: true, shoes: 'shoes', shoe: '#8a2f3a', prop: 'book', iris: '#4f7a3a'},
  // 3. Misha: wet hair, a striped sailor vest (тельняшка), a towel round the neck, shorts, a plaster on the knee, keds
  misha: {hair: 'wet', hairC: '#231a16', hairL: '#3b2e28', top: '#f2f2f2', topShade: '#cfd4dc', topType: 'tel', pat: '#2a3f73', bottom: '#33384a', towel: '#d24a4a',
    socks: '#c9cbd2', shoes: 'keds', shoe: '#e8e6e0', plaster: true, iris: '#5a6f86'},
  // 4. Olya: long fair hair, a plain old-fashioned white dress, white socks, pale sandals. Nothing stands out — on purpose.
  olya: {hair: 'long', hairC: '#e8d39a', hairL: '#f7e8bd', top: '#f1efe9', topShade: '#cfccc4', bottom: '#f1efe9', dress: true, hat: 'headband', hatC: '#f1efe9',
    socks: '#f6f6f6', shoes: 'sandals', shoe: '#c9b9a0', iris: '#7a9ab8'},
  // background campers — each one dressed differently
  k5: {hair: 'bowl', hairC: '#3b2a22', hairL: '#5f4636', top: '#c4473f', topShade: '#9b342e', topType: 'plaid', pat: '#5a1e1a', bottom: '#2c3550', hat: 'cap', hatC: '#2f6db0', shoes: 'keds', shoe: '#e8e6e0', iris: '#5d4430'},
  k6: {hair: 'bob', hairC: '#1f1a18', hairL: '#3e3430', top: '#f4f2ec', topShade: '#d6d3cb', topType: 'blouse', bottom: '#2f5a9a', bottomType: 'skirt', hat: 'kerchief', hatC: '#e0405a', shoes: 'shoes', shoe: '#3a3a40', kneeSocks: true, iris: '#4a3a2c'},
  k7: {hair: 'curly', hairC: '#c98a3c', hairL: '#e2a95c', top: '#f2f2f2', topShade: '#cfd4dc', topType: 'sailor', pat: '#2a3f73', bottom: '#2a3f73', freckles: true, zelenka: true, shoes: 'sandals', shoe: '#7a4e2c', iris: '#4f7a3a'},
  k8: {hair: 'bun', hairC: '#5a3424', hairL: '#7c4c36', top: '#f4f2ec', topShade: '#d6d3cb', bottom: '#3c9a7a', dress: true, sundress: '#3c9a7a', dots: '#f6f6f6', hat: 'bows', hatC: '#e0405a', shoes: 'sandals', shoe: '#c97a4a', iris: '#5d4430'},
  k9: {hair: 'hedgehog', hairC: '#d9c290', hairL: '#efdcae', top: '#f2f0ea', topShade: '#d2cfc6', topType: 'tank', bottom: '#3d4a6a', bottomType: 'suspenders', pat: '#8a2f3a', prop: 'net', plaster: true, shoes: 'keds', shoe: '#e8e6e0', iris: '#6a8bb5'},
  k10: {hair: 'braids', hairC: '#2b1e19', hairL: '#4a352c', top: '#e05f8a', topShade: '#b8476c', topType: 'blouse', bottom: '#5a3a6a', bottomType: 'skirt', dots: '#f6d0e0', hat: 'bows', hatC: '#f6f6f6', kneeSocks: true, socks: '#f6f6f6', shoes: 'shoes', shoe: '#8a2f3a', iris: '#4a3a2c'},
  k11: {hair: 'bowl', hairC: '#a8522b', hairL: '#cf7443', top: '#2f4fa0', topShade: '#22397a', topType: 'track', pat: '#f2f2f2', bottom: '#2f4fa0', bottomType: 'trousers', freckles: true, shoes: 'keds', shoe: '#e8e6e0', iris: '#5a6f86'},
  k12: {hair: 'bob', hairC: '#e2c88a', hairL: '#f5e3b2', top: '#e85a4a', topShade: '#c0443a', bottom: '#e85a4a', dress: true, dots: '#f6f6f6', hat: 'headband', hatC: '#f0c23a', socks: '#f6f6f6', shoes: 'sandals', shoe: '#c9b9a0', iris: '#6a8bb5'},
  k13: {hair: 'curly', hairC: '#1f1a18', hairL: '#3e3430', top: '#f0c23a', topShade: '#c89d22', bottom: '#3d4a6a', hat: 'cap', hatC: '#c4473f', prop: 'ball', zelenka: true, shoes: 'keds', shoe: '#e8e6e0', iris: '#4a3a2c'},
  // you, the counsellor
  counsellor: {hair: 'counsellor', hairC: '#4a3426', hairL: '#6d4f3a', top: '#f2f0ea', topShade: '#d2cfc6', bottom: '#2e3a52', shirt: true, whistle: true, clipboard: true, socks: '#2e3a52', shoe: '#2b2b30', iris: '#5a6f86'},
};

export type KidState = {
  blink: number; lookX: number; lookY: number; fear: number; mouth: number; smile: number; breathe: number;
  hands: number;   // 0 down .. 1 palms at the mouth
  wave?: number;   // 0..1 right hand up, waving
  reach?: number;  // 0..1 left hand reaches out to the side (holding someone's hand)
  sing?: number;   // 0..1 mouth moves on its own (singing at the campfire)
  turn: number; tremble: number; t: number;
  uncanny?: number;
};
export const KID_REST: KidState = {blink: 1, lookX: 0, lookY: 0, fear: 0, mouth: 0, smile: 0, breathe: 0, hands: 0, turn: 0, tremble: 0, t: 0};

const INK = '#14121c', OW = 7;
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};
const P = (x: number, y: number) => ({x, y});
type Pt = {x: number; y: number};

// hair drawn over the head (front view); headY is the eye-line anchor (-1225 at rest)
const HairFront: React.FC<{lk: KidLook; hy: number; tx: number}> = ({lk, hy, tx}) => {
  const c = lk.hairC, l = lk.hairL, o = hy + 1225; // offset from the rest pose
  const T = (d: string) => <path d={d} transform={`translate(${tx * 0.3} ${o})`} fill={c} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />;
  const shine = <path d="M -150 -1420 C -90 -1470 40 -1478 120 -1440" transform={`translate(${tx * 0.3} ${o})`} stroke={l} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />;
  switch (lk.hair) {
    case 'hedgehog':
      return <>{T('M -224 -1250 C -236 -1390 -150 -1480 0 -1482 C 150 -1484 236 -1392 224 -1252 L 206 -1310 L 180 -1372 L 140 -1356 L 120 -1400 L 80 -1372 L 50 -1414 L 16 -1378 L -20 -1416 L -54 -1376 L -92 -1408 L -122 -1362 L -160 -1386 L -186 -1340 Z')}
        {[-150, -90, -30, 30, 90, 150].map((x) => <path key={x} transform={`translate(${tx * 0.3} ${o})`} d={`M ${x - 18} ${-1450 + Math.abs(x) * 0.25} l 18 -40 l 18 40`} fill={c} stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />)}</>;
    case 'wet':
      // flat, dark, stuck to the forehead in strands, drips
      return <>{T('M -228 -1200 C -246 -1385 -152 -1490 0 -1492 C 152 -1494 248 -1388 228 -1200 L 210 -1150 L 196 -1290 L 160 -1330 L 150 -1250 L 120 -1340 L 80 -1350 L 70 -1270 L 40 -1352 L 0 -1356 L -20 -1262 L -50 -1352 L -96 -1346 L -110 -1268 L -140 -1334 L -186 -1310 L -204 -1160 Z')}
        <path d="M -140 -1440 C -60 -1478 60 -1478 140 -1440" transform={`translate(${tx * 0.3} ${o})`} stroke={l} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9} />
        {[[-180, -1150], [72, -1262], [-108, -1262]].map(([x, y], i) => <ellipse key={i} cx={x + tx * 0.3} cy={y + o + 22} rx={8} ry={13} fill="#aac8de" stroke={INK} strokeWidth={3} />)}</>;
    case 'braids':
    case 'long':
    case 'bob':
    case 'bun':
    case 'bowl':
    case 'curly':
    case 'counsellor':
    default: {
      // fringe shapes per style
      const fringe = lk.hair === 'bowl'
        ? 'M -232 -1190 C -250 -1390 -150 -1496 0 -1498 C 150 -1500 250 -1390 232 -1190 L 220 -1300 C 120 -1320 -120 -1320 -220 -1300 Z'
        : lk.hair === 'curly'
          ? 'M -238 -1220 C -280 -1300 -250 -1400 -190 -1440 C -170 -1500 -90 -1530 -30 -1510 C 20 -1540 110 -1530 150 -1480 C 220 -1470 270 -1390 246 -1310 C 270 -1260 250 -1210 236 -1200 L 210 -1300 C 180 -1250 140 -1300 120 -1340 C 90 -1300 40 -1310 20 -1350 C -10 -1300 -70 -1310 -80 -1350 C -110 -1300 -170 -1300 -200 -1300 Z'
          : lk.hair === 'counsellor'
            ? 'M -226 -1236 C -244 -1388 -150 -1496 0 -1498 C 150 -1500 246 -1392 226 -1236 L 206 -1316 C 160 -1380 60 -1386 -10 -1350 C -60 -1330 -120 -1340 -160 -1380 C -190 -1360 -206 -1310 -210 -1280 Z'
            : 'M -228 -1230 C -246 -1385 -152 -1496 0 -1498 C 152 -1500 248 -1392 230 -1236 L 210 -1300 C 186 -1360 120 -1372 70 -1356 C 40 -1330 0 -1320 -20 -1352 C -60 -1376 -150 -1370 -196 -1316 Z';
      return <>{T(fringe)}{shine}</>;
    }
  }
};

// hair parts BEHIND the head (long hair, braids, bun, bob)
const HairBack: React.FC<{lk: KidLook; hy: number; tx: number; back?: boolean}> = ({lk, hy, tx, back}) => {
  const c = lk.hairC, o = hy + 1225, X = tx * 0.2;
  const g = (d: string, k?: number) => <path key={k} d={d} transform={`translate(${X} ${o})`} fill={c} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />;
  if (lk.hair === 'long') return g('M -236 -1260 C -260 -1080 -250 -900 -200 -800 C -120 -770 120 -770 200 -800 C 250 -900 260 -1080 236 -1260 Z');
  if (lk.hair === 'bob') return g('M -240 -1260 C -262 -1140 -250 -1060 -220 -1030 C -120 -1010 120 -1010 220 -1030 C 250 -1060 262 -1140 240 -1260 Z');
  if (lk.hair === 'bun') return g('M -70 -1500 C -90 -1600 90 -1600 70 -1500 C 40 -1480 -40 -1480 -70 -1500 Z');
  if (lk.hair === 'braids') {
    return <>{[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${X} ${o})`}>
        {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={sd * (226 + k * 6)} cy={-1150 + k * 64} rx={38 - k * 3} ry={40} fill={c} stroke={INK} strokeWidth={OW} />)}
        <rect x={sd * 250 - 20} y={-930} width={40} height={20} rx={8} fill="#e0405a" stroke={INK} strokeWidth={OW * 0.7} />
        <path d={`M ${sd * 250 - 18} -906 L ${sd * 250} -850 L ${sd * 250 + 18} -906 Z`} fill={c} stroke={INK} strokeWidth={OW * 0.8} />
      </g>
    ))}</>;
  }
  if (back && (lk.hair === 'curly')) return null;
  return null;
};

const Panama: React.FC<{c: string; hy: number; tx: number}> = ({c, hy, tx}) => (
  <g transform={`translate(${tx * 0.3} ${hy + 1225})`}>
    <path d="M -290 -1340 C -200 -1380 200 -1380 290 -1340 C 250 -1310 -250 -1310 -290 -1340 Z" fill={mixC(c, '#000000', 0.12)} stroke={INK} strokeWidth={OW} />
    <path d="M -200 -1350 C -210 -1490 -110 -1540 0 -1540 C 110 -1540 210 -1490 200 -1350 Z" fill={c} stroke={INK} strokeWidth={OW} />
    <path d="M -196 -1380 C -100 -1400 100 -1400 196 -1380" stroke="#3f7fc4" strokeWidth={16} fill="none" />
  </g>
);

// cap with a visor, a knotted headscarf, big nylon bows, a hair band
const Hat: React.FC<{lk: KidLook; hy: number; tx: number; back?: boolean}> = ({lk, hy, tx, back}) => {
  const c = lk.hatC ?? '#c4473f', X = back ? 0 : tx * 0.3, o = hy + 1225;
  const bow = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M 0 0 C -60 -70 -130 -40 -120 10 C -110 60 -50 50 0 0 Z M 0 0 C 60 -70 130 -40 120 10 C 110 60 50 50 0 0 Z" fill={c} stroke={INK} strokeWidth={OW / s} strokeLinejoin="round" />
      <path d="M -80 -10 C -60 -20 -40 -10 -20 0 M 80 -10 C 60 -20 40 -10 20 0" stroke={mixC(c, '#000000', 0.2)} strokeWidth={6 / s} fill="none" />
      <ellipse cx={0} cy={0} rx={22} ry={26} fill={mixC(c, '#000000', 0.08)} stroke={INK} strokeWidth={OW / s} />
    </g>
  );
  switch (lk.hat) {
    case 'cap':
      return (
        <g transform={`translate(${X} ${o})`}>
          <path d="M -232 -1300 C -240 -1460 -130 -1520 0 -1520 C 130 -1520 240 -1460 232 -1300 C 120 -1330 -120 -1330 -232 -1300 Z" fill={c} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-1, 0, 1].map((k) => <path key={k} d={`M ${k * 90} -1515 Q ${k * 120} -1420 ${k * 140} -1318`} stroke={mixC(c, '#000000', 0.25)} strokeWidth={6} fill="none" />)}
          <circle cx={0} cy={-1520} r={16} fill={c} stroke={INK} strokeWidth={OW * 0.7} />
          {!back && <path d="M -230 -1300 C -120 -1340 120 -1340 230 -1300 C 200 -1250 -200 -1250 -230 -1300 Z" fill={mixC(c, '#000000', 0.18)} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />}
        </g>
      );
    case 'kerchief':
      return (
        <g transform={`translate(${X} ${o})`}>
          <path d="M -240 -1250 C -250 -1420 -140 -1520 0 -1520 C 140 -1520 250 -1420 240 -1250 C 160 -1330 -160 -1330 -240 -1250 Z" fill={c} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[[-120, -1440], [0, -1470], [120, -1440], [-60, -1380], [60, -1380]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill="#f6f6f6" opacity={0.85} />)}
          {/* the knot and ends at the nape, seen on the right */}
          <path d="M 220 -1230 L 290 -1170 L 250 -1140 Z M 220 -1230 L 260 -1120 L 220 -1110 Z" fill={c} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        </g>
      );
    case 'bows':
      // a big bow on top; braids also get bows at their ends (drawn with the braids)
      return <g transform={`translate(${X} ${o})`}>{lk.hair === 'braids' ? [bow(-210, -1330, 0.9, 1), bow(210, -1330, 0.9, 2)] : bow(0, -1500, 1.2, 0)}</g>;
    case 'headband':
      return <path transform={`translate(${X} ${o})`} d="M -222 -1300 C -200 -1470 200 -1470 222 -1300" stroke={INK} strokeWidth={34 + OW * 2} fill="none" strokeLinecap="round" />;
    default:
      return null;
  }
};
const HeadbandFill: React.FC<{lk: KidLook; hy: number; tx: number}> = ({lk, hy, tx}) =>
  lk.hat === 'headband' ? <path transform={`translate(${tx * 0.3} ${hy + 1225})`} d="M -222 -1300 C -200 -1470 200 -1470 222 -1300" stroke={lk.hatC ?? '#f0c23a'} strokeWidth={34} fill="none" strokeLinecap="round" /> : null;

export const Kid: React.FC<{lk: KidLook; s: KidState; light: TemaLight; id?: string; tall?: number; crop?: number; view?: 'front' | 'back'}> = ({lk, s, light, id = 'kid', tall = 0, crop, view = 'front'}) => {
  const un = clamp(s.uncanny ?? 0);
  const skin = mixC(lk.skin ?? '#efc4a6', '#e6ddd6', un * 0.6), skinShade = mixC(lk.skinShade ?? '#d39d84', '#c9bdb6', un * 0.6), skinDark = lk.skinDark ?? '#b77d68';
  const UP = tall * 300; // the counsellor: longer legs
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const headY = -1225 - UP + b * 0.6;
  const tx = s.turn * 26, hx = tr * 0.6;
  const wide = 1 + (lk.chubby ?? 0) * 0.16;
  const TW = 164 * wide;
  const singM = s.sing ? clamp(s.sing) * (0.25 + 0.25 * Math.sin(s.t * 9) + 0.15 * Math.sin(s.t * 14 + 1)) : 0;
  const mo = clamp(s.mouth + singM);
  const sm = Math.max(clamp(s.smile), un * 0.8);
  const back = view === 'back';

  const eye = (side: number) => {
    const cx = side * 88 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 10;
    const rx = 64 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 76 * (1 + 0.06 * s.fear) * (tall > 0.5 ? 0.9 : 1);
    const irisR = 38 * (1 - 0.22 * s.fear), pupR = 19 * (1 - 0.5 * s.fear) * (1 - un * 0.3);
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const open = clamp(s.blink), lidY = cy - ry + (1 - open) * ry * 2;
    const clip = `${id}-eye${side}`;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#f4f1ec" />
        <g clipPath={`url(#${clip})`}>
          <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
          <circle cx={ix} cy={iy} r={irisR} fill={lk.iris ?? '#6a8bb5'} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={mixC(lk.iris ?? '#6a8bb5', '#000000', 0.4)} strokeWidth={7} />
          <circle cx={ix} cy={iy} r={pupR} fill="#0d0f19" />
          {un < 0.5 && <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={9} fill="#fff" />}
          {un < 0.5 && <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={skinShade} />
          {sm > 0.2 && <ellipse cx={cx} cy={cy + ry + 10} rx={rx + 6} ry={ry * 0.45 * sm} fill={skin} />}
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={INK} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW} />
      </g>
    );
  };
  const brow = (side: number) => {
    const f = s.fear;
    const ix = side * 34 + tx + hx, ox = side * 150 + tx + hx;
    const iy = headY - 84 - 46 * f, oy = headY - 90 + 22 * f;
    const mx = lerp((ix + ox) / 2, ix + (ox - ix) * 0.3, f), my = lerp(Math.min(iy, oy) - 14, iy - 6, f);
    return <path key={`b${side}`} d={`M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`} stroke={mixC(lk.hairC, '#000000', 0.25)} strokeWidth={20} strokeLinecap="round" fill="none" />;
  };

  // arms: shoulder → elbow → hand targets
  const shY = -925 - UP + b;
  const arm = (side: number) => {
    const sh = P(side * (TW + 16), shY + 20);
    let hand: Pt = P(side * (TW + 78), -540 - UP), mid: Pt = P(side * (TW + 74), -735 - UP);
    const k = clamp(s.hands);
    hand = {x: lerp(hand.x, side * 62 + tx * 0.8, k), y: lerp(hand.y, headY + 150, k)};
    mid = {x: lerp(mid.x, side * 168, k), y: lerp(mid.y, -790 - UP, k)};
    const w = clamp(s.wave ?? 0), r = clamp(s.reach ?? 0);
    if (side > 0 && w > 0) { const sw = Math.sin(s.t * 10) * 40; hand = {x: lerp(hand.x, 330 + sw, w), y: lerp(hand.y, headY - 60, w)}; mid = {x: lerp(mid.x, 330, w), y: lerp(mid.y, shY + 80, w)}; }
    if (side < 0 && r > 0) { hand = {x: lerp(hand.x, -470, r), y: lerp(hand.y, shY + 230, r)}; mid = {x: lerp(mid.x, -330, r), y: lerp(mid.y, shY + 120, r)}; }
    if (lk.clipboard && side < 0 && k < 0.5 && r < 0.5) { hand = P(-120, -700 - UP); mid = P(-250, -720 - UP); }
    hand = {x: hand.x + tr, y: hand.y + tr * 0.5};
    const d = `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.5) + side * 14} ${lerp(sh.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, hand.x, 0.5) + side * 10} ${lerp(mid.y, hand.y, 0.5)} ${hand.x} ${hand.y}`;
    // short sleeve: only the first part of the arm is cloth
    const sl = `M ${sh.x} ${sh.y} Q ${lerp(sh.x, mid.x, 0.3) + side * 8} ${lerp(sh.y, mid.y, 0.3)} ${lerp(sh.x, mid.x, 0.55)} ${lerp(sh.y, mid.y, 0.55)}`;
    return {d, sl, hand, mid};
  };
  const aL = arm(-1), aR = arm(1);
  const limb = (a: {d: string; sl: string}) => (
    <>
      <path d={a.d} stroke={INK} strokeWidth={62 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={skin} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {lk.topType === 'track' && <>
        <path d={a.d} stroke={INK} strokeWidth={80 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={a.d} stroke={lk.top} strokeWidth={80} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d={a.d} stroke={lk.pat ?? '#f2f2f2'} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>}
      {!lk.dress && lk.topType !== 'tank' && lk.topType !== 'track' && <>
        <path d={a.sl} stroke={INK} strokeWidth={84 + OW * 2} strokeLinecap="round" fill="none" />
        <path d={a.sl} stroke={lk.top} strokeWidth={84} strokeLinecap="round" fill="none" />
        {lk.topType === 'tel' && <path d={a.sl} stroke={lk.pat} strokeWidth={84} strokeDasharray="14 18" fill="none" />}
        {lk.topType === 'plaid' && <path d={a.sl} stroke={lk.pat} strokeWidth={84} strokeDasharray="8 26" fill="none" opacity={0.6} />}
      </>}
      {lk.dress && <>
        <path d={a.sl} stroke={INK} strokeWidth={76 + OW * 2} strokeLinecap="round" fill="none" />
        <path d={a.sl} stroke={lk.top} strokeWidth={76} strokeLinecap="round" fill="none" />
      </>}
    </>
  );
  const handG = (a: {hand: Pt}, side: number) => {
    const {x, y} = a.hand, k = clamp(s.hands), w = side > 0 ? clamp(s.wave ?? 0) : 0;
    const rot = lerp(side * 10, side * -35, Math.max(k, w));
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <ellipse cx={0} cy={6} rx={38} ry={44} fill={skin} stroke={INK} strokeWidth={OW} />
        {[-22, -7, 8, 23].map((fx, i) => (
          <rect key={i} x={fx - 8} y={k > 0.5 || w > 0.5 ? -60 + Math.abs(fx) * 0.4 : 28} width={16} height={k > 0.5 || w > 0.5 ? 46 : 40} rx={8}
            fill={skin} stroke={INK} strokeWidth={OW * 0.8} />
        ))}
      </g>
    );
  };

  // body
  const torso = `M ${-TW} ${-962 - UP} C ${-TW - 44} ${-950 - UP} ${-TW - 58} ${-895 - UP} ${-TW - 54} ${-815 - UP} L ${-TW - 42} ${-478 - UP} C ${-TW * 0.84} ${-458 - UP} ${TW * 0.84} ${-458 - UP} ${TW + 42} ${-478 - UP} L ${TW + 54} ${-815 - UP} C ${TW + 58} ${-895 - UP} ${TW + 44} ${-950 - UP} ${TW} ${-962 - UP} C ${TW * 0.62} ${-984 - UP} ${-TW * 0.62} ${-984 - UP} ${-TW} ${-962 - UP} Z`;
  const dress = `M ${-TW} ${-962 - UP} C ${-TW - 44} ${-950 - UP} ${-TW - 50} ${-880 - UP} ${-TW - 40} ${-760 - UP} L -300 -300 C -150 -270 150 -270 300 -300 L ${TW + 40} ${-760 - UP} C ${TW + 50} ${-880 - UP} ${TW + 44} ${-950 - UP} ${TW} ${-962 - UP} C ${TW * 0.62} ${-984 - UP} ${-TW * 0.62} ${-984 - UP} ${-TW} ${-962 - UP} Z`;
  const legTop = lk.dress ? -330 : -485 - UP;
  const bt = lk.bottomType ?? 'shorts';
  const trousers = tall > 0.5 || bt === 'trousers';
  const socksTop = lk.kneeSocks ? -300 : -150;
  const legs = (
    <>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 150} ${legTop} L ${sd * 132} -60 L ${sd * 52} -60 L ${sd * 40} ${legTop} Z`} fill={skin} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {/* knees: green antiseptic dots (зелёнка) / a sticking plaster */}
          {lk.zelenka && !trousers && <>
            <ellipse cx={sd * 92} cy={-250} rx={20} ry={16} fill="#2fa84a" opacity={0.85} />
            <ellipse cx={sd * 104} cy={-226} rx={9} ry={8} fill="#2fa84a" opacity={0.8} />
          </>}
          {lk.plaster && sd < 0 && !trousers && <g transform="translate(-92 -250) rotate(-20)">
            <rect x={-34} y={-12} width={68} height={24} rx={8} fill="#e8c9a0" stroke={INK} strokeWidth={4} />
            <rect x={-12} y={-12} width={24} height={24} fill="#d9b48a" />
          </g>}
          {trousers && <path d={`M ${sd * 168} ${legTop} L ${sd * 150} -60 L ${sd * 30} -60 L ${sd * 18} ${legTop} Z`} fill={lk.bottom} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />}
          {trousers && bt === 'trousers' && <path d={`M ${sd * 160} ${legTop} L ${sd * 142} -70`} stroke={lk.pat ?? '#f2f2f2'} strokeWidth={12} />}
          {!trousers && <path d={`M ${sd * (lk.kneeSocks ? 142 : 136)} ${socksTop} L ${sd * 132} -60 L ${sd * 52} -60 L ${sd * (lk.kneeSocks ? 44 : 50)} ${socksTop} Z`} fill={lk.socks ?? '#f3f3f3'} stroke={INK} strokeWidth={OW * 0.8} />}
          {lk.kneeSocks && !trousers && <path d={`M ${sd * 142} ${socksTop + 18} L ${sd * 44} ${socksTop + 18}`} stroke={mixC(lk.socks ?? '#f3f3f3', '#000000', 0.15)} strokeWidth={8} />}
          <path d={`M ${sd * 40} -10 L ${sd * 40} -70 L ${sd * 150} -70 C ${sd * 190} -60 ${sd * 196} -26 ${sd * 186} -10 Z`}
            fill={lk.shoes === 'sandals' ? (lk.socks ?? '#f3f3f3') : (lk.shoe ?? '#3a3a40')} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {/* sandals: a sole and leather straps over the sock */}
          {lk.shoes === 'sandals' && <>
            <path d={`M ${sd * 36} -10 L ${sd * 190} -10 L ${sd * 190} -26 L ${sd * 36} -26 Z`} fill={lk.shoe ?? '#7a4e2c'} stroke={INK} strokeWidth={OW * 0.7} />
            {[70, 110, 150].map((x) => <path key={x} d={`M ${sd * x} -24 L ${sd * (x - 6)} -70`} stroke={lk.shoe ?? '#7a4e2c'} strokeWidth={16} />)}
            <path d={`M ${sd * 44} -54 L ${sd * 150} -60`} stroke={lk.shoe ?? '#7a4e2c'} strokeWidth={14} />
          </>}
          {/* keds: a white rubber sole and a toe cap */}
          {lk.shoes === 'keds' && <>
            <path d={`M ${sd * 36} -10 L ${sd * 190} -10 L ${sd * 190} -28 L ${sd * 36} -28 Z`} fill="#f6f4ee" stroke={INK} strokeWidth={OW * 0.7} />
            <path d={`M ${sd * 140} -28 C ${sd * 170} -36 ${sd * 186} -50 ${sd * 168} -62`} stroke={INK} strokeWidth={5} fill="none" />
            {[70, 100].map((x) => <path key={x} d={`M ${sd * (x - 14)} -50 L ${sd * (x + 14)} -62`} stroke="#9aa4b4" strokeWidth={6} />)}
          </>}
        </g>
      ))}
      {/* shorts / skirt */}
      {!lk.dress && !trousers && bt !== 'skirt' && <path d={`M ${-TW - 40} ${-520 - UP} L ${-TW - 30} -330 L -14 -330 L 0 -440 L 14 -330 L ${TW + 30} -330 L ${TW + 40} ${-520 - UP} Z`} fill={lk.bottom} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />}
      {!lk.dress && bt === 'skirt' && <>
        <path d={`M ${-TW - 40} ${-520 - UP} L -290 -300 C -150 -280 150 -280 290 -300 L ${TW + 40} ${-520 - UP} Z`} fill={lk.dots ? `url(#${id}-dots)` : lk.bottom} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-150, -60, 30, 120, 200].map((x) => <path key={x} d={`M ${x * 0.7} -500 L ${x} -300`} stroke={mixC(lk.bottom, '#000000', 0.25)} strokeWidth={6} opacity={0.7} />)}
      </>}
    </>
  );

  // the light filter and grading are shared with Tyoma
  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-3000} width={3000} height={3000 + crop - UP} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <radialGradient id={`${id}-faceShade`} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1030" stopOpacity={0.4} />
        </radialGradient>
        <linearGradient id={`${id}-bodyShade`} x1="0" x2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.2} />
          <stop offset="0.45" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.12} />
        </linearGradient>
        {/* polka dots for dresses / skirts, stripes for the sailor vest, checks for the shirt */}
        <pattern id={`${id}-dots`} width={70} height={70} patternUnits="userSpaceOnUse">
          <rect width={70} height={70} fill={lk.sundress ?? lk.bottom ?? lk.top} />
          <circle cx={18} cy={18} r={11} fill={lk.dots ?? '#fff'} /><circle cx={53} cy={53} r={11} fill={lk.dots ?? '#fff'} />
        </pattern>
        <pattern id={`${id}-dotsTop`} width={70} height={70} patternUnits="userSpaceOnUse">
          <rect width={70} height={70} fill={lk.top} />
          <circle cx={18} cy={18} r={11} fill={lk.dots ?? '#fff'} /><circle cx={53} cy={53} r={11} fill={lk.dots ?? '#fff'} />
        </pattern>
        <pattern id={`${id}-tel`} width={40} height={44} patternUnits="userSpaceOnUse">
          <rect width={40} height={44} fill={lk.top} /><rect y={0} width={40} height={18} fill={lk.pat ?? '#2a3f73'} />
        </pattern>
        <pattern id={`${id}-plaid`} width={90} height={90} patternUnits="userSpaceOnUse">
          <rect width={90} height={90} fill={lk.top} />
          <rect x={0} y={30} width={90} height={22} fill={lk.pat ?? '#5a1e1a'} opacity={0.55} />
          <rect x={30} y={0} width={22} height={90} fill={lk.pat ?? '#5a1e1a'} opacity={0.55} />
          <rect x={0} y={74} width={90} height={5} fill="#f2e6c8" opacity={0.6} />
        </pattern>
      </defs>
      <g filter={`url(#${id}-light)`}>
        {!back && <HairBack lk={lk} hy={headY} tx={tx} />}
        {legs}
        {/* arms behind the body when down */}
                {back && <>{limb(aL)}{limb(aR)}</>}
        {/* torso / dress */}
        <g transform={`translate(0 ${b * 0.5})`}>
          <path d={lk.dress ? dress : torso} stroke={INK} strokeWidth={OW} strokeLinejoin="round"
            fill={lk.dress ? (!lk.sundress && lk.dots ? `url(#${id}-dotsTop)` : lk.top) : lk.topType === 'tel' ? `url(#${id}-tel)` : lk.topType === 'plaid' ? `url(#${id}-plaid)` : lk.top} />
          {/* sundress over the blouse: the bodice from the chest down + two straps */}
          {lk.dress && lk.sundress && <>
            <clipPath id={`${id}-sd`}><rect x={-600} y={-850} width={1200} height={700} /></clipPath>
            <path d={dress} clipPath={`url(#${id}-sd)`} fill={lk.dots ? `url(#${id}-dots)` : lk.sundress} stroke={INK} strokeWidth={OW} />
            <path d="M -205 -850 L 205 -850" stroke={INK} strokeWidth={OW} />
            {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 110} -850 L ${sd * 130} -968`} stroke={INK} strokeWidth={44 + OW * 2} />)}
            {[-1, 1].map((sd) => <path key={`f${sd}`} d={`M ${sd * 110} -850 L ${sd * 130} -968`} stroke={lk.sundress} strokeWidth={44} />)}
          </>}
          {/* white vest (майка): bare shoulders and a deep round neck */}
          {lk.topType === 'tank' && <>
            {/* bare chest and shoulders first, then the vest on narrow straps */}
            <path d={torso} fill={skin} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            <path d={`M ${-TW - 40} ${-478 - UP} L ${-TW - 46} ${-800 - UP} C ${-TW - 20} ${-850 - UP} -150 ${-900 - UP} -140 ${-975 - UP} L -90 ${-975 - UP} C ${back ? -70 : -80} ${back ? -940 - UP : -880 - UP} ${back ? 70 : 80} ${back ? -940 - UP : -880 - UP} 90 ${-975 - UP} L 140 ${-975 - UP} C 150 ${-900 - UP} ${TW + 20} ${-850 - UP} ${TW + 46} ${-800 - UP} L ${TW + 40} ${-478 - UP} C ${TW * 0.84} ${-458 - UP} ${-TW * 0.84} ${-458 - UP} ${-TW - 40} ${-478 - UP} Z`}
              fill={lk.top} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M ${-TW + 10 + k * TW * 0.38} ${-790 - UP} L ${-TW + 10 + k * TW * 0.38} ${-490 - UP}`} stroke={lk.topShade} strokeWidth={5} opacity={0.6} />)}
          </>}
          {/* blouse: round white collar + buttons */}
          {lk.topType === 'blouse' && !back && <>
            {[-1, 1].map((sd) => <path key={sd} d={`M 0 ${-962 - UP} C ${sd * 40} ${-990 - UP} ${sd * 150} ${-990 - UP} ${sd * 150} ${-950 - UP} C ${sd * 150} ${-900 - UP} ${sd * 60} ${-890 - UP} 0 ${-930 - UP} Z`} fill="#fbfaf6" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
            {[0, 1, 2].map((k) => <circle key={k} cx={0} cy={-860 - UP + k * 100} r={9} fill={lk.topShade} stroke={INK} strokeWidth={3} />)}
          </>}
          {/* sailor collar: a big square navy collar with white stripes and a red tie */}
          {lk.topType === 'sailor' && <>
            <path d={back ? `M -170 ${-975 - UP} L -170 ${-800 - UP} L 170 ${-800 - UP} L 170 ${-975 - UP} Z` : `M -170 ${-975 - UP} L -190 ${-880 - UP} L 0 ${-760 - UP} L 190 ${-880 - UP} L 170 ${-975 - UP} C 80 ${-940 - UP} -80 ${-940 - UP} -170 ${-975 - UP} Z`}
              fill={lk.pat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            <path d={back ? `M -150 ${-830 - UP} L 150 ${-830 - UP}` : `M -168 ${-890 - UP} L 0 ${-790 - UP} L 168 ${-890 - UP}`} stroke="#f2f2f2" strokeWidth={8} fill="none" />
            {!back && <path d={`M -30 ${-790 - UP} L 0 ${-760 - UP} L 30 ${-790 - UP} L 20 ${-690 - UP} L 0 ${-720 - UP} L -20 ${-690 - UP} Z`} fill="#c23a3a" stroke={INK} strokeWidth={OW * 0.7} strokeLinejoin="round" />}
          </>}
          {/* track top (олимпийка): zip, collar, white stripes on the shoulders */}
          {lk.topType === 'track' && <>
            {!back && <path d={`M 0 ${-960 - UP} L 0 ${-470 - UP}`} stroke="#c9ccd2" strokeWidth={8} />}
            <path d={`M -120 ${-985 - UP} C -60 ${-1005 - UP} 60 ${-1005 - UP} 120 ${-985 - UP} L 110 ${-950 - UP} C 60 ${-965 - UP} -60 ${-965 - UP} -110 ${-950 - UP} Z`} fill={lk.topShade} stroke={INK} strokeWidth={OW * 0.8} />
            <path d={`M ${-TW - 40} ${-500 - UP} L ${TW + 40} ${-500 - UP}`} stroke={lk.pat} strokeWidth={14} />
          </>}
          {lk.stripe &&<path d={`M ${-TW - 52} ${-760 - UP} L ${TW + 52} ${-760 - UP} L ${TW + 50} ${-700 - UP} L ${-TW - 50} ${-700 - UP} Z`} fill={lk.stripe} stroke={INK} strokeWidth={OW * 0.6} />}
          {lk.dress && !back && <path d="M -296 -330 C -150 -300 150 -300 296 -330" stroke={lk.topShade} strokeWidth={20} fill="none" />}
          {lk.dress && !back && [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 70} -900 L ${sd * 150} -330`} stroke={lk.topShade} strokeWidth={8} opacity={0.6} />)}
          <path d={lk.dress ? dress : torso} fill={`url(#${id}-bodyShade)`} />
          {/* neckline / collar */}
          {!back && !lk.shirt && !lk.topType && !lk.sundress && <path d={`M -100 ${-972 - UP} C -60 ${-910 - UP} 60 ${-910 - UP} 100 ${-972 - UP}`} stroke={lk.topShade} strokeWidth={18} fill="none" />}
          {!back && (lk.topType === 'tel' || lk.topType === 'plaid') && <path d={`M -100 ${-972 - UP} C -60 ${-910 - UP} 60 ${-910 - UP} 100 ${-972 - UP}`} stroke={lk.topShade} strokeWidth={14} fill="none" />}
          {/* shorts on suspenders: two straps with buttons */}
          {lk.bottomType === 'suspenders' && [-1, 1].map((sd) => (
            <g key={`su${sd}`}>
              <path d={`M ${sd * 90} ${-985 - UP} L ${sd * (back ? 60 : 110)} ${-510 - UP}`} stroke={INK} strokeWidth={30 + OW * 2} />
              <path d={`M ${sd * 90} ${-985 - UP} L ${sd * (back ? 60 : 110)} ${-510 - UP}`} stroke={lk.pat ?? '#3a5a8a'} strokeWidth={30} />
              {!back && <circle cx={sd * 110} cy={-530 - UP} r={14} fill="#d9c27a" stroke={INK} strokeWidth={4} />}
            </g>
          ))}
          {!back && lk.shirt && <>
            <path d={`M -130 ${-975 - UP} L -30 ${-880 - UP} L 0 ${-950 - UP} L 30 ${-880 - UP} L 130 ${-975 - UP} C 60 ${-1000 - UP} -60 ${-1000 - UP} -130 ${-975 - UP} Z`} fill={lk.topShade} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            <path d={`M 0 ${-930 - UP} L 0 ${-470 - UP}`} stroke={lk.topShade} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => <circle key={k} cx={0} cy={-850 - UP + k * 110} r={9} fill="#cfcabd" stroke={INK} strokeWidth={3} />)}
            <rect x={70} y={-860 - UP} width={90} height={80} rx={6} fill="none" stroke={lk.topShade} strokeWidth={6} />
            {/* trousers belt */}
            <rect x={-TW - 40} y={-500 - UP} width={(TW + 40) * 2} height={30} fill="#3a2a20" stroke={INK} strokeWidth={OW * 0.6} />
          </>}
          {/* towel round the neck */}
          {lk.towel && <>
            <path d={`M -150 ${-990 - UP} C -100 ${-920 - UP} 100 ${-920 - UP} 150 ${-990 - UP}`} stroke={INK} strokeWidth={70 + OW * 2} fill="none" strokeLinecap="round" />
            <path d={`M -150 ${-990 - UP} C -100 ${-920 - UP} 100 ${-920 - UP} 150 ${-990 - UP}`} stroke={lk.towel} strokeWidth={70} fill="none" strokeLinecap="round" />
            {!back && [-1, 1].map((sd) => <rect key={sd} x={sd * 120 - 40} y={-960 - UP} width={80} height={300} rx={14} fill={lk.towel} stroke={INK} strokeWidth={OW} />)}
            {!back && [-1, 1].map((sd) => <path key={`s${sd}`} d={`M ${sd * 120 - 40} ${-700 - UP} L ${sd * 120 + 40} ${-700 - UP}`} stroke="#f2f2f2" strokeWidth={14} />)}
          </>}
          {/* whistle on a cord */}
          {lk.whistle && !back && <>
            <path d={`M -90 ${-970 - UP} Q 0 ${-760 - UP} 90 ${-970 - UP}`} stroke="#c23a3a" strokeWidth={6} fill="none" />
            <rect x={-26} y={-800 - UP} width={52} height={30} rx={10} fill="#b8bcc4" stroke={INK} strokeWidth={OW * 0.7} />
          </>}
        </g>
        {/* neck */}
        <rect x={-42 + hx * 0.5} y={headY + 170} width={84} height={90} fill={skinShade} stroke={INK} strokeWidth={OW} />
        {/* head */}
        <g transform={`translate(${hx} 0) rotate(${s.turn * 3 + tr * 0.05} 0 ${-1100 - UP})`}>
          <ellipse cx={-212 + tx * 0.4} cy={headY + 10} rx={30} ry={50} fill={skin} stroke={INK} strokeWidth={OW} />
          <ellipse cx={212 + tx * 0.4} cy={headY + 10} rx={30} ry={50} fill={skin} stroke={INK} strokeWidth={OW} />
          {!back && <>
            <path transform={`translate(0 ${headY + 1225})`} d="M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z" fill={skin} stroke={INK} strokeWidth={OW} />
            <path transform={`translate(0 ${headY + 1225})`} d="M 0 -1462 C 132 -1462 218 -1380 220 -1255 C 222 -1150 176 -1060 95 -1016 C 55 -996 -55 -996 -95 -1016 C -176 -1060 -222 -1150 -220 -1255 C -218 -1380 -132 -1462 0 -1462 Z" fill={`url(#${id}-faceShade)`} />
            <ellipse cx={-130 + tx} cy={headY + 115} rx={40} ry={20} fill="#e49a8f" opacity={0.35 * (1 - un)} />
            <ellipse cx={130 + tx} cy={headY + 115} rx={40} ry={20} fill="#e49a8f" opacity={0.35 * (1 - un)} />
            {lk.freckles && [-1, 1].map((sd) => [0, 1, 2, 3].map((k) => <circle key={`${sd}${k}`} cx={sd * (100 + (k % 2) * 34) + tx} cy={headY + 96 + Math.floor(k / 2) * 22} r={6} fill="#c9784f" opacity={0.8} />))}
            {eye(-1)}{eye(1)}
            {lk.glasses && <g fill="none" stroke="#3a2a2a" strokeWidth={10}>
              <circle cx={-88 + tx} cy={headY + 10} r={88} /><circle cx={88 + tx} cy={headY + 10} r={88} />
              <path d={`M ${-6 + tx} ${headY} Q ${tx} ${headY - 16} ${6 + tx} ${headY}`} />
            </g>}
            <path d={`M ${tx * 1.1 - 10} ${headY + 60} Q ${tx * 1.1 + 6} ${headY + 82} ${tx * 1.1 + 18} ${headY + 66}`} stroke={skinDark} strokeWidth={8} fill="none" strokeLinecap="round" />
            {/* mouth: open / smile / neutral */}
            {mo > 0.08
              ? <>
                <ellipse cx={tx * 0.9 + hx} cy={headY + 128} rx={18 + 12 * mo} ry={5 + 26 * mo} fill="#3b141a" stroke={INK} strokeWidth={OW * 0.8} />
                {mo > 0.3 && <rect x={tx * 0.9 + hx - 12 - 6 * mo} y={headY + 128 - 5 - 26 * mo + 4} width={24 + 12 * mo} height={9} rx={4} fill="#f3eee6" />}
              </>
              : <path d={`M ${tx * 0.9 - 40 - 20 * sm} ${headY + 124 - 10 * sm} Q ${tx * 0.9} ${headY + 128 + 34 * sm} ${tx * 0.9 + 40 + 20 * sm} ${headY + 124 - 10 * sm}`} stroke={INK} strokeWidth={9} fill={sm > 0.5 ? '#3b141a' : 'none'} strokeLinecap="round" />}
            <HairFront lk={lk} hy={headY} tx={tx} />
            {brow(-1)}{brow(1)}
            {lk.panama && <Panama c={lk.panama} hy={headY} tx={tx} />}
            <Hat lk={lk} hy={headY} tx={tx} /><HeadbandFill lk={lk} hy={headY} tx={tx} />
          </>}
          {back && <>
            <path transform={`translate(0 ${headY + 1225})`} d="M 0 -1498 C 150 -1500 236 -1392 224 -1236 C 214 -1110 160 -1040 70 -1020 C 30 -1012 -30 -1012 -70 -1020 C -160 -1040 -214 -1110 -224 -1236 C -236 -1392 -150 -1500 0 -1498 Z"
              fill={lk.hair === 'hedgehog' || lk.hair === 'counsellor' || lk.hair === 'bowl' ? lk.hairC : lk.hairC} stroke={INK} strokeWidth={OW} />
            <HairBack lk={lk} hy={headY} tx={0} back />
            {lk.panama && <Panama c={lk.panama} hy={headY} tx={0} />}
            <Hat lk={lk} hy={headY} tx={0} back /><HeadbandFill lk={lk} hy={headY} tx={0} />
          </>}
        </g>
        {/* front arms */}
        {!back && <>{limb(aL)}{limb(aR)}</>}
        {!back && lk.clipboard && clamp(s.hands) < 0.5 && clamp(s.reach ?? 0) < 0.5 && (
          <g transform={`translate(-60 ${-760 - UP}) rotate(-8)`}>
            <rect x={-110} y={-150} width={220} height={290} rx={10} fill="#8a6a46" stroke={INK} strokeWidth={OW} />
            <rect x={-92} y={-128} width={184} height={248} fill="#f3eee0" stroke={INK} strokeWidth={OW * 0.6} />
            {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M -70 ${-96 + k * 36} L 70 ${-96 + k * 36}`} stroke="#6a7a9a" strokeWidth={6} />)}
            <rect x={-36} y={-168} width={72} height={34} rx={6} fill="#b8bcc4" stroke={INK} strokeWidth={OW * 0.6} />
          </g>
        )}
        {/* props in the right hand (only when the hand is down) */}
        {lk.prop && !back && clamp(s.hands) < 0.5 && clamp(s.wave ?? 0) < 0.5 && (() => {
          const {x, y} = aR.hand;
          if (lk.prop === 'net') return (
            <g transform={`translate(${x} ${y})`}>
              <path d="M 0 40 L 60 -760" stroke="#8a6a46" strokeWidth={18} strokeLinecap="round" />
              <ellipse cx={80} cy={-860} rx={90} ry={110} fill="rgba(240,240,230,0.35)" stroke="#f0f0e6" strokeWidth={8} />
              {[-40, 0, 40].map((k) => <path key={k} d={`M ${80 + k} -960 L ${80 + k * 0.6} -760`} stroke="#f0f0e6" strokeWidth={3} opacity={0.7} />)}
            </g>
          );
          if (lk.prop === 'ball') return (
            <g transform={`translate(${x + 30} ${y + 70})`}>
              <circle r={110} fill="#d8443a" stroke={INK} strokeWidth={OW} />
              <path d="M -110 0 C -40 -40 40 -40 110 0" stroke="#f6f4ee" strokeWidth={18} fill="none" />
              <ellipse cx={-40} cy={-50} rx={26} ry={14} fill="#fff" opacity={0.5} />
            </g>
          );
          return (
            <g transform={`translate(${x - 10} ${y + 10}) rotate(8)`}>
              <rect x={-60} y={-90} width={120} height={170} rx={8} fill="#3a6a4a" stroke={INK} strokeWidth={OW} />
              <rect x={-48} y={-80} width={10} height={150} fill="#2a4a34" />
              <rect x={-30} y={-50} width={70} height={30} fill="#e6d6a8" opacity={0.8} />
            </g>
          );
        })()}
        {!back && <>{handG(aL, -1)}{handG(aR, 1)}</>}
      </g>
    </g>
  );
};
