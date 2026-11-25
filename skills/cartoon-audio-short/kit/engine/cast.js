// Extra cast and expressions, appended to toon.js after roman.js (same module scope, so FACE and OUTFITS are visible).
// Outfit fields the engine understands: tunic, cape, skin, hair, cap, apron, dress, toga, stout, beard, brows, moustache,
// helmet (true | "old"), armor, spear, shield. Colours are CSS hex. Draw with romanFront(p, "<key>", { expr, L, R, ... }).
// Outfit field crest (helmet crest colour) is optional.
Object.assign(OUTFITS, {
  mayor:    { tunic: "#7a2f3a", skin: "#f5c9a0", hair: "#d9d4c8", cap: "#2b2430", stout: true, moustache: "#d9d4c8", toga: "#c9a23a" },
  baker:    { tunic: "#f4efe6", skin: "#f5c9a0", cap: "#ffffff", apron: "#e8dcc4", moustache: "#3a2a20", stout: true },
  fisher:   { tunic: "#2f5d7c", skin: "#e8c2a0", cap: "#d9a441", beard: "#8a5a3a", brows: "#8a5a3a" },
  farmer:   { tunic: "#7a8f3a", skin: "#d9a37a", cap: "#c9a86a", moustache: "#5a3b2a" },
  granny:   { tunic: "#cdb3e8", skin: "#f3d6bb", hair: "#e8e8e8", dress: "#7a5aa0" },
  king:     { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#a8322f", cape: "#6b1f2a", cap: "#d9a845", beard: "#d8d0c0", brows: "#d8d0c0", stout: true },
  guard:    { tunic: "#2f4f8f", cape: "#1f3a6f", skin: "#ecd0b6", helmet: true, armor: true, shield: true, crest: "#2c5fb3" },
  wizard:   { tunic: "#2a2d6b", cape: "#3b3f8f", skin: "#f3d6bb", cap: "#3b3f8f", beard: "#f0f0f0", brows: "#f0f0f0" },
  merchant: { tunic: "#f1ead8", skin: "#d9a37a", toga: "#2f7a5a", cap: "#c2733a", moustache: "#2b211c", stout: true },
  thief:    { tunic: "#3b3b46", cape: "#2b2b35", skin: "#ecd0b6", cap: "#2b2b35", brows: "#2b2b35" },
  sailor:   { tunic: "#f1f1f1", skin: "#e8c2a0", cap: "#27406b", beard: "#5a3b2a", brows: "#5a3b2a" },
  scholar:  { tunic: "#e9e4d4", skin: "#f5c9a0", hair: "#cfcfcf", cape: "#6a4a8a", brows: "#cfcfcf" },
});
// brow = [left, right] lift in px-ish units (negative = raised, positive = lowered toward the eye); see FACE in toonbase.js
Object.assign(FACE, {
  sad:     { eye: ["small", "small"], brow: [-4, 4],  mouth: "frown" },
  angry:   { eye: ["slit", "slit"],   brow: [6, -6],  mouth: "teeth" },
  smug:    { eye: ["lid", "lid"],     brow: [-1, -3], mouth: "smirk" },
  wink:    { eye: ["dot", "happy"],   brow: [0, -3],  mouth: "smirk" },
  worried: { eye: ["small", "small"], brow: [-5, 3],  mouth: "wave" },
  proud:   { eye: ["happy", "happy"], brow: [-1, -1], mouth: "smile" },
  cheeky:  { eye: ["happy", "happy"], brow: [-2, -2], mouth: "lick" },
  awe:     { eye: ["shock", "shock"], brow: [-6, -6], mouth: "o" },
});

// ================= head details =================
// Outfit fields (all optional, combine freely):
//   headW, headH   head shape multipliers (0.85 to 1.3)
//   style          hair style: spiky | mohawk | tuft | bald (replace the default hair) or bun | ponytail | pigtails | afro | long (added to it); needs hair: "#rrggbb"
//   ears           true: visible ears
//   glasses        round | square | shades | monocle     (glassColor: frame colour)
//   nose           round | long | clown
//   marks          array of: freckles, blush, scar, plaster, mole
//   hat2           chef | wizard | tophat | beanie | hardhat | beret | headband | propeller    (hatColor, hatBand: colours)
const HAIR_REPLACE = new Set(["spiky", "mohawk", "tuft", "bald"]);
const _arc = (cx, cy, rx, ry, a0, a1, n = 28) => ellPts(cx, cy, rx, ry, a0, a1, 0, n);
function headBehind(p, O, G) { // drawn before the head fill
  const { cx, hc, H, ow } = G, hair = O.hair || "#3b2a20";
  if (O.ears) for (const s of [-1, 1]) p.ell(cx + s * H.a * 1.0, hc + 0.04 * H.b, 0.2 * H.a, 0.27 * H.b, G.skin, ow * 0.8);
  switch (O.style) {
    case "afro": p.poly(_arc(cx, hc - 0.25 * H.b, 1.42 * H.a, 1.3 * H.b, 0, 360, 44), hair, ow); break;
    case "long": p.poly(rrect(cx - 1.12 * H.a, hc - 0.4 * H.b, cx + 1.12 * H.a, hc + 2.0 * H.b, 0.5 * H.a), hair, ow); break;
    case "pigtails": for (const s of [-1, 1]) p.ell(cx + s * 1.22 * H.a, hc + 0.5 * H.b, 0.28 * H.a, 0.5 * H.b, hair, ow); break;
    case "ponytail": p.ell(cx + 1.15 * H.a, hc + 0.5 * H.b, 0.3 * H.a, 0.62 * H.b, hair, ow); break;
  }
  headBehind2(p, O, G);
  animalBehind(p, O, G);
}
function headFront(p, O, G) { // drawn after the face
  const { cx, hc, H, u, ow, facing } = G, fx = cx + 7 * u * facing, cr = hc - H.b, hair = O.hair || "#3b2a20", col = O.hatColor, frame = O.glassColor || INK;
  const top = (th, r) => [cx + Math.cos(rad(th)) * H.a * r, hc + Math.sin(rad(th)) * H.b * r];
  // nose
  if (O.nose === "round") p.ell(fx, hc + 8 * u, 4.5 * u, 5 * u, mul(G.skin, [0.92, 0.84, 0.82]), 2.2 * u);
  if (O.nose === "long") p.ell(fx, hc + 10 * u, 4.5 * u, 9 * u, mul(G.skin, [0.92, 0.84, 0.82]), 2.2 * u);
  if (O.nose === "clown") p.ell(fx, hc + 8 * u, 7 * u, 7 * u, "#d9342b", 2.4 * u);
  // face marks
  for (const m of O.marks || []) {
    if (m === "freckles") for (const s of [-1, 1]) for (const [dx, dy] of [[19, 9], [25, 7], [23, 14], [29, 12]]) p.ell(fx + s * dx * u, hc + dy * u, 1.5 * u, 1.5 * u, "#b9764a", 0);
    if (m === "blush") for (const s of [-1, 1]) p.ell(fx + s * 25 * u, hc + 12 * u, 8 * u, 5 * u, "#e8707066", 0);
    if (m === "scar") { p.stroke([[fx - 26 * u, hc - 14 * u], [fx - 18 * u, hc + 10 * u]], 2.6 * u, "#a85a4a"); for (const t of [-6, 2]) p.stroke([[fx - 25 * u, hc + t * u], [fx - 18 * u, hc + (t + 3) * u]], 1.6 * u, "#a85a4a"); }
    if (m === "plaster") { p.poly(rrect(fx + 14 * u, hc + 7 * u, fx + 30 * u, hc + 14 * u, 2.5 * u), "#f0d2a4", 1.8 * u); p.ell(fx + 20 * u, hc + 10.5 * u, 0.9 * u, 0.9 * u, "#c9a574", 0); p.ell(fx + 24 * u, hc + 10.5 * u, 0.9 * u, 0.9 * u, "#c9a574", 0); }
    if (m === "mole") p.ell(fx + 19 * u, hc + 15 * u, 1.9 * u, 1.9 * u, "#5a3b2a", 0);
  }
  // glasses
  if (O.glasses && !NEW_GLASSES.has(O.glasses)) {
    const r = 10.5 * u;
    const lens = (x) => O.glasses === "square" ? rrect(x - r, hc - r * 0.85, x + r, hc + r * 0.85, 3 * u) : _arc(x, hc, r, r, 0, 360, 32);
    if (O.glasses === "monocle") { p.poly(lens(fx + 13 * u), "#cfe9ff44", 2.4 * u); p.stroke([[fx + 13 * u + r * 0.7, hc + r * 0.7], [fx + 24 * u, hc + 38 * u]], 1.4 * u, INK); }
    else {
      for (const s of [-1, 1]) p.poly(lens(fx + s * 13 * u), O.glasses === "shades" ? "#1b1b22" : "#cfe9ff44", 2.6 * u);
      p.stroke([[fx - 13 * u + r, hc - 1 * u], [fx + 13 * u - r, hc - 1 * u]], 2.4 * u, INK);
      for (const s of [-1, 1]) p.stroke([[fx + s * (13 * u + r), hc - 2 * u], [cx + s * H.a * 0.99, hc - 4 * u]], 2.2 * u, INK);
      if (O.glasses === "shades") for (const s of [-1, 1]) p.stroke([[fx + s * 13 * u - 6 * u, hc - 6 * u], [fx + s * 13 * u - 2 * u, hc - 8 * u]], 2 * u, "#ffffff99");
    }
  }
  // hair styles
  if (O.style === "spiky" || O.style === "mohawk") {
    const mo = O.style === "mohawk", a0 = mo ? 238 : 196, a1 = mo ? 302 : 344, n = mo ? 4 : 7, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push(top(a0 + (a1 - a0) * t, 1.02)); if (i < n) pts.push(top(a0 + (a1 - a0) * (t + 0.5 / n), mo ? 1.75 : 1.5)); }
    for (let i = n; i >= 0; i--) pts.push(top(a0 + (a1 - a0) * (i / n), mo ? 0.92 : 0.74));
    p.poly(pts, hair, ow * 0.9);
  }
  if (O.style === "tuft") { const c = [top(262, 1.0), top(256, 1.3), top(272, 1.62), top(290, 1.42), top(284, 1.22)]; p.stroke(c, 8 * u, INK); p.stroke(c, 5 * u, hair); }
  if (O.style === "bun") p.ell(cx, hc - 1.14 * H.b, 0.3 * H.a, 0.28 * H.a, hair, ow);
  if (O.style === "pigtails") for (const s of [-1, 1]) p.ell(cx + s * 1.1 * H.a, hc + 0.05 * H.b, 0.11 * H.a, 0.11 * H.a, O.tie || "#d9534f", 1.6 * u);
  if (O.style === "ponytail") p.ell(cx + 1.05 * H.a, hc + 0.05 * H.b, 0.11 * H.a, 0.11 * H.a, O.tie || "#d9534f", 1.6 * u);
  // hats
  const hat = O.hat2, bw = ow * 0.9;
  if (hat === "chef") {
    const c = col || "#ffffff";
    for (const [dx, dy, r] of [[-0.55, -0.4, 0.5], [0.55, -0.4, 0.5], [0, -0.8, 0.58]]) p.ell(cx + dx * H.a, cr + dy * H.b, r * H.a, r * H.a, c, bw);
    p.poly(rrect(cx - 0.86 * H.a, cr - 0.12 * H.b, cx + 0.86 * H.a, cr + 0.42 * H.b, 3 * u), c, bw);
  }
  if (hat === "wizard") {
    const c = col || "#3b3f8f";
    p.poly([[cx - 0.98 * H.a, cr + 0.5 * H.b], [cx - 0.6 * H.a, cr - 0.2 * H.b], [cx - 0.1 * H.a, cr - 1.1 * H.b], [cx + 0.55 * H.a, cr - 2.0 * H.b], [cx + 0.95 * H.a, cr - 1.7 * H.b], [cx + 0.62 * H.a, cr - 1.0 * H.b], [cx + 0.9 * H.a, cr + 0.1 * H.b], [cx + 1.0 * H.a, cr + 0.5 * H.b]], c, bw);
    p.poly(_arc(cx, cr + 0.52 * H.b, 1.45 * H.a, 0.2 * H.b, 0, 360, 32), c, bw);
    p.ell(cx - 0.15 * H.a, cr - 0.15 * H.b, 0.1 * H.a, 0.1 * H.a, "#f2d06b", 1.4 * u);
  }
  if (hat === "tophat") {
    const c = col || "#2b2430";
    p.poly(rrect(cx - 0.58 * H.a, cr - 1.05 * H.b, cx + 0.58 * H.a, cr + 0.4 * H.b, 3 * u), c, bw);
    p.poly(rrect(cx - 0.58 * H.a, cr + 0.12 * H.b, cx + 0.58 * H.a, cr + 0.34 * H.b, 1 * u), O.hatBand || "#c2362f", 0);
    p.poly(_arc(cx, cr + 0.42 * H.b, 1.2 * H.a, 0.16 * H.b, 0, 360, 32), c, bw);
  }
  if (hat === "beanie" || hat === "propeller") {
    const c = col || "#d9534f";
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.06 * H.a, 0.78 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 1.06 * H.a, cr + 0.4 * H.b, cx + 1.06 * H.a, cr + 0.55 * H.b, 2 * u), O.hatBand || "#f2f2f2", bw * 0.8);
    if (hat === "beanie") p.ell(cx, cr - 0.34 * H.b, 0.2 * H.a, 0.2 * H.a, O.hatBand || "#f2f2f2", bw * 0.8);
    else { p.stroke([[cx, cr - 0.25 * H.b], [cx, cr - 0.5 * H.b]], 3 * u, INK); p.ell(cx - 0.3 * H.a, cr - 0.54 * H.b, 0.32 * H.a, 0.07 * H.b, "#f2c230", 1.8 * u); p.ell(cx + 0.3 * H.a, cr - 0.54 * H.b, 0.32 * H.a, 0.07 * H.b, "#4f7fb8", 1.8 * u); }
  }
  if (hat === "hardhat") {
    const c = col || "#f2c230";
    p.poly(_arc(cx, cr + 0.46 * H.b, 1.05 * H.a, 0.85 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 0.13 * H.a, cr - 0.38 * H.b, cx + 0.13 * H.a, cr + 0.46 * H.b, 2 * u), mul(c, [0.86, 0.8, 0.6]), 1.4 * u);
    p.poly(rrect(cx - 1.22 * H.a, cr + 0.42 * H.b, cx + 1.22 * H.a, cr + 0.56 * H.b, 3 * u), c, bw);
  }
  if (hat === "beret") {
    const c = col || "#8f2f3a";
    p.poly(ellPts(cx + 0.18 * H.a, cr + 0.1 * H.b, 1.2 * H.a, 0.45 * H.b, 0, 360, rad(-12), 36), c, bw);
    p.ell(cx + 0.12 * H.a, cr - 0.34 * H.b, 0.07 * H.a, 0.1 * H.b, c, bw * 0.8);
  }
  if (hat === "headband") {
    const c = col || "#d9534f", y = hc - 0.56 * H.b;
    p.band([[cx - 1.02 * H.a, y], [cx + 1.02 * H.a, y]], c, 0.16 * H.b, bw * 0.6, "butt");
    p.poly([[cx + 1.0 * H.a, y], [cx + 1.38 * H.a, y - 0.12 * H.b], [cx + 1.22 * H.a, y + 0.14 * H.b]], c, 1.8 * u);
    p.poly([[cx + 1.0 * H.a, y], [cx + 1.34 * H.a, y + 0.22 * H.b], [cx + 1.1 * H.a, y + 0.26 * H.b]], c, 1.8 * u);
  }
  headFront2(p, O, G);
}
Object.assign(OUTFITS, {
  host:      { tunic: "#2f7a8f", skin: "#f5c9a0", hair: "#2b211c", style: "spiky", glasses: "round", marks: ["freckles"] },
  professor: { tunic: "#f4f4f4", skin: "#f5c9a0", hair: "#e9e9e9", style: "afro", glasses: "round", moustache: "#e9e9e9", headH: 1.14, nose: "long" },
  chef:      { tunic: "#ffffff", skin: "#f1c19a", hat2: "chef", moustache: "#3a2a20", marks: ["blush"], stout: true, apron: "#e8dcc4" },
  engineer:  { tunic: "#e8872a", skin: "#d9a37a", hat2: "hardhat", glasses: "square", marks: ["plaster"] },
  punk:      { tunic: "#2b2b35", skin: "#f5c9a0", hair: "#d9342b", style: "mohawk", marks: ["scar"], ears: true },
  kid:       { tunic: "#e0584f", skin: "#f5c9a0", hair: "#7a4a2a", style: "pigtails", marks: ["freckles", "blush"], headW: 1.14, headH: 1.1 },
  grandpa:   { tunic: "#6a7f8f", skin: "#f1c9a8", hair: "#e9e9e9", style: "tuft", glasses: "round", ears: true, moustache: "#e9e9e9", nose: "round" },
  artist:    { tunic: "#3b3f8f", skin: "#f5c9a0", hair: "#3b2a20", style: "bun", hat2: "beret", moustache: "#3b2a20", marks: ["mole"] },
  clown:     { tunic: "#f2c230", skin: "#f8dcc0", hair: "#3fa86a", style: "afro", nose: "clown", marks: ["blush"], headW: 1.06 },
  cool:      { tunic: "#1f1f26", skin: "#c99067", hair: "#1e1714", style: "ponytail", glasses: "shades", hat2: "headband", hatColor: "#f2c230" },
  maker:     { tunic: "#4f9a5d", skin: "#e8c2a0", hat2: "propeller", glasses: "round", marks: ["freckles"], headW: 1.06 },
  magician:  { tunic: "#2a2d6b", cape: "#3b3f8f", skin: "#f3d6bb", hat2: "tophat", glasses: "monocle", moustache: "#2b211c", nose: "round" },
});

