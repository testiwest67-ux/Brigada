#!/bin/bash
# Flow maya-img/scene-NN.jpeg (NN = номер в списке − 1) → public/maya/bg/<имя>.png
cd /Users/makentosh/Brigada/toon-studio
SRC=/Users/makentosh/flow-mcp-out/maya-img
OUT=public/maya/bg; mkdir -p $OUT
[ -f $OUT/m0-01-explorers.png ] || sips -s format png public/maya/bg/m0-01-explorers.jpeg --out $OUT/m0-01-explorers.png >/dev/null
i=0
grep -oE 'm[0-9]-[0-9]{2}-[a-z0-9-]+' _tmp/maya/КАРТИНКИ.md | awk '!s[$0]++' | tail -n +2 | while read name; do
  i=$((i+1)); f=$(ls $SRC/scene-$(printf %02d $i).* 2>/dev/null | head -1)
  if [ -n "$f" ] && [ ! -f $OUT/$name.png ]; then sips -s format png "$f" --out $OUT/$name.png >/dev/null && echo "+ $name"; fi
done
ls $OUT/*.png | wc -l
