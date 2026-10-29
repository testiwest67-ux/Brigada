// Elevator sets (stuck-lift story): the cabin seen toward its back wall (mirror, handrail, floor display), the front with sliding doors
// (the cabin is stuck between floors: the landing slab cuts the opening), a close-up of the button panel, a grocery bag,
// and the cabin light overlay (warm ceiling light -> blackout blue + red emergency lamp + flashlight).
import React from 'react';
import {INK, OW, HEROINE} from '../rig/style';
import {clamp, easeOut, wobble} from '../lib/anim';

const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};
export const EMERG = {x: 1490, y: 34};

const SteelDefs: React.FC = () => (
  <defs>
    <linearGradient id="el-steel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#b3bac4" /><stop offset="0.5" stopColor="#d3d8de" /><stop offset="1" stopColor="#aab1bb" />
    </linearGradient>
    <linearGradient id="el-side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#9aa1ab" /><stop offset="1" stopColor="#b9bfc8" />
    </linearGradient>
    <linearGradient id="el-mirror" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#a9bfd6" /><stop offset="1" stopColor="#7f97b3" />
    </linearGradient>
  </defs>
);

const EmergencyLamp: React.FC<{on: number}> = ({on}) => (
  <g transform={`translate(${EMERG.x} ${EMERG.y})`}>
    <rect x={-46} y={-18} width={92} height={40} rx={8} fill="#e9e4dc" {...st} />
    <rect x={-34} y={-8} width={68} height={22} rx={5} fill={on > 0.5 ? '#ff7a4a' : '#7a3a34'} stroke={INK} strokeWidth={3} />
    {[-20, -6, 8, 22].map((x) => <line key={x} x1={x} y1={-8} x2={x} y2={14} stroke={INK} strokeWidth={2} opacity={0.5} />)}
  </g>
);

// cabin toward the back wall
export const Cabin: React.FC<{lit: number; emergency: number; floor: string; arrow: number; t: number}> = ({lit, emergency, floor, arrow, t}) => (
  <g>
    <SteelDefs />
    <rect x={-300} y={-300} width={2520} height={1680} fill="#1c1f2c" />
    {/* ceiling with the light panel */}
    <path d="M -200 -200 L 2120 -200 L 1620 60 L 300 60 Z" fill="#8a919c" {...st} />
    <path d="M 560 -20 L 1360 -20 L 1300 40 L 620 40 Z" fill={lit > 0.5 ? '#fff6dc' : '#59606e'} {...st} />
    {[760, 960, 1160].map((x) => <line key={x} x1={x} y1={-20} x2={x * 0.94 + 58} y2={40} stroke={INK} strokeWidth={3} opacity={0.4} />)}
    <EmergencyLamp on={emergency} />
    {/* side walls */}
    <path d="M -200 -200 L 300 60 L 300 880 L -200 1280 Z" fill="url(#el-side)" {...st} />
    <path d="M 2120 -200 L 1620 60 L 1620 880 L 2120 1280 Z" fill="url(#el-side)" {...st} />
    {/* button panel on the right wall */}
    <path d="M 1690 360 L 1770 330 L 1770 650 L 1690 640 Z" fill="#c9ced6" {...st} />
    {Array.from({length: 8}, (_, i) => <ellipse key={i} cx={1716 + (i % 2) * 30} cy={384 + Math.floor(i / 2) * 52} rx={9} ry={12} fill="#8d93a3" stroke={INK} strokeWidth={2.5} />)}
    <ellipse cx={1731} cy={600} rx={13} ry={16} fill="#e8b04a" stroke={INK} strokeWidth={3} />
    {/* back wall: panels, mirror, handrail, floor display */}
    <rect x={300} y={60} width={1320} height={820} fill="url(#el-steel)" {...st} />
    {[740, 1180].map((x) => <line key={x} x1={x} y1={60} x2={x} y2={880} stroke="#99a0aa" strokeWidth={4} />)}
    <rect x={640} y={160} width={640} height={400} rx={10} fill="url(#el-mirror)" {...st} />
    <path d="M 700 540 L 860 180 M 760 540 L 900 230 M 1120 540 L 1240 260" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={14} strokeLinecap="round" />
    <rect x={880} y={76} width={160} height={58} rx={8} fill="#141622" {...st} />
    <text x={985} y={122} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={44} fill="#ff5a3c" opacity={0.25 + 0.75 * lit}>{floor}</text>
    <path d={`M 920 ${118 - (t * 40) % 10 * arrow} l 14 -22 l 14 22 Z`} fill="#ff5a3c" opacity={(0.25 + 0.75 * lit) * arrow} />
    <rect x={300} y={608} width={1320} height={18} rx={9} fill="#dfe3e8" {...st} />
    {[380, 960, 1540].map((x) => <rect key={x} x={x - 9} y={612} width={18} height={40} fill="#c9ced6" stroke={INK} strokeWidth={3} />)}
    {/* floor */}
    <path d="M 300 880 L 1620 880 L 2120 1280 L -200 1280 Z" fill="#4a4f5c" {...st} />
    {[930, 990, 1060].map((y, i) => <line key={i} x1={300 - (y - 880) * 1.25} y1={y} x2={1620 + (y - 880) * 1.25} y2={y} stroke="#3c404c" strokeWidth={4} />)}
  </g>
);

