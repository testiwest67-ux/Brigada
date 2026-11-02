// The other people of «Ночная смена»: Petrovich (the old shop assistant), the babushka with a string bag,
// and Stas, the tall man in the long coat who has no shadow (under the coat: the same green vest, badge «СТАС»).
// Puppet units: 1 = 1 mm, origin between the feet, y up negative.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';
import {FONT} from '../horror/fonts';

const INK = '#14121c', OW = 7;
type P = {x: number; y: number};
const armD = (a: P, e: P, h: P) => `M ${a.x} ${a.y} Q ${(a.x + e.x) / 2 - 10} ${(a.y + e.y) / 2} ${e.x} ${e.y} Q ${(e.x + h.x) / 2} ${(e.y + h.y) / 2} ${h.x} ${h.y}`;
const Sleeve: React.FC<{d: string; c: string; w: number}> = ({d, c, w}) => (
  <>
    <path d={d} stroke={INK} strokeWidth={w + OW * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>
);
const Badge: React.FC<{x: number; y: number; name: string; s?: number}> = ({x, y, name, s = 1}) => {
  const w = 30 + name.length * 22;
  return (
    <g transform={`translate(${x} ${y}) rotate(-4) scale(${s})`}>
      <rect x={0} y={0} width={w} height={50} rx={8} fill="#f4f1ea" stroke={INK} strokeWidth={4} />
      <text x={w / 2} y={36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#b0262a">{name}</text>
    </g>
  );
};

// ---------------- Petrovich ----------------
const PC = {
  skin: '#e8bea0', skinShade: '#c99678', skinDark: '#a8755c', nose: '#de9c86', fluff: '#e9e6df', fluffShade: '#bdb8ae',
  cardigan: '#c8b28a', cardiganShade: '#a48e66', cardiganLight: '#dcc8a0', vest: '#2f7a4c', vestShade: '#225c39',
  shirt: '#e6e3da', pants: '#3a3a40', shoe: '#4a3020', frame: '#2a2420', lens: '#cfe2ee',
};
export type PetrovichState = {t: number; blink: number; mouth: number; lookX: number; lookY: number; sad: number; glasses: number; breathe: number; wave?: number};
export const PETROVICH_REST: PetrovichState = {t: 0, blink: 1, mouth: 0, lookX: 0, lookY: 0, sad: 0, glasses: 0, breathe: 0};

export const Petrovich: React.FC<{s: PetrovichState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'petr', view = 'front'}) => {
  const b = s.breathe * 5, mo = clamp(s.mouth), gl = clamp(s.glasses), wv = clamp(s.wave ?? 0);
  const hy = -1560 + b * 0.6;
  const shL = {x: -215, y: -1290 + b}, shR = {x: 215, y: -1290 + b};
  // right hand (screen right): down, or up at the chest holding the glasses he just took off
  const handR = lp2({x: 250, y: -760}, {x: 130, y: -1060}, gl), elR = lp2({x: 285, y: -1030}, {x: 320, y: -990}, gl);
  // left hand: down, or a small wave at the door
  const handL = lp2({x: -250, y: -760}, {x: -330, y: -1500 + Math.sin(s.t * 9) * 30 * wv}, wv), elL = lp2({x: -285, y: -1030}, {x: -360, y: -1210}, wv);
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          <path d="M -140 -800 L -130 -60 L -20 -60 L -12 -800 Z M 140 -800 L 130 -60 L 20 -60 L 12 -800 Z" fill={PC.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 14} -6 L ${sd * 14} -76 L ${sd * 160} -76 L ${sd * 168} -6 Z`} fill={PC.shoe} stroke={INK} strokeWidth={OW} />)}
          <Sleeve d={armD(shL, {x: -285, y: -1030}, {x: -250, y: -760})} c={PC.cardigan} w={92} />
          <Sleeve d={armD(shR, {x: 285, y: -1030}, {x: 250, y: -760})} c={PC.cardigan} w={92} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 250} cy={-752} rx={42} ry={46} fill={PC.skin} stroke={INK} strokeWidth={OW} />)}
          <path d="M -215 -1305 C -262 -1280 -272 -1200 -268 -1110 L -262 -700 C -180 -676 180 -676 262 -700 L 268 -1110 C 272 -1200 262 -1280 215 -1305 C 130 -1340 -130 -1340 -215 -1305 Z" fill={PC.cardigan} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[-200, -150, -100, -50, 0, 50, 100, 150, 200].map((x) => <path key={x} d={`M ${x} -1290 L ${x} -700`} stroke={PC.cardiganShade} strokeWidth={5} opacity={0.5} />)}
          <rect x={-55} y={hy + 150} width={110} height={100} fill={PC.skinShade} stroke={INK} strokeWidth={OW} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 160} cy={hy + 10} rx={28} ry={44} fill={PC.skin} stroke={INK} strokeWidth={OW} />)}
          <ellipse cx={0} cy={hy} rx={155} ry={180} fill={PC.skin} stroke={INK} strokeWidth={OW} />
          {/* a thin horseshoe of white fluff from ear to ear, low on the back of the head */}
          <path d={`M -156 ${hy - 20} C -160 ${hy + 70} -80 ${hy + 120} 0 ${hy + 124} C 80 ${hy + 120} 160 ${hy + 70} 156 ${hy - 20} C 150 ${hy + 40} 80 ${hy + 80} 0 ${hy + 82} C -80 ${hy + 80} -150 ${hy + 40} -156 ${hy - 20} Z`} fill={PC.fluff} stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />
          <path d={`M -120 ${hy + 60} Q 0 ${hy + 116} 120 ${hy + 60}`} stroke={PC.fluffShade} strokeWidth={5} strokeDasharray="8 10" fill="none" />
          <ellipse cx={-50} cy={hy - 110} rx={50} ry={26} fill="#fff" opacity={0.25} />
        </g>
      </g>
    );
  }
  const eye = (sd: number) => {
    const cx = sd * 62 + s.lookX * 4, cy = hy - 14, r = lerp(40, 26, gl); // lenses magnify the eyes
    const open = clamp(s.blink), ry = r * 0.8, lid = cy - ry + (1 - open) * ry * 2;
    return (
      <g key={sd}>
        <clipPath id={`${id}-e${sd}`}><ellipse cx={cx} cy={cy} rx={r} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="#efe9e0" />
        <g clipPath={`url(#${id}-e${sd})`}>
          <circle cx={cx + s.lookX * r * 0.35} cy={cy + 2 + s.lookY * r * 0.3} r={r * 0.5} fill="#6b5a44" />
          <circle cx={cx + s.lookX * r * 0.35} cy={cy + 2 + s.lookY * r * 0.3} r={r * 0.26} fill="#0d0f19" />
          <circle cx={cx + s.lookX * r * 0.35 - r * 0.15} cy={cy - r * 0.15} r={r * 0.12} fill="#fff" />
          <rect x={cx - r - 4} y={cy - ry - 6} width={r * 2 + 8} height={Math.max(0, lid - (cy - ry - 6))} fill={PC.skinShade} />
        </g>
        <ellipse cx={cx} cy={cy} rx={r} ry={ry} fill="none" stroke={INK} strokeWidth={OW * 0.8} />
        <path d={`M ${cx - 34} ${cy + 40} Q ${cx} ${cy + 54} ${cx + 34} ${cy + 40}`} stroke={PC.skinDark} strokeWidth={5} fill="none" />
        {/* bushy white brows; `sad` lifts the inner ends */}
        <path d={`M ${cx - sd * 48} ${cy - 58 - s.sad * 26} Q ${cx} ${cy - 80 - s.sad * 6} ${cx + sd * 56} ${cy - 52 + s.sad * 10}`} stroke={PC.fluff} strokeWidth={30} strokeLinecap="round" fill="none" />
        <path d={`M ${cx - sd * 48} ${cy - 58 - s.sad * 26} Q ${cx} ${cy - 80 - s.sad * 6} ${cx + sd * 56} ${cy - 52 + s.sad * 10}`} stroke={PC.fluffShade} strokeWidth={6} strokeDasharray="8 10" fill="none" />
      </g>
    );
  };
  const glassesAt = (x: number, y: number, sc: number, rot: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      {[-1, 1].map((sd) => <circle key={sd} cx={sd * 62} cy={0} r={56} fill={PC.lens} fillOpacity={0.18} stroke={PC.frame} strokeWidth={12} />)}
      <path d="M -8 -6 Q 0 -16 8 -6" stroke={PC.frame} strokeWidth={10} fill="none" />
      {[-1, 1].map((sd) => <path key={`g${sd}`} d={`M ${sd * 30} -30 l ${sd * 14} -10`} stroke="#fff" strokeWidth={8} opacity={0.5} strokeLinecap="round" />)}
    </g>
  );
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -140 -800 L -130 -60 L -20 -60 L -12 -800 Z M 140 -800 L 130 -60 L 20 -60 L 12 -800 Z" fill={PC.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 10} -10 L ${sd * 10} -80 L ${sd * 150} -80 C ${sd * 200} -70 ${sd * 210} -30 ${sd * 200} -10 Z`} fill={PC.shoe} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {wv < 0.5 && <Sleeve d={armD(shL, elL, handL)} c={PC.cardigan} w={92} />}
        {gl < 0.5 && <Sleeve d={armD(shR, elR, handR)} c={PC.cardigan} w={92} />}
        <g transform={`translate(0 ${b * 0.5})`}>
          {/* shirt + green vest in the middle, cardigan halves over it */}
          <path d="M -120 -1320 L 120 -1320 L 140 -700 L -140 -700 Z" fill={PC.shirt} stroke={INK} strokeWidth={OW} />
          <path d="M -130 -1240 L 0 -1060 L 130 -1240 L 150 -700 L -150 -700 Z" fill={PC.vest} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <Badge x={-60} y={-1000} name="ПЕТРОВИЧ" s={0.55} />
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 215} -1305 C ${sd * 262} -1280 ${sd * 272} -1200 ${sd * 268} -1110 L ${sd * 262} -700 C ${sd * 220} -690 ${sd * 160} -684 ${sd * 110} -682 L ${sd * 96} -1100 L ${sd * 70} -1330 C ${sd * 140} -1328 ${sd * 190} -1316 ${sd * 215} -1305 Z`} fill={PC.cardigan} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          ))}
          {[-1, 1].map((sd) => <path key={`r${sd}`} d={`M ${sd * 84} -1310 L ${sd * 104} -684`} stroke={PC.cardiganLight} strokeWidth={22} />)}
          {[-1000, -900, -800].map((y) => <circle key={y} cx={-104} cy={y} r={11} fill={PC.cardiganShade} stroke={INK} strokeWidth={3} />)}
          {[-1, 1].map((sd) => <rect key={`p${sd}`} x={sd > 0 ? 130 : -240} y={-880} width={110} height={110} rx={12} fill={PC.cardiganShade} stroke={INK} strokeWidth={OW * 0.6} />)}
        </g>
        <rect x={-55} y={hy + 150} width={110} height={100} fill={PC.skinShade} stroke={INK} strokeWidth={OW} />
        {/* head: bald dome, white fluff at the sides */}
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 160} cy={hy + 10} rx={28} ry={44} fill={PC.skin} stroke={INK} strokeWidth={OW} />)}
        <ellipse cx={0} cy={hy} rx={155} ry={180} fill={PC.skin} stroke={INK} strokeWidth={OW} />
        <ellipse cx={-50} cy={hy - 120} rx={56} ry={30} fill="#fff" opacity={0.3} />
        {[-1, 1].map((sd) => (
          <path key={sd} d={`M ${sd * 150} ${hy - 70} C ${sd * 200} ${hy - 90} ${sd * 214} ${hy - 20} ${sd * 196} ${hy + 30} C ${sd * 214} ${hy + 60} ${sd * 186} ${hy + 90} ${sd * 150} ${hy + 70} Z`} fill={PC.fluff} stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />
        ))}
        {[0, 1].map((k) => <path key={k} d={`M -70 ${hy - 120 + k * 18} Q 0 ${hy - 132 + k * 18} 70 ${hy - 120 + k * 18}`} stroke={PC.skinDark} strokeWidth={5} fill="none" opacity={0.6} />)}
        {eye(-1)}{eye(1)}
        {gl < 0.5 && glassesAt(s.lookX * 4, hy - 14, 1, 0)}
        <ellipse cx={0} cy={hy + 44} rx={32} ry={36} fill={PC.nose} stroke={INK} strokeWidth={OW} />
        {/* grey stubble + mouth (sad: corners down) */}
        {[-60, -40, -20, 0, 20, 40, 60, -50, -30, 30, 50].map((x, i) => <circle key={i} cx={x} cy={hy + 140 + (i > 6 ? 18 : 0)} r={3.5} fill="#8e8a84" opacity={0.6} />)}
        <path d={`M -40 ${hy + 112 + s.sad * 10} Q 0 ${hy + 104 + 34 * mo - s.sad * 12} 40 ${hy + 112 + s.sad * 10}`} stroke={INK} strokeWidth={OW} fill={mo > 0.15 ? '#3b141a' : 'none'} strokeLinecap="round" />
        {wv >= 0.5 && <Sleeve d={armD(shL, elL, handL)} c={PC.cardigan} w={92} />}
        {gl >= 0.5 && <Sleeve d={armD(shR, elR, handR)} c={PC.cardigan} w={92} />}
        <ellipse cx={handL.x} cy={handL.y} rx={42} ry={46} fill={PC.skin} stroke={INK} strokeWidth={OW} />
        <ellipse cx={handR.x} cy={handR.y} rx={42} ry={46} fill={PC.skin} stroke={INK} strokeWidth={OW} />
        {gl >= 0.5 && glassesAt(handR.x - 70, handR.y - 30, 0.75, -18)}
      </g>
    </g>
  );
};
function lp2(a: P, b: P, k: number): P { return {x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k)}; }

// ---------------- Babushka ----------------
const BC = {skin: '#ecc7ac', skinShade: '#cc9c80', skinDark: '#a8775e', scarf: '#b3262f', scarfDot: '#f2e6d0', coat: '#6a4a36', coatShade: '#4f3526',
  collar: '#8a7a6a', boot: '#2a2220', bag: '#d8c48a', loaf: '#d79a52', loafLight: '#ecc07e', stocking: '#6a5a50'};
export type BabkaState = {t: number; blink: number; mouth: number; lookX: number; breathe: number; smile: number};
export const BABKA_REST: BabkaState = {t: 0, blink: 1, mouth: 0, lookX: 0, breathe: 0, smile: 0.4};

export const Babka: React.FC<{s: BabkaState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'babka', view = 'front'}) => {
  const b = s.breathe * 4, hy = -1300 + b * 0.5, mo = clamp(s.mouth);
  const coat = 'M -190 -1100 C -240 -1080 -250 -1000 -248 -920 L -270 -330 C -150 -300 150 -300 270 -330 L 248 -920 C 250 -1000 240 -1080 190 -1100 C 110 -1130 -110 -1130 -190 -1100 Z';
  const bag = (
    // string bag with a loaf, in the left hand (screen left)
    <g transform="translate(-250 -560)">
      <path d="M -10 0 L -80 60 M 10 0 L 80 60" stroke={BC.bag} strokeWidth={8} />
      <path d="M -90 60 C -110 200 110 200 90 60 Z" fill="none" stroke={BC.bag} strokeWidth={8} />
      {[-60, -20, 20, 60].map((x) => <path key={x} d={`M ${x} 60 L ${x * 0.6} 190`} stroke={BC.bag} strokeWidth={5} />)}
      <path d="M -100 120 L 100 120 M -90 160 L 90 160" stroke={BC.bag} strokeWidth={5} />
      <g transform="rotate(-24 0 110)">
        <ellipse cx={0} cy={110} rx={110} ry={42} fill={BC.loaf} stroke={INK} strokeWidth={OW} />
        {[-50, 0, 50].map((x) => <path key={x} d={`M ${x - 14} 92 L ${x + 14} 82`} stroke={BC.loafLight} strokeWidth={9} strokeLinecap="round" />)}
      </g>
    </g>
  );
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          <path d="M -120 -340 L -110 -60 L -30 -60 L -24 -340 Z M 120 -340 L 110 -60 L 30 -60 L 24 -340 Z" fill={BC.stocking} stroke={INK} strokeWidth={OW} />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 20} -6 L ${sd * 20} -150 L ${sd * 140} -150 L ${sd * 150} -6 Z`} fill={BC.boot} stroke={INK} strokeWidth={OW} />)}
          <Sleeve d={armD({x: 200, y: -1060}, {x: 260, y: -820}, {x: 250, y: -580})} c={BC.coat} w={100} />
          <Sleeve d={armD({x: -200, y: -1060}, {x: -260, y: -820}, {x: -250, y: -580})} c={BC.coat} w={100} />
          <g transform="scale(-1 1)">{bag}</g>
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 250} cy={-570} rx={40} ry={44} fill={BC.skin} stroke={INK} strokeWidth={OW} />)}
          <path d={coat} fill={BC.coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M 0 -1080 L 0 -320" stroke={BC.coatShade} strokeWidth={8} />
          <ellipse cx={0} cy={hy} rx={150} ry={165} fill={BC.scarf} stroke={INK} strokeWidth={OW} />
          <path d={`M -150 ${hy + 40} C -170 ${hy + 160} -60 ${hy + 220} 0 ${hy + 230} C 60 ${hy + 220} 170 ${hy + 160} 150 ${hy + 40} Z`} fill={BC.scarf} stroke={INK} strokeWidth={OW} />
          {[[-80, -60], [20, -110], [90, -20], [-40, 40], [60, 90], [-100, 110], [0, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={hy + y} r={13} fill={BC.scarfDot} />)}
        </g>
      </g>
    );
  }
  const eye = (sd: number) => {
    const cx = sd * 56 + s.lookX * 6, cy = hy + 6, open = clamp(s.blink);
    return open > 0.2 ? (
      <g key={sd}>
        <ellipse cx={cx} cy={cy} rx={20} ry={22 * open} fill="#1a1414" />
        <circle cx={cx - 6} cy={cy - 7} r={5} fill="#fff" />
        <path d={`M ${cx - 30} ${cy + 26} Q ${cx} ${cy + 36} ${cx + 30} ${cy + 26}`} stroke={BC.skinDark} strokeWidth={5} fill="none" />
      </g>
    ) : <path key={sd} d={`M ${cx - 22} ${cy} Q ${cx} ${cy + 12} ${cx + 22} ${cy}`} stroke={INK} strokeWidth={8} fill="none" />;
  };
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -120 -340 L -110 -60 L -30 -60 L -24 -340 Z M 120 -340 L 110 -60 L 30 -60 L 24 -340 Z" fill={BC.stocking} stroke={INK} strokeWidth={OW} />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 18} -8 L ${sd * 18} -150 L ${sd * 120} -150 C ${sd * 170} -100 ${sd * 180} -40 ${sd * 170} -8 Z`} fill={BC.boot} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        <Sleeve d={armD({x: -200, y: -1060}, {x: -260, y: -820}, {x: -250, y: -580})} c={BC.coat} w={100} />
        <Sleeve d={armD({x: 200, y: -1060}, {x: 260, y: -820}, {x: 250, y: -580})} c={BC.coat} w={100} />
        <path d={coat} fill={BC.coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d="M 0 -1080 L 0 -320" stroke={BC.coatShade} strokeWidth={8} />
        {[-950, -800, -650, -500].map((y) => <circle key={y} cx={26} cy={y} r={14} fill="#2a1e16" stroke={INK} strokeWidth={3} />)}
        <path d="M -150 -1110 C -80 -1040 80 -1040 150 -1110 L 120 -1000 C 60 -980 -60 -980 -120 -1000 Z" fill={BC.collar} stroke={INK} strokeWidth={OW} />
        {bag}
        <ellipse cx={-250} cy={-570} rx={40} ry={44} fill={BC.skin} stroke={INK} strokeWidth={OW} />
        <ellipse cx={250} cy={-570} rx={40} ry={44} fill={BC.skin} stroke={INK} strokeWidth={OW} />
        {/* face inside the headscarf */}
        <path d={`M -170 ${hy - 20} C -190 ${hy - 200} 190 ${hy - 200} 170 ${hy - 20} C 190 ${hy + 120} 120 ${hy + 200} 0 ${hy + 210} C -120 ${hy + 200} -190 ${hy + 120} -170 ${hy - 20} Z`} fill={BC.scarf} stroke={INK} strokeWidth={OW} />
        <ellipse cx={0} cy={hy + 30} rx={120} ry={140} fill={BC.skin} stroke={INK} strokeWidth={OW} />
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 76} cy={hy + 70} rx={30} ry={16} fill="#e58a7c" opacity={0.45} />)}
        {eye(-1)}{eye(1)}
        <ellipse cx={0} cy={hy + 60} rx={22} ry={26} fill={BC.skinShade} stroke={INK} strokeWidth={OW * 0.8} />
        <path d={`M -36 ${hy + 116} Q 0 ${hy + 116 + 30 * s.smile + 20 * mo} 36 ${hy + 116}`} stroke={INK} strokeWidth={OW} fill={mo > 0.15 ? '#3b141a' : 'none'} strokeLinecap="round" />
        {[0, 1].map((k) => <path key={k} d={`M -60 ${hy - 70 + k * 16} Q 0 ${hy - 80 + k * 16} 60 ${hy - 70 + k * 16}`} stroke={BC.skinDark} strokeWidth={4} fill="none" opacity={0.6} />)}
        {/* scarf front edge + knot under the chin */}
        <path d={`M -130 ${hy - 70} C -80 ${hy - 140} 80 ${hy - 140} 130 ${hy - 70}`} stroke={BC.scarf} strokeWidth={40} fill="none" strokeLinecap="round" />
        {[[-90, -112], [0, -126], [90, -112], [-150, 40], [150, 40], [-142, -40], [142, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={hy + y} r={13} fill={BC.scarfDot} />)}
        <path d={`M -30 ${hy + 200} L -90 ${hy + 300} L -20 ${hy + 260} Z M 30 ${hy + 200} L 80 ${hy + 310} L 20 ${hy + 262} Z`} fill={BC.scarf} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <circle cx={0} cy={hy + 214} r={30} fill={BC.scarf} stroke={INK} strokeWidth={OW} />
      </g>
    </g>
  );
};

