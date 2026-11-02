// The 18 shots of «Лишний этаж». Times are the draft from the script; after the voice they get tied to the words.
// Every lift shot = the 3D world (with its mirror copy) + 2D puppets. A puppet on the other side of the mirror
// or of the lift doors from the camera is clipped to that portal automatically.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose, project} from '../horror/cam';
import {Tema, TemaLight} from '../horror/Tema';
import {Mom} from '../horror/chars';
import {Alisa, AlisaState, ALISA_REST} from './Alisa';
import {BUTTON, CAB, COR, DOOR_GAP, LiftSet, LiftState, MIR, MIRROR_QUAD} from './Lift3D';
import {MACH, Machine3D, Misha} from './Misha';
import {ClipQuad, Rig} from './rig';
import {Look} from './post';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const talk = (t: number, a: number, b: number) => (t > a && t < b ? clamp(0.35 + 0.45 * Math.sin(t * 15) + 0.2 * Math.sin(t * 23)) : 0);

export const al = (t: number, o: Partial<AlisaState> = {}): AlisaState =>
  ({...ALISA_REST, t, breathe: Math.sin(t * 4.2), blink: blinkAt(Math.round(t * 30), [40, 115, 190, 260, 330, 420]), tremble: 0.6, fear: 0.5, ...o});
const LIFT = (lamp: number): TemaLight => ({bright: 0.32 + 0.6 * lamp, warmRim: 0.12, coldRim: 0.7, cold: 0.6});
const RED: TemaLight = {bright: 0.55, warmRim: 1, coldRim: 0.15, cold: 0.15};
const WARM: TemaLight = {bright: 0.85, warmRim: 0.8, coldRim: 0.2, cold: 0.1};
const SEPIA: TemaLight = {bright: 0.85, warmRim: 0.7, coldRim: 0.1, cold: 0};
const FOG13: [string, number] = ['#1c0806', 0.2];
const FOGLIFT: [string, number] = ['#0a0d0c', 0.1];

// fluorescent tube flicker: mostly on, short dropouts at given frames
const flick = (g: number, drops: number[] = []) => {
  const r = mulberry32(Math.floor(g / 2) + 5)();
  let v = 0.86 + (r - 0.5) * 0.08;
  for (const d of drops) if (g >= d && g <= d + 3) v = 0.12 + r * 0.15;
  return v;
};
const lift = (c: Ctx, o: Partial<LiftState> = {}): LiftState =>
  ({t: T(c), lamp: flick(c.g, [20, 47, 190, 470, 610, 655]), doors: 0, disp: '13', dispOn: 1, btn: [12, 13], floor: 13, apt: 0.12, aptLight: 0.7, corLamp: flick(c.g + 9, [400, 520, 760]) * 0.9, ...o});

