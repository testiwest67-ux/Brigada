// «Ночная смена»: the 24-hour corner shop, one 3D world.
// Floor y = 0. Room x -3..2.6, z -1.6 (back wall) .. 3.6 (front wall with the glass door and the shop window).
// Back: a wall of glass-door fridges (glass at z = -1.0). Counter x 0.2..2.2, z -0.25..0.35, top 0.95; Dima stands
// behind it at z ≈ -0.6, so the counter lamp throws his shadow straight onto the fridge glass.
// Right wall x = 2.6: the old wall phone, the "employee of the month" frame. Clock above the door, inside.
// Outside: the street, a lamp post, the sky (dawn 0..1), the facade sign «24 ЧАСА».
import React from 'react';
import * as THREE from 'three';
import {canvasTex, V3} from '../toon/three/toon3d';
import {lerp, mulberry32} from '../toon/lib/anim';
import {Box, matte, rep, std} from '../horror/common';

export const ROOM = {x0: -3, x1: 2.6, z0: -1.6, z1: 3.6, h: 2.8};
export const FRIDGE = {z: -1.0, x0: -2.8, x1: 2.0, y0: 0.15, y1: 2.05, n: 6};
export const COUNTER = {x0: 0.2, x1: 2.2, z0: -0.25, z1: 0.35, h: 0.95};
export const DOOR = {x0: 0.5, x1: 1.5, h: 2.2};
export const WIN = {x0: -2.7, x1: 0.35, y0: 0.55, y1: 2.45};
export const SPOT = {
  dima: [0.75, 0, -0.62] as V3,      // behind the counter
  buyer: [0.85, 0, 0.82] as V3,      // in front of the counter
  phoneDima: [2.2, 0, -0.55] as V3,  // at the wall phone
  door: [1.0, 0, 3.3] as V3,
  outside: [1.05, 0, 4.0] as V3,     // just outside the glass door
};
export const PHONE: V3 = [2.585, 1.45, -0.62];
export const CLOCK: V3 = [1.0, 2.5, 3.57];
export const NOTE: V3 = [0.62, COUNTER.h + 0.002, 0.02];
export const WRITE_DOOR = 2; // fridge door (0..5, left to right) where «ДИМА» gets written; centre x = -0.4

export type ShopState = {
  t: number;
  lamps: number;     // ceiling tubes 0..1 (flicker by the caller)
  counter: number;   // the counter lamp 0..1
  fridge: number;    // fridge inner light 0..2
  frost: number;     // fogged glass 0..1
  write: number;     // finger writing «ДИМА» on the WRITE_DOOR glass 0..1
  knock: number;     // fridge doors rattle (m)
  clock: string;     // «03:33»
  ring: number;      // the wall phone shakes 0..1
  receiver: boolean; // receiver on the hook
  door: number;      // front door open 0..1
  dawn: number;      // 0 night .. 1 morning outside
  sign: number;      // the facade sign 0..1 (a dead letter flickers)
};
export const SHOP_REST: ShopState = {t: 0, lamps: 0.9, counter: 1, fridge: 1, frost: 0, write: 0, knock: 0, clock: '00:00', ring: 0, receiver: true, door: 0, dawn: 0, sign: 1};

const tex = (k: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void, rx = 1, ry = 1, rough = 0.85) =>
  std(`stx${k}${rx}${ry}`, () => new THREE.MeshStandardMaterial({map: rep(canvasTex(`s${k}`, w, h, draw).clone(), rx, ry), roughness: rough}));

