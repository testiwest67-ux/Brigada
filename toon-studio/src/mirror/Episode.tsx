// «Отражение опаздывает»: the whole short. Shots are cut on their own frames; overlays (delay tags), fog, grain,
// vignette and word-by-word captions on top. Sound: public/otrazhenie/mix.wav (voice.wav until the mix exists).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Fog, Grain, HorrorCaptions, Vignette} from '../horror/fx';
import {ensureFont} from '../horror/fonts';
import {COLD_SHOTS, Ctx, SHOTS} from './shots';
import {CAPTIONS} from './timing';

export const AUDIO = 'otrazhenie/mix.wav';

const Overlay: React.FC<{g: number; fps: number; id: number}> = ({g, fps, id}) => (
  <>
    <Fog t={g / fps} o={COLD_SHOTS.has(id) ? 0.55 : 0.18} tint={COLD_SHOTS.has(id) ? '140,165,200' : '200,195,185'} />
    <Vignette />
    <Grain f={g} o={0.08} />
    <HorrorCaptions lines={CAPTIONS} f={g} fps={fps} />
  </>
);

type Shot = (typeof SHOTS)[number];
const ShotHost: React.FC<{s: Shot; from: number}> = ({s, from}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c: Ctx = {f, t: f / fps, d: s.to - s.from, fps, g: f + from};
  const O = s.O;
  return <AbsoluteFill><s.C c={c} />{O ? <O c={c} /> : null}</AbsoluteFill>;
};

export const MirrorEpisode: React.FC = () => {
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
            <ShotHost s={s} from={a} />
          </Sequence>
        );
      })}
      <Overlay g={g} fps={fps} id={cur.id} />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};

// Storyboard: frame n = the key moment of shot n, with subtitles (scripts/keyframes_sheet.py)
export const MirrorStoryboard: React.FC = () => {
  ensureFont();
  const n = useCurrentFrame();
  const s = SHOTS[Math.min(n, SHOTS.length - 1)];
  const fps = 30, a = Math.round(s.from * fps), g = Math.round(s.key * fps);
  const c: Ctx = {f: g - a, t: (g - a) / fps, d: s.to - s.from, fps, g};
  const O = s.O;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <s.C c={c} />{O ? <O c={c} /> : null}
      <Overlay g={g} fps={fps} id={s.id} />
    </AbsoluteFill>
  );
};
