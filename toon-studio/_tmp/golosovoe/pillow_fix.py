# PillowInsert (src/golosovoe/Inserts.tsx): он лежит НА СПИНЕ, вид сверху — голова прямо на подушке, одеяло до подбородка
import sys
p = '/Users/makentosh/Brigada/toon-studio/src/golosovoe/Inserts.tsx'
s = open(p, encoding='utf-8').read()
old_head = '''          <ellipse cx={560} cy={760} rx={520} ry={330} fill="#c9ccd6" stroke="#14121c" strokeWidth={8} />
          <path d="M 120 760 C 300 700 800 700 1020 780" stroke="#a9adb8" strokeWidth={14} fill="none" />
          {/* his head, lying on its side */}
          <g transform="translate(560 800) rotate(-90) translate(0 1180) scale(1.0)">
            <Person s={P} light={NIGHT} id="pill" crop={-950} />
          </g>
          {/* the duvet up to the chin */}
          <path d="M -40 1080 C 200 990 520 990 690 960 C 700 800 690 640 720 560 C 860 530 1040 540 1120 580 L 1120 1960 L -40 1960 Z" fill="#2f4a72" stroke="#14121c" strokeWidth={10} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${60 + i * 260} 1090 C ${120 + i * 260} 1400 ${40 + i * 260} 1650 ${100 + i * 260} 1960`} stroke="#22385a" strokeWidth={18} fill="none" />)}
          <path d="M -40 1080 C 200 980 520 1000 1120 1040" stroke="#4a6a98" strokeWidth={10} fill="none" />'''
new_head = '''          {/* the pillow behind the head (seen from above) */}
          <rect x={90} y={330} width={900} height={760} rx={200} fill="#c9ccd6" stroke="#14121c" strokeWidth={8} />
          <path d="M 160 430 C 400 390 700 390 920 440" stroke="#a9adb8" strokeWidth={14} fill="none" />
          <ellipse cx={540} cy={760} rx={300} ry={260} fill="#b4b8c4" opacity={0.6} />
          {/* he lies on his back, face up to us */}
          <g transform="translate(540 820) translate(0 1180) scale(1.0)">
            <Person s={P} light={NIGHT} id="pill" crop={-950} />
          </g>
          {/* the duvet pulled up to the chin, straight across the bed */}
          <path d="M -40 1020 C 200 985 420 1000 540 1010 C 680 1000 880 985 1120 1020 L 1120 1960 L -40 1960 Z" fill="#2f4a72" stroke="#14121c" strokeWidth={10} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 260} 1060 C ${150 + i * 260} 1400 ${100 + i * 260} 1650 ${130 + i * 260} 1960`} stroke="#22385a" strokeWidth={18} fill="none" />)}
          <path d="M -40 1030 C 200 995 880 995 1120 1030" stroke="#4a6a98" strokeWidth={12} fill="none" />'''
if s.count(old_head) != 1: sys.exit('не нашёл блок подушки')
s = s.replace(old_head, new_head)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
