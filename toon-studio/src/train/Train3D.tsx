// «Последняя электричка»: one 3D world — the carriage, the night outside, the platforms.
// Floor y = 0. Carriage x -1.5..1.5, z -9..7, ceiling 2.4. Aisle down the middle (x ≈ 0).
// Benches across the car in bays of 2.2 m; Kostya sits by the LEFT window (x -1.2) at z 0 facing +z,
// the doubles sit opposite (z 1.6, facing -z). The side door is in the left wall at z 2.45..3.65.
// Outside on the left: the platform (top y = 0, level with the floor) — «Тихая» (fog, dead lamps),
// «Зелёный Бор» (lit, his house beyond), the terminal in the morning. On the move: poles and trees fly past.
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {lerp, mulberry32} from '../toon/lib/anim';
import {Box, matte, rep, std} from '../horror/common';

export const CAR = {x0: -1.5, x1: 1.5, z0: -9, z1: 7, h: 2.4};
export const WIN = {y0: 0.95, y1: 1.85, w: 1.35};
export const DOOR = {z0: 2.45, z1: 3.65, h: 2.0};
export const BAY = 2.2;
// window centres along each wall (one per bench bay; the bay at the door has none on the left)
export const WIN_Z = [-7.9, -5.7, -3.5, -1.3, 0.8, 5.2];
export const SPOT = {
  kostya: [-1.15, 0, 0.32] as V3,   // window seat, facing +z (feet a bit forward of the seat)
  oldSeat: [-0.6, 0, 0.32] as V3,   // next to him, aisle side
  wetSeat: [-1.15, 0, 1.28] as V3,  // opposite him, facing -z
  midSeat: [-0.62, 0, 1.28] as V3,  // opposite, aisle side
  doorOut: [-2.3, 0, 3.05] as V3,   // on the platform in front of the door
  doorIn: [-1.0, 0, 3.05] as V3,
  aisle: [-0.05, 0, 2.2] as V3,
  momWin: [-1.85, 0, 0.75] as V3,   // on the platform right outside his window
};
export const MAP_POS: V3 = [CAR.x1 - 0.01, 2.12, 0.8];
export const BOARD: V3 = [0, 2.12, CAR.z1 - 0.02];
export const SPEAKER: V3 = [0, CAR.h - 0.01, 1.0];

export type Place = 'night' | 'tikhaya' | 'bor' | 'terminal';
export type TrainState = {
  t: number;
  lamps: number;   // ceiling lamps 0..1 (flicker by the caller)
  place: Place;
  speed: number;   // m/s the world outside flies past (0 = standing)
  travel?: number; // extra offset (m) of the outside world along z (to roll into / out of a station)
  door: number;    // side door open 0..1
  clock: string;   // the board above the end door
  ghost: number;   // «ТИХАЯ» showing through the gap on the line map 0..1
  dawn: number;    // 0 night .. 1 morning
  rain?: number;   // streaks on the windows 0..1
};
export const TRAIN_REST: TrainState = {t: 0, lamps: 0.9, place: 'night', speed: 22, door: 0, clock: '00:47', ghost: 0, dawn: 0};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.85) =>
  std(`ttx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`t${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));

