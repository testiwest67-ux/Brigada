// Ded Misha, the old lift mechanic (flashback, sepia), and his machine room under the building:
// the hoisting drum with its cables going up, the motor, a control cabinet, one bulb.
// Puppet units: 1 = 1 mm, origin between the feet, y up negative. ~1.78 m tall.
import React from 'react';
import * as THREE from 'three';
import {clamp, lerp, mulberry32} from '../toon/lib/anim';
import {canvasTex} from '../toon/three/toon3d';
import {LightFilter, TemaLight} from '../horror/Tema';
import {Box, matte, rep, std} from '../horror/common';

const INK = '#14121c', OW = 7;
const C = {
  skin: '#e2b99a', skinShade: '#c49478', skinDark: '#a2745c', nose: '#d99a84',
  hair: '#c9c6c0', hairShade: '#9e9a92', cap: '#2c3550', capShade: '#1e253a',
  jacket: '#33507a', jacketShade: '#25395a', jacketLight: '#46679a', pants: '#2a2c33', boot: '#1c1a1a',
  torch: '#3a3d42', torchLight: '#fff2c8', keys: '#c9b27a',
};

export type MishaState = {t: number; blink: number; mouth: number; finger: number; lookX: number; narrow: number; breathe: number; torch: number};

export const Misha: React.FC<{s: MishaState; light: TemaLight; id?: string}> = ({s, light, id = 'misha'}) => {
  const b = s.breathe * 5, mo = clamp(s.mouth), fk = clamp(s.finger);
  const hy = -1620 + b * 0.6;
  // left arm (screen left): raised index finger
  const shL = {x: -230, y: -1330 + b};
  const handL = {x: lerp(-250, -230, fk), y: lerp(-760, -1720, fk)};
  const elL = {x: lerp(-280, -330, fk), y: lerp(-1050, -1380, fk)};
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
          <rect x={-40} y={-30} width={150} height={60} rx={14} fill={C.torch} stroke={INK} strokeWidth={OW} transform="rotate(-20)" />
          <ellipse cx={-20} cy={0} rx={42} ry={44} fill={C.skin} stroke={INK} strokeWidth={OW} />
          <circle cx={128} cy={-46} r={26} fill={new THREE.Color(C.torchLight).multiplyScalar(0.6 + 0.4 * s.torch).getStyle()} stroke={INK} strokeWidth={OW} />
        </g>
        {/* left hand with the raised finger */}
        <g transform={`translate(${handL.x} ${handL.y})`}>
          <ellipse cx={0} cy={0} rx={44} ry={48} fill={C.skin} stroke={INK} strokeWidth={OW} />
          <rect x={-14} y={lerp(-20, -110, fk)} width={28} height={lerp(40, 100, fk)} rx={14} fill={C.skin} stroke={INK} strokeWidth={OW * 0.8} />
          <path d="M -30 14 Q 0 30 30 14" stroke={C.skinDark} strokeWidth={5} fill="none" />
        </g>
      </g>
    </g>
  );
};

