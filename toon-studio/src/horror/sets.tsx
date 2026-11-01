// The other 3D sets: Tyoma's bedroom, the stairwell landing outside the front door, grandma's kitchen (flashback).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, glow, matte, rep, std} from './common';

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1) =>
  std(`tx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(k, w, h, draw).clone(), rx, ry), roughness: 0.9}));

// ---------- shared bits ----------
export const Snow: React.FC<{t: number; box: [number, number, number, number, number, number]; n?: number; seed?: number}> = ({t, box, n = 160, seed = 11}) => {
  const [x0, x1, y0, y1, z0, z1] = box;
  const flakes = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({length: n}, () => ({x: x0 + r() * (x1 - x0), y: r(), z: z0 + r() * (z1 - z0), v: 0.25 + r() * 0.3, p: r() * 6}));
  }, [n, seed, x0, x1, z0, z1]);
  const attr = useMemo(() => new THREE.BufferAttribute(new Float32Array(n * 3), 3), [n]);
  useLayoutEffect(() => {
    const H = y1 - y0;
    flakes.forEach((s, i) => attr.setXYZ(i, s.x + Math.sin(t * 1.3 + s.p) * 0.08 + t * 0.05, y1 - ((s.y * H + t * s.v) % H), s.z));
    attr.needsUpdate = true;
  });
  const m = std('snow', () => new THREE.PointsMaterial({color: '#dfe7ff', size: 0.028, transparent: true, opacity: 0.85, depthWrite: false}));
  return <points material={m}><bufferGeometry><primitive object={attr} attach="attributes-position" /></bufferGeometry></points>;
};

const Spot: React.FC<{p: V3; to: V3; c: string; i: number; angle?: number; pen?: number; dist?: number; shadow?: boolean}> = ({p, to, c, i, angle = 0.6, pen = 0.6, dist = 8, shadow = true}) => {
  const ref = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => { if (ref.current) { ref.current.target.position.set(...to); ref.current.target.updateMatrixWorld(); } });
  return <spotLight ref={ref} position={p} color={c} intensity={i} distance={dist} decay={1.5} angle={angle} penumbra={pen} castShadow={shadow} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />;
};

// night city across the street: dark blocks with a few lit windows + sky with moon
const NightOutside: React.FC<{z: number; x: number; t: number}> = ({z, x, t}) => {
  const sky = std('sky', () => new THREE.MeshBasicMaterial({map: canvasTex('skyN', 8, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#05081a'); g.addColorStop(0.7, '#16204a'); g.addColorStop(1, '#2a2d55');
    c.fillStyle = g; c.fillRect(0, 0, 8, 256);
  }), fog: false}));
  const blocks = std('blocks', () => new THREE.MeshBasicMaterial({map: canvasTex('blocks', 512, 256, (c) => {
    c.clearRect(0, 0, 512, 256);
    const r = mulberry32(4);
    let xx = 0;
    while (xx < 512) {
      const w = 60 + r() * 90, h = 90 + r() * 140;
      c.fillStyle = '#0a0d1c'; c.fillRect(xx, 256 - h, w, h);
      for (let wy = 256 - h + 10; wy < 250; wy += 16) for (let wx = xx + 8; wx < xx + w - 8; wx += 14)
        if (r() < 0.12) { c.fillStyle = r() < 0.7 ? '#ffcf7a' : '#9fc4ff'; c.fillRect(wx, wy, 7, 9); }
      xx += w + 4;
    }
  }), transparent: true, fog: false}));
  return (
    <group>
      <mesh position={[x, 2, z - 3]} material={sky}><planeGeometry args={[14, 9]} /></mesh>
      <mesh position={[x + 1.4, 3.6, z - 2.9]}><circleGeometry args={[0.32, 32]} /><meshBasicMaterial color={new THREE.Color('#e9efff').multiplyScalar(1.6)} toneMapped={false} fog={false} /></mesh>
      <mesh position={[x, 0.6, z - 2]} material={blocks}><planeGeometry args={[9, 4.5]} /></mesh>
      <Snow t={t} box={[x - 1.5, x + 1.5, -1, 3.5, z - 1.6, z - 0.2]} />
    </group>
  );
};

// ---------- bedroom ----------
export const BED = {head: [-1.0, 0.56, -1.28] as V3, sit: [-1.0, 0.5, -0.95] as V3, door: {x: 0.6, w: 0.8, h: 2.02, z: 1.6}, corner: [-1.28, 0, -1.47] as V3, clock: [-0.32, 0.6, -1.36] as V3};

export type BedroomState = {t: number; moon: number; gap: number; feet: number; clockOn: number; blanketUp: number; doorOpen?: number};

export const Bedroom3D: React.FC<{S: BedroomState}> = ({S}) => {
  const W = 1.5, D = 1.6, H = 2.6;
  const wall = tex('kidwall', 256, 256, (c) => {
    c.fillStyle = '#34405e'; c.fillRect(0, 0, 256, 256);
    const r = mulberry32(9);
    for (let i = 0; i < 18; i++) {
      const x = r() * 256, y = r() * 256, s = 4 + r() * 6;
      c.fillStyle = 'rgba(230,220,170,0.22)'; c.beginPath();
      for (let k = 0; k < 10; k++) { const a = (k * Math.PI) / 5, rr = k % 2 ? s * 0.45 : s; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      c.fill();
    }
  }, 3, 2.5);
  const floor = tex('kidfloor', 256, 256, (c) => {
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#5c4130' : '#654735'; c.fillRect(i * 64, 0, 64, 256); c.fillStyle = '#2a1a10'; c.fillRect(i * 64, 0, 2, 256); }
  }, 2, 2);
  const plaid = tex('plaid', 128, 128, (c) => {
    c.fillStyle = '#7a2e33'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = 'rgba(30,40,80,0.55)'; for (let i = 0; i < 128; i += 32) { c.fillRect(i, 0, 12, 128); c.fillRect(0, i, 128, 12); }
    c.fillStyle = 'rgba(240,220,180,0.25)'; for (let i = 16; i < 128; i += 32) { c.fillRect(i, 0, 3, 128); c.fillRect(0, i, 128, 3); }
  }, 2, 3);
  const poster = std('poster', () => new THREE.MeshStandardMaterial({map: canvasTex('poster', 128, 192, (c) => {
    c.fillStyle = '#1b2547'; c.fillRect(0, 0, 128, 192);
    c.fillStyle = '#e8e2d0'; c.beginPath(); c.moveTo(64, 30); c.quadraticCurveTo(84, 70, 78, 130); c.lineTo(50, 130); c.quadraticCurveTo(44, 70, 64, 30); c.fill();
    c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(50, 110); c.lineTo(36, 145); c.lineTo(52, 130); c.fill(); c.beginPath(); c.moveTo(78, 110); c.lineTo(92, 145); c.lineTo(76, 130); c.fill();
    c.fillStyle = '#f5a623'; c.beginPath(); c.moveTo(54, 132); c.lineTo(64, 170); c.lineTo(74, 132); c.fill();
    c.fillStyle = '#e8e2d0'; for (let i = 0; i < 20; i++) c.fillRect((i * 37) % 128, (i * 53) % 192, 2, 2);
  }), roughness: 0.8}));
  const clockM = std('clock', () => new THREE.MeshBasicMaterial({map: canvasTex('clock0300', 256, 96, (c) => {
    c.fillStyle = '#080506'; c.fillRect(0, 0, 256, 96);
    c.fillStyle = '#ff3326'; c.font = 'bold 74px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('03:00', 128, 52);
  }), toneMapped: false}));
  const doorM = matte('#8f8a80', 0.7), trim = matte('#5f5850', 0.7);
  const {x: dx, w: dw, h: dh, z: dz} = BED.door;
  const wx0 = -0.9, wx1 = 0.1, wy0 = 0.9, wy1 = 2.1;
  return (
    <group>
      <ambientLight color="#2e3a66" intensity={0.25} />
      <hemisphereLight args={['#304070', '#0c0806', 0.2]} />
      <Spot p={[-1.0, 3.6, -4.4]} to={[-1.0, 0.4, -0.5]} c="#86a2ff" i={60 * S.moon} angle={0.3} pen={0.3} dist={9} />
      <pointLight position={[dx, 0.04, dz - 0.1]} color="#ffb05e" intensity={0.45 * S.gap} distance={1.4} decay={2} />
      <pointLight position={[0.2, 1.6, 0.6]} color="#6f86d8" intensity={0.9 * S.moon} distance={3} decay={1.6} />
      <pointLight position={[BED.clock[0], BED.clock[1] + 0.1, BED.clock[2] + 0.15]} color="#ff3020" intensity={0.25 * S.clockOn} distance={1.2} decay={2} />
      {/* shell */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floor} receiveShadow><planeGeometry args={[2 * W, 2 * D]} /></mesh>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2 * W, 2 * D]} /><meshStandardMaterial color="#5a5e70" roughness={1} /></mesh>
      <mesh position={[-W, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wall} receiveShadow><planeGeometry args={[2 * D, H]} /></mesh>
      <mesh position={[W, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={wall} receiveShadow><planeGeometry args={[2 * D, H]} /></mesh>
      {/* back wall around the window */}
      <mesh position={[(-W + wx0) / 2, H / 2, -D]} material={wall} receiveShadow><planeGeometry args={[wx0 + W, H]} /></mesh>
      <mesh position={[(wx1 + W) / 2, H / 2, -D]} material={wall} receiveShadow><planeGeometry args={[W - wx1, H]} /></mesh>
      <mesh position={[(wx0 + wx1) / 2, wy0 / 2, -D]} material={wall} receiveShadow><planeGeometry args={[wx1 - wx0, wy0]} /></mesh>
      <mesh position={[(wx0 + wx1) / 2, (wy1 + H) / 2, -D]} material={wall} receiveShadow><planeGeometry args={[wx1 - wx0, H - wy1]} /></mesh>
      {/* window frame + cross (casts the moon pattern on the bed) */}
      {[[wx0, 0.05, wy1 - wy0], [wx1, 0.05, wy1 - wy0]].map(([x, w, h], i) => <Box key={i} s={[w, h, 0.12]} p={[x, (wy0 + wy1) / 2, -D]} m={trim} />)}
      <Box s={[wx1 - wx0, 0.05, 0.12]} p={[(wx0 + wx1) / 2, wy1, -D]} m={trim} />
      <Box s={[wx1 - wx0 + 0.1, 0.05, 0.22]} p={[(wx0 + wx1) / 2, wy0, -D + 0.05]} m={trim} />
      <Box s={[0.04, wy1 - wy0, 0.06]} p={[(wx0 + wx1) / 2, (wy0 + wy1) / 2, -D]} m={trim} />
      <Box s={[wx1 - wx0, 0.04, 0.06]} p={[(wx0 + wx1) / 2, 1.55, -D]} m={trim} />
      <NightOutside z={-D} x={(wx0 + wx1) / 2} t={S.t} />
      {/* front wall with the bedroom door */}
      <mesh position={[(-W + dx - dw / 2) / 2, H / 2, D]} rotation={[0, Math.PI, 0]} material={wall} receiveShadow><planeGeometry args={[dx - dw / 2 + W, H]} /></mesh>
      <mesh position={[(dx + dw / 2 + W) / 2, H / 2, D]} rotation={[0, Math.PI, 0]} material={wall} receiveShadow><planeGeometry args={[W - dx - dw / 2, H]} /></mesh>
      <mesh position={[dx, (dh + H) / 2, D]} rotation={[0, Math.PI, 0]} material={wall} receiveShadow><planeGeometry args={[dw, H - dh]} /></mesh>
      <mesh position={[dx, dh / 2, dz + 0.12]} rotation={[0, Math.PI, 0]}><planeGeometry args={[dw + 0.1, dh]} /><meshBasicMaterial color={new THREE.Color('#ffb768').multiplyScalar(1.5 * S.gap)} toneMapped={false} /></mesh>
      {[-0.07, 0.07].map((o, i) => <Box key={i} s={[0.1, 0.05, 0.26]} p={[dx + S.feet + o, 0.025, dz + 0.08]} m={matte('#030202')} shadow={false} />)}
      <group position={[dx - dw / 2, 0, dz - 0.02]} rotation={[0, -(S.doorOpen ?? 0) * 0.5, 0]}>
        <Box s={[dw - 0.02, dh - 0.025, 0.04]} p={[dw / 2, 0.025 + (dh - 0.025) / 2, 0]} m={doorM} />
        <Box s={[dw - 0.2, 0.7, 0.01]} p={[dw / 2, 1.45, -0.025]} m={matte('#827d74', 0.7)} />
        <Box s={[dw - 0.2, 0.8, 0.01]} p={[dw / 2, 0.55, -0.025]} m={matte('#827d74', 0.7)} />
        <Box s={[0.12, 0.025, 0.03]} p={[dw - 0.12, 0.98, -0.05]} m={std('brassB', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85}))} />
        <Box s={[0.04, 0.12, 0.012]} p={[dw - 0.1, 0.98, -0.026]} m={std('brassB', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85}))} />
      </group>
      <Box s={[0.06, dh, 0.08]} p={[dx - dw / 2 - 0.03, dh / 2, dz - 0.02]} m={trim} />
      <Box s={[0.06, dh, 0.08]} p={[dx + dw / 2 + 0.03, dh / 2, dz - 0.02]} m={trim} />
      <Box s={[dw + 0.12, 0.06, 0.08]} p={[dx, dh + 0.03, dz - 0.02]} m={trim} />
      {/* bed */}
      <Box s={[0.95, 0.32, 2.05]} p={[-1.0, 0.16, -0.55]} m={matte('#4a3326', 0.7)} />
      <Box s={[0.95, 0.9, 0.06]} p={[-1.0, 0.45, -1.56]} m={matte('#4a3326', 0.7)} />
      <Box s={[0.88, 0.12, 2.0]} p={[-1.0, 0.38, -0.55]} m={matte('#c9c6c0', 0.95)} />
      <mesh position={[-1.0, 0.5, -1.32]} material={matte('#d8d6d2', 0.95)} castShadow receiveShadow scale={[1, 0.38, 0.55]}><sphereGeometry args={[0.32, 24, 16]} /></mesh>
      {/* blanket: lumpy over the legs, folded back when he sits up */}
      <group position={[-1.0, 0.45, -0.38 + S.blanketUp * 0.25]}>
        <Box s={[0.92, 0.1, 1.45 - S.blanketUp * 0.5]} p={[0, 0, 0]} m={plaid} />
        <mesh position={[0.05, 0.06, 0.1]} material={plaid} castShadow receiveShadow scale={[0.8, 0.22, 1.8 - S.blanketUp * 0.6]}><sphereGeometry args={[0.32, 20, 14]} /></mesh>
      </group>
      {/* nightstand + clock */}
      <Box s={[0.42, 0.5, 0.4]} p={[-0.32, 0.25, -1.36]} m={matte('#3b2a20', 0.7)} />
      <Box s={[0.24, 0.1, 0.08]} p={[BED.clock[0], 0.55, BED.clock[2]]} m={matte('#111')} />
      <mesh position={[BED.clock[0], 0.555, BED.clock[2] + 0.041]} material={clockM}><planeGeometry args={[0.22 * S.clockOn + 0.0001, 0.08]} /></mesh>
      {/* wardrobe on the right wall, the far right corner stays empty and dark */}
      <Box s={[0.55, 2.1, 1.1]} p={[W - 0.28, 1.05, 0.45]} m={matte('#3f2e24', 0.6)} />
      <Box s={[0.01, 1.9, 0.01]} p={[W - 0.56, 1.05, 0.45]} m={matte('#1a120c')} />
      {/* poster above the bed, rug */}
      <mesh position={[-W + 0.01, 1.55, -0.4]} rotation={[0, Math.PI / 2, 0]} material={poster}><planeGeometry args={[0.5, 0.75]} /></mesh>
      <Box s={[1.0, 0.01, 1.4]} p={[0.15, 0.005, -0.1]} m={matte('#3a4466')} shadow={false} />
      {/* toy car + books on the floor */}
      <Box s={[0.14, 0.06, 0.08]} p={[0.2, 0.03, 0.3]} m={matte('#b8322e', 0.5)} r={[0, 0.6, 0]} />
      <Box s={[0.22, 0.05, 0.3]} p={[-0.25, 0.025, -0.6]} m={matte('#556b8a')} r={[0, -0.3, 0]} />
    </group>
  );
};

// ---------- stairwell landing (outside our front door, door on the plane z = 0 facing +z) ----------
export type LandingState = {t: number; lamp: number};
export const Landing3D: React.FC<{S: LandingState}> = ({S}) => {
  const W = 1.6, D = 2.3, H = 2.7;
  const paint = tex('twotone', 256, 512, (c) => {
    c.fillStyle = '#c9c4b0'; c.fillRect(0, 0, 256, 512);
    c.fillStyle = '#2f5a48'; c.fillRect(0, 512 * 0.48, 256, 512 * 0.52);
    c.fillStyle = '#1f3d30'; c.fillRect(0, 512 * 0.48, 256, 6);
    const r = mulberry32(14);
    for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(40,30,15,${0.04 + r() * 0.08})`; c.beginPath(); c.ellipse(r() * 256, r() * 512, 4 + r() * 40, 6 + r() * 50, 0, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(30,25,20,0.4)'; c.lineWidth = 1;
    for (let i = 0; i < 12; i++) { c.beginPath(); let x = r() * 256, y = r() * 240; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 30; y += r() * 20; c.lineTo(x, y); } c.stroke(); }
  }, 2, 1);
  const tiles = tex('tiles', 256, 256, (c) => {
    const r = mulberry32(8);
    for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) { c.fillStyle = (x + y) % 64 ? '#8a5a3c' : '#c4a27a'; c.fillRect(x, y, 32, 32); c.fillStyle = `rgba(0,0,0,${r() * 0.15})`; c.fillRect(x, y, 32, 32); }
    c.strokeStyle = '#2a1c12'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
  }, 4, 3);
  const leather = std('doorOut', () => new THREE.MeshStandardMaterial({map: canvasTex('doorOut', 256, 512, (c) => {
    c.fillStyle = '#3e241c'; c.fillRect(0, 0, 256, 512);
    for (let y = 0; y < 512; y += 48) for (let x = 0; x < 256; x += 48) { c.fillStyle = '#9c7a48'; c.beginPath(); c.arc(x + 24, y + 24, 3, 0, 7); c.fill(); }
    c.fillStyle = '#c8a25a'; c.font = 'bold 54px serif'; c.textAlign = 'center'; c.fillText('43', 128, 150);
  }), roughness: 0.5}));
  const lampOn = S.lamp;
  return (
    <group>
      <ambientLight color="#3a3420" intensity={0.25} />
      <pointLight position={[0.75, 2.25, 0.25]} color="#ffd27a" intensity={4 * lampOn} distance={5} decay={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <mesh position={[0, 0, D / 2]} rotation={[-Math.PI / 2, 0, 0]} material={tiles} receiveShadow><planeGeometry args={[2 * W, D]} /></mesh>
      <mesh position={[0, H, D / 2]} rotation={[Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2 * W, D]} /><meshStandardMaterial color="#8f8b7c" roughness={1} /></mesh>
      <mesh position={[0, H / 2, 0]} material={paint} receiveShadow><planeGeometry args={[2 * W, H]} /></mesh>
      <mesh position={[-W, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]} material={paint} receiveShadow><planeGeometry args={[D, H]} /></mesh>
      <mesh position={[0, H / 2, D]} rotation={[0, Math.PI, 0]} material={paint} receiveShadow><planeGeometry args={[2 * W, H]} /></mesh>
      {/* our door (outside) */}
      <Box s={[0.9, 2.04, 0.05]} p={[0, 1.02, 0.03]} m={leather} />
      <mesh position={[0, 1.52, 0.06]} rotation={[Math.PI / 2, 0, 0]} material={std('brassL', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85}))}><cylinderGeometry args={[0.02, 0.024, 0.02, 16]} /></mesh>
      {/* neighbour door on the left wall, window + radiator opposite, stairs down on the right */}
      <Box s={[0.05, 2.0, 0.85]} p={[-W + 0.03, 1.0, 1.1]} m={matte('#4a3a30', 0.6)} />
      <mesh position={[-W + 0.06, 1.0, 1.4]} material={std('brassL', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85}))}><sphereGeometry args={[0.03, 10, 8]} /></mesh>
      <mesh position={[0.3, 1.6, D - 0.01]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.9, 0.9]} /><meshBasicMaterial color="#060914" /></mesh>
      <Box s={[0.96, 0.05, 0.05]} p={[0.3, 1.6, D - 0.03]} m={matte('#6e6a5e')} />
      <Box s={[0.05, 0.96, 0.05]} p={[0.3, 1.6, D - 0.03]} m={matte('#6e6a5e')} />
      <Box s={[0.8, 0.5, 0.08]} p={[0.3, 0.45, D - 0.06]} m={matte('#7b7a6f', 0.5)} />
      <Snow t={S.t} box={[-0.15, 0.75, 1.15, 2.05, D + 0.3, D + 1.5]} n={50} seed={3} />
      <Box s={[0.05, 1.0, D - 0.6]} p={[W - 0.25, 0.5, 1.4]} m={matte('#2c2a26', 0.4)} />
      <Box s={[0.08, 0.06, D - 0.5]} p={[W - 0.25, 1.0, 1.4]} m={matte('#5a3424', 0.5)} />
      <mesh position={[W - 0.1, -0.6, 1.4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.4, D]} /><meshBasicMaterial color="#020203" /></mesh>
      {/* caged wall lamp above the door */}
      <Box s={[0.14, 0.05, 0.12]} p={[0.75, 2.3, 0.06]} m={matte('#3a3a3a')} />
      <mesh position={[0.75, 2.22, 0.12]}><sphereGeometry args={[0.05, 14, 10]} /><meshBasicMaterial color={new THREE.Color('#ffe2a0').multiplyScalar(0.2 + 2.2 * lampOn)} toneMapped={false} /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[0.75, 2.22, 0.12]} rotation={[0, (i * Math.PI) / 4, 0]} material={matte('#222')}><torusGeometry args={[0.065, 0.004, 4, 16]} /></mesh>)}
      {/* electricity panel */}
      <Box s={[0.5, 0.7, 0.1]} p={[-1.0, 1.7, 0.06]} m={matte('#55625a', 0.6)} />
    </group>
  );
};

