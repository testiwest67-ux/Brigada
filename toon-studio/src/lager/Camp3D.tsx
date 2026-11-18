// «Кто лишний?»: the summer camp «Ласточка» by the forest, 1986. One outdoor 3D set, lit four ways:
// 'day', 'dusk' (the evening roll call), 'night' (moon, lit windows) and 'fire' (night + the campfire light).
// Ground y = 0. Layout (x right, z toward the gate):
//   the gate arch «ЛАСТОЧКА» at z 12; the roll-call ground around the origin (kids in a row at z 0);
//   the wooden barrack (корпус) behind it at z -6 with a porch at x 0; a flagpole at x -3.5;
//   the canteen veranda at x 6.5; the lake on the left (x < -9) with a pier; the campfire at FIRE (z 6.5, x 4);
//   pine forest all around. The sky dome follows the camera (far plane is 30 m).
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {mulberry32} from '../toon/lib/anim';
import {Box, glow, matte, rep, std} from '../horror/common';

export const FIRE: V3 = [4, 0, 6.5];
export const PORCH: V3 = [0, 0.45, -3.6];   // the top of the porch steps
export const GATE_Z = 12;
export const TABLE: V3 = [6.5, 0, -0.6];
export const PIER: V3 = [-10.5, 0.25, -1.5];
export const FLAG: V3 = [-3.5, 0, -2];

export type Mode = 'day' | 'dusk' | 'night' | 'fire';
export type CampState = {t: number; mode: Mode; fire: number; windows: number; cam: V3; lantern?: number};
export const CAMP_REST: CampState = {t: 0, mode: 'dusk', fire: 0, windows: 0.4, cam: [0, 1.6, 8]};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.9) =>
  std(`ctx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`c${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));
const grass = () => tex('grass', 256, 256, (c) => {
  c.fillStyle = '#4f6a34'; c.fillRect(0, 0, 256, 256);
  const r = mulberry32(3);
  for (let i = 0; i < 1600; i++) { c.fillStyle = r() > 0.5 ? 'rgba(90,120,60,0.6)' : 'rgba(50,70,30,0.6)'; c.fillRect(r() * 256, r() * 256, 2, 5); }
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(150,130,90,0.35)'; c.beginPath(); c.ellipse(r() * 256, r() * 256, 10 + r() * 20, 6 + r() * 10, 0, 0, 7); c.fill(); }
}, 16, 16);
const sand = () => tex('sand', 128, 128, (c) => {
  c.fillStyle = '#b9a27a'; c.fillRect(0, 0, 128, 128);
  const r = mulberry32(5);
  for (let i = 0; i < 700; i++) { c.fillStyle = r() > 0.5 ? 'rgba(120,100,70,0.4)' : 'rgba(220,200,160,0.4)'; c.fillRect(r() * 128, r() * 128, 2, 2); }
}, 4, 4);
const planks = (k: string, base: string) => tex(`pl${k}`, 128, 128, (c) => {
  const r = mulberry32(k.length + 7);
  for (let y = 0; y < 128; y += 16) {
    const v = 0.85 + r() * 0.3, col = new THREE.Color(base).multiplyScalar(v);
    c.fillStyle = `#${col.getHexString()}`; c.fillRect(0, y, 128, 16);
    c.fillStyle = 'rgba(30,18,8,0.55)'; c.fillRect(0, y + 14, 128, 2);
  }
}, 4, 2);
const water = () => std('cwater', () => new THREE.MeshStandardMaterial({color: '#0d1a26', roughness: 0.08, metalness: 0.6}));

// the sign over the gate and the camp name board
const signMat = () => std('csign', () => new THREE.MeshBasicMaterial({map: canvasTex('csign', 512, 96, (c) => {
  c.fillStyle = '#e8dcc0'; c.fillRect(0, 0, 512, 96);
  c.strokeStyle = '#6a4a2a'; c.lineWidth = 8; c.strokeRect(4, 4, 504, 88);
  c.fillStyle = '#b03028'; c.font = 'bold 64px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ЛАСТОЧКА', 256, 52);
})}));

