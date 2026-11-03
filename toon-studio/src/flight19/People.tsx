// «Неразгаданное #1: Рейс 19» — the two puppets.
// Taylor: Lt. Charles Taylor, US Navy pilot, 1945 — leather flight helmet with ear cups, goggles up on the forehead,
// brown leather jacket with a fur collar, the yellow «Mae West» life vest, olive flight trousers. Holds a hand mic.
// Radist: «ты» — a young Navy radioman at the base: big headphones, light-blue chambray work shirt with rolled sleeves,
// white tee at the neck, blue dungarees.
// Same puppet family as Dima/Petrovich: big head, huge eyes, thick ink outline.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

const INK = '#14121c', OW = 7;
type P = {x: number; y: number};
const lp = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
const armD = (a: P, e: P, h: P) => `M ${a.x} ${a.y} Q ${(a.x + e.x) / 2} ${(a.y + e.y) / 2} ${e.x} ${e.y} Q ${(e.x + h.x) / 2} ${(e.y + h.y) / 2} ${h.x} ${h.y}`;
const Sleeve: React.FC<{d: string; c: string; w: number}> = ({d, c, w}) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

export type FaceState = {
  t: number;
  blink: number;   // 1 open .. 0 closed
  lookX: number;   // -1..1
  lookY: number;   // -1 up .. 1 down
  mouth: number;   // 0..1 open
  fear: number;    // 0..1 wide eyes, brows up
  worry: number;   // 0..1 inner brows up, mouth corners down
  anger?: number;  // 0..1 inner brows down (shouting)
  smile?: number;  // 0..1
  sweat?: number;  // 0..1 a drop on the temple
  breathe: number;
};

// a big cartoon eye with an eyelid in the skin colour
const Eye: React.FC<{id: string; cx: number; cy: number; r: number; s: FaceState; iris: string; lid: string; sd: number}> = ({id, cx, cy, r, s, iris, lid, sd}) => {
  const fr = clamp(s.fear), open = clamp(s.blink);
  const rx = r * (1 + fr * 0.08), ry = r * (1.12 + fr * 0.12);
  const lidY = cy - ry + (1 - open) * ry * 2;
  const px = cx + s.lookX * r * 0.38, py = cy + s.lookY * r * 0.32;
  const ir = r * lerp(0.6, 0.42, fr);
  if (open < 0.3) {
    const sad = clamp(s.worry);
    return <path d={`M ${cx - rx} ${cy + 4 - sad * 6} Q ${cx} ${cy + 22 - sad * 4} ${cx + rx} ${cy + 4 + sad * 2}`} stroke={INK} strokeWidth={OW * 1.2} fill="none" strokeLinecap="round" />;
  }
  return (
    <g>
      <clipPath id={`${id}-e${sd}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#f4f1ec" />
      <g clipPath={`url(#${id}-e${sd})`}>
        <circle cx={px} cy={py} r={ir} fill={iris} />
        <circle cx={px} cy={py} r={ir * 0.52} fill="#0d0f19" />
        <circle cx={px - ir * 0.35} cy={py - ir * 0.38} r={ir * 0.24} fill="#fff" />
        <circle cx={px + ir * 0.3} cy={py + ir * 0.3} r={ir * 0.1} fill="#fff" opacity={0.8} />
        <rect x={cx - rx - 4} y={cy - ry - 8} width={rx * 2 + 8} height={Math.max(0, lidY - (cy - ry - 8))} fill={lid} />
        {open < 0.97 && <path d={`M ${cx - rx} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx} ${lidY}`} stroke={INK} strokeWidth={OW * 0.8} fill="none" />}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW * 0.9} />
    </g>
  );
};

const Brow: React.FC<{cx: number; cy: number; sd: number; s: FaceState; c: string; w?: number}> = ({cx, cy, sd, s, c, w = 22}) => {
  const up = clamp(s.fear) * 28 + clamp(s.worry) * 10, inner = clamp(s.worry) * 26 - clamp(s.anger ?? 0) * 30 + clamp(s.fear) * 10;
  // inner end is toward the nose (x toward 0)
  const xi = cx - sd * 46, xo = cx + sd * 50;
  return <path d={`M ${xi} ${cy - up - inner} Q ${cx} ${cy - up - 14} ${xo} ${cy - up + 6}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
};

const Mouth: React.FC<{x: number; y: number; s: FaceState; w?: number}> = ({x, y, s, w = 44}) => {
  const mo = clamp(s.mouth), sad = clamp(s.worry), sm = clamp(s.smile ?? 0), fr = clamp(s.fear);
  if (mo < 0.12) {
    const cy = y + sad * 10 - sm * 10;
    return <path d={`M ${x - w} ${cy} Q ${x} ${y + 14 * sm - 12 * sad} ${x + w} ${cy}`} stroke={INK} strokeWidth={OW} fill="none" strokeLinecap="round" />;
  }
  const ww = w * lerp(0.9, 0.7, fr), hh = 18 + mo * 56;
  return (
    <g>
      <path d={`M ${x - ww} ${y + sad * 8} Q ${x} ${y - 8} ${x + ww} ${y + sad * 8} Q ${x + ww * 0.8} ${y + hh} ${x} ${y + hh} Q ${x - ww * 0.8} ${y + hh} ${x - ww} ${y + sad * 8} Z`} fill="#3b141a" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${x - ww * 0.75} ${y + 4} Q ${x} ${y - 2} ${x + ww * 0.75} ${y + 4} L ${x + ww * 0.65} ${y + 14} Q ${x} ${y + 10} ${x - ww * 0.65} ${y + 14} Z`} fill="#f3eee6" />
      {mo > 0.4 && <ellipse cx={x} cy={y + hh - 14} rx={ww * 0.45} ry={10} fill="#c0505a" />}
    </g>
  );
};

