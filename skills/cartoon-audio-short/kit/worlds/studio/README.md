# studio

Neutral explainer stage for "how does X work / where does X come from" shorts: floor, curved backdrop, wooden table (top at y = 1). Objects from `engine/props.js` sit on the table. Characters (cards) stand on the floor.

Apply: `python3 <skill>/kit/worlds/apply_world.py <project>/web/main.js studio`, then start from `example/props/story.js`.

## State your `worldAt(f)` returns
| field | meaning |
|---|---|
| `bg` | backdrop colour (hex), can change per shot |
| `props` | array of `{ name, x, y, z, rx, ry, rz, scale, explode }`: `name` is a prop (riceCooker, donut, microphone, vintageMic, headphones, earbuds, iron, cottonBud, lightBulb, iceCream, trophy, soccerBall); `explode` 0 = assembled to 1 = exploded view; `y` defaults to the table top (1.0); slot i keeps its own instance, so to show two of the same prop use two different slots |

Props are about 1 unit tall, so use `scale` 1.2 to 2 for close shots. Suggested camera: position [0, 2.9, 4.6], look at [0, 1.9, 0], fov 40.
Light: define a bright neutral `LIGHTS` entry (see `example/props/story.js`), `shadowExt` about 6 for crisp shadows on the table.
Add your own props in `engine/props.js` (copy any block, register the name in `PROP_NAMES`, and register parts with `part(mesh, dir)` so the exploded view works).
