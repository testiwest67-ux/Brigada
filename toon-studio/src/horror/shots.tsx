// The 21 shots of «Не отвечай». Each shot gets its local time and draws its own 3D set + 2D puppets.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {blinkAt, clamp, easeInOut, easeOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {CameraRig, Puppet, PuppetLayer, Set3D} from './common';
import {CamPose} from './cam';
import {HALL, HallSet, HallState} from './Hall3D';
import {BED, Bedroom3D, KIT, Landing3D, OldKitchen3D} from './sets';
import {Tema, TemaLight, TemaState} from './Tema';
import {Fist, Grandma, Mom, ReachHand, Thing, ThingState} from './chars';
import {FONT} from './fonts';

export type Ctx = {f: number; t: number; d: number; fps: number; g: number};

const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const cam = (pos: V3, tgt: V3, fov: number, roll = 0): CamPose => ({pos, tgt, fov, roll});
const hand = (t: number, s = 1, k = 0.006): V3 => [wobble(t * 0.9, s) * k, wobble(t * 0.8, s + 3) * k * 0.8, 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const tema = (t: number, o: Partial<TemaState> = {}): TemaState =>
  ({t, blink: 1, lookX: 0, lookY: 0, fear: 0.6, mouth: 0.15, breathe: Math.sin(t * 4.5), hands: 0, turn: 0, tremble: 0.8, ...o});
const thing = (t: number, o: Partial<ThingState> = {}): ThingState =>
  ({t, mouth: 0, smile: 0.6, tilt: 12, sway: Math.sin(t * 0.7), eyes: 1, breathe: Math.sin(t * 1.3), ...o});

const NIGHT: TemaLight = {bright: 0.55, warmRim: 0.4, coldRim: 0.75, cold: 0.8};
const HALLLIT = (bulb: number): TemaLight => ({bright: 0.3 + 0.42 * bulb, warmRim: 0.9, coldRim: 0.5, cold: 0.75});
const PHONE: TemaLight = {bright: 0.62, warmRim: 0.1, coldRim: 0.9, cold: 0.95};
const SEPIA: TemaLight = {bright: 0.85, warmRim: 0.7, coldRim: 0.1, cold: 0};

export const bulbFlicker = (g: number, drops: number[] = []) => {
  const r = mulberry32(Math.floor(g / 2) + 11)();
  let v = 0.78 + (r - 0.5) * 0.08;
  for (const d of drops) if (g >= d && g <= d + 3) v = 0.08 + r * 0.1;
  return v;
};
const hallS = (c: Ctx, o: Partial<HallState> = {}): HallState =>
  ({t: c.g / c.fps, bulb: bulbFlicker(c.g, [205, 640, 700]), stair: 0.95, moon: 0.9, feet: 0.02 + Math.sin(c.g / c.fps * 2.2) * 0.015, handle: 0, ...o});

// screen-space helpers
const TimeCard: React.FC<{text: string; o: number}> = ({text, o}) => (
  <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', opacity: o}}>
    <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 110, color: '#ff3326', letterSpacing: 10, textShadow: '0 0 30px rgba(255,40,30,0.8), 0 6px 0 #000', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{text}</span>
  </div>
);
const Breath: React.FC<{x: number; y: number; t: number; s?: number; o?: number}> = ({x, y, t, s = 1, o = 0.5}) => (
  <g opacity={o}>
    {[0, 1, 2].map((i) => {
      const k = ((t * 0.9 + i / 3) % 1);
      return <ellipse key={i} cx={x + k * 60 * s} cy={y - k * 80 * s} rx={(20 + k * 60) * s} ry={(12 + k * 34) * s} fill="#dfe6ff" opacity={(1 - k) * 0.35} style={{filter: `blur(${8 * s}px)`}} />;
    })}
  </g>
);

// ---------------- 1. bedroom door: knock + "Тёма." ----------------
export const S01: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const sh = kick(c.f, 6, c.fps, 7, 7) + kick(c.f, 18, c.fps, 7, 7);
  const pose = cam(add(mix3([0.15, 1.05, -0.5], [0.3, 0.95, 0.15], k), [sh * 0.01, sh * 0.006, 0]), [0.6, 0.75, 1.6], lerp(50, 44, k));
  return (
    <Set3D>
      <CameraRig pose={pose} fog={['#06070f', 0.12]} look={{bloom: 0.12}} />
      <Bedroom3D S={{t: c.g / c.fps, moon: 0.45, gap: 0.6, feet: lerp(0.45, -0.02, ramp(c.f, 0, 40, easeOut)), clockOn: 1, blanketUp: 0}} />
    </Set3D>
  );
};

