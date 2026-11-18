// The 40 shots of «Отражение опаздывает». Cut times and lip movement come from the voice (timing.ts).
// Mirror shots = a 3D room with its mirrored copy behind the glass + 2D puppets. Anya faces the mirror (−z);
// her reflection is the same doll at MIR(position), facing +z, drawn flipped — and drawn from her pose some seconds
// AGO (the lag), which is the whole story. A puppet on the other side of the glass from the camera is clipped to it.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Puppet, PuppetLayer, Set3D, depthOf} from '../horror/common';
import {CamPose} from '../horror/cam';
import {TemaLight} from '../horror/Tema';
import {ClipQuad, Rig} from '../elevator/rig';
import {Look} from '../elevator/post';
import {CAB, LiftSet, LiftState, MIR as LMIR, MIRROR_QUAD as LQUAD} from '../elevator/Lift3D';
import {Anya, ANYA_REST, AnyaOpts, AnyaState} from './Anya';
import {BATH_REST, BathSet, BathState, MIR, MIRROR_QUAD, MZ, SPOT} from './Bath3D';
import {CalendarInsert, DelayTag, MolesInsert, PhoneInsert, ShopWindowInsert} from './Inserts';
import {CUTS, mouthAt, S as LS, TOTAL} from './timing';
import {FONT} from '../horror/fonts';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};
const T = (c: Ctx) => c.g / c.fps;
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const hand = (t: number, s = 1, k = 0.004): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const K = (c: Ctx, ease = easeInOut) => ramp(c.f, 0, c.d * c.fps, ease);
// 0..1 bump: 1 between a and a + len (soft edges)
const bump = (t: number, a: number, len = 0.16) => clamp((t - a) / 0.05) * clamp((a + len - t) / 0.05);

// ---------- light ----------
const MORN: TemaLight = {bright: 1, warmRim: 0.6, coldRim: 0.3, cold: 0.05};
const EVE: TemaLight = {bright: 0.88, warmRim: 0.95, coldRim: 0.15, cold: 0.05};
const NIGHT: TemaLight = {bright: 0.55, warmRim: 0.05, coldRim: 0.85, cold: 0.55};
const CAFE: TemaLight = {bright: 0.92, warmRim: 0.85, coldRim: 0.2, cold: 0.05};
const LIFTL: TemaLight = {bright: 0.85, warmRim: 0.15, coldRim: 0.65, cold: 0.35};
const COLD = (l: TemaLight): TemaLight => ({...l, bright: l.bright * 0.9, cold: Math.min(1, l.cold + 0.25), coldRim: Math.min(1, l.coldRim + 0.2)});

// ---------- Anya ----------
const BL = Array.from({length: 60}, (_, i) => 40 + i * 95 + ((i * 37) % 40));
export const an = (t: number, o: Partial<AnyaState> = {}): AnyaState =>
  ({...ANYA_REST, t, breathe: Math.sin(t * 2.8), blink: blinkAt(Math.round(t * 30), BL), ...o});

type Pup = {
  id: string; at: V3;
  facing?: 1 | -1;   // +1 faces +z (away from the mirror), -1 faces the mirror
  flip?: number;
  draw: (view: 'front' | 'back', id: string) => React.ReactNode;
  opacity?: number; shadow?: number;
};
const anyaPup = (id: string, at: V3, s: AnyaState, light: TemaLight, o: Partial<Pup> & {opts?: AnyaOpts} = {}): Pup =>
  ({id, at, facing: -1, shadow: 0.25, draw: (view, pid) => <Anya s={s} light={light} id={pid} view={view} {...o.opts} />, ...o});
// the reflection of someone standing at `at` facing the mirror (mz = the mirror plane)
const reflPup = (id: string, at: V3, s: AnyaState, light: TemaLight, o: Partial<Pup> & {opts?: AnyaOpts; mir?: (p: V3) => V3} = {}): Pup =>
  ({id, at: (o.mir ?? MIR)(at), facing: 1, flip: -1, draw: (view, pid) => <Anya s={s} light={COLD(light)} id={pid} view={view} brushColor="#3f7fd8" {...o.opts} />, ...o});

