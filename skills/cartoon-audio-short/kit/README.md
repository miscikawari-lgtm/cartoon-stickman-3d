# cartoon-short-kit
Audio in, finished vertical cartoon short out. 2D bean-head cards in an inked, painted 3D world
(three.js in headless Chromium, no Remotion and no GPU needed), with a synthesized music bed and SFX.

- `engine/` renderer: world helpers, cards, ink pass, lens blur, grade (`main.js`), painted textures (`paint.js`),
  cast drawing (`roman.js` on top of the Pen library from mromidev/claude-animated-shorts, vendored in vendor/),
  motion helpers (`motion.js`).
- `example/soldier/` the worked example "The Soldier Who Never Left" (story.js shot plan + audio.py cue table).
- `tools/` setup.sh (new project, offline), timing.py (word timings), render.mjs (frames), sheet.py (contact sheets), mix.py (voice : music : sfx level lock → mix_raw.wav), selftest.sh (end-to-end smoke test), finish.sh (linear loudness, encode, QA), strip_ts.mjs (TypeScript → JS).
- `engine/props.js` 12 everyday 3D objects with exploded views; `worlds/` ready-made worlds (`hilltown`, `studio`) and `apply_world.py`; `example/wind/` is a second worked story using it.
- `engine/cast.js` extra outfits + expressions; `tools/cast_sheet.mjs` renders sheets of outfits, expressions and textures.
- `vendor/` three.js r160 and toon.ts, both MIT (licences alongside), so setup needs no network.

Quick start: `bash kit/tools/setup.sh ~/shorts/my-short && cd ~/shorts/my-short && python3 timing.py voice.mp3 script.txt --out work`
Sound: `python3 audio.py && python3 mix.py voice.mp3 music.wav sfx.wav`, then `node render.mjs frames "0-N"` and `bash finish.sh "Title"`.
Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts, look values and readability rules.


Preview renders: `SCALE=0.5 node render.mjs frames "0-N" 2` then `FPS=15 bash finish.sh "Title"` (about 4x faster; engine reads `?scale=`).
