import json
for p in ['public/golosovoe/voice.json', 'src/kolonka/voice.json']:
    d = json.load(open('/Users/makentosh/Brigada/toon-studio/' + p, encoding='utf-8'))
    print(p, list(d.keys()), len(d['lines']), list(d['lines'][0].keys()))
d = json.load(open('/Users/makentosh/Brigada/toon-studio/public/golosovoe/voice.json', encoding='utf-8'))
for i, l in enumerate(d['lines']): print(i, l['who'][0], round(l['start'], 1), l['text'])
