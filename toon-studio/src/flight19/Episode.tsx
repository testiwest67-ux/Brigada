// «Неразгаданное #1: Рейс 19» — the whole episode: 31 shots in time with the voice, a slow push-in inside every shot,
// transitions laid OVER the cuts (flash / whip / glitch / dip — the timeline never shrinks, so lips and subtitles stay
// in sync), subtitles on top, and the final sound mix (scripts/flight19_sound.py → public/reys-19/mix.wav).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut} from '../toon/lib/anim';
import {ensureFont} from '../horror/fonts';
import {GlitchBars, Grain, HorrorCaptions, jitter, Vignette} from '../horror/fx';
import {Grade, SvgFx} from './fx2';
import {CAPTIONS, SHOTS, TOTAL} from './Shots';

type Tr = 'cut' | 'flash' | 'whip' | 'glitch' | 'dip' | 'white';
// transition INTO shot n (index = shot number - 1)
const INTO: Tr[] = [
  'dip', 'flash', 'glitch', 'glitch', 'whip', 'white', 'whip', 'whip', 'cut', 'cut',
  'glitch', 'glitch', 'whip', 'cut', 'whip', 'flash', 'cut', 'cut', 'glitch', 'dip',
  'cut', 'flash', 'dip', 'cut', 'whip', 'whip', 'glitch', 'whip', 'whip', 'whip', 'flash',
];
export const EP_SEC = TOTAL;

const Picture: React.FC<{i: number; t: number; f: number}> = ({i, t, f}) => {
  const s = SHOTS[i] as (typeof SHOTS)[number] & {to: number};
  const k = clamp((t - s.from) / Math.max(0.1, s.to - s.from));
  const push = 1 + 0.05 * easeInOut(k);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.html ? s.render(t, easeInOut(k)) : (
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <SvgFx />
          <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>{s.render(t, easeInOut(k))}</g>
        </svg>
      )}
      <Grade g={s.grade ?? 'none'} />
    </AbsoluteFill>
  );
};

export const Flight19Episode: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const t = f / 30;
  let i = SHOTS.findIndex((s, n) => t >= s.from && (n + 1 >= SHOTS.length || t < SHOTS[n + 1].from));
  if (i < 0) i = 0;
  const cutIn = SHOTS[i].from, next = SHOTS[i + 1]?.from ?? Infinity;
  const sinceCut = t - cutIn, toNext = next - t;
  const trIn = INTO[i] ?? 'cut', trOut = INTO[i + 1] ?? 'cut';
  // whip: the outgoing shot slides off to the left in the last 0.16 s, the new one slides in from the right
  const W = 0.16;
  let style: React.CSSProperties = {};
  if (trOut === 'whip' && toNext < W) { const p = easeInOut(1 - toNext / W); style = {transform: `translateX(${-p * 700}px)`, filter: `blur(${p * 18}px)`}; }
  if (trIn === 'whip' && sinceCut < W && i > 0) { const p = easeInOut(sinceCut / W); style = {transform: `translateX(${(1 - p) * 700}px)`, filter: `blur(${(1 - p) * 18}px)`}; }
  const glitchK = (trIn === 'glitch' && sinceCut < 0.22 ? 1 - sinceCut / 0.22 : 0) + (trOut === 'glitch' && toNext < 0.12 ? 1 - toNext / 0.12 : 0);
  if (glitchK > 0) style = {...style, transform: `${style.transform ?? ''} ${jitter(f, glitchK)}`};
  const flash = trIn === 'flash' && i > 0 ? clamp(1 - sinceCut / 0.28) : 0;
  const white = (trIn === 'white' ? clamp(1 - sinceCut / 0.35) : 0) + (trOut === 'white' ? clamp(1 - toNext / 0.25) : 0);
  const dip = (trIn === 'dip' ? clamp(1 - sinceCut / 0.35) : 0) + (trOut === 'dip' ? clamp(1 - toNext / 0.3) : 0) + clamp((t - (TOTAL - 1.2)) / 1.2);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={style}><Picture i={i} t={t} f={f} /></AbsoluteFill>
      <GlitchBars f={f} k={clamp(glitchK)} />
      <Vignette o={0.6} />
      <Grain f={f} o={0.07} />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />}
      {white > 0 && <AbsoluteFill style={{background: '#fffaf0', opacity: clamp(white)}} />}
      {dip > 0 && <AbsoluteFill style={{background: '#000', opacity: clamp(dip)}} />}
      <HorrorCaptions lines={CAPTIONS} f={f} fps={30} y={1370} gapX={40} />
      <Audio src={staticFile('reys-19/mix.wav')} />
    </AbsoluteFill>
  );
};
