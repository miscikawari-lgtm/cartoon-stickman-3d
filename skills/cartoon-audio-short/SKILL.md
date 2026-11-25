---
name: cartoon-audio-short
description: Make a vertical animated cartoon short. Offers 10 ideas, writes the script, then turns the user's voiceover into a finished MP4 with music and SFX at half the voice level. Use for any cartoon short or animated story video request, in any language (for example "bikin video kartun pendek", "animasi dari voiceover").
---

# Cartoon short: idea → script → voiceover → finished MP4

The look: flat 2D bean-head cartoon characters (canvas-drawn "cards" with plum outlines) in a colourful 3D world with black ink outlines, painted textures, depth-of-field and gliding cameras. The output is 1080x1920, 30 fps, exactly as long as the voiceover. The user's voice is unchanged. The music bed and SFX are synthesized and sit at **50 % of the voice level**. Proven on "The Soldier Who Never Left" (19.7 s, 8 shots).

## Rules
- Stories, characters and shots are always original. Never recreate another creator's video shot for shot. Offer an original take on the same idea instead.
- No real, named living people as characters, and no brand mascots or logos.
- No captions unless the user asks. Diegetic text (a carved message, a sign) is fine, and it must read correctly (not mirrored).
- Never edit or re-time the voice. The picture is timed to it, and every visual reaction lands 0-3 frames before its word.
- **Audio levels:** the music bed sits at 50 % of the voice level (−6 dB, gated RMS). SFX sit at 50 % or slightly less, with peaks capped so no hit pokes out over the narration. Always mix with `mix.py`, never by hand. Use no ducking or compression that would change this ratio; only one linear gain plus a peak limiter goes on the whole mix.
- Keep the user informed with a task list. Send a stills contact sheet before the long render.

## Stage 1: Intake (always first)
If an audio file is already attached, skip to Stage 4. If a script was also given, use it for the timing.
Otherwise ask one AskUserQuestion (or plain text if that tool is missing): **"Where are you starting from?"**
- **Voiceover ready**: ask them to upload it, plus the script text if they have it (the script makes the timing exact). Go to Stage 4 when it arrives.
- **I have a script, need the voiceover**: tighten the script per Stage 3 if needed, give it back with recording tips, ask for the upload, then go to Stage 4.
- **Need video ideas and a script**: go to Stage 2.
Also ask the target length if they haven't said. The default is 20-30 s; 45-60 s is allowed.

## Stage 2: 10 video ideas
Give exactly 10 ideas in one reply, numbered, and ask the user to reply with a number (or "more"). Each idea gets:
- **Title** (5-8 words, curiosity-driven, e.g. "The Soldier Who Never Left").
- **Hook line**: the first spoken sentence, a paradox stated as fact ("A man sold the Eiffel Tower. Twice.").
- **The twist** in one line (the ironic payoff that ends the video).
- **Why it animates well**: the 2-3 big visual moments (a collapse, a reveal, a chase).
- **True or legend**: say plainly whether it is documented history, a disputed account or folklore.

What makes an idea "perfect" for this format:
- One surprising story with a physical cause and effect you can show.
- A clear everyman character, stakes that escalate, and a twist in the last line.
- A setting that can be built from simple 3D shapes plus cartoon cards (towns, bridges, ships, castles, deserts, labs, palaces).
- Mix the 10 across eras and themes: ancient, medieval, 1800s, modern, science, animals, inventions, disasters, weird laws, lucky accidents.
- For anything presented as true, verify the key facts with a web search before offering it. Don't present a viral legend as fact. If the user wants it anyway, frame it as "legend says".
- No real living people as the butt of a joke, nothing graphic and nothing political.

## Stage 3: Script (after they pick)
Write the narration only (no stage directions in the spoken text), sized at about 3.7 words/s: 20 s ≈ 75 words, 30 s ≈ 110, 60 s ≈ 220. Formula:
1. **Hook** (sentence 1, no setup): the absurd fact.
2. **Setting** in 1-2 lines: when, where, who, a concrete detail.
3. **Escalation**, 2-4 beats, each bigger. Others doubt or mock. Use one exaggeration joke.
4. **Mystery or pivot**: "But when..." / "You see," introduces the real mechanism, often with an everyday analogy.
5. **Twist / payoff**: short, ironic, and the last words of the video.
Use plain spoken English, contractions, sentences around 8-15 words, and numbers written as words. Never describe what the viewer already sees.

