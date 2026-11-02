# Original sound design for «Ночная смена», synthesised from sines and short filtered transients (no samples):
# the street sign buzz, fluorescent tubes and fridge hum, the door bell, paper and pen, clock clicks, the knocking from
# inside the fridges, the finger squeak on the glass, the old wall phone, the dial tone, dawn birds, the scanner beep.
# Every cue is timed from voice.json with the same formulas as src/shift/timing.ts.
# The bed ducks under the voice; one second of full silence after «Зато смотрел я»; the mix is -14 LUFS / -1.5 dBTP.
#
#   python scripts/shift_sound.py public/nochnaya-smena/voice.wav public/nochnaya-smena/voice.json public/nochnaya-smena/mix.wav
import json, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
voice_p, vjson_p, out_p = sys.argv[1:4]
V = json.load(open(vjson_p, encoding='utf-8'))
TOTAL = V['total']
N = int(TOTAL * SR) + SR
L = V['lines']
rng = np.random.default_rng(21)


def S(i): return L[i]['start']
def E(i): return L[i]['end']
def W(i, k): return L[i]['words'][k]['t']


amb = np.zeros(N)   # bed, ducked under the voice
fx = np.zeros(N)    # accents, not ducked

# ---------- dsp helpers ----------
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def noise(sec): return rng.standard_normal(int(sec * SR))
def tt(sec): return np.arange(int(sec * SR)) / SR
def norm(x): return x / (np.max(np.abs(x)) + 1e-9)
def fade(d, a=0.1, r=0.1):
    t = tt(d); return np.minimum(1, np.minimum(t / max(a, 1e-3), (d - t) / max(r, 1e-3)).clip(0))
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

# ---------- cues (same formulas as src/shift/timing.ts) ----------
SIL0, SIL1 = E(49) + 0.35, E(49) + 1.35
CUTS = [0, S(2) - 0.1, S(3) - 0.1, S(4) - 0.15, S(6) - 0.1, S(8) - 0.1, S(9) - 0.1, S(11) - 0.1, S(13) - 0.1, S(15) - 0.15,
        S(16) - 0.1, S(17) - 0.1, S(19) - 0.15, S(20) - 0.1, S(22) - 0.1, S(24) - 0.15, S(25) - 0.1, S(27) - 0.1, S(28) - 0.2,
        S(29) - 0.1, S(31) - 0.1, S(33) - 0.1, S(34) - 0.1, S(35) - 0.15, S(38) - 0.15, S(40) - 0.1, S(42) - 0.1, S(45) - 0.1,
        S(47) - 0.15, E(49) + 0.1, S(50) - 0.15, S(54) - 0.1, S(55) - 0.1, S(57) - 0.15, S(58) - 0.1, S(60) - 0.1, S(63) - 0.1,
        S(65) - 0.15, E(66) + 0.3, TOTAL]
def shot(n): return CUTS[n - 1]
def dur(n): return CUTS[n] - CUTS[n - 1]
knocks = []
t, g = W(29, 2), 0
while t < CUTS[23] - 0.15:
    n = 2 + (g % 3)
    for k in range(n):
        if t >= CUTS[23] - 0.15: break
        knocks.append(t); t += 0.19 + 0.04 * ((g + k) % 2)
    t += 0.55 + 0.25 * (g % 2); g += 1
bell12 = CUTS[11] + 0.2
ring0, ring1 = S(39) - 0.35, CUTS[25] + 0.05
pickup = CUTS[25] + 0.2
bell31 = CUTS[30] + 0.25

# ---------- sounds ----------
def bell(f, d=1.6):
    t = tt(d)
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / dc) for m, a, dc in ((1, 1, 0.9), (2.76, 0.35, 0.35), (5.4, 0.15, 0.15)))

def door_bell():   # a little brass bell over the door: a few jingles
    out = np.zeros(int(1.8 * SR))
    for k, dt in enumerate((0, 0.09, 0.2, 0.33)):
        put(out, bell(2350 + 120 * (k % 2), 1.3), dt, 0.9 ** k)
    return norm(room(norm(out), 0.6, 0.25, 7000))

def click(f0=2600, d=0.05):
    t = tt(d)
    return norm(bp(noise(d), f0 * 0.6, f0 * 1.6) * np.exp(-t / 0.004) + 0.4 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.01))

def clock_tick(): return norm(room(click(3400) + 0.6 * click(1800), 0.3, 0.2))

def zap():   # a tube flicker
    t = tt(0.12)
    return norm(np.sign(np.sin(2 * np.pi * 100 * t)) * np.exp(-t / 0.04) * 0.5 + bp(noise(0.12), 2000, 6000) * np.exp(-t / 0.02))

