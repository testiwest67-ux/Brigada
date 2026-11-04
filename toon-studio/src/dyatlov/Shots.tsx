// «Перевал Дятлова»: the shot list (see _tmp/dyatlov/РАСКАДРОВКА.md). 16:9, 1920×1080.
// Every scene starts on a voice line, so a re-voice moves the cuts with it. Backgrounds are the Nano Banana stills in
// public/dyatlov/bg, brought to life in code (camera move, snow, drift, cloud light, grain); text and numbers are drawn here.
// Storyboard composition: frame n = the key moment of scene n (with subtitles) — the sheet the user reviews (rule 10).
import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import VOICE from '../../public/dyatlov/voice.json';
import {clamp, easeInOut, lerp} from '../toon/lib/anim';
import {ensureFont, FONT} from '../horror/fonts';
import {Grain, Vignette} from '../horror/fx';
import {GroundDrift, Snow} from './TestScene';

const W = 1920, H = 1080;
type VL = {i: number; text: string; start: number; end: number; who: string; words: {w: string; t: number}[]};
const L = (VOICE as unknown as {lines: VL[]; total: number}).lines;
export const TOTAL = (VOICE as unknown as {total: number}).total;
const S = (i: number) => L[i].start;

// ---------- scene data ----------
type Move = 'in' | 'out' | 'right' | 'left' | 'down' | 'up' | 'shake' | 'still';
type Who = 'dyatlov' | 'kolmogorova' | 'dubinina' | 'krivonischenko' | 'thibeaux' | 'kolevatov' | 'slobodin' | 'doroshenko' | 'yudin' | 'zolotaryov';
type Ov =
  | {k: 'plate'; a: string; b?: string}
  | {k: 'title'; n: string; a: string; b?: string}
  | {k: 'big'; a: string; red?: boolean; y?: number; size?: number}
  | {k: 'count'; to: number; from?: number; suf?: string; dec?: number; red?: boolean}
  | {k: 'card'; who: Who; face?: number; body?: boolean; name?: string; sub?: string}
  | {k: 'seq'; items: {a: string; at: number; who?: Who}[]; big?: boolean}
  | {k: 'quote'; a: string}
  | {k: 'stamp'; a: string}
  | {k: 'route'; draw?: boolean; stops?: boolean; peak?: boolean; label?: string}
  | {k: 'abc'; one?: 0 | 1 | 2}
  | {k: 'line3'}
  | {k: 'angle'}
  | {k: 'ring'; x: number; y: number; a: string};
type Sc = {line: number; img: string; mv: Move; fx?: number; fy?: number; z?: number; dark?: number; blur?: boolean; ov?: Ov[]; name: string; title?: boolean};

const sc = (line: number, img: string, mv: Move, name: string, o: Partial<Sc> = {}): Sc => ({line, img, mv, name, ...o});
const card = (line: number, bgImg: string, who: Who, name: string, sub?: string, face = 0): Sc =>
  sc(line, bgImg, 'still', name.toLowerCase(), {dark: 0.45, blur: true, ov: [{k: 'card', who, face, name, sub}]});

