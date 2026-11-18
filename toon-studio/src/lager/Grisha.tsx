// Uncle Grisha, the old camp watchman of «Кто лишний?» (built on Ded Misha from «Лишний этаж»): a quilted padded
// jacket (ватник), a flat cap, grey stubble, a kerosene lantern in the right hand, the left hand counts the rules
// (`fingers` 0..3) or is raised to the lips (`hush`). Puppet units: 1 = 1 mm, origin between the feet, y up negative. ~1.78 m tall.
import React from 'react';
import {clamp, lerp} from '../toon/lib/anim';
import {LightFilter, TemaLight} from '../horror/Tema';

const INK = '#14121c', OW = 7;
const C = {
  skin: '#e2b99a', skinShade: '#c49478', skinDark: '#a2745c', nose: '#d99a84',
  hair: '#c9c6c0', hairShade: '#9e9a92', cap: "#3d3a36", capShade: "#2a2825",
  jacket: "#4e5643", jacketShade: "#3a4132", jacketLight: "#626b55", pants: '#2a2c33', boot: '#1c1a1a',
  torch: '#3a3d42', torchLight: '#fff2c8', keys: '#c9b27a',
};

export type GrishaState = {t: number; blink: number; mouth: number; finger: number; fingers?: number; hush?: number; lookX: number; narrow: number; breathe: number; torch: number}
export const GRISHA_REST: GrishaState = {t: 0, blink: 1, mouth: 0, finger: 0, lookX: 0, narrow: 0.3, breathe: 0, torch: 1};

