// 3D version of the hero rig (same look as rig/style.ts HERO): seated pose, head with eyelids/brows/mouth,
// IK arms with mitten hands, legs. Units = metres, character faces +z, origin = pelvis.
import React from 'react';
import * as THREE from 'three';
import {Look, INK} from '../rig/style';
import {Face} from '../rig/Head';
import {G, Seg, Tm, V3, ik3, toon} from './toon3d';

export type Pose3 = {
  pos: V3;                 // pelvis in world
  breathe: number; lift: number; lean: number; // lift in metres, lean in rad (roll)
  headTilt: number; headYawExtra?: number;
  face: Face;
  handL: V3; handR: V3;    // hand targets, world space
  gripR: 'grip' | 'open';
};

const R = 0.165;                       // head radius
const SH = 0.19, TORSO = 0.535;
const L1 = 0.25, L2 = 0.24;

const TORSO_PTS: [number, number][] = [[0.001, 0], [0.165, 0], [0.188, 0.06], [0.2, 0.22], [0.204, 0.36], [0.19, 0.44], [0.14, 0.5], [0.07, 0.527], [0.001, 0.535]];

// feature placed on the head sphere at yaw a / elevation e, facing outward
const OnHead: React.FC<{a: number; e: number; d?: number; children: React.ReactNode}> = ({a, e, d = R, children}) => (
  <group rotation={new THREE.Euler(-e, a, 0, 'YXZ')}><group position={[0, 0, d]}>{children}</group></group>
);

const Eye: React.FC<{a: number; f: Face; L: Look}> = ({a, f, L}) => {
  const w = 1 + f.wide * 0.18;
  const lid = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(180, 28, f.open) - 90);
  return (
    <OnHead a={a} e={0.02} d={R - 0.02}>
      <group scale={[0.82 * w, 1.05 * w, 0.55]}>
        <Tm geo={G.sphere(0.046)} c={L.eyeWhite} ow={0.0045} />
        <group position={[f.lookX * 0.016, -f.lookY * 0.014 + 0.002, 0.04]} scale={1 - f.wide * 0.3}>
          <mesh geometry={G.sphere(0.02)} material={toon(L.pupil)} />
          <mesh geometry={G.sphere(0.0065)} position={[-0.007, 0.008, 0.016]} material={toon('#ffffff')} />
        </group>
        <Tm geo={G.cap(0.049, Math.PI / 2)} c={L.skin.base} r={[lid, 0, 0]} ow={0.004} />
      </group>
    </OnHead>
  );
};

const Head: React.FC<{f: Face; L: Look}> = ({f, L}) => {
  const browY = 0.36 + f.brow * 0.07;
  const mouthOpen = f.mouthOpen > 0.06;
  return (
    <group scale={[1, 1.06, 0.97]}>
      <Tm geo={G.sphere(R, 48, 32)} c={L.skin.base} />
      {/* ears */}
      {[-1, 1].map((s) => (
        <OnHead key={s} a={s * 1.5} e={-0.02} d={R - 0.01}><Tm geo={G.sphere(0.045)} c={L.skin.base} s={[0.55, 0.85, 0.45]} ow={0.006} /></OnHead>
      ))}
      {/* hair: cap tipped back + fringe tufts + cowlick */}
      <Tm geo={G.cap(R * 1.075, 1.32)} c={L.hair} r={[-0.42, 0, 0]} />
      {[[-0.32, 0.62, 0.05], [-0.05, 0.66, 0.056], [0.25, 0.62, 0.05], [0.5, 0.52, 0.044]].map(([a, e, r], i) => (
        <OnHead key={i} a={a} e={e} d={R * 0.99}><Tm geo={G.sphere(r)} c={L.hair} s={[1.2, 0.62, 0.7]} r={[0, 0, (i - 1.5) * 0.25]} /></OnHead>
      ))}
      <Tm geo={G.cone(0.0, 0.035, 0.07)} c={L.hair} p={[0.02, R * 1.1, -0.01]} r={[0.2, 0, -0.45]} />
      <Tm geo={G.cone(0.0, 0.03, 0.06)} c={L.hair} p={[0.06, R * 1.06, -0.03]} r={[0.1, 0, -0.9]} />
      {/* eyes, brows */}
      {[-1, 1].map((s) => <Eye key={s} a={s * 0.34} f={f} L={L} />)}
      {[-1, 1].map((s) => (
        <OnHead key={s} a={s * 0.34} e={browY} d={R + 0.004}>
          <group rotation={[0, 0, s * f.browTilt * 0.35]}>
            <Seg a={new THREE.Vector3(-0.026, 0, 0)} b={new THREE.Vector3(0.026, 0, 0)} r={0.008} c={L.hair} ow={0} />
          </group>
        </OnHead>
      ))}
      {/* nose + cheeks */}
      <OnHead a={0} e={-0.2} d={R + 0.004}><Tm geo={G.sphere(0.024)} c={L.skin.shade} s={[1, 0.8, 0.7]} ow={0.004} /></OnHead>
      {[-1, 1].map((s) => (
        <OnHead key={s} a={s * 0.52} e={-0.22} d={R - 0.006}><mesh geometry={G.sphere(0.03)} scale={[1, 0.55, 0.3]} material={toon(L.skin.blush)} /></OnHead>
      ))}
      {/* mouth: smile line or open "o" */}
      <OnHead a={0} e={-0.45} d={R - 0.008}>
        {mouthOpen
          ? <Tm geo={G.sphere(0.03)} c={L.mouth} s={[0.75 * f.mouthW, 0.35 + f.mouthOpen * 1.0, 0.45]} ow={0.004} />
          : <mesh geometry={G.torus(0.032, 0.0055, 1.7)} rotation={[0.25, 0, f.smile >= 0 ? -Math.PI / 2 - 0.85 : Math.PI / 2 - 0.85]}
              position={[0, f.smile >= 0 ? 0 : -0.028, 0]} scale={[1, 0.25 + Math.abs(f.smile) * (f.smile >= 0 ? 2.5 : 1.2), 1]} material={toon(INK)} />}
      </OnHead>
    </group>
  );
};