// a 3D set with a mirror + puppets; anything on the other side of the glass from the camera is clipped to the glass
const MirrorView: React.FC<{pose: CamPose; set: React.ReactNode; mz: number; quad: V3[]; pups?: Pup[]; fog?: [string, number]; look?: Look; exposure?: number; children?: React.ReactNode}> =
  ({pose, set, mz, quad, pups = [], fog = ['#0b0d10', 0.04], look, exposure, children}) => {
    const camIn = pose.pos[2] < mz;
    const list = pups.map((p) => {
      const sees = pose.pos[2] > p.at[2] ? 1 : -1;
      const view: 'front' | 'back' = sees === (p.facing ?? 1) ? 'front' : 'back';
      return {p, view, clip: (p.at[2] < mz) !== camIn, depth: depthOf(pose, p.at)};
    }).filter((x) => x.depth > 0.05).sort((a, b) => b.depth - a.depth);
    return (
      <AbsoluteFill>
        <Set3D>
          <Rig pose={pose} fog={fog} look={look} exposure={exposure} />
          {set}
        </Set3D>
        <PuppetLayer>
          <defs>{list.some((x) => x.clip) && <ClipQuad id="glassq" pose={pose} quad={quad} />}</defs>
          {list.map(({p, view, clip}) => {
            const node = (
              <Puppet key={p.id} pose={pose} at={p.at} flip={p.flip ?? 1} opacity={p.opacity ?? 1} shadow={clip ? 0 : p.shadow ?? 0}>
                {p.draw(view, p.id)}
              </Puppet>
            );
            return clip ? <g key={p.id} clipPath="url(#glassq)">{node}</g> : node;
          })}
          {children}
        </PuppetLayer>
      </AbsoluteFill>
    );
  };
const bath = (c: Ctx, o: Partial<BathState> = {}): BathState => ({...BATH_REST, t: T(c), ...o});
const BathView: React.FC<{pose: CamPose; S: BathState; pups?: Pup[]; look?: Look; exposure?: number; children?: React.ReactNode}> = ({pose, S, pups, look, exposure, children}) => (
  <MirrorView pose={pose} set={<BathSet S={S} />} mz={MZ} quad={MIRROR_QUAD} pups={pups} look={look} exposure={exposure}
    fog={S.tint === 'night' ? ['#05070c', 0.08] : S.kind === 'cafe' ? ['#1a120c', 0.03] : ['#cfd6da', 0.02]}>{children}</MirrorView>
);
const lift = (c: Ctx): LiftState => ({t: T(c), lamp: 0.85 + 0.05 * Math.sin(c.g * 0.7), doors: 0, disp: '7', dispOn: 1, btn: [7], floor: 12, apt: 0, aptLight: 0, corLamp: 0.6});
const LiftView: React.FC<{pose: CamPose; c: Ctx; pups?: Pup[]}> = ({pose, c, pups}) => (
  <MirrorView pose={pose} set={<LiftSet S={lift(c)} />} mz={CAB.mirrorZ} quad={LQUAD} pups={pups} fog={['#0a0d0c', 0.06]} />
);

// ---------- standard cameras in the bathroom ----------
const OVER = (c: Ctx, k: number, s = 1): CamPose => cam(add(mix3([0.88, 1.66, 1.6], [0.8, 1.62, 1.4], k), hand(c.t, s)), [0.06, 1.3, MZ], 38);
// her face: the camera stands behind the glass (in the mirror world) and looks out at her
const FACE = (c: Ctx, k: number, s = 1): CamPose => cam(add(mix3([0.05, 1.3, -1.7], [0.04, 1.29, -1.58], k), hand(c.t, s, 0.003)), [0, 1.25, SPOT[2]], 38);
const REFL = (c: Ctx, k: number, s = 1, fov = 34): CamPose => cam(add(mix3([0.05, 1.32, 0.35], [0.04, 1.31, 0.15], k), hand(c.t, s, 0.003)), [0, 1.27, 2 * MZ - SPOT[2]], fov * 0.85);
const tag = (text: string, on: number, red?: boolean) => <DelayTag text={text} on={on} red={red} />;

// =================== the shots ===================

// 1. morning: the bathroom, Anya brushing her teeth at the mirror (already a little late — rewatch)
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = K(c), t = T(c);
  const a = (x: number) => an(x, {brush: 1, blink: 0.75});
  const pose = cam(add(mix3([0.75, 1.62, 1.55], [0.5, 1.56, 1.1], k), hand(c.t, 1)), [0, 1.3, MZ], 56);
  return <BathView pose={pose} S={bath(c)} pups={[anyaPup('a1', SPOT, a(t), MORN), reflPup('r1', SPOT, a(t - 0.5), MORN)]} />;
};

// 2. over her shoulder: brushing, the reflection brushing too
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const a = (x: number) => an(x, {brush: 1, blink: 0.8, lookY: 0.1});
  return <BathView pose={OVER(c, K(c), 2)} S={bath(c)} pups={[anyaPup('a2', SPOT, a(t), MORN), reflPup('r2', SPOT, a(t - 0.5), MORN)]} />;
};

