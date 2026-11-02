// The 39 shots of «Ночная смена». Times are the draft from the script; after the voice they get tied to the words.
// Every shop shot = the 3D shop + 2D puppets. A puppet behind the counter (or outside behind the glass) from the
// camera's side is clipped to what the counter top / the glass would let you see.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose} from '../horror/cam';
import {TemaLight} from '../horror/Tema';
import {ClipQuad, Rig} from '../elevator/rig';
import {Look} from '../elevator/post';
import {Dima, DimaState, DIMA_REST} from './Dima';
import {Babka, BABKA_REST, BabkaState, Petrovich, PETROVICH_REST, PetrovichState, Stas, STAS_REST, StasState} from './People';
import {ABOVE_COUNTER, CLOCK, COUNTER, DOOR, DOOR_GLASS, FRIDGE, FRIDGE_GLASS, PHONE, ROOM, SHOP_REST, ShopSet, ShopState, SPOT, WIN_GLASS, WRITE_DOOR} from './Shop3D';
import {NoteInsert} from './Note';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const talk = (t: number, a: number, b: number) => (t > a && t < b ? clamp(0.35 + 0.45 * Math.sin(t * 15) + 0.2 * Math.sin(t * 23)) : 0);
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);

// ---------- light ----------
const NIGHT: TemaLight = {bright: 0.92, warmRim: 0.35, coldRim: 0.6, cold: 0.3};
const COLD: TemaLight = {bright: 0.55, warmRim: 0, coldRim: 1, cold: 0.75};
const DAWN: TemaLight = {bright: 0.95, warmRim: 0.85, coldRim: 0.25, cold: 0.05};
const DARK: TemaLight = {bright: 0.3, warmRim: 0, coldRim: 0.9, cold: 0.8};
const FOG: [string, number] = ['#0b0f10', 0.05];
const FOG_COLD: [string, number] = ['#070c12', 0.09];

const flick = (g: number, drops: number[] = []) => {
  const r = mulberry32(Math.floor(g / 2) + 5)();
  let v = 0.88 + (r - 0.5) * 0.06;
  for (const d of drops) if (g >= d && g <= d + 3) v = 0.15 + r * 0.15;
  return v;
};
const shop = (c: Ctx, o: Partial<ShopState> = {}): ShopState => ({...SHOP_REST, t: T(c), lamps: flick(c.g, [310, 340, 860, 1430]) * 0.9, ...o});
const dm = (t: number, o: Partial<DimaState> = {}): DimaState =>
  ({...DIMA_REST, t, breathe: Math.sin(t * 3.4), blink: blinkAt(Math.round(t * 30), [50, 140, 230, 320, 400, 470]), tremble: 0.3, ...o});
const pv = (t: number, o: Partial<PetrovichState> = {}): PetrovichState => ({...PETROVICH_REST, t, breathe: Math.sin(t * 2), blink: blinkAt(Math.round(t * 30), [60, 170, 250]), ...o});
const bb = (t: number, o: Partial<BabkaState> = {}): BabkaState => ({...BABKA_REST, t, breathe: Math.sin(t * 2.4), blink: blinkAt(Math.round(t * 30), [40, 120]), ...o});
const st = (t: number, o: Partial<StasState> = {}): StasState => ({...STAS_REST, t, breathe: Math.sin(t * 1.5), ...o});

// ---------- puppets in the shop ----------
type Pup = {
  id: string; at: V3;
  facing?: 1 | -1;                 // +1 = faces the door (+z)
  draw: (view: 'front' | 'back', id: string) => React.ReactNode;
  clips?: V3[][]; opacity?: number;
  cast?: number;                   // shadow cast on the floor (0 = none: the ones without a shadow)
  sil?: boolean; blur?: number; scale?: number; // a silhouette on a surface (the shadows on the fridge glass)
};
const counterClip = (pose: CamPose, z: number, x: number): V3[] | null => {
  if (x < COUNTER.x0 - 0.3 || x > COUNTER.x1 + 0.3) return null;
  if (pose.pos[2] > COUNTER.z1 && z < COUNTER.z0) return ABOVE_COUNTER(COUNTER.z0);
  if (pose.pos[2] < COUNTER.z0 && z > COUNTER.z1) return ABOVE_COUNTER(COUNTER.z1);
  return null;
};
const glassClip = (pose: CamPose, at: V3): V3[] | null => {
  const outP = at[2] > ROOM.z1, outC = pose.pos[2] > ROOM.z1;
  if (outP === outC) return null;
  return at[0] > DOOR.x0 && at[0] < DOOR.x1 ? DOOR_GLASS : WIN_GLASS;
};

