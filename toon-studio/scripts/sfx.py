# Tonal sound bed for toon episodes (no noise at all): chord pads + small events + optional music track,
# ducked under the voice and mixed to -14 LUFS / -1.5 dBTP.
#
#   python scripts/sfx.py <voice.wav> <voice.json> <cues.json> <out_dir> <mix.wav>
#
# cues.json: {"total": s | "auto",
#   "pads":   [{"t0", "t1", "notes": [Hz...], "gain", "attack", "release"}],
#   "events": [{"type": "tick"|"thump"|"notes"|"glide", "t", "gain", ...}],
#   "music":  {"file": "public/music/track.mp3", "gain": 0.2, "t0": 0, "t1": "end", "from": 0, "loop": true, "fade": 2}
#             (or a list of such pieces, e.g. to stop the track before the big hit and start it again after),
#   "duck":   {"db": 7, "music_db": 9, "smooth": 0.12} | false}
#   tick: short click (f1, f2, decay) | thump: low hit (f0, f1, decay) | notes: soft bell notes (notes, step, decay) | glide: tonal swell (f0, f1, dur)
# Times: seconds, or relative to the voice so nothing drifts after re-voicing:
#   "@word+0.2" (first word starting like that), "line:4-0.15" (start of line 4), "end" (end of the episode).
# Ducking: pads go down by duck.db and music by duck.music_db wherever the voice is loud, with a smooth
# 80-150 ms envelope (sidechain-like). Events (tick, thump, notes, glide) are short accents and are not ducked.
# music.file: relative to the current folder or to the folder of cues.json; mp3/wav/ogg/m4a, anything ffmpeg reads.
import json, os, re, subprocess, sys, wave
import numpy as np

SR = 48000
if len(sys.argv) < 6: sys.exit('usage: python scripts/sfx.py <voice.wav> <voice.json> <cues.json> <out_dir> <mix.wav>')
voice_p, vjson_p, cues_p, out, mix_p = sys.argv[1:6]
os.makedirs(out, exist_ok=True)
V = json.load(open(vjson_p, encoding='utf-8'))
C = json.load(open(cues_p, encoding='utf-8'))
if C.get('total', 'auto') == 'auto': C['total'] = V['total']


def T(x):
    if not isinstance(x, str): return x
    m = re.match(r'^(@[^+\-]+|line:\d+|end)([+\-][\d.]+)?$', x.strip())
    if not m: sys.exit(f'bad time: {x}')
    base, off = m.group(1), float(m.group(2) or 0)
    if base == 'end': return C['total'] + off
    if base.startswith('line:'): return V['lines'][int(base[5:])]['start'] + off
    w = base[1:].lower()
    for ln in V['lines']:
        for wd in ln['words']:
            if wd['w'].lower().strip('.,!?…:;«»"').startswith(w): return wd['t'] + off
    sys.exit(f'word not found in voice: {w}')


def decode(path, ch):
    """Any audio file -> float array (samples, ch) at SR, via ffmpeg."""
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True)
    if r.returncode != 0: sys.exit(f'cannot read audio: {path}\n{r.stderr.decode(errors="ignore")[-400:]}')
    return np.frombuffer(r.stdout, dtype=np.float32).reshape(-1, ch).astype(np.float64)


def fit(x, n):
    return x[:n] if len(x) >= n else np.concatenate([x, np.zeros((n - len(x),) + x.shape[1:])])


def box(x, n):
    """Centered moving average of length n, same length as x."""
    n = max(1, int(n))
    if len(x) <= n: return np.full(len(x), x.mean() if len(x) else 0.0)
    c = np.cumsum(np.concatenate([np.zeros(1), x]))
    y = (c[n:] - c[:-n]) / n
    pad = n // 2
    return np.concatenate([np.full(pad, y[0]), y, np.full(len(x) - len(y) - pad, y[-1])])


for p in C.get('pads', []): p['t0'], p['t1'] = T(p['t0']), T(p['t1'])
for e in C.get('events', []): e['t'] = T(e['t'])
N = int(C['total'] * SR)
t = np.arange(N) / SR
pads = np.zeros(N)
fx = np.zeros(N)


def place(sig, at):
    i = max(0, int(at * SR)); j = min(N, i + len(sig))
    if j > i: fx[i:j] += sig[:j - i]


def env_ad(x, a, d):
    return np.where(x < a, x / max(a, 1e-6), np.exp(-(x - a) / d))


for p in C.get('pads', []):
    a, r = p.get('attack', 1.5), p.get('release', 1.2)
    amp = np.clip((t - p['t0']) / a, 0, 1) * np.clip((p['t1'] - t) / r, 0, 1)
    sig = np.zeros(N)
    for k, f0 in enumerate(p['notes']):
        sig += (np.sin(2 * np.pi * f0 * t + k) + 0.15 * np.sin(4 * np.pi * f0 * t)) * (1 + 0.1 * np.sin(2 * np.pi * (0.2 + 0.07 * k) * t)) / (1 + 0.3 * k)
    pads += sig / len(p['notes']) * amp * p.get('gain', 0.05)

