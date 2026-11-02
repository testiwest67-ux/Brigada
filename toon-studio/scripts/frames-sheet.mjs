// One contact sheet from chosen frames (one browser, low priority), each tile labelled with its number:
//   TOON_ENTRY=src/shift/index.ts TOON_GL=swangle TOON_BROWSER=... node scripts/frames-sheet.mjs <CompId> <out.png> <cols> f1 f2 f3 ...
// Env: TOON_SHEET_W (tile width, default 270), TOON_KEEP=<dir> keeps the full-size stills there too.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';

const [comp, out, colsArg, ...framesArg] = process.argv.slice(2);
if (!comp || !out || !framesArg.length) { console.log('usage: node scripts/frames-sheet.mjs <CompId> <out.png> <cols> f1 f2 ...'); process.exit(1); }
try { os.setPriority(19); } catch {}
const gl = process.env.TOON_GL || 'angle';
const chromeBin = process.env.TOON_BROWSER || null;
const frames = framesArg.map(Number);
const r0 = spawnSync('npx', ['remotion', 'bundle', process.env.TOON_ENTRY || 'src/index.ts', '--out-dir=build', '--public-dir=public'], {stdio: ['ignore', 'ignore', 'pipe'], shell: true, encoding: 'utf8'});
if (r0.status !== 0) { console.error(r0.stderr); process.exit(1); }
const R = await import('@remotion/renderer');
const serveUrl = path.resolve('build');
const c = await R.selectComposition({serveUrl, id: comp, chromiumOptions: {gl}, browserExecutable: chromeBin, logLevel: 'error', timeoutInMilliseconds: 120000});
const w = Number(process.env.TOON_SHEET_W || 270);
const keep = process.env.TOON_KEEP;
const tmp = path.join(path.dirname(path.resolve(out)), `_frames_${comp}`);
fs.rmSync(tmp, {recursive: true, force: true}); fs.mkdirSync(tmp, {recursive: true});
if (keep) fs.mkdirSync(keep, {recursive: true});
const browser = await R.openBrowser('chrome', {chromiumOptions: {gl}, browserExecutable: chromeBin, logLevel: 'error'});
for (let k = 0; k < frames.length; k++) {
  const full = path.join(keep || tmp, `f${String(frames[k]).padStart(4, '0')}.png`);
  await R.renderStill({composition: c, serveUrl, output: full, frame: frames[k], scale: keep ? 1 : w / c.width, puppeteerInstance: browser, chromiumOptions: {gl}, logLevel: 'error', timeoutInMilliseconds: 120000});
  // label: the tile number (1-based), drawn by ffmpeg
  const tile = path.join(tmp, `s${String(k).padStart(4, '0')}.png`);
  const rr = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', full, '-vf', `scale=${w}:-1,drawtext=text='${k + 1}':x=10:y=8:fontsize=${Math.round(w / 9)}:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6`, tile]);
  if (rr.status !== 0) { console.error(String(rr.stderr)); process.exit(1); }
  process.stdout.write(`${k + 1}/${frames.length} `);
}
await browser.close({silent: true});
const cols = Number(colsArg) || 8;
const rows = Math.ceil(frames.length / cols);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(tmp, 's%04d.png'), '-vf', `tile=${cols}x${rows}:padding=4:margin=4:color=0x202020`, '-frames:v', '1', out], {stdio: 'inherit'});
fs.rmSync(tmp, {recursive: true, force: true});
if (r.status !== 0) process.exit(1);
console.log(`\nok ${out}`);
