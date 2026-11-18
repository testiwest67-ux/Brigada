# «Измеритель роботности» голоса: сравнивает дорожки по живости интонации и рисует спектрограммы.
#   python3 robot_meter.py out.png name1=file1.wav[@t0-t1] name2=file2.wav ...
# Метрики (больше = живее, кроме «ровность»):
#   мелодия  — разброс высоты тона по фразе в полутонах (живой рассказчик ~3–6, робот < 2);
#   движение — средний перепад высоты тона между соседними слогами, полутоны;
#   громкость— разброс громкости речи, дБ;
#   ровность — спектральная плоскость на голосе (выше = шум/металл).
import subprocess, sys, numpy as np
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

SR = 16000


def load(spec):
    path, _, rng = spec.partition('@')
    a = ['ffmpeg', '-v', 'error']
    if rng:
        t0, t1 = rng.split('-'); a += ['-ss', t0, '-to', t1]
    a += ['-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768


def f0_track(x, fr=0.04, hop=0.01):
    n, h = int(SR * fr), int(SR * hop)
    lo, hi = int(SR / 300), int(SR / 60)
    f0, rms = [], []
    for i in range(0, len(x) - n, h):
        w = x[i:i + n] * np.hanning(n)
        r = np.sqrt(np.mean(w ** 2)); rms.append(r)
        ac = np.correlate(w, w, 'full')[n - 1:]
        if ac[0] <= 0: f0.append(np.nan); continue
        ac = ac / ac[0]
        k = lo + np.argmax(ac[lo:hi])
        f0.append(SR / k if ac[k] > 0.45 and r > 0.01 else np.nan)
    return np.array(f0), np.array(rms)


def metrics(x):
    f0, rms = f0_track(x)
    st = 12 * np.log2(f0[~np.isnan(f0)] / 100)
    v = st[np.abs(st - np.median(st)) < 12]
    d = np.abs(np.diff(f0)); d = d[~np.isnan(d)]
    moves = 12 * np.log2(1 + d / np.nanmedian(f0)) if len(d) else np.array([0])
    db = 20 * np.log10(rms[rms > 0.01] + 1e-9)
    S = np.abs(np.fft.rfft(x[:len(x) // 512 * 512].reshape(-1, 512) * np.hanning(512), axis=1)) + 1e-9
    flat = np.exp(np.mean(np.log(S), 1)) / np.mean(S, 1)
    voiced = (S ** 2).mean(1) > np.percentile((S ** 2).mean(1), 60)
    return {'тон': float(np.nanmedian(f0)), 'мелодия': np.std(v),'движение': np.mean(moves[moves < 3]), 'громкость': np.std(db), 'ровность': np.mean(flat[voiced])}


def main():
    out, specs = sys.argv[1], sys.argv[2:]
    fig, ax = plt.subplots(len(specs), 1, figsize=(14, 3.2 * len(specs)))
    ax = np.atleast_1d(ax)
    print(f'{"":14s} тон,Гц  мелодия  движение  громкость  ровность   (тон: муж. ~85–155, жен. ~165–255)')
    for a, s in zip(ax, specs):
        name, path = s.split('=', 1)
        x = load(path)
        m = metrics(x)
        print(f'{name:14s} {m["тон"]:6.0f}  {m["мелодия"]:6.2f}  {m["движение"]:7.3f}  {m["громкость"]:8.2f}  {m["ровность"]:8.3f}')
        seg = x[:SR * 12]
        a.specgram(seg, NFFT=1024, Fs=SR, noverlap=768, cmap='magma', vmin=-120)
        f0, _ = f0_track(seg)
        a.plot(np.arange(len(f0)) * 0.01, f0, 'c.', ms=2)
        a.set_ylim(0, 6000); a.set_title(f'{name}: мелодия {m["мелодия"]:.2f} пт, движение {m["движение"]:.3f}, громкость ±{m["громкость"]:.1f} дБ')
    plt.tight_layout(); plt.savefig(out, dpi=80)


if __name__ == '__main__':
    main()
