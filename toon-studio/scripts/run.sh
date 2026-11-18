#!/bin/bash
# Запуск скриптов проекта с нужным ffmpeg и python без переменных в командной строке
# (иначе Claude Code при запрете чтения вне папки спрашивает разрешение на каждую команду).
#   bash scripts/run.sh py scripts/sfx.py ...   → python из ~/.mac-worker/venv
#   bash scripts/run.sh ffmpeg ...              → ffmpeg-full
export PATH=/opt/homebrew/opt/ffmpeg-full/bin:/opt/homebrew/bin:$PATH
cd /Users/makentosh/Brigada/toon-studio
if [ "$1" = "py" ]; then shift; exec /Users/makentosh/.mac-worker/venv/bin/python3 "$@"; fi
exec "$@"