// ---------- textures ----------
const floorMat = () => tex('floor', 256, 256, (c) => {
  c.fillStyle = '#5a4e46'; c.fillRect(0, 0, 256, 256);
  const r = mulberry32(3);
  for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(20,15,12,${r() * 0.25})`; c.fillRect(r() * 256, r() * 256, 2 + r() * 4, 2 + r() * 4); }
  c.strokeStyle = 'rgba(30,26,22,0.6)'; c.lineWidth = 3; for (let x = 0; x <= 256; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke(); }
}, 3, 16, 0.8);
const wallMat = () => tex('wall', 256, 256, (c) => {
  c.fillStyle = '#d9d2b8'; c.fillRect(0, 0, 256, 256);
  const r = mulberry32(9);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(90,80,50,${0.02 + r() * 0.05})`; c.beginPath(); c.ellipse(r() * 256, r() * 256, 4 + r() * 30, 4 + r() * 30, 0, 0, 7); c.fill(); }
}, 6, 1);
const lowerWall = () => tex('lower', 128, 128, (c) => {
  c.fillStyle = '#3f6b55'; c.fillRect(0, 0, 128, 128);
  c.fillStyle = 'rgba(0,0,0,0.15)'; for (let y = 0; y < 128; y += 16) c.fillRect(0, y, 128, 2);
}, 10, 2, 0.6);
const benchWood = () => tex('bench', 256, 64, (c) => {
  c.fillStyle = '#8a4e2c'; c.fillRect(0, 0, 256, 64);
  const r = mulberry32(21);
  for (let i = 0; i < 30; i++) { c.strokeStyle = `rgba(50,22,8,${0.1 + r() * 0.25})`; c.beginPath(); const y = r() * 64; c.moveTo(0, y); c.bezierCurveTo(80, y + 4, 170, y - 4, 256, y + 2); c.stroke(); }
  c.fillStyle = 'rgba(255,220,180,0.12)'; c.fillRect(0, 4, 256, 6);
}, 1, 1, 0.45);
const extMat = () => tex('ext', 256, 128, (c) => {
  c.fillStyle = '#2f5a3e'; c.fillRect(0, 0, 256, 128);
  c.fillStyle = '#b0262a'; c.fillRect(0, 96, 256, 10);
  c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < 256; x += 64) c.fillRect(x, 0, 2, 128);
}, 6, 1, 0.6);

// the line map above the right windows: «Зелёный Бор» at the end; between «Берёзки» and «Лесная» an empty gap where
// «ТИХАЯ» slowly shows through (quantised for the material cache)
export const MAP_STATIONS = ['Сортировочная', 'Берёзки', '', 'Лесная', 'Зелёный Бор'];
const mapMat = (ghost: number) => {
  const g = Math.round(ghost * 5) / 5;
  return std(`map${g}`, () => new THREE.MeshBasicMaterial({map: canvasTex(`tmap${g}`, 1024, 160, (c) => {
    c.fillStyle = '#efe9d6'; c.fillRect(0, 0, 1024, 160);
    c.fillStyle = '#2a3a6a'; c.font = 'bold 22px sans-serif'; c.fillText('СХЕМА ЛИНИИ', 20, 30);
    c.strokeStyle = '#b0262a'; c.lineWidth = 10; c.beginPath(); c.moveTo(60, 80); c.lineTo(980, 80); c.stroke();
    MAP_STATIONS.forEach((s, i) => {
      const x = 60 + i * 230;
      c.fillStyle = s ? '#fff' : `rgba(255,255,255,${0.15 + g * 0.85})`; c.strokeStyle = s ? '#b0262a' : `rgba(176,38,42,${0.2 + g * 0.8})`; c.lineWidth = 6;
      c.beginPath(); c.arc(x, 80, 14, 0, 7); c.fill(); c.stroke();
      c.font = 'bold 26px sans-serif'; c.textAlign = 'center';
      if (s) { c.fillStyle = '#1c1c28'; c.fillText(s, x, 132); }
      else { c.fillStyle = `rgba(110,20,20,${g * 0.9})`; c.fillText('ТИХАЯ', x, 132); }
    });
    c.fillStyle = '#2a3a6a'; c.font = '18px sans-serif'; c.textAlign = 'right'; c.fillText('время в пути ~40 мин', 1000, 30);
  }), toneMapped: false}));
};
const boardMat = (txt: string) => std(`board${txt}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`tboard${txt}`, 256, 96, (c) => {
  c.fillStyle = '#080404'; c.fillRect(0, 0, 256, 96);
  c.fillStyle = '#ff3a1a'; c.font = `bold ${txt.length > 5 ? 50 : 70}px monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = '#ff3a1a'; c.shadowBlur = 14; c.fillText(txt, 128, 52);
})}));
const signMat = (name: string, lit: boolean) => std(`sign${name}${lit}`, () => new THREE.MeshBasicMaterial({toneMapped: !lit, map: canvasTex(`tsign${name}${lit}`, 512, 128, (c) => {
  c.fillStyle = lit ? '#1d3fa0' : '#2a3040'; c.fillRect(0, 0, 512, 128);
  c.strokeStyle = '#e8e8e8'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 112);
  c.fillStyle = lit ? '#ffffff' : '#9aa0aa'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(name, 256, 68);
})}));