// the sky: a gradient dome that follows the camera, stars and the moon at night
const skyMat = (mode: Mode) => std(`csky${mode}`, () => new THREE.MeshBasicMaterial({side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false,
  map: canvasTex(`csky${mode}`, 64, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    if (mode === 'day') { g.addColorStop(0, '#5f93c9'); g.addColorStop(0.5, '#a9c9e2'); g.addColorStop(1, '#d9e4e2'); }
    else if (mode === 'dusk') { g.addColorStop(0, '#2a2f5a'); g.addColorStop(0.38, '#7a4e78'); g.addColorStop(0.5, '#e07a4a'); g.addColorStop(0.56, '#f2b45e'); g.addColorStop(1, '#3a2a30'); }
    else { g.addColorStop(0, '#02040a'); g.addColorStop(0.45, '#0b1424'); g.addColorStop(0.53, '#18243a'); g.addColorStop(1, '#05070a'); }
    c.fillStyle = g; c.fillRect(0, 0, 64, 512);
    if (mode === 'night' || mode === 'fire') {
      const r = mulberry32(11);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; c.fillRect(r() * 64, r() * 230, 1, 1); }
    }
  })}));

const Pine: React.FC<{p: V3; h: number; dark?: number}> = ({p, h, dark = 0}) => {
  const col = new THREE.Color('#24402c').multiplyScalar(1 - dark * 0.5).getStyle();
  return (
    <group position={p}>
      <mesh position={[0, h * 0.2, 0]} material={matte('#4a3424')}><cylinderGeometry args={[0.08 * h / 6, 0.14 * h / 6, h * 0.4, 6]} /></mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[0, h * (0.32 + k * 0.17), 0]} material={matte(col)}><coneGeometry args={[h * (0.26 - k * 0.05), h * 0.32, 7]} /></mesh>
      ))}
    </group>
  );
};

const forest = (() => {
  const r = mulberry32(21), out: {p: V3; h: number}[] = [];
  for (let i = 0; i < 150; i++) {
    const a = r() * Math.PI * 2, d = 13 + r() * 12;
    const x = Math.cos(a) * d, z = Math.sin(a) * d * 0.9 - 1;
    if (x < -8 && z > -14 && z < 5) continue;           // keep the lake open
    if (Math.abs(x) < 3 && z > 10) continue;             // keep the road to the gate open
    out.push({p: [x, 0, z], h: 6 + r() * 6});
  }
  // a few closer trees between the buildings
  [[-6.5, -8], [5.5, -7.5], [9.5, 3], [-5.5, 4.5], [8.5, 9], [-1.5, 9.5], [9, -5]].forEach(([x, z], i) => out.push({p: [x, 0, z], h: 7 + (i % 3)}));
  return out;
})();

