// Night kitchen set, split in depth layers: back room, table + props, hanging lamp.
import React from 'react';
import {INK, OW} from '../rig/style';
import {City, Rect} from './City';
import {mulberry32} from '../lib/anim';

export const WIN: Rect = {x: 272, y: 232, w: 526, h: 406}; // window glass
export const LAMP = {x: 1095, top: -20, len: 236};
export const TABLE = {y: 792, back: 748, x0: 640, x1: 1560};

const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

const Curtain: React.FC<{x: number; w: number; dir: number; sway: number}> = ({x, w, dir, sway}) => {
  const b = 708, sx = sway * 6 * dir;
  const d = `M ${x} 188 L ${x + w} 188 C ${x + w + sx * 0.4} 400 ${x + w + sx} 560 ${x + w + sx} ${b}
    Q ${x + w * 0.75 + sx} ${b + 10} ${x + w * 0.5 + sx} ${b} Q ${x + w * 0.25 + sx} ${b + 10} ${x + sx} ${b} C ${x + sx} 560 ${x + sx * 0.4} 400 ${x} 188 Z`;
  return (
    <g>
      <path d={d} fill="url(#k-curtain)" {...st} />
      {[0.33, 0.66].map((k) => (
        <path key={k} d={`M ${x + w * k} 196 C ${x + w * k + sx * 0.4} 400 ${x + w * k + sx} 560 ${x + w * k + sx} ${b - 2}`} stroke="#b9715a" strokeWidth={4} fill="none" />
      ))}
    </g>
  );
};

const Kettle: React.FC<{on: number}> = ({on}) => (
  <g transform="translate(1590 646)">
    <ellipse cx={0} cy={2} rx={60} ry={7} fill="#000" opacity={0.12} />
    <path d="M -48 -4 L -40 -66 Q 0 -80 40 -66 L 48 -4 Z" fill="#e3654f" {...st} />
    <path d="M -36 -60 Q -10 -66 -4 -40" stroke="#f08a73" strokeWidth={6} strokeLinecap="round" fill="none" />
    <path d="M -42 -46 L -70 -62 L -66 -54 L -44 -30" fill="#e3654f" {...st} />
    <path d="M 38 -60 C 74 -60 74 -14 44 -14" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
    <path d="M -14 -74 Q 0 -88 14 -74" fill="#3a3f52" {...st} />
    <rect x={-52} y={-8} width={104} height={12} rx={4} fill="#3a3f52" {...st} />
    <circle cx={30} cy={-2} r={3.2} fill={on ? '#ff7a3d' : '#5a2d2a'} />
  </g>
);

const Plant: React.FC<{t: number}> = ({t}) => {
  const leaves = [-36, -16, 4, 22, 40];
  return (
    <g transform="translate(330 656)">
      {leaves.map((a, i) => {
        const r = a + Math.sin(t * 1.4 + i) * 2.5;
        return <path key={i} transform={`rotate(${r})`} d="M 0 -30 C -14 -60 -10 -88 0 -98 C 10 -88 14 -60 0 -30 Z" fill={i % 2 ? '#5f9a6f' : '#4f8a62'} {...st} />;
      })}
      <path d="M -26 -38 L 26 -38 L 20 0 L -20 0 Z" fill="#c96f4a" {...st} />
      <rect x={-30} y={-44} width={60} height={10} rx={3} fill="#d9825c" {...st} />
    </g>
  );
};