// ================= head details, part 2 =================
//   style (more)   curly (replaces default hair) | bob | braid | topknot | dreads (added to it)
//   glasses (more) goggles (glassColor) | magnifier | eyepatch
//   beardStyle     goatee | stubble | mutton       (beardColor: colour, default = hair colour)
//   handlebar      colour: a big curled moustache
//   hat2 (more)    viking | pirate | cowboy | astronaut | fez | turban | pharaoh | crown | headphones | graduate | safari
const NEW_GLASSES = new Set(["goggles", "magnifier", "eyepatch"]);
HAIR_REPLACE.add("curly");
function headBehind2(p, O, G) {
  const { cx, hc, H, u, ow } = G, hair = O.hair || "#3b2a20";
  if (O.style === "bob") p.poly(rrect(cx - 1.1 * H.a, hc - 0.7 * H.b, cx + 1.1 * H.a, hc + 0.62 * H.b, 0.45 * H.a), hair, ow);
  if (O.style === "braid") for (let i = 0; i < 5; i++) p.ell(cx + (1.12 + 0.04 * (i % 2)) * H.a, hc + (0.45 + 0.36 * i) * H.b, 0.17 * H.a, 0.21 * H.b, hair, ow * 0.8);
  if (O.style === "dreads") for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const st = [[cx + s * (0.8 + 0.1 * k) * H.a, hc - 0.25 * H.b], [cx + s * (1.05 + 0.17 * k) * H.a, hc + (0.9 + 0.3 * k) * H.b]]; p.stroke(st, 0.2 * H.a, INK); p.stroke(st, 0.15 * H.a, hair); }
  if (O.hat2 === "pharaoh") for (const s of [-1, 1]) { p.poly(rrect(cx + s * 0.86 * H.a - 0.2 * H.a, hc - 0.3 * H.b, cx + s * 0.86 * H.a + 0.2 * H.a, hc + 1.3 * H.b, 0.06 * H.a), "#2f6fb5", ow * 0.8); p.stroke([[cx + s * 0.86 * H.a, hc - 0.2 * H.b], [cx + s * 0.86 * H.a, hc + 1.25 * H.b]], 0.07 * H.a, "#e0b43a"); }
}
function headFront2(p, O, G) {
  const { cx, hc, H, u, ow, facing } = G, fx = cx + 7 * u * facing, cr = hc - H.b, hair = O.hair || "#3b2a20", col = O.hatColor, bw = ow * 0.9;
  const top = (th, r) => [cx + Math.cos(rad(th)) * H.a * r, hc + Math.sin(rad(th)) * H.b * r];
  // hair
  if (O.style === "curly") {
    const cap = []; for (let th = 196; th <= 344; th += 12) cap.push(top(th, 1.0)); for (let th = 344; th >= 196; th -= 12) cap.push(top(th, 0.74));
    p.poly(cap, hair, 0);
    for (let th = 190; th <= 350; th += 15) { const [x, y] = top(th, 1.04); p.ell(x, y, 0.2 * H.a, 0.2 * H.a, hair, ow * 0.7); }
  }
  if (O.style === "topknot") { p.ell(cx, cr - 0.2 * H.b, 0.16 * H.a, 0.22 * H.b, hair, ow * 0.9); p.ell(cx, cr + 0.02 * H.b, 0.22 * H.a, 0.06 * H.b, "#d9534f", 1.4 * u); }
  // beards and moustaches
  const bc = O.beardColor || hair;
  if (O.beardStyle === "goatee") p.poly([[fx - 9 * u, hc + 30 * u], [fx + 9 * u, hc + 30 * u], [fx + 6 * u, hc + 47 * u], [fx, hc + 57 * u], [fx - 6 * u, hc + 47 * u]], bc, 2.2 * u);
  if (O.beardStyle === "stubble") for (let i = 0; i < 20; i++) p.ell(fx + (((i * 37) % 48) - 24) * u, hc + (27 + ((i * 13) % 20)) * u, 1.15 * u, 1.15 * u, "#4a3d3299", 0);
  if (O.beardStyle === "mutton") for (const s of [-1, 1]) p.poly([[cx + s * 0.93 * H.a, hc - 0.35 * H.b], [cx + s * 0.62 * H.a, hc + 0.15 * H.b], [cx + s * 0.72 * H.a, hc + 0.62 * H.b], [cx + s * 1.0 * H.a, hc + 0.3 * H.b]], bc, 2 * u);
  if (O.handlebar) for (const s of [-1, 1]) { const st = [[fx + s * 2 * u, hc + 13 * u], [fx + s * 16 * u, hc + 16 * u], [fx + s * 28 * u, hc + 12 * u], [fx + s * 32 * u, hc + 3 * u]]; p.stroke(st, 6.5 * u, INK); p.stroke(st, 4 * u, O.handlebar); }
  // eyewear
  if (O.glasses === "goggles") {
    const fr = O.glassColor || "#6a4a2a";
    p.stroke([[cx - H.a * 0.99, hc - 3 * u], [fx - 24 * u, hc - 2 * u]], 5 * u, INK); p.stroke([[cx + H.a * 0.99, hc - 3 * u], [fx + 24 * u, hc - 2 * u]], 5 * u, INK);
    for (const s of [-1, 1]) { p.poly(_arc(fx + s * 13 * u, hc, 11.5 * u, 11.5 * u, 0, 360, 32), "#9fe0ff77", 4.2 * u); p.poly(_arc(fx + s * 13 * u, hc, 11.5 * u, 11.5 * u, 0, 360, 32), null, 2.4 * u); p.stroke(_arc(fx + s * 13 * u, hc, 13.5 * u, 13.5 * u, 200, 340, 12), 2 * u, fr); }
    p.stroke([[fx - 3 * u, hc], [fx + 3 * u, hc]], 3 * u, INK);
  }
  if (O.glasses === "eyepatch") {
    p.stroke([[fx - 13 * u - 8 * u, hc - 6 * u], [cx - H.a * 0.99, hc - 0.35 * H.b]], 2.6 * u, INK); p.stroke([[fx - 13 * u + 6 * u, hc - 9 * u], [cx + H.a * 0.9, hc - 0.58 * H.b]], 2.6 * u, INK);
    p.ell(fx - 13 * u, hc, 12 * u, 10.5 * u, "#1b1b22", 2.4 * u);
  }
  if (O.glasses === "magnifier") {
    const x = fx + 13 * u; p.stroke([[x + 11 * u, hc + 11 * u], [x + 24 * u, hc + 34 * u]], 6 * u, INK); p.stroke([[x + 11 * u, hc + 11 * u], [x + 24 * u, hc + 34 * u]], 3.6 * u, "#6a4a2a");
    p.poly(_arc(x, hc, 15 * u, 15 * u, 0, 360, 32), "#cfe9ff55", 4.2 * u); p.poly(_arc(x, hc, 15 * u, 15 * u, 0, 360, 32), null, 2.4 * u); p.stroke(_arc(x, hc, 15 * u, 15 * u, 0, 360, 32), 1.6 * u, "#b8913a");
  }
  // more hats
  const hat = O.hat2;
  if (hat === "viking") {
    const c = col || "#9aa0a8";
    if (O.horns) for (const s of [-1, 1]) p.poly([[cx + s * 0.95 * H.a, cr + 0.32 * H.b], [cx + s * 1.38 * H.a, cr + 0.2 * H.b], [cx + s * 1.58 * H.a, cr - 0.35 * H.b], [cx + s * 1.42 * H.a, cr - 0.85 * H.b], [cx + s * 1.25 * H.a, cr - 0.3 * H.b], [cx + s * 1.05 * H.a, cr + 0.02 * H.b]], "#efe6cf", bw * 0.8);
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.06 * H.a, 0.82 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 1.06 * H.a, cr + 0.4 * H.b, cx + 1.06 * H.a, cr + 0.56 * H.b, 2 * u), "#6f757d", bw * 0.8);
    p.stroke([[cx, cr + 0.4 * H.b], [cx, cr + 0.9 * H.b]], 4 * u, INK); p.stroke([[cx, cr + 0.4 * H.b], [cx, cr + 0.9 * H.b]], 2.4 * u, "#6f757d");
  }
  if (hat === "pirate") {
    p.poly([[cx - 1.2 * H.a, cr + 0.52 * H.b], [cx - 0.92 * H.a, cr - 0.12 * H.b], [cx, cr - 0.5 * H.b], [cx + 0.92 * H.a, cr - 0.12 * H.b], [cx + 1.2 * H.a, cr + 0.52 * H.b], [cx, cr + 0.3 * H.b]], col || "#1f1f26", bw);
    p.ell(cx, cr + 0.0 * H.b, 0.15 * H.a, 0.15 * H.a, "#f2f2f2", 1.4 * u);
    for (const s of [-1, 1]) p.ell(cx + s * 0.05 * H.a, cr - 0.02 * H.b, 0.03 * H.a, 0.03 * H.a, "#1f1f26", 0);
    p.stroke([[cx - 0.3 * H.a, cr + 0.12 * H.b], [cx + 0.3 * H.a, cr + 0.12 * H.b]], 2.4 * u, "#f2f2f2");
  }
  if (hat === "cowboy") {
    const c = col || "#a8743a";
    p.poly([[cx - 0.62 * H.a, cr + 0.42 * H.b], [cx - 0.58 * H.a, cr - 0.35 * H.b], [cx - 0.2 * H.a, cr - 0.5 * H.b], [cx, cr - 0.32 * H.b], [cx + 0.2 * H.a, cr - 0.5 * H.b], [cx + 0.58 * H.a, cr - 0.35 * H.b], [cx + 0.62 * H.a, cr + 0.42 * H.b]], c, bw);
    p.poly(rrect(cx - 0.62 * H.a, cr + 0.22 * H.b, cx + 0.62 * H.a, cr + 0.4 * H.b, 1 * u), "#5a3b2a", 0);
    p.poly(_arc(cx, cr + 0.45 * H.b, 1.55 * H.a, 0.2 * H.b, 0, 360, 36), c, bw);
  }
  if (hat === "astronaut") {
    p.poly(_arc(cx, hc, 1.24 * H.a, 1.32 * H.b, 0, 360, 48), "#cfe9ff3a", bw * 1.1);
    p.stroke(_arc(cx, hc, 1.08 * H.a, 1.16 * H.b, 215, 262, 12), 3 * u, "#ffffffcc");
    p.band([[cx - 1.02 * H.a, hc + 1.2 * H.b], [cx + 1.02 * H.a, hc + 1.2 * H.b]], "#e9e9ef", 0.22 * H.b, bw * 0.8, "round");
  }
  if (hat === "fez") {
    p.poly([[cx - 0.62 * H.a, cr + 0.5 * H.b], [cx - 0.5 * H.a, cr - 0.55 * H.b], [cx + 0.5 * H.a, cr - 0.55 * H.b], [cx + 0.62 * H.a, cr + 0.5 * H.b]], col || "#b3262b", bw);
    p.stroke([[cx + 0.25 * H.a, cr - 0.55 * H.b], [cx + 0.7 * H.a, cr - 0.4 * H.b], [cx + 0.8 * H.a, cr + 0.1 * H.b]], 2.4 * u, INK); p.ell(cx + 0.8 * H.a, cr + 0.16 * H.b, 0.08 * H.a, 0.12 * H.b, "#e0b43a", 1.5 * u);
  }
  if (hat === "turban") {
    const c = col || "#f4efe6";
    p.poly(_arc(cx, cr + 0.58 * H.b, 1.14 * H.a, 1.0 * H.b, 180, 360), c, bw);
    for (const k of [0, 1, 2]) p.stroke(_arc(cx, cr + 0.6 * H.b, 1.1 * H.a, (0.32 + 0.24 * k) * H.b, 195, 345, 16), 2 * u, "#00000033");
    p.ell(cx, cr + 0.3 * H.b, 0.1 * H.a, 0.12 * H.a, "#c2362f", 1.6 * u);
  }
  if (hat === "pharaoh") {
    p.poly(_arc(cx, cr + 0.52 * H.b, 1.1 * H.a, 0.82 * H.b, 180, 360), "#2f6fb5", bw);
    for (const k of [-0.6, -0.2, 0.2, 0.6]) p.stroke([[cx + k * H.a, cr + 0.02 * H.b], [cx + k * 1.15 * H.a, cr + 0.5 * H.b]], 2.6 * u, "#e0b43a");
    p.poly(rrect(cx - 1.1 * H.a, cr + 0.4 * H.b, cx + 1.1 * H.a, cr + 0.56 * H.b, 2 * u), "#e0b43a", bw * 0.8);
  }
  if (hat === "crown") {
    p.poly([[cx - 0.8 * H.a, cr + 0.45 * H.b], [cx - 0.85 * H.a, cr - 0.45 * H.b], [cx - 0.45 * H.a, cr - 0.05 * H.b], [cx, cr - 0.65 * H.b], [cx + 0.45 * H.a, cr - 0.05 * H.b], [cx + 0.85 * H.a, cr - 0.45 * H.b], [cx + 0.8 * H.a, cr + 0.45 * H.b]], col || "#e0b43a", bw);
    for (const [dx, dy] of [[-0.85, -0.45], [0, -0.65], [0.85, -0.45]]) p.ell(cx + dx * H.a, cr + dy * H.b, 0.08 * H.a, 0.08 * H.a, "#c2362f", 1.4 * u);
  }
  if (hat === "headphones") {
    const c = col || "#3b3f46";
    p.stroke(_arc(cx, hc - 0.05 * H.b, 1.12 * H.a, 1.12 * H.b, 190, 350, 28), 9 * u, INK); p.stroke(_arc(cx, hc - 0.05 * H.b, 1.12 * H.a, 1.12 * H.b, 190, 350, 28), 6 * u, c);
    for (const s of [-1, 1]) { p.poly(rrect(cx + s * 1.12 * H.a - 0.17 * H.a, hc - 0.4 * H.b, cx + s * 1.12 * H.a + 0.17 * H.a, hc + 0.45 * H.b, 0.12 * H.a), c, bw); p.ell(cx + s * 1.02 * H.a, hc + 0.02 * H.b, 0.06 * H.a, 0.3 * H.b, "#ffffff22", 0); }
  }
  if (hat === "graduate") {
    p.poly(rrect(cx - 0.7 * H.a, cr + 0.28 * H.b, cx + 0.7 * H.a, cr + 0.56 * H.b, 3 * u), col || "#1f1f26", bw);
    p.poly([[cx - 1.28 * H.a, cr + 0.16 * H.b], [cx, cr - 0.22 * H.b], [cx + 1.28 * H.a, cr + 0.16 * H.b], [cx, cr + 0.5 * H.b]], col || "#1f1f26", bw);
    p.stroke([[cx, cr + 0.14 * H.b], [cx + 0.95 * H.a, cr + 0.2 * H.b], [cx + 1.05 * H.a, cr + 0.7 * H.b]], 2.4 * u, "#e0b43a"); p.ell(cx + 1.05 * H.a, cr + 0.76 * H.b, 0.07 * H.a, 0.1 * H.b, "#e0b43a", 1.4 * u);
  }
  if (hat === "safari") {
    const c = col || "#d9c79a";
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.12 * H.a, 0.9 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 1.12 * H.a, cr + 0.38 * H.b, cx + 1.12 * H.a, cr + 0.52 * H.b, 2 * u), "#7a5a3a", bw * 0.8);
    p.poly(_arc(cx, cr + 0.54 * H.b, 1.38 * H.a, 0.15 * H.b, 0, 360, 36), c, bw);
  }
  headFront3(p, O, G);
}
// hat2 (era and role hats): police | snapback (cap worn backwards) | bowler | ushanka
function headFront3(p, O, G) {
  const { cx, hc, H, u, ow } = G, cr = hc - H.b, col = O.hatColor, bw = ow * 0.9, hat = O.hat2;
  if (hat === "police") {
    p.poly([[cx - 0.8 * H.a, cr + 0.5 * H.b], [cx - 0.92 * H.a, cr - 0.25 * H.b], [cx + 0.92 * H.a, cr - 0.25 * H.b], [cx + 0.8 * H.a, cr + 0.5 * H.b]], col || "#1f2f5a", bw);
    p.poly(rrect(cx - 0.95 * H.a, cr + 0.4 * H.b, cx + 0.95 * H.a, cr + 0.56 * H.b, 2 * u), "#141f3d", bw * 0.8);
    p.ell(cx, cr + 0.1 * H.b, 0.12 * H.a, 0.14 * H.a, "#e0b43a", 1.6 * u);
  }
  if (hat === "snapback") {
    const c = col || "#d9342b";
    p.poly([[cx + 0.9 * H.a, cr + 0.42 * H.b], [cx + 1.55 * H.a, cr + 0.5 * H.b], [cx + 1.5 * H.a, cr + 0.62 * H.b], [cx + 0.9 * H.a, cr + 0.58 * H.b]], mul(c, [0.8, 0.8, 0.8]), bw * 0.8);
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.06 * H.a, 0.78 * H.b, 180, 360), c, bw);
    p.ell(cx, cr - 0.26 * H.b, 0.08 * H.a, 0.08 * H.a, mul(c, [0.8, 0.8, 0.8]), 1.4 * u);
    p.poly(rrect(cx - 1.06 * H.a, cr + 0.42 * H.b, cx + 0.95 * H.a, cr + 0.55 * H.b, 2 * u), mul(c, [0.8, 0.8, 0.8]), bw * 0.7);
  }
  if (hat === "bowler") {
    const c = col || "#2b2430";
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.0 * H.a, 0.92 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 1.0 * H.a, cr + 0.32 * H.b, cx + 1.0 * H.a, cr + 0.46 * H.b, 2 * u), "#141118", 0);
    p.poly(_arc(cx, cr + 0.54 * H.b, 1.28 * H.a, 0.15 * H.b, 0, 360, 36), c, bw);
  }
  if (hat === "ushanka") {
    const c = col || "#8a8f98";
    for (const s of [-1, 1]) p.ell(cx + s * 1.1 * H.a, hc + 0.05 * H.b, 0.26 * H.a, 0.56 * H.b, c, bw * 0.9);
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.16 * H.a, 0.95 * H.b, 180, 360), c, bw);
    p.poly(rrect(cx - 1.12 * H.a, cr + 0.36 * H.b, cx + 1.12 * H.a, cr + 0.58 * H.b, 5 * u), mul(c, [1.12, 1.12, 1.12]), bw * 0.8);
    p.ell(cx, cr + 0.16 * H.b, 0.1 * H.a, 0.1 * H.a, "#c2362f", 1.4 * u);
  }
  headFront4(p, O, G);
  animalFront(p, O, G);
}
Object.assign(OUTFITS, {
  // sains sehari-hari
  labtech:   { tunic: "#f4f4f4", skin: "#f1c19a", hair: "#2b211c", style: "curly", glasses: "goggles", glassColor: "#6a4a2a", marks: ["plaster"] },
  inventor:  { tunic: "#8f5a2f", skin: "#e8c2a0", hair: "#c9772b", style: "bob", glasses: "goggles", glassColor: "#3a3a44", marks: ["freckles"] },
  detective: { tunic: "#8a7a5a", skin: "#f1c19a", cap: "#6a5a4a", glasses: "magnifier", handlebar: "#3a2a20" },
  // asal-usul benda dan makanan
  itamae:    { tunic: "#f4f4f4", skin: "#f1c19a", hair: "#2b211c", hat2: "headband", hatColor: "#f4f4f4", beardStyle: "goatee" },
  nenek:     { tunic: "#d9a3b3", skin: "#f3d6bb", hair: "#dcdcdc", style: "bun", glasses: "round", dress: "#a35a7a", marks: ["blush"] },
  // evolusi teknologi
  dj:        { tunic: "#7a2fa8", skin: "#c99067", hair: "#1e1714", style: "dreads", hat2: "headphones", hatColor: "#f2c230", glasses: "shades" },
  techie:    { tunic: "#2b3a4f", skin: "#f5c9a0", hair: "#3b2a20", hat2: "headphones", glasses: "square", beardStyle: "stubble" },
  astronaut: { tunic: "#f4f4f4", skin: "#f5c9a0", hair: "#3b2a20", hat2: "astronaut", marks: ["freckles"] },
  // sejarah unik
  viking:    { tunic: "#6b4a2f", skin: "#f1c19a", hat2: "viking", beard: "#c9772b", brows: "#c9772b", stout: true, style: "braid", hair: "#c9772b" },
  pirate:    { tunic: "#8f2f3a", skin: "#d9a37a", hat2: "pirate", glasses: "eyepatch", beardStyle: "stubble", marks: ["scar"], ears: true },
  pharaoh:   { tunic: "#f1ead8", skin: "#d9a37a", toga: "#e0b43a", hat2: "pharaoh" },
  ronin:     { tunic: "#3b3f46", skin: "#f1c19a", hair: "#1e1714", style: "topknot", beardStyle: "mutton" },
  cowboy:    { tunic: "#a35a2f", skin: "#e8c2a0", hat2: "cowboy", handlebar: "#5a3b2a", marks: ["mole"] },
  sultan:    { tunic: "#2f7a5a", toga: "#e0b43a", skin: "#d9a37a", hat2: "turban", beardStyle: "goatee", beardColor: "#1e1714", stout: true },
  graduate:  { tunic: "#27406b", skin: "#f5c9a0", hair: "#5a3b2a", hat2: "graduate", glasses: "round", marks: ["freckles"] },
  // hewan dan alam
  ranger:    { tunic: "#7a8f3a", skin: "#e8c2a0", hat2: "safari", beardStyle: "stubble", ears: true },
});

