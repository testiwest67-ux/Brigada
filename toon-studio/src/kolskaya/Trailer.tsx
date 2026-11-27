// «Кольская сверхглубокая» — короткий вертикальный трейлер-петля 9:16 (≈35 с, проба формата 27.11).
// Конец «Приложи ухо…» → начало «…к ржавой крышке в тундре.» Последний кадр приезжает в первый (k0-03-cap).
// Голос и звук: public/kolskaya-trailer/. «Полное видео — на канале» — только надписью (голосом не говорим).
import VOICE from '../../public/kolskaya-trailer/voice.json';
import {makeTrailer} from '../story/trailer';

const LOOP = {img: 'k0-03-cap', a: 0.5, z: 1.0};
export const KLT = makeTrailer({
  dir: 'kolskaya',
  voice: VOICE,
  title: 'КОЛЬСКАЯ СВЕРХГЛУБОКАЯ',
  accent: '#ffcf8a',
  red: ['крик', 'тысяч', 'глубин', 'заварил', 'наглух', 'бросил', 'двенадцат'],
  scenes: [
    {line: 0, img: LOOP.img, a: LOOP.a, b: 0.55, z: LOOP.z},
    {line: 1, img: 'k0-05-crosssection', a: 0.5, b: 0.5, z: 1.0, z2: 1.12},
    {line: 2, img: 'k3-03-twelve', a: 0.45, b: 0.55, big: '12 КМ', red: true},
    {line: 3, img: 'k0-06-everest', a: 0.4, b: 0.6},
    {line: 4, img: 'k7-05-mic-lowered', a: 0.5, b: 0.5, z: 1.0, z2: 1.15},
    {line: 5, img: 'k0-08-screams', a: 0.45, b: 0.55, shake: true, big: 'КРИКИ', red: true},
    {line: 6, img: 'k0-08-screams', a: 0.55, b: 0.5, z: 1.2, z2: 1.3, shake: true},
    {line: 7, img: 'k7-04-void', a: 0.5, b: 0.5, z: 1.0, z2: 1.18, dark: 0.1},
    {line: 8, img: 'k9-05-weld', a: 0.45, b: 0.55},
    {line: 9, img: 'k9-05-weld', a: 0.55, b: 0.5, z: 1.2, big: 'ЗАВАРИЛИ', red: true},
    {line: 10, img: 'k7-09-internet', a: 0.4, b: 0.6},
    {line: 11, img: 'k2-06-tower', a: 0.5, b: 0.5, z: 1.0, z2: 1.12},
    {line: 12, img: 'k9-04-abandoned', a: 0.4, b: 0.6, big: 'ПОЧЕМУ?'},
    // последние ≈2,4 с: надпись «полное видео на канале», кадр приезжает в первый
    {line: 12, off: 1.6, img: LOOP.img, a: 0.42, b: LOOP.a, z: 1.18, z2: LOOP.z, end: true},
  ],
});
