// Stickman example (~7 s, 16:9): night rooftop, "what if" thinking -> whip pan -> dawn, seven days later,
// sitting on the parapet half asleep while the 168-hours card rolls up. Beats come from stickexample.voice.json.
// Shows: Stickman + poses/expressions with blends, themes, Rooftop set, whip transition, NumberCard, TimePlate, subtitles.
// Also here: StickPoses (one still with every pose and expression) and InfoCards (all infographics, 2 s each).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './stickexample.voice.json';
import {Stickman, StickHead, STICK, STICK_RED, STICK_BLUE, STICK_YELLOW, STICK_PURPLE} from '../rig/Stickman';
import {poseAt, exprAt, makePose, alive, addPart, POSES, EXPR, PoseName, ExprName, walkCycle, runCycle, face as mkFace} from '../lib/poses';
import {THEMES, cutPair} from '../lib/fx';
import {Grade, FxGroup, FxOverlay} from '../scene/FxLayers';
import {Sky, Skyline, Rooftop, ROOF} from '../scene/Rooftop';
import {NumberCard, Counter, Compare, BlueprintCard, TitleCard, EndScreen, drawOn} from '../ui/Info';
import {Subtitles, TimePlate, VLine, MONT} from '../ui/Captions';
import {blinkAt, clamp, easeInOut, lerp, ramp, wobble} from '../lib/anim';

export const SX_FPS = 30;
export const SX_SEC = Math.ceil(voice.total * 10) / 10;
const L = (i: number) => voice.lines[i];
const W = (w: string) => voice.lines.flatMap((l) => l.words).find((x) => x.w.toLowerCase().startsWith(w))!.t;
export const SX = {cut: L(1).start - 0.12, think: W('что') + 0.05, sleep: W('спать') - 0.12, hours: W('сто') - 0.08, last: W('часов')};