// cabin front: doors slide apart; the landing of the floor above shows in the upper part of the opening
export const DOOR = {x0: 640, x1: 1280, top: 100, bot: 900, slab: 470};
export const DoorsSet: React.FC<{open: number; slit: number; t: number; upper?: React.ReactNode}> = ({open, slit, t, upper}) => {
  const {x0, x1, top, bot, slab} = DOOR;
  const half = (x1 - x0) / 2;
  const off = half * 0.96 * clamp(open);
  return (
    <g>
      <SteelDefs />
      <defs><clipPath id="el-door"><rect x={x0} y={top} width={x1 - x0} height={bot - top} /></clipPath></defs>
      <rect x={-300} y={-300} width={2520} height={1680} fill="url(#el-steel)" />
      <path d="M -200 -200 L 2120 -200 L 2120 40 L -200 40 Z" fill="#8a919c" {...st} />
      <path d="M -200 900 L 2120 900 L 2120 1280 L -200 1280 Z" fill="#4a4f5c" {...st} />
      {[400, 1520].map((x) => <line key={x} x1={x} y1={40} x2={x} y2={900} stroke="#99a0aa" strokeWidth={4} />)}
      <g clipPath="url(#el-door)">
        {/* landing above: dark corridor, a flat door, then the shaft wall below the slab */}
        <rect x={x0} y={top} width={x1 - x0} height={slab - top} fill="#2b3050" />
        <rect x={x0 + 360} y={top + 20} width={170} height={slab - top} fill="#5a4034" stroke={INK} strokeWidth={4} />
        <circle cx={x0 + 380} cy={top + 250} r={7} fill="#c9a24a" />
        {upper}
      </g>
      {/* doors */}
      <g clipPath="url(#el-door)">
        <rect x={x0 - off} y={top} width={half} height={bot - top} fill="url(#el-steel)" {...st} />
        <rect x={x0 + half + off} y={top} width={half} height={bot - top} fill="url(#el-steel)" {...st} />
        {slit > 0 && open < 0.05 && <rect x={x0 + half - 3} y={top} width={6} height={bot - top} fill="#f4f8ff" opacity={slit * (0.7 + 0.3 * Math.sin(t * 9))} />}
      </g>
      <path d={`M ${x0 - 24} ${bot} L ${x0 - 24} ${top - 24} L ${x1 + 24} ${top - 24} L ${x1 + 24} ${bot}`} fill="none" stroke="#9aa1ab" strokeWidth={22} />
      <path d={`M ${x0} ${bot} L ${x0} ${top} L ${x1} ${top} L ${x1} ${bot}`} fill="none" {...st} />
      <path d={`M ${x0 - 36} ${bot} L ${x0 - 36} ${top - 36} L ${x1 + 36} ${top - 36} L ${x1 + 36} ${bot}`} fill="none" {...st} />
      <rect x={x0 - 60} y={bot} width={x1 - x0 + 120} height={14} fill="#c9ced6" {...st} />
      <EmergencyLamp on={1} />
    </g>
  );
};

