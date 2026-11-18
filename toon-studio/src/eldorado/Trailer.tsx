// «Эльдорадо» — вертикальный трейлер 9:16 (TikTok / Reels / Shorts) для перегона на полное видео.
// Те же картинки Flow, что в длинном ролике: 16:9 кадр на всю высоту + медленная панорама, крупные субтитры по словам.
// Голос: public/eldorado-trailer/voice.json, звук: public/eldorado-trailer/mix.wav.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {CapLine, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import VOICE from '../../public/eldorado-trailer/voice.json';

const W = 1080, H = 1920, IW = H * 16 / 9;
type VL = {i: number; text: string; start: number; end: number; words: {w: string; t: number}[]};
const L = (VOICE as unknown as {lines: VL[]}).lines;
export const TR_TOTAL = (VOICE as unknown as {total: number}).total + 0.6;

// line → image, pan from a to b (0..1 across the wide image), zoom, flags
type TS = {line: number; img: string; a?: number; b?: number; z?: number; shake?: boolean; dark?: number; big?: string; red?: boolean};
const TSC: TS[] = [
  {line: 0, img: 'e0-08-mirage', a: 0.5, b: 0.5, z: 1.15, big: 'ОШИБКА', red: true},
  {line: 1, img: 'e2-04-vision', a: 0.35, b: 0.6},
  {line: 3, img: 'e0-08-mirage', a: 0.62, b: 0.42},
  {line: 4, img: 'e1-05-gold-dust', a: 0.5, b: 0.5, z: 1.0, big: 'ЧЕЛОВЕК'},
  {line: 5, img: 'e1-04-resin', a: 0.4, b: 0.6},
  {line: 6, img: 'e1-05-gold-dust', a: 0.5, b: 0.5, z: 1.25},
  {line: 7, img: 'e1-06-raft-lake', a: 0.3, b: 0.55},
  {line: 8, img: 'e1-07-sinking', a: 0.5, b: 0.5, z: 1.1},
  {line: 9, img: 'e1-08-diving', a: 0.45, b: 0.55},
  {line: 10, img: 'e2-01-march', a: 0.65, b: 0.4},
  {line: 11, img: 'e0-01-graves', a: 0.5, b: 0.5, z: 1.1, big: '500 ЛЕТ'},
  {line: 12, img: 'e0-03-army', a: 0.3, b: 0.65},
  {line: 14, img: 'e3-05-graves', a: 0.4, b: 0.6, dark: 0.15, big: '4000 ПОГИБЛИ', red: true},
  {line: 15, img: 'e3-04-starving', a: 0.45, b: 0.55, z: 1.1},
  {line: 16, img: 'e4-01-amazon', a: 0.3, b: 0.7},
  {line: 17, img: 'e4-05-empty', a: 0.6, b: 0.4},
  {line: 18, img: 'e4-06-orellana', a: 0.5, b: 0.5, z: 1.15, big: 'ЛЖЕЦ', red: true},
  {line: 19, img: 'e5-02-madness', a: 0.45, b: 0.55, shake: true},
  {line: 20, img: 'e7-06-scaffold', a: 0.4, b: 0.6, dark: 0.15},
  {line: 21, img: 'e0-04-lake-drained', a: 0.35, b: 0.6},
  {line: 23, img: 'e6-07-mud', a: 0.45, b: 0.6},
  {line: 24, img: 'e6-01-guatavita', a: 0.5, b: 0.5, z: 1.1},
  {line: 25, img: 'e1-07-sinking', a: 0.45, b: 0.55, z: 1.2},
  {line: 26, img: 'e8-03-into', a: 0.5, b: 0.5, z: 1.05},
  {line: 27, img: 'e8-06-night', a: 0.4, b: 0.6, dark: 0.2},
  {line: 28, img: 'e0-08-mirage', a: 0.45, b: 0.55, dark: 0.15, big: 'СКАЗКА?'},
  {line: 29, img: 'e0-05-lidar-night', a: 0.3, b: 0.6},
  {line: 30, img: 'e9-01-plane', a: 0.45, b: 0.6, z: 1.1},
  {line: 31, img: 'e10-c', a: 0.55, b: 0.45},
  {line: 32, img: 'e10-three', a: 0.4, b: 0.6},
  {line: 33, img: 'END'},
];
const SC = TSC.map((s, i) => {
  const from = i === 0 ? 0 : L[s.line].start - 0.1;
  const to = TSC[i + 1] ? L[TSC[i + 1].line].start - 0.1 : TR_TOTAL;
  return {...s, from, to};
});
export const TR_SCENES = SC.length;
export const TR_NAMES = SC.map((s, i) => `${i + 1}. ${s.img === 'END' ? 'финал: на канале' : L[s.line].text.slice(0, 28)}`);

