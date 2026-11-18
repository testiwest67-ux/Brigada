// The 28 shots of «Кто лишний?». Cut times and the watchman's lips come from the voice (timing.ts).
// Everything happens in one 3D camp (Camp3D) with 2D puppets placed by the shot camera. At the campfire every
// puppet casts a long shadow on the sand away from the fire — except Olya (the answer of the puzzle).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, lerp, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose, project} from '../horror/cam';
import {TemaLight} from '../horror/Tema';
import {Rig} from '../elevator/rig';
import {Look} from '../elevator/post';
import {FONT} from '../horror/fonts';
import {Kid, KID_REST, KidState, LOOKS} from './Kid';
import {Grisha, GRISHA_REST, GrishaState} from './Grisha';
import {CAMP_REST, CampSet, CampState, FIRE, Mode, TABLE} from './Camp3D';
import {ChoiceCard, ListInsert} from './Inserts';
import {CUTS, GRISHA_LINES, mouthAt} from './timing';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);

// ---------- light for the puppets ----------
const DUSK: TemaLight = {bright: 0.95, warmRim: 0.8, coldRim: 0.3, cold: 0.1};
const DAY: TemaLight = {bright: 1.02, warmRim: 0.35, coldRim: 0.2, cold: 0};
const NIGHT: TemaLight = {bright: 0.62, warmRim: 0.1, coldRim: 0.75, cold: 0.55};
const PORCH: TemaLight = {bright: 0.85, warmRim: 0.9, coldRim: 0.4, cold: 0.25};
const FIREL: TemaLight = {bright: 0.9, warmRim: 1.0, coldRim: 0.25, cold: 0.15};
const DARK: TemaLight = {bright: 0.32, warmRim: 0, coldRim: 0.5, cold: 0.7};
const FOG: Record<Mode, [string, number]> = {day: ['#c9d6dc', 0.012], dusk: ['#3a2a38', 0.02], night: ['#05080f', 0.045], fire: ['#05070c', 0.05]};

// ---------- puppets ----------
const kid = (t: number, seed: number, o: Partial<KidState> = {}): KidState =>
  ({...KID_REST, t: t + seed, breathe: Math.sin((t + seed) * 2.6), blink: blinkAt(Math.round((t + seed * 0.37) * 30), [30 + seed * 7, 140 + seed * 5, 260 + seed * 3, 380 + seed * 6]), ...o});
const me = (t: number, o: Partial<KidState> = {}) => kid(t, 0.3, o);
const gr = (t: number, o: Partial<GrishaState> = {}): GrishaState =>
  ({...GRISHA_REST, t, breathe: Math.sin(t * 1.8), blink: blinkAt(Math.round(t * 30), [50, 170, 300, 420]), mouth: mouthAt(t, GRISHA_LINES), ...o});

type Pup = {id: string; at: V3; facing?: 1 | -1; fx?: 1 | -1; view?: 'front' | 'back'; draw: (view: 'front' | 'back', id: string) => React.ReactNode; opacity?: number; noShadow?: boolean};
const kPup = (id: string, look: string, at: V3, s: KidState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: 1, draw: (view, pid) => <Kid lk={LOOKS[look]} s={s} light={light} id={pid} view={view} tall={look === 'counsellor' ? 1 : 0} />, ...o});
const gPup = (id: string, at: V3, s: GrishaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: 1, draw: (view, pid) => <Grisha s={s} light={light} id={pid} view={view} />, ...o});

// a puppet's shadow thrown on the ground away from a light at `from` (the campfire): the drawing is sheared so
// its height runs along the projected ground direction; strength flickers with the fire
const FireShadow: React.FC<{pose: CamPose; p: Pup; from: V3; len: number; o: number; view: 'front' | 'back'}> = ({pose, p, from, len, o, view}) => {
  const dx = p.at[0] - from[0], dz = p.at[2] - from[2], n = Math.hypot(dx, dz) || 1;
  const A = project(pose, 1080, 1920, p.at), B = project(pose, 1080, 1920, [p.at[0] + (dx / n) * len, 0, p.at[2] + (dz / n) * len]);
  if (A.depth < 0.05 || B.depth < 0.05) return null;
  const vx = B.x - A.x, vy = B.y - A.y, vl = Math.hypot(vx, vy) || 1;
  const sc = A.pxPerM / 1000 * 0.9;
  const px = -vy / vl * sc, py = vx / vl * sc;     // across the shadow
  const H = 1500;                                    // puppet height in mm maps onto the shadow vector
  return (
    <g opacity={o} filter="url(#fsBlur)">
      <g transform={`matrix(${px} ${py} ${-vx / H} ${-vy / H} ${A.x} ${A.y})`}>
        <g filter="url(#fsSil)">{p.draw(view, `${p.id}fs`)}</g>
      </g>
    </g>
  );
};