// ---------------- 2. eyes snap open on the pillow: "Мам?" ----------------
export const S02: React.FC<{c: Ctx}> = ({c}) => {
  const z = ramp(c.f, 0, 7, easeOut);
  const pose = cam(add([-1.0, 1.32, -1.0], hand(c.t, 2, 0.004)), [-1.0, 0.56, -1.28], lerp(44, 24, z));
  const open = ramp(c.f, 3, 7);
  const s = tema(c.t, {blink: open, fear: lerp(0.2, 0.75, ramp(c.f, 5, 14)), lookX: lerp(0, 0.5, ramp(c.f, 12, 22)), mouth: lerp(0.05, 0.4, ramp(c.f, 14, 20)), tremble: 0.4, breathe: Math.sin(c.t * 6)});
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#06070f', 0.1]} />
        <Bedroom3D S={{t: c.g / c.fps, moon: 0.85, gap: 1, feet: 0, clockOn: 1, blanketUp: 0}} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={BED.head}>
          <g transform="translate(0 1235)">
            <Tema s={s} light={NIGHT} crop={-985} id="t2" />
            <path d="M -330 -1010 C -200 -960 200 -960 330 -1010 L 360 -860 L -360 -860 Z" fill="#6d2a30" stroke="#14121c" strokeWidth={7} />
            <path d="M -330 -990 C -200 -945 200 -945 330 -990" stroke="#2a3060" strokeWidth={18} fill="none" opacity={0.6} />
          </g>
        </Puppet>
        {/* moonlight bars from the window cross */}
        <rect x={0} y={0} width={1080} height={1920} fill="url(#bars)" opacity={0.35} style={{mixBlendMode: 'multiply'}} />
        <defs>
          <linearGradient id="bars" x1="0" x2="1" y1="0" y2="0.3">
            <stop offset="0.38" stopColor="#fff" /><stop offset="0.4" stopColor="#000" /><stop offset="0.46" stopColor="#000" /><stop offset="0.48" stopColor="#fff" />
          </linearGradient>
        </defs>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 3. wide from the top corner: 03:00, mom on shift (the Thing in the corner, barely) ----------------
export const S03: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(mix3([1.2, 2.3, 1.4], [1.35, 2.4, 1.52], k), [-0.75, 0.6, -0.75], lerp(56, 64, k));
  const sit = ramp(c.f, 4, 22, easeOut);
  const s = tema(c.t, {fear: 0.55, lookX: 0.6, lookY: 0.2, turn: 0.3, blink: blinkAt(c.f, [50], 6), hands: 0});
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#070912', 0.1]} />
        <Bedroom3D S={{t: c.g / c.fps, moon: 0.9, gap: 0.8, feet: 0, clockOn: 1, blanketUp: sit}} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={BED.corner} opacity={0.35}>
          <Thing s={thing(c.t, {smile: 0.2, eyes: 0.5})} light={{bright: 1.6, warmRim: 0, coldRim: 0.4, cold: 1}} id="th3" />
        </Puppet>
        <Puppet pose={pose} at={[-1.0, lerp(-0.25, 0.04, sit), -0.95]}>
          <Tema s={s} light={NIGHT} crop={-470} id="t3" />
          <path d="M -420 -380 C -420 -560 420 -560 420 -380 Z" fill="#4a1d24" stroke="#14121c" strokeWidth={7} />
          <path d="M -300 -470 L -330 -380 M -60 -505 L -70 -380 M 180 -495 L 200 -380 M -400 -430 L 400 -430" stroke="#1d2550" strokeWidth={22} opacity={0.6} />
        </Puppet>
      </PuppetLayer>
      <TimeCard text="03:00" o={ramp(c.f, 6, 14) * (1 - ramp(c.f, c.d * c.fps - 10, c.d * c.fps))} />
    </AbsoluteFill>
  );
};