// ---------- pieces ----------
const Bench: React.FC<{x: number; z: number; dir: 1 | -1}> = ({x, z, dir}) => {
  // a 3-seat wooden bench; dir = the way the sitter faces (+z / -z); z = the seat front edge
  const wood = benchWood(), metal = matte('#5a5e64', 0.35);
  const w = 1.1, back = z - dir * 0.48;
  return (
    <group>
      <Box s={[w, 0.06, 0.48]} p={[x, 0.46, z - dir * 0.24]} m={wood} />
      <Box s={[w, 0.62, 0.06]} p={[x, 0.82, back]} r={[dir * -0.12, 0, 0]} m={wood} />
      <Box s={[w, 0.06, 0.08]} p={[x, 1.16, back - dir * 0.04]} m={wood} />
      {[-1, 1].map((sd) => <Box key={sd} s={[0.04, 0.44, 0.4]} p={[x + sd * (w / 2 - 0.05), 0.22, z - dir * 0.24]} m={metal} />)}
    </group>
  );
};

const Windows: React.FC<{S: TrainState}> = ({S}) => {
  const glass = std('tglass', () => new THREE.MeshBasicMaterial({color: '#a8c4d0', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide}));
  const rainT = S.rain ?? 0;
  const streak = std(`train${Math.round(rainT * 4)}`, () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex(`trainst${Math.round(rainT * 4)}`, 128, 128, (c) => {
    c.clearRect(0, 0, 128, 128); const r = mulberry32(5);
    for (let i = 0; i < 60 * rainT; i++) { c.strokeStyle = `rgba(200,220,235,${0.15 + r() * 0.3})`; c.lineWidth = 1 + r(); c.beginPath(); const x = r() * 128, y = r() * 128; c.moveTo(x, y); c.lineTo(x - 10, y + 6); c.stroke(); }
  })}));
  return (
    <group>
      {[-1, 1].map((sd) => WIN_Z.map((z) => (
        <group key={`${sd}${z}`}>
          <mesh position={[sd * CAR.x1 * 0.995, (WIN.y0 + WIN.y1) / 2, z]} rotation={[0, Math.PI / 2, 0]} material={glass}><planeGeometry args={[WIN.w, WIN.y1 - WIN.y0]} /></mesh>
          {rainT > 0 && <mesh position={[sd * CAR.x1 * 0.99, (WIN.y0 + WIN.y1) / 2, z]} rotation={[0, Math.PI / 2, 0]} material={streak}><planeGeometry args={[WIN.w, WIN.y1 - WIN.y0]} /></mesh>}
          {/* frame: sill + top + the middle transom of the half-opening upper pane */}
          <Box s={[0.08, 0.05, WIN.w + 0.08]} p={[sd * (CAR.x1 - 0.03), WIN.y0, z]} m={matte('#c9ccd0', 0.35)} shadow={false} />
          <Box s={[0.06, 0.05, WIN.w + 0.08]} p={[sd * (CAR.x1 - 0.02), WIN.y1, z]} m={matte('#c9ccd0', 0.35)} shadow={false} />
          <Box s={[0.05, 0.03, WIN.w]} p={[sd * (CAR.x1 - 0.02), WIN.y1 - 0.25, z]} m={matte('#c9ccd0', 0.35)} shadow={false} />
        </group>
      )))}
    </group>
  );
};

