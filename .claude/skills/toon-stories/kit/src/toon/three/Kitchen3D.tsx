// 3D night kitchen for the Blackout scene: room with a real window opening, city outside (windows switch off),
// furniture and props in toon style, and the light rig (lamp, blue night, moonlight through the window, phone).
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {G, Tm, V3, basic, canvasTex, toon} from './toon3d';
import {mulberry32} from '../lib/anim';

export const WIN3 = {x0: -2.25, x1: -0.85, y0: 1.0, y1: 2.2, z: -1.5};
export const TABLE3 = {y: 0.78, z: -0.05};
export const LAMP3: V3 = [0, 2.2, -0.05];
const CORD = 3.4 - LAMP3[1] - 0.1; // ceiling to shade

const CREAM = '#e6d2b3', WHITE = '#f3eee6', SAGE = '#7ea597', SAGE_D = '#6f9789', WOOD = '#c48a5c', WOOD_D = '#a7704a';

// ---------- outside ----------
type Win = {x: number; y: number; z: number; w: number; h: number; col: string; off: number};
const cityData = () => {
  const r = mulberry32(19);
  const blds: {x: number; z: number; w: number; d: number; top: number; col: string}[] = [];
  const wins: Win[] = [];
  const LIT = ['#ffd27a', '#ffe3a3', '#ffc864', '#bfe3ff'];
  const row = (z: number, x0: number, x1: number, tMin: number, tMax: number, col: string, ww: number, wh: number, gx: number, gy: number, far: boolean) => {
    let x = x0;
    while (x < x1) {
      const w = (far ? 0.7 : 0.9) + r() * (far ? 0.9 : 1.1), top = tMin + r() * (tMax - tMin), d = 0.8;
      blds.push({x: x + w / 2, z, w, d, top, col});
      for (let y = top - 0.22; y > -1.5; y -= gy)
        for (let xx = x + 0.14; xx < x + w - 0.12; xx += gx)
          if (r() < 0.45) wins.push({x: xx, y, z: z + d / 2 + 0.005, w: ww, h: wh, col: LIT[Math.floor(r() * (r() < 0.15 ? 4 : 3))],
            off: far ? 5 + r() * 16 : ((x1 - xx) / (x1 - x0)) * 7 + r() * 3});
      x += w + 0.06 + r() * 0.25;
    }
  };
  row(-12, -10, -1, 1.2, 3.4, '#2d3668', 0.09, 0.12, 0.18, 0.22, true);
  row(-8, -7.5, -0.2, 0.3, 2.0, '#212955', 0.13, 0.17, 0.27, 0.32, false);
  return {blds, wins};
};

