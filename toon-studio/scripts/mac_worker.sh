#!/bin/bash
# Общий помощник на Mac для облачного Claude: берёт задания из git и выполняет их через Claude Code.
#
#   caffeinate -dis bash ~/Brigada/toon-studio/scripts/mac_worker.sh
#
# Задания: toon-studio/_tmp/mac-tasks/queue/*.md (по алфавиту), в каждом строки «ID: …» и «TYPE: …».
# Старый toon-studio/_tmp/mac-tasks/task.md тоже читается (TYPE по умолчанию flow).
# Типы и что им разрешено:
#   flow       картинки/видео в Google Flow (mcp__flow, cp, mkdir, ls, sips)        — папка репозитория
#   voice      голос: auto_spec / assemble_voice / voice_check (+ ffprobe, cp …)    — папка toon-studio
#   keyframes  листы главных кадров: keyframes_sheet.py, render.mjs stills/sheet    — папка toon-studio
#   render     ролик / превью в Remotion: render.mjs                               — папка toon-studio
# Две дорожки: flow — строго по одному заданию (окно Flow одно), остальные — по одному на второй дорожке,
# параллельно с flow. Удалять файлы не разрешено никому. Отчёт: _tmp/mac-tasks/report-<ID>.md,
# файлы для облака: _tmp/mac-tasks/out/<ID>/ (в git уходят файлы до 50 МБ).
# Каждый ID выполняется один раз (список: ~/.mac-worker/done.txt). Чтобы повторить — новый ID.
# Каждые 2 минуты git pull. Ctrl+C — остановить. Окно Chrome с Flow должно оставаться открытым.
REPO="$HOME/Brigada"
TS="$REPO/toon-studio"
BRANCH="claude/wizardly-curie-8czgnr"
QUEUE="toon-studio/_tmp/mac-tasks/queue"
LEGACY="toon-studio/_tmp/mac-tasks/task.md"
STATE="$HOME/.mac-worker"
DONE="$STATE/done.txt"
VENV="$STATE/venv"
CLAUDE="$(command -v claude)"
export FLOW_MCP_OUTPUT="$TS/_tmp/flow-out"
export PATH="$VENV/bin:/opt/homebrew/opt/ffmpeg-full/bin:$PATH"   # python3 с numpy/Pillow, ffmpeg с субтитрами

log() { echo "$(date '+%H:%M') $*"; }
cd "$REPO" || { echo "Нет папки $REPO"; exit 1; }
mkdir -p "$STATE/lanes" "$STATE/finished" "$FLOW_MCP_OUTPUT"
touch "$DONE"
# задание, сделанное старым помощником, не повторяем
[ -f "$HOME/.flow-worker-last-id" ] && cat "$HOME/.flow-worker-last-id" >> "$DONE"

# --- подготовка (один раз) ---
if [ ! -x "$VENV/bin/python3" ]; then
  log "Ставлю numpy и Pillow в $VENV …"
  /usr/bin/python3 -m venv "$VENV" && "$VENV/bin/pip" install -q numpy pillow || log "Не смог поставить numpy/Pillow"
fi
if [ ! -d "$TS/node_modules" ]; then
  log "Ставлю пакеты Remotion (npm install) …"
  (cd "$TS" && npm install --no-audit --no-fund > "$STATE/npm-install.log" 2>&1) || log "npm install не удался, см. $STATE/npm-install.log"
fi

tools_for() {  # заполняет массив TOOLS; код 1 — неизвестный тип
  local common=("Read" "Glob" "Grep" "Bash(cp:*)" "Bash(mkdir:*)" "Bash(ls:*)")
  case "$1" in
    flow)      TOOLS=("mcp__flow" "${common[@]}" "Bash(sips:*)") ;;
    voice)     TOOLS=("${common[@]}" "Bash(python3 scripts/auto_spec.py:*)" "Bash(python3 scripts/assemble_voice.py:*)"
                      "Bash(python3 scripts/voice_check.py:*)" "Bash(ffprobe:*)") ;;
    keyframes) TOOLS=("${common[@]}" "Bash(python3 scripts/keyframes_sheet.py:*)" "Bash(node scripts/render.mjs stills:*)"
                      "Bash(node scripts/render.mjs sheet:*)") ;;
    render)    TOOLS=("${common[@]}" "Bash(node scripts/render.mjs:*)" "Bash(ffprobe:*)") ;;
    *)         TOOLS=(); return 1 ;;
  esac
}

