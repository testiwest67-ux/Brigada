// Generic engine for the long 16:9 «загадки» videos: Nano Banana / Flow stills brought to life in code
// (camera move, snow, sea sway, fog, cloud light, grain), word-by-word subtitles, plates, counters, character cards cut
// out of approved character sheets, versions А/Б/В. Built from src/dyatlov/Shots.tsx («Перевал Дятлова»).
//   const S = makeStory({dir: 'mary-celeste', voice: VOICE, scenes: SCENES, ...});  → S.Storyboard, S.Film, S.SCENE_COUNT …
// Storyboard: frame n = the key moment of scene n (rule 10).
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {Grain, Vignette} from '../horror/fx';
import {GroundDrift, Snow} from '../dyatlov/TestScene';
import {Ov, Sc} from './types';

const W = 1920, H = 1080;
type VL = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
type ScT = Sc & {from: number; to: number; key: number};

export type StoryCfg = {
  dir: string;                                   // public/<dir>/bg/*.png, public/<dir>/mix.wav
  voice: unknown;                                // public/<dir>/voice.json
  scenes: Sc[];
  snow?: Record<string, [number, number]>;       // image → [density, wind]
  drift?: string[];                              // images with ground drift (snow streaks)
  sea?: string[];                                // images that gently roll and bob like a ship on swell
  fog?: string[];                                // images with slow drifting fog
  abc: [string, string, string];                 // labels for versions А / Б / В
  red?: string[];                                // subtitle words starting like this are red
  redExact?: string[];                           // whole words only
  faceY?: number;                                // y of the 4 heads on the character sheets (0..1)
  audio?: string;                                // default <dir>/mix.wav
};