// 3. her face: she blinks
const TB = LS(2) + 0.3;
const eyes = (x: number) => an(x, {brush: 0.6, blink: 1 - bump(x, TB, 0.18), lookY: -0.05});
export const S03: React.FC<{c: Ctx}> = ({c}) => (
  <BathView pose={FACE(c, K(c), 3)} S={bath(c)} pups={[anyaPup('a3', SPOT, eyes(T(c)), MORN)]} />
);

// 4. the reflection's face: it blinks — later. «+0,5 с»
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), tb = LS(3) + 0.55;
  const r = an(t, {brush: 0.6, blink: 1 - bump(t, tb, 0.18), lookY: -0.05, uncanny: 0.05});
  return (
    <BathView pose={REFL(c, K(c), 4)} S={bath(c)} pups={[reflPup('r4', SPOT, r, MORN)]}>
      {null}
    </BathView>
  );
};
const S04T: React.FC<{c: Ctx}> = ({c}) => <>{tag('+0,5 с', ramp(T(c), LS(3) + 0.8, LS(3) + 1.0))}</>;

// 5. «На полсекунды. Тебе показалось» — she shrugs and goes on brushing
export const S05: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), sh = bump(t, LS(6), 0.7);
  return <BathView pose={FACE(c, K(c), 5)} S={bath(c)} pups={[anyaPup('a5', SPOT, an(t, {brush: 1 - sh, hands: 0.35 * sh, happy: 0.4 * sh, lookX: 0.2}), MORN)]} />;
};

// 6. evening: she waves at herself; the reflection is late by a second
const waveA = (x: number) => an(x, {wave: ramp(x, LS(7) + 0.4, LS(7) + 0.9), happy: 0.5});
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  return <BathView pose={OVER(c, K(c), 6)} S={bath(c, {tint: 'evening', lamp: 0.8})}
    pups={[anyaPup('a6', SPOT, waveA(t), EVE), reflPup('r6', SPOT, waveA(t - 1.0), EVE)]} />;
};

// 7. the reflection raises its hand — a second later. «+1 с»
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const r = an(t, {wave: ramp(t, LS(8) + 0.6, LS(8) + 1.2), happy: 0.4, uncanny: 0.12});
  return <BathView pose={REFL(c, K(c), 7, 42)} S={bath(c, {tint: 'evening', lamp: 0.8})} pups={[reflPup('r7', SPOT, r, EVE)]} />;
};

// 8. she jerks her head to the side
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), j = ramp(c.f, 3, 8, easeOut);
  return <BathView pose={FACE(c, 0, 8)} S={bath(c, {tint: 'evening', lamp: 0.8})} pups={[anyaPup('a8', SPOT, an(t, {turn: -0.9 * j, lookX: -1 * j, fear: 0.4 * j}), EVE)]} />;
};

// 9. …but the reflection is still looking at her
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  return <BathView pose={REFL(c, K(c), 9, 30)} S={bath(c, {tint: 'evening', lamp: 0.75})} pups={[reflPup('r9', SPOT, an(t, {blink: 1, uncanny: 0.2}), EVE)]} />;
};

// 10. …and only then slowly turns away
export const S10: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), k = ramp(c.f, 6, c.d * c.fps * 0.8, easeInOut);
  return <BathView pose={REFL(c, K(c) * 0.5, 10, 32)} S={bath(c, {tint: 'evening', lamp: 0.75})} pups={[reflPup('r10', SPOT, an(t, {turn: -0.9 * k, lookX: -k, uncanny: 0.2}), EVE)]} />;
};

// 11. the calendar: the next day
export const S11: React.FC<{c: Ctx}> = ({c}) => <CalendarInsert day={7 + ramp(c.f, 6, 20, easeInOut) * 0.999} k={K(c)} t={c.t} />;

// 12. the lift mirror: she fixes her scarf, the reflection does it late
const liftA = (x: number) => an(x, {turn: 0.35 * Math.sin(x * 2.2), lookX: 0.4 * Math.sin(x * 2.2), hands: 0.5 + 0.3 * Math.sin(x * 3)});
export const S12: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const at: V3 = [0, 0, -0.12];
  const pose = cam(add(mix3([0.42, 2.05, 0.52], [0.38, 2.0, 0.45], K(c)), hand(c.t, 12)), [0, 1.05, CAB.mirrorZ], 72);
  return <LiftView pose={pose} c={c} pups={[anyaPup('a12', at, liftA(t), LIFTL, {opts: {outfit: 'street'}}), reflPup('r12', at, {...liftA(t - 1.2), uncanny: 0.2}, LIFTL, {mir: LMIR, opts: {outfit: 'street'}})]} />;
};