const Outside: React.FC<{f: number; offF: number; dark: number; t: number}> = ({f, offF, dark, t}) => {
  const city = useMemo(cityData, []);
  const inst = useRef<THREE.InstancedMesh>(null);
  const sky = canvasTex('sky3', 8, 256, (c) => {
    const gr = c.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#0f1638'); gr.addColorStop(0.55, '#26295e'); gr.addColorStop(1, '#4d3f7c');
    c.fillStyle = gr; c.fillRect(0, 0, 8, 256);
  });
  const glowT = canvasTex('glow3', 8, 128, (c) => {
    const gr = c.createLinearGradient(0, 0, 0, 128);
    gr.addColorStop(0, 'rgba(255,170,100,0)'); gr.addColorStop(1, 'rgba(255,160,90,0.55)');
    c.fillStyle = gr; c.fillRect(0, 0, 8, 128);
  });
  const halo = canvasTex('halo3', 128, 128, (c) => {
    const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(225,232,255,0.9)'); gr.addColorStop(0.25, 'rgba(225,232,255,0.35)'); gr.addColorStop(1, 'rgba(225,232,255,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
  });
  const stars = useMemo(() => {
    const r = mulberry32(3); const p: number[] = [];
    for (let i = 0; i < 160; i++) p.push(-13 + r() * 13, 1.5 + r() * 6, -15.5);
    return new THREE.BufferAttribute(new Float32Array(p), 3);
  }, []);
  const snow = useMemo(() => {
    const r = mulberry32(11);
    return Array.from({length: 140}, () => ({x: -4.2 + r() * 3.8, y: r() * 4.5, z: -1.8 - r() * 4, v: 0.25 + r() * 0.35, p: r() * 6}));
  }, []);
  const snowPos = useMemo(() => new THREE.BufferAttribute(new Float32Array(snow.length * 3), 3), [snow]);

  useLayoutEffect(() => {
    const m = inst.current; if (!m) return;
    const o = new THREE.Object3D(); const col = new THREE.Color();
    city.wins.forEach((w, i) => {
      const d = f - offF - w.off;
      const on = d < -3 ? 1 : d < 0 ? (Math.floor(f / 2) % 2 ? 0.25 : 1) : 0;
      o.position.set(w.x, w.y, w.z); o.scale.set(on > 0 ? w.w : 0, on > 0 ? w.h : 0, 1); o.updateMatrix();
      m.setMatrixAt(i, o.matrix); m.setColorAt(i, col.set(w.col).multiplyScalar(on * 1.6));
    });
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
    snow.forEach((s, i) => {
      const y = 3.8 - ((s.y + t * s.v) % 4.5);
      snowPos.setXYZ(i, s.x + Math.sin(t * 1.2 + s.p) * 0.08, y, s.z);
    });
    snowPos.needsUpdate = true;
  });

  const towerOn = f < offF + 14 && Math.sin(t * 3) > 0;
  return (
    <group>
      <mesh position={[-6, 3, -16]} material={basic('#ffffff', {map: sky, fog: false})}><planeGeometry args={[30, 14]} /></mesh>
      <points material={new THREE.PointsMaterial({color: '#f3f0ff', size: 0.045, transparent: true, opacity: 0.3 + 0.7 * dark, toneMapped: false})}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars.array, 3]} /></bufferGeometry>
      </points>
      <mesh position={[-4.6, 4.3, -15]} geometry={G.sphere(0.42)} material={basic('#f2f0e6', {toneMapped: false})} />
      <sprite position={[-4.6, 4.3, -15.1]} scale={[3.2, 3.2, 1]} material={new THREE.SpriteMaterial({map: halo, transparent: true, depthWrite: false})} />
      <mesh position={[-5, 0.4, -11.6]} material={basic('#ffffff', {map: glowT, transparent: true, opacity: 1 - dark * 0.9, depthWrite: false})}><planeGeometry args={[16, 3]} /></mesh>
      <mesh position={[-3.6, 1.2, -11.9]} material={basic('#2a3263')}><cylinderGeometry args={[0.03, 0.14, 5, 6]} /></mesh>
      <mesh position={[-3.6, 3.75, -11.9]} geometry={G.sphere(0.06)} material={basic(towerOn ? '#ff4d4d' : '#3a1c26', {toneMapped: false})} />
      {city.blds.map((b, i) => (
        <mesh key={i} position={[b.x, (b.top - 6) / 2, b.z]} material={basic(b.col)}><boxGeometry args={[b.w, b.top + 6, b.d]} /></mesh>
      ))}
      <instancedMesh ref={inst} args={[G.plane(1, 1), new THREE.MeshBasicMaterial({toneMapped: false}), city.wins.length]} />
      <points material={new THREE.PointsMaterial({color: '#f4f6ff', size: 0.03, transparent: true, opacity: 0.8})}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[snowPos.array, 3]} /></bufferGeometry>
      </points>
    </group>
  );
};

