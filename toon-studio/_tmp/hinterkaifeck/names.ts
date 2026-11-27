// Пишет _tmp/hinterkaifeck/сцены.txt — название каждой сцены по строке (подписи на листах кадров).
// Запуск: node_modules/.bin/esbuild _tmp/hinterkaifeck/names.ts --bundle --platform=node --outfile=<tmp>/names.cjs && node <tmp>/names.cjs
import fs from 'fs';
import {HK} from '../../src/hinterkaifeck/Root';

fs.writeFileSync('_tmp/hinterkaifeck/сцены.txt', HK.SCENE_NAMES.map((s: string) => s.replace(/^\d+\. /, '')).join('\n') + '\n');
console.log('сцен', HK.SCENE_COUNT, 'длина', HK.TOTAL.toFixed(1), 'с');
