// Screen-space infographics in the toon look (navy plates, white heavy caps, gold numbers), always above the set:
// Counter, NumberCard, Compare, BlueprintCard, TitleCard, EndScreen. Each pops in at `at` (s) and fades out at `out` (s).
// Keep cards above y ≈ 820 in 16:9 (the subtitle band is below) and away from faces.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK} from '../rig/style';
import {MONT} from './Captions';
import {clamp, easeOut, lerp, spring01} from '../lib/anim';

export const UI = {plate: 'rgba(22,24,44,0.88)', edge: 'rgba(255,255,255,0.13)', gold: '#ffd27a', coral: '#ff7a5c', cream: '#f6efe2', blue: '#9cc8ff'};

type Timed = {f: number; fps: number; at: number; out?: number};
// enter (spring, 0..~1.05) and exit (0..1) envelopes
const env = ({f, fps, at, out}: Timed) => {
  const a = spring01(f, at * fps, fps, 1.9, 0.5);
  const o = out === undefined ? 1 : 1 - clamp((f / fps - out) / 0.3);
  return {a, vis: clamp(a * 1.6) * o, on: a > 0 && o > 0};
};
// "12 345" with non-breaking spaces between thousands
export const fmt = (v: number, dec = 0) => {
  const s = Math.abs(v).toFixed(dec).split('.');
  return (v < 0 ? '−' : '') + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (s[1] ? ',' + s[1] : '');
};
// value rolling from `from` to `to` during `dur` seconds after `at` (fast start, soft landing)
export const rollValue = (f: number, fps: number, at: number, from: number, to: number, dur = 1.2) => lerp(from, to, easeOut((f / fps - at) / dur));

// heavy caps with an ink outline: the outline is a second copy underneath (a stroke on the same glyphs
// shows the font's overlapping contours inside letters like А and Д)
const Outlined: React.FC<{style: React.CSSProperties; w?: number; children: React.ReactNode}> = ({style, w = 10, children}) => (
  <span style={{position: 'relative', display: 'inline-block', ...style}}>
    <span aria-hidden style={{position: 'absolute', inset: 0, color: INK, WebkitTextStroke: `${w}px ${INK}`, textShadow: '0 10px 0 rgba(10,8,25,0.55)'}}>{children}</span>
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);

const plate = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: UI.plate, border: `4px solid ${UI.edge}`, borderRadius: 26, boxShadow: '0 12px 0 rgba(10,8,25,0.35)', ...extra,
});

// a number that rolls to its value with a label under it; small progress line fills while it rolls
export const Counter: React.FC<Timed & {to: number; from?: number; dur?: number; label: string; prefix?: string; suffix?: string; dec?: number;
  x?: number; y?: number; accent?: string; size?: number}> =
  ({f, fps, at, out, to, from = 0, dur = 1.2, label, prefix = '', suffix = '', dec = 0, x = 1480, y = 120, accent = UI.gold, size = 120}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const v = rollValue(f, fps, at, from, to, dur);
  const k = clamp((f / fps - at) / dur);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${0.6 + 0.4 * e.a})`, transformOrigin: '50% 0%', opacity: e.vis,
        ...plate({padding: '22px 46px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 300})}}>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1, color: accent, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
          textShadow: `0 0 28px ${accent}55`}}>{prefix}{fmt(v, dec)}{suffix}</div>
        <div style={{width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)', margin: '14px 0 12px', overflow: 'hidden'}}>
          <div style={{width: `${k * 100}%`, height: '100%', background: accent, borderRadius: 4}} />
        </div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: UI.cream, whiteSpace: 'nowrap'}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};

// big number + caption, no bar; value can be text ("x2", "1/3") or a number (then it rolls)
export const NumberCard: React.FC<Timed & {value: number | string; caption: string; x?: number; y?: number; accent?: string; size?: number; dur?: number}> =
  ({f, fps, at, out, value, caption, x = 960, y = 140, accent = UI.gold, size = 190, dur = 1.1}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const shown = typeof value === 'number' ? fmt(Math.round(rollValue(f, fps, at, 0, value, dur))) : value;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${0.5 + 0.5 * e.a}) rotate(${(1 - clamp(e.a)) * -4}deg)`,
        transformOrigin: '50% 30%', opacity: e.vis, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 0.95, color: accent, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
          <span style={{position: 'absolute', inset: 0, color: INK, WebkitTextStroke: `28px ${INK}`, textShadow: '0 14px 0 rgba(10,8,25,0.5)'}}>{shown}</span>
          <span style={{position: 'relative', textShadow: `0 0 40px ${accent}66`}}>{shown}</span>
        </div>
        <div style={{...plate({padding: '12px 30px', borderRadius: 18, marginTop: 6}), fontFamily: MONT, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: UI.cream, whiteSpace: 'nowrap'}}>
          {caption}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A vs B: two horizontal bars grow to their share of `max`, values roll with them
