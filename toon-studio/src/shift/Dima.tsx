// Dima, 17: the hero of «Ночная смена». Same family as Tyoma and Alisa (big head, huge eyes, thin neck),
// but a teenager: longer legs, messy ginger hair, freckles, a grey tee under the green shop vest with a «ДИМА» badge,
// jeans, white sneakers. `shade` (0..1) turns him into his own shadow: pitch-black body, white empty eyes, a grin.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';
import {FONT} from '../horror/fonts';

export const DIMA_LOOK = {
  skin: '#f2c9ab', skinShade: '#d9a387', skinDark: '#bb8268', blush: '#ea9784', freckle: '#c9784f',
  hair: '#d0612a', hairLight: '#f08c48', hairDark: '#9a3f18',
  tee: '#8b8f98', teeShade: '#6c7079', vest: '#2f7a4c', vestShade: '#225c39', vestLight: '#3d9460',
  badge: '#f4f1ea', badgeText: '#b0262a',
  pants: '#3a5276', pantsLight: '#4c6892', shoe: '#ece9e3', sole: '#3a3640',
  eyeWhite: '#f4f1ec', iris: '#4f7a3a', irisDark: '#2e4a22', pupil: '#0d0f19', mouth: '#3b141a', teeth: '#f3eee6',
  ink: '#14121c', phone: '#d8d2c2', phoneDark: '#8f8878', paper: '#f1ead8',
};
const SHADE = '#07070b';

export type DimaState = {
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1 left .. 1 right (screen)
  lookY: number;   // -1 up .. 1 down
  fear: number;    // 0 calm .. 1 terrified
  mouth: number;   // 0 closed .. 1 open (speech / gasp / yawn)
  smile: number;   // 0 .. 1 happy smile (Dima) / grin (shadow)
  breathe: number; // -1..1
  hands: number;   // 0 hands down .. 1 palms up at the chest (pressing the glass)
  note?: number;   // 0..1 both hands hold the note at the chest
  phone?: number;  // 0..1 right hand holds the receiver to the ear
  cover?: number;  // 0..1 left hand presses over the mouth
  turn: number;    // -1..1 head turn
  tilt?: number;   // degrees, head tilt (the shadow)
  tremble: number; // px of shiver
  tears?: number;  // 0..1 wet eyes
  shade?: number;  // 0 Dima .. 1 his shadow
  t: number;
};
export const DIMA_REST: DimaState = {blink: 1, lookX: 0, lookY: 0, fear: 0, mouth: 0, smile: 0, breathe: 0, hands: 0, turn: 0, tremble: 0, t: 0};

const OW = 7;
const LEG = 170; // a teenager: the upper body sits this much higher than Alisa's
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
};
const lookFor = (sh: number) => {
  const o: typeof DIMA_LOOK = {...DIMA_LOOK};
  if (sh <= 0) return o;
  for (const k of Object.keys(o) as (keyof typeof DIMA_LOOK)[]) {
    if (k === 'eyeWhite' || k === 'teeth' || k === 'ink') continue;
    // the vest stays a dark green so the shadow still "wears" it
    const target = k.startsWith('vest') ? mixC(DIMA_LOOK[k], SHADE, 0.55) : k === 'badge' ? '#8d8a82' : SHADE;
    o[k] = mixC(DIMA_LOOK[k], target, sh);
  }
  return o;
};

