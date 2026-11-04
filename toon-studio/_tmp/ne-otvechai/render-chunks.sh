#!/bin/bash
# «Не отвечай» in 60-frame chunks (resumable). Each chunk is tried with fast --gl=swiftshader first (2D);
# chunks with Three.js scenes fail there in seconds (no WebGL) and are re-rendered with --gl=swangle.
cd /home/user/Brigada/toon-studio
export TOON_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
TOTAL=$(python3 -c "import json;print(round(json.load(open('public/ne-otvechai/voice.json'))['total']*30))")
DIR=_tmp/ne-otvechai/chunks; OUT=out/ne-otvechai.mp4; LOG=_tmp/ne-otvechai/render-chunks.log; STEP=60
mkdir -p "$DIR" out
echo "start $TOTAL frames $(date -u +%H:%M:%S)" >> "$LOG"
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  out=$(printf "%s/c%04d.mp4" "$DIR" "$a"); [ -f "$out" ] && continue
  for gl in swiftshader swangle; do
    nice -n 10 npx remotion render src/horror/index.ts NeOtvechai "$out.part.mp4" --frames=$a-$b --concurrency=4 --gl=$gl \
      --crf=18 --muted --timeout=120000 --log=error --browser-executable="$TOON_BROWSER" > _tmp/ne-otvechai/render-chunk-cur.log 2>&1 \
      && { mv "$out.part.mp4" "$out"; echo "chunk $a-$b $gl $(date -u +%H:%M:%S)" >> "$LOG"; break; }
  done
  [ -f "$out" ] || { echo "FAIL $a-$b" >> "$LOG"; exit 1; }
done
ls "$DIR"/c*.mp4 | sort | sed "s|^|file '$PWD/|; s|$|'|" > "$DIR/list.txt"
SEC=$(python3 -c "print($TOTAL/30)")
ffmpeg -v error -y -f concat -safe 0 -i "$DIR/list.txt" -i public/ne-otvechai/mix.wav -map 0:v -map 1:a \
  -vf "setpts=N/30/TB" -r 30 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -t $SEC -movflags +faststart "$OUT" \
  && echo "done $OUT $(date -u +%H:%M:%S)" >> "$LOG" || echo "FAIL concat" >> "$LOG"
