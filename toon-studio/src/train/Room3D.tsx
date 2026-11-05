// Kostya's room in the morning: a small 3D room. Floor y = 0, x -1.8..1.8, z -1.8..1.8, ceiling 2.6.
// Back wall (z -1.8): the window, wide open, grey rainy morning outside, the curtains moving.
// Left wall: the bed (pillow at the window end), the blanket thrown back. Right wall: the door to the hallway
// (mom hugs him there). A desk, a poster with a lightning bolt (his pin), headphones on the desk.
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, matte, rep, std} from '../horror/common';

export const ROOM = {x0: -1.8, x1: 1.8, z0: -1.8, z1: 1.8, h: 2.6};
export const RWIN = {x0: -0.9, x1: 0.5, y0: 0.9, y1: 2.2};
export const BED = {x0: -1.8, x1: -0.85, z0: -1.75, z1: 0.35, h: 0.5};
export const PILLOW: V3 = [-1.33, BED.h + 0.08, -1.45];
export const RDOOR = {z0: 0.3, z1: 1.2, h: 2.05};
export const RSPOT = {doorIn: [1.2, 0, 0.75] as V3, doorOut: [2.3, 0, 0.75] as V3, mid: [0.4, 0, 0.6] as V3};

export type RoomState = {t: number; wind: number; light: number; rain: number; door: number; ticket: number};
export const ROOM_REST: RoomState = {t: 0, wind: 0.6, light: 1, rain: 1, door: 1, ticket: 1};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.85) =>
  std(`rtx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`r${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));
