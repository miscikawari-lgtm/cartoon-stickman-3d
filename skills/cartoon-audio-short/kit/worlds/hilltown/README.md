# hilltown

A windy hill town: grass hilltop with a dirt road, 12 houses (the first three can lose their roofs), a church (11.6 m),
a stone wall of 15 one-metre courses, a clothesline with 7 cloths and 14 pegs, wind streaks (3D dashes), pines, far hills,
mountains, painted clouds, and a 3D hat prop. Cards stand on y = 0 (`DECK = 0`). Wall at x = -6 (long axis z), church at (5.5, -5),
clothesline at z = 15. Wind blows from -x to +x.

Apply: `python3 <skill>/kit/worlds/apply_world.py <project>/web/main.js hilltown` (fresh project only), then use `example/wind/story.js` as the template.

## State your story.js `worldAt(f)` must return
| field | meaning |
|---|---|
| `wallH` | wall height in metres, 0 to 15 (courses appear one by one) |
| `wind` | `{ mode: 'none' \| 'straight' \| 'hit' \| 'over', amt: 0..1 }`: `hit` stops at the wall, `over` climbs it and dives behind |
| `cloth` | `{ vis, amp: 0..1, flyF }`: washing visible, flap strength, frame at which it starts flying off |
| `roofs` | `[p0, p1, p2]` 0..1: roof lift-off progress of houses 0 to 2 |
| `hat` | `null` or `{ t: 0..1 }`: hat flight progress (3D prop) |
| `pegN` | 0..14 pegs shown |

Also export from story.js the usual `shotAt, camAt, dofAt, lightFor, actorsAt, fxAt, LIGHTS, SHOTS, TOTAL`. `HOUSES` in the example story mirrors the first house positions for dust FX.
Needs the cast from `engine/cast.js` (`mayor`, `workA`, `workB`, `civA..C`). Textures used: grass, dirt, plaster, roof, stone, planks.
