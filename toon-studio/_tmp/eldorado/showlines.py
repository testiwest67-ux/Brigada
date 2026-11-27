import json, sys
d = json.load(open('/Users/makentosh/Brigada/toon-studio/_tmp/eldorado/voice-el.json', encoding='utf-8'))
for i in map(int, sys.argv[1:]):
    l = d['lines'][i]; print(i + 1, l['src'], l['t0'], l['t1'], round(l['t1'] - l['t0'], 2), l['say'])
