// Пишет _tmp/kolskaya/сцены.txt — название каждой сцены по строке (подписи на листах кадров).
// Запуск: node_modules/.bin/esbuild _tmp/kolskaya/names.ts --bundle --platform=node --outfile=<tmp>/names.cjs && node <tmp>/names.cjs
import fs from 'fs';
import {KL} from '../../src/kolskaya/Root';

fs.writeFileSync('_tmp/kolskaya/сцены.txt', KL.SCENE_NAMES.map((s: string) => s.replace(/^\d+\. /, '')).join('\n') + '\n');
console.log('сцен', KL.SCENE_COUNT, 'длина', KL.TOTAL.toFixed(1), 'с');