const TORSO = 'M -170 -962 C -214 -950 -228 -895 -224 -815 L -212 -478 C -145 -458 145 -458 212 -478 L 224 -815 C 228 -895 214 -950 170 -962 C 105 -984 -105 -984 -170 -962 Z';
const VEST = (sd: number) => `M ${sd * 168} -962 C ${sd * 214} -950 ${sd * 228} -895 ${sd * 224} -815 L ${sd * 212} -478 C ${sd * 160} -464 ${sd * 100} -458 ${sd * 46} -456 L ${sd * 50} -770 L ${sd * 98} -968 C ${sd * 130} -968 ${sd * 150} -966 ${sd * 168} -962 Z`;
const HEAD = 'M 0 -1460 C 130 -1460 216 -1378 218 -1255 C 220 -1150 180 -1060 100 -1012 C 60 -990 -60 -990 -100 -1012 C -180 -1060 -220 -1150 -218 -1255 C -216 -1378 -130 -1460 0 -1460 Z';
const HAIR_BACK = 'M -236 -1170 C -262 -1390 -140 -1512 0 -1514 C 140 -1512 262 -1390 236 -1170 L 212 -1190 L -212 -1190 Z';
// messy cap: a jagged crown + a fringe swept to the screen left
const HAIR_FRONT = (() => {
  const cy = -1250, pts: string[] = [];
  const R = [244, 300, 262, 318, 270, 326, 276, 334, 280, 322, 272, 312, 262, 298, 244];
  R.forEach((r, i) => {
    const a = Math.PI + (i / (R.length - 1)) * Math.PI;
    const tw = i % 2 ? (i < 7 ? -18 : 14) : 0; // tips lean outwards
    pts.push(`${(Math.cos(a) * r + tw).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`);
  });
  // right side down to the sideburn, then the fringe (tips swept left) back to the left sideburn
  const fr = [[226, -1170], [204, -1182], [198, -1300], [168, -1352], [130, -1296], [96, -1356], [52, -1288], [14, -1360], [-34, -1284], [-70, -1356], [-118, -1294], [-150, -1354], [-196, -1290], [-204, -1182], [-226, -1170]];
  return `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${fr.map((p) => p.join(' ')).join(' L ')} Z`;
})();

type P = {x: number; y: number};
const lp = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});

