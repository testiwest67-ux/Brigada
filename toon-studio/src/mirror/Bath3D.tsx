// «Отражение опаздывает»: Anya's bathroom (and the café with a wall mirror — same box, other dressing).
// Room: x -1.1..1.1, z MZ (mirror wall) .. 1.7, floor y = 0, height 2.5. The mirror hangs above the sink.
// As in «Лишний этаж», the mirror is a window into a reflected copy of the whole room (z' = 2·MZ − z), so the lamp,
// the tiles and the open door all show up in it for free; the copy skips the mirror wall. A camera may also stand
// INSIDE the copy (z < MZ) and look out through the glass — the last shots, when Anya is trapped behind it.
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, glow, matte, rep, std} from '../horror/common';

export const MZ = -0.9;
export const ROOM = {x: 1.1, z1: 1.7, h: 2.5};
export const GLASS = {x: 0.6, y0: 0.95, y1: 2.12};
export const SINK = {x: 0.45, z: MZ + 0.48, h: 0.86};
export const MIR = (p: V3): V3 => [p[0], p[1], 2 * MZ - p[2]];
export const MIRROR_QUAD: V3[] = [[-GLASS.x, GLASS.y0, MZ], [GLASS.x, GLASS.y0, MZ], [GLASS.x, GLASS.y1, MZ], [-GLASS.x, GLASS.y1, MZ]];
// where Anya stands at the sink, and her head
export const SPOT: V3 = [0, 0, -0.18];
export const HEAD: V3 = [0, 1.38, -0.18];

export type BathState = {
  t: number;
  kind: 'bath' | 'cafe';
  lamp: number;     // 0..1 light over the mirror (flicker by the caller)
  tint: 'morning' | 'evening' | 'night';
  sheet: number;    // 0 none, 1 hangs over the mirror
  bulge: number;    // 0..1 something pushes the sheet from behind
  floorSheet: number; // 0..1 the sheet lies on the floor
  sway?: number;    // the hanging sheet swings (radians, by the caller)
  drop?: number;    // 0..1 the hanging sheet slides off the mirror and falls
  hand: number;     // 0..1 the palm print on the glass
  inside: number;   // 0..1 a second print, pressed from the camera side (the trapped Anya)
  door: number;     // 0 closed .. 1 open (right wall)
  fog: number;      // steam on the glass 0..1
};
export const BATH_REST: BathState = {t: 0, kind: 'bath', lamp: 1, tint: 'morning', sheet: 0, bulge: 0, floorSheet: 0, hand: 0, inside: 0, door: 0.25, fog: 0};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.6) =>
  std(`mtx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`mi${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));
const tiles = (kind: string) => kind === 'cafe'
  ? tex('cafewall', 128, 128, (c) => {
    c.fillStyle = '#6b4a36'; c.fillRect(0, 0, 128, 128);
    const r = mulberry32(5);
    for (let x = 0; x < 128; x += 16) { c.fillStyle = `rgba(30,16,8,${0.15 + r() * 0.15})`; c.fillRect(x, 0, 2, 128); }
    c.fillStyle = 'rgba(255,220,170,0.06)'; c.fillRect(0, 0, 128, 40);
  }, 6, 2, 0.8)
  : tex('paint', 128, 128, (c) => {
    // dusty rose paint with a faint damask pattern
    c.fillStyle = '#c98f8c'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = 'rgba(120,50,60,0.13)';
    for (let y = 0; y < 128; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < 160; x += 64) {
      c.beginPath(); c.ellipse(x, y + 32, 9, 18, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(x - 14, y + 30, 6, 10, -0.6, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 14, y + 30, 6, 10, 0.6, 0, 7); c.fill();
    }
  }, 6, 6, 0.9);
// emerald tiles for the lower part of the walls (a wainscot up to WH)
export const WH = 1.12;
const greenTiles = () => tex('greentiles', 128, 128, (c) => {
  c.fillStyle = '#1d5a52'; c.fillRect(0, 0, 128, 128);
  const r = mulberry32(2);
  for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 64) {
    c.fillStyle = `rgba(${20 + r() * 20},${90 + r() * 30},${80 + r() * 20},1)`; c.fillRect(x + ((y / 32) % 2 ? 32 : 0) + 2, y + 2, 60, 28);
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + ((y / 32) % 2 ? 32 : 0) + 8, y + 6, 20, 3);
  }
  c.strokeStyle = '#e8e0cc'; c.lineWidth = 2;
}, 6, 4, 0.15);
const floorTex = (kind: string) => kind === 'cafe'
  ? tex('cafefloor', 128, 128, (c) => {
    for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { c.fillStyle = (x + y) % 64 ? '#2a2420' : '#d8cfc0'; c.fillRect(x, y, 32, 32); }
  }, 6, 8, 0.5)
  : tex('bathfloor', 128, 128, (c) => {
    for (let y = 0; y < 128; y += 32) for (let x = 0; x < 128; x += 32) { c.fillStyle = (x + y) % 64 ? '#1a1a20' : '#ece6da'; c.fillRect(x, y, 32, 32); }
  }, 4, 5, 0.3);
