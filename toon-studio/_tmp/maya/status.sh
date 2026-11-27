#!/bin/bash
# Быстрый статус «Майя»: сколько картинок от Flow, сколько в проекте, хвост лога VoiceStudio.
echo "flow: $(ls /Users/makentosh/flow-mcp-out/maya-img | wc -l | tr -d ' ') / 51"
echo "bg:   $(ls /Users/makentosh/Brigada/toon-studio/public/maya/bg/*.png 2>/dev/null | wc -l | tr -d ' ') / 52"
echo "--- vs log:"
tail -4 /Users/makentosh/Brigada/toon-studio/_tmp/maya-vs/log.txt
