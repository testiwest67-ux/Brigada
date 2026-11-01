// One camera description shared by the 3D canvas and the 2D overlays: a 2D character anchored at a 3D point
// is projected with exactly the same camera, so it sits inside the set and gets real parallax.
import * as THREE from 'three';
import {V3} from '../toon/three/toon3d';

export type CamPose = {pos: V3; tgt: V3; fov: number; roll: number};

const cam = new THREE.PerspectiveCamera();
const v = new THREE.Vector3();

const place = (p: CamPose, aspect: number) => {
  cam.position.set(...p.pos); cam.up.set(Math.sin(p.roll), Math.cos(p.roll), 0); cam.lookAt(...p.tgt);
  cam.fov = p.fov; cam.aspect = aspect; cam.near = 0.03; cam.far = 30;
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
};

// screen position (px) of a world point, its depth (m) and how many px one metre is at that depth
export const project = (p: CamPose, w: number, h: number, pt: V3) => {
  place(p, w / h);
  v.set(...pt).project(cam);
  const depth = v.set(...pt).applyMatrix4(cam.matrixWorldInverse).z * -1;
  v.set(...pt).project(cam);
  const pxPerM = (h / 2) / Math.tan((p.fov * Math.PI) / 360) / Math.max(0.05, depth);
  return {x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, depth, pxPerM, roll: p.roll};
};
