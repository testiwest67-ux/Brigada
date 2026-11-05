// The 44 shots of «Последняя электричка». Cut times and lip movement come from the voice (timing.ts).
// Carriage shots = the 3D train + 2D puppets; a puppet on the other side of the left wall from the camera (on the
// platform while we are inside, or the other way round) is clipped to the window / door openings.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose} from '../horror/cam';
import {TemaLight} from '../horror/Tema';
import {Rig} from '../elevator/rig';
import {Look} from '../elevator/post';
import {project} from '../horror/cam';
import {Kostya, KostyaState, KOSTYA_REST} from './Kostya';
import {Mom, MOM_REST, MomState} from './Mom';
import {Babka, BABKA_REST, Petrovich, PETROVICH_REST} from '../shift/People';
import {BOARD, CAR, DOOR, HOUSE_WIN, LEFT_OPENINGS, MAP_POS, SPEAKER, SPOT, TRAIN_REST, TrainSet, TrainState} from './Train3D';
import {PILLOW, RDOOR, ROOM, ROOM_REST, RoomSet, RoomState, RWIN} from './Room3D';
import {MapInsert, PhoneInsert, TicketInsert} from './Inserts';
import {CUTS, mouthAt} from './timing';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
// hand-held camera + the carriage rocking on the rails (only while moving)
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const rock = (t: number, on: number): V3 => [Math.sin(t * 7.3) * 0.004 * on, Math.abs(Math.sin(t * 11)) * 0.006 * on, 0];
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);

// ---------- light ----------
const NIGHT: TemaLight = {bright: 0.95, warmRim: 0.3, coldRim: 0.55, cold: 0.25};
const TIKH: TemaLight = {bright: 0.72, warmRim: 0, coldRim: 0.95, cold: 0.6};
const BOR: TemaLight = {bright: 0.9, warmRim: 0.85, coldRim: 0.3, cold: 0.12};
const MORN: TemaLight = {bright: 1, warmRim: 0.75, coldRim: 0.2, cold: 0.04};
const FOG_NIGHT: [string, number] = ['#05070b', 0.035];
const FOG_TIKH: [string, number] = ['#3a444c', 0.11];
const FOG_BOR: [string, number] = ['#0a0c12', 0.03];
const FOG_MORN: [string, number] = ['#c9c0bc', 0.03];

const flick = (g: number, drops: number[] = []) => {
  const r = mulberry32(Math.floor(g / 2) + 9)();
  let v = 0.9 + (r - 0.5) * 0.06;
  for (const d of drops) if (g >= d && g <= d + 3) v = 0.15 + r * 0.15;
  return v;
};
const tr = (c: Ctx, o: Partial<TrainState> = {}): TrainState => ({...TRAIN_REST, t: T(c), lamps: flick(c.g) * 0.9, ...o});
const TIKHAYA = (c: Ctx, o: Partial<TrainState> = {}) => tr(c, {place: 'tikhaya', speed: 0, lamps: flick(c.g, [c.g - c.f + 12]) * 0.62, ...o});
const ks = (t: number, o: Partial<KostyaState> = {}): KostyaState =>
  ({...KOSTYA_REST, t, sit: 1, breathe: Math.sin(t * 3.1), blink: blinkAt(Math.round(t * 30), [40, 130, 220, 300, 390, 470, 560]), ...o});
// the doubles: wet (grey, soaked), mid (~35), old
const wet = (t: number, o: Partial<KostyaState> = {}) => ks(t, {wet: 1, blink: blinkAt(Math.round(t * 30), [200, 900]), breathe: 0, ...o});
const mid = (t: number, o: Partial<KostyaState> = {}) => ks(t + 7, {age: 0.5, blink: 0.85, lookY: 0.6, ...o});
const old = (t: number, o: Partial<KostyaState> = {}) => ks(t + 13, {age: 1, blink: 0.78, lookY: 0.55, breathe: Math.sin(t * 2), ...o});
const mm = (t: number, o: Partial<MomState> = {}): MomState => ({...MOM_REST, t, breathe: Math.sin(t * 2.2), blink: blinkAt(Math.round(t * 30), [50, 160, 260]), ...o});

