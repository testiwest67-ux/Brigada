# Лист-превью скачанных из Flow картинок с номерами файлов (чтобы сопоставить их со сценами по виду).
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(src, '*.*')))
W, H, C = 320, 180, 8
rows = (len(files) + C - 1) // C
sheet = Image.new('RGB', (C * W, rows * H), 'black')
try: font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 34)
except Exception: font = ImageFont.load_default()
for k, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((W, H))
    d = ImageDraw.Draw(im)
    n = os.path.splitext(os.path.basename(f))[0]
    d.rectangle([0, 0, 78, 40], fill='black'); d.text((4, 2), n, fill='yellow', font=font)
    sheet.paste(im, ((k % C) * W, (k // C) * H))
sheet.save(out, quality=85)
print(len(files))