const Drop: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => k <= 0.05 ? null : (
  <path d={`M ${x} ${y} C ${x - 14} ${y + 26} ${x - 14} ${y + 44} ${x} ${y + 46} C ${x + 14} ${y + 44} ${x + 14} ${y + 26} ${x} ${y} Z`} fill="#bfe3f5" stroke={INK} strokeWidth={4} opacity={k} />
);

// ===================== Lt. Charles Taylor =====================
export const TAYLOR_LOOK = {
  skin: '#eec4a4', skinShade: '#d39d80', skinDark: '#b07a60', blush: '#e48c7a',
  hair: '#5a3a22', helmet: '#8a5a36', helmetLight: '#a8754c', helmetDark: '#5e3b22', earcup: '#2a2622',
  strap: '#4a3020', goggleFrame: '#6e6a62', lens: '#9fc6d6',
  jacket: '#6b3f24', jacketLight: '#86532f', jacketDark: '#4a2a16', fur: '#d8c4a0', furShade: '#b39e7a',
  vest: '#e8b52c', vestShade: '#c48f18', vestLight: '#f6d468', webbing: '#c8b890',
  pants: '#6a6b48', pantsShade: '#53543a', boot: '#3a2618', iris: '#5a7fa8', mic: '#1c1c20',
};
export type TaylorState = FaceState & {
  talk: number;     // 0..1 right hand holds the mic at the mouth
  goggles: number;  // 0 up on the forehead .. 1 over the eyes
  point?: number;   // 0..1 left hand points (at the compass / map)
};
export const TAYLOR_REST: TaylorState = {t: 0, blink: 1, lookX: 0, lookY: 0, mouth: 0, fear: 0, worry: 0, breathe: 0, talk: 0, goggles: 0};