// ---------- puppets ----------
type Pup = {
  id: string; at: V3;
  facing?: 1 | -1;          // +1 = faces +z (toward the far end), -1 = faces -z
  fx?: 1 | -1;              // or faces along x (+1 = toward +x, i.e. into the train from the platform)
  view?: 'front' | 'back';  // forced
  draw: (view: 'front' | 'back', id: string) => React.ReactNode;
  opacity?: number; cast?: number;
};
const kPup = (id: string, at: V3, s: KostyaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, facing: 1, cast: 0.35, draw: (view, pid) => <Kostya s={s} light={light} id={pid} view={view} />, ...o});
const momPup = (id: string, at: V3, s: MomState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at, fx: 1, cast: s.fake ? 0 : 0.4, draw: (view, pid) => <Mom s={s} light={light} id={pid} view={view} />, ...o});

// several 3D quads → one clip path (union of their screen polygons)
const ClipQuads: React.FC<{id: string; pose: CamPose; quads: V3[][]}> = ({id, pose, quads}) => (
  <clipPath id={id}>
    {quads.map((q, k) => {
      const pts = q.map((p) => project(pose, 1080, 1920, p));
      if (pts.some((p) => p.depth < 0.02)) return null;
      return <polygon key={k} points={pts.map((p) => `${p.x},${p.y}`).join(' ')} />;
    })}
  </clipPath>
);

const PupLayer: React.FC<{pose: CamPose; pups: Pup[]; wallX?: number; children?: React.ReactNode}> = ({pose, pups, wallX, children}) => {
  const list = pups.map((p) => {
    let view: 'front' | 'back';
    if (p.view) view = p.view;
    else if (p.fx) view = (pose.pos[0] > p.at[0] ? 1 : -1) === p.fx ? 'front' : 'back';
    else view = (pose.pos[2] > p.at[2] ? 1 : -1) === (p.facing ?? 1) ? 'front' : 'back';
    const clip = wallX !== undefined && (p.at[0] < wallX) !== (pose.pos[0] < wallX);
    return {p, view, clip, depth: depthOf(pose, p.at)};
  }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
  return (
    <PuppetLayer>
      <defs>
        <filter id="castSil" x="-50%" y="-50%" width="200%" height="200%">
          <feFlood floodColor="#000" result="k" /><feComposite in="k" in2="SourceAlpha" operator="in" result="sil" /><feGaussianBlur in="sil" stdDeviation={6} />
        </filter>
        {list.some((x) => x.clip) && <ClipQuads id="openings" pose={pose} quads={LEFT_OPENINGS} />}
      </defs>
      {list.map(({p, view, clip}) => {
        const node = (
          <g key={p.id}>
            {(p.cast ?? 0) > 0 && (
              <Puppet pose={pose} at={p.at}>
                <g transform="matrix(1 0 0.45 -0.22 0 0)" opacity={p.cast} filter="url(#castSil)">{p.draw(view, `${p.id}s`)}</g>
              </Puppet>
            )}
            <Puppet pose={pose} at={p.at} opacity={p.opacity ?? 1}>{p.draw(view, p.id)}</Puppet>
          </g>
        );
        return clip ? <g key={p.id} clipPath="url(#openings)">{node}</g> : node;
      })}
      {children}
    </PuppetLayer>
  );
};

const TrainView: React.FC<{pose: CamPose; S: TrainState; pups?: Pup[]; fog?: [string, number]; look?: Look; exposure?: number; exterior?: boolean; children?: React.ReactNode}> =
  ({pose, S, pups = [], fog, look, exposure, exterior, children}) => {
    const f = fog ?? (S.place === 'tikhaya' ? FOG_TIKH : S.place === 'bor' ? FOG_BOR : S.place === 'terminal' ? FOG_MORN : FOG_NIGHT);
    return (
      <AbsoluteFill>
        <Set3D>
          <Rig pose={pose} fog={f} look={look} exposure={exposure} />
          <TrainSet S={S} exterior={exterior} />
        </Set3D>
        <PupLayer pose={pose} pups={pups} wallX={CAR.x0}>{children}</PupLayer>
      </AbsoluteFill>
    );
  };
const RoomView: React.FC<{pose: CamPose; S: RoomState; pups?: Pup[]; look?: Look; children?: React.ReactNode}> = ({pose, S, pups = [], look, children}) => (
  <AbsoluteFill>
    <Set3D>
      <Rig pose={pose} fog={['#8a9098', 0.02]} look={look} />
      <RoomSet S={S} />
    </Set3D>
    <PupLayer pose={pose} pups={pups}>{children}</PupLayer>
  </AbsoluteFill>
);
const rm = (c: Ctx, o: Partial<RoomState> = {}): RoomState => ({...ROOM_REST, t: T(c), ...o});

const K0 = SPOT.kostya;          // Kostya by the window
const KH: V3 = [K0[0], 1.17, K0[2]]; // his head
const WS = SPOT.wetSeat, MS = SPOT.midSeat, OS = SPOT.oldSeat;
const aisleCam = (c: Ctx, s = 3): V3 => add([0.25, 1.32, 0.82], hand(c.t, s, 0.005));

// the people already in the carriage at a given shot
const doubles = (c: Ctx, light: TemaLight, n: number, o: {wet?: Partial<KostyaState>; mid?: Partial<KostyaState>; old?: Partial<KostyaState>} = {}): Pup[] => {
  const t = T(c), out: Pup[] = [];
  if (n >= 1) out.push(kPup('wet', WS, wet(t, o.wet), light, {facing: -1, cast: 0.3}));
  if (n >= 2) out.push(kPup('mid', MS, mid(t, o.mid), light, {facing: -1}));
  if (n >= 3) out.push(kPup('old', OS, old(t, o.old), light));
  return out;
};

// ================= the shots =================

// 1. outside: the last train rushes through the night, its windows lit
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-4.4, 0.6, 10.5], [-4.0, 1.0, 6.5], k), hand(c.t, 1, 0.02)), mix3([-1.4, 1.2, 4.0], [-1.3, 1.3, 0.5], k), 54);
  return <TrainView pose={pose} S={tr(c)} exterior look={{bloom: 1.0}} exposure={1.35} />;
};

