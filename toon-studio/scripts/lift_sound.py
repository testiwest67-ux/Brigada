# Original sound design for «Лишний этаж», synthesised from sines and filtered noise (no samples):
# lift motor and hum, fluorescent buzz, floor clicks and the ding, sliding doors, dead buttons, the machine room winch,
# the red 13th floor (drips, far TV, heartbeat, high strings), the mirror pass (water ripple), muffled hands on glass.
# Every cue is timed from voice.json with the same formulas as src/elevator/timing.ts.
# The bed ducks under the voice; the final mix is loudness-normalised to -14 LUFS / -1.5 dBTP.
#
#   python scripts/lift_sound.py public/lishniy-etazh/voice.wav public/lishniy-etazh/voice.json public/lishniy-etazh/mix.wav
import json, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
voice_p, vjson_p, out_p = sys.argv[1:4]
V = json.load(open(vjson_p, encoding='utf-8'))
TOTAL = V['total']
N = int(TOTAL * SR) + SR
L = V['lines']
rng = np.random.default_rng(13)


def S(i): return L[i]['start']
def E(i): return L[i]['end']
def W(i, k): return L[i]['words'][k]['t']


amb = np.zeros(N)   # ducked under the voice
fx = np.zeros(N)    # accents, not ducked

# ---------- dsp helpers ----------
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
def tt(sec): return np.arange(int(sec * SR)) / SR
def room(x, t60=0.6, mix=0.3, bright=4000):
    ir = lp(noise(t60), bright) * np.exp(-6.9 * tt(t60) / t60)
    ir /= np.max(np.abs(ir)) + 1e-9
    wet = fftconvolve(x, ir)[:len(x) + len(ir)]
    wet /= np.max(np.abs(wet)) + 1e-9
    dry = np.concatenate([x, np.zeros(len(ir))])[:len(wet)]
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))
def put(buf, x, t, g=1.0):
    a = int(t * SR)
    if a >= len(buf): return
    if a < 0: x = x[-a:]; a = 0
    n = min(len(x), len(buf) - a)
    buf[a:a + n] += x[:n] * g
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)

# ---------- sounds ----------
def knock(kind='door'):
    t = tt(0.32)
    f0 = {'door': 78, 'bedroom': 110, 'table': 170, 'outside': 70}[kind]
    body = np.sin(2 * np.pi * f0 * t) * np.exp(-t / 0.06) + 0.5 * np.sin(2 * np.pi * f0 * 2.4 * t) * np.exp(-t / 0.03)
    click = bp(noise(0.32), 1200, 5000) * np.exp(-t / 0.005)
    thud = bp(noise(0.32), 70, 450) * np.exp(-t / 0.035)
    x = norm(0.8 * body + 0.25 * norm(click) + 0.7 * norm(thud))
    if kind in ('door', 'outside'): x = lp(x, 2200)
    if kind == 'bedroom': x = lp(x, 1500)
    return norm(room(x, 0.5 if kind != 'table' else 0.35, 0.28))

def creak(d=0.9, f=(520, 1150, 2100)):
    n = int(d * SR); imp = np.zeros(n); pos = 0.0; k = 0
    while pos < d:
        rate = 35 + 70 * (0.5 + 0.5 * np.sin(pos * 9 + k * 0.3)) + rng.uniform(-8, 8)
        i = int(pos * SR)
        if i < n: imp[i] = rng.uniform(0.6, 1.0) * np.sin(np.pi * pos / d)
        pos += 1 / rate; k += 1
    t = tt(0.05)
    res = sum(np.sin(2 * np.pi * fr * t) * np.exp(-t / dc) for fr, dc in zip(f, (0.012, 0.008, 0.005)))
    return norm(room(lp(fftconvolve(imp, res)[:n], 3000), 0.4, 0.25))

def steps(n=3, gap=0.55):
    out = np.zeros(int((n * gap + 0.4) * SR))
    for i in range(n):
        t = tt(0.25)
        s = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.06) + 0.4 * bp(noise(0.25), 150, 700) * np.exp(-t / 0.03)
        put(out, s, i * gap + rng.uniform(-0.03, 0.03), 0.8 + 0.2 * rng.random())
    return norm(room(lp(out, 900), 0.7, 0.35))

