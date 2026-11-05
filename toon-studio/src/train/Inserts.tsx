// 2D close-up inserts for «Последняя электричка» (1080×1920 SVG): the line map, the phone (chat + the photo from mom),
// the ticket on the pillow.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {FONT} from '../horror/fonts';
import {Kostya, KOSTYA_REST} from './Kostya';
import {MAP_STATIONS} from './Train3D';

const W = 1080, H = 1920;
const LIT = {bright: 0.9, warmRim: 0.2, coldRim: 0.5, cold: 0.3};

// ---------- the line map ----------
// k: slow push in; ghost: «ТИХАЯ» showing through the gap; here: blink the «you are here» dot at station i
export const MapInsert: React.FC<{k: number; ghost: number; t: number; here?: number}> = ({k, ghost, t, here = 1}) => {
  const s = lerp(1, 1.18, k);
  const r = mulberry32(2);
  return (
    <AbsoluteFill style={{background: '#0b0d10'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="mapLight" cx="0.45" cy="0.42" r="0.7"><stop offset="0" stopColor="#fff6e0" stopOpacity={0.18} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient>
        </defs>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) rotate(-6) translate(${-W / 2} ${-H / 2})`}>
          {/* the panel */}
          <rect x={-80} y={640} width={1240} height={640} rx={14} fill="#efe9d6" stroke="#8a8578" strokeWidth={10} />
          {Array.from({length: 60}, (_, i) => <circle key={i} cx={-60 + r() * 1200} cy={660 + r() * 600} r={2 + r() * 5} fill="#6a5a40" opacity={0.08 + r() * 0.1} />)}
          <text x={-30} y={720} fontFamily={FONT} fontWeight={900} fontSize={44} fill="#2a3a6a">СХЕМА ЛИНИИ</text>
          <text x={1120} y={720} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={34} fill="#2a3a6a">время в пути ~40 мин</text>
          <line x1={-20} y1={960} x2={1100} y2={960} stroke="#b0262a" strokeWidth={22} strokeLinecap="round" />
          {MAP_STATIONS.map((st, i) => {
            const x = 30 + i * 260;
            const isGap = !st;
            const blink = i === here && Math.floor(t * 2.5) % 2 === 0;
            return (
              <g key={i}>
                <circle cx={x} cy={960} r={34} fill={isGap ? `rgba(255,255,255,${0.1 + ghost * 0.9})` : blink ? '#ffd23a' : '#fff'}
                  stroke={isGap ? `rgba(176,38,42,${0.12 + ghost * 0.88})` : '#b0262a'} strokeWidth={12} />
                <text x={x} y={1090} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44}
                  fill={isGap ? `rgba(120,16,16,${ghost})` : '#1c1c28'} transform={`rotate(-28 ${x} 1090)`}>{isGap ? 'ТИХАЯ' : st}</text>
              </g>
            );
          })}
          {/* scratches over the gap */}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${530 + i * 18} 900 l 40 120`} stroke="#9a8f78" strokeWidth={4} opacity={0.5} />)}
        </g>
        <rect width={W} height={H} fill="url(#mapLight)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the phone ----------
