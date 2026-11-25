# wind: "The Town That Walled Out the Wind" (second example, uses worlds/hilltown)

`script.txt` is the narration (90 words). `story.js` is the full shot plan, cameras, lights, actors, FX and `worldAt` for it,
timed to one specific voiceover (29.39 s, 882 frames): the voiceover is not included, so a different voice shifts the cut points.
Re-time by running `timing.py` on your voice and editing the frame numbers at the top of `story.js`. `audio.py` is the matching cue table
(bouncy bed that cuts at "You see," then a drone, SFX per event, a click per clothes peg).

Build it: `setup.sh <p>`, `apply_world.py <p>/web/main.js hilltown`, copy `story.js` and `audio.py` over the project's, add `voice.mp3`.