def rustle(d=0.8):
    x = hp(noise(d), 1800) * np.repeat(rng.random(int(d * 50) + 1), SR // 50)[:int(d * SR)] ** 2
    return norm(x * np.sin(np.pi * tt(d) / d))

def heartbeat(t0, t1, bpm0, bpm1, g):
    t = t0
    while t < t1:
        k = (t - t0) / max(1e-6, t1 - t0); bpm = bpm0 + (bpm1 - bpm0) * k
        for dt, f in ((0, 48), (0.24, 42)):
            s = tt(0.18); x = np.sin(2 * np.pi * f * s) * np.exp(-s / 0.05)
            put(amb, x, t + dt, g * (0.6 + 0.4 * k))
        t += 60 / bpm

def hit(big=1.0):
    d = 2.6; t = tt(d)
    f = 70 * np.exp(-t * 1.2) + 28
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.5 + 0.4 * big))
    burst = lp(noise(d), 400) * np.exp(-t / 0.08)
    return norm(room(norm(boom) + 0.35 * big * norm(burst), 1.6, 0.35, 2500))

def riser(d):
    t = tt(d); k = t / d
    sw = np.sin(2 * np.pi * np.cumsum(120 + 900 * k ** 2) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * (6 + 10 * k) * t))
    hiss = hp(noise(d), 1500) * k ** 2
    return norm((0.6 * sw + 0.4 * norm(hiss)) * k ** 2.5)

def glitch(d=0.12):
    x = np.sign(rng.standard_normal(int(d * SR) // 40 + 1)).repeat(40)[:int(d * SR)] * rng.uniform(0.3, 1)
    return norm(bp(x, 300, 6000)) * np.sin(np.pi * tt(d) / d) ** 0.3

def phone_buzz(d=0.9):
    t = tt(d); on = ((t % 0.5) < 0.35).astype(float)
    return norm(lp(np.sign(np.sin(2 * np.pi * 172 * t)), 900) * on)

def ping():
    t = tt(0.8)
    return norm(sum(np.sin(2 * np.pi * f * (t - dl).clip(0)) * np.exp(-(t - dl).clip(0) / 0.18) * (t >= dl) for f, dl in ((1318, 0), (1760, 0.11))))

def typing(d):
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d:
        s = tt(0.012); put(out, hp(noise(0.012), 3000) * np.exp(-s / 0.002), t, rng.uniform(0.4, 1)); t += rng.uniform(0.05, 0.11)
    return norm(out)

def vhs(d):
    t = tt(d)
    chirp = np.sin(2 * np.pi * np.cumsum(1700 + 1300 * np.sin(2 * np.pi * 9 * t) + 700 * np.sin(2 * np.pi * 2.3 * t)) / SR)
    return norm(0.5 * chirp + 0.35 * norm(hp(noise(d), 4000)) + 0.3 * np.sin(2 * np.pi * 60 * t)) * np.minimum(1, t / 0.05)

def breath(d=1.1):
    t = tt(d); k = t / d
    env = np.where(k < 0.45, np.sin(np.pi * k / 0.9) ** 2, np.sin(np.pi * (k - 0.45) / 1.1) ** 2 * 0.8)
    shake = 1 + 0.35 * np.sin(2 * np.pi * 11 * t)
    return norm(bp(noise(d), 500, 2600) * env * shake)

def bell(f, d=1.6):
    t = tt(d)
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (dc)) for m, a, dc in ((1, 1, 0.9), (2.76, 0.35, 0.35), (5.4, 0.15, 0.15)))

def pad(t0, t1, freqs, g, vib=0.0, att=1.0, rel=1.0, buf=None):
    d = t1 - t0
    if d <= 0: return
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t + vib * np.sin(2 * np.pi * (4.5 + i * 0.7) * t)) for i, f in enumerate(freqs)) / len(freqs)
    env = np.minimum(1, np.minimum(t / att, (d - t) / rel).clip(0))
    put(amb if buf is None else buf, x * env, t0, g)

