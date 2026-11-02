// 3D post for «Лишний этаж»: same chain as «Не отвечай» (bloom -> look pass -> output) plus `ripple`:
// the screen ripples like water around the centre when the camera goes through the mirror.
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

const LookShader = {
  uniforms: {tDiffuse: {value: null}, glitch: {value: 0}, seed: {value: 0}, sepia: {value: 0}, ripple: {value: 0}, rtime: {value: 0}, aspect: {value: 0.5625}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float glitch; uniform float seed; uniform float sepia; uniform float ripple; uniform float rtime; uniform float aspect;
    varying vec2 vUv;
    float h(float x){ return fract(sin(x * 91.3458 + seed * 47.853) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      if (ripple > 0.0) {
        vec2 c = uv - 0.5; c.x *= aspect;
        float r = length(c);
        float w = sin(r * 70.0 - rtime * 9.0) * exp(-r * 2.5);
        vec2 dir = r > 0.0001 ? c / r : vec2(0.0);
        c += dir * w * 0.018 * ripple;
        c.x /= aspect; uv = c + 0.5;
      }
      float bandG = floor(uv.y * 34.0);
      float on = step(1.0 - glitch * 0.35, h(bandG));
      uv.x += on * (h(bandG + 7.0) - 0.5) * 0.12 * glitch;
      float s = 0.008 * glitch + 0.006 * ripple;
      vec4 col = texture2D(tDiffuse, uv);
      col.r = texture2D(tDiffuse, uv + vec2(s, 0.0)).r;
      col.b = texture2D(tDiffuse, uv - vec2(s, 0.0)).b;
      col.rgb += on * glitch * 0.03;
      if (ripple > 0.0) col.rgb += vec3(0.25, 0.35, 0.4) * ripple * 0.12 * (0.5 + 0.5 * sin(length(uv - 0.5) * 50.0 - rtime * 9.0));
      if (sepia > 0.0) {
        float g = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        vec3 sp = vec3(g * 1.12, g * 0.92, g * 0.68);
        col.rgb = mix(col.rgb, sp, sepia);
      }
      gl_FragColor = col;
    }`,
};

export type Look = {bloom?: number; glitch?: number; seed?: number; sepia?: number; ripple?: number; rtime?: number};

export const Post: React.FC<Look> = ({bloom = 0.5, glitch = 0, seed = 0, sepia = 0, ripple = 0, rtime = 0}) => {
  const {gl, scene, camera, size} = useThree();
  const [composer, bloomPass, look] = useMemo(() => {
    const c = new EffectComposer(gl, new THREE.WebGLRenderTarget(size.width, size.height, {type: THREE.HalfFloatType, samples: 4}));
    c.addPass(new RenderPass(scene, camera));
    const b = new UnrealBloomPass(new THREE.Vector2(size.width / 2, size.height / 2), 0.7, 0.6, 0.9);
    const g = new ShaderPass(LookShader);
    c.addPass(b); c.addPass(g); c.addPass(new OutputPass());
    return [c, b, g] as const;
  }, [gl, scene, camera]);
  useLayoutEffect(() => { composer.setPixelRatio(1); composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useLayoutEffect(() => {
    bloomPass.strength = bloom;
    const u = look.uniforms;
    u.glitch.value = glitch; u.seed.value = seed; u.sepia.value = sepia; u.ripple.value = ripple; u.rtime.value = rtime;
    u.aspect.value = size.width / size.height;
    look.enabled = glitch > 0.01 || sepia > 0 || ripple > 0.001;
  });
  useFrame(() => composer.render(), 1);
  return null;
};