// ---------- grandma's kitchen (flashback, rendered in sepia) ----------
export const KIT = {gran: [0.08, 0, -0.75] as V3, table: [0, 0.78, 0.15] as V3, candle: [0.22, 0.78, 0.25] as V3};
export type KitchenState = {t: number; candle: number};
export const OldKitchen3D: React.FC<{S: KitchenState}> = ({S}) => {
  const W = 1.6, D = 1.6, H = 2.5;
  const paper = tex('oldpaper', 256, 256, (c) => {
    c.fillStyle = '#b9a07a'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = 'rgba(120,70,40,0.25)';
    for (let y = 16; y < 256; y += 48) for (let x = 16; x < 256; x += 48) { c.beginPath(); c.arc(x + ((y / 48) % 2) * 24, y, 7, 0, 7); c.fill(); }
  }, 3, 2.5);
  const oilcloth = tex('oilcloth', 128, 128, (c) => {
    for (let y = 0; y < 128; y += 16) for (let x = 0; x < 128; x += 16) { c.fillStyle = (x + y) % 32 ? '#a89c86' : '#7a2a26'; c.fillRect(x, y, 16, 16); }
  }, 3, 2);
  const fl = 0.85 + Math.sin(S.t * 13) * 0.06 + Math.sin(S.t * 29) * 0.05;
  const _lace = std('lace', () => new THREE.MeshBasicMaterial({map: canvasTex('lace', 128, 128, (c) => {
    c.fillStyle = 'rgba(150,145,135,0.25)'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(170,165,150,0.3)'; c.lineWidth = 1;
    for (let y = 4; y < 128; y += 8) for (let x = 4; x < 128; x += 8) { c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.stroke(); }
  }), transparent: true}));
  return (
    <group>
      <ambientLight color="#4a3a2a" intensity={0.2} />
      <pointLight position={[KIT.candle[0], KIT.candle[1] + 0.22, KIT.candle[2]]} color="#ffb060" intensity={2.0 * S.candle * fl} distance={5} decay={1.7} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <Spot p={[-0.3, 2.2, -2.6]} to={[0, 0.8, 0]} c="#9fb0d0" i={8} angle={0.5} pen={0.8} shadow={false} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2 * W, 2 * D]} /><meshStandardMaterial color="#5a4030" roughness={0.8} /></mesh>
      <mesh position={[0, H / 2, -D]} material={paper} receiveShadow><planeGeometry args={[2 * W, H]} /></mesh>
      <mesh position={[-W, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={paper} receiveShadow><planeGeometry args={[2 * D, H]} /></mesh>
      <mesh position={[W, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={paper} receiveShadow><planeGeometry args={[2 * D, H]} /></mesh>
      {/* window with lace */}
      <mesh position={[-0.3, 1.5, -D + 0.01]}><planeGeometry args={[0.8, 0.9]} /><meshBasicMaterial color="#1a2238" /></mesh>
      {[-0.62, 0.02].map((x, i) => <Box key={i} s={[0.2, 1.0, 0.03]} p={[x, 1.5, -D + 0.05]} m={matte('#8a7a62', 0.95)} />)}
      <Box s={[0.9, 0.05, 0.15]} p={[-0.3, 1.04, -D + 0.07]} m={matte('#d8d0c0')} />
      {/* table with oilcloth, candle, cup */}
      <Box s={[1.0, 0.04, 0.7]} p={[KIT.table[0], KIT.table[1] - 0.02, KIT.table[2]]} m={oilcloth} />
      {[[-0.45, -0.3], [0.45, -0.3], [-0.45, 0.3], [0.45, 0.3]].map(([x, z], i) => <Box key={i} s={[0.05, 0.76, 0.05]} p={[x, 0.38, KIT.table[2] + z]} m={matte('#4a3324')} />)}
      <mesh position={[KIT.candle[0], KIT.candle[1] + 0.08, KIT.candle[2]]} material={matte('#eee6d2', 0.6)} castShadow><cylinderGeometry args={[0.022, 0.022, 0.16, 12]} /></mesh>
      <mesh position={[KIT.candle[0], KIT.candle[1] + 0.185, KIT.candle[2]]} scale={[1, 1.8 * fl, 1]}><sphereGeometry args={[0.013, 10, 8]} /><meshBasicMaterial color={new THREE.Color('#ffd28a').multiplyScalar(3 * S.candle)} toneMapped={false} /></mesh>
      <mesh position={[KIT.candle[0], KIT.candle[1] + 0.005, KIT.candle[2]]} material={matte('#8a8478', 0.4)}><cylinderGeometry args={[0.06, 0.07, 0.01, 16]} /></mesh>
      <mesh position={[-0.2, KIT.table[1] + 0.045, KIT.table[2] + 0.05]} material={matte('#e8e4dc', 0.4)} castShadow><cylinderGeometry args={[0.04, 0.035, 0.09, 16]} /></mesh>
      {/* stove + kettle on the left */}
      <Box s={[0.6, 0.85, 0.6]} p={[-W + 0.32, 0.425, -0.9]} m={matte('#e4e0d6', 0.35)} />
      <Box s={[0.5, 0.3, 0.02]} p={[-W + 0.32, 0.45, -0.59]} m={matte('#2a2826', 0.3)} />
      <mesh position={[-W + 0.32, 0.95, -0.95]} material={matte('#5d6f80', 0.3)} castShadow><sphereGeometry args={[0.12, 20, 14]} /></mesh>
      {/* shelf with jars, wall clock */}
      <Box s={[0.9, 0.03, 0.22]} p={[0.9, 1.75, -D + 0.12]} m={matte('#5a3e2a')} />
      {[0.6, 0.8, 1.0, 1.2].map((x, i) => <mesh key={i} position={[x, 1.84, -D + 0.12]} material={matte(['#8a6a3a', '#a0603a', '#6b7a4a', '#9a8a5a'][i], 0.3)}><cylinderGeometry args={[0.05, 0.05, 0.16, 12]} /></mesh>)}
      <mesh position={[W - 0.02, 1.8, 0.2]} rotation={[0, -Math.PI / 2, 0]} material={matte('#e8e2d2', 0.5)}><circleGeometry args={[0.16, 24]} /></mesh>
      <Box s={[0.02, 0.26, 0.02]} p={[W - 0.03, 1.5, 0.2 + Math.sin(S.t * 3.1) * 0.06]} m={matte('#8a6a3a')} />
    </group>
  );
};
