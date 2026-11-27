# src/golosovoe/People.tsx: двойник look 'corrupt' (по заданию пользователя 12.11) — «испорченный Костя»:
# бледно-серая кожа, запавшие хищные глаза, широкая кривая улыбка с жёлтыми зубами, длинные тонкие руки и пальцы,
# та же одежда, но выцветшая, грязная, рваная. Становится видом двойника по умолчанию.
import sys
p = '/Users/makentosh/Brigada/toon-studio/src/golosovoe/People.tsx'
s = open(p, encoding='utf-8').read()

def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt:
        sys.exit('ожидал %d, нашёл %d: %s' % (cnt, n, old[:100]))
    s = s.replace(old, new)

rep("look?: 'almost' | 'faceless' | 'shadow';", "look?: 'corrupt' | 'almost' | 'faceless' | 'shadow';")
rep("const DLOOK = {\n", """const DLOOK = {
  corrupt: {skin: '#d2d1ca', skinShade: '#acaba4', skinDark: '#8a8984', blush: '#acaba4', eyeWhite: '#d9d1b4', iris: '#8e9884', irisDark: '#4a5244',
    pupil: '#030303', mouth: '#170407', teeth: '#d6cba6', brow: '#5a2a12',
    top: '#3e5452', topShade: '#2c3c3b', topLight: '#506563', cuff: '#31423f', pants: '#5c5d5a', pantsLight: '#70716d', shoe: '#9a9483', sole: '#7a7466'},
""")
rep("const look = props.look ?? 'almost';\n", "const look = props.look ?? 'corrupt';\n  const cr = dbl && look === 'corrupt';\n")
# DLOOK must win over the outfit colours (clothes are faded)
rep("const L = {...B0, ...O, skin:", "const L = {...B0, ...O, ...(dbl ? DLOOK[look] : {}), skin:")
# ---- eyes: smaller, sunken, heavy lids, raised lower lid, yellow whites with red veins
rep("const rx = (dbl && look === 'almost'", "const rx = (cr ? 0.8 : 1) * (dbl && look === 'almost'")
rep("ry = 80 * (1 + 0.06 * s.fear);", "ry = (cr ? 0.64 : 1) * 80 * (1 + 0.06 * s.fear);")
rep("const open = clamp(s.blink);", "const open = cr ? Math.min(clamp(s.blink), 0.82) : clamp(s.blink);")
rep("        <clipPath id={clip}>", "        {cr && <ellipse cx={cx} cy={cy + 8} rx={rx * 1.5} ry={ry * 1.75} fill={`url(#${id}-socket)`} />}\n        <clipPath id={clip}>")
rep("        <g clipPath={`url(#${clip})`}>\n", """        <g clipPath={`url(#${clip})`}>
          {cr && [[-1, -0.2], [-1, 0.35], [1, 0.1], [1, -0.4]].map(([sd, k], i) => (
            <path key={`rv${i}`} d={`M ${cx + sd * rx} ${cy + k * ry} q ${-sd * rx * 0.25} ${ry * 0.1} ${-sd * rx * 0.45} ${ry * 0.02}`} stroke="#a2322e" strokeWidth={3} fill="none" opacity={0.7} />
          ))}
""")
rep("          <rect x={cx - rx - 4} y={cy - ry - 8}", "          {cr && <path d={`M ${cx - rx - 4} ${cy + ry * 0.6} Q ${cx} ${cy + ry * 0.3} ${cx + rx + 4} ${cy + ry * 0.6} L ${cx + rx + 4} ${cy + ry + 8} L ${cx - rx - 4} ${cy + ry + 8} Z`} fill={L.skinShade} />}\n          <rect x={cx - rx - 4} y={cy - ry - 8}")
# eye socket gradient
rep("        <linearGradient id={`${id}-down`} x1=\"0\" x2=\"0\" y1=\"0\" y2=\"1\">\n          <stop offset=\"0\" stopColor=\"#05060f\" stopOpacity={0} />\n          <stop offset=\"1\" stopColor=\"#05060f\" stopOpacity={0.6} />\n        </linearGradient>\n        <linearGradient id={`${id}-bodyShade`}",
    """        <radialGradient id={`${id}-socket`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.35" stopColor="#1c1418" stopOpacity={0.9} />
          <stop offset="1" stopColor="#3a3036" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-down`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#05060f" stopOpacity={0} />
          <stop offset="1" stopColor="#05060f" stopOpacity={0.6} />
        </linearGradient>
        <linearGradient id={`${id}-bodyShade`}""")