// 2. the red board above the far door: 00:47
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.2, 1.75, 5.3], [0.1, 1.9, 6.1], k), add(hand(c.t, 2, 0.003), rock(c.t, 1))), BOARD, 40);
  return <TrainView pose={pose} S={tr(c, {clock: Math.floor(c.t * 2) % 2 ? '00:47' : '00 47'})} look={{bloom: 0.9}} />;
};

// 3. Kostya by the window: headphones, backpack, eyes closing
export const S03: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.2, 1.35, 1.4], [0.0, 1.3, 1.2], k), add(hand(c.t, 3, 0.004), rock(c.t, 1))), [-1.2, 1.0, 0.3], 52);
  const sl = ramp(c.f, c.d * 0.5 * c.fps, c.d * c.fps);
  return <TrainView pose={pose} S={tr(c)} pups={[kPup('k3', K0, ks(T(c), {phonesOn: 1, blink: lerp(0.8, 0.35, sl), lookY: 0.4, lookX: -0.3, tilt: -3 * sl}), NIGHT)]} />;
};

// 4. insert: the line map, «Зелёный Бор» at the end, ~40 min
export const S04: React.FC<{c: Ctx}> = ({c}) => <MapInsert k={K(c)} ghost={0} t={c.t} here={4} />;

// 5. he falls asleep, his head against the cold glass
export const S05: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const sl = ramp(c.f, 4, c.d * c.fps * 0.7, easeInOut);
  const pose = cam(add(mix3([-0.2, 1.3, 1.25], [-0.35, 1.26, 1.1], k), rock(c.t, 1)), [-1.25, 1.1, 0.3], 46);
  return <TrainView pose={pose} S={tr(c, {lamps: flick(c.g) * lerp(0.9, 0.7, k)})}
    pups={[kPup('k5', K0, ks(T(c), {phonesOn: 1, blink: lerp(0.35, 0, sl), tilt: -14 * sl, mouth: 0.15 * sl}), NIGHT)]} />;
};

// 6. silence wakes him: the eyes snap open, the train has stopped
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const open = ramp(c.f, 8, 12, easeOut);
  const pose = cam(add([-0.3, 1.22, 1.05], hand(c.t, 6, 0.003)), [-1.22, 1.12, 0.3], 40);
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: 0.6})} look={{glitch: Math.max(0, kick(c.f, 9, c.fps, 6, 8)) * 0.3, seed: c.f}}
    pups={[kPup('k6', K0, ks(T(c), {phonesOn: 1, blink: open, fear: 0.6 * open, tilt: lerp(-14, -2, open), lookX: 0.4 * open}), TIKH)]} />;
};

// 7. the carriage is empty: from his seat down the aisle
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.2, 1.35, -0.4], [-0.1, 1.38, 0.1], k), hand(c.t, 7, 0.004)), [0.1, 1.15, 6.5], 60);
  return <TrainView pose={pose} S={TIKHAYA(c)} />;
};

// 8. the loudspeaker in the ceiling: «Станция Тихая. Следующая станция Тихая.»
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.35, 1.55, 0.35], [0.22, 1.75, 0.6], k), hand(c.t, 8, 0.003)), SPEAKER, 44);
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: flick(c.g, [c.g - c.f + 20, c.g - c.f + 55]) * 0.6})} />;
};

