# Free local voice-over through VoiceStudio (OmniVoice, http://127.0.0.1:3900) with pronunciation control:
#   1) words from scripts/pronounce_ru.json are re-spelled before synthesis (мачете → мачэтэ);
#   2) every phrase is synthesised up to --takes times (different seeds);
#   3) each take is transcribed back with Whisper (VoiceStudio's own ASR) and compared with the ORIGINAL text;
#      the take with the best word match wins; an exact match (no word missing or extra) stops early;
#   4) phrases that never reach --good are listed in the report for a human ear.
# Output: one wav per phrase + a spec for scripts/assemble_voice.py (then voice_check.py as usual).
#
#   python3 scripts/vs_tts.py <главы.json | lines.json> <out_dir> <spec.json> [--voice voices.json] [--takes 3]
#
# Input: главы.json [{"chapter", "text"}] (split into sentences) or {"lines": [{"say", "who"?, "gap"?}]}.
# voices.json: {"narrator": {"instruct": "male, middle-aged, low pitch", "effect_preset": "warm", "speed": 0.93, ...}}
import argparse, difflib, json, os, re, sys, time, urllib.request, uuid, wave

API = 'http://127.0.0.1:3900'
HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_VOICE = {'instruct': 'male, middle-aged, low pitch', 'effect_preset': 'warm', 'denoise': 'false',
                 'num_step': '64', 'speed': '0.93', 'language': 'Russian'}
SEEDS = [21, 7, 3, 42, 99]


def multipart(fields, files=None):
    b = uuid.uuid4().hex
    out = []
    for k, v in fields.items():
        out += [f'--{b}', f'Content-Disposition: form-data; name="{k}"', '', str(v)]
    body = ('\r\n'.join(out) + '\r\n').encode()
    for k, path in (files or {}).items():
        body += (f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{os.path.basename(path)}"\r\n'
                 f'Content-Type: audio/wav\r\n\r\n').encode() + open(path, 'rb').read() + b'\r\n'
    body += f'--{b}--\r\n'.encode()
    return body, f'multipart/form-data; boundary={b}'


def post(path, fields, files=None, timeout=900):
    body, ct = multipart(fields, files)
    req = urllib.request.Request(API + path, data=body, headers={'Content-Type': ct})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def respell(text, dic):
    for w, s in dic.items():
        if w.startswith('_'): continue
        text = re.sub(rf'(?<![\w-]){re.escape(w)}(?![\w-])', lambda m: s.capitalize() if m.group(0)[0].isupper() else s,
                      text, flags=re.IGNORECASE)
    return text


# Whisper writes numbers as digits ("1839"), the script has them as words ("тысяча восемьсот тридцать девятый"):
# a run of number words and a run of digits both collapse into one token "#".
NUM = re.compile(r'^(ноль|нул|один|одн|два|две|двух|двум|тр[её]х|три|четыр|пят|шест|сем|восем|девят|десят|сорок|девяност'
                 r'|сто|ста|сот|двест|трист|тысяч|миллион|миллиард|полтор|перв|втор|трет|четв[её]рт|сотн|сотый|тысячн)')


def norm(t):
    t = t.lower().replace('ё', 'е')
    out = []
    for w in re.findall(r'[а-яa-z0-9]+', t):
        tok = '#' if (w.isdigit() or NUM.match(w)) else w
        if tok == '#' and out and out[-1] == '#': continue
        out.append(tok)
    return out


def score(want, got):
    a, b = norm(want), norm(got)
    if not a: return 1.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def sentences(text):
    parts = re.split(r'(?<=[.!?…])\s+', text.strip())
    return [p for p in parts if p]


def dur(p):
    with wave.open(p) as w: return w.getnframes() / w.getframerate()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out_dir'); ap.add_argument('spec')
    ap.add_argument('--voice'); ap.add_argument('--takes', type=int, default=3)
    ap.add_argument('--good', type=float, default=1.0)
    ap.add_argument('--dict', default=os.path.join(HERE, 'pronounce_ru.json'))
    ap.add_argument('--only', help='comma list of line numbers to redo')
    ap.add_argument('--gap', type=float, default=0.45); ap.add_argument('--chapter-gap', type=float, default=3.0)
    a = ap.parse_args()

    dic = json.load(open(a.dict, encoding='utf-8')) if os.path.exists(a.dict) else {}
    voices = json.load(open(a.voice, encoding='utf-8')) if a.voice else {}
    src = json.load(open(a.src, encoding='utf-8'))
    lines = []
    if isinstance(src, list):
        for ch in src:
            for i, s in enumerate(sentences(ch['text'])):
                lines.append({'say': s, 'who': 'narrator', 'chapter': ch.get('chapter') if i == 0 else None})
    else:
        lines = src['lines']
    os.makedirs(a.out_dir, exist_ok=True)
    only = {int(x) for x in a.only.split(',')} if a.only else None
    rep_path = os.path.join(a.out_dir, 'report.json')
    rep = json.load(open(rep_path, encoding='utf-8')) if os.path.exists(rep_path) else {}

    for n, ln in enumerate(lines):
        out = os.path.join(a.out_dir, f'L{n:03d}.wav')
        if only is not None and n not in only: continue
        if only is None and os.path.exists(out) and str(n) in rep: continue
        v = {**DEFAULT_VOICE, **voices.get(ln.get('who', 'narrator'), {})}
        text = respell(ln['say'], dic)
        best = (-1, None, '')
        for k in range(a.takes):
            seed = SEEDS[k % len(SEEDS)] + (n if k else 0)
            tmp = out + f'.take{k}.wav'
            t0 = time.time()
            open(tmp, 'wb').write(post('/generate', {**v, 'text': text, 'seed': seed}))
            got = json.loads(post('/v1/audio/transcriptions', {'model': 'whisper-1', 'language': 'ru'}, {'file': tmp})).get('text', '')
            s = score(ln['say'], got)
            print(f'{n:3d} take{k} {s:.2f} {time.time() - t0:4.0f}s | {ln["say"][:50]} → {got[:50]}', flush=True)
            if s > best[0]:
                if best[1] and os.path.exists(best[1]): os.remove(best[1])
                best = (s, tmp, got)
            else:
                os.remove(tmp)
            if s >= a.good: break
        os.replace(best[1], out)
        rep[str(n)] = {'say': ln['say'], 'spoken_as': text, 'heard': best[2], 'score': round(best[0], 3)}
        json.dump(rep, open(rep_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    spec = {'dir': a.out_dir, 'lead': 0.8, 'tail': 2.0, 'tempo': 1.0, 'lines': []}
    for n, ln in enumerate(lines):
        p = os.path.join(a.out_dir, f'L{n:03d}.wav')
        nxt = lines[n + 1] if n + 1 < len(lines) else None
        gap = ln.get('gap', a.chapter_gap if nxt and nxt.get('chapter') else a.gap)
        e = {'src': f'L{n:03d}.wav', 't0': 0, 't1': round(dur(p), 3), 'say': ln['say'], 'gap': gap, 'who': ln.get('who', 'narrator')}
        if ln.get('chapter'): e['chapter'] = ln['chapter']
        spec['lines'].append(e)
    json.dump(spec, open(a.spec, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    bad = [(k, r) for k, r in rep.items() if r['score'] < a.good]
    print(f'\nготово: {len(lines)} фраз, спорных {len(bad)} (порог {a.good})')
    for k, r in sorted(bad, key=lambda x: x[1]['score']):
        print(f'  №{k} {r["score"]:.2f}  «{r["say"]}» → услышано «{r["heard"]}»')


if __name__ == '__main__':
    main()