// landing slab + shaft wall, drawn over the neighbour's body but under his arms (Character `between`)
export const SlabAndShaft: React.FC = () => {
  const {x0, x1, bot, slab} = DOOR;
  return (
    <g>
      <defs><clipPath id="el-door2"><rect x={x0} y={DOOR.top} width={x1 - x0} height={bot - DOOR.top} /></clipPath></defs>
      <g clipPath="url(#el-door2)">
        <rect x={x0} y={slab + 70} width={x1 - x0} height={bot - slab} fill="#23263a" />
        {[x0 + 120, x1 - 140].map((x) => <rect key={x} x={x} y={slab + 70} width={22} height={bot - slab} fill="#3a3f52" stroke={INK} strokeWidth={3} />)}
        <path d={`M ${x0 + 240} ${slab + 70} C ${x0 + 260} ${slab + 200} ${x0 + 220} ${slab + 300} ${x0 + 250} ${bot}`} stroke="#141622" strokeWidth={6} fill="none" />
        <rect x={x0} y={slab} width={x1 - x0} height={70} fill="#8d8a86" stroke={INK} strokeWidth={OW} />
        <rect x={x0} y={slab} width={x1 - x0} height={12} fill="#b3aea6" />
      </g>
    </g>
  );
};

// grocery bag hanging from a wrist (always hangs straight down)
export const Bag: React.FC<{p: {x: number; y: number}; t: number; swing?: number}> = ({p, t, swing = 0}) => (
  <g transform={`translate(${p.x} ${p.y + 6}) rotate(${Math.sin(t * 2.3) * 2 + swing})`}>
    <path d="M -22 4 Q -26 40 -34 52 M 22 4 Q 26 40 34 52" stroke="#e9e1d0" strokeWidth={6} fill="none" />
    <path d="M -22 4 Q -26 40 -34 52 M 22 4 Q 26 40 34 52" stroke={INK} strokeWidth={2} fill="none" opacity={0.5} />
    <rect x={20} y={-10} width={14} height={80} rx={7} fill="#e3b06a" stroke={INK} strokeWidth={3} transform="rotate(14 27 30)" />
    <path d="M -18 40 q -6 -24 4 -30 q 4 10 -4 30 M -6 40 q 0 -20 10 -26 q 0 12 -10 26" fill="#5f9a6f" stroke={INK} strokeWidth={3} />
    <path d="M -50 46 L 50 46 L 44 150 Q 0 160 -44 150 Z" fill="#f1ebdf" {...st} />
    <path d="M -24 90 q 24 -14 48 0" stroke="#e3654f" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

// close-up of the button panel; a finger presses the bell button twice, nothing lights up
export const ButtonInsert: React.FC<{f: number; fps: number; t0: number; press: number[]}> = ({f, fps, t0, press}) => {
  const t = f / fps, lt = t - t0;
  const enter = easeOut(lt / 0.5);
  const tap = Math.max(0, ...press.map((p) => (t > p - 0.18 && t < p + 0.35 ? Math.sin(clamp((t - p + 0.18) / 0.53) * Math.PI) : 0)));
  const B = {x: 960, y: 680};
  const hx = B.x + 110 + (1 - enter) * 500 + (1 - tap) * 40, hy = B.y - 14 + (1 - tap) * 20;
  const S = HEROINE.skin;
  const cam = `translate(${wobble(t * 0.8, 2) * 4} ${wobble(t * 0.6, 5) * 4}) translate(960 540) scale(${1 + lt * 0.012}) translate(-960 -540)`;
  return (
    <g transform={cam}>
      <SteelDefs />
      <rect x={-100} y={-100} width={2120} height={1280} fill="url(#el-side)" />
      <rect x={640} y={40} width={640} height={1000} rx={24} fill="url(#el-steel)" {...st} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const x = 800 + (i % 2) * 320, y = 110 + Math.floor(i / 2) * 100;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={40} fill="#c9ced6" {...st} />
            <circle cx={x} cy={y} r={30} fill="#e6e9ee" stroke="#9aa1ab" strokeWidth={4} />
            <text x={x} y={y + 14} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={38} fill="#3a3f52">{i + 1 === 10 ? '★' : i + 1}</text>
          </g>
        );
      })}
      {/* call button: bell icon, sinks a little when pressed, stays dark */}
      <circle cx={B.x} cy={B.y} r={78} fill="#c9ced6" {...st} />
      <circle cx={B.x} cy={B.y + tap * 4} r={60 - tap * 3} fill="#8a6a2a" stroke="#5a4a2a" strokeWidth={5} />
      <path transform={`translate(${B.x} ${B.y + tap * 4})`} d="M -24 14 Q -22 -26 0 -28 Q 22 -26 24 14 Z M -8 18 Q 0 28 8 18" fill="#3a2e1a" stroke="#3a2e1a" strokeWidth={4} strokeLinejoin="round" />
      <text x={B.x} y={B.y + 130} textAnchor="middle" fontFamily="sans-serif" fontWeight={800} fontSize={30} fill="#3a3f52" letterSpacing={4}>ВЫЗОВ</text>
      {/* hand with the index finger out, coming from the right */}
      <g transform={`translate(${hx} ${hy}) rotate(-12) scale(1.15)`}>
        <path d="M 120 40 L 900 160" stroke={INK} strokeWidth={170 + OW * 2} strokeLinecap="round" />
        <path d="M 120 40 L 900 160" stroke={HEROINE.topLight} strokeWidth={170} strokeLinecap="round" />
        <path d="M 150 46 L 210 54" stroke={HEROINE.cuff} strokeWidth={160} strokeLinecap="round" />
        <rect x={-110} y={-26} width={150} height={44} rx={22} fill={S.base} {...st} />
        <ellipse cx={70} cy={30} rx={90} ry={66} fill={S.light} {...st} />
        {[0, 1, 2].map((i) => <rect key={i} x={-10 + i * 6} y={18 + i * 30} width={70} height={34} rx={17} fill={S.base} {...st} />)}
        <path d="M -80 -10 q 8 -6 16 0" stroke={S.line} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

