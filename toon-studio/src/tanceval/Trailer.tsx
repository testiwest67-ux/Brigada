// «Танцевальная чума 1518» — вертикальный трейлер-петля 9:16. Конец «…всё началось…» → начало «Летом 1518 года».
// Последний кадр приезжает в первый (c0-01-stage, центр 0.5, зум 1.0). Голос и звук: public/tanceval-chuma-trailer/.
import VOICE from '../../public/tanceval-chuma-trailer/voice.json';
import {makeTrailer} from '../story/trailer';

const LOOP = {img: 'c0-01-stage', a: 0.5, z: 1.0};
export const TCT = makeTrailer({
  dir: 'tanceval-chuma',
  voice: VOICE,
  title: 'ТАНЦЕВАЛЬНАЯ ЧУМА · 1518',
  accent: '#ffd27a',
  red: ['никто', 'кров', 'распух', 'остановит', 'перестать', 'четыреста', 'следующий', 'разносит', 'умира', 'погибл', 'молчат'],
  scenes: [
    {line: 0, img: LOOP.img, a: LOOP.a, b: 0.55, z: LOOP.z, big: '1518'},
    {line: 1, img: 'c1-01-city', a: 0.4, b: 0.6, big: 'СТРАСБУРГ'},
    {line: 2, img: 'c0-01-stage', a: 0.6, b: 0.45, z: 1.15},
    {line: 3, img: 'c0-02-faces', a: 0.45, b: 0.55},
    {line: 5, img: 'c0-03-feet', a: 0.5, b: 0.5, z: 1.0, z2: 1.15},
    {line: 6, img: 'c0-04-fall', a: 0.4, b: 0.6},
    {line: 7, img: 'c0-09-silhouettes', a: 0.5, b: 0.5, z: 1.05, big: 'НЕ МОГУТ ОСТАНОВИТЬСЯ', red: true},
    {line: 8, img: 'c0-05-musicians', a: 0.45, b: 0.55},
    {line: 9, img: 'c0-06-council', a: 0.5, b: 0.5, z: 1.1},
    {line: 10, img: 'c2-02-door', a: 0.45, b: 0.55},
    {line: 11, img: 'c2-03-dancing', a: 0.4, b: 0.6},
    {line: 13, img: 'c3-03-thirty', a: 0.4, b: 0.6, big: '30+'},
    {line: 14, img: 'c3-04-hundreds', a: 0.4, b: 0.6, big: '400?', red: true},
    {line: 15, img: 'c3-01-watchers', a: 0.5, b: 0.5, z: 1.1, dark: 0.1, big: 'А ВДРУГ Я СЛЕДУЮЩИЙ?'},
    {line: 16, img: 'c4-09-joining', a: 0.45, b: 0.55},
    {line: 17, img: 'c4-08-spectacle', a: 0.5, b: 0.5, z: 1.25, dark: 0.15, big: 'ЛЕКАРСТВО НЕ ЛЕЧИТ', red: true},
    {line: 19, img: 'c7-06-weak', a: 0.45, b: 0.55, big: '15 В ДЕНЬ?', red: true},
    {line: 20, img: 'c7-07-question', a: 0.45, b: 0.55},
    {line: 22, img: 'c0-09-silhouettes', a: 0.5, b: 0.5, z: 1.05, big: 'ЧТО ЭТО БЫЛО?'},
    {line: 23, img: LOOP.img, a: 0.42, b: LOOP.a, z: 1.18, z2: LOOP.z, end: true},
  ],
});
