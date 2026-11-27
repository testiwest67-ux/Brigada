# Паузы в голосе «Майя»: lead/tail, паузы между главами и внутри глав (из voice-el.json).
#   python3 gaps.py            — показать
#   python3 gaps.py fix OUT    — записать копию с короткими паузами в OUT
import json, sys
p = '/Users/makentosh/Brigada/toon-studio/_tmp/maya/voice-el.json'
d = json.load(open(p, encoding='utf-8'))
L = d['lines']
ch = [i for i, l in enumerate(L) if l.get('chapter')]
before = [i - 1 for i in ch if i > 0]
inner = [l['gap'] for i, l in enumerate(L) if i not in before]
print('lead', d['lead'], 'tail', d['tail'])
print('перед главами:', [L[i]['gap'] for i in before])
inner.sort()
print('внутри глав: медиана', inner[len(inner) // 2], 'макс', inner[-5:], 'всего пауз >1.2 с:', sum(g > 1.2 for g in inner))
if len(sys.argv) > 2 and sys.argv[1] == 'fix':
    d['lead'] = 1.0; d['tail'] = 4.0
    for i in before: L[i]['gap'] = 2.0
    for i, l in enumerate(L):
        if i not in before and l['gap'] > 1.0: l['gap'] = 1.0
    json.dump(d, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('записано', sys.argv[2])