// ---------- textures ----------
const floorTiles = () => tex('floor', 256, 256, (c) => {
  const r = mulberry32(5);
  for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) {
    c.fillStyle = ((x + y) / 64) % 2 ? '#c9c6bc' : '#9c9a92'; c.fillRect(x, y, 64, 64);
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(60,55,45,${r() * 0.12})`; c.fillRect(x + r() * 64, y + r() * 64, 2 + r() * 5, 2 + r() * 5); }
  }
  c.strokeStyle = 'rgba(40,38,34,0.6)'; c.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); }
}, 7, 7, 0.6);
const wallPaint = () => tex('wall', 256, 256, (c) => {
  c.fillStyle = '#d8d8c8'; c.fillRect(0, 0, 256, 256);
  c.fillStyle = '#4f7f62'; c.fillRect(0, 180, 256, 76);
  c.fillStyle = '#2f5a42'; c.fillRect(0, 176, 256, 6);
  const r = mulberry32(8);
  for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(80,70,50,${0.03 + r() * 0.06})`; c.beginPath(); c.ellipse(r() * 256, r() * 256, 5 + r() * 30, 5 + r() * 40, 0, 0, 7); c.fill(); }
}, 3, 1);
const ceilingTiles = () => tex('ceil', 128, 128, (c) => {
  c.fillStyle = '#e4e2da'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = '#a9a69c'; c.lineWidth = 3; c.strokeRect(0, 0, 128, 128);
  const r = mulberry32(2); for (let i = 0; i < 200; i++) { c.fillStyle = `rgba(120,115,100,${r() * 0.25})`; c.fillRect(r() * 128, r() * 128, 1.5, 1.5); }
}, 9, 9);
// a shelf face full of colourful packs
const goods = (seed: number) => tex(`goods${seed}`, 512, 256, (c) => {
  const r = mulberry32(seed);
  c.fillStyle = '#2a2a2a'; c.fillRect(0, 0, 512, 256);
  const cols = ['#d23b2c', '#f2c230', '#2c6fd2', '#e8e4da', '#3a9a4a', '#f08a2c', '#8a3ab0', '#c9302c', '#5ac0e0'];
  for (let row = 0; row < 4; row++) {
    const y0 = row * 64 + 6;
    let x = 4;
    while (x < 508) {
      const w = 18 + r() * 34, h = 30 + r() * 26;
      const col = cols[Math.floor(r() * cols.length)];
      c.fillStyle = col; c.fillRect(x, y0 + (56 - h), w - 3, h);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + 3, y0 + (56 - h) + 6, w - 9, 6);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + w - 8, y0 + (56 - h), 5, h);
      x += w;
    }
    c.fillStyle = '#b8b8b0'; c.fillRect(0, y0 + 56, 512, 6);
    c.fillStyle = '#f2e64a'; for (let k = 0; k < 6; k++) c.fillRect(20 + k * 84, y0 + 56, 26, 6); // price tags
  }
});
// inside a fridge: bottles and cartons on shelves (drawn lit, the brightness is set per frame)
const fridgeInside = () => canvasTex('sfridgeIn', 256, 512, (c) => {
  const r = mulberry32(11);
  c.fillStyle = '#c9dff0'; c.fillRect(0, 0, 256, 512);
  const cols = ['#e83a2c', '#2c8ad2', '#f2f0e8', '#3ab04a', '#f2c230', '#8a4a2a', '#e86a9a'];
  for (let row = 0; row < 5; row++) {
    const y0 = row * 102 + 10;
    c.fillStyle = '#e8f2fa'; c.fillRect(0, y0 + 88, 256, 6);
    let x = 6;
    while (x < 250) {
      const w = 22 + r() * 12, h = 50 + r() * 34, col = cols[Math.floor(r() * cols.length)];
      c.fillStyle = col;
      c.fillRect(x + w * 0.2, y0 + 88 - h, w * 0.6, h);                       // bottle
      c.fillRect(x + w * 0.35, y0 + 88 - h - 10, w * 0.3, 12);               // neck
      c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + w * 0.28, y0 + 88 - h + 8, 4, h - 16);
      c.fillStyle = '#f5f2ea'; c.fillRect(x + w * 0.2, y0 + 88 - h * 0.6, w * 0.6, 10); // label
      x += w;
    }
  }
});
// fogged glass + the finger-written name (quantised so the material cache stays small)
const glassMat = (frost: number, write: number, writing: boolean) => {
  const fq = Math.round(frost * 6) / 6, wq = writing ? Math.round(write * 10) / 10 : 0;
  return std(`glass${fq}_${wq}`, () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide,
    map: canvasTex(`sglass${fq}_${wq}`, 256, 512, (c) => {
      c.clearRect(0, 0, 256, 512);
      c.fillStyle = `rgba(214,232,242,${0.06 + 0.8 * fq})`; c.fillRect(0, 0, 256, 512);
      const r = mulberry32(3);
      for (let i = 0; i < 40 * fq; i++) { c.fillStyle = `rgba(235,245,250,${0.1 + r() * 0.2})`; c.beginPath(); c.arc(r() * 256, r() * 512, 1 + r() * 4, 0, 7); c.fill(); }
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(230,240,245,0.06)'; c.beginPath(); c.ellipse(r() * 256, r() * 512, 20, 50, 0.3, 0, 7); c.fill(); }
      if (wq > 0) {
        // wiped strokes: clear the frost where the finger went, letter by letter
        // a darker wet rim around the wiped letters, then clear the frost inside them
        c.save(); c.font = 'bold 92px sans-serif'; c.textBaseline = 'middle'; c.textAlign = 'left';
        { const word = 'ДИМА', n = Math.ceil(wq * word.length), full = c.measureText(word).width;
          c.translate(128, 210); c.rotate(-0.06); c.lineWidth = 26; c.lineJoin = 'round'; c.strokeStyle = 'rgba(40,60,80,0.55)'; c.strokeText(word.slice(0, n), -full / 2, 0); }
        c.restore();
        c.save(); c.globalCompositeOperation = 'destination-out';
        c.font = 'bold 92px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        const word = 'ДИМА', n = Math.ceil(wq * word.length);
        c.lineWidth = 16; c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,1)';
        const partial = word.slice(0, n);
        c.translate(128, 210); c.rotate(-0.06);
        c.textAlign = 'left'; const full = c.measureText(word).width;
        c.strokeText(partial, -full / 2, 0); c.fillText(partial, -full / 2, 0);
        c.restore();
        // drips running down from the letters
        c.fillStyle = 'rgba(180,210,225,0.25)';
        for (let i = 0; i < n * 2; i++) c.fillRect(70 + i * 15, 240, 4, 30 + (i * 37) % 60);
      }
    })}));
};
const clockFace = (txt: string) => std(`clock${txt}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`sclock${txt}`, 256, 96, (c) => {
  c.fillStyle = '#090404'; c.fillRect(0, 0, 256, 96);
  c.fillStyle = '#ff2a1a'; c.font = 'bold 72px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = '#ff2a1a'; c.shadowBlur = 14; c.fillText(txt, 128, 52);
})}));
const signFace = (on: number) => std(`sign${on > 0.5 ? 1 : 0}`, () => new THREE.MeshBasicMaterial({toneMapped: false, map: canvasTex(`ssign${on > 0.5 ? 1 : 0}`, 512, 128, (c) => {
  c.fillStyle = '#0e1a14'; c.fillRect(0, 0, 512, 128);
  c.font = 'bold 84px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = '#3cff8a'; c.shadowBlur = 24; c.fillStyle = '#8affb8';
  // the «А» at the end is dead when `on` dips
  c.fillText(on > 0.5 ? '24 ЧАСА' : '24 ЧАС ', 256, 68);
})}));
const employee = () => std('employee', () => new THREE.MeshBasicMaterial({map: canvasTex('semployee', 192, 256, (c) => {
  c.fillStyle = '#e8e2cc'; c.fillRect(0, 0, 192, 256);
  c.fillStyle = '#b0262a'; c.font = 'bold 18px sans-serif'; c.textAlign = 'center';
  c.fillText('ЛУЧШИЙ', 96, 28); c.fillText('СОТРУДНИК', 96, 50); c.fillText('МЕСЯЦА', 96, 72);
  // the photo: the same shop counter… and nobody behind it (easter egg)
  c.fillStyle = '#7f9a8c'; c.fillRect(26, 86, 140, 140);
  c.fillStyle = '#a8c8d8'; c.fillRect(26, 86, 140, 70);
  c.fillStyle = '#5a4a3a'; c.fillRect(26, 180, 140, 46);
  c.fillStyle = '#2f7a4c'; c.fillRect(96, 168, 30, 12);
})}));

// ---------- pieces ----------
const Gondola: React.FC<{x: number; z0: number; z1: number}> = ({x, z0, z1}) => {
  const L = z1 - z0, zc = (z0 + z1) / 2, H = 1.55;
  return (
    <group>
      <Box s={[0.6, H, L]} p={[x, H / 2, zc]} m={matte('#3a3a3c', 0.6)} />
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[x + sd * 0.302, H / 2 + 0.05, zc]} rotation={[0, sd * Math.PI / 2, 0]} material={goods(17 + sd + Math.round(x * 10))}>
          <planeGeometry args={[L, H - 0.1]} />
        </mesh>
      ))}
      <Box s={[0.62, 0.08, 0.08]} p={[x, H + 0.04, z0]} m={matte('#b0262a', 0.5)} shadow={false} />
    </group>
  );
};

const Fridges: React.FC<{S: ShopState}> = ({S}) => {
  const {z, x0, x1, y0, y1, n} = FRIDGE;
  const w = (x1 - x0) / n, inside = fridgeInside();
  const lit = new THREE.Color('#dff0ff').lerp(new THREE.Color('#7ab4ff'), Math.max(0, Math.min(1, (S.fridge - 1.1) * 1.6))).multiplyScalar(0.25 + 0.6 * S.fridge);
  return (
    <group>
      {/* body */}
      <Box s={[x1 - x0 + 0.1, 0.15, 0.62]} p={[(x0 + x1) / 2, 0.075, z - 0.31]} m={matte('#2a2c30', 0.5)} />
      <Box s={[x1 - x0 + 0.1, 0.5, 0.62]} p={[(x0 + x1) / 2, y1 + 0.25, z - 0.31]} m={matte('#e8e8e4', 0.5)} />
      <mesh position={[(x0 + x1) / 2, y1 + 0.25, z + 0.002]}><planeGeometry args={[x1 - x0, 0.36]} /><meshBasicMaterial color={new THREE.Color('#2f7a4c').multiplyScalar(0.6 + 0.3 * S.lamps)} /></mesh>
      {Array.from({length: n}, (_, i) => {
        const cx = x0 + w * (i + 0.5);
        const rattle = S.knock * Math.sin(S.t * 60 + i * 2.1) * (i === WRITE_DOOR ? 1.6 : 1);
        return (
          <group key={i}>
            {/* lit inside */}
            <mesh position={[cx, (y0 + y1) / 2, z - 0.55]}>
              <planeGeometry args={[w - 0.04, y1 - y0]} />
              <meshBasicMaterial map={inside} color={lit} toneMapped={false} />
            </mesh>
            {[-1, 1].map((sd) => <mesh key={sd} position={[cx + sd * (w / 2 - 0.01), (y0 + y1) / 2, z - 0.28]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.55, y1 - y0]} /><meshBasicMaterial color={lit.clone().multiplyScalar(0.55)} toneMapped={false} /></mesh>)}
            {/* door frame + glass */}
            <group position={[cx, 0, z + rattle * 0.3]} rotation={[0, rattle * 0.4, 0]}>
              <Box s={[w - 0.01, 0.05, 0.04]} p={[0, y0, 0]} m={matte('#c9ccd0', 0.35)} shadow={false} />
              <Box s={[w - 0.01, 0.05, 0.04]} p={[0, y1, 0]} m={matte('#c9ccd0', 0.35)} shadow={false} />
              {[-1, 1].map((sd) => <Box key={sd} s={[0.04, y1 - y0, 0.04]} p={[sd * (w / 2 - 0.025), (y0 + y1) / 2, 0]} m={matte('#c9ccd0', 0.35)} shadow={false} />)}
              <Box s={[0.025, 0.4, 0.04]} p={[(i % 2 ? -1 : 1) * (w / 2 - 0.1), 1.1, 0.04]} m={matte('#9a9ea4', 0.3)} shadow={false} />
              <mesh position={[0, (y0 + y1) / 2, 0.012]} material={glassMat(S.frost, S.write, i === WRITE_DOOR)}>
                <planeGeometry args={[w - 0.06, y1 - y0 - 0.05]} />
              </mesh>
            </group>
          </group>
        );
      })}
      {/* the fridges throw cold light into the room */}
      <pointLight position={[(x0 + x1) / 2 + 0.6, 1.2, z + 0.5]} color="#bfe0ff" intensity={0.9 * S.fridge} distance={4} decay={1.4} />
      <pointLight position={[x0 + 1.0, 1.2, z + 0.5]} color="#bfe0ff" intensity={0.6 * S.fridge} distance={3.5} decay={1.4} />
    </group>
  );
};

const Counter: React.FC<{S: ShopState}> = ({S}) => {
  const {x0, x1, z0, z1, h} = COUNTER;
  return (
    <group>
      <Box s={[x1 - x0, h - 0.04, z1 - z0]} p={[(x0 + x1) / 2, (h - 0.04) / 2, (z0 + z1) / 2]} m={tex('cwood', 256, 128, (c) => {
        c.fillStyle = '#7a5a3c'; c.fillRect(0, 0, 256, 128);
        const r = mulberry32(14); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(40,25,12,${0.1 + r() * 0.2})`; c.beginPath(); const y = r() * 128; c.moveTo(0, y); c.bezierCurveTo(80, y + 6, 170, y - 6, 256, y + 3); c.stroke(); }
        c.fillStyle = '#2f7a4c'; c.fillRect(0, 0, 256, 18);
      }, 3, 1)} />
      <Box s={[x1 - x0 + 0.04, 0.04, z1 - z0 + 0.06]} p={[(x0 + x1) / 2, h - 0.02, (z0 + z1) / 2]} m={matte('#5d6064', 0.35)} />
      {/* conveyor belt */}
      <Box s={[0.9, 0.012, 0.36]} p={[1.65, h + 0.006, 0.07]} m={matte('#16161a', 0.7)} shadow={false} />
      {/* cash register + card terminal */}
      <Box s={[0.36, 0.14, 0.3]} p={[1.05, h + 0.07, -0.05]} m={matte('#2a2c30', 0.4)} />
      <Box s={[0.3, 0.2, 0.03]} p={[1.05, h + 0.25, -0.13]} r={[-0.3, 0, 0]} m={matte('#1a1c20', 0.4)} />
      <mesh position={[1.05, h + 0.25, -0.112]} rotation={[-0.3, 0, 0]}><planeGeometry args={[0.26, 0.15]} /><meshBasicMaterial color={new THREE.Color('#5ad0a0').multiplyScalar(0.7)} toneMapped={false} /></mesh>
      <Box s={[0.08, 0.04, 0.14]} p={[1.4, h + 0.02, -0.05]} m={matte('#3a3c40', 0.4)} />
      {/* the note, taped to the counter */}
      <mesh position={NOTE} rotation={[-Math.PI / 2, 0, 0.12]} material={std('noteM', () => new THREE.MeshStandardMaterial({roughness: 0.9, map: canvasTex('snote', 128, 160, (c) => {
        c.fillStyle = '#f1ead8'; c.fillRect(0, 0, 128, 160);
        c.strokeStyle = '#2a3a8a'; c.lineWidth = 3; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(14, 30 + i * 17); c.lineTo(100 + (i % 3) * 8, 28 + i * 17); c.stroke(); }
        c.fillStyle = 'rgba(230,230,200,0.7)'; c.fillRect(40, 0, 50, 14);
      })}))}><planeGeometry args={[0.16, 0.2]} /></mesh>
      {/* a cheap counter lamp hanging above (its light throws Dima's shadow on the fridges) */}
      <Box s={[0.012, 2.8 - 2.35, 0.012]} p={[0.9, (2.8 + 2.35) / 2, 0.25]} m={matte('#222')} shadow={false} />
      <mesh position={[0.9, 2.32, 0.25]}><coneGeometry args={[0.16, 0.14, 20, 1, true]} /><meshStandardMaterial color="#2f7a4c" side={THREE.DoubleSide} roughness={0.5} /></mesh>
      <mesh position={[0.9, 2.27, 0.25]}><sphereGeometry args={[0.05, 12, 8]} /><meshBasicMaterial color={new THREE.Color('#fff2d0').multiplyScalar(0.2 + 2.2 * S.counter)} toneMapped={false} /></mesh>
      <pointLight position={[0.9, 2.2, 0.25]} color="#ffe6c0" intensity={2.6 * S.counter} distance={4} decay={1.4} />
    </group>
  );
};