export const SCENES: Sc[] = [
  // 0. Крючок
  sc(0, 'd0-05-ridge', 'in', 'хребет, 1959', {title: true, ov: [{k: 'plate', a: 'ФЕВРАЛЬ 1959', b: 'СЕВЕРНЫЙ УРАЛ'}]}),
  sc(2, 'tent-night', 'in', 'палатка', {fx: 0.3, fy: 0.5}),
  sc(4, 'd0-04-inside', 'right', 'вещи внутри'),
  sc(6, 'd0-04-inside', 'in', 'нет людей', {z: 1.3, fx: 0.5, fy: 0.55, ov: [{k: 'big', a: 'НЕТ ТОЛЬКО ЛЮДЕЙ', y: 200, size: 84}]}),
  sc(7, 'd0-02-cut', 'in', 'разрез', {fx: 0.62, fy: 0.45, ov: [{k: 'big', a: 'ИЗНУТРИ', red: true, y: 220}]}),
  sc(9, 'd0-03-footprints', 'down', 'следы вниз'),
  sc(10, 'd0-03-footprints-socks', 'in', 'следы в носках'),
  sc(12, 'd4-01-blizzard', 'shake', 'мороз', {ov: [{k: 'count', to: -30, from: 0, suf: '°'}]}),
  sc(14, 'group-ten', 'out', 'не новички'),
  sc(16, 'd4-03-descent', 'in', 'ушли вниз'),
  sc(17, 'thumb-bg', 'in', 'вопрос'),
  sc(18, 'd0-06-case', 'in', 'дело закрыто', {ov: [{k: 'count', to: 4, from: 0, suf: ' МЕСЯЦА'}]}),
  sc(19, 'd0-06-case', 'in', 'странная фраза', {z: 1.4, fx: 0.45, fy: 0.55}),
  sc(20, 'd7-01-75', 'right', 'спорят до сих пор'),
  sc(21, 'd2-03-skitrack', 'in', 'их путь'),
  sc(23, 'd3-06-diary', 'left', 'дневники'),
  sc(24, 'd8-04-choice', 'up', 'три версии', {ov: [{k: 'abc'}]}),
  sc(25, 'd8-04-choice', 'in', 'ты решишь', {dark: 0.2, ov: [{k: 'big', a: 'ТЫ РЕШИШЬ', y: 220, size: 120}]}),
  // 1. Десять
  sc(26, 'd1-01-sverdlovsk', 'in', 'гл.1 Свердловск', {title: true, ov: [{k: 'title', n: '1', a: 'ДЕСЯТЬ', b: 'СВЕРДЛОВСК · ЯНВАРЬ 1959'}]}),
  sc(27, 'd1-01-sverdlovsk', 'up', 'институт', {z: 1.35, ov: [{k: 'plate', a: 'УРАЛЬСКИЙ ПОЛИТЕХНИЧЕСКИЙ', b: 'ИНСТИТУТ'}]}),
  sc(28, 'd1-02-club', 'in', 'турклуб'),
  sc(29, 'd1-04-ural', 'right', 'дальние походы'),
  card(30, 'd1-02-club', 'dyatlov', 'ИГОРЬ ДЯТЛОВ', '23 ГОДА · РУКОВОДИТЕЛЬ'),
  sc(33, 'd1-02-club', 'still', 'Дятлов в рост', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'dyatlov', body: true}]}),
  sc(35, 'group-ten', 'right', 'знакомство'),
  card(37, 'd1-02-club', 'kolmogorova', 'ЗИНА КОЛМОГОРОВА', 'РАДИОТЕХНИЧЕСКИЙ ФАКУЛЬТЕТ', 1),
  card(40, 'd1-02-club', 'dubinina', 'ЛЮДА ДУБИНИНА', '20 ЛЕТ · САМАЯ МЛАДШАЯ'),
  card(43, 'd1-02-club', 'krivonischenko', 'ЮРИЙ КРИВОНИЩЕНКО', 'ИНЖЕНЕР-СТРОИТЕЛЬ', 1),
  sc(44, 'd1-04-ural', 'in', 'Челябинск-40', {dark: 0.5, ov: [{k: 'plate', a: 'ЧЕЛЯБИНСК-40', b: 'ЗАКРЫТЫЙ ГОРОД'}]}),
  card(46, 'd1-02-club', 'thibeaux', 'НИКОЛАЙ ТИБО-БРИНЬОЛЬ', 'ИНЖЕНЕР-СТРОИТЕЛЬ'),
  sc(48, 'd0-06-case', 'in', 'отец: 1931–1991', {dark: 0.35, ov: [{k: 'seq', big: true, items: [{a: '1931 — АРЕСТ', at: 50}, {a: '1991 — ОПРАВДАН', at: 51}]}]}),
  sc(52, 'd1-02-club', 'still', 'трое', {dark: 0.45, blur: true, ov: [{k: 'seq', items: [
    {a: 'АЛЕКСАНДР КОЛЕВАТОВ', at: 52, who: 'kolevatov'}, {a: 'РУСТЕМ СЛОБОДИН', at: 53, who: 'slobodin'}, {a: 'ЮРИЙ ДОРОШЕНКО', at: 54, who: 'doroshenko'}]}]}),
  card(56, 'd1-02-club', 'yudin', 'ЮРИЙ ЮДИН', 'СТУДЕНТ'),
  card(59, 'd1-02-club', 'zolotaryov', 'СЕМЁН ЗОЛОТАРЁВ', 'ИНСТРУКТОР'),
  sc(60, 'd1-02-club', 'still', 'чужой в группе', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'zolotaryov', body: true, sub: 'ЧУЖОЙ В ГРУППЕ'}]}),
  sc(62, 'd1-02-club', 'still', 'прошёл войну', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'zolotaryov', face: 0, sub: 'ЗА 35 · ПРОШЁЛ ВОЙНУ · 4 НАГРАДЫ'}]}),
  sc(64, 'd1-02-club', 'right', 'инструктор турбазы'),
  sc(65, 'group-ten', 'in', 'освободилось место'),
  sc(66, 'd1-02-club', 'still', '«зовите Сашей»', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'zolotaryov', face: 1, sub: '«ЗОВИТЕ МЕНЯ САША»'}]}),
  sc(67, 'group-ten', 'out', 'состав группы', {ov: [{k: 'plate', a: '5 СТУДЕНТОВ · 3 ВЫПУСКНИКА', b: 'ИНСТРУКТОР · И ЮДИН'}]}),
  sc(69, 'd1-03-map', 'in', 'не прогулка'),
  sc(70, 'd1-03-map', 'in', 'маршрут 350 км', {ov: [{k: 'route', draw: true}, {k: 'count', to: 350, from: 0, suf: ' КМ'}]}),
  sc(71, 'd1-04-ural', 'right', 'зимой', {ov: [{k: 'big', a: 'ЗИМОЙ', y: 220}]}),
  sc(73, 'd1-03-map', 'in', 'Отортен', {fx: 0.58, fy: 0.32, z: 1.5, ov: [{k: 'route', peak: true, label: 'ОТОРТЕН'}]}),
  sc(74, 'd1-03-map', 'out', 'план: 12.02', {ov: [{k: 'route'}, {k: 'plate', a: '12 ФЕВРАЛЯ', b: 'ТЕЛЕГРАММА ИЗ ВИЖАЯ'}]}),
  sc(75, 'd1-03-map', 'in', 'план: 15.02', {ov: [{k: 'route'}, {k: 'plate', a: '15 ФЕВРАЛЯ', b: 'ДОМОЙ'}]}),
  sc(76, 'group-ten', 'in', 'их десять', {ov: [{k: 'big', a: '10', size: 260}]}),
  sc(77, 'group-ten', 'in', 'вернётся один', {dark: 0.55, ov: [{k: 'big', a: '1', size: 260, red: true}]}),
  // 2. Дорога на север
  sc(78, 'd2-01-train', 'right', 'гл.2 поезд', {title: true, ov: [{k: 'title', n: '2', a: 'ДОРОГА НА СЕВЕР', b: 'КОНЕЦ ЯНВАРЯ'}]}),
  sc(79, 'd2-01-train', 'in', 'поезд на север'),
  sc(80, 'd1-03-map', 'in', 'Ивдель-Вижай', {ov: [{k: 'route', stops: true}]}),
  sc(82, 'd2-02-kvartal', 'in', '41-й квартал'),
  sc(83, 'd2-02-kvartal', 'in', 'жилья нет', {z: 1.35, fx: 0.7, fy: 0.55}),
  sc(84, 'd2-03-skitrack', 'right', 'снег, лес, горы'),
  sc(85, 'd2-06-film', 'in', 'фотоаппарат'),
  sc(86, 'd2-06-film', 'left', 'дневники', {z: 1.3}),
  sc(87, 'd2-05-camp', 'in', 'песни у костра'),
  sc(88, 'd5-04-belongings', 'in', 'плёнки найдут'),
  sc(90, 'd2-03-skitrack', 'out', 'обычный поход'),
  sc(93, 'd2-03-skitrack', 'still', 'болит нога', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'yudin', face: 2}]}),
  sc(94, 'd2-03-skitrack', 'in', 'не дойдёт', {z: 1.3}),
  sc(96, 'd2-04-yudin', 'out', 'прощание 28.01', {ov: [{k: 'plate', a: '28 ЯНВАРЯ'}]}),
  sc(97, 'd2-04-yudin', 'in', 'последний раз', {fx: 0.7, fy: 0.45}),
  sc(98, 'd2-04-yudin', 'still', 'полвека', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'yudin', face: 0, sub: 'ПРОЖИВЁТ ЕЩЁ БОЛЬШЕ ПОЛУВЕКА'}]}),
  sc(101, 'd2-03-skitrack', 'in', 'группа уходит'),
  sc(103, 'd2-03-skitrack', 'right', 'девять', {ov: [{k: 'big', a: '9', size: 260}, {k: 'plate', a: 'ДО ТОЙ НОЧИ', b: '4 ДНЯ'}]}),
  // 3. Девять
  sc(105, 'd3-01-river', 'right', 'гл.3 река', {title: true, ov: [{k: 'title', n: '3', a: 'ДЕВЯТЬ'}]}),
  sc(107, 'd3-01-river', 'in', 'ветер, мороз', {z: 1.3}),
  sc(109, 'd3-02-labaz', 'in', 'лабаз 1.02', {ov: [{k: 'plate', a: '1 ФЕВРАЛЯ'}]}),
  sc(111, 'd3-02-labaz', 'in', 'продукты', {z: 1.4}),
  sc(113, 'd3-03-slope-dusk', 'up', 'к вершине'),
  sc(114, 'd3-03-slope-dusk', 'in', '15:00', {ov: [{k: 'plate', a: '≈ 15:00', b: 'ПЕРЕВАЛ'}]}),
  sc(116, 'd0-05-ridge', 'out', 'Холатчахль', {ov: [{k: 'plate', a: 'ХОЛАТЧАХЛЬ'}]}),
  sc(117, 'd0-05-ridge', 'in', 'Мёртвая вершина', {dark: 0.3, ov: [{k: 'big', a: '«МЁРТВАЯ ВЕРШИНА»', y: 220, size: 90}]}),
  sc(118, 'd3-03-slope-dusk', 'out', 'темнеет', {dark: 0.35}),
  sc(119, 'd3-04-platform', 'in', 'ставят палатку', {ov: [{k: 'plate', a: '≈ 17:00–18:00'}]}),
  sc(120, 'd3-05-tent-evening', 'out', 'открытый склон'),
  sc(121, 'd4-04-forest-edge', 'left', 'не в лесу'),
  sc(122, 'd3-04-platform', 'in', 'площадка', {z: 1.3}),
  sc(123, 'd3-05-tent-evening', 'in', 'почему здесь', {ov: [{k: 'big', a: 'ПОЧЕМУ ЗДЕСЬ?', y: 200, size: 90}]}),
  sc(126, 'd3-04-platform', 'in', 'запомни площадку', {ov: [{k: 'ring', x: 0.5, y: 0.62, a: 'ЗАПОМНИ'}]}),
  sc(128, 'd3-06-diary', 'in', 'дневник'),
  sc(130, 'd3-05-tent-evening', 'in', 'не доживут', {dark: 0.4}),
  // 4. Ночь
  sc(132, 'd3-05-tent-evening', 'in', 'гл.4 ночь', {title: true, dark: 0.3, ov: [{k: 'title', n: '4', a: 'НОЧЬ', b: '1 ФЕВРАЛЯ'}]}),
  sc(133, 'd0-04-inside', 'in', 'девять в палатке'),
  sc(136, 'd4-01-blizzard', 'shake', 'мороз −25…−35', {ov: [{k: 'big', a: '−25…−35°', size: 170}]}),
  sc(137, 'd4-01-blizzard', 'shake', 'ветер 35 м/с', {z: 1.25, ov: [{k: 'count', to: 35, from: 0, suf: ' М/С'}]}),
  sc(139, 'tent-night', 'in', 'не видел никто', {dark: 0.55}),
  sc(140, 'd0-03-footprints', 'down', 'следы на снегу'),
  sc(141, 'd0-02-cut', 'in', 'разрез изнутри', {fx: 0.62, fy: 0.45}),
  sc(142, 'd4-03-descent', 'in', 'все вышли'),
  sc(144, 'd4-02-socks', 'in', 'без обуви'),
  sc(145, 'd0-04-inside', 'in', 'ни курток, ни валенок', {z: 1.35, fx: 0.4, fy: 0.65}),
  sc(146, 'd4-03-descent', 'down', 'вниз к лесу'),
  sc(148, 'd4-03-descent', 'in', '1,5 км', {ov: [{k: 'count', to: 1.5, from: 0, dec: 1, suf: ' КМ'}]}),
  sc(149, 'd0-03-footprints', 'right', 'цепочкой'),
  sc(151, 'd4-02-socks', 'in', 'босиком', {z: 1.3}),
  sc(154, 'd4-01-blizzard', 'in', 'остаются часы'),
  sc(156, 'd4-04-forest-edge', 'in', 'они знали'),
  sc(158, 'tent-night', 'out', 'страшнее мороза', {dark: 0.3}),
  sc(160, 'd5-02-search', 'in', 'что нашли', {dark: 0.3}),
  // 5. Поиски
  sc(161, 'd5-01-telegraph', 'in', 'гл.5 телеграф', {title: true, ov: [{k: 'title', n: '5', a: 'ПОИСКИ', b: '12 ФЕВРАЛЯ'}]}),
  sc(163, 'd5-01-telegraph', 'right', 'никто не волнуется'),
  sc(165, 'd5-01-telegraph', 'in', 'дни идут', {z: 1.3}),
  sc(167, 'd5-02-search', 'right', 'поисковые отряды'),
  sc(168, 'd5-02-search', 'in', 'студенты УПИ'),
  sc(169, 'd5-03-tent-found', 'in', 'палатка 26.02', {ov: [{k: 'plate', a: '26 ФЕВРАЛЯ'}]}),
  sc(171, 'd5-03-tent-found', 'in', 'разрезы', {z: 1.4}),
  sc(172, 'd5-04-belongings', 'right', 'всё аккуратно'),
  sc(174, 'd4-03-descent', 'down', 'следы вниз (день)', {dark: -0.15}),
  sc(176, 'd4-03-descent', 'in', '1,5 км к лесу', {dark: -0.15, ov: [{k: 'big', a: '1,5 КМ', size: 170}]}),
  sc(178, 'd5-05-cedar', 'up', 'кедр'),
  sc(179, 'd5-05-cedar', 'in', 'у костра: двое', {ov: [{k: 'seq', items: [{a: 'ЮРИЙ ДОРОШЕНКО', at: 180}, {a: 'ЮРИЙ КРИВОНИЩЕНКО', at: 180}]}]}),
  sc(182, 'd5-06-line', 'in', 'Игорь Дятлов', {ov: [{k: 'plate', a: 'ИГОРЬ ДЯТЛОВ'}]}),
  sc(183, 'd5-06-line', 'in', 'Зина Колмогорова', {z: 1.25, ov: [{k: 'plate', a: 'ЗИНА КОЛМОГОРОВА'}]}),
  sc(184, 'd5-07-probing', 'right', 'Рустем Слободин', {ov: [{k: 'plate', a: '5 МАРТА', b: 'РУСТЕМ СЛОБОДИН'}]}),
  sc(185, 'd5-06-line', 'still', 'одна линия', {ov: [{k: 'line3'}]}),
  sc(186, 'd5-06-line', 'in', 'пытались вернуться', {z: 1.3, fy: 0.4}),
  sc(190, 'd5-05-cedar', 'out', 'холод', {dark: 0.3}),
  sc(191, 'd5-07-probing', 'in', 'где ещё четверо'),
  sc(194, 'd5-07-probing', 'in', '5 найдены, 4 нет', {ov: [{k: 'seq', big: true, items: [{a: '5 НАЙДЕНЫ', at: 194}, {a: '4 — НЕТ', at: 195}]}]}),
  sc(196, 'd5-07-probing', 'out', 'вопросов больше', {dark: 0.3}),
  // 6. Май
  sc(197, 'd6-01-thaw', 'in', 'гл.6 май', {title: true, ov: [{k: 'title', n: '6', a: 'МАЙ'}]}),
  sc(199, 'd6-02-stream', 'in', 'ручей', {ov: [{k: 'plate', a: '75 М ОТ КОСТРА', b: 'ПОД 4 М СНЕГА'}]}),
  sc(200, 'd6-01-thaw', 'right', 'четверо', {dark: 0.35, ov: [{k: 'seq', items: [
    {a: 'ЛЮДМИЛА ДУБИНИНА', at: 200}, {a: 'СЕМЁН ЗОЛОТАРЁВ', at: 201}, {a: 'НИКОЛАЙ ТИБО-БРИНЬОЛЬ', at: 202}, {a: 'АЛЕКСАНДР КОЛЕВАТОВ', at: 203}]}]}),
  sc(204, 'd6-02-stream', 'out', 'больше одежды'),
  sc(205, 'd6-02-stream', 'in', 'травмы', {dark: 0.45, z: 1.3}),
  sc(208, 'd6-03-dosimeter', 'in', 'радиация'),
  sc(209, 'd6-04-closed', 'in', 'дело закрыто', {ov: [{k: 'plate', a: '28 МАЯ 1959'}]}),
  sc(210, 'd0-06-case', 'in', '«стихийная сила»', {dark: 0.4, ov: [{k: 'quote', a: '«Стихийная сила, преодолеть которую люди были не в состоянии»'}]}),
  sc(211, 'd6-04-closed', 'in', 'какая сила?', {z: 1.3}),
  sc(212, 'd7-01-75', 'out', 'начало загадки'),
  // 7. Версии
  sc(213, 'd7-01-75', 'in', 'гл.7 версии', {title: true, ov: [{k: 'title', n: '7', a: 'ВЕРСИИ'}]}),
  sc(214, 'd0-06-case', 'in', '2019', {ov: [{k: 'plate', a: '2019', b: 'ПРОКУРАТУРА'}]}),
  sc(215, 'd7-01-75', 'in', '75 → 3', {dark: 0.3, ov: [{k: 'big', a: '75 → 3', size: 200}]}),
  sc(217, 'd8-04-choice', 'out', 'три версии', {ov: [{k: 'abc'}]}),
  sc(219, 'd7-02-slab', 'in', 'версия 1: лавина', {ov: [{k: 'title', n: 'ВЕРСИЯ 1', a: 'ЛАВИНА'}]}),
  sc(221, 'd0-06-case', 'in', 'июль 2020', {ov: [{k: 'plate', a: 'ИЮЛЬ 2020', b: 'ВЫВОД ПРОКУРАТУРЫ'}]}),
  sc(222, 'd7-02-slab', 'shake', 'снежная доска', {ov: [{k: 'plate', a: '«СНЕЖНАЯ ДОСКА»'}]}),
  sc(223, 'd7-03-ridge', 'down', '50 м к гряде', {ov: [{k: 'big', a: '50 М', size: 170}]}),
  sc(224, 'd4-01-blizzard', 'in', 'не нашли палатку'),
  sc(225, 'd3-05-tent-evening', 'out', 'замёрзли', {dark: 0.55}),
  sc(226, 'd7-04-model', 'in', 'модель 2021', {ov: [{k: 'plate', a: '2021', b: 'ГОМ И ПУЗРИН · ШВЕЙЦАРИЯ'}]}),
  sc(227, 'd3-04-platform', 'in', 'помнишь площадку', {ov: [{k: 'ring', x: 0.5, y: 0.62, a: 'ПОМНИШЬ?'}]}),
  sc(228, 'd7-04-model', 'in', 'вырез подрезал', {z: 1.35, fx: 0.42}),
  sc(229, 'd4-01-blizzard', 'left', 'ветер наносит снег'),
  sc(230, 'd7-02-slab', 'in', '9–13 часов', {ov: [{k: 'big', a: '9–13 ЧАСОВ', size: 150}]}),
  sc(231, 'd7-04-model', 'right', 'краш-тесты', {ov: [{k: 'plate', a: 'КРАШ-ТЕСТЫ', b: 'АВТОМОБИЛИ 1970-Х'}]}),
  sc(233, 'd7-04-model', 'in', 'если бы не подрезали', {dark: 0.4, ov: [{k: 'quote', a: '«Если бы они не подрезали склон, ничего бы не случилось»'}]}),
  sc(234, 'd7-03-ridge', 'out', 'против', {ov: [{k: 'stamp', a: 'ПРОТИВ'}]}),
  sc(235, 'd3-03-slope-dusk', 'in', 'склон < 30°', {ov: [{k: 'angle'}]}),
  sc(237, 'd5-03-tent-found', 'in', 'нет следов лавины'),
  sc(238, 'd7-04-model', 'in', 'склон круче'),
  sc(239, 'd4-01-blizzard', 'right', 'три недели', {ov: [{k: 'plate', a: '3 НЕДЕЛИ'}]}),
  sc(240, 'd7-05-expedition', 'in', 'экспедиция 2022', {ov: [{k: 'plate', a: '2022'}]}),
  sc(241, 'd7-05-expedition', 'out', 'не раскрыли тайну', {dark: 0.4, ov: [{k: 'quote', a: '«Мы не утверждаем, что раскрыли тайну»'}]}),
  sc(242, 'd3-03-slope-dusk', 'in', 'никто не выжил', {dark: 0.35}),
  sc(243, 'd8-01-memorial', 'in', 'фонд не согласен', {ov: [{k: 'plate', a: 'ФОНД ПАМЯТИ', b: 'НЕ СОГЛАСЕН'}]}),
  sc(244, 'd7-08-rocket', 'in', 'версия 2: испытания', {ov: [{k: 'title', n: 'ВЕРСИЯ 2', a: 'ВОЕННЫЕ ИСПЫТАНИЯ'}]}),
  sc(246, 'd7-06-orb', 'in', 'светящиеся шары'),
  sc(247, 'd7-06-orb', 'up', '17 февраля', {ov: [{k: 'plate', a: '17 ФЕВРАЛЯ'}]}),
  sc(248, 'd7-07-newspaper', 'in', '«Тагильский рабочий»', {ov: [{k: 'plate', a: '«ТАГИЛЬСКИЙ РАБОЧИЙ»', b: 'ШАР РАЗМЕРОМ С ЛУНУ'}]}),
  sc(249, 'd7-08-rocket', 'in', 'запуски ракет'),
  sc(250, 'd6-03-dosimeter', 'in', 'радиация и травмы'),
  sc(251, 'd7-06-orb', 'still', 'Юдин считал', {dark: 0.45, blur: true, ov: [{k: 'card', who: 'yudin', face: 3, sub: '«СЕКРЕТНЫЕ ИСПЫТАНИЯ»'}]}),
  sc(252, 'd0-06-case', 'in', 'документов нет', {ov: [{k: 'plate', a: 'ДОКУМЕНТОВ', b: 'НЕ НАЙДЕНО'}]}),
  sc(254, 'd7-08-rocket', 'out', 'гипотеза', {ov: [{k: 'stamp', a: 'ГИПОТЕЗА'}]}),
  sc(255, 'd7-09-infrasound', 'in', 'версия 3', {ov: [{k: 'title', n: 'ВЕРСИЯ 3', a: 'ЧТО-ТО НЕПОНЯТНОЕ'}]}),
  sc(257, 'd7-09-infrasound', 'right', 'Айкар 2013', {ov: [{k: 'plate', a: '2013', b: 'ДОННИ АЙКАР · «МЁРТВАЯ ГОРА»'}]}),
  sc(259, 'd7-09-infrasound', 'in', 'инфразвук', {z: 1.3, ov: [{k: 'plate', a: 'ИНФРАЗВУК'}]}),
  sc(261, 'd3-05-tent-evening', 'shake', 'ужас в темноте', {dark: 0.5}),
  sc(262, 'd4-01-blizzard', 'out', 'не проверить'),
  sc(263, 'd0-06-case', 'in', 'стихийная сила', {dark: 0.4, ov: [{k: 'quote', a: '«Стихийная сила, преодолеть которую люди были не в состоянии»'}]}),
  // 8. Финал
  sc(264, 'd0-05-ridge', 'in', 'гл.8 финал', {title: true, ov: [{k: 'title', n: '8', a: 'ФИНАЛ'}]}),
  sc(265, 'd3-05-tent-evening', 'in', 'что знаем точно', {dark: 0.45, ov: [{k: 'seq', items: [
    {a: 'РАЗРЕЗАЛИ ПАЛАТКУ ИЗНУТРИ', at: 265}, {a: 'УШЛИ ПОЧТИ БЕЗ ОДЕЖДЫ', at: 266}, {a: 'РАЗВЕЛИ КОСТЁР У КЕДРА', at: 267}, {a: 'ПЫТАЛИСЬ ВЕРНУТЬСЯ', at: 268}]}]}),
  sc(269, 'd5-05-cedar', 'in', 'не вернулись', {dark: 0.3}),
  sc(270, 'd8-04-choice', 'in', 'чего не знаем', {ov: [{k: 'big', a: 'ЧТО ЗАСТАВИЛО ИХ УЙТИ?', size: 96, y: 220}]}),
  sc(272, 'd8-01-memorial', 'in', 'перевал Дятлова', {ov: [{k: 'plate', a: 'ПЕРЕВАЛ ДЯТЛОВА'}]}),
  sc(273, 'd8-02-tourists', 'right', 'туристы сегодня'),
  sc(275, 'd3-03-slope-dusk', 'in', 'смотрят на склон'),
  sc(276, 'd8-03-dawn', 'up', 'имена', {ov: [{k: 'seq', items: [
    {a: 'ИГОРЬ', at: 276}, {a: 'ЗИНА', at: 277}, {a: 'ЛЮДА', at: 278}, {a: 'АЛЕКСАНДР', at: 279}, {a: 'РУСТЕМ', at: 280},
    {a: 'ЮРИЙ', at: 281}, {a: 'ЮРИЙ', at: 282}, {a: 'НИКОЛАЙ', at: 283}, {a: 'СЕМЁН', at: 284}]}]}),
  sc(285, 'd8-04-choice', 'in', 'а ты как думаешь', {ov: [{k: 'abc'}]}),
  sc(286, 'd7-02-slab', 'in', 'А — лавина', {ov: [{k: 'abc', one: 0}]}),
  sc(287, 'd7-08-rocket', 'in', 'Б — испытания', {ov: [{k: 'abc', one: 1}]}),
  sc(288, 'd7-09-infrasound', 'in', 'В — непонятное', {ov: [{k: 'abc', one: 2}]}),
  sc(289, 'd8-04-choice', 'in', 'пиши в комментах', {ov: [{k: 'big', a: 'НАПИШИ БУКВУ В КОММЕНТАРИЯХ', size: 80, y: 220}]}),
  sc(291, 'thumb-bg', 'in', 'подпишись', {ov: [{k: 'big', a: 'ПОДПИШИСЬ', size: 130, red: true}]}),
];