// a wall with window holes (pillars between, strips below / above); outside skin green with a red stripe
const SideWall: React.FC<{sd: 1 | -1}> = ({sd}) => {
  const inner = wallMat(), low = lowerWall(), ext = extMat();
  const x = sd * CAR.x1;
  const holes = WIN_Z.map((z) => [z - WIN.w / 2, z + WIN.w / 2]);
  if (sd < 0) holes.push([DOOR.z0, DOOR.z1]);
  holes.sort((a, b) => a[0] - b[0]);
  const solids: [number, number][] = [];
  let z = CAR.z0;
  for (const [a, b] of holes) { if (a > z) solids.push([z, a]); z = b; }
  if (z < CAR.z1) solids.push([z, CAR.z1]);
  const pieces: React.ReactNode[] = [];
  const add = (key: string, z0: number, z1: number, y0: number, y1: number) => {
    const zc = (z0 + z1) / 2, yc = (y0 + y1) / 2, L = z1 - z0, H = y1 - y0;
    pieces.push(
      <group key={key}>
        <Box s={[0.05, H, L]} p={[x + sd * 0.03, yc, zc]} m={ext} shadow={false} />
        <mesh position={[x - sd * 0.002, yc, zc]} rotation={[0, -sd * Math.PI / 2, 0]} material={y1 <= WIN.y0 + 0.001 ? low : inner}><planeGeometry args={[L, H]} /></mesh>
      </group>,
    );
  };
  solids.forEach(([a, b], i) => add(`s${i}`, a, b, 0, CAR.h));
  holes.forEach(([a, b], i) => {
    const door = sd < 0 && a === DOOR.z0;
    if (door) { add(`d${i}`, a, b, DOOR.h, CAR.h); return; }
    add(`l${i}`, a, b, 0, WIN.y0); add(`u${i}`, a, b, WIN.y1, CAR.h);
  });
  return <group>{pieces}</group>;
};

const SideDoor: React.FC<{S: TrainState}> = ({S}) => {
  const L = (DOOR.z1 - DOOR.z0) / 2, slide = S.door * (L - 0.04);
  const leaf = matte('#2f5a3e', 0.5), glass = std('tdoorGlass', () => new THREE.MeshBasicMaterial({color: '#9ab8c4', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide}));
  return (
    <group>
      {[-1, 1].map((sd) => {
        const zc = (DOOR.z0 + DOOR.z1) / 2 + sd * (L / 2 + slide);
        return (
          <group key={sd} position={[CAR.x0 + 0.02, 0, zc]}>
            <Box s={[0.04, 0.95, L]} p={[0, 0.475, 0]} m={leaf} />
            <Box s={[0.04, 0.2, L]} p={[0, DOOR.h - 0.1, 0]} m={leaf} />
            {[-1, 1].map((e) => <Box key={e} s={[0.04, DOOR.h, 0.06]} p={[0, DOOR.h / 2, e * (L / 2 - 0.03)]} m={leaf} />)}
            <mesh position={[0.025, 1.425, 0]} rotation={[0, Math.PI / 2, 0]} material={glass}><planeGeometry args={[L - 0.08, 0.86]} /></mesh>
            <Box s={[0.05, 0.02, L]} p={[0, 0.96, 0]} m={matte('#b8bcc0', 0.3)} shadow={false} />
          </group>
        );
      })}
      {/* yellow edge on the floor at the door */}
      <Box s={[0.4, 0.005, DOOR.z1 - DOOR.z0]} p={[CAR.x0 + 0.2, 0.003, (DOOR.z0 + DOOR.z1) / 2]} m={matte('#c9a22a', 0.6)} shadow={false} />
    </group>
  );
};