export const Dima: React.FC<{s: DimaState; light: TemaLight; id?: string; crop?: number; view?: 'front' | 'back'}> = ({s, light, id = 'dima', crop, view = 'front'}) => {
  const sh = clamp(s.shade ?? 0);
  const L = lookFor(sh);
  if (view === 'back') return <DimaBack s={s} light={light} id={id} crop={crop} L={L} />;
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const headY = -1225 + b * 0.6;
  const tx = s.turn * 26, hx = tr * 0.6;
  const note = clamp(s.note ?? 0), ph = clamp(s.phone ?? 0), cov = clamp(s.cover ?? 0);

  const eye = (side: number) => {
    const cx = side * 86 + tx * (side === Math.sign(s.turn || 1) ? 0.8 : 1.15) + hx, cy = headY + 14;
    const rx = 62 * (1 - Math.abs(s.turn) * 0.08 * (side * s.turn > 0 ? 1 : -0.5)), ry = 74 * (1 + 0.06 * s.fear);
    const irisR = 37 * (1 - 0.22 * s.fear), pupR = 18 * (1 - 0.5 * s.fear);
    const ix = cx + s.lookX * (rx - irisR - 6), iy = cy + s.lookY * (ry - irisR - 10);
    const open = clamp(s.blink);
    // happy smile squints the lower lid a little
    const lidY = cy - ry + (1 - open) * ry * 2;
    const clip = `${id}-eye${side}`;
    const blank = sh > 0.5;
    return (
      <g key={side}>
        <clipPath id={clip}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={blank ? '#f2f0ea' : L.eyeWhite} />
        <g clipPath={`url(#${clip})`}>
          {!blank && <>
            <ellipse cx={cx} cy={cy + ry * 0.55} rx={rx} ry={ry * 0.5} fill="#d6d0cc" opacity={0.5} />
            <circle cx={ix} cy={iy} r={irisR} fill={L.iris} />
            <circle cx={ix} cy={iy} r={irisR} fill="none" stroke={L.irisDark} strokeWidth={7} />
            <circle cx={ix} cy={iy} r={pupR} fill={L.pupil} />
            <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={10} fill="#fff" />
            <circle cx={ix + irisR * 0.3} cy={iy + irisR * 0.3} r={4} fill="#fff" opacity={0.8} />
            {(s.tears ?? 0) > 0 && <ellipse cx={cx} cy={cy + ry - 8} rx={rx * 0.9} ry={14} fill="#bfe3ff" opacity={0.75 * clamp(s.tears ?? 0)} />}
          </>}
          <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={L.skinShade} />
          {s.smile > 0.2 && sh < 0.5 && <ellipse cx={cx} cy={cy + ry + 10} rx={rx + 6} ry={ry * 0.5 * clamp(s.smile)} fill={L.skin} />}
          <path d={`M ${cx - rx - 4} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 4} ${lidY}`} stroke={L.ink} strokeWidth={9} fill="none" />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={L.ink} strokeWidth={OW} />
      </g>
    );
  };
  const brow = (side: number) => {
    const f = s.fear;
    const ix = side * 36 + tx + hx, ox = side * 140 + tx + hx;
    const iy = headY - 94 - 34 * f, oy = headY - 98 + 16 * f;
    const mx = lerp((ix + ox) / 2, ix + (ox - ix) * 0.3, f), my = lerp(Math.min(iy, oy) - 12, iy - 6, f);
    const d = `M ${ix} ${iy} Q ${mx} ${my} ${ox} ${oy}`;
    return (
      <g key={`b${side}`}>
        <path d={d} stroke={L.skinShade} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d={d} stroke={L.hairDark} strokeWidth={18} strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // arms (upper-body coords): rest / palms up / holding the note / phone at the ear (right) / hand over the mouth (left)
  const arm = (side: number) => {
    const shp = {x: side * 176, y: -925 + b};
    let hand: P = {x: side * 228, y: -560}, mid: P = {x: side * 222, y: -735};
    const k = clamp(s.hands);
    hand = lp(hand, {x: side * 120 + tx * 0.6, y: -900}, k); mid = lp(mid, {x: side * 250, y: -760}, k);
    hand = lp(hand, {x: side * 92, y: -742}, note); mid = lp(mid, {x: side * 238, y: -700}, note);
    let raise = Math.max(k, note);
    if (side > 0) { hand = lp(hand, {x: 262 + tx * 0.5, y: -1180}, ph); mid = lp(mid, {x: 330, y: -900}, ph); raise = Math.max(raise, ph); }
    if (side < 0) { hand = lp(hand, {x: tx * 0.9 - 6, y: -1080}, cov); mid = lp(mid, {x: -250, y: -860}, cov); raise = Math.max(raise, cov); }
    hand = {x: hand.x + tr, y: hand.y + tr * 0.5};
    mid = {x: mid.x + tr * 0.5, y: mid.y + b};
    const d = `M ${shp.x} ${shp.y} Q ${lerp(shp.x, mid.x, 0.5) + side * 14} ${lerp(shp.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, hand.x, 0.5) + side * 10} ${lerp(mid.y, hand.y, 0.5)} ${hand.x} ${hand.y}`;
    // the short tee sleeve: first ~45% of the upper arm
    const sl = lp(shp, mid, 0.5);
    const sd = `M ${shp.x} ${shp.y} L ${sl.x} ${sl.y}`;
    return {d, sd, end: hand, raise};
  };
  const aL = arm(-1), aR = arm(1);
  const limb = (a: ReturnType<typeof arm>) => (
    <>
      <path d={a.d} stroke={L.ink} strokeWidth={56 + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.d} stroke={L.skin} strokeWidth={56} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={a.sd} stroke={L.ink} strokeWidth={86 + OW * 2} strokeLinecap="round" fill="none" />
      <path d={a.sd} stroke={L.tee} strokeWidth={86} strokeLinecap="round" fill="none" />
    </>
  );
  const handG = (a: ReturnType<typeof arm>, side: number) => {
    const {x, y} = a.end;
    const k = clamp(s.hands);
    const atEar = side > 0 && ph > 0.5, onMouth = side < 0 && cov > 0.5;
    const rot = atEar ? -24 : onMouth ? 90 : lerp(side * 10, side * -12, Math.max(k, note));
    const up = k > 0.5 || atEar || onMouth;
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        {atEar && (
          // old wall-phone receiver: earpiece at the ear, mouthpiece at the chin
          <g transform="rotate(24) translate(-10 0)">
            <path d="M 10 -40 C 40 -40 50 10 60 120 C 64 160 40 170 20 160" stroke={L.ink} strokeWidth={56 + OW * 2} fill="none" strokeLinecap="round" />
            <path d="M 10 -40 C 40 -40 50 10 60 120 C 64 160 40 170 20 160" stroke={L.phone} strokeWidth={56} fill="none" strokeLinecap="round" />
            <ellipse cx={-6} cy={-46} rx={38} ry={30} fill={L.phone} stroke={L.ink} strokeWidth={OW} />
          </g>
        )}
        <ellipse cx={0} cy={6} rx={35} ry={41} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
        {[-21, -7, 7, 21].map((fx, i) => (
          <rect key={i} x={fx - 8} y={up ? -58 + Math.abs(fx) * 0.4 : 26} width={16} height={up ? 46 : 40} rx={8}
            fill={L.skin} stroke={L.ink} strokeWidth={OW * 0.8} />
        ))}
      </g>
    );
  };

  const mo = clamp(s.mouth), sm = clamp(s.smile);
  const mx = tx * 0.9 + hx, my = headY + 130;
  const grinW = lerp(30, 120, sm);

  const body = (
    <>
      {/* long legs + sneakers */}
      <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M -104 ${-470 - LEG} L -96 -80 M 104 ${-470 - LEG} L 96 -80`} stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
      <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={`url(#${id}-down)`} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M ${sd * 22} -12 L ${sd * 22} -58 C ${sd * 60} -88 ${sd * 160} -80 ${sd * 184} -30 L ${sd * 188} -12 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M ${sd * 18} -4 L ${sd * 194} -4 L ${sd * 192} -20 L ${sd * 20} -20 Z`} fill={L.sole} stroke={L.ink} strokeWidth={OW * 0.8} />
        </g>
      ))}
      <g transform={`translate(0 ${-LEG})`}>
        {aL.raise < 0.5 && limb(aL)}
        {aR.raise < 0.5 && limb(aR)}
        {/* tee + vest + badge */}
        <g transform={`translate(0 ${b * 0.5}) scale(${1 + s.breathe * 0.008} 1)`}>
          <path d={TORSO} fill={L.tee} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -60 -972 C -40 -930 40 -930 60 -972" stroke={L.teeShade} strokeWidth={16} fill="none" />
          {[-1, 1].map((sd) => <path key={sd} d={VEST(sd)} fill={L.vest} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />)}
          {[-1, 1].map((sd) => <path key={`p${sd}`} d={`M ${sd * 90} -600 L ${sd * 180} -600 L ${sd * 178} -520 L ${sd * 92} -520 Z`} fill={L.vestShade} stroke={L.ink} strokeWidth={OW * 0.6} />)}
          <path d="M 70 -900 L 82 -620" stroke={L.vestLight} strokeWidth={8} opacity={0.6} />
          <g transform="translate(-170 -880) rotate(-4)">
            <rect x={0} y={0} width={110} height={48} rx={8} fill={L.badge} stroke={L.ink} strokeWidth={4} />
            {sh < 0.5 && <text x={55} y={35} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={29} fill={L.badgeText}>ДИМА</text>}
          </g>
          <path d={TORSO} fill={`url(#${id}-bodyShade)`} />
          <path d={TORSO} fill={`url(#${id}-down)`} opacity={0.6} />
        </g>
        {/* hair, back layer + ears + neck */}
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + (s.tilt ?? 0) + tr * 0.05} 0 -1100)`}>
          <path d={HAIR_BACK} fill={L.hairDark} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        </g>
        <rect x={-38 + hx * 0.5} y={headY + 170} width={76} height={100} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
        <g transform={`translate(${hx} ${b * 0.6}) rotate(${s.turn * 3 + (s.tilt ?? 0) + tr * 0.05} 0 -1100)`}>
          {[-1, 1].map((sd) => (
            <g key={sd}>
              <ellipse cx={sd * 218 + tx * 0.5} cy={-1205} rx={34} ry={48} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
              <path d={`M ${sd * 222 + tx * 0.5} -1230 q ${sd * 10} 20 0 40`} stroke={L.skinDark} strokeWidth={6} fill="none" />
            </g>
          ))}
          <path d={HEAD} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
          <path d={HEAD} fill={`url(#${id}-faceShade)`} />
          {sh < 0.5 && <>
            <ellipse cx={-126 + tx} cy={-1098} rx={42} ry={20} fill={L.blush} opacity={0.35} />
            <ellipse cx={126 + tx} cy={-1098} rx={42} ry={20} fill={L.blush} opacity={0.35} />
            {[[-150, -1118], [-122, -1104], [-100, -1124], [-136, -1088], [-108, -1092], [150, -1118], [122, -1104], [100, -1124], [136, -1088], [108, -1092]].map(([fx, fy], i) => (
              <circle key={i} cx={fx + tx} cy={fy} r={6} fill={L.freckle} opacity={0.75} />
            ))}
            {/* nose */}
            <path d={`M ${tx * 1.1 - 10} ${headY + 66} Q ${tx * 1.1 + 8} ${headY + 90} ${tx * 1.1 + 20} ${headY + 72}`} stroke={L.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
          </>}
          {eye(-1)}{eye(1)}
          {/* mouth: speech ellipse / happy smile / the shadow's grin */}
          {sh > 0.5 ? (
            <g>
              <path d={`M ${mx - grinW} ${my - 40 * sm} Q ${mx} ${my + 70 * sm + 30 * mo} ${mx + grinW} ${my - 40 * sm} Q ${mx} ${my + 6 * sm} ${mx - grinW} ${my - 40 * sm} Z`}
                fill="#000" stroke="#000" strokeWidth={OW * 0.8} strokeLinejoin="round" />
              {sm > 0.4 && <path d={`M ${mx - grinW * 0.9} ${my - 31 * sm} Q ${mx} ${my + 12 * sm} ${mx + grinW * 0.9} ${my - 31 * sm} L ${mx + grinW * 0.8} ${my - 12 * sm} Q ${mx} ${my + 34 * sm} ${mx - grinW * 0.8} ${my - 12 * sm} Z`} fill="#efeae0" />}
            </g>
          ) : sm > 0.05 ? (
            <g>
              <path d={`M ${mx - 60 * sm - 20} ${my - 14} Q ${mx} ${my + 40 + 40 * mo} ${mx + 60 * sm + 20} ${my - 14} Q ${mx} ${my + 4} ${mx - 60 * sm - 20} ${my - 14} Z`} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              <path d={`M ${mx - 50 * sm - 12} ${my - 8} Q ${mx} ${my + 6} ${mx + 50 * sm + 12} ${my - 8} L ${mx + 40 * sm + 8} ${my + 6} Q ${mx} ${my + 16} ${mx - 40 * sm - 8} ${my + 6} Z`} fill={L.teeth} />
            </g>
          ) : (
            <>
              <ellipse cx={mx} cy={my} rx={18 + 12 * mo} ry={4 + 28 * mo} fill={L.mouth} stroke={L.ink} strokeWidth={OW * 0.8} />
              {mo > 0.3 && <rect x={mx - 12 - 6 * mo} y={my - 28 * mo + 2} width={24 + 12 * mo} height={8} rx={4} fill={L.teeth} />}
            </>
          )}
          {/* messy ginger hair, front layer */}
          <path d={HAIR_FRONT} fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
          {sh < 0.5 && <>
            <path d="M -160 -1440 C -90 -1500 40 -1510 140 -1460" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.75} />
            <path d="M -60 -1420 L -30 -1356 M 40 -1430 L 60 -1360 M 120 -1400 L 140 -1340" stroke={L.hairDark} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
          </>}
          {sh < 0.5 && <>{brow(-1)}{brow(1)}</>}
        </g>
        {/* raised arms in front of the chest / face */}
        {aL.raise >= 0.5 && limb(aL)}
        {aR.raise >= 0.5 && limb(aR)}
        {note > 0.3 && (
          // the note: a crumpled sheet held with both hands
          <g transform={`translate(0 ${-760 + b}) rotate(-3)`} opacity={clamp((note - 0.3) / 0.3)}>
            <path d="M -110 -120 L 104 -128 L 112 70 L -104 78 Z" fill={L.paper} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
            {[-80, -45, -10, 25].map((ly) => <path key={ly} d={`M -80 ${ly} L ${50 + (ly % 3) * 10} ${ly - 2}`} stroke="#3b3a55" strokeWidth={6} opacity={0.6} />)}
            <path d="M -90 -122 L -60 -150 L -40 -126 Z" fill="#e8e2c8" opacity={0.7} />
          </g>
        )}
        {handG(aL, -1)}{handG(aR, 1)}
      </g>
    </>
  );

  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <radialGradient id={`${id}-faceShade`} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#1a1030" stopOpacity={0.4} />
        </radialGradient>
        <linearGradient id={`${id}-down`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id={`${id}-bodyShade`} x1="0" x2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.4} />
          <stop offset="0.45" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.22} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>{body}</g>
    </g>
  );
};

