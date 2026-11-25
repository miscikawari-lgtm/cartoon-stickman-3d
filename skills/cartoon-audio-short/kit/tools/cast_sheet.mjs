// usage (from a project made by setup.sh):
//   node cast_sheet.mjs cast  out/cast.png                 all outfits, full body
//   node cast_sheet.mjs expr  out/expr.png [outfit]        all expressions on one outfit (default civA)
//   node cast_sheet.mjs heads out/heads.png               every outfit as a head close-up (glasses, hair, hats)
//   node cast_sheet.mjs cast out/x.png civA viking,pharaoh,samurai   only the listed outfits (full body)
//   node cast_sheet.mjs tex   out/tex.png                  all painted textures
// Use it to choose the cast and the look before writing the story, and to check anything you add to cast.js / paint.js.
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, mode = 'cast', out = `out/${mode}.png`, who = 'civA', keys = ''] = process.argv;   // keys: comma list of outfits (cast/heads modes)
const root = process.env.WEB || path.resolve('web');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); s.end(fs.readFileSync(p)); }).listen(0);
await new Promise((r) => srv.on('listening', r));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await b.newPage({ viewport: { width: 1500, height: 900 } });
pg.on('pageerror', (e) => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/cast.html?mode=${mode}&who=${who}&keys=${keys}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 60000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
fs.mkdirSync(path.dirname(out), { recursive: true });
await (await pg.$('#c')).screenshot({ path: out });
console.log('wrote', out); await b.close(); srv.close();
