#!/bin/bash
# Full render of «Лишний этаж» in 60-frame chunks: every finished chunk is kept, so a container restart
# only loses the chunk in progress. Re-run the script to resume. At the end: concat video + full mix.wav audio.
cd /home/user/Brigada/toon-studio
export TOON_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
LOG=_tmp/lishniy-etazh/render-chunks.log
DIR=_tmp/lishniy-etazh/chunks
mkdir -p "$DIR" out
TOTAL=1731
STEP=60
echo "start $(date -u +%H:%M:%S)" >> "$LOG"
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  out=$(printf "%s/c%04d.mp4" "$DIR" "$a")
  [ -f "$out" ] && { echo "skip $out" >> "$LOG"; continue; }
  echo "chunk $a-$b $(date -u +%H:%M:%S)" >> "$LOG"
  nice -n 10 npx remotion render src/elevator/index.ts LishniyEtazh "$out.part.mp4" --frames=$a-$b --concurrency=4 --gl=swangle \
    --crf=18 --timeout=120000 --log=info --browser-executable="$TOON_BROWSER" >> _tmp/lishniy-etazh/render-chunk-cur.log 2>&1 \
    && mv "$out.part.mp4" "$out" || { echo "FAIL $a-$b" >> "$LOG"; exit 1; }
done
ls "$DIR"/c*.mp4 | sort | sed "s|^|file '$PWD/|; s|$|'|" > "$DIR/list.txt"
# Chunk joints drift the timestamps (57.84 s instead of 57.70 s), and -shortest then cut 8 frames:
# re-time every frame to exactly 1/30 s (setpts) and re-encode, no -shortest.
ffmpeg -v error -y -f concat -safe 0 -i "$DIR/list.txt" -i public/lishniy-etazh/mix.wav -map 0:v -map 1:a \
  -vf "setpts=N/30/TB" -r 30 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -movflags +faststart out/lishniy-etazh.mp4 \
  && echo "done $(date -u +%H:%M:%S)" >> "$LOG" || echo "FAIL concat" >> "$LOG"
