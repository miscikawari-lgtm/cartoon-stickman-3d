// usage: node strip_ts.mjs <in.ts> <out.js>   (Node >= 22.6; strips TypeScript types, no network)
import { stripTypeScriptTypes } from 'node:module';
import fs from 'node:fs';
const [,, input, output] = process.argv;
if (!input || !output) { console.error('usage: node strip_ts.mjs <in.ts> <out.js>'); process.exit(2); }
fs.writeFileSync(output, stripTypeScriptTypes(fs.readFileSync(input, 'utf8'), { mode: 'transform' }));