// 13. the shop window at night
export const S13: React.FC<{c: Ctx}> = ({c}) => (
  <ShopWindowInsert k={K(c)} t={T(c)} lag={1.2} light={NIGHT} a={(x) => an(x, {turn: 0.5 * Math.sin(x * 2.4), hands: 0.2})} />
);

// 14. the dark phone screen
export const S14: React.FC<{c: Ctx}> = ({c}) => (
  <PhoneInsert k={K(c)} t={T(c)} lag={1.2} light={MORN} a={(x) => an(x, {turn: 0.4 * Math.sin(x * 2), lookY: 0.2})} />
);

// 15. all your reflections are late: in the lift, close, she stares at herself
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const at: V3 = [0, 0, -0.12];
  const pose = cam(add(mix3([0.06, 1.3, -1.45], [0.05, 1.29, -1.35], K(c)), hand(c.t, 15, 0.003)), [0, 1.24, at[2]], 40);
  return <LiftView pose={pose} c={c} pups={[anyaPup('a15', at, an(t, {fear: 0.75, tremble: 1, lookY: -0.05}), LIFTL, {opts: {outfit: 'street'}})]} />;
};

// 16. the café: she shows Liza the mirror; Liza's reflection is fine, Anya's lags
const AC: V3 = [-0.28, 0, -0.3], LC: V3 = [0.3, 0, -0.22];
const cafeA = (x: number) => an(x, {hands: 0.6 + 0.4 * Math.sin(x * 4), fear: 0.5, mouth: 0.25 * Math.abs(Math.sin(x * 9))});
const liza = (x: number, o: Partial<AnyaState> = {}) => an(x + 3, {lookX: -0.5, turn: -0.2, ...o});
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const pose = cam(add(mix3([-0.05, 1.68, 1.55], [-0.05, 1.64, 1.3], K(c)), hand(c.t, 16)), [0, 1.3, MZ], 46);
  return <BathView pose={pose} S={bath(c, {kind: 'cafe', tint: 'evening'})} pups={[
    anyaPup('a16', AC, cafeA(t), CAFE, {opts: {outfit: 'street'}}), reflPup('r16', AC, cafeA(t - 1.5), CAFE, {opts: {outfit: 'street'}}),
    anyaPup('l16', LC, liza(t), CAFE, {opts: {variant: 'liza'}}), reflPup('rl16', LC, liza(t), CAFE, {opts: {variant: 'liza'}}),
  ]} />;
};

// 17. Liza: «Всё нормально. Ты просто не выспалась.»
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const pose = cam(add(mix3([0.12, 1.3, -1.75], [0.12, 1.29, -1.62], K(c)), hand(c.t, 17, 0.003)), [0.1, 1.24, -0.25], 44);
  return <BathView pose={pose} S={bath(c, {kind: 'cafe', tint: 'evening'})} pups={[
    anyaPup('l17', LC, liza(t, {mouth: mouthAt(t, [19, 20]), happy: 0.3, lookX: -0.6, turn: -0.3}), CAFE, {opts: {variant: 'liza'}}),
    anyaPup('a17', AC, an(t, {fear: 0.5, lookX: 0.6, turn: 0.3}), CAFE, {opts: {outfit: 'street'}}),
  ]} />;
};

// 18. night: she hangs a sheet over the mirror
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  // she lifts her arms, throws the sheet over the top of the mirror; it unrolls down, swings and settles
  const t = T(c);
  const lift = ramp(c.f, 0, 10, easeOut);
  const a0 = 14, a1 = a0 + 26;
  const sh = ramp(c.f, a0, a1, easeOut);
  const after = Math.max(0, (c.f - a1) / c.fps);
  const sway = sh > 0.02 ? 0.22 * (1 - sh) + 0.12 * Math.sin(after * 7) * Math.exp(-after * 2.2) * clamp(sh) : 0;
  const down = ramp(c.f, a1 + 6, a1 + 20, easeInOut);
  return <BathView pose={OVER(c, K(c), 18)} S={bath(c, {tint: 'night', lamp: 0.45, sheet: Math.max(0.02, sh), sway})}
    pups={[anyaPup('a18', [0, 0, SPOT[2] + 0.1 * down], an(t, {hands: lift * (1 - 0.7 * down), fear: 0.5, lookY: -0.3 * (1 - down)}), NIGHT),
      reflPup('r18', SPOT, an(t - 1.5, {hands: 1, uncanny: 0.35}), NIGHT, {opacity: 1 - sh})]} />;
};

