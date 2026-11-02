// YouTube channel banner «Ночные правила» (2560×1440). Everything that must be read sits in the centre
// safe area 1546×423 (x 507..2053, y 508..931): on phones only that strip is shown, on desktop the full-width strip.
// Left: a flat door with the red-lit peephole (the avatar, «Не отвечай»). Right: lift doors, display «13»,
// and two eyes in the gap («Лишний этаж»). The green «24 ЧАСА» sign is «Ночная смена».
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const SAFE = {x: 507, y: 508, w: 1546, h: 423};

export const Banner: React.FC<{guides?: boolean}> = ({guides = false}) => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#050304'}}>
      <svg width={2560} height={1440}>
        <defs>
          <radialGradient id="bg" cx="0.5" cy="0.5" r="0.62">
            <stop offset="0" stopColor="#3a0908" />
            <stop offset="0.45" stopColor="#170404" />
            <stop offset="1" stopColor="#040203" />
          </radialGradient>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0.6} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="door" x1="0" x2="1">
            <stop offset="0" stopColor="#3a1a14" /><stop offset="0.5" stopColor="#5a2a20" /><stop offset="1" stopColor="#2a120e" />
          </linearGradient>
          <linearGradient id="steel" x1="0" x2="1">
            <stop offset="0" stopColor="#2a2d31" /><stop offset="0.45" stopColor="#4a4f55" /><stop offset="1" stopColor="#222428" />
          </linearGradient>
          <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2c27a" /><stop offset="0.5" stopColor="#8a6a32" /><stop offset="1" stopColor="#5a4320" />
          </linearGradient>
          <radialGradient id="peep" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff4a30" /><stop offset="0.6" stopColor="#b01810" /><stop offset="1" stopColor="#3a0604" />
          </radialGradient>
          <radialGradient id="redHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ff2a1a" stopOpacity={0.55} /><stop offset="1" stopColor="#ff2a1a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="greenHalo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#3cff8a" stopOpacity={0.35} /><stop offset="1" stopColor="#3cff8a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.85} />
          </radialGradient>
          <filter id="glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="10" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="soft"><feGaussianBlur stdDeviation="30" /></filter>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} /><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncA type="linear" slope="0.12" /></feComponentTransfer></filter>
        </defs>
        <rect width={2560} height={1440} fill="url(#bg)" />
        {/* old wallpaper stripes */}
        {Array.from({length: 40}, (_, i) => <rect key={i} x={i * 64} y={0} width={30} height={1440} fill="#000" opacity={0.12} />)}
        <rect width={2560} height={1440} fill="url(#wall)" />
        {/* floor line + wet reflection */}
        <rect x={0} y={1060} width={2560} height={380} fill="#070405" />
        <rect x={0} y={1056} width={2560} height={8} fill="#2a0c0a" />

        {/* ---------- left: the flat door with the glowing peephole ---------- */}
        <g transform="translate(150 300)">
          <rect x={-20} y={-20} width={400} height={800} fill="#120808" />
          <rect x={0} y={0} width={360} height={760} fill="url(#door)" stroke="#0a0505" strokeWidth={6} />
          {Array.from({length: 8}, (_, r) => Array.from({length: 5}, (_, c) => <circle key={`${r}${c}`} cx={40 + c * 70} cy={60 + r * 90} r={5} fill="#a5824e" opacity={0.7} />))}
          <rect x={120} y={150} width={120} height={60} fill="#c8a25a" opacity={0.85} />
          <text x={180} y={196} textAnchor="middle" fontFamily="serif" fontWeight={700} fontSize={46} fill="#3a2a14">48</text>
          <circle cx={300} cy={430} r={14} fill="#b08a4a" />
          {/* the peephole */}
          <circle cx={180} cy={330} r={90} fill="url(#redHalo)" filter="url(#soft)" />
          <circle cx={180} cy={330} r={30} fill="url(#brass)" />
          <circle cx={180} cy={330} r={19} fill="url(#peep)" />
          <circle cx={180} cy={330} r={19} fill="#ff6040" opacity={0.4} filter="url(#glow)" />
          {/* light under the door */}
          <rect x={10} y={752} width={340} height={8} fill="#ff3a20" opacity={0.7} filter="url(#glow)" />
        </g>

        {/* ---------- right: lift doors, display 13, eyes in the gap ---------- */}
        <g transform="translate(2040 360)">
          <rect x={-30} y={-110} width={460} height={830} fill="#101114" />
          <rect x={150} y={-90} width={100} height={56} fill="#080404" stroke="#333" strokeWidth={4} />
          <text x={200} y={-46} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={44} fill="#ff2a1a" filter="url(#glow)">13</text>
          <rect x={0} y={0} width={194} height={700} fill="url(#steel)" />
          <rect x={206} y={0} width={194} height={700} fill="url(#steel)" />
          <rect x={194} y={0} width={12} height={700} fill="#000" />
          {/* eyes in the gap */}
          <circle cx={200} cy={250} r={5} fill="#f2f0ea" filter="url(#glow)" />
          <circle cx={200} cy={274} r={5} fill="#f2f0ea" filter="url(#glow)" />
          <path d="M 120 520 L 160 600 M 300 300 L 330 340" stroke="#000" strokeWidth={3} opacity={0.4} />
          <text x={86} y={480} fontFamily="sans-serif" fontWeight={700} fontSize={26} fill="#a01818" opacity={0.6} transform="rotate(-6 86 480)">НЕ ВЫХОДИ</text>
          <rect x={-20} y={-20} width={20} height={720} fill="#2a2c30" />
          <rect x={400} y={-20} width={20} height={720} fill="#2a2c30" />
        </g>

        {/* ---------- «24 ЧАСА» neon (Ночная смена) ---------- */}
        <g transform="translate(545 560) rotate(-4)">
          <ellipse cx={110} cy={20} rx={190} ry={70} fill="url(#greenHalo)" />
          <rect x={-10} y={-36} width={240} height={74} rx={10} fill="#0b1510" stroke="#1d3a28" strokeWidth={4} />
          <text x={110} y={18} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#8affb8" filter="url(#glow)">24 ЧАС<tspan opacity={0.25}>А</tspan></text>
        </g>

        {/* ---------- title (centre safe area) ---------- */}
        <ellipse cx={1280} cy={720} rx={760} ry={210} fill="#000" opacity={0.45} filter="url(#soft)" />
        <text x={1280} y={752} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={126} letterSpacing={4}
          stroke="#050407" strokeWidth={18} paintOrder="stroke fill">
          <tspan fill="#f4f1ec">НОЧНЫЕ </tspan><tspan fill="#ff2a2a" filter="url(#glow)">ПРАВИЛА</tspan>
        </text>
        <text x={1280} y={836} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} letterSpacing={7} fill="#cfc8c0" opacity={0.9}>
          НОВАЯ ЖУТКАЯ ИСТОРИЯ КАЖДУЮ НОЧЬ
        </text>
        {/* thin red rule + small eye mark between the lines */}
        <path d="M 860 610 L 1160 610 M 1400 610 L 1700 610" stroke="#ff2a2a" strokeWidth={4} opacity={0.6} />
        <g transform="translate(1280 610)">
          <path d="M -70 0 Q 0 -44 70 0 Q 0 44 -70 0 Z" fill="#0a0506" stroke="#ff2a2a" strokeWidth={5} />
          <circle cx={0} cy={0} r={18} fill="#ff2a2a" filter="url(#glow)" />
          <circle cx={0} cy={0} r={7} fill="#050304" />
        </g>

        <rect width={2560} height={1440} fill="url(#vig)" />
        <rect width={2560} height={1440} filter="url(#grain)" />
        {guides && (
          <g fill="none" strokeWidth={4}>
            <rect x={0} y={508} width={2560} height={423} stroke="#3cf" strokeDasharray="20 12" />
            <rect x={SAFE.x} y={SAFE.y} width={SAFE.w} height={SAFE.h} stroke="#ff0" />
            <text x={SAFE.x + 10} y={SAFE.y + 40} fill="#ff0" stroke="none" fontFamily={FONT} fontSize={30}>телефон (видно всегда)</text>
            <text x={10} y={508 + 40} fill="#3cf" stroke="none" fontFamily={FONT} fontSize={30}>компьютер</text>
            <text x={10} y={40} fill="#fff" stroke="none" fontFamily={FONT} fontSize={30}>телевизор — вся картинка</text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
export const BannerGuides: React.FC = () => <Banner guides />;
