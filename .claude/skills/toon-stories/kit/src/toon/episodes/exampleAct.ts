// TEMPLATE: timing + acting of the example episode, shared by the 2D (Example.tsx) and 3D (Example3D.tsx) versions.
// Pattern: every beat is a word from the voice (voice.json), every motion is a 0..1 curve of the frame.
// For a new episode copy this file, rename, and change BEATS + the curves.
import voice from './example.voice.json';
import {blinkAt, easeInOut, kick, lerp, ramp} from '../lib/anim';

export const EX_FPS = 30;
export const EX_SEC = Math.ceil(voice.total * 10) / 10;
export const VOICE = voice;
const L = (i: number) => voice.lines[i];
// first word that starts with `w` (lower case) -> its time in seconds
const W = (w: string) => voice.lines.flatMap((l) => l.words).find((x) => x.w.toLowerCase().startsWith(w))!.t;

export const BEATS = {
  day: W('вторник'), time: W('девять'),
  flicker: W('гаснет'), off: W('гаснет') + 0.22,   // lights die right after the word starts
  cut: L(5).start - 0.15,                           // scene 2 (window) starts just before its line
  lookDown: W('фары'), ask: W('что'),
};

export const act = (f: number, fps: number) => {
  const t = f / fps;
  const F = (s: number) => s * fps;
  const fOff = F(BEATS.off), fFl = F(BEATS.flicker);
  const FLICK = [1, 0.15, 0.15, 1, 1, 0.35, 0];
  const lamp = f < fFl ? 1 : f < fOff ? FLICK[Math.min(FLICK.length - 1, Math.floor(f - fFl))] : 0;
  const dark = f < fOff ? (1 - lamp) * 0.55 : ramp(f, fOff, fOff + 5);
  const jolt = Math.max(0, kick(f, fOff, fps, 2.2, 4.5));          // startle bump (springs back)
  const tense = ramp(f, fOff, fOff + 4);                             // stays scared
  const win = ramp(f, fOff + 6, fOff + 19, easeInOut);               // turns to the window
  const down = ramp(t, BEATS.lookDown, BEATS.lookDown + 0.5, easeInOut);
  const toCam = ramp(t, BEATS.ask - 0.1, BEATS.ask + 0.4, easeInOut); // looks into the camera for the call to action
  const breathe = Math.sin(2 * Math.PI * t * lerp(1 / 3.4, 1 / 2.1, tense)) * (1 + tense * 0.6);
  const blink = blinkAt(f, [38, 112, Math.round(F(BEATS.cut)) + 30, Math.round(F(BEATS.ask)) + 20]);
  const face = {
    yaw: lerp(0.1 - 0.7 * win, 0, toCam),
    pitch: lerp(0.45 * (1 - tense) - 0.1 * win + 0.4 * down, 0, toCam),
    open: Math.min(lerp(0.82, 1, tense), blink),
    wide: tense * 0.8 * (1 - 0.5 * toCam),
    lookX: lerp(0.15 * (1 - tense) - 0.95 * win, 0, toCam),
    lookY: lerp(0.5 * (1 - tense) - 0.1 * win + 0.8 * down, 0, toCam),
    brow: tense * 0.7, browTilt: tense * 0.6,
    mouthW: 1 - tense * 0.4,
    mouthOpen: tense * 0.5 * (1 - ramp(f, fOff + 24, fOff + 48)),
    smile: 0.14 - tense * 0.4 + toCam * 0.15,
  };
  return {t, fOff, lamp, lit: lamp > 0.5 ? 1 : 0, dark, jolt, tense, win, down, toCam, breathe, face,
    mugHop: Math.max(0, kick(f, fOff, fps, 3, 6)), shake: {x: kick(f, fOff, fps, 9, 7), y: kick(f, fOff, fps, 7, 7)}};
};
export type Act = ReturnType<typeof act>;
