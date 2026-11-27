# фразы 49–51 (главa 1): нарезка съехала на одну паузу — ставим точные границы по silencedetect
import json
p = '/Users/makentosh/Brigada/toon-studio/_tmp/eldorado/voice-el.json'
d = json.load(open(p, encoding='utf-8'))
L = d['lines']
assert L[48]['say'].startswith('На берегу') and L[49]['say'] == 'Музыка.' and L[50]['say'].startswith('Дым')
L[48]['t0'], L[48]['t1'] = 50.04, 51.93
L[49]['t0'], L[49]['t1'] = 52.10, 52.86
L[50]['t0'], L[50]['t1'] = 52.90, 54.03
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok')
