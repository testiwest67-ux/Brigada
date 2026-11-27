# Звуковая схема «Эльдорадо» → src/eldorado/sound.cues.json (для scripts/sfx.py).
import json
CH = [0, 27, 60, 86, 119, 147, 169, 197, 220, 238, 269]
# аккорды (Гц) по главам: тёмные — для смерти/безумия, светлее — для золота и открытия
CHORDS = [
    [55, 82.41, 110, 130.81],      # 0 крючок
    [65.41, 98, 130.81, 164.81],   # 1 золотой человек (до мажор)
    [58.27, 87.31, 116.54, 138.59],# 2 слух
    [51.91, 77.78, 103.83, 123.47],# 3 экспедиция смерти
    [61.74, 92.5, 123.47, 155.56], # 4 река
    [49, 73.42, 98, 116.54],       # 5 гнев божий
    [55, 82.41, 110, 130.81],      # 6 озеро
    [58.27, 87.31, 116.54, 146.83],# 7 Рэли
    [51.91, 77.78, 103.83, 123.47],# 8 Фосетт
    [65.41, 98, 130.81, 164.81],   # 9 лидар
    [55, 82.41, 110, 138.59],      # 10 версии
]
pads = []
for i, c in enumerate(CH):
    t0 = 0 if i == 0 else f'line:{c}-0.5'
    t1 = f'line:{CH[i + 1]}' if i + 1 < len(CH) else 'end'
    pads.append({'t0': t0, 't1': t1, 'notes': CHORDS[i], 'gain': 0.06 if i in (3, 5, 8) else 0.07, 'attack': 2.5, 'release': 2})
ev = [{'type': 'thump', 't': f'line:{c}-0.1', 'gain': 0.22, 'f0': 70, 'f1': 40} for c in CH[1:]]
for ln in [3, 10, 20, 68, 97, 113, 144, 160, 164, 177, 189, 217, 231, 248, 260]:
    ev.append({'type': 'thump', 't': f'line:{ln}-0.05', 'gain': 0.18, 'f0': 80, 'f1': 45})
ev += [
    {'type': 'notes', 't': 'line:16', 'gain': 0.1, 'notes': [523.25, 659.25, 783.99], 'step': 0.2, 'decay': 2},   # золотой плот
    {'type': 'notes', 't': 'line:43', 'gain': 0.1, 'notes': [392, 523.25, 659.25], 'step': 0.25, 'decay': 2},     # живое солнце
    {'type': 'glide', 't': 'line:54-0.2', 'gain': 0.1, 'f0': 300, 'f1': 120, 'dur': 2.5},                          # нырял
    {'type': 'glide', 't': 'line:239-0.2', 'gain': 0.1, 'f0': 220, 'f1': 660, 'dur': 2.5},                         # лазер
    {'type': 'notes', 't': 'line:248', 'gain': 0.11, 'notes': [329.63, 392, 493.88, 659.25], 'step': 0.25, 'decay': 2.5},  # города!
    {'type': 'notes', 't': 'line:289', 'gain': 0.1, 'notes': [329.63, 392, 493.88], 'step': 0.3, 'decay': 2},
]
music = [
    {'file': '../../public/flannan/sfx/wind.mp3', 'gain': 0.8, 't0': 0, 't1': 'end', 'loop': True, 'fade': 3},
    {'file': '../../public/poslednyaya-elektrichka/sfx/rain.mp3', 'gain': 0.6, 't0': 'line:97-0.5', 't1': 'line:108', 'loop': True, 'fade': 2},
]
json.dump({'total': 'auto', 'pads': pads, 'events': ev, 'music': music, 'duck': {'db': 7, 'music_db': 14}},
          open('/Users/makentosh/Brigada/toon-studio/src/eldorado/sound.cues.json', 'w'), indent=1)
print(len(pads), len(ev))