lane_busy() {  # $1 = lane; занята, если её процесс ещё жив
  local f="$STATE/lanes/$1"
  [ -f "$f" ] && kill -0 "$(cat "$f")" 2>/dev/null
}

start_task() {  # $1 = файл задания, $2 = ID, $3 = TYPE
  local file="$1" id="$2" type="$3" lane wd
  [ "$type" = flow ] && lane=flow || lane=work
  [ "$type" = flow ] && wd="$REPO" || wd="$TS"
  local report="$REPO/toon-studio/_tmp/mac-tasks/report-$id.md"
  local prompt
  prompt="$(cat "$file")

---
(Помощник на Mac: тип задания $type, рабочая папка $wd. Файлы для облачного Claude клади в
$REPO/toon-studio/_tmp/mac-tasks/out/$id/. Ничего не удаляй. В конце коротко по-русски: что сделано, где файлы.)"
  mkdir -p "$REPO/toon-studio/_tmp/mac-tasks/out/$id"
  echo "$id" >> "$DONE"
  log "Новое задание $id ($type) — запускаю…"
  tools_for "$type"
  ( cd "$wd" && "$CLAUDE" -p "$prompt" --permission-mode dontAsk --allowedTools "${TOOLS[@]}" > "$report" 2>&1
    echo "$type" > "$STATE/finished/$id" ) &
  echo $! > "$STATE/lanes/$lane"
}

commit_finished() {
  local m id type
  for m in "$STATE"/finished/*; do
    [ -f "$m" ] || continue
    id="$(basename "$m")"; type="$(cat "$m")"
    git add toon-studio/public 2>/dev/null
    git add -f "toon-studio/_tmp/mac-tasks/report-$id.md" 2>/dev/null
    find "toon-studio/_tmp/mac-tasks/out/$id" -type f -size -50M -print0 2>/dev/null | xargs -0 git add -f 2>/dev/null
    if ! git diff --cached --quiet; then
      git commit -q -m "Mac: $type ($id)" && { git push -q origin "$BRANCH" || { git pull -q --rebase origin "$BRANCH" && git push -q origin "$BRANCH"; }; } \
        && log "Готово: $id отправлено в git" || log "Не смог отправить $id в git — проверь интернет"
    else
      log "$id: новых файлов нет, смотри report-$id.md"
    fi
    rm -f "$m"   # служебная метка помощника, не файл проекта
  done
}

log "Общий помощник запущен. Жду задания из git (каждые 2 минуты). Ctrl+C — остановить."
while true; do
  commit_finished
  git pull -q --rebase --autostash origin "$BRANCH" 2>/dev/null || log "git pull не удался — попробую позже"
  for file in "$LEGACY" "$QUEUE"/*.md; do
    [ -f "$file" ] || continue
    id="$(grep -m1 '^ID:' "$file" | sed 's/^ID: *//; s/[[:space:]]*$//')"
    type="$(grep -m1 '^TYPE:' "$file" | sed 's/^TYPE: *//; s/[[:space:]]*$//')"
    [ -z "$type" ] && type=flow
    [ -z "$id" ] && continue
    grep -qxF "$id" "$DONE" && continue
    if ! tools_for "$type"; then log "$id: неизвестный TYPE «$type» — пропускаю"; echo "$id" >> "$DONE"; continue; fi
    [ "$type" = flow ] && lane=flow || lane=work
    lane_busy "$lane" && continue
    start_task "$file" "$id" "$type"
  done
  sleep 120
done
