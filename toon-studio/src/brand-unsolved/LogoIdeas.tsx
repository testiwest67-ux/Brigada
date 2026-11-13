// Seven logo ideas for «Неразгаданное» on one sheet (each drawn in an 800×800 box, shown big and at phone size ≈48 px).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ensureFont, FONT} from '../horror/fonts';

const RED = '#ff3b2e', INK = '#05070c', WH = '#eef2f8', GOLD = '#ffc76a';
// question-mark path points (centre line), used by the thread and footprint ideas
const QP: [number, number][] = [[255, 300], [280, 225], [345, 180], [420, 175], [495, 200], [545, 260], [545, 330], [505, 390], [440, 430], [405, 480], [400, 545]];

const Bg: React.FC<{id: string; c?: string}> = ({id, c = '#1a2232'}) => (
  <>
    <defs>
      <radialGradient id={`bg${id}`} cx="50%" cy="45%" r="60%"><stop offset="0%" stopColor={c} /><stop offset="100%" stopColor="#06080d" /></radialGradient>
      <filter id={`gl${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width={800} height={800} fill={`url(#bg${id})`} />
  </>
);
const Q: React.FC<{fill: string; size?: number; y?: number; stroke?: number}> = ({fill, size = 600, y = 610, stroke = 22}) => (
  <text x={400} y={y} fontSize={size} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={fill} stroke={INK} strokeWidth={stroke} paintOrder="stroke fill">?</text>
);

const L1 = (k: string) => ( // broken question mark, light in the crack
  <g>
    <Bg id={k} />
    <defs>
      <clipPath id={`a${k}`}><polygon points="0,0 800,0 800,330 560,350 500,300 430,390 360,340 300,420 0,440" /></clipPath>
      <clipPath id={`b${k}`}><polygon points="0,440 300,420 360,340 430,390 500,300 560,350 800,330 800,800 0,800" /></clipPath>
    </defs>
    <polyline points="280,423 360,340 430,390 500,300 560,350 600,345" fill="none" stroke={GOLD} strokeWidth={46} filter={`url(#gl${k})`} />
    <polyline points="280,423 360,340 430,390 500,300 560,350 600,345" fill="none" stroke="#fff3cf" strokeWidth={10} />
    <g clipPath={`url(#a${k})`} transform="translate(-26,-34) rotate(-6 400 400)"><Q fill={RED} /></g>
    <g clipPath={`url(#b${k})`} transform="translate(22,28) rotate(4 400 400)"><Q fill={RED} /></g>
  </g>
);

const L2 = (k: string) => ( // letter Н with a glowing keyhole
  <g>
    <Bg id={k} />
    <g stroke={INK} strokeWidth={20} paintOrder="stroke fill" fill={WH}>
      <rect x={185} y={170} width={130} height={460} rx={10} />
      <rect x={485} y={170} width={130} height={460} rx={10} />
      <rect x={300} y={330} width={200} height={140} />
    </g>
    <g filter={`url(#gl${k})`} fill={GOLD}><circle cx={400} cy={375} r={42} /><polygon points="372,395 428,395 448,500 352,500" /></g>
    <g fill="#1a1206"><circle cx={400} cy={375} r={34} /><polygon points="378,392 422,392 438,488 362,488" /></g>
    <g fill={GOLD} opacity={0.9}><circle cx={400} cy={375} r={14} /></g>
  </g>
);

const L3 = (k: string) => ( // case folder with a red stamp
  <g>
    <Bg id={k} c="#202838" />
    <g transform="rotate(-6 400 420)">
      <path d="M150 230 h170 l35 40 h295 v380 h-500 z" fill="#c9a66b" stroke={INK} strokeWidth={14} />
      <rect x={150} y={290} width={500} height={360} fill="#d9b97e" stroke={INK} strokeWidth={14} />
      <text x={400} y={375} fontSize={62} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill="#3a2a12">ДЕЛО №</text>
    </g>
    <g transform="rotate(-14 400 500)">
      <rect x={160} y={420} width={480} height={200} rx={18} fill="none" stroke={RED} strokeWidth={18} />
      <text x={400} y={505} fontSize={88} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={RED}>НЕ</text>
      <text x={400} y={590} fontSize={64} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={RED}>РАСКРЫТО</text>
    </g>
  </g>
);

const L4 = (k: string) => ( // magnifier, eye inside, pupil is a question mark
  <g>
    <Bg id={k} />
    <line x1={545} y1={545} x2={690} y2={690} stroke={INK} strokeWidth={90} strokeLinecap="round" />
    <line x1={545} y1={545} x2={680} y2={680} stroke="#8a6a44" strokeWidth={62} strokeLinecap="round" />
    <circle cx={360} cy={360} r={235} fill="#0d1420" stroke={INK} strokeWidth={60} />
    <circle cx={360} cy={360} r={235} fill="none" stroke="#c8d2e2" strokeWidth={34} />
    <path d="M175 360 Q360 200 545 360 Q360 520 175 360 Z" fill={WH} stroke={INK} strokeWidth={12} />
    <circle cx={360} cy={360} r={92} fill={RED} stroke={INK} strokeWidth={10} />
    <text x={360} y={420} fontSize={170} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={INK}>?</text>
    <path d="M230 250 Q300 200 380 205" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" opacity={0.5} />
  </g>
);

const L5 = (k: string) => { // compass without a needle
  const ticks = Array.from({length: 36}, (_, i) => i * 10);
  return (
    <g>
      <Bg id={k} />
      <circle cx={400} cy={400} r={300} fill="#101826" stroke="#c8a560" strokeWidth={26} />
      <circle cx={400} cy={400} r={300} fill="none" stroke={INK} strokeWidth={4} />
      {ticks.map((a) => {
        const r1 = a % 90 === 0 ? 225 : 255, rad = (a * Math.PI) / 180;
        return <line key={a} x1={400 + r1 * Math.sin(rad)} y1={400 - r1 * Math.cos(rad)} x2={400 + 280 * Math.sin(rad)} y2={400 - 280 * Math.cos(rad)} stroke="#c8a560" strokeWidth={a % 90 === 0 ? 10 : 5} />;
      })}
      {[['С', 0], ['В', 90], ['Ю', 180], ['З', 270]].map(([t, a]) => {
        const rad = ((a as number) * Math.PI) / 180;
        return <text key={t as string} x={400 + 185 * Math.sin(rad)} y={400 - 185 * Math.cos(rad) + 22} fontSize={62} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={WH}>{t}</text>;
      })}
      <circle cx={400} cy={400} r={14} fill="#c8a560" />
      <g filter={`url(#gl${k})`}><text x={400} y={490} fontSize={250} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={RED}>?</text></g>
      <text x={400} y={490} fontSize={250} fontFamily={FONT} fontWeight={900} textAnchor="middle" fill={RED} stroke={INK} strokeWidth={10} paintOrder="stroke fill">?</text>
    </g>
  );
};

const L6 = (k: string) => ( // investigation board: pins joined by red thread form a question mark
  <g>
    <Bg id={k} c="#3a2c1e" />
    {[[150, 140, -8], [470, 110, 6], [120, 470, 5], [520, 560, -5]].map(([x, y, r], i) => (
      <rect key={i} x={x} y={y} width={170} height={130} fill="#e9e1cf" opacity={0.18} transform={`rotate(${r} ${x + 85} ${y + 65})`} />
    ))}
    <polyline points={QP.map((p) => p.join(',')).join(' ')} fill="none" stroke={RED} strokeWidth={16} strokeLinejoin="round" />
    <line x1={400} y1={545} x2={400} y2={650} stroke={RED} strokeWidth={8} strokeDasharray="14 12" opacity={0.7} />
    {[...QP.filter((_, i) => i % 2 === 0), [400, 650] as [number, number]].map(([x, y], i) => (
      <g key={i}><circle cx={x + 4} cy={y + 6} r={26} fill="#000" opacity={0.4} /><circle cx={x} cy={y} r={26} fill={i === 6 ? GOLD : '#ff5a4a'} stroke={INK} strokeWidth={8} /><circle cx={x - 8} cy={y - 8} r={7} fill="#fff" opacity={0.7} /></g>
    ))}
  </g>
);

const Foot: React.FC<{x: number; y: number; a: number; left: boolean}> = ({x, y, a, left}) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) translate(${left ? -16 : 16} 0)`}>
    <ellipse cx={0} cy={6} rx={17} ry={27} fill={WH} />
    {[-12, -4, 4, 12].map((dx, i) => <circle key={i} cx={dx} cy={-30 + Math.abs(dx) * 0.4} r={i === 0 || i === 3 ? 5 : 6} fill={WH} />)}
  </g>
);
const L7 = (k: string) => { // footprints in snow turning into a question mark
  const pts: {x: number; y: number; a: number}[] = [];
  for (let i = QP.length - 1; i > 0; i--) {
    const [x0, y0] = QP[i], [x1, y1] = QP[i - 1];
    const a = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI + 90;
    pts.push({x: (x0 + x1) / 2, y: (y0 + y1) / 2, a});
  }
  return (
    <g>
      <Bg id={k} c="#2a3a52" />
      <ellipse cx={400} cy={780} rx={520} ry={190} fill="#4a5d7a" opacity={0.35} />
      {pts.map((p, i) => <Foot key={i} {...p} left={i % 2 === 0} />)}
      <g filter={`url(#gl${k})`}><circle cx={400} cy={650} r={40} fill={RED} /></g>
      <circle cx={400} cy={650} r={40} fill={RED} stroke={INK} strokeWidth={10} />
    </g>
  );
};