type ScT = Sc & {from: number; to: number; key: number};
const SC: ScT[] = SCENES.map((s, i) => {
  const from = i === 0 ? 0 : S(s.line) - 0.15;
  const nxt = SCENES[i + 1];
  const to = nxt ? S(nxt.line) - 0.15 : TOTAL;
  const hasCount = s.ov?.some((o) => o.k === 'count' || o.k === 'seq' || o.k === 'route');
  const dur = to - from;
  let key = from + dur * 0.55;
  if (hasCount) key = to - Math.min(0.6, dur * 0.1);
  if (s.title) key = from + Math.min(dur * 0.5, 1.6);
  return {...s, from, to, key};
});

// ---------- camera ----------
const cam = (s: ScT, k: number, t: number) => {
  const base = s.z ?? 1.06;
  let z = base, cx = s.fx ?? 0.5, cy = s.fy ?? 0.5;
  const d = 0.06;
  switch (s.mv) {
    case 'in': z = lerp(base, base * 1.12, k); break;
    case 'out': z = lerp(base * 1.12, base, k); break;
    case 'right': z = Math.max(base, 1.16); cx += lerp(-d, d, k); break;
    case 'left': z = Math.max(base, 1.16); cx += lerp(d, -d, k); break;
    case 'down': z = Math.max(base, 1.16); cy += lerp(-d, d, k); break;
    case 'up': z = Math.max(base, 1.16); cy += lerp(d, -d, k); break;
    case 'shake': z = lerp(base * 1.08, base * 1.14, k); cx += Math.sin(t * 13) * 0.003 + Math.sin(t * 7.3) * 0.002; cy += Math.cos(t * 11) * 0.003; break;
    case 'still': z = lerp(base, base * 1.03, k); break;
  }
  const m = 0.5 / z;
  cx = clamp(cx, m, 1 - m); cy = clamp(cy, m, 1 - m);
  return {z, cx, cy};
};