# ---------- lift sounds ----------
def ding(f=1046.5, dark=False):
    x = bell(f, 1.8) + 0.8 * np.concatenate([np.zeros(int(0.22 * SR)), bell(f * 0.794, 1.8)])[:int(1.8 * SR)]
    if dark: x = lp(x, 1400)
    return norm(room(norm(x), 1.0, 0.35, 5000))

def slide(d=1.1):
    t = tt(d); k = t / d
    x = bp(noise(d), 300, 2400) * np.sin(np.pi * k) ** 0.7 + 0.4 * np.sin(2 * np.pi * (90 + 40 * k) * t) * np.sin(np.pi * k)
    return norm(room(x, 0.4, 0.2))

def clunk():
    t = tt(0.5)
    x = np.sin(2 * np.pi * 62 * t) * np.exp(-t / 0.09) + 0.5 * bp(noise(0.5), 200, 1500) * np.exp(-t / 0.03)
    return norm(room(x, 0.5, 0.3))

def click(f0=2600):
    t = tt(0.05)
    return norm(bp(noise(0.05), f0 * 0.6, f0 * 1.6) * np.exp(-t / 0.004) + 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.01))

def motor(t0, t1, g, moving=True):
    d = t1 - t0
    if d <= 0: return
    t = tt(d)
    x = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t) + 0.25 * np.sin(2 * np.pi * 150 * t)
    if moving: x += 0.9 * norm(lp(noise(d), 180)) * (1 + 0.2 * np.sin(2 * np.pi * 0.7 * t))
    env = np.minimum(1, np.minimum(t / 0.35, (d - t) / 0.35).clip(0))
    put(amb, norm(x) * env, t0, g)

def tube(t0, t1, g):
    d = t1 - t0
    if d <= 0: return
    t = tt(d)
    x = np.sin(2 * np.pi * 100 * t) + 0.6 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sin(2 * np.pi * 300 * t) + 0.15 * hp(noise(d), 4000)
    x *= 1 - 0.7 * (rng.random(len(t) // 2400 + 1).repeat(2400)[:len(t)] > 0.93)   # crackles
    put(amb, x * np.minimum(1, np.minimum(t / 0.1, (d - t) / 0.1).clip(0)), t0, g)

def drips(t0, t1, g):
    t = t0 + rng.uniform(0.2, 0.6)
    while t < t1:
        s = tt(0.12); f = rng.uniform(900, 1500)
        put(amb, np.sin(2 * np.pi * (f + 600 * np.exp(-s / 0.01)) * s) * np.exp(-s / 0.03), t, g * rng.uniform(0.6, 1)); t += rng.uniform(0.7, 1.6)

def far_tv(t0, t1, g):
    d = t1 - t0; t = tt(d)
    syl = (rng.random(int(d * 7) + 1) > 0.35).repeat(SR // 7 + 1)[:len(t)]
    x = bp(noise(d), 300, 1200) * syl * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t))
    put(amb, lp(x, 900) * np.minimum(1, np.minimum(t / 0.4, (d - t) / 0.4).clip(0)), t0, g)

def ripple(d=1.6):
    t = tt(d); k = t / d
    bub = bp(noise(d), 400, 2200) * (0.5 + 0.5 * np.sin(2 * np.pi * (8 + 20 * k) * t)) * np.sin(np.pi * k)
    whoosh = lp(noise(d), 600) * np.sin(np.pi * k) ** 2
    return norm(room(0.6 * norm(bub) + norm(whoosh), 1.2, 0.4))

def glass_bang():
    t = tt(0.4)
    x = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.07) + 0.4 * bp(noise(0.4), 600, 3000) * np.exp(-t / 0.02)
    return norm(lp(room(x, 0.3, 0.3), 1300))