// 9a. «Подожди. Какая ещё Тихая? Ты ездишь здесь каждый день.» — he looks around, lost
export const S08a: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const look = Math.sin(c.t * 1.6);
  const pose = cam(add(mix3([0.15, 1.3, 1.35], [0.0, 1.28, 1.15], k), hand(c.t, 81, 0.004)), [-1.15, 1.05, 0.3], 48);
  return <TrainView pose={pose} S={TIKHAYA(c)}
    pups={[kPup('k8a', K0, ks(T(c), {phonesOn: 0, fear: 0.55, lookX: 0.7 * look, lookY: -0.2, turn: 0.35 * look, mouth: 0.15, hands: 0.25 * k}), TIKH)]} />;
};

// 9b. «И почему следующая — снова она?» — the red board above the far door blinks «ТИХАЯ»
export const S08b: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.15, 1.7, 4.6], [0.1, 1.9, 5.7], k), hand(c.t, 82, 0.003)), BOARD, lerp(46, 34, k));
  const txt = Math.floor(c.t * 2.2) % 2 ? 'ТИХАЯ' : '→ТИХАЯ';
  return <TrainView pose={pose} S={TIKHAYA(c, {clock: txt})} look={{bloom: 1.0}} />;
};

// 9. he looks up at the map
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([-0.05, 1.3, 1.3], hand(c.t, 9, 0.004)), [-1.15, 1.1, 0.3], 50);
  return <TrainView pose={pose} S={TIKHAYA(c)} pups={[kPup('k9', K0, ks(T(c), {phonesOn: 0, fear: 0.45, lookX: 0.8, lookY: -0.6, turn: 0.4}), TIKH)]} />;
};

// 10. insert: there is no such station; a faint gap between «Берёзки» and «Лесная»
export const S10: React.FC<{c: Ctx}> = ({c}) => <MapInsert k={K(c)} ghost={0.18 + 0.1 * Math.sin(c.t * 3)} t={c.t} here={-1} />;

// 11. the doors open by themselves
export const S11: React.FC<{c: Ctx}> = ({c}) => {
  const op = ramp(c.f, 4, 26, easeInOut);
  const pose = cam(add([0.2, 1.4, 1.2], hand(c.t, 11, 0.003)), [-1.5, 1.0, 3.05], 50);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: op})} />;
};

// 12. outside the door: fog, not a single lamp, the sign «ТИХАЯ»
export const S12: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.6, 1.5, 3.05], [-1.2, 1.5, 3.05], k), hand(c.t, 12, 0.004)), [-4.6, 2.0, 5.6], 56);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: 1, lamps: 0.75})} exposure={1.4} />;
};

// 13. a guy comes in out of the fog: blue jacket, backpack, headphones
export const S13: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 4, c.d * c.fps - 4, easeInOut);
  const at: V3 = [lerp(-3.4, -1.0, w), Math.abs(Math.sin(c.t * 5)) * 0.012, 3.05];
  const pose = cam(add([0.35, 1.35, 1.6], hand(c.t, 13, 0.004)), [-1.4, 1.1, 3.05], 50);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: 1})}
    pups={[kPup('w13', at, wet(T(c), {sit: 0, lookY: 0.9, blink: 0.7}), TIKH, {fx: 1, cast: 0.2, opacity: lerp(0.6, 1, w)})]} />;
};

// 14. he sits down opposite, head down … and raises it
export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const up = ramp(c.f, c.d * 0.55 * c.fps, c.d * c.fps, easeInOut);
  const pose = cam(add([0.3, 1.45, 0.82], hand(c.t, 14, 0.004)), [-1.1, 0.95, 0.82], 72);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: 1 - ramp(c.f, 6, 30)})}
    pups={[kPup('k14', K0, ks(T(c), {fear: 0.5, lookX: 0.5, lookY: 0.1}), TIKH), ...doubles(c, TIKH, 1, {wet: {lookY: lerp(1, 0, up), blink: lerp(0.5, 1, up), tilt: lerp(8, 0, up)}})]} />;
};

// 15. it's you: his own face, close
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([lerp(0.15, 0.0, k), 1.2, 0.95], hand(c.t, 15, 0.002)), [-1.17, 1.05, 1.28], 46);
  return <TrainView pose={pose} S={TIKHAYA(c)} pups={doubles(c, TIKH, 1, {wet: {lookX: 0.1, lookY: 0, blink: 1}})} />;
};