// ---------- puppets in the lift world ----------
type Side = 'M' | 'C' | 'L';
const sideOf = (z: number): Side => (z < CAB.mirrorZ ? 'M' : z <= CAB.front + 0.05 ? 'C' : 'L');
type Pup = {
  id: string; at: V3;
  facing?: 1 | -1;              // +1 = faces the doors (+z)
  flip?: number;                // paper-turn / mirror image (negative = mirrored)
  draw: (view: 'front' | 'back', id: string) => React.ReactNode;
  clips?: V3[][]; opacity?: number; shadow?: number;
};
const LiftView: React.FC<{pose: CamPose; S: LiftState; pups?: Pup[]; fog?: [string, number]; look?: Look; exposure?: number; children?: React.ReactNode}> = ({pose, S, pups = [], fog = FOGLIFT, look, exposure, children}) => {
  const cs = sideOf(pose.pos[2]);
  const list = pups.map((p) => {
    const ps = sideOf(p.at[2]);
    const q: V3[][] = [...(p.clips ?? [])];
    if ((cs === 'M') !== (ps === 'M')) q.push(MIRROR_QUAD);
    if ((ps === 'L') !== (cs === 'L')) q.push(DOOR_GAP(S.doors));
    const sees = pose.pos[2] > p.at[2] ? 1 : -1;
    const view: 'front' | 'back' = sees === (p.facing ?? 1) ? 'front' : 'back';
    return {p, q, view, depth: depthOf(pose, p.at)};
  }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
  return (
    <AbsoluteFill>
      <Set3D>
        <Rig pose={pose} fog={fog} look={look} exposure={exposure} />
        <LiftSet S={S} />
      </Set3D>
      <PuppetLayer>
        <defs>{list.map(({p, q}) => q.map((quad, k) => <ClipQuad key={`${p.id}${k}`} id={`${p.id}-q${k}`} pose={pose} quad={quad} />))}</defs>
        {list.map(({p, q, view}) => {
          let node = (
            <Puppet key={p.id} pose={pose} at={p.at} flip={p.flip ?? 1} opacity={p.opacity ?? 1} shadow={p.shadow ?? 0}>
              {p.draw(view, p.id)}
            </Puppet>
          );
          q.forEach((_, k) => { node = <g key={`${p.id}c${k}`} clipPath={`url(#${p.id}-q${k})`}>{node}</g>; });
          return node;
        })}
        {children}
      </PuppetLayer>
    </AbsoluteFill>
  );
};
const alisaPup = (id: string, at: V3, s: AlisaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: 1, draw: (view, pid) => <Alisa s={s} light={light} id={pid} view={view} />, ...o});
// the mirror image of someone standing at `at` and facing +z: mirrored position, faces -z, flipped
const imagePup = (id: string, at: V3, s: AlisaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  alisaPup(id, MIR(at), s, light, {facing: -1, flip: -1, ...o});

const AL: V3 = [0.05, 0, -0.1];
const AL_SIT: V3 = [0, 0, -0.27];
const DISP_POSE = (k: number, sh = 0) => cam([sh, lerp(1.82, 1.9, k), lerp(0.05, 0.2, k)], [0, CAB.doorH + 0.1, CAB.front], lerp(40, 30, k));

// ---------------- 1. the display: 11 … 12 … 13 ----------------
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const disp = c.t < 0.75 ? '11' : c.t < 1.5 ? '12' : '13';
  const sh = kick(c.f, 1.5 * c.fps, c.fps, 9, 5) * 0.012;
  return <LiftView pose={DISP_POSE(k, sh)} S={lift(c, {disp, lamp: 0.45 * flick(c.g, [20, 47]), dispOn: disp === '13' ? 0.7 + 0.3 * Math.sin(c.t * 40) : 1})} look={{bloom: 0.6}} exposure={0.85} />;
};

// ---------------- 2. Alisa's face: the lift came to 13 ----------------
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const z = easeOut(clamp(c.t / 0.3));
  const pose = cam(add([0.12, 1.22, 0.56], hand(c.t, 2, 0.006)), [0.05, 1.2, -0.1], lerp(68, 54, z));
  const S = lift(c, {disp: '13'});
  const s = al(c.t, {fear: lerp(0.2, 1, ramp(c.f, 3, 10)), mouth: lerp(0.1, 0.45, ramp(c.f, 4, 12)), lookY: -0.15, tremble: 1.4});
  return <LiftView pose={pose} S={S} pups={[alisaPup('a2', AL, s, LIFT(S.lamp))]} />;
};

