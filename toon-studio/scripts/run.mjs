#!/usr/bin/env node
// Запуск скриптов проекта с нужным ffmpeg и python — работает и на Mac, и на Windows.
// Делает то же, что scripts/run.sh (тот остаётся для Mac как был).
//   node scripts/run.mjs py scripts/voice_check.py ...   → python (на Mac из ~/.mac-worker/venv, на Windows .venv проекта или py/python)
//   node scripts/run.mjs ffmpeg ...                      → ffmpeg (на Mac ffmpeg-full из Homebrew, иначе из PATH)
//   node scripts/run.mjs node scripts/render.mjs ...      → любая другая команда из папки toon-studio
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // папка toon-studio
const WIN = process.platform === 'win32';
const SEP = WIN ? ';' : ':';
const has = (p) => { try { return fs.existsSync(p); } catch { return false; } };

// ffmpeg: сначала свой (TOON_FFMPEG_DIR), потом ffmpeg-full и Homebrew на Mac; иначе тот, что в PATH
const extra = [process.env.TOON_FFMPEG_DIR, '/opt/homebrew/opt/ffmpeg-full/bin', '/opt/homebrew/bin'].filter((d) => d && has(d));
const env = {...process.env};
const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
env[pathKey] = [...extra, env[pathKey] || ''].join(SEP);

// python: свой (TOON_PYTHON) → .venv в toon-studio → ~/.mac-worker/venv (Mac) → py / python3 / python
function python() {
  const cands = [
    process.env.TOON_PYTHON,
    path.join(ROOT, '.venv', WIN ? 'Scripts/python.exe' : 'bin/python3'),
    path.join(os.homedir(), '.mac-worker', 'venv', WIN ? 'Scripts/python.exe' : 'bin/python3'),
  ].filter(Boolean);
  for (const c of cands) if (has(c)) return [c];
  return WIN ? ['py', '-3'] : ['python3'];
}

let args = process.argv.slice(2);
if (!args.length) { console.log('usage: node scripts/run.mjs py <script.py> ... | ffmpeg ... | <команда> ...'); process.exit(1); }
if (args[0] === 'py') args = [...python(), ...args.slice(1)];

// Обычные программы (python, ffmpeg, node) запускаем напрямую — так слова с пробелами не режутся.
// На Windows npx/npm — это .cmd, их запускает только оболочка; тогда каждое слово берём в кавычки.
const opts = {cwd: ROOT, env, stdio: 'inherit'};
let r = spawnSync(args[0], args.slice(1), opts);
if (WIN && r.error && ['ENOENT', 'EINVAL'].includes(r.error.code)) {
  const q = (a) => (/^[\w\-.:\\/=+,@]+$/.test(a) ? a : `"${a.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1')}"`);
  r = spawnSync([args[0], ...args.slice(1)].map(q).join(' '), {...opts, shell: true});
}
if (r.error) { console.error(`Не получилось запустить «${args[0]}»: ${r.error.message}`); process.exit(1); }
process.exit(r.status ?? 1);