// ---------- room ----------
const Curtain: React.FC<{x: number; t: number; dir: number}> = ({x, t, dir}) => (
  <group position={[x, 1.48, -1.4]}>
    {[0, 1, 2, 3].map((i) => (
      <Tm key={i} geo={G.cyl(0.05, 1.56, false)} c={i % 2 ? '#d28a70' : '#e3a083'} p={[(i - 1.5) * 0.075, 0, Math.sin(i * 2) * 0.01]}
        r={[Math.sin(t * 0.9 + i) * 0.012, 0, dir * Math.sin(t * 0.9) * 0.01]} s={[1, 1, 0.7]} />
    ))}
  </group>
);

const Kettle: React.FC<{lit: number}> = ({lit}) => (
  <group position={[1.82, 0.93, -1.2]} rotation={[0, 0.5, 0]}>
    <Tm geo={G.lathe('kettle', [[0.001, 0], [0.12, 0], [0.125, 0.04], [0.11, 0.17], [0.07, 0.2], [0.001, 0.205]])} c="#e3654f" />
    <Tm geo={G.cyl(0.128, 0.035, false)} c="#3a3f52" p={[0, 0.017, 0]} />
    <Tm geo={G.sphere(0.03)} c="#3a3f52" p={[0, 0.21, 0]} />
    <Tm geo={G.torus(0.08, 0.016, Math.PI)} c="#2a2e40" p={[0.07, 0.15, 0]} r={[0, 0, -Math.PI / 2]} />
    <Tm geo={G.cone(0.02, 0.04, 0.13)} c="#e3654f" p={[-0.14, 0.12, 0]} r={[0, 0, 0.95]} />
    <mesh position={[0, 0.02, 0.13]} geometry={G.sphere(0.01)} material={basic(lit ? '#ff7a3d' : '#4a2522', {toneMapped: false})} />
  </group>
);

const Plant: React.FC<{t: number}> = ({t}) => (
  <group position={[-2.02, 1.01, -1.43]}>
    <Tm geo={G.cone(0.075, 0.055, 0.12)} c="#c96f4a" p={[0, 0.06, 0]} />
    {[-0.6, -0.25, 0.1, 0.45, 0.8].map((a, i) => (
      <Tm key={i} geo={G.sphere(0.04)} c={i % 2 ? '#5f9a6f' : '#4f8a62'} p={[Math.sin(a) * 0.08, 0.2, Math.cos(a * 2) * 0.03]}
        r={[0, 0, -a + Math.sin(t * 1.4 + i) * 0.05]} s={[0.55, 2.4, 0.5]} />
    ))}
  </group>
);

