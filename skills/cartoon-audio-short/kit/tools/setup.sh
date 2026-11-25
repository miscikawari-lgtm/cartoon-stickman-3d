#!/usr/bin/env bash
# Creates a new short project:  bash <skill>/kit/tools/setup.sh <project_dir>
# Needs: node >= 22.6 (type stripping), python3 + numpy + Pillow, ffmpeg, Playwright Chromium
#        (npm i -g playwright && npx playwright install chromium if missing).
# Fully offline: three.js r160 and toon.ts are vendored in kit/vendor/. Network is only a fallback.
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?project dir}"; V="$KIT/vendor"
mkdir -p "$P/web/lib" "$P/work" "$P/stills" "$P/out"
cp "$KIT"/engine/*.js "$KIT"/engine/index.html "$KIT"/engine/cast.html "$P/web/"
cp "$KIT"/example/soldier/story.js "$P/web/story.js"        # starting point: rewrite for the new story
cp "$KIT"/example/soldier/audio.py "$P/audio.py"            # starting point: rewrite the cue table
cp "$KIT"/tools/*.mjs "$KIT"/tools/*.py "$KIT"/tools/finish.sh "$P/"
# three.js r160 (module build): vendored first, then npm, then sparse git clone.
if [ -f "$V/three.module.js" ]; then cp "$V/three.module.js" "$P/web/lib/"; fi
if [ ! -f "$P/web/lib/three.module.js" ]; then
  ( cd /tmp && rm -rf _three && mkdir _three && cd _three && npm pack three@0.160.0 >/dev/null 2>&1 && tar xzf three-0.160.0.tgz && cp package/build/three.module.js "$P/web/lib/" ) \
  || ( cd /tmp && rm -rf _t3 && git clone -q --depth 1 --filter=blob:none --sparse --branch r160 https://github.com/mrdoob/three.js _t3 && cd _t3 && git sparse-checkout set build && cp build/three.module.js "$P/web/lib/" )
fi
# toon base (Pen / head / face library, MIT): vendored first; clone only if missing. Never write into the (read-only) kit.
TOON="$V/toon.ts"
if [ ! -f "$TOON" ]; then rm -rf /tmp/_cas && git clone -q --depth 1 https://github.com/mromidev/claude-animated-shorts /tmp/_cas && TOON=/tmp/_cas/templates/bridge/toon.ts; fi
node --no-warnings "$KIT/tools/strip_ts.mjs" "$TOON" "$P/web/toonbase.js"
cat "$P/web/toonbase.js" "$P/web/roman.js" "$P/web/cast.js" > "$P/web/toon.js"
# playwright: use a global install if there is one
mkdir -p "$P/node_modules"; [ -e "$P/node_modules/playwright" ] || ln -sf "$(npm root -g)/playwright" "$P/node_modules/playwright"
for f in web/lib/three.module.js web/toon.js web/story.js audio.py mix.py finish.sh render.mjs timing.py; do [ -s "$P/$f" ] || { echo "MISSING $f" >&2; exit 1; }; done
echo "ready: $P   (after editing cast code run: cat web/toonbase.js web/roman.js web/cast.js > web/toon.js)"
