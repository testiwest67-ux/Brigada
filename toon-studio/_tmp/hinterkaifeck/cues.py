# Звуковая схема «Хинтеркайфек» → src/hinterkaifeck/sound.cues.json (для scripts/sfx.py).
# Только тональный звук (аккорды-подложки, глухие удары, нотки). Под голосом всё приглушается (правило 15 дБ).
import json, os

D = os.path.dirname(os.path.abspath(__file__))
NAME = 'hinterkaifeck'
CH = [0, 29, 68, 102, 149, 186, 229, 270, 318, 360]           # первые фразы глав (0-based)
CHORDS = [
    [55, 82.41, 110, 130.81],       # 0 крючок — ля минор, холод
    [58.27, 87.31, 116.54, 146.83], # 1 хутор — спокойно, но глухо
    [51.91, 77.78, 103.83, 123.47], # 2 тёмная тайна
    [49, 73.42, 98, 116.54],        # 3 странности — тревога
    [46.25, 69.3, 92.5, 110],       # 4 ночь — самое тёмное
    [48.99, 73.42, 97.99, 103.83],  # 5 четыре дня — жуть (диссонанс)
    [51.91, 77.78, 103.83, 123.47], # 6 находка
    [55, 82.41, 110, 130.81],       # 7 расследование
    [58.27, 87.31, 116.54, 138.59], # 8 версии
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
    pads.append({'t0': t0, 't1': t1, 'notes': CHORDS[i], 'gain': 0.03 if i == 9 else 0.045 if i in (4, 5) else 0.055, 'attack': 2.5, 'release': 2})

ev = [{'type': 'thump', 't': gap(c)[0] + 0.3, 'gain': 0.22, 'f0': 70, 'f1': 40} for c in CH[1:]]   # титры глав


def steps(a, n, step=0.75, gain=0.012):   # медленные шаги по чердаку: глухие удары
    return [{'type': 'thump', 't': f'line:{a}+{k * step:.2f}', 'gain': gain, 'f0': 55, 'f1': 34, 'decay': 0.25} for k in range(n)]


ev += steps(8, 4)         # «на чердаке кто-то ходит»
ev += steps(134, 6, 0.9)  # «шаги… медленные, тяжёлые»
ev += steps(225, 3)       # «вспомни шаги»
ev += steps(377, 4, 0.9)  # финал «слышали его шаги»

for ln in [7, 10, 12, 15, 22, 49, 80, 93, 131, 133, 141, 172, 177, 180, 216, 220, 228, 242, 248, 252, 267, 269, 298, 316, 329]:
    t, g = gap(ln)
    ev.append({'type': 'thump', 't': t, 'gain': (0.16 if ln in (7, 131, 172, 228, 252, 298) else 0.11) if g >= 0.35 else 0.05, 'f0': 80, 'f1': 45})
for ln, e in [(4, {'type': 'glide', 'f0': 240, 'f1': 120}),                               # следы на снегу
              (114, {'type': 'notes', 'notes': [329.63, 311.13, 293.66], 'step': 0.14}),  # газета
              (120, {'type': 'notes', 'notes': [392, 369.99], 'step': 0.16}),             # ключ
              (217, {'type': 'glide', 'f0': 300, 'f1': 110}),                             # сено на чердаке
              (263, {'type': 'notes', 'notes': [493.88, 466.16, 440], 'step': 0.12}),     # деньги
              (296, {'type': 'glide', 'f0': 200, 'f1': 60}),                              # кирка
              (319, {'type': 'notes', 'notes': [329.63, 392, 493.88], 'step': 0.12})]:    # три версии
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