// outdoor winter stills get falling snow (density, wind)
const SNOW: Record<string, [number, number]> = {
  'tent-night': [1, 1], 'd0-02-cut': [0.9, 1.4], 'd0-03-footprints': [0.8, 1.2], 'd0-03-footprints-socks': [0.6, 1.2], 'd0-05-ridge': [1, 1.6],
  'd2-03-skitrack': [0.4, 0.4], 'd2-04-yudin': [0.4, 0.4], 'd2-02-kvartal': [0.4, 0.3], 'd3-01-river': [0.5, 1], 'd3-02-labaz': [0.3, 0.5],
  'd3-03-slope-dusk': [0.6, 1.4], 'd3-04-platform': [0.5, 1], 'd3-05-tent-evening': [0.8, 1.2], 'd4-01-blizzard': [1.8, 2.6],
  'd4-02-socks': [0.7, 1.4], 'd4-03-descent': [1, 1.6], 'd4-04-forest-edge': [0.7, 1], 'd5-02-search': [0.3, 0.5], 'd5-03-tent-found': [0.3, 0.6],
  'd5-05-cedar': [0.3, 0.4], 'd5-06-line': [0.3, 0.5], 'd5-07-probing': [0.4, 0.5], 'd7-02-slab': [0.8, 1.4], 'd7-03-ridge': [1.2, 2],
  'd7-09-infrasound': [0.6, 1.4], 'd8-03-dawn': [0.3, 0.3], 'd1-04-ural': [0.2, 0.3], 'd0-04-inside': [0.2, 0.3], 'thumb-bg': [0.5, 0.8],
  'd8-04-choice': [0.4, 0.8], 'd1-01-sverdlovsk': [0.5, 0.2], 'd2-05-camp': [0.3, 0.2], 'd8-01-memorial': [0.2, 0.4],
};
const DRIFT = new Set(['tent-night', 'd0-03-footprints', 'd3-03-slope-dusk', 'd3-05-tent-evening', 'd4-01-blizzard', 'd4-03-descent', 'd7-03-ridge', 'd0-05-ridge']);
const bgPath = (img: string) => (img === 'thumb-bg' ? 'dyatlov/thumb/thumb-bg.png' : `dyatlov/bg/${img}.png`);