// 19. the dark bathroom, the covered mirror; something knocks
export const S19: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add(mix3([0.85, 1.5, 1.55], [0.4, 1.47, 0.6], K(c)), hand(c.t, 19)), [0.05, 1.45, MZ], 52);
  return <BathView pose={pose} S={bath(c, {tint: 'night', lamp: 0.35, sheet: 1, door: 0.6})} exposure={1.25} />;
};

// 20. close on the sheet: тук… тук… — it bulges from behind
export const S20: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  // each «тук»: the hand punches out of the sheet and sinks back slowly; the lamp blinks
  const hit = (a: number) => (t < a ? 0 : t < a + 0.08 ? (t - a) / 0.08 : Math.max(0, 1 - (t - a - 0.08) / 0.7));
  const b = Math.max(hit(LS(23) - 0.02), hit(LS(24) - 0.02), 0.08 + 0.04 * Math.sin(t * 2));
  const sh = (kick(c.f, (LS(23) - (c.g - c.f) / c.fps) * c.fps, c.fps, 9, 7) + kick(c.f, (LS(24) - (c.g - c.f) / c.fps) * c.fps, c.fps, 9, 7)) * 0.006;
  // from the side: the sheet over the mirror, a hand knocks from behind it
  const pose = cam(add(mix3([1.0, 1.62, 0.75], [0.92, 1.58, 0.5], K(c)), [sh * 3, sh * 1.5, 0]), [0.05, 1.42, MZ], 48);
  return <BathView pose={pose} S={bath(c, {tint: 'night', lamp: 0.75 - 0.5 * Math.max(bump(t, LS(23), 0.1), bump(t, LS(24), 0.1)), sheet: 1, bulge: b})} exposure={1.45} />;
};

// 21. morning: the sheet lies on the floor
export const S21: React.FC<{c: Ctx}> = ({c}) => {
  // the sheet just lies crumpled on the floor; the palm print is on the glass
  const pose = cam(add(mix3([-0.55, 1.62, 1.45], [-0.45, 1.56, 1.2], K(c)), hand(c.t, 21)), [0.08, 0.55, -0.15], 60);
  return <BathView pose={pose} S={bath(c, {floorSheet: 1, hand: 1, door: 0.05})} />;
};

// 22. the palm print on the glass — from the other side; a face comes up faintly behind it
export const S22: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), ghost = ramp(T(c), LS(27), LS(27) + 0.8);
  const pose = cam(add(mix3([0.22, 1.5, -0.38], [0.2, 1.5, -0.52], K(c)), hand(c.t, 22, 0.002)), [0.18, 1.48, MZ], 40);
  return <BathView pose={pose} S={bath(c, {hand: 1})} pups={[reflPup('r22', [0.18, 0, SPOT[2]], an(t, {blink: 1, uncanny: 0.6, smile: 0.2}), MORN, {opacity: 0.55 * ghost})]} />;
};

// 23. three seconds now: she turns her head, the reflection turns three seconds later. «+3 с»
const headA = (x: number) => an(x, {turn: 0.6 * Math.sin((x - LS(28)) * 1.4), lookX: 0.7 * Math.sin((x - LS(28)) * 1.4), fear: 0.4});
export const S23: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  return <BathView pose={OVER(c, K(c), 23)} S={bath(c, {hand: 1})} pups={[anyaPup('a23', SPOT, headA(t), MORN), reflPup('r23', SPOT, {...headA(t - 3), uncanny: 0.35}, MORN)]} />;
};
const S23T: React.FC<{c: Ctx}> = ({c}) => <>{tag('+3 с', ramp(c.f, 6, 12), true)}</>;

// 24. she smiles (testing it)
export const S24: React.FC<{c: Ctx}> = ({c}) => (
  <BathView pose={FACE(c, K(c), 24)} S={bath(c)} pups={[anyaPup('a24', SPOT, an(T(c), {happy: ramp(c.f, 4, 14), fear: 0.2}), MORN)]} />
);