// 16. grey as paper
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add([0.0, 1.18, 1.0], hand(c.t, 16, 0.002)), [-1.18, 1.08, 1.28], lerp(40, 34, k));
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: 0.5})} exposure={0.9} pups={doubles(c, TIKH, 1, {wet: {lookX: 0.25, blink: 1, tilt: 4}})} />;
};

// 17. water drips from the jacket, a puddle under the bench
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.05, 0.75, 0.65], [-0.15, 0.65, 0.7], k), hand(c.t, 17, 0.002)), [-1.1, 0.3, 1.2], 52);
  const puddle = lerp(0.15, 0.32, k);
  return (
    <TrainView pose={pose} S={TIKHAYA(c)} pups={doubles(c, TIKH, 1)}>
      {(() => {
        const P = project(pose, 1080, 1920, [-1.12, 0.002, 1.1]);
        return <ellipse cx={P.x} cy={P.y} rx={P.pxPerM * puddle} ry={P.pxPerM * puddle * 0.25} fill="#7e9cb4" opacity={0.45} />;
      })()}
    </TrainView>
  );
};

// 18. «Станция Тихая» again: the doors open into the fog
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  const op = ramp(c.f, 6, 26, easeInOut);
  const pose = cam(add([0.25, 1.5, 0.5], hand(c.t, 18, 0.003)), [-1.5, 1.2, 3.05], 56);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: op, lamps: flick(c.g, [c.g - c.f + 8]) * 0.6})} pups={doubles(c, TIKH, 1)} />;
};

// 19. the second one comes in and sits next to the wet one
export const S19: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps * 0.75, easeInOut);
  const pose = cam(add([0.35, 1.35, 0.2], hand(c.t, 19, 0.004)), [-0.7, 1.1, 2.0], 56);
  const walking = w < 1;
  const at: V3 = walking ? mix3([-1.9, 0, 3.05], [-0.62, 0, 1.3], w) : MS;
  return <TrainView pose={pose} S={TIKHAYA(c, {door: 1 - ramp(c.f, c.d * c.fps * 0.7, c.d * c.fps)})}
    pups={[...doubles(c, TIKH, 1), kPup('m19', at, mid(T(c), {sit: walking ? 0 : 1, lookY: 0.7}), TIKH, {facing: -1, fx: walking ? 1 : undefined})]} />;
};

// 20. grey temples, tired eyes
export const S20: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add([0.3, 1.2, lerp(0.95, 1.0, k)], hand(c.t, 20, 0.002)), [-0.63, 1.05, 1.28], 44);
  return <TrainView pose={pose} S={TIKHAYA(c)} pups={doubles(c, TIKH, 2, {mid: {lookY: 0.1, blink: 0.75, lookX: 0.2}})} />;
};

// 21. the third: an old man, shuffling in from the fog
export const S21: React.FC<{c: Ctx}> = ({c}) => {
  const w = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const at: V3 = [lerp(-2.6, -1.1, w), 0, 3.05];
  const pose = cam(add([0.3, 1.25, 1.2], hand(c.t, 21, 0.003)), [-1.5, 1.0, 3.0], 46);
  return <TrainView pose={pose} S={TIKHAYA(c, {door: 1})} pups={[kPup('o21', at, old(T(c), {sit: 0, lookY: 0.8}), TIKH, {fx: 1, cast: 0.25})]} />;
};

// 22. in your jacket — too big for him; he sits down next to you
export const S22: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.25, 1.25, 0.95], hand(c.t, 22, 0.003)), [-0.85, 0.92, 0.32], 56);
  return <TrainView pose={pose} S={TIKHAYA(c)} pups={[kPup('k22', K0, ks(T(c), {fear: 0.75, lookX: 0.7, tremble: 1}), TIKH), ...doubles(c, TIKH, 3).filter((p) => p.id === 'old')]} />;
};

// 23. you text mom, the screen lighting your face
export const S23: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.0, 1.2, 0.85], hand(c.t, 23, 0.003)), [-1.15, 1.02, 0.32], 42);
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: 0.55})}
    pups={[kPup('k23', K0, ks(T(c), {phone: 1, fear: 0.7, lookY: 0.8, lookX: 0.25, tremble: 0.8}), TIKH)]} />;
};

// 24. the chat: his message, «печатает…» at once, mom's answer
export const S24: React.FC<{c: Ctx}> = ({c}) => {
  const reply = c.t < 0.9 ? 0 : c.t < 2.0 ? 0.5 : 1;
  return <PhoneInsert mode="chat" t={c.t} typed={1} reply={reply} zoom={K(c)} />;
};