const Background: React.FC<{s: ScT; k: number; t: number}> = ({s, k, t}) => {
  const {z, cx, cy} = cam(s, k, t);
  const tx = W / 2 - cx * W * z, ty = H / 2 - cy * H * z;
  const dark = s.dark ?? 0;
  const snow = SNOW[s.img];
  return (
    <AbsoluteFill style={{background: '#05070c', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
        <Img src={staticFile(bgPath(s.img))} style={{width: W, height: H, objectFit: 'cover',
          filter: `brightness(${1.06 - dark}) contrast(1.05)${s.blur ? ' blur(10px)' : ''}`}} />
        <div style={{position: 'absolute', left: -700 + ((t - s.from) * 60) % 2600, top: -80, width: 1300, height: 520,
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,195,255,0.12), rgba(170,195,255,0) 70%)', filter: 'blur(30px)'}} />
        {DRIFT.has(s.img) && <GroundDrift t={t} o={0.8} />}
      </div>
      {snow && !s.blur && <Snow t={t} density={snow[0]} wind={snow[1]} />}
    </AbsoluteFill>
  );
};

// ---------- overlays ----------
const TXT: React.CSSProperties = {fontFamily: FONT, fontWeight: 900, color: '#fff', WebkitTextStroke: '8px #05070c', paintOrder: 'stroke fill', textShadow: '0 5px 0 #05070c, 0 0 24px rgba(0,0,0,0.7)'};
const appear = (t: number, at: number, d = 0.35) => easeInOut(clamp((t - at) / d));

const Plate: React.FC<{a: string; b?: string; p: number}> = ({a, b, p}) => (
  <div style={{position: 'absolute', left: 70, top: 64, opacity: p, transform: `translateX(${(1 - p) * -30}px)`, borderLeft: '8px solid #d33', paddingLeft: 24}}>
    <div style={{...TXT, fontSize: 64, WebkitTextStroke: '6px #05070c'}}>{a}</div>
    {b && <div style={{...TXT, fontSize: 38, fontWeight: 800, color: '#cfd8ea', WebkitTextStroke: '5px #05070c', marginTop: 4}}>{b}</div>}
  </div>
);

const Big: React.FC<{a: string; p: number; red?: boolean; y?: number; size?: number}> = ({a, p, red, y, size = 150}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: y ?? H / 2 - size * 0.75, textAlign: 'center', opacity: p, transform: `scale(${lerp(0.9, 1, p)})`}}>
    <span style={{...TXT, fontSize: size, color: red ? '#ff3b3b' : '#fff', WebkitTextStroke: `${Math.round(size * 0.09)}px #05070c`}}>{a}</span>
  </div>
);