// 25. it waits… and smiles wider than her
export const S25: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), sm = ramp(t, LS(31), LS(31) + 0.8, easeOut);
  // mini push-in onto its face the moment it starts to smile
  const z = easeOut(clamp((t - LS(31)) / 0.45));
  const base = REFL(c, K(c) * 0.3, 25, 34);
  const pose = {...base, fov: lerp(base.fov, 17, z), tgt: [0, lerp(1.27, 1.13, z), base.tgt[2]] as V3};
  return <BathView pose={pose} S={bath(c)} pups={[reflPup('r25', SPOT, an(t, {blink: 1, smile: sm, uncanny: 0.45 + 0.3 * sm}), MORN)]} />;
};

// 26. she understands
export const S26: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 4, 20);
  return <BathView pose={FACE(c, K(c), 26)} S={bath(c)} pups={[anyaPup('a26', SPOT, an(T(c), {fear: 0.4 + 0.6 * k, mouth: 0.4 * k, tremble: 2 * k}), MORN)]} />;
};

// 27. it repeats. remembers. learns to be you — the lag shrinks
export const S27: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), lag = lerp(1.6, 0.4, K(c));
  const a = (x: number) => an(x, {hands: 0.5 + 0.5 * Math.sin(x * 2.6), turn: 0.4 * Math.sin(x * 1.7), fear: 0.7});
  return <BathView pose={OVER(c, K(c), 27)} S={bath(c)} pups={[anyaPup('a27', SPOT, a(t), MORN), reflPup('r27', SPOT, {...a(t - lag), uncanny: 0.55, fear: 0}, MORN)]} />;
};

// 28. the calendar: a week, fewer mistakes every day — 0
export const S28: React.FC<{c: Ctx}> = ({c}) => {
  const p = ramp(c.f, 0, c.d * c.fps * 0.85, (x) => x);
  const day = 8 + p * 6;
  return <CalendarInsert day={day} errs={Math.max(0, Math.round(12 * Math.pow(1 - p, 1.5)))} k={K(c)} t={c.t} />;
};

// 29. perfect sync: she blinks and smiles — so does it, exactly
export const S29: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const a = (x: number) => an(x, {happy: ramp(x, LS(40), LS(40) + 0.5), blink: 1 - bump(x, LS(39) + 0.5, 0.2)});
  const pose = OVER(c, K(c), 29);
  return <BathView pose={pose} S={bath(c)} pups={[anyaPup('a29', SPOT, a(t), MORN), reflPup('r29', SPOT, {...a(t), uncanny: 0.4}, MORN)]} />;
};

// 30. she exhales
export const S30: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), k = ramp(c.f, 2, 18);
  return <BathView pose={FACE(c, K(c), 30)} S={bath(c)} pups={[anyaPup('a30', SPOT, an(t, {happy: 0.7 * k, blink: lerp(1, 0.4, bump(t, LS(41) + 0.2, 0.7)), breathe: Math.sin(t * 1.6) * 1.6}), MORN)]} />;
};

// 31. she steps away from the mirror; the reflection does not
export const S31: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), w = ramp(c.f, 6, c.d * c.fps * 0.9, easeInOut);
  const at: V3 = [lerp(0, 0.85, w), Math.abs(Math.sin(t * 6)) * 0.01 * (w > 0 && w < 1 ? 1 : 0), lerp(SPOT[2], 0.45, w)];
  const pose = cam(add([-0.35, 1.52, 1.35], hand(c.t, 31)), [0.05, 1.25, MZ], 56);
  return <BathView pose={pose} S={bath(c, {door: 0.9})} pups={[anyaPup('a31', at, an(t, {happy: 0.4}), MORN), reflPup('r31', SPOT, an(t, {blink: 1, uncanny: 0.5}), MORN)]} />;
};

// 32. the reflection stays, alone in the glass
export const S32: React.FC<{c: Ctx}> = ({c}) => (
  <BathView pose={REFL(c, K(c), 32, 44)} S={bath(c, {door: 0.9})} pups={[reflPup('r32', SPOT, an(T(c), {blink: 1, uncanny: 0.65}), MORN)]} />
);

// 33. it waves at her
export const S33: React.FC<{c: Ctx}> = ({c}) => (
  <BathView pose={REFL(c, K(c), 33, lerp(44, 30, easeOut(ramp(c.f, 6, 18))))} S={bath(c, {door: 0.9})} pups={[reflPup('r33', SPOT, an(T(c), {blink: 1, uncanny: 0.75, wave: ramp(c.f, 3, 12), smile: 0.5}), MORN)]} />
);