export const makeStory = (cfg: StoryCfg) => {
  const L = (cfg.voice as {lines: VL[]}).lines;
  const TOTAL = (cfg.voice as {total: number}).total;
  const S = (i: number) => L[i].start;
  const SEA = new Set(cfg.sea ?? []), FOG = new Set(cfg.fog ?? []), DRIFT = new Set(cfg.drift ?? []);
  const FACE_X = [0.25, 0.42, 0.59, 0.76], FACE_Y = cfg.faceY ?? 0.81;

  const SC: ScT[] = cfg.scenes.map((s, i) => {
    const from = i === 0 ? 0 : S(s.line) - 0.15;
    const nxt = cfg.scenes[i + 1];
    const to = nxt ? S(nxt.line) - 0.15 : TOTAL;
    const anim = s.ov?.some((o) => o.k === 'count' || o.k === 'seq');
    const dur = to - from;
    let key = from + dur * 0.55;
    if (anim) key = to - Math.min(0.6, dur * 0.1);
    if (s.title) key = from + Math.min(dur * 0.5, 1.6);
    return {...s, from, to, key};
  });

  const cam = (s: ScT, k: number, t: number) => {
    const base = (s.z ?? 1.06) * (SEA.has(s.img) ? 1.04 : 1);
    let z = base, cx = s.fx ?? 0.5, cy = s.fy ?? 0.5;
    const d = 0.06;
    switch (s.mv) {
      case 'in': z = lerp(base, base * 1.12, k); break;
      case 'out': z = lerp(base * 1.12, base, k); break;
      case 'right': z = Math.max(base, 1.16); cx += lerp(-d, d, k); break;
      case 'left': z = Math.max(base, 1.16); cx += lerp(d, -d, k); break;
      case 'down': z = Math.max(base, 1.16); cy += lerp(-d, d, k); break;
      case 'up': z = Math.max(base, 1.16); cy += lerp(d, -d, k); break;
      case 'shake': z = lerp(base * 1.08, base * 1.14, k); cx += Math.sin(t * 13) * 0.003 + Math.sin(t * 7.3) * 0.002; cy += Math.cos(t * 11) * 0.003; break;
      case 'still': z = lerp(base, base * 1.03, k); break;
    }
    const m = 0.5 / z;
    return {z, cx: clamp(cx, m, 1 - m), cy: clamp(cy, m, 1 - m)};
  };

  const bg = (img: string) => `${cfg.dir}/bg/${img}.png`;

  const Background: React.FC<{s: ScT; k: number; t: number}> = ({s, k, t}) => {
    const {z, cx, cy} = cam(s, k, t);
    const sea = SEA.has(s.img) && !s.blur;
    const roll = sea ? Math.sin(t * 0.55) * 0.55 + Math.sin(t * 0.23) * 0.25 : 0;
    const bob = sea ? Math.sin(t * 0.8) * 7 : 0;
    const tx = W / 2 - cx * W * z, ty = H / 2 - cy * H * z + bob;
    const dark = s.dark ?? 0;
    const snow = cfg.snow?.[s.img];
    return (
      <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
        {/* the roll turns the whole frame around the screen centre; the camera (translate + scale) lives inside */}
        <AbsoluteFill style={{transform: roll ? `rotate(${roll}deg) scale(1.03)` : undefined, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0',
          transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
          <Img src={staticFile(bg(s.img))} style={{width: W, height: H, objectFit: 'cover',
            filter: `brightness(${1.06 - dark}) contrast(1.05)${s.blur ? ' blur(10px)' : ''}`}} />
          <div style={{position: 'absolute', left: -700 + ((t - s.from) * 60) % 2600, top: -80, width: 1300, height: 520,
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,195,255,0.12), rgba(170,195,255,0) 70%)', filter: 'blur(30px)'}} />
          {DRIFT.has(s.img) && <GroundDrift t={t} o={0.8} />}
        </div>
        </AbsoluteFill>
        {FOG.has(s.img) && !s.blur && [0, 1, 2].map((i) => {
          const x = ((t * (35 + i * 18) + i * 700) % (W + 1600)) - 800;
          return <div key={i} style={{position: 'absolute', left: x, top: 380 + i * 170, width: 1500, height: 300, opacity: 0.55,
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(200,210,230,0.22), rgba(200,210,230,0) 70%)', filter: 'blur(26px)'}} />;
        })}
        {snow && !s.blur && <Snow t={t} density={snow[0]} wind={snow[1]} />}
      </AbsoluteFill>
    );
  };

  // ---------- overlays ----------
  const TXT: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, color: '#fff', WebkitTextStroke: '8px #05070c', paintOrder: 'stroke fill', textShadow: '0 5px 0 #05070c, 0 0 24px rgba(0,0,0,0.7)'};
  const appear = (t: number, at: number, d = 0.35) => easeInOut(clamp((t - at) / d));

  const Plate: React.FC<{a: string; b?: string; p: number}> = ({a, b, p}) => (
    <div style={{position: 'absolute', left: 70, top: 64, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, borderLeft: '8px solid #d33', paddingLeft: 24}}>
      <div style={{...TXT, fontSize: 64, WebkitTextStroke: '6px #05070c'}}>{a}</div>
      {b && <div style={{...TXT, fontSize: 38, fontWeight: 800, color: '#cfd8ea', WebkitTextStroke: '5px #05070c', marginTop: 4}}>{b}</div>}
    </div>
  );
  const Big: React.FC<{a: string; p: number; red?: boolean; y?: number; size?: number}> = ({a, p, red, y, size = 150}) => (
    <div style={{position: 'absolute', left: 80, right: 80, top: y ?? H / 2 - size * 0.75, textAlign: 'center', opacity: p, transform: `scale(${lerp(0.9, 1, p)})`}}>
      <span style={{...TXT, fontSize: size, color: red ? '#ff3b3b' : '#fff', WebkitTextStroke: `${Math.round(size * 0.09)}px #05070c`}}>{a}</span>
    </div>
  );
  const fmt = (v: number, dec = 0) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(dec).replace('.', ',');

  // heads at x 0.25/0.42/0.59/0.76, y≈FACE_Y; front view at x≈0.33 (same layout as the approved sheets)
  const Crop: React.FC<{who: string; face?: number; body?: boolean; w: number; h: number}> = ({who, face = 0, body, w, h}) => {
    const cx = body ? 0.33 : FACE_X[face], cy = body ? 0.33 : FACE_Y, fw = body ? 0.16 : 0.15;
    const iw = w / fw, ih = iw * (1536 / 2752);
    return (
      <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', borderRadius: 18, background: '#d9dbe0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '6px solid #e9e4d6'}}>
        <Img src={staticFile(`${cfg.dir}/bg/char-${who}-sheet.png`)} style={{position: 'absolute', width: iw, height: ih, left: w / 2 - cx * iw, top: h / 2 - cy * ih}} />
      </div>
    );
  };
  const Card: React.FC<{o: Extract<Ov, {k: 'card'}>; p: number}> = ({o, p}) => {
    const body = !!o.body, w = body ? 360 : 460, h = body ? 720 : 560;
    return (
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`, paddingBottom: body ? 170 : 120}}>
        <Crop who={o.who} face={o.face} body={body} w={w} h={h} />
        {(o.name || o.sub) && (
          <div style={{maxWidth: 820}}>
            {o.name && <div style={{...TXT, fontSize: 78, lineHeight: 1.05}}>{o.name}</div>}
            {o.sub && <div style={{...TXT, fontSize: 44, fontWeight: 800, color: '#ffd27a', WebkitTextStroke: '6px #05070c', marginTop: 18}}>{o.sub}</div>}
          </div>
        )}
      </div>
    );
  };
  const Abc: React.FC<{one?: number; s: ScT; t: number}> = ({one, s, t}) => (
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 50}}>
      {cfg.abc.map((a, i) => {
        if (one !== undefined && one !== i) return null;
        const p = appear(t, s.from + 0.2 + (one === undefined ? i * 0.35 : 0));
        return (
          <div key={i} style={{width: one !== undefined ? 900 : 480, padding: '30px 20px', background: 'rgba(5,7,12,0.72)', border: '5px solid #e9e4d6',
            borderRadius: 22, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
            <div style={{...TXT, fontSize: one !== undefined ? 200 : 150, color: '#ff3b3b', lineHeight: 1}}>{'АБВ'[i]}</div>
            <div style={{...TXT, fontSize: one !== undefined ? 70 : 44, marginTop: 10}}>{a}</div>
          </div>
        );
      })}
    </div>
  );

  const Overlay: React.FC<{o: Ov; s: ScT; t: number}> = ({o, s, t}) => {
    const p = appear(t, s.from + 0.25);
    switch (o.k) {
      case 'plate': return <Plate a={o.a} b={o.b} p={p} />;
      case 'big': return <Big a={o.a} p={appear(t, s.from + 0.35)} red={o.red} y={o.y} size={o.size} />;
      case 'count': {
        const u = easeInOut(clamp((t - s.from - 0.3) / 1.3));
        return <Big a={fmt(lerp(o.from ?? 0, o.to, u), o.dec) + (o.suf ?? '')} p={p} red={o.red} size={170} />;
      }
      case 'title': {
        const out = s.title ? 1 - clamp((t - s.from - 3.6) / 0.5) : 1;
        return (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p * out, paddingBottom: 120}}>
            <div style={{...TXT, fontSize: 60, color: '#ff3b3b', letterSpacing: 8}}>{/^\d+$/.test(o.n) ? `ГЛАВА ${o.n}` : o.n}</div>
            <div style={{...TXT, fontSize: 150, lineHeight: 1.05, textAlign: 'center', maxWidth: 1700}}>{o.a}</div>
            {o.b && <div style={{...TXT, fontSize: 48, color: '#cfd8ea', WebkitTextStroke: '6px #05070c', marginTop: 10}}>{o.b}</div>}
          </div>
        );
      }
      case 'card': return <Card o={o} p={p} />;
      case 'seq': {
        if (o.items.some((it) => it.who)) return (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, paddingBottom: 140}}>
            {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
              <div key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 30}px)`, textAlign: 'center'}}>
                <Crop who={it.who!} w={400} h={490} />
                <div style={{...TXT, fontSize: 44, marginTop: 20, WebkitTextStroke: '6px #05070c'}}>{it.a}</div>
              </div>); })}
          </div>
        );
        if (o.items.length > 5) return (
          <div style={{position: 'absolute', left: 160, right: 160, top: 250, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 46px'}}>
            {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
              <div key={i} style={{...TXT, fontSize: 88, opacity: q, transform: `translateY(${(1 - q) * 20}px)`, WebkitTextStroke: '9px #05070c'}}>{it.a}</div>); })}
          </div>
        );
        return (
          <div style={{position: 'absolute', left: 0, right: 0, top: o.big ? 300 : 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: o.big ? 30 : 14}}>
            {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
              <div key={i} style={{...TXT, fontSize: o.big ? 120 : 66, opacity: q, transform: `translateY(${(1 - q) * 20}px)`, WebkitTextStroke: `${o.big ? 11 : 7}px #05070c`}}>{it.a}</div>); })}
          </div>
        );
      }
      case 'quote': return (
        <div style={{position: 'absolute', left: 200, right: 200, top: 240, padding: '50px 60px', background: 'rgba(5,7,12,0.7)', borderLeft: '10px solid #d33',
          borderRadius: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontStyle: 'italic', fontSize: 64, color: '#f2ead8', lineHeight: 1.25, textAlign: 'center'}}>{o.a}</div>
        </div>
      );
      case 'stamp': return (
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: p}}>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#ff3b3b', border: '12px solid #ff3b3b', padding: '6px 50px', borderRadius: 16,
            transform: `rotate(-8deg) scale(${lerp(1.4, 1, p)})`, background: 'rgba(5,7,12,0.45)', textShadow: '0 0 20px rgba(0,0,0,0.6)'}}>{o.a}</div>
        </div>
      );
      case 'abc': return <Abc one={o.one} s={s} t={t} />;
    }
    return null;
  };

  // ---------- subtitles ----------
  const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
  const RED_EX = new Set(cfg.redExact ?? []);
  const isRed = (w: string) => RED_EX.has(clean(w)) || (cfg.red ?? []).some((r) => clean(w).startsWith(r));
  type CapW = {w: string; t: number; red: boolean};
  const CAPS: {start: number; end: number; words: CapW[]}[] = [];
  L.forEach((l, k) => {
    const next = L[k + 1];
    const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.6);
    const ws: CapW[] = l.text.split(' ').map((w, j) => ({w, t: l.words[j]?.t ?? l.start, red: isRed(w)})).filter((w) => w.w !== '—');
    const chunks: CapW[][] = [];
    let cur: CapW[] = [];
    ws.forEach((w) => {
      if (cur.length && (cur.length >= 5 || cur.map((c) => c.w).join(' ').length + w.w.length > 30)) { chunks.push(cur); cur = []; }
      cur.push(w);
      if (/[.!?:…»]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3)) { chunks.push(cur); cur = []; }
    });
    if (cur.length) chunks.push(cur);
    chunks.forEach((c, n) => CAPS.push({start: c[0].t - 0.05, end: n + 1 < chunks.length ? chunks[n + 1][0].t - 0.05 : lineEnd, words: c}));
  });
  const Captions: React.FC<{t: number}> = ({t}) => {
    const c = CAPS.find((c) => t >= c.start && t < c.end);
    if (!c) return null;
    return (
      <div style={{position: 'absolute', left: 140, right: 140, bottom: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px'}}>
        {c.words.map((w, i) => {
          const k = clamp((t - w.t + 0.05) / 0.12);
          return <span key={i} style={{...TXT, fontSize: 62, color: w.red ? '#ff3b3b' : '#fff', opacity: lerp(0.35, 1, k), WebkitTextStroke: '9px #05070c'}}>{w.w}</span>;
        })}
      </div>
    );
  };

  const ShotAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
    ensureFont();
    let i = SC.findIndex((s) => t >= s.from && t < s.to);
    if (i < 0) i = t < 0 ? 0 : SC.length - 1;
    const s = SC[i];
    const k = easeInOut(clamp((t - s.from) / Math.max(0.1, s.to - s.from)));
    const dip = s.title ? clamp(1 - (t - s.from) / 0.6) : clamp(1 - (t - s.from) / 0.12) * 0.35;
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Background s={s} k={k} t={t} />
        <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(10,20,45,0) 55%, rgba(5,8,18,0.45))'}} />
        <Vignette o={0.5} />
        {s.ov?.map((o, n) => <Overlay key={n} o={o} s={s} t={t} />)}
        <Grain f={f} o={0.07} />
        {caps && <Captions t={t} />}
        {dip > 0 && <AbsoluteFill style={{background: '#000', opacity: dip}} />}
      </AbsoluteFill>
    );
  };

  const Storyboard: React.FC = () => {
    const f = useCurrentFrame();
    const s = SC[Math.min(f, SC.length - 1)];
    return <ShotAt t={s.key} f={Math.round(s.key * 30)} />;
  };
  const Film: React.FC = () => {
    const f = useCurrentFrame();
    return (
      <AbsoluteFill>
        <ShotAt t={f / 30} f={f} />
        <Audio src={staticFile(cfg.audio ?? `${cfg.dir}/mix.wav`)} />
      </AbsoluteFill>
    );
  };
  return {ShotAt, Storyboard, Film, TOTAL, SCENE_COUNT: SC.length, SCENE_NAMES: SC.map((s, i) => `${i + 1}. ${s.name}`)};
};
