# ТЕКСТ.md + ТРЕЙЛЕР.md → главы.json (для auto_spec) и печать текстов глав для озвучки.
import json, re
D = '/Users/makentosh/Brigada/toon-studio/_tmp/eldorado/'
t = open(D + 'ТЕКСТ.md', encoding='utf-8').read()
parts = re.split(r'^## (\d+)\. (.+)$', t, flags=re.M)
ch = []
for i in range(1, len(parts), 3):
    n, title, body = parts[i], parts[i + 1].strip(), parts[i + 2]
    text = ' '.join(l.strip() for l in body.strip().splitlines() if l.strip())
    ch.append({'chapter': f'{n}. {title}', 'text': text, 'src': f'ch{n}.mp3'})
json.dump(ch, open(D + 'главы.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
tr = open(D + 'ТРЕЙЛЕР.md', encoding='utf-8').read()
body = tr.split('## Текст', 1)[1].split('## Подпись', 1)[0]
trail = ' '.join(l.strip() for l in body.strip().splitlines() if l.strip())
json.dump([{'chapter': 'Трейлер', 'text': trail, 'src': 'trailer.mp3'}], open(D + 'трейлер.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for c in ch + [{'chapter': 'T', 'text': trail}]:
    print('=====', c['chapter'], len(c['text']))
    print(c['text'])
