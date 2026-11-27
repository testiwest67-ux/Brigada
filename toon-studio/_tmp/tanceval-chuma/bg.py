# Flow scene-NN.jpeg → public/tanceval-chuma/bg/<name>.png (1920×1080). Пропускает уже готовые; печатает, чего нет.
#   python _tmp/tanceval-chuma/bg.py
import json, os, subprocess

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(D, '..', '..', 'public', 'tanceval-chuma', 'bg'))
SRC = {1: os.path.join(os.path.expanduser('~'), 'flow-mcp-out', 'tanceval-img'),
       2: os.path.join(os.path.expanduser('~'), 'flow-mcp-out', 'tanceval-img2')}
os.makedirs(OUT, exist_ok=True)
miss, done = [], 0
for p in json.load(open(os.path.join(D, 'картинки.json'), encoding='utf-8')):
    base = os.path.join(SRC[p['batch']], p['scene'])
    src = next((base + e for e in ('.jpeg', '.jpg', '.png') if os.path.exists(base + e)), None)
    dst = os.path.join(OUT, p['name'] + '.png')
    if not src:
        miss.append(f"{p['batch']}/{p['scene']} {p['name']}")
        continue
    if os.path.exists(dst):
        continue
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
                    'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080', dst], check=True)
    done += 1
print('перенесено:', done, '| нет ещё:', len(miss))
