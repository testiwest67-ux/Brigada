// «Перевал Дятлова» — український трейлер (≈1 хв): copy of src/dyatlov/Shots.tsx with Ukrainian voice, scenes and text.
// Original shot list: _tmp/dyatlov/РАСКАДРОВКА.md. 16:9, 1920×1080.
// Every scene starts on a voice line, so a re-voice moves the cuts with it. Backgrounds are the Nano Banana stills in
// public/dyatlov/bg, brought to life in code (camera move, snow, drift, cloud light, grain); text and numbers are drawn here.
// Storyboard composition: frame n = the key moment of scene n (with subtitles) — the sheet the user reviews (rule 10).
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import VOICE from '../../public/dyatlov-ua/voice.json';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {Grain, Vignette} from '../horror/fx';
import {GroundDrift, Snow} from '../dyatlov/TestScene';

const W = 1920, H = 1080;
type VL = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const L = (VOICE as unknown as {lines: VL[]; total: number}).lines;
export const TOTAL = (VOICE as unknown as {total: number}).total;
const S = (i: number) => (Number.isInteger(i) ? L[i].start : (L[Math.floor(i)].start + L[Math.floor(i)].end) / 2);

// ---------- scene data ----------
type Move = 'in' | 'out' | 'right' | 'left' | 'down' | 'up' | 'shake' | 'still';
type Who = 'dyatlov' | 'kolmogorova' | 'dubinina' | 'krivonischenko' | 'thibeaux' | 'kolevatov' | 'slobodin' | 'doroshenko' | 'yudin' | 'zolotaryov';
type Ov =
  | {k: 'plate'; a: string; b?: string}
  | {k: 'title'; n: string; a: string; b?: string}
  | {k: 'big'; a: string; red?: boolean; y?: number; size?: number}
  | {k: 'count'; to: number; from?: number; suf?: string; dec?: number; red?: boolean}
  | {k: 'card'; who: Who; face?: number; body?: boolean; name?: string; sub?: string}
  | {k: 'seq'; items: {a: string; at: number; who?: Who}[]; big?: boolean}
  | {k: 'quote'; a: string}
  | {k: 'stamp'; a: string}
  | {k: 'route'; draw?: boolean; stops?: boolean; peak?: boolean; label?: string}
  | {k: 'abc'; one?: 0 | 1 | 2}
  | {k: 'line3'}
  | {k: 'angle'}
  | {k: 'ring'; x: number; y: number; a: string};
type Sc = {line: number; img: string; mv: Move; fx?: number; fy?: number; z?: number; dark?: number; blur?: boolean; ov?: Ov[]; name: string; title?: boolean};

const sc = (line: number, img: string, mv: Move, name: string, o: Partial<Sc> = {}): Sc => ({line, img, mv, name, ...o});
const card = (line: number, bgImg: string, who: Who, name: string, sub?: string, face = 0): Sc =>
  sc(line, bgImg, 'still', name.toLowerCase(), {dark: 0.45, blur: true, ov: [{k: 'card', who, face, name, sub}]});