// everything behind the character
export const Room: React.FC<{f: number; fps: number; offF: number; dark: number; camShift: number; lit: number}> = ({f, fps, offF, dark, camShift, lit}) => {
  const t = f / fps;
  const tiles = React.useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let x = 1478; x <= 1700; x += 37) out.push(<line key={'v' + x} x1={x} y1={410} x2={x} y2={650} stroke="#d3dbd5" strokeWidth={3} />);
    for (let y = 410; y <= 650; y += 37) out.push(<line key={'h' + y} x1={1478} y1={y} x2={1700} y2={y} stroke="#d3dbd5" strokeWidth={3} />);
    return out;
  }, []);
  const boards = React.useMemo(() => {
    const rnd = mulberry32(5);
    return [905, 950, 1005, 1068].map((y, i) => <line key={i} x1={-100} y1={y} x2={2020} y2={y + (rnd() - 0.5) * 4} stroke="#7a5a47" strokeWidth={4} />);
  }, []);
  return (
    <g>
      <defs>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c3a2" /><stop offset="0.5" stopColor="#e8d5b6" /><stop offset="1" stopColor="#dcc6a5" />
        </linearGradient>
        <linearGradient id="k-curtain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d28a70" /><stop offset="0.5" stopColor="#e3a083" /><stop offset="1" stopColor="#c97e66" />
        </linearGradient>
        <linearGradient id="k-fridge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f5f6" /><stop offset="1" stopColor="#d7dbe0" />
        </linearGradient>
        <clipPath id="k-glass"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} /></clipPath>
      </defs>
      {/* wall + floor */}
      <rect x={-200} y={-200} width={2320} height={1080} fill="url(#k-wall)" />
      <rect x={-200} y={870} width={2320} height={420} fill="#8f6c56" />
      {boards}
      <rect x={-200} y={856} width={2320} height={16} fill="#efe6d8" {...st} />

      {/* window */}
      <g clipPath="url(#k-glass)">
        <City r={WIN} f={f} fps={fps} offF={offF} dark={dark} shift={-camShift * 0.18} />
      </g>
      <path d={`M ${WIN.x - 22} ${WIN.y - 22} h ${WIN.w + 44} v ${WIN.h + 44} h ${-WIN.w - 44} Z M ${WIN.x} ${WIN.y} v ${WIN.h} h ${WIN.w} v ${-WIN.h} Z`} fill="#f3eee6" fillRule="evenodd" {...st} />
      <rect x={WIN.x + WIN.w / 2 - 8} y={WIN.y} width={16} height={WIN.h} fill="#f3eee6" {...st} />
      <rect x={WIN.x} y={WIN.y + 130} width={WIN.w / 2 - 8} height={14} fill="#f3eee6" {...st} />
      <path d={`M ${WIN.x + 26} ${WIN.y + 24} l 60 -0 M ${WIN.x + WIN.w / 2 + 30} ${WIN.y + 24} l 90 0`} stroke="#ffffff" strokeOpacity={0.25} strokeWidth={6} strokeLinecap="round" />
      <rect x={WIN.x - 44} y={WIN.y + WIN.h + 20} width={WIN.w + 88} height={24} rx={4} fill="#f6f2ea" {...st} />
      <rect x={WIN.x - 36} y={WIN.y + WIN.h + 44} width={WIN.w + 72} height={10} fill="#000" opacity={0.08} />
      <Plant t={t} />

      {/* radiator under the sill */}
      <g>
        <rect x={340} y={724} width={390} height={108} rx={10} fill="#ece7df" {...st} />
        {Array.from({length: 9}, (_, i) => <line key={i} x1={378 + i * 39} y1={736} x2={378 + i * 39} y2={820} stroke="#cfc8bd" strokeWidth={6} strokeLinecap="round" />)}
        <rect x={706} y={830} width={14} height={30} fill="#ece7df" {...st} />
      </g>

      <rect x={170} y={180} width={720} height={10} rx={5} fill="#7b5a48" {...st} />
      <Curtain x={196} w={92} dir={1} sway={Math.sin(t * 0.9)} />
      <Curtain x={782} w={92} dir={-1} sway={Math.sin(t * 0.9 + 1)} />

      {/* counter, tiles, cabinets */}
      <rect x={1478} y={410} width={222} height={240} fill="#eef1ec" />
      {tiles}
      <rect x={1478} y={150} width={224} height={260} rx={6} fill="#7ea597" {...st} />
      <line x1={1590} y1={150} x2={1590} y2={410} stroke={INK} strokeWidth={OW} />
      <rect x={1566} y={360} width={8} height={30} rx={4} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
      <rect x={1606} y={360} width={8} height={30} rx={4} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
      <rect x={1478} y={668} width={224} height={190} fill="#6f9789" {...st} />
      <line x1={1590} y1={668} x2={1590} y2={858} stroke={INK} strokeWidth={OW} />
      <rect x={1566} y={690} width={8} height={30} rx={4} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
      <rect x={1606} y={690} width={8} height={30} rx={4} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
      <rect x={1464} y={648} width={250} height={22} rx={4} fill="#e3dccf" {...st} />
      <Kettle on={lit} />

      {/* fridge */}
      <g>
        <path d="M 1716 862 L 1716 196 Q 1716 176 1736 176 L 2000 176 L 2000 862 Z" fill="url(#k-fridge)" {...st} />
        <line x1={1716} y1={420} x2={2000} y2={420} stroke={INK} strokeWidth={OW} />
        <rect x={1736} y={300} width={11} height={90} rx={5} fill="#9aa3b0" stroke={INK} strokeWidth={3} />
        <rect x={1736} y={450} width={11} height={150} rx={5} fill="#9aa3b0" stroke={INK} strokeWidth={3} />
        <rect x={1772} y={466} width={74} height={34} rx={6} fill="#26304a" stroke={INK} strokeWidth={3} />
        <text x={1809} y={491} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={22} fill="#7fd8ff" opacity={lit}>+4°</text>
        <g transform="translate(1846 560) rotate(5)">
          <rect x={-26} y={-26} width={52} height={52} fill="#ffe08a" stroke={INK} strokeWidth={3} />
          <path d="M -16 -8 h 30 M -16 4 h 22 M -16 14 h 26" stroke="#b9975a" strokeWidth={3} strokeLinecap="round" />
          <circle cx={0} cy={-24} r={6} fill="#e3654f" stroke={INK} strokeWidth={2.5} />
        </g>
      </g>
    </g>
  );
};