type Bar = {label: string; value: number; color?: string};
export const Compare: React.FC<Timed & {a: Bar; b: Bar; title?: string; unit?: string; max?: number; x?: number; y?: number; w?: number}> =
  ({f, fps, at, out, a, b, title, unit = '', max, x = 960, y = 150, w = 900}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const m = max ?? Math.max(a.value, b.value) * 1.08;
  const row = (r: Bar, i: number, color: string) => {
    const k = easeOut((f / fps - at - 0.25 - i * 0.25) / 0.9);
    return (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: i ? 18 : 0}}>
        <div style={{width: 210, textAlign: 'right', fontFamily: MONT, fontWeight: 800, fontSize: 34, color: UI.cream, whiteSpace: 'nowrap'}}>{r.label}</div>
        <div style={{flex: 1, height: 54, borderRadius: 14, background: 'rgba(255,255,255,0.08)', position: 'relative'}}>
          <div style={{width: `${(r.value / m) * 100 * k}%`, height: '100%', borderRadius: 14, background: color, border: `4px solid ${INK}`, boxSizing: 'border-box',
            boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.18)'}} />
        </div>
        <div style={{width: 190, fontFamily: MONT, fontWeight: 900, fontSize: 46, color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{fmt(r.value * k)}{unit}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translateX(-50%) scale(${0.7 + 0.3 * e.a})`, transformOrigin: '50% 0%', opacity: e.vis,
        ...plate({padding: '26px 36px 30px'})}}>
        {title && <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 5, color: '#fff', marginBottom: 20, textAlign: 'center'}}>{title}</div>}
        {row(a, 0, a.color ?? UI.blue)}
        {row(b, 1, b.color ?? UI.coral)}
      </div>
    </AbsoluteFill>
  );
};

// "чертёж": navy grid, double light-blue frame, title block; children = your line drawing in 0..w x 0..h,
// given the draw progress k (0..1). Use drawOn(k, length) on strokes so lines draw themselves.
export const BP = {bg: '#132a5c', grid: '#24468a', line: '#cfe6ff', dim: '#7fb0ee', gold: '#ffd27a'};
export const drawOn = (k: number, len: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - clamp(k))});
export const BlueprintCard: React.FC<Timed & {title: string; no?: string; x?: number; y?: number; w?: number; h?: number; dur?: number;
  labels?: {x: number; y: number; text: string; at: number}[]; children?: (k: number) => React.ReactNode}> =
  ({f, fps, at, out, title, no = '01', x = 960, y = 110, w = 1100, h = 620, dur = 1.6, labels = [], children}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const k = clamp((f / fps - at - 0.2) / dur);
  const t = f / fps;
  const font = {fontFamily: MONT, fontWeight: 800} as const;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: x - w / 2, top: y, width: w, height: h, opacity: e.vis, transform: `scale(${0.85 + 0.15 * e.a})`, transformOrigin: '50% 50%',
        borderRadius: 18, overflow: 'hidden', boxShadow: '0 16px 0 rgba(10,8,25,0.4)', border: `5px solid ${INK}`}}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position: 'absolute', inset: 0}}>
          <rect width={w} height={h} fill={BP.bg} />
          {Array.from({length: Math.ceil(w / 30)}, (_, i) => <path key={`v${i}`} d={`M ${i * 30} 0 L ${i * 30} ${h}`} stroke={BP.grid} strokeWidth={i % 5 ? 1 : 2.2} opacity={i % 5 ? 0.55 : 0.9} />)}
          {Array.from({length: Math.ceil(h / 30)}, (_, i) => <path key={`h${i}`} d={`M 0 ${i * 30} L ${w} ${i * 30}`} stroke={BP.grid} strokeWidth={i % 5 ? 1 : 2.2} opacity={i % 5 ? 0.55 : 0.9} />)}
          <rect x={18} y={18} width={w - 36} height={h - 36} fill="none" stroke={BP.line} strokeWidth={3} />
          <rect x={28} y={28} width={w - 56} height={h - 56} fill="none" stroke={BP.line} strokeWidth={1.2} opacity={0.7} />
          {/* title block, bottom-right */}
          <g transform={`translate(${w - 360} ${h - 104})`}>
            <rect width={332} height={76} fill={BP.bg} stroke={BP.line} strokeWidth={2} />
            <path d="M 70 0 L 70 76" stroke={BP.line} strokeWidth={2} />
          </g>
          <g fill="none" stroke={BP.line} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">{children?.(k)}</g>
        </svg>
        <div style={{position: 'absolute', left: w - 360, top: h - 104, width: 70, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 26, color: BP.gold}}>{no}</div>
        <div style={{position: 'absolute', left: w - 290, top: h - 104, width: 262, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', ...font, fontSize: 26,
          letterSpacing: 3, color: BP.line, textAlign: 'center', lineHeight: 1.05}}>{title}</div>
        {labels.map((l, i) => {
          const a = clamp((t - l.at) / 0.25);
          return a > 0 ? (
            <div key={i} style={{position: 'absolute', left: l.x, top: l.y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * a})`, opacity: a,
              ...font, fontSize: 30, letterSpacing: 2, color: BP.gold, background: BP.bg, padding: '2px 10px', border: `2px solid ${BP.dim}`, borderRadius: 8, whiteSpace: 'nowrap'}}>{l.text}</div>
          ) : null;
        })}
      </div>
    </AbsoluteFill>
  );
};

