// Full-frame close-up of the phone in your hand: status bar, big clock, "no network" notice, battery widget.
// Beats (seconds): noSignal, noNet, battery (the moment the % drops). Draws in screen space 1920x1080.
import React from 'react';
import {INK, OW, HERO} from '../rig/style';
import {clamp, easeOut, spring01, wobble} from '../lib/anim';

type Beats = {noSignal: number; noNet: number; battery: number};
const W = 420, H = 840; // phone body
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

export const PhoneInsert: React.FC<{f: number; fps: number; t0: number; time: string; day: string; font: string; beats: Beats}> = ({f, fps, t0, time, day, font, beats}) => {
  const t = f / fps, lt = t - t0;
  const enter = easeOut(lt / 0.5);
  const sx = wobble(t * 0.9, 4) * 4, sy = wobble(t * 0.7, 7) * 5 + (1 - enter) * 160;
  const push = 1 + lt * 0.012;
  const searching = t < beats.noSignal;
  const noNet = spring01(f, beats.noNet * fps, fps, 2.4, 0.5);
  const bat = spring01(f, (beats.battery - 0.35) * fps, fps, 2.2, 0.5);
  const pct = t < beats.battery + 0.35 ? 24 : 23;
  const pctPop = spring01(f, (beats.battery + 0.35) * fps, fps, 3, 0.4);
  const S = HERO.skin;

  // signal bars: while searching they sweep, then go empty with an X
  const bars = [0, 1, 2, 3].map((i) => {
    const on = searching ? (Math.floor(t * 6) % 5) > i : false;
    return <rect key={i} x={i * 9} y={-6 - i * 5} width={6} height={10 + i * 5} rx={1.5} fill={on ? '#ffffff' : 'rgba(255,255,255,0.28)'} />;
  });

  return (
    <g>
      <defs>
        <radialGradient id="pi-bg" cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#25305e" /><stop offset="1" stopColor="#0b0f24" />
        </radialGradient>
        <linearGradient id="pi-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2f73" /><stop offset="0.6" stopColor="#1f2350" /><stop offset="1" stopColor="#141836" />
        </linearGradient>
        <radialGradient id="pi-glow" r="0.5"><stop offset="0" stopColor="#bcdcff" stopOpacity="0.45" /><stop offset="1" stopColor="#bcdcff" stopOpacity="0" /></radialGradient>
        <clipPath id="pi-screen"><rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={40} /></clipPath>
      </defs>
      <rect x={-50} y={-50} width={2020} height={1180} fill="url(#pi-bg)" />
      {/* soft out-of-focus room behind: window glints, kettle, cabinet */}
      {[[260, 300, 90, '#3a4a8a'], [420, 760, 60, '#2c3a73'], [1600, 260, 110, '#2f3b78'], [1720, 700, 70, '#3a3f7a'], [1500, 860, 45, '#4a3a6a']].map(([x, y, r, c], i) => (
        <circle key={i} cx={(x as number) + wobble(t * 0.3, i) * 6} cy={y as number} r={r as number} fill={c as string} opacity={0.55} />
      ))}
      <g transform={`translate(${960 + sx} ${462 + sy}) scale(${0.88 * push}) rotate(-5)`}>
        <ellipse cx={0} cy={-40} rx={520} ry={560} fill="url(#pi-glow)" style={{mixBlendMode: 'screen'}} />
        {/* forearm + sleeve from the bottom */}
        <path d="M 40 380 L 120 760" stroke={INK} strokeWidth={150 + OW * 2} strokeLinecap="round" />
        <path d="M 40 380 L 120 760" stroke={HERO.top} strokeWidth={150} strokeLinecap="round" />
        <path d="M 30 360 L 60 470" stroke={HERO.cuff} strokeWidth={140} strokeLinecap="round" />
        {/* palm behind the phone */}
        <ellipse cx={110} cy={290} rx={170} ry={120} fill={S.base} {...st} />
        {/* phone */}
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={56} fill="#22263a" {...st} />
        <g clipPath="url(#pi-screen)">
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="url(#pi-wall)" />
          <circle cx={120} cy={-240} r={180} fill="#5a3f8f" opacity={0.35} />
          <circle cx={-140} cy={160} r={220} fill="#2c4f8f" opacity={0.3} />
          {/* status bar */}
          <g fontFamily={font} fill="#ffffff">
            <text x={-W / 2 + 46} y={-H / 2 + 62} fontSize={26} fontWeight={800}>{time}</text>
            <g transform={`translate(${W / 2 - 150} ${-H / 2 + 60})`}>
              {bars}
              {!searching && <path d="M 40 -22 l 12 12 M 52 -22 l -12 12" stroke="#ff6b6b" strokeWidth={4} strokeLinecap="round" />}
            </g>
            <g transform={`translate(${W / 2 - 88} ${-H / 2 + 44})`}>
              <rect x={0} y={0} width={44} height={22} rx={5} fill="none" stroke="#ffffff" strokeWidth={3} />
              <rect x={46} y={7} width={4} height={8} rx={1.5} fill="#ffffff" />
              <rect x={4} y={4} width={36 * pct / 100 + 2} height={14} rx={2} fill="#ffb347" />
            </g>
            {!searching && <text x={-W / 2 + 46} y={-H / 2 + 100} fontSize={22} fontWeight={700} fill="#ff8f8f" opacity={clamp((t - beats.noSignal) * 4)}>Нет сети</text>}
            {searching && <text x={-W / 2 + 46} y={-H / 2 + 100} fontSize={22} fontWeight={700} fill="rgba(255,255,255,0.6)">Поиск сети…</text>}
          </g>
          {/* big clock */}
          <g fontFamily={font} fill="#ffffff" textAnchor="middle">
            <text x={0} y={-170} fontSize={120} fontWeight={800} letterSpacing={-2}>{time}</text>
            <text x={0} y={-118} fontSize={28} fontWeight={700} opacity={0.75}>{day}</text>
          </g>
          {/* notification: no internet */}
          <g transform={`translate(0 ${-10 + (1 - clamp(noNet)) * -60})`} opacity={clamp(noNet * 1.4)}>
            <rect x={-180} y={-50} width={360} height={100} rx={24} fill="rgba(255,255,255,0.92)" />
            <g transform="translate(-118 0)">
              <circle r={30} fill="#ffe1e1" />
              <path d="M -16 -2 Q 0 -16 16 -2 M -9 6 Q 0 -2 9 6" stroke="#e05555" strokeWidth={4.5} fill="none" strokeLinecap="round" />
              <circle cy={13} r={3.5} fill="#e05555" />
              <path d="M -16 -18 L 16 18" stroke="#e05555" strokeWidth={4.5} strokeLinecap="round" />
            </g>
            <text x={-74} y={-6} fontFamily={font} fontSize={25} fontWeight={800} fill="#1f2236">Нет интернета</text>
            <text x={-74} y={26} fontFamily={font} fontSize={18} fontWeight={600} fill="#6a6f85">Проверьте сеть</text>
          </g>
          {/* battery widget */}
          <g transform={`translate(0 ${190}) scale(${0.6 + 0.4 * clamp(bat)})`} opacity={clamp(bat * 1.5)}>
            <rect x={-150} y={-90} width={300} height={180} rx={34} fill="rgba(20,22,44,0.82)" />
            <rect x={-120} y={-28} width={92} height={50} rx={10} fill="none" stroke="#ffffff" strokeWidth={5} />
            <rect x={-26} y={-12} width={8} height={18} rx={3} fill="#ffffff" />
            <rect x={-113} y={-21} width={78 * pct / 100 + 3} height={36} rx={5} fill={pct < 24 ? '#ff7a59' : '#ffb347'} />
            <text x={0} y={-52} fontFamily={font} fontSize={24} fontWeight={700} fill="rgba(255,255,255,0.7)" textAnchor="middle">Заряд</text>
            <text x={62} y={20} fontFamily={font} fontSize={58 * (1 + 0.15 * Math.max(0, 1 - pctPop) * (t > beats.battery + 0.35 ? 1 : 0))} fontWeight={900} fill="#ffffff" textAnchor="middle">{pct}%</text>
          </g>
        </g>
        <rect x={-46} y={-H / 2 + 26} width={92} height={24} rx={12} fill="#0d0f1a" />
        {/* thumb on the left edge, fingers on the right edge */}
        <path d={`M ${-W / 2 - 40} 330 C ${-W / 2 - 46} 250 ${-W / 2 - 6} 190 ${-W / 2 + 34} 214 C ${-W / 2 + 66} 236 ${-W / 2 + 40} 300 ${-W / 2 + 10} 360 Z`} fill={S.base} {...st} />
        {[150, 225, 300].map((y, i) => (
          <rect key={i} x={W / 2 - 34} y={y - 30} width={78} height={62} rx={30} fill={S.base} {...st} />
        ))}
        <path d={`M ${W / 2 - 18} 136 q 14 0 18 12`} stroke={S.line} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};