Object.assign(OUTFITS, {
  // perkembangan teknologi: orang dari berbagai era
  gentleman: { tunic: "#4a4038", skin: "#f5c9a0", hat2: "bowler", handlebar: "#3a2a20", brows: "#3a2a20" },           // 1900-an
  flapper:   { tunic: "#e0b43a", skin: "#f8dcc0", hair: "#1e1714", style: "bob", hat2: "headband", hatColor: "#e0b43a", dress: "#2f6fb5", marks: ["blush"] },   // 1920-an
  groovy:    { tunic: "#d9822b", skin: "#c99067", hair: "#1e1714", style: "afro", glasses: "shades", beardStyle: "mutton" }, // 1970-an
  retro80:   { tunic: "#4fb8b0", skin: "#f5c9a0", hair: "#7a4a2a", style: "curly", hat2: "headphones", hatColor: "#f4f4f4", marks: ["freckles"] }, // 1980-an
  teen90:    { tunic: "#5a5a8f", skin: "#e8c2a0", hat2: "snapback", beardStyle: "stubble", ears: true },                   // 1990-an
  // sejarah unik: peristiwa dan pelakunya
  police:    { tunic: "#2f4f8f", skin: "#e8c2a0", hat2: "police", handlebar: "#3a2a20" },
  referee:   { tunic: "#1f1f26", skin: "#e8c2a0", style: "bald", beardStyle: "stubble", ears: true },
  striker:   { tunic: "#d9342b", skin: "#c99067", hair: "#1e1714", style: "spiky", hat2: "headband", hatColor: "#f4f4f4", beardStyle: "stubble" },
  comrade:   { tunic: "#6a4a3a", skin: "#f1c19a", hat2: "ushanka", moustache: "#5a3b2a", stout: true },
  scientistF: { tunic: "#f4f4f4", skin: "#c99067", hair: "#1e1714", style: "bun", glasses: "square", dress: "#f4f4f4", marks: ["mole"] },
});

