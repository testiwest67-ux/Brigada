#!/bin/bash
cd /home/user/Brigada/toon-studio
export TOON_ENTRY=src/elevator/index.ts TOON_GL=swangle TOON_THREADS=3 TOON_LOG=_tmp/lishniy-etazh/render.log
export TOON_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
node scripts/render.mjs render LishniyEtazh out/lishniy-etazh.mp4
