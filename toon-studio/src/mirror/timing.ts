// «Отражение опаздывает»: every time comes from the voice — the shot cuts, lip movement and the subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;

// shot n starts at CUTS[n - 1] (see the shot list in shots.tsx)
export const CUTS = [
  0,            // 1  morning: the bathroom, the mirror
  S(1) - 0.1,   // 2  brushing teeth in front of the mirror
  S(2) - 0.1,   // 3  her eyes blink
  S(3) - 0.1,   // 4  the reflection blinks — later (+0,5 с)
  S(5) - 0.1,   // 5  «показалось» — she shrugs
  S(7) - 0.2,   // 6  evening: she waves at herself
  S(8) - 0.1,   // 7  the reflection raises its hand a second later
  S(10) - 0.1,  // 8  she jerks her head away
  S(11) - 0.1,  // 9  the reflection is still looking
  S(12) - 0.1,  // 10 …and only then turns away
  S(13) - 0.1,  // 11 calendar: the next day
  S(14) - 0.1,  // 12 the lift mirror
  S(15) - 0.1,  // 13 the shop window
  S(16) - 0.1,  // 14 the phone screen
  S(17) - 0.1,  // 15 all your reflections are late (lift, close)
  S(18) - 0.1,  // 16 the café: she shows Liza
  S(19) - 0.1,  // 17 Liza: «Всё нормально…»
  S(21) - 0.2,  // 18 night: the sheet over the mirror
  S(22) - 0.1,  // 19 the dark bathroom, the covered mirror
  S(23) - 0.15, // 20 тук… тук… — the sheet bulges
  S(25) - 0.2,  // 21 morning: the sheet on the floor
  S(26) - 0.1,  // 22 the palm print — from the other side
  S(28) - 0.2,  // 23 three seconds now
  S(29) - 0.1,  // 24 she smiles
  S(30) - 0.1,  // 25 it waits… and smiles wider
  S(32) - 0.2,  // 26 she understands
  S(34) - 0.1,  // 27 it repeats, remembers, learns
  S(37) - 0.2,  // 28 calendar: fewer mistakes every day
  S(39) - 0.1,  // 29 perfect sync
  S(41) - 0.15, // 30 she exhales
  S(43) - 0.3,  // 31 she steps away from the mirror
  S(44) - 0.1,  // 32 the reflection stays
  S(45) - 0.1,  // 33 it waves
  S(46) - 0.3,  // 34 «Спасибо. Дальше я сама.»
  S(48) - 0.3,  // 35 inside: cold glass, she bangs on it
  S(50) - 0.1,  // 36 her palm on the glass — from the other side
  S(51) - 0.1,  // 37 outside: «she» brushes her teeth and does not hear
  S(53) - 0.3,  // 38 the moles: left → right
  S(55) - 0.2,  // 39 check your reflection
  E(57) + 0.5,  // 40 the light goes off, the palm stays in the dark glass
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
const RED = ['отраж', 'позже', 'полсекунд', 'секунд', 'опаздыв', 'стучит', 'тук', 'ладон', 'той', 'шире', 'учится', 'тобой', 'ни', 'стоять', 'машет', 'сама', 'холодн', 'не', 'родинк', 'слева'];
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
