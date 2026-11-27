# После Flow: maya-img4/scene-NN → public/maya/bg/<имя>.png (по queue55.json),
# затем в src/maya/scenes.ts меняет картинку у сцен из extra_images.json (по номеру строки голоса).
#   python3 apply55.py          — только показать, что будет
#   python3 apply55.py go       — сделать
import json, re, subprocess, sys, glob, os
R = '/Users/makentosh/Brigada/toon-studio/'
SRC = '/Users/makentosh/flow-mcp-out/maya-img4/'
go = len(sys.argv) > 1 and sys.argv[1] == 'go'
q = json.load(open(R + '_tmp/maya/queue55.json', encoding='utf-8'))
miss = []
for x in q:
    f = glob.glob(SRC + x['scene'] + '.*')
    if not f:
        miss.append(x['name']); continue
    out = R + 'public/maya/bg/' + x['name'] + '.png'
    if go:
        subprocess.run(['sips', '-s', 'format', 'png', f[0], '--out', out], capture_output=True, check=True)
print('картинок есть', len(q) - len(miss), 'нет', miss)
ex = json.load(open(R + '_tmp/maya/extra_images.json', encoding='utf-8'))
p = R + 'src/maya/scenes.ts'
s = open(p, encoding='utf-8').read()
for e in ex['images']:
    if e['name'] in miss: continue
    for ln in e['lines']:
        s, n = re.subn(r"sc\(%d, '[^']+'" % ln, "sc(%d, '%s'" % (ln, e['name']), s)
        print(ln, e['name'], 'ok' if n else 'НЕТ СЦЕНЫ')
if go:
    open(p, 'w', encoding='utf-8').write(s)
    print('scenes.ts записан')