// 25. the photo: your room, you asleep in your bed — in a wet jacket
export const S25: React.FC<{c: Ctx}> = ({c}) => <PhoneInsert mode="photo" t={c.t} typed={1} reply={1} zoom={K(c)} />;

// 26. the old man leans toward you
export const S26: React.FC<{c: Ctx}> = ({c}) => {
  const lean = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add([0.2, 1.2, 0.8], hand(c.t, 26, 0.003)), [-0.9, 1.02, 0.32], 46);
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: 0.55})}
    pups={[kPup('k26', K0, ks(T(c), {fear: 0.9, lookX: 0.6, tremble: 1.2}), TIKH),
      kPup('o26', [lerp(-0.6, -0.78, lean), 0, 0.32], old(T(c), {lookX: -0.7, lookY: 0, tilt: -10 * lean, turn: -0.4 * lean, reach: lean}), TIKH)]} />;
};

// 27. extreme close-up: «Не выходи на своей. Мы все вышли.»
export const S27: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([0.2, 1.15, lerp(0.62, 0.58, k)], hand(c.t, 27, 0.0015)), [-0.7, 1.05, 0.32], lerp(44, 38, k));
  return <TrainView pose={pose} S={TIKHAYA(c, {lamps: 0.5})} exposure={0.85}
    pups={[kPup('o27', [-0.68, 0, 0.32], old(T(c), {lookX: -0.6, lookY: 0, blink: 1, mouth: mouthAt(T(c), [41, 42]) * 0.6, tilt: -6}), TIKH)]} />;
};

// 28. «Станция Зелёный Бор»: through his window the lit platform glides in and stops
export const S28: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([-0.3, 1.35, 1.0], hand(c.t, 28, 0.003)), [-4.6, 2.1, -3.0], 55);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0, travel: lerp(-14, 0, k), lamps: 0.85})} look={{bloom: 0.8}}
    pups={[kPup('k28', K0, ks(T(c), {fear: 0.3, lookX: -0.7, turn: -0.4}), NIGHT)]} />;
};

// 29. your house, your window lit
export const S29: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-1.2, 1.45, 0.8], [-1.35, 1.5, 0.8], k), hand(c.t, 29, 0.003)), HOUSE_WIN, lerp(40, 28, k));
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0})} look={{bloom: 1.0}} />;
};

// 30. mom on the platform waving — in a summer dress, in November
export const S30: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([-1.1, 1.35, 0.55], hand(c.t, 30, 0.003)), [-3.0, 1.2, 0.9], 44);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0})}
    pups={[momPup('m30', [-3.0, 0, 0.9], mm(T(c), {fake: 1, wave: 1}), BOR)]} />;
};

// 31. you stand up; the three look at the floor
export const S31: React.FC<{c: Ctx}> = ({c}) => {
  const up = ramp(c.f, 2, 14, easeInOut);
  const pose = cam(add([0.35, 1.35, 1.75], hand(c.t, 31, 0.004)), [-0.9, 1.1, 0.7], 58);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0, door: 1})}
    pups={[kPup('k31', [-1.1, 0, 0.45], ks(T(c), {sit: 1 - up, fear: 0.3, lookX: -0.6, phonesOn: 0}), BOR),
      ...doubles(c, NIGHT, 3, {wet: {lookY: 1, blink: 0.6}, mid: {lookY: 1, blink: 0.55}, old: {lookY: 1, blink: 0.5}})]} />;
};

// 32. you sit back down
export const S32: React.FC<{c: Ctx}> = ({c}) => {
  const dn = ramp(c.f, 0, 14, easeInOut);
  const pose = cam(add([0.25, 1.3, 0.95], hand(c.t, 32, 0.003)), [-0.95, 1.0, 0.32], 52);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0, door: 1})}
    pups={[kPup('k32', K0, ks(T(c), {sit: dn, fear: 0.85, tremble: 1.5, tears: 0.5, lookY: 0.6}), NIGHT), ...doubles(c, NIGHT, 3).filter((p) => p.id === 'old')]} />;
};

// 33. the doors close
export const S33: React.FC<{c: Ctx}> = ({c}) => {
  const cl = ramp(c.f, 2, 20, easeInOut);
  const pose = cam(add([0.2, 1.4, 1.4], hand(c.t, 33, 0.003)), [-1.5, 1.0, 3.05], 50);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0, door: 1 - cl})} />;
};

