// world: hilltown
// ---------- world ----------
const DECK = 0; // ground level (cards stand on y = 0)
const world = new THREE.Group(); scene.add(world);
const rt = P.rng(44);
const ground = add(new THREE.CircleGeometry(110, 56), M.grass, 0, 0, 0, world, { cast: false }); ground.rotation.x = -Math.PI / 2;
const road = add(new THREE.PlaneGeometry(56, 3), M.dirt, 8, 0.02, 1.5, world, { cast: false }); road.rotation.x = -Math.PI / 2;
const lane = add(new THREE.PlaneGeometry(3, 40), M.dirt, 4, 0.02, 4, world, { cast: false }); lane.rotation.x = -Math.PI / 2;

// houses (the first three lose their roofs in the first gust)
const houses = [];
const house = (x, z, w, d, h, mat = M.plaster, rot = 0) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; world.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g);
  const roof = new THREE.Group(); roof.position.set(0, h, 0); g.add(roof); roof.userData.y0 = h;
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), M.roof, 0, 0.9, 0, roof); rf.rotation.y = Math.PI / 4;
  rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false });
  houses.push({ g, roof }); return g;
};
house(0.5, -6, 5, 4, 3.6, M.plaster); house(6, 7, 5.5, 4.2, 3.4, M.plaster2); house(12, -11, 5, 4, 3.4, M.plaster);
house(18, 3, 5, 4.2, 3.4, M.plaster2); house(22, -6, 4.6, 4, 3.2, M.plaster); house(15, 12, 4.8, 4, 3.3, M.plaster);
house(-1, 11.5, 4.4, 3.6, 3.1, M.plaster2); house(28, 10, 5, 4, 3.4, M.plaster2); house(26, -16, 5.2, 4.2, 3.6, M.plaster);
for (const [x, z] of [[-14, -14], [-18, 8], [-24, -3]]) house(x, z, 4.6, 4, 3.2, M.plaster2);

// church (clearly shorter than the finished wall)
const church = new THREE.Group(); church.position.set(5.5, 0, -5); world.add(church);
add(tbox(5, 6.5, 7, 2), M.plaster2, 0, 3.25, 0, church);
const crf = add(new THREE.ConeGeometry(4.4, 2.6, 4), M.roof, 0, 7.8, 0, church); crf.rotation.y = Math.PI / 4; crf.scale.set(0.82, 1, 1.12);
add(tbox(2.4, 9.2, 2.4, 2), M.plaster2, 0, 4.6, 4.3, church);
const spire = add(new THREE.ConeGeometry(1.9, 2.4, 4), M.roof, 0, 10.4, 4.3, church); spire.rotation.y = Math.PI / 4;
add(box(0.5, 1.2, 0.12), M.window, 0, 7.4, 5.55, church, { cast: false });
add(box(1.1, 2.0, 0.12), M.door, 0, 1.0, 5.52, church, { cast: false });
add(box(0.12, 0.9, 0.12), M.bronze, 0, 11.9, 4.3, church); add(box(0.5, 0.12, 0.12), M.bronze, 0, 11.8, 4.3, church);

// THE WALL: 15 one-metre courses, height driven by worldAt().wallH
const WALL_X = -6, wallSlabs = [];
for (let i = 0; i < 15; i++) wallSlabs.push(add(tbox(1.3, 1, 46, 2), M.stone, WALL_X, i + 0.5, 0, world));
add(tbox(1.9, 0.4, 46.6, 2), M.stoneMoss, WALL_X, 0.2, 0, world);

