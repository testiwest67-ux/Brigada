// 3D night hallway of an old flat: wallpaper, plank floor, padded front door with a peephole,
// stairwell light leaking through the gaps (with feet passing outside), a flickering bare bulb,
// cold moonlight spilling from the bedroom doorway, fog and dust.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {canvasTex, V3} from '../toon/three/toon3d';
import {Post3D} from './post3d';
import {mulberry32} from '../toon/lib/anim';
import {CamPose} from './cam';

export const HALL = {w: 1.5, h: 2.6, z0: -3.0, z1: 2.8, door: {x: 0.05, w: 0.86, h: 2.02}, bulb: [0, 2.42, -0.9] as V3};

// ---------- materials ----------
const mats = new Map<string, THREE.Material>();
const std = (k: string, make: () => THREE.Material) => { if (!mats.has(k)) mats.set(k, make()); return mats.get(k)!; };
const rep = (t: THREE.Texture, x: number, y: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); t.needsUpdate = true; return t; };

const wallpaper = () => canvasTex('wallpaper', 256, 512, (c) => {
  c.fillStyle = '#4a5642'; c.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x += 64) { c.fillStyle = 'rgba(210,200,150,0.07)'; c.fillRect(x + 8, 0, 18, 512); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(x + 40, 0, 4, 512); }
  c.strokeStyle = 'rgba(225,210,160,0.13)'; c.lineWidth = 3;
  for (let y = 0; y < 512; y += 64) for (let x = 0; x < 256; x += 64) {
    c.beginPath(); c.moveTo(x + 32, y + 8); c.lineTo(x + 52, y + 32); c.lineTo(x + 32, y + 56); c.lineTo(x + 12, y + 32); c.closePath(); c.stroke();
    c.fillStyle = 'rgba(225,210,160,0.12)'; c.beginPath(); c.arc(x + 32, y + 32, 5, 0, 7); c.fill();
  }
  const r = mulberry32(7);
  for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(30,25,10,${0.03 + r() * 0.06})`; c.beginPath(); c.ellipse(r() * 256, r() * 512, 6 + r() * 30, 10 + r() * 60, 0, 0, 7); c.fill(); }
  const g = c.createLinearGradient(0, 380, 0, 512); g.addColorStop(0, 'rgba(20,15,5,0)'); g.addColorStop(1, 'rgba(20,15,5,0.45)');
  c.fillStyle = g; c.fillRect(0, 380, 256, 132);
});
const planks = () => canvasTex('planks', 512, 512, (c) => {
  const r = mulberry32(5);
  for (let i = 0; i < 8; i++) {
    const v = 0.85 + r() * 0.3;
    c.fillStyle = `rgb(${Math.round(92 * v)},${Math.round(60 * v)},${Math.round(40 * v)})`; c.fillRect(i * 64, 0, 64, 512);
    for (let k = 0; k < 14; k++) { c.strokeStyle = `rgba(40,22,12,${0.15 + r() * 0.2})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const x = i * 64 + r() * 64; c.moveTo(x, 0); c.bezierCurveTo(x + 6, 170, x - 6, 340, x + 3, 512); c.stroke(); }
    c.fillStyle = 'rgba(15,8,4,0.85)'; c.fillRect(i * 64, 0, 3, 512);
    const y = r() * 512; c.fillRect(i * 64, y, 64, 2);
  }
  c.fillStyle = 'rgba(255,230,190,0.06)'; c.fillRect(160, 0, 200, 512);
});
const leather = () => canvasTex('leather', 256, 512, (c) => {
  c.fillStyle = '#5b2f26'; c.fillRect(0, 0, 256, 512);
  for (let y = -64; y < 576; y += 64) for (let x = -64; x < 320; x += 64) {
    const g = c.createRadialGradient(x + 32, y + 32, 2, x + 32, y + 32, 40);
    g.addColorStop(0, 'rgba(255,190,150,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
    c.fillStyle = g; c.beginPath(); c.moveTo(x + 32, y); c.lineTo(x + 64, y + 32); c.lineTo(x + 32, y + 64); c.lineTo(x, y + 32); c.closePath(); c.fill();
    c.fillStyle = '#c7a46a'; c.beginPath(); c.arc(x, y + 32, 3.5, 0, 7); c.fill();
  }
  c.strokeStyle = 'rgba(20,8,5,0.6)'; c.lineWidth = 2;
  for (let y = -64; y < 576; y += 64) { c.beginPath(); c.moveTo(-64, y); c.lineTo(320, y + 384); c.stroke(); c.beginPath(); c.moveTo(320, y); c.lineTo(-64, y + 384); c.stroke(); }
});
const ceilingT = () => canvasTex('ceil', 128, 128, (c) => {
  c.fillStyle = '#8e8a7d'; c.fillRect(0, 0, 128, 128);
  const r = mulberry32(2); for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(60,50,30,${r() * 0.12})`; c.beginPath(); c.arc(r() * 128, r() * 128, 4 + r() * 20, 0, 7); c.fill(); }
});
const glowTex = () => canvasTex('floorGlow', 256, 256, (c) => {
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,196,110,0.95)'); g.addColorStop(0.08, 'rgba(255,180,95,0.5)'); g.addColorStop(0.5, 'rgba(255,160,80,0.12)'); g.addColorStop(1, 'rgba(255,150,70,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  c.globalCompositeOperation = 'destination-in';
  const h = c.createLinearGradient(0, 0, 256, 0); h.addColorStop(0, 'rgba(0,0,0,0)'); h.addColorStop(0.15, 'rgba(0,0,0,1)'); h.addColorStop(0.85, 'rgba(0,0,0,1)'); h.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = h; c.fillRect(0, 0, 256, 256);
});
const blobTex = () => canvasTex('blob', 64, 64, (c) => {
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
});
const dotTex = () => canvasTex('dot', 32, 32, (c) => {
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,240,220,1)'); g.addColorStop(1, 'rgba(255,240,220,0)');
  c.fillStyle = g; c.fillRect(0, 0, 32, 32);
});

const M = {
  wall: () => std('wall', () => new THREE.MeshStandardMaterial({map: rep(wallpaper().clone(), 3, 2.6), roughness: 0.92})),
  wallR: () => std('wallR', () => new THREE.MeshStandardMaterial({map: rep(wallpaper().clone(), 2.2, 2.6), roughness: 0.92})),
  floor: () => std('floor', () => new THREE.MeshStandardMaterial({map: rep(planks().clone(), 0.5, 2.2), roughness: 0.55, metalness: 0.05})),
  ceil: () => std('ceil', () => new THREE.MeshStandardMaterial({map: ceilingT(), roughness: 1})),
  door: () => std('door', () => new THREE.MeshStandardMaterial({map: rep(leather().clone(), 1, 1), roughness: 0.45, metalness: 0.05})),
  trim: () => std('trim', () => new THREE.MeshStandardMaterial({color: '#3a2b22', roughness: 0.7})),
  skirting: () => std('skirt', () => new THREE.MeshStandardMaterial({color: '#2c211b', roughness: 0.6})),
  brass: () => std('brass', () => new THREE.MeshStandardMaterial({color: '#b08a4a', roughness: 0.3, metalness: 0.85})),
  dark: (c: string) => std(`d${c}`, () => new THREE.MeshStandardMaterial({color: c, roughness: 0.85})),
  glow: (c: string) => std(`g${c}`, () => new THREE.MeshBasicMaterial({color: c, toneMapped: false})),
  floorGlow: () => std('fg', () => new THREE.MeshBasicMaterial({map: glowTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false})),
  blob: () => std('blob', () => new THREE.MeshBasicMaterial({map: blobTex(), transparent: true, depthWrite: false, opacity: 0.85})),
  dust: () => std('dust', () => new THREE.PointsMaterial({map: dotTex(), size: 0.007, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffe6c8', opacity: 0.45})),
};

const Box: React.FC<{s: V3; p: V3; m: THREE.Material; r?: V3; shadow?: boolean}> = ({s, p, m, r, shadow = true}) => (
  <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

// ---------- pieces ----------
export type HallState = {
  t: number;          // seconds
  bulb: number;       // 0..1 bulb brightness (flicker)
  stair: number;      // 0..1 stairwell light behind the door
  feet: number;       // x of the feet outside (m, relative to the door centre); |x|>0.6 = gone
  handle: number;     // handle angle (rad)
  moon: number;       // 0..1 moonlight from the bedroom
  phone?: number;     // 0..1 phone screen light
  phoneAt?: V3;
  noDoor?: boolean;   // hide the front door (camera dollies out through it)
};

const Door: React.FC<{S: HallState}> = ({S}) => {
  const {x, w, h} = HALL.door, z = HALL.z0;
  const footM = M.dark('#050302');
  return (
    <group>
      {/* stairwell light behind the door: seen through the gaps */}
      <mesh position={[x, h / 2, z - 0.09]}><planeGeometry args={[w + 0.12, h + 0.1]} /><meshBasicMaterial color={new THREE.Color('#ffb768').multiplyScalar(1.6 * S.stair)} toneMapped={false} /></mesh>
      {/* feet of whoever stands outside, between the light and the gap */}
      {[-0.07, 0.07].map((dx, i) => (
        <Box key={i} s={[0.1, 0.05, 0.26]} p={[x + S.feet + dx, 0.025, z - 0.05]} m={footM} shadow={false} />
      ))}
      {/* frame */}
      <Box s={[0.08, h + 0.08, 0.1]} p={[x - w / 2 - 0.04, (h + 0.08) / 2, z + 0.03]} m={M.trim()} />
      <Box s={[0.08, h + 0.08, 0.1]} p={[x + w / 2 + 0.04, (h + 0.08) / 2, z + 0.03]} m={M.trim()} />
      <Box s={[w + 0.16, 0.08, 0.1]} p={[x, h + 0.04, z + 0.03]} m={M.trim()} />
      {/* padded door leaf: hangs 2.5 cm above the floor */}
      <Box s={[w - 0.02, h - 0.03, 0.07]} p={[x, 0.025 + (h - 0.03) / 2, z]} m={M.door()} />
      {/* brass studs border */}
      {Array.from({length: 22}, (_, i) => {
        const k = i / 21, yy = 0.08 + k * (h - 0.18);
        return [<mesh key={`l${i}`} position={[x - w / 2 + 0.04, yy, z + 0.04]} material={M.brass()}><sphereGeometry args={[0.009, 8, 6]} /></mesh>,
          <mesh key={`r${i}`} position={[x + w / 2 - 0.04, yy, z + 0.04]} material={M.brass()}><sphereGeometry args={[0.009, 8, 6]} /></mesh>];
      })}
      {/* peephole */}
      <mesh position={[x, 1.52, z + 0.04]} rotation={[Math.PI / 2, 0, 0]} material={M.brass()}><cylinderGeometry args={[0.018, 0.022, 0.02, 20]} /></mesh>
      <mesh position={[x, 1.52, z + 0.051]} material={M.glow('#1a1208')}><circleGeometry args={[0.008, 16]} /></mesh>
      {/* handle + lock */}
      <group position={[x + w / 2 - 0.12, 1.0, z + 0.05]} rotation={[0, 0, S.handle]}>
        <Box s={[0.13, 0.025, 0.03]} p={[-0.05, 0, 0.03]} m={M.brass()} />
      </group>
      <Box s={[0.05, 0.16, 0.012]} p={[x + w / 2 - 0.12, 1.0, z + 0.04]} m={M.brass()} />
      <mesh position={[x + w / 2 - 0.12, 1.22, z + 0.045]} rotation={[Math.PI / 2, 0, 0]} material={M.brass()}><cylinderGeometry args={[0.016, 0.016, 0.02, 16]} /></mesh>
      {/* light spill on the floor from the gap */}
      <mesh position={[x, 0.004, z + 0.04 + 0.6]} rotation={[-Math.PI / 2, 0, 0]} material={M.floorGlow()} scale={[1, 1, 1]}>
        <planeGeometry args={[w + 0.3, 1.2]} />
      </mesh>
      {/* the feet block the spill: two soft shadows stretching into the hall */}
      {[-0.07, 0.07].map((dx, i) => (
        <mesh key={`s${i}`} position={[x + S.feet * 1.1 + dx * 1.3, 0.006, z + 0.42]} rotation={[-Math.PI / 2, 0, 0]} material={M.blob()}
          scale={[1, 1, 1]} visible={Math.abs(S.feet) < 0.6}>
          <planeGeometry args={[0.14, 0.8]} />
        </mesh>
      ))}
    </group>
  );
};

const Props: React.FC<{S: HallState}> = ({S}) => {
  const coat = M.dark('#2a2420'), coat2 = M.dark('#4a3a2c');
  return (
    <group>
      {/* coat rack on the left wall: two coats on hangers (shoulders, tapered body, sleeve) */}
      <Box s={[0.04, 0.06, 0.9]} p={[-HALL.w / 2 + 0.03, 1.8, -1.9]} m={M.trim()} />
      {[{z: -2.15, c: coat2, l: 1.05}, {z: -1.68, c: coat, l: 0.95}].map((k, i) => (
        <group key={i} position={[-HALL.w / 2 + 0.14, 1.72, k.z]} rotation={[0, 0, (i ? -1 : 1) * 0.04]}>
          <mesh material={k.c} castShadow receiveShadow position={[0, -k.l / 2, 0]} scale={[0.42, 1, 1]}><cylinderGeometry args={[0.16, 0.27, k.l, 20]} /></mesh>
          <mesh material={k.c} castShadow position={[0, -0.03, 0]} scale={[0.42, 0.35, 1]}><sphereGeometry args={[0.2, 16, 10]} /></mesh>
          <mesh material={k.c} castShadow position={[0.02, -0.42, 0.17]} rotation={[0.12, 0, 0]}><capsuleGeometry args={[0.045, 0.55, 4, 10]} /></mesh>
          <mesh material={M.dark('#191512')} position={[0.06, -k.l * 0.55, 0]} scale={[0.2, 1, 1]}><boxGeometry args={[0.02, k.l * 0.8, 0.015]} /></mesh>
        </group>
      ))}
      {/* shoe cabinet + shoes */}
      <Box s={[0.32, 0.45, 0.8]} p={[-HALL.w / 2 + 0.16, 0.225, -0.7]} m={M.dark('#3d2f25')} />
      <Box s={[0.12, 0.08, 0.26]} p={[0.3, 0.04, -2.4]} m={M.dark('#1c1a18')} r={[0, 0.3, 0]} />
      <Box s={[0.12, 0.08, 0.26]} p={[0.45, 0.04, -2.35]} m={M.dark('#1c1a18')} r={[0, -0.1, 0]} />
      {/* rug */}
      <Box s={[0.7, 0.01, 1.1]} p={[0.05, 0.005, -2.1]} m={M.dark('#5a2a2a')} shadow={false} />
      {/* electricity meter box above the door */}
      <Box s={[0.3, 0.38, 0.12]} p={[-0.55, 2.25, HALL.z0 + 0.07]} m={M.dark('#545a50')} />
      {/* bulb on a cord */}
      <mesh position={[HALL.bulb[0], (HALL.h + HALL.bulb[1]) / 2 + 0.04, HALL.bulb[2]]} material={M.dark('#111')}><cylinderGeometry args={[0.004, 0.004, HALL.h - HALL.bulb[1], 6]} /></mesh>
      <mesh position={HALL.bulb} material={M.dark('#222')}><cylinderGeometry args={[0.022, 0.02, 0.05, 12]} /></mesh>
      <mesh position={[HALL.bulb[0], HALL.bulb[1] - 0.06, HALL.bulb[2]]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshBasicMaterial color={new THREE.Color('#ffd9a0').multiplyScalar(0.25 + 2.6 * S.bulb)} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Shell: React.FC = () => {
  const {w, h, z0, z1} = HALL, L = z1 - z0, zc = (z0 + z1) / 2;
  // bedroom doorway on the right wall: opening z in [0.15, 0.95]
  const o0 = 0.15, o1 = 0.95, oh = 2.05;
  return (
    <group>
      <mesh position={[0, 0, zc]} rotation={[-Math.PI / 2, 0, 0]} material={M.floor()} receiveShadow><planeGeometry args={[w, L]} /></mesh>
      <mesh position={[0, h, zc]} rotation={[Math.PI / 2, 0, 0]} material={M.ceil()} receiveShadow><planeGeometry args={[w, L]} /></mesh>
      <mesh position={[-w / 2, h / 2, zc]} rotation={[0, Math.PI / 2, 0]} material={M.wall()} receiveShadow><planeGeometry args={[L, h]} /></mesh>
      <mesh position={[0, h / 2, z0]} material={M.wall()} receiveShadow><planeGeometry args={[w, h]} /></mesh>
      {/* right wall in three parts around the doorway */}
      <mesh position={[w / 2, h / 2, (z0 + o0) / 2]} rotation={[0, -Math.PI / 2, 0]} material={M.wallR()} receiveShadow><planeGeometry args={[o0 - z0, h]} /></mesh>
      <mesh position={[w / 2, h / 2, (o1 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={M.wallR()} receiveShadow><planeGeometry args={[z1 - o1, h]} /></mesh>
      <mesh position={[w / 2, (oh + h) / 2, (o0 + o1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={M.wallR()} receiveShadow><planeGeometry args={[o1 - o0, h - oh]} /></mesh>
      {/* bedroom beyond: dark box with a blue-lit back wall */}
      <mesh position={[w / 2 + 1.4, oh / 2, (o0 + o1) / 2]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[2.5, oh + 0.6]} /><meshStandardMaterial color="#29324d" roughness={1} /></mesh>
      <mesh position={[w / 2 + 0.7, 0.001, (o0 + o1) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[1.4, 2.5]} /><meshStandardMaterial color="#2a2733" roughness={0.9} /></mesh>
      {/* skirting boards */}
      <Box s={[0.02, 0.09, L]} p={[-w / 2 + 0.01, 0.045, zc]} m={M.skirting()} />
      <Box s={[w, 0.09, 0.02]} p={[0, 0.045, z0 + 0.01]} m={M.skirting()} />
      <Box s={[0.02, 0.09, o0 - z0]} p={[w / 2 - 0.01, 0.045, (z0 + o0) / 2]} m={M.skirting()} />
      {/* back wall (behind the camera in most shots) with a black kitchen doorway: x in [-0.5, 0.3] */}
      <mesh position={[(-w / 2 - 0.5) / 2, h / 2, z1]} rotation={[0, Math.PI, 0]} material={M.wall()} receiveShadow><planeGeometry args={[w / 2 - 0.5, h]} /></mesh>
      <mesh position={[(0.3 + w / 2) / 2, h / 2, z1]} rotation={[0, Math.PI, 0]} material={M.wall()} receiveShadow><planeGeometry args={[w / 2 - 0.3, h]} /></mesh>
      <mesh position={[-0.1, (oh + h) / 2, z1]} rotation={[0, Math.PI, 0]} material={M.wall()} receiveShadow><planeGeometry args={[0.8, h - oh]} /></mesh>
      <mesh position={[-0.1, oh / 2, z1 + 1.2]} rotation={[0, Math.PI, 0]}><planeGeometry args={[2, oh + 0.4]} /><meshBasicMaterial color="#020203" /></mesh>
      <Box s={[0.07, oh, 0.06]} p={[-0.53, oh / 2, z1 - 0.01]} m={M.trim()} />
      <Box s={[0.07, oh, 0.06]} p={[0.33, oh / 2, z1 - 0.01]} m={M.trim()} />
      <Box s={[0.93, 0.07, 0.06]} p={[-0.1, oh + 0.035, z1 - 0.01]} m={M.trim()} />
      {/* doorway trims */}
      <Box s={[0.06, oh, 0.07]} p={[w / 2 - 0.01, oh / 2, o0 - 0.03]} m={M.trim()} />
      <Box s={[0.06, oh, 0.07]} p={[w / 2 - 0.01, oh / 2, o1 + 0.03]} m={M.trim()} />
      <Box s={[0.06, 0.07, o1 - o0 + 0.13]} p={[w / 2 - 0.01, oh + 0.035, (o0 + o1) / 2]} m={M.trim()} />
    </group>
  );
};

const Dust: React.FC<{t: number}> = ({t}) => {
  const pts = useMemo(() => {
    const r = mulberry32(21);
    return Array.from({length: 110}, () => ({x: (r() - 0.5) * 1.3, y: 0.2 + r() * 2.3, z: -2.9 + r() * 4.2, v: 0.01 + r() * 0.03, p: r() * 6.28}));
  }, []);
  const attr = useMemo(() => new THREE.BufferAttribute(new Float32Array(pts.length * 3), 3), [pts]);
  useLayoutEffect(() => {
    pts.forEach((d, i) => attr.setXYZ(i, d.x + Math.sin(t * 0.3 + d.p) * 0.05, d.y + Math.sin(t * 0.21 + d.p * 2) * 0.04 - ((t * d.v) % 0.3), d.z + Math.cos(t * 0.25 + d.p) * 0.04));
    attr.needsUpdate = true;
  });
  return <points material={M.dust()}><bufferGeometry><primitive object={attr} attach="attributes-position" /></bufferGeometry></points>;
};

const Lights: React.FC<{S: HallState}> = ({S}) => {
  const spot = useRef<THREE.SpotLight>(null);
  const moon = useRef<THREE.SpotLight>(null);
  useLayoutEffect(() => {
    if (spot.current) { spot.current.target.position.set(HALL.bulb[0], 0, HALL.bulb[2] - 0.2); spot.current.target.updateMatrixWorld(); }
    if (moon.current) { moon.current.target.position.set(-0.4, 0.3, 0.4); moon.current.target.updateMatrixWorld(); }
  });
  return (
    <>
      <ambientLight color="#3a4670" intensity={0.22} />
      <hemisphereLight args={['#3c4a7a', '#140c08', 0.25]} />
      {/* bare bulb: soft shadowed spot down + small fill */}
      <spotLight ref={spot} position={[HALL.bulb[0], HALL.bulb[1] - 0.08, HALL.bulb[2]]} color="#ffcf8a" intensity={14 * S.bulb} distance={7} decay={1.6}
        angle={1.25} penumbra={0.9} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <pointLight position={[HALL.bulb[0], HALL.bulb[1] - 0.1, HALL.bulb[2]]} color="#ffbe78" intensity={1.6 * S.bulb} distance={5} decay={1.8} />
      {/* stairwell glow through the door gaps */}
      <pointLight position={[HALL.door.x, 0.06, HALL.z0 + 0.12]} color="#ffad5c" intensity={1.2 * S.stair} distance={2.2} decay={2} />
      {S.phone ? <pointLight position={S.phoneAt ?? [0, 1.1, 0.3]} color="#b9d4ff" intensity={1.4 * S.phone} distance={2.2} decay={2} /> : null}
      {/* moonlight from the bedroom doorway */}
      <spotLight ref={moon} position={[HALL.w / 2 + 1.8, 1.9, 0.55]} color="#7e9dff" intensity={22 * S.moon} distance={6} decay={1.5}
        angle={0.55} penumbra={0.7} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
    </>
  );
};

const Camera: React.FC<{pose: CamPose}> = ({pose}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...pose.pos); cam.up.set(Math.sin(pose.roll), Math.cos(pose.roll), 0); cam.lookAt(...pose.tgt);
    cam.fov = pose.fov; cam.near = 0.03; cam.far = 30; cam.updateProjectionMatrix();
  });
  return null;
};

// the hallway geometry + lights only (camera, fog and post come from CameraRig)
export const HallSet: React.FC<{S: HallState}> = ({S}) => (
  <>
    <Lights S={S} />
    <Shell />
    {!S.noDoor && <Door S={S} />}
    <Props S={S} />
    <Dust t={S.t} />
  </>
);

export const Hall3D: React.FC<{S: HallState; pose: CamPose; glitch?: number; seed?: number}> = ({S, pose, glitch = 0, seed = 0}) => {
  const {scene, gl} = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2('#0b0d18', 0.16);
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05;
  }, [scene, gl]);
  return (
    <>
      <color attach="background" args={['#06070d']} />
      <Camera pose={pose} />
      <Post3D bloom={0.55} glitch={glitch} seed={seed} />
      <Lights S={S} />
      <Shell />
      <Door S={S} />
      <Props S={S} />
      <Dust t={S.t} />
    </>
  );
};
