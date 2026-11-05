// Kostya's mom, ~45: warm knitted terracotta sweater, brown hair in a bun, dark jeans. `fake` 0..1 turns her into
// the thing on the platform: a light summer dress in November, paler skin, a smile that never moves, eyes too wide,
// tiny pupils, no blinking. Poses: wave, hug (arms open), palm (right palm pressed flat on the train window).
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';
import {mixC} from './Kostya';

const INK = '#14121c', OW = 7;
const C = {
  skin: '#eec3a5', skinShade: '#d09c80', skinDark: '#ae785e', blush: '#e5907e', lip: '#b8565a',
  hair: '#6a4430', hairLight: '#8c5e42', hairDark: '#43291c',
  sweater: '#b5523b', sweaterShade: '#8f3e2c', sweaterLight: '#cf6b52',
  jeans: '#2f3b52', shoe: '#3a2a22',
  dress: '#efe2a8', dressShade: '#d4c488', flower: '#d77a8c',
  eyeWhite: '#f4f1ec', iris: '#5d6d3a', irisDark: '#38421f', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
};

export type MomState = {
  t: number; blink: number; lookX: number; lookY: number; mouth: number; smile: number; worry: number; breathe: number;
  wave?: number; hug?: number; palm?: number; fake?: number; tears?: number;
};
export const MOM_REST: MomState = {t: 0, blink: 1, lookX: 0, lookY: 0, mouth: 0, smile: 0, worry: 0, breathe: 0};

type P = {x: number; y: number};
const lp = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
const HEAD = 'M 0 -1530 C 120 -1530 200 -1452 202 -1338 C 204 -1240 168 -1158 94 -1112 C 56 -1092 -56 -1092 -94 -1112 C -168 -1158 -204 -1240 -202 -1338 C -200 -1452 -120 -1530 0 -1530 Z';

