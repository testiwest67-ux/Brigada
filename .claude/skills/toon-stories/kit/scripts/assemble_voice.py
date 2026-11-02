# Builds voice.wav + voice.json (same format as tts.py) from ready-made takes, e.g. ElevenLabs blocks:
# each line is cut out of a take, gets its own tempo / audio filter, and the lines are laid out with our own gaps.
# Word times inside a line are spread by syllables (vowels) over the voiced part of the line.
#
#   python scripts/assemble_voice.py <spec.json> <out_dir>
#
# spec.json: {"dir": "public/x/el", "lead": 0.6, "tail": 2.0, "tempo": 1.0,
#   "lines": [{"src": "A1.mp3", "t0": 0.0, "t1": 0.7, "say": "text", "sub": "optional", "who": "narrator",
#              "gap": 0.3, "tempo": 1.12, "fx": "ffmpeg filter"}]}
import json, os, re, subprocess, sys, wave
import numpy as np

FF = 'ffmpeg'
SR = 48000
VOW = set('аеёиоуыэюяaeiouy')


def run(*a): subprocess.run([FF, '-v', 'error', '-y', *a], check=True)


def read(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def words_of(text, x, t0):
    # voiced stretches of the line (20 ms frames over -40 dB), then words by syllable weight across them
    fr = int(SR * 0.02)
    n = len(x) // fr
    rms = np.array([np.sqrt(np.mean(x[i * fr:(i + 1) * fr] ** 2) + 1e-12) for i in range(n)])
    on = rms > 10 ** (-40 / 20)
    voiced = [i for i in range(n) if on[i]] or list(range(n))
    ws = text.split()
    wt = [max(1, sum(ch in VOW for ch in w.lower())) for w in ws]
    # phrases end on punctuation; if the line has as many voiced runs (pauses >= 0.2 s) as phrases, match them 1:1
    chunks, cur = [], []
    for k, w in enumerate(ws):
        cur.append(k)
        if re.search(r'[.…!?,»]$', w) and k < len(ws) - 1: chunks.append(cur); cur = []
    chunks.append(cur)
    runs, start = [], voiced[0]
    for a, b in zip(voiced, voiced[1:] + [10 ** 9]):
        if b - a > 10: runs.append(list(range(start, a + 1))); start = b
    if len(runs) != len(chunks): runs, chunks = [voiced], [list(range(len(ws)))]
    out = [None] * len(ws)
    for run, ch in zip(runs, chunks):
        tot = sum(wt[k] for k in ch); acc = 0
        for k in ch:
            idx = run[min(len(run) - 1, int(acc / tot * len(run)))]
            out[k] = {'w': ws[k], 't': round(t0 + idx * 0.02, 3)}; acc += wt[k]
    return out


def main(spec_p, out):
    S = json.load(open(spec_p, encoding='utf-8'))
    os.makedirs(out, exist_ok=True)
    t = S.get('lead', 0.6); parts, lines = [], []
    for i, ln in enumerate(S['lines']):
        src = os.path.join(S['dir'], ln['src'])
        tempo = ln.get('tempo', S.get('tempo', 1.0))
        af = f"atrim={ln['t0']}:{ln['t1']},asetpts=PTS-STARTPTS,aresample={SR},atempo={tempo}"
        af += ',afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse'
        if ln.get('fx'): af += ',' + ln['fx']
        wav = f'{out}/v{i:02d}.wav'
        run('-i', src, '-af', af, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', wav)
        x = read(wav); d = len(x) / SR
        sub = ln.get('sub') or ln['say']
        lines.append({'i': i, 'text': sub, 'start': round(t, 3), 'end': round(t + d, 3), 'who': ln.get('who', 'narrator'), 'words': words_of(sub, x, t)})
        parts.append((wav, t)); t += d + ln.get('gap', 0.3)
    total = round(t + S.get('tail', 2.0), 3)
    inputs = sum([['-i', p] for p, _ in parts], [])
    flt = ''.join(f'[{k}]adelay={int(st * 1000)}|{int(st * 1000)}[a{k}];' for k, (_, st) in enumerate(parts))
    flt += ''.join(f'[a{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[o]'
    run(*inputs, '-filter_complex', flt, '-map', '[o]', '-ar', str(SR), '-ac', '1', f'{out}/voice.wav')
    # loudness envelope per video frame (30 fps), 0..1: drives lip movement
    v = read(f'{out}/voice.wav'); hop = SR // 30
    env = [float(np.sqrt(np.mean(v[i:i + hop] ** 2))) for i in range(0, len(v), hop)]
    mx = max(env) or 1; env = [round(min(1.0, (e / mx) ** 0.6 * 1.15), 3) for e in env]
    json.dump({'voice': 'elevenlabs', 'total': total, 'lines': lines, 'env': env}, open(f'{out}/voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', total, 's,', len(lines), 'lines')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
