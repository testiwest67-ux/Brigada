# Find voice lines whose word timings are bunched up (subtitles run ahead of the voice) and re-spread the words
# over the VOICED parts of the line (silences skipped) by syllables.
#   python3 scripts/fix_word_times.py public/<ролик>/voice.json [--write]   (voice.wav next to it)
import json, os, sys, wave
import numpy as np
VOW = 'аеёиоуыэюяaeiouy'
syl = lambda w: max(1, sum(ch in VOW for ch in w.lower()))
p = sys.argv[1]; write = '--write' in sys.argv
d = json.load(open(p, encoding='utf-8'))
with wave.open(os.path.join(os.path.dirname(p), 'voice.wav')) as wv:
    sr, ch = wv.getframerate(), wv.getnchannels()
    x = np.frombuffer(wv.readframes(wv.getnframes()), dtype=np.int16).astype(np.float32) / 32768
if ch > 1: x = x.reshape(-1, ch).mean(axis=1)
fr = int(sr * 0.02)
def spread(l, sy):
    a, b = int(l['start'] * sr), int(l['end'] * sr)
    seg = x[a:b]; n = max(1, len(seg) // fr)
    rms = np.array([np.sqrt(np.mean(seg[i*fr:(i+1)*fr] ** 2) + 1e-12) for i in range(n)])
    on = rms > max(10 ** (-40 / 20), rms.max() * 0.08)
    cum = np.cumsum(on) / max(1, on.sum())            # share of voiced time reached at each frame
    tot, acc, out = sum(sy), 0, []
    for s in sy:
        i = int(np.searchsorted(cum, acc / tot)); out.append(round(l['start'] + i * 0.02, 3)); acc += s
    return out
bad = []
for k, l in enumerate(d['lines']):
    ws = l.get('words') or []
    if len(ws) < 4: continue
    sy = [syl(w['w']) for w in ws]
    new = spread(l, sy)
    worst = max(abs(w['t'] - t) for w, t in zip(ws, new))
    if worst > 1.0:
        bad.append((k, round(worst, 2), l['text'][:55]))
        if write:
            for w, t in zip(ws, new): w['t'] = t
for b in bad: print('фраза', *b)
print(f'{p}: подозрительных фраз {len(bad)}' + (' — исправлено' if write and bad else ''))
if write and bad: json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