const Phone: React.FC<{S: ShopState}> = ({S}) => {
  const sh = S.ring * Math.sin(S.t * 90) * 0.004;
  return (
    <group position={[PHONE[0] + sh, PHONE[1], PHONE[2]]}>
      <Box s={[0.05, 0.24, 0.14]} p={[0, 0, 0]} m={matte('#c8b48a', 0.5)} />
      <mesh position={[-0.03, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.045, 0.045, 0.012, 20]} /><meshStandardMaterial color="#e8e0c8" roughness={0.5} /></mesh>
      {S.receiver && (
        <group position={[-0.045, 0, 0]} rotation={[S.ring * Math.sin(S.t * 70) * 0.05, 0, 0]}>
          <Box s={[0.04, 0.26, 0.05]} p={[0, 0.02, 0.09]} m={matte('#d8d2c2', 0.4)} />
          <Box s={[0.05, 0.06, 0.07]} p={[0, 0.14, 0.09]} m={matte('#d8d2c2', 0.4)} />
          <Box s={[0.05, 0.06, 0.07]} p={[0, -0.1, 0.09]} m={matte('#d8d2c2', 0.4)} />
        </group>
      )}
      {/* curly cord */}
      {Array.from({length: 9}, (_, i) => (
        <mesh key={i} position={[-0.03, -0.16 - i * 0.04, 0.05]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.018, 0.005, 6, 12]} /><meshStandardMaterial color="#c8c2b2" roughness={0.6} /></mesh>
      ))}
    </group>
  );
};