def winch(t0, t1, g):
    d = t1 - t0; t = tt(d)
    x = np.sin(2 * np.pi * 38 * t) + 0.6 * np.sin(2 * np.pi * 76 * t + np.sin(t * 2)) + 0.8 * norm(lp(noise(d), 260))
    x *= 1 + 0.35 * np.sin(2 * np.pi * 1.4 * t)
    put(amb, norm(x) * np.minimum(1, np.minimum(t / 0.3, (d - t) / 0.3).clip(0)), t0, g)
    tk = t0 + 0.2
    while tk < t1 - 0.2: put(amb, clunk(), tk, g * 0.35); tk += 0.71

# ---------- cues (same formulas as src/elevator/timing.ts) ----------
SIL0, SIL1 = E(13) + 0.12, S(14) - 0.08
CUT = {'s3': S(2) - 0.1, 's5': S(5) - 0.15, 's12': S(13) - 0.1, 's15': S(15) - 0.1, 's16': S(16) - 0.25, 's17': S(17) - 0.15, 's18': S(18) - 0.2}
disp12, disp13 = W(0, 3), E(0) + 0.08
doorsOpen = S(5) - 0.05
presses = [W(8, 1), W(8, 2), W(8, 2) + 0.42, W(8, 3) + 0.1, W(8, 5)]
aptOpen = S(9) - 0.05
doorsClose, doorsShut = W(12, 1) - 0.1, W(12, 4) + 0.15
sitDown = W(13, 1) - 0.1
swap0, swap1 = S(16) - 0.1, E(16) - 0.1
bangs = [E(16) + 0.05, E(16) + 0.32, E(16) + 0.58]
doors12, shut13 = S(17) - 0.15, S(18) - 0.15
mirrorPass = (CUT['s15'] + CUT['s16']) / 2

# ---------- the bed ----------
def drone(t0, t1, g0, g1):
    d = t1 - t0; t = tt(d); k = t / d
    x = (np.sin(2 * np.pi * 41.2 * t) + 0.8 * np.sin(2 * np.pi * 43.65 * t) + 0.35 * np.sin(2 * np.pi * 82.4 * t + np.sin(t * 0.7)))
    x += 0.6 * norm(lp(noise(d), 110))
    env = (g0 + (g1 - g0) * k) * np.minimum(1, np.minimum(t / 0.8, (d - t) / 0.3).clip(0))
    put(amb, x * env, t0)

# lift: moving up to 13, standing on 13, going down, standing, going up at the end
motor(0.0, disp13 + 0.15, 0.10)
motor(disp13, CUT['s3'], 0.04, moving=False)
motor(CUT['s5'], doorsShut, 0.035, moving=False)
motor(doorsShut + 0.25, SIL0, 0.10)
motor(SIL1, shut13, 0.04, moving=False)
motor(shut13 + 0.3, TOTAL, 0.11)
tube(0.0, CUT['s3'], 0.02); tube(CUT['s5'], SIL0, 0.02); tube(SIL1, CUT['s18'], 0.02)
drone(0.0, CUT['s3'], 0.10, 0.14)
drone(CUT['s5'], SIL0, 0.14, 0.26)
drone(SIL1, TOTAL, 0.28, 0.42)
# flashback: the winch in the machine room + a warm low pad
winch(CUT['s3'], CUT['s5'], 0.06)
pad(CUT['s3'], CUT['s5'], [110, 130.8, 164.8], 0.035, vib=0.004, att=0.6, rel=0.3)
# the red 13th floor: drips, a far TV through the flat door, heartbeat, high strings
drips(CUT['s5'], doorsShut, 0.05)
far_tv(S(6), aptOpen + 1.0, 0.03)
heartbeat(S(9), SIL0 - 0.1, 70, 122, 0.22)
pad(S(9), SIL0, [659.3, 698.5, 740.0], 0.022, vib=0.006, att=2.5, rel=0.05)
# after the twist: low cluster
pad(SIL1, TOTAL - 0.4, [110, 116.5, 77.8], 0.05, vib=0.004, att=1.2, rel=0.3)

