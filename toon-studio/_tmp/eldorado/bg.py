# Flow scene-NN.jpeg → public/eldorado/bg/<name>.png (1920×1080). Пропускает уже готовые; печатает, чего нет.
import json, os, subprocess
D = '/Users/makentosh/Brigada/toon-studio/'
SRC = '/Users/makentosh/flow-mcp-out/eldorado-img/'
OUT = D + 'public/eldorado/bg/'
os.makedirs(OUT, exist_ok=True)
miss = []
for p in json.load(open(D + '_tmp/eldorado/картинки.json', encoding='utf-8')):
    src = next((SRC + p['scene'] + e for e in ('.jpeg', '.jpg', '.png') if os.path.exists(SRC + p['scene'] + e)), None)
    dst = OUT + p['name'] + '.png'
    if not src:
        miss.append(p['scene'] + ' ' + p['name'])
        continue
    if os.path.exists(dst):
        continue
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
                    'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080', dst], check=True)
print('нет:', miss or 'все есть')
