// Вертикальный трейлер-ПЕТЛЯ 9:16 (TikTok / Reels / Shorts) для длинных роликов «Неразгаданного» — общий движок по образцу
// src/dyatlov/Trailer.tsx: картинки 16:9 панорамой, субтитры кусками, крупные слова, «полное видео на канале» в конце,
// последний кадр приезжает ровно в первый (та же картинка, центр и зум) — видео идёт по кругу.
//   const T = makeTrailer({dir: 'hinterkaifeck', voice: VOICE, title: 'ТАЙНА ХУТОРА ХИНТЕРКАЙФЕК', scenes: [...], red: [...]});
//   → T.Trailer, T.Storyboard, T.TOTAL, T.SCENES, T.NAMES. Картинки — public/<dir>/bg, звук — public/<dir>-trailer/mix.wav.
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {CapLine, Grain, HorrorCaptions, Vignette} from '../horror/fx';

const W = 1080, H = 1920, IW = H * 16 / 9;
type VL = {i: number; text: string; start: number; end: number; words: {w: string; t: number}[]};
// line → image (+off: start later inside the line), pan a→b (0..1 across the wide image), zoom z→z2 (default z*1.08)
export type TS = {line: number; off?: number; img: string; a?: number; b?: number; z?: number; z2?: number; shake?: boolean; dark?: number;
  big?: string; red?: boolean; end?: boolean};
type Cfg = {dir: string; voice: unknown; title: string; scenes: TS[]; red: string[]; accent?: string};

const STROKE = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #05070c`, paintOrder: 'stroke fill', textShadow: '0 8px 0 #05070c, 0 0 40px rgba(0,0,0,0.85)'});

export const makeTrailer = (cfg: Cfg) => {
  const L = (cfg.voice as {lines: VL[]}).lines;
  const TOTAL = (cfg.voice as {total: number}).total;
  const ACC = cfg.accent ?? '#bfe6ff';
  const TSC = cfg.scenes;
  const SC = TSC.map((s, i) => {
    const st = (k: number) => L[TSC[k].line].start + (TSC[k].off ?? 0) - 0.1;
    return {...s, from: i === 0 ? 0 : st(i), to: TSC[i + 1] ? st(i + 1) : TOTAL};
  });
  const NAMES = SC.map((s, i) => `${i + 1}. ${s.end ? 'петля + «на канале»' : L[s.line].text.slice(0, 28)}`);

  const isRed = (w: string) => cfg.red.some((r) => w.toLowerCase().replace(/[^а-яё]/g, '').startsWith(r));
  const CAPS: CapLine[] = [];
  L.forEach((l, k) => {
    const end = Math.min(L[k + 1] ? L[k + 1].start - 0.05 : TOTAL, l.end + 0.5);
    const ws = l.text.split(' ').map((w, j) => ({w: w.toUpperCase(), t: l.words[j]?.t ?? l.start, red: isRed(w)})).filter((w) => w.w !== '—');
    const ch: typeof ws[] = [];
    let cur: typeof ws = [];
    ws.forEach((w) => {
      if (cur.length && (cur.length >= 3 || cur.map((c) => c.w).join(' ').length + w.w.length > 16)) { ch.push(cur); cur = []; }
      cur.push(w);
      if (/[.!?:…»,]$/.test(w.w)) { ch.push(cur); cur = []; }
    });
    if (cur.length) ch.push(cur);
    ch.forEach((c, n) => CAPS.push({start: c[0].t - 0.05, end: n + 1 < ch.length ? ch[n + 1][0].t - 0.05 : end, words: c}));
  });

  const Frame: React.FC<{s: typeof SC[number]; t: number}> = ({s, t}) => {
    const k = easeInOut(clamp((t - s.from) / Math.max(0.1, s.to - s.from)));
    const z0 = s.z ?? 1.0;
    const z = lerp(z0, s.z2 ?? z0 * 1.08, k);
    const iw = IW * z, ih = H * z, m = W / 2 / iw;
    const cx = clamp(lerp(s.a ?? 0.5, s.b ?? 0.5, k), m, 1 - m);
    const sh = s.shake ? Math.sin(t * 13) * 6 : 0;
    return (
      <AbsoluteFill>
        <Img src={staticFile(`${cfg.dir}/bg/${s.img}.png`)} style={{position: 'absolute', width: iw, height: ih, left: W / 2 - cx * iw + sh, top: (H - ih) / 2,
          filter: `brightness(${1 - (s.dark ?? 0)}) contrast(1.08)`}} />
        {s.big && (
          <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: s.big.length > 10 ? 110 : 150,
            lineHeight: 1.05, padding: '0 40px', boxSizing: 'border-box',
            color: s.red ? '#ff2e2e' : ACC, opacity: clamp((t - s.from) / 0.25), transform: `scale(${lerp(1.15, 1, clamp((t - s.from) / 0.3))})`, ...STROKE(18)}}>{s.big}</div>
        )}
      </AbsoluteFill>
    );
  };

  const EndCard: React.FC<{t: number; from: number}> = ({t, from}) => {
    const k = Math.min(clamp((t - from - 0.3) / 0.4), clamp((TOTAL - 0.05 - t) / 0.3));
    const bob = Math.sin(t * 6) * 16;
    return (
      <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', opacity: k, transform: `scale(${lerp(0.94, 1, k)})`}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: '#fff', ...STROKE(13)}}>ПОЛНОЕ ВИДЕО</div>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: ACC, ...STROKE(13)}}>НА КАНАЛЕ</div>
        <div style={{fontSize: 150, lineHeight: 1, marginTop: 10, transform: `translateY(${bob}px)`, color: ACC, fontFamily: FONT, fontWeight: 900, ...STROKE(14)}}>↓</div>
      </div>
    );
  };

  const At: React.FC<{t: number; f: number}> = ({t, f}) => {
    ensureFont();
    let i = SC.findIndex((s) => t >= s.from && t < s.to);
    if (i < 0) i = SC.length - 1;
    const s = SC[i];
    const fade = clamp((t - s.from) / 0.12);
    return (
      <AbsoluteFill style={{background: '#000'}}>
        {i > 0 && fade < 1 && <Frame s={SC[i - 1]} t={t} />}
        <AbsoluteFill style={{opacity: i === 0 ? 1 : fade}}><Frame s={s} t={t} /></AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 85%)'}} />
        <Vignette />
        <Grain f={f} o={0.08} />
        <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, letterSpacing: 4, color: ACC, ...STROKE(7)}}>{cfg.title}</div>
        {s.end && <EndCard t={t} from={s.from} />}
        <HorrorCaptions lines={CAPS} f={f} fps={30} y={1250} gapX={36} />
      </AbsoluteFill>
    );
  };

  const Trailer: React.FC = () => {
    const f = useCurrentFrame();
    return (
      <AbsoluteFill>
        <At t={f / 30} f={f} />
        <Audio src={staticFile(`${cfg.dir}-trailer/mix.wav`)} />
      </AbsoluteFill>
    );
  };
  // rule 10: frame n = the key moment of trailer scene n (with subtitles)
  const Storyboard: React.FC = () => {
    const n = useCurrentFrame();
    const s = SC[Math.min(n, SC.length - 1)];
    const t = s.end ? s.from + (s.to - s.from) * 0.5 : s.from + (s.to - s.from) * 0.6;
    return <At t={t} f={Math.round(t * 30)} />;
  };
  return {Trailer, Storyboard, TOTAL, SCENES: SC.length, NAMES};
};