export const SCENES: Sc[] = [
  sc(0, 'd0-05-ridge', 'in', 'хребет, 1959', {title: true, ov: [{k: 'plate', a: 'ЛЮТИЙ 1959', b: 'ПІВНІЧНИЙ УРАЛ'}]}),
  sc(2, 'tent-night', 'in', 'намет', {fx: 0.3, fy: 0.5}),
  sc(4, 'd0-04-inside', 'right', 'речі всередині'),
  sc(6, 'd0-04-inside', 'in', 'немає людей', {z: 1.3, fx: 0.5, fy: 0.55, ov: [{k: 'big', a: 'НЕМАЄ ЛИШЕ ЛЮДЕЙ', y: 200, size: 84}]}),
  sc(7, 'd0-02-cut', 'in', 'розріз', {fx: 0.62, fy: 0.45, ov: [{k: 'big', a: 'ЗСЕРЕДИНИ', red: true, y: 220}]}),
  sc(9, 'd0-03-footprints', 'down', 'сліди вниз'),
  sc(10, 'd0-03-footprints-socks', 'in', 'у шкарпетках'),
  sc(12, 'd4-01-blizzard', 'shake', 'мороз', {ov: [{k: 'count', to: -30, from: 0, suf: '°'}]}),
  sc(14, 'group-ten', 'out', 'досвідчені'),
  sc(15, 'd3-05-tent-evening', 'in', 'не вижити'),
  sc(16, 'd4-03-descent', 'in', 'пішли'),
  sc(17, 'd0-06-case', 'in', 'справу закрито', {ov: [{k: 'count', to: 4, from: 0, suf: ' МІСЯЦІ'}]}),
  sc(18, 'd0-06-case', 'in', 'стихійна сила', {dark: 0.4, z: 1.3, fx: 0.45, fy: 0.55, ov: [{k: 'quote', a: '«Стихійна сила, подолати яку люди не могли»'}]}),
  sc(19, 'd7-02-slab', 'in', 'А — лавина', {ov: [{k: 'abc', one: 0}]}),
  sc(20, 'd7-08-rocket', 'in', 'Б — випробування', {ov: [{k: 'abc', one: 1}]}),
  sc(21, 'd7-09-infrasound', 'in', 'В — незрозуміле', {ov: [{k: 'abc', one: 2}]}),
  sc(22, 'd3-06-diary', 'left', 'щоденники'),
  sc(22.5, 'd8-01-memorial', 'in', 'повне відео', {ov: [{k: 'plate', a: 'ПЕРЕВАЛ ДЯТЛОВА', b: 'ПОВНЕ ВІДЕО — НА КАНАЛІ'}]}),
  sc(23, 'd8-04-choice', 'in', 'а ти як думаєш', {ov: [{k: 'abc'}]}),
  sc(24, 'd8-04-choice', 'in', 'пиши в коментарях', {dark: 0.2, ov: [{k: 'big', a: 'НАПИШИ БУКВУ В КОМЕНТАРЯХ', size: 80, y: 220}]}),
];

type ScT = Sc & {from: number; to: number; key: number};
const SC: ScT[] = SCENES.map((s, i) => {
  const from = i === 0 ? 0 : S(s.line) - 0.15;
  const nxt = SCENES[i + 1];
  const to = nxt ? S(nxt.line) - 0.15 : TOTAL;
  const hasCount = s.ov?.some((o) => o.k === 'count' || o.k === 'seq' || o.k === 'route');
  const dur = to - from;
  let key = from + dur * 0.55;
  if (hasCount) key = to - Math.min(0.6, dur * 0.1);
  if (s.title) key = from + Math.min(dur * 0.5, 1.6);
  return {...s, from, to, key};
});

// ---------- camera ----------
const cam = (s: ScT, k: number, t: number) => {
  const base = s.z ?? 1.06;
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
  cx = clamp(cx, m, 1 - m); cy = clamp(cy, m, 1 - m);
  return {z, cx, cy};
};

// outdoor winter stills get falling snow (density, wind)
const SNOW: Record<string, [number, number]> = {
  'tent-night': [1, 1], 'd0-02-cut': [0.9, 1.4], 'd0-03-footprints': [0.8, 1.2], 'd0-03-footprints-socks': [0.6, 1.2], 'd0-05-ridge': [1, 1.6],
  'd2-03-skitrack': [0.4, 0.4], 'd2-04-yudin': [0.4, 0.4], 'd2-02-kvartal': [0.4, 0.3], 'd3-01-river': [0.5, 1], 'd3-02-labaz': [0.3, 0.5],
  'd3-03-slope-dusk': [0.6, 1.4], 'd3-04-platform': [0.5, 1], 'd3-05-tent-evening': [0.8, 1.2], 'd4-01-blizzard': [1.8, 2.6],
  'd4-02-socks': [0.7, 1.4], 'd4-03-descent': [1, 1.6], 'd4-04-forest-edge': [0.7, 1], 'd5-02-search': [0.3, 0.5], 'd5-03-tent-found': [0.3, 0.6],
  'd5-05-cedar': [0.3, 0.4], 'd5-06-line': [0.3, 0.5], 'd5-07-probing': [0.4, 0.5], 'd7-02-slab': [0.8, 1.4], 'd7-03-ridge': [1.2, 2],
  'd7-09-infrasound': [0.6, 1.4], 'd8-03-dawn': [0.3, 0.3], 'd1-04-ural': [0.2, 0.3], 'd0-04-inside': [0.2, 0.3], 'thumb-bg': [0.5, 0.8],
  'd8-04-choice': [0.4, 0.8], 'd1-01-sverdlovsk': [0.5, 0.2], 'd2-05-camp': [0.3, 0.2], 'd8-01-memorial': [0.2, 0.4],
};
const DRIFT = new Set(['tent-night', 'd0-03-footprints', 'd3-03-slope-dusk', 'd3-05-tent-evening', 'd4-01-blizzard', 'd4-03-descent', 'd7-03-ridge', 'd0-05-ridge']);
const bgPath = (img: string) => (img === 'thumb-bg' ? 'dyatlov/thumb/thumb-bg.png' : `dyatlov/bg/${img}.png`);