Then reply with:
- The script in a copyable block, with the word count and estimated length.
- A one-paragraph visual plan (the shots you'll animate).
- Recording tips: one steady, warm narrator voice; ElevenLabs works well (a deep narrator voice, speed about 1.05-1.1, stability about 45-55 %). Mp3 or wav is fine. Leave natural pauses at sentence ends. Export without music.
- The ask: **"Upload the voiceover when it's ready and I'll make the full video."**
Keep the final script text. It drives the timing in Stage 4, so no speech recognition is needed. If they recorded a changed version, ask for the final text.

## Stage 4: Build the video (after the voiceover is uploaded)
Do everything from here without stopping. Ask only if the timing cannot be resolved.

### 4.0 Get the kit
The code kit ships **inside this skill folder** at `kit/` (engine, tools, worked example, plus vendored three.js r160 and the `toon.ts` Pen library from github.com/mromidev/claude-animated-shorts, both MIT). Locate the folder with `find / -name SKILL.md -path "*cartoon-audio-short*" 2>/dev/null` and treat its `kit/` as read-only.

Then run `bash <skill>/kit/tools/setup.sh ~/shorts/<slug>`. It copies the engine and tools (including `mix.py` and `finish.sh`) into the project, copies the vendored three.js from `kit/vendor/`, strips the types from `kit/vendor/toon.ts` with `tools/strip_ts.mjs` (Node 22), and links Playwright. No network is needed. Only if a vendored file is missing does it fall back to npm or a git clone. It checks that every required file exists and exits with `MISSING <file>` otherwise. After changing anything in `kit/`, or when the environment is unfamiliar, run `bash <skill>/kit/tools/selftest.sh` (1-2 minutes): it runs setup, audio, mix, a 6-frame render and finish, checks the −6 dB level lock, and names the stage that broke.
- Requirements: Node 22.6+, Python 3 with numpy + Pillow, ffmpeg, and Playwright with Chromium (`npm i -g playwright && npx playwright install chromium` if missing).
- If package registries are blocked, git over GitHub usually works. Never disable TLS or route around the proxy.
- Chromium: use the pre-installed Playwright browser with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`. That gives CPU WebGL at about 3-10 s per frame.

### 4.1 Timing
Run `python3 timing.py voice.mp3 script.txt --out work`.
- With whisper or faster-whisper installed, it uses word timestamps.
- Otherwise it aligns script phrases (split at punctuation) to silence-detected speech segments, with a DP that matches syllables to duration and penalises sentence ends inside a segment and long gaps inside a phrase.
- With no ASR and no script, ask for the script. Claude cannot hear audio.
- Check `work/phrases.json`: pauses should fall at sentence ends. Total frames = round(duration × 30).

### 4.2 Shot plan (`work/PLAN.md` before code)
Make one row per shot: frames, words, setting, light, camera move, characters/poses/expressions, effects and SFX cue.
- Frame 0 is already the hook image.
- Usually one shot per phrase. Merge tiny phrases into the next shot.
- Illustrate every sentence literally. Props carry the jokes.
- Vary shot sizes: hook MCU → wide reveal → two-shot → insert close-up on the key object → reaction close-up → environment move for the payoff.
- Use light for beats: day for normal, golden for decline or drama, night-blue for explanation. A time jump gets a 6-frame white flash.
- The twist line gets a sting (music stops, low hit, push-in with roll). The last shot's physical payoff lands on the final word.

### 4.3 World (`web/main.js`)
First check `kit/worlds/` for a ready-made world that fits the story (read its README): `hilltown` is a windy hill town with houses, church, a wall of adjustable height, a clothesline, wind streaks, roofs that lift off and a flying hat. To use one: `python3 <skill>/kit/worlds/apply_world.py <project>/web/main.js hilltown` on a fresh project, then write `story.js` against the state fields in that world's README (`example/wind/story.js` is a worked example). For a short about an OBJECT (how a rice cooker works, why a donut has a hole, evolution of the microphone), use `worlds/studio`: a neutral stage with a table, and 12 ready-made 3D props in `engine/props.js` (riceCooker, donut, microphone, vintageMic, headphones, earbuds, iron, cottonBud, lightBulb, iceCream, trophy, soccerBall). Each prop has parts and an `explode` value 0 to 1 for a "how it works" exploded view; `example/props/story.js` shows the API and a showcase of all 12. Props are simplified teaching models, not exact products or brands. Add a new prop by copying a block in `props.js` and registering its name in `PROP_NAMES`. Only build a world from scratch when none fits, and add it to `kit/worlds/` if it is reusable.
Keep the engine sections: toon materials, ink contract, `add`/`tbox`, sky, lights, cards, render targets/post, `applyLight`, `drawActors`, `swapForNd`, `renderFrame`. Replace the example world between `// ---------- world ----------` and `// ---------- cards ----------`, plus the story parts of `worldState()`.
- Build from primitives with painted canvas textures (`paint.js`: planks, beams, rotten wood, stone, moss/ivy, grass, dirt, plaster, roof tiles, marble, banners, carved text, and sand, snow, red brick, floor tiles, cobblestones, asphalt). `node cast_sheet.mjs tex out/tex.png` shows every texture. Write new painters in the same flat-with-dark-seams style.
- Use `tbox` for constant texel density, a 2-step toon gradient, and fog = horizon colour.
- Background: hills (half-buried spheres), mountains (cones + snow caps), cypress/pine trees, distant houses, painted cloud billboards.
- Set pieces (collapses, falls, doors) are pivoted groups driven by 0..1 progress from `worldAt(f)`, with eased and staggered parts.
- Curved diegetic text uses planar UVs. Check it isn't mirrored.

### 4.4 Cast (`web/roman.js` → `web/toon.js`)
- `romanFront(p, outfitKey, opts)` draws on a 600x1000 design canvas with soles at y=975. The card is 2.25 m tall, so 1 unit = 0.00225 m.
- Pick the cast from the library first: `node cast_sheet.mjs cast out/cast.png` (all outfits) and `node cast_sheet.mjs expr out/expr.png <outfit>` (all expressions on one outfit). Show the person the sheet if they want to choose characters.
- Outfits: legion, old, toga, civA, civB, civC, workA, workB (roman.js) and mayor, baker, fisher, farmer, granny, king, guard, wizard, merchant, thief, sailor, scholar (cast.js). Add your own to `OUTFITS` in `web/cast.js` (tunic/cape/armor/helmet/crest/hair/cap/beard/apron/dress/toga/moustache/brows/stout; colours are CSS hex). New headgear and props go in the same style.
- Arm poses: hang, spear, point, up, wave, hip, belly, temple (+swirl), lift, reach (+lift), cheek, shield, cross, thumb.
- Head details (the stick-man body stays the same; the head makes each character recognisable): outfit fields `headW`/`headH` (head shape 0.85-1.3), `style` (hair: spiky, mohawk, tuft, bald, bun, ponytail, pigtails, afro, long; needs `hair` colour), `ears`, `glasses` (round, square, shades, monocle), `nose` (round, long, clown), `marks` (freckles, blush, scar, plaster, mole), `hat2` (chef, wizard, tophat, beanie, hardhat, beret, headband, propeller; colours via `hatColor`, `hatBand`). They combine freely. Ready-made combinations: host, professor, chef, engineer, punk, kid, grandpa, artist, clown, cool, maker, magician. More head options: `style` curly, bob, braid, topknot, dreads; `glasses` goggles, magnifier, eyepatch; `beardStyle` goatee, stubble, mutton (`beardColor`); `handlebar` (curled moustache colour); `hat2` viking, pirate, cowboy, astronaut, fez, turban, pharaoh, crown, headphones, graduate, safari, police, snapback (cap worn backwards), bowler, ushanka, kabuto (samurai), blangkon (Java), peci, udeng (Bali), caping, tanjak (Malay), laurel. Also `style: chonmage`, `beardStyle: pharaoh`, `marks: ["kohl"]`, turban `plume: true`. Historical and regional figures are respectful simplified archetypes, not costume-accurate: say so when presenting them, and check references before using them in a video about a specific period or place. `viking` uses the historically accurate round iron helmet (Vikings did not wear horned helmets); `fantasyViking` or `horns: true` is for fantasy only. Animals (stick-man body, animal head; the outfit's `skin` is the fur colour, and every hat, glasses and clothing item combines): `animal` tiger, lion (`mane`), cat, dog, elephant, monkey, panda, rabbit, frog, owl, bear, pig. Ready-made: tiger, lion, cat, dog, elephant, monkey, panda, rabbit, frog, owl, bear, pig, and combos pandaChef, owlProf, catWizard, monkeyAstro, dogPolice, tigerNerd. Limits: no tails, no four-legged bodies; the animals are cartoon presenters, so for a factual question about real animal behaviour show the facts in the narration and visuals, and do not imply the cartoon body is realistic. Characters by topic: everyday science (labtech, inventor, detective), food and origins (itamae, nenek, chef, baker), technology (dj, techie, astronaut, engineer) and people of different eras for "evolution of X" stories (gentleman 1900s, flapper 1920s, groovy 1970s, retro80, teen90), history (viking, pirate, pharaoh, samurai, ronin, cowboy, sultan, philosopher, graduate, king), Nusantara (priayi, pakPeci, balinese, petani, pendekar) and events with their people (police, referee, striker, comrade, thief, scientistF), animals and nature (the animal characters above, ranger, farmer, fisher). `node cast_sheet.mjs heads out/heads.png` shows every head close-up. For a recurring channel host, pick one distinctive head and keep it identical across videos. Pick props by topic (chef for food, hardhat for engineering, professor for science).
- Expressions: neutral, stern, grin, laugh, whistle, nervous, shock, relief, dazed, pained, smile, smile_closed, lick, snore, stubborn, squint (roman.js) and sad, angry, smug, wink, worried, proud, cheeky, awe (cast.js). Extend `FACE` in `cast.js` by combining the existing eye and mouth kinds, then check it with the expr sheet. `nocap: true` hides a character's cap (for a hat that blows away).
- Rebuild after edits with `cat web/toonbase.js web/roman.js web/cast.js > web/toon.js`. Always render the cast and expression sheets before using a new design.
- Billboards turn on yaw only, get a contact blob and an alpha-tested shadow, and are never inked by the world pass.
- Build card keys from `q()`-rounded values (so the canvas redraws only on visible change).
- A detached part (e.g. a lifted helmet) is its own card, aligned with `headCenter(seed)`: y = DECK + (partY − hc) × 0.00225.

### 4.5 Motion: smooth and alive (`web/motion.js`)
- **Cameras**: `camFromKeys(keys, f, {kicks})`. Use smootherstep glides (18-45 f), `easeOut` for reveals and whips, and `path` via-points (Catmull-Rom) for curved moves. Every hold creeps and nothing is static for 4+ frames. Use 3-5° rolls on drama and 7-frame flip-shakes on impacts.
- **Continuity**: prefer continuous moves (pull back from a close-up into the wide, rack focus, crane through the deck, push into an object). Hard cut only on place or time jumps, with a flash.
- **Characters never freeze**: apply `idle(f, seed)` to every card, `blinkAt` blinks, and head bobs on stressed words.
- **Actions**: anticipation → `back` overshoot → `spring` settle. A stamp is a 2-frame dip + dust puff + kick. Laughs are an alternating tilt + bob.
- **Secondary motion**: banner cloth waves, leaves/dust/drips/Zzz effect cards, flowing water. Something always moves.
- **Walks**: `walk()` gives distance + step phase. Feet planted, bob 3-7 %.
- **Lens**: DOF on close-ups and mediums (cInf 8-14 px), focus on the eyes. Wides are sharp. Racks take ~14 f.

### 4.6 Look check (before the full render)
Render stills at each shot's middle plus the transitions and key actions: `node render.mjs stills/a "5,40,..."` then `python3 sheet.py stills/a stills/sheet_a.jpg`. Look at the sheet and fix these traps:
- **Narrow vertical frame**: horizontal half-width = d·tan(hfov/2), with hfov = 2·atan(tan(vfov/2)·0.5625). At 4 m and fov 40 that is ±0.8 m, so stage characters in depth.
- Railings or posts across faces (camera inside the rail or ~2.5 m up). The camera path through houses, roofs or bushes. Foreground props under ~2 m away. The hero hidden behind a pillar.
- Mirrored text. A detached-part card offset the wrong way.
- Extrude material groups: 0 = caps, 1 = sides+top.
- Missing ink: debug the edge-only output. Ink radius ~2.5 px at 1080. The sky counts as far depth, not a card.
Send the sheet to the user with a one-line shot summary. The stills also tell you the render speed (`done N frames, X s/frame`). Estimate the full render as `frames × X`. If that is over about 20 minutes (single-core sandboxes run 5-10 s/frame at 1080x1920), offer a preview first (see 4.8) and let the person choose.

### 4.7 Sound (`audio.py` → stems → `mix.py`)
Rewrite the cue table for the story; the synths stay. `audio.py` writes only stems (`music.wav`, `sfx.wav`: mono, 48 kHz, no ducking, no mixing), and takes its length from `voice.mp3`. Run it as `python3 audio.py` (needs `voice.mp3` in the project folder).
- Music: pick the style to fit the story (the example is a march: kick/snare, plucked bass, brass pad; a light story suits bouncy pizzicato with a soft shaker). Cut the bed cleanly at the twist line and let a low drone continue, then bring it back for the payoff if the story has one.
- SFX on events (in frames/30): whooshes on big moves, thunk on stamps, rumble+crash on collapses, scrape on metal, ting on reveals, sting on the twist, creaks, snap, splash, snore, leaves, water ambience.
- Mix with `python3 mix.py voice.mp3 music.wav sfx.wav`. It writes `mix_raw.wav` (the voice length exactly), refuses to run if a stem is missing or silent, and sets music to exactly 50 % of the voice's gated RMS (−6 dB) and SFX to 50 % with peaks capped at 0.7× the voice peak. It prints the measured levels: confirm music shows −6.0 dB vs voice and SFX is at or below that.
- Lock picture timing before making sound. Any timing change means re-running audio.py and mix.py.

### 4.8 Render + finish
- Full render: `node render.mjs frames "0-<N-1>"`. `RESUME=1` skips frames already on disk, so any interruption is safe to continue. Don't run heavy Python at the same time on small machines.
- Where background processes survive (Claude Code, Cowork): run it in the background and watch it with a monitor loop that reports progress and catches errors or exit.
- In the claude.ai chat sandbox a background process dies as soon as the tool call returns (checked: it stalled at 18 frames). Run it in the foreground in chunks instead and repeat until it prints `done`: `RESUME=1 timeout 280 node render.mjs frames "0-<N-1>"`. A final `Target page, context or browser has been closed` is just `timeout` ending the chunk, not an error. Count `ls frames | wc -l` after each chunk and tell the person the progress.
- Preview (about 4x faster): `SCALE=0.5 RESUME=1 node render.mjs frames "0-<N-1>" 2 0.9` renders 540x960 and every second frame, then `FPS=15 bash finish.sh "Title PREVIEW"`. Use it to check timing, camera and sound, then run the full render only after approval. Say clearly that it is a preview (half size, 15 fps).
- Run `bash finish.sh "Title"`. It applies one linear gain to about −14 LUFS plus a −1 dBFS peak limiter, encodes H.264 CRF 17 + AAC, runs freeze/black and loudness QA, and writes `out/qa_sheet.jpg`. Look at the sheet. Frozen spans ≥0.4 s or black frames need a fix.
- Deliver the MP4 with SendUserFile and a few lines on what each shot shows. Offer captions, tweaks, or the next idea from the list.

## Engine gotchas (kept in the kit; keep them if rebuilding)
- `#include <fog_vertex>` / `<fog_fragment>` go on their own lines.
- The final pass writes `linearToOutputTexel(...)` (render targets are linear HalfFloat).
- The normal+depth pass swaps materials per mesh: world → normal/depth, cards → alpha-tested mask (rgb 0, a = depth), blobs/clouds/sky hidden, water → flat normal. Fog and shadows are off during it.
- Ink goes on the near side of depth jumps only. Creases come from the normal dot. Card neighbours are skipped. Ink fades at ~140-520 m.
- DOF: 48 taps with a per-sample CoC test (no foreground bleed).
- The sun comes from az/el per light preset. The shadow camera is centred on each shot's action.

## Architecture (reference for editing the kit)
- `engine/cast.js` extra outfits and expressions (appended to toon.js), `engine/cast.html` + `tools/cast_sheet.mjs` preview sheets, `worlds/` ready-made worlds + `apply_world.py`, `example/wind/` second worked example.
- `web/index.html` loads `main.js` (ES module) over a local HTTP server.
- `main.js`: renderer, toon materials, world, cards (1200x2000 CanvasTexture planes, origin at soles), passes colour (RT samples 4) → normal/depth → ink+grade (saturation, gain/lift, vignette, flash) → DOF to screen. It exposes `window.renderFrame(f)` and `window.ready`.
- `story.js` exports SHOTS, `shotAt`, `camAt`, `dofAt`, LIGHTS/`lightFor`, `worldAt`, `actorsAt(f, T)`, `fxAt(f, T)`. All are pure functions of the frame.
- `render.mjs`: Playwright → `renderFrame(f)` → `toDataURL('image/jpeg', .95)` → `frames/f0000.jpg`.
- `mix.py`: gated-RMS level lock (music and SFX at 50 % of the voice). `finish.sh`: measures `mix_raw.wav`, applies one linear gain to -14 LUFS (never dynamic loudnorm), a -1 dBFS limiter, encode, QA.
- Characters: the Pen API from mromidev/claude-animated-shorts `templates/bridge/toon.ts`, extended in the same module scope by the cast file.