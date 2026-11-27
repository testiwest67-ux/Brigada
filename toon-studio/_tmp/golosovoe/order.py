# Порядок фраз по сюжету «Голосовое в 3:33»: голосовое (шёпот) звучит дважды — из телефона и из-под кровати,
# «Спасибо, что не встал» — после «...не убежал». voice-raw.json (auto_spec) → voice-el.json (для assemble_voice).
import json
D = '/Users/makentosh/Brigada/toon-studio/_tmp/golosovoe/'
raw = json.load(open(D + 'voice-raw.json', encoding='utf-8'))
by = {}
for ln in raw['lines']:
    ln.pop('chapter', None)
    by.setdefault(ln['src'][:2] if ln['src'].startswith('N') else 'HIM', []).append(ln)
N1, N2, N3, N4, HIM = by['N1'], by['N2'], by['N3'], by['N4'], by['HIM']
PHONE = 'highpass=f=320,lowpass=f=3400,volume=4.0'
UNDER = 'lowpass=f=2000,aecho=0.7:0.5:35:0.25,volume=7.5'
CLOSE = 'volume=3.0'

def him(ix, fx):
    out = []
    for i in ix:
        l = dict(HIM[i]); l['who'] = 'him'; l['fx'] = fx; l['gap'] = 0.45; out.append(l)
    return out

def gap_after(lines, text_start, g):
    for l in lines:
        if l['say'].startswith(text_start): l['gap'] = g

seq = N1 + him([0, 1, 2], PHONE) + N2 + him([0, 1, 2], UNDER) + N3 + him([3], CLOSE) + N4
gap_after(seq, 'Ты включаешь', 0.9)
gap_after(seq, 'И тут из-под кровати', 0.9)
gap_after(seq, 'Ногтями по полу', 0.8)
gap_after(seq, 'Три тридцать три. ', 0.8)
gap_after(seq, 'Твоим голосом', 0.8)
gap_after(seq, 'Тишина', 1.6)
gap_after(seq, 'Он хотел, чтобы ты не убежал', 1.0)
# the message ends: a beat before the narrator speaks again
for l in seq:
    if l.get('who') == 'him' and l['say'].startswith('Дождись утра'): l['gap'] = 1.0
    if l.get('who') == 'him' and l['say'].startswith('Спасибо'): l['gap'] = 1.4
raw['lines'] = seq
raw['lead'] = 0.6; raw['tail'] = 2.5
json.dump(raw, open(D + 'voice-el.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(seq), 'фраз')