const ShopView: React.FC<{pose: CamPose; S: ShopState; pups?: Pup[]; fog?: [string, number]; look?: Look; exposure?: number; children?: React.ReactNode; pre?: React.ReactNode}> = ({pose, S, pups = [], fog = FOG, look, exposure, children, pre}) => {
  const list = pups.map((p) => {
    const q: V3[][] = [...(p.clips ?? [])];
    const cc = counterClip(pose, p.at[2], p.at[0]); if (cc) q.push(cc);
    const gc = glassClip(pose, p.at); if (gc) q.push(gc);
    const sees = pose.pos[2] > p.at[2] ? 1 : -1;
    const view: 'front' | 'back' = sees === (p.facing ?? 1) ? 'front' : 'back';
    return {p, q, view, depth: depthOf(pose, p.at)};
  }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
  return (
    <AbsoluteFill>
      <Set3D>
        <Rig pose={pose} fog={fog} look={look} exposure={exposure} />
        <ShopSet S={S} />
      </Set3D>
      <PuppetLayer>
        <defs>
          <filter id="castSil" x="-50%" y="-50%" width="200%" height="200%">
            <feFlood floodColor="#000" result="k" /><feComposite in="k" in2="SourceAlpha" operator="in" result="sil" /><feGaussianBlur in="sil" stdDeviation={10} />
          </filter>
          {list.map(({p, q}) => q.map((quad, k) => <ClipQuad key={`${p.id}${k}`} id={`${p.id}-q${k}`} pose={pose} quad={quad} />))}
        </defs>
        {pre}
        {list.map(({p, q, view}) => {
          const body = p.draw(view, p.id);
          let node = (
            <g key={p.id}>
              {(p.cast ?? 0) > 0 && (
                <Puppet pose={pose} at={p.at}>
                  <g transform="matrix(1 0 0.45 -0.22 0 0)" opacity={p.cast} filter="url(#castSil)">{p.draw(view, `${p.id}s`)}</g>
                </Puppet>
              )}
              <Puppet pose={pose} at={p.at} opacity={p.opacity ?? 1}>
                {p.sil
                  ? <g transform={`scale(${p.scale ?? 1})`} style={{filter: `blur(${p.blur ?? 3}px)`}}>{body}</g>
                  : body}
              </Puppet>
            </g>
          );
          q.forEach((_, k) => { node = <g key={`${p.id}c${k}`} clipPath={`url(#${p.id}-q${k})`}>{node}</g>; });
          return node;
        })}
        {children}
      </PuppetLayer>
    </AbsoluteFill>
  );
};

const dimaPup = (id: string, at: V3, s: DimaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: 1, draw: (view, pid) => <Dima s={s} light={light} id={pid} view={view} />, ...o});
// Dima's shadow on the fridge glass behind him: a dark, slightly bigger, blurred silhouette; `lag` s behind him
const shadowPup = (id: string, x: number, s: DimaState, o: Partial<Pup> = {}): Pup =>
  ({id, at: [x - 0.34, -0.18, FRIDGE.z + 0.015], facing: 1, sil: true, scale: 1.28, blur: 1.6, opacity: 0.72, clips: [FRIDGE_GLASS],
    draw: (_v, pid) => <Dima s={{...s, shade: 1, smile: s.smile ?? 0}} light={{bright: 1, warmRim: 0, coldRim: 0, cold: 0}} id={pid} />, ...o});
