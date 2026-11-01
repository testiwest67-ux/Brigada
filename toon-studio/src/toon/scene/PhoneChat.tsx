// Full-frame close-up of the phone in a messenger chat: weak signal, 3 % battery, your message types itself out
// and fails with a red "!". Beats (seconds): type (message starts appearing), fail. Draws in screen space 1920x1080.
import React from 'react';
import {INK, OW, Look} from '../rig/style';
import {clamp, easeOut, spring01, wobble} from '../lib/anim';

type Beats = {type: number; fail: number};
const W = 420, H = 840;
const st = {stroke: INK, strokeWidth: OW, strokeLinejoin: 'round' as const};

export const PhoneChat: React.FC<{f: number; fps: number; t0: number; time: string; font: string; look: Look; who: string; incoming: string; msg: string; beats: Beats}> =
  ({f, fps, t0, time, font, look, who, incoming, msg, beats}) => {
  const t = f / fps, lt = t - t0;
  const enter = easeOut(lt / 0.5);
  const sx = wobble(t * 0.9, 4) * 4, sy = wobble(t * 0.7, 7) * 5 + (1 - enter) * 160;
  const chars = Math.floor(clamp((t - beats.type) / Math.max(0.3, beats.fail - beats.type - 0.4)) * msg.length);
  const sent = t >= beats.fail - 0.35;
  const fail = spring01(f, beats.fail * fps, fps, 2.6, 0.45);
  const lowBlink = 0.55 + 0.45 * Math.sin(t * 6);
  const S = look.skin;
  return (
    <g>
      <defs>
        <radialGradient id="pc-bg" cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#4a2a3e" /><stop offset="1" stopColor="#120c1c" />
        </radialGradient>
        <radialGradient id="pc-glow" r="0.5"><stop offset="0" stopColor="#bcdcff" stopOpacity="0.4" /><stop offset="1" stopColor="#bcdcff" stopOpacity="0" /></radialGradient>
        <clipPath id="pc-screen"><rect x={-W / 2 + 18} y={-H / 2 + 18} width={W - 36} height={H - 36} rx={40} /></clipPath>
      </defs>
      <rect x={-50} y={-50} width={2020} height={1180} fill="url(#pc-bg)" />
      {[[300, 260, 100, '#7a3a3a'], [1640, 300, 120, '#5a2e44'], [1580, 820, 80, '#6a3440'], [380, 820, 70, '#3a2e5a']].map(([x, y, r, c], i) => (
        <circle key={i} cx={(x as number) + wobble(t * 0.3, i) * 6} cy={y as number} r={r as number} fill={c as string} opacity={0.6} />
      ))}
      <g transform={`translate(${960 + sx} ${462 + sy}) scale(0.88) rotate(4)`}>
        <ellipse cx={0} cy={-40} rx={520} ry={560} fill="url(#pc-glow)" style={{mixBlendMode: 'screen'}} />
        <path d="M -40 380 L -120 760" stroke={INK} strokeWidth={150 + OW * 2} strokeLinecap="round" />
        <path d="M -40 380 L -120 760" stroke={look.top} strokeWidth={150} strokeLinecap="round" />
        <path d="M -30 360 L -60 470" stroke={look.cuff} strokeWidth={140} strokeLinecap="round" />
        <ellipse cx={-110} cy={290} rx={170} ry={120} fill={S.base} {...st} />
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={56} fill="#22263a" {...st} />
        <g clipPath="url(#pc-screen)">
          <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#eef0f5" />
          {/* header */}
          <rect x={-W / 2} y={-H / 2} width={W} height={170} fill="#3c4a78" />
          <g fontFamily={font} fill="#ffffff">
            <text x={-W / 2 + 46} y={-H / 2 + 62} fontSize={26} fontWeight={800}>{time}</text>
            <g transform={`translate(${W / 2 - 150} ${-H / 2 + 60})`}>
              {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 9} y={-6 - i * 5} width={6} height={10 + i * 5} rx={1.5} fill={i === 0 ? '#ffffff' : 'rgba(255,255,255,0.28)'} />)}
            </g>
            <g transform={`translate(${W / 2 - 96} ${-H / 2 + 44})`}>
              <rect x={0} y={0} width={44} height={22} rx={5} fill="none" stroke="#ffffff" strokeWidth={3} />
              <rect x={46} y={7} width={4} height={8} rx={1.5} fill="#ffffff" />
              <rect x={4} y={4} width={4} height={14} rx={1.5} fill="#ff5a4a" opacity={lowBlink} />
              <text x={-10} y={19} fontSize={20} fontWeight={800} fill="#ff8f8f" textAnchor="end">3%</text>
            </g>
            <circle cx={-W / 2 + 76} cy={-H / 2 + 122} r={30} fill="#e8b04a" />
            <text x={-W / 2 + 76} y={-H / 2 + 132} fontSize={28} fontWeight={900} fill="#3c4a78" textAnchor="middle">{who[0]}</text>
            <text x={-W / 2 + 122} y={-H / 2 + 120} fontSize={30} fontWeight={800}>{who}</text>
            <text x={-W / 2 + 122} y={-H / 2 + 148} fontSize={18} fontWeight={600} opacity={0.7}>была в сети в 19:58</text>
          </g>
          {/* incoming */}
          <g fontFamily={font}>
            <rect x={-W / 2 + 34} y={-120} width={220} height={66} rx={22} fill="#ffffff" stroke="#d3d7e0" strokeWidth={2} />
            <text x={-W / 2 + 58} y={-78} fontSize={26} fontWeight={700} fill="#1f2236">{incoming}</text>
          </g>
          {/* outgoing message, typed letter by letter, then fails */}
          {chars > 0 && (
            <g fontFamily={font} transform={`translate(0 ${sent ? 0 : 230})`}>
              <rect x={-W / 2 + 70} y={-10} width={W - 110} height={110} rx={24} fill={sent ? '#cfe9c4' : '#ffffff'} stroke="#b8c9b0" strokeWidth={2} />
              <text x={-W / 2 + 94} y={36} fontSize={25} fontWeight={700} fill="#1f2236">{msg.slice(0, Math.min(chars, 17))}</text>
              <text x={-W / 2 + 94} y={70} fontSize={25} fontWeight={700} fill="#1f2236">{msg.slice(17, chars)}</text>
              {t > beats.fail - 0.05 && (
                <g transform={`translate(${W / 2 - 22} 46) scale(${clamp(fail) * (1 + 0.2 * Math.max(0, 1 - fail))})`}>
                  <circle r={22} fill="#e05555" />
                  <text y={10} fontSize={30} fontWeight={900} fill="#ffffff" textAnchor="middle">!</text>
                </g>
              )}
              {t > beats.fail && <text x={W / 2 - 52} y={130} fontSize={19} fontWeight={700} fill="#e05555" textAnchor="end" opacity={clamp(fail)}>Не доставлено</text>}
            </g>
          )}
          {/* input bar */}
          <rect x={-W / 2} y={H / 2 - 120} width={W} height={120} fill="#ffffff" />
          <rect x={-W / 2 + 30} y={H / 2 - 96} width={W - 130} height={56} rx={28} fill="#eef0f5" />
          <circle cx={W / 2 - 54} cy={H / 2 - 68} r={28} fill="#3c4a78" />
          <path d={`M ${W / 2 - 66} ${H / 2 - 68} l 22 -10 l -6 10 l 6 10 Z`} fill="#ffffff" />
        </g>
        <rect x={-46} y={-H / 2 + 26} width={92} height={24} rx={12} fill="#0d0f1a" />
        <path d={`M ${W / 2 + 40} 330 C ${W / 2 + 46} 250 ${W / 2 + 6} 190 ${W / 2 - 34} 214 C ${W / 2 - 66} 236 ${W / 2 - 40} 300 ${W / 2 - 10} 360 Z`} fill={S.base} {...st} />
        {[150, 225, 300].map((y, i) => <rect key={i} x={-W / 2 - 44} y={y - 30} width={78} height={62} rx={30} fill={S.base} {...st} />)}
      </g>
    </g>
  );
};
