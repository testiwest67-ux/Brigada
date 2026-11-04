// «Перевал Дятлова» — test of the mixed approach (04.11): a Nano Banana background (public/dyatlov/bg/tent-night.png)
// brought to life with code — slow push-in, three snow layers, ground drift, moving cloud light, moon flicker, grain,
// subtitles — followed by the same shot drawn in our old pure-SVG style for comparison. 16:9, 1920×1080.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut, lerp, mulberry32} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {Grain, Vignette} from '../horror/fx';

const W = 1920, H = 1080;
export const PART = 8; // seconds per half

// ---------- falling snow: 3 depth layers, wind from the right ----------
export const Snow: React.FC<{t: number; wind?: number; density?: number}> = ({t, wind = 1, density = 1}) => {
  const layers = [
    {n: 140, size: [1.2, 2.4], speed: 60, drift: 120, o: 0.45, blur: 0},
    {n: 90, size: [2.5, 4.5], speed: 110, drift: 220, o: 0.7, blur: 0.6},
    {n: 26, size: [6, 10], speed: 220, drift: 420, o: 0.55, blur: 3},
  ];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {layers.map((L, li) => {
        const r = mulberry32(11 + li * 101);
        return (
          <g key={li} opacity={L.o} style={{filter: L.blur ? `blur(${L.blur}px)` : undefined}}>
            {Array.from({length: Math.round(L.n * density)}, (_, i) => {
              const x0 = r() * (W + 600), y0 = r() * H, s = lerp(L.size[0], L.size[1], r()), ph = r() * 6.28;
              const y = (y0 + t * L.speed * (0.7 + 0.6 * r())) % (H + 40) - 20;
              const x = ((x0 - t * L.drift * wind + Math.sin(t * 1.3 + ph) * 18) % (W + 600) + W + 600) % (W + 600) - 300;
              return <circle key={i} cx={x} cy={y} r={s} fill="#eef4ff" />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// ---------- ground drift: soft streaks sliding across the lower part ----------
export const GroundDrift: React.FC<{t: number; o?: number}> = ({t, o = 1}) => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
    {[0, 1, 2, 3].map((i) => {
      const x = ((t * (160 + i * 70) + i * 500) % (W + 1400)) - 700;
      return <div key={i} style={{position: 'absolute', left: W - x - 700, top: 640 + i * 95, width: 900, height: 70,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(225,235,255,0.22), rgba(225,235,255,0) 70%)', filter: 'blur(14px)'}} />;
    })}
  </AbsoluteFill>
);

// ---------- 16:9 subtitles: word by word, bottom centre ----------
export type Cap = {from: number; to: number; text: string; red?: string[]};
export const Captions16: React.FC<{caps: Cap[]; t: number}> = ({caps, t}) => {
  const c = caps.find((c) => t >= c.from && t < c.to);
  if (!c) return null;
  const words = c.text.split(' ');
  const per = Math.min(0.32, (c.to - c.from - 0.4) / words.length);
  const out = clamp((c.to - t) / 0.2);
  return (
    <div style={{position: 'absolute', left: 160, right: 160, bottom: 90, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 22px', opacity: out}}>
      {words.map((w, i) => {
        const k = clamp((t - c.from - i * per) / 0.18);
        const red = c.red?.some((r) => w.toLowerCase().startsWith(r));
        return <span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: red ? '#ff3b3b' : '#fff', opacity: k,
          transform: `translateY(${(1 - k) * 14}px)`, WebkitTextStroke: '9px #05070c', paintOrder: 'stroke fill',
          textShadow: '0 5px 0 #05070c, 0 0 22px rgba(0,0,0,0.7)'}}>{w}</span>;
      })}
    </div>
  );
};

const CAPS: Cap[] = [
  {from: 0.4, to: 3.6, text: 'На склоне горы стоит палатка.'},
  {from: 3.9, to: 7.6, text: 'Стенка разрезана. Изнутри.', red: ['изнутри']},
];

// ---------- new style: Nano Banana background + code animation ----------
const NewStyle: React.FC<{t: number; f: number}> = ({t, f}) => {
  const k = easeInOut(clamp(t / PART));
  const scale = lerp(1.02, 1.13, k), tx = 0, ty = 0; // slow push toward the tent (tent at ~25% / 45%)
  const moon = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 2.3);
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '26% 48%'}}>
        <Img src={staticFile('dyatlov/bg/tent-night.png')} style={{width: W, height: H, objectFit: 'cover', filter: `brightness(${1.12 + 0.12 * (moon - 0.85)}) contrast(1.05)`}} />
        {/* cloud light sliding across the sky */}
        <div style={{position: 'absolute', left: -700 + t * 70, top: -60, width: 1300, height: 520,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,195,255,0.16), rgba(170,195,255,0) 70%)', filter: 'blur(30px)'}} />
        <GroundDrift t={t} o={0.9} />
      </AbsoluteFill>
      <Snow t={t} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(10,20,45,0.0), rgba(5,8,18,0.18))'}} />
      <Vignette o={0.45} />
      <Grain f={f} o={0.08} />
    </AbsoluteFill>
  );
};

// ---------- old style: the same shot drawn in pure SVG ----------
const OldStyle: React.FC<{t: number; f: number}> = ({t, f}) => {
  const k = easeInOut(clamp(t / PART));
  const s = lerp(1.0, 1.08, k);
  const steps = Array.from({length: 14}, (_, i) => {
    const u = i / 13; return {x: lerp(560, 1500, u) + Math.sin(u * 5) * 60, y: lerp(560, 930, u * u)};
  });
  return (
    <AbsoluteFill style={{background: '#0b1324'}}>
      <svg width={W} height={H} style={{transform: `scale(${s})`, transformOrigin: '35% 50%'}}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1a33" /><stop offset="1" stopColor="#2a3d5c" /></linearGradient>
          <linearGradient id="snow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9d6ea" /><stop offset="1" stopColor="#7f93b3" /></linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        <circle cx={1420} cy={170} r={46} fill="#e9efff" opacity={0.9} />
        <path d="M 0 520 L 380 420 L 760 470 L 1160 380 L 1600 450 L 1920 400 L 1920 1080 L 0 1080 Z" fill="#33476a" />
        {Array.from({length: 26}, (_, i) => <path key={i} d={`M ${1100 + i * 32} 760 l 18 -70 l 18 70 Z`} fill="#13203a" />)}
        <path d="M 0 360 C 500 420 900 560 1920 760 L 1920 1080 L 0 1080 Z" fill="url(#snow)" stroke="#05070c" strokeWidth={5} />
        {steps.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={12 + i} ry={5 + i * 0.4} fill="#5d7092" />)}
        <g transform="translate(470 470)">
          <path d="M -170 90 L 0 -70 L 170 90 Z" fill="#6b6a4f" stroke="#05070c" strokeWidth={6} strokeLinejoin="round" />
          <path d="M -10 -40 L 30 80 L 0 80 Z" fill="#05070c" />
          <path d={`M 30 80 q ${20 + Math.sin(t * 6) * 12} -30 ${40 + Math.sin(t * 5) * 10} -60`} stroke="#6b6a4f" strokeWidth={10} fill="none" />
        </g>
      </svg>
      <Snow t={t} density={0.8} />
      <Vignette o={0.7} />
      <Grain f={f} o={0.07} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: 36, left: 40, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#ffe08a',
    background: 'rgba(0,0,0,0.55)', padding: '8px 18px', borderRadius: 10}}>{text}</div>
);

export const DyatlovTest: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame(), t = f / 30;
  const second = t >= PART, lt = second ? t - PART : t;
  const fade = clamp(1 - Math.abs(t - PART) / 0.25);
  return (
    <AbsoluteFill>
      {second ? <OldStyle t={lt} f={f} /> : <NewStyle t={lt} f={f} />}
      <Captions16 caps={CAPS} t={lt} />
      <Label text={second ? 'Старый стиль: всё нарисовано кодом' : 'Новый: Nano Banana + анимация кодом'} />
      {fade > 0 && <AbsoluteFill style={{background: '#000', opacity: fade}} />}
      <Audio src={staticFile('reys-19/sfx/storm.mp3')} volume={0.5} loop />
    </AbsoluteFill>
  );
};