const palm = (k: string) => std(`palm${k}`, () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(`palm${k}`, 128, 160, (c) => {
  c.clearRect(0, 0, 128, 160);
  c.fillStyle = 'rgba(225,235,240,0.35)';
  c.beginPath(); c.ellipse(64, 108, 34, 40, 0, 0, 7); c.fill();
  [[26, 62, -0.5], [44, 34, -0.15], [66, 26, 0], [86, 34, 0.15], [108, 78, 0.9]].forEach(([x, y, a]) => {
    c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 9, 26, 0, 0, 7); c.fill(); c.restore();
  });
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(48 + i * 6, 96); c.lineTo(50 + i * 6, 130); c.stroke(); }
})}));
// the white bed sheet hung over the mirror (the user chose the sheet over a towel)
const sheetMat = () => std('sheet', () => new THREE.MeshStandardMaterial({color: '#ece9e2', roughness: 0.95, side: THREE.DoubleSide}));
const glassMat = (fog: number) => std(`glass${Math.round(fog * 4)}`, () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(`mglass${Math.round(fog * 4)}`, 256, 256, (c) => {
  c.clearRect(0, 0, 256, 256); c.fillStyle = `rgba(170,200,210,${0.06 + fog * 0.3})`; c.fillRect(0, 0, 256, 256);
  const r = mulberry32(13);
  for (let i = 0; i < 14; i++) { c.fillStyle = `rgba(230,240,245,${0.03 + r() * 0.05})`; c.beginPath(); c.ellipse(r() * 256, r() * 256, 10 + r() * 40, 4 + r() * 12, r() * 3, 0, 7); c.fill(); }
})}));

const TINT = {morning: ['#fff1dc', '#c9d6e0'], evening: ['#ffc98a', '#5a4a5a'], night: ['#9fb6d8', '#1c2230']};

