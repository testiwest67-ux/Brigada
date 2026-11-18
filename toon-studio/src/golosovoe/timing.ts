// «Голосовое в 3:33»: every time comes from the voice — shot cuts, lip movement and the subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;

// shot n starts at CUTS[n - 1] (line numbers = voice lines, 0-based)
export const CUTS = [
  0,            // 1  the clock 3:32
  S(1) - 0.1,   // 2  the phone vibrates under the pillow
  S(2) - 0.1,   // 3  notification: «Я · Голосовое сообщение»
  S(4) - 0.1,   // 4  the chat «Я» — «это ваш номер»
  S(6) - 0.1,   // 5  sent at 3:33
  S(7) - 0.1,   // 6  the clock: 3:32
  S(9) - 0.1,   // 7  the message came a minute from the future
  S(11) - 0.1,  // 8  you tap play
  S(12) - 0.15, // 9  the message plays: «Не вставай с кровати…»
  S(15) - 0.1,  // 10 Kostya: it is your voice
  S(18) - 0.1,  // 11 a joke? hacked?
  S(20) - 0.1,  // 12 from under the bed… scratching
  S(23) - 0.1,  // 13 your hand hangs over the edge
  S(24) - 0.1,  // 14 you pull it up slowly
  S(25) - 0.1,  // 15 the sock… is gone
  S(27) - 0.1,  // 16 you don't get up
  S(30) - 0.1,  // 17 the clock: 3:33
  S(31) - 0.1,  // 18 the screen lights up by itself
  S(32) - 0.1,  // 19 the red dot: recording
  S(35) - 0.1,  // 20 under the bed — a face in the dark
  S(37) - 0.15, // 21 it whispers in your voice
  S(40) - 0.1,  // 22 recorded, 7 seconds, sent to «Я»
  S(43) - 0.1,  // 23 it wasn't you
  S(45) - 0.1,  // 24 why? the room
  S(47) - 0.1,  // 25 silence: under the bed is empty
  S(49) - 0.1,  // 26 the mattress sinks beside you
  S(53) - 0.1,  // 27 long pale fingers on the duvet
  S(54) - 0.1,  // 28 face to face
  S(56) - 0.15, // 29 «Спасибо, что не встал.»
  S(57) - 0.1,  // 30 3:34 — a new message from «Я»
  S(59) - 0.1,  // 31 the dark room, the phone glows — the end
  TOTAL,
];

const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

const RED = ['голосов', 'я»', '«я', 'минуту', 'вставай', 'кровати', 'кто-то', 'утра', 'твой', 'твоё', 'царапанье', 'ногтями', 'нет', 'сам', 'запись', 'шёпот', 'голосом', 'он', 'зачем', 'тишина', 'прогибается', 'пальцы', 'спасти', 'убежал', 'спасибо', 'встал'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z«».-]/g, '');
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w).replace(/[.,?!…]+$/, '');
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.who !== 'narrator' || (c.length > 1 && RED.some((r) => c.startsWith(r))) || c === '«я»'};
  }).filter((w) => w.w !== '—');
  CAPTIONS.push({start: l.start, end: lineEnd, words});
});