export const Grisha: React.FC<{s: GrishaState; light: TemaLight; id?: string; view?: "front" | "back"}> = ({s, light, id = "grisha", view = "front"}) => {
  if (view === "back") return <GrishaBack s={s} light={light} id={id} />;
  const b = s.breathe * 5, mo = clamp(s.mouth), fk = clamp(s.finger);
  const hy = -1620 + b * 0.6;
  // left arm (screen left): raised index finger
  const shL = {x: -230, y: -1330 + b};
  const nf = Math.round(clamp((s.fingers ?? 0) / 3) * 3), hu = clamp(s.hush ?? 0);
  const up = Math.max(fk, nf > 0 ? 1 : 0);
  let handL = {x: lerp(-250, -300, up), y: lerp(-760, -1480, up)};
  let elL = {x: lerp(-280, -380, up), y: lerp(-1050, -1200, up)};
  if (hu > 0) { handL = {x: lerp(handL.x, -20, hu), y: lerp(handL.y, hy + 215, hu)}; elL = {x: lerp(elL.x, -300, hu), y: lerp(elL.y, -1150, hu)}; }
  // right arm: holds the torch at the chest, pointing at the viewer
  const shR = {x: 230, y: -1330 + b};
  const handR = {x: 190, y: -1080 + b}, elR = {x: 310, y: -1070};
  const armD = (a: {x: number; y: number}, e: {x: number; y: number}, h: {x: number; y: number}) => `M ${a.x} ${a.y} Q ${(a.x + e.x) / 2 - 10} ${(a.y + e.y) / 2} ${e.x} ${e.y} Q ${(e.x + h.x) / 2} ${(e.y + h.y) / 2} ${h.x} ${h.y}`;
  const sleeve = (d: string) => (
    <>
      <path d={d} stroke={INK} strokeWidth={96 + OW * 2} strokeLinecap="round" fill="none" />
      <path d={d} stroke={C.jacket} strokeWidth={96} strokeLinecap="round" fill="none" />
    </>
  );
  const eye = (sd: number) => {
    const cx = sd * 64 + s.lookX * 4, cy = hy - 22, rx = 30, ry = 24 * (1 - s.narrow * 0.35);
    const open = clamp(s.blink), lid = cy - ry + (1 - open) * ry * 2;
    return (
      <g key={sd}>
        <clipPath id={`${id}-e${sd}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#efe9e0" />
        <g clipPath={`url(#${id}-e${sd})`}>
          <circle cx={cx + s.lookX * 10} cy={cy + 2} r={15} fill="#5b6a74" />
          <circle cx={cx + s.lookX * 10} cy={cy + 2} r={8} fill="#0d0f19" />
          <circle cx={cx + s.lookX * 10 - 5} cy={cy - 4} r={4} fill="#fff" />
          <rect x={cx - rx - 4} y={cy - ry - 6} width={rx * 2 + 8} height={Math.max(0, lid - (cy - ry - 6))} fill={C.skinShade} />
        </g>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={OW * 0.8} />
        <path d={`M ${cx - rx} ${cy + ry + 8} Q ${cx} ${cy + ry + 24} ${cx + rx} ${cy + ry + 8}`} stroke={C.skinDark} strokeWidth={5} fill="none" />
        {/* bushy brow */}
        <path d={`M ${cx - sd * 40} ${cy - 40 + s.narrow * 8} Q ${cx} ${cy - 66} ${cx + sd * 46} ${cy - 46}`} stroke={C.hair} strokeWidth={26} strokeLinecap="round" fill="none" />
        <path d={`M ${cx - sd * 40} ${cy - 40 + s.narrow * 8} Q ${cx} ${cy - 66} ${cx + sd * 46} ${cy - 46}`} stroke={C.hairShade} strokeWidth={6} strokeDasharray="8 10" fill="none" />
      </g>
    );
  };
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        {/* legs + boots */}
        <path d="M -150 -830 L -140 -60 L -20 -60 L -12 -830 Z M 150 -830 L 140 -60 L 20 -60 L 12 -830 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 10} -10 L ${sd * 10} -80 L ${sd * 150} -80 C ${sd * 200} -70 ${sd * 210} -30 ${sd * 200} -10 Z`} fill={C.boot} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {sleeve(armD(shL, elL, handL))}
        {/* jacket */}
        <g transform={`translate(0 ${b * 0.5})`}>
          <path d="M -230 -1345 C -280 -1320 -290 -1240 -285 -1150 L -270 -800 C -180 -770 180 -770 270 -800 L 285 -1150 C 290 -1240 280 -1320 230 -1345 C 140 -1380 -140 -1380 -230 -1345 Z" fill={C.jacket} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d="M 0 -1360 L 0 -790" stroke={C.jacketShade} strokeWidth={8} />
          {[-1, 1].map((sd) => <rect key={sd} x={sd > 0 ? 60 : -200} y={-1180} width={140} height={110} rx={10} fill={C.jacketShade} stroke={INK} strokeWidth={OW * 0.7} />)}
          {[-1, 1].map((sd) => <rect key={`l${sd}`} x={sd > 0 ? 70 : -210} y={-960} width={140} height={120} rx={10} fill={C.jacketShade} stroke={INK} strokeWidth={OW * 0.7} />)}
          {/* quilting of the padded jacket */}
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={`q${k}`} d={`M -276 ${-1260 + k * 70} L 276 ${-1260 + k * 70}`} stroke={C.jacketShade} strokeWidth={6} opacity={0.8} />)}
          {/* collar */}
          <path d="M -120 -1365 L -40 -1250 L 0 -1330 L 40 -1250 L 120 -1365 C 60 -1395 -60 -1395 -120 -1365 Z" fill={C.jacketLight} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {/* belt + keys */}
          <rect x={-272} y={-830} width={544} height={40} fill="#1e1c1a" stroke={INK} strokeWidth={OW * 0.7} />
          <circle cx={-150} cy={-770} r={30} fill="none" stroke={C.keys} strokeWidth={8} />
          {[-1, 0, 1].map((k) => <path key={k} d={`M ${-150 + k * 14} -742 l ${k * 10} 60`} stroke={C.keys} strokeWidth={9} strokeLinecap="round" />)}
        </g>
        {/* neck + head */}
        <rect x={-58} y={hy + 150} width={116} height={110} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
        <g>
          {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 168} cy={hy} rx={28} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
          <ellipse cx={0} cy={hy} rx={160} ry={185} fill={C.skin} stroke={INK} strokeWidth={OW} />
          {/* grey hair at the temples */}
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 158} ${hy - 30} C ${sd * 176} ${hy - 90} ${sd * 150} ${hy - 130} ${sd * 120} ${hy - 140} L ${sd * 140} ${hy - 20} Z`} fill={C.hair} stroke={INK} strokeWidth={OW * 0.8} />)}
          {/* wrinkles */}
          {[0, 1, 2].map((k) => <path key={k} d={`M -80 ${hy - 110 + k * 18} Q 0 ${hy - 122 + k * 18} 80 ${hy - 110 + k * 18}`} stroke={C.skinDark} strokeWidth={5} fill="none" opacity={0.7} />)}
          {eye(-1)}{eye(1)}
          {/* grey stubble */}
          <path d={`M -150 ${hy + 30} C -150 ${hy + 170} -60 ${hy + 190} 0 ${hy + 190} C 60 ${hy + 190} 150 ${hy + 170} 150 ${hy + 30} C 120 ${hy + 140} -120 ${hy + 140} -150 ${hy + 30} Z`} fill="#b3aca2" opacity={0.55} />
          {/* nose */}
          <ellipse cx={0} cy={hy + 26} rx={36} ry={42} fill={C.nose} stroke={INK} strokeWidth={OW} />
          <ellipse cx={-10} cy={hy + 12} rx={10} ry={8} fill="#fff" opacity={0.35} />
          {/* mouth under the moustache */}
          <ellipse cx={0} cy={hy + 104} rx={34} ry={6 + 26 * mo} fill="#3b141a" stroke={INK} strokeWidth={OW * 0.8} />
          {/* moustache */}
          <path d={`M 0 ${hy + 62} C -40 ${hy + 50} -110 ${hy + 60} -130 ${hy + 110 - mo * 6} C -100 ${hy + 100} -50 ${hy + 96 - mo * 10} 0 ${hy + 84 - mo * 8} C 50 ${hy + 96 - mo * 10} 100 ${hy + 100} 130 ${hy + 110 - mo * 6} C 110 ${hy + 60} 40 ${hy + 50} 0 ${hy + 62} Z`}
            fill={C.hair} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {/* cap */}
          <path d={`M -168 ${hy - 70} C -180 ${hy - 220} -90 ${hy - 250} 0 ${hy - 250} C 90 ${hy - 250} 180 ${hy - 220} 168 ${hy - 70} Z`} fill={C.cap} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M -186 ${hy - 64} C -120 ${hy - 104} 120 ${hy - 104} 186 ${hy - 64} C 150 ${hy - 40} -150 ${hy - 40} -186 ${hy - 64} Z`} fill={C.capShade} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          <path d={`M -120 ${hy - 200} C -60 ${hy - 236} 60 ${hy - 236} 120 ${hy - 200}`} stroke="#3e4a6e" strokeWidth={10} fill="none" />
        </g>
        {/* right arm in front with the torch */}
        {sleeve(armD(shR, elR, handR))}
        <g transform={`translate(${handR.x} ${handR.y})`}>
          {/* kerosene lantern hanging from the fist */}
          <circle cx={0} cy={180} r={lerp(60, 220, s.torch)} fill="#ffcf7a" opacity={0.18 * s.torch} />
          <path d="M -50 40 Q 0 -20 50 40" stroke="#2a2a2a" strokeWidth={8} fill="none" />
          <rect x={-60} y={40} width={120} height={30} rx={8} fill="#5a4a36" stroke={INK} strokeWidth={OW} />
          <path d="M -50 70 C -80 140 -80 220 -50 280 L 50 280 C 80 220 80 140 50 70 Z" fill={`rgba(255,214,130,${0.35 + 0.55 * s.torch})`} stroke={INK} strokeWidth={OW} />
          <path d="M -12 230 C -20 200 0 160 0 150 C 0 160 20 200 12 230 Z" fill="#ff9a3a" opacity={s.torch} />
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 50} 70 L ${sd * 50} 280`} stroke="#3a3a3a" strokeWidth={8} />)}
          <rect x={-70} y={280} width={140} height={40} rx={8} fill="#5a4a36" stroke={INK} strokeWidth={OW} />
          <ellipse cx={0} cy={0} rx={44} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />
        </g>
        {/* left hand with the raised finger */}
        <g transform={`translate(${handL.x} ${handL.y})`}>
          <ellipse cx={0} cy={0} rx={44} ry={48} fill={C.skin} stroke={INK} strokeWidth={OW} />
          {(nf > 0 ? [-30, 0, 30].slice(0, nf) : [0]).map((fx, i) => {
            const on = nf > 0 || fk > 0.5 || hu > 0.5;
            return <rect key={i} x={fx - 13} y={on ? -120 : -20} width={26} height={on ? 100 : 40} rx={13} fill={C.skin} stroke={INK} strokeWidth={OW * 0.8} transform={`rotate(${(fx / 30) * 8})`} />;
          })}
          <path d="M -30 14 Q 0 30 30 14" stroke={C.skinDark} strokeWidth={5} fill="none" />
        </g>
      </g>
    </g>
  );
};

// ---------- the machine room ----------

// seen from behind: padded jacket, cap, grey nape, the lantern swinging at the right side
const GrishaBack: React.FC<{s: GrishaState; light: TemaLight; id: string}> = ({s, light, id}) => {
  const b = s.breathe * 5, hy = -1620 + b * 0.6;
  const arm = (sd: number) => `M ${sd * 230} ${-1330 + b} Q ${sd * 290} -1200 ${sd * 290} -1060 Q ${sd * 280} -900 ${sd * 250} -780`;
  return (
    <g>
      <defs><LightFilter id={id} light={light} /></defs>
      <g filter={`url(#${id}-light)`}>
        <path d="M -150 -830 L -140 -60 L -20 -60 L -12 -830 Z M 150 -830 L 140 -60 L 20 -60 L 12 -830 Z" fill={C.pants} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 10} -10 L ${sd * 10} -80 L ${sd * 150} -80 C ${sd * 180} -70 ${sd * 186} -30 ${sd * 176} -10 Z`} fill={C.boot} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />)}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={arm(sd)} stroke={INK} strokeWidth={96 + OW * 2} strokeLinecap="round" fill="none" />
            <path d={arm(sd)} stroke={C.jacket} strokeWidth={96} strokeLinecap="round" fill="none" />
          </g>
        ))}
        <g transform={`translate(0 ${b * 0.5})`}>
          <path d="M -230 -1345 C -280 -1320 -290 -1240 -285 -1150 L -270 -800 C -180 -770 180 -770 270 -800 L 285 -1150 C 290 -1240 280 -1320 230 -1345 C 140 -1380 -140 -1380 -230 -1345 Z" fill={C.jacket} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <path key={k} d={`M -276 ${-1260 + k * 70} L 276 ${-1260 + k * 70}`} stroke={C.jacketShade} strokeWidth={6} opacity={0.8} />)}
          <rect x={-272} y={-830} width={544} height={40} fill="#1e1c1a" stroke={INK} strokeWidth={OW * 0.7} />
        </g>
        <rect x={-58} y={hy + 150} width={116} height={110} fill={C.skinShade} stroke={INK} strokeWidth={OW} />
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 168} cy={hy} rx={28} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />)}
        <ellipse cx={0} cy={hy} rx={160} ry={185} fill={C.hair} stroke={INK} strokeWidth={OW} />
        <path d={`M -168 ${hy - 70} C -180 ${hy - 220} -90 ${hy - 250} 0 ${hy - 250} C 90 ${hy - 250} 180 ${hy - 220} 168 ${hy - 70} C 100 ${hy - 40} -100 ${hy - 40} -168 ${hy - 70} Z`} fill={C.cap} stroke={INK} strokeWidth={OW} strokeLinejoin="round" />
        <g transform="translate(250 -780)">
          <circle cx={0} cy={180} r={lerp(60, 220, s.torch)} fill="#ffcf7a" opacity={0.18 * s.torch} />
          <path d="M -50 40 Q 0 -20 50 40" stroke="#2a2a2a" strokeWidth={8} fill="none" />
          <path d="M -50 70 C -80 140 -80 220 -50 280 L 50 280 C 80 220 80 140 50 70 Z" fill={`rgba(255,214,130,${0.35 + 0.55 * s.torch})`} stroke={INK} strokeWidth={OW} />
          <rect x={-70} y={280} width={140} height={40} rx={8} fill="#5a4a36" stroke={INK} strokeWidth={OW} />
          <ellipse cx={0} cy={0} rx={44} ry={46} fill={C.skin} stroke={INK} strokeWidth={OW} />
        </g>
      </g>
    </g>
  );
};