# ---- brows: kept (identity), lowered and furrowed
rep("    const f = s.fear;\n", "    const f = cr ? -0.7 : s.fear;\n")
rep("{!liza && <>{brow(-1)}{brow(1)}</>}", "{(!liza || cr) && <>{brow(-1)}{brow(1)}</>}")
# veins on the temples + sunken cheeks
rep("{lf && [-1, 1].map((sd) => (\n            <g key={`v${sd}`} stroke=\"#4a2a5a\" strokeWidth={5} fill=\"none\" opacity={0.55}",
    "{cr && [-1, 1].map((sd) => <ellipse key={`ch${sd}`} cx={sd * 132 + tx} cy={headY + 120} rx={44} ry={70} fill={L.skinDark} opacity={0.35} />)}\n          {(lf || cr) && [-1, 1].map((sd) => (\n            <g key={`v${sd}`} stroke=\"#4a2a5a\" strokeWidth={5} fill=\"none\" opacity={cr ? 0.35 : 0.55}")
# ---- the smile: too wide, crooked, many yellow human teeth, creases at the corners
rep("  const smileW = lerp(30, 118, sm);\n", """  const smileW = lerp(30, 118, sm);
  const corruptMouth = () => {
    const w = lerp(60, 172, sm), yL = my - 34 * sm + 4, yR = my - 34 * sm - 24 * sm, op = 14 + 44 * sm + 60 * mo;
    const xL = mx - w, xR = mx + w, cy1 = my + 8 * sm, cy2 = my + op;
    const outline = `M ${xL} ${yL} Q ${mx} ${cy1} ${xR} ${yR} Q ${mx} ${cy2 + 20} ${xL} ${yL} Z`;
    const at = (t: number, cy: number) => ({x: (1 - t) * (1 - t) * xL + 2 * (1 - t) * t * mx + t * t * xR, y: (1 - t) * (1 - t) * yL + 2 * (1 - t) * t * cy + t * t * yR});
    const N = 18;
    return (
      <g>
        <clipPath id={`${id}-cm`}><path d={outline} /></clipPath>
        <path d={outline} fill={L.mouth} />
        <g clipPath={`url(#${id}-cm)`}>
          {Array.from({length: N}, (_, i) => { const a = at(i / N, cy1), b2 = at((i + 1) / N, cy1); return (
            <path key={`ut${i}`} d={`M ${a.x} ${a.y - 4} L ${b2.x} ${b2.y - 4} L ${b2.x} ${b2.y + 30} L ${a.x} ${a.y + 28} Z`} fill={L.teeth} stroke="#5a4a2e" strokeWidth={2.5} />); })}
          {Array.from({length: N}, (_, i) => { const a = at(i / N, cy2 + 20), b2 = at((i + 1) / N, cy2 + 20); return (
            <path key={`lt${i}`} d={`M ${a.x} ${a.y + 4} L ${b2.x} ${b2.y + 4} L ${b2.x} ${b2.y - 26} L ${a.x} ${a.y - 24} Z`} fill={L.teeth} stroke="#5a4a2e" strokeWidth={2.5} opacity={0.92} />); })}
        </g>
        <path d={outline} fill="none" stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />
        <path d={`M ${xL} ${yL} Q ${mx} ${cy1} ${xR} ${yR}`} stroke="#7a6a6a" strokeWidth={5} fill="none" opacity={0.6} />
        {[[xL, yL, -1], [xR, yR, 1]].map(([x, y, sd]) => (
          <path key={`cr${sd}`} d={`M ${x} ${y} q ${sd * 22} -10 ${sd * 30} -42`} stroke={L.skinDark} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
      </g>
    );
  };
""")
rep("{lf && sm >= 0.05 ? (() => {", "{cr && sm >= 0.05 ? corruptMouth() : lf && sm >= 0.05 ? (() => {")
# ---- arms: longer and thinner, the hands hang lower
rep("    const rest = {x: side * 228, y: -560};", "    const rest = {x: side * (cr ? 240 : 228), y: cr ? -400 : -560};")
rep("let mid = {x: lerp(side * 222, side * 250, hk) + tr * 0.5, y: lerp(-735, -760, hk) + b};", "let mid = {x: lerp(side * (cr ? 236 : 222), side * 250, hk) + tr * 0.5, y: lerp(cr ? -680 : -735, -760, hk) + b};")
rep("      <path d={a.d} stroke={L.ink} strokeWidth={72 + OW * 2}", "      <path d={a.d} stroke={L.ink} strokeWidth={(cr ? 54 : 72) + OW * 2}")
rep("      <path d={a.d} stroke={L.top} strokeWidth={72}", "      <path d={a.d} stroke={L.top} strokeWidth={cr ? 54 : 72}")
# fingers slightly crooked
rep("          <rect key={i} x={fx - (liza ? 6 : 8)}", "          <rect key={i} transform={cr ? `rotate(${[-9, 4, -5, 11][i]} ${fx} 28)` : undefined} x={fx - (liza ? 6 : 8)}")
# ---- ragged clothes: torn hem, holes, stains, faded logo, holes on the knees
rep("{(!liza || dbl) && <path d=\"M -60 -800", """{cr && <path d="M -212 -478 L -190 -440 L -170 -478 L -140 -430 L -110 -470 L -84 -420 L -50 -468 L -20 -436 L 10 -472 L 44 -428 L 76 -466 L 104 -432 L 140 -470 L 168 -436 L 212 -478 Z" fill={L.top} stroke={L.ink} strokeWidth={OW * 0.8} strokeLinejoin="round" />}
          {cr && [[-120, -700, 30, 22], [96, -600, 22, 30], [-40, -880, 16, 12]].map(([x, y, rx2, ry2], i) => (
            <path key={`hole${i}`} d={`M ${x - rx2} ${y} L ${x - rx2 * 0.4} ${y - ry2} L ${x + rx2 * 0.3} ${y - ry2 * 0.7} L ${x + rx2} ${y - ry2 * 0.1} L ${x + rx2 * 0.6} ${y + ry2} L ${x - rx2 * 0.3} ${y + ry2 * 0.8} Z`} fill="#0e0c10" stroke={L.topShade} strokeWidth={4} />
          ))}
          {cr && [[60, -820, 70, 40], [-90, -560, 90, 46], [150, -720, 40, 60]].map(([x, y, rx2, ry2], i) => <ellipse key={`st${i}`} cx={x} cy={y} rx={rx2} ry={ry2} fill="#3a2c1c" opacity={0.3} />)}
          {(!liza || dbl) && <path opacity={cr ? 0.35 : 1} d="M -60 -800""")
rep("        <path d=\"M -112 -470 L -102 -80\" stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />\n",
    """        <path d="M -112 -470 L -102 -80" stroke={L.pantsLight} strokeWidth={10} opacity={0.5} />
        {cr && [-1, 1].map((sd) => <path key={`kn${sd}`} d={`M ${sd * 60} -300 L ${sd * 80} -322 L ${sd * 108} -306 L ${sd * 118} -276 L ${sd * 96} -252 L ${sd * 66} -262 Z`} fill="#0e0c10" stroke={L.pantsLight} strokeWidth={4} />)}
        {cr && [-1, 1].map((sd) => <ellipse key={`ps${sd}`} cx={sd * 92} cy={-150} rx={46} ry={70} fill="#3a2c1c" opacity={0.3} />)}
""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')
