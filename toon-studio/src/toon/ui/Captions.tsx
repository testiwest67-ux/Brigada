// Screen-space UI that always sits above the set: word-by-word subtitles and the time/day plate.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import {INK} from '../rig/style';
import {clamp, easeOut, spring01} from '../lib/anim';

export const {fontFamily: MONT} = loadFont('normal', {weights: ['700', '800', '900'], subsets: ['cyrillic', 'latin']});

export type VLine = {text: string; start: number; end: number; words: {w: string; t: number}[]};

// one phrase at a time; each word pops in when it is spoken, the layout never jumps (hidden words keep their place)
export const Subtitles: React.FC<{lines: VLine[]; f: number; fps: number; total: number; bottom?: number}> = ({lines, f, fps, total, bottom = 64}) => {
  const t = f / fps;
  const idx = lines.findIndex((l, i) => t >= l.start - 0.08 && t < (i + 1 < lines.length ? lines[i + 1].start - 0.08 : total));
  if (idx < 0) return null;
  const line = lines[idx];
  const words = line.words.map((w) => {
    const p = spring01(f, w.t * fps - 1, fps, 3.2, 0.62);
    return {w: w.w.toUpperCase(), shown: f >= w.t * fps - 1, s: 0.7 + 0.3 * p, o: clamp(p * 1.6)};
  });
  const row = (outline: boolean) => (
    <div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 34px', padding: '0 120px'}}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: 'inline-block', fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 1.08, letterSpacing: 1,
          color: outline ? INK : '#ffffff', WebkitTextStroke: outline ? `22px ${INK}` : undefined,
          textShadow: outline ? '0 10px 0 rgba(10,8,25,0.55)' : undefined,
          opacity: w.shown ? w.o : 0, transform: `scale(${w.s})`, transformOrigin: '50% 70%',
        }}>{w.w}</span>
      ))}
    </div>
  );
  return <AbsoluteFill>{row(true)}{row(false)}</AbsoluteFill>;
};

// time + weekday plate, top-left. Clock icon hands show the same time.
export const TimePlate: React.FC<{f: number; fps: number; dayAt: number; timeAt: number; time: string; day: string}> = ({f, fps, dayAt, timeAt, time, day}) => {
  const a = spring01(f, dayAt * fps, fps, 1.8, 0.5);
  if (a <= 0) return null;
  const b = easeOut((f - timeAt * fps) / 8);
  const [hh, mm] = time.split(':').map(Number);
  const ha = ((hh % 12) / 12 + mm / 720) * 360, ma = (mm / 60) * 360;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 56, top: 48, transform: `translateX(${(1 - a) * -60}px)`, opacity: clamp(a * 1.5),
        display: 'flex', alignItems: 'center', gap: 20, padding: '16px 30px 16px 20px', borderRadius: 22,
        background: 'rgba(22,24,44,0.86)', border: '4px solid rgba(255,255,255,0.12)', boxShadow: '0 10px 0 rgba(10,8,25,0.35)'}}>
        <svg width={80} height={80} viewBox="-35 -35 70 70">
          <circle r={29} fill="#f3eee6" stroke={INK} strokeWidth={4} />
          {[0, 90, 180, 270].map((d) => <line key={d} x1={0} y1={-22} x2={0} y2={-26} stroke={INK} strokeWidth={3.5} transform={`rotate(${d})`} strokeLinecap="round" />)}
          <line x1={0} y1={0} x2={0} y2={-13} stroke={INK} strokeWidth={5} strokeLinecap="round" transform={`rotate(${ha})`} />
          <line x1={0} y1={0} x2={0} y2={-20} stroke="#e3654f" strokeWidth={4} strokeLinecap="round" transform={`rotate(${ma})`} />
          <circle r={3.5} fill={INK} />
        </svg>
        <div style={{display: 'flex', flexDirection: 'column', fontFamily: MONT, color: '#fff', lineHeight: 1}}>
          <div style={{fontWeight: 900, fontSize: 70, letterSpacing: 2, height: 72, overflow: 'hidden'}}>
            <div style={{transform: `translateY(${(1 - clamp(b)) * 72}px)`, opacity: clamp(b)}}>{time}</div>
          </div>
          <div style={{fontWeight: 800, fontSize: 29, letterSpacing: 8, color: '#ffd27a', marginTop: 6}}>{day}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
