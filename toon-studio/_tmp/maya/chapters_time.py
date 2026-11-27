# Таймкоды глав для описания YouTube по голосу (начала строк-глав в public/maya/voice.json).
import json
v = json.load(open('/Users/makentosh/Brigada/toon-studio/public/maya/voice.json', encoding='utf-8'))
for n in [0, 30, 59, 76, 108, 139, 166, 204, 230]:
    t = 0 if n == 0 else v['lines'][n]['start'] - 0.15
    print(f'{int(t // 60):02d}:{int(t % 60):02d}  строка {n}')
print('итого', v['total'])
