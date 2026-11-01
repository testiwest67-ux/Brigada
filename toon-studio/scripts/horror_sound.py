# Original horror sound design for «Не отвечай», synthesised from sines and filtered noise (no samples):
# drone, wind, bulb hum, heartbeat, strings, music box, knocks, creaks, steps, rustle, phone, VHS rewind, glitch,
# risers and hits, one breath in the silence. Every cue is timed from voice.json, so re-voicing never breaks sync.
# The bed ducks under the voice; the final mix is loudness-normalised to -14 LUFS / -1.5 dBTP.
#
#   python scripts/horror_sound.py public/ne-otvechai/voice.wav public/ne-otvechai/voice.json public/ne-otvechai/mix.wav
import json, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
voice_p, vjson_p, out_p = sys.argv[1:4]
V = json.load(open(vjson_p, encoding='utf-8'))
TOTAL = V['total']
N = int(TOTAL * SR) + SR
L = V['lines']
rng = np.random.default_rng(7)


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

# ---------- the bed ----------
# low drone: E1 + F1 (minor second beating) + octave, with a slow swell; intensity per act
def drone(t0, t1, g0, g1):
    d = t1 - t0; t = tt(d); k = t / d
    x = (np.sin(2 * np.pi * 41.2 * t) + 0.8 * np.sin(2 * np.pi * 43.65 * t) + 0.35 * np.sin(2 * np.pi * 82.4 * t + np.sin(t * 0.7)))
    x += 0.6 * norm(lp(noise(d), 110))
    env = (g0 + (g1 - g0) * k) * np.minimum(1, np.minimum(t / 0.8, (d - t) / 0.3).clip(0))
    put(amb, x * env, t0)

SIL0, SIL1 = E(20) + 0.04, S(21) - 0.03          # the silence before the twist
drone(0.0, SIL0, 0.10, 0.22)
drone(S(21), E(27) + 0.15, 0.28, 0.40)

# wind behind the bedroom window and the stairwell (soft, filtered)
def wind(t0, t1, g):
    d = t1 - t0; t = tt(d)
    x = lp(noise(d), 700) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.17 * t) * np.sin(2 * np.pi * 0.05 * t + 1))
    x += 0.5 * bp(noise(d), 280, 520) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + 2))
    put(amb, norm(x) * np.minimum(1, np.minimum(t / 0.6, (d - t) / 0.6).clip(0)), t0, g)
wind(0.0, S(3), 0.05)
wind(S(14) - 0.2, S(16), 0.035)

# bare bulb hum in the hallway scenes
def hum(t0, t1, g):
    d = t1 - t0; t = tt(d)
    x = np.sin(2 * np.pi * 100 * t) + 0.5 * np.sin(2 * np.pi * 200 * t) + 0.25 * np.sin(2 * np.pi * 300 * t) + 0.08 * hp(noise(d), 3000)
    put(amb, x * np.minimum(1, np.minimum(t / 0.2, (d - t) / 0.2).clip(0)), t0, g)
hum(S(3) - 0.1, S(4) - 0.1, 0.018)
hum(S(10) - 0.1, S(14) - 0.1, 0.018)
hum(S(16) - 0.1, SIL0, 0.012)

# clock ticks in the bedroom
t = S(2) - 0.1
while t < S(3) - 0.1: put(amb, hp(noise(0.02), 2500) * np.exp(-tt(0.02) / 0.004), t, 0.05); t += 0.5

# flashback: a slightly detuned music box (A minor), warm and far
mel = [440, 523.3, 659.3, 587.3, 523.3, 493.9, 440, 415.3, 440, 523.3, 493.9, 440]
t = S(4) - 0.1; k = 0
while t < S(10) - 0.5:
    put(amb, bell(mel[k % len(mel)] * (1 + 0.004 * np.sin(k))), t, 0.06); t += 0.42; k += 1

# strings of tension: high cluster from the peephole to the silence, low cluster in the reveal
pad(S(13), SIL0, [659.3, 698.5, 740.0], 0.022, vib=0.006, att=3, rel=0.05)
pad(S(21), E(27) + 0.1, [220, 233.1, 155.6], 0.05, vib=0.004, att=1.5, rel=0.1)
heartbeat(S(11), SIL0 - 0.1, 72, 118, 0.22)

