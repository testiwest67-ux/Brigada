// Пишет _tmp/roopkund/сцены.txt — название каждой сцены по строке (подписи на листах кадров).
// Запуск: node_modules/.bin/esbuild _tmp/roopkund/names.ts --bundle --platform=node --outfile=<tmp>/names.cjs && node <tmp>/names.cjs
import fs from 'fs';
import {RK} from '../../src/roopkund/Root';

fs.writeFileSync('_tmp/roopkund/сцены.txt', RK.SCENE_NAMES.map((s: string) => s.replace(/^\d+\. /, '')).join('\n') + '\n');
console.log('сцен', RK.SCENE_COUNT, 'длина', RK.TOTAL.toFixed(1), 'с');
