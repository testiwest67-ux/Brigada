# src/golosovoe/People.tsx: двойник отдельно от существа «Колонки». Лицо существа (чёрные глаза, пасть, вены) —
# только у variant 'tenant'; у 'double' — свой вид look: 'almost' (почти ты) | 'faceless' (без лица) | 'shadow' (тень).
# У двойника от существа остаются только длинные пальцы.
import re, sys
p = '/Users/makentosh/Brigada/toon-studio/src/golosovoe/People.tsx'
s = open(p, encoding='utf-8').read()

def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt:
        sys.exit('ожидал %d, нашёл %d: %s' % (cnt, n, old[:90]))
    s = s.replace(old, new)

rep("  brushColor?: string; // Anya pink, the reflection's glass holds a blue one\n",
    "  brushColor?: string; // Anya pink, the reflection's glass holds a blue one\n  look?: 'almost' | 'faceless' | 'shadow'; // the double's face\n")
rep("const DOUBLE = {hair: '#8e4a26', hairLight: '#b0663a', brow: '#5e2c14'};",
    """const DOUBLE = {hair: '#b35a2a', hairLight: '#d9844a', brow: '#7e3c18'};
const DLOOK = {
  almost: {skin: '#e6dcd4', skinShade: '#c7b9b1', skinDark: '#a6989a', blush: '#c7b9b1', iris: '#86b83e', irisDark: '#46601e'},
  faceless: {skin: '#ddd5ce', skinShade: '#bfb4ac', skinDark: '#9e9390', blush: '#bfb4ac'},
  shadow: {skin: '#1d1b23', skinShade: '#121117', skinDark: '#0a090d', blush: '#1d1b23', eyeWhite: '#0c0b10', iris: '#a6f05a', irisDark: '#5a9a22', ink: '#050407', mouth: '#000000', teeth: '#e8f0dc'},
};""")
rep("  const liza = variant === 'tenant' || dbl;\n",
    "  const liza = variant === 'tenant' || dbl;\n  const lf = variant === 'tenant';\n  const look = props.look ?? 'almost';\n")
rep("const B0 = dbl ? {...BASE, ...LIZA, ...DOUBLE} :", "const B0 = dbl ? {...BASE, ...DOUBLE, ...DLOOK[look]} :")
# the tenant's face features only for the tenant
a = s.index('const eye = (side: number) => {'); b = s.index('const brow = (side: number) => {')
s = s[:a] + s[a:b].replace('liza', 'lf') + s[b:]
a = s.index('{/* head */}'); b = s.index('{/* hair, front layer */}')
s = s[:a] + s[a:b].replace('liza', 'lf') + s[b:]
rep("{liza && [-1, 1].map((sd) => (\n            <g key={`v${sd}`}", "{lf && [-1, 1].map((sd) => (\n            <g key={`v${sd}`}")
# asymmetric eyes for «almost»
rep("cy = headY + 14;", "cy = headY + 14 + (dbl && look === 'almost' && side === 1 ? -18 : 0);")
rep("const rx = 66 * (", "const rx = (dbl && look === 'almost' && side === 1 ? 1.12 : 1) * 66 * (")
# faceless: no eyes, no nose; no blush on any double
rep("{eye(-1)}{eye(1)}", "{!(dbl && look === 'faceless') && <>{eye(-1)}{eye(1)}</>}")
rep("opacity={0.4 + 0.2 * hp} />", "opacity={dbl ? 0 : 0.4 + 0.2 * hp} />", 2)
rep(": <path d={`M ${tx * 1.1 - 8} ${headY + 70}", ": dbl && look === 'faceless' ? null : <path d={`M ${tx * 1.1 - 8} ${headY + 70}")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