// ---------- the machine room ----------
export const MACH = {drum: [0.7, 1.15, -1.3] as [number, number, number], misha: [-0.25, 0, -0.55] as [number, number, number], bulb: [-0.4, 2.55, -0.6] as [number, number, number]};
const concrete = () => std('concreteM', () => new THREE.MeshStandardMaterial({roughness: 0.95, map: rep(canvasTex('concreteM', 256, 256, (c) => {
  c.fillStyle = '#6d675c'; c.fillRect(0, 0, 256, 256);
  const r = mulberry32(17);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(${r() > 0.5 ? 30 : 140},${r() > 0.5 ? 25 : 130},20,${r() * 0.12})`; c.fillRect(r() * 256, r() * 256, 1 + r() * 4, 1 + r() * 4); }
  for (let i = 0; i < 10; i++) { c.fillStyle = `rgba(30,25,15,${0.05 + r() * 0.08})`; c.beginPath(); c.ellipse(r() * 256, r() * 256, 10 + r() * 50, 20 + r() * 60, 0, 0, 7); c.fill(); }
}).clone(), 3, 2)}));

export const Machine3D: React.FC<{t: number; torch: number}> = ({t, torch}) => {
  const [dx, dy, dz] = MACH.drum;
  const spin = t * 1.4;
  const cm = concrete();
  return (
    <group>
      <ambientLight color="#4a4030" intensity={0.3} />
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={cm} receiveShadow><planeGeometry args={[6, 5]} /></mesh>
      <mesh position={[0, 1.6, -2.2]} material={cm} receiveShadow><planeGeometry args={[6, 3.2]} /></mesh>
      <mesh position={[-2.2, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} material={cm}><planeGeometry args={[5, 3.2]} /></mesh>
      <mesh position={[2.2, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]} material={cm}><planeGeometry args={[5, 3.2]} /></mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={cm}><planeGeometry args={[6, 5]} /></mesh>
      {/* hoisting drum on a frame + cables going up into the shaft */}
      <group position={[dx, dy, dz]}>
        <mesh rotation={[spin, 0, Math.PI / 2]} material={matte('#4a4f55', 0.45)} castShadow><cylinderGeometry args={[0.42, 0.42, 0.55, 28]} /></mesh>
        {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.3, 0, 0]} rotation={[spin, 0, Math.PI / 2]} material={matte('#2e3236', 0.4)} castShadow><cylinderGeometry args={[0.5, 0.5, 0.05, 28]} /></mesh>)}
        {[0, 1, 2, 3, 4, 5].map((k) => <mesh key={k} position={[0, Math.sin(spin + k) * 0.36, Math.cos(spin + k) * 0.36]} rotation={[spin + k, 0, Math.PI / 2]} material={matte('#6a6f75', 0.4)}><boxGeometry args={[0.04, 0.56, 0.04]} /></mesh>)}
      </group>
      {[-0.12, 0, 0.12].map((ox) => <mesh key={ox} position={[dx + ox, (dy + 0.42 + 3.2) / 2, dz]} material={matte('#25272a', 0.3)}><cylinderGeometry args={[0.012, 0.012, 3.2 - dy - 0.42, 6]} /></mesh>)}
      <Box s={[1.1, 0.12, 0.7]} p={[dx, 0.06, dz]} m={matte('#3a3d40', 0.5)} />
      {[-1, 1].map((sd) => <Box key={sd} s={[0.08, dy, 0.5]} p={[dx + sd * 0.42, dy / 2, dz]} m={matte('#5a4a2a', 0.6)} />)}
      {/* motor */}
      <mesh position={[dx - 0.95, 0.55, dz]} rotation={[0, 0, Math.PI / 2]} material={matte('#3c5a48', 0.5)} castShadow><cylinderGeometry args={[0.3, 0.3, 0.7, 24]} /></mesh>
      <Box s={[0.6, 0.2, 0.55]} p={[dx - 0.95, 0.12, dz]} m={matte('#2c2e30', 0.6)} />
      {/* control cabinet with dials */}
      <Box s={[0.8, 1.4, 0.3]} p={[-1.4, 1.0, -2.0]} m={matte('#4d5550', 0.6)} />
      {[0, 1, 2].map((k) => <mesh key={k} position={[-1.65 + k * 0.25, 1.35, -1.84]}><circleGeometry args={[0.07, 20]} /><meshBasicMaterial color="#e8dcc0" /></mesh>)}
      <mesh position={[-1.4, 0.95, -1.84]}><circleGeometry args={[0.03, 12]} /><meshBasicMaterial color={new THREE.Color('#ff3a20').multiplyScalar(2)} toneMapped={false} /></mesh>
      {/* one bare bulb */}
      <mesh position={MACH.bulb}><sphereGeometry args={[0.05, 12, 10]} /><meshBasicMaterial color={new THREE.Color('#ffe2a0').multiplyScalar(2.2)} toneMapped={false} /></mesh>
      <mesh position={[MACH.bulb[0], (MACH.bulb[1] + 3.2) / 2, MACH.bulb[2]]}><cylinderGeometry args={[0.004, 0.004, 3.2 - MACH.bulb[1], 4]} /><meshBasicMaterial color="#111" /></mesh>
      <pointLight position={MACH.bulb} color="#ffd59a" intensity={3.2} distance={7} decay={1.5} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      {/* the torch beam lights the kids from Misha's side */}
      <pointLight position={[MACH.misha[0] + 0.25, 1.1, MACH.misha[2] + 0.45]} color="#fff0c8" intensity={2.2 * torch} distance={3.5} decay={1.6} />
    </group>
  );
};