const World: React.FC<{S: BathState; copy?: boolean}> = ({S, copy}) => {
  const {x, z1, h} = ROOM;
  const d = z1 - MZ, cz = (MZ + z1) / 2;
  const wall = tiles(S.kind), fl = floorTex(S.kind);
  const [warm, amb] = TINT[S.tint];
  const cafe = S.kind === 'cafe';
  return (
    <group>
      <ambientLight color={amb} intensity={0.35 + 0.25 * S.lamp} />
      <pointLight position={[0, 2.3, MZ + 0.35]} color={warm} intensity={1.6 * S.lamp} distance={5} decay={1.4} />
      <pointLight position={[0.2, 2.3, 1.2]} color={warm} intensity={0.5 * S.lamp} distance={4} decay={1.6} />
      <mesh position={[0, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} material={fl} receiveShadow><planeGeometry args={[2 * x, d]} /></mesh>
      <mesh position={[0, h, cz]} rotation={[Math.PI / 2, 0, 0]} material={matte(cafe ? '#3a2a20' : '#efe4d2')}><planeGeometry args={[2 * x, d]} /></mesh>
      <mesh position={[-x, h / 2, cz]} rotation={[0, Math.PI / 2, 0]} material={wall} receiveShadow><planeGeometry args={[d, h]} /></mesh>
      {/* right wall with the door */}
      <mesh position={[x, h / 2, (MZ + 0.4) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[0.4 - MZ, h]} /></mesh>
      <mesh position={[x, h / 2, (1.2 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[z1 - 1.2, h]} /></mesh>
      <mesh position={[x, (2.05 + h) / 2, 0.8]} rotation={[0, -Math.PI / 2, 0]} material={wall}><planeGeometry args={[0.8, h - 2.05]} /></mesh>
      <mesh position={[x + 0.9, h / 2, 0.8]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[2, h]} /><meshStandardMaterial color={cafe ? '#c9a070' : '#6a5a4a'} /></mesh>
      <group position={[x, 0, 0.4]} rotation={[0, -S.door * 1.3, 0]}>
        <Box s={[0.04, 2.05, 0.8]} p={[0, 1.025, 0.4]} m={matte(cafe ? '#4a3020' : '#f2efe8', 0.5)} />
      </group>
      <mesh position={[0, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[2 * x, h]} /></mesh>
      {!cafe && (
        <group>
          {/* emerald tiles up to WH + a brass rail on top */}
          <mesh position={[-x + 0.003, WH / 2, cz]} rotation={[0, Math.PI / 2, 0]} material={greenTiles()}><planeGeometry args={[d, WH]} /></mesh>
          <mesh position={[x - 0.003, WH / 2, (MZ + 0.4) / 2]} rotation={[0, -Math.PI / 2, 0]} material={greenTiles()}><planeGeometry args={[0.4 - MZ, WH]} /></mesh>
          <mesh position={[x - 0.003, WH / 2, (1.2 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={greenTiles()}><planeGeometry args={[z1 - 1.2, WH]} /></mesh>
          <mesh position={[0, WH / 2, z1 - 0.003]} rotation={[0, Math.PI, 0]} material={greenTiles()}><planeGeometry args={[2 * x, WH]} /></mesh>
          <Box s={[0.02, 0.035, d]} p={[-x + 0.01, WH, cz]} m={matte('#b8913a', 0.3)} shadow={false} />
          <Box s={[2 * x, 0.035, 0.02]} p={[0, WH, z1 - 0.01]} m={matte('#b8913a', 0.3)} shadow={false} />
          <Box s={[0.02, 0.035, 0.4 - MZ]} p={[x - 0.01, WH, (MZ + 0.4) / 2]} m={matte('#b8913a', 0.3)} shadow={false} />
        </group>
      )}
      {/* the mirror wall around the glass (only in the real room) */}
      {!copy && (
        <group>
          <mesh position={[0, GLASS.y0 / 2, MZ]} material={wall}><planeGeometry args={[2 * x, GLASS.y0]} /></mesh>
          <mesh position={[0, (GLASS.y1 + h) / 2, MZ]} material={wall}><planeGeometry args={[2 * x, h - GLASS.y1]} /></mesh>
          {[-1, 1].map((sd) => <mesh key={sd} position={[sd * (GLASS.x + (x - GLASS.x) / 2), (GLASS.y0 + GLASS.y1) / 2, MZ]} material={wall}><planeGeometry args={[x - GLASS.x, GLASS.y1 - GLASS.y0]} /></mesh>)}
          {!cafe && <mesh position={[0, GLASS.y0 / 2, MZ + 0.003]} material={greenTiles()}><planeGeometry args={[2 * x, GLASS.y0]} /></mesh>}
          {!cafe && [-1, 1].map((sd) => <mesh key={`w${sd}`} position={[sd * (GLASS.x + (x - GLASS.x) / 2), (GLASS.y0 + WH) / 2, MZ + 0.003]} material={greenTiles()}><planeGeometry args={[x - GLASS.x, WH - GLASS.y0]} /></mesh>)}
          {!cafe && [-1, 1].map((sd) => <Box key={`b${sd}`} s={[x - GLASS.x, 0.035, 0.02]} p={[sd * (GLASS.x + (x - GLASS.x) / 2), WH, MZ + 0.01]} m={matte('#b8913a', 0.3)} shadow={false} />)}
          {/* frame */}
          {([[0, GLASS.y0, 2 * GLASS.x + 0.08, 0.05], [0, GLASS.y1, 2 * GLASS.x + 0.08, 0.05]] as number[][]).map(([px, py, w, t], i) => (
            <Box key={i} s={[w, t, 0.04]} p={[px, py, MZ + 0.02]} m={matte('#b8913a', 0.3)} shadow={false} />
          ))}
          {[-1, 1].map((sd) => <Box key={sd} s={[0.05, GLASS.y1 - GLASS.y0, 0.04]} p={[sd * GLASS.x, (GLASS.y0 + GLASS.y1) / 2, MZ + 0.02]} m={matte('#b8913a', 0.3)} shadow={false} />)}
          <mesh position={[0, (GLASS.y0 + GLASS.y1) / 2, MZ + 0.003]} material={glassMat(S.fog)}><planeGeometry args={[GLASS.x * 2, GLASS.y1 - GLASS.y0]} /></mesh>
          {/* palm prints on the glass */}
          {S.hand > 0.01 && <mesh position={[0.18, 1.5, MZ + 0.004]} rotation={[0, 0, -0.12]} material={palm('a')} scale={[S.hand, S.hand, 1]}><planeGeometry args={[0.2, 0.25]} /></mesh>}
          {S.inside > 0.01 && <mesh position={[-0.15, 1.45, MZ + 0.004]} rotation={[0, 0, 0.1]} material={palm('b')} scale={[-S.inside, S.inside, 1]}><planeGeometry args={[0.2, 0.25]} /></mesh>}
          {/* the lamp bar over the mirror */}
          <Box s={[0.9, 0.06, 0.08]} p={[0, GLASS.y1 + 0.14, MZ + 0.05]} m={glow(TINT[S.tint][0], 0.4 + 1.2 * S.lamp)} shadow={false} />
          {/* the sheet hung over the mirror; pushed from behind on every knock */}
          {S.sheet > 0.01 && (S.drop ?? 0) < 0.99 && (() => {
            // hung from the top edge: unrolls downward (sheet 0..1), swings, then slides off and falls (drop 0..1)
            const H0 = GLASS.y1 - GLASS.y0 + 0.35, top = GLASS.y1 + 0.13, dr = S.drop ?? 0;
            const hgt = H0 * S.sheet * (1 - 0.75 * dr);
            return (
              <group position={[0, top - 1.1 * dr * dr, MZ + 0.05 + 0.45 * dr]} rotation={[(S.sway ?? 0) - 1.1 * dr, 0, 0.15 * dr]}>
                <mesh position={[0, -hgt / 2, 0]}>
                  <planeGeometry args={[GLASS.x * 2 + 0.25, Math.max(0.01, hgt), 10, 10]} />
                  <primitive object={sheetMat()} attach="material" />
                </mesh>
              </group>
            );
          })()}
          
          {/* a hand knocks from behind the sheet: only a soft relief of the palm and fingers shows */}
          {S.sheet > 0.01 && S.bulge > 0.02 && (
            <group position={[0.15, 1.45, MZ + 0.035]} rotation={[0, 0, -0.12]} scale={[1, 1, 0.1 + 0.9 * S.bulge]}>
              <mesh scale={[0.9, 1.0, 0.3]}><sphereGeometry args={[0.1, 16, 12]} /><primitive object={sheetMat()} attach="material" /></mesh>
              {[-0.06, -0.02, 0.02, 0.06].map((x, i) => (
                <mesh key={i} position={[x, 0.15 + (i === 1 || i === 2 ? 0.02 : 0), 0]} scale={[1, 1, 0.9]}><capsuleGeometry args={[0.024, 0.1, 4, 8]} /><primitive object={sheetMat()} attach="material" /></mesh>
              ))}
              <mesh position={[-0.11, 0.02, 0]} rotation={[0, 0, 0.8]} scale={[1, 1, 0.8]}><capsuleGeometry args={[0.024, 0.08, 4, 8]} /><primitive object={sheetMat()} attach="material" /></mesh>
            </group>
          )}
        </group>
      )}
      {!cafe && (
        <group>
          {/* sink cabinet + basin + tap */}
          <Box s={[SINK.x * 2, SINK.h - 0.06, 0.48]} p={[0, (SINK.h - 0.06) / 2, MZ + 0.24]} m={matte('#16403b', 0.45)} />
          {[-1, 1].map((sd) => <mesh key={sd} position={[sd * 0.08, 0.6, MZ + 0.485]}><sphereGeometry args={[0.018, 10, 8]} /><meshStandardMaterial color="#d4a843" metalness={0.7} roughness={0.25} /></mesh>)}
          <Box s={[SINK.x * 2 + 0.06, 0.07, 0.52]} p={[0, SINK.h - 0.03, MZ + 0.26]} m={matte('#fbfbf8', 0.15)} />
          <mesh position={[0, SINK.h - 0.02, MZ + 0.28]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.17, 24]} /><meshStandardMaterial color="#c9d2d4" roughness={0.1} metalness={0.3} /></mesh>
          <Box s={[0.03, 0.14, 0.03]} p={[0, SINK.h + 0.07, MZ + 0.07]} m={matte('#c0c4c8', 0.15)} shadow={false} />
          <Box s={[0.03, 0.03, 0.12]} p={[0, SINK.h + 0.13, MZ + 0.12]} m={matte('#c0c4c8', 0.15)} shadow={false} />
          {/* the cup with a toothbrush: pink here, blue in the reflection (easter egg) */}
          <mesh position={[0.3, SINK.h + 0.06, MZ + 0.1]}><cylinderGeometry args={[0.035, 0.03, 0.1, 14]} /><meshStandardMaterial color="#e8e2d6" /></mesh>
          <mesh position={[0.31, SINK.h + 0.15, MZ + 0.1]} rotation={[0, 0, -0.15]}><cylinderGeometry args={[0.008, 0.008, 0.17, 6]} /><meshStandardMaterial color={copy ? '#3f7fd8' : '#e8588a'} /></mesh>
          {/* towel on the left wall */}
          <Box s={[0.04, 0.55, 0.32]} p={[-x + 0.03, 1.35, 0.2]} m={matte('#e08a9a', 0.95)} />
          {/* a plant on the cabinet, a round brass lamp on the wall */}
          <mesh position={[-0.33, SINK.h + 0.07, MZ + 0.12]}><cylinderGeometry args={[0.05, 0.04, 0.1, 12]} /><meshStandardMaterial color="#c86a3a" /></mesh>
          {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[-0.33 + Math.sin(i * 1.3) * 0.04, SINK.h + 0.18 + i * 0.015, MZ + 0.12 + Math.cos(i * 1.3) * 0.03]} rotation={[Math.sin(i) * 0.6, i, Math.cos(i) * 0.6]}><sphereGeometry args={[0.045, 8, 6]} /><meshStandardMaterial color="#3f8a4a" /></mesh>)}
          {/* the sheet on the floor in the morning */}
          {S.floorSheet > 0.01 && (
            <group position={[0.0, 0.02, 0.12]} scale={[1.3 * S.floorSheet, 1.3 * S.floorSheet, 1.3 * S.floorSheet]}>
              <mesh rotation={[-Math.PI / 2, 0, 0.3]}><planeGeometry args={[0.7, 0.5]} /><primitive object={sheetMat()} attach="material" /></mesh>
              <mesh position={[0.05, 0.04, -0.05]} rotation={[0.2, 0.3, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.06, 0.55, 12]} /><primitive object={sheetMat()} attach="material" /></mesh>
              <mesh position={[-0.15, 0.03, 0.12]} rotation={[0, 0.8, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.05, 0.35, 12]} /><primitive object={sheetMat()} attach="material" /></mesh>
            </group>
          )}
        </group>
      )}
      {cafe && (
        <group>
          {/* a café: warm wall lamps, a little table, a poster */}
          {[-0.85, 0.85].map((px) => <mesh key={px} position={[px, 1.9, MZ + 0.08]}><sphereGeometry args={[0.07, 12, 8]} /><primitive object={glow('#ffd59a', 1.6)} attach="material" /></mesh>)}
          <mesh position={[-0.75, 0.74, 0.7]}><cylinderGeometry args={[0.32, 0.32, 0.04, 20]} /><meshStandardMaterial color="#3a2a20" /></mesh>
          <mesh position={[-0.75, 0.37, 0.7]}><cylinderGeometry args={[0.03, 0.03, 0.74, 8]} /><meshStandardMaterial color="#222" /></mesh>
          <mesh position={[-0.7, 0.81, 0.65]}><cylinderGeometry args={[0.045, 0.04, 0.1, 12]} /><meshStandardMaterial color="#f4efe6" /></mesh>
        </group>
      )}
    </group>
  );
};

// the whole set: the real room + its mirror copy behind the glass
export const BathSet: React.FC<{S: BathState}> = ({S}) => (
  <group>
    <World S={S} />
    <group position={[0, 0, 2 * MZ]} scale={[1, 1, -1]}>
      <World S={S} copy />
    </group>
  </group>
);