const Interior: React.FC<{S: TrainState}> = ({S}) => {
  const {x0, x1, z0, z1, h} = CAR;
  const lampC = new THREE.Color('#f2f6e8').multiplyScalar(0.1 + 1.4 * S.lamps);
  const lampZ = [-7, -4.5, -2, 0.5, 3, 5.5];
  // bench bays: left side has no bench pair at the door bay
  const bays = [-7.9, -5.7, -3.5, -1.3, 0.8, 3.0, 5.2];
  return (
    <group>
      <ambientLight color="#40464e" intensity={0.25 + 0.35 * S.lamps} />
      <mesh position={[0, 0, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={floorMat()} receiveShadow><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[0, h, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]} material={matte('#e6e2d4', 0.9)}><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      {/* the outside roof (seen from the platform / the exterior shot) */}
      <Box s={[x1 - x0 + 0.1, 0.12, z1 - z0]} p={[0, h + 0.07, (z0 + z1) / 2]} m={matte('#3a3e44', 0.6)} shadow={false} />
      <SideWall sd={-1} /><SideWall sd={1} />
      <Windows S={S} />
      <SideDoor S={S} />
      {/* end walls with a door window */}
      {[z0, z1].map((z) => (
        <group key={z}>
          <mesh position={[0, h / 2, z]} rotation={[0, z > 0 ? Math.PI : 0, 0]} material={wallMat()}><planeGeometry args={[x1 - x0, h]} /></mesh>
          <Box s={[0.9, 2.0, 0.05]} p={[0, 1.0, z + (z > 0 ? -0.03 : 0.03)]} m={matte('#7a7e70', 0.5)} shadow={false} />
          <mesh position={[0, 1.45, z + (z > 0 ? -0.06 : 0.06)]} rotation={[0, z > 0 ? Math.PI : 0, 0]}><planeGeometry args={[0.5, 0.6]} /><meshBasicMaterial color="#05070a" /></mesh>
        </group>
      ))}
      {/* the red time board above the far door */}
      <Box s={[0.5, 0.18, 0.04]} p={[BOARD[0], BOARD[1], BOARD[2] - 0.01]} m={matte('#111', 0.4)} shadow={false} />
      <mesh position={[BOARD[0], BOARD[1], BOARD[2] - 0.035]} rotation={[0, Math.PI, 0]} material={boardMat(S.clock)}><planeGeometry args={[0.44, 0.15]} /></mesh>
      {/* the line map above the right window opposite Kostya */}
      <mesh position={MAP_POS} rotation={[0, -Math.PI / 2, 0]} material={mapMat(S.ghost)}><planeGeometry args={[1.6, 0.25]} /></mesh>
      {/* loudspeaker grille in the ceiling */}
      <mesh position={SPEAKER} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[0.13, 24]} /><meshStandardMaterial color="#9a9c98" roughness={0.6} /></mesh>
      {Array.from({length: 5}, (_, i) => <Box key={i} s={[0.2, 0.004, 0.012]} p={[SPEAKER[0], SPEAKER[1] - 0.003, SPEAKER[2] - 0.08 + i * 0.04]} m={matte('#2a2a2a')} shadow={false} />)}
      {/* lamps: two rows of covers along the ceiling */}
      {[-0.55, 0.55].map((x) => lampZ.map((z) => (
        <group key={`${x}${z}`}>
          <mesh position={[x, h - 0.012, z]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.22, 1.5]} /><meshBasicMaterial color={lampC} toneMapped={false} /></mesh>
        </group>
      )))}
      {lampZ.map((z) => <pointLight key={z} position={[0, h - 0.3, z]} color="#eef4e4" intensity={1.5 * S.lamps} distance={4.5} decay={1.4} />)}
      {/* luggage racks + hand rails */}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Box s={[0.32, 0.02, z1 - z0 - 0.4]} p={[sd * 1.25, 1.98, (z0 + z1) / 2]} m={matte('#9a9ea4', 0.3)} shadow={false} />
          <Box s={[0.025, 0.025, z1 - z0 - 0.4]} p={[sd * 1.1, 1.97, (z0 + z1) / 2]} m={matte('#c9ccd0', 0.25)} shadow={false} />
        </group>
      ))}
      {/* benches */}
      {bays.map((zc) => [-1, 1].map((sd) => {
        if (sd < 0 && zc === 3.0) return null;
        const x = sd * 0.92;
        return (
          <group key={`${zc}${sd}`}>
            <Bench x={x} z={zc - 0.48} dir={1} />
            <Bench x={x} z={zc + 0.48} dir={-1} />
          </group>
        );
      }))}
    </group>
  );
};