const PupLayer: React.FC<{pose: CamPose; pups: Pup[]; fire?: {at: V3; len: number; o: number}; children?: React.ReactNode}> = ({pose, pups, fire, children}) => {
  const list = pups.map((p) => {
    let view: 'front' | 'back';
    if (p.view) view = p.view;
    else if (p.fx) view = (pose.pos[0] > p.at[0] ? 1 : -1) === p.fx ? 'front' : 'back';
    else view = (pose.pos[2] > p.at[2] ? 1 : -1) === (p.facing ?? 1) ? 'front' : 'back';
    return {p, view, depth: depthOf(pose, p.at)};
  }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
  return (
    <PuppetLayer>
      <defs>
        <filter id="fsSil" x="-50%" y="-50%" width="200%" height="200%">
          <feFlood floodColor="#000000" result="k" /><feComposite in="k" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="fsBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={1.5} /></filter>
      </defs>
      {fire && list.filter((x) => !x.p.noShadow).map(({p, view}) => <FireShadow key={`sh${p.id}`} pose={pose} p={p} from={fire.at} len={fire.len} o={fire.o} view={view} />)}
      {list.map(({p, view}) => <Puppet key={p.id} pose={pose} at={p.at} opacity={p.opacity ?? 1}>{p.draw(view, p.id)}</Puppet>)}
      {children}
    </PuppetLayer>
  );
};

const CampView: React.FC<{pose: CamPose; S: Partial<CampState> & {t: number}; pups?: Pup[]; look?: Look; exposure?: number; fire?: {len: number; o: number}; over?: React.ReactNode; children?: React.ReactNode}> =
  ({pose, S, pups = [], look, exposure, fire, over, children}) => {
    const st: CampState = {...CAMP_REST, ...S, cam: pose.pos};
    return (
      <AbsoluteFill>
        <Set3D>
          <Rig pose={pose} fog={FOG[st.mode]} look={look} exposure={exposure ?? (st.mode === 'day' ? 1.0 : 1.1)} />
          <CampSet S={st} />
        </Set3D>
        <PupLayer pose={pose} pups={pups} fire={fire ? {at: FIRE, ...fire} : undefined}>{children}</PupLayer>
        {over}
      </AbsoluteFill>
    );
  };

// big «№ · name» label for the four suspects
const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill'});
const Badge: React.FC<{n: number; name: string; t: number}> = ({n, name, t}) => {
  const k = clamp(t / 0.3);
  return (
    <div style={{position: 'absolute', top: 210, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: k, transform: `scale(${lerp(1.2, 1, k)})`}}>
      <div style={{width: 150, height: 150, borderRadius: 75, background: '#b03028', border: '7px solid #f2f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT, fontWeight: 900, fontSize: 104, color: '#f2f0ea', ...STROKE(6)}}>{n}</div>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 96, color: '#f2f0ea', letterSpacing: 4, ...STROKE(10)}}>{name}</div>
    </div>
  );
};

// ---------- the squad ----------
// the roll-call row, left to right (13 kids). Olya stands in the middle, nothing marks her.
const ROW = ['k5', 'lena', 'k6', 'vova', 'k7', 'k8', 'olya', 'k9', 'misha', 'k10', 'k11', 'k12', 'k13'];
const rowAt = (i: number): V3 => [-3.3 + i * 0.55, 0, 0];
const rowPups = (t: number, light: TemaLight, o: (i: number, look: string) => Partial<KidState> = () => ({})): Pup[] =>
  ROW.map((look, i) => kPup(`r${i}`, look, rowAt(i), kid(t, i + 1, {lookX: Math.sin(i * 1.7) * 0.2, ...o(i, look)}), light));
const ME: V3 = [0, 0, 3];  // where you stand at the roll call

// numbers popping over the heads while you count
const CountOver: React.FC<{pose: CamPose; n: number; redLast?: boolean}> = ({pose, n, redLast}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {ROW.slice(0, n).map((_, i) => {
      const P = project(pose, 1080, 1920, [rowAt(i)[0], 1.78, 0]);
      const red = redLast && i === 12;
      return <text key={i} x={P.x} y={P.y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={red ? 96 : 58} fill={red ? '#ff3030' : '#f2f0ea'}
        stroke="#05070c" strokeWidth={red ? 12 : 9} paintOrder="stroke">{i + 1}</text>;
    })}
  </svg>
);

// the campfire circle: everyone around the fire; the four suspects on the far side (facing the camera)
const SUSPECTS = ['vova', 'lena', 'misha', 'olya'];
const ring = (a: number, r = 2.0): V3 => [FIRE[0] + Math.cos(a) * r, 0, FIRE[2] + Math.sin(a) * r];
const SUS_AT = [-2.2, -1.9, -1.32, -1.6].map((a) => ring(a, 1.9));
const OTHERS: [string, number][] = [['k5', -2.95], ['k6', 3.0], ['k7', 2.55], ['k8', 0.15], ['k9', 0.6], ['k10', -1.02], ['k11', 2.15], ['k12', -2.62], ['k13', -2.5]];
const firePups = (t: number, light: TemaLight, sing: number, o: Partial<KidState> = {}): Pup[] => [
  ...SUSPECTS.map((look, i) => kPup(`s${i}`, look, SUS_AT[i], kid(t, i + 3, {sing, lookY: 0.15, ...o}), light, {facing: 1, noShadow: look === 'olya'})),
  ...OTHERS.map(([look, a], i) => {
    const at = ring(a, a > 0 ? 2.15 : 2.6);
    return kPup(`o${i}`, look, at, kid(t, i + 9, {sing, ...o}), light, {facing: Math.sin(a) > 0 ? -1 : 1});
  }),
];

// ================= the shots =================

// 1. dusk: the gate «ЛАСТОЧКА», the barrack and the flagpole behind it, the sunset over the forest
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.4, 1.5, 21.5], [0.1, 1.6, 18.5], k), hand(c.t, 1, 0.01)), [0, 2.4, 4], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'dusk', windows: 0.5}} look={{bloom: 0.9}}
    pups={rowPups(T(c), DUSK).filter((_, i) => i % 3 === 0)} />;
};

