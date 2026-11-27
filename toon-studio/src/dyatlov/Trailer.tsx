// «Перевал Дятлова» — вертикальный трейлер-ПЕТЛЯ 9:16 (TikTok / Reels / Shorts), по образцу src/eldorado/Trailer.tsx.
// Конец «…ответ на вопрос» переходит в начало «Почему девять человек…»: последний кадр приезжает ровно в первый
// (та же картинка d0-02-cut, тот же зум и центр), надпись «на канале» гаснет перед стыком.
// Голос: public/dyatlov-trailer/voice.json, звук: public/dyatlov-trailer/mix.wav.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {CapLine, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import VOICE from '../../public/dyatlov-trailer/voice.json';

const W = 1080, H = 1920, IW = H * 16 / 9;
type VL = {i: number; text: string; start: number; end: number; words: {w: string; t: number}[]};
const L = (VOICE as unknown as {lines: VL[]}).lines;
export const TR_TOTAL = (VOICE as unknown as {total: number}).total;

// line → image (+off: start later inside the line), pan a→b (0..1 across the wide image), zoom z→z2 (default z*1.08)
type TS = {line: number; off?: number; img: string; a?: number; b?: number; z?: number; z2?: number; shake?: boolean; dark?: number;
  big?: string; red?: boolean; end?: boolean};
const LOOP = {img: 'd0-02-cut', a: 0.5, z: 1.0}; // first frame == last frame
const TSC: TS[] = [
  {line: 0, img: LOOP.img, a: LOOP.a, b: 0.55, z: LOOP.z, big: 'ИЗНУТРИ', red: true},
  {line: 1, img: 'd0-03-footprints-socks', a: 0.4, b: 0.6},
  {line: 2, img: 'd0-05-ridge', a: 0.3, b: 0.6, big: '1959'},
  {line: 3, img: 'd1-04-ural', a: 0.6, b: 0.4},
  {line: 4, img: 'group-ten', a: 0.2, b: 0.8, z: 1.0, z2: 1.0},
  {line: 6, img: 'd3-03-slope-dusk', a: 0.35, b: 0.6},
  {line: 7, img: 'd7-03-ridge', a: 0.5, b: 0.5, z: 1.1, dark: 0.1, big: 'МЁРТВАЯ ВЕРШИНА', red: true},
  {line: 8, img: 'd3-05-tent-evening', a: 0.4, b: 0.6},
  {line: 9, img: 'd5-02-search', a: 0.6, b: 0.4},
  {line: 10, img: 'd5-03-tent-found', a: 0.45, b: 0.55, z: 1.05},
  {line: 11, img: 'd5-04-belongings', a: 0.35, b: 0.6},
  {line: 12, img: 'd0-04-inside', a: 0.4, b: 0.5},
  {line: 13, img: 'd0-04-inside', a: 0.55, b: 0.55, z: 1.25, dark: 0.2, big: 'НЕТ ЛЮДЕЙ', red: true},
  {line: 14, img: 'd4-03-descent', a: 0.5, b: 0.5, z: 1.05, big: '9 ЧЕЛОВЕК'},
  {line: 15, img: 'd4-02-socks', a: 0.45, b: 0.55, z: 1.1},
  {line: 16, img: 'd4-01-blizzard', a: 0.4, b: 0.6, big: '−30°'},
  {line: 17, img: 'd4-01-blizzard', a: 0.6, b: 0.45, z: 1.15, shake: true},
  {line: 18, img: 'd4-04-forest-edge', a: 0.5, b: 0.5, z: 1.05},
  {line: 19, img: 'd5-05-cedar', a: 0.4, b: 0.6},
  {line: 20, img: 'd6-01-thaw', a: 0.35, b: 0.6},
  {line: 21, img: 'd6-03-dosimeter', a: 0.5, b: 0.5, z: 1.1, big: 'РАДИАЦИЯ', red: true},
  {line: 22, img: 'd6-04-closed', a: 0.45, b: 0.55},
  {line: 23, img: 'd0-06-case', a: 0.4, b: 0.6},
  {line: 23, off: 2.6, img: 'd7-09-infrasound', a: 0.4, b: 0.6, dark: 0.1, big: 'СТИХИЙНАЯ СИЛА', red: true},
  {line: 24, img: 'd7-06-orb', a: 0.5, b: 0.5, z: 1.1, dark: 0.1, big: '?'},
  // loop: drift back into the first frame (same image, centre and zoom as scene 1 at t=0)
  {line: 25, img: LOOP.img, a: 0.42, b: LOOP.a, z: 1.18, z2: LOOP.z, end: true},
];
const SC = TSC.map((s, i) => {
  const st = (k: number) => L[TSC[k].line].start + (TSC[k].off ?? 0) - 0.1;
  const from = i === 0 ? 0 : st(i);
  const to = TSC[i + 1] ? st(i + 1) : TR_TOTAL;
  return {...s, from, to};
});
export const TR_SCENES = SC.length;
export const TR_NAMES = SC.map((s, i) => `${i + 1}. ${s.end ? 'петля + «на канале»' : L[s.line].text.slice(0, 28)}`);

