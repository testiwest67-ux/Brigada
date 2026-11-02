// «Лишний этаж»: every time comes from the voice — shot cuts, door/button/bang cues (same formulas as
// scripts/lift_sound.py), lip movement (loudness envelope) and the word-by-word subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const RAW = VOICE.lines as VLine[];
const VOW = /[аеёиоуыэюяaeiouy]/gi;
// lines whose word marks came out bunched: spread the words by syllables over the line
const RESPREAD = new Set([15, 16]);
const LINES: VLine[] = RAW.map((l) => {
  if (!RESPREAD.has(l.i)) return l;
  const ws = l.text.split(' '), wt = ws.map((w) => Math.max(1, (w.match(VOW) ?? []).length));
  const tot = wt.reduce((a, b) => a + b, 0), span = l.end - l.start;
  let acc = 0;
  return {...l, words: ws.map((w, k) => { const t = l.start + (acc / tot) * span * 0.94; acc += wt[k]; return {w, t: Math.round(t * 1000) / 1000}; })};
});
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;
export const W = (i: number, k: number) => LINES[i].words[k].t;

// shot cuts (seconds): see the shot list in shots.tsx
export const SILENCE: [number, number] = [E(13) + 0.12, S(14) - 0.08];
export const CUTS = [
  0,                 // 1  display 11 → 12 → 13
  S(1) - 0.12,       // 2  her face
  S(2) - 0.1,        // 3  machine room
  S(3) - 0.1,        // 4  Ded Misha
  S(5) - 0.15,       // 5  doors open
  S(7) - 0.1,        // 6  mom calls
  S(8) - 0.1,        // 7  dead button
  S(9) - 0.1,        // 8  the flat door opens
  S(10) - 0.1,       // 9  her face
  S(11) - 0.1,       // 10 she walks
  S(12) - 0.1,       // 11 doors close
  S(13) - 0.1,       // 12 going down
  SILENCE[0],        // 13 dark, silence
  SILENCE[1],        // 14 light back: the image stands
  S(15) - 0.1,       // 15 through the mirror
  S(16) - 0.25,      // 16 the swap
  S(17) - 0.15,      // 17 floor 12, mom
  S(18) - 0.2,       // 18 display 13
  TOTAL,
];
// cues shared with the sound
export const CUE = {
  disp12: W(0, 3), disp13: E(0) + 0.08,                 // display steps, ding on 13
  doorsOpen: S(5) - 0.05,                               // doors start sliding
  presses: [W(8, 1), W(8, 2), W(8, 2) + 0.42, W(8, 3) + 0.1, W(8, 5)],
  aptOpen: S(9) - 0.05,
  doorsClose: W(12, 1) - 0.1, doorsShut: W(12, 4) + 0.15,
  sitDown: W(13, 1) - 0.1,
  swap: [S(16) - 0.1, E(16) - 0.1] as [number, number],
  bangs: [E(16) + 0.05, E(16) + 0.32, E(16) + 0.58],
  doors12: S(17) - 0.15,
  shut13: S(18) - 0.15,
};

// mouth opening 0..1 from the voice loudness, only while one of `lines` is spoken
const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

// subtitles: keywords in red; the last line all red
const RED = ['двенадцать', 'тринадцат', 'не', 'выходи', 'никогда', 'зеркал', 'открываются', 'твой', 'твоя', 'один', 'горит', 'девочка',
  'лицом', 'улыбается', 'последний', 'правильно', 'двойник', 'двери', 'спиной', 'спасибо', 'наконец'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
// one caption per sentence when a line is long, so it never wraps into 4 rows over the faces
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w);
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.i === 18 || (c.length > 2 && RED.some((r) => c.startsWith(r))), end: /[.!?…»]$/.test(w)};
  }).filter((w) => w.w !== '—');
  const chunks: typeof words[] = [];
  let cur: typeof words = [];
  words.forEach((w, j) => { cur.push(w); if (w.end && j < words.length - 1 && words.length > 6) { chunks.push(cur); cur = []; } });
  chunks.push(cur);
  chunks.forEach((ch, j) => CAPTIONS.push({
    start: j === 0 ? l.start : ch[0].t - 0.05,
    end: j < chunks.length - 1 ? chunks[j + 1][0].t - 0.06 : lineEnd,
    words: ch.map(({w, t, red}) => ({w, t, red})),
  }));
});