// 2. you, the counsellor: the whistle, the clipboard, the sunset behind you
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.5, 1.5, 0.9], [0.3, 1.52, 1.4], k), hand(c.t, 2, 0.004)), [0, 1.45, 4], 46);
  return <CampView pose={pose} S={{t: T(c), mode: 'dusk'}} pups={[kPup('me', 'counsellor', ME, me(T(c), {lookY: 0.3, smile: 0.3}), DUSK, {facing: -1})]} />;
};

// 3. insert: the list — «1 отряд — 12 чел.», twelve names
export const S03: React.FC<{c: Ctx}> = ({c}) => <ListInsert k={K(c)} t={c.t} />;

// 4. over your shoulder: you count the row… thirteen
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([4.3, 2.0, 4.6], [4.0, 1.95, 4.2], k), hand(c.t, 4, 0.004)), [-1.0, 0.9, 0], 50);
  const n = Math.min(13, Math.floor(ramp(c.f, 0.2 * c.fps, c.d * 0.92 * c.fps, (x) => x) * 13) + 1);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'dusk'}} pups={[...rowPups(T(c), DUSK), kPup('me', 'counsellor', [2.6, 0, 2.9], me(T(c)), DUSK, {facing: -1, view: 'back'})]}>
      <CountOver pose={pose} n={n} />
    </CampView>
  );
};