// ---------- outside ----------
const Platform: React.FC<{S: TrainState}> = ({S}) => {
  const tikhaya = S.place === 'tikhaya', bor = S.place === 'bor', term = S.place === 'terminal';
  const off = S.travel ?? 0;
  const edge = matte('#d8c23a', 0.6), slab = matte(term ? '#8a8682' : '#4a4a4e', 0.9);
  const name = tikhaya ? 'ТИХАЯ' : bor ? 'ЗЕЛЁНЫЙ БОР' : 'КОНЕЧНАЯ';
  const lit = !tikhaya;
  return (
    <group position={[0, 0, off]}>
      <Box s={[5, 1.2, 60]} p={[CAR.x0 - 0.12 - 2.5, -0.62, 0]} m={slab} />
      <Box s={[0.25, 0.02, 60]} p={[CAR.x0 - 0.25, 0.005, 0]} m={edge} shadow={false} />
      {/* lamp posts every 7 m; at «Тихая» they are dead */}
      {[-14, -7, 0, 7, 14].map((z) => (
        <group key={z}>
          <Box s={[0.08, 3.4, 0.08]} p={[CAR.x0 - 2.6, 1.7, z + 1.5]} m={matte('#2a2c30', 0.5)} />
          <Box s={[0.6, 0.06, 0.12]} p={[CAR.x0 - 2.35, 3.38, z + 1.5]} m={matte('#2a2c30', 0.5)} />
          <mesh position={[CAR.x0 - 2.1, 3.3, z + 1.5]}><sphereGeometry args={[0.1, 12, 8]} /><meshBasicMaterial color={new THREE.Color(lit ? '#ffcf8a' : '#3a3c40').multiplyScalar(lit ? 2 * (1 - S.dawn * 0.8) : 1)} toneMapped={!lit} /></mesh>
          {lit && <pointLight position={[CAR.x0 - 2.1, 3.1, z + 1.5]} color="#ffc070" intensity={2.4 * (1 - S.dawn * 0.7)} distance={7} decay={1.5} />}
        </group>
      ))}
      {/* the station sign on two legs, facing the train */}
      {[-6, 6].map((z) => (
        <group key={z}>
          {[-0.9, 0.9].map((d) => <Box key={d} s={[0.06, 2.4, 0.06]} p={[CAR.x0 - 3.2, 1.2, z + d]} m={matte('#2a2c30', 0.5)} />)}
          <mesh position={[CAR.x0 - 3.17, 2.3, z]} rotation={[0, Math.PI / 2, 0]} material={signMat(name, lit)}><planeGeometry args={[2.2, 0.55]} /></mesh>
        </group>
      ))}
      {/* a bench + a fence at the back of the platform */}
      <Box s={[0.4, 0.45, 1.6]} p={[CAR.x0 - 4.3, 0.22, -2.5]} m={matte('#6a4a30', 0.7)} />
      {Array.from({length: 30}, (_, i) => <Box key={i} s={[0.04, 1.0, 0.04]} p={[CAR.x0 - 5.0, 0.5, -29 + i * 2]} m={matte('#3a3c40', 0.6)} shadow={false} />)}
      <Box s={[0.04, 0.05, 60]} p={[CAR.x0 - 5.0, 0.95, 0]} m={matte('#3a3c40', 0.6)} shadow={false} />
      {bor && <House />}
    </group>
  );
};

// his house beyond the «Зелёный Бор» platform: a five-storey block, one warm window lit (his room)
export const HOUSE_WIN: V3 = [CAR.x0 - 11.6, 3.6, 0.8];
const House: React.FC = () => (
  <group>
    <Box s={[1.0, 9, 14]} p={[CAR.x0 - 12.2, 4.5, 0.8]} m={matte('#3a3a44', 0.9)} shadow={false} />
    {Array.from({length: 5}, (_, fl) => Array.from({length: 7}, (_, k) => {
      const on = (fl === 1 && k === 3) || (fl * 7 + k) % 9 === 4;
      return (
        <mesh key={`${fl}${k}`} position={[CAR.x0 - 11.68, 1.2 + fl * 1.6, 0.8 - 6 + k * 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 0.9]} />
          <meshBasicMaterial color={new THREE.Color(on ? '#ffc870' : '#1a1c24').multiplyScalar(on ? 1.6 : 1)} toneMapped={!on} />
        </mesh>
      );
    }))}
    <pointLight position={[HOUSE_WIN[0] + 0.6, HOUSE_WIN[1], HOUSE_WIN[2]]} color="#ffc070" intensity={1.2} distance={4} decay={1.5} />
  </group>
);