const Background: React.FC<{s: ScT; k: number; t: number}> = ({s, k, t}) => {
  const {z, cx, cy} = cam(s, k, t);
  const tx = W / 2 - cx * W * z, ty = H / 2 - cy * H * z;
  const dark = s.dark ?? 0;
  const snow = SNOW[s.img];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
        <Img src={staticFile(bgPath(s.img))} style={{width: W, height: H, objectFit: 'cover',
          filter: `brightness(${1.06 - dark}) contrast(1.05)${s.blur ? ' blur(10px)' : ''}`}} />
        <div style={{position: 'absolute', left: -700 + ((t - s.from) * 60) % 2600, top: -80, width: 1300, height: 520,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,195,255,0.12), rgba(170,195,255,0) 70%)', filter: 'blur(30px)'}} />
        {DRIFT.has(s.img) && <GroundDrift t={t} o={0.8} />}
      </div>
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

// face / body crop from a character sheet (2752×1536): 4 heads at x 0.25/0.42/0.59/0.76, y≈0.79; front view at x≈0.33
const FACE_X = [0.25, 0.42, 0.59, 0.76];
const Crop: React.FC<{who: Who; face?: number; body?: boolean; w: number; h: number}> = ({who, face = 0, body, w, h}) => {
  const cx = body ? 0.33 : FACE_X[face], cy = body ? 0.33 : 0.79, fw = body ? 0.16 : 0.15;
  const iw = w / fw, ih = iw * (1536 / 2752);
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', borderRadius: 18, background: '#d9dbe0',
      boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '6px solid #e9e4d6'}}>
      <Img src={staticFile(`dyatlov/bg/char-${who}-sheet.png`)} style={{position: 'absolute', width: iw, height: ih, left: w / 2 - cx * iw, top: h / 2 - cy * ih}} />
    </div>
  );
};

const Card: React.FC<{o: Extract<Ov, {k: 'card'}>; p: number}> = ({o, p}) => {
  const body = !!o.body;
  const w = body ? 360 : 460, h = body ? 720 : 560;
  const textOnly = !o.name && !o.sub;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, opacity: p,
      transform: `translateY(${(1 - p) * 30}px)`, paddingBottom: body ? 170 : 120}}>
      <Crop who={o.who} face={o.face} body={body} w={w} h={h} />
      {!textOnly && (
        <div style={{maxWidth: 820}}>
          {o.name && <div style={{...TXT, fontSize: 78, lineHeight: 1.05}}>{o.name}</div>}
          {o.sub && <div style={{...TXT, fontSize: 44, fontWeight: 800, color: '#ffd27a', WebkitTextStroke: '6px #05070c', marginTop: 18}}>{o.sub}</div>}
        </div>
      )}
    </div>
  );
};