// 5. the recount, closer and faster — thirteen again, the last one in red
export const S05: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-4.6, 1.6, 3.6], [-4.3, 1.55, 3.2], k), hand(c.t, 5, 0.005)), [0.6, 1.0, 0], 52);
  const n = Math.min(13, Math.floor(ramp(c.f, 0.1 * c.fps, c.d * 0.7 * c.fps, (x) => x) * 13) + 1);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'dusk'}} pups={rowPups(T(c), DUSK, (i) => ({lookX: (0 - rowAt(i)[0]) * 0.1}))}>
      <CountOver pose={pose} n={n} redLast={n === 13} />
    </CampView>
  );
};

// 6. you read the list aloud; the hands go up one by one (12 of them — one never does)
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([4.2, 1.45, 3.0], [3.8, 1.45, 2.6], k), hand(c.t, 6, 0.004)), [-0.8, 1.0, 0.6], 50);
  const up = (i: number) => ramp(c.f, (0.15 + (i / 13) * 0.75) * c.d * c.fps, (0.15 + (i / 13) * 0.75) * c.d * c.fps + 6, easeOut);
  return <CampView pose={pose} S={{t: T(c), mode: 'dusk'}}
    pups={[...rowPups(T(c), DUSK, (i, look) => (look === 'olya' ? {smile: 0.3} : {wave: up(i) * (i % 2 ? 0.9 : 1), mouth: up(i) > 0 && up(i) < 1 ? 0.4 : 0})),
      kPup('me', 'counsellor', [1.8, 0, 2.6], me(T(c), {lookY: 0.5, lookX: -0.3}), DUSK, {facing: -1})]} />;
};

// 7. a slow move along the row of faces: no extra voice… but thirteen of them
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, (x) => x);
  const x = lerp(-3.4, 3.4, k);
  const pose = cam(add([x, 1.25, 1.35], hand(c.t, 7, 0.003)), [x + 0.4, 1.2, 0], 42);
  return <CampView pose={pose} S={{t: T(c), mode: 'dusk'}} pups={rowPups(T(c), DUSK, (i) => ({lookX: clamp((x - rowAt(i)[0]) * 0.6, -0.8, 0.8)}))} />;
};

// 8. your face: you can't tell who it is
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([0.05, 1.55, lerp(1.7, 2.0, k)], hand(c.t, 8, 0.002)), [0, 1.5, 4], 34);
  return <CampView pose={pose} S={{t: T(c), mode: 'dusk'}}
    pups={[kPup('me', 'counsellor', ME, me(T(c), {fear: 0.7, lookX: Math.sin(c.t * 2.2) * 0.6, lookY: 0.2, mouth: 0.1}), DUSK, {facing: -1})]} />;
};

// 9. night, the porch light: you on the porch; Uncle Grisha comes out of the dark with his lantern
const MEP: V3 = [0.45, 0.45, -3.35];
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps * 0.85, easeInOut);
  const g: V3 = [lerp(3.4, 1.2, w), 0, lerp(2.4, -1.9, w)];
  const pose = cam(add([0.45, 1.6, -3.3], hand(c.t, 9, 0.004)), [lerp(g[0], 1.0, 0.3), 1.25, g[2]], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'night', windows: 0.3}} look={{bloom: 1.0}}
    pups={[gPup('gr', g, gr(T(c), {torch: 1, lookX: -0.2}), PORCH, {facing: -1})]} />;
};

// 10–13. Grisha close: his three rules (fingers 1, 2, 3), the lantern lighting his face from below
const GAT: V3 = [1.2, 0, -1.9];
const grClose = (c: Ctx, fingers: number, seed: number, push = 0) => {
  const k = K(c);
  const pose = cam(add(mix3([0.75, 1.6, lerp(-3.55, -3.4, push)], [0.8, 1.6, -3.35], k), hand(c.t, seed, 0.003)), [1.4, 1.45, -1.9], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'night', windows: 0.3}} look={{bloom: 0.9}} pups={[gPup('gr', GAT, gr(T(c), {fingers, narrow: 0.5, lookX: -0.3}), PORCH, {facing: -1})]} />;
};
export const S10: React.FC<{c: Ctx}> = ({c}) => grClose(c, 0, 10);
export const S11: React.FC<{c: Ctx}> = ({c}) => grClose(c, 1, 11);
export const S12: React.FC<{c: Ctx}> = ({c}) => grClose(c, 2, 12, 0.5);
// 13. three — then over your shoulder: «…только без одного из твоих»
export const S13: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add(mix3([0.9, 1.62, -3.45], [1.0, 1.62, -3.05], k), hand(c.t, 13, 0.003)), [1.35, 1.45, -1.9], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'night', windows: 0.3}} look={{bloom: 0.9}}
    pups={[gPup('gr', GAT, gr(T(c), {fingers: 3, narrow: 0.7, lookX: -0.4}), PORCH, {facing: -1})]} />;
};

