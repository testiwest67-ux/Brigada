// Full-frame close-up of the kitchen sink: your hand lifts the tap lever, one drop falls and nothing else comes;
// then the camera slides right to the last two water bottles. Beats (seconds): turn, drop, pumps, pan, bottles.
// World is wider than the frame (0..2500); the episode lights it with <Light> in screen space.
import React from 'react';
import {INK, OW, HERO} from '../rig/style';
import {Candle} from './Kitchen';
import {clamp, easeInOut, easeOut, kick, lerp, mixP, ramp, spring01, wobble} from '../lib/anim';

type Beats = {turn: number; drop: number; pumps: number; pan: number; bottles: number};
export const SINK_PAN = 600; // how far the camera slides to the bottles
export const SINK_CANDLE = {x: 1980, y: 690};
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};
const PIV = {x: 820, y: 552}; // lever pivot on top of the tap

const Bottle: React.FC<{x: number; y: number; t: number; k: number; level: number}> = ({x, y, t, k, level}) => {
  const body = `M ${x - 46} ${y} Q ${x - 50} ${y - 8} ${x - 50} ${y - 30} L ${x - 50} ${y - 200} Q ${x - 50} ${y - 236} ${x - 24} ${y - 258}
    L ${x - 18} ${y - 290} L ${x + 18} ${y - 290} L ${x + 24} ${y - 258} Q ${x + 50} ${y - 236} ${x + 50} ${y - 200} L ${x + 50} ${y - 30} Q ${x + 50} ${y - 8} ${x + 46} ${y} Z`;
  const wl = y - 30 - level * 170;
  const wv = Math.sin(t * 2.4 + x) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <ellipse cx={x} cy={y + 3} rx={58} ry={9} fill="#000" opacity={0.18} />
      <clipPath id={`bt${x}`}><path d={body} /></clipPath>
      <path d={body} fill="#d6ecff" opacity={0.9} />
      <g clipPath={`url(#bt${x})`}>
        <path d={`M ${x - 60} ${wl + wv} Q ${x} ${wl - wv * 1.5} ${x + 60} ${wl + wv} L ${x + 60} ${y + 10} L ${x - 60} ${y + 10} Z`} fill="#7cc0ff" />
        <rect x={x - 60} y={y - 150} width={120} height={56} fill="#f4f6fa" />
        <path d={`M ${x - 40} ${y - 122} q 14 -14 28 0 t 28 0 t 28 0`} stroke="#4a8fe0" strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect x={x + 24} y={y - 240} width={10} height={190} rx={5} fill="#ffffff" opacity={0.55} />
      </g>
      <path d={body} fill="none" {...st} />
      <rect x={x - 22} y={y - 312} width={44} height={26} rx={6} fill="#3a7bd5" {...st} />
      <path d={`M ${x - 14} ${y - 306} v 14 M ${x} ${y - 306} v 14 M ${x + 14} ${y - 306} v 14`} stroke="#2b5fa8" strokeWidth={3} />
    </g>
  );
};