// from behind: the hair, ears, the vest back with the shop's «24»
const DimaBack: React.FC<{s: DimaState; light: TemaLight; id: string; crop?: number; L: typeof DIMA_LOOK}> = ({s, light, id, crop, L}) => {
  const b = s.breathe * 6;
  const tr = Math.sin(s.t * 37) * s.tremble + Math.sin(s.t * 23 + 1) * s.tremble * 0.6;
  const k = clamp(s.hands);
  const arm = (side: number) => {
    const shp = {x: side * 176, y: -925 + b};
    const mid = {x: lerp(side * 222, side * 240, k) + tr * 0.5, y: lerp(-735, -770, k) + b};
    const end = {x: lerp(side * 228, side * 150, k) + tr, y: lerp(-560, -900, k)};
    const sl = lp(shp, mid, 0.5);
    return {d: `M ${shp.x} ${shp.y} Q ${lerp(shp.x, mid.x, 0.5) + side * 14} ${lerp(shp.y, mid.y, 0.5)} ${mid.x} ${mid.y} Q ${lerp(mid.x, end.x, 0.5)} ${lerp(mid.y, end.y, 0.5)} ${end.x} ${end.y}`,
      sd: `M ${shp.x} ${shp.y} L ${sl.x} ${sl.y}`, end};
  };
  return (
    <g transform={`translate(${tr * 0.3} 0)`} clipPath={crop !== undefined ? `url(#${id}-crop)` : undefined}>
      {crop !== undefined && <clipPath id={`${id}-crop`}><rect x={-1500} y={-2400} width={3000} height={2400 + crop} /></clipPath>}
      <defs>
        <LightFilter id={id} light={light} />
        <linearGradient id={`${id}-bdown`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0.1} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-light)`}>
        <path d={`M -150 ${-485 - LEG} L -138 -60 L -30 -60 L -18 ${-485 - LEG} Z M 150 ${-485 - LEG} L 138 -60 L 30 -60 L 18 ${-485 - LEG} Z`} fill={L.pants} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 24} -6 L ${sd * 24} -66 L ${sd * 166} -66 L ${sd * 172} -6 Z`} fill={L.shoe} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
        ))}
        <g transform={`translate(0 ${-LEG})`}>
          {[-1, 1].map((sd) => {
            const a = arm(sd);
            return (
              <g key={sd}>
                <path d={a.d} stroke={L.ink} strokeWidth={56 + OW * 2} strokeLinecap="round" fill="none" />
                <path d={a.d} stroke={L.skin} strokeWidth={56} strokeLinecap="round" fill="none" />
                <path d={a.sd} stroke={L.ink} strokeWidth={86 + OW * 2} strokeLinecap="round" fill="none" />
                <path d={a.sd} stroke={L.tee} strokeWidth={86} strokeLinecap="round" fill="none" />
                <ellipse cx={a.end.x} cy={a.end.y + 6} rx={35} ry={41} fill={L.skin} stroke={L.ink} strokeWidth={OW} />
              </g>
            );
          })}
          <g transform={`translate(0 ${b * 0.5})`}>
            <path d={TORSO} fill={L.vest} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d="M -95 -968 C -60 -940 60 -940 95 -968" stroke={L.tee} strokeWidth={20} fill="none" />
            {/* the shop logo on the back */}
            <circle cx={0} cy={-760} r={86} fill="#f2c230" stroke={L.ink} strokeWidth={OW} />
            <text x={0} y={-732} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={84} fill={L.ink}>24</text>
            <path d={TORSO} fill={`url(#${id}-bdown)`} />
          </g>
          <rect x={-38} y={-1060} width={76} height={100} fill={L.skinShade} stroke={L.ink} strokeWidth={OW} />
          <g transform={`translate(0 ${b * 0.6}) rotate(${s.turn * 4 + (s.tilt ?? 0) + tr * 0.05} 0 -1100)`}>
            {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 218} cy={-1205} rx={34} ry={48} fill={L.skin} stroke={L.ink} strokeWidth={OW} />)}
            {/* messy tufts sticking up on the crown */}
            <path d="M -120 -1490 L -150 -1560 L -70 -1506 L -40 -1580 L 10 -1512 L 60 -1572 L 90 -1500 L 150 -1540 L 130 -1470 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            {/* back of the head: jagged nape instead of a smooth "helmet" edge */}
            <path d="M -236 -1170 C -262 -1390 -140 -1514 0 -1516 C 140 -1514 262 -1390 236 -1170 L 214 -1120 L 176 -1150 L 150 -1086 L 110 -1128 L 70 -1070 L 30 -1118 L -10 -1062 L -50 -1116 L -90 -1072 L -124 -1130 L -160 -1090 L -186 -1150 L -214 -1118 Z" fill={L.hair} stroke={L.ink} strokeWidth={OW} strokeLinejoin="round" />
            <path d="M -150 -1420 C -80 -1480 60 -1484 140 -1430" stroke={L.hairLight} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
            <path d="M -80 -1100 L -70 -1160 M 0 -1080 L 0 -1170 M 80 -1100 L 70 -1160" stroke={L.hairDark} strokeWidth={8} strokeLinecap="round" opacity={0.6} />
          </g>
        </g>
      </g>
    </g>
  );
};
