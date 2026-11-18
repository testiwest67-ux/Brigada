// «Диана, кто дома?»: every time comes from the voice — the shot cuts, lip movement and the subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;

// shot n starts at CUTS[n - 1] (see the shot list in shots.tsx)
export const CUTS = [
  0,            // 1  the flat at night: Kostya in the doorway
  S(1) - 0.1,   // 2  the ad: ДЁШЕВО
  S(2) - 0.1,   // 3  the note: «Колонку не выключайте. Простите.»
  S(3) - 0.1,   // 4  the room: the bed, the desk with the speaker
  S(4) - 0.1,   // 5  a finger taps the speaker
  S(5) - 0.1,   // 6  the ring lights up
  S(6) - 0.2,   // 7  «Привет. Я Диана. Запоминаю голоса жильцов…»
  S(9) - 0.1,   // 8  «Жильцов в квартире: двое.» — ЖИЛЬЦОВ: 2
  S(10) - 0.2,  // 9  Kostya: «Стоп… Какие ещё двое?!»
  S(12) - 0.1,  // 10 the room: you live alone (the blanket is lumpy — easter egg)
  S(13) - 0.1,  // 11 «Диана, кто второй?» — over his shoulder to the speaker
  S(14) - 0.1,  // 12 «Он просит не говорить.» — the ring flashes red
  S(15) - 0.1,  // 13 goosebumps: his face
  S(16) - 0.1,  // 14 he walks through the flat
  S(17) - 0.1,  // 15 kitchen: two mugs
  S(18) - 0.1,  // 16 bathroom: empty
  S(19) - 0.1,  // 17 wardrobe: empty
  S(20) - 0.1,  // 18 nobody — the room
  S(21) - 0.1,  // 19 «Диана, как ты его видишь?»
  S(22) - 0.1,  // 20 «Я не вижу. Я слышу. В квартире дышат двое.»
  S(25) - 0.1,  // 21 «Диана, где он?»
  S(26) - 0.1,  // 22 «Он просит не говорить.»
  S(27) - 0.1,  // 23 he pulls the plug
  S(28) - 0.2,  // 24 silence: the dark room
  S(29) - 0.3,  // 25 night: he wakes up in bed
  S(30) - 0.1,  // 26 the ring glows — unplugged
  S(32) - 0.1,  // 27 «Диана, он близко?» — in bed
  S(33) - 0.1,  // 28 «Он просит не говорить.»
  S(34) - 0.1,  // 29 «Почему ты его слушаешься?»
  S(35) - 0.1,  // 30 «Он живёт здесь дольше… и с прошлым жильцом.»
  S(37) - 0.2,  // 31 he hides under the blanket — from above
  S(39) - 0.1,  // 32 under the blanket: his face, the phone light
  S(40) - 0.1,  // 33 «Он просит не говорить.» (whisper)
  S(41) - 0.2,  // 34 the trick: «Если он здесь — молчи»
  S(43) - 0.3,  // 35 silence: the timer 00:05 … 00:10
  S(46) - 0.2,  // 36 Diana is silent. So he is here.
  S(48) - 0.2,  // 37 the flashlight clicks on
  S(50) - 0.1,  // 38 face to face: the creature
  S(51) - 0.1,  // 39 not a human: grey skin
  S(53) - 0.1,  // 40 black eyes
  S(54) - 0.1,  // 41 long fingers, «vampire» hands
  S(55) - 0.1,  // 42 and it smiles
  S(56) - 0.1,  // 43 finger to the lips: «Тсс. Она обещала не говорить.»
  S(59) - 0.2,  // 44 the bed from above: two lumps
  S(60) - 0.2,  // 45 the ad again: «Снова в продаже»
  S(61) - 0.2,  // 46 ask your speaker — the dark room, the ring
  E(64) + 0.4,  // 47 last frame: the ring blue → red
  TOTAL,
];

const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

const RED = ['двое', 'второй', 'не', 'говорить', 'никого', 'дышат', 'тишина', 'само', 'дольше', 'прошлым', 'прошлый', 'молчи', 'молчит', 'здесь', 'человек', 'чёрные', 'длинные', 'тсс', 'кровати', 'одеяло', 'съехал'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z.-]/g, '');
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w).replace(/\.$/, '');
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.who !== 'narrator' || (c.length > 1 && RED.some((r) => c.startsWith(r)))};
  }).filter((w) => w.w !== '—');
  CAPTIONS.push({start: l.start, end: lineEnd, words});
});