export const SinkInsert: React.FC<{f: number; fps: number; t0: number; beats: Beats}> = ({f, fps, t0, beats}) => {
  const t = f / fps, lt = t - t0;
  const pan = SINK_PAN * ramp(t, beats.pan, beats.pan + 1.0, easeInOut);
  const push = 1 + lt * 0.01;
  const camX = wobble(t * 0.8, 3) * 4 - pan, camY = wobble(t * 0.6, 9) * 4;

  // lever: rests flat, the hand lifts it, it stays up (no water anyway)
  const lift = ramp(t, beats.turn, beats.turn + 0.35, easeOut);
  const shudder = kick(f, beats.pumps * fps, fps, 7, 5) * 4;
  const lev = 188 + 40 * lift; // the lever points left; lifting turns its tip up
  const la = (lev * Math.PI) / 180;
  const tip = {x: PIV.x + Math.cos(la) * 112, y: PIV.y + Math.sin(la) * 112};

  // hand comes in from the bottom left (never across the spout), grabs the lever tip, lets go after "pumps" and leaves
  const OFF = {x: 520, y: 1220};
  const inK = easeOut(clamp((lt - 0.05) / 0.55));
  const outK = ramp(t, beats.pumps + 0.35, beats.pumps + 1.0, easeInOut);
  const grabP = {x: tip.x + 6, y: tip.y + 4};
  const hand = mixP(mixP(OFF, grabP, inK), {x: 600, y: 1240}, outK);
  const sleeveEnd = {x: hand.x - 560, y: hand.y + 660};

  // one drop forms at the spout, falls, splashes
  const SP = {x: 1004, y: 438};
  const grow = ramp(t, beats.turn + 0.25, beats.drop, easeOut);
  const fallT = Math.max(0, t - beats.drop);
  const fallY = SP.y + 6 + 900 * fallT * fallT;
  const landed = fallY >= 704;
  const splash = landed ? clamp((t - (beats.drop + Math.sqrt((704 - SP.y - 6) / 900))) / 0.45) : 0;

  const bottleK = (i: number) => 1 + 0.08 * Math.max(0, Math.sin(clamp(spring01(f, (beats.bottles + i * 0.12) * fps, fps, 2.4, 0.45)) * Math.PI));

  return (
    <g>
      <defs>
        <linearGradient id="si-tap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#aab3c2" /><stop offset="0.45" stopColor="#eef2f7" /><stop offset="1" stopColor="#9aa3b0" />
        </linearGradient>
        <linearGradient id="si-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d8696" /><stop offset="1" stopColor="#b9c1cc" />
        </linearGradient>
      </defs>
      <g transform={`translate(${960 + camX} ${540 + camY}) scale(${push}) translate(-960 -540)`}>
        {/* tiled wall */}
        <rect x={-200} y={-200} width={3000} height={860} fill="#e6ece8" />
        {Array.from({length: 34}, (_, i) => <line key={'v' + i} x1={-200 + i * 90} y1={-200} x2={-200 + i * 90} y2={650} stroke="#c9d4ce" strokeWidth={4} />)}
        {Array.from({length: 10}, (_, i) => <line key={'h' + i} x1={-200} y1={-160 + i * 90} x2={2800} y2={-160 + i * 90} stroke="#c9d4ce" strokeWidth={4} />)}
        {/* counter top + cabinets */}
        <path d="M -200 640 L 2800 640 L 2800 760 L -200 760 Z" fill="#e3dccf" {...st} />
        <rect x={-200} y={760} width={3000} height={500} fill="#6f9789" {...st} />
        {[260, 700, 1140, 1580, 2020, 2460].map((x) => (
          <g key={x}>
            <line x1={x} y1={760} x2={x} y2={1200} stroke={INK} strokeWidth={OW} />
            <rect x={x - 34} y={800} width={12} height={60} rx={5} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
            <rect x={x + 22} y={800} width={12} height={60} rx={5} fill="#e9e4dc" stroke={INK} strokeWidth={3} />
          </g>
        ))}
        {/* sink bowl */}
        <ellipse cx={900} cy={704} rx={300} ry={46} fill="#c9d0da" {...st} />
        <ellipse cx={900} cy={708} rx={268} ry={34} fill="url(#si-bowl)" stroke={INK} strokeWidth={3} />
        <ellipse cx={1004} cy={712} rx={20} ry={6} fill="#4a5060" stroke={INK} strokeWidth={3} />
        {splash > 0 && splash < 1 && (
          <g opacity={1 - splash}>
            <ellipse cx={1004} cy={706} rx={14 + 60 * splash} ry={4 + 10 * splash} fill="none" stroke="#e4f2ff" strokeWidth={3} />
            {[-1, 1].map((s) => <circle key={s} cx={1004 + s * (10 + 30 * splash)} cy={700 - 40 * splash + 60 * splash * splash} r={4} fill="#d4ecff" />)}
          </g>
        )}

        {/* the tap: base, gooseneck, lever */}
        <g transform={`translate(${shudder} 0)`}>
          <path d="M 772 650 L 778 566 Q 820 552 862 566 L 868 650 Z" fill="url(#si-tap)" {...st} />
          <path d="M 820 566 L 820 360 C 820 290 1004 290 1004 360 L 1004 430" stroke={INK} strokeWidth={40 + OW * 2} fill="none" strokeLinecap="round" />
          <path d="M 820 566 L 820 360 C 820 290 1004 290 1004 360 L 1004 430" stroke="url(#si-tap)" strokeWidth={40} fill="none" strokeLinecap="round" />
          <path d="M 808 540 L 808 372 C 808 316 880 300 930 312" stroke="#ffffff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
          <rect x={984} y={424} width={40} height={18} rx={5} fill="#7d8696" stroke={INK} strokeWidth={4} />
          <path d={`M ${PIV.x} ${PIV.y} L ${tip.x} ${tip.y}`} stroke={INK} strokeWidth={24 + OW * 2} strokeLinecap="round" />
          <path d={`M ${PIV.x} ${PIV.y} L ${tip.x} ${tip.y}`} stroke="url(#si-tap)" strokeWidth={24} strokeLinecap="round" />
          <circle cx={PIV.x} cy={PIV.y} r={20} fill="#c9d0da" {...st} />
        </g>

        {/* the drop */}
        {t > beats.turn + 0.25 && !landed && (
          <path transform={`translate(${SP.x} ${t < beats.drop ? SP.y + 10 + grow * 6 : fallY}) scale(${0.4 + 0.6 * grow})`}
            d="M 0 -12 C 8 -2 10 4 10 8 C 10 14 5 18 0 18 C -5 18 -10 14 -10 8 C -10 4 -8 -2 0 -12 Z" fill="#cfe8ff" stroke={INK} strokeWidth={3} />
        )}

        {/* the last water: two bottles, and the candle from the first night */}
        <Bottle x={1560} y={692} t={t} k={bottleK(0)} level={0.85} />
        <Bottle x={1720} y={692} t={t} k={bottleK(1)} level={0.35} />
        <Candle x={SINK_CANDLE.x} y={SINK_CANDLE.y} flame={1} t={t} />

        {/* forearm + hand on the lever */}
        <path d={`M ${hand.x - 40} ${hand.y + 44} L ${sleeveEnd.x} ${sleeveEnd.y}`} stroke={INK} strokeWidth={96 + OW * 2} strokeLinecap="round" />
        <path d={`M ${hand.x - 40} ${hand.y + 44} L ${sleeveEnd.x} ${sleeveEnd.y}`} stroke={HERO.topLight} strokeWidth={96} strokeLinecap="round" />
        <path d={`M ${hand.x - 52} ${hand.y + 58} L ${hand.x - 80} ${hand.y + 92}`} stroke={HERO.cuff} strokeWidth={90} strokeLinecap="round" />
        {/* fist around the lever: palm, four fingers across the lever, thumb underneath */}
        <g transform={`translate(${hand.x} ${hand.y}) rotate(${lev - 180})`}>
          <ellipse cx={-22} cy={22} rx={22} ry={14} fill={HERO.skin.base} {...st} />
          <ellipse cx={18} cy={14} rx={52} ry={36} fill={HERO.skin.light} {...st} />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={-20 + i * 20} y={-30} width={21} height={52} rx={10} fill={HERO.skin.base} {...st} />)}
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-14 + i * 20} -18 q 4 -6 9 0`} stroke={HERO.skin.line} strokeWidth={3} fill="none" strokeLinecap="round" />)}
        </g>
      </g>
    </g>
  );
};
