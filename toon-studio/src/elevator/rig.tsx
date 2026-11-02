// Camera rig for «Лишний этаж» (own post with the mirror ripple) and portal clips:
// a 2D puppet that stands behind a portal (the lift door gap, the mirror) is clipped to that portal's screen polygon,
// so the 3D frame around the portal hides it like real geometry would.
import React, {useLayoutEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useVideoConfig} from 'remotion';
import {V3} from '../toon/three/toon3d';
import {CamPose, project} from '../horror/cam';
import {Look, Post} from './post';

export const Rig: React.FC<{pose: CamPose; fog?: [string, number]; exposure?: number; look?: Look}> = ({pose, fog = ['#0b0d12', 0.12], exposure = 1.05, look = {}}) => {
  const {camera, scene, gl} = useThree();
  useLayoutEffect(() => {
    scene.fog = fog[1] > 0 ? new THREE.FogExp2(fog[0], fog[1]) : null;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = exposure;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos); cam.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0); cam.lookAt(...pose.tgt);
    cam.fov = pose.fov; cam.near = 0.03; cam.far = 30; cam.updateProjectionMatrix();
  });
  return (
    <>
      <color attach="background" args={[fog[0]]} />
      <Post {...look} />
    </>
  );
};

// screen polygon of a 3D quad (corners in order); corners behind the camera are pushed just in front of it
export const ClipQuad: React.FC<{id: string; pose: CamPose; quad: V3[]}> = ({id, pose, quad}) => {
  const {width, height} = useVideoConfig();
  const pts = quad.map((q) => project(pose, width, height, q));
  if (pts.some((p) => p.depth < 0.02)) return <clipPath id={id}><rect x={-99999} y={-99999} width={199998} height={199998} /></clipPath>;
  return <clipPath id={id}><polygon points={pts.map((p) => `${p.x},${p.y}`).join(' ')} /></clipPath>;
};
