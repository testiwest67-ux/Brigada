# Own voice: a recording of the user's voice -> word timings in the same voice.json format as tts.py,
# so subtitles, acting and sound cues work exactly as with edge-tts or ElevenLabs.
#
#   python scripts/align.py <recording> <out_dir> [--lines lines.json] [--lang ru] [--model small] [--lead 0.3] [--tail 1.2]
#     -> out_dir/voice.wav (48 kHz mono) + out_dir/voice.json
#
# <recording>: any file ffmpeg reads (wav, mp3, m4a, ogg, mp4 from the phone).
# --lines: the script (the same lines.json as for tts.py). Recommended: then lines and subtitles follow the script
#          (exact spelling, `sub` text with digits), and Whisper only gives the timing. Without it, lines = Whisper phrases.
# --model: tiny | base | small (default, good for Russian on a usual PC) | medium | large-v3 (slow on CPU).
# Needs: pip install faster-whisper   (the model downloads itself on the first run: small ~ 0.5 GB)
import argparse, difflib, json, os, re, subprocess, sys
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--lines'); ap.add_argument('--lang', default='ru'); ap.add_argument('--model', default='small')
ap.add_argument('--lead', type=float, default=0.3, help='silence added before the first word, s')
ap.add_argument('--tail', type=float, default=1.2, help='silence after the last word, s')
a = ap.parse_args()

try:
    from faster_whisper import WhisperModel
except ImportError:
    sys.exit('faster-whisper is not installed. Run:  pip install faster-whisper   (then run this command again)')

if not os.path.exists(a.audio): sys.exit(f'recording not found: {a.audio}')
os.makedirs(a.out, exist_ok=True)


def decode(path, sr):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(sr), '-'], capture_output=True)
    if r.returncode != 0: sys.exit(f'cannot read audio: {path}\n{r.stderr.decode(errors="ignore")[-400:]}')
    return np.frombuffer(r.stdout, dtype=np.float32)


# 1. Recognise words with timings (decoded by ffmpeg ourselves: no PyAV problems).
print(f'whisper {a.model}, language {a.lang} ...')
model = WhisperModel(a.model, device='cpu', compute_type='int8', cpu_threads=max(1, min(4, (os.cpu_count() or 2) // 3)))
segs, _ = model.transcribe(decode(a.audio, 16000), language=a.lang, word_timestamps=True, vad_filter=True, beam_size=5)
segs = list(segs)
heard = [{'w': w.word.strip(), 't': float(w.start), 'e': float(w.end), 'seg': si} for si, s in enumerate(segs) for w in (s.words or []) if w.word.strip()]
if not heard: sys.exit('no speech found in the recording')

# 2. Cut the leading silence so the video starts on time; keep `lead` seconds before the first word.
shift = max(0.0, heard[0]['t'] - a.lead)
for w in heard: w['t'] = round(w['t'] - shift, 3); w['e'] = round(w['e'] - shift, 3)
src = decode(a.audio, SR)[int(shift * SR):]
total = round(heard[-1]['e'] + a.tail, 3)  # longer recording is trimmed, shorter one is padded with silence
raw = f'{a.out}/voice.raw'
src.tofile(raw)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', raw,
                '-af', f'apad=whole_dur={total},atrim=0:{total}', '-ar', str(SR), '-ac', '1', f'{a.out}/voice.wav'], check=True)
os.remove(raw)


def norm(s):
    return re.sub(r'[^\w]', '', s.lower().replace('ё', 'е'))


lines = []
if a.lines:
    # 3a. Script given: match script words to heard words, take timings from the matches, interpolate the rest.
    cfg = json.load(open(a.lines, encoding='utf-8'))
    script = []  # (line index, word in `say`, word to show)
    for i, ln in enumerate(cfg['lines']):
        say = ln['say'].split(); sub = (ln.get('sub') or ln['say']).split()
        for k, w in enumerate(say): script.append((i, w, sub[k] if len(sub) == len(say) else w))
    sm = difflib.SequenceMatcher(None, [norm(s[1]) for s in script], [norm(h['w']) for h in heard], autojunk=False)
    t = [None] * len(script); e = [None] * len(script)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): t[blk.a + k] = heard[blk.b + k]['t']; e[blk.a + k] = heard[blk.b + k]['e']
    matched = sum(x is not None for x in t)
    known = [k for k, x in enumerate(t) if x is not None]
    if not known: sys.exit('the recording does not match the script at all: check the file or run without --lines')
    for k in range(len(script)):  # unmatched words: spread evenly between the neighbours
        if t[k] is not None: continue
        lo = max([j for j in known if j < k], default=None); hi = min([j for j in known if j > k], default=None)
        if lo is None: t[k] = max(0.0, t[hi] - 0.3 * (hi - k)); e[k] = t[k] + 0.25
        elif hi is None: t[k] = e[lo] + 0.3 * (k - lo); e[k] = t[k] + 0.25
        else:
            t[k] = e[lo] + (t[hi] - e[lo]) * (k - lo) / (hi - lo); e[k] = t[k] + 0.2
    for i, ln in enumerate(cfg['lines']):
        ks = [k for k, s in enumerate(script) if s[0] == i]
        if not ks: continue
        lines.append({'i': len(lines), 'text': ln.get('sub') or ln['say'], 'start': round(t[ks[0]], 3), 'end': round(max(e[ks[-1]], t[ks[-1]]), 3),
                      'words': [{'w': script[k][2], 't': round(t[k], 3)} for k in ks]})
    rate = matched / len(script)
    print(f'matched {matched}/{len(script)} words ({rate:.0%})')
    if rate < 0.8: print('WARNING: the recording and the script differ a lot. Check that the right file was used, or re-record.')
else:
    # 3b. No script: one line per Whisper phrase.
    for si in sorted({h['seg'] for h in heard}):
        ws = [h for h in heard if h['seg'] == si]
        lines.append({'i': len(lines), 'text': ' '.join(w['w'] for w in ws), 'start': ws[0]['t'], 'end': ws[-1]['e'],
                      'words': [{'w': w['w'], 't': w['t']} for w in ws]})

json.dump({'voice': 'own', 'total': total, 'lines': lines}, open(f'{a.out}/voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok own voice', total, 's,', len(lines), 'lines ->', f'{a.out}/voice.json')