// ---------------- 4. hallway rush to the front door: "А в дверь… стучат." ----------------
export const S04: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps * 0.75, (x) => x * x * x);
  const sh = kick(c.f, 40, c.fps, 8, 6) + kick(c.f, 47, c.fps, 8, 6) + kick(c.f, 54, c.fps, 8, 6);
  const pose = cam(add(mix3([0.0, 1.3, 2.6], [0.04, 1.28, -1.55], k), [sh * 0.02, sh * 0.012, 0]), [0.05, 1.15, -3], lerp(52, 44, k), sh * 0.012);
  return (
    <Set3D>
      <CameraRig pose={pose} look={{glitch: clamp(sh * 0.6)}} />
      <HallSet S={hallS(c, {handle: sh * 0.08})} />
    </Set3D>
  );
};

// ---------------- 5. flashback: grandma by the stove, finger to her lips ----------------
export const S05: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(mix3([1.05, 1.45, 1.3], [0.55, 1.4, 1.45], k), [0.08, 1.15, -0.75], 46);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#120c08', 0.08]} exposure={0.75} look={{sepia: 1, bloom: 0.35}} />
        <OldKitchen3D S={{t: c.t, candle: 1}} />
      </Set3D>
      <PuppetLayer style={{filter: 'sepia(1) saturate(0.8) brightness(0.95)'}}>
        <Puppet pose={pose} at={KIT.gran}>
          <Grandma s={{t: c.t, blink: blinkAt(c.f, [30], 6), worry: 0.3, mouth: 0.05, breathe: Math.sin(c.t * 2), shh: ramp(c.f, 6, 26, easeOut), narrow: 0.35, lookX: 0}} light={SEPIA} id="g5" />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 6. grandma's face, push to the lips: the rule ----------------
export const S06: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([0.32, 1.33, 0.55], [0.1, 1.24, -0.22], k), hand(c.t, 5, 0.003)), mix3([0.08, 1.3, -0.75], [0.08, 1.2, -0.75], k), 40);
  const gl = clamp(1 - Math.abs(c.t - 3.4) / 0.15);
  const talk = 0.25 + 0.25 * Math.abs(Math.sin(c.t * 9));
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#120c08', 0.08]} exposure={0.75} look={{sepia: 1, bloom: 0.35, glitch: gl, seed: c.g}} />
        <OldKitchen3D S={{t: c.t, candle: 1}} />
      </Set3D>
      <PuppetLayer style={{filter: 'sepia(1) saturate(0.8) brightness(0.95)'}}>
        <Puppet pose={pose} at={KIT.gran}>
          <Grandma s={{t: c.t, blink: blinkAt(c.f, [20, 110], 6), worry: 0.1, mouth: talk, breathe: Math.sin(c.t * 2), shh: 0, narrow: 0.6, lookX: 0.15}} light={SEPIA} id="g6" />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 7. top-down: grandma's knuckles on the table, two… and one ----------------
const KNOCKS7 = [0.55, 0.9, 1.75];
export const S07: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam([0.02, 1.62, 0.42], [0.02, 0.78, 0.18], 44);
  const lift = Math.min(...KNOCKS7.map((k) => Math.abs(c.t - k) * 6), 1);
  const hits = KNOCKS7.filter((k) => c.t >= k).length;
  const sh = KNOCKS7.reduce((a, k) => a + kick(c.f, k * c.fps, c.fps, 9, 9), 0);
  const posed = add(pose.pos, [0, sh * 0.006, 0]);
  const p2 = {...pose, pos: posed};
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={p2} fog={['#120c08', 0.06]} exposure={0.7} look={{sepia: 1, bloom: 0.25}} />
        <OldKitchen3D S={{t: c.t, candle: 0.45}} />
      </Set3D>
      <PuppetLayer style={{filter: 'sepia(1) saturate(0.8)'}}>
        <Puppet pose={p2} at={[0.12, 0.79 + lift * 0.05, 0.2]} rot={-20}>
          <g transform="scale(0.55)"><Fist sleeve="#6d6a66" /></g>
        </Puppet>
      </PuppetLayer>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 240, color: '#fff',
        WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: '0 0 40px rgba(0,0,0,0.9)', letterSpacing: 20}}>
        <span style={{opacity: hits >= 2 ? 1 : hits === 1 ? 0.35 : 0}}>2</span>
        <span style={{opacity: hits >= 3 ? 1 : 0, color: '#ff2a2a'}}> + 1</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 8. the front door from inside, the handle jerks: mom's voice ----------------
