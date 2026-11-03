// «Рейс 19»: the shot list. Every shot starts on a voice line (S(i)), so a re-voice moves the cuts with it.
// Storyboard composition: frame n shows the key moment of shot n (with subtitles) — the sheet the user reviews.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import VOICE from '../../public/reys-19/voice.json';
import {clamp, easeInOut, lerp, mulberry32} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {CapLine, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import {TaylorS, RadistS} from './Sitcom';
import {RADIST_REST, TAYLOR_REST} from './People';
import {Avenger, Cockpit, Compass, FuelGauge, INK, MAP_PTS, MapScene, Mariner, Ocean, RadioRoom, Ship, Sky} from './sets';
import {Dust, Flash, GlassDrops, Glints, Grade, GradeName, LensFlare, LightPool, Radar, RainLayers, Rays, SpeedLines, SvgFx} from './fx2';
import {ReportScene} from './Report';

type VL = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const L = (VOICE as {lines: VL[]; total: number}).lines;
export const TOTAL = (VOICE as {total: number}).total;
const S = (i: number) => L[i].start, E = (i: number) => L[i].end;
const W = (i: number, k: number) => L[i].words[k].t;

const DAY = {bright: 1, warmRim: 0.35, coldRim: 0.3, cold: 0.05};
const NIGHT = {bright: 0.72, warmRim: 0.55, coldRim: 0.85, cold: 0.6};
const STORM = {bright: 0.78, warmRim: 0.1, coldRim: 0.75, cold: 0.5};

const Big: React.FC<{y: number; text: string; size?: number; color?: string; o?: number}> = ({y, text, size = 110, color = '#fff', o = 1}) => (
  <text x={540} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} stroke="#050407" strokeWidth={size * 0.14} paintOrder="stroke" opacity={o}>{text}</text>
);

// puppets placed by their feet
const Rad: React.FC<{x: number; y: number; s: number; st: Partial<typeof RADIST_REST>; light: typeof DAY; id: string; t: number}> = ({x, y, s, st, light, id, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><RadistS s={{...RADIST_REST, t, breathe: Math.sin(t * 2), ...st}} light={light} id={id} /></g>
);
const Tay: React.FC<{x: number; y: number; s: number; st: Partial<typeof TAYLOR_REST>; light: typeof DAY; id: string; t: number}> = ({x, y, s, st, light, id, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><TaylorS s={{...TAYLOR_REST, t, breathe: Math.sin(t * 2), ...st}} light={light} id={id} /></g>
);

const Formation: React.FC<{t: number; x: number; y: number; s: number; night?: number; n?: number}> = ({t, x, y, s, night = 0, n = 5}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const dx = [0, -260, 260, -520, 520][i], dy = [0, -90, 90, -180, 180][i];
      return <Avenger key={i} x={x + dx * s * 1.4 + Math.sin(t + i) * 6} y={y + dy * s * 1.4 + Math.sin(t * 1.3 + i * 2) * 8} s={s * (1 - i * 0.04)} t={t + i * 0.1} night={night} tilt={Math.sin(t * 0.8 + i) * 1.5} />;
    })}
  </g>
);

type Shot = {from: number; key: number; render: (t: number, k: number) => React.ReactNode; name: string; html?: boolean; grade?: GradeName};
const sh = (name: string, from: number, key: number, grade: GradeName, render: Shot['render'], html = false): Shot => ({name, from, key, render, html, grade});

