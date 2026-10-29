// Bundle + stills / preview / contact sheet / full render at LOW priority so the computer stays usable
// (child processes, ffmpeg and the headless browser inherit the priority).
//   node scripts/render.mjs stills  <CompId> <outDir> 30 150 400      stills of these frames (full size PNG)
//   node scripts/render.mjs sheet   <CompId> <sheet.png> [everySec=5]   one PNG: a still every N seconds, ~320 px each
//   node scripts/render.mjs preview <CompId> <preview.mp4> [sec=30]     the first 30 s at half size, to check motion
//   node scripts/render.mjs render  <CompId> <out.mp4>                  the full video
// Env: TOON_THREADS (Remotion concurrency, default 2), TOON_GL (default "angle", needed for 3D; Linux without GPU: "swangle"),
//      TOON_SHEET_W (sheet frame width, default 320).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.noDeprecation = true;
os.setPriority(0, os.constants.priority.PRIORITY_LOW);
const [mode, comp, out, ...rest] = process.argv.slice(2);
if (!['stills', 'sheet', 'preview', 'render'].includes(mode) || !comp || !out) {
  console.log('usage: node scripts/render.mjs stills|sheet|preview|render <CompId> <out> [frames... | everySec | sec]');
  process.exit(1);
}
const threads = process.env.TOON_THREADS || '2';
const gl = process.env.TOON_GL || 'angle';
const run = (args) => {
  const r = spawnSync('npx', ['remotion', ...args], {stdio: ['ignore', 'ignore', 'pipe'], shell: true, encoding: 'utf8'});
  if (r.status !== 0) { console.error(r.stderr?.split('\n').slice(-15).join('\n')); process.exit(1); }
};
const q = (s) => `"${s}"`;

// Composition size, fps and length (one short browser start).
const meta = async () => {
  const R = await import('@remotion/renderer');
  const c = await R.selectComposition({serveUrl: path.resolve('build'), id: comp, chromiumOptions: {gl}, logLevel: 'error', timeoutInMilliseconds: 90000});
  return {R, c};
};

const t0 = Date.now();
run(['bundle', 'src/index.ts', '--out-dir=build', '--public-dir=public']);

if (mode === 'stills') {
  fs.mkdirSync(out, {recursive: true});
  for (const f of rest) {
    const file = path.join(out, `f${String(f).padStart(4, '0')}.png`);
    run(['still', 'build', comp, q(file), `--frame=${f}`, `--gl=${gl}`, '--log=error', '--timeout=90000']);
    console.log('ok', file);
  }
} else if (mode === 'sheet') {
  const every = Number(rest[0] || 5);
  const {R, c} = await meta();
  const w = Number(process.env.TOON_SHEET_W || 320);
  const scale = Math.min(1, w / c.width);
  const frames = [];
  for (let s = 0; s * c.fps < c.durationInFrames; s += every) frames.push(Math.min(c.durationInFrames - 1, Math.round(s * c.fps + c.fps * 0.5)));
  const tmp = path.join(path.dirname(path.resolve(out)), `_sheet_${comp}`);
  fs.rmSync(tmp, {recursive: true, force: true});
  fs.mkdirSync(tmp, {recursive: true});
  const browser = await R.openBrowser('chrome', {chromiumOptions: {gl}, logLevel: 'error'});
  for (let k = 0; k < frames.length; k++) {
    await R.renderStill({composition: c, serveUrl: path.resolve('build'), output: path.join(tmp, `s${String(k).padStart(4, '0')}.png`),
      frame: frames[k], scale, puppeteerInstance: browser, chromiumOptions: {gl}, logLevel: 'error', timeoutInMilliseconds: 90000});
    process.stdout.write(`${k + 1}/${frames.length} `);
  }
  await browser.close({silent: true});
  const cols = Math.min(frames.length, c.width >= c.height ? 5 : 6);
  const rows = Math.ceil(frames.length / cols);
  fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, 's%04d.png'),
    '-vf', `tile=${cols}x${rows}:padding=4:margin=4:color=0x202020`, '-frames:v', '1', out], {stdio: 'inherit'});
  fs.rmSync(tmp, {recursive: true, force: true});
  if (r.status !== 0) process.exit(1);
  console.log(`\nok ${out}: ${frames.length} stills, ${cols} per row, left to right = ${frames.map((f) => (f / c.fps).toFixed(1)).join(' / ')} s`);
} else if (mode === 'preview') {
  const sec = Number(rest[0] || 30);
  const {c} = await meta();
  const last = Math.min(c.durationInFrames, Math.round(sec * c.fps)) - 1;
  fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
  run(['render', 'build', comp, q(out), '--scale=0.5', `--frames=0-${last}`, `--concurrency=${threads}`, `--gl=${gl}`, '--crf=23', '--log=error', '--timeout=120000']);
  console.log('ok', out, `(${((last + 1) / c.fps).toFixed(1)} s at half size)`);
} else {
  fs.mkdirSync(path.dirname(path.resolve(out)), {recursive: true});
  run(['render', 'build', comp, q(out), `--concurrency=${threads}`, `--gl=${gl}`, '--crf=18', '--log=error', '--timeout=120000']);
  console.log('ok', out);
}
console.log(`done in ${Math.round((Date.now() - t0) / 1000)} s (threads ${threads}, low priority)`);
