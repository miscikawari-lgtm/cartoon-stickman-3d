// Shot plan for "The Town That Walled Out the Wind" - timed to voice.mp3 (29.39 s, 30 fps, 882 frames).
// Phrases (frames): 0-64 "A town built a wall to keep out the wind." | 74-119 "The wind took it personally." |
// 139-183 "Brindle sat on a windy hill," | 187-275 "and every morning its washing flew off to the next county." |
// 287-338 "So the mayor ordered a wall." | 349-372 "Ten feet high." | 382-398 "Then twenty." | 403-452 "Then taller than the church." |
// 465-476 "You see," | 481-529 "wind doesn't stop at a wall." | 539-563 "It climbs over," | 567-603 "and drops down behind," | 611-640 "harder than before." |
// 653-701 "The first gust took the roofs." | 709-753 "The second took the mayor's hat." | 767-817 "They tore the wall down by spring." | 829-876 "Then they bought clothes pegs."
export const FPS = 30, TOTAL = 882, DECK = 0;
export const SHOTS = [
  { id: 'hook', a: 0, b: 73, light: 'day' },
  { id: 'gust', a: 74, b: 138, light: 'day' },
  { id: 'hill', a: 139, b: 186, light: 'day' },
  { id: 'wash', a: 187, b: 286, light: 'day' },
  { id: 'order', a: 287, b: 348, light: 'day' },
  { id: 'grow', a: 349, b: 464, light: 'day' },
  { id: 'pivot', a: 465, b: 538, light: 'storm' },
  { id: 'over', a: 539, b: 640, light: 'storm' },
  { id: 'roofs', a: 641, b: 708, light: 'storm' },
  { id: 'hat', a: 709, b: 766, light: 'storm' },
  { id: 'tear', a: 767, b: 828, light: 'day' },
  { id: 'pegs', a: 829, b: 881, light: 'day' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

// ---------- lights ----------
export const LIGHTS = {
  day: { az: 130, el: 48, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 90, fogFar: 900,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, vig: 0.2, shadowExt: 22 },
  storm: { az: 130, el: 40, sky: '#9aa7bb', ground: '#5c6068', hemi: 1.0, sun: '#e4e9f2', sunI: 1.5, fog: '#98a4b6', fogNear: 90, fogFar: 800,
    skyTop: '#56688a', skyHor: '#aebbcd', sat: 0.98, vig: 0.3, shadowExt: 30 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'hook') L.shadowExt = lerp(10, 40, smooth(ramp(f, 30, 73)));
  if (S.id === 'grow' || S.id === 'tear') L.shadowExt = 40;
  return L;
};

// ---------- cameras ----------
const CAMS = {
  hook: [
    { f: 0, pos: [-1.7, 1.75, 1.0], look: [-4.2, 1.6, 0], fov: 34 },
    { f: 30, pos: [-1.8, 1.75, 1.1], look: [-4.2, 1.6, 0], fov: 33 },
    { f: 73, pos: [8, 4.5, 16], look: [-5, 2.6, -1], fov: 44 },
  ],
  gust: [
    { f: 74, pos: [-9.2, 2.3, 9.0], look: [-7.9, 1.8, 0.9], fov: 40 },
    { f: 138, pos: [-8.6, 2.4, 7.6], look: [-7.8, 1.9, 0.9], fov: 36 },
  ],
  hill: [
    { f: 139, pos: [30, 20, 40], look: [6, 3, 4], fov: 46 },
    { f: 186, pos: [22, 13, 34], look: [6, 3, 4], fov: 44 },
  ],
  wash: [
    { f: 187, pos: [6.5, 1.9, 33], look: [7.5, 2.0, 15], fov: 40 },
    { f: 286, pos: [7.5, 2.0, 31], look: [9, 2.6, 15], fov: 42 },
  ],
  order: [
    { f: 287, pos: [-1.2, 1.7, 4.2], look: [-3.8, 1.65, 2.5], fov: 32 },
    { f: 348, pos: [-1.5, 1.72, 4.4], look: [-3.8, 1.7, 2.5], fov: 30 },
  ],
  grow: [
    { f: 349, pos: [-0.5, 1.8, 30], look: [-0.5, 6.5, 0], fov: 54 },
    { f: 464, pos: [-0.5, 1.8, 31], look: [-0.5, 7.2, 0], fov: 55 },
  ],
  pivot: [
    { f: 465, pos: [-11, 13.0, 13], look: [-6, 14, 0], fov: 40 },
    { f: 500, pos: [-3, 9, 24], look: [-1, 8, 0], fov: 48 },
    { f: 538, pos: [-0.5, 7.8, 36], look: [-0.5, 7.8, 0], fov: 52 },
  ],
  over: [
    { f: 539, pos: [-0.5, 7.8, 36], look: [-0.5, 7.8, 0], fov: 52 },
    { f: 600, pos: [4, 4.5, 22], look: [6, 3.0, 0], fov: 46 },
    { f: 640, pos: [8, 2.6, 16], look: [8, 2.5, 0], fov: 42 },
  ],
  roofs: [
    { f: 641, pos: [10, 2.0, 20], look: [8, 3, 0], fov: 46 },
    { f: 708, pos: [12, 3.6, 18], look: [10, 5, -2], fov: 50 },
  ],
  hat: [
    { f: 709, pos: [5.9, 1.7, 15.2], look: [3.5, 1.95, 12.5], fov: 32 },
    { f: 766, pos: [5.9, 1.8, 15.2], look: [3.9, 2.15, 12.5], fov: 38 },
  ],
  tear: [
    { f: 767, pos: [10, 5, 30], look: [-4, 5, 0], fov: 50 },
    { f: 828, pos: [4, 6, 26], look: [-4, 4, 0], fov: 50 },
  ],
  pegs: [
    { f: 829, pos: [0.6, 2.5, 17.2], look: [8, 2.3, 15], fov: 42 },
    { f: 881, pos: [1.2, 2.45, 16.9], look: [8, 2.3, 15], fov: 38 },
  ],
};
const KICKS = [{ f: 74, a: 0.04 }, { f: 653, a: 0.05 }, { f: 667, a: 0.04 }, { f: 681, a: 0.04 }, { f: 735, a: 0.05 }];
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  let c;
  if (f <= K[0].f) c = { ...K[0] };
  else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else for (let i = 0; i < K.length - 1; i++) if (f >= K[i].f && f <= K[i + 1].f) {
    const t = smooth((f - K[i].f) / (K[i + 1].f - K[i].f)), a = K[i], b = K[i + 1];
    c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
  c = { roll: 0, ...c };
  for (const k of KICKS) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  c.flash = f >= 465 && f < 469 ? (1 - (f - 465) / 4) * 0.3 : 0;
  c.shadowAt = S.id === 'grow' || S.id === 'tear' ? [-2, 4, 0] : S.id === 'hill' ? [6, 0, 4] : S.id === 'wash' ? [7, 0, 15] : S.id === 'pegs' ? [6, 0, 15] : c.look;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'hook': return { focus: dist(C.pos, [-4.2, 1.6, 0]), cinf: lerp(9, 0, smooth(ramp(f, 30, 60))) };
    case 'gust': return { focus: dist(C.pos, [-8.3, 1.4, 1.0]), cinf: 6 };
    case 'order': return { focus: dist(C.pos, [-3.8, 1.65, 2.5]), cinf: 9 };
    case 'hat': return { focus: dist(C.pos, [3.5, 1.7, 12.5]), cinf: 8 };
    case 'pegs': return { focus: dist(C.pos, [5, 2.4, 15.5]), cinf: 4 };
    default: return { focus: 20, cinf: 0 };
  }
};

// ---------- world state (pure function of the frame) ----------
export const worldAt = (f) => {
  const S = shotAt(f);
  // wall height in metres: 3 m ("ten feet") -> 6 m ("twenty") -> 14.2 m (taller than the church) -> torn down
  let wallH = 3;
  if (f >= 372) wallH = lerp(3, 6, smooth(ramp(f, 372, 384)));
  if (f >= 400) wallH = lerp(6, 14.2, smooth(ramp(f, 400, 452)));
  if (f >= 767) wallH = lerp(14.2, 0, ramp(f, 767, 822));
  let wind;
  if (f < 74) wind = { mode: 'hit', amt: 0.35 };
  else if (f < 139) wind = { mode: 'hit', amt: lerp(0.5, 1, ramp(f, 74, 110)) };
  else if (f < 287) wind = { mode: 'straight', amt: 0.9 };
  else if (f < 465) wind = { mode: 'none', amt: 0 };
  else if (f < 767) wind = { mode: 'over', amt: f < 480 ? ramp(f, 465, 480) : 1 };
  else wind = { mode: 'straight', amt: 0.5 };
  // washing: flaps hard, flies off, gone while the wall stands, back (pegged) at the end
  const cloth = f < 300 ? { vis: true, amp: 1, flyF: 208 } : f >= 829 ? { vis: true, amp: 0.85, flyF: 1e9 } : { vis: false, amp: 0, flyF: 1e9 };
  const roofs = [0, 1, 2].map((i) => ramp(f, 653 + i * 14, 653 + i * 14 + 42));
  const hat = f >= 735 ? { t: ramp(f, 735, 790) } : null;
  return { wallH, wind, cloth, roofs, hat, pegN: f >= 835 ? Math.floor(ramp(f, 835, 876) * 14.99) : 0 };
};

// ---------- actors (2D cards) ----------
const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const mayor = (o, pos, extra = {}) => out.push(R(T, 'mayor', { seed: 5, blink: blinkAt(f, 5), nocap: f >= 735, ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      mayor({ expr: f < 40 ? 'smile' : 'grin', L: 'hip', R: 'hip', look: f < 40 ? 0 : 0.3 }, [-4.2, 0, 0]);
      out.push(R(T, 'workA', { seed: 41, expr: 'neutral', L: 'lift', R: 'lift', blink: blinkAt(f, 41) }, [-5.0, 0, 4.5]));
      out.push(R(T, 'workB', { seed: 42, expr: 'neutral', L: 'cross', R: 'hang', blink: blinkAt(f, 42) }, [-4.8, 0, -4.5]));
      break;
    }
    case 'gust': {
      const lean = 7 + 3 * Math.sin(f * 0.6);
      mayor({ expr: f < 100 ? 'stubborn' : 'shock', L: 'cheek', R: 'hang', tilt: q(lean, 1), headTilt: q(2 * Math.sin(f * 0.7), 1), look: -0.4, facing: -1 }, [-8.3, 0, 1.0]);
      break;
    }
    case 'hill': {
      out.push(R(T, 'civB', { seed: 12, expr: 'shock', L: 'up', R: 'up', blink: 0 }, [6.5 + (f - 139) * 0.02, 0, 16.4]));
      out.push(R(T, 'civA', { seed: 11, expr: 'neutral', facing: 1, blink: blinkAt(f, 11) }, [0.8, 0, 8.4]));
      break;
    }
    case 'wash': {
      const k = f - 187;
      out.push(R(T, 'civB', { seed: 12, expr: k < 20 ? 'shock' : 'nervous', L: 'up', R: 'reach', step: q((k * 0.045) % 1, 2), look: 0.5, blink: 0 }, [4.8 + k * 0.045, 0, 16.6]));
      out.push(R(T, 'civC', { seed: 32, expr: 'laugh', L: 'belly', R: 'belly', bob: q(Math.abs(Math.sin(f * 0.5)) * 0.02, 3), tilt: q(4 * Math.sin(f * 0.5), 1) }, [10.2, 0, 17.4]));
      break;
    }
    case 'order': {
      mayor({ expr: 'grin', L: f >= 300 ? 'point' : 'hip', R: 'hip', look: -0.5, bob: f >= 330 && f < 336 ? 0.015 : 0, facing: -1 }, [-3.8, 0, 2.5]);
      out.push(R(T, 'workA', { seed: 41, expr: 'neutral', blink: blinkAt(f, 41), look: 0.3 }, [-4.9, 0, 0.9]));
      out.push(R(T, 'workB', { seed: 42, expr: 'neutral', blink: blinkAt(f, 42), look: -0.3, R: 'cross' }, [-5.0, 0, 4.1]));
      break;
    }
    case 'grow': {
      const cheer = f >= 403;
      mayor({ expr: cheer ? 'grin' : 'smile', L: cheer ? 'up' : 'hip', R: cheer ? 'up' : 'hip', bob: cheer ? q(Math.abs(Math.sin(f * 0.4)) * 0.02, 3) : 0 }, [-3.2, 0, 4.2]);
      out.push(R(T, 'workA', { seed: 41, expr: 'grin', L: 'up', R: 'hang', blink: 0 }, [-4.4, 0, 6.2]));
      out.push(R(T, 'workB', { seed: 42, expr: 'grin', L: 'hang', R: 'up', blink: 0 }, [-2.2, 0, 6.0]));
      break;
    }
    case 'roofs': {
      const sh = f >= 655;
      out.push(R(T, 'civA', { seed: 11, expr: sh ? 'shock' : 'nervous', L: sh ? 'cheek' : 'hang', R: sh ? 'cheek' : 'hang', blink: sh ? 0 : blinkAt(f, 11) }, [6.2, 0, 11.4]));
      out.push(R(T, 'civC', { seed: 32, expr: sh ? 'shock' : 'nervous', L: sh ? 'up' : 'hang', R: sh ? 'up' : 'hang', blink: 0 }, [8.4, 0, 12.8]));
      out.push(R(T, 'civB', { seed: 12, expr: sh ? 'shock' : 'neutral', L: sh ? 'cheek' : 'hang', R: sh ? 'cheek' : 'hang', blink: 0 }, [10.2, 0, 11.2]));
      break;
    }
    case 'hat': {
      const second = f >= 735;
      mayor({ expr: second ? 'shock' : 'stubborn', L: second ? 'up' : 'hang', R: second ? 'up' : 'hang', tilt: q(4 * Math.sin(f * 0.5), 1), headTilt: second ? q(6 * Math.sin(f * 0.8), 1) : 0, look: 0.3 }, [3.5, 0, 12.5]);
      break;
    }
    case 'tear': {
      const k = f - 767;
      for (let i = 0; i < 4; i++) {
        out.push(R(T, i % 2 ? 'workB' : 'workA', { seed: 41 + i, expr: 'grin', L: 'lift', R: 'lift', bob: q(Math.abs(Math.sin((k + i * 7) * 0.4)) * 0.012, 3), blink: 0 }, [-3.4, 0, -12 + i * 8.5]));
      }
      mayor({ expr: 'neutral', L: 'cross', R: 'cross', blink: blinkAt(f, 5) }, [-1.0, 0, 3.5]);
      break;
    }
    case 'pegs': {
      out.push(R(T, 'civB', { seed: 12, expr: 'smile', L: 'up', R: 'up', blink: blinkAt(f, 12), look: 0.4 }, [12.0, 0, 16.6]));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
// house footprints (x, z, rot, height): mirrored in main.js; the first three lose their roofs
export const HOUSES = [[0.5, -6, 0, 3.6], [6, 7, 0, 3.4], [12, -11, 0, 3.4]];
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const leaves = (n, f0, spd, zc, yc) => {
    for (let i = 0; i < n; i++) {
      const t = (((f - f0) * spd + i / n) % 1 + 1) % 1, cols = ['#d9822b', '#c4452c', '#e6b13a'];
      out.push(FX('leaf' + (i % 3), (p) => T.fxLeaf(p, cols[i % 3]), [-30 + t * 26 + Math.sin(i * 3.1) * 0.6, yc + Math.sin(t * 14 + i) * 0.9 + (i % 4) * 0.35, zc - 2 + i * 0.5], 0.14, { roll: q(t * 12 + i, 1) }));
    }
  };
  if (S.id === 'gust') leaves(8, 74, 0.016, 1.0, 1.2);
  if (S.id === 'wash' || S.id === 'hill') leaves(6, 139, 0.02, 15.5, 1.8);
  if (S.id === 'order' && f >= 330 && f < 345) { const t = q((f - 330) / 15); out.push(FX('puff' + t, (p) => { p.g.translate(150, 700); p.g.scale(1.1, 1.1); T.fxPuff(p, t); }, [-3.5, 0, 2.7], 0.5)); }
  if (S.id === 'grow') {
    for (const [f0, x, z] of [[372, -5.2, 7], [400, -5.2, -2], [440, -5.2, 5]]) {
      if (f >= f0 && f < f0 + 20) { const k = q((f - f0) / 20, 2); out.push(FX('dust' + k + x, (p) => T.fxDust(p, k, '#e3d6bb'), [x, 0.4, z], 4.5 + k * 3)); }
    }
  }
  if (S.id === 'roofs') {
    for (let i = 0; i < 3; i++) {
      const f0 = 653 + i * 14;
      if (f >= f0 && f < f0 + 22) { const k = q((f - f0) / 22, 2); out.push(FX('dustr' + i + k, (p) => T.fxDust(p, k, '#d9ccb5'), [HOUSES[i][0], HOUSES[i][3] + 1, HOUSES[i][1]], 3.2 + k * 2)); }
    }
  }
  if (S.id === 'hat' && f >= 735 && f < 755) { const t = q((f - 735) / 20); out.push(FX('puffh' + t, (p) => { p.g.translate(150, 700); T.fxPuff(p, t); }, [3.6, 1.5, 12.6], 0.5)); }
  if (S.id === 'tear') {
    const k = q(((f - 767) % 20) / 20, 2);
    for (let i = 0; i < 3; i++) out.push(FX('dustt' + i + k, (p) => T.fxDust(p, (k + i * 0.3) % 1, '#e3d6bb'), [-5.6, 0.4, -14 + i * 14], 4 + i));
  }
  return out;
};