def rustle(d=0.8):
    x = hp(noise(d), 1800) * np.repeat(rng.random(int(d * 50) + 1), SR // 50)[:int(d * SR)] ** 2
    return norm(x * np.sin(np.pi * tt(d) / d))

def scratch(d=0.9):   # a pen on paper: short strokes
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.1:
        s = rng.uniform(0.06, 0.16); x = bp(noise(s), 2500, 7000) * np.sin(np.pi * tt(s) / s)
        put(out, x, t, rng.uniform(0.5, 1)); t += s + rng.uniform(0.01, 0.05)
    return norm(out)

def thud(f=70, d=0.35):
    t = tt(d)
    return norm(room(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.07) + 0.4 * bp(noise(d), 100, 600) * np.exp(-t / 0.03), 0.4, 0.25))

def glass_knock():   # a knuckle on fridge glass from inside: low thump + a short glassy ring
    t = tt(0.4)
    x = np.sin(2 * np.pi * 85 * t) * np.exp(-t / 0.06) + 0.35 * np.sin(2 * np.pi * 1900 * t) * np.exp(-t / 0.03)
    x += 0.3 * bp(noise(0.4), 500, 2500) * np.exp(-t / 0.012)
    return norm(room(lp(x, 3500), 0.45, 0.3))

def squeak(d):   # a finger dragged on wet glass: a rubbing tone that wanders
    t = tt(d)
    f = 900 + 350 * np.sin(2 * np.pi * 1.7 * t) + 200 * np.sin(2 * np.pi * 4.3 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t) ** 2)
    strokes = (np.sin(2 * np.pi * 2.2 * t) > -0.3).astype(float)
    return norm(lp(x * strokes, 2500) * fade(d, 0.05, 0.1))

def phone_ring(d):   # an old electromechanical bell: a hammer at 25 Hz on two gongs
    t = tt(d)
    x = np.sin(2 * np.pi * 1150 * t) + 0.8 * np.sin(2 * np.pi * 1480 * t) + 0.3 * np.sin(2 * np.pi * 2900 * t)
    x *= 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 25 * t))
    return norm(room(x * fade(d, 0.01, 0.12), 0.5, 0.25, 6000))

def busy(d):   # Russian dial-off tone: 425 Hz, 0.35 s on / 0.35 s off, through a phone
    t = tt(d)
    x = np.sin(2 * np.pi * 425 * t) * ((t % 0.7) < 0.35)
    return norm(bp(x, 300, 3000)) * fade(d, 0.01, 0.05)

def heartbeat(t0, t1, bpm0, bpm1, g):
    t = t0
    while t < t1:
        k = (t - t0) / max(1e-6, t1 - t0); bpm = bpm0 + (bpm1 - bpm0) * k
        for dt, f in ((0, 48), (0.24, 42)):
            s = tt(0.18); put(amb, np.sin(2 * np.pi * f * s) * np.exp(-s / 0.05), t + dt, g * (0.6 + 0.4 * k))
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
    return norm(sw * k ** 2.5)

def glitch(d=0.12):
    x = np.sign(rng.standard_normal(int(d * SR) // 40 + 1)).repeat(40)[:int(d * SR)] * rng.uniform(0.3, 1)
    return norm(bp(x, 300, 6000)) * np.sin(np.pi * tt(d) / d) ** 0.3

def tinnitus(d, f=4200):
    t = tt(d); return np.sin(2 * np.pi * f * t) * fade(d, d * 0.4, 0.2)

def beep(): t = tt(0.09); return np.sin(2 * np.pi * 1850 * t) * fade(0.09, 0.005, 0.01)

def bird(f0):   # a short tonal chirp
    d = rng.uniform(0.08, 0.16); t = tt(d); k = t / d
    f = f0 * (1 + 0.35 * np.sin(np.pi * k)) * (1 + 0.06 * np.sin(2 * np.pi * 40 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * k) ** 2

def steps(n=3, gap=0.55):
    out = np.zeros(int((n * gap + 0.4) * SR))
    for i in range(n):
        t = tt(0.25)
        s = np.sin(2 * np.pi * 55 * t) * np.exp(-t / 0.06) + 0.4 * bp(noise(0.25), 150, 700) * np.exp(-t / 0.03)
        put(out, s, i * gap + rng.uniform(-0.03, 0.03), 0.8 + 0.2 * rng.random())
    return norm(room(lp(out, 900), 0.7, 0.35))

def pad(t0, t1, freqs, g, vib=0.0, att=1.0, rel=1.0, buf=None):
    d = t1 - t0
    if d <= 0: return
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t + vib * np.sin(2 * np.pi * (4.5 + i * 0.7) * t)) for i, f in enumerate(freqs)) / len(freqs)
    put(amb if buf is None else buf, x * fade(d, att, rel), t0, g)

def tubes(t0, t1, g0, g1=None):   # fluorescent tubes: 100 Hz hum and its harmonics
    d = t1 - t0
    if d <= 0: return
    t = tt(d); k = t / d; g1 = g0 if g1 is None else g1
    x = np.sin(2 * np.pi * 100 * t) + 0.6 * np.sin(2 * np.pi * 200 * t) + 0.3 * np.sin(2 * np.pi * 300 * t) + 0.12 * np.sin(2 * np.pi * 1200 * t)
    put(amb, x * fade(d, 0.1, 0.1) * (g0 + (g1 - g0) * k), t0)

def fridges(t0, t1, g0, g1=None):   # compressor hum: 50 Hz with a slow beat
    d = t1 - t0
    if d <= 0: return
    t = tt(d); k = t / d; g1 = g0 if g1 is None else g1
    x = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 50.7 * t) + 0.3 * np.sin(2 * np.pi * 150 * t)
    put(amb, x * fade(d, 0.3, 0.3) * (g0 + (g1 - g0) * k), t0)