// 34. «Спасибо. Дальше я сама.» — a whisper, close
export const S34: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  return <BathView pose={REFL(c, K(c), 34, lerp(30, 24, K(c)))} S={bath(c, {door: 0.9, lamp: 0.85})}
    pups={[reflPup('r34', SPOT, an(t, {blink: 1, uncanny: 0.9, smile: 0.35, mouth: mouthAt(t, [46, 47]) * 0.7}), MORN)]} />;
};

// ---- behind the glass: Anya is trapped in the mirror world ----
const TRAP: V3 = [-0.05, 0, MZ - 0.2];          // just behind the glass, in the copy
const fake = (x: number, o: Partial<AnyaState> = {}) => an(x, {brush: 1, blink: 0.8, uncanny: 0.15, ...o});
const trapped = (x: number, o: Partial<AnyaState> = {}) =>
  an(x, {hands: 1, fear: 1, mouth: 0.6 + 0.3 * Math.sin(x * 7), tremble: 2.5, ...o});
const trapPup = (id: string, s: AnyaState, light: TemaLight, o: Partial<Pup> = {}): Pup =>
  ({id, at: TRAP, facing: 1, flip: -1, draw: (view, pid) => <Anya s={s} light={COLD(light)} id={pid} view={view} />, ...o});

// a label chip over someone's head («ТЫ» / «ОНА»), drawn in mm in the scene, never mirrored
const labelPup = (id: string, at: V3, text: string, color: string, on: number): Pup => ({
  id, at, facing: 1, shadow: 0, opacity: clamp(on),
  draw: () => (
    <g transform="translate(0 -1640)">
      <rect x={-170} y={-95} width={340} height={130} rx={60} fill="#0b0d12" opacity={0.85} stroke={color} strokeWidth={10} />
      <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={color}>{text}</text>
      <path d="M -26 40 L 26 40 L 0 85 Z" fill={color} />
    </g>
  ),
});
const RIPPLE = (c: Ctx): Look => ({ripple: 1 - ramp(c.f, 0, 16, easeOut), rtime: c.t, bloom: 0.5});
const knockH = (t: number) => 0.8 + Math.abs(Math.sin(t * 6)) * 0.2;

// 35. «Стекло холодное. Ты стучишь по нему ладонью.» — she is IN the mirror now: seen from the bathroom,
// banging on the glass; the screen ripples as we come out of the swap
export const S35: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const pose = cam(add(mix3([0.42, 1.55, 1.35], [0.32, 1.5, 1.0], K(c)), hand(c.t, 35, 0.004)), [0, 1.35, MZ], 44);
  return <BathView pose={pose} S={bath(c, {door: 0.9, inside: ramp(c.f, 20, 30)})} look={RIPPLE(c)}
    pups={[trapPup('t35', trapped(t, {hands: knockH(t)}), MORN), labelPup('l35', TRAP, 'ТЫ', '#ff3a3a', ramp(c.f, 10, 18))]} />;
};

// 36. «С той стороны.» — close: her face and palms pressed to the glass from inside the mirror
export const S36: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const pose = cam(add(mix3([0.0, 1.33, 0.35], [0.0, 1.32, 0.15], K(c)), hand(c.t, 36, 0.002)), [0, 1.25, TRAP[2]], 30);
  return <BathView pose={pose} S={bath(c, {door: 0.9, inside: 1})} pups={[trapPup('t36', trapped(t, {hands: 1, tremble: 1.5}), MORN)]} />;
};

// 37. «А она чистит зубы. И не слышит.» — «she» at the sink, Anya banging inside the mirror
export const S37: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), on = ramp(c.f, 4, 12);
  const F: V3 = [-0.24, 0, SPOT[2]], TR: V3 = [0.24, 0, TRAP[2]];
  const pose = cam(add(mix3([0.05, 1.72, 1.65], [0.05, 1.68, 1.45], K(c)), hand(c.t, 37)), [0.02, 1.3, MZ], 46);
  return <BathView pose={pose} S={bath(c, {door: 0.9, inside: 1})}
    pups={[anyaPup('f37', F, fake(t, {happy: 0.3}), MORN, {opts: {mole: 1}}), trapPup('t37', trapped(t, {hands: knockH(t)}), MORN, {at: TR}),
      labelPup('lf37', [F[0], 0.05, F[2] + 0.05], 'ОНА', '#f2f0f6', on), labelPup('lt37', TR, 'ТЫ', '#ff3a3a', on)]} />;
};

// 38. the moles: it used to be on the left
export const S38: React.FC<{c: Ctx}> = ({c}) => <MolesInsert t={T(c)} k={K(c)} light={MORN} base={an(T(c), {blink: 1})} />;