const petPup = (id: string, at: V3, s: PetrovichState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: -1, cast: 0.5, draw: (view, pid) => <Petrovich s={s} light={light} id={pid} view={view} />, ...o});
const babkaPup = (id: string, at: V3, s: BabkaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: -1, cast: 0.5, draw: (view, pid) => <Babka s={s} light={light} id={pid} view={view} />, ...o});
const stasPup = (id: string, at: V3, s: StasState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: -1, cast: 0, draw: (view, pid) => <Stas s={s} light={light} id={pid} view={view} />, ...o});

const D = SPOT.dima;
// a still "Dima at the counter" + his shadow, used in many shots
const dimaWithShadow = (c: Ctx, s: DimaState, light: TemaLight, lag = 0.35, so: Partial<DimaState> = {}): Pup[] => [
  shadowPup(`sh${c.g}`, D[0], {...dm(T(c) - lag), ...s, t: T(c) - lag, blink: 0, ...so}),
  dimaPup(`dm${c.g}`, D, s, light),
];

// ---------- inserts ----------
const ClockShot: React.FC<{c: Ctx; time: string; o?: Partial<ShopState>; blink?: boolean}> = ({c, time, o = {}, blink}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.0, 2.3, 1.95], [1.0, 2.36, 2.2], k), hand(c.t, 3, 0.003)), CLOCK, 34);
  const show = blink ? (Math.floor(c.t * 2) % 2 === 0 ? time : time.replace(':', ' ')) : time;
  return <ShopView pose={pose} S={shop(c, {clock: show, ...o})} look={{bloom: 0.8}} />;
};

// ================= the shots =================

// 1. the street: the sign «24 ЧАСА» buzzes, one letter dies
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.6, 1.5, 11.5], [0.4, 1.9, 8.2], k), hand(c.t, 1, 0.01)), mix3([0.2, 2.3, 3.6], [0.4, 2.6, 3.6], k), 50);
  const sign = c.f > 30 && c.f % 23 < 4 ? 0 : 1;
  return <ShopView pose={pose} S={shop(c, {sign, clock: '23:58'})} fog={['#05070c', 0.03]} look={{bloom: 0.9}}
    pups={[dimaPup('d1', D, dm(T(c), {mouth: 0.1}), NIGHT)]} />;
};

// 2. Dima's face: yawning, first shift
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([0.8, 1.42, lerp(0.75, 0.5, k)], hand(c.t, 2, 0.004)), [0.75, 1.32, -0.62], 40);
  const yawn = clamp(1 - Math.abs(c.t - 0.7) / 0.6);
  return <ShopView pose={pose} S={shop(c, {clock: '23:59'})} pups={dimaWithShadow(c, dm(T(c), {mouth: yawn, blink: lerp(1, 0.2, yawn), lookX: 0.1}), NIGHT)} />;
};

// 3. insert: the note, «Стас» crossed out → «Дима»
export const S03: React.FC<{c: Ctx}> = ({c}) => <NoteInsert focus={0} k={K(c)} t={c.t} dim={0.55} />;

// 4. Dima reads; behind him his shadow on the fridge glass (it moves a beat late)
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.25, 1.5, 2.1], [1.1, 1.45, 1.75], k), hand(c.t, 4)), [0.7, 1.15, -0.75], 46);
  const s = dm(T(c), {note: 1, lookY: 0.75, fear: 0.15, turn: Math.sin(c.t * 1.3) * 0.3});
  return <ShopView pose={pose} S={shop(c, {clock: '00:00'})} pups={dimaWithShadow(c, s, NIGHT, 0.5)} />;
};

// 5. insert: rule 1
export const S05: React.FC<{c: Ctx}> = ({c}) => <NoteInsert focus={1} k={K(c)} t={c.t} />;

// 6. Dima raises an eyebrow
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.86, 1.42, 0.45], hand(c.t, 6, 0.004)), [0.75, 1.34, -0.62], 36);
  return <ShopView pose={pose} S={shop(c)} pups={dimaWithShadow(c, dm(T(c), {fear: 0.35 * ramp(c.f, 6, 14), lookX: -0.3, turn: -0.15, mouth: 0.1}), NIGHT)} />;
};

