# «Рейс 19» sound: voice + vidIQ music (ducked under the voice, gone in the radio silence) + ElevenLabs effects,
# every cue tied to the voice words (same S/E/W as src/flight19/Shots.tsx and Report.tsx). Two-pass loudnorm −14 LUFS.
#   python scripts/flight19_sound.py public/reys-19/voice.wav public/reys-19/voice.json public/reys-19/mix.wav
import json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from flight_report_sfx import scribble, stamp as synth_stamp, CONCLUSION, CHAR_DT  # noqa: E402

SR = 48000
# mix levels (v1: music 0.3 ducked 55 %, ambience/effects not ducked, effects ×0.8 → words were masked)
MUS_GAIN, DUCK_MUS = 0.3, 0.87   # −18 dB under the voice
AMB_GAIN, DUCK_AMB = 0.6, 0.75   # ambience beds −4.5 dB overall, −12 dB more under the voice
FX_GAIN, DUCK_FX = 0.5, 0.75     # effects −6 dB overall, −12 dB more under the voice (hits in pauses stay full)
DEAD_AIR = 0.22                  # empty-air static in the radio silence
LEVEL_DB = 6                     # phrase-by-phrase voice levelling, at most ±6 dB toward the median phrase
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'reys-19')


def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)


SFX = {}
def sfx(name):
    if name not in SFX: SFX[name] = load(os.path.join(ROOT, 'sfx', name + '.mp3'))
    return SFX[name]


def put(buf, t, x, g=1.0, fade_in=0.005, fade_out=0.05, dur=None):
    if dur is not None: x = x[:int(dur * SR)]
    x = x.copy()
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: x[:fi] *= np.linspace(0, 1, min(fi, len(x)))[:len(x[:fi])]
    if fo and len(x) > fo: x[-fo:] *= np.linspace(1, 0, fo)
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x)); buf[i:j] += x[:j - i] * g