const Steam: React.FC<{x: number; y: number; t: number; o: number}> = ({x, y, t, o}) => (
  <g opacity={o}>
    {[0, 1, 2].map((i) => {
      const ph = (t * 0.55 + i / 3) % 1;
      const yy = y - ph * 110, a = (1 - ph) * Math.min(1, ph * 4);
      const wv = Math.sin(t * 2.2 + i * 2) * 8;
      return <path key={i} d={`M ${x - 12 + i * 12} ${yy} c ${8 + wv} -14 ${-10 + wv} -24 ${2 + wv} -40`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.55 * a} />;
    })}
  </g>
);

export const Mug: React.FC<{x: number; y: number; t: number; steam: number}> = ({x, y, t, steam}) => {
  const w = 40, h = 88;
  const handle = `M ${x + w - 4} ${y - h + 16} C ${x + w + 34} ${y - h + 16} ${x + w + 34} ${y - 22} ${x + w - 4} ${y - 24}`;
  return (
    <g>
      <Steam x={x} y={y - h - 10} t={t} o={steam} />
      <ellipse cx={x} cy={y + 2} rx={w + 10} ry={8} fill="#000" opacity={0.15} />
      <path d={handle} stroke={INK} strokeWidth={OW * 2 + 12} fill="none" strokeLinecap="round" />
      <path d={handle} stroke="#f2ebe0" strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d={`M ${x - w} ${y - h} L ${x - w + 4} ${y - 8} Q ${x} ${y + 6} ${x + w - 4} ${y - 8} L ${x + w} ${y - h} Z`} fill="#f2ebe0" {...st} />
      <path d={`M ${x - w + 1} ${y - h * 0.62} Q ${x} ${y - h * 0.62 + 10} ${x + w - 1} ${y - h * 0.62} L ${x + w - 1.5} ${y - h * 0.44} Q ${x} ${y - h * 0.44 + 10} ${x - w + 1.5} ${y - h * 0.44} Z`} fill="#e3654f" />
      <ellipse cx={x} cy={y - h} rx={w} ry={10} fill="#6b4130" {...st} />
    </g>
  );
};