// subtitles: short chunks, words pop in when spoken
const RED = ['изнутри', 'мороз', 'раздет', 'мёртв', 'нет', 'носках', 'минус', 'радиац', 'стихийн', 'сила'];
const isRed = (w: string) => RED.some((r) => w.toLowerCase().replace(/[^а-яё]/g, '').startsWith(r));
const CAPS: CapLine[] = [];
L.forEach((l, k) => {
  const end = Math.min(L[k + 1] ? L[k + 1].start - 0.05 : TR_TOTAL, l.end + 0.5);
  const ws = l.text.split(' ').map((w, j) => ({w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: isRed(w)})).filter((w) => w.w !== '—');
  const ch: typeof ws[] = [];
  let cur: typeof ws = [];
  ws.forEach((w) => {
    if (cur.length && (cur.length >= 3 || cur.map((c) => c.w).join(' ').length + w.w.length > 16)) { ch.push(cur); cur = []; }
    cur.push(w);
    if (/[.!?:…»,]$/.test(w.w)) { ch.push(cur); cur = []; }
  });
  if (cur.length) ch.push(cur);
  ch.forEach((c, n) => CAPS.push({start: c[0].t - 0.05, end: n + 1 < ch.length ? ch[n + 1][0].t - 0.05 : end, words: c}));
});

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});

const Frame: React.FC<{s: typeof SC[number]; t: number}> = ({s, t}) => {
  const k = easeInOut(clamp((t - s.from) / Math.max(0.1, s.to - s.from)));
  const z0 = s.z ?? 1.0;
  const z = lerp(z0, s.z2 ?? z0 * 1.08, k);
  const iw = IW * z, ih = H * z, m = W / 2 / iw;
  const cx = clamp(lerp(s.a ?? 0.5, s.b ?? 0.5, k), m, 1 - m);
  const sh = s.shake ? Math.sin(t * 13) * 6 : 0;
  return (
    <AbsoluteFill>
      <Img src={staticFile(`dyatlov/bg/${s.img}.png`)} style={{position: 'absolute', width: iw, height: ih, left: W / 2 - cx * iw + sh, top: (H - ih) / 2,
        filter: `brightness(${1 - (s.dark ?? 0)}) contrast(1.08)`}} />
      {s.big && (
        <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: s.big.length > 10 ? 110 : 150,
          lineHeight: 1.05, padding: '0 40px', boxSizing: 'border-box',
          color: s.red ? '#ff2e2e' : '#bfe6ff', opacity: clamp((t - s.from) / 0.25), transform: `scale(${lerp(1.15, 1, clamp((t - s.from) / 0.3))})`, ...STROKE(18)}}>{s.big}</div>
      )}
    </AbsoluteFill>
  );
};

// «полное видео на канале» over the last scene: in after the scene starts, out 0.35 s before the loop seam
const EndCard: React.FC<{t: number; from: number}> = ({t, from}) => {
  const k = Math.min(clamp((t - from - 0.3) / 0.4), clamp((TR_TOTAL - 0.05 - t) / 0.3));
  const bob = Math.sin(t * 6) * 16;
  return (
    <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', opacity: k, transform: `scale(${lerp(0.94, 1, k)})`}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#fff', ...STROKE(13)}}>ПОЛНОЕ ВИДЕО</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#bfe6ff', ...STROKE(13)}}>НА КАНАЛЕ</div>
      <div style={{fontSize: 150, lineHeight: 1, marginTop: 10, transform: `translateY(${bob}px)`, color: '#bfe6ff', fontFamily: FONT, fontWeight: 900, ...STROKE(14)}}>↓</div>
    </div>
  );
};

const TrailerAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
  ensureFont();
  let i = SC.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) i = SC.length - 1;
  const s = SC[i];
  const fade = clamp((t - s.from) / 0.12);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {i > 0 && fade < 1 && <Frame s={SC[i - 1]} t={t} />}
      <AbsoluteFill style={{opacity: i === 0 ? 1 : fade}}><Frame s={s} t={t} /></AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 85%)'}} />
      <Vignette />
      <Grain f={f} o={0.08} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 4, color: '#bfe6ff', ...STROKE(7)}}>ТАЙНА ПЕРЕВАЛА ДЯТЛОВА</div>
      {s.end && <EndCard t={t} from={s.from} />}
      {caps && <HorrorCaptions lines={CAPS} f={f} fps={30} y={1250} gapX={36} />}
    </AbsoluteFill>
  );
};

export const DyTrailer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TrailerAt t={f / 30} f={f} />
      <Audio src={staticFile('dyatlov-trailer/mix.wav')} />
    </AbsoluteFill>
  );
};

// rule 10: frame n = the key moment of trailer scene n (with subtitles)
export const DyTrailerStoryboard: React.FC = () => {
  const n = useCurrentFrame();
  const s = SC[Math.min(n, SC.length - 1)];
  const t = s.end ? s.from + (s.to - s.from) * 0.5 : s.from + (s.to - s.from) * 0.6;
  return <TrailerAt t={t} f={Math.round(t * 30)} />;
};