// ---------------- 3 + 4. flashback: Ded Misha in the machine room (sepia) ----------------
const MachineView: React.FC<{c: Ctx; pose: CamPose; misha: Partial<React.ComponentProps<typeof Misha>['s']>; kids?: boolean; look?: Look}> = ({c, pose, misha, kids, look}) => {
  const t = T(c);
  const ms = {t, blink: blinkAt(c.g, [160, 260, 330]), mouth: 0, finger: 0, lookX: 0, narrow: 0.3, breathe: Math.sin(t * 2), torch: 0.9 + 0.1 * Math.sin(t * 30), ...misha};
  const tm = {t, blink: 1, lookX: 0, lookY: 0, fear: 0.3, mouth: 0, breathe: Math.sin(t * 3), hands: 0, turn: 0.2, tremble: 0};
  const pups = [
    {k: 'm', at: MACH.misha, node: <Misha s={ms} light={SEPIA} id="misha" />},
    ...(kids ? [
      {k: 'ka', at: [0.3, 0, 0.45] as V3, node: <Alisa s={al(t, {fear: 0.2})} light={{...SEPIA, bright: 0.55}} id="kida" view="back" />},
      {k: 'kt', at: [-0.12, 0, 0.75] as V3, node: <Tema s={tm} light={{...SEPIA, bright: 0.55}} id="kidt" view="back" />},
    ] : []),
  ].map((p) => ({...p, depth: depthOf(pose, p.at)})).filter((p) => p.depth > 0.05).sort((a, b) => b.depth - a.depth);
  return (
    <AbsoluteFill>
      <Set3D>
        <Rig pose={pose} fog={['#120d08', 0.1]} look={{sepia: 1, bloom: 0.6, ...look}} />
        <Machine3D t={t} torch={ms.torch} />
      </Set3D>
      <PuppetLayer style={{filter: 'sepia(0.85) saturate(0.8)'}}>
        {pups.map((p) => <Puppet key={p.k} pose={pose} at={p.at} shadow={0.3}>{p.node}</Puppet>)}
      </PuppetLayer>
    </AbsoluteFill>
  );
};
export const S03: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([0.25, 1.95, 1.9], [0.05, 1.9, 1.75], k), hand(c.t, 4)), mix3([0.7, 2.7, -1.3], [-0.12, 0.95, -0.55], k), 52);
  return <MachineView c={c} pose={pose} misha={{lookX: 0.3}} kids />;
};
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const nev = 2.7; // «никогда»
  const g = Math.max(0, kick(c.f, nev * c.fps, c.fps, 6, 6)) * 0.9;
  const pose = cam(add(mix3([-0.2, 1.6, 0.55], [-0.24, 1.62, 0.2], k), hand(c.t, 5)), [-0.25, 1.58, -0.55], lerp(44, 36, k));
  return <MachineView c={c} pose={pose} misha={{finger: ramp(c.f, 6, 18, easeOut), mouth: talk(c.t, 0.3, 4.9), narrow: 0.5 + 0.3 * ramp(c.f, nev * 30, nev * 30 + 6)}} look={{glitch: g, seed: c.f}} />;
};

// ---------------- 5. the doors open: your floor, your door, red light ----------------
export const S05: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([0.3, 1.62, -0.55], [0.27, 1.6, -0.42], k), hand(c.t, 6)), [0.05, 1.15, 3.0], 52);
  const S = lift(c, {doors: ramp(c.f, 6, 42, easeInOut)});
  return <LiftView pose={pose} S={S} fog={FOG13} pups={[alisaPup('a5', [0.1, 0, -0.12], al(c.t, {fear: 0.6}), {...LIFT(S.lamp), coldRim: 1, bright: 0.6})]} />;
};

// ---------------- 6. the flat door is ajar, mom calls ----------------
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([0.05, 1.35, 0.3], [0.05, 1.32, 0.52], k), hand(c.t, 7, 0.004)), [0.1, 1.1, COR.z1], lerp(34, 26, k));
  const S = lift(c, {doors: 1, apt: 0.38, aptLight: 1});
  const ang = S.apt * 1.1, edgeX = -COR.door.w / 2 + COR.door.w * Math.cos(ang);
  const gap: V3[] = [[edgeX, 0, COR.z1], [COR.door.w / 2, 0, COR.z1], [COR.door.w / 2, COR.door.h, COR.z1], [edgeX, COR.door.h, COR.z1]];
  const momX = lerp(0.5, -0.1, ramp(c.f, 10, 70));
  const mom = {id: 'mom6', at: [momX, 0, COR.z1 + 0.7] as V3, clips: [gap], facing: -1 as const,
    draw: () => <Mom s={{t: T(c), blink: 1, worry: 0, mouth: talk(c.t, 0.2, 2.4), breathe: 0, knock: 0, shiver: 0}} light={{bright: 0.12, warmRim: 1, coldRim: 0, cold: 0}} id="mom6" />};
  return <LiftView pose={pose} S={S} fog={['#1c0806', 0.1]} pups={[mom]} />;
};

