# Voice vs background per phrase (only where the voice sounds). Phrases with background closer than 15 dB are marked <--.
#   STEMS=_tmp/stems python scripts/flight19_sound.py ... && python scripts/mix_check.py _tmp/stems/ public/<ролик>/voice.json
# voice vs background only where the voice is actually sounding (20 ms blocks above −45 dBFS)
import json, wave, sys, numpy as np
S=sys.argv[1]
def ld(n):
    w=wave.open(S+n+'.wav'); return np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32767*2
X={k:ld(k) for k in ('voice','music','amb','fx')}; L=json.load(open(sys.argv[2]))['lines']
B=960
def blocks(x,a,e): x=x[a:e]; x=x[:len(x)//B*B].reshape(-1,B); return (x**2).mean(1)
bad=0
for i,l in enumerate(L):
    a,e=int(l['start']*48000),int(l['end']*48000); v=blocks(X['voice'],a,e); m=v>10**(-4.5)
    if not m.any(): continue
    vd=10*np.log10(v[m].mean()); r={k:vd-10*np.log10(blocks(X[k],a,e)[m].mean()+1e-12) for k in ('music','amb','fx')}
    tot=vd-10*np.log10(sum(blocks(X[k],a,e)[m].mean() for k in ('music','amb','fx'))+1e-12)
    f='  <--' if tot<15 else ''; bad+=bool(f)
    print(f"{i:2d} голос {vd:6.1f}  фон {tot:5.1f} | муз {r['music']:5.1f} шум {r['amb']:5.1f} эфф {r['fx']:5.1f}  {l['text'][:30]}{f}")
print('фраз, где фон ближе 15 дБ:',bad)