const FrontWall: React.FC<{S: ShopState}> = ({S}) => {
  const {x0, x1, z1, h} = ROOM;
  const wall = wallPaint();
  const glass = std('frontGlass', () => new THREE.MeshBasicMaterial({color: '#9ac0d0', transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide}));
  const frame = matte('#3a3c40', 0.4);
  const open = S.door;
  return (
    <group>
      {/* wall pieces around the window and the door */}
      <mesh position={[(x0 + WIN.x0) / 2, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[WIN.x0 - x0, h]} /></mesh>
      <mesh position={[(WIN.x0 + WIN.x1) / 2, WIN.y0 / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[WIN.x1 - WIN.x0, WIN.y0]} /></mesh>
      <mesh position={[(WIN.x0 + WIN.x1) / 2, (WIN.y1 + h) / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[WIN.x1 - WIN.x0, h - WIN.y1]} /></mesh>
      <mesh position={[(WIN.x1 + DOOR.x0) / 2, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[DOOR.x0 - WIN.x1, h]} /></mesh>
      <mesh position={[(DOOR.x0 + DOOR.x1) / 2, (DOOR.h + h) / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[DOOR.x1 - DOOR.x0, h - DOOR.h]} /></mesh>
      <mesh position={[(DOOR.x1 + x1) / 2, h / 2, z1]} rotation={[0, Math.PI, 0]} material={wall}><planeGeometry args={[x1 - DOOR.x1, h]} /></mesh>
      {/* the outside of the same wall (dark facade), seen in the street shot */}
      <mesh position={[(x0 + WIN.x0) / 2, 1.8, z1 + 0.06]} material={matte('#3a3a42')}><planeGeometry args={[WIN.x0 - x0, 3.6]} /></mesh>
      <mesh position={[(DOOR.x1 + x1) / 2, 1.8, z1 + 0.06]} material={matte('#3a3a42')}><planeGeometry args={[x1 - DOOR.x1, 3.6]} /></mesh>
      <mesh position={[(WIN.x1 + DOOR.x0) / 2, 1.8, z1 + 0.06]} material={matte('#3a3a42')}><planeGeometry args={[DOOR.x0 - WIN.x1, 3.6]} /></mesh>
      <mesh position={[(WIN.x0 + WIN.x1) / 2, WIN.y0 / 2, z1 + 0.06]} material={matte('#3a3a42')}><planeGeometry args={[WIN.x1 - WIN.x0, WIN.y0]} /></mesh>
      <mesh position={[(WIN.x0 + DOOR.x1) / 2, (WIN.y1 + 3.6) / 2, z1 + 0.06]} material={matte('#3a3a42')}><planeGeometry args={[DOOR.x1 - WIN.x0, 3.6 - WIN.y1]} /></mesh>
      {/* window glass + mullions */}
      <mesh position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, z1]} material={glass}><planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} /></mesh>
      {[WIN.x0, (WIN.x0 + WIN.x1) / 2, WIN.x1].map((x) => <Box key={x} s={[0.05, WIN.y1 - WIN.y0, 0.06]} p={[x, (WIN.y0 + WIN.y1) / 2, z1]} m={frame} shadow={false} />)}
      {[WIN.y0, WIN.y1].map((y) => <Box key={y} s={[WIN.x1 - WIN.x0, 0.05, 0.06]} p={[(WIN.x0 + WIN.x1) / 2, y, z1]} m={frame} shadow={false} />)}
      {/* window lettering, seen backwards from inside */}
      <mesh position={[(WIN.x0 + WIN.x1) / 2, 2.15, z1 + 0.005]} material={std('winTxt', () => new THREE.MeshBasicMaterial({transparent: true, depthWrite: false, side: THREE.DoubleSide, map: canvasTex('swintxt', 512, 64, (c) => {
        c.clearRect(0, 0, 512, 64); c.fillStyle = 'rgba(240,200,60,0.85)'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText('ПРОДУКТЫ  •  24 ЧАСА', 256, 46);
      })}))}><planeGeometry args={[2.4, 0.3]} /></mesh>
      {/* the glass door, hinged on the left (x0) */}
      <group position={[DOOR.x0, 0, z1]} rotation={[0, -open * 1.3, 0]}>
        <mesh position={[(DOOR.x1 - DOOR.x0) / 2, DOOR.h / 2, 0]} material={glass}><planeGeometry args={[DOOR.x1 - DOOR.x0, DOOR.h]} /></mesh>
        {[0.02, DOOR.x1 - DOOR.x0 - 0.02].map((x) => <Box key={x} s={[0.05, DOOR.h, 0.05]} p={[x, DOOR.h / 2, 0]} m={frame} shadow={false} />)}
        {[0.03, DOOR.h - 0.03, 1.0].map((y) => <Box key={y} s={[DOOR.x1 - DOOR.x0, 0.05, 0.05]} p={[(DOOR.x1 - DOOR.x0) / 2, y, 0]} m={frame} shadow={false} />)}
        <Box s={[0.03, 0.3, 0.03]} p={[DOOR.x1 - DOOR.x0 - 0.1, 1.1, -0.05]} m={matte('#b9bdc2', 0.3)} shadow={false} />
      </group>
      {/* the bell above the door */}
      <group position={[DOOR.x1 - 0.15, DOOR.h + 0.05, z1 - 0.08]} rotation={[Math.sin(S.t * 14) * 0.5 * open, 0, 0]}>
        <mesh position={[0, -0.05, 0]}><coneGeometry args={[0.04, 0.07, 14, 1, true]} /><meshStandardMaterial color="#c9a24a" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} /></mesh>
      </group>
      {/* digital clock above the door */}
      <Box s={[0.34, 0.14, 0.04]} p={[CLOCK[0], CLOCK[1], CLOCK[2] + 0.01]} m={matte('#111', 0.4)} shadow={false} />
      <mesh position={[CLOCK[0], CLOCK[1], CLOCK[2] - 0.012]} rotation={[0, Math.PI, 0]} material={clockFace(S.clock)}><planeGeometry args={[0.3, 0.11]} /></mesh>
      <pointLight position={[CLOCK[0], CLOCK[1], CLOCK[2] - 0.2]} color="#ff2a1a" intensity={0.12} distance={1} decay={2} />
      {/* facade sign above the door, outside */}
      <Box s={[2.2, 0.5, 0.12]} p={[0.2, 3.05, z1 + 0.12]} m={matte('#14181a', 0.5)} shadow={false} />
      <mesh position={[0.2, 3.05, z1 + 0.185]} material={signFace(S.sign)}><planeGeometry args={[2.1, 0.44]} /></mesh>
      <pointLight position={[0.2, 3.0, z1 + 0.7]} color="#5aff9a" intensity={0.8 * S.sign} distance={4} decay={1.6} />
    </group>
  );
};

const Street: React.FC<{S: ShopState}> = ({S}) => {
  const sky = new THREE.Color('#05070d').lerp(new THREE.Color('#c7a6a8'), S.dawn);
  const ground = new THREE.Color('#15161a').lerp(new THREE.Color('#6a6466'), S.dawn);
  return (
    <group>
      <mesh position={[0, -0.01, ROOM.z1 + 5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 10]} /><meshStandardMaterial color={ground} roughness={0.9} /></mesh>
      <Box s={[30, 0.12, 2.2]} p={[0, 0.06, ROOM.z1 + 1.1]} m={matte('#55565c', 0.9)} />
      <mesh position={[0, 6, ROOM.z1 + 12]} rotation={[0, Math.PI, 0]}><planeGeometry args={[60, 20]} /><meshBasicMaterial color={sky} side={THREE.DoubleSide} toneMapped={false} /></mesh>
      {/* houses across the street: dark blocks with a few windows */}
      {[-6, -2.5, 1.5, 5.5].map((x, i) => (
        <group key={x}>
          <Box s={[3.2, 6 + i, 0.5]} p={[x, (6 + i) / 2, ROOM.z1 + 9]} m={matte(new THREE.Color('#14161c').lerp(new THREE.Color('#7a6e70'), S.dawn).getStyle(), 0.9)} shadow={false} />
          {[0, 1, 2].map((k) => <mesh key={k} position={[x - 0.8 + k * 0.8, 2 + ((i + k) % 3) * 1.4, ROOM.z1 + 8.74]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.35, 0.5]} /><meshBasicMaterial color={new THREE.Color((i + k) % 2 ? '#ffcf7a' : '#202430').multiplyScalar(1 - S.dawn * 0.6)} toneMapped={false} side={THREE.DoubleSide} /></mesh>)}
        </group>
      ))}
      {/* lamp post */}
      <Box s={[0.08, 4, 0.08]} p={[-1.8, 2, ROOM.z1 + 2.0]} m={matte('#2a2c30', 0.5)} />
      <mesh position={[-1.8, 4.0, ROOM.z1 + 2.0]}><sphereGeometry args={[0.12, 12, 10]} /><meshBasicMaterial color={new THREE.Color('#ffb860').multiplyScalar(2 * (1 - S.dawn))} toneMapped={false} /></mesh>
      <pointLight position={[-1.8, 3.8, ROOM.z1 + 2.0]} color="#ffb060" intensity={3 * (1 - S.dawn)} distance={8} decay={1.5} />
      <hemisphereLight args={['#ffd8c8', '#404048', 0.8 * S.dawn]} />
    </group>
  );
};

