# worlds

Ready-made worlds for the engine. Each folder holds `world_block.js` (scenery), `world_state.js` (per-frame state, `worldState`), and a README listing the state fields a story must provide.

- `studio`: neutral explainer stage with a table and the 12 everyday-object props (exploded views).
- `hilltown`: windy hill town with a wall, church, clothesline, wind streaks, roofs and a hat.

Use: `bash tools/setup.sh <project>` then `python3 worlds/apply_world.py <project>/web/main.js <name>`.
The default example (soldier on the bridge) is the engine's built-in world. To add a world: copy `hilltown/`, change the scenery, keep the `// world: <name>` first line, and keep `worldState`.
