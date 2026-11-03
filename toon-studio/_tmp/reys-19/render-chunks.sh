#!/bin/bash
# «Рейс 19» in 120-frame chunks: every finished chunk is kept, so a stop only loses the chunk in progress.
# Re-run the script to resume.   ./render-chunks.sh preview  → first 30 s at half size (_tmp/reys-19/превью-30с.mp4)
#                                 ./render-chunks.sh full     → the whole video (out/reys-19.mp4)
cd /home/user/Brigada/toon-studio
export TOON_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
MODE=${1:-preview}
FPS=30
FULL=$(python3 -c "import json;print(round(json.load(open('public/reys-19/voice.json'))['total']*30))")
if [ "$MODE" = preview ]; then TOTAL=900; SCALE=0.5; DIR=_tmp/reys-19/chunks-preview; OUT=_tmp/reys-19/превью-30с.mp4; CRF=23
else TOTAL=$FULL; SCALE=1; DIR=_tmp/reys-19/chunks; OUT=out/reys-19.mp4; CRF=18; fi
LOG=_tmp/reys-19/render-$MODE.log
mkdir -p "$DIR" out
STEP=120
echo "start $MODE $TOTAL frames $(date -u +%H:%M:%S)" >> "$LOG"
for ((a=0; a<TOTAL; a+=STEP)); do
  b=$((a+STEP-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  out=$(printf "%s/c%04d.mp4" "$DIR" "$a")
  [ -f "$out" ] && continue
  echo "chunk $a-$b $(date -u +%H:%M:%S)" >> "$LOG"
  nice -n 10 npx remotion render src/flight19/index.ts Reys19 "$out.part.mp4" --frames=$a-$b --scale=$SCALE --concurrency=4 --gl=swangle \
    --crf=$CRF --muted --timeout=120000 --log=error --browser-executable="$TOON_BROWSER" >> _tmp/reys-19/render-chunk-cur.log 2>&1 \
    && mv "$out.part.mp4" "$out" || { echo "FAIL $a-$b" >> "$LOG"; exit 1; }
done
ls "$DIR"/c*.mp4 | sort | sed "s|^|file '$PWD/|; s|$|'|" > "$DIR/list.txt"
SEC=$(python3 -c "print($TOTAL/30)")
# re-time every frame to exactly 1/30 s and re-encode; the sound is the full mix cut to the same length
ffmpeg -v error -y -f concat -safe 0 -i "$DIR/list.txt" -i public/reys-19/mix.wav -map 0:v -map 1:a \
  -vf "setpts=N/30/TB" -r 30 -c:v libx264 -crf $((CRF-1)) -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 320k -ar 48000 -ac 2 -t $SEC -movflags +faststart "$OUT" \
  && echo "done $OUT $(date -u +%H:%M:%S)" >> "$LOG" || echo "FAIL concat" >> "$LOG"
