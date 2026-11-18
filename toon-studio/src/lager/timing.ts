// «Кто лишний?»: every time comes from the voice — shot cuts, the watchman's lips and the subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;

// shot n starts at CUTS[n - 1]
export const CUTS = [
  0,              // 1  dusk: the gate «ЛАСТОЧКА», the camp behind it
  S(2) - 0.1,     // 2  you, the counsellor, with the list
  S(3) - 0.1,     // 3  insert: the list — 12 names
  S(5) - 0.1,     // 4  over your shoulder: counting the row… 13
  S(7) - 0.1,     // 5  recount, closer… 13 (red)
  S(9) - 0.1,     // 6  you read the list, hands go up one by one
  S(11) - 0.1,    // 7  slow move along the faces
  S(13) - 0.1,    // 8  your face: you can't tell who
  S(14) - 0.15,   // 9  night, the porch: Uncle Grisha comes with the lantern
  S(16) - 0.1,    // 10 «Тоже насчитал лишнего? Тогда слушай.»
  S(18) - 0.1,    // 11 one finger: don't show you are counting
  S(21) - 0.1,    // 12 two: don't call him by name
  S(24) - 0.1,    // 13 three: find him before dawn
  S(28) - 0.15,   // 14 day: you watch the squad
  S(29) - 0.1,    // 15 №1 Vova at the canteen table, the plate untouched
  S(33) - 0.1,    // 16 №2 Lena greets everyone by name
  S(37) - 0.1,    // 17 №3 Misha comes back from the lake at midnight, wet
  S(42) - 0.1,    // 18 №4 Olya, quiet, always next to you
  S(47) - 0.15,   // 19 the last evening: the campfire, everyone sings
  S(50) - 0.1,    // 20 Grisha whispers: «Смотри на тени.»
  S(51) - 0.1,    // 21 the clue: shadows on the sand (Olya has none)
  S(54) - 0.1,    // 22 the fire goes out
  S(55) - 0.1,    // 23 a small cold hand takes yours
  S(57) - 0.1,    // 24 in the dark: «Вожатый… а ты нас посчитал?»
  S(59) - 0.15,   // 25 the forest edge: a child walking into the woods alone
  S(62) - 0.1,    // 26 the four in a row: 1 · 2 · 3 · 4
  S(63) - 0.1,    // 27 the campfire again: the hint is there
  S(65) - 0.1,    // 28 the choice card, a lantern far in the forest
  TOTAL,
];

// mouth opening 0..1 from the voice loudness, only while one of `lines` is spoken
const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};
export const GRISHA_LINES = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 50];

// subtitles: keywords in red
const RED = ['тринадцат', 'лишн', 'не ', 'имя', 'рассвет', 'без', 'тен', 'гаснет', 'холодн', 'ладон', 'посчитал', 'лес', 'один', 'ошибит', 'нельзя', 'запрещ', 'мокр', 'никто'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z.-]/g, '');
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w);
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.who !== 'narrator' || (c.length > 1 && RED.some((r) => c.startsWith(r.trim())))};
  }).filter((w) => w.w !== '—');
  CAPTIONS.push({start: l.start, end: lineEnd, words});
});
