// Разведка вкладки Flow: url и все img (любого размера), чтобы понять, как достать картинки.
import WebSocket from 'ws';
const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
for (const t of tabs.filter((t) => t.type === 'page')) console.log('TAB', t.url.slice(0, 90));
const tab = tabs.find((t) => t.type === 'page' && /labs\.google|flow\.google/.test(t.url));
const ws = new WebSocket(tab.webSocketDebuggerUrl, {perMessageDeflate: false});
await new Promise((r) => ws.on('open', r));
ws.send(JSON.stringify({id: 1, method: 'Runtime.evaluate', params: {returnByValue: true, expression:
  `JSON.stringify((() => { const bg = [...document.querySelectorAll('*')].map(e => getComputedStyle(e).backgroundImage).filter(b => b && b !== 'none' && b.includes('url')); const srcs = [...document.querySelectorAll('[src]')].map(e => e.tagName + ' ' + (e.getAttribute('src')||'').slice(0,90)); return {bg: bg.length, bgs: bg.slice(0,5).map(b=>b.slice(0,120)), srcs: srcs.slice(0,15), title: document.title, text: document.body.innerText.slice(0,300)}; })())`}}));
ws.on('message', (m) => { const d = JSON.parse(m); if (d.id === 1) { console.log(d.result.result.value); ws.close(); } });
