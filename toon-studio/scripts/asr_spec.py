# Re-cuts an assemble_voice spec by what is actually SAID: each take is transcribed with word timestamps
# (faster-whisper), the expected sentences are matched to the recognised words, and every line's t0/t1 is set
# from its first/last word and snapped to the quietest point nearby. Fixes auto_spec cuts that slid by a phrase.
# Also reports lines whose words were not found (missing / mangled words) so they can be listened to.
#
#   python scripts/asr_spec.py <spec.json> [--model small] [--write]
#   (spec "dir" holds the takes; lines carry "src", "say", "t0", "t1")
import argparse, difflib, json, os, re, subprocess
import numpy as np

SR = 16000


def norm(w):
    return re.sub(r'[^а-яa-z0-9]', '', w.lower().replace('ё', 'е'))


def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def quietest(x, t, lo, hi):
    # frame (10 ms) with the lowest energy in [t-0.25, t+0.25] ∩ [lo, hi]
    a, b = max(lo, t - 0.25), min(hi, t + 0.25)
    if b - a < 0.02: return t
    fr = SR // 100
    i0, i1 = int(a * SR), int(b * SR)
    seg = x[i0:i1]; n = max(1, len(seg) // fr)
    rms = np.sqrt((seg[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12)
    return round(a + int(np.argmin(rms)) * 0.01 + 0.005, 3)


def trim(x, a, b, db=-42):
    # drop silence at both ends of [a, b], keeping 50 ms / 80 ms of air
    fr = SR // 100
    seg = x[int(a * SR):int(b * SR)]; n = len(seg) // fr
    if n < 3: return round(a, 3), round(b, 3)
    on = np.where(20 * np.log10(np.sqrt((seg[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12)) > db)[0]
    if not len(on): return round(a, 3), round(b, 3)
    return round(max(a, a + on[0] / 100 - 0.05), 3), round(min(b, a + (on[-1] + 1) / 100 + 0.08), 3)


def split_gap(x, a, b, sy):
    # cut [a, b] into len(sy) parts at the longest pauses inside it; fall back to syllable shares
    k = len(sy)
    if k == 1: return [(a, b)]
    fr = SR // 100
    seg = x[int(a * SR):int(b * SR)]; n = max(1, len(seg) // fr)
    rms = 20 * np.log10(np.sqrt((seg[:n * fr].reshape(n, fr) ** 2).mean(1) + 1e-12))
    quiet = rms < -42
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if j - i >= 12 and i > 5 and j < n - 5: runs.append((j - i, a + (i + j) / 200))
            i = j
        else: i += 1
    if len(runs) >= k - 1:
        cuts = sorted(t for _, t in sorted(runs, reverse=True)[:k - 1])
    else:
        tot, acc, cuts = sum(sy), 0, []
        for s in sy[:-1]: acc += s; cuts.append(a + (b - a) * acc / tot)
    edges = [a] + cuts + [b]
    return [(round(edges[i], 3), round(edges[i + 1], 3)) for i in range(k)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec'); ap.add_argument('--model', default='small'); ap.add_argument('--write', action='store_true')
    a = ap.parse_args()
    spec = json.load(open(a.spec, encoding='utf-8'))
    cache_p = os.path.splitext(a.spec)[0] + '.asr.json'
    cache = json.load(open(cache_p, encoding='utf-8')) if os.path.exists(cache_p) else {}
    m = None
    by_src = {}
    for k, l in enumerate(spec['lines']): by_src.setdefault(l['src'], []).append(k)
    changed, report = 0, []
    VOWS = set('аеёиоуыэюя')
    for src, idx in by_src.items():
        x = load(os.path.join(spec['dir'], src)); dur = len(x) / SR
        if src not in cache:
            if m is None:
                from faster_whisper import WhisperModel
                m = WhisperModel(a.model, device='cpu', compute_type='int8')
            segs, _ = m.transcribe(x, language='ru', beam_size=5, word_timestamps=True, vad_filter=False)
            cache[src] = [(w.word, w.start, w.end) for s in segs for w in s.words]
            json.dump(cache, open(cache_p, 'w', encoding='utf-8'), ensure_ascii=False)
        asr = [(norm(w), s, e) for w, s, e in cache[src] if norm(w)]
        exp, owner = [], []
        for k in idx:
            for w in spec['lines'][k]['say'].split():
                if norm(w): exp.append(norm(w)); owner.append(k)
        sm = difflib.SequenceMatcher(None, exp, [w for w, _, _ in asr], autojunk=False)
        hit = {}
        for blk in sm.get_matching_blocks():
            for j in range(blk.size): hit[blk.a + j] = blk.b + j
        # per line: first/last matched word times
        bounds = {}
        for k in idx:
            ws = [i for i, o in enumerate(owner) if o == k]
            got = [hit[i] for i in ws if i in hit]
            if got: bounds[k] = (asr[min(got)][1], asr[max(got)][2], len(got) / len(ws), ws[0] in hit, ws[-1] in hit)
            else: bounds[k] = None
        # lines with too few recognised words (numbers written as digits, rare names) are not trusted:
        # they fill the gap between the trusted neighbours, split at the longest pauses
        good = {k: b for k, b in bounds.items() if b is not None and b[2] >= 0.6}
        for k in idx:
            if k not in good:
                b = bounds[k]
                report.append(f"№{k + 1} ({src}): распознано {0 if b is None else round(b[2] * 100)}% слов — граница по соседям, послушать: «{spec['lines'][k]['say']}»")
        new = {}
        n = 0
        while n < len(idx):
            k = idx[n]
            if k in good:
                new[k] = good[k][:2]; n += 1; continue
            m0 = n
            while n < len(idx) and idx[n] not in good: n += 1
            run = idx[m0:n]
            ga = good[idx[m0 - 1]][1] + 0.05 if m0 > 0 else 0.0
            gb = good[idx[n]][0] - 0.05 if n < len(idx) else dur
            sy = [max(1, sum(ch in VOWS for ch in spec['lines'][r]['say'].lower())) for r in run]
            for r, (s, e) in zip(run, split_gap(x, ga, gb, sy)): new[r] = (s, e)
        for n, k in enumerate(idx):
            l = spec['lines'][k]; b = new[k]
            prev_end = new[idx[n - 1]][1] if n else 0.0
            next_start = new[idx[n + 1]][0] if n + 1 < len(idx) else dur
            if k in good:
                t0 = quietest(x, b[0] - 0.04, (prev_end + b[0]) / 2, b[0])
                t1 = quietest(x, b[1] + 0.06, b[1], (b[1] + next_start) / 2)
                # first / last word not recognised (split or misheard): reach to the neighbour, minus silence
                if not good[k][3]: t0 = trim(x, prev_end + 0.05, t1)[0]
                if not good[k][4]: t1 = trim(x, t0, next_start - 0.05)[1]
            else:
                t0, t1 = trim(x, *b)
            if abs(t0 - l['t0']) > 0.15 or abs(t1 - l['t1']) > 0.15:
                changed += 1
                if abs(t0 - l['t0']) > 0.4 or abs(t1 - l['t1']) > 0.4:
                    report.append(f"№{k + 1}: граница сдвинута {l['t0']}–{l['t1']} → {t0}–{t1} «{l['say']}»")
            l['t0'], l['t1'] = t0, t1
        # neighbours must not overlap: cut at the quietest point of the overlap
        for p, q in zip(idx, idx[1:]):
            A, B = spec['lines'][p], spec['lines'][q]
            if B['t0'] < A['t1']:
                lo, hi = B['t0'] - 0.05, A['t1'] + 0.05
                c = quietest(x, (lo + hi) / 2, lo, hi)
                A['t1'], B['t0'] = c, c
        print(f'{src}: {len(idx)} фраз, слов найдено {len(hit)}/{len(exp)}', flush=True)
    print(f'изменено границ: {changed}')
    for r in report: print(' -', r)
    if a.write:
        json.dump(spec, open(a.spec, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('записано', a.spec)


if __name__ == '__main__':
    main()
