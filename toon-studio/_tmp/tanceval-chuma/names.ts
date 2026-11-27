// Пишет _tmp/tanceval-chuma/сцены.txt — название каждой сцены по строке (подписи на листах кадров).
// Запуск: node_modules/.bin/esbuild _tmp/tanceval-chuma/names.ts --bundle --platform=node --outfile=<tmp>/names.cjs && node <tmp>/names.cjs
import fs from 'fs';
import {TC} from '../../src/tanceval/Root';

fs.writeFileSync('_tmp/tanceval-chuma/сцены.txt', TC.SCENE_NAMES.map((s: string) => s.replace(/^\d+\. /, '')).join('\n') + '\n');
console.log('сцен', TC.SCENE_COUNT, 'длина', TC.TOTAL.toFixed(1), 'с');