export const Mom: React.FC<{s: MomState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'mom', view = 'front'}) => {
  const fk = clamp(s.fake ?? 0), wv = clamp(s.wave ?? 0), hg = clamp(s.hug ?? 0), pm = clamp(s.palm ?? 0);
  const L = {...C};
  if (fk > 0) { L.skin = mixC(C.skin, '#e9d8cc', fk); L.skinShade = mixC(C.skinShade, '#c9b6aa', fk); L.blush = mixC(C.blush, '#e9d8cc', fk); }
  const b = s.breathe * 5 * (1 - fk); // the fake one doesn't breathe
  const hy = -1310 + b * 0.6;
  const blink = fk > 0.5 ? 1 : s.blink;
  const sm = fk > 0.5 ? 1 : clamp(s.smile);
  const sway = Math.sin(s.t * 9) * 30;

  // arms: shoulders, elbows, hands
  const arm = (side: number) => {
    const sh = {x: side * 160, y: -1040 + b};
    let el: P = {x: side * 210, y: -820}, hd: P = {x: side * 200, y: -600};
    if (side < 0) { el = lp(el, {x: -300, y: -1000}, wv); hd = lp(hd, {x: -290 + sway * wv, y: -1300}, wv); }
    el = lp(el, {x: side * 300, y: -930}, hg); hd = lp(hd, {x: side * 370, y: -1020}, hg);
    if (side > 0) { el = lp(el, {x: 330, y: -940}, pm); hd = lp(hd, {x: 330, y: -1190}, pm); }
    return {sh, el, hd};
  };
  const aL = arm(-1), aR = arm(1);
  const sleeve = fk > 0.5 ? L.skin : L.sweater;
  const armPath = (a: ReturnType<typeof arm>) => `M ${a.sh.x} ${a.sh.y} Q ${(a.sh.x + a.el.x) / 2} ${(a.sh.y + a.el.y) / 2} ${a.el.x} ${a.el.y} Q ${(a.el.x + a.hd.x) / 2} ${(a.el.y + a.hd.y) / 2} ${a.hd.x} ${a.hd.y}`;
  const limb = (a: ReturnType<typeof arm>) => (
    <>
      <path d={armPath(a)} stroke={INK} strokeWidth={(fk > 0.5 ? 50 : 76) + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={armPath(a)} stroke={sleeve} strokeWidth={fk > 0.5 ? 50 : 76} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {fk > 0.5 && <path d={`M ${a.sh.x} ${a.sh.y} L ${lerp(a.sh.x, a.el.x, 0.35)} ${lerp(a.sh.y, a.el.y, 0.35)}`} stroke={L.dress} strokeWidth={80} strokeLinecap="round" />}
    </>
  );
  const hand = (a: ReturnType<typeof arm>, side: number) => {
    const flat = (side > 0 && pm > 0.5) || (side < 0 && wv > 0.5);
    return (
      <g transform={`translate(${a.hd.x} ${a.hd.y})`}>
        {flat ? (
          // open palm facing us (wave / pressed on the glass)
          <g>
            <ellipse cx={0} cy={0} rx={44} ry={50} fill={L.skin} stroke={INK} strokeWidth={OW} />
            {[-27, -9, 9, 27].map((fx, i) => <rect key={i} x={fx - 9} y={-104 + Math.abs(fx) * 0.6} width={18} height={66} rx={9} fill={L.skin} stroke={INK} strokeWidth={OW * 0.8} />)}
            <rect x={-62} y={-30} width={18} height={50} rx={9} transform="rotate(-35 -53 -5)" fill={L.skin} stroke={INK} strokeWidth={OW * 0.8} />
            {side > 0 && pm > 0.5 && <ellipse cx={0} cy={-20} rx={70} ry={90} fill="#ffffff" opacity={0.12} />}
          </g>
        ) : (
          <g>
            <ellipse cx={0} cy={6} rx={32} ry={38} fill={L.skin} stroke={INK} strokeWidth={OW} />
            {[-18, -6, 6, 18].map((fx, i) => <rect key={i} x={fx - 7} y={24} width={14} height={36} rx={7} fill={L.skin} stroke={INK} strokeWidth={OW * 0.8} />)}
          </g>
        )}
        {fk < 0.5 && <ellipse cx={0} cy={-40} rx={42} ry={18} fill={L.sweaterShade} stroke={INK} strokeWidth={OW * 0.8} />}
      </g>
    );
  };

  const eye = (side: number) => {
    const cx = side * 80, cy = hy + 10;
    const rx = 56, ry = 64 * (1 + fk * 0.12);
    const irisR = 33, pupR = fk > 0.5 ? 7 : 16;
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const lidY = cy - ry + (1 - clamp(blink)) * ry * 2 + (fk > 0.5 ? -6 : 8);
    const clip = `${id}-eye${side}`;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={L.eyeWhite} />
        <g clipPath={`url(#${clip})`}>
          <circle cx={ix} cy={iy} r={irisR} fill={L.iris} />
          <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={6} />
          <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
          {fk < 0.5 && <circle cx={ix - 11} cy={iy - 13} r={9} fill="#fff" />}
          {(s.tears ?? 0) > 0 && <ellipse cx={cx} cy={cy + ry - 8} rx={rx * 0.9} ry={13} fill="#bfe3ff" opacity={0.75 * clamp(s.tears ?? 0)} />}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          {sm > 0.2 && fk < 0.5 && <ellipse cx={cx} cy={cy + ry + 8} rx={rx + 6} ry={ry * 0.45 * sm} fill={L.skin} />}
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={INK} strokeWidth={8} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW} />
        {/* lashes */}
        <path d={`M ${cx + side * (rx - 6)} ${cy - ry * 0.6} l ${side * 22} -16 M ${cx + side * (rx - 18)} ${cy - ry * 0.8} l ${side * 16} -20`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  };
  const brow = (side: number) => {
    const w = fk > 0.5 ? 0 : s.worry;
    const ix = side * 34, ox = side * 128, iy = hy - 88 - 30 * w, oy = hy - 92 + 12 * w;
    return <path key={`b${side}`} d={`M ${ix} ${iy} Q ${(ix + ox) / 2} ${Math.min(iy, oy) - 14} ${ox} ${oy}`} stroke={L.hairDark} strokeWidth={13} strokeLinecap="round" fill="none" />;
  };
  const my = hy + 118, mo = clamp(s.mouth);

  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          <path d="M -120 -560 L -112 -60 L -22 -60 L -16 -560 Z M 120 -560 L 112 -60 L 22 -60 L 16 -560 Z" fill={L.jeans} stroke={INK} strokeWidth={OW} />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 18} -6 L ${sd * 18} -62 L ${sd * 140} -62 L ${sd * 146} -6 Z`} fill={L.shoe} stroke={INK} strokeWidth={OW} />)}
          {limb(aL)}{limb(aR)}
          <path d="M -160 -1060 C -200 -1040 -214 -980 -210 -900 L -200 -540 C -130 -520 130 -520 200 -540 L 210 -900 C 214 -980 200 -1040 160 -1060 C 90 -1080 -90 -1080 -160 -1060 Z" fill={L.sweater} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-150, -100, -50, 0, 50, 100, 150].map((x) => <path key={x} d={`M ${x} -1050 L ${x} -545`} stroke={L.sweaterShade} strokeWidth={6} opacity={0.5} />)}
          <rect x={-34} y={hy + 140} width={68} height={80} fill={L.skinShade} stroke={INK} strokeWidth={OW} />
          <path d={HEAD} fill={L.hair} stroke={INK} strokeWidth={OW} />
          <circle cx={0} cy={hy - 250} r={92} fill={L.hair} stroke={INK} strokeWidth={OW} />
          <path d={`M -60 ${hy - 270} q 60 -50 120 0`} stroke={L.hairLight} strokeWidth={10} fill="none" />
        </g>
      </g>
    );
  }

  return (
    <g>
      <defs>
        <LightFilter id={id} light={light} />
        <radialGradient id={`${id}-faceShade`} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1030" stopOpacity={0.35} />
        </radialGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>
        {/* back hair (hangs to the shoulders around the bun) */}
        <path d={`M -214 ${hy - 40} C -250 ${hy - 280} -120 ${hy - 360} 0 ${hy - 362} C 120 ${hy - 360} 250 ${hy - 280} 214 ${hy - 40} L 190 ${hy + 60} L -190 ${hy + 60} Z`} fill={L.hairDark} stroke={INK} strokeWidth={OW} />
        {fk < 0.5 ? (
          <>
            <path d="M -120 -560 L -112 -60 L -22 -60 L -16 -560 Z M 120 -560 L 112 -60 L 22 -60 L 16 -560 Z" fill={L.jeans} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 18} -6 L ${sd * 18} -60 C ${sd * 60} -84 ${sd * 140} -74 ${sd * 150} -28 L ${sd * 152} -6 Z`} fill={L.shoe} stroke={INK} strokeWidth={OW} />)}
          </>
        ) : (
          <>
            {/* bare legs + light sandals under the summer dress */}
            {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 30} -460 L ${sd * 38} -50 L ${sd * 96} -50 L ${sd * 104} -460 Z`} fill={L.skin} stroke={INK} strokeWidth={OW} />)}
            {[-1, 1].map((sd) => <path key={`s${sd}`} d={`M ${sd * 26} -6 L ${sd * 30} -40 L ${sd * 132} -40 L ${sd * 136} -6 Z`} fill="#e9e1d0" stroke={INK} strokeWidth={OW * 0.8} />)}
          </>
        )}
        {(hg < 0.5) && limb(aL)}
        {(hg < 0.5 && pm < 0.5) && limb(aR)}
        {fk < 0.5 ? (
          <g transform={`translate(0 ${b * 0.5})`}>
            {/* knitted sweater */}
            <path d="M -160 -1060 C -200 -1040 -214 -980 -210 -900 L -200 -540 C -130 -520 130 -520 200 -540 L 210 -900 C 214 -980 200 -1040 160 -1060 C 90 -1080 -90 -1080 -160 -1060 Z" fill={L.sweater} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            {[-150, -100, -50, 0, 50, 100, 150].map((x) => <path key={x} d={`M ${x} -1030 L ${x} -545`} stroke={L.sweaterShade} strokeWidth={6} opacity={0.45} />)}
            <path d="M -200 -600 C -130 -585 130 -585 200 -600" stroke={L.sweaterShade} strokeWidth={22} fill="none" />
            <path d="M -90 -1066 C -60 -1020 60 -1020 90 -1066" stroke={L.sweaterLight} strokeWidth={26} fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            {/* summer dress: thin straps, flared skirt, little flowers */}
            <path d="M -130 -1050 L -150 -760 L -250 -440 C -120 -410 120 -410 250 -440 L 150 -760 L 130 -1050 C 60 -1030 -60 -1030 -130 -1050 Z" fill={L.dress} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
            <path d="M -150 -760 C -60 -740 60 -740 150 -760" stroke={L.dressShade} strokeWidth={12} fill="none" />
            {[[-80, -900], [60, -950], [-30, -820], [100, -620], [-150, -560], [20, -520], [-60, -660], [170, -500]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos(a * Math.PI / 180) * 11} cy={Math.sin(a * Math.PI / 180) * 11} r={8} fill={L.flower} />)}
                <circle r={6} fill="#f6d36a" />
              </g>
            ))}
          </g>
        )}
        <rect x={-34} y={hy + 140} width={68} height={80} fill={L.skinShade} stroke={INK} strokeWidth={OW} />
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 200} cy={hy - 10} rx={30} ry={44} fill={L.skin} stroke={INK} strokeWidth={OW} />)}
        <path d={HEAD} fill={L.skin} stroke={INK} strokeWidth={OW} />
        <path d={HEAD} fill={`url(#${id}-faceShade)`} />
        {fk < 0.5 && [-1, 1].map((sd) => <ellipse key={sd} cx={sd * 116} cy={hy + 84} rx={38} ry={18} fill={L.blush} opacity={0.35} />)}
        {/* a little smile line at the eyes (age) */}
        {[-1, 1].map((sd) => <path key={`w${sd}`} d={`M ${sd * 142} ${hy + 30} l ${sd * 22} 10`} stroke={L.skinDark} strokeWidth={5} strokeLinecap="round" />)}
        {eye(-1)}{eye(1)}
        <path d={`M -8 ${hy + 60} Q 10 ${hy + 84} 22 ${hy + 66}`} stroke={L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        {sm > 0.05 ? (
          fk > 0.5 ? (
            // the frozen smile: too wide, all teeth, never changes
            <g>
              <path d={`M -96 ${my - 16} Q 0 ${my + 60} 96 ${my - 16} Q 0 ${my + 4} -96 ${my - 16} Z`} fill={L.mouth} stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              <path d={`M -86 ${my - 10} Q 0 ${my + 10} 86 ${my - 10} L 78 ${my + 14} Q 0 ${my + 36} -78 ${my + 14} Z`} fill={L.teeth} />
              {[-50, -25, 0, 25, 50].map((x) => <path key={x} d={`M ${x} ${my - 2} L ${x} ${my + 26}`} stroke="#c9c2b6" strokeWidth={3} />)}
            </g>
          ) : (
            <path d={`M ${-40 - 20 * sm} ${my - 8} Q 0 ${my + 30 + 30 * mo} ${40 + 20 * sm} ${my - 8} Q 0 ${my + 6} ${-40 - 20 * sm} ${my - 8} Z`} fill={L.lip} stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />
          )
        ) : (
          <ellipse cx={0} cy={my} rx={18 + 10 * mo} ry={5 + 24 * mo} fill={L.lip} stroke={INK} strokeWidth={OW * 0.8} />
        )}
        {/* hair: centre parting, swept back into a bun; the fake one's bun is too neat */}
        <circle cx={0} cy={hy - 250} r={92} fill={L.hair} stroke={INK} strokeWidth={OW} />
        <path d={`M 0 ${hy - 228} C -120 ${hy - 230} -206 ${hy - 160} -210 ${hy - 20} L -184 ${hy - 40} C -170 ${hy - 140} -110 ${hy - 160} -40 ${hy - 150} C -14 ${hy - 160} 0 ${hy - 180} 0 ${hy - 200} C 0 ${hy - 180} 14 ${hy - 160} 40 ${hy - 150} C 110 ${hy - 160} 170 ${hy - 140} 184 ${hy - 40} L 210 ${hy - 20} C 206 ${hy - 160} 120 ${hy - 230} 0 ${hy - 228} Z`} fill={L.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M -150 ${hy - 150} C -110 ${hy - 200} -50 ${hy - 214} -10 ${hy - 206}`} stroke={L.hairLight} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
        {fk < 0.5 && <path d={`M 196 ${hy - 40} C 214 ${hy + 20} 200 ${hy + 70} 186 ${hy + 90}`} stroke={L.hair} strokeWidth={14} fill="none" strokeLinecap="round" />}
        {brow(-1)}{brow(1)}
        {(hg >= 0.5) && limb(aL)}
        {(hg >= 0.5 || pm >= 0.5) && limb(aR)}
        {hand(aL, -1)}{hand(aR, 1)}
      </g>
    </g>
  );
};