export const S08: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = cam(add(mix3([-0.05, 1.2, 0.3], [0.0, 1.15, -0.7], k), hand(c.t, 7)), [0.15, 1.0, -3], 50);
  const rattle = c.f > 10 && c.f < 70 ? Math.sin(c.f * 1.7) * 0.2 : 0;
  return (
    <Set3D>
      <CameraRig pose={pose} />
      <HallSet S={hallS(c, {handle: rattle})} />
    </Set3D>
  );
};

// ---------------- 9. Tyoma in the hall, palms at the mouth (the style test shot) ----------------
const TEMA_HALL: V3 = [0.14, 0, 0.12];
export const S09: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, 22, easeInOut);
  const pose = cam(add([-0.1, lerp(0.6, 1.2, k), 2.2], hand(c.t)), mix3([0.05, 0.12, -3], [0.12, 1.15, 0.0], k), 48);
  const S = hallS(c);
  const s = tema(c.t, {fear: 0.9, hands: ramp(c.f, 18, 34, easeInOut), mouth: 0.4, lookX: -0.3, tremble: 2, blink: blinkAt(c.f, [50], 6), breathe: Math.sin(c.t * 8)});
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} />
        <HallSet S={{...S, feet: lerp(0.0, 0.25, ramp(c.f, 0, 40))}} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={TEMA_HALL} shadow={0.5}>
          <Tema s={s} light={HALLLIT(S.bulb)} id="t9" />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 10. he leans to the peephole, the camera dives in ----------------
const AT_DOOR: V3 = [-0.14, 0, -2.6];
export const S10: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 6, c.d * c.fps, (x) => x * x * x);
  const pose = cam(mix3([0.25, 1.5, -1.25], [HALL.door.x, 1.52, -2.9], k), mix3([0.0, 1.45, -3], [HALL.door.x, 1.52, -3.1], k), lerp(50, 30, k));
  const S = hallS(c);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={AT_DOOR}>
          <Tema s={tema(c.t, {hands: 0.6})} light={HALLLIT(S.bulb)} view="back" id="t10" />
        </Puppet>
      </PuppetLayer>
      <AbsoluteFill style={{background: '#000', opacity: ramp(c.f, c.d * c.fps - 5, c.d * c.fps)}} />
    </AbsoluteFill>
  );
};

// ---------------- 11. peephole: mom on the landing, pale, shivering ----------------
export const S11: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0, 1.52, 0.07], hand(c.t, 9, 0.004)), [0, 1.42, 2], 92);
  const lamp = c.f % 37 < 3 || (c.f > 40 && c.f < 44) ? 0.15 : 0.9;
  const s = {t: c.t, blink: blinkAt(c.f, [25], 5), worry: 0.95, mouth: 0.1 + 0.2 * Math.abs(Math.sin(c.t * 7)) * (c.t < 1.2 ? 1 : 0), breathe: Math.sin(c.t * 5), knock: 0, shiver: 3, lookX: 0, lookY: -0.2};
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#0d0b06', 0.08]} look={{fisheye: 1, bloom: 0.6}} />
        <Landing3D S={{t: c.t, lamp}} />
      </Set3D>
      <PuppetLayer style={{filter: 'url(#none)'}}>
        <Puppet pose={pose} at={[0.0, 0, 0.58]}>
          <Mom s={s} light={{bright: 0.45 + 0.5 * lamp, warmRim: 0.7, coldRim: 0.2, cold: 0.3}} id="m11" />
          <Breath x={20} y={-1430} t={c.t} s={3} o={0.9} />
        </Puppet>
      </PuppetLayer>
      {/* the peephole lens */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 470px, rgba(0,0,0,0.85) 500px, #000 530px)'}} />
    </AbsoluteFill>
  );
};

