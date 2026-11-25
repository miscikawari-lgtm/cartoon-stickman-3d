// Everyday objects built from primitives, about 1 unit tall, standing on y = 0.
//   const makeProp = buildProps({ THREE, add, box, toon });   // done in main.js
//   const g = makeProp('riceCooker');                           // THREE.Group
// Every prop has g.userData.parts = [{ o: mesh/group, b: [x,y,z] base, dir: [dx,dy,dz] }]: set
//   part.o.position = b + dir * explode        (explode 0 = assembled, 1 = exploded view for "how it works" shots)
// Names: riceCooker donut microphone vintageMic headphones earbuds iron cottonBud lightBulb iceCream trophy soccerBall
// These are simplified teaching models, not exact copies of any product or brand.
export const PROP_NAMES = ['riceCooker', 'donut', 'microphone', 'vintageMic', 'headphones', 'earbuds', 'iron', 'cottonBud', 'lightBulb', 'iceCream', 'trophy', 'soccerBall'];

export function buildProps({ THREE, add, box, toon }) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const mat = (color, o = {}) => toon({ color, ...o });
  const cyl = (rt, rb, h, seg = 32, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
  const sph = (r, ws = 28, hs = 18) => new THREE.SphereGeometry(r, ws, hs);
  const make = (build) => () => {
    const g = new THREE.Group(); g.userData.parts = [];
    // part(mesh, dir): registers a mesh for the exploded view
    const part = (o, dir = [0, 0, 0]) => { g.userData.parts.push({ o, b: [o.position.x, o.position.y, o.position.z], dir }); return o; };
    build(g, part);
    return g;
  };
  const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const P = {};

  // ---- rice cooker ("magic com"): open body shell, pot, heating plate, thermostat sensor with spring, lid, cord ----
  P.riceCooker = make((g, part) => {
    const cream = mat('#f1ece0', { side: THREE.DoubleSide }), dark = mat('#2b2f36');
    const body = grp(g, 0, 0, 0);
    add(cyl(0.64, 0.68, 0.62, 40, true), cream, 0, 0.31, 0, body);
    add(cyl(0.62, 0.62, 0.03, 40), mat('#d9d3c2'), 0, 0.02, 0, body);                   // floor of the shell
    add(cyl(0.69, 0.69, 0.08, 40), mat('#bfb8a4'), 0, 0.04, 0, body);                  // foot band
    add(box(0.4, 0.22, 0.05), dark, 0, 0.36, 0.67, body, { cast: false });              // control panel
    add(sph(0.032), mat('#e0463c'), -0.11, 0.4, 0.7, body, { cast: false });           // cooking light
    add(sph(0.032), mat('#5fd36a'), -0.03, 0.4, 0.7, body, { cast: false });           // keep-warm light
    add(box(0.16, 0.05, 0.05), mat('#d9534f'), 0.08, 0.31, 0.7, body, { cast: false }); // cook lever
    part(body);
    const plate = part(add(cyl(0.42, 0.42, 0.05, 32), mat('#4a4f58'), 0, 0.16, 0, g), [0, 0.12, 0]);
    const sensor = grp(g, 0, 0.19, 0);                                                    // thermostat: cap + spring
    add(cyl(0.07, 0.07, 0.05, 20), mat('#e0b43a'), 0, 0.1, 0, sensor);
    for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.05, 0.012, 8, 20), mat('#c9ced6'), 0, 0.01 + i * 0.022, 0, sensor).rotation.x = Math.PI / 2;
    part(sensor, [0, 0.3, 0]);
    const pot = grp(g, 0, 0.42, 0);
    add(cyl(0.5, 0.46, 0.46, 36, true), mat('#c9ced6', { side: THREE.DoubleSide }), 0, 0, 0, pot);
    add(cyl(0.46, 0.46, 0.03, 36), mat('#8f949c'), 0, -0.22, 0, pot);
    add(new THREE.TorusGeometry(0.5, 0.025, 8, 36), mat('#e9edf2'), 0, 0.23, 0, pot).rotation.x = Math.PI / 2;
    part(pot, [0, 0.55, 0]);
    const lid = grp(g, 0, 0.62, 0);
    const dome = add(new THREE.SphereGeometry(0.66, 36, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#f1ece0'), 0, 0, 0, lid); dome.scale.y = 0.42;
    add(cyl(0.68, 0.68, 0.05, 40), mat('#d9d3c2'), 0, 0.01, 0, lid);
    add(cyl(0.07, 0.09, 0.06, 16), mat('#bfc4cc'), 0, 0.29, 0, lid);                       // steam vent
    add(box(0.2, 0.05, 0.1), dark, 0, 0.27, 0.35, lid, { cast: false });                   // latch
    part(lid, [0, 1.0, 0]);
    const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0, 0.2, -0.66), V(0, 0.1, -0.95), V(0.3, 0.03, -1.2), V(0.7, 0.03, -1.3)]), 24, 0.03, 8), dark); g.add(cord);
    part(cord, [0, 0, -0.5]);
  });

  // ---- donut: ring of dough, icing, sprinkles ----
  P.donut = make((g, part) => {
    const dough = add(new THREE.TorusGeometry(0.42, 0.2, 22, 44), mat('#d9a05a'), 0, 0.2, 0, g); dough.rotation.x = Math.PI / 2; part(dough);
    const icing = add(new THREE.TorusGeometry(0.42, 0.205, 22, 44), mat('#f06fa0'), 0, 0.27, 0, g); icing.rotation.x = Math.PI / 2; icing.scale.z = 0.62; part(icing, [0, 0.3, 0]);
    const sp = grp(g, 0, 0.27, 0); const cols = ['#ffffff', '#ffe066', '#7ad7f0', '#8be28b', '#ff9f43'];
    for (let i = 0; i < 28; i++) {
      const th = (i / 28) * Math.PI * 2 + (i % 3) * 0.07, off = ((i * 37) % 11 - 5) * 0.018;
      const m = add(box(0.075, 0.016, 0.016), mat(cols[i % 5]), Math.cos(th) * (0.42 + off), 0.115, Math.sin(th) * (0.42 + off), sp, { cast: false }); m.rotation.y = -th + (i % 4) * 0.7;
    }
    part(sp, [0, 0.5, 0]);
  });

  // ---- modern handheld microphone: grille, diaphragm, voice coil, magnet, body ----
  P.microphone = make((g, part) => {
    const grille = grp(g, 0, 0.98, 0);
    add(sph(0.27), mat('#6d727b'), 0, 0, 0, grille);
    for (const y of [-0.12, 0, 0.12]) add(new THREE.TorusGeometry(Math.sqrt(0.27 * 0.27 - y * y) + 0.004, 0.012, 8, 28), mat('#c9ced6'), 0, y, 0, grille).rotation.x = Math.PI / 2;
    add(cyl(0.16, 0.16, 0.04, 20), mat('#c9ced6'), 0, -0.25, 0, grille);
    part(grille, [0, 0.45, 0]);
    part(add(cyl(0.19, 0.19, 0.02, 28), mat('#e0b43a'), 0, 0.88, 0, g), [0, 0.25, 0]);                 // diaphragm
    part(add(new THREE.TorusGeometry(0.1, 0.022, 8, 24), mat('#d9823a'), 0, 0.8, 0, g), [0, 0.12, 0]).rotation.x = Math.PI / 2;   // voice coil
    part(add(cyl(0.11, 0.11, 0.18, 20), mat('#c2362f'), 0, 0.7, 0, g), [0, -0.05, 0]);                // magnet
    const body = grp(g, 0, 0, 0);
    add(cyl(0.15, 0.1, 0.62, 24), mat('#2b2f36'), 0, 0.38, 0, body);
    add(cyl(0.155, 0.155, 0.05, 24), mat('#e0b43a'), 0, 0.64, 0, body);
    add(cyl(0.1, 0.1, 0.08, 24), mat('#4a4f58'), 0, 0.04, 0, body);
    part(body, [0, -0.35, 0]);
  });

  // ---- vintage mic (1930s style): chrome box with a grille, yoke and stem ----
  P.vintageMic = make((g, part) => {
    const chrome = mat('#c9ced6'), dark = mat('#2b2f36');
    const head = grp(g, 0, 0.85, 0);
    add(box(0.56, 0.74, 0.18), chrome, 0, 0, 0, head);
    for (let i = 0; i < 8; i++) add(box(0.46, 0.035, 0.02), dark, 0, -0.3 + i * 0.085, 0.1, head, { cast: false });
    for (const s of [-1, 1]) add(box(0.04, 0.74, 0.2), mat('#8f949c'), s * 0.28, 0, 0, head);
    part(head, [0, 0.15, 0]);
    const yoke = grp(g, 0, 0.85, 0);
    const arc = add(new THREE.TorusGeometry(0.4, 0.03, 8, 28, Math.PI), chrome, 0, -0.05, 0, yoke); arc.rotation.z = Math.PI;
    part(yoke, [0, -0.1, 0]);
    add(cyl(0.035, 0.035, 0.5, 12), chrome, 0, 0.3, 0, g);
    part(add(cyl(0.3, 0.34, 0.1, 28), dark, 0, 0.05, 0, g), [0, -0.1, 0]);
  });

  // ---- over-ear headphones: band, two cups with cushion and driver ----
  P.headphones = make((g, part) => {
    const body = mat('#3b3f46'), accent = mat('#e0463c');
    part(add(new THREE.TorusGeometry(0.5, 0.045, 12, 36, Math.PI), body, 0, 0.55, 0, g), [0, 0.35, 0]);
    part(add(new THREE.TorusGeometry(0.46, 0.012, 6, 36, Math.PI), accent, 0, 0.55, 0.0, g), [0, 0.35, 0]);
    for (const s of [-1, 1]) {
      const cup = grp(g, s * 0.52, 0.35, 0);
      const c = add(cyl(0.24, 0.24, 0.14, 28), body, 0, 0, 0, cup); c.rotation.z = Math.PI / 2;
      const d = add(cyl(0.16, 0.16, 0.04, 24), mat('#c9ced6'), -s * 0.1, 0, 0, cup); d.rotation.z = Math.PI / 2;        // driver
      part(cup, [s * 0.35, 0, 0]);
      const cu = add(new THREE.TorusGeometry(0.2, 0.06, 10, 24), mat('#23262b'), -s * 0.11, 0.35, 0, g); cu.rotation.y = Math.PI / 2; cu.position.x = s * 0.52 - s * 0.11 + 0;
      cu.position.y = 0.35; part(cu, [-s * 0.15, 0, 0]);
    }
  });

  // ---- true wireless earbuds with charging case ----
  P.earbuds = make((g, part) => {
    const white = mat('#f4f4f4');
    const caseB = grp(g, 0, 0, 0);
    add(box(0.9, 0.34, 0.5), white, 0, 0.17, 0, caseB); add(box(0.5, 0.04, 0.02), mat('#5fd36a'), 0, 0.2, 0.26, caseB, { cast: false });
    part(caseB);
    const lid = add(box(0.9, 0.1, 0.5), mat('#e7e7ec'), 0, 0.39, 0, g); part(lid, [0, 0.35, -0.1]);
    for (const s of [-1, 1]) {
      const bud = grp(g, s * 0.2, 0.62, 0);
      const head = add(sph(0.12), white, 0, 0, 0, bud); head.scale.set(1, 0.85, 0.9);
      add(sph(0.06), mat('#d9d9df'), -s * 0.1, -0.02, 0, bud);                       // ear tip
      add(cyl(0.032, 0.026, 0.36, 12), white, 0.02 * s, -0.24, 0, bud);               // stem
      add(cyl(0.034, 0.034, 0.02, 12), mat('#c9ced6'), 0.02 * s, -0.42, 0, bud, { cast: false }); // charging contact
      bud.rotation.z = -s * 0.12; part(bud, [s * 0.35, 0.45, 0]);
    }
  });

  // ---- steam iron: sole plate, heating element, body, handle, dial ----
  const ironShape = (k) => { const s = new THREE.Shape(); [[-0.5, -0.28], [0.15, -0.28], [0.5, -0.06], [0.62, 0], [0.5, 0.06], [0.15, 0.28], [-0.5, 0.28]].forEach(([x, y], i) => (i ? s.lineTo(x * k, y * k) : s.moveTo(x * k, y * k))); s.closePath(); return s; };
  P.iron = make((g, part) => {
    const sole = add(new THREE.ExtrudeGeometry(ironShape(1), { depth: 0.06, bevelEnabled: false }), mat('#c9ced6'), 0, 0, 0, g); sole.rotation.x = -Math.PI / 2; part(sole, [0, -0.22, 0]);
    for (let i = 0; i < 5; i++) { const h = add(cyl(0.022, 0.022, 0.01, 10), mat('#4a4f58'), -0.3 + i * 0.2, 0.062, 0, g, { cast: false }); }
    const coil = add(new THREE.TorusGeometry(0.26, 0.022, 8, 40), mat('#d9823a'), 0, 0.1, 0, g); coil.rotation.x = Math.PI / 2; coil.scale.set(1.5, 0.8, 1); part(coil, [0, 0.0, 0]);
    const shell = add(new THREE.ExtrudeGeometry(ironShape(0.92), { depth: 0.3, bevelEnabled: false }), mat('#4f7fb8'), 0, 0.14, 0, g); shell.rotation.x = -Math.PI / 2; part(shell, [0, 0.25, 0]);
    const handle = grp(g, 0, 0.45, 0);
    add(box(0.1, 0.26, 0.14), mat('#2b2f36'), -0.32, 0.1, 0, handle); add(box(0.1, 0.26, 0.14), mat('#2b2f36'), 0.0, 0.1, 0, handle); add(box(0.48, 0.1, 0.14), mat('#2b2f36'), -0.16, 0.26, 0, handle);
    part(handle, [0, 0.6, 0]);
    part(add(cyl(0.07, 0.07, 0.05, 16), mat('#d9534f'), 0.3, 0.46, 0, g), [0.2, 0.7, 0]);   // temperature dial
  });

  // ---- cotton bud ----
  P.cottonBud = make((g, part) => {
    add(cyl(0.025, 0.025, 1.0, 12), mat('#e9e2cc'), 0, 0.5, 0, g);
    for (const y of [0.04, 0.96]) { const c = add(sph(0.075), mat('#ffffff'), 0, y, 0, g); c.scale.y = 1.5; part(c, [0, y < 0.5 ? -0.3 : 0.3, 0]); }
  });

  // ---- light bulb: glass, filament with supports, threaded base ----
  P.lightBulb = make((g, part) => {
    const glass = grp(g, 0, 0.78, 0);
    add(sph(0.4), mat('#dff3ff', { transparent: true, opacity: 0.4 }), 0, 0, 0, glass);
    add(new THREE.CylinderGeometry(0.17, 0.3, 0.3, 24, 1, true), mat('#dff3ff', { transparent: true, opacity: 0.4, side: THREE.DoubleSide }), 0, -0.32, 0, glass);
    part(glass, [0, 0.55, 0]);
    const fil = add(new THREE.TorusGeometry(0.08, 0.012, 6, 20), mat('#ffb347', { emissive: '#ff8a1f', emissiveIntensity: 0.6 }), 0, 0.82, 0, g); part(fil, [0, 0.2, 0]);
    for (const s of [-1, 1]) add(cyl(0.008, 0.008, 0.3, 6), mat('#c9ced6'), s * 0.08, 0.68, 0, g);
    const base = grp(g, 0, 0, 0);
    add(cyl(0.17, 0.17, 0.34, 20), mat('#c9ced6'), 0, 0.3, 0, base);
    for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.172, 0.012, 6, 20), mat('#8f949c'), 0, 0.17 + i * 0.07, 0, base).rotation.x = Math.PI / 2;
    add(cyl(0.07, 0.07, 0.08, 12), mat('#2b2f36'), 0, 0.1, 0, base); add(cyl(0.04, 0.04, 0.06, 12), mat('#e0b43a'), 0, 0.03, 0, base);
    part(base, [0, -0.2, 0]);
  });

  // ---- ice cream cone ----
  P.iceCream = make((g, part) => {
    const cone = add(new THREE.ConeGeometry(0.26, 0.74, 24), mat('#d9a05a'), 0, 0.37, 0, g); cone.rotation.x = Math.PI; part(cone, [0, -0.2, 0]);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; add(box(0.012, 0.6, 0.012), mat('#b8803a'), 0, 0.4, 0, g, { cast: false }).rotation.z = 0; }
    part(add(sph(0.29), mat('#f6a5c0'), 0, 0.9, 0, g), [0, 0.25, 0]);
    part(add(sph(0.25), mat('#f7ecd0'), 0, 1.16, 0, g), [0, 0.5, 0]);
    part(add(sph(0.07), mat('#c2362f'), 0, 1.4, 0, g), [0, 0.75, 0]);
  });

  // ---- generic gold trophy cup (no real trophy is copied) ----
  P.trophy = make((g, part) => {
    const gold = mat('#e0b43a');
    const prof = [[0.0, 0.0], [0.3, 0.0], [0.3, 0.08], [0.1, 0.2], [0.08, 0.5], [0.2, 0.62], [0.3, 0.8], [0.34, 1.0], [0.3, 1.0], [0.0, 0.9]].map(([x, y]) => new THREE.Vector2(x, y));
    const cup = add(new THREE.LatheGeometry(prof, 32), mat('#e0b43a', { side: THREE.DoubleSide }), 0, 0.12, 0, g); part(cup, [0, 0.3, 0]);
    for (const s of [-1, 1]) { const h = add(new THREE.TorusGeometry(0.16, 0.03, 8, 20, Math.PI), gold, s * 0.33, 0.78, 0, g); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; part(h, [s * 0.3, 0.3, 0]); }
    part(add(box(0.7, 0.12, 0.7), mat('#4a3a2a'), 0, 0.06, 0, g), [0, -0.1, 0]);
    part(add(box(0.3, 0.06, 0.02), mat('#c9ced6'), 0, 0.06, 0.36, g, { cast: false }), [0, -0.1, 0.1]);
  });

  // ---- football: white ball with 12 dark patches ----
  P.soccerBall = make((g, part) => {
    const ball = grp(g, 0, 0.5, 0); add(sph(0.5, 32, 20), mat('#f4f4f4'), 0, 0, 0, ball);
    const t = (1 + Math.sqrt(5)) / 2, dirs = [[0, 1, t], [0, -1, t], [0, 1, -t], [0, -1, -t], [1, t, 0], [-1, t, 0], [1, -t, 0], [-1, -t, 0], [t, 0, 1], [-t, 0, 1], [t, 0, -1], [-t, 0, -1]];
    for (const d of dirs) {
      const dir = V(...d).normalize(), m = add(sph(0.17, 16, 10), mat('#23262b'), dir.x * 0.5, dir.y * 0.5, dir.z * 0.5, ball, { cast: false });
      m.quaternion.setFromUnitVectors(V(0, 0, 1), dir); m.scale.set(1, 1, 0.22);
    }
    part(ball);
  });

  const out = {}; for (const k of PROP_NAMES) out[k] = P[k];
  return (name) => { if (!out[name]) throw new Error('unknown prop: ' + name + ' (have: ' + PROP_NAMES.join(', ') + ')'); return out[name](); };
}