// 7. rule 2: the clock reads 3:33 … then the camera glides along the fridge glass
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  if (c.t < c.d * 0.4) return <ClockShot c={c} time="03:33" blink />;
  const k = ramp(c.f, c.d * 0.4 * c.fps, c.d * c.fps, easeInOut);
  const pose = cam([lerp(-2.4, -0.6, k), 1.35, 0.9], [lerp(-1.9, -0.1, k), 1.15, FRIDGE.z], 50);
  return <ShopView pose={pose} S={shop(c, {fridge: 1.3, frost: 0.15})} fog={FOG_COLD} />;
};

// 8. rule 3: the phone on the wall
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.3, 1.6, 0.9], [1.6, 1.55, 0.55], k), hand(c.t, 8, 0.003)), [PHONE[0], PHONE[1] - 0.15, PHONE[2]], lerp(46, 38, k));
  return <ShopView pose={pose} S={shop(c)} />;
};

// 9. insert: «Утром я тебя сменю. Продержись.»
export const S09: React.FC<{c: Ctx}> = ({c}) => <NoteInsert focus={4} k={K(c)} t={c.t} />;

// 10. the clock: midnight
export const S10: React.FC<{c: Ctx}> = ({c}) => <ClockShot c={c} time="00:00" />;

// 11. the whole shop: humming tubes, one flickers
export const S11: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-2.5, 2.35, 3.25], [-2.2, 2.3, 3.0], k), hand(c.t, 11, 0.004)), [0.6, 1.0, -0.4], 62);
  const S = shop(c, {lamps: flick(c.g, [c.g - c.f + 20, c.g - c.f + 44]) * 0.9, clock: '00:01'});
  return <ShopView pose={pose} S={S} pups={dimaWithShadow(c, dm(T(c), {lookX: 0.4}), NIGHT)} />;
};

// 12. a babushka comes in for bread; the bell rings; her shadow is on the floor
export const S12: React.FC<{c: Ctx}> = ({c}) => {
  const open = ramp(c.f, 4, 16, easeOut) * (1 - ramp(c.f, 40, 55));
  const w = ramp(c.f, 6, c.d * c.fps - 8, easeInOut);
  const pose = cam(add([2.05, 0.95, 0.55], hand(c.t, 12, 0.004)), [1.0, 0.75, 2.9], 58);
  const b = babkaPup('b12', [1.0, Math.abs(Math.sin(c.t * 6)) * 0.01, lerp(4.0, 1.4, w)], bb(T(c), {smile: 0.6}), NIGHT, {cast: 0.55});
  return <ShopView pose={pose} S={shop(c, {door: open, clock: '00:12'})} pups={[b]} />;
};

// 13. the clock: one o'clock
export const S13: React.FC<{c: Ctx}> = ({c}) => <ClockShot c={c} time="01:00" o={{lamps: 0.75}} />;

// 14. the man in the long coat at the counter, from below; he puts a pack of salt on the belt
export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.6, 1.08, -0.6], [0.62, 1.05, -0.5], k), hand(c.t, 14, 0.004)), [0.88, 1.62, 0.85], 72);
  const S = shop(c, {lamps: flick(c.g, [c.g - c.f + 30, c.g - c.f + 34]) * 0.8, clock: '01:00'});
  return <ShopView pose={pose} S={S} pups={[stasPup('s14', SPOT.buyer, st(T(c), {reach: ramp(c.f, 20, 40, easeInOut), lookX: -0.3}), {...NIGHT, cold: 0.45})]} />;
};

// 15. the floor under him: nothing
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.75, 0.42, 1.95], [1.6, 0.38, 1.75], k), hand(c.t, 15, 0.003)), [0.85, 0.15, 0.82], 52);
  return <ShopView pose={pose} S={shop(c, {clock: '01:00'})} pups={[stasPup('s15', SPOT.buyer, st(T(c), {reach: 1}), NIGHT)]} />;
};