// ---------------- Stas, the man in the coat ----------------
const SC = {skin: '#c9c4bd', skinShade: '#a8a29b', skinDark: '#87817a', coat: '#5d6066', coatShade: '#45484e', coatLight: '#74777e',
  hat: '#2a2a2e', hatBand: '#151518', vest: '#2f7a4c', tee: '#8b8f98', pants: '#24252a', shoe: '#141416', salt: '#e9e6e0'};
export type StasState = {t: number; blink: number; smile: number; coatOpen: number; reach: number; lookX: number; tilt: number; breathe: number};
export const STAS_REST: StasState = {t: 0, blink: 1, smile: 0, coatOpen: 0, reach: 0, lookX: 0, tilt: 0, breathe: 0};

export const Stas: React.FC<{s: StasState; light: TemaLight; id?: string; view?: 'front' | 'back'}> = ({s, light, id = 'stas', view = 'front'}) => {
  const b = s.breathe * 4, hy = -1880 + b * 0.5, sm = clamp(s.smile), op = clamp(s.coatOpen), rc = clamp(s.reach);
  const coat = (o: number) => `M -200 -1640 C -250 -1620 -262 -1540 -258 -1450 L -300 -280 C -200 -250 -60 -250 ${-10 - o * 150} -262 L ${-10 - o * 140} -1200 L -70 -1650 Z`;
  const coatR = (o: number) => `M 200 -1640 C 250 -1620 262 -1540 258 -1450 L 300 -280 C 200 -250 60 -250 ${10 + o * 150} -262 L ${10 + o * 140} -1200 L 70 -1650 Z`;
  const shL = {x: -210, y: -1600 + b}, shR = {x: 210, y: -1600 + b};
  const handR = lp2({x: 260, y: -880}, {x: 120, y: -1050}, rc), elR = lp2({x: 300, y: -1240}, {x: 280, y: -1150}, rc);
  const hat = (
    <g>
      <path d={`M -150 ${hy - 150} C -150 ${hy - 300} 150 ${hy - 300} 150 ${hy - 150} Z`} fill={SC.hat} stroke={INK} strokeWidth={OW} />
      <path d={`M -40 ${hy - 252} Q 0 ${hy - 232} 40 ${hy - 252}`} stroke={SC.hatBand} strokeWidth={10} fill="none" />
      <rect x={-152} y={hy - 196} width={304} height={40} fill={SC.hatBand} stroke={INK} strokeWidth={OW * 0.7} />
      <path d={`M -250 ${hy - 150} C -150 ${hy - 180} 150 ${hy - 180} 250 ${hy - 150} C 150 ${hy - 120} -150 ${hy - 120} -250 ${hy - 150} Z`} fill={SC.hat} stroke={INK} strokeWidth={OW} />
    </g>
  );
  if (view === 'back') {
    return (
      <g>
        <defs><LightFilter id={id} light={light} /></defs>
        <g filter={`url(#${id}-light)`}>
          <path d="M -110 -300 L -100 -60 L -30 -60 L -24 -300 Z M 110 -300 L 100 -60 L 30 -60 L 24 -300 Z" fill={SC.pants} stroke={INK} strokeWidth={OW} />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 22} -6 L ${sd * 22} -70 L ${sd * 170} -70 L ${sd * 176} -6 Z`} fill={SC.shoe} stroke={INK} strokeWidth={OW} />)}
          <Sleeve d={armD(shL, {x: -300, y: -1240}, {x: -260, y: -880})} c={SC.coat} w={84} />
          <Sleeve d={armD(shR, {x: 300, y: -1240}, {x: 260, y: -880})} c={SC.coat} w={84} />
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 260} cy={-872} rx={32} ry={44} fill={SC.skin} stroke={INK} strokeWidth={OW} />)}
          <path d="M -200 -1640 C -250 -1620 -262 -1540 -258 -1450 L -300 -280 C -100 -250 100 -250 300 -280 L 258 -1450 C 262 -1540 250 -1620 200 -1640 C 120 -1670 -120 -1670 -200 -1640 Z" fill={SC.coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M 0 -900 L 0 -270" stroke={SC.coatShade} strokeWidth={10} />
          <path d="M -170 -1100 L 170 -1100" stroke={SC.coatShade} strokeWidth={30} />
          <rect x={-45} y={hy + 120} width={90} height={140} fill={SC.skinShade} stroke={INK} strokeWidth={OW} />
          <ellipse cx={0} cy={hy} rx={125} ry={175} fill="#2b2626" stroke={INK} strokeWidth={OW} />
          {hat}
        </g>
      </g>
    );
  }
  const eye = (sd: number) => {
    const cx = sd * 52 + s.lookX * 6, cy = hy - 10, open = clamp(s.blink);
    return (
      <g key={sd}>
        {/* deep-set: dark sockets, tiny black eyes */}
        <ellipse cx={cx} cy={cy} rx={40} ry={34} fill={SC.skinDark} opacity={0.6} />
        <ellipse cx={cx} cy={cy} rx={22} ry={18 * open} fill="#e8e4dc" stroke={INK} strokeWidth={OW * 0.7} />
        {open > 0.3 && <circle cx={cx + s.lookX * 6} cy={cy} r={7} fill="#050505" />}
      </g>
    );
  };
  const w = lerp(36, 112, sm), my = hy + 100;
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -110 -300 L -100 -60 L -30 -60 L -24 -300 Z M 110 -300 L 100 -60 L 30 -60 L 24 -300 Z" fill={SC.pants} stroke={INK} strokeWidth={OW} />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 20} -8 L ${sd * 20} -70 L ${sd * 160} -70 C ${sd * 220} -60 ${sd * 230} -20 ${sd * 220} -8 Z`} fill={SC.shoe} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        <Sleeve d={armD(shL, {x: -300, y: -1240}, {x: -260, y: -880})} c={SC.coat} w={84} />
        {rc < 0.5 && <Sleeve d={armD(shR, elR, handR)} c={SC.coat} w={84} />}
        {/* under the coat: grey tee, the green shop vest and the badge */}
        <path d="M -150 -1640 L 150 -1640 L 160 -300 L -160 -300 Z" fill={SC.tee} stroke={INK} strokeWidth={OW} />
        <path d="M -160 -1560 L -40 -1300 L -40 -800 L -170 -790 Z M 160 -1560 L 40 -1300 L 40 -800 L 170 -790 Z" fill={SC.vest} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <Badge x={48} y={-1160} name="СТАС" s={0.8} />
        <path d={coat(op)} fill={SC.coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <path d={coatR(op)} fill={SC.coat} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 70} -1650 L ${sd * (130 + op * 120)} -1300 L ${sd * (20 + op * 140)} -1210`} fill={SC.coatLight} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {[-1100, -900, -700].map((y) => <circle key={y} cx={-40 - op * 140} cy={y} r={13} fill={SC.coatShade} stroke={INK} strokeWidth={3} />)}
        <path d="M -258 -1000 L -10 -1000 M 10 -1000 L 258 -1000" stroke={SC.coatShade} strokeWidth={26} opacity={0.8} />
        <rect x={-45} y={hy + 120} width={90} height={140} fill={SC.skinShade} stroke={INK} strokeWidth={OW} />
        {/* long narrow pale face */}
        <g transform={`rotate(${s.tilt} 0 ${hy + 150})`}>
          <ellipse cx={0} cy={hy} rx={120} ry={175} fill={SC.skin} stroke={INK} strokeWidth={OW} />
          <path d={`M -120 ${hy + 20} C -110 ${hy + 120} -70 ${hy + 170} 0 ${hy + 176} C 70 ${hy + 170} 110 ${hy + 120} 120 ${hy + 20}`} fill="none" stroke={SC.skinShade} strokeWidth={18} opacity={0.5} />
          {eye(-1)}{eye(1)}
          <path d={`M -6 ${hy + 10} L -14 ${hy + 60} L 8 ${hy + 62}`} stroke={SC.skinDark} strokeWidth={6} fill="none" strokeLinejoin="round" />
          {sm < 0.05 ? <path d={`M -30 ${my} L 30 ${my}`} stroke={INK} strokeWidth={OW} strokeLinecap="round" /> : (
            <g>
              <path d={`M ${-w} ${my - 46 * sm} Q 0 ${my + 50 * sm} ${w} ${my - 46 * sm} Q 0 ${my + 6 * sm} ${-w} ${my - 46 * sm} Z`} fill="#2a0e12" stroke={INK} strokeWidth={OW * 0.8} strokeLinejoin="round" />
              {sm > 0.4 && <path d={`M ${-w * 0.88} ${my - 38 * sm} Q 0 ${my + 4 * sm} ${w * 0.88} ${my - 38 * sm} L ${w * 0.78} ${my - 22 * sm} Q 0 ${my + 22 * sm} ${-w * 0.78} ${my - 22 * sm} Z`} fill="#ece6d6" stroke={INK} strokeWidth={3} />}
            </g>
          )}
          {hat}
        </g>
        {rc >= 0.5 && <Sleeve d={armD(shR, elR, handR)} c={SC.coat} w={84} />}
        <ellipse cx={-260} cy={-872} rx={32} ry={44} fill={SC.skin} stroke={INK} strokeWidth={OW} />
        {/* long thin fingers */}
        <g transform={`translate(${handR.x} ${handR.y})`}>
          {rc > 0.5 && (
            // the pack of salt
            <g transform="translate(-70 -40)">
              <rect x={-50} y={-80} width={100} height={140} rx={6} fill={SC.salt} stroke={INK} strokeWidth={OW} />
              <rect x={-50} y={-30} width={100} height={40} fill="#3a6db0" />
              <text x={0} y={-2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff">СОЛЬ</text>
            </g>
          )}
          <ellipse cx={0} cy={8} rx={30} ry={44} fill={SC.skin} stroke={INK} strokeWidth={OW} />
          {[-16, -5, 6, 17].map((fx, i) => <rect key={i} x={fx - 6} y={30} width={12} height={70} rx={6} fill={SC.skin} stroke={INK} strokeWidth={OW * 0.7} />)}
        </g>
      </g>
    </g>
  );
};
