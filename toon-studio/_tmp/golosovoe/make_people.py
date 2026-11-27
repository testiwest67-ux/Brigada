# Копия src/kolonka/People.tsx → src/golosovoe/People.tsx: у Кости длинные лохматые волосы до плеч,
# новый вариант 'double' — двойник: те же волосы и одежда, но серая кожа, чёрные глаза, длинные пальцы, вены.
import re, sys
R = '/Users/makentosh/Brigada/toon-studio/src/'
s = open(R + 'kolonka/People.tsx', encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n < count:
        sys.exit('НЕ НАЙДЕНО (%d): %s' % (n, old[:80]))
    s = s.replace(old, new)

rep("// «Ева, кто дома?» people", "// «Голосовое в 3:33» (копия кукол «Колонки»): Костя с длинными волосами и его двойник. // «Ева, кто дома?» people")
rep("variant?: 'max' | 'tenant';", "variant?: 'max' | 'tenant' | 'double';")
# long messy hair down to the shoulders, a ragged fringe
rep("export const Person: React.FC", """const LONG_BACK = 'M -268 -930 C -300 -1220 -268 -1480 0 -1536 C 268 -1480 300 -1220 268 -930 L 236 -962 L 222 -900 L 190 -950 L 160 -912 L -160 -912 L -190 -950 L -222 -900 L -236 -962 Z';
const LONG_FRONT = 'M -262 -1240 C -250 -1420 -150 -1520 0 -1532 C 150 -1520 250 -1420 262 -1240 C 270 -1110 258 -1000 236 -930 L 214 -975 L 200 -925 L 180 -990 L 172 -1140 C 170 -1240 150 -1300 120 -1330 L 96 -1300 L 80 -1356 L 40 -1320 L 10 -1370 L -24 -1322 L -60 -1362 L -92 -1316 L -120 -1346 C -150 -1300 -170 -1240 -172 -1140 L -180 -990 L -200 -925 L -214 -975 L -236 -930 C -258 -1000 -270 -1110 -262 -1240 Z';
const DOUBLE = {hair: '#8e4a26', hairLight: '#b0663a', brow: '#5e2c14'};

export const Person: React.FC""")
rep("  const liza = variant === 'tenant';\n", "  const dbl = variant === 'double';\n  const liza = variant === 'tenant' || dbl;\n")
rep("const O = OUTFIT[liza ? 'liza' : outfit];", "const O = OUTFIT[liza && !dbl ? 'liza' : outfit];")
rep("const B0 = liza ? {...BASE, ...LIZA} : BASE;", "const B0 = dbl ? {...BASE, ...LIZA, ...DOUBLE} : liza ? {...BASE, ...LIZA} : BASE;")
rep("liza={liza} scarf={scarf} />;", "liza={liza && !dbl} scarf={scarf} />;")
# the striped pyjama only for the old tenant; the double wears Kostya's T-shirt with the logo
rep("{liza && [-150, -90, -30, 30, 90, 150].map", "{liza && !dbl && [-150, -90, -30, 30, 90, 150].map")
rep("{!liza && <path d=\"M -60 -800", "{(!liza || dbl) && <path d=\"M -60 -800")
# hair: both get the long hair
rep("<path d={liza ? LIZA_BACK : BOB_BACK}", "<path d={liza && !dbl ? LIZA_BACK : LONG_BACK}")
rep("<path d={liza ? LIZA_FRONT : BOB_FRONT}", "<path d={liza && !dbl ? LIZA_FRONT : LONG_FRONT}")
rep("{!liza && <path d=\"M -150 -1440 C -80 -1480", "{(!liza || dbl) && <path d=\"M -150 -1440 C -80 -1480")
rep("{liza && [-150, 150].map((x) => <path key={x} d={`M ${x} -1420", "{[-150, 150].map((x) => <path key={x} d={`M ${x} -1420")
# back view: long hair
rep("""            <path d="M -236 -1120 C -256 -1330 -216 -1500 0 -1534 C 216 -1500 256 -1330 236 -1120 C 180 -1090 -180 -1090 -236 -1120 Z" fill={L.hair}""",
    """            <path d={LONG_BACK} fill={L.hair}""")
open(R + 'golosovoe/People.tsx', 'w', encoding='utf-8').write(s)
print('ok')
