// «Рейс 19» puppets in an adult-animated-sitcom look (user's reference, 03.11): normal adult proportions,
// thin even outline, flat colours with one cel shade, two big white oval eyes that touch, tiny dot pupils,
// a hooked little nose, strong chins. Original characters — Taylor and the radioman («ты»).
// Same states as People.tsx, so the sheets and shots can use either look.
// Units: 1 = 1 mm, origin between the feet, y up is negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';
import type {FaceState, RadistState, TaylorState} from './People';

const INK = '#1a1414', OW = 4.5;
type P = {x: number; y: number};
const lp = (a: P, b: P, k: number): P => ({x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)});
const armD = (a: P, e: P, h: P) => `M ${a.x} ${a.y} Q ${(a.x + e.x) / 2} ${(a.y + e.y) / 2} ${e.x} ${e.y} Q ${(e.x + h.x) / 2} ${(e.y + h.y) / 2} ${h.x} ${h.y}`;
const Limb: React.FC<{d: string; c: string; w: number}> = ({d, c, w}) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);

// a cartoon hand: palm, three fingers and a thumb; `sd` mirrors the thumb, `rot` turns the whole hand
const Hand: React.FC<{x: number; y: number; c: string; sh: string; sd: number; rot?: number; fist?: number}> = ({x, y, c, sh, sd, rot = 0, fist = 0}) => {
  const fl = lerp(30, 12, clamp(fist));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.35)`}>
      {[-20, 0, 20].map((fx, i) => <rect key={i} x={fx - 10} y={8} width={20} height={fl + 18} rx={10} fill={c} stroke={INK} strokeWidth={OW} />)}
      <ellipse cx={sd * 30} cy={-4} rx={12} ry={24} transform={`rotate(${sd * -35} ${sd * 30} -4)`} fill={c} stroke={INK} strokeWidth={OW} />
      <ellipse cx={0} cy={0} rx={34} ry={32} fill={c} stroke={INK} strokeWidth={OW} />
      <path d={`M -20 14 Q 0 22 20 14`} stroke={sh} strokeWidth={5} fill="none" />
    </g>
  );
};

// the two touching oval eyes with dot pupils
const Eyes: React.FC<{id: string; y: number; s: FaceState; lid: string; gap?: number; rx?: number; ry?: number}> = ({id, y, s, lid, gap = 40, rx = 44, ry = 56}) => {
  const fr = clamp(s.fear), open = clamp(s.blink), wo = clamp(s.worry), an = clamp(s.anger ?? 0);
  const RY = ry * (1 + fr * 0.12), RX = rx * (1 + fr * 0.06);
  const pr = lerp(8.5, 6, fr);
  return (
    <g>
      {[-1, 1].map((sd) => {
        const cx = sd * gap;
        // upper lid: closes with blink; worry droops the outer half, anger the inner half
        const lidY = y - RY + (1 - open) * RY * 2;
        const tiltIn = an * 22, tiltOut = wo * 16;
        const xi = cx - sd * RX, xo = cx + sd * RX;
        const lidPath = `M ${xi - sd * 6} ${y - RY - 10} L ${xo + sd * 6} ${y - RY - 10} L ${xo + sd * 6} ${lidY + tiltOut} L ${xi - sd * 6} ${lidY + tiltIn} Z`;
        const px = cx + s.lookX * RX * 0.5 - sd * 4, py = y + 6 + s.lookY * RY * 0.45;
        if (open < 0.25) return <path key={sd} d={`M ${cx - RX} ${y + 6} Q ${cx} ${y + 22 - wo * 8} ${cx + RX} ${y + 6}`} stroke={INK} strokeWidth={OW * 1.2} fill="none" strokeLinecap="round" />;
        return (
          <g key={sd}>
            <clipPath id={`${id}-eye${sd}`}><ellipse cx={cx} cy={y} rx={RX} ry={RY} /></clipPath>
            <ellipse cx={cx} cy={y} rx={RX} ry={RY} fill="#fbfbf8" />
            <g clipPath={`url(#${id}-eye${sd})`}>
              <circle cx={px} cy={py} r={pr} fill={INK} />
              {(open < 0.97 || an > 0.05 || wo > 0.05) && (
                <>
                  <path d={lidPath} fill={lid} />
                  <path d={`M ${xi - sd * 6} ${lidY + tiltIn} L ${xo + sd * 6} ${lidY + tiltOut}`} stroke={INK} strokeWidth={OW} />
                </>
              )}
            </g>
            <ellipse cx={cx} cy={y} rx={RX} ry={RY} fill="none" stroke={INK} strokeWidth={OW} />
          </g>
        );
      })}
    </g>
  );
};