def drone(t0, t1, g0, g1):
    d = t1 - t0; t = tt(d); k = t / d
    x = np.sin(2 * np.pi * 41.2 * t) + 0.8 * np.sin(2 * np.pi * 43.65 * t) + 0.35 * np.sin(2 * np.pi * 82.4 * t + np.sin(t * 0.7))
    put(amb, x * (g0 + (g1 - g0) * k) * fade(d, 0.8, 0.3), t0)

# ---------- the bed ----------
# street (shot 1): the sign buzzes and drops out every 23 frames after frame 30 (as in S01)
d1 = dur(1); t = tt(d1); fr = np.floor(t * 30)
on = ~((fr > 30) & (fr % 23 < 4))
put(amb, (np.sin(2 * np.pi * 120 * t) + 0.5 * np.sin(2 * np.pi * 240 * t) + 0.2 * np.sin(2 * np.pi * 1800 * t)) * on * fade(d1, 0.3, 0.05), 0, 0.03)
pad(0, shot(2), [55, 82.4], 0.05, att=0.5, rel=0.2)
# inside: tubes and fridges all night, changing with the light
tubes(shot(2), shot(19), 0.018)
tubes(shot(19), shot(20), 0.018, 0.006)
tubes(shot(20), shot(24), 0.005)
tubes(shot(24), SIL0, 0.012)
tubes(shot(31), TOTAL, 0.008)
fridges(shot(2), shot(19), 0.03)
fridges(shot(19), shot(24), 0.035, 0.07)
fridges(shot(24) + 0.6, SIL0, 0.03)
fridges(shot(31), TOTAL, 0.03)
# music by acts: unease → the man → 3:33 → the phone → dawn → the twist
pad(shot(2), shot(14), [110, 130.8, 164.8], 0.03, vib=0.003, att=2.0, rel=0.6)
pad(shot(14), shot(19), [98, 103.8, 146.8], 0.04, vib=0.004, att=0.8, rel=0.5)
drone(shot(14), shot(19), 0.08, 0.16)
pad(shot(19), shot(24), [659.3, 698.5, 740.0], 0.018, vib=0.006, att=2.0, rel=0.05)
drone(shot(19), shot(24), 0.16, 0.3)
pad(shot(25), SIL0, [87.3, 92.5, 130.8], 0.035, vib=0.004, att=1.2, rel=0.05)
drone(shot(27), SIL0, 0.12, 0.3)
pad(shot(31), shot(33), [130.8, 164.8, 196.0, 261.6], 0.03, vib=0.002, att=1.0, rel=0.8)   # warm, dawn
pad(shot(33), TOTAL - 0.3, [110, 116.5, 77.8], 0.05, vib=0.004, att=1.5, rel=0.3)
drone(shot(34), TOTAL, 0.15, 0.35)
pad(shot(36), shot(37), [622.3, 659.3, 698.5, 740.0], 0.016, vib=0.008, att=1.0, rel=0.3)   # the shadows on the glass
heartbeat(shot(16), shot(18), 92, 120, 0.2)
heartbeat(shot(27), shot(29), 100, 128, 0.18)
heartbeat(shot(35), shot(36), 110, 90, 0.18)
# dawn birds outside
tb = shot(31) + 0.3
while tb < shot(33):
    for k in range(int(rng.integers(2, 4))):
        put(amb, bird(rng.uniform(2800, 4200)), tb + k * 0.13, 0.03)
    tb += rng.uniform(0.6, 1.4)

