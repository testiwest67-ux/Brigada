// The other puppets of «Не отвечай», same ink, outline and light filter as Tyoma:
// Mom (beige coat, red scarf), Grandma (headscarf, cardigan, finger to the lips), the Thing (very tall, too-wide smile),
// plus inserts: a knocking fist, a reaching hand, the phone screen. Units mm, origin between the feet, y up negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from './Tema';

const INK = '#14121c';
const OW = 7;

type Face = {blink: number; lookX?: number; lookY?: number; worry: number; mouth: number};

const eyes = (cx: number, cy: number, gap: number, rx: number, ry: number, f: Face, iris: string, id: string, extra?: {red?: boolean; narrow?: number}) => {
  const open = clamp(f.blink) * (1 - (extra?.narrow ?? 0) * 0.45);
  return [-1, 1].map((sd) => {
    const x = cx + sd * gap, ir = rx * 0.55, pr = rx * 0.26;
    const ix = x + (f.lookX ?? 0) * (rx - ir - 3), iy = cy + (f.lookY ?? 0) * (ry - ir - 4);
    const lid = cy - ry + (1 - open) * ry * 2;
    return (
      <g key={sd}>
        <clipPath id={`${id}-e${sd}`}><ellipse cx={x} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill="#f1ece6" />
        <g clipPath={`url(#${id}-e${sd})`}>
          <circle cx={ix} cy={iy} r={ir} fill={iris} />
          <circle cx={ix} cy={iy} r={pr} fill="#0d0f19" />
          <circle cx={ix - ir * 0.35} cy={iy - ir * 0.4} r={ir * 0.28} fill="#fff" />
          <rect x={x - rx - 4} y={cy - ry - 6} width={rx * 2 + 8} height={Math.max(0, lid - (cy - ry - 6))} fill="#c99f8c" />
          <path d={`M ${x - rx - 4} ${lid} Q ${x} ${lid + 4} ${x + rx + 4} ${lid}`} stroke={INK} strokeWidth={6} fill="none" />
        </g>
        <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW * 0.8} />
        {extra?.red && <path d={`M ${x - rx * 0.8} ${cy + ry + 4} Q ${x} ${cy + ry + 16} ${x + rx * 0.8} ${cy + ry + 4}`} stroke="#c0626a" strokeWidth={5} fill="none" opacity={0.8} />}
      </g>
    );
  });
};

const brows = (cx: number, cy: number, gap: number, w: number, worry: number, col: string, th = 14) => [-1, 1].map((sd) => {
  const ix = cx + sd * (gap - w / 2), ox = cx + sd * (gap + w / 2);
  const iy = cy - 26 * worry, oy = cy + 8 * worry;
  return <path key={sd} d={`M ${ix} ${iy} Q ${lerp(ix, ox, 0.35)} ${Math.min(iy, oy) - 8} ${ox} ${oy}`} stroke={col} strokeWidth={th} strokeLinecap="round" fill="none" />;
});

