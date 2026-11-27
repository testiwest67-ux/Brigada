// Пишет _tmp/maya/сцены.txt — имя каждой сцены по строке (для подписей на листах кадров).
import fs from 'fs';
const src = fs.readFileSync('/Users/makentosh/Brigada/toon-studio/src/maya/scenes.ts', 'utf8');
const names = [...src.matchAll(/sc\(\d+, '[^']+', '[^']+', '([^']+)'/g)].map((m) => m[1]);
fs.writeFileSync('/Users/makentosh/Brigada/toon-studio/_tmp/maya/сцены.txt', names.join('\n') + '\n');
console.log(names.length);
