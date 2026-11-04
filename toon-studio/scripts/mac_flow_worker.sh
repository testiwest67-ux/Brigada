#!/bin/bash
# Mac helper for the cloud Claude: picks up image tasks from git and runs them with Claude Code + flow-mcp.
#
#   caffeinate -dis bash ~/Brigada/toon-studio/scripts/mac_flow_worker.sh
#
# Every 2 minutes: git pull → if toon-studio/_tmp/mac-tasks/task.md has a new "ID:" line, run it once with
#   claude -p (only the flow tools, file reading and cp/mkdir/ls/sips are allowed — everything else is denied),
# then commit the new pictures + the report and push. Ctrl+C stops it. The Chrome window with Flow must stay open.
REPO="$HOME/Brigada"
BRANCH="claude/wizardly-curie-8czgnr"
TASK="toon-studio/_tmp/mac-tasks/task.md"
DONE_FILE="$HOME/.flow-worker-last-id"
export FLOW_MCP_OUTPUT="$REPO/toon-studio/_tmp/flow-out"   # Flow downloads land inside the project (git ignores _tmp)
CLAUDE="$(command -v claude)"

cd "$REPO" || { echo "Нет папки $REPO"; exit 1; }
mkdir -p "$FLOW_MCP_OUTPUT"
echo "Помощник запущен $(date '+%H:%M'). Жду задания из git (каждые 2 минуты). Ctrl+C — остановить."

while true; do
  git pull -q --rebase --autostash origin "$BRANCH" 2>/dev/null || echo "$(date '+%H:%M') git pull не удался — попробую позже"
  if [ -f "$TASK" ]; then
    ID="$(grep -m1 '^ID:' "$TASK" | sed 's/^ID: *//')"
    LAST="$(cat "$DONE_FILE" 2>/dev/null)"
    if [ -n "$ID" ] && [ "$ID" != "$LAST" ]; then
      echo "$(date '+%H:%M') Новое задание: $ID — запускаю Claude с Flow…"
      REPORT="toon-studio/_tmp/mac-tasks/report-$ID.md"
      "$CLAUDE" -p "$(cat "$TASK")" \
        --permission-mode dontAsk \
        --allowedTools "mcp__flow" "Read" "Glob" "Grep" "Bash(cp:*)" "Bash(mkdir:*)" "Bash(ls:*)" "Bash(sips:*)" \
        > "$REPORT" 2>&1
      echo "$ID" > "$DONE_FILE"
      git add toon-studio/public/dyatlov/bg 2>/dev/null
      git add -f "$REPORT"
      if ! git diff --cached --quiet; then
        git commit -q -m "Mac: картинки из Flow ($ID)" && { git push -q origin "$BRANCH" || { git pull -q --rebase origin "$BRANCH" && git push -q origin "$BRANCH"; }; } \
          && echo "$(date '+%H:%M') Готово: $ID отправлено в git" \
          || echo "$(date '+%H:%M') Не смог отправить в git — проверь интернет"
      else
        echo "$(date '+%H:%M') $ID: новых файлов нет, смотри $REPORT"
      fi
    fi
  fi
  sleep 120
done
