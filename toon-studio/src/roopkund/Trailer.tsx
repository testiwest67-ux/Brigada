// «Роопкунд» — вертикальный трейлер-петля 9:16. Конец «…всё началось…» → начало «Высоко в Гималаях».
// Последний кадр приезжает в первый (r0-01-peaks, центр 0.5, зум 1.0). Голос и звук: public/roopkund-trailer/.
import VOICE from '../../public/roopkund-trailer/voice.json';
import {makeTrailer} from '../story/trailer';

const LOOP = {img: 'r0-01-peaks', a: 0.5, z: 1.0};
export const RKT = makeTrailer({
  dir: 'roopkund',
  voice: VOICE,
  title: 'ОЗЕРО СКЕЛЕТОВ РООПКУНД',
  red: ['кост', 'скелет', 'череп', 'град', 'днк', 'средиземномор', 'тысяч', 'почти', 'три'],
  scenes: [
    {line: 0, img: LOOP.img, a: LOOP.a, b: 0.55, z: LOOP.z},
    {line: 1, img: 'r0-01-peaks', a: 0.6, b: 0.45, z: 1.1, big: '5 000 М'},
    {line: 2, img: 'r1-04-lake-wide', a: 0.4, b: 0.6},
    {line: 4, img: 'r0-03-lake-thaw', a: 0.45, b: 0.55},
    {line: 5, img: 'r0-04-shore-bones', a: 0.5, b: 0.5, z: 1.0, z2: 1.15},
    {line: 7, img: 'r0-05-many-bones', a: 0.5, b: 0.5, z: 1.05, big: 'КОСТИ', red: true},
    {line: 8, img: 'r3-01-scattered', a: 0.4, b: 0.6, big: 'СОТНИ СКЕЛЕТОВ', red: true},
    {line: 9, img: 'r1-12-no-one', a: 0.45, b: 0.55},
    {line: 11, img: 'r0-08-question', a: 0.5, b: 0.5, z: 1.0, z2: 1.12, big: 'КТО ОНИ?'},
    {line: 14, img: 'r0-10-title', a: 0.45, b: 0.55, big: 'РООПКУНД'},
    {line: 16, img: 'r3-03-frozen-preserved', a: 0.5, b: 0.5, z: 1.1},
    {line: 17, img: 'r5-07-skull-study', a: 0.45, b: 0.55},
    {line: 18, img: 'r5-08-hail-skull', a: 0.5, b: 0.5},
    {line: 20, img: 'r4-08-hail', a: 0.4, b: 0.6, shake: true, big: 'ГРАД?', red: true},
    {line: 21, img: 'r5-12-solved', a: 0.45, b: 0.55},
    {line: 22, img: 'r5-12-solved', a: 0.55, b: 0.5, z: 1.2, big: 'ПОЧТИ', red: true},
    {line: 23, img: 'r0-09-dna-helix', a: 0.5, b: 0.5, z: 1.0, z2: 1.15, big: 'ДНК'},
    {line: 24, img: 'r6-08-three-groups', a: 0.4, b: 0.6},
    {line: 25, img: 'r6-08-three-groups', a: 0.5, b: 0.5, z: 1.2, big: '3 ГРУППЫ', red: true},
    {line: 26, img: 'r6-10-mediterranean', a: 0.6, b: 0.35},
    {line: 28, img: 'r6-11-crete', a: 0.45, b: 0.55, big: 'КРИТ'},
    {line: 30, img: 'r6-13-world-lake', a: 0.5, b: 0.5, z: 1.05},
    {line: 31, img: 'r7-06-thousand-years', a: 0.4, b: 0.6},
    {line: 32, img: 'r7-01-dates', a: 0.5, b: 0.5, z: 1.1, big: '1 000 ЛЕТ', red: true},
    {line: 33, img: 'r8-07-trap', a: 0.45, b: 0.55},
    {line: 36, img: 'r6-13-world-lake', a: 0.5, b: 0.5, z: 1.2, dark: 0.1},
    {line: 37, img: LOOP.img, a: 0.42, b: LOOP.a, z: 1.18, z2: LOOP.z, end: true},
  ],
});
