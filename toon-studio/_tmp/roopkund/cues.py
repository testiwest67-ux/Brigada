# Звуковая схема «Роопкунд» → src/roopkund/sound.cues.json (для scripts/sfx.py). Только тональный звук, под голосом тише на 15 дБ.
import json, os

D = os.path.dirname(os.path.abspath(__file__))
NAME = 'roopkund'
CH = [0, 32, 70, 98, 130, 163, 199, 243, 291, 340]
CHORDS = [
    [55, 82.41, 110, 130.81],       # 0 крючок — холод высоты
    [65.41, 98, 130.81, 164.81],    # 1 озеро у края неба — простор
    [58.27, 87.31, 116.54, 146.83], # 2 находка
    [51.91, 77.78, 103.83, 123.47], # 3 что лежит в озере — темнее
    [61.74, 92.5, 123.47, 146.83],  # 4 легенда — восточная загадка
    [49, 73.42, 98, 116.54],        # 5 град — тревога
    [65.41, 98, 130.81, 155.56],    # 6 ДНК — наука, свет
    [46.25, 69.3, 92.5, 110],       # 7 тысяча лет — жуть
    [55, 82.41, 110, 138.59],       # 8 версии
    [55, 82.41, 110, 130.81],       # 9 финал
]
V = json.load(open(os.path.join(D, '..', '..', 'public', NAME, 'voice.json'), encoding='utf-8'))['lines']


def gap(ln):
    a = V[ln - 1]['end'] + 0.04 if ln else 0.0
    return round(a, 3), V[ln]['start'] - a


pads = []
for i, c in enumerate(CH):
    t0 = 0 if i == 0 else f'line:{c}-0.5'
    t1 = f'line:{CH[i + 1]}' if i + 1 < len(CH) else 'end'
    pads.append({'t0': t0, 't1': t1, 'notes': CHORDS[i], 'gain': 0.03 if i == 9 else 0.045 if i in (5, 7) else 0.055, 'attack': 2.5, 'release': 2})
ev = [{'type': 'thump', 't': gap(c)[0] + 0.3, 'gain': 0.22, 'f0': 70, 'f1': 40} for c in CH[1:]]


def hail(a, n, step=0.22, gain=0.018):   # град: частые короткие щелчки, тихо
    return [{'type': 'tick', 't': f'line:{a}+{k * step:.2f}', 'gain': gain, 'f1': 1800, 'f2': 3200, 'decay': 0.04} for k in range(n)]


ev += hail(154, 28)   # легенда: обрушился град
ev += hail(179, 10)   # «как град»
ev += hail(331, 16)   # версия В: начинается град

for ln in [10, 11, 25, 27, 78, 89, 93, 109, 152, 158, 197, 219, 220, 230, 246, 264, 275, 307, 325, 358]:
    t, g = gap(ln)
    ev.append({'type': 'thump', 't': t, 'gain': (0.16 if ln in (10, 197, 220, 246, 264) else 0.11) if g >= 0.35 else 0.05, 'f0': 80, 'f1': 45})
for ln, e in [(8, {'type': 'glide', 'f0': 220, 'f1': 80}),                                # что лежит на дне
              (24, {'type': 'glide', 'f0': 160, 'f1': 520}),                              # ДНК
              (189, {'type': 'notes', 'notes': [329.63, 392, 493.88], 'step': 0.1}),      # 850 год
              (211, {'type': 'glide', 'f0': 180, 'f1': 480}),                             # прочитали ДНК
              (231, {'type': 'notes', 'notes': [392, 493.88, 587.33], 'step': 0.12}),     # Средиземноморье
              (292, {'type': 'notes', 'notes': [329.63, 392, 493.88], 'step': 0.12})]:    # три версии
    t, g = gap(ln)
    e = dict(e, t=t, gain=0.08 if g >= 0.6 else 0.025)
    if e['type'] == 'glide':
        e['dur'] = round(max(0.3, g), 2)
    else:
        e['decay'] = round(max(0.3, g), 2)
    ev.append(e)
json.dump({'total': 'auto', 'pads': pads, 'events': ev, 'duck': {'db': 15, 'music_db': 15, 'smooth': 0.04}},
          open(os.path.join(D, '..', '..', 'src', NAME, 'sound.cues.json'), 'w', encoding='utf-8'), indent=1)
print('подложек', len(pads), 'событий', len(ev))
