// TEMPLATE 3D episode: the same story and acting as Example.tsx (exampleAct.ts), rendered as a toon-shaded Three.js set.
// Needs --gl=angle when rendering (scripts/render.mjs does it).
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {HERO} from '../rig/style';
import {Hero3D, Pose3} from '../three/Hero3D';
import {Room3D, Mug3D, Phone3D, Dust3D, Lights3D} from '../three/Kitchen3D';
import {V3} from '../three/toon3d';
import {Subtitles, TimePlate, VLine} from '../ui/Captions';
import {easeInOut, lerp, ramp, wobble} from '../lib/anim';
import {act, Act, BEATS, EX_SEC, VOICE} from './exampleAct';

const AUDIO = 'example/mix.wav';
// real lights make the flat palette darker: lift the hoodie, soften the eye whites
const LOOK3 = {...HERO, top: '#4a5c96', hood: '#56689f', topShade: '#3a4877', eyeWhite: '#e6e7ee'};
const PELVIS: V3 = [0, 0.55, -0.64];
const MUG: V3 = [0.14, 0.808, -0.27];
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

const Camera: React.FC<{A: Act; f: number; fps: number}> = ({A, f, fps}) => {
  const {camera} = useThree();
  const push = ramp(f, A.fOff + 8, EX_SEC * fps, easeInOut);
  const pos = mix3([0.2, 1.62, 4.3], [0.06, 1.46, 2.9], push);
  const tgt = mix3([0, 1.3, -0.5], [0, 1.22, -0.62], push);
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(pos[0] + A.shake.x * 0.018, pos[1] + A.shake.y * 0.012, pos[2]);
    cam.lookAt(tgt[0], tgt[1], tgt[2]);
    cam.fov = 33; cam.near = 0.05; cam.far = 40; cam.updateProjectionMatrix();
  });
  return null;
};

// scene -> soft bloom (lamp, phone, city windows) -> tone mapping
const Post: React.FC = () => {
  const {gl, scene, camera, size} = useThree();
  const composer = useMemo(() => {
    const c = new EffectComposer(gl, new THREE.WebGLRenderTarget(size.width, size.height, {type: THREE.HalfFloatType, samples: 4}));
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(size.width / 2, size.height / 2), 0.38, 0.5, 0.985));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera]);
  useLayoutEffect(() => { composer.setPixelRatio(1); composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useFrame(() => composer.render(), 1);
  return null;
};

const World: React.FC<{A: Act; f: number; fps: number}> = ({A, f, fps}) => {
  const hop = A.mugHop * 0.02;
  const hand = (dx: number): V3 => [MUG[0] + dx, MUG[1] + 0.065 + hop + A.jolt * 0.03, MUG[2] + 0.01];
  const deg = Math.PI / 180;
  const pose: Pose3 = {
    pos: [PELVIS[0] + wobble(A.t * 0.6, 1) * 0.004 - A.win * 0.015, PELVIS[1] + A.jolt * 0.02, PELVIS[2]],
    breathe: A.breathe, lift: (A.tense * 7 + A.jolt * 9) / 272 * 0.535, lean: A.win * 2 * deg,
    headTilt: -(wobble(A.t * 0.8, 2) * 1.6 - A.win * 5) * deg,
    face: A.face, handL: hand(-0.085), handR: hand(0.085), gripR: 'grip',
  };
  return (
    <>
      <color attach="background" args={['#0c0a18']} />
      <Camera A={A} f={f} fps={fps} />
      <Post />
      <Lights3D lamp={A.lamp} dark={A.dark} glow={0} phone={[0, 0, 0]} />
      <Room3D f={f} t={A.t} offF={A.fOff + 1} dark={A.dark} lit={A.lit} lamp={A.lamp} swing={Math.sin(2 * Math.PI * A.t / 4.2) * 0.012} />
      <Hero3D p={pose} L={LOOK3} />
      <Mug3D p={[MUG[0], MUG[1] + hop, MUG[2]]} t={A.t} steam={1 - A.dark * 0.45} />
      <Phone3D p={[0.42, 0.813, -0.2]} r={[Math.PI / 2, 0.35, 0]} glow={0} />
      <Dust3D t={A.t} o={A.lamp} />
    </>
  );
};

export const Example3D: React.FC = () => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const A = act(f, fps);
  return (
    <AbsoluteFill style={{background: '#0c0a18'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 33, near: 0.05, far: 40, position: [0, 1.5, 4]}}>
        <World A={A} f={f} fps={fps} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(8,6,20,0.5) 100%)'}} />
      <TimePlate f={f} fps={fps} dayAt={BEATS.day - 0.05} timeAt={BEATS.time} time="21:00" day="ВТОРНИК" />
      <Subtitles lines={VOICE.lines as VLine[]} f={f} fps={fps} total={EX_SEC} />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};
