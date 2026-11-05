# Задания для общего помощника на Mac (`scripts/mac_worker.sh`)

Помощник раз в 2 минуты делает `git pull` и выполняет новые задания через Claude Code на Mac пользователя.

## Как поставить задание
1. Создай файл `toon-studio/_tmp/mac-tasks/queue/<ID>.md` (имя = ID, порядок выполнения — по алфавиту).
2. Первые строки:
   ```
   ID: voice-1
   TYPE: voice
   ```
   Дальше — само задание по-русски, коротко и по шагам. Вопросов помощник задать не может.
3. Commit + push в ветку `claude/wizardly-curie-8czgnr`.

Каждый ID выполняется **один раз**. Чтобы повторить — дай новый ID (`voice-1b`).
Старый `task.md` тоже работает (без `TYPE:` = flow).

## Типы
| TYPE | Рабочая папка | Что разрешено |
|---|---|---|
| `flow` | `~/Brigada` | инструменты Flow (картинки 0 кредитов, видео тратит кредиты), `cp`, `mkdir`, `ls`, `sips` |
| `voice` | `toon-studio` | `python3 scripts/auto_spec.py`, `assemble_voice.py`, `voice_check.py`, `ffprobe`, `cp`, `mkdir`, `ls` |
| `keyframes` | `toon-studio` | `python3 scripts/keyframes_sheet.py`, `node scripts/render.mjs stills`/`sheet`, `cp`, `mkdir`, `ls` |
| `render` | `toon-studio` | `node scripts/render.mjs` (stills / sheet / preview / render), `ffprobe`, `cp`, `mkdir`, `ls` |

Всем можно читать файлы. Удалять и править код нельзя никому — код правит облачный Claude, помощник только запускает.
`flow` идёт строго по одному заданию; `voice` / `keyframes` / `render` — по одному на второй дорожке, параллельно с `flow`.
На Mac: python3 = venv с numpy и Pillow, ffmpeg = полная сборка (умеет `ass`/`drawtext`), `node_modules` поставлены.

## Что приходит обратно
- `_tmp/mac-tasks/report-<ID>.md` — ответ помощника.
- `_tmp/mac-tasks/out/<ID>/` — файлы для тебя (видео «только голос», листы кадров, превью). В git уходят файлы до 50 МБ.
- Изменения в `toon-studio/public/` (новые картинки, `voice.json`; `.wav` git не хранит).

## Пример
```
ID: voice-2
TYPE: voice

Собери голос «Перевала Дятлова» и проверь его (правило 9):
1. python3 scripts/auto_spec.py _tmp/dyatlov/главы.json public/dyatlov/el _tmp/dyatlov/voice-spec.json
2. python3 scripts/assemble_voice.py _tmp/dyatlov/voice-spec.json public/dyatlov
3. python3 scripts/voice_check.py public/dyatlov/voice.wav public/dyatlov/voice.json _tmp/mac-tasks/out/voice-2/только-голос.mp4 --min 0
В отчёте: длина, замечания автопроверки.
```

## Образцы (reference) во Flow — ВАЖНО (исправлено 05.11 ночью)
`asset:<название>` инструмент считает ПЕРСОНАЖЕМ и дописывает к запросу «CHARACTER LOCK — скопировать один в один».
Поэтому:
- образец СТИЛЯ или раскладки листа (новый персонаж «в том же стиле», новый фон «в том же стиле») — передавай **путём к файлу**
  (`/Users/makentosh/Brigada/toon-studio/public/.../x.png`): да, файл грузится заново для каждой сцены, но лишнего «копировать» нет;
- `asset:<название>` — только когда нужен ТОТ ЖЕ персонаж/предмет ещё раз (тот же смотритель в новой сцене).
- После постановки очереди проверь в ответе, нет ли в запросах «CHARACTER LOCK», если он не нужен.
