// «Ночная смена»: the whole short. Shots are cut on their own frames; fog, grain and vignette sit on top.
// Voice, sound and captions get added after the voice-over stage.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fog, Grain, Vignette} from '../horror/fx';
import {ensureFont} from '../horror/fonts';
import {ensureHand} from './hand';
import {COLD_SHOTS, SHOTS} from './shots';

export const ShiftEpisode: React.FC = () => {
  ensureFont(); ensureHand();
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
      <Fog t={g / fps} o={COLD_SHOTS.has(cur.id) ? 0.8 : 0.35} tint={COLD_SHOTS.has(cur.id) ? '140,190,230' : '170,180,165'} />
      <Vignette />
      <Grain f={g} o={0.1} />
    </AbsoluteFill>
  );
};

const ShotHost: React.FC<{C: React.FC<{c: {f: number; t: number; d: number; fps: number; g: number}}>; from: number; d: number}> = ({C, from, d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill><C c={{f, t: f / fps, d, fps, g: f + from}} /></AbsoluteFill>;
};
