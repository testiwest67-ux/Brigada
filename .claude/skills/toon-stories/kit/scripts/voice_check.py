# Mandatory voice check before any animation (rule 9 in CLAUDE.md).
# Makes a "voice only" video: dark screen, phrase number, who speaks and the phrase text, synced to the voice.
# Also runs automatic checks and prints a report:
#   - total length (shorts must be >= 1:30, rule 8);
#   - clipping (true peak) and overall loudness;
#   - speech rate per phrase (syllables per second): too fast = maybe a swallowed word, too slow = maybe an extra
#     word, a stutter or a long breath inside the phrase;
#   - phrase loudness: a phrase much quieter / louder than the rest (a whisper or a phone filter can bury a line);
#   - long silences inside a phrase and long gaps between phrases.
#
#   python scripts/voice_check.py public/<ролик>/voice.wav public/<ролик>/voice.json _tmp/<ролик>/только-голос.mp4
#   options: --min 90 (minimum length in seconds, 0 = no check)   --names "narrator=рассказчик,mom=мама"
import argparse, json, os, re, subprocess, sys, wave
import numpy as np

VOW = set('аеёиоуыэюяaeiouy')
WHO = {'narrator': 'рассказчик', 'mom': 'мама', 'petrovich': 'Петрович', 'shade': 'тень', 'misha': 'дед Миша',
       'refl': 'отражение'}


def ts(t):
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def read_wav(p):
    with wave.open(p) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if ch > 1: x = x.reshape(-1, ch).mean(axis=1)
    return x, sr