// route on d1-03-map (follows the pencil line), in image coordinates 0..1
const ROUTE = [[0.356, 0.884], [0.4375, 0.671], [0.4875, 0.492], [0.55, 0.358], [0.594, 0.28]];
const Route: React.FC<{o: Extract<Ov, {k: 'route'}>; s: ScT; t: number}> = ({o, s, t}) => {
  const {z, cx, cy} = cam(s, easeInOut(clamp((t - s.from) / (s.to - s.from))), t);
  const P = (q: number[]) => [W / 2 + (q[0] - cx) * W * z, H / 2 + (q[1] - cy) * H * z];
  const pts = ROUTE.map(P);
  const d = 'M ' + pts.map((q) => q.join(' ')).join(' L ');
  const len = pts.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0);
  const draw = o.draw ? clamp((t - s.from - 0.3) / Math.max(1, (s.to - s.from) * 0.7)) : 1;
  const stops = [{a: 'ИВДЕЛЬ', u: 0.1, at: 80}, {a: 'ВИЖАЙ', u: 0.3, at: 81}, {a: '41-Й КВАРТАЛ', u: 0.52, at: 82}];
  const along = (u: number) => { const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), r = f - i; return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)]; };
  const peak = pts[pts.length - 1];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <path d={d} fill="none" stroke="#e8322a" strokeWidth={9} strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))'}} />
      {o.stops && stops.map((st, i) => {
        const [x, y] = along(st.u), p = appear(t, S(st.at) - 0.1);
        return <g key={i} opacity={p}><circle cx={x} cy={y} r={16} fill="#e8322a" stroke="#05070c" strokeWidth={5} />
          <text x={x + 34} y={y + 16} fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff" stroke="#05070c" strokeWidth={8} paintOrder="stroke">{st.a}</text></g>;
      })}
      {(o.peak || o.label) && <g opacity={appear(t, s.from + 0.5)}>
        <path d={`M ${peak[0]} ${peak[1] - 70} l -30 50 h 60 Z`} fill="#e8322a" stroke="#05070c" strokeWidth={5} />
        <text x={peak[0] + 50} y={peak[1] - 40} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fff" stroke="#05070c" strokeWidth={9} paintOrder="stroke">{o.label}</text></g>}
    </svg>
  );
};

const ABC = [{l: 'А', a: 'ЛАВИНА'}, {l: 'Б', a: 'ВІЙСЬКОВІ ВИПРОБУВАННЯ'}, {l: 'В', a: 'ЩОСЬ НЕЗРОЗУМІЛЕ'}];
const Abc: React.FC<{one?: number; s: ScT; t: number}> = ({one, s, t}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 50}}>
    {ABC.map((c, i) => {
      if (one !== undefined && one !== i) return null;
      const p = appear(t, s.from + 0.2 + (one === undefined ? i * 0.35 : 0));
      return (
        <div key={i} style={{width: one !== undefined ? 900 : 480, padding: '30px 20px', background: 'rgba(5,7,12,0.72)', border: '5px solid #e9e4d6',
          borderRadius: 22, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
          <div style={{...TXT, fontSize: one !== undefined ? 200 : 150, color: '#ff3b3b', lineHeight: 1}}>{c.l}</div>
          <div style={{...TXT, fontSize: one !== undefined ? 70 : 44, marginTop: 10}}>{c.a}</div>
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
      const out = s.title ? 1 - clamp((t - s.from - 3.2) / 0.5) : 1;
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
      const withFaces = o.items.some((it) => it.who);
      if (withFaces) return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, paddingBottom: 140}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 30}px)`, textAlign: 'center'}}>
              <Crop who={it.who!} w={400} h={490} />
              <div style={{...TXT, fontSize: 44, marginTop: 20, WebkitTextStroke: '6px #05070c'}}>{it.a}</div>
            </div>); })}
        </div>
      );
      if (o.items.length > 5) return ( // many short items (the nine names): centred rows, clear of the subtitles
        <div style={{position: 'absolute', left: 160, right: 160, top: 250, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 46px'}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{...TXT, fontSize: 88, opacity: q, transform: `translateY(${(1 - q) * 20}px)`, WebkitTextStroke: '9px #05070c'}}>{it.a}</div>); })}
        </div>
      );
      return (
        <div style={{position: 'absolute', left: 0, right: 0, top: o.big ? 300 : 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: o.big ? 30 : 14}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{...TXT, fontSize: o.big ? 120 : o.items.length > 5 ? 62 : 66, opacity: q, transform: `translateY(${(1 - q) * 20}px)`,
              WebkitTextStroke: `${o.big ? 11 : 7}px #05070c`}}>{it.a}</div>); })}
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
    case 'route': return <Route o={o} s={s} t={t} />;
    case 'abc': return <Abc one={o.one} s={s} t={t} />;
    case 'ring': {
      const {z, cx, cy} = cam(s, easeInOut(clamp((t - s.from) / (s.to - s.from))), t);
      const x = W / 2 + (o.x - cx) * W * z, y = H / 2 + (o.y - cy) * H * z;
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: p}}>
          <ellipse cx={x} cy={y} rx={300 * lerp(1.3, 1, p)} ry={110 * lerp(1.3, 1, p)} fill="none" stroke="#ff3b3b" strokeWidth={10} strokeDasharray="34 16" />
          <text x={x} y={y - 150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill="#fff" stroke="#05070c" strokeWidth={12} paintOrder="stroke">{o.a}</text>
        </svg>
      );
    }
    case 'line3': {
      const y = 330;
      const pts = [{x: 320, a: 'КЕДР'}, {x: 720, a: 'ДЯТЛОВ'}, {x: 1000, a: 'СЛОБОДИН'}, {x: 1280, a: 'КОЛМОГОРОВА'}, {x: 1640, a: 'ПАЛАТКА'}];
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <rect x={200} y={y - 130} width={1560} height={260} rx={20} fill="rgba(5,7,12,0.62)" opacity={p} />
          <line x1={320} y1={y} x2={320 + 1320 * appear(t, s.from + 0.3, 1.2)} y2={y} stroke="#e8322a" strokeWidth={7} strokeDasharray="22 12" />
          {pts.map((q, i) => { const o2 = appear(t, s.from + 0.3 + i * 0.3); return (
            <g key={i} opacity={o2}>
              <circle cx={q.x} cy={y} r={i === 0 || i === 4 ? 22 : 15} fill={i === 0 || i === 4 ? '#e9e4d6' : '#e8322a'} stroke="#05070c" strokeWidth={5} />
              <text x={q.x} y={y + (i % 2 ? -50 : 75)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" stroke="#05070c" strokeWidth={7} paintOrder="stroke">{q.a}</text>
            </g>); })}
        </svg>
      );
    }
    case 'angle': {
      const x0 = 520, y0 = 640, a = (28 * Math.PI) / 180, len = 760;
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: p}}>
          <line x1={x0} y1={y0} x2={x0 + len} y2={y0} stroke="#fff" strokeWidth={8} />
          <line x1={x0} y1={y0} x2={x0 + len * Math.cos(a)} y2={y0 - len * Math.sin(a)} stroke="#e8322a" strokeWidth={10} />
          <path d={`M ${x0 + 220} ${y0} A 220 220 0 0 0 ${x0 + 220 * Math.cos(a)} ${y0 - 220 * Math.sin(a)}`} fill="none" stroke="#fff" strokeWidth={6} />
          <text x={x0 + 280} y={y0 - 50} fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff" stroke="#05070c" strokeWidth={13} paintOrder="stroke">&lt; 30°</text>
        </svg>
      );
    }
  }
  return null;
};