// ---------------- 12. mom's knuckles on the door, outside: two… and one ----------------
const KNOCKS12 = [0.35, 0.7, 1.55];
export const S12: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.42, 1.32, 0.6], hand(c.t, 11, 0.004)), [0.0, 1.3, 0.05], 36);
  const away = Math.min(...KNOCKS12.map((k) => Math.abs(c.t - k) * 5), 1);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#0d0b06', 0.08]} />
        <Landing3D S={{t: c.t, lamp: 0.9}} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={[0.06 + away * 0.07, 1.3, 0.12]} flip={-1}>
          <g transform="scale(0.5)"><Fist sleeve="#b49a76" skin="#ecd0c0" /></g>
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 13. his hand to the lock… freezes ----------------
export const S13: React.FC<{c: Ctx}> = ({c}) => {
  const pose = cam(add([0.68, 1.26, -2.45], hand(c.t, 13, 0.003)), [0.36, 1.2, -3.0], 34);
  const reach = ramp(c.f, 0, 22, easeOut);
  const frozen = c.f > 24;
  const gl = clamp(1 - Math.abs(c.f - 26) / 3);
  const S = hallS(c);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} look={{glitch: gl, seed: c.g}} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={[lerp(0.75, 0.47, reach) + (frozen ? Math.sin(c.t * 40) * 0.003 : 0), 1.18, -2.82]} rot={-8}>
          <g transform="scale(0.55)" filter="brightness(0.6)"><ReachHand curl={frozen ? lerp(0.1, 0.6, ramp(c.f, 24, 34)) : 0.1} /></g>
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 14–17, 18–19: Tyoma at the door facing it, the apartment (and the Thing) behind him ----------------
const TEMA_DOOR: V3 = [0.05, 0, -1.75];
const THING_AT: V3 = [0.02, 0, -1.05];
const doorCam = (c: Ctx, from: V3, to: V3, fov: [number, number], kk: number): CamPose =>
  cam(add(mix3(from, to, kk), hand(c.t, 15, 0.004)), [0.05, 1.28, -1.75], lerp(fov[0], fov[1], kk));
const PhoneInHands: React.FC<{glow: number}> = ({glow}) => (
  <g transform="translate(0 -720) scale(0.8)">
    <rect x={-70} y={-120} width={140} height={250} rx={22} fill="#0d0f19" stroke="#14121c" strokeWidth={7} />
    <rect x={-58} y={-106} width={116} height={222} rx={14} fill={`rgba(200,225,255,${0.4 + 0.6 * glow})`} />
    <ellipse cx={0} cy={-200} rx={260} ry={220} fill="rgba(170,205,255,0.16)" style={{filter: 'blur(30px)'}} />
  </g>
);

export const S14: React.FC<{c: Ctx}> = ({c}) => {
  const z = ramp(c.f, 0, 8, easeOut);
  const buzz = c.t < 1.2 ? Math.sin(c.t * 90) * 0.004 : 0;
  const pose = doorCam(c, [0.02, 1.15, -2.9], [0.04, 1.2, -2.8], [66, 54], z);
  const S = hallS(c, {phone: 1, phoneAt: [0.05, 1.0, -1.9], bulb: 0.35});
  const s = tema(c.t, {hands: 0.3, fear: 0.7, lookY: 0.7, mouth: 0.2, tremble: 1.2, blink: blinkAt(c.f, [40], 5)});
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={{...pose, pos: add(pose.pos, [buzz, 0, 0])}} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={TEMA_DOOR}>
          <Tema s={s} light={PHONE} id="t14" />
          <PhoneInHands glow={c.t < 1.2 ? 0.6 + 0.4 * Math.abs(Math.sin(c.t * 10)) : 1} />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 15. the phone screen: the message types itself (the Thing reflected in the glass) ----------------
const MSG = 'Тёма, открой!!! ОНО У ТЕБЯ ЗА СПИНОЙ';
export const S15: React.FC<{c: Ctx}> = ({c}) => {
  const n = Math.floor(clamp((c.t - 0.3) / 1.9) * MSG.length);
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const reflect = 0.06 + 0.1 * ramp(c.f, 40, 80);
  return (
    <AbsoluteFill style={{background: '#04050a', transform: `scale(${lerp(1.0, 1.12, k)})`}}>
      <div style={{position: 'absolute', left: 90, right: 90, top: 140, bottom: 140, borderRadius: 90, background: '#0b0d14', border: '10px solid #1a1c26', boxShadow: '0 0 160px rgba(140,180,255,0.35)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#141a2a, #0e1220)'}} />
        <div style={{position: 'absolute', top: 70, left: 0, right: 0, height: 170, background: '#1b2236', display: 'flex', alignItems: 'center', gap: 30, padding: '0 50px'}}>
          <div style={{width: 100, height: 100, borderRadius: 50, background: '#b49a76', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#3a2a20'}}>М</div>
          <div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: '#f2f4fa'}}>Мама</div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 36, color: '#7fb0ff'}}>{n < MSG.length ? 'печатает…' : 'в сети'}</div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 330, left: 60, maxWidth: 640, padding: '26px 34px', borderRadius: 34, background: '#252c42', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#c9cfe0'}}>
          Я после смены зайду утром ❤
          <div style={{fontSize: 28, color: '#7d869e', textAlign: 'right', marginTop: 8}}>21:40</div>
        </div>
        {n > 0 && (
          <div style={{position: 'absolute', top: 560, left: 60, right: 90, padding: '34px 40px', borderRadius: 34, background: '#2c3550', fontFamily: FONT, fontWeight: 900, fontSize: 74, lineHeight: 1.12, color: '#fff'}}>
            {MSG.slice(0, Math.min(n, 15))}
            <span style={{color: '#ff2a2a'}}>{n > 16 ? MSG.slice(16, n) : ''}</span>
            {n < MSG.length && <span style={{opacity: Math.floor(c.f / 6) % 2 ? 1 : 0}}>|</span>}
            <div style={{fontSize: 30, color: '#8b95b0', textAlign: 'right', marginTop: 10}}>03:07</div>
          </div>
        )}
        {/* the glass reflects what stands behind him */}
        <svg width={900} height={1640} style={{position: 'absolute', inset: 0, opacity: reflect, mixBlendMode: 'screen'}}>
          <g transform="translate(560 1700) scale(0.62)"><Thing s={thing(c.t, {smile: 0.9})} light={{bright: 2.2, warmRim: 0, coldRim: 1, cold: 0}} id="th15" /></g>
        </svg>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.07), rgba(255,255,255,0) 40%)'}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------- 16. "Не оборачивайся": he starts to turn, two dots blink in the dark behind ----------------