// the barrack: a long wooden house on a low base, gable roof, six windows, the porch with steps and a lamp
const Barrack: React.FC<{win: number; night: boolean}> = ({win, night}) => {
  const wall = planks('barr', '#7a8a5a');
  const W = 9, D = 4, H = 2.8, z = -6;
  return (
    <group>
      <Box s={[W + 0.2, 0.45, D + 0.2]} p={[0, 0.22, z]} m={matte('#6a6460')} />
      <Box s={[W, H, D]} p={[0, 0.45 + H / 2, z]} m={wall} />
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[0, 0.45 + H + 0.62, z + sd * D / 4]} rotation={[sd * 0.55, 0, 0]} material={matte('#7a3a30')}><boxGeometry args={[W + 0.6, 0.08, D / 2 + 0.6]} /></mesh>
      ))}
      <mesh position={[0, 0.45 + H, z]} material={matte('#5a6a42')}><boxGeometry args={[W, 0.02, D]} /></mesh>
      {/* gable triangles */}
      {[-1, 1].map((sd) => (
        <mesh key={`g${sd}`} position={[sd * W / 2, 0.45 + H, z]} rotation={[0, sd * Math.PI / 2, 0]} material={wall}>
          <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-D / 2 - 0.1, 0), new THREE.Vector2(D / 2 + 0.1, 0), new THREE.Vector2(0, 1.3)])]} />
        </mesh>
      ))}
      {/* windows: warm light inside at night */}
      {[-3.6, -2.2, -0.9, 0.9, 2.2, 3.6].map((x) => (
        <group key={x} position={[x, 2.0, z + D / 2 + 0.01]}>
          <mesh material={matte('#f2efe6')}><planeGeometry args={[0.9, 1.1]} /></mesh>
          <mesh position={[0, 0, 0.005]} material={night ? glow('#ffcf8a', 0.6 + win * 0.9) : matte('#3a4a5a', 0.2)}><planeGeometry args={[0.76, 0.96]} /></mesh>
          <mesh position={[0, 0, 0.01]} material={matte('#f2efe6')}><planeGeometry args={[0.05, 0.96]} /></mesh>
          <mesh position={[0, 0.12, 0.01]} material={matte('#f2efe6')}><planeGeometry args={[0.76, 0.05]} /></mesh>
        </group>
      ))}
      {/* the porch */}
      <Box s={[2.4, 0.08, 1.6]} p={[0, 0.45, -3.4]} m={planks('porch', '#8a6a48')} />
      {[0, 1, 2].map((k) => <Box key={k} s={[1.6, 0.15, 0.32]} p={[0, 0.075 + k * 0.15 - 0.075 * 0, -2.45 - (2 - k) * 0.3]} m={matte('#7a5a3a')} />)}
      {[-1.1, 1.1].map((x) => <Box key={x} s={[0.12, 2.4, 0.12]} p={[x, 1.65, -2.7]} m={matte('#6a4a30')} />)}
      <mesh position={[0, 2.95, -3.3]} rotation={[0.25, 0, 0]} material={matte('#7a3a30')}><boxGeometry args={[2.8, 0.06, 1.9]} /></mesh>
      <Box s={[0.9, 1.9, 0.06]} p={[0, 1.4, z + D / 2 + 0.03]} m={matte('#4a6a3a')} />
      {/* the porch lamp */}
      <mesh position={[0, 2.6, -3.95]} material={night ? glow('#ffd79a', 1.6) : matte('#e8e2d0')}><sphereGeometry args={[0.1, 12, 10]} /></mesh>
      {night && <pointLight position={[0, 2.5, -3.6]} color="#ffcf8a" intensity={1.6} distance={7} decay={1.6} />}
    </group>
  );
};

// the canteen veranda: an awning on posts, a long table with a white cloth, plates and tin mugs, two benches
const Canteen: React.FC = () => {
  const [x, , z] = TABLE;
  return (
    <group>
      <Box s={[5, 0.06, 3]} p={[x, 2.6, z]} m={matte('#3a6a8a')} />
      {[[-2.3, -1.3], [2.3, -1.3], [-2.3, 1.3], [2.3, 1.3]].map(([dx, dz], i) => <Box key={i} s={[0.1, 2.6, 0.1]} p={[x + dx, 1.3, z + dz]} m={matte('#e8e2d0')} />)}
      <Box s={[3.6, 0.06, 0.9]} p={[x, 0.76, z]} m={matte('#f2f0ea', 0.95)} />
      {[-1, 1].map((sd) => <Box key={sd} s={[0.08, 0.74, 0.7]} p={[x + sd * 1.6, 0.37, z]} m={matte('#6a4a30')} />)}
      {[-1, 1].map((sd) => <Box key={`b${sd}`} s={[3.6, 0.06, 0.3]} p={[x, 0.45, z + sd * 0.75]} m={matte('#7a5a3a')} />)}
      {[-1.2, -0.4, 0.4, 1.2].map((dx) => [-1, 1].map((sd) => (
        <group key={`${dx}${sd}`} position={[x + dx, 0.8, z + sd * 0.25]}>
          <mesh material={matte('#f6f4ee', 0.4)}><cylinderGeometry args={[0.13, 0.1, 0.03, 18]} /></mesh>
          <mesh position={[0, 0.03, 0]} material={matte('#d9b45a')}><cylinderGeometry args={[0.08, 0.08, 0.03, 14]} /></mesh>
          <mesh position={[0.18, 0.05, 0]} material={matte('#b8bcc4', 0.3)}><cylinderGeometry args={[0.04, 0.04, 0.1, 12]} /></mesh>
        </group>
      )))}
    </group>
  );
};