const Brows: React.FC<{y: number; s: FaceState; c: string; gap?: number; w?: number}> = ({y, s, c, gap = 40, w = 9}) => {
  const up = clamp(s.fear) * 26 + clamp(s.worry) * 8, inner = clamp(s.worry) * 22 + clamp(s.fear) * 6 - clamp(s.anger ?? 0) * 26;
  return (
    <g>
      {[-1, 1].map((sd) => (
        <path key={sd} d={`M ${sd * (gap - 30)} ${y - up - inner} Q ${sd * gap} ${y - up - 12} ${sd * (gap + 44)} ${y - up + 4}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />
      ))}
    </g>
  );
};

const Mouth: React.FC<{x: number; y: number; s: FaceState; w?: number}> = ({x, y, s, w = 50}) => {
  const mo = clamp(s.mouth), sad = clamp(s.worry), sm = clamp(s.smile ?? 0), fr = clamp(s.fear);
  if (mo < 0.12) {
    return <path d={`M ${x - w} ${y + sad * 10 - sm * 12} Q ${x} ${y + 16 * sm - 10 * sad} ${x + w * 0.9} ${y + sad * 10 - sm * 14}`} stroke={INK} strokeWidth={OW} fill="none" strokeLinecap="round" />;
  }
  const ww = w * lerp(1, 0.7, fr), hh = 16 + mo * 64;
  return (
    <g>
      <path d={`M ${x - ww} ${y + sad * 6} Q ${x} ${y - 6 - sm * 4} ${x + ww} ${y + sad * 6} Q ${x + ww * 0.85} ${y + hh} ${x} ${y + hh} Q ${x - ww * 0.85} ${y + hh} ${x - ww} ${y + sad * 6} Z`} fill="#4a1a1c" stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M ${x - ww * 0.8} ${y + 3} Q ${x} ${y - 3} ${x + ww * 0.8} ${y + 3} L ${x + ww * 0.72} ${y + 14} Q ${x} ${y + 10} ${x - ww * 0.72} ${y + 14} Z`} fill="#fbfbf8" />
      {mo > 0.35 && <path d={`M ${x - ww * 0.5} ${y + hh - 4} Q ${x} ${y + hh - 26} ${x + ww * 0.5} ${y + hh - 4}`} fill="#c8545c" />}
    </g>
  );
};

const Sweat: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => k <= 0.05 ? null : (
  <g opacity={k}>
    <path d={`M ${x} ${y} C ${x - 12} ${y + 22} ${x - 12} ${y + 38} ${x} ${y + 40} C ${x + 12} ${y + 38} ${x + 12} ${y + 22} ${x} ${y} Z`} fill="#cfeaf7" stroke={INK} strokeWidth={3.5} />
    <path d={`M ${x + 22} ${y + 30} C ${x + 14} ${y + 44} ${x + 14} ${y + 54} ${x + 22} ${y + 56} C ${x + 30} ${y + 54} ${x + 30} ${y + 44} ${x + 22} ${y + 30} Z`} fill="#cfeaf7" stroke={INK} strokeWidth={3.5} />
  </g>
);

// ===================== Lt. Charles Taylor =====================
export const TAYLOR_S = {
  skin: '#f1c7a5', skinShade: '#d9a582', stubble: '#c9a48a', hair: '#4a2e1c',
  helmet: '#7d4f2e', helmetShade: '#5f3a20', helmetLight: '#9a6a44', earcup: '#2b2724', strap: '#3e2817',
  goggleFrame: '#7a776f', lens: '#a8cfe0',
  jacket: '#6e4126', jacketShade: '#4f2d18', fur: '#e2cfac', furShade: '#bba37e',
  vest: '#f0be2e', vestShade: '#c9951a', webbing: '#cdbd92', pants: '#6c6d4a', pantsShade: '#55563a', boot: '#3b271a', mic: '#1d1d22',
};
export const TaylorS: React.FC<{s: TaylorState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'tayS', view = 'front'}) => {
  const C = TAYLOR_S;
  const b = s.breathe * 4, hy = -1570 + b * 0.5, tk = clamp(s.talk), pt = clamp(s.point ?? 0), gg = clamp(s.goggles);
  const shL = {x: -205, y: -1310 + b}, shR = {x: 205, y: -1310 + b};
  const handR = lp({x: 250, y: -800}, {x: 70, y: hy + 120}, tk), elR = lp({x: 262, y: -1050}, {x: 290, y: -1110}, tk);
  const handL = lp({x: -250, y: -800}, {x: -420, y: -1080}, pt), elL = lp({x: -262, y: -1050}, {x: -360, y: -1190}, pt);
  const legs = (
    <>
      <path d="M -165 -830 L -150 -130 L -22 -130 L -10 -830 Z M 165 -830 L 150 -130 L 22 -130 L 10 -830 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M -60 -830 L -70 -140 M 60 -830 L 70 -140" stroke={C.pantsShade} strokeWidth={12} opacity={0.7} />
      {[-1, 1].map((sd) => <rect key={`pk${sd}`} x={sd > 0 ? 44 : -150} y={-600} width={106} height={120} rx={8} fill={C.pantsShade} stroke={INK} strokeWidth={OW} />)}
    </>
  );
  const boots = (back: boolean) => [-1, 1].map((sd) => (
    <path key={sd} d={back ? `M ${sd * 14} -6 L ${sd * 14} -160 L ${sd * 160} -160 L ${sd * 168} -6 Z` : `M ${sd * 8} -8 L ${sd * 8} -160 L ${sd * 150} -160 C ${sd * 206} -140 ${sd * 222} -60 ${sd * 212} -8 Z`} fill={C.boot} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
  ));
  const torso = (
    <g transform={`translate(0 ${b * 0.4})`}>
      <path d="M -205 -1330 C -250 -1300 -258 -1220 -254 -1130 L -246 -790 C -170 -766 170 -766 246 -790 L 254 -1130 C 258 -1220 250 -1300 205 -1330 C 120 -1356 -120 -1356 -205 -1330 Z" fill={C.jacket} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      {/* one flat cel shadow down the right side */}
      <path d="M 150 -1320 C 220 -1290 240 -1210 238 -1130 L 232 -800 C 200 -790 170 -786 150 -784 Z" fill={C.jacketShade} opacity={0.7} />
      <path d="M -246 -830 L 246 -830 L 246 -790 C 170 -766 -170 -766 -246 -790 Z" fill={C.jacketShade} stroke={INK} strokeWidth={OW} />
    </g>
  );
  const helmetBack = (
    <g>
      <path d={`M -138 ${hy - 40} C -150 ${hy - 190} -70 ${hy - 226} 0 ${hy - 226} C 70 ${hy - 226} 150 ${hy - 190} 138 ${hy - 40} L 132 ${hy + 90} C 70 ${hy + 130} -70 ${hy + 130} -132 ${hy + 90} Z`} fill={C.helmet} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d={`M 0 ${hy - 224} L 0 ${hy + 110}`} stroke={C.helmetShade} strokeWidth={6} />
      <path d={`M -120 ${hy + 40} C -60 ${hy + 70} 60 ${hy + 70} 120 ${hy + 40}`} stroke={C.helmetShade} strokeWidth={6} fill="none" />
    </g>
  );
  const earcups = [-1, 1].map((sd) => (
    <g key={sd}>
      <ellipse cx={sd * 140} cy={hy + 10} rx={36} ry={48} fill={C.earcup} stroke={INK} strokeWidth={OW} />
      <ellipse cx={sd * 140} cy={hy + 10} rx={16} ry={24} fill={C.helmetShade} />
    </g>
  ));
  const goggles = (y: number) => (
    <g>
      <path d={`M -150 ${y + 4} Q 0 ${y - 18} 150 ${y + 4}`} stroke={C.strap} strokeWidth={18} fill="none" />
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 50} cy={y} rx={48} ry={36} fill={C.lens} stroke={C.goggleFrame} strokeWidth={12} />
          <ellipse cx={sd * 50} cy={y} rx={48} ry={36} fill="none" stroke={INK} strokeWidth={OW} />
          <path d={`M ${sd * 50 - 24} ${y - 14} l 14 -8`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
    </g>
  );
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          {legs}{boots(true)}
          <Limb d={armD(shL, {x: -262, y: -1050}, {x: -250, y: -800})} c={C.jacket} w={84} />
          <Limb d={armD(shR, {x: 262, y: -1050}, {x: 250, y: -800})} c={C.jacket} w={84} />
          <Hand x={-250} y={-780} c={C.skin} sh={C.skinShade} sd={1} />
          <Hand x={250} y={-780} c={C.skin} sh={C.skinShade} sd={-1} />
          {torso}
          <path d="M -246 -930 L 246 -930" stroke={C.webbing} strokeWidth={28} />
          <path d="M -150 -1320 L 120 -940 M 150 -1320 L -120 -940" stroke={C.vest} strokeWidth={30} />
          <path d="M -170 -1352 C -110 -1320 110 -1320 170 -1352 L 170 -1290 C 100 -1270 -100 -1270 -170 -1290 Z" fill={C.vest} stroke={INK} strokeWidth={OW} />
          <rect x={-50} y={hy + 140} width={100} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
          {helmetBack}{earcups}
          {goggles(hy - 150)}
        </g>
      </g>
    );
  }
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {legs}{boots(false)}
        {pt < 0.5 && <Limb d={armD(shL, elL, handL)} c={C.jacket} w={84} />}
        {tk < 0.5 && <Limb d={armD(shR, elR, handR)} c={C.jacket} w={84} />}
        {torso}
        <path d="M 0 -1320 L 0 -790" stroke={C.jacketShade} strokeWidth={6} />
        {/* yellow life vest */}
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 26} -1350 C ${sd * 140} -1350 ${sd * 214} -1290 ${sd * 218} -1160 L ${sd * 212} -990 C ${sd * 180} -930 ${sd * 80} -930 ${sd * 34} -980 Z`} fill={C.vest} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        ))}
        <path d="M 120 -1330 C 200 -1290 214 -1200 212 -1080 L 208 -990 C 190 -960 160 -946 130 -944 Z" fill={C.vestShade} opacity={0.6} />
        <path d="M -246 -930 L 246 -930" stroke={C.webbing} strokeWidth={28} />
        <rect x={-24} y={-950} width={48} height={40} rx={5} fill="#a3a39b" stroke={INK} strokeWidth={OW} />
        {/* fur collar */}
        <path d="M -160 -1350 C -110 -1290 110 -1290 160 -1350 L 130 -1250 C 60 -1222 -60 -1222 -130 -1250 Z" fill={C.fur} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M 80 -1300 C 110 -1310 140 -1330 160 -1350 L 130 -1250 C 110 -1242 95 -1238 80 -1236 Z" fill={C.furShade} opacity={0.7} />
        <rect x={-50} y={hy + 130} width={100} height={110} fill={C.skin} stroke={INK} strokeWidth={OW} />
        <path d={`M 10 ${hy + 132} L 50 ${hy + 132} L 50 ${hy + 236} L 10 ${hy + 236} Z`} fill={C.skinShade} opacity={0.6} />
        {/* head: broad square jaw */}
        <path d={`M -126 ${hy - 70} C -132 ${hy - 190} -60 ${hy - 214} 0 ${hy - 214} C 60 ${hy - 214} 132 ${hy - 190} 126 ${hy - 70} L 132 ${hy + 60} C 134 ${hy + 136} 92 ${hy + 182} 0 ${hy + 186} C -92 ${hy + 182} -134 ${hy + 136} -132 ${hy + 60} Z`} fill={C.skin} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {/* cel shade on the jaw + stubble */}
        <path d={`M 70 ${hy - 80} C 120 ${hy - 40} 128 ${hy + 40} 128 ${hy + 70} C 128 ${hy + 130} 96 ${hy + 172} 40 ${hy + 182} C 90 ${hy + 120} 96 ${hy + 20} 70 ${hy - 80} Z`} fill={C.skinShade} opacity={0.65} />
        <path d={`M -112 ${hy + 70} C -100 ${hy + 160} 100 ${hy + 160} 112 ${hy + 70} C 110 ${hy + 140} 70 ${hy + 178} 0 ${hy + 180} C -70 ${hy + 178} -110 ${hy + 140} -112 ${hy + 70} Z`} fill={C.stubble} opacity={0.35} />
        <path d={`M -26 ${hy + 162} Q 0 ${hy + 170} 26 ${hy + 162}`} stroke={INK} strokeWidth={OW * 0.8} fill="none" strokeLinecap="round" />
        {/* hair under the helmet edge */}
        <path d={`M -110 ${hy - 104} C -70 ${hy - 86} -30 ${hy - 90} 0 ${hy - 104} C 30 ${hy - 86} 70 ${hy - 88} 110 ${hy - 104} L 110 ${hy - 130} L -110 ${hy - 130} Z`} fill={C.hair} stroke={INK} strokeWidth={OW * 0.8} />
        {gg < 0.5 && <Brows y={hy - 92} s={s} c={C.hair} gap={44} w={10} />}
        {gg < 0.5 && <Eyes id={id} y={hy - 24} s={s} lid={C.skin} gap={44} rx={46} ry={56} />}
        {/* little hooked nose */}
        <path d={`M 4 ${hy + 34} C 38 ${hy + 40} 40 ${hy + 66} 8 ${hy + 70}`} stroke={INK} strokeWidth={OW} fill={C.skin} strokeLinecap="round" />
        <Mouth x={6} y={hy + 112} s={s} w={52} />
        <Sweat x={108} y={hy - 70} k={clamp(s.sweat ?? 0)} />
        {/* the leather helmet over the head */}
        <path d={`M -140 ${hy + 40} C -150 ${hy - 180} -70 ${hy - 228} 0 ${hy - 228} C 70 ${hy - 228} 150 ${hy - 180} 140 ${hy + 40} L 132 ${hy + 100} C 120 ${hy + 116} 104 ${hy + 116} 98 ${hy + 100} L 102 ${hy - 70} C 70 ${hy - 132} -70 ${hy - 132} -102 ${hy - 70} L -98 ${hy + 100} C -104 ${hy + 116} -120 ${hy + 116} -132 ${hy + 100} Z`} fill={C.helmet} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M 40 ${hy - 222} C 110 ${hy - 200} 142 ${hy - 140} 140 ${hy + 30} L 128 ${hy + 30} C 126 ${hy - 70} 110 ${hy - 120} 70 ${hy - 140} Z`} fill={C.helmetShade} opacity={0.6} />
        <path d={`M -90 ${hy - 190} Q -40 ${hy - 218} 10 ${hy - 220}`} stroke={C.helmetLight} strokeWidth={14} fill="none" strokeLinecap="round" />
        {earcups}
        {gg < 0.5 && <path d={`M -116 ${hy + 104} Q 0 ${hy + 230} 116 ${hy + 104}`} stroke={C.strap} strokeWidth={10} fill="none" />}
        {goggles(gg < 0.5 ? hy - 150 : hy - 24)}
        {pt >= 0.5 && <Limb d={armD(shL, elL, handL)} c={C.jacket} w={84} />}
        {tk >= 0.5 && <Limb d={armD(shR, elR, handR)} c={C.jacket} w={84} />}
        {tk > 0.05 && (
          <g opacity={clamp(tk * 2)}>
            <path d={`M ${handR.x + 30} ${handR.y + 50} C ${handR.x + 120} ${handR.y + 200} ${handR.x + 40} ${handR.y + 300} ${handR.x + 150} ${handR.y + 430}`} stroke={C.mic} strokeWidth={9} fill="none" strokeDasharray="12 6" />
            <rect x={handR.x - 46} y={handR.y - 64} width={76} height={108} rx={20} fill={C.mic} stroke={INK} strokeWidth={OW} />
            {[0, 1, 2].map((k) => <path key={k} d={`M ${handR.x - 32} ${handR.y - 42 + k * 16} L ${handR.x + 14} ${handR.y - 42 + k * 16}`} stroke="#4a4a52" strokeWidth={5} />)}
          </g>
        )}
        <Hand x={handL.x} y={handL.y} c={C.skin} sh={C.skinShade} sd={1} rot={pt * 80} />
        <Hand x={handR.x + (tk > 0.5 ? 16 : 0)} y={handR.y + (tk > 0.5 ? 30 : 0)} c={C.skin} sh={C.skinShade} sd={-1} rot={tk * -150} fist={tk} />
      </g>
    </g>
  );
};

