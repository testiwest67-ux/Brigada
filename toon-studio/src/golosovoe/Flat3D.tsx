// «Диана, кто дома?»: Kostya's rented one-room flat, built for this short. Floor y = 0, x -2..2, z -2..2, ceiling 2.7.
// Back wall (z -2): a big window with curtains, the night city and the moon outside, rain on the glass.
// Left: a double bed with a headboard against the back wall (x -2..-0.55, z -2..0.15), two pillows, a duvet
// (`lump` — a second shape under it, the easter egg), a nightstand with a REAL lamp (base, stem, shade, bulb).
// Right: a desk with the speaker «Диана», a closed laptop, books, a mug; a wardrobe; the door to the hallway.
// A rug, framed pictures, a shelf, baseboards, a ceiling lamp (off). Moonlight through the window.
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, glow, matte, rep, std} from '../horror/common';

export const FLAT = {x0: -2, x1: 2, z0: -2, z1: 2, h: 2.7};
export const BED = {x0: -2, x1: -0.55, z0: -2, z1: 0.15, h: 0.52};
export const STAND = {x: -0.3, z: -1.75};
export const LAMP: V3 = [STAND.x, 0.62 + 0.36, STAND.z];
export const DESK = {x0: 0.9, x1: 1.95, z0: -2, z1: -1.38, h: 0.76};
export const DESK_EVA: V3 = [1.2, DESK.h, -1.62];
export const DOOR = {z0: 0.95, z1: 1.8, h: 2.1};
export const WARD = {z0: -0.9, z1: 0.6, d: 0.6, h: 2.15};
export const WIN = {x0: -0.35, x1: 0.75, y0: 0.85, y1: 2.25};
// lying in bed: the feet end of the doll, head on the pillow (−z)
export const LIE: V3 = [-1.25, BED.h + 0.06, 0.05];

export type FlatState = {t: number; lamp: number; moon: number; door: number; lump: number; ceiling: number; rain: number};
export const FLAT_REST: FlatState = {t: 0, lamp: 0.9, moon: 1, door: 0.1, lump: 0, ceiling: 0, rain: 0.6};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.85) =>
  std(`ftx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`fl${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));