// ---------------- Mom ----------------
export type MomState = Face & {t: number; breathe: number; knock: number; shiver: number};
export const Mom: React.FC<{s: MomState; light: TemaLight; id?: string}> = ({s, light, id = 'mom'}) => {
  const b = s.breathe * 5, sh = Math.sin(s.t * 31) * s.shiver;
  const hy = -1490 + b * 0.5;
  const coat = '#b49a76', coatD = '#937a58', scarf = '#a3262b', skin = '#ecd0c0', hair = '#2e211c';
  const kn = clamp(s.knock);
  const fist = {x: lerp(150, 120, kn) + sh, y: lerp(-1050, -1380, kn)};
  return (
    <g transform={`translate(${sh * 0.4} 0)`}>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {/* legs + boots */}
        <path d="M -95 -560 L -85 -90 L -25 -90 L -15 -560 Z M 95 -560 L 85 -90 L 25 -90 L 15 -560 Z" fill="#2a2630" stroke={INK} strokeWidth={OW} />
        <path d="M -100 -260 L -95 -10 L -5 -10 L -20 -260 Z M 100 -260 L 95 -10 L 5 -10 L 20 -260 Z" fill="#3a2a22" stroke={INK} strokeWidth={OW} />
        {/* left arm down, hand on the bag strap */}
        <path d="M -150 -1250 Q -200 -1050 -190 -860" stroke={INK} strokeWidth={70 + OW * 2} strokeLinecap="round" fill="none" />
        <path d="M -150 -1250 Q -200 -1050 -190 -860" stroke={coat} strokeWidth={70} strokeLinecap="round" fill="none" />
        <ellipse cx={-190} cy={-840} rx={30} ry={36} fill={skin} stroke={INK} strokeWidth={OW} />
        {/* coat */}
        <path d="M -150 -1290 C -185 -1270 -195 -1200 -195 -1130 L -230 -540 C -120 -515 120 -515 230 -540 L 195 -1130 C 195 -1200 185 -1270 150 -1290 C 90 -1310 -90 -1310 -150 -1290 Z"
          fill={coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M 0 -1280 L 10 -530" stroke={coatD} strokeWidth={8} />
        {[-1150, -1010, -870, -730].map((y) => <circle key={y} cx={22} cy={y} r={12} fill="#5a4630" stroke={INK} strokeWidth={4} />)}
        <path d="M -205 -930 C -100 -915 100 -915 205 -930" stroke={coatD} strokeWidth={30} fill="none" />
        <path d="M -150 -1290 C -185 -1270 -195 -1200 -195 -1130 L -230 -540 C -120 -515 120 -515 230 -540" fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={50} />
        {/* bag strap */}
        <path d="M -120 -1270 L -190 -860" stroke="#3a2a22" strokeWidth={14} />
        {/* scarf */}
        <path d="M -105 -1300 C -80 -1250 80 -1250 105 -1300 C 95 -1345 -95 -1345 -105 -1300 Z" fill={scarf} stroke={INK} strokeWidth={OW} />
        <path d="M 40 -1270 L 70 -1080 L 120 -1090 L 90 -1265 Z" fill={scarf} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {/* neck + head */}
        <rect x={-34} y={hy + 130} width={68} height={70} fill="#d7bdb1" stroke={INK} strokeWidth={OW} />
        <g transform={`translate(${sh * 0.3} ${b * 0.5}) translate(0 -1340) scale(1.28) translate(0 1340)`}>
          {/* bun + hair */}
          <circle cx={0} cy={-1690} r={70} fill={hair} stroke={INK} strokeWidth={OW} />
          <path d="M -128 -1470 C -150 -1640 -60 -1680 0 -1680 C 60 -1680 150 -1640 128 -1470 L 110 -1540 C 60 -1600 -60 -1600 -110 -1540 Z" fill={hair} stroke={INK} strokeWidth={OW} />
          <path d="M -125 -1500 C -135 -1440 -130 -1380 -115 -1340" stroke={hair} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 120 -1520 C 140 -1460 132 -1400 122 -1370" stroke={hair} strokeWidth={10} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={hy} rx={112} ry={138} fill={skin} stroke={INK} strokeWidth={OW} />
          <path d="M -110 -1540 C -60 -1600 60 -1600 110 -1540 C 80 -1570 -80 -1570 -110 -1540 Z" fill={hair} />
          {eyes(0, hy - 10, 46, 30, 32, s, '#6a4a34', id, {red: true})}
          {brows(0, hy - 62, 46, 58, s.worry, hair, 11)}
          <path d={`M -6 ${hy + 28} Q 6 ${hy + 46} 14 ${hy + 34}`} stroke="#b88272" strokeWidth={6} fill="none" />
          <circle cx={4} cy={hy + 38} r={9} fill="#e2939a" opacity={0.6} />
          <ellipse cx={0} cy={hy + 80} rx={14 + 8 * s.mouth} ry={4 + 18 * s.mouth} fill="#4a1a22" stroke={INK} strokeWidth={5} />
          <ellipse cx={-60} cy={hy + 40} rx={22} ry={12} fill="#e2939a" opacity={0.3} />
          <ellipse cx={60} cy={hy + 40} rx={22} ry={12} fill="#e2939a" opacity={0.3} />
        </g>
        {/* right arm raised: knocking fist */}
        <path d={`M 150 -1250 Q ${lerp(230, 260, kn)} ${lerp(-1080, -1200, kn)} ${fist.x + 20} ${fist.y + 40}`} stroke={INK} strokeWidth={70 + OW * 2} strokeLinecap="round" fill="none" />
        <path d={`M 150 -1250 Q ${lerp(230, 260, kn)} ${lerp(-1080, -1200, kn)} ${fist.x + 20} ${fist.y + 40}`} stroke={coat} strokeWidth={70} strokeLinecap="round" fill="none" />
        <g transform={`translate(${fist.x} ${fist.y}) scale(${1 + kn * 0.35})`}>
          <rect x={-38} y={-40} width={76} height={72} rx={26} fill={skin} stroke={INK} strokeWidth={OW} />
          {[-24, -8, 8, 24].map((x) => <path key={x} d={`M ${x} -40 L ${x} -20`} stroke={INK} strokeWidth={4} />)}
        </g>
      </g>
    </g>
  );
};

// ---------------- Grandma ----------------
export type GranState = Face & {t: number; breathe: number; shh: number; narrow: number};
export const Grandma: React.FC<{s: GranState; light: TemaLight; id?: string}> = ({s, light, id = 'gran'}) => {
  const b = s.breathe * 4, hy = -1270 + b * 0.5;
  const skin = '#e8c4a8', scarf = '#7a2424', card = '#6d6a66', dress = '#4b5a78';
  const k = clamp(s.shh);
  const hand = {x: lerp(150, 4, k), y: lerp(-760, hy + 97, k)};
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -150 -560 L -150 -60 L 150 -60 L 150 -560 Z" fill={dress} stroke={INK} strokeWidth={OW} />
        {[-110, -40, 30, 100].map((x, i) => <circle key={i} cx={x} cy={-300 - (i % 2) * 90} r={14} fill="#c9a24a" opacity={0.7} />)}
        <ellipse cx={-70} cy={-40} rx={62} ry={26} fill="#2a1f1a" stroke={INK} strokeWidth={OW} />
        <ellipse cx={70} cy={-40} rx={62} ry={26} fill="#2a1f1a" stroke={INK} strokeWidth={OW} />
        {/* cardigan body: round */}
        <path d="M -150 -1080 C -230 -1050 -250 -900 -240 -760 L -210 -520 C -100 -500 100 -500 210 -520 L 240 -760 C 250 -900 230 -1050 150 -1080 C 80 -1100 -80 -1100 -150 -1080 Z"
          fill={card} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M -120 -900 L -110 -520 L 110 -520 L 120 -900 Z" fill="#cfc4b4" stroke={INK} strokeWidth={OW * 0.8} />
        <path d="M -40 -1070 L 0 -940 L 40 -1070" stroke={INK} strokeWidth={5} fill="none" />
        {/* left arm resting */}
        <path d="M -190 -1030 Q -260 -830 -200 -660" stroke={INK} strokeWidth={74 + OW * 2} strokeLinecap="round" fill="none" />
        <path d="M -190 -1030 Q -260 -830 -200 -660" stroke={card} strokeWidth={74} strokeLinecap="round" fill="none" />
        <ellipse cx={-195} cy={-640} rx={34} ry={36} fill={skin} stroke={INK} strokeWidth={OW} />
        <g transform="translate(0 -1120) scale(1.2) translate(0 1120)">
        {/* head */}
        <rect x={-36} y={hy + 120} width={72} height={60} fill="#d4a98f" stroke={INK} strokeWidth={OW} />
        <ellipse cx={0} cy={hy} rx={128} ry={140} fill={skin} stroke={INK} strokeWidth={OW} />
        {[0, 1, 2].map((i) => <path key={i} d={`M -60 ${hy - 88 + i * 16} Q 0 ${hy - 96 + i * 16} 60 ${hy - 88 + i * 16}`} stroke="#b58a72" strokeWidth={4} fill="none" />)}
        {eyes(0, hy - 18, 50, 28, 26, {...s}, '#7d93a6', id, {narrow: s.narrow})}
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 88} ${hy - 30} l ${sd * 22} -10 M ${sd * 88} ${hy - 16} l ${sd * 24} 0 M ${sd * 88} ${hy - 2} l ${sd * 22} 10`} stroke="#b58a72" strokeWidth={4} />)}
        {brows(0, hy - 64, 50, 56, s.worry, '#9a9590', 10)}
        <path d={`M -4 ${hy + 10} Q 10 ${hy + 40} 20 ${hy + 24}`} stroke="#b07a62" strokeWidth={6} fill="none" />
        <path d={`M -54 ${hy + 30} Q -46 ${hy + 70} -30 ${hy + 86} M 54 ${hy + 30} Q 46 ${hy + 70} 30 ${hy + 86}`} stroke="#b58a72" strokeWidth={4} fill="none" />
        <ellipse cx={0} cy={hy + 80} rx={18 + 6 * s.mouth} ry={3 + 14 * s.mouth} fill="#4a1a22" stroke={INK} strokeWidth={5} />
        {/* headscarf: covers the hair, knot under the chin */}
        <path d={`M -150 ${hy + 40} C -175 ${hy - 120} -110 ${hy - 190} 0 ${hy - 192} C 110 ${hy - 190} 175 ${hy - 120} 150 ${hy + 40} L 120 ${hy + 120} C 125 ${hy + 20} 125 ${hy - 70} 100 ${hy - 110} C 60 ${hy - 150} -60 ${hy - 150} -100 ${hy - 110} C -125 ${hy - 70} -125 ${hy + 20} -120 ${hy + 120} Z`}
          fill={scarf} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[[-80, -150], [-20, -170], [50, -160], [110, -110], [-120, -60], [125, -20], [-128, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={hy + y} r={9} fill="#e8dcc8" opacity={0.75} />)}
        <path d={`M -40 ${hy + 145} Q 0 ${hy + 125} 40 ${hy + 145} L 60 ${hy + 230} L 20 ${hy + 160} L -20 ${hy + 160} L -60 ${hy + 230} Z`} fill={scarf} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        </g>
        {/* right arm: index finger to the lips */}
        <path d={`M 190 -1030 Q ${lerp(260, 200, k)} ${lerp(-850, -1000, k)} ${hand.x + 20} ${hand.y + 60}`} stroke={INK} strokeWidth={74 + OW * 2} strokeLinecap="round" fill="none" />
        <path d={`M 190 -1030 Q ${lerp(260, 200, k)} ${lerp(-850, -1000, k)} ${hand.x + 20} ${hand.y + 60}`} stroke={card} strokeWidth={74} strokeLinecap="round" fill="none" />
        <g transform={`translate(${hand.x} ${hand.y})`}>
          <rect x={-30} y={0} width={64} height={70} rx={24} fill={skin} stroke={INK} strokeWidth={OW} />
          <rect x={-12} y={lerp(-10, -62, k)} width={22} height={lerp(30, 74, k)} rx={11} fill={skin} stroke={INK} strokeWidth={OW} />
        </g>
      </g>
    </g>
  );
};

// ---------------- the Thing ----------------
export type ThingState = {t: number; mouth: number; smile: number; tilt: number; sway: number; eyes: number; breathe: number; reach?: number};
export const Thing: React.FC<{s: ThingState; light: TemaLight; id?: string}> = ({s, light, id = 'thing'}) => {
  const body = '#0c0a11', face = '#1d1922', teeth = '#d9d1bd';
  const b = s.breathe * 8;
  const hy = -2290 + b;
  const sw = s.sway, rc = clamp(s.reach ?? 0);
  const arm = (sd: number) => {
    const sh = {x: sd * 165, y: -1960 + b * 0.5};
    const el = {x: sd * 235 + sw * 20, y: -1480};
    const wr = {x: lerp(sd * 255 + sw * 35, sd * 120, rc), y: lerp(-960, -1600, rc)};
    return {sh, el, wr};
  };
  const fingers = (w: {x: number; y: number}, sd: number) => [0, 1, 2, 3, 4].map((i) => {
    const a = (sd * (i - 2) * 9 + (rc ? -90 * sd : 0)) * Math.PI / 180, L = 230 + (i === 2 ? 50 : i === 0 ? -60 : 0);
    const mx = w.x + Math.sin(a) * L * 0.5 + sd * 6, my = w.y + Math.cos(a) * L * 0.5;
    const ex = w.x + Math.sin(a) * L + sd * (i - 2) * 6 - sd * 22, ey = w.y + Math.cos(a) * L;
    return <path key={i} d={`M ${w.x + (i - 2) * 10} ${w.y} L ${mx} ${my} L ${ex} ${ey}`} stroke={body} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  });
  const mw = 150 + 80 * clamp(s.smile), mo = clamp(s.mouth);
  const my = hy + 95;
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {/* legs under the rags */}
        <path d="M -60 -600 L -90 -300 L -70 0 M 60 -600 L 95 -300 L 75 0" stroke={body} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* long torn shroud */}
        <path d={`M -150 -1960 C -190 -1700 -200 -1200 -210 -700 L -180 -560 L -150 -660 L -110 -520 L -70 -640 L -20 -500 L 20 -630 L 70 -510 L 110 -650 L 150 -540 L 190 -680 L 210 -700 C 200 -1200 190 -1700 150 -1960 C 90 -2000 -90 -2000 -150 -1960 Z`}
          fill={body} stroke="#000" strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => {
          const a = arm(sd);
          return (
            <g key={sd}>
              <path d={`M ${a.sh.x} ${a.sh.y} L ${a.el.x} ${a.el.y} L ${a.wr.x} ${a.wr.y}`} stroke={body} strokeWidth={46} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {fingers(a.wr, sd)}
            </g>
          );
        })}
        {/* long neck + tilted head */}
        <g transform={`rotate(${s.tilt} 0 -2000)`}>
          <path d="M -30 -1990 L -24 -2130 L 24 -2130 L 30 -1990 Z" fill={body} />
          <ellipse cx={0} cy={hy} rx={122} ry={196} fill={face} stroke="#000" strokeWidth={OW} />
          {/* sunken eye sockets with two dim glints */}
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <ellipse cx={sd * 52} cy={hy - 40} rx={38} ry={30} fill="#050407" />
              <circle cx={sd * 52 + 6} cy={hy - 40} r={7} fill="#f6e9c3" opacity={clamp(s.eyes)} />
            </g>
          ))}
          {/* the smile: wider than the face, needle teeth */}
          {(() => {
            const up = (x: number) => my - 46 + 46 * (1 - Math.pow(x / mw, 2)) * 0.55;
            const lo = (x: number) => my - 46 + (70 + 110 * mo) * (1 - Math.pow(x / mw, 2));
            const pts = (fn: (x: number) => number, n = 24) => Array.from({length: n + 1}, (_, i) => -mw + (2 * mw * i) / n).map((x) => `${x} ${fn(x)}`);
            const top = Array.from({length: 19}, (_, i) => -mw * 0.92 + (i / 18) * mw * 1.84);
            const bot = Array.from({length: 17}, (_, i) => -mw * 0.85 + (i / 16) * mw * 1.7);
            return (
              <g>
                <path d={`M ${pts(up).join(' L ')} L ${pts(lo).reverse().join(' L ')} Z`} fill="#2b060b" stroke="#000" strokeWidth={6} />
                {top.map((x, i) => { const k = 1 - Math.pow(x / mw, 2); return <path key={i} d={`M ${x - 9} ${up(x) - 2} L ${x + 9} ${up(x) - 2} L ${x} ${up(x) + 18 + 34 * k} Z`} fill={teeth} />; })}
                {bot.map((x, i) => { const k = 1 - Math.pow(x / mw, 2); return <path key={i} d={`M ${x - 8} ${lo(x) + 2} L ${x + 8} ${lo(x) + 2} L ${x} ${lo(x) - 14 - 26 * k} Z`} fill={teeth} opacity={0.9} />; })}
                <path d={`M ${-mw - 10} ${my - 52} q -14 -10 -24 -4 M ${mw + 10} ${my - 52} q 14 -10 24 -4`} stroke="#000" strokeWidth={6} fill="none" />
              </g>
            );
          })()}
        </g>
      </g>
    </g>
  );
};

// ---------------- inserts ----------------
// fist seen from the side, knuckles to the right; sleeve colour from the owner
export const Fist: React.FC<{sleeve: string; skin?: string}> = ({sleeve, skin = '#e8c4a8'}) => (
  <g>
    <path d="M -520 -40 L -120 -60 L -110 70 L -520 60 Z" fill={sleeve} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
    <path d="M -130 -70 C -40 -95 90 -80 120 -40 C 140 -10 140 40 120 70 C 80 105 -60 110 -125 80 Z" fill={skin} stroke={INK} strokeWidth={OW} />
    {[-50, -10, 30, 70].map((y, i) => <path key={i} d={`M 60 ${y - 14} Q 105 ${y} 60 ${y + 14}`} stroke={INK} strokeWidth={5} fill="none" />)}
    <path d="M -60 -60 C -10 -40 40 -40 60 -60" stroke={INK} strokeWidth={5} fill="none" />
    <path d="M -110 30 C -60 60 0 60 30 40" stroke="#b58a72" strokeWidth={5} fill="none" />
  </g>
);

// open hand reaching to the right (Tyoma's, to the lock)
export const ReachHand: React.FC<{curl: number}> = ({curl}) => (
  <g>
    <path d="M -560 -70 L -150 -60 L -150 80 L -560 90 Z" fill="#2a3f73" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
    <rect x={-170} y={-75} width={60} height={165} rx={20} fill="#22355f" stroke={INK} strokeWidth={OW} />
    <path d="M -110 -60 C -20 -80 60 -60 80 -20 L 80 50 C 50 90 -40 95 -110 80 Z" fill="#efc4a6" stroke={INK} strokeWidth={OW} />
    {[-48, -16, 16, 48].map((y, i) => (
      <rect key={i} x={70} y={y - 13 + curl * 6} width={lerp(130, 70, curl) - Math.abs(i - 1.5) * 12} height={26} rx={13} fill="#efc4a6" stroke={INK} strokeWidth={OW * 0.8}
        transform={`rotate(${curl * 35} 70 ${y})`} />
    ))}
    <rect x={-40} y={-118} width={34} height={90} rx={17} fill="#efc4a6" stroke={INK} strokeWidth={OW * 0.8} transform="rotate(-50 -20 -60)" />
  </g>
);