// chapter title: small kicker above, big caps letters pop in one by one, lines sweep out to both sides
export const TitleCard: React.FC<Timed & {title: string; kicker?: string; y?: number; dim?: number; accent?: string}> =
  ({f, fps, at, out, title, kicker, y = 400, dim = 0.45, accent = UI.gold}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const t = f / fps - at;
  const line = easeOut((t - 0.2) / 0.6);
  return (
    <AbsoluteFill style={{background: `rgba(5,4,12,${dim * e.vis})`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: e.vis}}>
        {kicker && <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 34, letterSpacing: 12, color: accent, marginBottom: 14, opacity: clamp(t / 0.3)}}>{kicker}</div>}
        <div style={{display: 'flex', gap: 4}}>
          {[...title].map((ch, i) => {
            const p = spring01(f, (at + 0.05 + i * 0.035) * fps, fps, 2.6, 0.45);
            return (
              <Outlined key={i} w={12} style={{fontFamily: MONT, fontWeight: 900, fontSize: 118, letterSpacing: 6, color: '#fff', minWidth: ch === ' ' ? 34 : undefined,
                transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`, opacity: clamp(p * 1.5), filter: `drop-shadow(0 0 18px ${accent}55)`}}>{ch}</Outlined>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 18}}>
          <div style={{width: 360 * line, height: 6, borderRadius: 3, background: accent}} />
          <div style={{width: 14, height: 14, borderRadius: 7, background: accent, opacity: line}} />
          <div style={{width: 360 * line, height: 6, borderRadius: 3, background: accent}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// end screen: the question, a comment bubble and a subscribe pill (text only, no platform logos)
export const EndScreen: React.FC<Timed & {question: string; comment?: string; subscribe?: string; accent?: string}> =
  ({f, fps, at, out, question, comment = 'ПИШИ В КОММЕНТАРИЯХ', subscribe = 'ПОДПИШИСЬ', accent = UI.coral}) => {
  const e = env({f, fps, at, out});
  if (!e.on) return null;
  const t = f / fps - at;
  const b1 = spring01(f, (at + 0.45) * fps, fps, 2, 0.45), b2 = spring01(f, (at + 0.75) * fps, fps, 2, 0.45);
  const pulse = 1 + Math.max(0, Math.sin((t - 1.2) * 4)) * 0.035 * clamp(t - 1.2);
  return (
    <AbsoluteFill style={{background: `rgba(5,4,12,${0.55 * e.vis})`}}>
      <div style={{position: 'absolute', left: 160, right: 160, top: 170, textAlign: 'center', opacity: e.vis, transform: `translateY(${(1 - clamp(e.a)) * 30}px)`}}>
        <Outlined w={16} style={{fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 1.1, color: '#fff'}}>{question}</Outlined>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 60}}>
        <div style={{position: 'relative', opacity: clamp(b1 * 1.5), transform: `scale(${0.6 + 0.4 * b1})`}}>
          <div style={{...plate({padding: '28px 44px', borderRadius: 34, background: UI.cream, border: `5px solid ${INK}`}), fontFamily: MONT, fontWeight: 900, fontSize: 40, color: INK, letterSpacing: 2}}>{comment}</div>
          <svg width={60} height={44} viewBox="0 0 60 44" style={{position: 'absolute', left: 50, bottom: -38}}>
            <path d="M 4 0 L 50 0 L 10 40 Z" fill={UI.cream} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 2 -4 L 54 -4" stroke={UI.cream} strokeWidth={8} />
          </svg>
        </div>
        <div style={{opacity: clamp(b2 * 1.5), transform: `scale(${(0.6 + 0.4 * b2) * pulse})`, alignSelf: 'center',
          ...plate({padding: '26px 56px', borderRadius: 60, background: accent, border: `5px solid ${INK}`}), fontFamily: MONT, fontWeight: 900, fontSize: 48, color: '#fff', letterSpacing: 4,
          textShadow: '0 4px 0 rgba(10,8,25,0.35)'}}>{subscribe}</div>
      </div>
    </AbsoluteFill>
  );
};
