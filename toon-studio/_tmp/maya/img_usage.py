# Сколько сцен приходится на каждую картинку в src/maya/scenes.ts (по убыванию).
import re, collections
s = open('/Users/makentosh/Brigada/toon-studio/src/maya/scenes.ts', encoding='utf-8').read()
c = collections.Counter(re.findall(r"sc\(\d+, '([^']+)'", s))
for k, v in c.most_common(): print(v, k)
print('сцен', sum(c.values()), 'картинок', len(c))