// 14. day: you look at the squad differently — kids everywhere on the ground, you in the foreground
export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-1.4, 1.75, 6.2], [-1.0, 1.7, 5.6], k), hand(c.t, 14, 0.004)), [0.3, 0.9, 0], 52);
  const spots: V3[] = [[-2.5, 0, -0.5], [-1.2, 0, 0.8], [0.2, 0, -0.8], [1.4, 0, 0.5], [2.6, 0, -0.3], [-0.6, 0, -2], [1.8, 0, -1.8], [3.4, 0, 1.2], [-3.2, 0, 1.4], [0.8, 0, 1.9]];
  const looks = ['k5', 'vova', 'k6', 'lena', 'k7', 'k8', 'misha', 'k9', 'olya', 'k10'];
  return <CampView pose={pose} S={{t: T(c), mode: 'day'}}
    pups={[...looks.map((lk, i) => kPup(`d${i}`, lk, spots[i], kid(T(c), i + 2, {smile: lk === 'olya' ? 0.5 : (i % 3) * 0.3, wave: i === 4 ? 1 : 0, lookX: lk === 'olya' ? 0.5 : Math.sin(i) * 0.5}), DAY, {facing: i % 4 === 1 ? -1 : 1})),
      kPup('me', 'counsellor', [-0.8, 0, 4.4], me(T(c)), DAY, {view: 'back'})]} />;
};

// 15. №1 Vova at the canteen table: everyone eats, his plate untouched
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const [x, , z] = TABLE;
  const pose = cam(add(mix3([x - 0.4, 1.35, z + 2.6], [x - 0.2, 1.3, z + 2.1], k), hand(c.t, 15, 0.003)), [x, 1.05, z - 0.6], 44);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'day'}}
      pups={[kPup('v', 'vova', [x, 0, z - 0.75], kid(T(c), 3, {lookY: 0.8, lookX: 0.2}), DAY, {facing: 1}),
        kPup('a', 'k6', [x - 0.9, 0, z - 0.75], kid(T(c), 5, {lookY: 0.7, mouth: Math.abs(Math.sin(c.t * 5)) * 0.4}), DAY),
        kPup('b', 'k11', [x + 0.9, 0, z - 0.75], kid(T(c), 7, {lookY: 0.7, mouth: Math.abs(Math.sin(c.t * 4 + 1)) * 0.4}), DAY)]} over={<Badge n={1} name="ВОВА" t={c.t} />} />
  );
};

// 16. №2 Lena greets everyone by name; nobody remembers her arriving
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.6, 1.4, 1.8], [-0.9, 1.4, 1.3], k), hand(c.t, 16, 0.003)), [-2.2, 1.1, -1.2], 46);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'day'}}
      pups={[kPup('l', 'lena', [-2.2, 0, -1.2], kid(T(c), 4, {smile: 1, wave: 1, lookX: -0.5}), DAY),
        kPup('a', 'k7', [-3.4, 0, -0.6], kid(T(c), 6, {lookX: 0.6, fear: 0.2}), DAY, {facing: 1}),
        kPup('b', 'k8', [-1.2, 0, -2.2], kid(T(c), 8, {lookX: -0.5}), DAY)]} over={<Badge n={2} name="ЛЕНА" t={c.t} />} />
  );
};

