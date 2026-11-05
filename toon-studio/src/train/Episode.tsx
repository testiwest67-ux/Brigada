// «Последняя электричка»: the whole short. Shots are cut on their own frames; fog, grain and vignette on top.
// Captions word by word from the voice. Sound: public/poslednyaya-elektrichka/mix.wav (voice.wav until the mix exists).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fog, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import {ensureFont} from '../horror/fonts';
import {COLD_SHOTS, SHOTS} from './shots';
import {CAPTIONS} from './timing';

export const AUDIO = 'poslednyaya-elektrichka/mix.wav';

const Overlay: React.FC<{g: number; fps: number; id: string}> = ({g, fps, id}) => (
  <>
    <Fog t={g / fps} o={COLD_SHOTS.has(id) ? 0.7 : 0.3} tint={COLD_SHOTS.has(id) ? '150,175,195' : '170,175,170'} />
    <Vignette />
    <Grain f={g} o={0.1} />
    <HorrorCaptions lines={CAPTIONS} f={g} fps={fps} />
  </>
);

export const TrainEpisode: React.FC = () => {
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
      <Overlay g={g} fps={fps} id={cur.id} />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};

const ShotHost: React.FC<{C: React.FC<{c: {f: number; t: number; d: number; fps: number; g: number}}>; from: number; d: number}> = ({C, from, d}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill><C c={{f, t: f / fps, d, fps, g: f + from}} /></AbsoluteFill>;
};

// Storyboard: frame n = the key moment of shot n, with subtitles (scripts/keyframes_sheet.py)
export const TrainStoryboard: React.FC = () => {
  ensureFont();
  const n = useCurrentFrame();
  const s = SHOTS[Math.min(n, SHOTS.length - 1)];
  const fps = 30, a = Math.round(s.from * fps), g = Math.round(s.key * fps);
  const C = s.C;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <C c={{f: g - a, t: (g - a) / fps, d: s.to - s.from, fps, g}} />
      <Overlay g={g} fps={fps} id={s.id} />
    </AbsoluteFill>
  );
};