// the campfire: crossed logs, flame cones flickering, sparks, sand ring, log benches
const Campfire: React.FC<{t: number; fire: number}> = ({t, fire}) => {
  const [x, , z] = FIRE;
  const r = mulberry32(9);
  const sparks = Array.from({length: 18}, () => ({a: r() * 6.28, s: 0.6 + r() * 0.8, o: r()}));
  return (
    <group>
      <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]} material={sand()}><circleGeometry args={[5.6, 48]} /></mesh>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} position={[x, 0.1, z]} rotation={[0, (k * Math.PI) / 4, Math.PI / 2 - 0.35]} material={matte('#3a2618')}><cylinderGeometry args={[0.07, 0.08, 0.9, 7]} /></mesh>
      ))}
      <mesh position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]} material={glow(fire > 0.05 ? '#ff6a1a' : '#2a1a14', fire > 0.05 ? 0.5 + fire * 0.6 : 1)}><circleGeometry args={[0.45, 16]} /></mesh>
      {fire > 0.02 && [0, 1, 2, 3, 4].map((k) => {
        const fl = 0.75 + 0.25 * Math.sin(t * (9 + k * 2.3) + k) + 0.1 * Math.sin(t * 23 + k * 3);
        const h = (0.9 - k * 0.12) * fl * fire;
        return (
          <mesh key={`f${k}`} position={[x + Math.sin(k * 2.1) * 0.12, h / 2 + 0.08, z + Math.cos(k * 2.1) * 0.12]} rotation={[0, t * 2 + k, Math.sin(t * 5 + k) * 0.12]}
            material={glow(k < 2 ? '#ffb347' : '#ff6a1a', 1.4)}><coneGeometry args={[0.22 - k * 0.025, Math.max(0.01, h), 6]} /></mesh>
        );
      })}
      {fire > 0.02 && sparks.map((s, i) => {
        const ph = (t * s.s + s.o) % 1;
        return <mesh key={`s${i}`} position={[x + Math.cos(s.a) * 0.3 * ph, 0.5 + ph * 2.6, z + Math.sin(s.a) * 0.3 * ph]} material={glow('#ffc070', 2 * (1 - ph))}><sphereGeometry args={[0.02, 5, 4]} /></mesh>;
      })}
      {/* smoke after it goes out */}
      {fire < 0.3 && [0, 1, 2].map((k) => {
        const ph = (t * 0.25 + k / 3) % 1;
        return <mesh key={`m${k}`} position={[x + Math.sin(t + k) * 0.2, 0.4 + ph * 2.2, z]}><sphereGeometry args={[0.25 + ph * 0.5, 10, 8]} /><meshStandardMaterial color="#5a5e66" transparent opacity={(1 - ph) * 0.25 * (1 - fire / 0.3)} /></mesh>;
      })}
      {[0, 1, 2, 3, 4].map((k) => {
        const a = -0.3 + k * 1.15;
        return <mesh key={`l${k}`} position={[x + Math.cos(a) * 2.6, 0.16, z + Math.sin(a) * 2.6]} rotation={[0, -a, Math.PI / 2]} material={matte('#5a3e28')}><cylinderGeometry args={[0.16, 0.16, 1.5, 9]} /></mesh>;
      })}
      {fire > 0.02 && <pointLight position={[x, 0.9, z]} color="#ff9a4a" intensity={(6.5 + Math.sin(t * 11) * 0.8 + Math.sin(t * 17) * 0.4) * fire} distance={16} decay={1.15} />}
    </group>
  );
};