// ---------- the whole shop ----------
export const ShopSet: React.FC<{S: ShopState}> = ({S}) => {
  const {x0, x1, z0, z1, h} = ROOM;
  const wall = wallPaint();
  const tubes: V3[] = [[-1.6, h - 0.02, 1.4], [0.0, h - 0.02, 2.4], [-1.0, h - 0.02, -0.2], [1.3, h - 0.02, 1.6]];
  return (
    <group>
      <ambientLight color="#3a4048" intensity={0.25 + 0.25 * S.lamps} />
      <mesh position={[(x0 + x1) / 2, 0, (z0 + z1) / 2]} rotation={[-Math.PI / 2, 0, 0]} material={floorTiles()} receiveShadow><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[(x0 + x1) / 2, h, (z0 + z1) / 2]} rotation={[Math.PI / 2, 0, 0]} material={ceilingTiles()}><planeGeometry args={[x1 - x0, z1 - z0]} /></mesh>
      <mesh position={[x0, h / 2, (z0 + z1) / 2]} rotation={[0, Math.PI / 2, 0]} material={wall} receiveShadow><planeGeometry args={[z1 - z0, h]} /></mesh>
      <mesh position={[x1, h / 2, (z0 + z1) / 2]} rotation={[0, -Math.PI / 2, 0]} material={wall} receiveShadow><planeGeometry args={[z1 - z0, h]} /></mesh>
      <mesh position={[(x0 + x1) / 2, h / 2, z0]} material={wall}><planeGeometry args={[x1 - x0, h]} /></mesh>
      {/* fluorescent tubes */}
      {tubes.map((p, i) => (
        <group key={i}>
          <Box s={[0.18, 0.04, 1.25]} p={p} m={matte('#d8d8d0', 0.5)} shadow={false} />
          <mesh position={[p[0], p[1] - 0.025, p[2]]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.12, 1.2]} /><meshBasicMaterial color={new THREE.Color('#e8fff4').multiplyScalar(0.1 + 1.5 * S.lamps * (i === 2 ? 0.8 : 1))} toneMapped={false} /></mesh>
          <pointLight position={[p[0], p[1] - 0.3, p[2]]} color="#e4f6ec" intensity={1.6 * S.lamps} distance={5} decay={1.5} />
        </group>
      ))}
      <Fridges S={S} />
      <Counter S={S} />
      <Gondola x={-2.3} z0={0.5} z1={2.8} />
      <Gondola x={-1.0} z0={0.5} z1={2.8} />
      <Phone S={S} />
      <mesh position={[x1 - 0.005, 1.95, 0.15]} rotation={[0, -Math.PI / 2, 0]} material={employee()}><planeGeometry args={[0.3, 0.4]} /></mesh>
      <Box s={[0.02, 0.44, 0.34]} p={[x1 - 0.012, 1.95, 0.15]} m={matte('#6a4a2a', 0.5)} shadow={false} />
      {/* bread rack by the counter */}
      <Box s={[0.5, 0.9, 0.4]} p={[2.3, 0.45, 0.9]} m={matte('#8a6a44', 0.7)} />
      {[0.3, 0.6, 0.85].map((y) => <mesh key={y} position={[2.3, y + 0.04, 0.9]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.05, 0.3, 4, 10]} /><meshStandardMaterial color="#c88a44" roughness={0.8} /></mesh>)}
      <FrontWall S={S} />
      <Street S={S} />
    </group>
  );
};

// quads (3D) for clipping puppets
export const quadZ = (z: number, xa: number, xb: number, ya: number, yb: number): V3[] => [[xa, ya, z], [xb, ya, z], [xb, yb, z], [xa, yb, z]];
export const ABOVE_COUNTER = (far: number): V3[] => quadZ(far, -6, 6, COUNTER.h, 6);
export const FRIDGE_GLASS: V3[] = quadZ(FRIDGE.z + 0.02, FRIDGE.x0, FRIDGE.x1, FRIDGE.y0, FRIDGE.y1);
export const DOOR_GLASS: V3[] = quadZ(ROOM.z1, DOOR.x0 + 0.04, DOOR.x1 - 0.04, 0.05, DOOR.h - 0.05);
export const WIN_GLASS: V3[] = quadZ(ROOM.z1, WIN.x0, WIN.x1, WIN.y0, WIN.y1);
export const mixV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
