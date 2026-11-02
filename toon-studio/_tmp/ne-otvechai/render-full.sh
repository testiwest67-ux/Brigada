#!/bin/bash
# full render of «Не отвечай» in this cloud (no GPU): progress goes to _tmp/ne-otvechai/render.log
cd /home/user/Brigada/toon-studio
export TOON_ENTRY=src/horror/index.ts TOON_GL=swangle TOON_THREADS=3 TOON_LOG=_tmp/ne-otvechai/render.log
export TOON_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/render.mjs render NeOtvechai out/ne-otvechai.mp4