// 16. Dima, pale: «Касса закрыта»
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.74, 1.4, 0.38], hand(c.t, 16, 0.003)), [0.75, 1.34, -0.62], 34);
  return <ShopView pose={pose} S={shop(c, {clock: '01:00'})} pups={dimaWithShadow(c, dm(T(c), {fear: 0.85, tremble: 1.6, mouth: talk(c.t, 0.6, 1.6) * 0.5, lookY: -0.2}), NIGHT)} />;
};

// 17. he smiles too long; the coat opens: the same green vest, badge «СТАС»
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const down = ramp(c.f, c.d * 0.6 * c.fps, c.d * c.fps, easeInOut);
  const pose = cam(add([0.86, lerp(1.95, 1.55, down), lerp(-0.05, 0.1, k)], hand(c.t, 17, 0.003)), [0.85, lerp(1.92, 1.25, down), 0.82], lerp(42, 46, down));
  return <ShopView pose={pose} S={shop(c, {lamps: 0.75})} pups={[stasPup('s17', SPOT.buyer, st(T(c), {smile: ramp(c.f, 4, 40, easeInOut), coatOpen: down * 0.9, tilt: lerp(0, -10, k)}), {...NIGHT, cold: 0.5})]} />;
};

// 18. he walks out through the closed glass door; the bell does not move
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 4, c.d * c.fps - 6, easeInOut);
  const z = lerp(1.1, 4.3, w);
  const pose = cam(add([0.85, 1.55, -0.35], hand(c.t, 18, 0.003)), [1.0, 1.15, 3.6], 52);
  const near = Math.exp(-Math.pow((z - ROOM.z1) / 0.25, 2));
  return <ShopView pose={pose} S={shop(c, {clock: '01:02'})} look={{ripple: near * 0.5, rtime: c.t}}
    pups={[stasPup('s18', [lerp(0.85, 1.0, w), 0, z], st(T(c), {smile: 1}), NIGHT, {facing: 1})]} />;
};

// 19. the clock: 3:30 — the tubes go dim, the fridges get brighter
export const S19: React.FC<{c: Ctx}> = ({c}) => <ClockShot c={c} time="03:30" o={{lamps: lerp(0.8, 0.3, K(c)), fridge: 1.6}} />;

// 20. the glass fogs up, someone knocks from inside; Dima freezes with his back to it
const N333 = (c: Ctx, o: Partial<ShopState> = {}) => shop(c, {lamps: 0.12, counter: 0.45, fridge: 1.7, frost: 0.8, clock: '03:33', ...o});
const KNOCKS = [0.4, 0.75, 1.1, 1.7, 1.95, 2.3];
const knockAt = (c: Ctx) => KNOCKS.reduce((a, s) => a + Math.max(0, kick(c.f, s * c.fps, c.fps, 10, 9)), 0) * 0.008;
export const S20: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.15, 1.45, 1.7], [1.0, 1.42, 1.4], k), hand(c.t, 20)), [0.55, 1.2, -0.85], 52);
  const S = N333(c, {frost: lerp(0.2, 0.85, k), knock: knockAt(c)});
  return <ShopView pose={pose} S={S} fog={FOG_COLD} exposure={0.8} pups={dimaWithShadow(c, dm(T(c), {fear: 0.8, tremble: 2, lookY: 0.3, hands: 0.3}), COLD)} />;
};

// 21. on the fogged glass a finger writes «ДИМА» from the inside
export const S21: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const x = FRIDGE.x0 + (FRIDGE.x1 - FRIDGE.x0) / FRIDGE.n * (WRITE_DOOR + 0.5);
  const pose = cam(add([x + 0.02, 1.5, lerp(0.45, 0.25, k)], hand(c.t, 21, 0.003)), [x, 1.45, FRIDGE.z], 48);
  return <ShopView pose={pose} S={N333(c, {write: ramp(c.f, 6, c.d * c.fps - 10)})} fog={FOG_COLD} look={{bloom: 0.5}} />;
};

// 22. Dima looks only at the floor (eyes down, shaking)
export const S22: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.72, 1.52, 0.4], hand(c.t, 22, 0.004)), [0.75, 1.3, -0.62], 36);
  return <ShopView pose={pose} S={N333(c, {knock: knockAt(c)})} fog={FOG_COLD} pups={dimaWithShadow(c, dm(T(c), {fear: 0.9, lookY: 1, blink: 0.45, tremble: 2.4}), COLD)} />;
};

