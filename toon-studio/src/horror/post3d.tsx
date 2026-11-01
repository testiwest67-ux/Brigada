// Shared 3D post: scene -> bloom (bulbs, light gaps, phone) -> look pass (fisheye, sepia, VHS, glitch) -> tone mapping.
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

const LookShader = {
  uniforms: {tDiffuse: {value: null}, glitch: {value: 0}, seed: {value: 0}, fisheye: {value: 0}, sepia: {value: 0}, vhs: {value: 0}, aspect: {value: 0.5625}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float glitch; uniform float seed; uniform float fisheye; uniform float sepia; uniform float vhs; uniform float aspect;
    varying vec2 vUv;
    float h(float x){ return fract(sin(x * 91.3458 + seed * 47.853) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      // barrel distortion (door peephole)
      if (fisheye > 0.0) {
        vec2 c = uv - 0.5; c.x *= aspect;
        float r2 = dot(c, c);
        c *= 1.0 + fisheye * r2 * 3.2;
        c /= 1.0 + fisheye * 0.55;
        c.x /= aspect; uv = c + 0.5;
      }
      // VHS: wobble lines, tracking band
      if (vhs > 0.0) {
        uv.x += sin(uv.y * 240.0 + seed * 3.0) * 0.0025 * vhs;
        float band = smoothstep(0.0, 0.02, abs(fract(uv.y * 0.7 - seed * 0.031) - 0.5) - 0.47);
        uv.x += (1.0 - band) * 0.02 * vhs * (h(floor(uv.y * 200.0)) - 0.5);
      }
      float bandG = floor(uv.y * 34.0);
      float on = step(1.0 - glitch * 0.35, h(bandG));
      uv.x += on * (h(bandG + 7.0) - 0.5) * 0.12 * glitch;
      float s = 0.008 * glitch + 0.004 * vhs;
      vec4 col = texture2D(tDiffuse, uv);
      col.r = texture2D(tDiffuse, uv + vec2(s, 0.0)).r;
      col.b = texture2D(tDiffuse, uv - vec2(s, 0.0)).b;
      col.rgb += on * glitch * 0.03;
      if (vhs > 0.0) {
        col.rgb += (h(floor(uv.y * 900.0) + floor(uv.x * 3.0)) - 0.5) * 0.06 * vhs;
        col.rgb *= 0.92 + 0.08 * sin(uv.y * 1400.0);
      }
      if (sepia > 0.0) {
        float g = dot(col.rgb, vec3(0.299, 0.587, 0.114));
        vec3 sp = vec3(g * 1.12, g * 0.92, g * 0.68);
        col.rgb = mix(col.rgb, sp, sepia);
      }
      if (fisheye > 0.0 && (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0)) col.rgb = vec3(0.0);
      gl_FragColor = col;
    }`,
};

export type Look = {bloom?: number; glitch?: number; seed?: number; fisheye?: number; sepia?: number; vhs?: number};

export const Post3D: React.FC<Look> = ({bloom = 0.55, glitch = 0, seed = 0, fisheye = 0, sepia = 0, vhs = 0}) => {
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
    u.glitch.value = glitch; u.seed.value = seed; u.fisheye.value = fisheye; u.sepia.value = sepia; u.vhs.value = vhs;
    u.aspect.value = size.width / size.height;
    look.enabled = glitch > 0.01 || fisheye > 0 || sepia > 0 || vhs > 0;
  });
  useFrame(() => composer.render(), 1);
  return null;
};
