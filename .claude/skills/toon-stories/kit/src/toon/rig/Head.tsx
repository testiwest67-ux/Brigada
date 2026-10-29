// 2.5D cartoon head: features live on a cylinder and slide with yaw, so one drawing covers front to 3/4 views.
import React from 'react';
import {INK, OW, Look} from './style';

export type Face = {
  yaw: number;      // -0.7..0.7 (negative = looks to screen-left)
  pitch: number;    // -1..1 (positive = looks down)
  open: number;     // eyelids: 1 open, 0 closed
  wide: number;     // 0..1 surprise: bigger whites, smaller pupils
  lookX: number; lookY: number; // pupils -1..1
  brow: number;     // -1..1 raise
  browTilt: number; // + worried (inner ends up), - angry
  mouthW: number; mouthOpen: number; smile: number; // smile -1..1
};
export const FACE0: Face = {yaw: 0, pitch: 0, open: 1, wide: 0, lookX: 0, lookY: 0, brow: 0, browTilt: 0, mouthW: 1, mouthOpen: 0, smile: 0.15};

const R = 70; // radius features are projected on

export const Head: React.FC<{face: Face; look: Look; id: string}> = ({face: f, look: L, id}) => {
  const yaw = f.yaw;
  const sy = Math.sin(yaw);
  const py = f.pitch * 10;
  const cx = sy * 9;
  const skull = `M 0 -92 C 50 -92 78 -62 78 -12 C 78 38 ${56 + cx} 84 ${cx} 86 C ${-56 + cx} 84 -78 38 -78 -12 C -78 -62 -50 -92 0 -92 Z`;

  // ears: in front of the skull when they turn toward camera, peeking from behind otherwise
  const ears = [-1, 1].map((s) => {
    const a = s * 1.62 + yaw;
    const x = 80 * Math.sin(a), c = Math.cos(a);
    const rx = 10 + 4 * Math.max(0, c);
    const ear = (
      <g key={s}>
        <ellipse cx={x} cy={8 + py * 0.5} rx={rx} ry={18} fill={L.skin.base} stroke={INK} strokeWidth={OW} />
        <path d={`M ${x - s * rx * 0.1} ${0 + py * 0.5} q ${-s * rx * 0.45} 8 0 16`} fill="none" stroke={L.skin.line} strokeWidth={3.5} strokeLinecap="round" />
      </g>
    );
    return {front: c > 0.08 && L.hairStyle !== 'bob', ear};
  });

  const eyeY = 2 + py;
  const eyes = [-1, 1].map((s) => {
    const a = s * 0.42 + yaw;
    const x = R * Math.sin(a), c = Math.cos(a);
    const rx = 15.5 * (0.5 + 0.5 * c) * (1 + f.wide * 0.14);
    const ry = 19.5 * (1 + f.wide * 0.2);
    const pr = 7.6 * (1 - f.wide * 0.32);
    const px = x + f.lookX * rx * 0.5 + sy * rx * 0.12;
    const pyy = eyeY + f.lookY * ry * 0.42;
    const lidH = 2 * ry * (1 - f.open);
    const lidY = eyeY - ry + lidH;
    const cid = `${id}-eye${s}`;
    return (
      <g key={s}>
        <clipPath id={cid}><ellipse cx={x} cy={eyeY} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={x} cy={eyeY} rx={rx} ry={ry} fill={L.eyeWhite} />
        <g clipPath={`url(#${cid})`}>
          <circle cx={px} cy={pyy} r={pr} fill={L.pupil} />
          <circle cx={px - pr * 0.35} cy={pyy - pr * 0.4} r={pr * 0.32} fill="#fff" />
          <rect x={x - rx - 3} y={eyeY - ry - 4} width={rx * 2 + 6} height={lidH + 4} fill={L.skin.base} />
          {f.open < 0.97 && <path d={`M ${x - rx - 2} ${lidY} Q ${x} ${lidY + 3 * (1 - f.open)} ${x + rx + 2} ${lidY}`} stroke={INK} strokeWidth={OW} fill="none" />}
        </g>
        <ellipse cx={x} cy={eyeY} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW - 0.5} />
        {L.lashes && f.open > 0.3 && [0, 1].map((k) => (
          <path key={k} d={`M ${x + s * rx * (0.55 + k * 0.3)} ${eyeY - ry * (0.8 - k * 0.3)} l ${s * 9} ${-7 + k * 3}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        ))}
      </g>
    );
  });

  const brows = [-1, 1].map((s) => {
    const a = s * 0.42 + yaw;
    const x = R * Math.sin(a), c = Math.cos(a);
    const by = eyeY - 19.5 * (1 + f.wide * 0.2) - 12 - f.brow * 9;
    const len = 15 * (0.55 + 0.45 * c);
    const ix = x - s * len, ox = x + s * len;
    const iy = by - f.browTilt * 6, oy = by + f.browTilt * 3;
    return <path key={s} d={`M ${ox} ${oy} Q ${x} ${by - 5} ${ix} ${iy}`} stroke={L.hair} strokeWidth={8} strokeLinecap="round" fill="none" />;
  });

  const nx = 74 * sy, ny = 31 + py;
  const blush = [-1, 1].map((s) => {
    const a = s * 0.5 + yaw;
    return <ellipse key={s} cx={R * Math.sin(a)} cy={eyeY + 27} rx={13 * (0.4 + 0.6 * Math.cos(a))} ry={7} fill={L.skin.blush} opacity={0.33} />;
  });

  // mouth: one shape that morphs between closed line, smile, open and "o"
  const mx = 70 * sy * 0.98, my = 53 + py * 0.8;
  const w = 19 * f.mouthW * (0.75 + 0.25 * Math.cos(yaw));
  const o = f.mouthOpen, sm = f.smile;
  const lx = mx - w, rx = mx + w, ey = my - sm * 3;
  let mouth: React.ReactNode;
  if (o < 0.04) {
    mouth = <path d={`M ${lx} ${ey} Q ${mx} ${my + sm * 10} ${rx} ${ey}`} stroke={INK} strokeWidth={OW - 0.5} strokeLinecap="round" fill="none" />;
  } else {
    const shape = `M ${lx} ${ey} Q ${mx} ${my - o * 9 + sm * 5} ${rx} ${ey} Q ${mx} ${my + o * 28 + sm * 6} ${lx} ${ey} Z`;
    const mid = `${id}-mouth`;
    mouth = (
      <g>
        <clipPath id={mid}><path d={shape} /></clipPath>
        <path d={shape} fill={L.mouth} />
        <ellipse clipPath={`url(#${mid})`} cx={mx} cy={my + o * 20 + sm * 4} rx={w * 0.6} ry={o * 9} fill={L.tongue} />
        <path d={shape} fill="none" stroke={INK} strokeWidth={OW - 0.5} strokeLinejoin="round" />
      </g>
    );
  }

  // hair: cap with a swept fringe; the back of the head shows more hair on the side away from the face
  const h = sy * 22;
  const lt = -14 + Math.max(0, sy) * 34, rt = -14 + Math.max(0, -sy) * 34;
  const hair = `M -80 ${lt} C -88 -70 -54 -108 2 -106 C 58 -106 90 -72 80 ${rt}
    C 74 ${rt - 18} 68 -40 58 -50 Q ${34 + h} -32 ${10 + h} -46 Q ${-14 + h} -60 ${-40 + h * 0.5} -50
    Q -60 -44 -68 -30 C -72 -24 -76 ${lt - 4} -80 ${lt} Z`;
  // cowlick tufts break the helmet silhouette
  const tufts = `M ${-8 + h * 0.3} -102 Q ${2 + h * 0.3} -124 ${22 + h * 0.3} -118 Q ${12 + h * 0.3} -110 ${16 + h * 0.3} -104 Q ${30 + h * 0.3} -116 ${44 + h * 0.3} -106 Q ${34 + h * 0.3} -100 ${34 + h * 0.3} -96 Z`;
  const gid = `${id}-skin`;
  const style = L.hairStyle ?? 'boy';
  // bob: back mass behind the skull down to the jaw, front cap with a fringe; both drift a little with yaw
  const bobBack = `M ${-98 - h * 0.3} 46 C ${-108 - h * 0.3} -40 -82 -116 0 -118 C 82 -116 ${108 - h * 0.3} -40 ${98 - h * 0.3} 46
    Q ${92 - h * 0.3} 66 ${68 - h * 0.3} 60 L ${-68 - h * 0.3} 60 Q ${-92 - h * 0.3} 66 ${-98 - h * 0.3} 46 Z`;
  const bobFront = `M -86 34 C -94 -50 -60 -114 0 -114 C 60 -114 94 -50 86 34 L 74 36 C 74 -6 70 -26 62 -36
    Q ${34 + h} -28 ${12 + h} -40 Q ${-12 + h} -30 ${-36 + h} -38 Q -62 -34 -70 -8 L -74 36 Z`;

  return (
    <g>
      <defs>
        <radialGradient id={gid} cx={0.45 + sy * 0.12} cy={0.32} r={0.75}>
          <stop offset="0" stopColor={L.skin.light} />
          <stop offset="0.55" stopColor={L.skin.base} />
          <stop offset="1" stopColor={L.skin.shade} />
        </radialGradient>
      </defs>
      {L.hairStyle === 'bob' && <path d={bobBack} fill={L.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />}
      {L.hairStyle !== 'bob' && ears.filter((e) => !e.front).map((e) => e.ear)}
      <path d={skull} fill={`url(#${gid})`} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {ears.filter((e) => e.front).map((e) => e.ear)}
      {blush}
      {style === 'boy' && <>
        <path d={tufts} fill={L.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={hair} fill={L.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M ${-34 + h * 0.4} -88 Q ${-4 + h * 0.4} -100 ${26 + h * 0.4} -93`} stroke={L.hairLight} strokeWidth={6} strokeLinecap="round" fill="none" />
      </>}
      {style === 'bob' && <>
        <path d={bobFront} fill={L.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M ${-40 + h * 0.4} -92 Q ${-6 + h * 0.4} -104 ${30 + h * 0.4} -96`} stroke={L.hairLight} strokeWidth={6} strokeLinecap="round" fill="none" />
      </>}
      {style === 'bald' && <>
        {[-1, 1].map((s) => {
          const c = Math.cos(s * 1.4 + yaw);
          return c > -0.2 && <path key={s} d={`M ${80 * Math.sin(s * 1.25 + yaw)} -40 q ${s * 14} 20 ${s * 4} 46 q ${-s * 10} -6 ${-s * 10} -20 Z`} fill={L.hair} stroke={INK} strokeWidth={OW - 1} strokeLinejoin="round" />;
        })}
        <path d={`M ${-30 + h * 0.5} -78 Q ${-4 + h * 0.5} -90 ${22 + h * 0.5} -82`} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={7} strokeLinecap="round" fill="none" />
      </>}
      {brows}
      {eyes}
      <path d={`M ${nx - 7} ${ny} Q ${nx} ${ny + 7} ${nx + 7} ${ny}`} stroke={L.skin.line} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      {mouth}
      {L.mustache && <path d={`M ${nx - 30} ${ny + 18} Q ${nx - 20} ${ny + 2} ${nx} ${ny + 8} Q ${nx + 20} ${ny + 2} ${nx + 30} ${ny + 18} Q ${nx + 14} ${ny + 14} ${nx} ${ny + 18} Q ${nx - 14} ${ny + 14} ${nx - 30} ${ny + 18} Z`}
        fill={L.mustache} stroke={INK} strokeWidth={OW - 1} strokeLinejoin="round" />}
    </g>
  );
};
