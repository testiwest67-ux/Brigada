# Звук трейлеров-петель (Хинтеркайфек и Роопкунд) → src/<n>/trailer.cues.json → sfx.py → public/<n>-trailer/mix.wav.
# Тихая аккордовая подложка без затухания на стыке (end_fade 0.03, attack/release 0.03 на краях), удары в паузы перед сильными фразами.
#   python _tmp/hinterkaifeck/trailer_cues.py
import json, os

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(D, '..', '..')
A, DARK = [55, 82.41, 110, 130.81], [46.25, 69.3, 92.5, 98]
CFG = {
    'hinterkaifeck': {'mid': (12, 29), 'hits': [2, 5, 8, 12, 16, 17, 24, 28, 33, 36, 39, 41]},
    'tanceval-chuma': {'mid': (10, 19), 'src': 'tanceval', 'hits': [1, 7, 8, 13, 14, 15, 17, 19, 22]},
    'roopkund': {'mid': (16, 31), 'hits': [5, 8, 11, 14, 20, 23, 25, 27, 32, 36]},
}
for n, c in CFG.items():
    V = json.load(open(os.path.join(ROOT, 'public', f'{n}-trailer', 'voice.json'), encoding='utf-8'))['lines']
    a, b = c['mid']
    pads = [{'t0': 0, 't1': f'line:{a}', 'notes': A, 'gain': 0.07, 'attack': 0.03, 'release': 1.5},
            {'t0': f'line:{a}-0.3', 't1': f'line:{b}', 'notes': DARK, 'gain': 0.07, 'attack': 1.5, 'release': 1.5},
            {'t0': f'line:{b}-0.3', 't1': 'end', 'notes': A, 'gain': 0.07, 'attack': 1.5, 'release': 0.03}]
    ev = []
    for ln in c['hits']:
        g = V[ln]['start'] - V[ln - 1]['end']
        ev.append({'type': 'thump', 't': round(V[ln - 1]['end'] + 0.04, 3), 'gain': 0.2 if g >= 0.35 else 0.07, 'f0': 72, 'f1': 40})
    json.dump({'total': 'auto', 'end_fade': 0.03, 'pads': pads, 'events': ev, 'duck': {'db': 15, 'music_db': 15, 'smooth': 0.04}},
              open(os.path.join(ROOT, 'src', c.get('src', n), 'trailer.cues.json'), 'w', encoding='utf-8'), indent=1)
    print(n, 'событий', len(ev))
