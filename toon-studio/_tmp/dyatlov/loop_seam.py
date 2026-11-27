# Петля трейлера: последние 0.25 с микса плавно опускаются до уровня первых 0.15 с, чтобы на стыке не было рывка громкости.
#   python _tmp/dyatlov/loop_seam.py public/dyatlov-trailer/mix.wav
import sys, wave, numpy as np
p = sys.argv[1]
w = wave.open(p); prm = w.getparams(); sr, ch = w.getframerate(), w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, ch).astype(np.float64); w.close()
rms = lambda a: np.sqrt(np.mean(a ** 2)) + 1e-9
head, tail = x[:int(.15 * sr)], x[-int(.15 * sr):]
g = min(1.0, rms(head) / rms(tail))
n = int(.25 * sr)
ramp = np.linspace(1, 0, n) ** 2 * (1 - g) + g        # 1 → g, smooth
x[-n:] *= ramp[:, None]
o = wave.open(p, 'wb'); o.setparams(prm); o.writeframes(np.clip(x, -32768, 32767).astype(np.int16).tobytes()); o.close()
print(f'seam gain {20 * np.log10(g):.1f} dB')