// ================= historical and regional details =================
//   hat2   kabuto (samurai helmet) | blangkon (Java) | peci (songkok) | udeng (Bali) | caping (conical straw hat) | tanjak (Malay folded headcloth) | laurel
//   viking hat2 is the historically accurate round iron helmet with nasal guard; `horns: true` adds horns (fantasy trope only)
//   style: chonmage (samurai: shaved crown, side locks, forward knot);   beardStyle: pharaoh (false beard);   marks: kohl (eyeliner)
//   sultan turban: `plume: true` adds an aigrette feather
// These are respectful simplified ARCHETYPES for cartoon use, not costume-accurate reproductions: check references for the period and region you depict.
HAIR_REPLACE.add("chonmage");
function headFront4(p, O, G) {
  const { cx, hc, H, u, ow, facing } = G, fx = cx + 7 * u * facing, cr = hc - H.b, hair = O.hair || "#1e1714", col = O.hatColor, bw = ow * 0.9, hat = O.hat2;
  const top = (th, r) => [cx + Math.cos(rad(th)) * H.a * r, hc + Math.sin(rad(th)) * H.b * r];
  if (O.style === "chonmage") {
    for (const s of [-1, 1]) p.poly([[cx + s * 0.99 * H.a, hc + 0.0 * H.b], [cx + s * 0.93 * H.a, hc - 0.5 * H.b], [cx + s * 0.7 * H.a, hc - 0.56 * H.b], [cx + s * 0.78 * H.a, hc + 0.25 * H.b]], hair, 2 * u);
    p.poly([[cx - 0.45 * H.a, cr + 0.05 * H.b], [cx + 0.55 * H.a, cr - 0.05 * H.b], [cx + 0.45 * H.a, cr - 0.3 * H.b], [cx - 0.3 * H.a, cr - 0.25 * H.b]], hair, 2 * u);
    p.ell(cx + 0.1 * H.a, cr - 0.3 * H.b, 0.14 * H.a, 0.2 * H.b, hair, ow * 0.8);
    p.ell(cx + 0.1 * H.a, cr - 0.14 * H.b, 0.12 * H.a, 0.035 * H.b, "#e9e9e9", 1.2 * u);
  }
  if (O.beardStyle === "pharaoh") {
    const g = "#2f6fb5";
    p.poly([[fx - 5 * u, hc + 36 * u], [fx + 5 * u, hc + 36 * u], [fx + 6 * u, hc + 62 * u], [fx + 10 * u, hc + 70 * u], [fx - 6 * u, hc + 66 * u]], g, 2.2 * u);
    for (const y of [42, 50, 58]) p.stroke([[fx - 5 * u, hc + y * u], [fx + 5.5 * u, hc + y * u]], 1.8 * u, "#e0b43a");
  }
  if ((O.marks || []).includes("kohl")) for (const s of [-1, 1]) { p.stroke([[fx + s * 22 * u, hc - 1 * u], [fx + s * 34 * u, hc - 6 * u]], 3 * u, INK); p.stroke([[fx + s * 5 * u, hc + 8 * u], [fx + s * 21 * u, hc + 7 * u]], 1.8 * u, INK); }
  if (hat === "pharaoh") { p.ell(cx, cr + 0.2 * H.b, 0.07 * H.a, 0.1 * H.b, "#e0b43a", 1.6 * u); p.stroke([[cx, cr + 0.14 * H.b], [cx, cr - 0.05 * H.b]], 3 * u, INK); p.stroke([[cx, cr + 0.14 * H.b], [cx, cr - 0.05 * H.b]], 1.6 * u, "#e0b43a"); }
  if (hat === "turban" && O.plume) { p.ell(cx + 0.1 * H.a, cr - 0.3 * H.b, 0.11 * H.a, 0.42 * H.b, "#f4efe6", 1.8 * u); p.stroke([[cx + 0.02 * H.a, cr + 0.25 * H.b], [cx + 0.1 * H.a, cr - 0.5 * H.b]], 1.6 * u, INK); }
  if (hat === "kabuto") {
    const c = col || "#4a4f58";
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.1 * H.a, 0.85 * H.b, 180, 360), c, bw);
    p.poly([[cx - 1.1 * H.a, cr + 0.5 * H.b], [cx - 1.3 * H.a, hc + 0.1 * H.b], [cx - 0.95 * H.a, hc + 0.1 * H.b], [cx - 0.95 * H.a, cr + 0.58 * H.b]], mul(c, [0.85, 0.85, 0.85]), bw * 0.8);
    p.poly([[cx + 1.1 * H.a, cr + 0.5 * H.b], [cx + 1.3 * H.a, hc + 0.1 * H.b], [cx + 0.95 * H.a, hc + 0.1 * H.b], [cx + 0.95 * H.a, cr + 0.58 * H.b]], mul(c, [0.85, 0.85, 0.85]), bw * 0.8);
    p.poly(rrect(cx - 1.1 * H.a, cr + 0.42 * H.b, cx + 1.1 * H.a, cr + 0.56 * H.b, 2 * u), "#e0b43a", bw * 0.7);
    p.stroke(_arc(cx, cr + 0.12 * H.b, 0.62 * H.a, 0.62 * H.b, 205, 335, 14), 5 * u, INK); p.stroke(_arc(cx, cr + 0.12 * H.b, 0.62 * H.a, 0.62 * H.b, 205, 335, 14), 3 * u, "#e0b43a");
  }
  if (hat === "blangkon") {
    const c = col || "#6a4526";
    p.ell(cx + 1.0 * H.a, cr + 0.46 * H.b, 0.15 * H.a, 0.22 * H.b, c, bw * 0.8);
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.04 * H.a, 0.8 * H.b, 180, 360), c, bw);
    for (const [dx, dy] of [[-0.5, 0.1], [0, -0.05], [0.5, 0.1], [-0.25, 0.25], [0.25, 0.25]]) p.poly(ellPts(cx + dx * H.a, cr + (0.12 + dy) * H.b, 0.08 * H.a, 0.1 * H.b, 0, 360, rad(45), 4), "#c9a15a", 0);
    p.poly(rrect(cx - 1.04 * H.a, cr + 0.4 * H.b, cx + 1.04 * H.a, cr + 0.54 * H.b, 2 * u), "#3f2a15", bw * 0.7);
  }
  if (hat === "peci") p.poly(rrect(cx - 0.82 * H.a, cr - 0.15 * H.b, cx + 0.82 * H.a, cr + 0.52 * H.b, 7 * u), col || "#1f1f26", bw);
  if (hat === "udeng") {
    const c = col || "#f4efe6";
    p.poly(_arc(cx, cr + 0.52 * H.b, 1.08 * H.a, 0.82 * H.b, 180, 360), c, bw);
    p.poly([[cx - 0.2 * H.a, cr + 0.22 * H.b], [cx + 0.05 * H.a, cr - 0.62 * H.b], [cx + 0.3 * H.a, cr + 0.22 * H.b]], c, bw);
    p.stroke(_arc(cx, cr + 0.55 * H.b, 1.04 * H.a, 0.5 * H.b, 200, 340, 14), 2 * u, "#00000030");
    p.poly(rrect(cx - 1.08 * H.a, cr + 0.4 * H.b, cx + 1.08 * H.a, cr + 0.54 * H.b, 2 * u), O.hatBand || "#d9822b", bw * 0.7);
  }
  if (hat === "caping") {
    const c = col || "#d9b86a";
    p.poly([[cx - 1.5 * H.a, cr + 0.58 * H.b], [cx, cr - 1.05 * H.b], [cx + 1.5 * H.a, cr + 0.58 * H.b]], c, bw);
    for (const k of [-0.9, -0.45, 0, 0.45, 0.9]) p.stroke([[cx, cr - 1.0 * H.b], [cx + k * H.a * 1.4, cr + 0.55 * H.b]], 1.3 * u, "#b8923a");
    for (const s of [-1, 1]) p.stroke([[cx + s * 1.0 * H.a, cr + 0.58 * H.b], [cx + s * 0.5 * H.a, hc + 0.95 * H.b]], 1.6 * u, INK);
  }
  if (hat === "tanjak") {
    const c = col || "#8f2f3a";
    p.poly(_arc(cx, cr + 0.5 * H.b, 1.05 * H.a, 0.8 * H.b, 180, 360), c, bw);
    p.poly([[cx - 0.2 * H.a, cr + 0.1 * H.b], [cx + 0.6 * H.a, cr - 0.95 * H.b], [cx + 0.98 * H.a, cr - 0.2 * H.b], [cx + 0.8 * H.a, cr + 0.35 * H.b]], c, bw);
    p.stroke([[cx + 0.0 * H.a, cr + 0.1 * H.b], [cx + 0.62 * H.a, cr - 0.8 * H.b]], 2 * u, "#e0b43a"); p.stroke([[cx + 0.3 * H.a, cr + 0.2 * H.b], [cx + 0.85 * H.a, cr - 0.5 * H.b]], 2 * u, "#e0b43a");
  }
  if (hat === "laurel") for (let th = 196; th <= 344; th += 14) { const [x, y] = top(th, 1.04); p.poly(ellPts(x, y, 0.13 * H.a, 0.055 * H.b, 0, 360, rad(th + 90), 10), "#4f9a5d", 1.3 * u); }
}
Object.assign(OUTFITS, {
  pharaoh:   { tunic: "#f1ead8", skin: "#d9a37a", toga: "#e0b43a", hat2: "pharaoh", beardStyle: "pharaoh", marks: ["kohl"] },
  sultan:    { tunic: "#2f7a5a", toga: "#e0b43a", skin: "#d9a37a", hat2: "turban", plume: true, beardStyle: "goatee", beardColor: "#1e1714", stout: true },
  ronin:     { tunic: "#3b3f46", skin: "#f1c19a", hair: "#1e1714", style: "chonmage", beardStyle: "mutton" },
  samurai:   { tunic: "#2f3a5a", skin: "#f1c19a", hat2: "kabuto", handlebar: "#1e1714" },
  fantasyViking: { tunic: "#6b4a2f", skin: "#f1c19a", hat2: "viking", horns: true, beard: "#c9772b", brows: "#c9772b", stout: true },
  // Nusantara
  priayi:    { tunic: "#2b2f4a", skin: "#d9a37a", toga: "#8a5a2a", hat2: "blangkon", moustache: "#2b211c" },
  pakPeci:   { tunic: "#f4f4f4", skin: "#d9a37a", hat2: "peci", moustache: "#2b211c", glasses: "round" },
  balinese:  { tunic: "#f4efe6", skin: "#c99067", toga: "#d9822b", hat2: "udeng" },
  petani:    { tunic: "#4a5a2f", skin: "#c99067", hat2: "caping", beardStyle: "stubble" },
  pendekar:  { tunic: "#1f1f26", skin: "#d9a37a", hat2: "tanjak", handlebar: "#2b211c" },
  // Yunani kuno
  philosopher: { tunic: "#f4efe6", skin: "#f1c19a", toga: "#7a5aa0", hat2: "laurel", hair: "#cfcfcf", beard: "#cfcfcf", brows: "#cfcfcf" },
});