export const S16: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = doorCam(c, [0.03, 1.28, -2.72], [0.05, 1.32, -2.55], [40, 33], k);
  const S = hallS(c, {phone: 1, phoneAt: [0.05, 1.0, -1.9], bulb: 0.2});
  const turn = lerp(0, 0.85, ramp(c.f, 20, 60, easeInOut));
  const s = tema(c.t, {hands: 0.3, fear: 1, turn, lookX: lerp(0, 0.9, ramp(c.f, 15, 50)), mouth: 0.3, tremble: 2.5, breathe: Math.sin(c.t * 9)});
  const eyesOn = c.f > 30 && !(c.f > 52 && c.f < 57);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={THING_AT} opacity={0.12}>
          <Thing s={thing(c.t, {eyes: 0})} light={{bright: 0.3, warmRim: 0, coldRim: 0.1, cold: 1}} id="th16" />
        </Puppet>
        {eyesOn && (
          <Puppet pose={pose} at={[THING_AT[0], 2.25, THING_AT[2]]}>
            <circle cx={-52} cy={0} r={9} fill="#f6e9c3" /><circle cx={52} cy={6} r={9} fill="#f6e9c3" />
            <circle cx={-52} cy={0} r={26} fill="#f6e9c3" opacity={0.15} /><circle cx={52} cy={6} r={26} fill="#f6e9c3" opacity={0.15} />
          </Puppet>
        )}
        <Puppet pose={pose} at={TEMA_DOOR}>
          <Tema s={s} light={PHONE} id="t16" />
          <PhoneInHands glow={1} />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 17. silence: almost black, only his breath ----------------
export const S17: React.FC<{c: Ctx}> = ({c}) => {
  const pose = doorCam(c, [0.05, 1.32, -2.55], [0.05, 1.32, -2.53], [33, 33], 0);
  const fade = 1 - ramp(c.f, 0, 20) * 0.85;
  const S = hallS(c, {phone: 0.25 * fade, phoneAt: [0.05, 1.0, -1.9], bulb: 0, stair: 0.3, moon: 0.2});
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} exposure={0.7} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={TEMA_DOOR}>
          <Tema s={tema(c.t, {hands: 0.3, fear: 1, turn: 0.85, lookX: 0.9, tremble: 1.5})} light={{...PHONE, bright: 0.25 * fade + 0.05}} id="t17" />
          <Breath x={60} y={-1120} t={c.t} s={2.4} o={0.9} />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 18. dolly zoom: the camera pulls back through the door while zooming in —