# ---------- events ----------
put(fx, rustle(0.7), shot(3) + 0.05, 0.08)                       # the note
put(fx, scratch(1.0), shot(5) + 0.3, 0.06)                       # rule 1 in red pen
put(fx, rustle(0.6), shot(9) + 0.05, 0.08)                       # flips the note
for n in (10, 13, 19, 24, 25): put(fx, clock_tick(), shot(n) + 0.08, 0.16)
for gf in (310, 340, 860, 1430): put(fx, zap(), gf / 30, 0.05)  # global tube flickers (shop(): flick)
for ff in (20, 44): put(fx, zap(), shot(11) + ff / 30, 0.06)
for ff in (30, 34): put(fx, zap(), shot(14) + ff / 30, 0.06)
put(fx, door_bell(), bell12, 0.2)                                  # the babushka comes in
put(amb, steps(4, 0.5), shot(12) + 0.4, 0.08)
put(fx, thud(110, 0.3), shot(14) + 40 / 30, 0.12)                  # the salt on the belt
put(amb, tinnitus(dur(15)), shot(15), 0.01)
put(fx, hit(0.6), W(23, 3) if len(L[23]['words']) > 3 else W(23, 2), 0.3)   # «ничего»
put(fx, riser(dur(17)), shot(17), 0.1)
# shot 18: he passes the glass door; the bell stays silent, only a soft ripple
d18 = dur(18); u = 0.66
put(fx, lp(norm(np.sin(2 * np.pi * np.cumsum(300 + 200 * np.sin(2 * np.pi * 6 * tt(1.2))) / SR)) * fade(1.2, 0.4, 0.6), 900), shot(18) + 4 / 30 + (d18 - 10 / 30) * u - 0.6, 0.1)
put(fx, riser(1.4), shot(20) - 1.4, 0.12)
for k in knocks: put(fx, glass_knock(), k, 0.32 * rng.uniform(0.8, 1.0))
put(fx, squeak(dur(21) - 16 / 30), shot(21) + 6 / 30, 0.06)       # «ДИМА» on the glass
put(fx, hit(0.7), shot(24) + 0.02, 0.3)                            # the knocking stops
# 3:34: the bed drops out for half a second
a, b = int(shot(24) * SR), int((shot(24) + 0.6) * SR); amb[a:b] *= np.linspace(0, 1, b - a) ** 2
# the wall phone
tr = ring0
while tr < ring1:
    put(fx, phone_ring(min(0.8, ring1 - tr)), tr, 0.16); tr += 1.3
put(fx, thud(90, 0.3), pickup, 0.15); put(fx, click(1500), pickup + 0.02, 0.1)
put(fx, glitch(0.18), shot(29) + 2 / 30, 0.14); put(fx, hit(0.9), shot(29) + 2 / 30, 0.42)
# shot 30: the counter lamp dies → one second of silence → dial tone
put(fx, zap(), shot(30) + 4 / 30, 0.12); put(fx, thud(60, 0.4), shot(30) + 6 / 30, 0.2)
put(fx, busy(CUTS[30] + 0.45 - SIL1), SIL1, 0.08)
put(fx, door_bell(), bell31, 0.18); put(amb, steps(4, 0.55), shot(31) + 0.5, 0.07)
put(fx, hit(0.7), W(57, 1), 0.35)                                  # «Касса закрыта, сынок»
put(amb, tinnitus(dur(35), 3900), shot(35), 0.012)
put(fx, hit(0.6), W(59, 1), 0.3)                                   # «Тени нет»
for ff in range(0, int(dur(37) * 30), 40): put(fx, beep(), shot(37) + ff / 30, 0.06)   # the scanner (S37)
put(fx, thud(80, 0.3), shot(38) + 0.25, 0.12); put(fx, thud(75, 0.3), shot(38) + 0.6, 0.1)   # palms on the glass
put(fx, hit(1.0), W(66, 1) if len(L[66]['words']) > 1 else S(66), 0.42)                     # «Без тени»
put(fx, scratch(0.8), shot(39) + 20 / 30, 0.08)                    # «Дима» crossed out
put(fx, bell(523.3, 2.0) * 0.6, TOTAL - 0.7, 0.05)

# silence: mute everything
a, b = int(SIL0 * SR), int(SIL1 * SR)
amb[a:b] = 0; fx[a:b] = 0

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
m = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', str(SR), '-ac', '2', out_p], check=True)
print('ok', out_p, round(TOTAL, 2), 's | knocks', len(knocks), round(knocks[0], 2), '..', round(knocks[-1], 2),
      '| ring', round(ring0, 2), round(ring1, 2), '| silence', round(SIL0, 2), round(SIL1, 2))
