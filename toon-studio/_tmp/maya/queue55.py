# Очередь 55 картинок для Flow: 33 недостающие (fallbacks.txt + КАРТИНКИ.md) + 22 новые (extra_images.json).
# Пишет queue55.json: [{"scene": "scene-NN", "name": ..., "prompt": полный промпт со стилем}]
import json, re
D = '/Users/makentosh/Brigada/toon-studio/_tmp/maya/'
ex = json.load(open(D + 'extra_images.json', encoding='utf-8'))
style = ex['style']
md = open(D + 'КАРТИНКИ.md', encoding='utf-8').read()
prompts = {}
for m in re.finditer(r'^\S+ (m\d-\d\d-[a-z0-9-]+) — (.+)$', md, re.M):
    prompts.setdefault(m.group(1), m.group(2).strip())
names = [l.split()[0] for l in open(D + 'fallbacks.txt', encoding='utf-8') if l.strip()]
q = [{'name': n, 'prompt': prompts[n].rstrip('.') + '. ' + style} for n in names]
q += [{'name': e['name'], 'prompt': e['prompt'].rstrip('.') + '. ' + style} for e in ex['images']]
for i, x in enumerate(q):
    x['scene'] = 'scene-%02d' % (i + 1)
json.dump(q, open(D + 'queue55.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(q))
print(json.dumps([{'type': 'image', 'aspect_ratio': '16:9', 'prompt': x['prompt']} for x in q], ensure_ascii=False))
