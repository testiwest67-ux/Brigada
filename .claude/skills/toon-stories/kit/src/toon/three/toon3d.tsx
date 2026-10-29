// 3D toon kit: banded toon shading + inverted-hull ink outline (same ink as the 2D look), cached geometries,
// and small building blocks (meshes with outline, limb segments between two points).
import React from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {INK} from '../rig/style';

export type V3 = [number, number, number];
export const OW3 = 0.009; // outline thickness in metres (~5 px in the medium shot)

const grad = (() => {
  const t = new THREE.DataTexture(new Uint8Array([125, 190, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

const mats = new Map<string, THREE.Material>();
export const toon = (c: string, map?: THREE.Texture) => {
  const k = `t${c}${map ? map.uuid : ''}`;
  if (!mats.has(k)) mats.set(k, new THREE.MeshToonMaterial({color: c, gradientMap: grad, map: map ?? null}));
  return mats.get(k)!;
};
export const basic = (c: string, opts: THREE.MeshBasicMaterialParameters = {}) => {
  const k = `b${c}${JSON.stringify(opts)}`;
  if (!mats.has(k)) mats.set(k, new THREE.MeshBasicMaterial({color: c, ...opts}));
  return mats.get(k)!;
};
export const outline = (w: number, c = INK) => {
  const k = `o${w.toFixed(4)}${c}`;
  if (!mats.has(k)) mats.set(k, new THREE.ShaderMaterial({
    uniforms: {w: {value: w}, c: {value: new THREE.Color(c)}},
    vertexShader: 'uniform float w; void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * w, 1.0); }',
    fragmentShader: 'uniform vec3 c; void main(){ gl_FragColor = vec4(c, 1.0); }',
    side: THREE.BackSide,
  }));
  return mats.get(k)!;
};

const geos = new Map<string, THREE.BufferGeometry>();
const g = (k: string, make: () => THREE.BufferGeometry) => { if (!geos.has(k)) geos.set(k, make()); return geos.get(k)!; };
export const G = {
  sphere: (r: number, ws = 32, hs = 24) => g(`s${r}${ws}`, () => new THREE.SphereGeometry(r, ws, hs)),
  cap: (r: number, theta: number) => g(`c${r}${theta}`, () => new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, theta)),
  cyl: (r: number, h = 1, open = true) => g(`y${r}${h}${open}`, () => new THREE.CylinderGeometry(r, r, h, 24, 1, open)),
  cone: (r0: number, r1: number, h: number) => g(`k${r0}${r1}${h}`, () => new THREE.CylinderGeometry(r0, r1, h, 32)),
  box: (x: number, y: number, z: number, r = 0.02) => g(`b${x}${y}${z}${r}`, () => new RoundedBoxGeometry(x, y, z, 3, Math.min(r, x / 2.01, y / 2.01, z / 2.01))),
  torus: (R: number, r: number, arc = Math.PI * 2) => g(`o${R}${r}${arc}`, () => new THREE.TorusGeometry(R, r, 12, 32, arc)),
  lathe: (k: string, pts: [number, number][]) => g(`l${k}`, () => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 40)),
  plane: (x: number, y: number) => g(`p${x}${y}`, () => new THREE.PlaneGeometry(x, y)),
};

type TmProps = {
  geo: THREE.BufferGeometry; c?: string; mat?: THREE.Material;
  p?: V3; r?: V3; s?: V3 | number; ow?: number; shadow?: boolean; order?: THREE.EulerOrder;
  children?: React.ReactNode;
};
// toon mesh + ink hull; outline width is given in world units and corrected for the mesh scale
export const Tm: React.FC<TmProps> = ({geo, c = '#ffffff', mat, p, r, s = 1, ow = OW3, shadow = true, order, children}) => {
  const sc: V3 = typeof s === 'number' ? [s, s, s] : s;
  const avg = (sc[0] + sc[1] + sc[2]) / 3;
  return (
    <group position={p} rotation={r ? new THREE.Euler(r[0], r[1], r[2], order ?? 'XYZ') : undefined} scale={sc}>
      <mesh geometry={geo} material={mat ?? toon(c)} castShadow={shadow} receiveShadow />
      {ow > 0 && <mesh geometry={geo} material={outline(ow / avg)} />}
      {children}
    </group>
  );
};

// limb tube between two points: open cylinder + joint spheres, one ink hull per piece
const UP = new THREE.Vector3(0, 1, 0);
export const Seg: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r: number; c: string; ow?: number; caps?: boolean}> = ({a, b, r, c, ow = OW3, caps = true}) => {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = Math.max(1e-4, d.length());
  const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  return (
    <>
      <group position={mid} quaternion={q} scale={[1, len, 1]}>
        <mesh geometry={G.cyl(r)} material={toon(c)} castShadow receiveShadow />
        {ow > 0 && <mesh geometry={G.cyl(r + ow)} material={outline(0)} />}
      </group>
      {caps && <Tm geo={G.sphere(r)} c={c} p={a.toArray() as V3} ow={ow} />}
      {caps && <Tm geo={G.sphere(r)} c={c} p={b.toArray() as V3} ow={ow} />}
    </>
  );
};

// two-bone IK in 3D: elbow goes toward `pole`
export const ik3 = (a: THREE.Vector3, t: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3) => {
  const d0 = new THREE.Vector3().subVectors(t, a);
  const d = THREE.MathUtils.clamp(d0.length(), Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.999);
  const u = d0.normalize();
  const end = a.clone().addScaledVector(u, d);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const perp = pole.clone().addScaledVector(u, -pole.dot(u)).normalize();
  const mid = a.clone().addScaledVector(u, along).addScaledVector(perp, h);
  return {mid, end};
};

// canvas textures (made once)
const texs = new Map<string, THREE.Texture>();
export const canvasTex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  if (!texs.has(k)) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d')!);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    texs.set(k, t);
  }
  return texs.get(k)!;
};