// phone lying on the table (seen in perspective)
export const PhoneFlat: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <path d={`M ${x - 44} ${y} L ${x - 30} ${y - 22} L ${x + 34} ${y - 22} L ${x + 46} ${y} Z`} fill="#2a2e40" {...st} />
    <path d={`M ${x - 32} ${y - 4} L ${x - 23} ${y - 18} L ${x + 26} ${y - 18} L ${x + 34} ${y - 4} Z`} fill="#3c4560" />
  </g>
);

// phone in hand: upright, back to camera; the screen light spills from its top edge toward the face
export const PhoneHeld: React.FC<{p: {x: number; y: number}; glow: number}> = ({p, glow}) => (
  <g transform={`translate(${p.x + 16} ${p.y - 4}) rotate(-7)`}>
    <rect x={-31} y={-112} width={62} height={118} rx={11} fill="#2a2e40" {...st} />
    <circle cx={-14} cy={-94} r={6} fill="#151826" />
    <rect x={-27} y={-116} width={54} height={6} rx={3} fill="#e6f3ff" opacity={glow} />
  </g>
);

export const Table: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="k-under" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#140f1e" stopOpacity="0.6" /><stop offset="1" stopColor="#140f1e" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="k-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b9805a" /><stop offset="1" stopColor="#cf9465" />
      </linearGradient>
    </defs>
    <rect x={TABLE.x0 + 30} y={TABLE.y + 40} width={TABLE.x1 - TABLE.x0 - 60} height={300} fill="url(#k-under)" />
    <ellipse cx={(TABLE.x0 + TABLE.x1) / 2} cy={1050} rx={520} ry={40} fill="#000" opacity={0.18} />
    {[TABLE.x0 + 22, TABLE.x1 - 58].map((x) => <rect key={x} x={x} y={TABLE.y + 30} width={36} height={400} fill="#9b6743" {...st} />)}
    <path d={`M ${TABLE.x0 + 50} ${TABLE.back} L ${TABLE.x1 - 50} ${TABLE.back} L ${TABLE.x1} ${TABLE.y} L ${TABLE.x0} ${TABLE.y} Z`} fill="url(#k-top)" {...st} />
    <rect x={TABLE.x0} y={TABLE.y} width={TABLE.x1 - TABLE.x0} height={40} fill="#a7704a" {...st} />
    <line x1={TABLE.x0 + 14} y1={TABLE.y + 8} x2={TABLE.x1 - 14} y2={TABLE.y + 8} stroke="#c58a5e" strokeWidth={4} strokeLinecap="round" />
  </g>
);

export const Lamp: React.FC<{on: number; swing: number}> = ({on, swing}) => {
  const {x, top, len} = LAMP;
  return (
    <g transform={`rotate(${swing} ${x} ${top})`}>
      <defs>
        <radialGradient id="k-bulb" r="0.5">
          <stop offset="0" stopColor="#fff8d8" /><stop offset="1" stopColor="#ffd77a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1={x} y1={top} x2={x} y2={top + len} stroke={INK} strokeWidth={4} />
      <circle cx={x} cy={top + len + 58} r={70} fill="url(#k-bulb)" opacity={on * 0.9} />
      <circle cx={x} cy={top + len + 62} r={15} fill={on > 0.5 ? '#fff6d0' : '#8d93a3'} {...st} />
      <path d={`M ${x - 22} ${top + len} L ${x + 22} ${top + len} Q ${x + 30} ${top + len + 14} ${x + 30} ${top + len + 20}
        C ${x + 74} ${top + len + 26} ${x + 96} ${top + len + 50} ${x + 98} ${top + len + 64}
        Q ${x} ${top + len + 76} ${x - 98} ${top + len + 64}
        C ${x - 96} ${top + len + 50} ${x - 74} ${top + len + 26} ${x - 30} ${top + len + 20}
        Q ${x - 30} ${top + len + 14} ${x - 22} ${top + len} Z`} fill="#e8b04a" {...st} />
      <path d={`M ${x - 60} ${top + len + 40} Q ${x - 40} ${top + len + 30} ${x - 20} ${top + len + 28}`} stroke="#f6cf7a" strokeWidth={6} strokeLinecap="round" fill="none" />
    </g>
  );
};