// 23. easter egg: Dima keeps still, but his shadow on the glass turns its head and opens white eyes
export const S23: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.75, 1.4, 1.35], [0.7, 1.38, 1.1], k), hand(c.t, 23, 0.003)), [0.52, 1.22, -0.9], 52);
  const look = ramp(c.f, c.d * 0.25 * c.fps, c.d * 0.7 * c.fps, easeInOut);
  const me = dm(T(c), {fear: 0.9, lookY: 1, blink: 0.45, tremble: 1.5});
  return <ShopView pose={pose} S={N333(c)} fog={FOG_COLD}
    pups={[shadowPup('sh23', D[0], {...me, blink: look, turn: -look, tilt: -12 * look, lookY: 0, tremble: 0, smile: look * 0.6}, {opacity: 0.75}), dimaPup('d23', D, me, COLD)]} />;
};

// 24. 3:34 — the knocking stops
export const S24: React.FC<{c: Ctx}> = ({c}) => <ClockShot c={c} time="03:34" o={{lamps: 0.5, fridge: 1.2}} />;

// 25. four o'clock: the wall phone rings
export const S25: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.35, 1.55, 0.9], [1.7, 1.5, 0.45], k), hand(c.t, 25, 0.003)), [PHONE[0], PHONE[1] - 0.15, PHONE[2]], lerp(46, 36, k));
  const ring = (Math.floor(c.t * 2.5) % 2 === 0 ? 1 : 0);
  return <ShopView pose={pose} S={shop(c, {ring, lamps: 0.7, clock: '04:00'})} />;
};

// 26. Dima picks up the receiver and keeps silent, his hand over his mouth
const AT_PHONE: V3 = SPOT.phoneDima;
export const S26: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([1.75, 1.45, 0.55], hand(c.t, 26, 0.004)), [2.15, 1.35, -0.55], 44);
  return <ShopView pose={pose} S={shop(c, {receiver: false, lamps: 0.7})} pups={[dimaPup('d26', AT_PHONE, dm(T(c), {phone: ramp(c.f, 0, 10), cover: ramp(c.f, 18, 30), fear: 0.7, lookX: 0.5}), NIGHT)]} />;
};

// 27. mom crying in the receiver; tears in his eyes
export const S27: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add([2.15, 1.42, lerp(0.45, 0.3, k)], hand(c.t, 27, 0.003)), [2.2, 1.36, -0.55], lerp(36, 30, k));
  return <ShopView pose={pose} S={shop(c, {receiver: false, lamps: 0.7})} pups={[dimaPup('d27', AT_PHONE, dm(T(c), {phone: 1, cover: 1, fear: 0.9, tears: ramp(c.f, 10, 50), tremble: 1.2}), NIGHT)]} />;
};

// 28. he bites his lip, silent
export const S28: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([2.2, 1.32, 0.12], hand(c.t, 28, 0.002)), [2.2, 1.3, -0.55], 26);
  return <ShopView pose={pose} S={shop(c, {receiver: false, lamps: 0.7})} pups={[dimaPup('d28', AT_PHONE, dm(T(c), {phone: 1, fear: 0.9, tears: 1, mouth: 0, tremble: 1.5}), NIGHT)]} />;
};

// 29. the voice changes: his own voice. A hard push in, a glitch; his face goes stiff
export const S29: React.FC<{c: Ctx}> = ({c}) => {
  const z = easeOut(clamp(c.t / 0.35));
  const pose = cam(add([2.2, 1.4, lerp(0.7, 0.25, z)], hand(c.t, 29, 0.002)), [2.2, 1.36, -0.55], lerp(46, 32, z));
  const g = Math.max(0, kick(c.f, 2, c.fps, 6, 6)) * 0.8 + (c.t > c.d - 0.6 ? 0.4 : 0);
  return <ShopView pose={pose} S={shop(c, {receiver: false, lamps: 0.65})} look={{glitch: g, seed: c.f}}
    pups={[dimaPup('d29', AT_PHONE, dm(T(c), {phone: 1, fear: lerp(0.9, 0.1, ramp(c.f, 8, 20)), blink: 1, tears: 1, tremble: lerp(1.5, 0, ramp(c.f, 8, 20)), lookX: 0, lookY: 0}), DARK)]} />;
};