for e in C.get('events', []):
    g, at = e.get('gain', 0.1), e['t']
    if e['type'] == 'tick':
        x = np.arange(int(0.08 * SR)) / SR
        place(g * (np.sin(2 * np.pi * e.get('f1', 2100) * x) + 0.6 * np.sin(2 * np.pi * e.get('f2', 3300) * x)) * env_ad(x, 0.0005, e.get('decay', 0.012)), at)
    elif e['type'] == 'thump':
        x = np.arange(int(0.9 * SR)) / SR
        f = e.get('f0', 70) + (e.get('f1', 40) - e.get('f0', 70)) * np.clip(x / 0.4, 0, 1)
        place(g * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(x, 0.006, e.get('decay', 0.22)), at)
    elif e['type'] == 'notes':
        for k, f0 in enumerate(e['notes']):
            x = np.arange(int(0.8 * SR)) / SR
            place(g * (np.sin(2 * np.pi * f0 * x) + 0.2 * np.sin(4 * np.pi * f0 * x)) * env_ad(x, 0.006, e.get('decay', 0.16)), at + k * e.get('step', 0.1))
    elif e['type'] == 'glide':
        d = e.get('dur', 1.2); x = np.arange(int(d * SR)) / SR
        f = e['f0'] + (e['f1'] - e['f0']) * x / d
        place(g * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / d) ** 2, at)

# ---------- voice and the ducking envelope ----------
voice = fit(decode(voice_p, 1)[:, 0], N)
D = C.get('duck', {})
duck_on = D is not False
D = D if isinstance(D, dict) else {}
lvl = 20 * np.log10(np.sqrt(box(voice ** 2, int(0.05 * SR)) + 1e-12))  # 50 ms RMS, dBFS
loud = lvl[lvl > -70]
thr = (np.percentile(loud, 90) - 24) if len(loud) else 0.0  # "speaking" threshold, relative to the loud parts of this voice
talk = np.clip((lvl - (thr - 6)) / 6, 0, 1)  # soft knee: 0 = pause, 1 = speech
sm = int(np.clip(D.get('smooth', 0.12), 0.08, 0.15) * SR)
talk = np.clip(box(box(talk, sm), sm), 0, 1)  # smoothed twice: no pumping, no clicks
db_pads, db_music = D.get('db', 7), D.get('music_db', D.get('db', 7) + 2)
duck_pads = 10 ** (-db_pads * talk / 20) if duck_on else np.ones(N)
duck_music = 10 ** (-db_music * talk / 20) if duck_on else np.ones(N)

bed = np.repeat((pads * duck_pads)[:, None], 2, axis=1) + fx[:, None]

# ---------- optional music track (the user's file) ----------
MUS = C.get('music') or []
for M in (MUS if isinstance(MUS, list) else [MUS]):  # one track, or a list of pieces (e.g. a pause on the big hit)
    if not M.get('file'): continue
    mp = M['file']
    if not os.path.exists(mp): mp = os.path.join(os.path.dirname(os.path.abspath(cues_p)), M['file'])
    if not os.path.exists(mp): sys.exit(f'music file not found: {M["file"]}')
    trk = decode(mp, 2)[int(M.get('from', 0) * SR):]
    t0, t1 = T(M.get('t0', 0)), T(M.get('t1', 'end'))
    i0, i1 = max(0, int(t0 * SR)), min(N, int(t1 * SR))
    n = max(0, i1 - i0)
    if len(trk) and n:
        if M.get('loop', True) and len(trk) < n: trk = np.tile(trk, (n // len(trk) + 1, 1))
        seg = fit(trk, n)
        k = np.arange(n) / SR
        seg = seg * (np.clip(k / 0.5, 0, 1) * np.clip((n / SR - k) / max(M.get('fade', 2.0), 0.01), 0, 1))[:, None]
        bed[i0:i1] += seg * M.get('gain', 0.2) * duck_music[i0:i1, None]
        print('music', os.path.basename(mp), f'{t0:.1f}-{t1:.1f} s, gain', M.get('gain', 0.2))

bed *= np.clip((C['total'] - t) / 0.8, 0, 1)[:, None]


def write_wav(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(x.shape[1]); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


write_wav(f'{out}/fx.wav', bed)
mix = bed + voice[:, None]
peak = np.max(np.abs(mix)) if N else 0
if peak > 0.95: mix *= 0.95 / peak  # loudnorm below sets the final level anyway
pre = f'{out}/premix.wav'
write_wav(pre, mix)
if duck_on: print(f'ducking: pads -{db_pads} dB, music -{db_music} dB under the voice (voice active {100 * np.mean(talk > 0.5):.0f}% of the time)')

r = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af', ln, '-ar', str(SR), mix_p], check=True)
print('ok', m['input_i'], '->', mix_p)
