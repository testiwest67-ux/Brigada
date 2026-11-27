# Правило канала: под словами фон минимум на 15 дБ тише голоса.
# Сравнивает голос (public/<n>/voice.wav) и фон из sfx.py (_tmp/<n>/sfx/fx.wav) по каждой фразе (только где голос звучит).
#   python _tmp/hinterkaifeck/bed_check.py hinterkaifeck
import json, sys, subprocess
import numpy as np

n = sys.argv[1]
SR = 48000


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


v, b = load(f'public/{n}/voice.wav'), load(f'_tmp/{n}/sfx/fx.wav')
L = json.load(open(f'public/{n}/voice.json', encoding='utf-8'))['lines']
B = 960
bad, worst = [], 99
for i, l in enumerate(L):
    a, e = int(l['start'] * SR), int(l['end'] * SR)
    x, y = v[a:e], b[a:e]
    k = min(len(x), len(y)) // B * B
    if k == 0:
        continue
    vx, by = (x[:k].reshape(-1, B) ** 2).mean(1), (y[:k].reshape(-1, B) ** 2).mean(1)
    m = vx > 10 ** (-4.5)
    if not m.any():
        continue
    d = 10 * np.log10(vx[m].mean()) - 10 * np.log10(by[m].mean() + 1e-12)
    worst = min(worst, d)
    if d < 15:
        bad.append((i, round(d, 1), l['text'][:40]))
print(f'{n}: фраз {len(L)}, минимум голос−фон {worst:.1f} дБ, нарушений (<15 дБ): {len(bad)}')
for x in bad[:20]:
    print('  ', x)