def syllables(text):
    return max(1, sum(ch in VOW for ch in text.lower()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('wav'); ap.add_argument('json'); ap.add_argument('out')
    ap.add_argument('--min', type=float, default=90.0)
    ap.add_argument('--names', default='')
    a = ap.parse_args()
    names = dict(WHO)
    for kv in filter(None, a.names.split(',')):
        k, v = kv.split('='); names[k.strip()] = v.strip()

    V = json.load(open(a.json, encoding='utf-8'))
    L = V['lines']
    x, sr = read_wav(a.wav)
    total = V.get('total') or len(x) / sr
    warn = []

    # 1. length
    if a.min and total < a.min:
        warn.append(f'Длина {total:.1f} с — меньше {a.min:.0f} с (правило 8).')

    # 2. peak / loudness (ffmpeg ebur128)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.wav, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', r); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)
    I = float(I[-1]) if I else None; P = float(P[-1]) if P else None
    if P is not None and P > -1.0: warn.append(f'Пик {P:.1f} dBFS — возможен перегруз (хрип).')
    clip = int(np.sum(np.abs(x) > 0.999))
    if clip > 10: warn.append(f'{clip} отсчётов на пределе — перегруз.')

    # 3. per phrase: speech rate and silences inside
    fr = int(sr * 0.02)
    rates, lvls, rows = [], [], []
    for k, l in enumerate(L):
        seg = x[int(l['start'] * sr):int(l['end'] * sr)]
        n = max(1, len(seg) // fr)
        rms = np.array([np.sqrt(np.mean(seg[i * fr:(i + 1) * fr] ** 2) + 1e-12) for i in range(n)])
        # voiced = within 30 dB of the phrase's own loudest frame (so a whisper is not taken for silence)
        on = (rms > rms.max() * 10 ** (-30 / 20)) & (rms > 10 ** (-65 / 20))
        voiced = on.sum() * 0.02
        lvl = 20 * np.log10(np.percentile(rms[on], 90)) if on.any() else -99.0
        # longest silence inside the phrase (between first and last voiced frame)
        idx = np.where(on)[0]
        gap_in = 0.0
        if len(idx) > 1:
            d = np.diff(idx); gap_in = (d.max() - 1) * 0.02 if len(d) else 0.0
        syl = syllables(l['text'])
        rate = syl / max(voiced, 0.1)
        rates.append(rate); lvls.append(lvl); rows.append((k, l, voiced, gap_in, rate, lvl))
    med = float(np.median(rates)) if rates else 0
    lmed = float(np.median(lvls)) if lvls else 0
    # speech rate is compared with the same speaker (an old man is slower than the narrator)
    by = {}
    for k, l, *_r in rows: by.setdefault(l.get('who', 'narrator'), []).append(rates[k])
    wmed = {w: float(np.median(v)) if len(v) >= 4 else med for w, v in by.items()}
    for k, l, voiced, gap_in, rate, lvl in rows:
        n = k + 1
        if lvl < lmed - 12:
            warn.append(f'Фраза {n}: тише остальных на {lmed - lvl:.0f} дБ — может быть плохо слышно: «{l["text"]}».')
        elif lvl > lmed + 10:
            warn.append(f'Фраза {n}: громче остальных на {lvl - lmed:.0f} дБ: «{l["text"]}».')
        if voiced < 0.15: warn.append(f'Фраза {n}: почти нет звука («{l["text"]}»).')
        elif syllables(l['text']) >= 4 and rate > wmed[l.get('who', 'narrator')] * 1.45:
            warn.append(f'Фраза {n}: слишком быстро ({rate:.1f} слог/с при обычных {wmed[l.get("who", "narrator")]:.1f}) — проверить, не проглочено ли слово: «{l["text"]}».')
        elif syllables(l['text']) >= 4 and rate < wmed[l.get('who', 'narrator')] * 0.6:
            warn.append(f'Фраза {n}: слишком медленно ({rate:.1f} слог/с при обычных {wmed[l.get("who", "narrator")]:.1f}) — проверить, нет ли лишнего слова или запинки: «{l["text"]}».')
        if gap_in > 1.2:
            warn.append(f'Фраза {n}: пауза {gap_in:.1f} с внутри фразы — проверить: «{l["text"]}».')
    for k in range(len(L) - 1):
        g = L[k + 1]['start'] - L[k]['end']
        if g > 2.5: warn.append(f'Между фразами {k + 1} и {k + 2} пауза {g:.1f} с — так задумано?')
        if g < -0.01: warn.append(f'Фразы {k + 1} и {k + 2} наезжают друг на друга.')

    # video: number, speaker, text
    ass = os.path.splitext(a.out)[0] + '.ass'
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    out = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 720", "PlayResY: 1280", "", "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
           "Style: N,Inter,120,&H0000D7FF,&H0,&H0,&H0,1,0,0,0,100,100,0,0,1,0,0,8,40,40,330,1",
           "Style: W,Inter,40,&H00AAAAAA,&H0,&H0,&H0,0,0,0,0,100,100,0,0,1,0,0,8,40,40,500,1",
           "Style: T,Inter,56,&H00FFFFFF,&H0,&H0,&H0,1,0,0,0,100,100,0,0,1,0,0,8,50,50,600,1",
           "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    for k, l in enumerate(L):
        end = L[k + 1]['start'] - 0.02 if k + 1 < len(L) else total
        s, e = ts(l['start']), ts(end)
        who = l.get('who', 'narrator')
        out += [f"Dialogue: 0,{s},{e},N,,0,0,0,,{k + 1}",
                f"Dialogue: 0,{s},{e},W,,0,0,0,,{names.get(who, who)}",
                f"Dialogue: 0,{s},{e},T,,0,0,0,,{l['text']}"]
    open(ass, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    esc = ass.replace('\\', '/').replace(':', r'\:').replace("'", r"\'")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=0x101418:s=720x1280:r=30',
                    '-i', a.wav, '-vf', f"ass='{esc}'", '-af', 'loudnorm=I=-16:TP=-1.5', '-shortest',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30', '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac', '-b:a', '160k', a.out], check=True)

    # report
    print(f'Видео для проверки: {a.out}')
    print(f'Длина {int(total // 60)}:{total % 60:04.1f}, фраз {len(L)}, громкость {I} LUFS, пик {P} dBFS, '
          f'темп в среднем {med:.1f} слог/с')
    if warn:
        print(f'Нужно послушать внимательно ({len(warn)}):')
        for w in warn: print(' -', w)
    else:
        print('Автопроверка: замечаний нет. Но на слух всё равно проверяет пользователь.')


if __name__ == '__main__':
    main()
