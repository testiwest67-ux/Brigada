// TEMPLATE 2D episode (16:9 and 9:16): scene 1 kitchen -> blackout on a word, scene 2 standing at the window, call to action.
// Copy this file for a new episode. Scenes are plain components; the episode picks one by time and adds UI + audio on top.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Character, Pose} from '../rig/Character';
import {HERO} from '../rig/style';
import {Room, Table, Mug, PhoneFlat, Lamp, LAMP, WIN} from '../scene/Kitchen';
import {WindowRoom, WIN2} from '../scene/WindowView';
import {Light, Dust} from '../scene/Light';
import {Subtitles, TimePlate, VLine} from '../ui/Captions';
import {clamp, easeInOut, lerp, ramp, wobble} from '../lib/anim';
import {act, BEATS, EX_FPS, EX_SEC, VOICE} from './exampleAct';

export {EX_FPS, EX_SEC};
const AUDIO = 'example/mix.wav'; // made by scripts/sfx.py (voice + sound bed); use 'example/voice.wav' before that

// camera = zoom s around point (cx, cy) of the 1920x1080 set, clamped so the set always fills the frame
const cam = (s: number, cx: number, cy: number) => {
  cx = clamp(cx, 960 / s, 1920 - 960 / s); cy = clamp(cy, 540 / s, 1080 - 540 / s);
  return `translate(960 540) scale(${s}) translate(${-cx} ${-cy})`;
};

const KitchenScene: React.FC<{f: number; fps: number}> = ({f, fps}) => {
  const A = act(f, fps);
  const C = {x: 1095, y: 812};             // pelvis of the seated hero (world px)
  const mug = {x: 1145, y: 778 - 7 * A.mugHop};
  const hand = (dx: number) => ({x: mug.x + dx - C.x, y: mug.y - 40 - C.y - A.jolt * 10});
  const pose: Pose = {
    x: C.x + wobble(A.t * 0.6, 1) * 1.5 - A.win * 6, y: C.y - A.jolt * 9, s: 1,
    breathe: A.breathe, lift: A.tense * 7 + A.jolt * 9, lean: -A.win * 2,
    headTilt: wobble(A.t * 0.8, 2) * 1.6 - A.win * 5, headDx: -A.win * 7, headDy: -A.jolt * 4,
    face: A.face, handL: hand(-44), handR: hand(44), gripL: 'grip', gripR: 'grip',
    footL: {x: -72, y: 250}, footR: {x: 74, y: 252},
  };
  const s = 1 + 0.05 * ramp(f, 0, A.fOff, easeInOut) + 0.1 * ramp(f, A.fOff + 8, BEATS.cut * fps, easeInOut);
  return (
    <g transform={cam(s, 1010 + A.shake.x * 7, lerp(545, 490, A.dark) + A.shake.y * 4)}>
      <Room f={f} fps={fps} offF={A.fOff + 1} dark={A.dark} camShift={0} lit={A.lit} />
      <Character pose={pose} look={HERO} id="hero"
        between={<><Table /><Mug x={mug.x} y={mug.y} t={A.t} steam={1 - A.dark * 0.45} /><PhoneFlat x={1330} y={776} /></>} />
      <Lamp on={A.lamp} swing={Math.sin(2 * Math.PI * A.t / 4.2) * 1.1} />
      <Dust t={A.t} lamp={A.lamp} phone={0} lampX={LAMP.x} />
      <Light lamp={A.lamp} dark={A.dark} phone={0} phonePos={{x: 0, y: 0}} lampPos={{x: LAMP.x, y: LAMP.top + LAMP.len + 40}} win={WIN} />
    </g>
  );
};

const WindowScene: React.FC<{f: number; fps: number}> = ({f, fps}) => {
  const A = act(f, fps);
  const lt = A.t - BEATS.cut;
  const pose: Pose = {
    x: 1222, y: 652, s: 1, breathe: A.breathe, lift: 3, lean: lerp(-2, 0, A.toCam),
    headTilt: lerp(-4, 0, A.toCam) + wobble(A.t * 0.7, 3) * 1.2, headDx: lerp(-6, 0, A.toCam), headDy: A.down * 6,
    face: {...A.face, yaw: lerp(-0.64, 0.05, A.toCam), lookX: lerp(-0.95, 0, A.toCam)},
    handL: {x: -128, y: -46}, handR: {x: 112, y: -4}, gripL: 'grip', gripR: 'open',
    footL: {x: -58, y: 330}, footR: {x: 62, y: 332}, thigh: 165, shin: 172,   // standing legs
  };
  const s = lerp(1.0, 1.12, easeInOut(lt / 6));
  return (
    <g transform={cam(s, lerp(930, 1100, A.toCam), lerp(520, 420, A.toCam))}>
      <WindowRoom f={f} fps={fps} camShift={0} />
      <Character pose={pose} look={HERO} id="hero-w" />
      <Light lamp={0} dark={1} phone={0} phonePos={{x: 0, y: 0}} lampPos={{x: 0, y: -900}} win={WIN2} rim={{x: 1180, y: 430}} />
    </g>
  );
};

export const Example: React.FC<{vertical: boolean}> = ({vertical}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const scene = t < BEATS.cut ? 1 : 2;
  const dip = clamp(1 - Math.abs(t - BEATS.cut) / 0.13);       // short dip to black at the cut
  // 9:16: show a 608x1080 slice of the 16:9 set around the hero
  const view = vertical ? `${(scene === 1 ? 1095 : 1222) - 304} 0 608 1080` : '0 0 1920 1080';
  return (
    <AbsoluteFill style={{background: '#0c0a18'}}>
      <svg width="100%" height="100%" viewBox={view} preserveAspectRatio="xMidYMid slice">
        {scene === 1 ? <KitchenScene f={f} fps={fps} /> : <WindowScene f={f} fps={fps} />}
      </svg>
      <AbsoluteFill style={{background: '#05040c', opacity: dip}} />
      <TimePlate f={f} fps={fps} dayAt={BEATS.day - 0.05} timeAt={BEATS.time} time="21:00" day="ВТОРНИК" />
      <Subtitles lines={VOICE.lines as VLine[]} f={f} fps={fps} total={EX_SEC} bottom={vertical ? 420 : 64} />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};
