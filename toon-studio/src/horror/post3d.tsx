// Shared 3D post: scene -> bloom (bulbs, light gaps, phone) -> glitch (slice shift + RGB split) -> tone mapping.
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

const GlitchShader = {
  uniforms: {tDiffuse: {value: null}, amount: {value: 0}, seed: {value: 0}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float amount; uniform float seed; varying vec2 vUv;
    float h(float x){ return fract(sin(x * 91.3458 + seed * 47.853) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      float band = floor(uv.y * 34.0);
      float on = step(1.0 - amount * 0.55, h(band));
      uv.x += on * (h(band + 7.0) - 0.5) * 0.18 * amount;
      float s = 0.012 * amount;
      vec4 c = texture2D(tDiffuse, uv);
      c.r = texture2D(tDiffuse, uv + vec2(s, 0.0)).r;
      c.b = texture2D(tDiffuse, uv - vec2(s, 0.0)).b;
      c.rgb += on * amount * 0.08;
      gl_FragColor = c;
    }`,
};

export const Post3D: React.FC<{bloom?: number; glitch?: number; seed?: number}> = ({bloom = 0.55, glitch = 0, seed = 0}) => {
  const {gl, scene, camera, size} = useThree();
  const [composer, bloomPass, glitchPass] = useMemo(() => {
    const c = new EffectComposer(gl, new THREE.WebGLRenderTarget(size.width, size.height, {type: THREE.HalfFloatType, samples: 4}));
    c.addPass(new RenderPass(scene, camera));
    const b = new UnrealBloomPass(new THREE.Vector2(size.width / 2, size.height / 2), 0.7, 0.6, 0.9);
    const g = new ShaderPass(GlitchShader);
    c.addPass(b); c.addPass(g); c.addPass(new OutputPass());
    return [c, b, g] as const;
  }, [gl, scene, camera]);
  useLayoutEffect(() => { composer.setPixelRatio(1); composer.setSize(size.width, size.height); }, [composer, size.width, size.height]);
  useLayoutEffect(() => {
    bloomPass.strength = bloom;
    glitchPass.uniforms.amount.value = glitch; glitchPass.uniforms.seed.value = seed;
    glitchPass.enabled = glitch > 0.01;
  });
  useFrame(() => composer.render(), 1);
  return null;
};