// 34. her palm pressed flat on his window; the smile does not move
export const S34: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.45, 1.35, 0.85], [-0.6, 1.36, 0.82], k), hand(c.t, 34, 0.002)), [-1.85, 1.3, 0.78], 50);
  return <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0})}
    pups={[momPup('m34', [-1.72, 0, 0.78], mm(T(c), {fake: 1, palm: 1}), BOR)]} />;
};

// 35. she does not blink; the train moves off and her face slides away into the dark
export const S35: React.FC<{c: Ctx}> = ({c}) => {
  const go = ramp(c.f, c.d * 0.35 * c.fps, c.d * c.fps, (x) => x * x);
  const pose = cam(add([-0.6, 1.4, 0.8], hand(c.t, 35, 0.0015)), [-1.85, 1.3, 0.8], 40);
  const black = ramp(c.f, (c.d - 0.35) * c.fps, c.d * c.fps);
  return (
    <AbsoluteFill>
      <TrainView pose={pose} S={tr(c, {place: 'bor', speed: 0, travel: go * 6})}
        pups={[momPup('m35', [-1.72, 0, 0.8 + go * 6], mm(T(c), {fake: 1, palm: 1}), BOR)]} />
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

// 36. morning, the terminus: sun in the windows, the carriage empty
export const S36: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([0.1, 1.45, -2.0], [0.0, 1.5, -1.2], k), hand(c.t, 36, 0.004)), [-0.4, 1.0, 4.0], 58);
  const fade = 1 - ramp(c.f, 0, 10);
  return (
    <AbsoluteFill>
      <TrainView pose={pose} S={tr(c, {place: 'terminal', speed: 0, dawn: 1, lamps: 0.3, clock: '06:12'})} exposure={1.1}
        pups={[kPup('k36', K0, ks(T(c), {blink: ramp(c.f, 12, 20), lookX: 0.6}), MORN)]} />
      <AbsoluteFill style={{background: '#fff', opacity: fade * 0.8}} />
    </AbsoluteFill>
  );
};

// 37. ordinary people on the platform
export const S37: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const t = T(c);
  const pose = cam(add(mix3([-2.4, 1.6, -4.5], [-2.6, 1.6, -3.5], k), hand(c.t, 37, 0.004)), [-3.0, 1.0, 3.0], 56);
  const walk = (z0: number, v: number) => z0 + v * c.t;
  const pups: Pup[] = [
    {id: 'b37', at: [-3.6, 0, walk(2.5, -0.5)], facing: -1, cast: 0.5, draw: (view, pid) => <Babka s={{...BABKA_REST, t, breathe: Math.sin(t * 2)}} light={MORN} id={pid} view={view} />},
    {id: 'p37', at: [-2.4, 0, walk(5.5, -0.6)], facing: -1, cast: 0.5, draw: (view, pid) => <Petrovich s={{...PETROVICH_REST, t}} light={MORN} id={pid} view={view} />},
    {id: 'mo37', at: [-4.2, 0, walk(0.5, 0.4)], facing: 1, cast: 0.5, draw: (view, pid) => <Mom s={{...MOM_REST, t: t + 3}} light={MORN} id={pid} view={view} />},
    kPup('k37', [-1.95, 0, 1.0], ks(t, {sit: 0, lookX: 0.4, fear: 0.2}), MORN, {facing: 1}),
  ];
  return <TrainView pose={pose} S={tr(c, {place: 'terminal', speed: 0, dawn: 1, door: 1, lamps: 0.3})} exposure={1.1} pups={pups} />;
};

// 38. you run home along the platform
export const S38: React.FC<{c: Ctx}> = ({c}) => {
  const z = lerp(-2, 6, K(c, (x) => x));
  const pose = cam(add([-3.4, 1.2, z - 3.2], hand(c.t, 38, 0.01)), [-3.0, 1.0, z + 2], 52);
  const bob = Math.abs(Math.sin(c.t * 9)) * 0.05;
  return <TrainView pose={pose} S={tr(c, {place: 'terminal', speed: 0, dawn: 1, lamps: 0.3})} exposure={1.1}
    pups={[kPup('k38', [-3.0, bob, z], ks(T(c), {sit: 0, breathe: Math.sin(c.t * 12), mouth: 0.4, hands: 0.15, smile: 0.3, tilt: Math.sin(c.t * 9) * 4}), MORN, {view: 'back'})]} />;
};

