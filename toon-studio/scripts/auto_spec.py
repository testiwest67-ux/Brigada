# Builds an assemble_voice.py spec automatically from long ElevenLabs takes (one take per chapter):
# each take is split into sentences by finding its pauses and matching them to the text (dynamic programming over
# cumulative syllable share), so a 15-minute voiceover needs no manual cutting.
#
#   python scripts/auto_spec.py <chapters.json> <takes_dir> <spec_out.json> [--gap 0.35] [--chapter-gap 1.6]
#
# chapters.json: [{"chapter": "0. Крючок", "text": "...", "src": "ch0.mp3"}, ...]  (src defaults to ch<N>.mp3)
# Output spec lines carry "chapter" so the episode can put a title card at every chapter start.
import argparse, json, os, re, subprocess
import numpy as np

SR = 16000
VOW = set('аеёиоуыэюяіїєaeiouy')
syl = lambda s: max(1, sum(ch in VOW for ch in s.lower()))


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def sentences(text):
    # split after . ? ! … (and the closing quote that may follow), keep the punctuation with the sentence
    parts = re.split(r'(?<=[.?!…])»?\s+', text.strip())
    out = []
    for p in parts:
        p = p.strip()
        if p: out.append(p)
    return out


def pauses(x, min_len=0.16, db=-42):
    fr = int(SR * 0.01)
    n = len(x) // fr
    rms = np.sqrt(np.mean(x[:n * fr].reshape(n, fr) ** 2, axis=1) + 1e-12)
    quiet = 20 * np.log10(rms) < db
    res, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if (j - i) * 0.01 >= min_len and i > 0 and j < n: res.append(((i + j) / 2 * 0.01, (j - i) * 0.01, i * 0.01, j * 0.01))
            i = j
        else: i += 1
    # speech start / end of the whole take
    voiced = np.where(~quiet)[0]
    return res, voiced[0] * 0.01, (voiced[-1] + 1) * 0.01


def match(sents, ps, t_start, t_end):
    # choose len(sents)-1 pauses: every sentence should be spoken at about the chapter's average syllable rate
    # (log-duration error per sentence), and sentence ends usually sit on longer pauses than commas
    k = len(sents) - 1
    if k == 0: return []
    w = [syl(s) for s in sents]
    m = len(ps)
    if m < k: raise SystemExit(f'too few pauses ({m}) for {len(sents)} sentences')
    speech = (t_end - t_start) - sum(p[1] for p in ps) * 0.5
    rate = sum(w) / max(1.0, speech)
    exp = [x / rate for x in w]
    # node j = pause j (0..m-1); start node = -1 (t_start), end = m (t_end)
    edges = [(t_start, t_start)] + [(p[2], p[3]) for p in ps] + [(t_end, t_end)]
    def seg_cost(a, i, j):  # sentence a spoken between node i and node j (indices into edges)
        d = max(0.05, edges[j][0] - edges[i][1])
        return 4.0 * np.log(d / exp[a]) ** 2
    INF = 1e18
    N = m + 2
    cost = np.full((len(sents) + 1, N), INF); back = np.full((len(sents) + 1, N), -1)
    cost[0, 0] = 0
    for a in range(len(sents)):
        last = a == len(sents) - 1
        for i in range(N):
            if cost[a, i] >= INF: continue
            js = [N - 1] if last else range(i + 1, N - 1)
            for j in js:
                c = cost[a, i] + seg_cost(a, i, j)
                if not last: c -= 1.2 * min(ps[j - 1][1], 0.9)  # bonus for a long pause at the sentence end
                if c < cost[a + 1, j]: cost[a + 1, j] = c; back[a + 1, j] = i
    j = N - 1; sel = []
    for a in range(len(sents), 1, -1):
        j = back[a, j]; sel.append(j - 1)
    return [ps[i] for i in reversed(sel)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('chapters'); ap.add_argument('takes'); ap.add_argument('out')
    ap.add_argument('--gap', type=float, default=0.35); ap.add_argument('--chapter-gap', type=float, default=1.6)
    a = ap.parse_args()
    chs = json.load(open(a.chapters, encoding='utf-8'))
    lines = []
    for n, ch in enumerate(chs):
        src = ch.get('src', f'ch{n}.mp3')
        x = load(os.path.join(a.takes, src))
        sents = sentences(ch['text'])
        ps, t0, t1 = pauses(x)
        cuts = match(sents, ps, t0, t1)
        bounds = [t0] + [c for p in cuts for c in (p[2], p[3])] + [t1]
        for i, s in enumerate(sents):
            s0, s1 = bounds[2 * i], bounds[2 * i + 1]
            gap = min(0.9, max(0.25, cuts[i][1])) if i < len(cuts) else a.chapter_gap
            ln = {'src': src, 't0': round(max(0, s0 - 0.04), 3), 't1': round(s1 + 0.06, 3), 'say': s, 'gap': round(gap, 3), 'who': 'narrator'}
            if i == 0: ln['chapter'] = ch['chapter']
            lines.append(ln)
        rates = [syl(s) / max(0.1, bounds[2 * i + 1] - bounds[2 * i]) for i, s in enumerate(sents)]
        print(f"{ch['chapter']}: {len(sents)} фраз, {len(ps)} пауз, слогов/с {min(rates):.1f}–{max(rates):.1f}")
    spec = {'dir': a.takes, 'lead': 1.0, 'tail': 3.0, 'tempo': 1.0, 'lines': lines}
    json.dump(spec, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', a.out, len(lines), 'lines')


if __name__ == '__main__':
    main()