const CAM = (s: number, cx: number, cy: number) => {
  cx = clamp(cx, 960 / s, 1920 - 960 / s); cy = clamp(cy, 540 / s, 1080 - 540 / s);
  return `translate(960 540) scale(${s}) translate(${-cx} ${-cy})`;
};
const rimTo = (from: {x: number; y: number}, to: {x: number; y: number}) => (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;

// ---- scene 1: night, standing on the roof; idle -> hand to chin (thinking) -> palms open "what if" with a hopeful face
const S1: React.FC<{t: number; f: number; fps: number}> = ({t, f, fps}) => {
  const th = THEMES.night;
  const s = 0.95, at = {x: 820, y: ROOF.stand - STICK.sole * s, s};
  const body = poseAt(t, [[0, 'idle'], [SX.think + 0.2, 'think'], [SX.sleep, 'whatif']], 0.5);
  const turn = ramp(t, SX.think, SX.think + 0.5, easeInOut) * (1 - ramp(t, SX.sleep - 0.1, SX.sleep + 0.35, easeInOut));
  const face = {...exprAt(t, [[0, 'neutral'], [SX.think + 0.2, 'thinking'], [SX.sleep + 0.05, {open: 1, wide: 0.35, brow: 0.7, browTilt: 0.1, mouthW: 0.95, mouthOpen: 0.32, smile: 0.7}]], 0.35),
    yaw: lerp(0.06, 0.42, turn), pitch: lerp(0, -0.3, turn), lookX: lerp(0, 0.75, turn), lookY: lerp(0.05, -0.8, turn)};
  face.open *= blinkAt(f, [12, Math.round((SX.think + 0.9) * fps), Math.round((SX.sleep + 0.7) * fps)]);
  const pose = makePose(at, addPart(body, alive(t, 1)), face, {headTilt: (body.headTilt ?? 0) + wobble(t * 0.8, 2) * 1.2 - turn * 3});
  const head = {x: at.x, y: at.y - STICK.head * s};
  const cs = lerp(1.04, 1.12, easeInOut(t / SX.cut));
  return (
    <g transform={CAM(cs, 900, 560)}>
      <Sky theme={th} t={t} id="s1sky" />
      <Skyline theme={th} t={t} shift={-t * 6} />
      <Rooftop theme={th} t={t} />
      <Stickman pose={pose} look={STICK_RED} id="s1" rim={{ang: rimTo(head, th.celestial), color: th.rim, k: 0.95}} />
    </g>
  );
};

// ---- scene 2: dawn a week later, sitting on the parapet, eyes falling shut, head nodding
const S2: React.FC<{t: number; f: number; fps: number}> = ({t, f, fps}) => {
  const th = THEMES.dusk;
  const lt = t - SX.cut;
  const s = 0.9, at = {x: 1290, y: ROOF.parapet - 6, s};
  const nod = Math.max(0, Math.sin(lt * 2.1 - 0.6)) * ramp(lt, 0.4, 1.2);       // slow nods off
  const sink = ramp(t, SX.last - 0.2, SX.last + 0.5, easeInOut);                  // on "часов": nearly asleep
  const body = poseAt(t, [[0, 'sit'], [SX.cut + 0.9, 'sitLean']], 0.7);
  const face = {...exprAt(t, [[0, 'tired'], [SX.last, {open: 0.22, brow: -0.2, browTilt: 0.5, mouthW: 0.7, mouthOpen: 0.12, smile: -0.2}]], 0.5),
    yaw: -0.22, pitch: 0.2 + nod * 0.35, lookX: -0.3, lookY: 0.35};
  face.open *= blinkAt(f, [Math.round((SX.cut + 1.0) * fps), Math.round((SX.hours + 0.6) * fps)], 12);
  const pose = makePose(at, addPart(body, alive(lt, 3, 0.7)), face, {headTilt: -4 + nod * 9 + sink * 5, headDy: 6 + nod * 8 + sink * 6, lift: (body.lift ?? 0) - sink * 6});
  const head = {x: at.x, y: at.y - STICK.head * s};
  const cs = lerp(1.18, 1.26, easeInOut(lt / (SX_SEC - SX.cut)));
  return (
    <g transform={CAM(cs, 1130, 560)}>
      <Sky theme={th} t={t} id="s2sky" />
      <Skyline theme={th} t={t} shift={lt * 5} />
      <Rooftop theme={th} t={t} tank={false} />
      <Stickman pose={pose} look={STICK_RED} id="s2" shadow={0} rim={{ang: rimTo(head, th.celestial), color: th.rim, k: 0.9}} />
    </g>
  );
};

const AUDIO = 'stick-example/mix.wav'; // made by scripts/sfx.py (voice + sound bed); use 'stick-example/voice.wav' before that

export const StickExample: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const first = t < SX.cut;
  const cut = cutPair(t, SX.cut, 'whip', 0.42);
  return (
    <AbsoluteFill style={{background: '#0c0a18'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {cut.showOut && <FxGroup fx={cut.out} id="c1o"><S1 t={t} f={f} fps={fps} /><Grade theme={THEMES.night} id="g1" /></FxGroup>}
        {cut.showIn && <FxGroup fx={cut.in} id="c1i"><S2 t={t} f={f} fps={fps} /><Grade theme={THEMES.dusk} id="g2" /></FxGroup>}
      </svg>
      <FxOverlay fx={cut.overlay} />
      {first
        ? <TimePlate key="p1" f={f} fps={fps} dayAt={0.1} timeAt={0.3} time="23:40" day="ДЕНЬ 1" />
        : <TimePlate key="p2" f={f} fps={fps} dayAt={SX.cut + 0.15} timeAt={SX.cut + 0.35} time="05:40" day="ДЕНЬ 7" />}
      <NumberCard f={f} fps={fps} at={SX.hours} value={168} caption="ЧАСОВ БЕЗ СНА" x={640} y={210} dur={1.3} />
      <Subtitles lines={voice.lines as VLine[]} f={f} fps={fps} total={SX_SEC} />
      <Audio src={staticFile(AUDIO)} />
    </AbsoluteFill>
  );
};

// ---- contact sheet of the acting library: every pose, walk/run phases and every expression (one still to check them all)

export const StickPoses: React.FC = () => {
  const names = Object.keys(POSES) as PoseName[];
  const looks = [STICK_RED, STICK_BLUE, STICK_YELLOW, STICK_PURPLE];
  const s = 0.4, gap = 1920 / 10;
  const cell = (i: number, label: string, node: React.ReactNode) => (
    <g key={label}>{node}<text x={gap * ((i % 9) + 1)} y={i < 9 ? 452 : 862} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={20} fill="#cfd3ea">{label}</text></g>
  );
  const items = [...names.map((n) => ({n, part: POSES[n] as object})),
    {n: 'walk', part: walkCycle(0.2)}, {n: 'run', part: runCycle(0.15)}];
  return (
    <AbsoluteFill style={{background: '#1b2040'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {items.map(({n, part}, i) => {
          const g = i < 9 ? 420 : 830;
          const at = {x: gap * ((i % 9) + 1), y: g - STICK.sole * s, s};
          const yaw = n === 'walk' || n === 'run' ? 0.5 : n === 'point' ? 0.3 : 0;
          const p = makePose(at, part, mkFace(n === 'scared' ? 'scared' : n === 'cheer' ? 'happy' : 'neutral', {yaw}), {});
          if ('bob' in part) p.y += (part as {bob: number}).bob * s;
          return cell(i, n, <Stickman pose={p} look={looks[i % 4]} id={`ps${i}`} rim={{ang: -50, color: '#a9bcff', k: 0.8}} />);
        })}
        {(Object.keys(EXPR) as ExprName[]).map((e, i) => (
          <g key={e}>
            <g transform={`translate(${130 + i * 166} ${960}) scale(0.62)`}>
              <StickHead face={mkFace(e, {yaw: i % 3 === 1 ? 0.35 : 0})} look={looks[i % 4]} id={`ex${i}`} rim={{ang: -50, color: '#a9bcff', k: 0.8}} />
            </g>
            <text x={130 + i * 166} y={1062} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={20} fill="#cfd3ea">{e}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---- the other infographics, 2 s each over a themed backdrop (stills at 50, 110, 170, 230 check them)
export const InfoCards: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const seg = Math.floor(t / 2), at = seg * 2 + 0.1, out = seg * 2 + 1.85;
  const th = [THEMES.night, THEMES.gold, THEMES.neon, THEMES.fairytale][seg] ?? THEMES.dusk;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <Sky theme={th} t={t} id="isky" /><Skyline theme={th} t={t} /><Rooftop theme={th} t={t} />
        <Grade theme={th} id="ig" />
      </svg>
      {seg === 0 && <>
        <Counter f={f} fps={fps} at={at} out={out} to={8760} label="ЧАСОВ В ГОДУ" x={520} y={140} />
        <Compare f={f} fps={fps} at={at + 0.2} out={out} x={1300} y={150} w={860} title="СОН ЗА НЕДЕЛЮ" unit=" ч"
          a={{label: 'НОРМА', value: 56}} b={{label: 'ТЫ', value: 0}} />
      </>}
      {seg === 1 && <BlueprintCard f={f} fps={fps} at={at} out={out} title="МОЗГ БЕЗ СНА" no="02" dur={1.2}
        labels={[{x: 330, y: 120, text: 'КОРА', at: at + 0.9}, {x: 900, y: 445, text: '−30 % ВНИМАНИЯ', at: at + 1.2}]}>
        {(k) => <>
          <path d="M 300 380 C 260 220 420 140 560 170 C 700 120 860 200 840 330 C 900 430 780 500 660 480 C 560 540 400 520 360 470 C 280 470 260 420 300 380 Z" style={drawOn(k, 1700)} />
          <path d="M 560 170 C 520 260 600 300 560 380 M 420 260 C 470 300 450 360 500 400 M 700 240 C 660 300 740 340 700 420" style={drawOn(k * 1.2 - 0.2, 900)} />
          <path d="M 700 470 L 720 445 L 740 445" style={drawOn(k * 1.5 - 0.5, 80)} stroke="#ffd27a" />
        </>}
      </BlueprintCard>}
      {seg === 2 && <TitleCard f={f} fps={fps} at={at} out={out} kicker="ГЛАВА 1" title="БЕЗ СНА" accent={THEMES.neon.accent} />}
      {seg >= 3 && <EndScreen f={f} fps={fps} at={6.1} question="А ТЫ СМОГ БЫ НЕ СПАТЬ НЕДЕЛЮ?" />}
    </AbsoluteFill>
  );
};