// 30. dial tone; the counter lamp dies
export const S30: React.FC<{c: Ctx}> = ({c}) => {
  const off = ramp(c.f, 4, 8);
  const pose = cam([1.85, 1.45, 0.45], [2.15, 1.3, -0.55], 46);
  return <ShopView pose={pose} S={shop(c, {receiver: false, lamps: lerp(0.65, 0.02, off), counter: lerp(1, 0, off), fridge: lerp(1, 0.4, off)})} exposure={0.85}
    pups={[dimaPup('d30', AT_PHONE, dm(T(c), {phone: 1, fear: 0.1, blink: 1}), {...DARK, bright: lerp(0.5, 0.12, off)})]} />;
};

// 31. six in the morning: dawn outside, the bell rings, Petrovich comes in and waves
export const S31: React.FC<{c: Ctx}> = ({c}) => {
  const open = ramp(c.f, 6, 18, easeOut) * (1 - ramp(c.f, 50, 62));
  const w = ramp(c.f, 8, c.d * c.fps - 4, easeInOut);
  const pose = cam(add([0.95, 1.5, -0.35], hand(c.t, 31, 0.004)), [1.0, 1.2, 3.6], 50);
  return <ShopView pose={pose} S={shop(c, {door: open, dawn: 1, lamps: 0.55, counter: 0.6, clock: '06:00', sign: 0})}
    pups={[petPup('p31', [1.0, Math.abs(Math.sin(c.t * 5)) * 0.01, lerp(4.2, 2.3, w)], pv(T(c), {wave: ramp(c.f, 30, 40), mouth: talk(c.t, 1.4, 2.4) * 0.6}), DAWN)]} />;
};

// 32. Dima almost cries with relief
export const S32: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.78, 1.42, 0.42], hand(c.t, 32, 0.003)), [0.75, 1.34, -0.62], 36);
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.55, counter: 0.6, clock: '06:01'})} pups={dimaWithShadow(c, dm(T(c), {smile: ramp(c.f, 4, 20), tears: 0.9, mouth: 0.25}), DAWN)} />;
};

// 33. Petrovich stops and looks at the floor in front of the counter
export const S33: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.7, 1.55, -0.3], [0.72, 1.6, -0.05], k), hand(c.t, 33, 0.003)), [0.85, 1.55, 0.85], lerp(48, 38, k));
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.55, counter: 0.6, clock: '06:01'})} pups={[petPup('p33', SPOT.buyer, pv(T(c), {lookY: ramp(c.f, 10, 26), sad: ramp(c.f, 20, 50)}), DAWN)]} />;
};

// 34. he takes his glasses off: «Касса закрыта, сынок»
export const S34: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.8, 1.6, -0.25], hand(c.t, 34, 0.003)), [0.85, 1.5, 0.82], 34);
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.5, counter: 0.6, clock: '06:01'})} pups={[petPup('p34', SPOT.buyer, pv(T(c), {glasses: ramp(c.f, 4, 18), sad: 1, lookY: 0.3, mouth: talk(c.t, 0.9, 2.2) * 0.5}), DAWN)]} />;
};

// 35. Dima looks down: no shadow under him (Petrovich's lies right there)
export const S35: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.55, 0.5, -0.05], [1.45, 0.45, -0.15], k), hand(c.t, 35, 0.003)), [0.78, 0.25, -0.62], 50);
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.5, counter: 0.9, clock: '06:02'})} pups={[dimaPup('d35', D, dm(T(c), {fear: 1, lookY: 1, tremble: 1}), DAWN)]} />;
};

