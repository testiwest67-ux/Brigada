# Mandatory key-frame check before animation (rule 10 in CLAUDE.md): the main frame of EVERY scene, numbered,
# so the user can ask to change any of them by number.
#
# The video must have a `Storyboard` composition: frame n = the key moment of scene n (with subtitles), 1080×1920,
# durationInFrames = number of scenes (see src/flight19/Shots.tsx → Storyboard).
#
#   python scripts/keyframes_sheet.py <entry.ts> <Storyboard> _tmp/<ролик>/кадры-сцен
#   options: --only 3,7,12   re-render only these scenes (1-based) after edits and send them separately
#            --names _tmp/<ролик>/сцены.txt   one scene name per line, printed under the numbers
#            --scale 0.5 --per 16 --cols 8
# Output: <dir>/element-NN.png (each frame) and <dir>/лист-1.png, лист-2.png … (numbered sheets to send to the user).
import argparse, glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

BROWSER = os.environ.get('TOON_BROWSER', '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')


def font(size):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf', '/System/Library/Fonts/Supplemental/Arial Bold.ttf']:
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def remotion(*args):
    cmd = ['npx', 'remotion', *args]
    if os.path.exists(BROWSER): cmd += ['--browser-executable', BROWSER]
    subprocess.run(cmd, check=True)


def sheets(out, files, names, per, cols, prefix='лист'):
    w0, h0 = Image.open(files[0][1]).size  # cell keeps the frame's aspect: 9:16 → 270×480, 16:9 → 480×270
    W, H = (270, 480) if h0 >= w0 else (480, 270)
    f1, f2 = font(24), font(15)
    made = []
    for part in range(0, len(files), per):
        sub = files[part:part + per]
        rows = (len(sub) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * W, rows * (H + 50)), (30, 30, 36))
        d = ImageDraw.Draw(sheet)
        for i, (n, f) in enumerate(sub):
            im = Image.open(f).convert('RGB').resize((W, H))
            x, y = (i % cols) * W, (i // cols) * (H + 50)
            sheet.paste(im, (x, y))
            d.text((x + 8, y + H + 2), str(n), fill=(255, 220, 120), font=f1)
            if names and n - 1 < len(names): d.text((x + 50, y + H + 8), names[n - 1][:22], fill=(220, 220, 230), font=f2)
        p = os.path.join(out, f'{prefix}-{part // per + 1}.png')
        sheet.save(p); made.append(p)
    return made


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('entry'); ap.add_argument('comp'); ap.add_argument('out')
    ap.add_argument('--only', default=''); ap.add_argument('--names', default='')
    ap.add_argument('--scale', default='0.5'); ap.add_argument('--per', type=int, default=16); ap.add_argument('--cols', type=int, default=8)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    names = [l.strip() for l in open(a.names, encoding='utf-8')] if a.names else []
    if a.only:
        nums = [int(x) for x in a.only.split(',') if x.strip()]
        for n in nums:
            remotion('still', a.entry, a.comp, os.path.join(a.out, f'element-{n - 1:02d}.png'), f'--frame={n - 1}', f'--scale={a.scale}')
        files = [(n, os.path.join(a.out, f'element-{n - 1:02d}.png')) for n in nums]
        made = sheets(a.out, files, names, a.per, min(a.cols, len(files)), prefix='правки')
    else:
        remotion('render', a.entry, a.comp, a.out, '--sequence', '--image-format=png', f'--scale={a.scale}', '--concurrency=4')
        fs = sorted(glob.glob(os.path.join(a.out, 'element-*.png')))
        made = sheets(a.out, [(i + 1, f) for i, f in enumerate(fs)], names, a.per, a.cols)
    print('Листы для проверки:'); [print(' ', p) for p in made]
    print('Пришли листы в чат и жди «ок» или номера кадров с правками (правило 10).')


if __name__ == '__main__':
    sys.exit(main())
