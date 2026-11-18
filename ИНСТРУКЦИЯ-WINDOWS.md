# Как перенести проект Brigada на Windows

Шаги идут по порядку. Команды вводить в **PowerShell** (Пуск → «PowerShell»).
Если команда не находится сразу после установки программы — закрыть PowerShell и открыть заново.

---

## 1. Поставить программы

Одной командой каждую (встроенный в Windows установщик `winget`):

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12
winget install Gyan.FFmpeg
```

- **Git** — чтобы скачать проект с GitHub и отправлять изменения.
- **Node.js** — на нём работает Remotion (рисует и собирает ролики).
- **Python** — скрипты озвучки, звука и листов кадров.
- **FFmpeg** (сборка Gyan «full») — уже с субтитрами и надписями на кадрах, как `ffmpeg-full` на Mac.

Проверка (каждая должна показать версию):

```powershell
git --version; node -v; py --version; ffmpeg -version
```

## 2. Поставить Claude Code

```powershell
irm https://claude.ai/install.ps1 | iex
```

Потом открыть PowerShell заново, набрать `claude` и войти **в тот же аккаунт Claude**, что на Mac.
Скиллы аккаунта (docx, pdf, xlsx, pptx, computer-use и др.) подтянутся сами — копировать их не нужно.

## 3. Скачать проект

```powershell
cd $HOME
git clone https://github.com/testiwest67-ux/Brigada.git
cd Brigada
git checkout windows
```

Git попросит войти в GitHub — откроется окно браузера, войти своим аккаунтом.

## 4. Поставить библиотеки проекта

```powershell
cd $HOME\Brigada\toon-studio
npm install
py -3 -m venv .venv
.venv\Scripts\python -m pip install numpy pillow scipy matplotlib edge-tts
```

`.venv` — отдельный Python для проекта. Запускатель `scripts/run.mjs` найдёт его сам.

## 5. Как запускать скрипты на Windows

На Mac было `bash scripts/run.sh …`. На Windows (и на Mac тоже) теперь:

```powershell
cd $HOME\Brigada\toon-studio
node scripts/run.mjs py scripts/voice_check.py ...       # python-скрипты
node scripts/run.mjs ffmpeg ...                          # ffmpeg
$env:TOON_ENTRY="src/lager/index.ts"; node scripts/render.mjs stills KtoLishniy _tmp/lager/stills 0
```

Переменные вида `TOON_ENTRY=… команда` в PowerShell пишутся так: `$env:TOON_ENTRY="…"; команда`.

Если Python или ffmpeg лежат в необычном месте — подсказать их пути:
`$env:TOON_PYTHON="C:\путь\python.exe"` и `$env:TOON_FFMPEG_DIR="C:\путь\ffmpeg\bin"`.

**Только для Mac (на Windows не работают и не нужны):**
- `toon-studio/scripts/run.sh` — старый запускатель, заменён `run.mjs`;
- `toon-studio/scripts/mac_worker.sh`, `mac_flow_worker.sh` — помощник Mac для облачного Claude (caffeinate, sips);
- `toon-studio/_tmp/*/render-*.sh` — команды рендера старых роликов, уже готовых;
- скилл `last30days`: `setup-keychain.sh` (связка ключей Mac) — на Windows ключи кладутся в файл `.env` (см. ниже).

## 6. Ключи и настройки — ввести заново

Сами ключи и пароли здесь не записаны. Взять их в своих кабинетах / на Mac.

| Что | Где ввести на Windows |
|---|---|
| Аккаунт **Claude** | `claude` → вход в браузере |
| Аккаунт **GitHub** | спросит сам при первом `git push` |
| Коннекторы claude.ai: **ElevenLabs, vidIQ, Google Drive, Claude Docs** | ничего делать не нужно — приходят с аккаунтом Claude (при необходимости переподключить на claude.ai → Settings → Connectors) |
| `ELEVENLABS_API_KEY` | файл `toon-studio\.env` (строка `ELEVENLABS_API_KEY=…`) — нужен только скриптам `tts.py` и скиллам `music` / `sound-effects` |
| Ключи скилла `last30days` (по желанию) | `~\.config\last30days\.env` — список названий в `.claude\skills\last30days\references\setup-wizard.md` |
| MCP-сервер **flow** (Google Flow) | см. шаг 7 |
| Разрешения Claude Code для проекта | файл `.claude\settings.local.json` — создать заново (на Mac там пути `/Users/makentosh/…`, на Windows свои). Пример ниже |

Пример `.claude\settings.local.json` для Windows:

```json
{"permissions":{"additionalDirectories":["C:\\Users\\ИМЯ\\flow-mcp-out"],"allow":["Bash","Read","Edit","Write","mcp__flow__*","Artifact"]}}
```

## 7. Что скопировать вручную (этого нет в GitHub)

Через флешку, внешний диск или облако. Класть в те же папки внутри `Brigada\toon-studio`.

| Папка на Mac | Размер | Что там |
|---|---|---|
| `toon-studio/public/` | ~4,5 ГБ | картинки, озвучка (`.wav`), фоны, звуки — **без неё ролики не соберутся** |
| `toon-studio/_tmp/` | ~2,1 ГБ | сценарии, листы кадров, превью, дубли голоса (`.mp3`, `.wav`, `.png`, `.mp4` в git не попадают) |
| `toon-studio/out/` | ~3,6 ГБ | готовые ролики — копировать, только если нужны |
| `/Users/makentosh/flow-mcp/` | ~73 МБ | MCP-сервер Google Flow → `C:\Users\ИМЯ\flow-mcp\`, потом в нём `npm install` и подключить: `claude mcp add flow -- node C:\Users\ИМЯ\flow-mcp\dist\index.js` |
| `~/.claude/projects/-Users-makentosh-Brigada/memory/` | мало | память Claude о проекте (правила, договорённости). На Windows папка проекта называется иначе: открыть проект в `claude` один раз, потом скопировать файлы в новую папку `~\.claude\projects\<имя проекта>\memory\` |

Не нужно копировать: `node_modules` (ставится `npm install`), `build`, `~/.mac-worker` (это Python Mac — на Windows свой `.venv`).

Удобно скопировать **всю** папку `toon-studio` с Mac поверх клона (кроме `node_modules`) — тогда ничего не потеряется.

## 8. Проверить, что всё работает

```powershell
cd $HOME\Brigada\toon-studio
node scripts/run.mjs py -c "import numpy, PIL; print('python ok')"
node scripts/run.mjs ffmpeg -hide_banner -filters | findstr drawtext
$env:TOON_ENTRY="src/lager/index.ts"; node scripts/run.mjs py scripts/keyframes_sheet.py src/lager/index.ts Storyboard _tmp/lager/кадры-сцен --names _tmp/lager/сцены.txt --only 1
```

Последняя команда должна нарисовать лист с первым кадром «Кто лишний?».