// 36. along the fridge glass: dark silhouettes of shadows, many of them, with white eyes
export const S36: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam([lerp(-2.3, 0.3, k), 1.35, 0.85], [lerp(-2.0, 0.6, k), 1.1, FRIDGE.z], 52);
  const xs = [-2.6, -2.05, -1.45, -0.9, -0.35, 0.25, 0.8, 1.45];
  const ghosts: Pup[] = xs.map((x, i) => {
    const kind = i % 3;
    const o = {sil: true, blur: 2, opacity: 0.8, clips: [FRIDGE_GLASS], facing: 1 as const};
    const at: V3 = [x, 0, FRIDGE.z - 0.04];
    if (kind === 1) return {id: `g${i}`, at, ...o, draw: (_v, pid) => <Stas s={st(T(c), {smile: 0.6})} light={{bright: 0.02, warmRim: 0, coldRim: 0, cold: 0}} id={pid} />};
    return {id: `g${i}`, at, ...o, draw: (_v, pid) => <Dima s={dm(T(c) + i, {shade: 1, smile: 0.8, blink: 1, tilt: (i % 2 ? 1 : -1) * 10})} light={{bright: 1, warmRim: 0, coldRim: 0, cold: 0}} id={pid} />};
  });
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.45, fridge: 1.8, frost: 0.35, clock: '06:02'})} fog={FOG_COLD} pups={ghosts} />;
};

// 37. behind the counter stands his shadow in his vest, scanning Petrovich's bread
export const S37: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add([lerp(1.7, 0.1, k), 1.5, 1.55], hand(c.t, 37, 0.003)), [0.75, 1.3, -0.6], 50);
  const beep = c.f % 40 < 3 ? 1 : 0;
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.5, counter: 0.7, clock: '06:03'})}
    pups={[dimaPup('d37', D, dm(T(c), {shade: 1, smile: 1, hands: 0.35 + beep * 0.1, tilt: 6}), NIGHT), petPup('p37', SPOT.buyer, pv(T(c), {sad: 1}), DAWN)]} />;
};

// 38. outside, at dawn: Dima presses his palms to the glass; next to him the man in the coat. No shadows.
export const S38: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.75, 1.45, 0.2], [0.7, 1.42, 1.9], k), hand(c.t, 38, 0.003)), [0.6, 1.3, 4.0], lerp(56, 50, k));
  return <ShopView pose={pose} S={shop(c, {dawn: 1, lamps: 0.5, sign: 0, clock: '06:03'})}
    pups={[stasPup('s38', [0.12, 0, 4.2], st(T(c), {smile: 1}), DAWN, {cast: 0}),
      dimaPup('d38', [1.0, 0, 3.78], dm(T(c), {hands: 1, fear: 1, tremble: 2, mouth: 0.5}), DAWN, {facing: -1})]} />;
};

// 39. insert: the shadow's black hand crosses out «Дима» on the note
export const S39: React.FC<{c: Ctx}> = ({c}) => {
  const hd = ramp(c.f, 0, 20, easeOut), strike = ramp(c.f, 20, 44);
  const black = ramp(c.f, (c.d - 0.6) * c.fps, (c.d - 0.1) * c.fps);
  return (
    <AbsoluteFill>
      <NoteInsert focus={0} k={K(c)} t={c.t} strike={strike} hand={hd} dim={0.6} />
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

// ---------------- timeline (draft from the script; re-timed after the voice) ----------------
export const DRAFT = [0, 2.5, 4.5, 7.5, 10.5, 14, 16, 19.5, 23.5, 26, 28, 30.5, 33.5, 36, 39, 42, 44, 47.5, 50, 52, 55, 58, 61, 64, 67.5, 70, 72.5, 76.5, 79, 83.5, 85, 88, 90, 92.5, 95, 97.5, 101, 104, 108, 110];
const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39];
export const COLD_SHOTS = new Set(['S19', 'S20', 'S21', 'S22', 'S23', 'S24', 'S36']);
export const SHOTS = COMPS.map((C, i) => ({id: `S${String(i + 1).padStart(2, '0')}`, from: DRAFT[i], to: DRAFT[i + 1], C}));
export const EP_SEC = DRAFT[DRAFT.length - 1];