// ---------------- 7. pressing «1»: the button stays dead ----------------
const PRESS = [0.35, 1.05, 1.6, 2.15, 2.6];
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  const shake = PRESS.reduce((a, p) => a + kick(c.f, p * c.fps, c.fps, 8, 9), 0);
  const pose = cam(add([0.26, 1.16, 0.12], [0, shake * 0.004, 0]), [0.55, 1.07, 0.3], 36);
  const S = lift(c, {doors: 1, btn: [13], lamp: flick(c.g, [600, 640, 660, 680])});
  const P = project(pose, 1080, 1920, BUTTON(1));
  const press = PRESS.reduce((a, p) => Math.max(a, Math.exp(-Math.pow((c.t - p) / 0.09, 2))), 0);
  const fx = P.x - 30 - 60 * (1 - press), fy = P.y + 40 + 90 * (1 - press);
  return (
    <LiftView pose={pose} S={S} fog={FOG13}>
      {/* finger + sleeve coming from the bottom left */}
      <g transform={`translate(${fx} ${fy}) rotate(-38)`}>
        <rect x={-120} y={60} width={240} height={900} rx={110} fill="#7a2236" stroke="#14121c" strokeWidth={10} />
        <ellipse cx={0} cy={80} rx={95} ry={110} fill="#d9a88c" stroke="#14121c" strokeWidth={10} />
        <rect x={-34} y={-150} width={68} height={210} rx={34} fill="#e8b89a" stroke="#14121c" strokeWidth={10} />
        <rect x={-20} y={-140} width={40} height={36} rx={12} fill="#f3d6c8" />
      </g>
    </LiftView>
  );
};

// ---------------- 8. the flat door opens: a girl steps out ----------------
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([-0.3, 1.5, -0.55], hand(c.t, 8)), [0.08, 1.12, 4.1], 40);
  const S = lift(c, {doors: 1, apt: lerp(0.16, 0.95, ramp(c.f, 4, 45, easeInOut)), aptLight: 1});
  const w = ramp(c.f, 30, 75, easeInOut);
  const dz = lerp(4.6, 3.95, w);
  const dbl = alisaPup('d8', [0.05, 0, dz], al(c.t, {uncanny: 1, fear: 0, blink: 1, tremble: 0, breathe: 0}), {bright: 0.18, warmRim: 1, coldRim: 0.1, cold: 0},
    {facing: -1, clips: dz > COR.z1 - 0.05 ? [[[-0.45, 0, COR.z1], [0.45, 0, COR.z1], [0.45, COR.door.h, COR.z1], [-0.45, COR.door.h, COR.z1]]] : []});
  return <LiftView pose={pose} S={S} fog={FOG13} pups={[dbl, alisaPup('a8', [0.1, 0, -0.08], al(c.t, {fear: 0.9}), {...LIFT(S.lamp), coldRim: 1})]} />;
};

// ---------------- 9. her face: your hoodie, your face ----------------
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeOut);
  const pose = cam(mix3([0.05, 1.22, 2.6], [0.05, 1.22, 2.95], k), [0.05, 1.2, 3.95], lerp(44, 38, k));
  const S = lift(c, {doors: 1, apt: 0.95, aptLight: 1});
  const s = al(c.t, {uncanny: 1, fear: 0, blink: 1, tremble: 0, breathe: 0, smile: ramp(c.f, 12, 50, easeInOut)});
  return <LiftView pose={pose} S={S} fog={FOG13} pups={[alisaPup('d9', [0.05, 0, 3.95], s, {...RED, bright: 0.5}, {facing: -1})]} />;
};