export const Taylor: React.FC<{s: TaylorState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'taylor', view = 'front'}) => {
  const C = TAYLOR_LOOK;
  const b = s.breathe * 5, hy = -1560 + b * 0.6, tk = clamp(s.talk), pt = clamp(s.point ?? 0), gg = clamp(s.goggles);
  const shL = {x: -225, y: -1290 + b}, shR = {x: 225, y: -1290 + b};
  // screen-right hand: down, or up at the mouth with the mic
  const handR = lp({x: 262, y: -770}, {x: 96, y: hy + 150}, tk), elR = lp({x: 300, y: -1030}, {x: 330, y: -1080}, tk);
  // screen-left hand: down, or pointing forward-down
  const handL = lp({x: -262, y: -770}, {x: -400, y: -1060}, pt), elL = lp({x: -300, y: -1030}, {x: -360, y: -1180}, pt);
  const legs = (
    <>
      <path d="M -150 -800 L -142 -120 L -24 -120 L -14 -800 Z M 150 -800 L 142 -120 L 24 -120 L 14 -800 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[-1, 1].map((sd) => <rect key={`k${sd}`} x={sd > 0 ? 40 : -135} y={-560} width={95} height={110} rx={10} fill={C.pantsShade} stroke={INK} strokeWidth={OW * 0.6} />)}
    </>
  );
  const goggles = (y: number, over: number) => (
    <g>
      <path d={`M -170 ${y} Q 0 ${y - 20 + over * 10} 170 ${y}`} stroke={C.strap} strokeWidth={22} fill="none" />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 66} cy={y - 6} rx={58} ry={46} fill={C.lens} fillOpacity={0.55 + over * 0.2} stroke={C.goggleFrame} strokeWidth={14} />
          <ellipse cx={sd * 66} cy={y - 6} rx={58} ry={46} fill="none" stroke={INK} strokeWidth={4} />
          <path d={`M ${sd * 66 - 30} ${y - 24} l 18 -10`} stroke="#fff" strokeWidth={8} opacity={0.6} strokeLinecap="round" />
        </g>
      ))}
      <rect x={-14} y={y - 16} width={28} height={16} rx={6} fill={C.goggleFrame} stroke={INK} strokeWidth={4} />
    </g>
  );
  const helmet = (back: boolean) => (
    <g>
      {/* leather cap: the dome plus the flaps over the ears */}
      <path d={`M -172 ${hy + 20} C -184 ${hy - 150} -110 ${hy - 214} 0 ${hy - 216} C 110 ${hy - 214} 184 ${hy - 150} 172 ${hy + 20} L 168 ${hy + 120} C 150 ${hy + 150} 116 ${hy + 150} 104 ${hy + 120} L ${back ? 104 : 120} ${hy - 40} C 80 ${hy - 120} -80 ${hy - 120} ${back ? -104 : -120} ${hy - 40} L -104 ${hy + 120} C -116 ${hy + 150} -150 ${hy + 150} -168 ${hy + 120} Z`}
        fill={C.helmet} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M 0 ${hy - 214} L 0 ${hy - 100}`} stroke={C.helmetDark} strokeWidth={8} />
      <path d={`M -120 ${hy - 150} Q -60 ${hy - 196} 0 ${hy - 200}`} stroke={C.helmetLight} strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.8} />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 150} cy={hy + 30} rx={44} ry={56} fill={C.earcup} stroke={INK} strokeWidth={OW} />
          <ellipse cx={sd * 150} cy={hy + 30} rx={22} ry={28} fill={C.helmetDark} />
        </g>
      ))}
      {/* chin strap */}
      {!back && <path d={`M -140 ${hy + 128} Q 0 ${hy + 250} 140 ${hy + 128}`} stroke={C.strap} strokeWidth={12} fill="none" />}
    </g>
  );
  const vest = (
    <g>
      {/* the yellow inflatable life vest: collar ring + two chest bladders + webbing */}
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * 30} -1330 C ${sd * 150} -1330 ${sd * 230} -1270 ${sd * 236} -1140 L ${sd * 230} -960 C ${sd * 200} -900 ${sd * 90} -900 ${sd * 40} -950 L ${sd * 30} -1330 Z`} fill={C.vest} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      ))}
      {[-1, 1].map((sd) => <path key={`h${sd}`} d={`M ${sd * 80} -1290 C ${sd * 160} -1280 ${sd * 196} -1200 ${sd * 190} -1100`} stroke={C.vestLight} strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.8} />)}
      {[-1, 1].map((sd) => <path key={`s${sd}`} d={`M ${sd * 60} -1030 L ${sd * 200} -1020`} stroke={C.vestShade} strokeWidth={8} />)}
      <path d="M -236 -900 L 236 -900" stroke={C.webbing} strokeWidth={30} />
      <path d="M -236 -900 L 236 -900" stroke={INK} strokeWidth={4} strokeDasharray="2 40" />
      <rect x={-28} y={-922} width={56} height={44} rx={6} fill="#9a9a92" stroke={INK} strokeWidth={5} />
    </g>
  );
  const torso = (
    <g transform={`translate(0 ${b * 0.5})`}>
      <path d="M -225 -1305 C -272 -1280 -282 -1200 -278 -1110 L -270 -760 C -190 -730 190 -730 270 -760 L 278 -1110 C 282 -1200 272 -1280 225 -1305 C 140 -1340 -140 -1340 -225 -1305 Z" fill={C.jacket} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M -270 -800 L 270 -800 L 268 -740 C 190 -716 -190 -716 -268 -740 Z" fill={C.jacketDark} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 250} -1250 L ${sd * 254} -820`} stroke={C.jacketLight} strokeWidth={14} opacity={0.6} />)}
    </g>
  );
  const collar = (
    <path d="M -175 -1320 C -120 -1260 120 -1260 175 -1320 L 140 -1220 C 60 -1190 -60 -1190 -140 -1220 Z" fill={C.fur} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
  );
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          {legs}
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 14} -10 L ${sd * 14} -150 L ${sd * 156} -150 L ${sd * 166} -10 Z`} fill={C.boot} stroke={INK} strokeWidth={OW} />)}
          <Sleeve d={armD(shL, {x: -300, y: -1030}, {x: -262, y: -770})} c={C.jacket} w={96} />
          <Sleeve d={armD(shR, {x: 300, y: -1030}, {x: 262, y: -770})} c={C.jacket} w={96} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 262} cy={-760} rx={42} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
          {torso}
          {/* vest straps across the back */}
          <path d="M -236 -900 L 236 -900" stroke={C.webbing} strokeWidth={30} />
          <path d="M -150 -1300 L 120 -910 M 150 -1300 L -120 -910" stroke={C.vest} strokeWidth={34} />
          <path d="M -150 -1300 L 120 -910 M 150 -1300 L -120 -910" stroke={INK} strokeWidth={4} strokeDasharray="30 30" />
          <path d="M -180 -1330 C -120 -1300 120 -1300 180 -1330 L 180 -1260 C 100 -1240 -100 -1240 -180 -1260 Z" fill={C.vest} stroke={INK} strokeWidth={OW} />
          <rect x={-60} y={hy + 150} width={120} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
          <ellipse cx={0} cy={hy + 10} rx={160} ry={178} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
          <path d={`M -150 ${hy - 40} C -160 ${hy - 200} 160 ${hy - 200} 150 ${hy - 40} L 140 ${hy + 110} C 60 ${hy + 150} -60 ${hy + 150} -140 ${hy + 110} Z`} fill={C.helmet} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M -120 ${hy + 60} C -60 ${hy + 96} 60 ${hy + 96} 120 ${hy + 60}`} stroke={C.helmetDark} strokeWidth={8} fill="none" />
          <path d={`M -100 ${hy + 120} C -40 ${hy + 150} 40 ${hy + 150} 100 ${hy + 120} L 90 ${hy + 160} C 30 ${hy + 176} -30 ${hy + 176} -90 ${hy + 160} Z`} fill={C.hair} stroke={INK} strokeWidth={OW * 0.6} />
          {helmet(true)}
          {goggles(hy - 110, 0)}
        </g>
      </g>
    );
  }
  const ey = hy + 4 + gg * 0;
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {legs}
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 10} -12 L ${sd * 10} -150 L ${sd * 140} -150 C ${sd * 196} -130 ${sd * 214} -60 ${sd * 206} -12 Z`} fill={C.boot} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {pt < 0.5 && <Sleeve d={armD(shL, elL, handL)} c={C.jacket} w={96} />}
        {tk < 0.5 && <Sleeve d={armD(shR, elR, handR)} c={C.jacket} w={96} />}
        {torso}
        <path d="M 0 -1300 L 0 -760" stroke={C.jacketDark} strokeWidth={8} />
        {vest}
        {collar}
        <rect x={-60} y={hy + 150} width={120} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
        {/* face */}
        <ellipse cx={0} cy={hy + 10} rx={160} ry={178} fill={C.skin} stroke={INK} strokeWidth={OW} />
        <path d={`M -150 ${hy + 70} C -130 ${hy + 160} -70 ${hy + 196} 0 ${hy + 196} C 70 ${hy + 196} 130 ${hy + 160} 150 ${hy + 70}`} stroke={C.skinShade} strokeWidth={16} fill="none" opacity={0.45} />
        {/* a tuft of hair under the helmet edge */}
        <path d={`M -100 ${hy - 96} C -60 ${hy - 70} -20 ${hy - 76} 10 ${hy - 96} C 30 ${hy - 70} 70 ${hy - 72} 96 ${hy - 96} L 96 ${hy - 120} L -100 ${hy - 120} Z`} fill={C.hair} stroke={INK} strokeWidth={OW * 0.7} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <ellipse key={`bl${sd}`} cx={sd * 92} cy={hy + 88} rx={30} ry={15} fill={C.blush} opacity={0.35} />)}
        {gg < 0.5 && [-1, 1].map((sd) => <Eye key={sd} id={id} sd={sd} cx={sd * 62} cy={ey} r={46} s={s} iris={C.iris} lid={C.skinShade} />)}
        {gg < 0.5 && [-1, 1].map((sd) => <Brow key={`b${sd}`} cx={sd * 62} cy={ey - 76} sd={sd} s={s} c={C.hair} />)}
        <path d={`M -6 ${hy + 40} Q -26 ${hy + 86} 2 ${hy + 92}`} stroke={C.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        <Mouth x={0} y={hy + 128} s={s} w={46} />
        <Drop x={124} y={hy - 30} k={clamp(s.sweat ?? 0)} />
        {helmet(false)}
        {goggles(gg < 0.5 ? hy - 110 : ey, gg)}
        {pt >= 0.5 && <Sleeve d={armD(shL, elL, handL)} c={C.jacket} w={96} />}
        {tk >= 0.5 && <Sleeve d={armD(shR, elR, handR)} c={C.jacket} w={96} />}
        {/* hands */}
        <ellipse cx={handL.x} cy={handL.y} rx={42} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />
        {pt >= 0.5 && <rect x={handL.x - 110} y={handL.y - 16} width={90} height={30} rx={14} fill={C.skin} stroke={INK} strokeWidth={OW * 0.8} />}
        {tk > 0.05 && (
          // the hand mic with its curly cord
          <g opacity={clamp(tk * 2)}>
            <path d={`M ${handR.x + 30} ${handR.y + 40} C ${handR.x + 120} ${handR.y + 200} ${handR.x + 40} ${handR.y + 300} ${handR.x + 140} ${handR.y + 420}`} stroke={C.mic} strokeWidth={10} fill="none" strokeDasharray="14 6" />
            <rect x={handR.x - 52} y={handR.y - 70} width={84} height={120} rx={22} fill={C.mic} stroke={INK} strokeWidth={OW} />
            {[0, 1, 2].map((k) => <path key={k} d={`M ${handR.x - 36} ${handR.y - 46 + k * 18} L ${handR.x + 16} ${handR.y - 46 + k * 18}`} stroke="#4a4a52" strokeWidth={6} />)}
          </g>
        )}
        <ellipse cx={handR.x + (tk > 0.5 ? 20 : 0)} cy={handR.y + (tk > 0.5 ? 30 : 0)} rx={42} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />
      </g>
    </g>
  );
};

// ===================== the radioman («ты») =====================
export const RADIST_LOOK = {
  skin: '#f2cdb0', skinShade: '#d8a688', skinDark: '#b8846a', blush: '#ea9784', freckle: '#c98a62',
  hair: '#2e2420', hairLight: '#4e3e34', shirt: '#8fb0d4', shirtShade: '#6d8fb6', shirtLight: '#acc6e2',
  tee: '#f1eee6', pants: '#34466e', pantsShade: '#273658', shoe: '#18161a',
  phones: '#262428', pad: '#5a3e2c', iris: '#6b5238',
};
export type RadistState = FaceState & {
  listen: number;   // 0..1 both hands press the earcups
  shout: number;    // 0..1 leans in, right hand forward on the mic key
  headsOff?: number;// 0..1 head phones down around the neck (the end)
};
export const RADIST_REST: RadistState = {t: 0, blink: 1, lookX: 0, lookY: 0, mouth: 0, fear: 0, worry: 0, breathe: 0, listen: 0, shout: 0};

export const Radist: React.FC<{s: RadistState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'radist', view = 'front'}) => {
  const C = RADIST_LOOK;
  const b = s.breathe * 5, li = clamp(s.listen), sh = clamp(s.shout), off = clamp(s.headsOff ?? 0);
  const lean = sh * 40;
  const hy = -1600 + b * 0.6 + lean * 0.5;
  const shL = {x: -205, y: -1320 + b}, shR = {x: 205, y: -1320 + b};
  const cupY = lerp(hy + 30, hy + 290, off);
  // hands: down / at the earcups / right hand forward on the key
  const handL = lp({x: -245, y: -800}, {x: -190, y: cupY + 20}, li), elL = lp({x: -280, y: -1060}, {x: -330, y: -1200}, li);
  const handR0 = lp({x: 245, y: -800}, {x: 190, y: cupY + 20}, li);
  const handR = lp(handR0, {x: 120, y: -1000}, sh), elR = lp(lp({x: 280, y: -1060}, {x: 330, y: -1200}, li), {x: 300, y: -1080}, sh);
  const legs = (
    <>
      <path d="M -140 -820 L -150 -70 L -20 -70 L -12 -820 Z M 140 -820 L 150 -70 L 20 -70 L 12 -820 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {[-1, 1].map((sd) => <path key={`f${sd}`} d={`M ${sd * 80} -800 L ${sd * 84} -90`} stroke={C.pantsShade} strokeWidth={6} />)}
    </>
  );
  const phones = (
    <g>
      {off < 0.5 && <path d={`M -170 ${hy - 10} C -180 ${hy - 250} 180 ${hy - 250} 170 ${hy - 10}`} stroke={C.phones} strokeWidth={26} fill="none" strokeLinecap="round" />}
      {off < 0.5 && <path d={`M -170 ${hy - 10} C -180 ${hy - 250} 180 ${hy - 250} 170 ${hy - 10}`} stroke="#5a585e" strokeWidth={6} fill="none" />}
      {off >= 0.5 && <path d={`M -150 ${cupY} C -120 ${cupY + 60} 120 ${cupY + 60} 150 ${cupY}`} stroke={C.phones} strokeWidth={22} fill="none" />}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 168} cy={cupY} rx={50} ry={66} fill={C.phones} stroke={INK} strokeWidth={OW} />
          <ellipse cx={sd * 150} cy={cupY} rx={22} ry={46} fill={C.pad} />
          <ellipse cx={sd * 176} cy={cupY - 20} rx={12} ry={18} fill="#fff" opacity={0.18} />
        </g>
      ))}
      <path d={`M 190 ${cupY + 60} C 230 ${cupY + 200} 160 ${cupY + 320} 230 ${cupY + 460}`} stroke={C.phones} strokeWidth={9} fill="none" />
    </g>
  );
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          {legs}
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 18} -8 L ${sd * 18} -90 L ${sd * 170} -90 L ${sd * 176} -8 Z`} fill={C.shoe} stroke={INK} strokeWidth={OW} />)}
          <Sleeve d={armD(shL, {x: -280, y: -1060}, {x: -245, y: -800})} c={C.skin} w={70} />
          <Sleeve d={armD(shR, {x: 280, y: -1060}, {x: 245, y: -800})} c={C.skin} w={70} />
          <Sleeve d={armD(shL, {x: -262, y: -1180}, {x: -276, y: -1100})} c={C.shirt} w={100} />
          <Sleeve d={armD(shR, {x: 262, y: -1180}, {x: 276, y: -1100})} c={C.shirt} w={100} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 245} cy={-792} rx={40} ry={44} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
          <path d="M -205 -1335 C -252 -1310 -262 -1230 -258 -1140 L -250 -780 C -170 -760 170 -760 250 -780 L 258 -1140 C 262 -1230 252 -1310 205 -1335 C 120 -1370 -120 -1370 -205 -1335 Z" fill={C.shirt} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M -200 -1200 C -100 -1220 100 -1220 200 -1200" stroke={C.shirtShade} strokeWidth={8} fill="none" />
          <rect x={-55} y={hy + 160} width={110} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 158} cy={hy + 20} rx={28} ry={42} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
          <ellipse cx={0} cy={hy} rx={158} ry={180} fill={C.hair} stroke={INK} strokeWidth={OW} />
          <path d={`M -150 ${hy + 60} C -100 ${hy + 150} 100 ${hy + 150} 150 ${hy + 60} L 140 ${hy + 120} C 80 ${hy + 186} -80 ${hy + 186} -140 ${hy + 120} Z`} fill={C.skin} stroke={INK} strokeWidth={OW * 0.8} />
          <path d={`M -60 ${hy - 140} Q 0 ${hy - 170} 60 ${hy - 140}`} stroke={C.hairLight} strokeWidth={10} fill="none" />
          {phones}
        </g>
      </g>
    );
  }
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {legs}
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 14} -10 L ${sd * 14} -90 L ${sd * 150} -90 C ${sd * 200} -80 ${sd * 210} -40 ${sd * 200} -10 Z`} fill={C.shoe} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {/* forearms (rolled sleeves): bare skin, then the rolled cuff, then the sleeve */}
        {li < 0.5 && <Sleeve d={armD(shL, elL, handL)} c={C.skin} w={70} />}
        {li < 0.5 && sh < 0.5 && <Sleeve d={armD(shR, elR, handR)} c={C.skin} w={70} />}
        <g transform={`translate(0 ${b * 0.5 + lean * 0.3})`}>
          <path d="M -205 -1335 C -252 -1310 -262 -1230 -258 -1140 L -250 -780 C -170 -760 170 -760 250 -780 L 258 -1140 C 262 -1230 252 -1310 205 -1335 C 120 -1370 -120 -1370 -205 -1335 Z" fill={C.shirt} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {/* open collar, white tee */}
          <path d="M -90 -1345 L 0 -1200 L 90 -1345 Z" fill={C.tee} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 92} -1348 L ${sd * 160} -1280 L ${sd * 40} -1230 L 0 -1200 Z`} fill={C.shirtLight} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
          <path d="M 0 -1200 L 0 -780" stroke={C.shirtShade} strokeWidth={8} />
          {[-1130, -1010, -890].map((y) => <circle key={y} cx={16} cy={y} r={10} fill="#f4f1ea" stroke={INK} strokeWidth={3} />)}
          {/* two patch pockets */}
          {[-1, 1].map((sd) => (
            <g key={`p${sd}`}>
              <path d={`M ${sd * 60} -1160 L ${sd * 190} -1160 L ${sd * 186} -1020 C ${sd * 150} -1004 ${sd * 96} -1004 ${sd * 64} -1020 Z`} fill={C.shirt} stroke={INK} strokeWidth={OW * 0.7} strokeLinejoin="round" />
              <path d={`M ${sd * 60} -1160 L ${sd * 190} -1160 L ${sd * 186} -1124 L ${sd * 62} -1124 Z`} fill={C.shirtShade} stroke={INK} strokeWidth={OW * 0.6} />
            </g>
          ))}
          {/* a pencil in the left pocket */}
          <path d="M -150 -1200 L -142 -1150" stroke="#e8b52c" strokeWidth={14} strokeLinecap="round" />
          {/* rolled sleeves: short shirt sleeves */}
          {[-1, 1].map((sd) => <Sleeve key={`sl${sd}`} d={armD(sd < 0 ? shL : shR, {x: sd * 262, y: -1180}, {x: sd * 276, y: -1100})} c={C.shirt} w={100} />)}
          {[-1, 1].map((sd) => <ellipse key={`cf${sd}`} cx={sd * 276} cy={-1090} rx={62} ry={30} fill={C.shirtLight} stroke={INK} strokeWidth={OW} />)}
        </g>
        <rect x={-55} y={hy + 160} width={110} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
        {/* head */}
        {[-1, 1].map((sd) => <ellipse key={`ear${sd}`} cx={sd * 158} cy={hy + 20} rx={28} ry={42} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
        <ellipse cx={0} cy={hy + 6} rx={156} ry={178} fill={C.skin} stroke={INK} strokeWidth={OW} />
        {/* neat 40s haircut: side part, a wave in front */}
        <path d={`M -160 ${hy - 10} C -176 ${hy - 160} -100 ${hy - 214} 0 ${hy - 214} C 110 ${hy - 214} 178 ${hy - 160} 160 ${hy - 10} C 150 ${hy - 70} 130 ${hy - 110} 90 ${hy - 120} C 40 ${hy - 90} -40 ${hy - 150} -60 ${hy - 120} C -110 ${hy - 120} -150 ${hy - 70} -160 ${hy - 10} Z`} fill={C.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M -70 ${hy - 180} Q -10 ${hy - 200} 50 ${hy - 170}`} stroke={C.hairLight} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d={`M -60 ${hy - 214} L -66 ${hy - 140}`} stroke={C.hairLight} strokeWidth={6} />
        {[-1, 1].map((sd) => <ellipse key={`bl${sd}`} cx={sd * 92} cy={hy + 84} rx={30} ry={15} fill={C.blush} opacity={0.4} />)}
        {[[-100, 66], [-80, 80], [-112, 86], [96, 70], [114, 84], [82, 86]].map(([x, y], i) => <circle key={`fr${i}`} cx={x} cy={hy + y} r={4.5} fill={C.freckle} opacity={0.7} />)}
        {[-1, 1].map((sd) => <Eye key={sd} id={id} sd={sd} cx={sd * 62} cy={hy} r={50} s={s} iris={C.iris} lid={C.skinShade} />)}
        {[-1, 1].map((sd) => <Brow key={`b${sd}`} cx={sd * 62} cy={hy - 78} sd={sd} s={s} c={C.hair} w={20} />)}
        <path d={`M -4 ${hy + 40} Q -24 ${hy + 82} 4 ${hy + 88}`} stroke={C.skinDark} strokeWidth={7} fill="none" strokeLinecap="round" />
        <Mouth x={0} y={hy + 124} s={s} w={40} />
        <Drop x={-128} y={hy - 40} k={clamp(s.sweat ?? 0)} />
        {phones}
        {li >= 0.5 && <Sleeve d={armD(shL, elL, handL)} c={C.skin} w={70} />}
        {(li >= 0.5 || sh >= 0.5) && <Sleeve d={armD(shR, elR, handR)} c={C.skin} w={70} />}
        <ellipse cx={handL.x} cy={handL.y} rx={40} ry={44} fill={C.skin} stroke={INK} strokeWidth={OW} />
        <ellipse cx={handR.x} cy={handR.y} rx={40} ry={44} fill={C.skin} stroke={INK} strokeWidth={OW} />
        {sh > 0.5 && (
          // the telegraph key / push-to-talk under his palm
          <g transform={`translate(${handR.x} ${handR.y + 46})`}>
            <rect x={-80} y={0} width={160} height={36} rx={8} fill="#3a3a40" stroke={INK} strokeWidth={OW} />
            <circle cx={0} cy={-6} r={16} fill="#c22" stroke={INK} strokeWidth={4} />
          </g>
        )}
      </g>
    </g>
  );
};