// ===================== the radioman («ты») =====================
export const RADIST_S = {
  skin: '#f5d2b6', skinShade: '#ddae8e', hair: '#3a2a20', hairShade: '#261a12', freckle: '#cf9a74',
  shirt: '#94b5d8', shirtShade: '#7095bd', shirtLight: '#b2cbe6', tee: '#f3f1ea', pants: '#34466e', pantsShade: '#26355a',
  shoe: '#1b191c', phones: '#28262a', pad: '#5c402e',
};
export const RadistS: React.FC<{s: RadistState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'radS', view = 'front'}) => {
  const C = RADIST_S;
  const b = s.breathe * 4, li = clamp(s.listen), sh = clamp(s.shout), off = clamp(s.headsOff ?? 0);
  const lean = sh * 36;
  const hy = -1600 + b * 0.5 + lean * 0.5;
  const shL = {x: -190, y: -1335 + b}, shR = {x: 190, y: -1335 + b};
  const cupY = lerp(hy + 6, hy + 270, off);
  const handL = lp({x: -232, y: -820}, {x: -168, y: cupY + 30}, li), elL = lp({x: -250, y: -1070}, {x: -310, y: -1200}, li);
  const handR0 = lp({x: 232, y: -820}, {x: 168, y: cupY + 30}, li);
  const handR = lp(handR0, {x: 110, y: -1010}, sh), elR = lp(lp({x: 250, y: -1070}, {x: 310, y: -1200}, li), {x: 290, y: -1090}, sh);
  const legs = (
    <>
      <path d="M -150 -840 L -158 -80 L -22 -80 L -12 -840 Z M 150 -840 L 158 -80 L 22 -80 L 12 -840 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M 70 -840 L 80 -90 L 150 -90 L 150 -840 Z" fill={C.pantsShade} opacity={0.6} />
    </>
  );
  const shoes = [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 12} -8 L ${sd * 12} -90 L ${sd * 150} -90 C ${sd * 200} -80 ${sd * 210} -40 ${sd * 200} -8 Z`} fill={C.shoe} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />);
  const shirt = (
    <g transform={`translate(0 ${b * 0.4 + lean * 0.3})`}>
      <path d="M -190 -1350 C -236 -1322 -244 -1240 -240 -1150 L -232 -800 C -160 -780 160 -780 232 -800 L 240 -1150 C 244 -1240 236 -1322 190 -1350 C 110 -1376 -110 -1376 -190 -1350 Z" fill={C.shirt} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
      <path d="M 140 -1344 C 210 -1310 226 -1230 224 -1150 L 218 -806 C 190 -798 166 -794 140 -792 Z" fill={C.shirtShade} opacity={0.7} />
    </g>
  );
  const phones = (
    <g>
      {off < 0.5 && <path d={`M -146 ${hy - 10} C -160 ${hy - 270} 160 ${hy - 270} 146 ${hy - 10}`} stroke={C.phones} strokeWidth={22} fill="none" strokeLinecap="round" />}
      {off >= 0.5 && <path d={`M -130 ${cupY} C -100 ${cupY + 56} 100 ${cupY + 56} 130 ${cupY}`} stroke={C.phones} strokeWidth={18} fill="none" />}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <ellipse cx={sd * 146} cy={cupY} rx={40} ry={56} fill={C.phones} stroke={INK} strokeWidth={OW} />
          <ellipse cx={sd * 130} cy={cupY} rx={16} ry={38} fill={C.pad} />
          <ellipse cx={sd * 154} cy={cupY - 18} rx={9} ry={14} fill="#fff" opacity={0.2} />
        </g>
      ))}
      <path d={`M 170 ${cupY + 50} C 210 ${cupY + 190} 140 ${cupY + 320} 210 ${cupY + 460}`} stroke={C.phones} strokeWidth={8} fill="none" />
    </g>
  );
  const ears = [-1, 1].map((sd) => (
    <g key={`ear${sd}`}>
      <ellipse cx={sd * 118} cy={hy + 4} rx={26} ry={40} fill={C.skin} stroke={INK} strokeWidth={OW} />
      <path d={`M ${sd * 118} ${hy - 16} Q ${sd * 128} ${hy + 4} ${sd * 116} ${hy + 22}`} stroke={C.skinShade} strokeWidth={6} fill="none" />
    </g>
  ));
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          {legs}{shoes}
          <Limb d={armD(shL, {x: -250, y: -1070}, {x: -232, y: -820})} c={C.skin} w={60} />
          <Limb d={armD(shR, {x: 250, y: -1070}, {x: 232, y: -820})} c={C.skin} w={60} />
          <Hand x={-232} y={-800} c={C.skin} sh={C.skinShade} sd={1} />
          <Hand x={232} y={-800} c={C.skin} sh={C.skinShade} sd={-1} />
          {shirt}
          {[-1, 1].map((sd) => <Limb key={sd} d={armD(sd < 0 ? shL : shR, {x: sd * 236, y: -1200}, {x: sd * 250, y: -1120})} c={C.shirt} w={92} />)}
          <path d="M -180 -1220 C -90 -1240 90 -1240 180 -1220" stroke={C.shirtShade} strokeWidth={6} fill="none" />
          <rect x={-46} y={hy + 150} width={92} height={90} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
          {ears}
          <path d={`M -120 ${hy - 60} C -130 ${hy - 190} -60 ${hy - 216} 0 ${hy - 216} C 60 ${hy - 216} 130 ${hy - 190} 120 ${hy - 60} C 118 ${hy + 60} 80 ${hy + 150} 0 ${hy + 160} C -80 ${hy + 150} -118 ${hy + 60} -120 ${hy - 60} Z`} fill={C.hair} stroke={INK} strokeWidth={OW} />
          <path d={`M -100 ${hy + 60} C -60 ${hy + 120} 60 ${hy + 120} 100 ${hy + 60} C 90 ${hy + 130} 60 ${hy + 156} 0 ${hy + 160} C -60 ${hy + 156} -90 ${hy + 130} -100 ${hy + 60} Z`} fill={C.skin} stroke={INK} strokeWidth={OW * 0.8} />
          {phones}
        </g>
      </g>
    );
  }
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {legs}{shoes}
        {li < 0.5 && <Limb d={armD(shL, elL, handL)} c={C.skin} w={60} />}
        {li < 0.5 && sh < 0.5 && <Limb d={armD(shR, elR, handR)} c={C.skin} w={60} />}
        {shirt}
        <g transform={`translate(0 ${b * 0.4 + lean * 0.3})`}>
          <path d="M -80 -1362 L 0 -1230 L 80 -1362 Z" fill={C.tee} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 82} -1364 L ${sd * 150} -1296 L ${sd * 40} -1256 L 0 -1230 Z`} fill={C.shirtLight} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
          <path d="M 0 -1230 L 0 -800" stroke={C.shirtShade} strokeWidth={6} />
          {[-1150, -1030, -910].map((y) => <circle key={y} cx={14} cy={y} r={9} fill="#f6f4ee" stroke={INK} strokeWidth={3} />)}
          {[-1, 1].map((sd) => (
            <g key={`p${sd}`}>
              <path d={`M ${sd * 56} -1180 L ${sd * 176} -1180 L ${sd * 172} -1046 C ${sd * 140} -1030 ${sd * 90} -1030 ${sd * 60} -1046 Z`} fill={C.shirt} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
              <path d={`M ${sd * 56} -1180 L ${sd * 176} -1180 L ${sd * 172} -1146 L ${sd * 58} -1146 Z`} fill={C.shirtShade} stroke={INK} strokeWidth={OW} />
            </g>
          ))}
          <path d="M -140 -1222 L -132 -1170" stroke="#f0be2e" strokeWidth={12} strokeLinecap="round" />
          {[-1, 1].map((sd) => <Limb key={`sl${sd}`} d={armD(sd < 0 ? shL : shR, {x: sd * 236, y: -1200}, {x: sd * 250, y: -1120})} c={C.shirt} w={92} />)}
          {[-1, 1].map((sd) => <ellipse key={`cf${sd}`} cx={sd * 250} cy={-1110} rx={56} ry={26} fill={C.shirtLight} stroke={INK} strokeWidth={OW} />)}
        </g>
        <rect x={-46} y={hy + 140} width={92} height={110} fill={C.skin} stroke={INK} strokeWidth={OW} />
        <path d={`M 6 ${hy + 142} L 46 ${hy + 142} L 46 ${hy + 248} L 6 ${hy + 248} Z`} fill={C.skinShade} opacity={0.6} />
        {ears}
        {/* young narrow face with a pointed chin */}
        <path d={`M -118 ${hy - 60} C -126 ${hy - 186} -58 ${hy - 214} 0 ${hy - 214} C 58 ${hy - 214} 126 ${hy - 186} 118 ${hy - 60} C 116 ${hy + 60} 74 ${hy + 160} 6 ${hy + 172} C -70 ${hy + 160} -116 ${hy + 60} -118 ${hy - 60} Z`} fill={C.skin} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M 70 ${hy - 100} C 116 ${hy - 50} 118 ${hy + 30} 112 ${hy + 60} C 100 ${hy + 120} 70 ${hy + 158} 30 ${hy + 168} C 80 ${hy + 100} 92 ${hy} 70 ${hy - 100} Z`} fill={C.skinShade} opacity={0.6} />
        {[[-80, 48], [-62, 60], [-94, 64], [74, 50], [90, 62], [60, 64]].map(([x, y], i) => <circle key={`fr${i}`} cx={x} cy={hy + y} r={4} fill={C.freckle} opacity={0.8} />)}
        {/* 40s side-parted hair with a wave in front */}
        <path d={`M -122 ${hy - 40} C -140 ${hy - 190} -60 ${hy - 236} 10 ${hy - 234} C 90 ${hy - 232} 146 ${hy - 180} 122 ${hy - 50} C 116 ${hy - 110} 100 ${hy - 140} 70 ${hy - 150} C 40 ${hy - 120} -20 ${hy - 170} -50 ${hy - 150} C -90 ${hy - 150} -112 ${hy - 110} -122 ${hy - 40} Z`} fill={C.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={`M -60 ${hy - 234} C -70 ${hy - 200} -66 ${hy - 170} -50 ${hy - 150}`} stroke={C.hairShade} strokeWidth={6} fill="none" />
        <path d={`M 20 ${hy - 214} Q 70 ${hy - 214} 100 ${hy - 180}`} stroke="#5c4636" strokeWidth={10} fill="none" strokeLinecap="round" />
        <Brows y={hy - 104} s={s} c={C.hair} gap={40} w={9} />
        <Eyes id={id} y={hy - 34} s={s} lid={C.skin} gap={40} rx={42} ry={54} />
        <path d={`M 2 ${hy + 22} C 40 ${hy + 30} 42 ${hy + 58} 6 ${hy + 62}`} stroke={INK} strokeWidth={OW} fill={C.skin} strokeLinecap="round" />
        <Mouth x={6} y={hy + 102} s={s} w={42} />
        <Sweat x={-108} y={hy - 80} k={clamp(s.sweat ?? 0)} />
        {phones}
        {li >= 0.5 && <Limb d={armD(shL, elL, handL)} c={C.skin} w={60} />}
        {(li >= 0.5 || sh >= 0.5) && <Limb d={armD(shR, elR, handR)} c={C.skin} w={60} />}
        <Hand x={handL.x} y={handL.y} c={C.skin} sh={C.skinShade} sd={1} rot={li * 160} />
        <Hand x={handR.x} y={handR.y} c={C.skin} sh={C.skinShade} sd={-1} rot={li * -160 * (1 - sh)} />
        {sh > 0.5 && (
          <g transform={`translate(${handR.x} ${handR.y + 50})`}>
            <rect x={-80} y={0} width={160} height={34} rx={8} fill="#3a3a40" stroke={INK} strokeWidth={OW} />
            <circle cx={0} cy={-4} r={14} fill="#c22" stroke={INK} strokeWidth={3.5} />
          </g>
        )}
      </g>
    </g>
  );
};