// night on the move: poles, trees and rare lights fly past on both sides
const Night: React.FC<{S: TrainState}> = ({S}) => {
  const span = 80, off = ((S.t * S.speed + (S.travel ?? 0)) % span + span) % span;
  const r = mulberry32(42);
  const trees = Array.from({length: 46}, (_, i) => ({sd: i % 2 ? 1 : -1, z: r() * span, x: 5 + r() * 9, h: 4 + r() * 6}));
  return (
    <group>
      <hemisphereLight args={['#4a5a7a', '#0a0a0c', 0.35]} />
      <directionalLight position={[-8, 10, 6]} color="#9ab0d8" intensity={0.35} />
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[60, 120]} /><meshStandardMaterial color="#0c0e10" roughness={1} /></mesh>
      {[-12, -4, 4, 12].map((z0) => [0, 1].map((k) => {
        const z = ((z0 * 5 + off) % span) - span / 2;
        return <Box key={`${z0}${k}`} s={[0.08, 4.2, 0.08]} p={[(k ? 1 : -1) * 3.0, 0.9, z]} m={matte('#1e2024', 0.6)} shadow={false} />;
      }))}
      {trees.map((tr, i) => {
        const z = ((tr.z - off) % span + span) % span - span / 2;
        return (
          <mesh key={i} position={[tr.sd * tr.x, tr.h / 2 - 1.1, z]}>
            <coneGeometry args={[1.1, tr.h, 7]} /><meshStandardMaterial color="#0a0f0c" roughness={1} />
          </mesh>
        );
      })}
      {/* a rare level-crossing light rushing past */}
      {[0, 40].map((z0) => {
        const z = ((z0 - off * 1.0) % span + span) % span - span / 2;
        return (
          <group key={z0}>
            <mesh position={[-4, 1.8, z]}><sphereGeometry args={[0.12, 10, 8]} /><meshBasicMaterial color={new THREE.Color('#ffb060').multiplyScalar(2)} toneMapped={false} /></mesh>
            <pointLight position={[-3.6, 1.6, z]} color="#ffb060" intensity={2} distance={6} decay={1.5} />
          </group>
        );
      })}
    </group>
  );
};

// the morning sky, ordinary people are 2D puppets placed by the shots
const Sky: React.FC<{S: TrainState}> = ({S}) => {
  const sky = new THREE.Color(S.place === 'tikhaya' ? '#0b0e10' : '#04060a').lerp(new THREE.Color('#c9b6b0'), S.dawn);
  return (
    <group>
      <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[120, 30]} /><meshBasicMaterial color={sky} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[25, 5, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[120, 30]} /><meshBasicMaterial color={sky} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      <hemisphereLight args={['#ffe4d0', '#3a3a40', 1.1 * S.dawn]} />
      {S.dawn > 0 && <directionalLight position={[-6, 6, 4]} color="#ffd8b0" intensity={1.4 * S.dawn} />}
    </group>
  );
};

// rails under the car (seen in the exterior shot)
const Rails: React.FC = () => (
  <group>
    {[-0.75, 0.75].map((x) => <Box key={x} s={[0.08, 0.1, 120]} p={[x, -1.1, 0]} m={matte('#4a4a50', 0.4)} shadow={false} />)}
    <Box s={[3.2, 0.9, 16]} p={[0, -0.6, (CAR.z0 + CAR.z1) / 2]} m={matte('#1a1c20', 0.8)} shadow={false} />
  </group>
);

export const TrainSet: React.FC<{S: TrainState; exterior?: boolean}> = ({S, exterior}) => (
  <group>
    <Interior S={S} />
    <Sky S={S} />
    {S.place === 'night' ? <Night S={S} /> : <Platform S={S} />}
    {(exterior || S.place === 'night') && <Rails />}
  </group>
);

// quads (3D) for clipping puppets outside behind the glass: all left windows + the door opening
export const quadX = (x: number, za: number, zb: number, ya: number, yb: number): V3[] => [[x, ya, za], [x, ya, zb], [x, yb, zb], [x, yb, za]];
export const LEFT_OPENINGS: V3[][] = [
  ...WIN_Z.map((z) => quadX(CAR.x0, z - WIN.w / 2, z + WIN.w / 2, WIN.y0, WIN.y1)),
  quadX(CAR.x0, DOOR.z0, DOOR.z1, 0, DOOR.h),
];
export const mixV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
