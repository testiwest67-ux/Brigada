// «Хинтеркайфек» — вертикальный трейлер-петля 9:16. Конец «…всё началось…» → начало «…на одиноком хуторе у самого леса».
// Последний кадр приезжает в первый (h0-01-farm-forest, центр 0.5, зум 1.0). Голос и звук: public/hinterkaifeck-trailer/.
import VOICE from '../../public/hinterkaifeck-trailer/voice.json';
import {makeTrailer} from '../story/trailer';

const LOOP = {img: 'h0-01-farm-forest', a: 0.5, z: 1.0};
export const HKT = makeTrailer({
  dir: 'hinterkaifeck',
  voice: VOICE,
  title: 'ТАЙНА ХУТОРА ХИНТЕРКАЙФЕК',
  accent: '#ffd9a0',
  red: ['следы', 'обратно', 'никого', 'чердак', 'шаги', 'кирк', 'кров', 'не взял', 'деньги', 'жил'],
  scenes: [
    {line: 0, img: LOOP.img, a: LOOP.a, b: 0.55, z: LOOP.z},
    {line: 1, img: 'h0-02-door-dawn', a: 0.45, b: 0.55},
    {line: 2, img: 'h0-03-footprints', a: 0.5, b: 0.5, z: 1.0, z2: 1.15, big: 'СЛЕДЫ', red: true},
    {line: 3, img: 'h3-11-tracks-close', a: 0.4, b: 0.6},
    {line: 5, img: 'h0-04-no-return', a: 0.55, b: 0.5, z: 1.05, big: 'ОБРАТНО — НИ ОДНОГО', red: true},
    {line: 6, img: 'h0-05-attic-ceiling', a: 0.5, b: 0.5, z: 1.0, z2: 1.12},
    {line: 7, img: 'h0-06-lantern-ladder', a: 0.4, b: 0.6},
    {line: 8, img: 'h1-06-attic-long', a: 0.5, b: 0.5, z: 1.1, dark: 0.15, big: 'НИКОГО', red: true},
    {line: 9, img: 'h3-16-neighbours-talk', a: 0.4, b: 0.6},
    {line: 11, img: 'h3-17-shut-door', a: 0.5, b: 0.5, z: 1.05},
    {line: 12, img: 'h0-07-six-chairs', a: 0.35, b: 0.65, big: '6 ЧЕЛОВЕК'},
    {line: 14, img: 'h4-07-one-by-one', a: 0.4, b: 0.6, big: 'ПО ОДНОМУ'},
    {line: 16, img: 'h4-05-stable-door', a: 0.5, b: 0.5, z: 1.1, dark: 0.25},
    {line: 17, img: 'h0-08-smoke-chimney', a: 0.45, b: 0.55, big: 'КТО-ТО ЖИЛ', red: true},
    {line: 18, img: 'h5-07-milk-pail', a: 0.4, b: 0.6},
    {line: 19, img: 'h5-08-bread', a: 0.45, b: 0.55},
    {line: 20, img: 'h5-10-stove', a: 0.5, b: 0.5, z: 1.05},
    {line: 21, img: 'h5-11-hay-spread', a: 0.4, b: 0.6},
    {line: 22, img: 'h5-12-tile-gap', a: 0.5, b: 0.5, z: 1.0, z2: 1.15},
    {line: 24, img: 'h5-13-two-hollows', a: 0.45, b: 0.55, big: 'ДВЕ ВМЯТИНЫ', red: true},
    {line: 26, img: 'h5-13-two-hollows', a: 0.55, b: 0.5, z: 1.25, dark: 0.15},
    {line: 28, img: 'h5-14-above-heads', a: 0.5, b: 0.5, z: 1.0, z2: 1.12, big: 'НАД ИХ ГОЛОВАМИ', red: true},
    {line: 29, img: 'h6-12-money', a: 0.4, b: 0.6},
    {line: 31, img: 'h6-12-money', a: 0.55, b: 0.5, z: 1.2},
    {line: 33, img: 'h6-12-money', a: 0.5, b: 0.5, z: 1.35, big: 'НЕ ВЗЯЛ', red: true},
    {line: 34, img: 'h7-10-mattock-found', a: 0.45, b: 0.55},
    {line: 36, img: 'h7-10-mattock-found', a: 0.5, b: 0.5, z: 1.25, dark: 0.15},
    {line: 37, img: 'h7-14-cadets', a: 0.4, b: 0.6, big: '2007'},
    {line: 39, img: 'h7-15-sealed-envelope', a: 0.5, b: 0.5, z: 1.1, big: 'ИМЯ НЕ НАЗВАНО', red: true},
    {line: 41, img: 'h9-03-last-tracks', a: 0.5, b: 0.5, z: 1.05, big: 'КТО ПРИШЁЛ ИЗ ЛЕСА?'},
    {line: 42, img: LOOP.img, a: 0.42, b: LOOP.a, z: 1.18, z2: LOOP.z, end: true},
  ],
});
