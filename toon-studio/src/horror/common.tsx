// Shared pieces for every set: material cache, boxes, the camera rig (camera + fog + tone + post),
// and Puppet: a 2D SVG character anchored at a 3D point with the same camera as the set.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useVideoConfig} from 'remotion';
import {V3} from '../toon/three/toon3d';
import {CamPose, project} from './cam';
import {Look, Post3D} from './post3d';

const mats = new Map<string, THREE.Material>();
export const std = (k: string, make: () => THREE.Material) => { if (!mats.has(k)) mats.set(k, make()); return mats.get(k)!; };
export const rep = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.needsUpdate = true; return t; };
export const matte = (c: string, rough = 0.85) => std(`m${c}${rough}`, () => new THREE.MeshStandardMaterial({color: c, roughness: rough}));
export const glow = (c: string, k = 1) => std(`g${c}${k}`, () => new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(k), toneMapped: false}));

export const Box: React.FC<{s: V3; p: V3; m: THREE.Material; r?: V3; shadow?: boolean}> = ({s, p, m, r, shadow = true}) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

export const CameraRig: React.FC<{pose: CamPose; fog?: [string, number]; exposure?: number; look?: Look}> = ({pose, fog = ['#0b0d18', 0.16], exposure = 1.05, look = {}}) => {
  const {camera, scene, gl} = useThree();
  useLayoutEffect(() => {
    scene.fog = fog[1] > 0 ? new THREE.FogExp2(fog[0], fog[1]) : null;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = exposure;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos); cam.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0); cam.lookAt(...pose.tgt);
    cam.fov = pose.fov; cam.near = 0.03; cam.far = 30; cam.updateProjectionMatrix();
  });
  return (
    <>
      <color attach="background" args={[fog[0]]} />
      <Post3D {...look} />
    </>
  );
};

// a full-frame 3D set
export const Set3D: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 50, near: 0.03, far: 30, position: [0, 1.2, 2.4]}}>
      {children}
    </ThreeCanvas>
  );
};

// 2D layer in screen space: put puppets (sorted far -> near) inside
export const PuppetLayer: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const {width, height} = useVideoConfig();
  return <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
};

// one puppet: SVG drawn in mm around its anchor, placed with the set camera; flip = paper-turn (scaleX)
export const Puppet: React.FC<{pose: CamPose; at: V3; children: React.ReactNode; flip?: number; shadow?: number; opacity?: number; rot?: number}> = ({pose, at, children, flip = 1, shadow = 0, opacity = 1, rot = 0}) => {
  const {width, height} = useVideoConfig();
  const P = project(pose, width, height, at);
  if (P.depth < 0.05) return null;
  const sc = P.pxPerM / 1000;
  return (
    <g opacity={opacity}>
      {shadow > 0 && <ellipse cx={P.x} cy={P.y - 8 * sc} rx={300 * sc} ry={50 * sc} fill="#000" opacity={shadow} style={{filter: 'blur(14px)'}} />}
      <g transform={`translate(${P.x} ${P.y}) rotate(${(P.roll * 180) / Math.PI + rot}) scale(${sc * flip} ${sc})`}>{children}</g>
    </g>
  );
};

export const depthOf = (pose: CamPose, at: V3) => project(pose, 1080, 1920, at).depth;
