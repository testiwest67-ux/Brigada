// Channel avatar (1080×1080): a door peephole — round, so it survives TikTok's circle crop —
// and in it the Thing from «Не отвечай» smiling too wide, in red light. No text: avatars are seen tiny.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Thing} from '../horror/chars';

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{background: '#050304'}}>
    <svg width={1080} height={1080}>
      <defs>
        <radialGradient id="glow" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#5a0c0a" />
          <stop offset="0.6" stopColor="#1c0505" />
          <stop offset="1" stopColor="#060203" />
        </radialGradient>
        <radialGradient id="lens" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.85} />
        </radialGradient>
        <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2c27a" />
          <stop offset="0.45" stopColor="#8a6a32" />
          <stop offset="0.7" stopColor="#c9a45c" />
          <stop offset="1" stopColor="#5a4320" />
        </linearGradient>
        <clipPath id="hole"><circle cx={540} cy={540} r={430} /></clipPath>
      </defs>
      {/* brass peephole ring */}
      <circle cx={540} cy={540} r={505} fill="url(#brass)" />
      <circle cx={540} cy={540} r={470} fill="#2a1d0e" />
      <circle cx={540} cy={540} r={448} fill="none" stroke="#e8cf92" strokeWidth={6} opacity={0.5} />
      <g clipPath="url(#hole)">
        <circle cx={540} cy={540} r={430} fill="url(#glow)" />
        {/* the Thing, its head (y = −2290 in its own units) in the middle of the lens */}
        <g transform={`translate(455 ${545 + 2290 * 1.8}) scale(1.8)`}>
          <Thing s={{t: 0, mouth: 0.25, smile: 1, tilt: 10, sway: 0, eyes: 1, breathe: 0}} light={{bright: 0.75, warmRim: 1, coldRim: 0.2, cold: 0}} id="av" />
        </g>
        {/* lens darkening at the edge + a glint */}
        <circle cx={540} cy={540} r={430} fill="url(#lens)" />
        <ellipse cx={400} cy={330} rx={120} ry={60} fill="#fff" opacity={0.07} transform="rotate(-30 400 330)" />
      </g>
    </svg>
  </AbsoluteFill>
);
