ID: flow-cover-dyatlov-1
TYPE: flow

Задание от облачного Claude для помощника на Mac. Автоматический запуск: вопросов задать нельзя, find-skills и правила
общения из CLAUDE.md здесь не нужны. Не меняй никакие файлы, кроме новых картинок в toon-studio/public/dyatlov/cover/.

Нужны 6 картинок для обложки YouTube «Перевал Дятлова» в стиле РЕАЛИСТИЧНОГО ФОТО (НЕ рисунок, НЕ мультяшный стиль,
образцы стиля из bg НЕ использовать). Google Flow, Nano Banana Pro (если нет — Nano Banana 2.1), самое большое разрешение.
Общий стиль — дописать в конец КАЖДОГО запроса:
«Photorealistic cinematic photograph, cold blue-grey monochrome color grading, deep shadows, heavy film grain, harsh winter,
dramatic, gritty, high detail. Absolutely no text, no letters, no logos, no watermark.»

1. cover-bg.png — 16:9: «Night in the snowy Ural mountains during a blizzard. A huge sharp snowy mountain peak in the upper
   centre under dark stormy clouds. In the lower centre, far below, a single long low canvas tent half-buried in snow on a bare
   slope, a line of footprints in the snow leading away from it down towards the dark pine forest. Snow-covered pine trees on the
   left and right edges. Wide shot, plenty of empty dark sky.»
2. cover-hikers.png — 4:3: «Four mountaineers seen from behind walking in a line up a snowy ridge in a snowstorm, big 1950s
   canvas backpacks, wooden ski poles, fur hats, dark silhouettes against white snow and grey sky. Vintage 1950s photograph.»
3. cover-group.png — 16:9: «Nine young hikers in 1950s winter clothes standing in a row on snow, full body, small in the frame,
   faces not visible (too far / turned away / covered by hoods and scarves), snowy forest behind. Faded vintage photograph,
   scratches.»
4. cover-map.png — 4:3: «Top-down close-up of an old worn paper topographic map of mountains, contour lines, rivers, folds and
   creases, coffee stains, no readable words.»
5. cover-compass.png — 1:1: «Top-down close-up of an old brass pocket compass with a cracked glass, frost on the metal, lying on
   dark ice. Dark background around it.»
6. cover-sign.png — 3:4 (вертикальная): «An old wooden trail signpost with two blank arrow boards pointing left, thick snow on
   top, long icicles hanging from the boards, in a dark snowy pine forest at night during a blizzard. Boards are completely
   blank.»

Для каждой: посмотри результаты, выбери лучший (без букв и надписей, реалистичный, холодный сине-серый), переведи в PNG:
mkdir -p toon-studio/public/dyatlov/cover
sips -s format png <файл> --out toon-studio/public/dyatlov/cover/<имя>.png
Если ни один вариант не подходит — сгенерируй ещё раз (максимум 2 попытки на картинку).

В конце ответь коротко по-русски списком: имя файла — готово / не получилось (почему), сколько кредитов Flow ушло.
