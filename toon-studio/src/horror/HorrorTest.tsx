// 5-second style test for «Не отвечай» (shots 8–9): 3D hallway + 2D Tyoma placed by the scene camera.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {blinkAt, clamp, easeInOut, kick, lerp, mulberry32, ramp, wobble} from '../toon/lib/anim';
import {V3} from '../toon/three/toon3d';
import {Hall3D, HallState} from './Hall3D';
import {CamPose, project} from './cam';
import {Tema, TemaState} from './Tema';
import {CapLine, Fog, GlitchBars, Grain, HorrorCaptions, Vignette, jitter} from './fx';
import {ensureFont} from './fonts';

export const TEST_SEC = 5;
const KNOCK = 72; // frame of the hard knock

// bare bulb flicker: steady with small buzz, a few dropouts
const bulbAt = (f: number) => {
  const r = mulberry32(Math.floor(f / 2) + 11)();
  let v = 0.78 + (r - 0.5) * 0.08;
  if ((f >= 44 && f <= 47) || (f >= 100 && f <= 103) || f === 107) v = 0.08 + r * 0.1;
  if (f >= KNOCK && f <= KNOCK + 2) v = 1;
  return v;
};

const camAt = (f: number, fps: number): CamPose => {
  const t = f / fps, k = ramp(f, 0, TEST_SEC * fps, easeInOut);
  const sh = kick(f, KNOCK, fps, 9, 7);
  return {
    pos: [lerp(-0.16, -0.08, k) + wobble(t * 0.9, 1) * 0.006 + sh * 0.02, 1.2 + wobble(t * 0.8, 4) * 0.005 + sh * 0.012, lerp(2.45, 1.95, k)],
    tgt: [lerp(0.02, 0.08, k), lerp(1.12, 1.18, k), -3],
    fov: lerp(50, 46, k), roll: wobble(t * 0.5, 2) * 0.004 + sh * 0.01,
  };
};

const CAPS: CapLine[] = [
  {start: 0.25, end: 2.3, words: [{w: 'ЭТО', t: 0.3}, {w: 'ГОЛОС', t: 0.55}, {w: 'МАМЫ.', t: 0.95, red: true}]},
  {start: 2.55, end: 5, words: [{w: 'НО', t: 2.6}, {w: 'ТЫ', t: 2.8}, {w: 'МОЛЧИШЬ.', t: 3.05, red: true}]},
];

const TEMA_FEET: V3 = [0.14, 0, 0.12];

export const HorrorTest: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = f / fps;
  const pose = camAt(f, fps);
  const bulb = bulbAt(f);
  const glitch = clamp(1 - Math.abs(f - KNOCK - 1) / 3) * 0.9;

  const S: HallState = {
    t, bulb, stair: 0.95 + Math.sin(t * 40) * 0.03, moon: 0.9,
    feet: lerp(0.9, 0.02, ramp(f, 8, 52, easeInOut)) + Math.sin(t * 2.2) * 0.015,
    handle: (f > 22 && f < 66 ? Math.sin(f * 1.7) * 0.18 * clamp((f - 22) / 6) * clamp((66 - f) / 6) : 0) + kick(f, KNOCK, fps, 6, 8) * 0.1,
  };

  const fear = lerp(0.45, 1, ramp(f, KNOCK - 2, KNOCK + 8));
  const look = f < 54 ? {x: 0.05, y: 0.05} : f < KNOCK ? {x: -0.95, y: -0.1} : {x: lerp(-0.6, 0.15, ramp(f, KNOCK + 10, KNOCK + 30)), y: 0.1};
  const ts: TemaState = {
    t, blink: blinkAt(f, [18, 96, 131], 6), lookX: look.x, lookY: look.y, fear,
    mouth: lerp(0.15, 0.55, ramp(f, KNOCK, KNOCK + 6)), breathe: Math.sin(t * (f > KNOCK ? 9 : 4.5)),
    hands: ramp(f, KNOCK + 2, KNOCK + 20, easeInOut), turn: f < 54 ? 0 : f < KNOCK ? -0.7 : lerp(-0.7, 0, ramp(f, KNOCK + 8, KNOCK + 26)),
    tremble: f > KNOCK ? 2.5 : 0.6,
  };
  const P = project(pose, width, height, TEMA_FEET);
  const sc = P.pxPerM / 1000; // svg units are mm

  return (
    <AbsoluteFill style={{background: '#06070d'}}>
      <ThreeCanvas width={width} height={height} shadows gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 50, near: 0.03, far: 30, position: [0, 1.2, 2.4]}}>
        <Hall3D S={S} pose={pose} glitch={glitch} seed={f} />
      </ThreeCanvas>
      <AbsoluteFill style={{transform: jitter(f, glitch)}}>
        {/* contact shadow on the floor under the 2D puppet */}
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          <ellipse cx={P.x} cy={P.y - 8 * sc} rx={300 * sc} ry={50 * sc} fill="#000" opacity={0.55} style={{filter: 'blur(14px)'}} />
          <g transform={`translate(${P.x} ${P.y}) rotate(${(P.roll * 180) / Math.PI}) scale(${sc})`}>
            <Tema s={ts} light={{bright: 0.3 + 0.42 * bulb, warmRim: 0.9, coldRim: 0.55 * S.moon, cold: 0.75}} />
          </g>
        </svg>
      </AbsoluteFill>
      <Fog t={t} o={0.8} />
      <Vignette />
      <Grain f={f} />
      <GlitchBars f={f} k={glitch} />
      <HorrorCaptions lines={CAPS} f={f} fps={fps} />
    </AbsoluteFill>
  );
};