export const Room3D: React.FC<{f: number; t: number; offF: number; dark: number; lit: number; lamp: number; swing: number}> = ({f, t, offF, dark, lit, lamp, swing}) => {
  const W = WIN3;
  const wood = canvasTex('floor3', 512, 512, (c) => {
    c.fillStyle = '#8f6c56'; c.fillRect(0, 0, 512, 512);
    c.fillStyle = '#7a5a47'; for (let y = 0; y < 512; y += 64) c.fillRect(0, y, 512, 5);
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 4);
  const tiles = canvasTex('tiles3', 256, 256, (c) => {
    c.fillStyle = '#eef1ec'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#ccd5cf'; for (let i = 0; i <= 256; i += 42) { c.fillRect(i, 0, 4, 256); c.fillRect(0, i, 256, 4); }
  });
  const wall = (p: V3, s: V3) => <Tm geo={G.box(s[0], s[1], s[2], 0.004)} c={CREAM} p={p} ow={0} />;
  return (
    <group>
      <Outside f={f} offF={offF} dark={dark} t={t} />
      {/* back wall with the window hole */}
      {wall([-4.125, 1.7, -1.56], [3.75, 3.4, 0.12])}
      {wall([2.575, 1.7, -1.56], [6.85, 3.4, 0.12])}
      {wall([-1.55, 0.5, -1.56], [1.4, 1.0, 0.12])}
      {wall([-1.55, 2.8, -1.56], [1.4, 1.2, 0.12])}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]} receiveShadow material={toon('#ffffff', wood)}><planeGeometry args={[14, 6]} /></mesh>
      <Tm geo={G.box(14, 0.09, 0.03, 0.01)} c="#efe6d8" p={[0, 0.045, -1.49]} ow={0.006} />
      {/* window frame, mullion, transom, sill */}
      <Tm geo={G.box(0.07, 1.27, 0.1)} c={WHITE} p={[W.x0, 1.6, -1.5]} />
      <Tm geo={G.box(0.07, 1.27, 0.1)} c={WHITE} p={[W.x1, 1.6, -1.5]} />
      <Tm geo={G.box(1.47, 0.07, 0.1)} c={WHITE} p={[-1.55, W.y1, -1.5]} />
      <Tm geo={G.box(0.05, 1.2, 0.07)} c={WHITE} p={[-1.55, 1.6, -1.52]} />
      <Tm geo={G.box(0.7, 0.045, 0.07)} c={WHITE} p={[-1.9, 1.85, -1.52]} />
      <Tm geo={G.box(1.62, 0.045, 0.22)} c="#f6f2ea" p={[-1.55, 0.985, -1.42]} />
      <Plant t={t} />
      {/* radiator */}
      <Tm geo={G.box(1.05, 0.42, 0.07)} c="#ece7df" p={[-1.55, 0.55, -1.45]} />
      {Array.from({length: 9}, (_, i) => <Tm key={i} geo={G.box(0.035, 0.36, 0.03, 0.012)} c="#d9d2c6" p={[-1.95 + i * 0.1, 0.55, -1.405]} ow={0.004} />)}
      {/* curtains + rod */}
      <Tm geo={G.cyl(0.018, 2.5, false)} c="#7b5a48" p={[-1.55, 2.3, -1.4]} r={[0, 0, Math.PI / 2]} />
      <Curtain x={-2.45} t={t} dir={1} />
      <Curtain x={-0.65} t={t} dir={-1} />
      {/* counter, tiles, cabinets */}
      <mesh position={[1.95, 1.23, -1.495]} material={toon('#ffffff', tiles)}><planeGeometry args={[1.15, 0.62]} /></mesh>
      <Tm geo={G.box(1.15, 0.86, 0.6)} c={SAGE_D} p={[1.95, 0.43, -1.2]} />
      <Tm geo={G.box(0.01, 0.76, 0.01)} c="#3c4f4a" p={[1.95, 0.45, -0.895]} ow={0} />
      {[1.9, 2.0].map((x) => <Tm key={x} geo={G.box(0.02, 0.09, 0.02, 0.008)} c="#e9e4dc" p={[x, 0.72, -0.89]} ow={0.004} />)}
      <Tm geo={G.box(1.25, 0.05, 0.66, 0.012)} c="#e3dccf" p={[1.95, 0.885, -1.18]} />
      <Tm geo={G.box(1.15, 0.72, 0.36)} c={SAGE} p={[1.95, 1.93, -1.32]} />
      <Tm geo={G.box(0.01, 0.64, 0.01)} c="#3c4f4a" p={[1.95, 1.93, -1.135]} ow={0} />
      {[1.9, 2.0].map((x) => <Tm key={x} geo={G.box(0.02, 0.09, 0.02, 0.008)} c="#e9e4dc" p={[x, 1.68, -1.13]} ow={0.004} />)}
      <Kettle lit={lit} />
      {/* fridge */}
      <Tm geo={G.box(0.72, 2.0, 0.66, 0.06)} c="#eceef0" p={[2.95, 1.0, -1.17]} />
      <Tm geo={G.box(0.7, 0.012, 0.01)} c="#9aa3b0" p={[2.95, 1.42, -0.837]} ow={0} />
      <Tm geo={G.box(0.03, 0.22, 0.03, 0.012)} c="#9aa3b0" p={[2.66, 1.62, -0.82]} ow={0.004} />
      <Tm geo={G.box(0.03, 0.36, 0.03, 0.012)} c="#9aa3b0" p={[2.66, 1.1, -0.82]} ow={0.004} />
      <Tm geo={G.box(0.16, 0.07, 0.01, 0.01)} c="#26304a" p={[2.82, 1.3, -0.834]} ow={0.004} />
      <mesh position={[2.82, 1.3, -0.828]} material={basic(lit ? '#7fd8ff' : '#26304a', {toneMapped: false})}><planeGeometry args={[0.1, 0.035]} /></mesh>
      <Tm geo={G.box(0.12, 0.12, 0.006, 0.004)} c="#ffe08a" p={[3.05, 1.18, -0.833]} r={[0, 0, 0.08]} ow={0.004} />
      {/* table + chair */}
      <Tm geo={G.box(1.7, 0.055, 0.86, 0.02)} c={WOOD} p={[0.05, TABLE3.y, TABLE3.z]} />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <Tm key={i} geo={G.box(0.06, 0.76, 0.06, 0.015)} c={WOOD_D} p={[0.05 + sx * 0.78, 0.38, TABLE3.z + sz * 0.37]} />
      ))}
      <Tm geo={G.box(0.46, 0.05, 0.42, 0.015)} c="#8b5a3c" p={[0, 0.46, -0.66]} />
      {[-1, 1].map((s) => <Tm key={s} geo={G.box(0.045, 0.95, 0.045, 0.015)} c="#8b5a3c" p={[s * 0.2, 0.47, -0.85]} />)}
      <Tm geo={G.box(0.44, 0.14, 0.04, 0.015)} c="#8b5a3c" p={[0, 0.88, -0.85]} />
      {/* hanging lamp */}
      <group position={[LAMP3[0], 3.4, LAMP3[2]]} rotation={[0, 0, swing]}>
        <mesh position={[0, -CORD / 2, 0]} geometry={G.cyl(0.006, CORD, false)} material={toon('#1f2236')} />
        <group position={[0, -CORD, 0]}>
          <Tm geo={G.lathe('shade', [[0.03, 0.06], [0.06, 0.05], [0.18, -0.03], [0.27, -0.11], [0.268, -0.115]])} c="#e8b04a" />
          <mesh geometry={G.lathe('shade', [[0.03, 0.06], [0.06, 0.05], [0.18, -0.03], [0.27, -0.11], [0.268, -0.115]])} material={lamp > 0.5 ? basic('#f6d58a', {side: THREE.BackSide}) : toon('#8a7446')} />
          <mesh position={[0, -0.12, 0]} geometry={G.sphere(0.05)} material={basic(lamp > 0.5 ? '#fff3c4' : '#8d93a3', {toneMapped: lamp < 0.5})} />
        </group>
      </group>
    </group>
  );
};