// ---------------- 10. she walks to the lift; Alisa backs into the mirror ----------------
export const S10: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add([0.2, 1.5, lerp(-0.5, -0.56, k)], hand(c.t, 9)), [0.05, 1.12, 2.0], 52);
  const S = lift(c, {doors: 1, apt: 0.95, aptLight: 1});
  const dz = lerp(3.9, 1.55, k), bob = Math.abs(Math.sin(c.t * 5)) * 0.015;
  const dbl = alisaPup('d10', [0.03, bob, dz], al(c.t, {uncanny: 1, smile: 1, fear: 0, blink: 1, tremble: 0}), {...RED, bright: 0.45}, {facing: -1});
  const me = alisaPup('a10', [-0.26, 0, lerp(-0.05, -0.3, k)], al(c.t, {fear: 1, tremble: 2.2, hands: 0.3}), LIFT(S.lamp));
  return <LiftView pose={pose} S={S} fog={FOG13} pups={[dbl, me]} />;
};

// ---------------- 11. the doors close at the last moment ----------------
export const S11: React.FC<{c: Ctx}> = ({c}) => {
  const close = ramp(c.f, 8, 44, (x) => x * x);
  const bang = kick(c.f, 44, c.fps, 7, 7);
  const pose = cam(add([0.0, 1.32, -0.15], [0, bang * 0.01, 0]), [0, 1.2, CAB.front], 48);
  const S = lift(c, {doors: 1 - close, apt: 0.95, aptLight: 1});
  const dbl = alisaPup('d11', [0, 0, lerp(1.25, 0.9, ramp(c.f, 0, 40))], al(c.t, {uncanny: 1, smile: 1, fear: 0, blink: 1, tremble: 0, hands: 1}), {...RED, bright: 0.45}, {facing: -1});
  return <LiftView pose={pose} S={S} fog={FOG13} pups={[dbl]} />;
};

// ---------------- 12. going down: 12 … 11 … 10; she slides down the wall (the image is late) ----------------
const SIT_AT = 1.5;
export const S12: React.FC<{c: Ctx}> = ({c}) => {
  if (c.t < 1.2) {
    const disp = c.t < 0.45 ? '12' : c.t < 0.9 ? '11' : '10';
    return <LiftView pose={DISP_POSE(0.6)} S={lift(c, {disp, btn: [], lamp: 0.9, floor: 12})} look={{bloom: 0.9}} />;
  }
  const k = ramp(c.f, 1.2 * c.fps, c.d * c.fps, easeInOut);
  const pose = cam(add([0.08, lerp(1.25, 1.2, k), 0.56], hand(c.t, 10, 0.004)), [0, 1.0, -0.4], lerp(60, 68, k));
  const S = lift(c, {disp: '10', btn: [], lamp: 0.9, floor: 12});
  const sit = ramp(c.f, SIT_AT * c.fps, (SIT_AT + 1.1) * c.fps, easeInOut);
  const late = ramp(c.f, (SIT_AT + 0.7) * c.fps, (SIT_AT + 1.8) * c.fps, easeInOut);
  const me = al(c.t, {fear: lerp(0.8, 0.3, sit), sit, hands: sit * 0.8, blink: c.t > 3.0 ? 0.35 : 1, tremble: 0.3, mouth: 0.15});
  const img = al(c.t, {fear: 0.3, sit: late, hands: late * 0.8, tremble: 0});
  return <LiftView pose={pose} S={S} pups={[imagePup('i12', AL_SIT, img, LIFT(0.8)), alisaPup('a12', AL_SIT, me, LIFT(0.9))]} />;
};

// ---------------- 13. silence: the light dies ----------------
export const S13: React.FC<{c: Ctx}> = ({c}) => {
  const lamp = lerp(0.9, 0, ramp(c.f, 0, 10));
  const pose = cam([0.08, 1.2, 0.56], [0, 1.0, -0.4], 68);
  const S = lift(c, {disp: '9', btn: [], lamp, floor: 12, dispOn: 0.6});
  const me = al(c.t, {fear: 0.3, sit: 1, hands: 0.8, blink: 0.35, tremble: 0});
  return <LiftView pose={pose} S={S} pups={[imagePup('i13', AL_SIT, {...me, blink: 1}, LIFT(lamp)), alisaPup('a13', AL_SIT, me, LIFT(lamp))]} exposure={0.9} />;
};