// 39. mom hugs you in the doorway: warm, alive
export const S39: React.FC<{c: Ctx}> = ({c}) => {
  const hg = ramp(c.f, 4, 18, easeOut);
  const pose = cam(add([-0.4, 1.45, 0.45], hand(c.t, 39, 0.004)), [1.5, 1.2, 0.75], 46);
  return <RoomView pose={pose} S={rm(c, {light: 0.9})}
    pups={[momPup('m39', [1.6, 0, 0.98], mm(T(c), {hug: hg, smile: 1, tears: 0.7, blink: blinkAt(c.f, [30])}), MORN, {view: 'front'}),
      kPup('k39', [1.2, 0, 0.5], ks(T(c), {sit: 0, hands: 0.4 * hg}), MORN, {view: 'back'})]} />;
};

// 40. your room: the bed is still warm, the window is open
export const S40: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([1.3, 1.55, 1.5], [1.0, 1.5, 1.1], k), hand(c.t, 40, 0.004)), [-0.8, 0.8, -1.2], 60);
  return <RoomView pose={pose} S={rm(c)} />;
};

// 41. insert: the ticket on the pillow — «Тихая. 00:47. Сегодня.»
export const S41: React.FC<{c: Ctx}> = ({c}) => <TicketInsert k={K(c)} reveal={clamp(c.t / Math.max(0.5, c.d - 0.6))} />;

// 42. the open window, the rain: the one who slept here went to the train
export const S42: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c);
  const pose = cam(add(mix3([-0.2, 1.5, 0.4], [-0.2, 1.55, -1.2], k), hand(c.t, 42, 0.004)), [-0.2, 1.4, -4], 54);
  return <RoomView pose={pose} S={rm(c, {wind: 1})} />;
};

// 43. would you get off at yours? — Kostya, close, looking at us
export const S43: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c, easeOut);
  const pose = cam(add([-0.1, 1.3, lerp(1.0, 0.85, k)], hand(c.t, 43, 0.002)), [0.0, 1.3, -1.0], 36);
  return <RoomView pose={pose} S={rm(c, {light: 0.8})}
    pups={[kPup('k43', [0.0, 0, -0.4], ks(T(c), {sit: 0, lookX: 0, lookY: 0, fear: 0.4, mouth: 0.05}), MORN)]} />;
};

// 44. night again, «Тихая»: Kostya asleep by the window; the door opens and the wet one walks in
export const S44: React.FC<{c: Ctx}> = ({c}) => {
  const op = ramp(c.f, 6, 24, easeInOut);
  const w = ramp(c.f, 24, c.d * c.fps - 20, easeInOut);
  const pose = cam(add([0.3, 1.5, 5.2], hand(c.t, 44, 0.004)), [-1.0, 1.0, 1.6], 58);
  const black = ramp(c.f, (c.d - 0.6) * c.fps, c.d * c.fps);
  return (
    <AbsoluteFill>
      <TrainView pose={pose} S={TIKHAYA(c, {door: op})}
        pups={[kPup('k44', K0, ks(T(c), {blink: 0, phonesOn: 1, tilt: -14, mouth: 0.15}), TIKH),
          kPup('w44', [lerp(-3.2, -1.0, w), 0, 3.05], wet(T(c), {sit: 0, lookY: 0.3, blink: 1}), TIKH, {fx: 1, cast: 0.2})]} />
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};

// ---------------- timeline: cut times from the voice (timing.ts) ----------------
const COMPS = [S01, S02, S03, S04, S05, S06, S07, S08, S08a, S08b, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22,
  S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40, S41, S42, S43, S44];
export const COLD_SHOTS = new Set(['S06', 'S07', 'S08', 'S08a', 'S08b', 'S09', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23', 'S26', 'S27', 'S44']);
// key moment of each shot (0..1 of its length) for the storyboard
const KEY: Record<string, number> = {S06: 0.8, S11: 0.9, S13: 0.7, S14: 0.9, S19: 0.5, S21: 0.6, S24: 0.85, S31: 0.6, S32: 0.6, S33: 0.8, S35: 0.3, S36: 0.6, S39: 0.7, S41: 0.9, S44: 0.65};
const NAMES = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S08a', 'S08b', ...Array.from({length: 36}, (_, i) => `S${String(i + 9).padStart(2, '0')}`)];
export const SHOTS = COMPS.map((C, i) => {
  const id = NAMES[i];
  const from = CUTS[i], to = CUTS[i + 1];
  return {id, from, to, C, key: from + (to - from) * (KEY[id] ?? 0.55)};
});
export const EP_SEC = CUTS[CUTS.length - 1];
void DOOR; void MAP_POS; void PILLOW; void RDOOR; void ROOM; void RWIN;
