# паузы: внутри глав ≤1.0 с, lead 1, tail 4 (главный); трейлер ≤0.6 с, lead 0.3, tail 2
import json, sys
p, mx, lead, tail = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
d = json.load(open(p, encoding='utf-8'))
d['lead'], d['tail'] = lead, tail
L = d['lines']
for i, l in enumerate(L):
    nxt_ch = i + 1 < len(L) and L[i + 1].get('chapter')
    if not nxt_ch and l['gap'] > mx: l['gap'] = mx
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', len(L))