const wallpaper = () => tex('wall', 128, 128, (c) => {
  c.fillStyle = '#56606a'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = 'rgba(30,36,44,0.35)'; c.lineWidth = 3;
  for (let x = 0; x <= 128; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); }
  c.fillStyle = 'rgba(200,210,220,0.08)';
  for (let y = 0; y < 128; y += 32) for (let x = 16; x < 128; x += 32) { c.beginPath(); c.moveTo(x, y + 6); c.lineTo(x + 6, y + 16); c.lineTo(x, y + 26); c.lineTo(x - 6, y + 16); c.fill(); }
}, 7, 4);
const planks = () => tex('floor', 256, 256, (c) => {
  const r = mulberry32(5);
  for (let y = 0; y < 256; y += 32) {
    let x = -((y / 32) % 3) * 40;
    while (x < 256) { const w = 90 + r() * 70; c.fillStyle = `rgb(${92 + r() * 22},${62 + r() * 14},${40 + r() * 10})`; c.fillRect(x, y, w, 32);
      c.strokeStyle = 'rgba(30,18,10,0.6)'; c.lineWidth = 2; c.strokeRect(x, y, w, 32);
      for (let g = 0; g < 3; g++) { c.strokeStyle = 'rgba(60,36,20,0.25)'; c.beginPath(); c.moveTo(x + 4, y + 8 + g * 8); c.lineTo(x + w - 4, y + 8 + g * 8 + (r() - 0.5) * 4); c.stroke(); }
      x += w; }
  }
}, 4, 4, 0.55);
const rugTex = () => tex('rug', 256, 160, (c) => {
  c.fillStyle = '#5a2a2e'; c.fillRect(0, 0, 256, 160);
  c.strokeStyle = '#d8b46a'; c.lineWidth = 6; c.strokeRect(14, 14, 228, 132);
  c.strokeStyle = '#2c3a5a'; c.lineWidth = 10; c.strokeRect(30, 30, 196, 100);
  c.fillStyle = '#d8b46a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(68 + i * 30, 80); c.lineTo(80 + i * 30, 66); c.lineTo(92 + i * 30, 80); c.lineTo(80 + i * 30, 94); c.fill(); }
}, 1, 1, 1);
const duvetTex = () => tex('duvet', 128, 128, (c) => {
  c.fillStyle = '#34507a'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = 'rgba(230,220,190,0.35)'; c.lineWidth = 3;
  for (let i = 8; i < 128; i += 24) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 128; i += 12) c.fillRect(0, i, 128, 4);
}, 2, 3, 0.95);
const cityTex = (rain: number) => std(`city${Math.round(rain * 3)}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`city${Math.round(rain * 3)}`, 512, 512, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#0a1430'); g.addColorStop(0.7, '#1a2a4a'); g.addColorStop(1, '#2a2a3a'); c.fillStyle = g; c.fillRect(0, 0, 512, 512);
  c.fillStyle = '#dfe8ff'; c.beginPath(); c.arc(380, 110, 38, 0, 7); c.fill();
  c.fillStyle = 'rgba(200,215,255,0.15)'; c.beginPath(); c.arc(380, 110, 70, 0, 7); c.fill();
  const r = mulberry32(9);
  for (let i = 0; i < 9; i++) {
    const x = i * 60 - 10 + r() * 20, w = 50 + r() * 30, h = 160 + r() * 220;
    c.fillStyle = '#0c1120'; c.fillRect(x, 512 - h, w, h);
    for (let wy = 512 - h + 12; wy < 500; wy += 22) for (let wx = x + 8; wx < x + w - 8; wx += 14) if (r() < 0.22) { c.fillStyle = r() < 0.7 ? '#ffd88a' : '#9ad0ff'; c.fillRect(wx, wy, 7, 10); }
  }
  c.strokeStyle = `rgba(200,220,255,${0.25 * rain})`; c.lineWidth = 1.5;
  for (let i = 0; i < 160 * rain; i++) { const x = r() * 512, y = r() * 512; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 22); c.stroke(); }
})}));
const frameArt = (k: number) => std(`art${k}`, () => new THREE.MeshBasicMaterial({map: canvasTex(`art${k}`, 128, 160, (c) => {
  c.fillStyle = k ? '#c9b48a' : '#7a8a98'; c.fillRect(0, 0, 128, 160);
  if (k) { c.fillStyle = '#5a6a4a'; c.beginPath(); c.moveTo(0, 160); c.lineTo(50, 70); c.lineTo(90, 120); c.lineTo(128, 60); c.lineTo(128, 160); c.fill(); c.fillStyle = '#f2e8c8'; c.beginPath(); c.arc(90, 40, 14, 0, 7); c.fill(); }
  else { c.fillStyle = '#2a3440'; c.fillRect(20, 30, 88, 100); c.fillStyle = '#d8e0e8'; c.font = 'bold 28px sans-serif'; c.fillText('1998', 30, 90); }
})}));

export const FlatSet: React.FC<{S: FlatState; ring?: number; red?: number}> = ({S, ring = 0, red = 0}) => {
  const {x0, x1, z0, z1, h} = FLAT;
  const wall = wallpaper();
  const W = WIN;
  const lampCol = '#ffcf8a';
  const ringCol = red > 0.5 ? '#ff3030' : '#3fb6ff';
  return (
    <group>
      <ambientLight color="#3a4a6a" intensity={0.28 + 0.08 * S.moon} />
      {/* moonlight through the window */}
      <directionalLight position={[0.5, 3.2, -4.5]} color="#9ab6ff" intensity={0.9 * S.moon} />
      <pointLight position={[0.2, 1.8, -1.6]} color="#8aa8ff" intensity={1.1 * S.moon} distance={4.5} decay={1.4} />
      {/* the bedside lamp */}
      <pointLight position={[LAMP[0], LAMP[1] + 0.05, LAMP[2] + 0.1]} color={lampCol} intensity={2.4 * S.lamp} distance={3.6} decay={1.6} />
      {/* the speaker ring */}
      <pointLight position={[DESK_EVA[0], DESK_EVA[1] + 0.3, DESK_EVA[2] + 0.25]} color={ringCol} intensity={1.8 * ring} distance={3} decay={1.6} />
      {/* floor, ceiling, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={planks()} receiveShadow><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]} material={matte('#2a2e36')}><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[(x0 + W.x0) / 2, h / 2, z0]} material={wall}><planeGeometry args={[W.x0 - x0, h]} /></mesh>
      <mesh position={[(W.x1 + x1) / 2, h / 2, z0]} material={wall}><planeGeometry args={[x1 - W.x1, h]} /></mesh>
      <mesh position={[(W.x0 + W.x1) / 2, W.y0 / 2, z0]} material={wall}><planeGeometry args={[W.x1 - W.x0, W.y0]} /></mesh>
      <mesh position={[(W.x0 + W.x1) / 2, (W.y1 + h) / 2, z0]} material={wall}><planeGeometry args={[W.x1 - W.x0, h - W.y1]} /></mesh>
      <mesh position={[x0, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wall}><planeGeometry args={[z1 - z0, h]} /></mesh>
      <mesh position={[x1, h / 2, (z0 + DOOR.z0) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[DOOR.z0 - z0, h]} /></mesh>
      <mesh position={[x1, h / 2, (DOOR.z1 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[z1 - DOOR.z1, h]} /></mesh>
      <mesh position={[x1, (DOOR.h + h) / 2, (DOOR.z0 + DOOR.z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[DOOR.z1 - DOOR.z0, h - DOOR.h]} /></mesh>
      <mesh position={[0, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[x1 - x0, h]} /></mesh>
      {/* baseboards */}
      <Box s={[x1 - x0, 0.09, 0.025]} p={[0, 0.045, z0 + 0.012]} m={matte('#d8d2c4', 0.6)} shadow={false} />
      <Box s={[0.025, 0.09, z1 - z0]} p={[x0 + 0.012, 0.045, 0]} m={matte('#d8d2c4', 0.6)} shadow={false} />
      {/* the window: night city, frame, sill, curtains */}
      <mesh position={[(W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, z0 - 1.2]} material={cityTex(S.rain)}><planeGeometry args={[2.6, 2.6]} /></mesh>
      <Box s={[W.x1 - W.x0 + 0.12, 0.06, 0.08]} p={[(W.x0 + W.x1) / 2, W.y0 - 0.03, z0 + 0.03]} m={matte('#e8e4dc', 0.5)} />
      <Box s={[W.x1 - W.x0 + 0.24, 0.04, 0.22]} p={[(W.x0 + W.x1) / 2, W.y0 - 0.06, z0 + 0.1]} m={matte('#e8e4dc', 0.5)} />
      <Box s={[W.x1 - W.x0 + 0.12, 0.06, 0.08]} p={[(W.x0 + W.x1) / 2, W.y1 + 0.03, z0 + 0.03]} m={matte('#e8e4dc', 0.5)} />
      {[W.x0, (W.x0 + W.x1) / 2, W.x1].map((x) => <Box key={x} s={[0.05, W.y1 - W.y0, 0.07]} p={[x, (W.y0 + W.y1) / 2, z0 + 0.03]} m={matte('#e8e4dc', 0.5)} shadow={false} />)}
      <Box s={[W.x1 - W.x0, 0.04, 0.06]} p={[(W.x0 + W.x1) / 2, W.y0 + (W.y1 - W.y0) * 0.62, z0 + 0.03]} m={matte('#e8e4dc', 0.5)} shadow={false} />
      <mesh position={[(W.x0 + W.x1) / 2, (W.y0 + W.y1) / 2, z0 + 0.01]}><planeGeometry args={[W.x1 - W.x0, W.y1 - W.y0]} /><meshBasicMaterial color="#9fb8e8" transparent opacity={0.08} /></mesh>
      <Box s={[1.9, 0.03, 0.03]} p={[(W.x0 + W.x1) / 2, W.y1 + 0.2, z0 + 0.15]} m={matte('#2a2a30', 0.4)} shadow={false} />
      {[[W.x0 - 0.3, -1], [W.x1 + 0.3, 1]].map(([x, sd]) => (
        <group key={sd} position={[x, 0, z0 + 0.15]}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[(i - 1.5) * 0.11, (W.y1 + 0.2) / 2 + 0.02, Math.sin(i * 1.7 + S.t * 0.6) * 0.025]}>
              <cylinderGeometry args={[0.06, 0.075, W.y1 + 0.18, 10, 1, true]} /><meshStandardMaterial color="#3c2c4a" roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* the bed */}
      <group>
        <Box s={[BED.x1 - BED.x0, 0.26, BED.z1 - BED.z0]} p={[(BED.x0 + BED.x1) / 2, 0.2, (BED.z0 + BED.z1) / 2]} m={matte('#4a3020', 0.6)} />
        {[[BED.x0 + 0.06, BED.z1 - 0.06], [BED.x1 - 0.06, BED.z1 - 0.06]].map(([x, z]) => <Box key={x} s={[0.07, 0.1, 0.07]} p={[x, 0.05, z]} m={matte('#2a1a10', 0.6)} />)}
        <Box s={[BED.x1 - BED.x0 + 0.06, 1.15, 0.08]} p={[(BED.x0 + BED.x1) / 2, 0.58, BED.z0 + 0.04]} m={matte('#3a2418', 0.5)} />
        {[0.25, 0.55, 0.85].map((u) => <Box key={u} s={[0.02, 0.8, 0.02]} p={[BED.x0 + (BED.x1 - BED.x0) * u, 0.7, BED.z0 + 0.09]} m={matte('#2a1a10', 0.5)} shadow={false} />)}
        <Box s={[BED.x1 - BED.x0 - 0.06, 0.2, BED.z1 - BED.z0 - 0.1]} p={[(BED.x0 + BED.x1) / 2, 0.43, (BED.z0 + BED.z1) / 2 + 0.03]} m={matte('#e6e2da', 0.9)} />
        {[-1.6, -0.95].map((x) => (
          <mesh key={x} position={[x, BED.h + 0.08, BED.z0 + 0.32]} scale={[1, 0.33, 0.55]} castShadow><sphereGeometry args={[0.32, 20, 12]} /><meshStandardMaterial color="#f0ece4" roughness={0.95} /></mesh>
        ))}
        {/* the duvet, thrown over the bed: folds, it hangs over the edge */}
        <mesh position={[(BED.x0 + BED.x1) / 2 + 0.02, BED.h + 0.06, -0.5]} rotation={[-Math.PI / 2, 0, 0]} material={duvetTex()} castShadow receiveShadow>
          <planeGeometry args={[BED.x1 - BED.x0 + 0.12, 1.35, 12, 12]} />
        </mesh>
        <Box s={[0.04, 0.32, 1.35]} p={[BED.x1 + 0.04, BED.h - 0.1, -0.5]} m={duvetTex()} shadow={false} />
        {[-0.95, -0.55, -0.15].map((z, i) => (
          <mesh key={z} position={[(BED.x0 + BED.x1) / 2 + (i - 1) * 0.15, BED.h + 0.08, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.045, BED.x1 - BED.x0 - 0.1, 10]} /><meshStandardMaterial color="#2c4468" roughness={0.95} /></mesh>
        ))}
        {/* the lump: someone lies under the duvet (easter egg / the end) */}
        {S.lump > 0.01 && (
          <mesh position={[-1.65, BED.h + 0.12 * S.lump, -0.65]} scale={[0.32, 0.18 * S.lump, 1.05]} castShadow><sphereGeometry args={[1, 18, 12]} /><primitive object={duvetTex()} attach="material" /></mesh>
        )}
      </group>
      {/* the nightstand with a real lamp */}
      <group position={[STAND.x, 0, STAND.z]}>
        <Box s={[0.45, 0.6, 0.4]} p={[0, 0.3, 0]} m={matte('#4a3020', 0.6)} />
        <Box s={[0.4, 0.2, 0.02]} p={[0, 0.42, 0.205]} m={matte('#5a3a26', 0.5)} shadow={false} />
        <mesh position={[0, 0.42, 0.22]}><sphereGeometry args={[0.018, 8, 6]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0, 0.63, 0]}><cylinderGeometry args={[0.08, 0.1, 0.05, 20]} /><meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.4} /></mesh>
        <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.012, 0.012, 0.28, 8]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0, 0.94, 0]}><sphereGeometry args={[0.04, 12, 10]} /><primitive object={glow(lampCol, 0.3 + 1.6 * S.lamp)} attach="material" /></mesh>
        <mesh position={[0, 0.97, 0]}><cylinderGeometry args={[0.1, 0.17, 0.18, 24, 1, true]} /><meshStandardMaterial color="#e8d6b4" emissive={lampCol} emissiveIntensity={0.55 * S.lamp} side={THREE.DoubleSide} roughness={0.9} /></mesh>
        <Box s={[0.14, 0.03, 0.1]} p={[0.13, 0.615, 0.08]} m={matte('#1a1c22', 0.3)} shadow={false} />
        <Box s={[0.12, 0.012, 0.08]} p={[0.13, 0.633, 0.08]} m={glow('#2a4a6a', 0.35)} shadow={false} />
      </group>
      {/* the desk: laptop, books, a mug — the speaker stands on it (2D puppet) */}
      <group>
        <Box s={[DESK.x1 - DESK.x0, 0.04, DESK.z1 - DESK.z0]} p={[(DESK.x0 + DESK.x1) / 2, DESK.h - 0.02, (DESK.z0 + DESK.z1) / 2]} m={matte('#6a4a30', 0.5)} />
        {[[DESK.x0 + 0.04, DESK.z1 - 0.04], [DESK.x1 - 0.04, DESK.z1 - 0.04], [DESK.x0 + 0.04, DESK.z0 + 0.04], [DESK.x1 - 0.04, DESK.z0 + 0.04]].map(([x, z], i) => <Box key={i} s={[0.04, DESK.h - 0.04, 0.04]} p={[x, (DESK.h - 0.04) / 2, z]} m={matte('#2a2a30', 0.4)} />)}
        <Box s={[0.36, 0.025, 0.25]} p={[1.6, DESK.h + 0.012, -1.7]} m={matte('#9aa0a8', 0.3)} />
        {[0, 1, 2].map((i) => <Box key={i} s={[0.24, 0.045, 0.17]} p={[1.78, DESK.h + 0.025 + i * 0.045, -1.88]} m={matte(['#8a2a2a', '#2a4a7a', '#c9a24a'][i], 0.7)} shadow={false} />)}
        <mesh position={[1.5, DESK.h + 0.05, -1.48]}><cylinderGeometry args={[0.04, 0.035, 0.1, 14]} /><meshStandardMaterial color="#e8e2d6" /></mesh>
        <Box s={[0.5, 0.45, 0.04]} p={[1.42, 1.6, z0 + 0.02]} m={matte('#1a1c22', 0.4)} shadow={false} />
        <mesh position={[1.42, 1.6, z0 + 0.045]} material={frameArt(0)}><planeGeometry args={[0.44, 0.39]} /></mesh>
      </group>
      {/* a framed picture over the bed, a shelf with books on the left wall */}
      <Box s={[0.6, 0.45, 0.04]} p={[-1.27, 1.75, z0 + 0.02]} m={matte('#c9a24a', 0.4)} shadow={false} />
      <mesh position={[-1.27, 1.75, z0 + 0.045]} material={frameArt(1)}><planeGeometry args={[0.54, 0.39]} /></mesh>
      <Box s={[0.22, 0.03, 0.9]} p={[x0 + 0.11, 1.55, 0.8]} m={matte('#6a4a30', 0.5)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} s={[0.16, 0.2 + (i % 3) * 0.04, 0.05]} p={[x0 + 0.1, 1.67 + (i % 3) * 0.02, 0.45 + i * 0.12]} m={matte(['#7a2a2a', '#2a5a5a', '#c9a24a', '#3a3a6a', '#6a6a2a', '#8a5a3a'][i], 0.7)} shadow={false} />)}
      {/* the wardrobe on the right wall */}
      <group position={[x1 - WARD.d / 2, 0, (WARD.z0 + WARD.z1) / 2]}>
        <Box s={[WARD.d, WARD.h, WARD.z1 - WARD.z0]} p={[0, WARD.h / 2, 0]} m={matte('#4a3424', 0.6)} />
        <Box s={[0.01, WARD.h - 0.1, 0.01]} p={[-WARD.d / 2 - 0.005, WARD.h / 2, 0]} m={matte('#1a120c', 0.6)} shadow={false} />
        {[-0.08, 0.08].map((z) => <Box key={z} s={[0.02, 0.18, 0.02]} p={[-WARD.d / 2 - 0.02, 1.05, z]} m={matte('#c9a24a', 0.3)} shadow={false} />)}
      </group>
      {/* the door to the hallway, the warm hallway light */}
      <mesh position={[x1 + 1.2, h / 2, (DOOR.z0 + DOOR.z1) / 2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[3, h]} /><meshStandardMaterial color="#8a6a4a" /></mesh>
      <pointLight position={[x1 + 0.8, 2.1, (DOOR.z0 + DOOR.z1) / 2]} color="#ffcf8a" intensity={1.2 * S.door} distance={3} decay={1.5} />
      <group position={[x1, 0, DOOR.z0]} rotation={[0, -S.door * 1.3, 0]}>
        <Box s={[0.045, DOOR.h, DOOR.z1 - DOOR.z0]} p={[0, DOOR.h / 2, (DOOR.z1 - DOOR.z0) / 2]} m={matte('#d8d0c0', 0.5)} />
        <mesh position={[-0.04, 1.0, DOOR.z1 - DOOR.z0 - 0.08]}><sphereGeometry args={[0.03, 10, 8]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
      </group>
      {/* the rug, the ceiling lamp (off) */}
      <mesh position={[0.45, 0.004, 0.4]} rotation={[-Math.PI / 2, 0, 0]} material={rugTex()} receiveShadow><planeGeometry args={[1.8, 1.2]} /></mesh>
      <mesh position={[0.2, h - 0.06, 0]}><cylinderGeometry args={[0.22, 0.26, 0.08, 24]} /><meshStandardMaterial color="#d8d4cc" emissive="#ffe4b0" emissiveIntensity={S.ceiling} /></mesh>
      {/* a plant in the corner by the door */}
      <mesh position={[1.72, 0.18, 0.8]}><cylinderGeometry args={[0.13, 0.1, 0.36, 14]} /><meshStandardMaterial color="#b85a32" /></mesh>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <mesh key={i} position={[1.72 + Math.sin(i * 2.1) * 0.12, 0.42 + i * 0.05, 0.8 + Math.cos(i * 2.1) * 0.1]} rotation={[Math.sin(i) * 0.7, i, Math.cos(i) * 0.7]} scale={[1, 0.4, 1.8]}><sphereGeometry args={[0.07, 8, 6]} /><meshStandardMaterial color="#2f6a3a" /></mesh>)}
    </group>
  );
};
