// Every time in the episode comes from the voice: shot cuts, knocks (same formulas as scripts/horror_sound.py),
// lip movement (loudness envelope) and the word-by-word subtitles.
import VOICE from './voice.json';
import {CapLine} from './fx';

type VLine = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const LINES = VOICE.lines as VLine[];
export const TOTAL = VOICE.total;
export const S = (i: number) => LINES[i].start;
export const E = (i: number) => LINES[i].end;
export const W = (i: number, k: number) => LINES[i].words[k].t;

// knocks: bedroom door, front door, grandma's table, mom outside, the last one after the black
export const KNOCK = {
  bedroom: [0.08, 0.36],
  front: [E(3) + 0.05, E(3) + 0.3, E(3) + 0.55],
  gran: [W(9, 0), W(9, 0) + 0.22, W(9, 2)],
  mom: [W(15, 1), W(15, 1) + 0.22, W(15, 3)],
  final: [E(27) + 0.3, E(27) + 0.52, E(27) + 1.0],
};
export const SILENCE: [number, number] = [E(20) + 0.04, S(21) - 0.03];

// shot cuts (seconds): each shot starts a beat before its line
export const CUTS = [
  0, S(1) - 0.08, S(2) - 0.12, S(3) - 0.1, S(4) - 0.1, S(5) - 0.1, S(8) - 0.1, S(10) - 0.1, S(11) - 0.1,
  S(13) - 0.1, S(14) - 0.1, S(15) - 0.1, KNOCK.mom[2] + 0.25, S(17) - 0.1, S(18) - 0.1, S(19) - 0.1,
  SILENCE[0], S(21) - 0.1, S(23) - 0.1, S(24) - 0.1, S(27) - 0.1, TOTAL,
];

// mouth opening 0..1 from the voice loudness, only while one of `lines` is spoken
const ENV = VOICE.env as number[];
export const mouthAt = (t: number, lines: number[]) => {
  if (!lines.some((i) => t >= S(i) - 0.03 && t <= E(i) + 0.03)) return 0;
  const k = t * 30, a = ENV[Math.floor(k)] ?? 0, b = ENV[Math.floor(k) + 1] ?? 0;
  return Math.min(1, (a + (b - a) * (k % 1)) * 1.1);
};

// subtitles: keywords in red; the message (line 18) is already on the phone screen, so no caption there
const RED = ['ночи', 'стучат', 'правил', 'имени', 'никогда', 'отвечай', 'два', 'один', 'мамы', 'молчишь', 'глазок', 'дрожит',
  'научилось', 'спиной', 'оборачивайся', 'главного', 'дверью', 'входит', 'отвечаешь', 'первую', 'ответил'];
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
export const CAPTIONS: CapLine[] = LINES.filter((l) => l.i !== 18).map((l, k, arr) => {
  const next = arr[k + 1];
  return {
    start: l.start, end: Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.9),
    words: l.text.split(' ').map((w, j) => ({w: w.toUpperCase(), t: l.words[j]?.t ?? l.start,
      red: l.i === 27 || l.i === 1 || RED.some((r) => clean(w).startsWith(r))})),
  };
});