// 17. №3 Misha comes back from the lake at midnight: wet hair, the towel, the moon on the water
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const w = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([-6.2, 1.35, 1.4], [-6.5, 1.3, 0.9], k), hand(c.t, 17, 0.004)), [-9.5, 1.0, -1.6], 46);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'night'}} look={{bloom: 1.0}}
      pups={[kPup('m', 'misha', [lerp(-10.6, -8.4, w), lerp(0.29, 0, clamp(w * 1.4 - 0.2)), -1.5], kid(T(c), 9, {lookX: 0.5, lookY: 0.2}), NIGHT, {fx: 1})]} over={<Badge n={3} name="МИША" t={c.t} />} />
  );
};

// 18. №4 Olya: quiet, ordinary, always right next to you
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.4, 1.4, 6.0], [0.35, 1.45, 5.4], k), hand(c.t, 18, 0.003)), [0.3, 1.25, 3], 42);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'dusk'}}
      pups={[kPup('me', 'counsellor', ME, me(T(c), {lookX: 0.6, lookY: 0.5, fear: 0.25}), DUSK),
        kPup('o', 'olya', [0.62, 0, 3.15], kid(T(c), 2, {smile: 0.6, lookX: -0.7, lookY: -0.5}), DUSK)]} over={<Badge n={4} name="ОЛЯ" t={c.t} />} />
  );
};

// 19. the last evening: the campfire, everyone around it, singing
export const S19: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([FIRE[0] + 0.8, 2.7, FIRE[2] + 6.6], [FIRE[0] + 0.3, 2.3, FIRE[2] + 5.4], k), hand(c.t, 19, 0.005)), [FIRE[0], 0.8, FIRE[2] - 0.5], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'fire', fire: 1}} look={{bloom: 1.2}} fire={{len: 2.6, o: 0.55}}
    pups={[...firePups(T(c), FIREL, 1), gPup('gr', ring(1.2, 3.1), gr(T(c), {torch: 0.3}), FIREL, {facing: -1, noShadow: false}), kPup('me', 'counsellor', ring(1.85, 3.0), me(T(c), {lookX: -0.3}), FIREL, {facing: -1})]} />;
};

// 20. Grisha leans in and whispers: «Смотри на тени.»
export const S20: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const g = ring(1.2, 3.1);
  const pose = cam(add([g[0] - 0.75, 1.65, g[2] + lerp(1.35, 1.15, k)], hand(c.t, 20, 0.002)), [g[0] - 0.1, 1.55, g[2]], 34);
  return <CampView pose={pose} S={{t: T(c), mode: 'fire', fire: 1}} look={{bloom: 1.1}}
    pups={[gPup('gr', g, gr(T(c), {hush: 1, narrow: 0.7, torch: 0.3, lookX: -0.6}), FIREL, {view: 'front'})]} />;
};

// 21. THE CLUE: across the flames, the four suspects on the far side; long shadows on the sand behind them —
// Vova, Lena, Misha have one. Olya has none.
const clueCam = (c: Ctx, k: number) => {
  const tilt = ramp(k, 0.45, 1, easeInOut);
  return cam(add(mix3([FIRE[0] - 0.1, 3.0, FIRE[2] - 6.6], [FIRE[0] - 0.1, 3.7, FIRE[2] - 6.0], tilt), hand(c.t, 21, 0.004)), [FIRE[0] - 0.1, lerp(1.0, 0.25, tilt), lerp(FIRE[2] - 0.4, FIRE[2] - 2.4, tilt)], 56);
};
export const S21: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const t = T(c), fl = 0.85 + 0.15 * Math.sin(t * 11) + 0.06 * Math.sin(t * 23);
  const flare = Math.pow(Math.max(0, Math.sin(t * 2.3)), 6);
  return <CampView pose={clueCam(c, k)} S={{t, mode: 'fire', fire: 1}} look={{bloom: 1.1}} fire={{len: 3.0 * fl, o: 0.4 + 0.45 * flare}}
    pups={firePups(t, FIREL, 0.6, {lookY: 0.4})} />;
};

// 22. the fire goes out: darkness, smoke
export const S22: React.FC<{c: Ctx}> = ({c}) => {
  const out = ramp(c.f, 4, 14, easeOut);
  const t = T(c);
  return <CampView pose={clueCam(c, 1)} S={{t, mode: 'fire', fire: 1 - out}} exposure={lerp(1.1, 0.8, out)} fire={{len: 3.0, o: 0.5 * (1 - out)}}
    pups={firePups(t, {...FIREL, bright: lerp(0.9, 0.25, out), warmRim: 1 - out}, 0, {fear: out * 0.6, lookY: 0})} />;
};