# ---------- events ----------
# 0. two dull knocks on the bedroom door before "Тёма."
for tk in (0.08, 0.36): put(fx, knock('bedroom'), tk, 0.55)
put(amb, rustle(0.7), S(1) - 0.35, 0.05)                         # blanket
# 3. "А в дверь… стучат." three heavy knocks + floor creak
for k3 in (0.05, 0.3, 0.55): put(fx, knock('door'), E(3) + k3, 0.7)
put(fx, glitch(), E(3) + 0.05, 0.12)
put(amb, creak(0.8), S(3) + 0.1, 0.09)
# 7. "НИКОГДА" small hit + glitch
put(fx, hit(0.5), W(7, 0), 0.32); put(fx, glitch(0.15), W(7, 0), 0.13)
# 9. grandma's family knock on the table: two… and one
GK = [W(9, 0), W(9, 0) + 0.22, W(9, 2)]
for tk in GK: put(fx, knock('table'), tk, 0.5)
# 10. steps on the landing, then the handle rattles while mom speaks
put(amb, steps(3, 0.5), S(10) - 1.6, 0.12)
for k in range(9): put(fx, bp(noise(0.05), 1500, 6000) * np.exp(-tt(0.05) / 0.01), S(10) - 0.35 + k * 0.09, 0.07)
# 13. creak when he steps to the door
put(amb, creak(0.7, (480, 1000, 1900)), S(13) + 0.1, 0.1)
# 15. mom's family knock outside: two… and one
MK = [W(15, 1), W(15, 1) + 0.22, W(15, 3)]
for tk in MK: put(fx, knock('outside'), tk, 0.6)
# 16. "Не открывай." freeze: hit + glitch
put(fx, hit(0.7), S(16), 0.35); put(fx, glitch(0.18), S(16) + 0.02, 0.15)
# 17. phone buzz, message ping, typing
put(fx, phone_buzz(0.95), S(17) - 0.35, 0.16)
put(fx, ping(), S(18) - 0.2, 0.14)
put(fx, typing(1.8), S(18), 0.05)
put(fx, hit(0.6), W(18, 4), 0.28)                                  # "Оно у тебя за спиной"
# 19–20. a creak and a rustle behind him, the riser into the silence
put(amb, creak(1.0, (420, 900, 1700)), S(19) + 0.25, 0.12)
put(amb, rustle(0.6), S(20) + 0.2, 0.07)
put(fx, riser(2.2), SIL0 - 2.2, 0.22)
# the silence: only one shaky breath
put(fx, breath(min(1.05, SIL1 - SIL0)), SIL0 + 0.02, 0.08)
# 21. after the silence: a low boom
put(fx, hit(1.0), S(21) - 0.02, 0.45)
# 23. "Оно входит…" the big hit
put(fx, hit(1.0), W(23, 1), 0.45); put(fx, glitch(0.2), W(23, 1), 0.12)
# 24. VHS rewind, then the play click
put(fx, vhs(1.3), S(24) - 0.1, 0.13)
put(fx, hp(noise(0.03), 1000) * np.exp(-tt(0.03) / 0.006), S(24) + 1.2, 0.2)
# 27. "Привет, Тёма." the final sting, cut to black, then the family knock once more
put(fx, hit(1.0), E(27) + 0.05, 0.5); put(fx, glitch(0.2), E(27) + 0.03, 0.15)
FK = [E(27) + 0.3, E(27) + 0.52, E(27) + 1.0]
for tk in FK: put(fx, knock('door'), tk, 0.6)

# silence region: mute everything but the breath
a, b = int(SIL0 * SR), int(SIL1 * SR)
amb[a:b] = 0
fx_keep = np.zeros(N); put(fx_keep, breath(min(1.05, SIL1 - SIL0)), SIL0 + 0.02, 0.08)
fx[a:b] = fx_keep[a:b]
# after the final sting fades, only the knocks
f0 = int((E(27) + 0.25) * SR); amb[f0:] *= np.exp(-np.arange(N - f0) / (0.15 * SR))

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
print('ok', out_p, round(TOTAL, 2), 's | knocks gran', [round(x, 2) for x in GK], 'mom', [round(x, 2) for x in MK], 'final', [round(x, 2) for x in FK])
