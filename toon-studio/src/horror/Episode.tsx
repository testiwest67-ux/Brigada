// «Не отвечай»: the whole short. Shots are cut on their own frames; fog, grain and vignette sit on top of every shot.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ensureFont} from './fonts';
import {Fog, Grain, HorrorCaptions, Vignette} from './fx';
import {CAPTIONS} from './timing';
import {SHOTS} from './shots';

export const Episode: React.FC = () => {
  ensureFont();
  const g = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cur = SHOTS.find((s) => g >= Math.round(s.from * fps) && g < Math.round(s.to * fps)) ?? SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SHOTS.map((s) => {
        const a = Math.round(s.from * fps), b = Math.round(s.to * fps);
        return (
          <Sequence key={s.id} from={a} durationInFrames={b - a} layout="none">
            <ShotHost C={s.C} from={a} d={s.to - s.from} />
          </Sequence>
        );
      })}
      <Fog t={g / fps} o={cur.fog ?? 0.7} />
      <Vignette />
      <Grain f={g} o={0.1} />
      <HorrorCaptions lines={CAPTIONS} f={g} fps={fps} />
      <Audio src={staticFile('ne-otvechai/mix.wav')} />
    </AbsoluteFill>
  );
};

const ShotHost: React.FC<{C: React.FC<{c: {f: number; t: number; d: number; fps: number; g: number}}>; from: number; d: number}> = ({C, from, d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill><C c={{f, t: f / fps, d, fps, g: f + from}} /></AbsoluteFill>;
};