const fmt = (v: number, dec = 0) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(dec).replace('.', ',');

// face / body crop from a character sheet (2752×1536): 4 heads at x 0.25/0.42/0.59/0.76, y≈0.79; front view at x≈0.33
const FACE_X = [0.25, 0.42, 0.59, 0.76];
const Crop: React.FC<{who: Who; face?: number; body?: boolean; w: number; h: number}> = ({who, face = 0, body, w, h}) => {
  const cx = body ? 0.33 : FACE_X[face], cy = body ? 0.33 : 0.79, fw = body ? 0.16 : 0.15;
  const iw = w / fw, ih = iw * (1536 / 2752);
  return (
    <div style={{width: w, height: h, overflow: 'hidden', position: 'relative', borderRadius: 18, background: '#d9dbe0',
      boxShadow: '0 20px 60px rgba(0,0,0,0.7)', border: '6px solid #e9e4d6'}}>
      <Img src={staticFile(`dyatlov/bg/char-${who}-sheet.png`)} style={{position: 'absolute', width: iw, height: ih, left: w / 2 - cx * iw, top: h / 2 - cy * ih}} />
    </div>
  );
};

const Card: React.FC<{o: Extract<Ov, {k: 'card'}>; p: number}> = ({o, p}) => {
  const body = !!o.body;
  const w = body ? 360 : 460, h = body ? 720 : 560;
  const textOnly = !o.name && !o.sub;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 70, opacity: p,
      transform: `translateY(${(1 - p) * 30}px)`, paddingBottom: body ? 170 : 120}}>
      <Crop who={o.who} face={o.face} body={body} w={w} h={h} />
      {!textOnly && (
        <div style={{maxWidth: 820}}>
          {o.name && <div style={{...TXT, fontSize: 78, lineHeight: 1.05}}>{o.name}</div>}
          {o.sub && <div style={{...TXT, fontSize: 44, fontWeight: 800, color: '#ffd27a', WebkitTextStroke: '6px #05070c', marginTop: 18}}>{o.sub}</div>}
        </div>
      )}
    </div>
  );
};