def loop(buf, name, t0, t1, g, fade=0.4):
    x = sfx(name); n = int((t1 - t0) * SR)
    if n <= 0: return
    reps = np.tile(x, n // len(x) + 2)[:n]
    put(buf, t0, reps, g, fade_in=fade, fade_out=fade)


def main(vwav, vjson, out):
    V = json.load(open(vjson, encoding='utf-8')); L = V['lines']; TOTAL = V['total']
    S = lambda i: L[i]['start']; E = lambda i: L[i]['end']; W = lambda i, k: L[i]['words'][k]['t']
    voice = load(vwav)
    n = int(TOTAL * SR) + SR
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    # level each phrase by its active-speech RMS (narrator lines sat ~8 dB under Taylor's), short crossfades at edges
    def act_db(x):
        b = x[:len(x) // 960 * 960].reshape(-1, 960); r = np.sqrt((b ** 2).mean(1)); r = r[r > 10 ** (-45 / 20)]
        return 20 * np.log10(np.sqrt((r ** 2).mean())) if len(r) else None
    lv = [act_db(voice[int(S(i) * SR):int(E(i) * SR)]) for i in range(len(L))]
    ref = np.median([x for x in lv if x is not None])
    gain = np.ones(n)
    for i, x in enumerate(lv):
        if x is None: continue
        g = 10 ** (np.clip(ref - x, -LEVEL_DB, LEVEL_DB) / 20)
        a, b = int((S(i) - 0.12) * SR), int((E(i) + 0.12) * SR)
        gain[max(0, a):b] = g
    gain = np.convolve(gain, np.ones(SR // 20) / (SR // 20), mode='same')
    voice = voice * gain
    print('voice levelling dB:', ' '.join(f"{20*np.log10(10**(np.clip(ref-x,-LEVEL_DB,LEVEL_DB)/20)):+.0f}" if x is not None else '0' for x in lv))
    fx = np.zeros(n); amb = np.zeros(n)

    # ---- ambience beds ----
    loop(amb, 'waves', S(2) - 0.1, S(3) - 0.15, 0.35)
    loop(amb, 'waves', S(8) - 0.1, S(9) - 0.1, 0.3)
    loop(amb, 'waves', S(20) - 0.1, S(23) - 0.1, 0.3)
    loop(amb, 'waves', S(24) - 0.1, S(26) - 0.15, 0.35)
    loop(amb, 'waves', S(34) - 0.1, S(35) - 0.1, 0.2)
    loop(amb, 'cockpit', S(9) - 0.1, S(10) - 0.1, 0.22)
    loop(amb, 'cockpit', S(11) - 0.1, S(13) - 0.1, 0.25)
    loop(amb, 'cockpit', S(18) - 0.1, S(19) - 0.1, 0.18)
    loop(amb, 'storm', S(16) - 0.1, S(19) - 0.1, 0.17)
    loop(amb, 'storm', S(32) - 0.1, S(33) - 0.1, 0.18)
    for i in (3, 11, 18):  # radio hiss under Taylor's lines
        loop(amb, 'radio', S(i) - 0.25, E(i) + 0.25, 0.08, fade=0.15)
    for a, b in ((S(4) - 0.1, S(5) - 0.1), (S(6) - 0.1, S(7) - 0.1), (S(13) - 0.1, S(14) - 0.1)):
        loop(amb, 'morse', a, b, 0.12, fade=0.3)

    # ---- one-shots ----
    put(fx, S(0) - 0.05, sfx('laser'), 0.35)
    put(fx, S(0) - 0.15, sfx('bass'), 0.55, fade_out=0.3)
    g0, g1 = S(1), W(1, 6)
    for i in range(6): put(fx, g0 + (i + 0.5) / 6 * (g1 - g0), sfx('vanish'), 0.22)
    put(fx, W(1, 8), sfx('bass'), 0.55, fade_out=0.3)
    put(fx, S(3) - 0.15, sfx('bass'), 0.7, fade_out=0.3)
    put(fx, S(3) - 0.2, sfx('radio'), 0.45, dur=1.0)
    put(fx, S(5) - 0.1, sfx('bass'), 0.5, fade_out=0.3)
    for t in (S(4) - 0.1, S(6) - 0.1, S(7) - 0.1, S(12) - 0.1, S(14) - 0.1, S(29) - 0.1, S(32) - 0.1, S(33) - 0.1, S(34) - 0.1):
        put(fx, t - 0.12, sfx('whoosh'), 0.3)
    put(fx, S(7) + 0.2, sfx('flyby'), 0.55, fade_out=0.8)
    put(fx, S(10) + 0.1, sfx('radio'), 0.55, dur=1.6, fade_out=0.4)
    put(fx, S(14) - 0.55, sfx('laser'), 0.3, dur=0.6, fade_out=0.15)
    put(fx, S(16) - 6.1, sfx('riser'), 0.28)
    put(fx, S(20) + 0.1, sfx('flyby'), 0.45, fade_out=0.8)
    put(fx, W(22, 6), sfx('explosion'), 0.4, fade_out=0.8)
    put(fx, S(23) - 0.25, sfx('bass'), 0.45, fade_out=0.3)
    put(fx, S(24) + 0.6, sfx('horn'), 0.2, fade_out=0.6)
    # the report (same cues as REPORT_CUES)
    typ, env, strike, stamp_t = W(26, 2) - 0.08, W(27, 0) + 0.05, W(27, 6) - 0.05, S(28) + 0.02
    put(fx, typ, sfx('typewriter'), 0.5, dur=len(''.join(CONCLUSION)) * CHAR_DT + 0.6, fade_out=0.2)
    put(fx, env, sfx('envelope'), 9.0, fade_out=0.3)
    put(fx, strike, scribble(0.32), 0.3); put(fx, strike + 0.3, scribble(0.32), 0.3)
    put(fx, stamp_t, synth_stamp(), 0.5, fade_out=0.3)
    put(fx, stamp_t, sfx('bass'), 0.3, fade_out=0.3)
    put(fx, S(31) - 0.2, sfx('bass'), 0.45, fade_out=0.3)

    # ---- music: fade in, duck under the voice, gone in the radio silence ----
    mus = load(os.path.join(ROOT, 'music', 'vidiq-mystery.wav'))
    mus = np.pad(mus, (0, max(0, n - len(mus))))[:n] / (np.abs(mus).max() + 1e-9)
    tt = np.arange(n) / SR
    hop = SR // 50
    env_v = np.repeat([np.sqrt(np.mean(voice[i:i + hop] ** 2)) for i in range(0, n, hop)], hop)[:n]
    env_v = np.convolve(env_v, np.ones(SR // 5) / (SR // 5), mode='same')
    # speech presence 0..1: fast attack, ~0.35 s release, so beds come back only in real pauses
    sp = np.clip((20 * np.log10(env_v + 1e-9) + 50) / 8, 0, 1)  # −50 dBFS → 0, −42 dBFS and up → 1
    rel = np.exp(-1 / (0.35 * SR)); hold = np.empty(n); acc = 0.0
    for i in range(0, n, hop):  # per 20 ms block
        x = sp[i:i + hop].max(); acc = x if x > acc else acc * rel ** hop; hold[i:i + hop] = acc
    sp = hold
    # under the voice: music −14 dB, ambience −10 dB, effects −8 dB (v2: effects were masking words)
    duck = 1 - DUCK_MUS * sp
    mg = MUS_GAIN * duck * np.clip(tt / 2.5, 0.25, 1)
    sil0, sil1 = E(19) + 0.05, S(20) - 0.25
    gate = np.ones(n)
    gate[(tt > sil0) & (tt < sil1)] = 0
    a = (tt >= sil0 - 0.15) & (tt <= sil0); gate[a] = np.linspace(1, 0, a.sum())
    b = (tt >= sil1) & (tt <= sil1 + 0.8); gate[b] = np.linspace(0, 1, b.sum())
    fin = (tt > TOTAL - 2.5); gate[fin] *= np.linspace(1, 0, fin.sum())
    music = mus * mg * gate
    amb *= gate * (1 - DUCK_AMB * sp) * AMB_GAIN
    fx_gate = gate.copy(); fx_gate[(tt > sil0) & (tt < sil1)] = 0
    fx *= fx_gate * (1 - DUCK_FX * sp) * FX_GAIN

    # the radio silence is an EMPTY AIR, not dead digital silence (user: «пропажа звука» at 1:04–1:06):
    # quiet band-limited static from "замолкает" until just before the next line, cut off sharply
    dead = np.zeros(n)
    loop(dead, 'radio', sil0 - 0.1, S(20) - 0.08, DEAD_AIR, fade=0.25)
    k = int((S(20) - 0.08) * SR); dead[k - int(0.04 * SR):k] *= np.linspace(1, 0, int(0.04 * SR))
    mix = voice * 1.0 + music + amb + fx + dead
    if os.environ.get('STEMS'):  # voice / background before loudnorm, for the voice-vs-background check
        for name, x in (('voice', voice), ('bg', music + amb + fx), ('music', music), ('amb', amb), ('fx', fx)):
            with wave.open(os.path.join(os.environ['STEMS'], name + '.wav'), 'w') as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
                w.writeframes((np.clip(x / 2, -1, 1) * 32767).astype(np.int16).tobytes())
    raw = out.replace('.wav', '.raw.wav')
    with wave.open(raw, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix / max(1.0, np.abs(mix).max() / 0.95), -1, 1) * 32767).astype(np.int16).tobytes())
    # two-pass loudnorm
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-ac', '2', out], check=True)
    print('ok', out, round(TOTAL, 2), 's; silence', round(sil0, 2), '–', round(sil1, 2))


if __name__ == '__main__':
    main(*sys.argv[1:4])
