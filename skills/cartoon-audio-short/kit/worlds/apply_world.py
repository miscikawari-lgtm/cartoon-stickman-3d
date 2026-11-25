#!/usr/bin/env python3
"""Swap the example bridge world in a project's main.js for a ready-made world from kit/worlds/.

    python3 <skill>/kit/worlds/apply_world.py <project>/web/main.js hilltown

Run it on a FRESH project (right after setup.sh). It replaces, in main.js:
  - everything between "// ---------- world ----------" and "// ---------- cards ----------"   (world_block.js)
  - the worldState() function                                                                   (world_state.js)
  - the helmet prop state, and its call in renderFrame()                                        (hatState in world_state.js)
  - the water lines in applyLight() (the new worlds have no river)
Then write your own story.js against the world's state fields (see worlds/<name>/README.md).
"""
import os, re, sys
if len(sys.argv) != 3: sys.exit(__doc__)
main_path, name = sys.argv[1], sys.argv[2]
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
if not os.path.isdir(d): sys.exit(f"no such world: {name} (have: {', '.join(x for x in os.listdir(os.path.dirname(d)) if os.path.isdir(os.path.join(os.path.dirname(d), x)))})")
s = open(main_path).read()
if re.search(r"^// world: ", s, re.M): sys.exit("main.js already has a world applied - start from a fresh setup.sh project")
for marker in ("// ---------- world ----------", "// ---------- cards ----------", "function worldState(S, f) {", "function drawActors", "const helmetState", "const swapForNd", "helmetState(W_.helmet);"):
    if marker not in s: sys.exit(f"main.js does not look like a pristine engine copy (missing: {marker})")
rd = lambda f: open(os.path.join(d, f)).read()
a = s.index("// ---------- world ----------"); b = s.index("// ---------- cards ----------")
s = s[:a] + rd("world_block.js").rstrip() + "\n\n" + s[b:]
ws = rd("world_state.js")
a = s.index("function worldState(S, f) {"); b = s.index("function drawActors")
# world_state.js defines worldState (and, for hilltown, hatState): it replaces the helmet block below, so cut hatState out of it first
hat_i = ws.find("const hatState")
core, hat = (ws[:hat_i], ws[hat_i:]) if hat_i >= 0 else (ws, "")
s = s[:a] + core.rstrip() + "\n\n" + s[b:]
a = s.index("const helmetState"); b = s.index("const swapForNd")
s = s[:a] + hat.rstrip() + ("\n\n" if hat else "") + s[b:]
s = s.replace("helmetState(W_.helmet);", "hatState(W_.hat);" if hat else "")
s = re.sub(r"\n  waterU\.deep\.value\.set\(L\.waterDeep\);[^\n]*", "", s)
open(main_path, "w").write(s)
print(f"applied world '{name}' to {main_path}")
