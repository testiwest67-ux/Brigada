// «Ночная смена»: every time comes from the voice — the 39 shot cuts, the sound cues (the same formulas are in
// scripts/shift_sound.py), lip movement (loudness envelope) and the word-by-word subtitles.
import VOICE from './voice.json';
import {CapLine} from '../horror/fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;
export const W = (i: number, k: number) => LINES[i].words[k].t;

// after «Зато смотрел я»: the lamp dies, one second of silence, then the dial tone
export const SILENCE: [number, number] = [E(49) + 0.35, E(49) + 1.35];

// shot cuts (seconds), shot n starts at CUTS[n - 1]; see the shot list in shots.tsx
export const CUTS = [
  0,              // 1  street, the sign «24 ЧАСА»
  S(2) - 0.1,     // 2  Dima's face, yawning («Твоя первая смена»)
  S(3) - 0.1,     // 3  the note
  S(4) - 0.15,    // 4  Dima reads (Petrovich's voice)
  S(6) - 0.1,     // 5  rule 1
  S(8) - 0.1,     // 6  eyebrow («Говори: Касса закрыта»)
  S(9) - 0.1,     // 7  rule 2: 3:33, the fridge glass
  S(11) - 0.1,    // 8  rule 3: the phone
  S(13) - 0.1,    // 9  «Утром я тебя сменю»
  S(15) - 0.15,   // 10 midnight
  S(16) - 0.1,    // 11 the tubes hum
  S(17) - 0.1,    // 12 the babushka, her shadow
  S(19) - 0.15,   // 13 one o'clock
  S(20) - 0.1,    // 14 the man in the coat
  S(22) - 0.1,    // 15 the floor under him
  S(24) - 0.15,   // 16 «Касса закрыта»
  S(25) - 0.1,    // 17 he smiles
  S(27) - 0.1,    // 18 out through the glass
  S(28) - 0.2,    // 19 3:30
  S(29) - 0.1,    // 20 knocking
  S(31) - 0.1,    // 21 «ДИМА» on the glass
  S(33) - 0.1,    // 22 eyes on the floor
  S(34) - 0.1,    // 23 the shadow turns its head
  S(35) - 0.15,   // 24 3:34, the knocking stops
  S(38) - 0.15,   // 25 four o'clock, the phone rings
  S(40) - 0.1,    // 26 he picks up
  S(42) - 0.1,    // 27 mom
  S(45) - 0.1,    // 28 bites his lip
  S(47) - 0.15,   // 29 his own voice
  E(49) + 0.1,    // 30 the lamp dies, silence, dial tone
  S(50) - 0.15,   // 31 six in the morning
  S(54) - 0.1,    // 32 almost cries
  S(55) - 0.1,    // 33 Petrovich looks at the floor
  S(57) - 0.15,   // 34 «Касса закрыта, сынок»
  S(58) - 0.1,    // 35 no shadow
  S(60) - 0.1,    // 36 the shadows on the glass
  S(63) - 0.1,    // 37 his shadow at the till
  S(65) - 0.15,   // 38 outside, no shadows
  E(66) + 0.3,    // 39 the note: «Дима» crossed out
  TOTAL,
];

// sound / picture cues shared with scripts/shift_sound.py
const knocks: number[] = [];
{
  // groups of knocks on the fridge glass from «стучать» until the clock shows 3:34
  let t = W(29, 2), g = 0;
  while (t < CUTS[23] - 0.15) {
    const n = 2 + (g % 3);
    for (let k = 0; k < n && t < CUTS[23] - 0.15; k++) { knocks.push(Math.round(t * 1000) / 1000); t += 0.19 + 0.04 * ((g + k) % 2); }
    t += 0.55 + 0.25 * (g % 2); g++;
  }
}
export const CUE = {
  bell12: CUTS[11] + 0.2,                     // the door bell: the babushka comes in
  knocks,
  ring: [S(39) - 0.35, CUTS[25] + 0.05] as [number, number], // the wall phone rings until he picks up
  pickup: CUTS[25] + 0.2,
  beeps: SILENCE[1],
  bell31: CUTS[30] + 0.25,                    // the door bell: Petrovich at dawn
};
// the old phone: 0.8 s of ringing, 0.5 s pause
export const ringOn = (t: number) => t >= CUE.ring[0] && t < CUE.ring[1] && ((t - CUE.ring[0]) % 1.3) < 0.8;
// rattle of the fridge doors from the knocks (metres)
export const knockShake = (t: number) => knocks.reduce((a, s) => {
  const d = t - s;
  return d > 0 && d < 0.5 ? a + Math.sin(2 * Math.PI * 10 * d) * Math.exp(-9 * d) : a;
}, 0) * 0.008;

// mouth opening 0..1 from the voice loudness, only while one of `lines` is spoken
const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

// subtitles: keywords in red; the last two lines all red
const RED = ['тен', 'тени', 'без', 'касс', 'закрыт', 'не', 'смотри', 'смотрел', 'стёкл', 'стекл', 'молчи', 'молчишь', 'телефон', 'ничего',
  'дима', 'сынок', 'страшно', 'изнутри', 'имени', 'правил', 'нет', 'покупател', 'жилет', 'полночь'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
export const CAPTIONS: CapLine[] = [];
LINES.forEach((l, k) => {
  const next = LINES[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.8);
  const words = l.text.split(' ').map((w, j) => {
    const c = clean(w);
    return {w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: l.i >= 65 || (c.length > 1 && RED.some((r) => c.startsWith(r)))};
  }).filter((w) => w.w !== '—');
  CAPTIONS.push({start: l.start, end: lineEnd, words});
});