// ---------- props on the table ----------
export const Mug3D: React.FC<{p: V3; t: number; steam: number}> = ({p, t, steam}) => {
  const puff = canvasTex('puff3', 64, 64, (c) => {
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  });
  return (
    <group position={p}>
      <Tm geo={G.lathe('mug', [[0.001, 0], [0.05, 0], [0.056, 0.012], [0.058, 0.115], [0.054, 0.115], [0.05, 0.02], [0.001, 0.02]])} c="#f2ebe0" />
      <Tm geo={G.cyl(0.0585, 0.03, false)} c="#e3654f" p={[0, 0.07, 0]} ow={0} />
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} material={toon('#6b4130')}><circleGeometry args={[0.052, 24]} /></mesh>
      <Tm geo={G.torus(0.033, 0.009, Math.PI * 1.25)} c="#f2ebe0" p={[0.062, 0.06, 0]} r={[0, 0, -Math.PI * 0.62]} />
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.45 + i / 3) % 1;
        return (
          <sprite key={i} position={[Math.sin(t * 2 + i * 2) * 0.02, 0.15 + ph * 0.32, 0]} scale={[0.07 + ph * 0.09, 0.07 + ph * 0.09, 1]}
            material={new THREE.SpriteMaterial({map: puff, transparent: true, opacity: steam * 0.5 * (1 - ph) * Math.min(1, ph * 4), depthWrite: false})} />
        );
      })}
    </group>
  );
};

