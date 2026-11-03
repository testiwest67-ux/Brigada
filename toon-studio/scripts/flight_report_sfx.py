# Test sound for the «Рейс 19» report scene: voice + typewriter, envelope, red pencil, rubber stamp.
# Cue times mirror REPORT_CUES in src/flight19/Report.tsx (all derived from the voice words).
#   python scripts/flight_report_sfx.py public/reys-19/voice.wav public/reys-19/voice.json public/reys-19/report-test.wav
import json, subprocess, sys, wave
import numpy as np

SR = 48000
CONCLUSION = ['Ошибка ведущего —', 'лейт. Ч. Тейлора.']
CHAR_DT = 0.034
rng = np.random.default_rng(19)


def read(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))


def bandnoise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)


def add(buf, t, x, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g


def key():
    n = int(0.05 * SR)
    click = bandnoise(n, 2500, 7000) * env_exp(n, 0.004)
    thunk = np.sin(2 * np.pi * rng.uniform(150, 210) * np.arange(n) / SR) * env_exp(n, 0.012)
    return click * 0.6 + thunk * 0.5


def bell():
    n = int(1.0 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2093 * tt) + 0.4 * np.sin(2 * np.pi * 4186 * tt) + 0.25 * np.sin(2 * np.pi * 5274 * tt)) * env_exp(n, 0.25) * 0.35


def ratchet(d=0.24):
    n = int(d * SR); x = np.zeros(n)
    for k in range(int(d / 0.018)):
        add(x, k * 0.018, key(), 0.35)
    return x * np.linspace(0.6, 1, n)


def swish(d, lo, hi):
    n = int(d * SR); e = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return bandnoise(n, lo, hi) * e


def scribble(d):
    n = int(d * SR); tt = np.arange(n) / SR
    am = 0.55 + 0.45 * np.sin(2 * np.pi * 28 * tt) * np.sin(2 * np.pi * 3.1 * tt)
    return bandnoise(n, 1800, 6000) * am * np.sin(np.linspace(0, np.pi, n)) ** 0.5


def stamp():
    n = int(1.4 * SR); tt = np.arange(n) / SR
    boom = (np.sin(2 * np.pi * 52 * tt) * 1.0 + np.sin(2 * np.pi * 104 * tt) * 0.4) * env_exp(n, 0.22)
    knock = bandnoise(n, 200, 2500) * env_exp(n, 0.03)
    return boom * 0.9 + knock * 0.7


def main(vwav, vjson, out):
    V = json.load(open(vjson, encoding='utf-8')); L = V['lines']
    W = lambda i, k: L[i]['words'][k]['t']
    C = dict(frm=L[26]['start'] - 0.15, typ=W(26, 2) - 0.08, env=W(27, 0) + 0.05, strike=W(27, 6) - 0.05,
             stamp=L[28]['start'] + 0.02, to=L[29]['start'] - 0.1)
    t0, t1 = C['frm'] - 0.6, C['to'] + 0.6
    voice = read(vwav)[int(t0 * SR):int(t1 * SR)]
    fx = np.zeros(len(voice), dtype=np.float64)
    rel = lambda t: t - t0
    # room tone: low hum of the lamp + a soft drone
    tt = np.arange(len(fx)) / SR
    fx += (np.sin(2 * np.pi * 50 * tt) * 0.012 + np.sin(2 * np.pi * 73 * tt) * 0.01) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * tt))
    # typing
    n1 = len(CONCLUSION[0]); ret = C['typ'] + n1 * CHAR_DT
    for i, ch in enumerate(CONCLUSION[0]):
        if ch != ' ': add(fx, rel(C['typ'] + i * CHAR_DT), key(), rng.uniform(0.5, 0.8))
    add(fx, rel(ret - 0.02), bell(), 0.8)
    add(fx, rel(ret + 0.02), ratchet(0.22), 0.8)
    for i, ch in enumerate(CONCLUSION[1]):
        if ch != ' ': add(fx, rel(ret + 0.25 + i * CHAR_DT), key(), rng.uniform(0.5, 0.8))
    # envelope slides in
    add(fx, rel(C['env']), swish(0.5, 300, 3000), 0.35)
    # red pencil, two strokes
    add(fx, rel(C['strike']), scribble(0.32), 0.3)
    add(fx, rel(C['strike'] + 0.3), scribble(0.32), 0.3)
    # stamp: air whoosh, then the slam
    add(fx, rel(C['stamp'] - 0.2), swish(0.2, 150, 1500) * np.linspace(0.2, 1, int(0.2 * SR)), 0.4)
    add(fx, rel(C['stamp']), stamp(), 1.0)
    mix = voice + fx * 0.55
    raw = out.replace('.wav', '.raw.wav')
    with wave.open(raw, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix / max(1.0, np.abs(mix).max() / 0.95), -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5', '-ar', str(SR), out], check=True)
    print('ok', out, round(t1 - t0, 2), 's; cues', {k: round(v, 2) for k, v in C.items()})


if __name__ == '__main__':
    main(*sys.argv[1:4])
