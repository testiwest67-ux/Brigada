// «Лишний этаж»: the lift cabin and the landing outside it, as one "world".
// Cabin: x -0.55..0.55, z -0.6 (mirror wall) .. +0.6 (doors), floor y = 0, height 2.2.
// Landing: z 0.7..4.2, x -1.1..1.1; Alisa's flat door in the far wall, facing the lift.
// The mirror is a window into a reflected copy of the whole world (z' = 2·mirrorZ − z), so reflections, the lamp,
// the display and the open doors all show up in it for free. The copy skips the mirror wall itself.
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, glow, matte, rep, std} from '../horror/common';

export const CAB = {w: 1.1, d: 1.2, h: 2.2, gap: 0.8, doorH: 2.0, mirrorZ: -0.6, front: 0.6, mirror: {x: 0.48, y0: 0.3, y1: 2.05}};
export const COR = {x: 1.1, z0: 0.7, z1: 4.2, h: 2.6, door: {w: 0.9, h: 2.04}};
export const MIR = (p: V3): V3 => [p[0], p[1], 2 * CAB.mirrorZ - p[2]];

export type LiftState = {
  t: number;
  lamp: number;      // cabin light 0..1 (flicker is done by the caller)
  doors: number;     // 0 closed .. 1 open
  disp: string;      // floor display text
  dispOn: number;    // display brightness
  btn: number[];     // lit buttons (1..12), 13 = the blank one
  floor: 12 | 13;    // which landing is outside
  apt: number;       // flat door ajar 0..1
  aptLight: number;  // warm light from the flat
  corLamp: number;   // landing lamp 0..1
};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1) =>
  std(`etx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(k, w, h, draw).clone(), rx, ry), roughness: 0.85}));
const dside = (k: string, m: () => THREE.Material) => std(`ds${k}`, m);

// ---------- textures ----------
const laminate = () => tex('lam', 256, 512, (c) => {
  c.fillStyle = '#6a4a33'; c.fillRect(0, 0, 256, 512);
  const r = mulberry32(21);
  for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(40,22,12,${0.1 + r() * 0.2})`; c.lineWidth = 1 + r() * 2; const x = r() * 256; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 10, 170, x - 8, 340, x + 4, 512); c.stroke(); }
  // scratches and kids' graffiti; a tiny "13" scratched in (easter egg)
  c.strokeStyle = 'rgba(230,210,180,0.35)'; c.lineWidth = 1.5;
  for (let i = 0; i < 25; i++) { const x = r() * 256, y = 150 + r() * 300; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 60, y + (r() - 0.5) * 20); c.stroke(); }
  c.fillStyle = 'rgba(20,20,30,0.55)'; c.font = 'bold 28px sans-serif'; c.fillText('ЦОЙ ЖИВ', 40, 250);
  c.fillStyle = 'rgba(235,215,185,0.4)'; c.font = '20px sans-serif'; c.fillText('13', 190, 330);
  c.fillStyle = 'rgba(160,30,30,0.45)'; c.font = 'bold 22px sans-serif'; c.fillText('НЕ ВЫХОДИ', 60, 410);
}, 1, 1);
const steel = () => tex('steel', 128, 256, (c) => {
  c.fillStyle = '#6a6f75'; c.fillRect(0, 0, 128, 256);
  const r = mulberry32(4);
  for (let y = 0; y < 256; y++) { c.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,${r() * 0.05})`; c.fillRect(0, y, 128, 1); }
  for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(40,30,20,${r() * 0.15})`; c.beginPath(); c.ellipse(r() * 128, r() * 256, 3 + r() * 12, 2 + r() * 8, 0, 0, 7); c.fill(); }
});
const rubber = () => tex('rubber', 128, 128, (c) => {
  c.fillStyle = '#1e1e22'; c.fillRect(0, 0, 128, 128);
  c.fillStyle = '#2c2c32'; for (let y = 0; y < 128; y += 16) c.fillRect(0, y, 128, 6);
}, 3, 3);
const paint = () => tex('paint13', 256, 512, (c) => {
  c.fillStyle = '#c9c2ab'; c.fillRect(0, 0, 256, 512);
  c.fillStyle = '#3a5a4c'; c.fillRect(0, 512 * 0.5, 256, 512 * 0.5);
  c.fillStyle = '#24392f'; c.fillRect(0, 512 * 0.5, 256, 6);
  const r = mulberry32(31);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(40,30,15,${0.04 + r() * 0.08})`; c.beginPath(); c.ellipse(r() * 256, r() * 512, 4 + r() * 40, 6 + r() * 50, 0, 0, 7); c.fill(); }
}, 2, 1);
const tiles = () => tex('tiles13', 256, 256, (c) => {
  const r = mulberry32(9);
  for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) { c.fillStyle = (x + y) % 64 ? '#7e5238' : '#b89a74'; c.fillRect(x, y, 32, 32); c.fillStyle = `rgba(0,0,0,${r() * 0.15})`; c.fillRect(x, y, 32, 32); }
  c.strokeStyle = '#2a1c12'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
}, 4, 6);
const aptDoor = (floor: number) => std(`apt${floor}`, () => new THREE.MeshStandardMaterial({roughness: 0.55, map: canvasTex(`apt${floor}`, 256, 512, (c) => {
  c.fillStyle = '#5a2a22'; c.fillRect(0, 0, 256, 512);
  for (let y = 0; y < 512; y += 48) for (let x = 0; x < 256; x += 48) { c.fillStyle = '#a5824e'; c.beginPath(); c.arc(x + 24, y + 24, 3, 0, 7); c.fill(); }
  c.fillStyle = '#c8a25a'; c.fillRect(88, 96, 80, 52);
  c.fillStyle = '#3a2a14'; c.font = 'bold 40px serif'; c.textAlign = 'center';
  if (floor === 12) c.fillText('48', 128, 136);
  else { c.fillStyle = 'rgba(58,42,20,0.5)'; c.fillText('4', 112, 136); c.strokeStyle = '#7a5a30'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(92 + i * 6, 100); c.lineTo(160 - i * 4, 144); c.stroke(); } }
})}));
const display = (txt: string) => std(`disp${txt}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`disp${txt}`, 256, 128, (c) => {
  c.fillStyle = '#080404'; c.fillRect(0, 0, 256, 128);
  c.fillStyle = '#ff2a1a'; c.font = 'bold 96px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = '#ff2a1a'; c.shadowBlur = 18; c.fillText(txt, 128, 70);
})}));
const BTN = {x: CAB.w / 2 - 0.012, z: 0.3, y0: 1.02, dy: 0.062, dz: 0.036};
const btnPos = (n: number): V3 => n === 13 ? [BTN.x - 0.004, BTN.y0 + 6 * BTN.dy + 0.03, BTN.z] : [BTN.x - 0.004, BTN.y0 + Math.floor((n - 1) / 2) * BTN.dy, BTN.z + ((n - 1) % 2 ? BTN.dz : -BTN.dz)];
export const BUTTON = btnPos;
const plate = () => std('btnplate', () => new THREE.MeshStandardMaterial({roughness: 0.5, metalness: 0.4, map: canvasTex('btnplate', 128, 512, (c) => {
  c.fillStyle = '#9aa0a6'; c.fillRect(0, 0, 128, 512);
  // plane local x = world +z, canvas y down = world y down; plate spans y 0.95..1.5 => 512 px
  const py = (y: number) => (1.5 - y) / 0.55 * 512, px = (z: number) => (z - (BTN.z - 0.08)) / 0.16 * 128;
  for (let n = 1; n <= 13; n++) {
    const p = btnPos(n);
    c.fillStyle = '#2a2c30'; c.beginPath(); c.arc(px(p[2]), py(p[1]), 13, 0, 7); c.fill();
    c.fillStyle = '#d8dade'; c.beginPath(); c.arc(px(p[2]), py(p[1]), 10, 0, 7); c.fill();
    if (n < 13) { c.fillStyle = '#1a1a1e'; c.font = 'bold 12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), px(p[2]), py(p[1]) + 1); }
  }
})}));

// ---------- the cabin ----------
const Cabin: React.FC<{S: LiftState; copy?: boolean}> = ({S, copy}) => {
  const {w, d, h, gap, doorH, front, mirror: M} = CAB;
  const z0 = CAB.mirrorZ;
  const lam = laminate(), st = steel();
  const pw = 0.41, open = S.doors;
  const backWall = dside('back', () => new THREE.MeshStandardMaterial({color: '#7d8186', roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide}));
  return (
    <group>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rubber()} receiveShadow><planeGeometry args={[w, d]} /></mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} material={st}><planeGeometry args={[w, d]} /></mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={lam} receiveShadow><planeGeometry args={[d, h]} /></mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={lam} receiveShadow><planeGeometry args={[d, h]} /></mesh>
      {/* handrails */}
      {[-1, 1].map((sd) => <Box key={sd} s={[0.03, 0.03, d - 0.2]} p={[sd * (w / 2 - 0.05), 0.95, 0]} m={matte('#b9bdc2', 0.3)} shadow={false} />)}
      {/* mirror wall: frame around the glass (both sides visible, the camera goes through) */}
      {!copy && (
        <group>
          <mesh position={[0, M.y0 / 2, z0]} material={backWall}><planeGeometry args={[w, M.y0]} /></mesh>
          <mesh position={[0, (M.y1 + h) / 2, z0]} material={backWall}><planeGeometry args={[w, h - M.y1]} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (M.x + (w / 2 - M.x) / 2), h / 2, z0]} material={backWall}><planeGeometry args={[w / 2 - M.x, h]} /></mesh>)}
          {/* frame lips */}
          <Box s={[M.x * 2 + 0.04, 0.025, 0.02]} p={[0, M.y0, z0 + 0.01]} m={matte('#5d6166', 0.3)} shadow={false} />
          <Box s={[M.x * 2 + 0.04, 0.025, 0.02]} p={[0, M.y1, z0 + 0.01]} m={matte('#5d6166', 0.3)} shadow={false} />
          {[-1, 1].map((sd) => <Box key={sd} s={[0.025, M.y1 - M.y0, 0.02]} p={[sd * M.x, (M.y0 + M.y1) / 2, z0 + 0.01]} m={matte('#5d6166', 0.3)} shadow={false} />)}
          {/* the glass: a faint cold tint and smudges */}
          <mesh position={[0, (M.y0 + M.y1) / 2, z0 + 0.002]} material={std('glass', () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex('smudge', 256, 512, (c) => {
            c.clearRect(0, 0, 256, 512); c.fillStyle = 'rgba(150,190,200,0.07)'; c.fillRect(0, 0, 256, 512);
            const r = mulberry32(3);
            for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(220,235,240,${0.03 + r() * 0.05})`; c.beginPath(); c.ellipse(r() * 256, r() * 512, 10 + r() * 40, 4 + r() * 14, r() * 3, 0, 7); c.fill(); }
            for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(230,240,245,0.06)'; c.beginPath(); c.ellipse(60 + i * 40, 300, 14, 20, 0, 0, 7); c.fill(); }
          })}))}><planeGeometry args={[M.x * 2, M.y1 - M.y0]} /></mesh>
        </group>
      )}
      {/* front wall (inside face) around the door gap, header with the floor display */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (gap / 2 + (w / 2 - gap / 2) / 2), h / 2, front]} rotation={[0, Math.PI, 0]} material={st}><planeGeometry args={[w / 2 - gap / 2, h]} /></mesh>)}
      <mesh position={[0, (doorH + h) / 2, front]} rotation={[0, Math.PI, 0]} material={st}><planeGeometry args={[gap, h - doorH]} /></mesh>
      <Box s={[0.2, 0.09, 0.02]} p={[0, doorH + 0.1, front - 0.012]} m={matte('#111', 0.4)} shadow={false} />
      <mesh position={[0, doorH + 0.1, front - 0.023]} rotation={[0, Math.PI, 0]} material={display(S.disp)}>
        <planeGeometry args={[0.18, 0.08]} />
      </mesh>
      {/* sliding door panels */}
      {[-1, 1].map((sd) => <Box key={sd} s={[pw, doorH, 0.02]} p={[sd * (pw / 2 + open * (gap / 2 + 0.01)), doorH / 2, front + 0.02]} m={st} />)}
      <Box s={[0.012, doorH, 0.024]} p={[-(0.004 + open * (gap / 2 + 0.01)), doorH / 2, front + 0.005]} m={matte('#202224', 0.6)} shadow={false} />
      {/* button panel on the right wall */}
      <Box s={[0.02, 0.58, 0.18]} p={[w / 2 - 0.006, 1.22, BTN.z]} m={matte('#6f747a', 0.4)} shadow={false} />
      <mesh position={[w / 2 - 0.0175, 1.225, BTN.z]} rotation={[0, -Math.PI / 2, 0]} material={plate()}><planeGeometry args={[0.16, 0.55]} /></mesh>
      {S.btn.map((n) => (
        <mesh key={n} position={btnPos(n)} rotation={[0, 0, Math.PI / 2]} material={glow(n === 13 ? '#ff3020' : '#ffb347', 2.2)}>
          <cylinderGeometry args={[0.0105, 0.0105, 0.004, 16]} />
        </mesh>
      ))}
      {/* ceiling lamp: a frosted panel */}
      <mesh position={[0, h - 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshBasicMaterial color={new THREE.Color('#d8f2e6').multiplyScalar(0.12 + 1.6 * S.lamp)} toneMapped={false} />
      </mesh>
      <pointLight position={[0, h - 0.15, 0]} color="#cfeee0" intensity={2.4 * S.lamp} distance={4} decay={1.6} />
      <pointLight position={[0, doorH + 0.1, front - 0.15]} color="#ff2a1a" intensity={0.25 * S.dispOn} distance={1.2} decay={2} />
    </group>
  );
};

// ---------- the landing outside ----------
const Landing: React.FC<{S: LiftState}> = ({S}) => {
  const {x: X, z0, z1, h: H, door: D} = COR;
  const p = paint(), thirteen = S.floor === 13;
  const lampCol = thirteen ? '#ff4a2e' : '#ffd7a0';
  const lit = S.corLamp;
  const hinge = -D.w / 2, ang = S.apt * 1.1;
  return (
    <group>
      <mesh position={[0, 0, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={tiles()} receiveShadow><planeGeometry args={[2 * X, z1 - z0]} /></mesh>
      <mesh position={[0, H, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[2 * X, z1 - z0]} /><meshStandardMaterial color="#8f8b7c" roughness={1} /></mesh>
      <mesh position={[-X, H / 2, (z0 + z1) / 2]} rotation={[0, Math.PI / 2, 0]} material={p} receiveShadow><planeGeometry args={[z1 - z0, H]} /></mesh>
      <mesh position={[X, H / 2, (z0 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={p} receiveShadow><planeGeometry args={[z1 - z0, H]} /></mesh>
      {/* lift-side wall with the shaft opening + steel frame */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (CAB.gap / 2 + (X - CAB.gap / 2) / 2), H / 2, z0]} material={p}><planeGeometry args={[X - CAB.gap / 2, H]} /></mesh>)}
      <mesh position={[0, (CAB.doorH + H) / 2, z0]} material={p}><planeGeometry args={[CAB.gap, H - CAB.doorH]} /></mesh>
      {[-1, 1].map((sd) => <Box key={sd} s={[0.06, CAB.doorH + 0.06, 0.04]} p={[sd * (CAB.gap / 2 + 0.03), (CAB.doorH + 0.06) / 2, z0 + 0.02]} m={matte('#55595e', 0.35)} shadow={false} />)}
      <Box s={[CAB.gap + 0.12, 0.06, 0.04]} p={[0, CAB.doorH + 0.03, z0 + 0.02]} m={matte('#55595e', 0.35)} shadow={false} />
      {/* jamb between cabin and landing */}
      {[-1, 1].map((sd) => <Box key={sd} s={[0.02, CAB.doorH, z0 - CAB.front]} p={[sd * (CAB.gap / 2 + 0.01), CAB.doorH / 2, (z0 + CAB.front) / 2]} m={matte('#3c3f43', 0.5)} shadow={false} />)}
      {/* far wall with the flat door */}
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (D.w / 2 + (X - D.w / 2) / 2), H / 2, z1]} rotation={[0, Math.PI, 0]} material={p}><planeGeometry args={[X - D.w / 2, H]} /></mesh>)}
      <mesh position={[0, (D.h + H) / 2, z1]} rotation={[0, Math.PI, 0]} material={p}><planeGeometry args={[D.w, H - D.h]} /></mesh>
      <group position={[hinge, 0, z1 - 0.03]} rotation={[0, -ang, 0]}>
        <Box s={[D.w, D.h, 0.05]} p={[D.w / 2, D.h / 2, 0]} m={aptDoor(S.floor)} />
        <mesh position={[D.w - 0.1, 1.0, -0.035]} material={std('brassE', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85}))}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
      </group>
      {/* the flat behind the door: warm light */}
      <mesh position={[0, 1.2, z1 + 0.9]} rotation={[0, Math.PI, 0]}><planeGeometry args={[2.2, 2.4]} /><meshBasicMaterial color={new THREE.Color('#ffc27a').multiplyScalar(0.15 + 0.9 * S.aptLight)} toneMapped={false} /></mesh>
      {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.6, 1.2, z1 + 0.45]} rotation={[0, -sd * Math.PI / 2, 0]}><planeGeometry args={[0.9, 2.4]} /><meshStandardMaterial color="#8a6a4a" roughness={1} /></mesh>)}
      <pointLight position={[0, 1.4, z1 + 0.5]} color="#ffbb70" intensity={2.2 * S.aptLight * Math.min(1, S.apt * 3)} distance={4} decay={1.6} />
      {/* door mat */}
      <Box s={[0.7, 0.012, 0.45]} p={[0, 0.006, z1 - 0.3]} m={matte(thirteen ? '#3a1612' : '#5a3a26')} shadow={false} />
      {/* neighbours' doors on the side walls */}
      {[-1, 1].map((sd) => <Box key={sd} s={[0.05, 2.0, 0.85]} p={[sd * (X - 0.03), 1.0, 2.5]} m={matte(thirteen ? '#2a1a18' : '#4a3a30', 0.6)} />)}
      {/* ceiling lamp */}
      <mesh position={[0, H - 0.12, 2.4]}><sphereGeometry args={[0.06, 14, 10]} /><meshBasicMaterial color={new THREE.Color(lampCol).multiplyScalar(0.15 + 2.0 * lit)} toneMapped={false} /></mesh>
      <pointLight position={[0, H - 0.3, 2.4]} color={lampCol} intensity={(thirteen ? 2.6 : 3.2) * lit} distance={6} decay={1.5} />
      <Box s={[0.02, 0.1, 0.02]} p={[0, H - 0.05, 2.4]} m={matte('#222')} shadow={false} />
    </group>
  );
};

const World: React.FC<{S: LiftState; copy?: boolean}> = ({S, copy}) => (
  <group>
    <ambientLight color={S.floor === 13 ? '#3a1410' : '#2a2a30'} intensity={0.35} />
    <Cabin S={S} copy={copy} />
    <Landing S={S} />
  </group>
);

// the whole set: the real world + its mirror copy behind the glass
export const LiftSet: React.FC<{S: LiftState; mirror?: boolean}> = ({S, mirror = true}) => (
  <group>
    <World S={S} />
    {mirror && (
      <group position={[0, 0, 2 * CAB.mirrorZ]} scale={[1, 1, -1]}>
        <World S={S} copy />
      </group>
    )}
  </group>
);

// screen-space portals (3D quads) for clipping puppets
export const DOOR_GAP = (open: number): V3[] => {
  const g = (CAB.gap / 2) * open;
  return [[-g, 0, CAB.front], [g, 0, CAB.front], [g, CAB.doorH, CAB.front], [-g, CAB.doorH, CAB.front]];
};
export const MIRROR_QUAD: V3[] = [[-CAB.mirror.x, CAB.mirror.y0, CAB.mirrorZ], [CAB.mirror.x, CAB.mirror.y0, CAB.mirrorZ], [CAB.mirror.x, CAB.mirror.y1, CAB.mirrorZ], [-CAB.mirror.x, CAB.mirror.y1, CAB.mirrorZ]];