// route on d1-03-map (follows the pencil line), in image coordinates 0..1
const ROUTE = [[0.356, 0.884], [0.4375, 0.671], [0.4875, 0.492], [0.55, 0.358], [0.594, 0.28]];
const Route: React.FC<{o: Extract<Ov, {k: 'route'}>; s: ScT; t: number}> = ({o, s, t}) => {
  const {z, cx, cy} = cam(s, easeInOut(clamp((t - s.from) / (s.to - s.from))), t);
  const P = (q: number[]) => [W / 2 + (q[0] - cx) * W * z, H / 2 + (q[1] - cy) * H * z];
  const pts = ROUTE.map(P);
  const d = 'M ' + pts.map((q) => q.join(' ')).join(' L ');
  const len = pts.reduce((a, q, i) => (i ? a + Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0);
  const draw = o.draw ? clamp((t - s.from - 0.3) / Math.max(1, (s.to - s.from) * 0.7)) : 1;
  const stops = [{a: 'ИВДЕЛЬ', u: 0.1, at: 80}, {a: 'ВИЖАЙ', u: 0.3, at: 81}, {a: '41-Й КВАРТАЛ', u: 0.52, at: 82}];
  const along = (u: number) => { const f = u * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), r = f - i; return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)]; };
  const peak = pts[pts.length - 1];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <path d={d} fill="none" stroke="#e8322a" strokeWidth={9} strokeLinecap="round" strokeDasharray={`${len * draw} ${len}`} style={{filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.6))'}} />
      {o.stops && stops.map((st, i) => {
        const [x, y] = along(st.u), p = appear(t, S(st.at) - 0.1);
        return <g key={i} opacity={p}><circle cx={x} cy={y} r={16} fill="#e8322a" stroke="#05070c" strokeWidth={5} />
          <text x={x + 34} y={y + 16} fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff" stroke="#05070c" strokeWidth={8} paintOrder="stroke">{st.a}</text></g>;
      })}
      {(o.peak || o.label) && <g opacity={appear(t, s.from + 0.5)}>
        <path d={`M ${peak[0]} ${peak[1] - 70} l -30 50 h 60 Z`} fill="#e8322a" stroke="#05070c" strokeWidth={5} />
        <text x={peak[0] + 50} y={peak[1] - 40} fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fff" stroke="#05070c" strokeWidth={9} paintOrder="stroke">{o.label}</text></g>}
    </svg>
  );
};

const ABC = [{l: 'А', a: 'ЛАВИНА'}, {l: 'Б', a: 'ВОЕННЫЕ ИСПЫТАНИЯ'}, {l: 'В', a: 'ЧТО-ТО НЕПОНЯТНОЕ'}];
const Abc: React.FC<{one?: number; s: ScT; t: number}> = ({one, s, t}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 50}}>
    {ABC.map((c, i) => {
      if (one !== undefined && one !== i) return null;
      const p = appear(t, s.from + 0.2 + (one === undefined ? i * 0.35 : 0));
      return (
        <div key={i} style={{width: one !== undefined ? 900 : 480, padding: '30px 20px', background: 'rgba(5,7,12,0.72)', border: '5px solid #e9e4d6',
          borderRadius: 22, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
          <div style={{...TXT, fontSize: one !== undefined ? 200 : 150, color: '#ff3b3b', lineHeight: 1}}>{c.l}</div>
          <div style={{...TXT, fontSize: one !== undefined ? 70 : 44, marginTop: 10}}>{c.a}</div>
        </div>
      );
    })}
  </div>
);

const Overlay: React.FC<{o: Ov; s: ScT; t: number}> = ({o, s, t}) => {
  const p = appear(t, s.from + 0.25);
  switch (o.k) {
    case 'plate': return <Plate a={o.a} b={o.b} p={p} />;
    case 'big': return <Big a={o.a} p={appear(t, s.from + 0.35)} red={o.red} y={o.y} size={o.size} />;
    case 'count': {
      const u = easeInOut(clamp((t - s.from - 0.3) / 1.3));
      return <Big a={fmt(lerp(o.from ?? 0, o.to, u), o.dec) + (o.suf ?? '')} p={p} red={o.red} size={170} />;
    }
    case 'title': {
      const out = s.title ? 1 - clamp((t - s.from - 3.2) / 0.5) : 1;
      return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p * out, paddingBottom: 120}}>
          <div style={{...TXT, fontSize: 60, color: '#ff3b3b', letterSpacing: 8}}>{/^\d+$/.test(o.n) ? `ГЛАВА ${o.n}` : o.n}</div>
          <div style={{...TXT, fontSize: 150, lineHeight: 1.05, textAlign: 'center', maxWidth: 1700}}>{o.a}</div>
          {o.b && <div style={{...TXT, fontSize: 48, color: '#cfd8ea', WebkitTextStroke: '6px #05070c', marginTop: 10}}>{o.b}</div>}
        </div>
      );
    }
    case 'card': return <Card o={o} p={p} />;
    case 'seq': {
      const withFaces = o.items.some((it) => it.who);
      if (withFaces) return (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, paddingBottom: 140}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 30}px)`, textAlign: 'center'}}>
              <Crop who={it.who!} w={400} h={490} />
              <div style={{...TXT, fontSize: 44, marginTop: 20, WebkitTextStroke: '6px #05070c'}}>{it.a}</div>
            </div>); })}
        </div>
      );
      if (o.items.length > 5) return ( // many short items (the nine names): centred rows, clear of the subtitles
        <div style={{position: 'absolute', left: 160, right: 160, top: 250, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 46px'}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{...TXT, fontSize: 88, opacity: q, transform: `translateY(${(1 - q) * 20}px)`, WebkitTextStroke: '9px #05070c'}}>{it.a}</div>); })}
        </div>
      );
      return (
        <div style={{position: 'absolute', left: 0, right: 0, top: o.big ? 300 : 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: o.big ? 30 : 14}}>
          {o.items.map((it, i) => { const q = appear(t, S(it.at) - 0.1); return (
            <div key={i} style={{...TXT, fontSize: o.big ? 120 : o.items.length > 5 ? 62 : 66, opacity: q, transform: `translateY(${(1 - q) * 20}px)`,
              WebkitTextStroke: `${o.big ? 11 : 7}px #05070c`}}>{it.a}</div>); })}
        </div>
      );
    }
    case 'quote': return (
      <div style={{position: 'absolute', left: 200, right: 200, top: 240, padding: '50px 60px', background: 'rgba(5,7,12,0.7)', borderLeft: '10px solid #d33',
        borderRadius: 14, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontStyle: 'italic', fontSize: 64, color: '#f2ead8', lineHeight: 1.25, textAlign: 'center'}}>{o.a}</div>
      </div>
    );
    case 'stamp': return (
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', opacity: p}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 150, color: '#ff3b3b', border: '12px solid #ff3b3b', padding: '6px 50px', borderRadius: 16,
          transform: `rotate(-8deg) scale(${lerp(1.4, 1, p)})`, background: 'rgba(5,7,12,0.45)', textShadow: '0 0 20px rgba(0,0,0,0.6)'}}>{o.a}</div>
      </div>
    );
    case 'route': return <Route o={o} s={s} t={t} />;
    case 'abc': return <Abc one={o.one} s={s} t={t} />;
    case 'ring': {
      const {z, cx, cy} = cam(s, easeInOut(clamp((t - s.from) / (s.to - s.from))), t);
      const x = W / 2 + (o.x - cx) * W * z, y = H / 2 + (o.y - cy) * H * z;
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: p}}>
          <ellipse cx={x} cy={y} rx={300 * lerp(1.3, 1, p)} ry={110 * lerp(1.3, 1, p)} fill="none" stroke="#ff3b3b" strokeWidth={10} strokeDasharray="34 16" />
          <text x={x} y={y - 150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill="#fff" stroke="#05070c" strokeWidth={12} paintOrder="stroke">{o.a}</text>
        </svg>
      );
    }
    case 'line3': {
      const y = 330;
      const pts = [{x: 320, a: 'КЕДР'}, {x: 720, a: 'ДЯТЛОВ'}, {x: 1000, a: 'СЛОБОДИН'}, {x: 1280, a: 'КОЛМОГОРОВА'}, {x: 1640, a: 'ПАЛАТКА'}];
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <rect x={200} y={y - 130} width={1560} height={260} rx={20} fill="rgba(5,7,12,0.62)" opacity={p} />
          <line x1={320} y1={y} x2={320 + 1320 * appear(t, s.from + 0.3, 1.2)} y2={y} stroke="#e8322a" strokeWidth={7} strokeDasharray="22 12" />
          {pts.map((q, i) => { const o2 = appear(t, s.from + 0.3 + i * 0.3); return (
            <g key={i} opacity={o2}>
              <circle cx={q.x} cy={y} r={i === 0 || i === 4 ? 22 : 15} fill={i === 0 || i === 4 ? '#e9e4d6' : '#e8322a'} stroke="#05070c" strokeWidth={5} />
              <text x={q.x} y={y + (i % 2 ? -50 : 75)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" stroke="#05070c" strokeWidth={7} paintOrder="stroke">{q.a}</text>
            </g>); })}
        </svg>
      );
    }
    case 'angle': {
      const x0 = 520, y0 = 640, a = (28 * Math.PI) / 180, len = 760;
      return (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: p}}>
          <line x1={x0} y1={y0} x2={x0 + len} y2={y0} stroke="#fff" strokeWidth={8} />
          <line x1={x0} y1={y0} x2={x0 + len * Math.cos(a)} y2={y0 - len * Math.sin(a)} stroke="#e8322a" strokeWidth={10} />
          <path d={`M ${x0 + 220} ${y0} A 220 220 0 0 0 ${x0 + 220 * Math.cos(a)} ${y0 - 220 * Math.sin(a)}`} fill="none" stroke="#fff" strokeWidth={6} />
          <text x={x0 + 280} y={y0 - 50} fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fff" stroke="#05070c" strokeWidth={13} paintOrder="stroke">&lt; 30°</text>
        </svg>
      );
    }
  }
  return null;
};