// 23. in the dark someone takes your hand: a small cold palm
export const S23: React.FC<{c: Ctx}> = ({c}) => {
  const grab = ramp(c.f, c.d * c.fps * 0.25, c.d * c.fps * 0.45, easeOut);
  const at = ring(2.2, 2.8);
  const pose = cam(add([at[0] - 0.2, 1.4, at[2] + 1.6], hand(c.t, 23, 0.003)), [at[0] - 0.3, 1.2, at[2]], 44);
  const H = project(pose, 1080, 1920, [at[0] - 0.47, 0.95, at[2] + 0.02]);
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'fire', fire: 0}} exposure={0.8}
      pups={[kPup('me', 'counsellor', at, me(T(c), {reach: 1, fear: 0.4 + grab * 0.6, lookX: -0.8, lookY: 0.4, tremble: grab * 3}), DARK, {view: 'front'})]}>
      {/* a small pale hand coming out of the dark from the left and closing on his */}
      <g transform={`translate(${H.x - lerp(260, 40, grab)} ${H.y + 10}) scale(${H.pxPerM / 1000 * 1.1})`} opacity={0.35 + grab * 0.6}>
        <path d="M -600 -30 C -300 -40 -120 -40 -30 -20 L -30 40 C -120 60 -300 50 -600 50 Z" fill="#d9d4d0" />
        <ellipse cx={0} cy={6} rx={42} ry={40} fill="#e6ddd6" stroke="#14121c" strokeWidth={7} />
        {[-22, -7, 8, 23].map((fx) => <rect key={fx} x={18} y={fx - 8} width={lerp(40, 22, grab)} height={16} rx={8} fill="#e6ddd6" stroke="#14121c" strokeWidth={5} />)}
      </g>
    </CampView>
  );
};