// subtitles: short chunks, words pop in when spoken
const RED = ['ошибк', 'погиб', 'лжец', 'убил', 'сошёл', 'отрубили', 'никто', 'никогда', 'камен', 'запрещено', 'гнев', 'божий'];
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
  const z = lerp(s.z ?? 1.0, (s.z ?? 1.0) * 1.08, k);
  const iw = IW * z, ih = H * z, m = W / 2 / iw;
  const cx = clamp(lerp(s.a ?? 0.5, s.b ?? 0.5, k), m, 1 - m);
  const sh = s.shake ? Math.sin(t * 13) * 6 : 0;
  return (
    <AbsoluteFill>
      <Img src={staticFile(`eldorado/bg/${s.img}.png`)} style={{position: 'absolute', width: iw, height: ih, left: W / 2 - cx * iw + sh, top: (H - ih) / 2,
        filter: `brightness(${1 - (s.dark ?? 0)}) contrast(1.08) saturate(1.08)`}} />
      {s.big && (
        <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 150,
          color: s.red ? '#ff2e2e' : '#ffd27a', opacity: clamp((t - s.from) / 0.25), transform: `scale(${lerp(1.15, 1, clamp((t - s.from) / 0.3))})`, ...STROKE(18)}}>{s.big}</div>
      )}
    </AbsoluteFill>
  );
};

const End: React.FC<{t: number; from: number}> = ({t, from}) => {
  const k = clamp((t - from) / 0.4);
  const bob = Math.sin(t * 6) * 16;
  return (
    <AbsoluteFill style={{background: '#05070c'}}>
      <Img src={staticFile('eldorado/bg/e1-05-gold-dust.png')} style={{position: 'absolute', height: H, width: IW, left: W / 2 - 0.42 * IW, top: 0, filter: 'brightness(0.75)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(5,7,12,0.85) 0%, rgba(5,7,12,0.2) 30%, rgba(5,7,12,0.2) 55%, rgba(5,7,12,0.95) 80%)'}} />
      <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', opacity: k}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#bfe6ff', ...STROKE(9)}}>ЭЛЬДОРАДО НАШЛИ.</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: '#ff2e2e', marginTop: 10, ...STROKE(15)}}>НО НЕ ТАМ</div>
      </div>
      <div style={{position: 'absolute', top: 1180, width: '100%', textAlign: 'center', opacity: k}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#fff', ...STROKE(13)}}>ПОЛНОЕ ВИДЕО</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#ffd27a', ...STROKE(13)}}>НА КАНАЛЕ</div>
        <div style={{fontSize: 170, lineHeight: 1, marginTop: 20, transform: `translateY(${bob}px)`, color: '#ffd27a', fontFamily: FONT, fontWeight: 900, ...STROKE(14)}}>↓</div>
      </div>
    </AbsoluteFill>
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
      {i > 0 && fade < 1 && (SC[i - 1].img === 'END' ? null : <Frame s={SC[i - 1]} t={t} />)}
      <AbsoluteFill style={{opacity: i === 0 ? 1 : fade}}>{s.img === 'END' ? <End t={t} from={s.from} /> : <Frame s={s} t={t} />}</AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 85%)'}} />
      <Vignette />
      <Grain f={f} o={0.08} />
      {s.img !== 'END' && (
        <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 4, color: '#ffd27a', ...STROKE(7)}}>ЗАГАДКА ЭЛЬДОРАДО</div>
      )}
      {caps && s.img !== 'END' && <HorrorCaptions lines={CAPS} f={f} fps={30} y={1250} gapX={36} />}
    </AbsoluteFill>
  );
};

export const ElTrailer: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <TrailerAt t={f / 30} f={f} />
      <Audio src={staticFile('eldorado-trailer/mix.wav')} />
    </AbsoluteFill>
  );
};

// rule 10: frame n = the key moment of trailer scene n (with subtitles)
export const ElTrailerStoryboard: React.FC = () => {
  const n = useCurrentFrame();
  const s = SC[Math.min(n, SC.length - 1)];
  const t = s.img === 'END' ? s.from + 1.2 : s.from + (s.to - s.from) * 0.6;
  return <TrailerAt t={t} f={Math.round(t * 30)} />;
};
