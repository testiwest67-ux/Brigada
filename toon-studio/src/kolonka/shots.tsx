// The 47 shots of «Диана, кто дома?». Cut times and lip movement come from the voice (timing.ts).
// Room shots = the 3D room from «Последняя электричка» (bed, rainy window, desk, door to the hallway) at night,
// with 2D puppets: Kostya and the speaker «Диана» on the desk. Close-ups are 2D inserts (Inserts.tsx).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose} from '../horror/cam';
import {TemaLight} from '../horror/Tema';
import {Rig} from '../elevator/rig';
import {Look} from '../elevator/post';
import {DESK_EVA, FLAT_REST, FlatSet, FlatState, LIE} from './Flat3D';
import {BATH_REST, BathSet, MZ} from '../mirror/Bath3D';
import {Person, PERSON_REST, PersonState} from './People';
import {Eva} from './Eva';
import {AdInsert, BlanketInsert, JumpscareInsert, KitchenInsert, NoteInsert, PillowInsert, SpeakerInsert, TopBedInsert, WardrobeInsert} from './Inserts';
import {CUTS, mouthAt, S as LS, TOTAL} from './timing';
import {FONT} from '../horror/fonts';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const hand = (t: number, s = 1, k = 0.005): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);
const at = (c: Ctx, sec: number) => (sec - (c.g - c.f) / c.fps) * c.fps; // global seconds -> local frame

const NIGHT: TemaLight = {bright: 0.72, warmRim: 0.25, coldRim: 0.8, cold: 0.4};
const BL = Array.from({length: 80}, (_, i) => 40 + i * 92 + ((i * 37) % 40));
const ko = (t: number, o: Partial<PersonState> = {}): PersonState =>
  ({...PERSON_REST, t, breathe: Math.sin(t * 2.8), blink: blinkAt(Math.round(t * 30), BL), ...o});
const talking = (t: number, lines: number[]) => mouthAt(t, lines);

// ---------- the room ----------
// evening (before the plug is pulled): the bedside lamp is on; night: only the moon and the ring
const room = (c: Ctx, o: Partial<FlatState> = {}): FlatState => ({...FLAT_REST, t: T(c), lamp: T(c) < LS(27) + 1.5 ? 1 : 0, ...o});
type Pup = {id: string; at: V3; facing?: 1 | -1; rot?: number; draw: (view: 'front' | 'back', id: string) => React.ReactNode; shadow?: number; opacity?: number};
const kPup = (id: string, p: V3, s: PersonState, o: Partial<Pup> = {}): Pup =>
  ({id, at: p, facing: -1, shadow: 0.25, draw: (view, pid) => <Person s={s} light={NIGHT} id={pid} view={view} />, ...o});
const evaPup = (c: Ctx, ring: number, red = 0, talk = 0): Pup =>
  ({id: 'eva', at: DESK_EVA, facing: 1, draw: () => <Eva ring={ring} red={red} talk={talk} t={T(c)} id={`ev${c.g}`} />});