// 24. pitch dark. Two pale child eyes at your side: «Вожатый… а ты нас посчитал?»
export const S24: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const open = ramp(c.f, 6, 16, easeOut) * (1 - ramp(c.f, c.d * c.fps - 10, c.d * c.fps));
  return (
    <AbsoluteFill style={{background: '#020205'}}>
      <svg width={1080} height={1920}>
        <defs><radialGradient id="eyeglow"><stop offset="0" stopColor="#9fb0c8" stopOpacity={0.25} /><stop offset="1" stopColor="#9fb0c8" stopOpacity={0} /></radialGradient></defs>
        <g transform={`translate(540 ${lerp(860, 840, k)}) scale(${lerp(1.0, 1.15, k)})`}>
          <ellipse cx={0} cy={0} rx={420} ry={240} fill="url(#eyeglow)" opacity={open} />
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 130} 0)`}>
              <ellipse cx={0} cy={0} rx={92} ry={110 * open} fill="#d8dcdf" stroke="#14121c" strokeWidth={8} />
              <circle cx={sd * -8} cy={6} r={52 * open} fill="#6a7f98" />
              <circle cx={sd * -8} cy={6} r={20 * open} fill="#05060a" />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 25. before dawn: the forest edge; a small figure walks into the trees alone
export const S25: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps, (x) => x);
  const pose = cam(add([-1.2, 1.4, -8.6], hand(c.t, 25, 0.004)), [-2.2, 1.0, -15], 50);
  return <CampView pose={pose} S={{t: T(c), mode: 'night', windows: 0}} exposure={0.9}
    pups={[kPup('w', 'k9', [-2.0, 0, lerp(-11, -14.2, w)], kid(T(c), 4), {bright: 0.12, warmRim: 0, coldRim: 0.6, cold: 0.9}, {view: 'back', opacity: 1 - ramp(c.f, c.d * c.fps * 0.7, c.d * c.fps)})]} />;
};

// 26. the four in a row: 1 · 2 · 3 · 4
export const S26: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0, 1.3, 6.4], [0, 1.3, 5.8], k), hand(c.t, 26, 0.003)), [0, 1.0, 0], 44);
  const at = (i: number): V3 => [-1.2 + i * 0.8, 0, 0];
  return (
    <CampView pose={pose} S={{t: T(c), mode: 'dusk'}}
      pups={SUSPECTS.map((lk, i) => kPup(`q${i}`, lk, at(i), kid(T(c), i + 2, {lookX: 0, lookY: 0, smile: lk === 'olya' ? 0.4 : 0}), DUSK))}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {SUSPECTS.map((_, i) => {
          const P = project(pose, 1080, 1920, [at(i)[0], 1.85, 0]);
          const pop = clamp((c.t - i * 0.18) * 5);
          return <text key={i} x={P.x} y={P.y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120 * lerp(0.5, 1, pop)} fill="#f2f0ea" stroke="#05070c" strokeWidth={14} paintOrder="stroke" opacity={pop}>{i + 1}</text>;
        })}
      </svg>
    </CampView>
  );
};

// 27. the campfire again — «Пересмотри костёр. Подсказка там.» (a quick glitchy flashback of the wide shot)
export const S27: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const t = T(c);
  const pose = cam(add(mix3([FIRE[0] + 0.8, 2.7, FIRE[2] + 6.4], [FIRE[0] + 0.5, 2.5, FIRE[2] + 5.6], k), hand(c.t, 27, 0.006)), [FIRE[0], 0.8, FIRE[2] - 0.5], 50);
  const gl = Math.max(0, Math.sin(c.t * 9)) > 0.92 ? 0.6 : 0.12;
  return <CampView pose={pose} S={{t, mode: 'fire', fire: 1}} look={{bloom: 1.2, glitch: gl, seed: c.f, sepia: 0.35}} fire={{len: 2.6, o: 0.55}}
    pups={firePups(t, FIREL, 1)} />;
};

// 28. the choice card over the dark forest; far away a lantern blinks once
export const S28: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const lan = clamp(Math.sin(clamp((c.t - 1.2) / 1.6) * Math.PI));
  const pose = cam(add([-1.2, 1.4, -6.5], hand(c.t, 28, 0.003)), [-2.6, 1.3, -16], 46);
  return (
    <AbsoluteFill>
      <CampView pose={pose} S={{t: T(c), mode: 'night', windows: 0, lantern: lan}} exposure={0.75} look={{bloom: 1.3}} />
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.35)'}} />
      <ChoiceCard k={k} t={c.t} />
    </AbsoluteFill>
  );
};

// ---------------- timeline ----------------
const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28];
export const COLD_SHOTS = new Set(['S09', 'S10', 'S11', 'S12', 'S13', 'S17', 'S23', 'S24', 'S25', 'S28']);
export const NO_FOG = new Set(['S03', 'S24']);
const KEY: Record<string, number> = {S04: 0.9, S05: 0.9, S06: 0.8, S09: 0.8, S21: 0.7, S22: 0.6, S23: 0.7, S24: 0.5, S26: 0.8, S28: 0.8};
export const SHOT_NAMES = [
  'ворота «Ласточка», закат', 'ты, вожатый', 'список: 12 чел.', 'считаешь: 13', 'пересчёт: 13', 'список вслух, руки', 'лица по ряду', 'не понять, кто',
  'ночь: сторож с лампой', '«Тоже насчитал лишнего?»', 'правило 1', 'правило 2', 'правило 3', 'день: смотришь на отряд', '№1 Вова не ест',
  '№2 Лена всех знает', '№3 Миша с озера', '№4 Оля рядом', 'костёр, все поют', '«Смотри на тени»', 'ПОДСКАЗКА: тени', 'костёр гаснет',
  'холодная ладонь', '«а ты нас посчитал?»', 'ребёнок уходит в лес', '1 · 2 · 3 · 4', 'костёр ещё раз', 'карточка выбора'];
export const SHOTS = COMPS.map((C, i) => {
  const id = `S${String(i + 1).padStart(2, '0')}`;
  const from = CUTS[i], to = CUTS[i + 1];
  return {id, from, to, C, key: from + (to - from) * (KEY[id] ?? 0.55)};
});
export const EP_SEC = CUTS[CUTS.length - 1];