// ---------------- 14. light back: in the mirror her image is standing ----------------
export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const lamp = c.f < 3 ? 1.4 : flick(c.g);
  const pose = cam(add(mix3([0.08, 1.2, 0.56], [0.22, 1.3, 0.4], k), hand(c.t, 11, 0.004)), mix3([0, 1.0, -0.4], [0, 1.15, -0.6], k), lerp(68, 56, k));
  const S = lift(c, {disp: '8', btn: [], lamp, floor: 12});
  const me = al(c.t, {fear: 0.4, sit: 1, hands: 0.8, blink: c.f < 20 ? 0.35 : 1, tremble: 0.4});
  const img = al(c.t, {uncanny: 1, smile: lerp(0.2, 0.8, k), fear: 0, blink: 1, tremble: 0, lookY: 0.4});
  // the image stands facing OUT of the mirror (we see its face), right behind sitting Alisa
  return <LiftView pose={pose} S={S} pups={[alisaPup('i14', [0.02, 0, -0.95], img, LIFT(lamp * 0.8)), alisaPup('a14', AL_SIT, me, LIFT(lamp))]} />;
};

// ---------------- 15. the camera goes through the mirror and turns around ----------------
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const z = lerp(0.1, -1.3, k), x = lerp(0.05, -0.15, k);
  const th = Math.PI * ramp(c.f, 0.42 * c.d * c.fps, 0.85 * c.d * c.fps, easeInOut);
  const pos: V3 = [x, 1.35, z];
  const pose = cam(pos, add(pos, [Math.sin(th) * 0.6, -0.08, -Math.cos(th)]), 50);
  const ripple = Math.exp(-Math.pow((z - CAB.mirrorZ) / 0.22, 2));
  const S = lift(c, {disp: '7', btn: [], floor: 12});
  const img = al(c.t, {uncanny: 1, smile: 1, fear: 0, blink: 1, tremble: 0});
  const me = al(c.t, {fear: 0.4, sit: 1, hands: 0.8, tremble: 0.4});
  return (
    <LiftView pose={pose} S={S} look={{ripple, rtime: c.t}}
      pups={[alisaPup('i15', [0.3, 0, -0.75], img, LIFT(0.8)), alisaPup('a15', AL_SIT, me, LIFT(0.9))]} />
  );
};

// ---------------- 16. the swap, seen from inside the mirror ----------------
const BANGS = [2.0, 2.45, 2.9];
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const sw = ramp(c.f, 0.5 * c.fps, 1.7 * c.fps, easeInOut);
  const bang = BANGS.reduce((a, b) => a + kick(c.f, b * c.fps, c.fps, 9, 9), 0);
  const pose = cam(add([0.05, 1.3, -1.72], [bang * 0.012, bang * 0.006, 0]), [0.02, 1.1, 0.4], 50);
  const S = lift(c, {disp: '5', btn: [], floor: 12, lamp: flick(c.g, [1365, 1380])});
  const glitch = Math.max(0, Math.sin(Math.PI * sw)) * 0.8 + Math.abs(bang) * 0.3;
  // the double steps out of the glass into the cabin and turns to face us
  const dz = lerp(-0.78, -0.32, sw), turn = ramp(c.f, 1.9 * c.fps, 2.3 * c.fps);
  const dbl = alisaPup('d16', [0.18, 0, dz], al(c.t, {uncanny: 1, smile: 1, fear: 0, blink: 1, tremble: 0}), LIFT(0.85),
    {facing: turn > 0.5 ? -1 : 1, flip: Math.max(0.05, Math.abs(Math.cos(Math.PI * turn)))});
  // Alisa is pulled through: she stands up and ends behind the glass, palms on it
  const mz = lerp(-0.27, -0.82, sw);
  const me = alisaPup('a16', [lerp(0, -0.24, sw), 0, mz], al(c.t, {fear: 1, sit: 1 - sw, hands: lerp(0.8, 1, sw), tremble: 2.5, mouth: 0.6}), LIFT(0.7));
  return <LiftView pose={pose} S={S} pups={[dbl, me]} look={{glitch, seed: c.f, ripple: Math.sin(Math.PI * sw) * 0.6, rtime: c.t}} />;
};