// mode 'chat': his message, then «печатает…», then mom's reply; 'photo': the photo of his room, him asleep in a wet jacket
export const PhoneInsert: React.FC<{mode: 'chat' | 'photo'; t: number; typed: number; reply: number; zoom: number}> = ({mode, t, typed, reply, zoom}) => {
  const msg = 'Мам, тут что-то не так';
  const shown = msg.slice(0, Math.round(typed * msg.length));
  const pw = 640, ph = 1240, px = (W - pw) / 2, py = 300;
  const s = lerp(1, mode === 'photo' ? 1.5 : 1.08, zoom);
  const ry = mode === 'photo' ? lerp(0, -170, zoom) : 0;
  const shake = Math.sin(t * 9) * 3 + Math.sin(t * 13) * 2;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1d2633 0%, #07090c 75%)'}}>
      <svg width={W} height={H}>
        <defs>
          <clipPath id="scr"><rect x={px + 22} y={py + 22} width={pw - 44} height={ph - 44} rx={46} /></clipPath>
          <filter id="glowP"><feGaussianBlur stdDeviation={30} /></filter>
        </defs>
        <g transform={`translate(${W / 2 + shake} ${H / 2 + ry}) scale(${s}) translate(${-W / 2} ${-H / 2})`}>
          <rect x={px - 30} y={py - 30} width={pw + 60} height={ph + 60} rx={90} fill="#bfe0ff" opacity={0.12} filter="url(#glowP)" />
          <rect x={px} y={py} width={pw} height={ph} rx={70} fill="#14151a" stroke="#3a3c46" strokeWidth={6} />
          <g clipPath="url(#scr)">
            <rect x={px} y={py} width={pw} height={ph} fill={mode === 'photo' ? '#0e0f12' : '#e9edf2'} />
            {mode === 'chat' ? (
              <g fontFamily={FONT}>
                <rect x={px} y={py} width={pw} height={170} fill="#f7f8fa" />
                <circle cx={px + 90} cy={py + 110} r={38} fill="#c86a52" />
                <text x={px + 90} y={py + 124} textAnchor="middle" fontWeight={900} fontSize={36} fill="#fff">М</text>
                <text x={px + 150} y={py + 104} fontWeight={800} fontSize={38} fill="#1c1c28">Мама</text>
                <text x={px + 150} y={py + 144} fontWeight={600} fontSize={26} fill={reply > 0 && reply < 1 ? '#3a8a4a' : '#8a8f98'}>{reply > 0 && reply < 1 ? 'печатает…' : 'в сети'}</text>
                <text x={px + pw - 60} y={py + 230} textAnchor="end" fontWeight={600} fontSize={24} fill="#8a8f98">00:47</text>
                {shown && (
                  <g>
                    <rect x={px + pw - 60 - Math.max(160, shown.length * 21)} y={py + 470} width={Math.max(160, shown.length * 21) + 20} height={110} rx={30} fill="#2f7ae0" />
                    <text x={px + pw - 50} y={py + 540} textAnchor="end" fontWeight={700} fontSize={34} fill="#fff" transform={`translate(-14 0)`}>{shown}</text>
                  </g>
                )}
                {reply > 0 && reply < 1 && (
                  <g>
                    <rect x={px + 40} y={py + 640} width={150} height={80} rx={30} fill="#fff" />
                    {[0, 1, 2].map((i) => <circle key={i} cx={px + 80 + i * 36} cy={py + 680 - Math.max(0, Math.sin(t * 9 - i)) * 10} r={10} fill="#9aa0aa" />)}
                  </g>
                )}
                {reply >= 1 && (
                  <g>
                    <rect x={px + 40} y={py + 640} width={430} height={170} rx={30} fill="#fff" />
                    <text x={px + 70} y={py + 705} fontWeight={700} fontSize={34} fill="#1c1c28">Ты о чём?</text>
                    <text x={px + 70} y={py + 765} fontWeight={700} fontSize={34} fill="#1c1c28">Ты же дома. Спишь.</text>
                  </g>
                )}
              </g>
            ) : (
              <PhotoOfRoom x={px + 22} y={py + 150} w={pw - 44} h={760} t={t} />
            )}
            {mode === 'photo' && <text x={px + pw / 2} y={py + 1040} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#9aa0aa">Мама · 00:47</text>}
          </g>
          {/* his thumb */}
          <ellipse cx={px + pw - 40} cy={py + ph - 120} rx={70} ry={110} fill="#efc6a6" stroke="#14121c" strokeWidth={7} transform={`rotate(-30 ${px + pw - 40} ${py + ph - 120})`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// the photo: his room at night lit by the flash, him asleep in his bed — in the wet jacket
const PhotoOfRoom: React.FC<{x: number; y: number; w: number; h: number; t: number}> = ({x, y, w, h, t}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#2c2a30" />
    <rect x={x} y={y} width={w} height={h * 0.55} fill="#5a5448" />
    {/* the window (dark), the poster with the bolt */}
    <rect x={x + 40} y={y + 60} width={180} height={220} fill="#0d1018" stroke="#d8d2c4" strokeWidth={8} />
    <rect x={x + w - 170} y={y + 70} width={110} height={150} fill="#1d2233" />
    <path d={`M ${x + w - 108} ${y + 90} l -34 60 l 24 0 l -10 54 l 40 -70 l -26 0 z`} fill="#f2c230" />
    {/* bed */}
    <rect x={x + 20} y={y + h * 0.52} width={w - 40} height={h * 0.34} rx={20} fill="#6a4a30" />
    <rect x={x + 30} y={y + h * 0.5} width={w - 60} height={90} rx={30} fill="#ece8e0" />
    <ellipse cx={x + 120} cy={y + h * 0.5 + 10} rx={110} ry={50} fill="#f6f3ec" />
    {/* him lying, head on the pillow (the doll rotated) */}
    <g transform={`translate(${x + 600} ${y + h * 0.5 + 40}) rotate(-90) scale(0.28)`}>
      <Kostya s={{...KOSTYA_REST, t, blink: 0, wet: 0.85, mouth: 0.15, tilt: 4}} light={LIT} id="photoK" crop={-100} />
    </g>
    <path d={`M ${x + 220} ${y + h * 0.5 + 60} C ${x + 300} ${y + h * 0.5 + 20} ${x + 420} ${y + h * 0.5 + 90} ${x + w - 30} ${y + h * 0.5 + 50} L ${x + w - 30} ${y + h * 0.86} L ${x + 220} ${y + h * 0.86} Z`} fill="#3b5a8a" opacity={0.92} />
    {/* drips on the floor */}
    {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={x + 300 + i * 60} cy={y + h * 0.92} rx={22 - i * 3} ry={6} fill="#7e9cb4" opacity={0.6} />)}
    {/* flash glare */}
    <rect x={x} y={y} width={w} height={h} fill="url(#flashG)" />
    <defs><radialGradient id="flashG" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stopColor="#fff" stopOpacity={0.18} /><stop offset="1" stopColor="#000" stopOpacity={0.4} /></radialGradient></defs>
  </g>
);

// ---------- the ticket on the pillow ----------
export const TicketInsert: React.FC<{k: number; reveal: number}> = ({k, reveal}) => {
  const s = lerp(1, 1.22, k);
  const lines = ['Тихая.', 'Ноль сорок семь.', 'Сегодня.'];
  void lines;
  return (
    <AbsoluteFill style={{background: '#b8bcc2'}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="pil" cx="0.5" cy="0.5" r="0.7"><stop offset="0" stopColor="#f6f4ee" /><stop offset="1" stopColor="#a8acb2" /></radialGradient>
        </defs>
        <g transform={`translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2} ${-H / 2})`}>
          <ellipse cx={W / 2} cy={H / 2} rx={760} ry={560} fill="url(#pil)" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${120 + i * 200} ${560 + i * 40} q 120 80 260 30`} stroke="#c9ccd0" strokeWidth={10} fill="none" opacity={0.6} />)}
          {/* a damp patch */}
          <ellipse cx={W / 2 + 90} cy={H / 2 - 60} rx={240} ry={150} fill="#9fb2c2" opacity={0.35} />
          <g transform={`translate(${W / 2 - 330} ${H / 2 - 190}) rotate(-7)`}>
            <rect width={660} height={360} rx={12} fill="#f4ecd0" stroke="#7a6a48" strokeWidth={5} />
            <rect width={660} height={70} rx={12} fill="#d8c79a" />
            <text x={30} y={48} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#5a3a1a">ПРИГОРОДНЫЙ БИЛЕТ</text>
            <text x={630} y={48} textAnchor="end" fontFamily="monospace" fontWeight={700} fontSize={28} fill="#5a3a1a">№ 004700</text>
            <g opacity={clamp(reveal * 3)}><text x={40} y={150} fontFamily={FONT} fontWeight={900} fontSize={72} fill="#7a1010">ТИХАЯ</text></g>
            <g opacity={clamp(reveal * 3 - 1)}><text x={40} y={240} fontFamily="monospace" fontWeight={700} fontSize={60} fill="#1c1c28">00:47</text></g>
            <g opacity={clamp(reveal * 3 - 2)}><text x={40} y={320} fontFamily={FONT} fontWeight={900} fontSize={52} fill="#1c1c28">СЕГОДНЯ</text></g>
            <rect x={470} y={150} width={150} height={150} rx={75} fill="none" stroke="#7a2a6a" strokeWidth={6} opacity={0.5} />
            <text x={545} y={235} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#7a2a6a" opacity={0.5} transform="rotate(-18 545 225)">ОПЛАЧЕН</text>
            {/* water stains on the ticket */}
            <ellipse cx={520} cy={330} rx={90} ry={30} fill="#9fb2c2" opacity={0.4} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
