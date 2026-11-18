// 2D inserts for «Диана, кто дома?» (1080×1920 SVG): the rent ad, the previous tenant's note, the speaker close-up,
// the kitchen with two mugs, the empty wardrobe, under the blanket (phone light / flashlight + the creature),
// the bed from above with two lumps.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';
import {TemaLight} from '../horror/Tema';
import {Eva} from './Eva';
import {Person, PERSON_REST, PersonState} from './People';

const W = 1080, H = 1920;
const NIGHT: TemaLight = {bright: 0.75, warmRim: 0.05, coldRim: 0.85, cold: 0.45};

// ---------- the rent ad on a phone (an invented listings app «Квартирка», no real brands) ----------
const RoomPhoto: React.FC<{x: number; y: number; w: number; h: number; v: number}> = ({x, y, w, h, v}) => (
  <g>
    <clipPath id={`rp${v}`}><rect x={x} y={y} width={w} height={h} rx={14} /></clipPath>
    <g clipPath={`url(#rp${v})`}>
      <rect x={x} y={y} width={w} height={h} fill="#5c6670" />
      <rect x={x} y={y + h * 0.72} width={w} height={h * 0.28} fill="#6a4a30" />
      {v === 0 ? (<g>
        <rect x={x + w * 0.55} y={y + h * 0.12} width={w * 0.3} height={h * 0.42} fill="#1a2a4a" stroke="#e8e4dc" strokeWidth={6} />
        <path d={`M ${x + w * 0.7} ${y + h * 0.12} L ${x + w * 0.7} ${y + h * 0.54}`} stroke="#e8e4dc" strokeWidth={5} />
        <rect x={x + w * 0.04} y={y + h * 0.5} width={w * 0.46} height={h * 0.26} rx={8} fill="#4a3020" />
        <rect x={x + w * 0.04} y={y + h * 0.3} width={w * 0.06} height={h * 0.3} fill="#3a2418" />
        <rect x={x + w * 0.06} y={y + h * 0.46} width={w * 0.42} height={h * 0.12} rx={12} fill="#34507a" />
        <ellipse cx={x + w * 0.16} cy={y + h * 0.46} rx={w * 0.08} ry={h * 0.05} fill="#f0ece4" />
        <rect x={x + w * 0.88} y={y + h * 0.5} width={w * 0.1} height={h * 0.22} fill="#4a3020" />
        <rect x={x + w * 0.9} y={y + h * 0.42} width={w * 0.04} height={h * 0.08} fill="#ffd88a" />
      </g>) : v === 1 ? (<g>
        <rect x={x + w * 0.2} y={y + h * 0.5} width={w * 0.6} height={h * 0.06} fill="#6a4a30" />
        <rect x={x + w * 0.3} y={y + h * 0.36} width={w * 0.12} height={h * 0.14} rx={10} fill="#1c1e24" />
        <ellipse cx={x + w * 0.36} cy={y + h * 0.36} rx={w * 0.06} ry={h * 0.015} fill="#3fb6ff" />
        <rect x={x + w * 0.55} y={y + h * 0.43} width={w * 0.18} height={h * 0.07} fill="#8a2a2a" />
      </g>) : (<g>
        <rect x={x + w * 0.2} y={y + h * 0.15} width={w * 0.6} height={h * 0.62} fill="#4a3424" stroke="#1a120c" strokeWidth={5} />
        <path d={`M ${x + w * 0.5} ${y + h * 0.15} L ${x + w * 0.5} ${y + h * 0.77}`} stroke="#1a120c" strokeWidth={5} />
      </g>)}
    </g>
  </g>
);
export const AdInsert: React.FC<{k: number; t: number; again?: boolean}> = ({k, t, again}) => {
  const pw = 700, ph = 1400, px = (W - pw) / 2, py = 250;
  const s = lerp(1, 1.08, k);
  const views = again ? 3 : 1284;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2633 0%, #07090c 75%)'}}>
      <svg width={W} height={H}>
        <defs><clipPath id="adscr"><rect x={px + 20} y={py + 20} width={pw - 40} height={ph - 40} rx={48} /></clipPath></defs>
        <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
          <rect x={px} y={py} width={pw} height={ph} rx={74} fill="#121318" stroke="#3a3c46" strokeWidth={6} />
          <g clipPath="url(#adscr)" fontFamily={FONT}>
            <rect x={px} y={py} width={pw} height={ph} fill="#f4f5f7" />
            {/* status bar + app bar */}
            <text x={px + 70} y={py + 70} fontWeight={800} fontSize={26} fill="#1c1c28">23:47</text>
            <rect x={px + pw - 130} y={py + 50} width={56} height={24} rx={6} fill="none" stroke="#1c1c28" strokeWidth={4} />
            <rect x={px + pw - 126} y={py + 54} width={20} height={16} fill="#d22a2a" />
            <rect x={px + 20} y={py + 100} width={pw - 40} height={90} fill="#ff7a2a" />
            <text x={px + 60} y={py + 160} fontWeight={900} fontSize={40} fill="#fff">‹  Квартирка</text>
            <text x={px + pw - 80} y={py + 160} fontWeight={900} fontSize={40} fill="#fff">♡</text>
            {/* photos: a carousel */}
            <RoomPhoto x={px + 40} y={py + 210} w={pw - 80} h={420} v={0} />
            <rect x={px + pw - 170} y={py + 230} width={110} height={44} rx={22} fill="#000" opacity={0.55} />
            <text x={px + pw - 115} y={py + 262} textAnchor="middle" fontWeight={800} fontSize={26} fill="#fff">1 / 3</text>
            <RoomPhoto x={px + 40} y={py + 645} w={190} h={130} v={1} />
            <RoomPhoto x={px + 245} y={py + 645} w={190} h={130} v={2} />
            <rect x={px + 450} y={py + 645} width={210} height={130} rx={14} fill="#dfe2e8" />
            <text x={px + 555} y={py + 720} textAnchor="middle" fontWeight={800} fontSize={28} fill="#6a6e78">+5 фото</text>
            {/* price, title, address */}
            <text x={px + 50} y={py + 860} fontWeight={900} fontSize={64} fill="#1c1c28">4 000 / мес</text>
            {again
              ? <g><rect x={px + 50} y={py + 885} width={300} height={50} rx={12} fill="#d22a2a" /><text x={px + 200} y={py + 920} textAnchor="middle" fontWeight={900} fontSize={28} fill="#fff" opacity={0.7 + 0.3 * Math.sin(t * 8)}>СНОВА СДАЁТСЯ</text></g>
              : <g><rect x={px + 50} y={py + 885} width={250} height={50} rx={12} fill="#2fae5a" /><text x={px + 175} y={py + 920} textAnchor="middle" fontWeight={900} fontSize={28} fill="#fff">СРОЧНО</text></g>}
            <text x={px + 50} y={py + 1000} fontWeight={800} fontSize={38} fill="#1c1c28">1-комн. квартира, 32 м², 5/9 эт.</text>
            <text x={px + 50} y={py + 1050} fontWeight={600} fontSize={30} fill="#5a5e68">ул. Садовая, 13 · 7 мин до метро</text>
            <text x={px + 50} y={py + 1120} fontWeight={600} fontSize={30} fill="#1c1c28">С мебелью и техникой. Заезд сегодня.</text>
            <text x={px + 50} y={py + 1162} fontWeight={600} fontSize={30} fill="#1c1c28">Всё остаётся. Колонку не трогать.</text>
            <line x1={px + 50} y1={py + 1195} x2={px + pw - 50} y2={py + 1195} stroke="#dfe2e8" strokeWidth={3} />
            <circle cx={px + 95} cy={py + 1250} r={34} fill="#8a9098" />
            <text x={px + 95} y={py + 1262} textAnchor="middle" fontWeight={900} fontSize={30} fill="#fff">П</text>
            <text x={px + 145} y={py + 1243} fontWeight={800} fontSize={30} fill="#1c1c28">Пётр · собственник</text>
            <text x={px + 145} y={py + 1278} fontWeight={600} fontSize={24} fill="#8a8e98">{again ? 'опубликовано 1 мин назад' : 'опубликовано вчера'} · 👁 {views}</text>
            <rect x={px + 40} y={py + 1300} width={pw - 80} height={70} rx={20} fill="#ff7a2a" />
            <text x={W / 2} y={py + 1347} textAnchor="middle" fontWeight={900} fontSize={34} fill="#fff">Написать</text>
          </g>
          <ellipse cx={px + pw - 40} cy={py + ph - 150} rx={70} ry={110} fill="#efc6a6" stroke="#14121c" strokeWidth={7} transform={`rotate(-30 ${px + pw - 40} ${py + ph - 150})`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the previous tenant's note on the table, the keys ----------
export const NoteInsert: React.FC<{k: number}> = ({k}) => {
  const r = mulberry32(3);
  return (
    <AbsoluteFill style={{background: '#2a1d14'}}>
      <svg width={W} height={H}>
        <g transform={`translate(540 960) scale(${lerp(1, 1.12, k)}) rotate(-4) translate(-540 -960)`}>
          {Array.from({length: 14}, (_, i) => <rect key={i} x={0} y={i * 140} width={W} height={4} fill="#1e140c" opacity={0.6} />)}
          <rect x={170} y={560} width={740} height={760} fill="#f1ead8" stroke="#14121c" strokeWidth={6} transform="rotate(3 540 940)" />
          <g fontFamily="'Comic Sans MS', cursive" fontWeight={700} fill="#1d2a6a" transform="rotate(3 540 940)">
            <text x={230} y={700} fontSize={58}>Ключи на столе.</text>
            <text x={230} y={800} fontSize={58}>Вещи оставляю.</text>
            <text x={230} y={900} fontSize={58}>Колонку не</text>
            <text x={230} y={980} fontSize={58}>выключайте.</text>
            <text x={230} y={1120} fontSize={64} fill="#8a1818">Простите.</text>
          </g>
          {Array.from({length: 8}, (_, i) => <circle key={i} cx={240 + r() * 600} cy={620 + r() * 650} r={4 + r() * 8} fill="#7a5a30" opacity={0.25} />)}
          {/* keys */}
          <g transform="translate(760 1400) rotate(20)">
            <circle cx={0} cy={0} r={46} fill="none" stroke="#c9b26a" strokeWidth={12} />
            <rect x={30} y={-14} width={170} height={28} rx={8} fill="#d6c27a" stroke="#14121c" strokeWidth={4} />
            <rect x={150} y={14} width={20} height={26} fill="#d6c27a" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the speaker close-up ----------
// cable: 'in' plugged / 'out' unplugged lying next to it; hand: 'tap' a finger on the ring, 'pull' pulling the plug (0..1);
// screen text: a status line under it; timer: «00:05» style overlay
export const SpeakerInsert: React.FC<{t: number; k: number; ring: number; red?: number; talk?: number; cable?: 'in' | 'out';
  hand?: 'tap' | 'pull'; handK?: number; status?: string; timer?: string; dark?: number; twoBreaths?: number}> = (p) => {
  const {t, k, ring, red = 0, talk = 0, cable = 'in', hand, handK = 0, status, timer, dark = 0, twoBreaths = 0} = p;
  const s = lerp(2.3, 2.6, k);
  const breathe = twoBreaths ? 0.5 + 0.25 * Math.sin(t * 3.1) + 0.25 * Math.sin(t * 2.2 + 1) : 0;
  return (
    <AbsoluteFill style={{background: '#06070a'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="spkBg" cx="0.5" cy="0.55" r="0.6">
            <stop offset="0" stopColor={red > 0.5 ? '#3a0c10' : '#0f2233'} stopOpacity={0.9 * ring * (1 - dark * 0.6)} /><stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#spkBg)" />
        {/* the desk */}
        <path d={`M 0 ${1180} L ${W} ${1120} L ${W} ${H} L 0 ${H} Z`} fill="#24180f" opacity={1 - 0.6 * dark} />
        <path d={`M 0 ${1180} L ${W} ${1120}`} stroke="#3a2a1c" strokeWidth={8} opacity={1 - 0.6 * dark} />
        <g transform={`translate(540 1250) scale(${s})`}>
          <Eva ring={ring * (twoBreaths ? 0.5 + 0.5 * breathe : 1)} red={red} talk={talk} t={t} id="spkI" />
          {/* the cable: plugged into the back, or lying loose with the plug */}
          {cable === 'in'
            ? <path d="M 100 -20 C 160 -10 200 20 260 30" stroke="#0c0d10" strokeWidth={9} fill="none" />
            : <g><path d="M 100 -20 C 140 0 150 30 190 34" stroke="#0c0d10" strokeWidth={9} fill="none" /><rect x={188} y={24} width={34} height={22} rx={4} fill="#0c0d10" /><rect x={222} y={28} width={10} height={4} fill="#9a9aa4" /><rect x={222} y={38} width={10} height={4} fill="#9a9aa4" /></g>}
        </g>
        {/* a hand */}
        {hand === 'tap' && (
          <g transform={`translate(${lerp(860, 610, handK)} ${lerp(640, 760, handK)}) rotate(-38)`}>
            <path d="M -70 260 L -60 120 C -64 70 -40 40 0 40 C 44 40 70 70 66 120 L 74 260 Z" fill="#2f5d62" stroke="#14121c" strokeWidth={7} />
            <path d="M -62 120 C -70 60 -60 10 -40 0 L 44 -6 C 70 10 76 60 66 120 Z" fill="#efc6a6" stroke="#14121c" strokeWidth={7} />
            {[-34, -6, 22].map((fx, i) => <path key={i} d={`M ${fx} 4 C ${fx - 4} -30 ${fx + 26} -34 ${fx + 26} 0`} fill="#efc6a6" stroke="#14121c" strokeWidth={6} />)}
            <path d="M 40 4 C 70 -10 84 20 66 44" fill="#efc6a6" stroke="#14121c" strokeWidth={6} />
            <path d="M -50 6 L -52 -150 Q -38 -176 -22 -150 L -22 6 Z" fill="#efc6a6" stroke="#14121c" strokeWidth={6} strokeLinejoin="round" />
            {[-60, -110].map((y) => <path key={y} d={`M -50 ${y} q 14 -5 28 0`} stroke="#c9967a" strokeWidth={4} fill="none" />)}
            <path d="M -48 -140 Q -37 -160 -26 -140 L -27 -122 L -47 -122 Z" fill="#f6dccf" stroke="#14121c" strokeWidth={3} />
          </g>
        )}
        {hand === 'pull' && (
          <g transform={`translate(${lerp(980, 1180, handK)} ${1230 + Math.sin(handK * 3) * 10})`}>
            <rect x={-60} y={-40} width={120} height={80} rx={34} fill="#efc6a6" stroke="#14121c" strokeWidth={7} />
            <rect x={40} y={-36} width={260} height={72} rx={20} fill="#2f5d62" stroke="#14121c" strokeWidth={7} />
            <rect x={-100} y={-12} width={50} height={24} rx={4} fill="#0c0d10" />
          </g>
        )}
        {status && (
          <g transform="translate(540 1620)">
            <rect x={-330} y={-60} width={660} height={110} rx={24} fill="#0b0d12" opacity={0.85} stroke={red > 0.5 ? '#ff3a3a' : '#3fb6ff'} strokeWidth={4} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={red > 0.5 ? '#ff3a3a' : '#bfe6ff'}>{status}</text>
          </g>
        )}
        {timer && <text x={540} y={420} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={130} fill="#ff3a3a">{timer}</text>}
        {dark > 0 && <rect width={W} height={H} fill="#000" opacity={dark * 0.55} />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the kitchen: two mugs on the table (easter egg) ----------
export const KitchenInsert: React.FC<{k: number}> = ({k}) => (
  <AbsoluteFill style={{background: '#14171d'}}>
    <svg width={W} height={H}>
      <g transform={`translate(540 960) scale(${lerp(1, 1.1, k)}) translate(-540 -960)`}>
        <rect x={0} y={0} width={W} height={1000} fill="#1e242c" />
        {Array.from({length: 9}, (_, i) => <rect key={i} x={0} y={i * 110} width={W} height={3} fill="#262d36" />)}
        <rect x={120} y={260} width={420} height={360} fill="#0e1218" stroke="#3a4250" strokeWidth={10} />
        <path d="M 330 260 L 330 620 M 120 440 L 540 440" stroke="#3a4250" strokeWidth={8} />
        <rect x={640} y={220} width={320} height={300} rx={10} fill="#2a2f38" stroke="#14121c" strokeWidth={6} />
        <path d="M 0 1000 L 1080 1000 L 1080 1920 L 0 1920 Z" fill="#191d24" />
        <ellipse cx={540} cy={1160} rx={460} ry={130} fill="#4a3424" stroke="#14121c" strokeWidth={8} />
        {[[400, 1120], [680, 1150]].map(([x, y], i) => (
          <g key={i}>
            <path d={`M ${x - 55} ${y - 110} L ${x + 55} ${y - 110} L ${x + 48} ${y} L ${x - 48} ${y} Z`} fill={i ? '#c9d2d8' : '#d9b84a'} stroke="#14121c" strokeWidth={6} />
            <path d={`M ${x + 52} ${y - 90} C ${x + 100} ${y - 90} ${x + 100} ${y - 30} ${x + 50} ${y - 30}`} stroke="#14121c" strokeWidth={10} fill="none" />
            <ellipse cx={x} cy={y - 110} rx={55} ry={14} fill="#2a1a10" />
            {i === 1 && [0, 1, 2].map((j) => <path key={j} d={`M ${x - 20 + j * 20} ${y - 140} q 12 -40 0 -80`} stroke="#c9d2d8" strokeWidth={5} fill="none" opacity={0.35} />)}
          </g>
        ))}
      </g>
    </svg>
  </AbsoluteFill>
);

// ---------- the wardrobe, open and empty ----------
export const WardrobeInsert: React.FC<{k: number; open: number}> = ({k, open}) => (
  <AbsoluteFill style={{background: '#101318'}}>
    <svg width={W} height={H}>
      <g transform={`translate(540 960) scale(${lerp(1, 1.08, k)}) translate(-540 -960)`}>
        <rect x={190} y={260} width={700} height={1400} fill="#3a2a1c" stroke="#14121c" strokeWidth={10} />
        <rect x={220} y={290} width={640} height={1340} fill="#07080a" />
        <rect x={240} y={420} width={600} height={14} fill="#5a5a62" />
        {[330, 470, 610, 740].map((x, i) => (
          <g key={x}><path d={`M ${x} 434 l 0 30 l -60 40 l 120 0 l -60 -40`} stroke="#8a8a94" strokeWidth={5} fill="none" />
            {i === 2 && <rect x={x - 70} y={500} width={140} height={360} rx={10} fill="#2a2d36" />}</g>
        ))}
        <rect x={190 - 330 * open} y={260} width={350} height={1400} fill="#4a3424" stroke="#14121c" strokeWidth={10} />
        <rect x={540 + 350 * open} y={260} width={350} height={1400} fill="#4a3424" stroke="#14121c" strokeWidth={10} />
      </g>
    </svg>
  </AbsoluteFill>
);

// ---------- under the blanket ----------
// mode 'kostya': his face lit from below by the phone screen; 'creature': POV — the flashlight beam on the creature's face.
// zoom target for the creature: 'face' | 'eyes' | 'fingers' | 'smile' | 'shh'
export const BlanketInsert: React.FC<{t: number; k: number; mode: 'kostya' | 'creature'; light: number; flash?: number;
  focus?: 'face' | 'eyes' | 'fingers' | 'smile' | 'shh'; s?: Partial<PersonState>}> = ({t, k, mode, light, flash = 0, focus = 'face', s = {}}) => {
  const r = mulberry32(11);
  const folds = Array.from({length: 7}, (_, i) => ({x: (i % 2 ? 0.08 : 0.92) * W + (r() - 0.5) * 160, y: 120 + r() * 1100, w: 200 + r() * 160}));
  const P: PersonState = {...PERSON_REST, t, ...s};
  const cam = mode === 'kostya' ? {sc: 1.25, x: 540, y: 2050} : {
    face: {sc: 1.25, x: 540, y: 2080}, eyes: {sc: 2.4, x: 540, y: 3700}, smile: {sc: 2.0, x: 540, y: 2980},
    fingers: {sc: 1.0, x: 540, y: 1900}, shh: {sc: 1.5, x: 540, y: 2440}}[focus];
  const sc = cam.sc * lerp(1, 1.06, k);
  return (
    <AbsoluteFill style={{background: '#020203'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="blLight" cx="0.5" cy={mode === 'kostya' ? '0.85' : '0.55'} r={mode === 'kostya' ? '0.55' : '0.6'}>
            <stop offset="0" stopColor={mode === 'kostya' ? '#9fc8ff' : '#fff6dc'} stopOpacity={0.55 * light} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="blDark" cx="0.5" cy="0.55" r="0.7"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.95} /></radialGradient>
        </defs>
        <g opacity={clamp(light * 1.4)}>
          <g transform={`translate(${cam.x} ${cam.y}) scale(${sc})`}>
            <Person s={P} light={mode === 'creature' ? {bright: 1.1, warmRim: 0.6, coldRim: 0.4, cold: 0.2} : NIGHT} id={`bl${mode}`}
              variant={mode === 'creature' ? 'double' : 'max'} crop={mode === 'creature' && focus === 'fingers' ? -500 : -700} />
          </g>

        </g>
        <rect width={W} height={H} fill="url(#blLight)" />
        {/* the blanket all around: dark folds */}
        {folds.map((f, i) => <path key={i} d={`M ${f.x} ${f.y - f.w / 2} q ${(i % 2 ? 1 : -1) * (60 + i * 8)} ${f.w / 2} 0 ${f.w}`} stroke="#0d1420" strokeWidth={70} fill="none" opacity={0.9} />)}
        <path d={`M 0 0 L ${W} 0 L ${W} 110 Q 540 200 0 110 Z`} fill="#0b111b" />
        <path d={`M 0 1700 Q 540 1560 1080 1700 L 1080 1920 L 0 1920 Z`} fill="#0b111b" />
        <rect width={W} height={H} fill="url(#blDark)" />
        {/* the phone in his hand (kostya) */}
        {mode === 'kostya' && (
          <g transform="translate(540 1780) rotate(-6)">
            <rect x={-130} y={-60} width={260} height={150} rx={26} fill="#101216" stroke="#2a2c34" strokeWidth={6} />
            <rect x={-114} y={-46} width={228} height={122} rx={16} fill="#5a7ab0" opacity={0.5 + 0.5 * light} />
          </g>
        )}
        {flash > 0 && <rect width={W} height={H} fill="#fff" opacity={flash} />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the bed from above: Kostya's face on the left pillow; on the right one — black hair, a grey crown under
// the duvet, long clawed fingers over its edge (two: 0 = only Kostya .. 1 = him too)
export const TopBedInsert: React.FC<{t: number; k: number; two: number; ring?: number}> = ({t, k, two, ring = 1}) => {
  const P: PersonState = {...PERSON_REST, t, fear: 1, blink: 1, lookX: 0.8, tremble: 1.5};
  return (
    <AbsoluteFill style={{background: '#08090c'}}>
      <svg width={W} height={H}>
        <defs><radialGradient id="tbMoon" cx="0.2" cy="0.1" r="0.8"><stop offset="0" stopColor="#8aa8ff" stopOpacity={0.25} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.12, k)}) translate(-540 -960)`}>
          <rect x={90} y={160} width={900} height={1650} rx={20} fill="#3a2418" stroke="#14121c" strokeWidth={10} />
          <rect x={120} y={190} width={840} height={1590} rx={14} fill="#d8d4cc" />
          {/* pillows */}
          <rect x={150} y={230} width={360} height={260} rx={90} fill="#f0ede6" stroke="#14121c" strokeWidth={6} />
          <rect x={570} y={230} width={360} height={260} rx={90} fill="#f0ede6" stroke="#14121c" strokeWidth={6} />
          {/* Kostya: face up on the left pillow, eyes to the right */}
          <g transform="translate(330 1120) scale(0.62)"><Person s={P} light={{bright: 0.8, warmRim: 0.1, coldRim: 0.8, cold: 0.4}} id="tbK" crop={-1000} /></g>
          {/* the right pillow: the creature lies face up, its black hair spread out, it stares at him and grins */}
          <g opacity={two}>
            {Array.from({length: 16}, (_, i) => <path key={i} d={`M 750 360 C ${600 + i * 20} 300 ${570 + i * 26} 250 ${590 + i * 24} ${215 + (i % 3) * 14}`} stroke="#b35a2a" strokeWidth={20} fill="none" strokeLinecap="round" />)}
            <g transform="translate(750 1120) scale(0.62)"><Person s={{...PERSON_REST, t, uncanny: 1, blink: 1, smile: 0.9, mouth: 0.15, lookX: -0.9}} light={{bright: 0.85, warmRim: 0.1, coldRim: 0.8, cold: 0.4}} id="tbC" variant="double" crop={-1000} /></g>
          </g>
          {/* the duvet */}
          <path d="M 120 520 C 300 490 780 490 960 520 L 960 1780 L 120 1780 Z" fill="#2f4a72" stroke="#14121c" strokeWidth={8} />
          <path d="M 150 560 C 260 900 300 1300 330 1700" stroke="#22385a" strokeWidth={18} fill="none" />
          <path d={`M 560 560 C 560 900 ${lerp(560, 600, two)} 1300 ${lerp(560, 640, two)} 1700`} stroke="#22385a" strokeWidth={18} fill="none" />
          {two > 0.01 && <path d="M 640 560 C 720 900 760 1300 760 1700" stroke="#22385a" strokeWidth={22} fill="none" opacity={two} />}
          <path d="M 120 520 C 300 490 780 490 960 520" stroke="#4a6a98" strokeWidth={10} fill="none" />
        </g>
        <rect width={W} height={H} fill="url(#tbMoon)" />
        {ring > 1 && <Eva ring={ring} t={t} id="tbEva" />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the jumpscare: the creature rushes into the lens, mouth open; glitch, shake, red flash ----------
export const JumpscareInsert: React.FC<{t: number; f: number; start: number}> = ({t, f, start}) => {
  const k = f - start;                                   // frames since the rush began
  if (k < 0) return null;
  const rush = clamp(k / 7);                             // 0 → 1 in a quarter of a second
  const sc = lerp(0.7, 3.4, rush * rush);
  const r = mulberry32(Math.floor(f / 2) + 3);
  const sx = (r() - 0.5) * 60 * (1 - clamp((k - 14) / 12)), sy = (r() - 0.5) * 40 * (1 - clamp((k - 14) / 12));
  const out = clamp((k - 22) / 4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={W} height={H} style={{transform: `translate(${sx}px, ${sy}px)`}}>
        <rect width={W} height={H} fill="#2a0006" opacity={0.6 * (1 - out)} />
        <g opacity={1 - out} transform={`translate(540 ${960 + 1150 * sc}) scale(${sc})`}>
          <Person s={{...PERSON_REST, t, uncanny: 1, blink: 1, smile: 1, mouth: 1, claw: 1}} light={{bright: 1.1, warmRim: 0.9, coldRim: 0.3, cold: 0.1}} id="jump" variant="double" crop={-500} />
        </g>
        {/* glitch bars */}
        {Array.from({length: 7}, (_, i) => (r() < 0.6 * (1 - out) ? <rect key={i} x={0} y={r() * H} width={W} height={10 + r() * 60} fill={r() < 0.5 ? '#ff2a3a' : '#3fd8ff'} opacity={0.25} style={{mixBlendMode: 'screen'}} /> : null))}
        {k < 3 && <rect width={W} height={H} fill="#fff" opacity={0.8 - k * 0.25} />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- in bed: his head on the pillow, the duvet up to the chin, moonlight from the window ----------
export const PillowInsert: React.FC<{t: number; k: number; s: Partial<PersonState>; ring?: number}> = ({t, k, s, ring = 0}) => {
  const P: PersonState = {...PERSON_REST, t, ...s};
  return (
    <AbsoluteFill style={{background: '#05070d'}}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="plMoon" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8aa8ff" stopOpacity={0.35} /><stop offset="0.6" stopColor="#8aa8ff" stopOpacity={0} /></linearGradient>
          <radialGradient id="plRing" cx="0.9" cy="0.2" r="0.6"><stop offset="0" stopColor="#3fb6ff" stopOpacity={0.3 * ring} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
        </defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.08, k)}) translate(-540 -960)`}>
          {/* sheet, pillow */}
          <rect x={0} y={0} width={W} height={H} fill="#1a2234" />
          {/* the pillow behind the head (seen from above) */}
          <rect x={90} y={330} width={900} height={760} rx={200} fill="#c9ccd6" stroke="#14121c" strokeWidth={8} />
          <path d="M 160 430 C 400 390 700 390 920 440" stroke="#a9adb8" strokeWidth={14} fill="none" />
          <ellipse cx={540} cy={760} rx={300} ry={260} fill="#b4b8c4" opacity={0.6} />
          {/* he lies on his back, face up to us */}
          <g transform="translate(540 820) translate(0 1180) scale(1.0)">
            <Person s={P} light={NIGHT} id="pill" crop={-950} />
          </g>
          {/* the duvet pulled up to the chin, straight across the bed */}
          <path d="M -40 1020 C 200 985 420 1000 540 1010 C 680 1000 880 985 1120 1020 L 1120 1960 L -40 1960 Z" fill="#2f4a72" stroke="#14121c" strokeWidth={10} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 260} 1060 C ${150 + i * 260} 1400 ${100 + i * 260} 1650 ${130 + i * 260} 1960`} stroke="#22385a" strokeWidth={18} fill="none" />)}
          <path d="M -40 1030 C 200 995 880 995 1120 1030" stroke="#4a6a98" strokeWidth={12} fill="none" />
        </g>
        <rect width={W} height={H} fill="url(#plMoon)" />
        <rect width={W} height={H} fill="url(#plRing)" />
      </svg>
    </AbsoluteFill>
  );
};
