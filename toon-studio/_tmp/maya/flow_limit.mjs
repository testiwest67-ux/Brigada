// Ждёт, пока у Google Flow пройдёт «usage limit»: раз в 20 минут перезагружает вкладку проекта и читает текст.
// Печатает одну строку и выходит, когда надписи о лимите больше нет.
import WebSocket from 'ws';
const PROJECT = '74867a59-537c-4f94-9b89-265a4cbb6eb8';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function check() {
  const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
  const tab = tabs.find((t) => t.type === 'page' && t.url.includes(PROJECT));
  if (!tab) return 'no-tab';
  const ws = new WebSocket(tab.webSocketDebuggerUrl, {perMessageDeflate: false});
  await new Promise((r) => ws.on('open', r));
  const call = (id, method, params) => new Promise((res) => {
    ws.on('message', (m) => { const d = JSON.parse(m); if (d.id === id) res(d.result); });
    ws.send(JSON.stringify({id, method, params}));
  });
  await call(1, 'Page.reload', {});
  await sleep(15000);
  const r = await call(2, 'Runtime.evaluate', {expression: 'document.body.innerText', returnByValue: true});
  ws.close();
  return /usage limit/i.test(r.result.value || '') ? 'limit' : 'ok';
}
for (;;) {
  let s;
  try { s = await check(); } catch (e) { s = 'error ' + e.message; }
  if (s === 'ok') { console.log('FLOW LIMIT CLEARED ' + new Date().toISOString()); process.exit(0); }
  await sleep(20 * 60 * 1000);
}