const IDEAS: [string, (k: string) => React.ReactNode][] = [
  ['1. Разорванный «?»', L1], ['2. «Н» с замочной скважиной', L2], ['3. Папка «НЕ РАСКРЫТО»', L3], ['4. Глаз в лупе', L4],
  ['5. Компас без стрелки', L5], ['6. Красная нить', L6], ['7. Следы → «?»', L7],
];

const Tile: React.FC<{draw: (k: string) => React.ReactNode; id: string; size: number}> = ({draw, id, size}) => (
  <svg width={size} height={size} viewBox="0 0 800 800" style={{borderRadius: '50%', display: 'block', boxShadow: '0 0 0 3px #2a3344'}}>{draw(id)}</svg>
);

export const LogoIdeas: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{background: '#0a0d13', fontFamily: FONT, color: WH, padding: 50}}>
      <div style={{fontSize: 56, fontWeight: 900, marginBottom: 30}}>Неразгаданное: 7 идей для лого <span style={{fontSize: 32, color: '#8b97ab', fontWeight: 700}}>(маленький кружок = как на телефоне)</span></div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 40}}>
        {IDEAS.map(([name, draw], i) => (
          <div key={i} style={{width: 560, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <Tile draw={draw} id={`b${i}`} size={460} />
            <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 18}}>
              <Tile draw={draw} id={`s${i}`} size={48} />
              <div style={{fontSize: 36, fontWeight: 800}}>{name}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