export const Phone3D: React.FC<{p: V3; r: V3; glow: number}> = ({p, r, glow}) => (
  <group position={p} rotation={new THREE.Euler(r[0], r[1], r[2], 'YXZ')}>
    <Tm geo={G.box(0.078, 0.155, 0.011, 0.008)} c="#2a2e40" ow={0.004} />
    <mesh position={[0, 0, -0.0062]} rotation={[0, Math.PI, 0]} material={basic(glow > 0.02 ? '#a9d4ff' : '#1a1d2b', {toneMapped: glow < 0.02})}>
      <planeGeometry args={[0.068, 0.14]} />
    </mesh>
    <mesh position={[-0.022, 0.055, 0.0062]} geometry={G.sphere(0.008)} material={toon('#151826')} />
  </group>
);

// dust motes in the lamp cone
export const Dust3D: React.FC<{t: number; o: number}> = ({t, o}) => {
  const motes = useMemo(() => { const r = mulberry32(23); return Array.from({length: 60}, () => ({x: (r() - 0.5) * 1.2, y: 0.9 + r() * 1.0, z: -0.6 + r() * 0.9, p: r() * 9, v: 0.02 + r() * 0.03})); }, []);
  const pos = useMemo(() => new THREE.BufferAttribute(new Float32Array(motes.length * 3), 3), [motes]);
  useLayoutEffect(() => {
    motes.forEach((m, i) => pos.setXYZ(i, m.x + Math.sin(t * 0.6 + m.p) * 0.05, 0.9 + ((m.y - 0.9 + t * m.v) % 1.0), m.z));
    pos.needsUpdate = true;
  });
  return (
    <points material={new THREE.PointsMaterial({color: '#fff4d6', size: 0.012, transparent: true, opacity: 0.6 * o, depthWrite: false, toneMapped: false})}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos.array, 3]} /></bufferGeometry>
    </points>
  );
};

// ---------- lights ----------
export const Lights3D: React.FC<{lamp: number; dark: number; glow: number; phone: V3}> = ({lamp, dark, glow, phone}) => {
  const spot = useMemo(() => { const s = new THREE.SpotLight(); s.target.position.set(LAMP3[0], 0, LAMP3[2]); return s; }, []);
  const moon = useMemo(() => { const d = new THREE.DirectionalLight(); d.target.position.set(-0.6, 0, 0.3); return d; }, []);
  const sky = new THREE.Color('#ffe3c2').lerp(new THREE.Color('#5868b8'), dark);
  const gnd = new THREE.Color('#6b4b3a').lerp(new THREE.Color('#141833'), dark);
  return (
    <>
      <hemisphereLight color={sky} groundColor={gnd} intensity={THREE.MathUtils.lerp(1.25, 1.7, dark)} />
      <primitive object={spot} position={[LAMP3[0], LAMP3[1] - 0.02, LAMP3[2]]} color="#ffd59a" intensity={lamp * 3.2} angle={1.2} penumbra={0.85} decay={2} distance={0}
        castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} shadow-normalBias={0.03} shadow-radius={4} />
      <primitive object={spot.target} />
      <pointLight position={[LAMP3[0], LAMP3[1] - 0.1, LAMP3[2]]} color="#ffcf8f" intensity={lamp * 0.45} decay={2} distance={0} />
      <primitive object={moon} position={[-4.6, 4.4, -7]} color="#8ea4ff" intensity={0.3 + dark * 2.6} castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} shadow-normalBias={0.03} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={1} shadow-camera-far={20} />
      <primitive object={moon.target} />
      <pointLight position={phone} color="#cfe6ff" intensity={glow * 0.06} decay={2} distance={0.9} />
      <directionalLight position={[1.5, 2.2, 4]} color="#8a9ee6" intensity={dark * 1.9} />
    </>
  );
};