const RoomView: React.FC<{pose: CamPose; S: FlatState; ring: number; red?: number; pups?: Pup[]; look?: Look; exposure?: number; children?: React.ReactNode}> =
  ({pose, S, ring, red = 0, pups = [], look, exposure = 1.15, children}) => {
    const list = pups.map((p) => {
      const sees = pose.pos[2] > p.at[2] ? 1 : -1;
      return {p, view: (sees === (p.facing ?? 1) ? 'front' : 'back') as 'front' | 'back', depth: depthOf(pose, p.at)};
    }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
    return (
      <AbsoluteFill>
        <Set3D>
          <Rig pose={pose} fog={['#05070c', 0.05]} look={look} exposure={exposure} />
          <FlatSet S={S} ring={ring} red={red} />
        </Set3D>
        <PuppetLayer>
          {list.map(({p, view}) => (
            <Puppet key={p.id} pose={pose} at={p.at} shadow={p.shadow ?? 0} opacity={p.opacity ?? 1} rot={p.rot ?? 0}>{p.draw(view, p.id)}</Puppet>
          ))}
          {children}
        </PuppetLayer>
      </AbsoluteFill>
    );
  };

// standard cameras
const DOORCAM = (c: Ctx, s = 1): CamPose => cam(add(mix3([-1.5, 1.62, -1.0], [-1.35, 1.58, -0.75], K(c)), hand(c.t, s)), [1.4, 1.0, 0.9], 58);
const K_MID: V3 = [0.55, 0, -0.45];                 // Kostya standing in the room, facing the desk
const WIDE = (c: Ctx, s = 1): CamPose => cam(add(mix3([0.9, 1.75, 1.85], [0.75, 1.7, 1.6], K(c)), hand(c.t, s)), [-0.3, 0.8, -1.2], 62);
const FACE = (c: Ctx, p: V3 = K_MID, s = 1): CamPose => cam(add(mix3([p[0] + 0.25, 1.3, p[2] - 1.25], [p[0] + 0.22, 1.3, p[2] - 1.1], K(c)), hand(c.t, s, 0.003)), [p[0], 1.24, p[2]], 40);
const OVER = (c: Ctx, s = 1): CamPose => cam(add(mix3([0.15, 1.62, 0.55], [0.25, 1.58, 0.35], K(c)), hand(c.t, s)), [DESK_EVA[0], 0.88, DESK_EVA[2]], 46);
// close on his head on the pillow (a lying body does not fit a vertical frame)
const BEDCAM = (c: Ctx, s = 1): CamPose => cam(add(mix3([-0.2, 1.25, -0.75], [-0.3, 1.2, -0.8], K(c)), hand(c.t, s, 0.003)), [-1.25, 0.62, -1.35], 44);
const lying = (id: string, s: PersonState): Pup => ({id, at: LIE, facing: 1, rot: 90, draw: (v, pid) => (
  <g>
    <Person s={s} light={NIGHT} id={pid} view="front" />
    <path d="M -330 -990 C -200 -1030 200 -1030 330 -990 L 360 40 L -360 40 Z" fill="#2f4a72" stroke="#14121c" strokeWidth={8} />
    {[-160, 0, 160].map((x) => <path key={x} d={`M ${x} -960 C ${x + 30} -600 ${x - 30} -300 ${x} 20`} stroke="#22385a" strokeWidth={14} fill="none" />)}
  </g>
)});

// Diana in the speaker insert: ring on, talking while her lines play
const spk = (c: Ctx, o: Partial<React.ComponentProps<typeof SpeakerInsert>> = {}) => {
  const t = T(c);
  return <SpeakerInsert t={t} k={K(c)} ring={1} talk={talking(t, [6, 7, 8, 9, 14, 22, 23, 24, 26, 33, 35, 36, 40]) > 0.05 ? 1 : 0} {...o} />;
};
const redBlink = (c: Ctx, sec: number) => (T(c) > sec && T(c) < sec + 0.18 ? 1 : 0);

// =================== the shots ===================

// 1. «Ты снял квартиру.» — the flat at night: Kostya comes in, the hallway light behind him
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps, easeOut);
  const p: V3 = [lerp(1.75, 1.1, w), Math.abs(Math.sin(T(c) * 6)) * 0.01, 0.75];
  return <RoomView pose={DOORCAM(c, 1)} S={room(c, {door: 1})} ring={0} pups={[kPup('k1', p, ko(T(c), {lookX: -0.6, turn: -0.3}), {facing: 1})]} />;
};
export const S02: React.FC<{c: Ctx}> = ({c}) => <AdInsert k={K(c)} t={T(c)} />;
export const S03: React.FC<{c: Ctx}> = ({c}) => <NoteInsert k={K(c)} />;
// 4. «Оставил всё: кровать, вещи и умную колонку.» — pan from the bed to the desk
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add([0.3, 1.6, 1.4], hand(c.t, 4)), mix3([-1.25, 0.6, -1.0], [DESK_EVA[0], 0.85, DESK_EVA[2]], k), 50);
  return <RoomView pose={pose} S={room(c)} ring={0} pups={[evaPup(c, 0)]} />;
};
export const S05: React.FC<{c: Ctx}> = ({c}) => <SpeakerInsert t={T(c)} k={K(c)} ring={0.05} hand="tap" handK={ramp(c.f, 0, c.d * c.fps * 0.8, easeInOut)} />;
export const S06: React.FC<{c: Ctx}> = ({c}) => <SpeakerInsert t={T(c)} k={K(c)} ring={ramp(c.f, 4, 20, easeOut)} />;
export const S07: React.FC<{c: Ctx}> = ({c}) => spk(c, {status: T(c) > LS(8) ? 'ЗАПОМИНАЮ ГОЛОСА…' : 'ДИАНА · НАСТРОЙКА'});
export const S08: React.FC<{c: Ctx}> = ({c}) => spk(c, {status: 'ЖИЛЬЦОВ: 2'});
// 9. «Стоп… Какие ещё двое?!»
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 2, 10, easeOut);
  return <RoomView pose={FACE(c)} S={room(c)} ring={1} pups={[kPup('k9', K_MID, ko(T(c), {fear: 0.4 + 0.5 * k, mouth: 0.5 * k, lookX: 0.2}))]} />;
};
// 10. «Ты живёшь один.» — the room, him alone; the blanket on the bed is lumpy (easter egg)
export const S10: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={WIDE(c, 10)} S={room(c, {lump: 1})} ring={1} pups={[evaPup(c, 1), kPup('k10', K_MID, ko(T(c), {lookX: 0.5, turn: 0.3}))]} />
);
// 11. «Диана, кто второй?»
export const S11: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={OVER(c, 11)} S={room(c)} ring={1} pups={[evaPup(c, 1), kPup('k11', K_MID, ko(T(c), {mouth: talking(T(c), [13])}))]} />
);
// 12. «Он просит не говорить.» — the ring flashes red once
export const S12: React.FC<{c: Ctx}> = ({c}) => spk(c, {red: redBlink(c, LS(14) + 0.5)});
export const S13: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={FACE(c, K_MID, 13)} S={room(c)} ring={1} pups={[kPup('k13', K_MID, ko(T(c), {fear: 0.7, tremble: 2.5, lookX: -0.4}))]} />
);
// 14. he walks through the flat, to the hallway door
export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const p: V3 = [lerp(0.45, 1.3, w), Math.abs(Math.sin(T(c) * 6)) * 0.01, lerp(-0.25, 0.7, w)];
  return <RoomView pose={DOORCAM(c, 14)} S={room(c, {door: lerp(0.12, 1, w)})} ring={1} pups={[evaPup(c, 1), kPup('k14', p, ko(T(c), {fear: 0.5}), {facing: 1})]} />;
};
export const S15: React.FC<{c: Ctx}> = ({c}) => <KitchenInsert k={K(c)} />;
export const S16: React.FC<{c: Ctx}> = ({c}) => (
  <AbsoluteFill>
    <Set3D>
      <Rig pose={cam(add([0.5, 1.55, 1.3], hand(c.t, 16)), [0, 1.2, MZ], 54)} fog={['#05070c', 0.08]} exposure={1.1} />
      <BathSet S={{...BATH_REST, t: T(c), tint: 'night', lamp: 0.45, door: 0.9}} />
    </Set3D>
  </AbsoluteFill>
);
export const S17: React.FC<{c: Ctx}> = ({c}) => <WardrobeInsert k={K(c)} open={ramp(c.f, 0, 8, easeOut)} />;
export const S18: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={DOORCAM(c, 18)} S={room(c, {door: 1})} ring={1} pups={[evaPup(c, 1), kPup('k18', [1.0, 0, 0.5], ko(T(c), {fear: 0.5, lookX: -0.8, turn: -0.5}), {facing: 1})]} />
);
// 19. «Диана, как ты его видишь?»
export const S19: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={OVER(c, 19)} S={room(c)} ring={1} pups={[evaPup(c, 1), kPup('k19', K_MID, ko(T(c), {mouth: talking(T(c), [21])}))]} />
);
// 20. «Я не вижу. Я слышу. В квартире дышат двое.» — the ring pulses in two rhythms
export const S20: React.FC<{c: Ctx}> = ({c}) => spk(c, {twoBreaths: T(c) > LS(24) ? 1 : 0, status: T(c) > LS(24) ? 'ДЫХАНИЕ: 2' : undefined});
export const S21: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={FACE(c, K_MID, 21)} S={room(c)} ring={1} pups={[kPup('k21', K_MID, ko(T(c), {fear: 0.7, mouth: talking(T(c), [25])}))]} />
);
export const S22: React.FC<{c: Ctx}> = ({c}) => spk(c, {red: redBlink(c, LS(26) + 0.6)});
export const S23: React.FC<{c: Ctx}> = ({c}) => <SpeakerInsert t={T(c)} k={K(c)} ring={1 - ramp(c.f, c.d * c.fps * 0.55, c.d * c.fps * 0.62)} hand="pull" handK={ramp(c.f, 4, c.d * c.fps * 0.6, easeInOut)} cable={c.t > c.d * 0.55 ? 'out' : 'in'} />;
// 24. «Тишина.» — the dark room
export const S24: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={WIDE(c, 24)} S={room(c, {lump: 1, lamp: 0})} ring={0} pups={[evaPup(c, 0), kPup('k24', K_MID, ko(T(c), {fear: 0.3}))]} exposure={0.9} />
);
// 25. «Ночью ты просыпаешься.»
export const S25: React.FC<{c: Ctx}> = ({c}) => {
  const open = ramp(c.f, 10, 16, easeOut);
  return <PillowInsert t={T(c)} k={K(c)} s={{blink: open, fear: 0.5 * open, lookY: -0.4}} />;
};
export const S26: React.FC<{c: Ctx}> = ({c}) => <SpeakerInsert t={T(c)} k={K(c)} ring={ramp(c.f, 0, 10)} cable="out" dark={0.5} />;
export const S27: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={1} s={{fear: 0.8, mouth: talking(T(c), [32]) * 0.6, lookX: 0.6}} />;
export const S28: React.FC<{c: Ctx}> = ({c}) => spk(c, {cable: 'out', dark: 0.5, red: redBlink(c, LS(33) + 0.5)});
export const S29: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={1} s={{fear: 0.95, tremble: 2, mouth: talking(T(c), [34]) * 0.6, lookX: 0.6}} />;
export const S30: React.FC<{c: Ctx}> = ({c}) => spk(c, {cable: 'out', dark: 0.5, status: T(c) > LS(36) ? 'ЖИЛЕЦ №1 · С 2019 ГОДА' : undefined});
// 31. he hides under the blanket — from above: one lump
export const S31: React.FC<{c: Ctx}> = ({c}) => <TopBedInsert t={T(c)} k={K(c)} two={0} />;
// 32. under the blanket: his face in the phone light
export const S32: React.FC<{c: Ctx}> = ({c}) => (
  <BlanketInsert t={T(c)} k={K(c)} mode="kostya" light={1} s={{fear: 0.9, tremble: 1.5, mouth: talking(T(c), [39]) * 0.5, lookY: 0.4}} />
);
export const S33: React.FC<{c: Ctx}> = ({c}) => spk(c, {cable: 'out', dark: 0.7});
export const S34: React.FC<{c: Ctx}> = ({c}) => (
  <BlanketInsert t={T(c)} k={K(c)} mode="kostya" light={1} s={{fear: 0.7, mouth: talking(T(c), [41, 42]) * 0.5, lookY: 0.3, lookX: 0.3}} />
);
// 35. silence: the timer 00:05 … 00:10
export const S35: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), sec = t < LS(44) ? 0 : t < LS(45) ? 5 : 10;
  return <SpeakerInsert t={t} k={K(c)} ring={1} cable="out" dark={0.6} timer={`00:${String(sec).padStart(2, '0')}`} />;
};
export const S36: React.FC<{c: Ctx}> = ({c}) => (
  <BlanketInsert t={T(c)} k={K(c)} mode="kostya" light={1} s={{fear: 1, tremble: 3, mouth: 0.3, lookX: 0.8}} />
);
// 37. the flashlight clicks on — a white flash
export const S37: React.FC<{c: Ctx}> = ({c}) => {
  // the phone in his hand, the screen flickers as his thumb looks for the flashlight
  const fl = 0.75 + 0.25 * Math.sin(T(c) * 9);
  return <BlanketInsert t={T(c)} k={K(c)} mode="kostya" light={fl} s={{fear: 0.9, lookY: 0.6, tremble: 1.5}} />;
};
const CR = (c: Ctx, o: Partial<PersonState> = {}) => ({uncanny: 0.9, blink: 1, smile: 0.5, claw: 1, mouth: 0, breathe: Math.sin(T(c) * 1.5), ...o});
export const S38: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} flash={1 - ramp(c.f, 0, 7)} focus="face" s={CR(c)} />;
export const S39: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="face" s={CR(c, {smile: 0.3})} />;
export const S40: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="eyes" s={CR(c)} />;
export const S41: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="fingers" s={CR(c, {smile: 0.5})} />;
export const S42: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="smile" s={CR(c, {smile: ramp(c.f, 0, 14, easeOut), mouth: ramp(c.f, 18, 40, easeOut) * 0.9})} />;
export const S43: React.FC<{c: Ctx}> = ({c}) => (
  <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="shh" s={{uncanny: 0.9, blink: 1, smile: 0.6, shh: ramp(c.f, 0, 12, easeOut), mouth: talking(T(c), [57, 58]) * 0.4}} />
);
// 44. the bed from above: two lumps
export const S44: React.FC<{c: Ctx}> = ({c}) => <TopBedInsert t={T(c)} k={K(c)} two={ramp(c.f, 6, 18)} />;
// 45. «…почему прошлый жилец съехал за одну ночь.» — the ad is up again
export const S45: React.FC<{c: Ctx}> = ({c}) => <AdInsert k={K(c)} t={T(c)} again />;
// 46. ask your speaker — the dark room, only the ring
export const S46: React.FC<{c: Ctx}> = ({c}) => (
  <RoomView pose={cam(add(mix3([0.0, 1.3, 0.3], [0.35, 1.15, -0.4], K(c)), hand(c.t, 46)), [DESK_EVA[0], 0.9, DESK_EVA[2]], 44)} S={room(c, {lamp: 0, lump: 1})} ring={1} pups={[evaPup(c, 1)]} exposure={0.9} />
);
// 47. the last frame: the ring blue → red, black
export const S47: React.FC<{c: Ctx}> = ({c}) => {
  const start = Math.round(c.d * c.fps * 0.42);
  return c.f < start
    ? <SpeakerInsert t={T(c)} k={K(c)} ring={1} red={c.t > c.d * 0.2 ? 1 : 0} cable="out" dark={0.7} />
    : <JumpscareInsert t={T(c)} f={c.f} start={start} />;
};

// ---------- overlays ----------
const NONE: React.FC<{c: Ctx}> = () => null;
void NONE; void kick; void clamp; void FONT; void at;

const C = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20,
  S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40,
  S41, S42, S43, S44, S45, S46, S47];
const KEY: Record<number, number> = {5: 0.8, 6: 0.8, 8: 0.6, 9: 0.6, 12: 0.5, 14: 0.7, 17: 0.6, 23: 0.75, 25: 0.8, 26: 0.6, 35: 0.85, 37: 0.85, 42: 0.8, 43: 0.6, 44: 0.8, 47: 0.6};
export const COLD_SHOTS = new Set([24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47]);

export const SHOTS = C.map((Comp, i) => {
  const from = CUTS[i], to = CUTS[i + 1];
  return {id: i + 1, C: Comp, from, to, key: from + (to - from) * (KEY[i + 1] ?? 0.55)};
});
export const EP_SEC = TOTAL;
