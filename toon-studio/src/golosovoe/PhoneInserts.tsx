// «Голосовое в 3:33»: 2D inserts (1080×1920 SVG) — the phone screen (an invented messenger: green bubbles, contact «Я»,
// no brands), the bedside clock, the bed edge (a hand hanging down, a sock, scratches), the dark gap under the bed with
// the double's face, the long pale fingers on the duvet.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';
import {TemaLight} from '../horror/Tema';
import {Person, PERSON_REST, PersonState} from './People';

const W = 1080, H = 1920;
const INK = '#14121c';
const PALE = '#d2d1ca', PALE_D = '#a6a59e';
const DARK_LIGHT: TemaLight = {bright: 0.7, warmRim: 0.05, coldRim: 0.9, cold: 0.55};

const Mic: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#d8f5e0'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-9} y={-22} width={18} height={30} rx={9} fill={c} />
    <path d="M -15 0 C -15 16 15 16 15 0 M 0 14 L 0 24 M -9 24 L 9 24" stroke={c} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// waveform bars of a 7-second voice message
const WAVE = Array.from({length: 34}, (_, i) => { const r = mulberry32(i + 7); return 0.25 + r() * 0.75 * (0.6 + 0.4 * Math.sin(i * 0.7)); });

export type PhoneMode = 'lock' | 'chat' | 'record' | 'sent2';
// mode lock: big clock + a notification; chat: the «Я» chat with the voice message; record: a voice message is being recorded
// by itself (red dot, timer); sent2: chat with TWO identical messages (the 2nd one just sent).
export const PhoneInsert: React.FC<{t: number; k: number; mode: PhoneMode; time: string; progress?: number; rec?: number;
  hl?: 'me' | 'sent' | 'clock' | 'play'; vibrate?: number; glow?: number; tap?: number; note?: string; dim?: number}> = (p) => {
  const {t, k, mode, time, progress = 0, rec = 0, hl, vibrate = 0, glow = 1, tap = 0, note = 'Голосовое · 0:07', dim = 0} = p;
  const vx = vibrate * Math.sin(t * 70) * 10, vr = vibrate * Math.sin(t * 55) * 1.2;
  const sc = lerp(1, 1.07, k);
  const px = 190, py = 230, pw = 700, ph = 1460;           // the phone body
  const sx = px + 26, sy = py + 26, sw = pw - 52, shh = ph - 52; // the screen
  const red = '#ff3b3b', green = '#1f8a5a';
  const bubble = (y: number, prog: number, stamp: string, stampRed: boolean, sent = false) => (
    <g>
      <rect x={sx + 120} y={y} width={sw - 150} height={150} rx={40} fill={sent ? '#2a6e4c' : green} />
      <circle cx={sx + 205} cy={y + 75} r={42} fill="#d8f5e0" />
      <path d={`M ${sx + 192} ${y + 52} L ${sx + 226} ${y + 75} L ${sx + 192} ${y + 98} Z`} fill={green} />
      {WAVE.map((a, i) => {
        const x = sx + 270 + i * 9.4, hh = 70 * a, on = i / WAVE.length < prog;
        return <rect key={i} x={x} y={y + 70 - hh / 2} width={5.5} height={hh} rx={3} fill={on ? '#ffffff' : '#9ed8b6'} />;
      })}
      <text x={sx + 270} y={y + 136} fontFamily={FONT} fontWeight={700} fontSize={26} fill="#d8f5e0">0:07</text>
      <text x={sx + sw - 46} y={y + 136} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={stampRed ? 34 : 26} fill={stampRed ? '#ffd0d0' : '#d8f5e0'}>{stamp}</text>
      {stampRed && <rect x={sx + sw - 150} y={y + 104} width={112} height={44} rx={10} fill="none" stroke={red} strokeWidth={5} />}
    </g>
  );
  return (
    <AbsoluteFill style={{background: '#020305'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="phGlow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor="#7fb6ff" stopOpacity={0.22 * glow} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
        </defs>
        {/* the sheet under the phone */}
        <rect width={W} height={H} fill="#0b111d" />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${-100 + i * 240} 0 C ${i * 240} 600 ${-80 + i * 240} 1300 ${i * 240} 1920`} stroke="#121a2a" strokeWidth={60} fill="none" />)}
        <rect width={W} height={H} fill="url(#phGlow)" />
        <g transform={`translate(540 960) scale(${sc}) rotate(${vr}) translate(${-540 + vx} -960)`}>
          <rect x={px} y={py} width={pw} height={ph} rx={90} fill="#0c0d10" stroke="#2a2c34" strokeWidth={8} />
          <clipPath id="phScr"><rect x={sx} y={sy} width={sw} height={shh} rx={70} /></clipPath>
          <g clipPath="url(#phScr)" opacity={glow}>
            <rect x={sx} y={sy} width={sw} height={shh} fill={mode === 'lock' ? '#101a30' : '#0e1512'} />
            {/* status bar */}
            <text x={sx + 70} y={sy + 70} fontFamily={FONT} fontWeight={800} fontSize={hl === 'clock' ? 46 : 32} fill={hl === 'clock' ? red : '#e8eef6'}>{time}</text>
            <rect x={sx + sw - 120} y={sy + 44} width={56} height={26} rx={6} fill="none" stroke="#e8eef6" strokeWidth={3} />
            <rect x={sx + sw - 116} y={sy + 48} width={20} height={18} rx={3} fill="#e8eef6" />
            {mode === 'lock' && (
              <g>
                <text x={540} y={sy + 400} textAnchor="middle" fontFamily={FONT} fontWeight={300} fontSize={230} fill="#e8eef6">{time}</text>
                <text x={540} y={sy + 470} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={36} fill="#9fb0c8">четверг</text>
                <rect x={sx + 40} y={sy + 620} width={sw - 80} height={190} rx={40} fill="#e8eef6" opacity={0.92} />
                <circle cx={sx + 120} cy={sy + 715} r={46} fill={green} />
                <text x={sx + 120} y={sy + 733} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">Я</text>
                <text x={sx + 190} y={sy + 700} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#14121c">Я</text>
                <Mic x={sx + 205} y={sy + 760} s={0.9} c="#3a3f4a" />
                <text x={sx + 232} y={sy + 772} fontFamily={FONT} fontWeight={600} fontSize={32} fill="#3a3f4a">{note}</text>
              </g>
            )}
            {mode !== 'lock' && (
              <g>
                {/* chat header */}
                <rect x={sx} y={sy + 100} width={sw} height={150} fill="#16211c" />
                <circle cx={sx + 100} cy={sy + 175} r={48} fill={green} />
                <text x={sx + 100} y={sy + 194} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#fff">Я</text>
                <text x={sx + 175} y={sy + 170} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#e8eef6">Я</text>
                <text x={sx + 175} y={sy + 215} fontFamily={FONT} fontWeight={600} fontSize={hl === 'me' ? 34 : 28} fill={hl === 'me' ? '#ffd0d0' : '#8fa79a'}>{hl === 'me' ? 'это ваш номер' : 'в сети'}</text>
                {hl === 'me' && <rect x={sx + 165} y={sy + 182} width={262} height={46} rx={10} fill="none" stroke={red} strokeWidth={5} />}
                {bubble(sy + 520, progress, '3:33', hl === 'sent')}
                {mode === 'sent2' && bubble(sy + 720, 0, '3:33', true, true)}
                {/* the play tap */}
                {tap > 0.01 && <circle cx={sx + 205} cy={sy + 595} r={50 + 40 * tap} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - tap} />}
                {/* bottom bar: input or recording */}
                <rect x={sx} y={sy + shh - 200} width={sw} height={200} fill="#16211c" />
                {mode === 'record' ? (
                  <g>
                    <circle cx={sx + 90} cy={sy + shh - 100} r={22 + 6 * Math.sin(t * 8)} fill={red} />
                    <text x={sx + 135} y={sy + shh - 86} fontFamily={FONT} fontWeight={800} fontSize={42} fill="#ffd0d0">{`0:0${Math.min(7, Math.floor(rec))}`}</text>
                    {Array.from({length: 22}, (_, i) => { const a = 0.2 + 0.8 * Math.abs(Math.sin(t * 9 + i * 1.3)) * (rec > 0 ? 1 : 0.1); return <rect key={i} x={sx + 250 + i * 13} y={sy + shh - 100 - 30 * a} width={7} height={60 * a} rx={3} fill="#ff8a8a" />; })}
                    <circle cx={sx + sw - 90} cy={sy + shh - 100} r={56} fill={red} />
                    <Mic x={sx + sw - 90} y={sy + shh - 100} s={1.2} c="#fff" />
                  </g>
                ) : (
                  <g>
                    <rect x={sx + 40} y={sy + shh - 150} width={sw - 200} height={90} rx={45} fill="#22302a" />
                    <circle cx={sx + sw - 90} cy={sy + shh - 105} r={52} fill={green} />
                    <Mic x={sx + sw - 90} y={sy + shh - 105} s={1.1} />
                  </g>
                )}
              </g>
            )}
          </g>
        </g>
        {dim > 0 && <rect width={W} height={H} fill="#000" opacity={dim} />}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the bedside clock: red digits in the dark ----------
export const ClockInsert: React.FC<{t: number; k: number; time: string; flash?: number}> = ({t, k, time, flash = 0}) => {
  const blinkColon = Math.floor(t * 2) % 2 === 0;
  const [hh, mm] = time.split(':');
  return (
    <AbsoluteFill style={{background: '#030305'}}>
      <svg width={W} height={H}>
        <defs><radialGradient id="ckGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ff2020" stopOpacity={0.35 + 0.3 * flash} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.12, k)}) translate(-540 -960)`}>
          <rect x={0} y={1150} width={W} height={770} fill="#1a120c" />
          <path d="M 0 1150 L 1080 1150" stroke="#2a1e14" strokeWidth={10} />
          <ellipse cx={540} cy={960} rx={600} ry={420} fill="url(#ckGlow)" />
          <path d="M 170 1150 L 210 760 L 870 760 L 910 1150 Z" fill="#0d0e12" stroke="#22242c" strokeWidth={8} />
          <rect x={250} y={820} width={580} height={250} rx={18} fill="#060608" />
          <text x={540} y={1015} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={190} fill="#ff2b2b" letterSpacing={6}>
            {hh}{blinkColon ? ':' : ' '}{mm}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the bed edge from the floor: the duvet edge, the dark gap under the bed, the floor ----------
// hand: 1 his hand hangs down to the floor .. 0 pulled up; sock: 1 on the floor .. 0 gone (dragged into the dark);
// scratch: 0..1 scratch marks; eyes: 0..1 two faint glints in the dark
export const BedEdgeInsert: React.FC<{t: number; k: number; hand?: number; sock?: number; scratch?: number; eyes?: number}> = ({t, k, hand = 0, sock = 0, scratch = 0, eyes = 0}) => {
  const r = mulberry32(3);
  const marks = Array.from({length: 4}, (_, i) => ({x: 300 + i * 90 + r() * 30, len: 120 + r() * 80}));
  const hy = lerp(560, 1240, hand);  // fingertip height
  const sockX = lerp(300, 700, 1 - sock), sockO = clamp(sock * 1.4);
  return (
    <AbsoluteFill style={{background: '#04050a'}}>
      <svg width={W} height={H}>
        <defs>
          <linearGradient id="beFloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2a1f16" /><stop offset="1" stopColor="#140e0a" /></linearGradient>
          <linearGradient id="beGap" x1="0" x2="1"><stop offset="0" stopColor="#000" /><stop offset="0.8" stopColor="#000" /><stop offset="1" stopColor="#0a0c12" /></linearGradient>
        </defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.1, k)}) translate(-540 -960)`}>
          {/* floor */}
          <rect x={0} y={1300} width={W} height={620} fill="url(#beFloor)" />
          {Array.from({length: 7}, (_, i) => <path key={i} d={`M 0 ${1330 + i * 90} L ${W} ${1310 + i * 96}`} stroke="#1a130d" strokeWidth={4} />)}
          {/* the gap under the bed */}
          <rect x={0} y={760} width={W} height={560} fill="url(#beGap)" />
          {/* scratches on the floor at the edge of the dark */}
          {marks.map((m, i) => <path key={i} d={`M ${m.x + 120} 1560 l ${-30} ${m.len * 1.4 * scratch}`} stroke="#c9b8a0" strokeWidth={5} opacity={0.65 * scratch} strokeLinecap="round" />)}
          {/* eyes in the dark */}
          {eyes > 0 && [-1, 1].map((sd) => <ellipse key={sd} cx={330 + sd * 36} cy={1080} rx={12} ry={7} fill="#e8f0dc" opacity={eyes * (0.7 + 0.3 * Math.sin(t * 3))} />)}
          {/* the sock */}
          <g opacity={sockO} transform={`translate(${sockX} ${lerp(1250, 1680, sock)}) rotate(-8) scale(1.6)`}>
            <path d="M -60 -20 L 40 -20 C 70 -20 80 20 50 26 L -40 26 Z" fill="#e8e4dc" stroke={INK} strokeWidth={5} />
            <path d="M -60 -20 L -60 26" stroke="#9aa0b0" strokeWidth={12} />
          </g>
          {/* bed frame and the hanging duvet */}
          <rect x={0} y={600} width={W} height={170} fill="#3a2418" stroke={INK} strokeWidth={8} />
          <path d={`M 0 300 L ${W} 300 L ${W} 690 C 900 760 720 700 560 770 C 400 820 200 740 0 790 Z`} fill="#2f4a72" stroke={INK} strokeWidth={10} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 250} 320 C ${160 + i * 250} 500 ${110 + i * 250} 640 ${140 + i * 250} 760`} stroke="#22385a" strokeWidth={18} fill="none" />)}
          {/* his hand hanging over the edge */}
          {hand > 0.02 && (
            <g>
              <path d={`M 700 640 C 700 ${lerp(640, 900, hand)} 690 ${hy - 120} 680 ${hy - 70}`} stroke={INK} strokeWidth={86} fill="none" strokeLinecap="round" />
              <path d={`M 700 640 C 700 ${lerp(640, 900, hand)} 690 ${hy - 120} 680 ${hy - 70}`} stroke="#2f5d62" strokeWidth={70} fill="none" strokeLinecap="round" />
              <ellipse cx={680} cy={hy - 30} rx={40} ry={52} fill="#efc6a6" stroke={INK} strokeWidth={6} />
              {[-24, -8, 8, 24].map((fx, i) => <rect key={i} x={680 + fx - 8} y={hy - 4} width={16} height={36 - Math.abs(fx) * 0.3} rx={8} fill="#efc6a6" stroke={INK} strokeWidth={5} />)}
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the dark gap under the bed, low angle: the double lies there, face towards us, lit by the phone ----------
export const UnderBedInsert: React.FC<{t: number; k: number; face: number; s?: Partial<PersonState>; light?: number}> = ({t, k, face, s = {}, light = 0.6}) => {
  const P: PersonState = {...PERSON_REST, t, uncanny: 1, blink: 1, ...s};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="ubLight" cx="0.55" cy="0.52" r="0.32"><stop offset="0" stopColor="#000" stopOpacity={1 - light} /><stop offset="1" stopColor="#000" stopOpacity={0.97} /></radialGradient>
        </defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.18, k)}) translate(-540 -960)`}>
          {/* the floor under the bed going into the dark */}
          <rect x={0} y={1180} width={W} height={740} fill="#1a130d" />
          {Array.from({length: 6}, (_, i) => <path key={i} d={`M 0 ${1200 + i * 110} L ${W} ${1190 + i * 115}`} stroke="#120d09" strokeWidth={4} />)}
          {/* he lies on his side: the head on the floor, face to the lens */}
          <g opacity={face} transform="translate(600 1040) rotate(-90) translate(0 1150) scale(0.85)">
            <Person s={P} light={DARK_LIGHT} id="ub" crop={-900} variant="double" />
          </g>
          {/* the underside of the bed: slats */}
          <rect x={0} y={0} width={W} height={760} fill="#0c0806" />
          {Array.from({length: 6}, (_, i) => <rect key={i} x={0} y={600 + i * 28} width={W} height={14} fill="#1c130c" />)}
        </g>
        <rect width={W} height={H} fill="url(#ubLight)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- long pale fingers slide onto the duvet from the edge ----------
export const FingersInsert: React.FC<{t: number; k: number; reach: number}> = ({t, k, reach}) => {
  const x0 = lerp(1500, 900, reach);
  const tw = Math.sin(t * 3) * 6;
  return (
    <AbsoluteFill style={{background: '#05070d'}}>
      <svg width={W} height={H}>
        <defs><linearGradient id="fiMoon" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8aa8ff" stopOpacity={0.3} /><stop offset="0.7" stopColor="#8aa8ff" stopOpacity={0} /></linearGradient></defs>
        <g transform={`translate(540 960) scale(${lerp(1, 1.1, k)}) translate(-540 -960)`}>
          <rect width={W} height={H} fill="#2f4a72" />
          {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${-60 + i * 220} 0 C ${30 + i * 220} 600 ${-40 + i * 220} 1300 ${40 + i * 220} 1920`} stroke="#22385a" strokeWidth={30} fill="none" />)}
          {/* the bed edge on the right */}
          <rect x={980} y={0} width={140} height={H} fill="#0a0c12" />
          {/* the hand: a thin wrist from the edge, four long crooked fingers */}
          <g transform={`translate(${x0} 980) scale(1.8)`}>
            <path d="M 260 -40 C 140 -30 60 -20 0 0 L 0 60 C 60 70 140 60 260 70 Z" fill={PALE} stroke={INK} strokeWidth={7} />
            <path d="M 260 -40 C 140 -30 60 -20 0 0 L 0 60 C 60 70 140 60 260 70 Z" fill="#3e5452" opacity={0} />
            {[-30, -6, 18, 42].map((fy, i) => {
              const len = [300, 340, 320, 260][i], bend = [18, -10, 14, -16][i];
              const d = `M 10 ${fy + 10} C ${-len * 0.4} ${fy + bend} ${-len * 0.7} ${fy - bend + tw} ${-len} ${fy + bend * 1.5}`;
              return (
                <g key={i}>
                  <path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
                  <path d={d} stroke={PALE} strokeWidth={18} fill="none" strokeLinecap="round" />
                  <circle cx={-len * 0.5} cy={fy + bend * 0.2} r={9} fill={PALE_D} stroke={INK} strokeWidth={3} />
                  <ellipse cx={-len + 4} cy={fy + bend * 1.5} rx={12} ry={8} fill="#2a2420" />
                </g>
              );
            })}
          </g>
        </g>
        <rect width={W} height={H} fill="url(#fiMoon)" />
      </svg>
    </AbsoluteFill>
  );
};
