// The 31 shots of «Голосовое в 3:33». Cut times and lip movement come from the voice (timing.ts).
// 3D: the room from «Колонка» at night (Kostya = the shape under the duvet). Close-ups: 2D inserts (PhoneInserts.tsx,
// Inserts.tsx — pillow, bed from above, face to face with the double).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, easeOut, lerp, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Set3D} from '../horror/common';
import {CamPose} from '../horror/cam';
import {Rig} from '../elevator/rig';
import {FLAT_REST, FlatSet, FlatState} from './Flat3D';
import {PersonState} from './People';
import {BlanketInsert, JumpscareInsert, PillowInsert, TopBedInsert} from './Inserts';
import {BedEdgeInsert, ClockInsert, FingersInsert, PhoneInsert, UnderBedInsert} from './PhoneInserts';
import {CUTS, mouthAt, S as LS, TOTAL} from './timing';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);
const at = (c: Ctx, sec: number) => (sec - (c.g - c.f) / c.fps) * c.fps; // global seconds -> local frame
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// the room at night: lamp off, moon, rain; Kostya = the lump under the duvet
const room = (c: Ctx, o: Partial<FlatState> = {}): FlatState => ({...FLAT_REST, t: T(c), lamp: 0, lump: 1, ...o});
const RoomView: React.FC<{pose: CamPose; S: FlatState; exposure?: number; phone?: number}> = ({pose, S, exposure = 0.95, phone = 0}) => (
  <AbsoluteFill>
    <Set3D>
      <Rig pose={pose} fog={['#05070c', 0.06]} exposure={exposure} />
      <FlatSet S={S} ring={0} />
    </Set3D>
    {phone > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at 30% 62%, rgba(130,180,255,${0.35 * phone}) 0%, rgba(0,0,0,0) 22%)`}} />}
  </AbsoluteFill>
);
const BED_CAM = (c: Ctx, k: number) => cam(add(mix3([1.75, 1.75, 1.85], [1.45, 1.6, 1.5], k), hand(c.t, 7)), [-1.25, 0.55, -0.85], 58);

// Kostya on the pillow, lit by the phone
const KO = (c: Ctx, o: Partial<PersonState> = {}) => ({breathe: Math.sin(T(c) * 2.6), blink: 1, ...o});
// the double
const DB = (c: Ctx, o: Partial<PersonState> = {}) => ({uncanny: 0.9, blink: 1, smile: 0.6, mouth: 0, breathe: Math.sin(T(c) * 1.4), ...o});

export const S01: React.FC<{c: Ctx}> = ({c}) => <ClockInsert t={T(c)} k={K(c)} time="3:32" />;
export const S02: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="lock" time="3:32" vibrate={1 - ramp(c.f, 30, 60)} glow={ramp(c.f, 0, 8)} />;
export const S03: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="lock" time="3:32" />;
export const S04: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="chat" time="3:32" hl="me" />;
export const S05: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="chat" time="3:32" hl="sent" />;
export const S06: React.FC<{c: Ctx}> = ({c}) => <ClockInsert t={T(c)} k={K(c)} time="3:32" />;
export const S07: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="chat" time="3:32" hl={c.t < c.d * 0.5 ? 'clock' : 'sent'} />;
export const S08: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="chat" time="3:32" tap={ramp(c.f, at(c, LS(11) + 0.4), at(c, LS(11) + 0.9))} />;
export const S09: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="chat" time="3:32" progress={ramp(c.f, 0, c.d * c.fps)} />;
export const S10: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={1} s={KO(c, {fear: 0.7, lookY: 0.4, lookX: 0.4})} />;
export const S11: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={1} s={KO(c, {fear: 0.4, lookY: 0.7, lookX: 0.6, mouth: 0.15})} />;
export const S12: React.FC<{c: Ctx}> = ({c}) => <BedEdgeInsert t={T(c)} k={K(c)} sock={1} scratch={ramp(c.f, at(c, LS(21)), at(c, LS(22) + 1))} />;
export const S13: React.FC<{c: Ctx}> = ({c}) => <BedEdgeInsert t={T(c)} k={K(c)} hand={1} sock={1} scratch={1} />;
export const S14: React.FC<{c: Ctx}> = ({c}) => <BedEdgeInsert t={T(c)} k={K(c)} hand={1 - ramp(c.f, 6, c.d * c.fps - 6, easeInOut)} sock={1} scratch={1} />;
export const S15: React.FC<{c: Ctx}> = ({c}) => <BedEdgeInsert t={T(c)} k={K(c)} sock={1 - ramp(c.f, at(c, LS(26) - 0.6), at(c, LS(26) + 0.1), easeOut)} scratch={1} />;
export const S16: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={0.6} s={KO(c, {fear: 1, tremble: 2, lookX: 0.9, lookY: 0.5})} />;
export const S17: React.FC<{c: Ctx}> = ({c}) => <ClockInsert t={T(c)} k={K(c)} time="3:33" flash={1 - ramp(c.f, 0, 12)} />;
export const S18: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="lock" time="3:33" note="Микрофон включён" glow={ramp(c.f, 10, 22)} />;
export const S19: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="record" time="3:33" rec={0} />;
export const S20: React.FC<{c: Ctx}> = ({c}) => <UnderBedInsert t={T(c)} k={K(c)} face={ramp(c.f, at(c, LS(36) - 0.3), at(c, LS(36) + 0.8))} light={0.5} s={DB(c, {smile: 0.3})} />;
export const S21: React.FC<{c: Ctx}> = ({c}) => <UnderBedInsert t={T(c)} k={K(c)} face={1} light={0.7} s={DB(c, {smile: 0.5, mouth: mouthAt(T(c), [37, 38, 39]) * 0.5})} />;
export const S22: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode={c.t < 0.9 ? 'record' : 'sent2'} time="3:33" rec={7} />;
export const S23: React.FC<{c: Ctx}> = ({c}) => <PillowInsert t={T(c)} k={K(c)} ring={0.8} s={KO(c, {fear: 1, mouth: 0.5, lookY: 0.2})} />;
export const S24: React.FC<{c: Ctx}> = ({c}) => <RoomView pose={BED_CAM(c, K(c))} S={room(c)} phone={0.6} exposure={1.1} />;
export const S25: React.FC<{c: Ctx}> = ({c}) => <UnderBedInsert t={T(c)} k={K(c)} face={0} light={0.95} />;
export const S26: React.FC<{c: Ctx}> = ({c}) => <TopBedInsert t={T(c)} k={K(c)} two={ramp(c.f, at(c, LS(50) - 0.2), at(c, LS(52) + 0.5))} ring={0} />;
export const S27: React.FC<{c: Ctx}> = ({c}) => <FingersInsert t={T(c)} k={K(c)} reach={ramp(c.f, 0, c.d * c.fps * 0.8, easeOut)} />;
export const S28: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="face" s={DB(c, {smile: 0.7})} />;
export const S29: React.FC<{c: Ctx}> = ({c}) => <BlanketInsert t={T(c)} k={K(c)} mode="creature" light={1} focus="smile" s={DB(c, {smile: 1, mouth: mouthAt(T(c), [56]) * 0.45})} />;
export const S30: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert t={T(c)} k={K(c)} mode="lock" time="3:34" vibrate={1 - ramp(c.f, 20, 45)} />;
export const S31: React.FC<{c: Ctx}> = ({c}) => {
  const start = Math.round((TOTAL - 1.2 - (c.g - c.f) / c.fps) * c.fps);
  return c.f < start
    ? <RoomView pose={BED_CAM(c, K(c))} S={room(c, {lump: 0})} phone={1} exposure={1.05} />
    : <JumpscareInsert t={T(c)} f={c.f} start={start} />;
};

const C = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20,
  S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31];
const KEY: Record<number, number> = {2: 0.3, 8: 0.6, 9: 0.6, 14: 0.6, 15: 0.85, 18: 0.7, 20: 0.85, 22: 0.7, 26: 0.85, 27: 0.8, 31: 0.4};
export const COLD_SHOTS = new Set(C.map((_, i) => i + 1));

export const SHOTS = C.map((Comp, i) => {
  const from = CUTS[i], to = CUTS[i + 1];
  return {id: i + 1, C: Comp, from, to, key: from + (to - from) * (KEY[i + 1] ?? 0.55)};
});
export const EP_SEC = TOTAL;