// ---------- subtitles (16:9): chunks of up to 5 words, keywords red ----------
const RED = ['изнутри', 'мёртв', 'разрез', 'босиком', 'носках', 'стихийная', 'лавин', 'испытани', 'инфразвук', 'кедр', 'радиац', 'живыми', 'ужас', 'страх'];
const RED_EXACT = new Set(['девять', 'девятерых', 'один', 'девятеро']); // whole words only («девятьсот» stays white)
const clean = (w: string) => w.toLowerCase().replace(/[^а-яёa-z-]/g, '');
const isRed = (w: string) => RED_EXACT.has(clean(w)) || RED.some((r) => clean(w).startsWith(r));
type CapW = {w: string; t: number; red: boolean};
type Cap = {start: number; end: number; words: CapW[]};
const CAPS: Cap[] = [];
L.forEach((l, k) => {
  const next = L[k + 1];
  const lineEnd = Math.min(next ? next.start - 0.05 : TOTAL, l.end + 0.6);
  const ws: CapW[] = l.text.split(' ').map((w, j) => ({w, t: l.words[j]?.t ?? l.start, red: isRed(w)})).filter((w) => w.w !== '—');
  const chunks: CapW[][] = [];
  let cur: CapW[] = [];
  ws.forEach((w) => {
    if (cur.length && (cur.length >= 5 || cur.map((c) => c.w).join(' ').length + w.w.length > 30)) { chunks.push(cur); cur = []; }
    cur.push(w);
    if (/[.!?:…»]$/.test(w.w) || (/,$/.test(w.w) && cur.length >= 3)) { chunks.push(cur); cur = []; }
  });
  if (cur.length) chunks.push(cur);
  chunks.forEach((c, n) => CAPS.push({start: c[0].t - 0.05, end: n + 1 < chunks.length ? chunks[n + 1][0].t - 0.05 : lineEnd, words: c}));
});

const Captions: React.FC<{t: number}> = ({t}) => {
  const c = CAPS.find((c) => t >= c.start && t < c.end);
  if (!c) return null;
  return (
    <div style={{position: 'absolute', left: 140, right: 140, bottom: 70, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 20px'}}>
      {c.words.map((w, i) => {
        const k = clamp((t - w.t + 0.05) / 0.12);
        return <span key={i} style={{...TXT, fontSize: 62, color: w.red ? '#ff3b3b' : '#fff', opacity: lerp(0.35, 1, k), WebkitTextStroke: '9px #05070c'}}>{w.w}</span>;
      })}
    </div>
  );
};

// ---------- one moment of the film ----------
export const ShotAt: React.FC<{t: number; f: number; caps?: boolean}> = ({t, f, caps = true}) => {
  ensureFont();
  let i = SC.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) i = t < 0 ? 0 : SC.length - 1;
  const s = SC[i];
  const k = easeInOut(clamp((t - s.from) / Math.max(0.1, s.to - s.from)));
  // dip to black into every chapter title, short crossfade-ish flash elsewhere
  const dip = s.title ? clamp(1 - (t - s.from) / 0.6) : clamp(1 - (t - s.from) / 0.12) * 0.35;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Background s={s} k={k} t={t} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(10,20,45,0) 55%, rgba(5,8,18,0.45))'}} />
      <Vignette o={0.5} />
      {s.ov?.map((o, n) => <Overlay key={n} o={o} s={s} t={t} />)}
      <Grain f={f} o={0.07} />
      {caps && <Captions t={t} />}
      {dip > 0 && <AbsoluteFill style={{background: '#000', opacity: dip}} />}
    </AbsoluteFill>
  );
};

export const SCENE_COUNT = SC.length;
export const SCENE_NAMES = SC.map((s, i) => `${i + 1}. ${s.name}`);

export const Storyboard: React.FC = () => {
  const f = useCurrentFrame();
  const s = SC[Math.min(f, SC.length - 1)];
  return <ShotAt t={s.key} f={Math.round(s.key * 30)} />;
};

export const Dyatlov: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ShotAt t={f / 30} f={f} />
      <Audio src={staticFile('dyatlov/mix.wav')} />
    </AbsoluteFill>
  );
};