export const CampSet: React.FC<{S: CampState}> = ({S}) => {
  const night = S.mode === 'night' || S.mode === 'fire';
  const L = {
    day: {amb: ['#cfd8e0', 0.9], sun: ['#fff1d6', 1.6], dir: [6, 10, 4]},
    dusk: {amb: ['#8a6a8a', 0.55], sun: ['#ff9a5a', 1.5], dir: [-10, 2.5, -6]},
    night: {amb: ['#2a3a5a', 0.35], sun: ['#7a9ad0', 0.55], dir: [-6, 9, -4]},
    fire: {amb: ['#1a2236', 0.22], sun: ['#6a8ac0', 0.32], dir: [-6, 9, -4]},
  }[S.mode] as {amb: [string, number]; sun: [string, number]; dir: V3};
  return (
    <group>
      <ambientLight color={L.amb[0]} intensity={L.amb[1]} />
      <directionalLight position={L.dir} color={L.sun[0]} intensity={L.sun[1]} castShadow={!night} shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
      <mesh position={S.cam} material={skyMat(S.mode)}><sphereGeometry args={[26, 24, 16]} /></mesh>
      {night && <mesh position={[S.cam[0] - 14, S.cam[1] + 13, S.cam[2] - 16]} material={glow('#f4f0dc', 1.2)}><sphereGeometry args={[0.9, 20, 14]} /></mesh>}
      {/* ground, the road to the gate, the roll-call ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={grass()} receiveShadow><planeGeometry args={[70, 70]} /></mesh>
      <mesh position={[0, 0.005, 3]} rotation={[-Math.PI / 2, 0, 0]} material={sand()} receiveShadow><planeGeometry args={[3, 20]} /></mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} material={sand()} receiveShadow><planeGeometry args={[9, 4]} /></mesh>
      <Barrack win={S.windows} night={night} />
      <Canteen />
      <Campfire t={S.t} fire={S.mode === 'fire' ? S.fire : 0} />
      {/* the flagpole (no flag) and a bench on the roll-call ground */}
      <mesh position={[FLAG[0], 3, FLAG[2]]} material={matte('#c9ccd2', 0.4)}><cylinderGeometry args={[0.04, 0.06, 6, 10]} /></mesh>
      <mesh position={[FLAG[0], 6.05, FLAG[2]]} material={matte('#d9b45a', 0.3)}><sphereGeometry args={[0.09, 10, 8]} /></mesh>
      {/* the gate arch «ЛАСТОЧКА» */}
      {[-1.9, 1.9].map((x) => <Box key={x} s={[0.22, 3.6, 0.22]} p={[x, 1.8, GATE_Z]} m={matte('#6a4a30')} />)}
      <Box s={[4.4, 0.2, 0.25]} p={[0, 3.55, GATE_Z]} m={matte('#6a4a30')} />
      <mesh position={[0, 3.1, GATE_Z + 0.13]} material={signMat()}><planeGeometry args={[3.2, 0.6]} /></mesh>
      <mesh position={[0, 3.1, GATE_Z - 0.13]} rotation={[0, Math.PI, 0]} material={signMat()}><planeGeometry args={[3.2, 0.6]} /></mesh>
      {[-1, 1].map((sd) => <Box key={`fn${sd}`} s={[8, 1.1, 0.06]} p={[sd * 6, 0.55, GATE_Z]} m={matte('#3a6a3a')} />)}
      {/* the lake and the pier */}
      <mesh position={[-19, 0.02, -4]} rotation={[-Math.PI / 2, 0, 0]} material={water()}><planeGeometry args={[20, 18]} /></mesh>
      <mesh position={[-9.4, 0.015, -4]} rotation={[-Math.PI / 2, 0, 0]} material={sand()}><planeGeometry args={[2, 18]} /></mesh>
            <Box s={[4.5, 0.08, 1.1]} p={[PIER[0] - 1.5, PIER[1], PIER[2]]} m={planks('pier', '#7a6a58')} />
      {[0, 1, 2].map((k) => [-1, 1].map((sd) => <Box key={`pp${k}${sd}`} s={[0.1, 0.6, 0.1]} p={[PIER[0] - k * 2, 0, PIER[2] + sd * 0.5]} m={matte('#4a3a2a')} />))}
      {forest.map((tr, i) => <Pine key={i} p={tr.p} h={tr.h} dark={night ? 1 : S.mode === 'dusk' ? 0.4 : 0} />)}
      {/* a lantern light far in the forest (the last shot) */}
      {(S.lantern ?? 0) > 0 && <>
        <mesh position={[-3, 1.2, -16]} material={glow('#ffd79a', 3 * (S.lantern ?? 0))}><sphereGeometry args={[0.12, 10, 8]} /></mesh>
        <pointLight position={[-3, 1.2, -15.8]} color="#ffcf8a" intensity={2 * (S.lantern ?? 0)} distance={5} decay={1.6} />
      </>}
    </group>
  );
};
