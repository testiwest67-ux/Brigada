// «Последняя электричка»: every time comes from the voice — the shot cuts, lip movement and the subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;
export const W = (i: number, k: number) => LINES[i].words[k].t;

// shot n starts at CUTS[n - 1] (see the shot list in shots.tsx)
export const CUTS = [
  0,              // 1  the last train in the night, outside
  S(1) - 0.1,     // 2  the red board: 00:47
  S(2) - 0.1,     // 3  Kostya by the window, headphones
  S(4) - 0.1,     // 4  the line map: «Зелёный Бор», 40 min
  S(5) - 0.1,     // 5  he falls asleep against the glass
  S(6) - 0.15,    // 6  wakes up: silence
  S(7) - 0.1,     // 7  the empty carriage
  S(8) - 0.15,    // 8  the loudspeaker: «Станция Тихая»
  S(10) - 0.1,    // 9a «Подожди. Какая ещё Тихая?» — he does not understand
  S(13) - 0.1,    // 9b the board above the door: «ТИХАЯ» blinking
  S(14) - 0.1,    // 9  he looks up at the map
  S(15) - 0.1,    // 10 the map: no such station (a faint gap)
  S(16) - 0.1,    // 11 the doors open
  S(17) - 0.1,    // 12 fog on the platform, dead lamps, «ТИХАЯ»
  S(19) - 0.1,    // 13 a guy comes in: blue jacket, backpack, headphones
  S(21) - 0.1,    // 14 he sits opposite, head down… raises it
  S(22) - 0.1,    // 15 it's you
  S(23) - 0.1,    // 16 grey as paper
  S(24) - 0.1,    // 17 water drips from the jacket
  S(25) - 0.15,   // 18 «Станция Тихая» again, the doors
  S(26) - 0.1,    // 19 the second one comes in
  S(28) - 0.1,    // 20 grey temples, tired eyes
  S(29) - 0.1,    // 21 the third: an old man
  S(30) - 0.1,    // 22 in your jacket, too big for him
  S(32) - 0.1,    // 23 you text mom
  S(33) - 0.1,    // 24 the chat: the answer comes at once
  S(37) - 0.1,    // 25 the photo: you, asleep in your bed
  S(40) - 0.1,    // 26 the old man leans to you
  S(41) - 0.1,    // 27 «Не выходи на своей. Мы все вышли.»
  S(43) - 0.15,   // 28 «Станция Зелёный Бор»
  S(45) - 0.1,    // 29 your house, your window lit
  S(46) - 0.1,    // 30 mom on the platform, waving
  S(48) - 0.1,    // 31 you stand up; the three look at the floor
  S(50) - 0.1,    // 32 you sit back down
  S(51) - 0.1,    // 33 the doors close
  S(52) - 0.1,    // 34 her palm on the glass
  S(53) - 0.1,    // 35 she does not blink
  S(54) - 0.2,    // 36 morning, the terminus, the carriage empty
  S(57) - 0.1,    // 37 ordinary people on the platform
  S(58) - 0.1,    // 38 you run home
  S(59) - 0.1,    // 39 mom hugs you
  S(62) - 0.1,    // 40 your room: the bed still warm, the window open
  S(65) - 0.1,    // 41 the ticket on the pillow
  S(69) - 0.1,    // 42 the open window, the rain: he went to the train
  S(71) - 0.1,    // 43 would you get off at yours?
  E(72) + 0.4,    // 44 night again: «Тихая», the wet one comes in
  TOTAL,
];

// mouth opening 0..1 from the voice loudness, only while one of `lines` is spoken
const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

// subtitles: keywords in red
const RED = ['тих', 'пуст', 'нет', 'ты.', 'сер', 'вод', 'стар', 'спишь', 'дома', 'не', 'вышли', 'твоя', 'моргает', 'ладонь', 'билет', 'сегодня', 'вместо', 'туман'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z.-]/g, '');
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w);
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.who !== 'narrator' || (c.length > 1 && RED.some((r) => c.startsWith(r)))};
  }).filter((w) => w.w !== '—');
  CAPTIONS.push({start: l.start, end: lineEnd, words});
});