// ---------- subtitles (16:9): chunks of up to 5 words, keywords red ----------
const RED = ['зсередини', 'розрізан', 'шкарпетк', 'взуття', 'стихійн', 'лавин', 'випробуван', 'пішли', 'не вижити', 'людей'];
const RED_EXACT = new Set(['дев\'ятьох', 'тридцяти']); // whole words only («девятьсот» stays white)
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёіїєґ'a-z-]/g, '');
const isRed = (w: string) => RED_EXACT.has(clean(w)) || RED.some((r) => clean(w).startsWith(r));
type CapW = {w: string; t: number; red: boolean};
type Cap = {start: number; end: number; words: CapW[]};
const CAPS: Cap[] = [];
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

// ---------- one moment of the film ----------
export const ShotAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
  ensureFont();
  let i = SC.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) i = t < 0 ? 0 : SC.length - 1;
  const s = SC[i];
  const k = easeInOut(clamp((t - s.from) / Math.max(0.1, s.to - s.from)));
  // dip to black into every chapter title, short crossfade-ish flash elsewhere
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

export const SCENE_COUNT = SC.length;
export const SCENE_NAMES = SC.map((s, i) => `${i + 1}. ${s.name}`);

export const Storyboard: React.FC = () => {
  const f = useCurrentFrame();
  const s = SC[Math.min(f, SC.length - 1)];
  return <ShotAt t={s.key} f={Math.round(s.key * 30)} />;
};

export const DyatlovUa: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ShotAt t={f / 30} f={f} />
      <Audio src={staticFile('dyatlov-ua/mix.wav')} />
    </AbsoluteFill>
  );
};