const Hand: React.FC<{at: THREE.Vector3; from: THREE.Vector3; side: number; grip: 'grip' | 'open'; L: Look}> = ({at, from, side, grip, L}) => {
  const dir = new THREE.Vector3().subVectors(at, from).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const open = grip === 'open';
  return (
    <group position={at} quaternion={q}>
      <Tm geo={G.sphere(0.05)} c={L.skin.base} p={[0, 0.04, 0]} s={open ? [1.05, 1.25, 0.6] : [1, 1.05, 0.85]} />
      <Tm geo={G.sphere(0.021)} c={L.skin.base} p={[side * 0.045, 0.03, 0.02]} s={[1, 1.4, 1]} r={[0, 0, -side * 0.5]} />
    </group>
  );
};

export const Hero3D: React.FC<{p: Pose3; L: Look}> = ({p, L}) => {
  const by = 1 + p.breathe * 0.012;
  const top = TORSO * by + p.lift;
  const root = new THREE.Vector3(...p.pos);
  // arm targets are world-space; convert into the character's local frame (it only translates + leans a little)
  const toLocal = (v: V3) => new THREE.Vector3(...v).sub(root);
  const sL = new THREE.Vector3(-SH, top - 0.1, -0.01), sR = new THREE.Vector3(SH, top - 0.1, -0.01);
  const aL = ik3(sL, toLocal(p.handL), L1, L2, new THREE.Vector3(-1, -0.5, -0.6));
  const aR = ik3(sR, toLocal(p.handR), L1, L2, new THREE.Vector3(1, -0.5, -0.6));
  const hip = (s: number) => new THREE.Vector3(s * 0.09, 0.05, 0.02);
  const knee = (s: number) => new THREE.Vector3(s * 0.11, 0.06, 0.4);
  const ankle = (s: number) => new THREE.Vector3(s * 0.12, -0.42, 0.43);
  const f = p.face;

  return (
    <group position={p.pos} rotation={[0, 0, p.lean]}>
      {/* legs + shoes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Seg a={hip(s)} b={knee(s)} r={0.07} c={L.pants} />
          <Seg a={knee(s)} b={ankle(s)} r={0.058} c={L.pants} />
          <Tm geo={G.box(0.11, 0.07, 0.2, 0.033)} c={L.shoes} p={[s * 0.12, -0.47, 0.49]} />
        </group>
      ))}
      {/* torso (hoodie), pocket, hood, strings */}
      <Tm geo={G.lathe('torso', TORSO_PTS)} c={L.top} s={[1, by + p.lift / TORSO, 0.64]} />
      <Tm geo={G.box(0.26, 0.13, 0.03, 0.012)} c={L.topShade} p={[0, 0.12, 0.122]} r={[-0.08, 0, 0]} ow={0.005} />
      <Tm geo={G.torus(0.09, 0.034)} c={L.hood} p={[0, top - 0.03, -0.035]} r={[Math.PI / 2 - 0.25, 0, 0]} s={[1.15, 1, 1]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Seg a={new THREE.Vector3(s * 0.035, top - 0.06, 0.1)} b={new THREE.Vector3(s * 0.04, top - 0.2, 0.128)} r={0.006} c={L.strings} ow={0.003} caps={false} />
          <Tm geo={G.cyl(0.009, 0.026, false)} c={L.strings} p={[s * 0.04, top - 0.21, 0.13]} ow={0.003} />
        </group>
      ))}
      {/* neck + head */}
      <Tm geo={G.cyl(0.048, 0.11, false)} c={L.skin.shade} p={[0, top + 0.025, -0.02]} />
      <group position={[0, top + 0.05, -0.02]} rotation={new THREE.Euler(f.pitch * 0.32, f.yaw * 0.85 + (p.headYawExtra ?? 0), p.headTilt, 'YXZ')}>
        <group position={[0, R * 1.02, 0.01]}>
          <Head f={f} L={L} />
        </group>
      </group>
      {/* arms + hands */}
      <Seg a={sL} b={aL.mid} r={0.056} c={L.top} />
      <Seg a={aL.mid} b={aL.end} r={0.05} c={L.top} />
      <Seg a={sR} b={aR.mid} r={0.056} c={L.top} />
      <Seg a={aR.mid} b={aR.end} r={0.05} c={L.top} />
      <Hand at={aL.end} from={aL.mid} side={1} grip="grip" L={L} />
      <Hand at={aR.end} from={aR.mid} side={-1} grip={p.gripR} L={L} />
    </group>
  );
};