// ---------------- 17. floor 12: mom hugs "Alisa"; she looks back at the mirror ----------------
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.26, 1.35, -1.6], hand(c.t, 12, 0.004)), [0.02, 1.15, 2.0], 44);
  const S = lift(c, {doors: ramp(c.f, 0, 22, easeInOut), disp: '12', btn: [], floor: 12, apt: 1, aptLight: 1, corLamp: 1, lamp: 0.9});
  const w = ramp(c.f, 18, 75, easeInOut), turn = ramp(c.f, 80, 92);
  const dbl = alisaPup('d17', [-0.08, Math.abs(Math.sin(c.t * 5)) * 0.012 * (w > 0 && w < 1 ? 1 : 0), lerp(-0.2, 3.25, w)],
    al(c.t, {uncanny: lerp(1, 0.35, w), smile: turn, fear: 0, blink: c.t > 3.2 && c.t < 3.35 ? 0.1 : 1, tremble: 0}), WARM,
    {facing: turn > 0.5 ? -1 : 1, flip: Math.max(0.05, Math.abs(Math.cos(Math.PI * turn)))});
  const mom = {id: 'mom17', at: [0.3, 0, 3.8] as V3, facing: -1 as const,
    draw: () => <Mom s={{t: T(c), blink: 1, worry: lerp(0.4, 0, w), mouth: talk(c.t, 0.4, 1.9), breathe: Math.sin(T(c) * 2), knock: 0, shiver: 0}} light={WARM} id="mom17" />};
  const me = alisaPup('a17', [-0.2, 0, -0.85], al(c.t, {fear: 1, hands: 1, tremble: 2, mouth: 0.5}), LIFT(0.6));
  return <LiftView pose={pose} S={S} pups={[mom, dbl, me]} fog={['#120c08', 0.08]} />;
};

// ---------------- 18. doors shut, the display says 13; push into the mirror ----------------
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const buzz = Math.sin(c.t * 60) * 0.002;
  const pose = cam([buzz, 1.25, lerp(0.5, -0.1, k)], [0, 1.12, CAB.mirrorZ], lerp(56, 44, k));
  const S = lift(c, {doors: 1 - ramp(c.f, 0, 16), disp: '13', btn: [13], floor: 12, lamp: lerp(0.5, 0, ramp(c.f, 8, 20)), apt: 1, aptLight: 1, corLamp: 1, dispOn: 1});
  const me = alisaPup('a18', [0, 0, -0.84], al(c.t, {fear: 1, hands: 1, tremble: 2.6, mouth: 0.7, lookY: -0.2}), {...RED, bright: 0.38});
  const black = ramp(c.f, (c.d - 0.75) * c.fps, (c.d - 0.25) * c.fps);
  return (
    <AbsoluteFill>
      <LiftView pose={pose} S={S} pups={[me]} fog={['#0a0303', 0.12]} />
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

// ---------------- timeline (draft seconds from the script) ----------------
const DRAFT = [0, 2.6, 4.8, 7.8, 13.0, 17.0, 19.8, 23.0, 25.5, 28.0, 30.5, 33.0, 37.0, 38.2, 41.5, 45.0, 48.5, 52.0, 55.5];
const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18];
const FOG_O = [0.3, 0.4, 0.5, 0.5, 0.9, 0.9, 0.5, 0.9, 0.8, 0.8, 0.5, 0.3, 0.2, 0.4, 0.5, 0.6, 0.4, 0.3];
export const SHOTS = COMPS.map((C, i) => ({id: `S${String(i + 1).padStart(2, '0')}`, from: DRAFT[i], to: DRAFT[i + 1], C, fog: FOG_O[i]}));
export const EP_SEC = DRAFT[DRAFT.length - 1];