// living flame: teardrop that wobbles, with a soft halo; `k` = size (0 = out)
export const Flame: React.FC<{x: number; y: number; k: number; t: number; seed?: number}> = ({x, y, k, t, seed = 0}) => {
  if (k <= 0.01) return null;
  const sway = Math.sin(t * 9 + seed) * 2.5 + Math.sin(t * 23 + seed * 2) * 1.2;
  const h = 46 * k * (1 + Math.sin(t * 17 + seed) * 0.08), w = 14 * k;
  const d = `M ${x} ${y} C ${x - w * 1.3} ${y - h * 0.3} ${x - w * 0.6 + sway * 0.4} ${y - h * 0.75} ${x + sway} ${y - h}
    C ${x + w * 0.6 + sway * 0.4} ${y - h * 0.75} ${x + w * 1.3} ${y - h * 0.3} ${x} ${y} Z`;
  const gid = `flame${seed}`;
  return (
    <g>
      <defs>
        <radialGradient id={`${gid}-h`} r="0.5"><stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffb357" stopOpacity="0" /></radialGradient>
        <linearGradient id={gid} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff8a3d" /><stop offset="0.45" stopColor="#ffc94d" /><stop offset="1" stopColor="#fff3c4" />
        </linearGradient>
      </defs>
      <circle cx={x} cy={y - h * 0.45} r={70 * k} fill={`url(#${gid}-h)`} style={{mixBlendMode: 'screen'}} />
      <path d={d} fill={`url(#${gid})`} stroke="#e0662f" strokeWidth={2} />
      <ellipse cx={x} cy={y - 4 * k} rx={3.5 * k} ry={5 * k} fill="#7fb6ff" opacity={0.8} />
    </g>
  );
};

export const Candle: React.FC<{x: number; y: number; flame: number; t: number}> = ({x, y, flame, t}) => (
  <g>
    <ellipse cx={x} cy={y + 2} rx={44} ry={8} fill="#000" opacity={0.15} />
    <path d={`M ${x - 40} ${y} Q ${x - 40} ${y - 14} ${x} ${y - 14} Q ${x + 40} ${y - 14} ${x + 40} ${y} Q ${x} ${y + 8} ${x - 40} ${y} Z`} fill="#c9cbd3" {...st} />
    <path d={`M ${x - 18} ${y - 12} L ${x - 18} ${y - 104} Q ${x} ${y - 112} ${x + 18} ${y - 104} L ${x + 18} ${y - 12} Z`} fill="#f4ecdc" {...st} />
    <path d={`M ${x + 6} ${y - 104} q 2 14 -1 22`} stroke="#e4d7bf" strokeWidth={5} strokeLinecap="round" fill="none" />
    <line x1={x} y1={y - 108} x2={x} y2={y - 122} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
    <Flame x={x} y={y - 116} k={flame} t={t} seed={1} />
  </g>
);

// match held in the hand (drawn at the wrist, pointing along `ang`)
export const Match: React.FC<{p: {x: number; y: number}; ang: number; flame: number; t: number}> = ({p, ang, flame, t}) => {
  const a = (ang * Math.PI) / 180;
  const tip = {x: p.x + Math.cos(a) * 64, y: p.y + Math.sin(a) * 64};
  return (
    <g>
      <line x1={p.x + Math.cos(a) * 18} y1={p.y + Math.sin(a) * 18} x2={tip.x} y2={tip.y} stroke="#e8c58f" strokeWidth={6} strokeLinecap="round" />
      <circle cx={tip.x} cy={tip.y} r={5.5} fill="#b2402e" />
      <Flame x={tip.x} y={tip.y + 4} k={flame * 0.75} t={t} seed={2} />
    </g>
  );
};