// clothesline: two poles, a line, seven cloths, fourteen pegs
const LINE_Z = 15, LINE_Y = 2.8, cloths = [], pegs = [];
for (const x of [2.2, 12.8]) add(new THREE.CylinderGeometry(0.07, 0.09, LINE_Y + 0.2, 8), M.wood, x, (LINE_Y + 0.2) / 2, LINE_Z, world);
const lineMesh = add(new THREE.CylinderGeometry(0.02, 0.02, 10.6, 6), toon({ color: '#d8d2c0' }), 7.5, LINE_Y, LINE_Z, world); lineMesh.rotation.z = Math.PI / 2;
const CLOTH_COL = ['#e8ecf2', '#d9534f', '#4f7fb8', '#f2d06b', '#ffffff', '#5d8a3a', '#c25a7a'];
const pegMat = toon({ color: '#b9803f' });
for (let i = 0; i < 7; i++) {
  const g = new THREE.Group(); g.position.set(3.8 + i * 1.3, LINE_Y, LINE_Z); world.add(g);
  const geo = new THREE.PlaneGeometry(0.95, 1.2, 8, 8);
  const m = add(geo, toon({ color: CLOTH_COL[i], side: THREE.DoubleSide }), 0, -0.6, 0, g);
  m.userData.base = geo.attributes.position.array.slice(); cloths.push({ g, m, x: 3.8 + i * 1.3 });
  for (const s of [-1, 1]) { const pg = add(box(0.07, 0.2, 0.12), pegMat, s * 0.38, -0.02, 0.01, g, { cast: false }); pg.visible = false; pegs.push(pg); }
}

// wind streaks: 3D white dashes riding a path (straight, hitting the wall, or up-and-over)
const NS = 36, streaks = [];
const streakMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.92, fog: false });
for (let i = 0; i < NS; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.1), streakMat); m.userData.ndSkip = true; m.castShadow = false; m.visible = false; scene.add(m); streaks.push(m); }
const bez = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
function streakXY(mode, j, u, H) {
  const ln = j % 7, y0 = 1.0 + ln * 1.05 + (j % 3) * 0.35;
  if (mode === 'straight') return [-40 + u * 90, Math.max(y0, H + 0.9) + Math.sin(u * 9 + j) * 0.3];
  if (mode === 'hit') { const x = -40 + u * 33, e = Math.max(0, (u - 0.8) / 0.2); return [x, Math.min(y0, 2.7) + e * e * 1.8 + Math.sin(u * 9 + j) * 0.12]; }
  const top = H + 1.8 + ln * 0.22, yEnd = 1.4 + ln * 0.3;   // over
  return u < 0.5 ? bez([-40, y0], [-14, y0], [-8.5, top], [-2, top], u * 2) : bez([-2, top], [4, top], [3, yEnd], [11, yEnd], (u - 0.5) * 2);
}
function windState(W, f, H) {
  streaks.forEach((m, j) => {
    if (W.mode === 'none' || W.amt <= 0.01) { m.visible = false; return; }
    const u = (f * 0.011 * (0.8 + 0.4 * ((j * 7) % 5) / 4) + j / NS) % 1;
    const p = streakXY(W.mode, j, u, H), p2 = streakXY(W.mode, j, Math.min(1, u + 0.012), H);
    const z = (((j * 37) % 13) - 6) * 0.75 + (W.mode === 'straight' ? 14 : 0);
    m.visible = true; m.position.set(p[0], p[1], z); m.rotation.z = Math.atan2(p2[1] - p[1], p2[0] - p[0]);
    m.scale.set(Math.max(0.001, W.amt * Math.min(1, u * 10, (1 - u) * 10)), 1, 1);
  });
}

// trees (outside the town ring) + far hills + mountains
const pineT = (x, z, h = 6) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.2, 0.3, h * 0.5, 6), M.trunk, 0, h * 0.25, 0, g); const c = add(new THREE.ConeGeometry(h * 0.32, h * 0.9, 8), M.pine, 0, h * 0.75, 0, g); return g; };
for (let i = 0; i < 46; i++) { const a = rt() * Math.PI * 2, d = 42 + rt() * 50, x = Math.cos(a) * d, z = Math.sin(a) * d; if (z > 20 && Math.abs(x - 8) < 26) continue; pineT(x, z, 5 + rt() * 4); }
for (let i = 0; i < 16; i++) { const a = rt() * Math.PI * 2, d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -14, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.5 + rt() * 0.4; }
for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 120 + rt() * 120, r_ = 110 + rt() * 70; const g = new THREE.Group(); g.position.set(Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.28, 7), M.snow, 0, hh * 0.86, 0, g, { cast: false }); }

// clouds: painted billboards far away (no fog, no ink)
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- the mayor's hat (3D prop) ----------
const hat = new THREE.Group(); scene.add(hat); hat.visible = false;
add(new THREE.SphereGeometry(0.34, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon({ color: '#2b2430' }), 0, 0, 0, hat);
add(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 20), toon({ color: '#2b2430' }), 0, 0, 0, hat);