// Tyoma keeps his size, the hall stretches and the Thing behind him grows over him ----------------
const VERT_W = 2 * 1.0 * Math.tan((58 * Math.PI) / 360); // frame height at Tyoma, kept constant
export const dollyPose = (c: Ctx, k: number): CamPose => {
  const d = lerp(1.0, 2.9, k);
  const fov = (2 * Math.atan(VERT_W / (2 * d)) * 180) / Math.PI;
  return cam(add([0.05, 1.28, TEMA_DOOR[2] - d], hand(c.t, 17, 0.002)), [0.04, lerp(1.28, 1.5, k), TEMA_DOOR[2]], fov, lerp(0, 0.03, k));
};
export const S18: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const pose = dollyPose(c, k);
  const S = hallS(c, {phone: 1, phoneAt: [0.05, 1.0, -1.9], bulb: 0.05 + 0.5 * (c.f % 23 < 2 ? 1 : 0), stair: 0.6, moon: 0.4, noDoor: true});
  const reveal = ramp(c.f, 10, c.d * c.fps);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={THING_AT} opacity={lerp(0.3, 1, reveal)}>
          <Thing s={thing(c.t, {smile: lerp(0.3, 0.8, reveal), eyes: 1})} light={{bright: lerp(0.8, 1.7, reveal), warmRim: 0, coldRim: 0.9, cold: 1}} id="th18" />
        </Puppet>
        <Puppet pose={pose} at={TEMA_DOOR}>
          <Tema s={tema(c.t, {hands: 0.3, fear: 1, tremble: 2, lookX: 0.6, turn: 0.4, mouth: 0.35})} light={PHONE} id="t18" />
          <PhoneInHands glow={1} />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 19. the reveal: up over his head to the Thing's face, its mouth moves with the narrator's voice ----------------
export const S19: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, c.d * c.fps, easeInOut);
  const base = dollyPose(c, 1);
  const pose = cam(mix3(base.pos, [0.06, 2.1, -1.95], k), mix3(base.tgt, [0.02, 2.2, -1.05], k), lerp(base.fov, 46, k));
  const S = hallS(c, {phone: 1, phoneAt: [0.05, 1.0, -1.9], bulb: 0.05, stair: 0.6, moon: 0.4, noDoor: true});
  const talk = 0.15 + 0.5 * Math.abs(Math.sin(c.t * 8.5)) * (Math.sin(c.t * 2.1) > -0.6 ? 1 : 0.2);
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} />
        <HallSet S={S} />
      </Set3D>
      <PuppetLayer>
        <Puppet pose={pose} at={THING_AT}>
          <Thing s={thing(c.t, {mouth: talk, smile: lerp(0.8, 1, k)})} light={{bright: 1.75, warmRim: 0.05, coldRim: 1, cold: 1}} id="th19" />
        </Puppet>
        <Puppet pose={pose} at={TEMA_DOOR}>
          <Tema s={tema(c.t, {hands: 0.3, fear: 1, tremble: 2.5, lookX: 0.6, turn: 0.4, mouth: 0.45})} light={PHONE} id="t19" />
        </Puppet>
      </PuppetLayer>
    </AbsoluteFill>
  );
};