# ---------- events ----------
put(fx, click(1800), 0.4, 0.12); put(fx, click(1800), disp12, 0.14)
put(fx, ding(), disp13, 0.32); put(fx, clunk(), disp13, 0.2)
put(fx, hit(0.6), S(1) - 0.1, 0.3); put(fx, glitch(0.12), S(1) - 0.08, 0.1)
put(fx, hit(0.5), W(4, 1), 0.3); put(fx, glitch(0.15), W(4, 1), 0.12)
put(fx, clunk(), doorsOpen, 0.15); put(fx, slide(1.2), doorsOpen + 0.05, 0.14)
put(fx, bell(2093, 0.4) * 0.5, S(7) - 0.3, 0.03); put(fx, bell(2637, 0.4) * 0.5, S(7) + 0.9, 0.025)   # plates in the flat
for p in presses: put(fx, click(2600), p, 0.22); put(fx, clunk() * 0.4, p + 0.01, 0.06)
put(amb, creak(1.2, (430, 950, 1800)), aptOpen, 0.11)
put(fx, hit(0.5), W(10, 3), 0.28)                                   # «С твоим лицом»
put(amb, steps(5, 0.5), S(11) - 0.1, 0.12)
put(fx, slide(doorsShut - doorsClose), doorsClose, 0.14)
put(fx, hit(0.8), doorsShut, 0.38); put(fx, clunk(), doorsShut, 0.3); put(fx, glitch(0.15), doorsShut, 0.1)
q = sitDown - 0.15 - CUT['s12']
for k in (0.33, 0.66): put(fx, click(1800), CUT['s12'] + q * k, 0.1)
put(amb, rustle(0.9), sitDown + 0.1, 0.08)
put(fx, riser(1.8), SIL0 - 1.8, 0.2)
put(fx, click(3200), SIL1, 0.18); put(fx, hit(1.0), SIL1 + 0.02, 0.45)       # the light comes back
put(fx, ripple(1.8), mirrorPass - 0.9, 0.3)
put(fx, hit(0.8), (swap0 + swap1) / 2, 0.4); put(fx, glitch(0.25), (swap0 + swap1) / 2, 0.14); put(fx, ripple(1.2), swap0, 0.18)
for b in bangs: put(fx, glass_bang(), b, 0.45)
put(fx, ding(), doors12, 0.2); put(fx, slide(0.7), doors12 + 0.1, 0.1)
put(fx, clunk(), shut13, 0.3); put(fx, hit(0.6), shut13 + 0.05, 0.3)
put(fx, hit(1.0), W(18, 3), 0.45)
put(fx, ding(980, dark=True), TOTAL - 0.95, 0.3)                    # the last ding in the dark

# silence region: mute everything but one breath
a, b = int(SIL0 * SR), int(SIL1 * SR)
amb[a:b] = 0
fx_keep = np.zeros(N); put(fx_keep, breath(min(1.05, SIL1 - SIL0)), SIL0 + 0.04, 0.08)
fx[a:b] = fx_keep[a:b]

# ---------- duck under the voice + mix ----------
def readwav(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    return x
voice = np.zeros(N); vx = readwav(voice_p); voice[:min(N, len(vx))] = vx[:N]
envv = np.sqrt(fftconvolve(voice ** 2, np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same').clip(0))
duck = 10 ** (-7 / 20 * np.clip((20 * np.log10(envv + 1e-6) + 45) / 15, 0, 1))
duck = fftconvolve(duck, np.ones(int(0.1 * SR)) / int(0.1 * SR), 'same')
mix = voice + amb * duck + fx
mix = mix[:int(TOTAL * SR)]
mix /= max(1.0, np.max(np.abs(mix)) / 0.95)
tmp = out_p.replace('.wav', '.raw.wav')
with wave.open(tmp, 'w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
# two-pass loudness normalisation to -14 LUFS, -1.5 dBTP
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', str(SR), '-ac', '2', out_p], check=True)
print('ok', out_p, round(TOTAL, 2), 's | ding13', round(disp13, 2), 'doors', round(doorsOpen, 2), 'shut', round(doorsShut, 2), 'silence', round(SIL0, 2), round(SIL1, 2), 'bangs', [round(x, 2) for x in bangs])