// ================= animal characters (same stick-man body, animal head) =================
// Outfit field  animal: tiger | lion | cat | dog | elephant | monkey | panda | rabbit | frog | owl | bear | pig
// The outfit's `skin` is the fur colour; all hats, glasses and clothes combine as usual (a tiger can wear glasses).
// Lion: `mane` colour. Not included: tails and four-legged bodies (the body is always the stick man).
function animalBehind(p, O, G) { // ears, mane, bulging eyes: behind the head
  const a = O.animal; if (!a) return;
  const { cx, hc, H, u, ow } = G, cr = hc - H.b, fur = G.skin;
  const ear = (x, y, r, outer, inner) => { p.ell(x, y, r, r, outer, ow * 0.8); p.ell(x, y + 0.04 * r, r * 0.55, r * 0.55, inner, 0); };
  if (a === "lion") p.poly(_arc(cx, hc, 1.45 * H.a, 1.4 * H.b, 0, 360, 48), O.mane || "#8a4a1e", ow);
  if (a === "tiger" || a === "lion" || a === "bear" || a === "panda") {
    const [outer, inner] = { tiger: [fur, "#fff1d8"], lion: [fur, "#f4d9a0"], bear: [fur, "#c9a075"], panda: ["#1f1f26", "#1f1f26"] }[a];
    for (const s of [-1, 1]) ear(cx + s * 0.72 * H.a, cr + 0.14 * H.b, (a === "lion" ? 0.2 : 0.27) * H.a, outer, inner);
  }
  if (a === "monkey") for (const s of [-1, 1]) ear(cx + s * 1.0 * H.a, hc + 0.02 * H.b, 0.22 * H.a, fur, "#e8c49a");
  if (a === "cat" || a === "pig") for (const s of [-1, 1]) {
    p.poly([[cx + s * 0.3 * H.a, cr + 0.2 * H.b], [cx + s * 0.78 * H.a, cr - 0.55 * H.b], [cx + s * 1.0 * H.a, cr + 0.45 * H.b]], fur, ow * 0.9);
    p.poly([[cx + s * 0.45 * H.a, cr + 0.22 * H.b], [cx + s * 0.76 * H.a, cr - 0.3 * H.b], [cx + s * 0.88 * H.a, cr + 0.38 * H.b]], a === "cat" ? "#e9a0a8" : "#e07585", 0);
  }
  if (a === "dog") for (const s of [-1, 1]) p.ell(cx + s * 1.06 * H.a, hc - 0.05 * H.b, 0.27 * H.a, 0.62 * H.b, O.earColor || "#7a4a28", ow * 0.9);
  if (a === "elephant") for (const s of [-1, 1]) { p.ell(cx + s * 1.22 * H.a, hc - 0.05 * H.b, 0.55 * H.a, 0.78 * H.b, fur, ow); p.ell(cx + s * 1.2 * H.a, hc, 0.36 * H.a, 0.55 * H.b, "#e8b8bc", 0); }
  if (a === "rabbit") for (const s of [-1, 1]) { p.ell(cx + s * 0.4 * H.a, cr - 0.78 * H.b, 0.2 * H.a, 0.85 * H.b, fur, ow * 0.9); p.ell(cx + s * 0.4 * H.a, cr - 0.7 * H.b, 0.1 * H.a, 0.62 * H.b, "#f0b3bd", 0); }
  if (a === "frog") for (const s of [-1, 1]) { p.ell(cx + s * 0.55 * H.a, cr + 0.02 * H.b, 0.3 * H.a, 0.3 * H.a, fur, ow * 0.9); p.ell(cx + s * 0.55 * H.a, cr, 0.2 * H.a, 0.2 * H.a, "#ffffff", 1.6 * u); p.ell(cx + s * 0.55 * H.a, cr + 0.02 * H.b, 0.09 * H.a, 0.09 * H.a, INK, 0); }
  if (a === "owl") for (const s of [-1, 1]) p.poly([[cx + s * 0.35 * H.a, cr + 0.25 * H.b], [cx + s * 0.8 * H.a, cr - 0.45 * H.b], [cx + s * 0.95 * H.a, cr + 0.4 * H.b]], fur, ow * 0.9);
}
function animalMid(p, O, G) { // muzzle and eye patches: under the face features
  const a = O.animal; if (!a) return;
  const { cx, hc, H, u, ow, facing } = G, fx = cx + 7 * u * facing;
  if (a === "tiger") {
    p.ell(fx, hc + 17 * u, 19 * u, 12 * u, "#fff1d8", 0);
    for (const s of [-1, 1]) { p.ell(fx + s * 33 * u, hc + 13 * u, 9 * u, 11 * u, "#fff1d8", 0); p.stroke([[cx + s * 0.97 * H.a, hc + 0.0 * H.b], [cx + s * 0.72 * H.a, hc + 0.1 * H.b]], 3 * u, "#3a2216"); p.stroke([[cx + s * 0.97 * H.a, hc + 0.22 * H.b], [cx + s * 0.74 * H.a, hc + 0.28 * H.b]], 3 * u, "#3a2216"); p.stroke([[cx + s * 0.12 * H.a, hc - 0.98 * H.b], [cx + s * 0.18 * H.a, hc - 0.62 * H.b]], 3 * u, "#3a2216"); }
    p.stroke([[cx, hc - 0.99 * H.b], [cx, hc - 0.6 * H.b]], 3.4 * u, "#3a2216");
  }
  if (a === "lion" || a === "bear" || a === "rabbit") p.ell(fx, hc + 17 * u, 19 * u, 12 * u, a === "lion" ? "#f4d9a0" : a === "bear" ? "#c9a075" : "#fff6f0", 0);
  if (a === "cat") { p.ell(fx, hc + 17 * u, 15 * u, 9 * u, "#f6e3c8", 0); for (const s of [-1, 1]) p.stroke([[cx + s * 0.15 * H.a, hc - 0.98 * H.b], [cx + s * 0.2 * H.a, hc - 0.7 * H.b]], 2.6 * u, mul(G.skin, [0.62, 0.55, 0.5])); p.stroke([[cx, hc - 0.99 * H.b], [cx, hc - 0.68 * H.b]], 2.8 * u, mul(G.skin, [0.62, 0.55, 0.5])); }
  if (a === "dog") { p.ell(fx, hc + 16 * u, 23 * u, 15 * u, "#f1dcc0", 0); p.ell(cx - 0.55 * H.a * facing, hc - 2 * u, 15 * u, 17 * u, "#7a4a28", 0); }
  if (a === "monkey") { p.ell(fx, hc + 8 * u, 0.66 * H.a, 0.52 * H.b, "#e8c49a", 0); p.ell(fx, hc + 20 * u, 20 * u, 12 * u, "#d9ac7a", 0); }
  if (a === "panda") for (const s of [-1, 1]) p.poly(ellPts(fx + s * 13 * u, hc + 1 * u, 10.5 * u, 14 * u, 0, 360, rad(s * -18), 24), "#1f1f26", 0);
  if (a === "owl") for (const s of [-1, 1]) p.ell(fx + s * 13 * u, hc, 16 * u, 16 * u, "#efe2c4", 2.4 * u);
  if (a === "pig") p.ell(fx, hc + 14 * u, 15 * u, 10 * u, "#e98a98", 2.2 * u);
}
function animalFront(p, O, G) { // noses, whiskers, trunk, beak: over the face
  const a = O.animal; if (!a) return;
  const { cx, hc, H, u, ow, facing } = G, fx = cx + 7 * u * facing;
  const whiskers = (col) => { for (const s of [-1, 1]) for (const dy of [-3, 3]) p.stroke([[fx + s * 16 * u, hc + (15 + dy) * u], [fx + s * 40 * u, hc + (13 + dy * 2) * u]], 1.6 * u, col); };
  const nose = (col, rx = 5, ry = 3.6, y = 10) => p.ell(fx, hc + y * u, rx * u, ry * u, col, 1.8 * u);
  if (a === "tiger" || a === "lion") { nose(a === "tiger" ? "#d9737a" : "#4a2e22"); whiskers("#ffffffcc"); }
  if (a === "cat") { nose("#e9788a", 4, 3); whiskers("#ffffffcc"); }
  if (a === "dog") nose("#2b211c", 7, 5, 9);
  if (a === "bear") nose("#2b211c", 6, 4.2);
  if (a === "panda") { nose("#1f1f26", 6, 4.2); for (const s of [-1, 1]) { p.ell(fx + s * 13 * u, hc - 1 * u, 3.6 * u, 4.2 * u, "#ffffff", 0); p.ell(fx + s * 13 * u + 0.6 * u * s, hc - 0.6 * u, 1.9 * u, 2.2 * u, INK, 0); } }
  if (a === "rabbit") { nose("#e9788a", 3.6, 2.8); p.poly(rrect(fx - 3.6 * u, hc + 20 * u, fx + 3.6 * u, hc + 29 * u, 1.5 * u), "#ffffff", 1.6 * u); whiskers("#00000066"); }
  if (a === "monkey") for (const s of [-1, 1]) p.ell(fx + s * 3 * u, hc + 10 * u, 1.5 * u, 2 * u, "#5a3b2a", 0);
  if (a === "pig") for (const s of [-1, 1]) p.ell(fx + s * 5 * u, hc + 14 * u, 2 * u, 3 * u, "#7a3a48", 0);
  if (a === "frog") { p.stroke([[fx - 30 * u, hc + 14 * u], [fx - 14 * u, hc + 21 * u], [fx + 14 * u, hc + 21 * u], [fx + 30 * u, hc + 14 * u]], 2.6 * u, INK); for (const s of [-1, 1]) p.ell(fx + s * 5 * u, hc + 8 * u, 1.4 * u, 1.4 * u, INK, 0); }
  if (a === "owl") { p.poly([[fx - 6 * u, hc + 3 * u], [fx + 6 * u, hc + 3 * u], [fx, hc + 19 * u]], "#e0a02a", 2 * u); for (const s of [-1, 1]) p.stroke([[fx + s * 3 * u, hc - 18 * u], [fx + s * 14 * u, hc - 22 * u]], 3 * u, "#5a3f28"); }
  if (a === "elephant") {
    for (const s of [-1, 1]) p.poly([[fx + s * 15 * u, hc + 20 * u], [fx + s * 24 * u, hc + 32 * u], [fx + s * 11 * u, hc + 28 * u]], "#f2ead2", 1.8 * u);
    const tr = [[fx, hc + 6 * u], [fx, hc + 0.72 * H.b], [fx + 0.1 * H.a, hc + 1.1 * H.b], [fx + 0.28 * H.a, hc + 1.08 * H.b]];
    p.stroke(tr, 0.3 * H.a, INK); p.stroke(tr, 0.23 * H.a, G.skin);
    for (const k of [0.25, 0.45, 0.65]) p.stroke([[fx - 0.1 * H.a, hc + k * H.b + 8 * u], [fx + 0.1 * H.a, hc + k * H.b + 8 * u]], 1.4 * u, "#00000030");
  }
}
Object.assign(OUTFITS, {
  // hewan dan alam (animal heads on the stick-man body; `skin` is the fur colour)
  tiger:    { animal: "tiger",    skin: "#e8872a", tunic: "#3a4a6a" },
  lion:     { animal: "lion",     skin: "#e0a24a", tunic: "#8f2f3a" },
  cat:      { animal: "cat",      skin: "#d9a05a", tunic: "#4f9a5d" },
  dog:      { animal: "dog",      skin: "#c98a52", tunic: "#2f6fb5" },
  elephant: { animal: "elephant", skin: "#9aa3ad", tunic: "#d9822b" },
  monkey:   { animal: "monkey",   skin: "#8a5a3a", tunic: "#c2362f" },
  panda:    { animal: "panda",    skin: "#f4f4f4", tunic: "#3b3f46" },
  rabbit:   { animal: "rabbit",   skin: "#f1e6dc", tunic: "#7a5aa0" },
  frog:     { animal: "frog",     skin: "#6fbf5a", tunic: "#e0b43a" },
  owl:      { animal: "owl",      skin: "#8a6a4a", tunic: "#2f7a8f" },
  bear:     { animal: "bear",     skin: "#8a5a3a", tunic: "#e8872a" },
  pig:      { animal: "pig",      skin: "#f2a7b0", tunic: "#4a6a3a" },
});
function headMid(p, O, G) { animalMid(p, O, G); } // called by romanFront right before the face is drawn
Object.assign(OUTFITS, {
  // animals combine with every head item
  pandaChef:   { animal: "panda",    skin: "#f4f4f4", tunic: "#ffffff", hat2: "chef", apron: "#e8dcc4" },
  owlProf:     { animal: "owl",      skin: "#8a6a4a", tunic: "#3b3f8f", hat2: "graduate", glasses: "round" },
  catWizard:   { animal: "cat",      skin: "#9aa0aa", tunic: "#2a2d6b", cape: "#3b3f8f", hat2: "wizard" },
  monkeyAstro: { animal: "monkey",   skin: "#8a5a3a", tunic: "#f4f4f4", hat2: "astronaut" },
  dogPolice:   { animal: "dog",      skin: "#c98a52", tunic: "#2f4f8f", hat2: "police" },
  tigerNerd:   { animal: "tiger",    skin: "#e8872a", tunic: "#4f9a5d", glasses: "square" },
});
