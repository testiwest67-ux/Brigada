// Печатает видимый текст вкладки проекта Flow (первые 1500 символов) — понять состояние (лимит, ошибки, фильтры).
import WebSocket from 'ws';
const tabs = await (await fetch('http://127.0.0.1:9333/json')).json();
const tab = tabs.find((t) => t.type === 'page' && t.url.includes('74867a59'));
const ws = new WebSocket(tab.webSocketDebuggerUrl, {perMessageDeflate: false});
await new Promise((r) => ws.on('open', r));
ws.send(JSON.stringify({id: 1, method: 'Runtime.evaluate', params: {returnByValue: true, expression: 'document.body.innerText.slice(0, 1500)'}}));
ws.on('message', (m) => { const d = JSON.parse(m); if (d.id === 1) { console.log(d.result.result.value); ws.close(); } });