// ---------------- 20. VHS rewind to the first second: now the Thing is in the room ----------------
export const S20: React.FC<{c: Ctx}> = ({c}) => {
  const rew = c.t < 1.3;
  const pose = rew ? cam([1.25, 2.33, 1.45], [-0.75, 0.6, -0.75], 58) : cam([0.84, 0.97, 0.85], [0.92, 0.95, 1.6], 38);
  const osd = rew ? '◀◀ REW' : '▶ PLAY';
  const tc = rew ? `00:00:0${Math.max(0, 5 - Math.floor(c.t * 4))}` : `00:00:0${Math.min(1, Math.floor((c.t - 1.3) * 1.2))}`;
  return (
    <AbsoluteFill>
      <Set3D>
        <CameraRig pose={pose} fog={['#06070f', 0.1]} look={{vhs: rew ? 1 : 0.55, seed: c.g, glitch: rew ? 0.3 : 0}} />
        <Bedroom3D S={{t: rew ? 3 - c.t * 2 : c.t, moon: 0.85, gap: 1, feet: 0, clockOn: 1, blanketUp: rew ? 0.8 : 0, doorOpen: rew ? 0 : 0.18}} />
      </Set3D>
      <PuppetLayer>
        {rew ? (
          <Puppet pose={pose} at={BED.corner} opacity={0.9}>
            <Thing s={thing(c.t, {smile: 1, eyes: 1})} light={{bright: 1.8, warmRim: 0, coldRim: 0.9, cold: 1}} id="th20" />
          </Puppet>
        ) : (
          <Puppet pose={pose} at={[BED.door.x + BED.door.w / 2 - 0.02, 1.12, BED.door.z - 0.06]} rot={-90}>
            {/* long fingers curling round the edge of the door */}
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M 0 ${i * 26} q 60 -10 110 6 q 30 10 40 40`} stroke="#0c0a11" strokeWidth={16} strokeLinecap="round" fill="none" />)}
          </Puppet>
        )}
      </PuppetLayer>
      <div style={{position: 'absolute', top: 120, left: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 64, color: '#e8f0ff', textShadow: '3px 3px 0 #000, 0 0 12px rgba(200,220,255,0.6)'}}>{osd}</div>
      <div style={{position: 'absolute', bottom: 300, right: 80, fontFamily: 'monospace', fontWeight: 700, fontSize: 52, color: '#e8f0ff', textShadow: '3px 3px 0 #000'}}>{tc}</div>
    </AbsoluteFill>
  );
};

// ---------------- 21. its face fills the frame: "Привет, Тёма." Black. One knock. ----------------
export const S21: React.FC<{c: Ctx}> = ({c}) => {
  const k = ramp(c.f, 0, 60, (x) => x * x);
  const pose = cam(add(mix3([0.05, 2.12, -2.1], [0.03, 2.25, -1.42], k), hand(c.t, 21, 0.004)), [0.02, 2.24, -1.05], 42);
  const S = hallS(c, {phone: 0.8, phoneAt: [0.05, 1.0, -1.9], bulb: 0, stair: 0.6, moon: 0.3});
  const black = c.f >= 62;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {!black && (
        <>
          <Set3D>
            <CameraRig pose={pose} look={{glitch: clamp((c.f - 52) / 10) * 0.8, seed: c.g}} />
            <HallSet S={S} />
          </Set3D>
          <PuppetLayer>
            <Puppet pose={pose} at={THING_AT}>
              <Thing s={thing(c.t, {mouth: c.t > 0.4 && c.t < 1.5 ? 0.3 + 0.3 * Math.abs(Math.sin(c.t * 8)) : 0.1, smile: lerp(0.8, 1.0, k), tilt: lerp(12, 22, k), eyes: 1})} light={{bright: 1.8, warmRim: 0, coldRim: 1, cold: 1}} id="th21" />
            </Puppet>
          </PuppetLayer>
        </>
      )}
    </AbsoluteFill>
  );
};

export const SHOTS: {id: string; from: number; to: number; C: React.FC<{c: Ctx}>; fog?: number}[] = [
  {id: '01', from: 0.0, to: 1.6, C: S01},
  {id: '02', from: 1.6, to: 2.8, C: S02},
  {id: '03', from: 2.8, to: 6.0, C: S03},
  {id: '04', from: 6.0, to: 8.0, C: S04},
  {id: '05', from: 8.0, to: 10.5, C: S05, fog: 0.4},
  {id: '06', from: 10.5, to: 15.5, C: S06, fog: 0.3},
  {id: '07', from: 15.5, to: 18.5, C: S07, fog: 0.2},
  {id: '08', from: 18.5, to: 21.5, C: S08},
  {id: '09', from: 21.5, to: 24.0, C: S09},
  {id: '10', from: 24.0, to: 26.0, C: S10},
  {id: '11', from: 26.0, to: 28.5, C: S11, fog: 0.3},
  {id: '12', from: 28.5, to: 31.0, C: S12, fog: 0.3},
  {id: '13', from: 31.0, to: 33.0, C: S13},
  {id: '14', from: 33.0, to: 35.5, C: S14},
  {id: '15', from: 35.5, to: 38.5, C: S15, fog: 0},
  {id: '16', from: 38.5, to: 41.5, C: S16},
  {id: '17', from: 41.5, to: 42.7, C: S17},
  {id: '18', from: 42.7, to: 46.0, C: S18},
  {id: '19', from: 46.0, to: 49.5, C: S19},
  {id: '20', from: 49.5, to: 53.0, C: S20, fog: 0.3},
  {id: '21', from: 53.0, to: 56.0, C: S21},
];
export const EP_SEC = 56;