// zoom the world so that point (x, y) lands at screen point (sx, sy)
const Cam: React.FC<{z: number; x: number; y: number; sx?: number; sy?: number; rot?: number; children: React.ReactNode}> = ({z, x, y, sx = 540, sy = 860, rot = 0, children}) => (
  <g transform={`translate(${sx} ${sy}) rotate(${rot}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>
);
const lightning = (t: number) => { const p = (t * 0.9) % 3.2; return p < 0.08 ? 1 : p > 0.16 && p < 0.22 ? 0.7 : 0; };
const DeskLamp: React.FC<{x: number; y: number; on?: number}> = ({x, y, on = 1}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={0} cy={0} rx={70} ry={16} fill="#2a2a24" stroke={INK} strokeWidth={4} />
    <path d="M 0 0 L 0 -150" stroke="#b08a3a" strokeWidth={10} />
    <path d="M -110 -150 C -100 -200 100 -200 110 -150 Z" fill="#1f6a3a" stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={-150} rx={110} ry={14} fill="#fff2c0" opacity={on} />
  </g>
);
export const SHOTS: Shot[] = [
  sh('карта: треугольник', 0, E(0) + 0.1, 'map', (t) => (
    <g>
      <MapScene s={{t, tri: clamp((t - S(0)) / Math.max(0.5, E(0) - S(0))), planes: 1, gone: 0, labels: clamp((t - S(0)) / 0.6), glow: 0.6 + 0.4 * Math.sin(t * 4), zoom: lerp(1.15, 1.0, clamp(t / 2))}} />
      <Radar t={t} x={MAP_PTS.lauderdale[0]} y={MAP_PTS.lauderdale[1]} r={1100} />
    </g>
  )),
  sh('карта: исчезают самолёты', S(1) - 0.1, E(1) - 0.2, 'map', (t) => (
    <g>
      <MapScene s={{t, tri: 1, planes: 1, gone: clamp((t - S(1)) / (W(1, 6) - S(1))), glow: 1 + 0.5 * Math.sin(t * 6)}} />
      <Radar t={t} x={MAP_PTS.lauderdale[0]} y={MAP_PTS.lauderdale[1]} r={1100} color="#ff4a4a" />
      <Big y={300} text="6 САМОЛЁТОВ" o={clamp((t - W(1, 5)) / 0.3)} />
      <Big y={440} text="27 ЧЕЛОВЕК" color="#ff3a3a" o={clamp((t - W(1, 8)) / 0.3)} />
    </g>
  )),
  sh('пустой ночной океан', S(2) - 0.1, E(2), 'night', (t) => (
    <g>
      <Sky mood="night" t={t} h={900} />
      <Rays x={800} y={300} color="#cfe0ff" o={0.12} n={7} t={t} spread={0.9} />
      <Ocean mood="night" t={t} y={900} rough={0.3} />
      <Glints t={t} x={800} y0={905} y1={1900} w={220} color="#dfe8ff" />
      <ellipse cx={540} cy={950} rx={900} ry={60} fill="#8aa0c8" opacity={0.18} filter="url(#b30)" />
    </g>
  )),
  sh('компас крутится (голос Тейлора)', S(3) - 0.15, E(3) - 0.3, 'alarm', (t) => (
    <g>
      <rect width={1080} height={1920} fill="#050608" />
      <LightPool x={540} y={760} rx={520} ry={520} color="#ff7a3a" o={0.25 + 0.15 * Math.sin(t * 12)} />
      <g transform={`translate(${Math.sin(t * 40) * 4} ${Math.cos(t * 37) * 4})`}><Compass x={540} y={760} r={380} heading={t * 520 + Math.sin(t * 7) * 60} /></g>
      <circle cx={900} cy={260} r={40} fill="#ff2a2a" opacity={Math.sin(t * 10) > 0 ? 1 : 0.2} filter="url(#glow)" />
      <path d={`M 60 1250 ${Array.from({length: 48}, (_, i) => `L ${60 + i * 20} ${1250 + Math.sin(t * 30 + i * 0.9) * (20 + 50 * Math.abs(Math.sin(i * 0.37 + t * 3)))}`).join(' ')}`} stroke="#4ade80" strokeWidth={6} fill="none" filter="url(#glow)" />
    </g>
  )),
  sh('радист слушает ночью', S(4) - 0.1, E(4) - 0.3, 'night', (t) => (
    <g>
      <Cam z={1.45} x={330} y={760} sy={760}>
        <RadioRoom t={t} night={1} clock={18 * 60 + 20} glow={0.8}>
          <Rad x={330} y={2000} s={0.78} st={{listen: 1, worry: 0.6, lookX: 0.5}} light={NIGHT} id="r5" t={t} />
        </RadioRoom>
        <DeskLamp x={150} y={1272} />
        <LightPool x={150} y={1300} rx={260} ry={120} color="#ffe0a0" o={0.6} />
        <LightPool x={560} y={820} rx={300} ry={260} color="#ffb84a" o={0.45} />
      </Cam>
      <Dust t={t} n={30} o={0.4} />
    </g>
  )),
  sh('титр: 5 декабря 1945, Флорида', S(5) - 0.1, E(5) - 0.2, 'gold', (t) => (
    <g>
      <Sky mood="day" t={t} h={1250} />
      <Rays x={820} y={320} o={0.2} n={11} t={t} spread={1.8} />
      <rect x={-20} y={1250} width={1120} height={700} fill="#9a9a8e" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-20 + i * 300} 1950 L ${400 + i * 120} 1250`} stroke="#f4f1e0" strokeWidth={8} strokeDasharray="40 30" opacity={0.6} />)}
      <path d="M 40 1250 L 40 860 C 160 740 520 740 640 860 L 640 1250 Z" fill="#8a8f96" stroke={INK} strokeWidth={4} />
      <path d="M 340 760 C 520 760 640 820 640 860 L 640 1250 L 520 1250 L 520 900 C 500 840 440 780 340 760 Z" fill="#6a6f76" opacity={0.6} />
      <rect x={110} y={980} width={460} height={270} fill="#2a2e34" stroke={INK} strokeWidth={4} />
      <text x={340} y={930} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#f4f4f0">NAS FORT LAUDERDALE</text>
      <path d="M 900 1250 L 900 760" stroke="#d8d8d0" strokeWidth={10} />
      <g transform={`translate(900 770)`}>
        <path d={`M 0 0 C 60 ${-10 + Math.sin(t * 4) * 8} 100 ${10 + Math.sin(t * 4 + 1) * 8} 150 0 L 150 90 C 100 ${100 + Math.sin(t * 4 + 1) * 8} 60 ${80 + Math.sin(t * 4) * 8} 0 90 Z`} fill="#f4f1ea" stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M 0 ${12 + k * 22} C 60 ${2 + k * 22 + Math.sin(t * 4) * 8} 100 ${22 + k * 22 + Math.sin(t * 4 + 1) * 8} 150 ${12 + k * 22}`} stroke="#c22" strokeWidth={9} fill="none" />)}
        <rect x={0} y={0} width={64} height={46} fill="#1d3d7a" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => <g key={i}><ellipse cx={300 + i * 170} cy={1450 + i * 60} rx={90 + i * 10} ry={14} fill="#000" opacity={0.25} /><Avenger x={300 + i * 170} y={1420 + i * 60} s={0.28 + i * 0.03} t={0} /></g>)}
      <Big y={400} text="5 ДЕКАБРЯ 1945" size={100} />
      <Big y={520} text="ФЛОРИДА" size={90} color="#ffd27a" />
    </g>
  )),
  sh('ты — радист (день)', S(6) - 0.1, E(6) - 0.2, 'day', (t) => (
    <g>
      <RadioRoom t={t} night={0} clock={14 * 60 + 5} glow={0.4}>
        <Rad x={330} y={2000} s={0.78} st={{smile: 0.5, lookX: 0.3}} light={DAY} id="r7" t={t} />
      </RadioRoom>
      <Rays x={280} y={300} color="#fff4d0" o={0.16} n={6} t={t} spread={0.7} dir={1.15} />
      <Dust t={t} n={36} o={0.55} box={[100, 300, 700, 1200]} />
    </g>
  )),
  sh('пять торпедоносцев в небе', S(7) - 0.1, E(7) - 0.3, 'day', (t) => (
    <g>
      <Sky mood="day" t={t} h={1700} clouds={1.3} />
      <Ocean mood="day" t={t} y={1700} />
      <g filter="url(#b2)" opacity={0.9}>
        <Avenger x={220 + (t - S(7)) * 20} y={520} s={0.32} t={t} />
        <Avenger x={760 + (t - S(7)) * 20} y={450} s={0.26} t={t} />
        <Avenger x={480 + (t - S(7)) * 20} y={380} s={0.2} t={t} />
      </g>
      <Avenger x={560 + Math.sin(t) * 10} y={980 + Math.sin(t * 1.3) * 14} s={1.25} t={t} tilt={-6} />
      <SpeedLines t={t} o={0.45} y0={700} y1={1300} />
      <ellipse cx={200} cy={1500} rx={520} ry={150} fill="#fff" opacity={0.85} filter="url(#b14)" />
      <LensFlare x={900} y={240} o={0.8} />
      <Big y={300} text="14 ЧЕЛОВЕК" o={clamp((t - W(7, 7)) / 0.3)} />
    </g>
  )),
  sh('спокойный океан', S(8) - 0.1, E(8) - 0.3, 'gold', (t) => (
    <g>
      <Sky mood="day" t={t} h={1100} />
      <Rays x={820} y={320} o={0.16} n={9} t={t} spread={1.6} />
      <Ocean mood="day" t={t} y={1100} />
      <Glints t={t} x={820} y0={1105} y1={1900} w={240} />
      <Formation t={t} x={300 + (t - S(8)) * 50} y={760} s={0.18} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={300 + (t - S(8)) * 50 + i * 60} cy={1300 + i * 20} rx={40} ry={6} fill="#0a2a4a" opacity={0.3} />)}
    </g>
  )),
  sh('лейтенант Тейлор в кабине', S(9) - 0.1, E(9) - 0.3, 'gold', (t) => (
    <g>
      <Cockpit t={t} mood="day">
        <Tay x={540} y={2150} s={0.85} st={{smile: 0.7, lookX: 0.2}} light={DAY} id="t10" t={t} />
      </Cockpit>
      <LensFlare x={880} y={300} o={0.7} />
    </g>
  )),
  sh('треск в наушниках', S(10) - 0.1, E(10), 'day', (t) => (
    <g>
      <Cam z={1.7} x={330} y={760} sy={720} rot={-3}>
        <RadioRoom t={t} night={0.2} clock={15 * 60 + 45} glow={0.9}>
          <Rad x={330} y={2000} s={0.78} st={{listen: 1, worry: 0.8, lookY: -0.2, lookX: 0.6}} light={DAY} id="r11" t={t} />
        </RadioRoom>
      </Cam>
      {[0, 1, 2].map((i) => <path key={i} d={`M ${840 + i * 40} ${520 - i * 30} l 30 -40 l -20 0 l 30 -50`} stroke="#ffd27a" strokeWidth={8} fill="none" opacity={Math.sin(t * 20 + i) > 0 ? 1 : 0.2} filter="url(#glow)" />)}
    </g>
  )),
  sh('«Оба компаса отказали» (крупно)', S(11) - 0.1, E(11) - 0.3, 'dusk', (t) => (
    <g>
      <Cam z={1.55} x={540} y={830} sy={820}>
        <Cockpit t={t} mood="dusk" spin={1}>
          <Tay x={540} y={2150} s={0.85} st={{talk: 1, mouth: 0.4 + 0.4 * Math.abs(Math.sin(t * 9)), worry: 0.7, sweat: 0.8, lookY: 0.5}} light={{...DAY, warmRim: 0.9}} id="t12" t={t} />
        </Cockpit>
      </Cam>
      <g transform="translate(860 1180) scale(0.6)"><Compass x={0} y={0} r={200} heading={t * 520} /></g>
      <LightPool x={540} y={1250} rx={500} ry={200} color="#ff8a3a" o={0.25} />
    </g>
  )),
  sh('острова внизу (из кабины)', S(12) - 0.1, E(12) - 0.3, 'gold', (t) => {
    const r = mulberry32(21);
    return (
      <g>
        <rect width={1080} height={1920} fill="#1f6f9e" />
        {Array.from({length: 7}, (_, i) => {
          const x = 120 + r() * 840, y = 300 + i * 220 + r() * 80 - (t - S(12)) * 40, w = 80 + r() * 160;
          return <g key={i}><ellipse cx={x} cy={y} rx={w * 1.6} ry={w * 0.7} fill="#4cc3c9" opacity={0.6} filter="url(#b6)" /><ellipse cx={x} cy={y} rx={w} ry={w * 0.4} fill="#e8d8a0" stroke={INK} strokeWidth={4} /><ellipse cx={x - w * 0.2} cy={y - 4} rx={w * 0.5} ry={w * 0.18} fill="#5a9a4a" /></g>;
        })}
        {Array.from({length: 6}, (_, i) => <ellipse key={`c${i}`} cx={(r() * 1200 + t * 60) % 1300 - 100} cy={200 + r() * 1500} rx={220} ry={100} fill="#fff" opacity={0.7} filter="url(#b14)" />)}
        {/* the wing in the foreground */}
        <path d="M 1100 1150 L 380 1400 C 340 1420 340 1460 380 1470 L 1100 1500 Z" fill="#334a68" stroke={INK} strokeWidth={6} />
        <path d="M 1100 1150 L 380 1400 L 400 1420 L 1100 1200 Z" fill="#4a6584" />
        <g transform="translate(760 1380) rotate(-12) scale(1.3)"><circle r={30} fill="#1d3d7a" stroke={INK} strokeWidth={3} /><polygon points="0,-24 6,-8 24,-8 10,3 15,20 0,10 -15,20 -10,3 -24,-8 -6,-8" fill="#f4f4f0" /></g>
        <path d="M -20 -20 L 260 -20 L 120 620 L -20 700 Z" fill="#2f4058" stroke={INK} strokeWidth={6} />
        <Big y={300} text="«ЭТО ОСТРОВА ФЛОРИДЫ…»" size={64} color="#ffd27a" />
      </g>
    );
  }),
  sh('«Летите на запад!» (снизу)', S(13) - 0.1, E(13) - 0.3, 'alarm', (t) => (
    <g>
      <Cam z={1.6} x={330} y={800} sy={760} rot={4}>
        <RadioRoom t={t} night={0.4} clock={16 * 60 + 30} glow={1}>
          <Rad x={330} y={2000} s={0.78} st={{shout: 1, mouth: 0.95, anger: 0.7, fear: 0.3, sweat: 0.6}} light={DAY} id="r14" t={t} />
        </RadioRoom>
      </Cam>
      <circle cx={940} cy={220} r={50} fill="#ff2a2a" opacity={Math.sin(t * 9) > 0 ? 1 : 0.25} filter="url(#glow)" />
      <g filter="url(#b6)" transform="translate(180 1720) rotate(-8)">
        <rect x={-90} y={-260} width={180} height={300} rx={80} fill="#2a2a32" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M -60 ${-210 + k * 40} L 60 ${-210 + k * 40}`} stroke="#5a5a64" strokeWidth={10} />)}
      </g>
    </g>
  )),
  sh('карта: запад против северо-востока', S(14) - 0.1, E(15) - 0.2, 'map', (t) => (
    <g>
      <MapScene s={{t, tri: 1, arrows: clamp((t - S(14)) / (E(15) - S(14))), glow: 0.8 + 0.6 * Math.sin(t * 5), zoom: 1.3}} />
      <Radar t={t} x={540} y={900} r={1000} color="#ff4a4a" />
    </g>
  )),
  sh('шторм', S(16) - 0.1, E(16) - 0.2, 'storm', (t) => {
    const fl = lightning(t);
    return (
      <g>
        <Sky mood="storm" t={t} h={1350} clouds={2} />
        <Flash k={fl} />
        <Ocean mood="storm" t={t} y={1350} rough={1} />
        {Array.from({length: 14}, (_, i) => { const r = mulberry32(i + 3); return <path key={i} d={`M ${r() * 1080} ${1400 + r() * 500} q 30 -24 60 0`} stroke="#e8f0f8" strokeWidth={6} fill="none" opacity={0.6} />; })}
        <g filter="url(#b2)"><Formation t={t} x={540} y={760} s={0.4} night={0.6} /></g>
        <Avenger x={600} y={1050} s={0.9} t={t} night={1} tilt={8 + Math.sin(t * 2) * 4} />
        <RainLayers t={t} />
        <path d="M 820 0 L 760 220 L 820 230 L 730 520" stroke="#fffbe0" strokeWidth={12} fill="none" opacity={fl} filter="url(#glow)" />
      </g>
    );
  }),
  sh('топливо на 20 минут', S(17) - 0.1, E(17) - 0.2, 'alarm', (t) => (
    <g>
      <rect width={1080} height={1920} fill="#0a0c10" />
      <LightPool x={540} y={960} rx={600} ry={600} color="#ff3a2a" o={Math.sin(t * 8) > 0 ? 0.35 : 0.1} />
      <g transform={`translate(${Math.sin(t * 30) * 3} 0)`}><FuelGauge v={lerp(0.22, 0.12, clamp((t - S(17)) / 2))} t={t} /></g>
      <polygon points="300,600 420,600 820,1400 700,1400" fill="#fff" opacity={0.06} />
      <circle cx={860} cy={640} r={34} fill="#ff2a2a" opacity={Math.sin(t * 8) > 0 ? 1 : 0.2} filter="url(#glow)" />
      <GlassDrops t={t} o={0.35} />
      <Big y={300} text="20 МИНУТ" color="#ff3a3a" />
    </g>
  )),
  sh('«Садимся на воду. Все вместе»', S(18) - 0.1, E(18) - 0.4, 'storm', (t) => {
    const fl = lightning(t + 0.4);
    return (
      <g>
        <Cam z={1.35} x={540} y={850} sy={820}>
          <Cockpit t={t} mood="storm" rain={1}>
            <Tay x={540} y={2150} s={0.85} st={{talk: 1, mouth: 0.3 + 0.3 * Math.abs(Math.sin(t * 8)), worry: 1, blink: 0.55, lookY: 0.4}} light={{...STORM, coldRim: 0.75 + fl}} id="t18" t={t} />
          </Cockpit>
        </Cam>
        <Flash k={fl * 0.8} />
        <GlassDrops t={t} />
      </g>
    );
  }),
  sh('эфир замолкает', S(19) - 0.1, E(19) + 1.0, 'night', (t) => (
    <g>
      <Cam z={1.5} x={330} y={780} sy={780}>
        <RadioRoom t={t} night={1} clock={19 * 60 + 5} glow={0}>
          <Rad x={330} y={2000} s={0.78} st={{listen: 1, fear: 0.7, lookY: 0.2}} light={NIGHT} id="r19" t={t} />
        </RadioRoom>
      </Cam>
      <Rays x={-80} y={-100} color="#9ab8ff" o={0.12} n={5} t={t} spread={0.5} dir={1.1} />
      <Dust t={t} n={26} o={0.35} color="#cfe0ff" />
    </g>
  )),
  sh('вылетает самолёт-спасатель', S(20) - 0.1, E(20) - 0.2, 'night', (t) => (
    <g>
      <Sky mood="night" t={t} h={1300} />
      <Ocean mood="night" t={t} y={1300} />
      <Glints t={t} x={800} y0={1305} y1={1900} w={200} color="#dfe8ff" />
      <g transform={`translate(${(t - S(20)) * 60} ${-(t - S(20)) * 30})`}>
        <polygon points="780,900 1300,760 1300,1100" fill="#fff6c8" opacity={0.15} filter="url(#b6)" />
        <Mariner x={420} y={900} s={0.9} t={t} />
        <circle cx={660} cy={760} r={26} fill="#ffb24a" opacity={0.7} filter="url(#glow)" />
      </g>
      <Big y={300} text="13 ЧЕЛОВЕК" o={clamp((t - W(20, 3)) / 0.3)} />
    </g>
  )),
  sh('моряки видят вспышку', S(21) - 0.1, E(22) - 0.3, 'dusk', (t) => {
    const f = clamp((t - W(22, 6)) / 0.3);
    return (
      <g>
        <Sky mood="night" t={t} h={1100} sun={false} />
        <Ocean mood="night" t={t} y={1100} rough={0.5} />
        <Rays x={760} y={1030} color="#ffb24a" o={0.25 * f} n={12} t={t} spread={Math.PI * 2} len={900} />
        <circle cx={760} cy={1030} r={60 + f * 160} fill="#ffb24a" opacity={0.35 * f} filter="url(#b30)" />
        <circle cx={760} cy={1030} r={20 + f * 40} fill="#fff1c0" opacity={f} filter="url(#glow)" />
        <Glints t={t} x={760} y0={1110} y1={1500} w={160} color="#ffc070" />
        <path d="M -20 1500 L 1100 1440 L 1100 1960 L -20 1960 Z" fill="#0b0e14" stroke={INK} strokeWidth={4} />
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${260 + i * 260} ${1480 - i * 14})`}>
            <path d="M -70 0 C -70 -180 70 -180 70 0 Z" fill="#1c2534" stroke="#ffb24a" strokeWidth={6} strokeOpacity={0.4 + 0.5 * f} />
            <circle cx={0} cy={-220} r={56} fill="#1c2534" stroke="#ffb24a" strokeWidth={6} strokeOpacity={0.4 + 0.5 * f} />
            <path d="M -50 -262 C -40 -300 40 -300 50 -262 Z" fill="#d8dce2" />
          </g>
        ))}
        <path d="M -20 1380 L 1100 1330" stroke="#0b0e14" strokeWidth={14} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${i * 200} 1380 L ${i * 200 + 4} 1460`} stroke="#0b0e14" strokeWidth={10} />)}
      </g>
    );
  }),
  sh('шесть самолётов, 27 человек', S(23) - 0.1, E(23) - 0.2, 'night', (t) => (
    <g>
      <rect width={1080} height={1920} fill="#050608" />
      {Array.from({length: 6}, (_, i) => {
        const fade = clamp((t - S(23)) / 3 - i * 0.08);
        return (
          <g key={i} transform={`translate(${200 + (i % 3) * 340} ${820 + Math.floor(i / 3) * 260}) scale(${i === 5 ? 0.3 : 0.24})`} opacity={0.9 - fade * 0.6} filter={fade > 0.3 ? 'url(#b2)' : undefined}>
            <g filter="url(#glow)">{i === 5 ? <Mariner x={0} y={0} t={t} night={0} /> : <Avenger x={0} y={0} t={t} />}</g>
          </g>
        );
      })}
      <Big y={360} text="6 САМОЛЁТОВ" size={120} />
      <Big y={510} text="27 ЧЕЛОВЕК" size={120} color="#ff3a3a" />
    </g>
  )),
  sh('утро: поиски', S(24) - 0.1, E(24) - 0.2, 'dawn', (t) => (
    <g>
      <Sky mood="dawn" t={t} h={1150} sun={false} />
      <circle cx={820} cy={1150} r={120} fill="#ffe0a0" filter="url(#glow)" />
      <Rays x={820} y={1150} color="#ffe0b0" o={0.18} n={12} t={t} spread={Math.PI} dir={-Math.PI / 2} />
      <Ocean mood="dawn" t={t} y={1150} />
      <Glints t={t} x={820} y0={1155} y1={1900} w={200} color="#fff0d0" />
      {[[260, 1230, 0.45], [760, 1300, 0.7], [480, 1600, 1.1]].map(([x, y, s], i) => (
        <g key={i}><path d={`M ${x - 320 * s} ${y + 40 * s} L ${x - 900 * s} ${y + 140 * s} M ${x - 320 * s} ${y + 40 * s} L ${x - 900 * s} ${y - 10 * s}`} stroke="#f4f4f0" strokeWidth={6 * s} opacity={0.5} /><Ship x={x} y={y} s={s} t={t} beam={i === 2 ? 0.6 : 0} /></g>
      ))}
      <g filter="url(#b2)"><Avenger x={300 + (t - S(24)) * 80} y={520} s={0.3} t={t} /><Avenger x={820 - (t - S(24)) * 60} y={700} s={0.22} t={t} flip /><Mariner x={600} y={360} s={0.25} t={t} night={0} /></g>
    </g>
  )),
  sh('ни одного обломка', S(25) - 0.1, E(25) - 0.2, 'dawn', (t) => (
    <g>
      <Sky mood="dawn" t={t} h={700} clouds={0.6} />
      <Ocean mood="dawn" t={t} y={700} rough={0.2} />
      <Glints t={t} x={540} y0={705} y1={1900} w={300} color="#fff0d0" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={(t * 30 + i * 500) % 1600 - 200} cy={760 + i * 120} rx={700} ry={50} fill="#f6e6d0" opacity={0.25} filter="url(#b14)" />)}
      <Big y={300} text="0 ОБЛОМКОВ" color="#ff3a3a" o={clamp((t - W(25, 2)) / 0.3)} />
    </g>
  )),
  sh('отчёт комиссии', S(26) - 0.15, S(28) + 0.7, 'paper', (t) => <ReportScene t={t} />, true),
  sh('журнал 1964', S(29) - 0.1, W(29, 8) + 0.6, 'paper', (t) => (
    <g>
      <rect width={1080} height={1920} fill="#3a2a1c" />
      <g filter="url(#b6)" opacity={0.8}>
        {[['#2a5a8a', -60, 200], ['#8a2a2a', 820, 260], ['#2a6a3a', 860, 1300], ['#8a6a2a', -80, 1250]].map(([c, x, y], i) => <rect key={i} x={x as number} y={y as number} width={320} height={440} fill={c as string} transform={`rotate(${i * 7 - 10} ${x} ${y})`} />)}
      </g>
      <LightPool x={540} y={700} rx={600} ry={700} color="#ffd890" o={0.35} />
      <g transform={`translate(540 780) rotate(-3) scale(${lerp(0.88, 0.94, clamp((t - S(29)) / 4))})`}>
        <rect x={-360} y={-500} width={720} height={1000} fill="#000" opacity={0.4} transform="translate(16 18)" />
        <rect x={-360} y={-500} width={720} height={1000} fill="#e9dcb8" stroke={INK} strokeWidth={4} />
        <rect x={-360} y={-500} width={720} height={150} fill="#b3202a" />
        <text x={0} y={-440} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#f4ecd4">ЖУРНАЛ ПРИКЛЮЧЕНИЙ</text>
        <text x={0} y={-380} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#f4ecd4">ФЕВРАЛЬ 1964 · 35¢</text>
        <rect x={-320} y={-320} width={640} height={540} fill="#0e1a2a" stroke={INK} strokeWidth={4} />
        <path d="M -200 120 L 220 -40 L -40 -250 Z" fill="none" stroke="#ff3a3a" strokeWidth={10} filter="url(#glow)" />
        <g transform="translate(40 -40) rotate(30) scale(0.3)"><Avenger x={0} y={0} t={0} night={1} /></g>
        <path d="M -320 160 Q -160 120 0 160 T 320 160 L 320 220 L -320 220 Z" fill="#1d3b5a" />
        <text x={0} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill="#1a1414">СМЕРТЕЛЬНЫЙ</text>
        <text x={0} y={380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#b3202a">БЕРМУДСКИЙ</text>
        <text x={0} y={460} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#b3202a">ТРЕУГОЛЬНИК</text>
        <polygon points="-360,-500 -200,-500 -360,100" fill="#fff" opacity={0.08} />
      </g>
    </g>
  )),
  sh('«Так что же случилось?»', S(31) - 0.1, E(31) - 0.1, 'map', (t) => (
    <g>
      <MapScene s={{t, tri: 1, question: clamp((t - S(31)) / 0.6), glow: 1.5 + Math.sin(t * 5), labels: 0.4, zoom: 1.1}} />
      <Radar t={t} x={MAP_PTS.lauderdale[0]} y={MAP_PTS.lauderdale[1]} r={1100} color="#ff4a4a" />
    </g>
  )),
  ...(['А', 'Б', 'В'] as const).map((letter, n) => sh(`версия ${letter}`, S(32 + n) - 0.1, E(32 + n) - 0.4, (['storm', 'map', 'alarm'] as GradeName[])[n], (t) => (
    <g>
      <rect width={1080} height={1920} fill={['#141a24', '#0c1428', '#1a0e1e'][n]} />
      {n === 0 && (
        <g>
          <g filter="url(#b6)" opacity={0.7}><Ocean mood="storm" t={t} y={1300} rough={1} /></g>
          <RainLayers t={t} o={0.6} />
          <LightPool x={540} y={1100} rx={420} ry={500} color="#7ab0ff" o={0.3} />
          <Tay x={540} y={2050} s={0.62} st={{worry: 1, blink: 0.2}} light={NIGHT} id="tA" t={t} />
          <g transform="translate(800 760) scale(0.32)"><g transform="translate(-540 -960)"><FuelGauge v={0.02} t={t} /></g></g>
          <circle cx={800} cy={760} r={140} fill="#ff2a2a" opacity={0.15 + 0.1 * Math.sin(t * 8)} filter="url(#b14)" />
        </g>
      )}
      {n === 1 && (
        <g>
          {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={540} cy={880} rx={300 + i * 70} ry={120 + i * 40} fill="none" stroke="#7ad0ff" strokeWidth={4} opacity={0.35 - i * 0.03} transform={`rotate(${Math.sin(t + i) * 10 + i * 8} 540 880)`} filter="url(#b2)" />)}
          <LightPool x={540} y={880} rx={420} ry={420} color="#7ad0ff" o={0.3} />
          <Compass x={540} y={880} r={260} heading={t * 300 + Math.sin(t * 5) * 80} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${200 + i * 300} 1200 l 20 -40 l -14 0 l 20 -40`} stroke="#bfe6ff" strokeWidth={6} fill="none" opacity={Math.sin(t * 15 + i) > 0 ? 0.9 : 0.2} filter="url(#glow)" />)}
        </g>
      )}
      {n === 2 && (
        <g>
          <Ocean mood="night" t={t} y={1000} rough={0.4} />
          <Rays x={540} y={1150} color="#ff6a8a" o={0.2} n={14} t={t} spread={Math.PI} dir={-Math.PI / 2} />
          {Array.from({length: 8}, (_, i) => <ellipse key={i} cx={540} cy={1150} rx={420 - i * 50} ry={120 - i * 14} fill="none" stroke="#ff6a8a" strokeWidth={5} opacity={0.15 + i * 0.08} transform={`rotate(${t * 40 + i * 20} 540 1150)`} />)}
          <circle cx={540} cy={1150} r={90} fill="#ff6a8a" opacity={0.5} filter="url(#b30)" />
          <path d="M 540 640 L 860 1120 L 220 1120 Z" fill="none" stroke="#ff3a3a" strokeWidth={10} filter="url(#glow)" />
        </g>
      )}
      <Big y={330} text={`ВЕРСИЯ ${letter}`} size={120} color={['#ffd27a', '#7ad0ff', '#ff6a8a'][n]} />
      <Big y={450} text={['ОШИБКА И ТОПЛИВО', 'МАГНИТНАЯ АНОМАЛИЯ', 'НЕЧТО НЕОБЪЯСНИМОЕ'][n]} size={66} color="#f4f1ea" />
    </g>
  ))),
  sh('пиши букву в комментариях', S(35) - 0.1, E(36) - 0.2, 'night', (t) => (
    <g>
      <rect width={1080} height={1920} fill="#101420" />
      <Rays x={540} y={-200} color="#fff2d0" o={0.2} n={7} t={t} spread={0.5} />
      <LightPool x={540} y={1300} rx={420} ry={600} color="#ffd890" o={0.3} />
      <Rad x={540} y={2350} s={0.95} st={{smile: 0.8, lookX: 0, lookY: 0.1}} light={{...NIGHT, warmRim: 0.9}} id="r31" t={t} />
      {['А', 'Б', 'В'].map((l, i) => (
        <g key={l} transform={`translate(${240 + i * 300} ${360 + Math.sin(t * 3 + i) * 12})`}>
          <circle r={150} fill={['#ffd27a', '#7ad0ff', '#ff6a8a'][i]} opacity={0.35} filter="url(#b14)" />
          <circle r={110} fill={['#ffd27a', '#7ad0ff', '#ff6a8a'][i]} stroke={INK} strokeWidth={8} />
          <text y={44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#1a1414">{l}</text>
        </g>
      ))}
      <Dust t={t} n={30} o={0.5} />
    </g>
  )),
];

SHOTS.forEach((s, i) => { (s as Shot & {to: number}).to = i + 1 < SHOTS.length ? SHOTS[i + 1].from : TOTAL; });

// subtitles: keywords in red
const RED = ['треугольник', 'исчезли', 'обломка', 'компас', 'отказали', 'запад', 'северо-восток', 'шторм', 'топлива', 'замолкает', 'спасатель', 'вспышку',
  'неизвестны', 'пилот', 'комментариях', 'шесть', 'двадцать', 'тринадцать', 'четырнадцать', 'пропадает', 'сердце'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
export const CAPTIONS: CapLine[] = [];
L.forEach((l, k) => {
  const next = L[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const ws = l.text.split(' ').map((w, j) => ({w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: RED.some((r) => clean(w).startsWith(r))})).filter((w) => w.w !== '—');
  // chunks of up to 3 words / 18 letters, broken after punctuation
  const chunks: typeof ws[] = [];
  let cur: typeof ws = [];
  ws.forEach((w) => {
    if (cur.length && (cur.length >= 3 || cur.map((c) => c.w).join(' ').length + w.w.length > 18)) { chunks.push(cur); cur = []; }
    cur.push(w);
    if (/[.!?,:…»]$/.test(w.w)) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  chunks.forEach((c, n) => CAPTIONS.push({start: c[0].t - 0.04, end: n + 1 < chunks.length ? chunks[n + 1][0].t - 0.05 : lineEnd, words: c}));
});

export const ShotAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
  ensureFont();
  let i = SHOTS.findIndex((s, n) => t >= s.from && (n + 1 >= SHOTS.length || t < SHOTS[n + 1].from));
  if (i < 0) i = 0;
  const s = SHOTS[i] as Shot & {to: number};
  const k = clamp((t - s.from) / Math.max(0.1, s.to - s.from));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.html ? s.render(t, easeInOut(k)) : <svg width={1080} height={1920} viewBox="0 0 1080 1920"><SvgFx />{s.render(t, easeInOut(k))}</svg>}
      <Grade g={s.grade ?? 'none'} />
      <Vignette o={0.6} />
      <Grain f={f} o={0.07} />
      {caps && <HorrorCaptions lines={CAPTIONS} f={Math.round(t * 30)} fps={30} y={1370} />}
    </AbsoluteFill>
  );
};

export const Storyboard: React.FC = () => {
  const f = useCurrentFrame();
  const s = SHOTS[Math.min(f, SHOTS.length - 1)];
  return <ShotAt t={s.key} f={f} />;
};