// 39. «Проверь своё отражение…» — Anya in the glass, palms on it, looking at YOU
export const S39: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  const pose = cam(add(mix3([0.0, 1.32, 0.45], [0.0, 1.31, 0.2], K(c)), hand(c.t, 39, 0.002)), [0, 1.26, TRAP[2]], lerp(32, 26, K(c)));
  return <BathView pose={pose} S={bath(c, {door: 0.9, inside: 1})} pups={[trapPup('t39', trapped(t, {mouth: 0.15, tremble: 1, fear: 0.8, hands: 1}), MORN)]} />;
};

// 40. the light goes off, «she» leaves; in the dark glass only a palm stays
export const S40: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c), off = ramp(c.f, 18, 22);
  const pose = cam(add([0.5, 1.5, 1.3], hand(c.t, 40)), [0, 1.35, MZ], 54);
  const at: V3 = [lerp(0.2, 0.9, ramp(c.f, 0, 20)), 0, lerp(0.1, 0.6, ramp(c.f, 0, 20))];
  return <BathView pose={pose} S={bath(c, {door: 0.9, inside: 1, lamp: 1 - off * 0.97, tint: off > 0.5 ? 'night' : 'morning'})} exposure={lerp(1.05, 0.7, off)}
    pups={[anyaPup('f40', at, fake(t, {brush: 0, happy: 0.5}), MORN, {opts: {mole: 1}, opacity: 1 - off}), trapPup('t40', trapped(t, {hands: 1, mouth: 0, tremble: 0.5}), NIGHT, {opacity: 0.35 + 0.1 * off})]} />;
};

// ---------- the shot list ----------
// overlays drawn on top of a shot (the delay tags)
const NONE: React.FC<{c: Ctx}> = () => null;
const S03T: React.FC<{c: Ctx}> = NONE;
const S07T: React.FC<{c: Ctx}> = ({c}) => <>{tag('+1 с', ramp(T(c), LS(9), LS(9) + 0.2))}</>;
const S12T: React.FC<{c: Ctx}> = ({c}) => <>{tag('+1,2 с', ramp(c.f, 8, 14))}</>;
const S27T: React.FC<{c: Ctx}> = ({c}) => {
  const lag = lerp(1.6, 0.4, K(c));
  return <>{tag(`+${lag.toFixed(1).replace('.', ',')} с`, ramp(c.f, 4, 10))}</>;
};
const S29T: React.FC<{c: Ctx}> = ({c}) => <>{tag('0,0 с', ramp(c.f, 4, 10), true)}</>;
// «ТУК!» pops on every knock in shot 20
const S20T: React.FC<{c: Ctx}> = ({c}) => {
  const t = T(c);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {[[LS(23) - 0.02, 300, 700, -12], [LS(24) - 0.02, 640, 560, 9]].map(([a, x, y, r], i) => {
        const k = t - a;
        if (k < 0 || k > 0.75) return null;
        const sc = k < 0.1 ? lerp(0.4, 1.15, k / 0.1) : lerp(1.15, 1, clamp((k - 0.1) / 0.1));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`} opacity={clamp((0.75 - k) / 0.25)}>
            <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill="#ff3a3a" stroke="#0b0d12" strokeWidth={14} paintOrder="stroke">ТУК!</text>
          </g>
        );
      })}
    </svg>
  );
};

const C = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20,
  S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32, S33, S34, S35, S36, S37, S38, S39, S40];
const OVERLAY: Record<number, React.FC<{c: Ctx}>> = {20: S20T, 3: S03T, 4: S04T, 7: S07T, 12: S12T, 23: S23T, 27: S27T, 29: S29T};
// key moment of each shot (share of its length) for the storyboard
const KEY: Record<number, number> = {4: 0.85, 6: 0.9, 7: 0.9, 8: 0.7, 10: 0.85, 11: 0.8, 16: 0.6, 18: 0.45, 20: 0.62, 21: 0.75, 22: 0.85, 25: 0.85, 26: 0.8, 28: 0.9, 31: 0.75, 33: 0.8, 36: 0.7, 40: 0.4};
// cold, desaturated shots (the fog overlay goes blue)
export const COLD_SHOTS = new Set([18, 19, 20, 35, 36, 39, 40]);

export const SHOTS = C.map((Comp, i) => {
  const from = CUTS[i], to = CUTS[i + 1];
  return {id: i + 1, C: Comp, O: OVERLAY[i + 1], from, to, key: from + (to - from) * (KEY[i + 1] ?? 0.55)};
});
export const EP_SEC = TOTAL;
void mulberry32;
