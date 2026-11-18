// Забирает картинки прямо со страницы Google Flow в Chrome (через порт отладки 9333), когда меню «Скачать» не работает.
//   node scripts/flow_grab.mjs list                      — показать картинки на странице (alt + размер)
//   node scripts/flow_grab.mjs get <out_dir> <map.json>  — map: [{"match": "начало промпта", "name": "m3-01-scholar"}]
// Картинки берутся самого большого размера, что есть на странице; ничего не генерируется, кредиты не тратятся.
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
const tab = tabs.find((t) => t.type === 'page' && /labs\.google|flow\.google/.test(t.url));
if (!tab) { console.error('нет вкладки Flow'); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl, {perMessageDeflate: false, maxPayload: 512 * 1024 * 1024});
await new Promise((r) => ws.on('open', r));
let id = 0;
const call = (method, params) => new Promise((res, rej) => {
  const my = ++id;
  const on = (m) => { const d = JSON.parse(m); if (d.id === my) { ws.off('message', on); d.error ? rej(d.error) : res(d.result); } };
  ws.on('message', on);
  ws.send(JSON.stringify({id: my, method, params}));
});
const ev = async (expr) => (await call('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true})).result.value;

// alt у плиток Flow одинаковый («картка із зображенням…»), поэтому подпись = текст промпта/названия в ближайшем предке плитки.
const LIST = `(() => [...document.querySelectorAll('img')].map(i => {
  let e = i, t = '';
  // подняться к карточке, где есть ровно один промпт (текст с «no watermark» или длинный абзац)
  for (let k = 0; k < 20 && e; k++, e = e.parentElement) {
    const s = (e.innerText || '').trim();
    const nPrompts = (s.match(/no watermark/g) || []).length;
    if (nPrompts === 1) { t = s.split('\\n').find(l => l.includes('no watermark')) || s; break; }
    if (nPrompts > 1) break;
  }
  return {alt: t.replace(/\\s+/g, ' ') || i.alt || '', src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight};
}).filter(x => x.w >= 300))()`;
const [cmd, outDir, mapFile] = process.argv.slice(2);
const imgs = await ev(LIST);
if (cmd === 'all') {
  // прокрутить ленту до конца, скачивая каждую новую картинку (по src) в outDir/NNN.ext
  fs.mkdirSync(outDir, {recursive: true});
  const seen = new Set(), failed = []; let n = 0, idle = 0;
  while (idle < 4) {
    const now = await ev(LIST);
    let got = 0;
    for (const c of now) {
      if (seen.has(c.src)) continue; seen.add(c.src); got++;
      const b64 = await ev(`fetch(${JSON.stringify(c.src)}, {credentials: 'include'}).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); })).catch(e => 'ERR ' + e)`);
      const mm = typeof b64 === 'string' && b64.match(/^data:([^;]+);base64,(.*)$/s);
      if (!mm) { failed.push(c.src); console.log('пропуск', c.src.slice(0, 60), String(b64).slice(0, 60)); continue; }
      const [, mime, data] = mm;
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
      fs.writeFileSync(path.join(outDir, `${String(++n).padStart(3, '0')}.${ext}`), Buffer.from(data, 'base64'));
    }
    idle = got ? 0 : idle + 1;
    await ev(`(() => { const s = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 50 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)); (s.sort((a,b) => b.scrollHeight - a.scrollHeight)[0] || document.scrollingElement).scrollBy(0, 600); return 1; })()`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  // картинки с другого домена (flow-content.google) страница Flow не отдаёт (CORS) — открываем каждую в своей вкладке
  // и читаем её там же (тот же домен, куки есть)
  for (const src of failed) {
    const t = await (await fetch('http://127.0.0.1:9333/json/new?' + encodeURIComponent(src), {method: 'PUT'})).json();
    const w2 = new WebSocket(t.webSocketDebuggerUrl, {perMessageDeflate: false, maxPayload: 512 * 1024 * 1024});
    await new Promise((r) => w2.on('open', r));
    await new Promise((r) => setTimeout(r, 2500));
    const v = await new Promise((res) => {
      w2.on('message', (m) => { const d = JSON.parse(m); if (d.id === 1) res(d.result?.result?.value); });
      w2.send(JSON.stringify({id: 1, method: 'Runtime.evaluate', params: {awaitPromise: true, returnByValue: true,
        expression: `fetch(location.href).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); })).catch(e => 'ERR ' + e)`}}));
    });
    w2.close();
    await fetch('http://127.0.0.1:9333/json/close/' + t.id);
    const mm = typeof v === 'string' && v.match(/^data:([^;]+);base64,(.*)$/s);
    if (!mm) { console.log('не вышло', src.slice(0, 60), String(v).slice(0, 60)); continue; }
    const ext = mm[1].includes('png') ? 'png' : mm[1].includes('webp') ? 'webp' : 'jpg';
    fs.writeFileSync(path.join(outDir, `x${String(++n).padStart(3, '0')}.${ext}`), Buffer.from(mm[2], 'base64'));
  }
  console.log(`скачано ${n}, из них отдельными вкладками ${failed.length}`);
} else if (cmd === 'list') {
  for (const i of imgs) console.log(`${i.w}x${i.h} | ${i.alt.slice(0, 70)} | ${i.src.slice(0, 60)}`);
} else {
  const map = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
  fs.mkdirSync(outDir, {recursive: true});
  // пройти всю ленту: в самый верх, потом вниз по 600 px, собирая карточки (промпт → картинка)
  const SCROLLER = `[...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 50 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).sort((a,b) => b.scrollHeight - a.scrollHeight)[0] || document.scrollingElement`;
  await ev(`(${SCROLLER}).scrollTo(0, 0)`); await new Promise((r) => setTimeout(r, 2000));
  const all = new Map(); let last = -1, same = 0;
  while (same < 3) {
    for (const i of await ev(LIST)) if (i.alt.includes('no watermark') && !all.has(i.alt)) all.set(i.alt, i);
    const pos = await ev(`(() => { const s = ${SCROLLER}; s.scrollBy(0, 600); return s.scrollTop; })()`);
    await new Promise((r) => setTimeout(r, 1500));
    same = pos === last ? same + 1 : 0; last = pos;
  }
  console.log(`карточек с промптом: ${all.size}`);
  imgs.length = 0; imgs.push(...all.values());
  for (const m of map) {
    const c = imgs.filter((i) => i.alt.toLowerCase().startsWith(m.match.toLowerCase())).sort((a, b) => b.w * b.h - a.w * a.h)[0];
    if (!c) { console.log(`нет: ${m.name}`); continue; }
    const b64 = await ev(`fetch(${JSON.stringify(c.src)}, {credentials: 'include'}).then(r => r.blob()).then(b => new Promise(ok => { const f = new FileReader(); f.onload = () => ok(f.result); f.readAsDataURL(b); }))`);
    const [, mime, data] = b64.match(/^data:([^;]+);base64,(.*)$/s);
    const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
    fs.writeFileSync(path.join(outDir, `${m.name}.${ext}`), Buffer.from(data, 'base64'));
    console.log(`+ ${m.name} ${c.w}x${c.h} ${ext}`);
  }
}
ws.close();
