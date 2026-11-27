# Папка для монтажа в CapCut из готового ролика:
#   1-видео-без-субтитров-и-звука.mp4  (рендер композиции *Clean)
#   2-субтитры.srt                       (по фразам голоса, длинные фразы делятся по словам)
#   3-голос.wav                          (голос на той же громкости, что в итоговом ролике)
#   4-музыка-и-эффекты.wav               (подложка + эффекты, та же громкость)
#   5-полный-звук.wav                    (итоговый звук ролика одной дорожкой, −14 LUFS)
# Голос + музыка/эффекты (3 + 4) в сумме дают полный звук (5), поэтому в CapCut можно двигать громкость каждой дорожки.
#
#   python scripts/capcut_pack.py <public/ролик> <fx.wav> <clean.mp4> <out_dir> [--max-chars 42]
#   (в папке <public/ролик> нужны voice.wav, voice.json и mix.wav от scripts/sfx.py)
import argparse, json, os, shutil, subprocess, wave
import numpy as np


def rd(p):
    with wave.open(p) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    return x.reshape(-1, ch), sr


def wr(p, x, sr):
    with wave.open(p, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'


def srt(voice, max_chars):
    out, n = [], 0
    for l in voice['lines']:
        words = l.get('words') or []
        text = l.get('sub') or l['text']
        if len(text) <= max_chars or not words:
            chunks = [(l['start'], l['end'], text)]
        else:  # split into ~equal pieces at word boundaries (prefer after punctuation), timed by the word times
            toks = text.split()
            wt = [w['t'] for w in words] + [l['end']]
            parts = -(-len(text) // max_chars)
            cuts, pos = [], 0
            lens = [len(' '.join(toks[:k + 1])) for k in range(len(toks))]
            for p in range(1, parts):
                goal = len(text) * p / parts
                best = min(range(pos, len(toks) - 1), key=lambda k: abs(lens[k] - goal) - (6 if toks[k][-1] in ',.:;—…' else 0))
                cuts.append(best + 1); pos = best + 1
            edges = [0] + cuts + [len(toks)]
            chunks = []
            for a, b in zip(edges, edges[1:]):
                t0 = l['start'] if a == 0 else wt[min(a, len(wt) - 1)]
                t1 = l['end'] if b == len(toks) else wt[min(b, len(wt) - 1)]
                chunks.append((t0, t1, ' '.join(toks[a:b])))
        for a, b, tx in chunks:
            n += 1; out.append(f'{n}\n{ts(a)} --> {ts(max(b, a + 0.3))}\n{tx}\n')
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pub'); ap.add_argument('fx'); ap.add_argument('clean'); ap.add_argument('out')
    ap.add_argument('--max-chars', type=int, default=42)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    voice_json = json.load(open(os.path.join(a.pub, 'voice.json'), encoding='utf-8'))
    v, sr = rd(os.path.join(a.pub, 'voice.wav')); f, sr2 = rd(a.fx); m, sr3 = rd(os.path.join(a.pub, 'mix.wav'))
    assert sr == sr2 == sr3, 'разная частота у дорожек'
    n = min(len(v), len(f), len(m))
    v2 = np.repeat(v[:n, :1], m.shape[1], axis=1) if v.shape[1] == 1 else v[:n]
    pre = v2 + f[:n]
    g = float(np.sum(pre * m[:n]) / np.sum(pre * pre))  # one gain: mix ≈ g · (voice + fx)  (loudnorm linear)
    # the mix went through a peak limiter: rebuild its gain envelope (10 ms windows) and apply it to both stems,
    # otherwise the loud voice peaks clip at 0 dB
    win = max(1, sr // 100); nw = -(-n // win); pad = nw * win - n
    pk = lambda y: np.pad(np.abs(y).max(axis=1), (0, pad)).reshape(nw, win).max(axis=1)
    pp, pm = pk(g * pre), pk(m[:n])
    r = np.where(pp > 1e-4, np.minimum(1.0, pm / np.maximum(pp, 1e-9) * 1.02), 1.0)
    r = np.minimum.reduce([np.roll(r, k) for k in (-2, -1, 0, 1, 2)])  # widen dips so the edges of a peak are covered
    env = np.interp(np.arange(n), np.arange(nw) * win + win / 2, r)[:, None]
    vs, fs = g * v2 * env, g * f[:n] * env
    peak = max(np.abs(vs).max(), np.abs(fs).max())
    if peak > 0.89:  # safety: keep stems under −1 dB
        vs, fs = vs * 0.89 / peak, fs * 0.89 / peak
    err = 20 * np.log10(np.sqrt(np.mean((m[:n] - vs - fs) ** 2)) / np.sqrt(np.mean(m[:n] ** 2)) + 1e-12)
    wr(os.path.join(a.out, '3-голос.wav'), vs, sr)
    wr(os.path.join(a.out, '4-музыка-и-эффекты.wav'), fs, sr)
    shutil.copyfile(os.path.join(a.pub, 'mix.wav'), os.path.join(a.out, '5-полный-звук.wav'))
    open(os.path.join(a.out, '2-субтитры.srt'), 'w', encoding='utf-8-sig').write(srt(voice_json, a.max_chars))
    shutil.copyfile(a.clean, os.path.join(a.out, '1-видео-без-субтитров-и-звука.mp4'))
    print(f'готово: {a.out}\nусиление дорожек {g:.3f}, пик дорожек {20*np.log10(max(np.abs(vs).max(), np.abs(fs).max())):.1f} дБ; голос + музыка/эффекты = полный звук с точностью {err:.0f} дБ')


if __name__ == '__main__':
    main()