// cabin lighting: warm ceiling light, then blackout blue, the red emergency lamp and an optional flashlight
export const CabinLight: React.FC<{lit: number; dark: number; emergency: number; torch?: {x: number; y: number; k: number}}> = ({lit, dark, emergency, torch}) => (
  <g style={{pointerEvents: 'none'}}>
    <defs>
      <radialGradient id="cl-warm" cx={960} cy={0} r={1100} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff1d0" stopOpacity="0.4" /><stop offset="1" stopColor="#fff1d0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cl-red" cx={EMERG.x} cy={EMERG.y + 60} r={1000} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ff6a46" stopOpacity="0.85" /><stop offset="0.4" stopColor="#ff4a3a" stopOpacity="0.32" /><stop offset="1" stopColor="#ff4a3a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cl-torch" cx={torch?.x ?? 0} cy={torch?.y ?? 0} r={330} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f2f7ff" stopOpacity="0.9" /><stop offset="0.5" stopColor="#d6e6ff" stopOpacity="0.35" /><stop offset="1" stopColor="#d6e6ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cl-vig" cx="960" cy="540" r="1150" gradientUnits="userSpaceOnUse">
        <stop offset="0.55" stopColor="#0c0a18" stopOpacity="0" /><stop offset="1" stopColor="#0c0a18" stopOpacity="0.6" />
      </radialGradient>
    </defs>
    <rect x={-300} y={-300} width={2520} height={1680} fill="url(#cl-warm)" style={{mixBlendMode: 'screen'}} opacity={lit} />
    <rect x={-300} y={-300} width={2520} height={1680} fill="#4458a6" style={{mixBlendMode: 'multiply'}} opacity={dark} />
    <rect x={-300} y={-300} width={2520} height={1680} fill="#0d1230" opacity={dark * 0.22} />
    <rect x={-300} y={-300} width={2520} height={1680} fill="url(#cl-red)" style={{mixBlendMode: 'screen'}} opacity={emergency * 0.6} />
    {torch && torch.k > 0 && <rect x={-300} y={-300} width={2520} height={1680} fill="url(#cl-torch)" style={{mixBlendMode: 'screen'}} opacity={torch.k} />}
    <rect x={-300} y={-300} width={2520} height={1680} fill="url(#cl-vig)" opacity={0.5 + dark * 0.4} />
  </g>
);