const wallpaper = () => tex('wallp', 128, 128, (c) => {
  c.fillStyle = '#c9c2ae'; c.fillRect(0, 0, 128, 128);
  c.fillStyle = 'rgba(120,100,70,0.18)';
  for (let y = 0; y < 128; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < 128; x += 32) { c.beginPath(); c.ellipse(x + 8, y + 8, 4, 7, 0, 0, 7); c.fill(); }
}, 6, 3);
const parquet = () => tex('parq', 128, 128, (c) => {
  const r = mulberry32(4);
  for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 64) {
    c.fillStyle = `rgb(${120 + r() * 30},${80 + r() * 20},${48 + r() * 12})`; c.fillRect(x + ((y / 16) % 2 ? 32 : 0), y, 64, 16);
    c.strokeStyle = 'rgba(40,24,10,0.5)'; c.strokeRect(x + ((y / 16) % 2 ? 32 : 0), y, 64, 16);
  }
}, 4, 4, 0.6);
const blanket = () => tex('blanket', 128, 128, (c) => {
  c.fillStyle = '#3b5a8a'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = 'rgba(240,230,200,0.5)'; c.lineWidth = 4;
  for (let i = 0; i < 128; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); }
}, 2, 2);
const poster = () => std('rposter', () => new THREE.MeshBasicMaterial({map: canvasTex('rposter', 128, 180, (c) => {
  c.fillStyle = '#1d2233'; c.fillRect(0, 0, 128, 180);
  c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(74, 20); c.lineTo(34, 96); c.lineTo(62, 96); c.lineTo(50, 160); c.lineTo(96, 76); c.lineTo(66, 76); c.closePath(); c.fill();
})}));
const outside = (rain: number) => std(`rout${Math.round(rain * 3)}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`rout${Math.round(rain * 3)}`, 256, 256, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#9aa4ae'); g.addColorStop(1, '#5c646e'); c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  c.fillStyle = '#4a525c'; c.fillRect(0, 150, 90, 106); c.fillRect(170, 120, 86, 136);
  c.fillStyle = '#d9c890'; for (let k = 0; k < 6; k++) c.fillRect(186 + (k % 3) * 22, 140 + Math.floor(k / 3) * 40, 10, 14);
  const r = mulberry32(8); c.strokeStyle = 'rgba(220,230,240,0.45)'; c.lineWidth = 1;
  for (let i = 0; i < 120 * rain; i++) { const x = r() * 256, y = r() * 256; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y + 14); c.stroke(); }
})}));

export const RoomSet: React.FC<{S: RoomState}> = ({S}) => {
  const {x0, x1, z0, z1, h} = ROOM;
  const wall = wallpaper();
  const sway = Math.sin(S.t * 2.1) * 0.5 + Math.sin(S.t * 3.7 + 1) * 0.3;
  return (
    <group>
      <ambientLight color="#8a9098" intensity={0.55 * S.light} />
      <directionalLight position={[-0.2, 2.4, -3]} color="#c8d2dc" intensity={1.3 * S.light} />
      <pointLight position={[0, 2.3, 0.3]} color="#ffe4c0" intensity={0.5 * S.light} distance={5} decay={1.5} />
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={parquet()} receiveShadow><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} material={matte('#e6e2d8')}><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      {/* back wall with the window hole */}
      <mesh position={[(x0 + RWIN.x0) / 2, h / 2, z0]} material={wall}><planeGeometry args={[RWIN.x0 - x0, h]} /></mesh>
      <mesh position={[(RWIN.x1 + x1) / 2, h / 2, z0]} material={wall}><planeGeometry args={[x1 - RWIN.x1, h]} /></mesh>
      <mesh position={[(RWIN.x0 + RWIN.x1) / 2, RWIN.y0 / 2, z0]} material={wall}><planeGeometry args={[RWIN.x1 - RWIN.x0, RWIN.y0]} /></mesh>
      <mesh position={[(RWIN.x0 + RWIN.x1) / 2, (RWIN.y1 + h) / 2, z0]} material={wall}><planeGeometry args={[RWIN.x1 - RWIN.x0, h - RWIN.y1]} /></mesh>
      <mesh position={[(RWIN.x0 + RWIN.x1) / 2, (RWIN.y0 + RWIN.y1) / 2, z0 - 1.5]} material={outside(S.rain)}><planeGeometry args={[3.2, 3]} /></mesh>
      {/* the window frame, both casements swung open into the room */}
      <Box s={[RWIN.x1 - RWIN.x0 + 0.2, 0.06, 0.3]} p={[(RWIN.x0 + RWIN.x1) / 2, RWIN.y0 - 0.03, z0 + 0.1]} m={matte('#efece4', 0.4)} />
      {[[RWIN.x0, -1], [RWIN.x1, 1]].map(([x, sd]) => (
        <group key={sd} position={[x, (RWIN.y0 + RWIN.y1) / 2, z0]} rotation={[0, sd * (1.1 + Math.sin(S.t * 1.7 + sd) * 0.05 * S.wind), 0]}>
          <Box s={[(RWIN.x1 - RWIN.x0) / 2, RWIN.y1 - RWIN.y0, 0.04]} p={[-sd * (RWIN.x1 - RWIN.x0) / 4, 0, 0]} m={std('rcase', () => new THREE.MeshStandardMaterial({color: '#dfe6ea', transparent: true, opacity: 0.35}))} shadow={false} />
        </group>
      ))}
      {/* wet sill: a puddle */}
      <mesh position={[(RWIN.x0 + RWIN.x1) / 2 - 0.1, RWIN.y0 + 0.003, z0 + 0.14]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.22, 20]} /><meshStandardMaterial color="#7e9cb4" roughness={0.05} metalness={0.4} /></mesh>
      {/* curtains blowing in */}
      {[RWIN.x0 - 0.15, RWIN.x1 + 0.15].map((x, i) => (
        <mesh key={x} position={[x, 1.45, z0 + 0.2 + S.wind * 0.18 * (0.6 + sway * (i ? -0.5 : 0.5))]} rotation={[S.wind * 0.25 * (0.6 + sway * 0.4), 0, 0]}>
          <planeGeometry args={[0.45, 2.2, 1, 6]} /><meshStandardMaterial color="#e8dcc0" side={THREE.DoubleSide} roughness={0.9} />
        </mesh>
      ))}
      {/* side walls; the right one with the door to the hallway */}
      <mesh position={[x0, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wall}><planeGeometry args={[z1 - z0, h]} /></mesh>
      <mesh position={[x1, h / 2, (z0 + RDOOR.z0) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[RDOOR.z0 - z0, h]} /></mesh>
      <mesh position={[x1, h / 2, (RDOOR.z1 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[z1 - RDOOR.z1, h]} /></mesh>
      <mesh position={[x1, (RDOOR.h + h) / 2, (RDOOR.z0 + RDOOR.z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[RDOOR.z1 - RDOOR.z0, h - RDOOR.h]} /></mesh>
      <mesh position={[0, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[x1 - x0, h]} /></mesh>
      {/* the hallway behind the door: warm light */}
      <mesh position={[x1 + 1.2, h / 2, (RDOOR.z0 + RDOOR.z1) / 2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[3, h]} /><meshStandardMaterial color="#b89a74" /></mesh>
      <mesh position={[x1 + 0.6, 0.001, (RDOOR.z0 + RDOOR.z1) / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.2, 1.6]} /><meshStandardMaterial color="#7a5a3a" /></mesh>
      <pointLight position={[x1 + 0.8, 2.1, (RDOOR.z0 + RDOOR.z1) / 2]} color="#ffd29a" intensity={1.4} distance={3} decay={1.5} />
      <group position={[x1, 0, RDOOR.z0]} rotation={[0, -S.door * 1.4, 0]}>
        <Box s={[0.04, RDOOR.h, RDOOR.z1 - RDOOR.z0]} p={[0, RDOOR.h / 2, (RDOOR.z1 - RDOOR.z0) / 2]} m={matte('#efe8d8', 0.5)} />
      </group>
      {/* bed */}
      <Box s={[BED.x1 - BED.x0, 0.3, BED.z1 - BED.z0]} p={[(BED.x0 + BED.x1) / 2, 0.15, (BED.z0 + BED.z1) / 2]} m={matte('#6a4a30', 0.6)} />
      <Box s={[BED.x1 - BED.x0 - 0.04, 0.18, BED.z1 - BED.z0 - 0.04]} p={[(BED.x0 + BED.x1) / 2, 0.39, (BED.z0 + BED.z1) / 2]} m={matte('#ece8e0', 0.9)} />
      <Box s={[BED.x1 - BED.x0, 0.7, 0.06]} p={[(BED.x0 + BED.x1) / 2, 0.35, BED.z0 - 0.03]} m={matte('#6a4a30', 0.6)} />
      <mesh position={PILLOW} scale={[1, 0.35, 0.6]}><sphereGeometry args={[0.36, 18, 12]} /><meshStandardMaterial color="#f2efe8" roughness={0.95} /></mesh>
      {/* a dent in the pillow + a wet stain */}
      <mesh position={[PILLOW[0], PILLOW[1] + 0.115, PILLOW[2] + 0.02]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.12, 18]} /><meshStandardMaterial color="#c9ccd0" roughness={0.6} transparent opacity={0.6} /></mesh>
      {/* the blanket thrown back toward the foot of the bed, wet dark patches */}
      <mesh position={[(BED.x0 + BED.x1) / 2, 0.52, -0.05]} rotation={[-Math.PI / 2 + 0.05, 0, 0.04]} material={blanket()}><planeGeometry args={[BED.x1 - BED.x0 + 0.1, 0.9, 6, 6]} /></mesh>
      <mesh position={[(BED.x0 + BED.x1) / 2 + 0.05, 0.6, -0.42]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.12, BED.x1 - BED.x0 + 0.08, 14]} /><meshStandardMaterial color="#35527e" roughness={0.9} /></mesh>
      {/* desk with his headphones and a lamp */}
      <Box s={[0.9, 0.05, 0.55]} p={[1.25, 0.74, -1.45]} m={matte('#8a6a48', 0.6)} />
      {[-1, 1].map((sd) => <Box key={sd} s={[0.05, 0.72, 0.5]} p={[1.25 + sd * 0.4, 0.36, -1.45]} m={matte('#6a4a30', 0.6)} />)}
      <mesh position={[1.1, 0.83, -1.4]} rotation={[0.3, 0, 0]}><torusGeometry args={[0.1, 0.018, 8, 20, Math.PI]} /><meshStandardMaterial color="#1b1c22" /></mesh>
      <mesh position={[1.5, 0.95, -1.55]}><coneGeometry args={[0.1, 0.12, 14, 1, true]} /><meshStandardMaterial color="#2a3a5a" side={THREE.DoubleSide} /></mesh>
      <mesh position={[1.25, 1.55, z0 + 0.005]} material={poster()}><planeGeometry args={[0.42, 0.6]} /></mesh>
    </group>
  );
};
