#!/usr/bin/env bash
# Smoke test for the whole kit (about 2-3 minutes, no network):
#   bash <skill>/kit/tools/selftest.sh
# setup -> synthetic voice -> audio.py -> mix.py (level check) -> 6 preview frames -> finish.sh -> MP4,
# then the cast/expression/texture sheets, a render of worlds/hilltown with example/wind, and of worlds/studio with the everyday-object props.
# Exits non-zero at the first failure and says which stage broke. Run it after changing anything in kit/.
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"
P="$(mktemp -d)/selftest"
step() { echo "== $1"; }
fail() { echo "SELFTEST FAILED at: $1" >&2; exit 1; }

step "setup";  bash "$KIT/tools/setup.sh" "$P" >/dev/null 2>&1 || fail "setup.sh"
cd "$P"

step "synthetic voice (19.7 s speech-like bursts)"
python3 - <<'EOF' || fail "voice synthesis"
import numpy as np, wave
SR = 48000; t = np.arange(int(19.7 * SR)) / SR; rng = np.random.default_rng(1)
env = (np.sin(2 * np.pi * 3.2 * t) > -0.2) * (np.sin(2 * np.pi * 0.3 * t) > -0.6)
v = (0.3 * np.sin(2 * np.pi * 140 * t) + 0.1 * rng.standard_normal(len(t))) * env * 0.8
w = wave.open("voice.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((v * 32767).astype(np.int16).tobytes())
EOF
ffmpeg -v error -y -i voice.wav voice.mp3 || fail "ffmpeg voice encode"

step "audio.py (stems)";  python3 audio.py >/dev/null || fail "audio.py"
[ -s music.wav ] && [ -s sfx.wav ] || fail "audio.py wrote no stems"

step "mix.py (level lock)"
python3 mix.py voice.mp3 music.wav sfx.wav | tee mix.log || fail "mix.py"
python3 - <<'EOF' || fail "level check: music must be -6.0 dB (+-0.15) and sfx at or below -5.95 dB vs voice"
import re
t = open("mix.log").read()
m = float(re.search(r"music .*?= ([+-][\d.]+) dB", t).group(1)); s = float(re.search(r"sfx .*?= ([+-][\d.]+) dB", t).group(1))
assert abs(m + 6.0) <= 0.15 and s <= -5.95, (m, s)
EOF

step "render 6 frames at 25% scale"
SCALE=0.25 node render.mjs frames "0-5" 1 0.9 2>&1 | grep -E "ERR|page error" && fail "render.mjs (page error)" || true
[ "$(ls frames | wc -l)" -eq 6 ] || fail "render.mjs produced $(ls frames | wc -l) frames, expected 6"

step "finish.sh (encode + QA)"
bash finish.sh selftest >/dev/null 2>&1 || fail "finish.sh"
[ -s out/selftest.mp4 ] || fail "no MP4 written"
step "cast / expression / texture sheets"
for m in cast expr heads tex; do node cast_sheet.mjs $m out/sheet_$m.png >/dev/null 2>&1 || fail "cast_sheet.mjs $m"; [ -s out/sheet_$m.png ] || fail "no $m sheet"; done

step "worlds/hilltown + example/wind"
P2="${P}_wind"
bash "$KIT/tools/setup.sh" "$P2" >/dev/null 2>&1 || fail "setup.sh (second project)"
python3 "$KIT/worlds/apply_world.py" "$P2/web/main.js" hilltown >/dev/null || fail "apply_world.py hilltown"
cp "$KIT/example/wind/story.js" "$P2/web/story.js"
( cd "$P2" && SCALE=0.25 node render.mjs frames "100,500,745" 1 0.9 2>&1 | grep -E "ERR|page error" && exit 1 || exit 0 ) || fail "render with hilltown world (page error)"
[ "$(ls "$P2/frames" | wc -l)" -eq 3 ] || fail "hilltown render produced the wrong number of frames"
step "worlds/studio + everyday objects"
P3="${P}_studio"
bash "$KIT/tools/setup.sh" "$P3" >/dev/null 2>&1 || fail "setup.sh (third project)"
python3 "$KIT/worlds/apply_world.py" "$P3/web/main.js" studio >/dev/null || fail "apply_world.py studio"
cp "$KIT/example/props/story.js" "$P3/web/story.js"
( cd "$P3" && SCALE=0.2 node render.mjs frames "3,16,123,160,267" 1 0.9 2>&1 | grep -E "ERR|page error|unknown prop" && exit 1 || exit 0 ) || fail "render with studio world (page error)"
[ "$(ls "$P3/frames" | wc -l)" -eq 5 ] || fail "studio render produced the wrong number of frames"
echo "SELFTEST OK  ($(ffprobe -v error -show_entries stream=width,height -of csv=p=0 out/selftest.mp4 | head -1)) in $P"
