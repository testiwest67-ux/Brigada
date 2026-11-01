# Voices an episode line by line and keeps the timing of every word (subtitles and acting are driven by it).
# Engines: "edge" (free Microsoft voices via edge-tts) or "elevenlabs" (needs ELEVENLABS_API_KEY in the environment or in .env).
#
#   python scripts/tts.py <lines.json> <out_dir>          -> out_dir/voice.wav + out_dir/voice.json
#   python scripts/tts.py --voices ru                      -> list free edge voices for a language
#   python scripts/tts.py --voices elevenlabs              -> list voices of your ElevenLabs account
#
# lines.json: {"engine": "edge", "voice": "ru-RU-DmitryNeural", "rate": "-4%", "pitch": "-2Hz",
#              "lead": 0.4, "tail": 1.4, "lines": [{"say": "text for the voice", "sub": "optional subtitle text", "gap": 0.3}]}
# For ElevenLabs: "engine": "elevenlabs", "voice": "<voice_id>", optional "model": "eleven_multilingual_v2", "stability", "similarity".
import asyncio, base64, json, os, subprocess, sys, urllib.request, wave

FF = 'ffmpeg'
FALLBACK = {'ru-RU-DmitryNeural': 'ru-RU-SvetlanaNeural', 'ru-RU-SvetlanaNeural': 'ru-RU-DmitryNeural',
            'en-US-AndrewNeural': 'en-US-GuyNeural', 'en-US-GuyNeural': 'en-US-AndrewNeural'}


def api_key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k and os.path.exists('.env'):
        for ln in open('.env', encoding='utf-8'):
            if ln.strip().startswith('ELEVENLABS_API_KEY='):
                k = ln.split('=', 1)[1].strip().strip('"\'')
    if not k: sys.exit('ELEVENLABS_API_KEY not found (put it into .env as ELEVENLABS_API_KEY=...)')
    return k


# ---------- engines: each returns (mp3 bytes, [{"w", "t"}]) ----------
async def edge_line(text, cfg, voice):
    import edge_tts
    c = edge_tts.Communicate(text, voice, rate=cfg.get('rate', '+0%'), pitch=cfg.get('pitch', '+0Hz'), boundary='WordBoundary')
    words, audio = [], bytearray()
    async for ch in c.stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary': words.append({'w': ch['text'], 't': ch['offset'] / 1e7})
    if not audio: raise RuntimeError('no audio')
    return bytes(audio), words


def eleven_line(text, cfg, voice):
    body = json.dumps({'text': text, 'model_id': cfg.get('model', 'eleven_multilingual_v2'),
                       'voice_settings': {'stability': cfg.get('stability', 0.5), 'similarity_boost': cfg.get('similarity', 0.75)}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128',
                                 data=body, headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req, timeout=120))
    al = r.get('alignment') or r.get('normalized_alignment')
    words, cur, start = [], '', None
    for ch, t0 in zip(al['characters'], al['character_start_times_seconds']):
        if ch.isspace():
            if cur: words.append({'w': cur, 't': start}); cur = ''
        else:
            if not cur: start = t0
            cur += ch
    if cur: words.append({'w': cur, 't': start})
    return base64.b64decode(r['audio_base64']), words


async def voice_all(cfg, voice, out):
    res = []
    for i, ln in enumerate(cfg['lines']):
        for attempt in range(3):
            try:
                if cfg.get('engine', 'edge') == 'elevenlabs': audio, words = eleven_line(ln['say'], cfg, voice)
                else: audio, words = await edge_line(ln['say'], cfg, voice)
                open(f'{out}/l{i:02d}.mp3', 'wb').write(audio); res.append(words); break
            except Exception as e:
                print('retry', i, voice, type(e).__name__, str(e)[:120]); await asyncio.sleep(2)
        else:
            return None
    return res


def dur_of(p):
    with wave.open(p) as w: return w.getnframes() / w.getframerate()


async def main(lines_p, out):
    cfg = json.load(open(lines_p, encoding='utf-8'))
    os.makedirs(out, exist_ok=True)
    voice = cfg['voice']
    res = await voice_all(cfg, voice, out)
    if res is None and cfg.get('engine', 'edge') == 'edge' and voice in FALLBACK:
        voice = FALLBACK[voice]; print('FALLBACK VOICE', voice)  # whole episode re-voiced: never mix two voices
        res = await voice_all(cfg, voice, out)
    if res is None: sys.exit('voice failed: tell the user (wait / other voice / own recording)')
    t = cfg.get('lead', 0.4); lines, parts = [], []
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse'
    for i, (ln, words) in enumerate(zip(cfg['lines'], res)):
        wav = f'{out}/l{i:02d}.wav'
        subprocess.run([FF, '-v', 'error', '-y', '-i', f'{out}/l{i:02d}.mp3', '-af', trim, '-ar', '48000', '-ac', '1', wav], check=True)
        d = dur_of(wav); lead = words[0]['t'] if words else 0
        subw = (ln.get('sub') or ln['say']).split()
        ws = [{'w': subw[k] if len(subw) == len(words) else w['w'], 't': round(t + w['t'] - lead, 3)} for k, w in enumerate(words)]
        lines.append({'i': i, 'text': ln.get('sub') or ln['say'], 'start': round(t, 3), 'end': round(t + d, 3), 'words': ws})
        parts.append((wav, t)); t += d + ln.get('gap', 0.4)
    total = round(t + cfg.get('tail', 1.2), 3)
    inputs = sum([['-i', p] for p, _ in parts], [])
    flt = ''.join(f'[{k}]adelay={int(st * 1000)}|{int(st * 1000)}[a{k}];' for k, (_, st) in enumerate(parts))
    flt += ''.join(f'[a{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[o]'
    subprocess.run([FF, '-v', 'error', '-y', *inputs, '-filter_complex', flt, '-map', '[o]', '-ar', '48000', f'{out}/voice.wav'], check=True)
    json.dump({'voice': voice, 'total': total, 'lines': lines}, open(f'{out}/voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', voice, total)


async def list_voices(what):
    if what == 'elevenlabs':
        req = urllib.request.Request('https://api.elevenlabs.io/v1/voices', headers={'xi-api-key': api_key()})
        for v in json.load(urllib.request.urlopen(req, timeout=60))['voices']:
            print(v['voice_id'], '|', v['name'], '|', (v.get('labels') or {}).get('gender', ''), (v.get('labels') or {}).get('accent', ''))
    else:
        import edge_tts
        for v in await edge_tts.list_voices():
            if v['ShortName'].lower().startswith(what.lower()): print(v['ShortName'], v['Gender'])


if __name__ == '__main__':
    if sys.argv[1] == '--voices': asyncio.run(list_voices(sys.argv[2] if len(sys.argv) > 2 else 'ru'))
    else: asyncio.run(main(sys.argv[1], sys.argv[2]))
