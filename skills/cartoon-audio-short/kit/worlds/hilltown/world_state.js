const cl01 = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
function worldState(S, f) {
  // the wall grows course by course
  wallSlabs.forEach((m, i) => { const s_ = cl01(S.wallH - i); m.visible = s_ > 0.001; m.scale.y = Math.max(s_, 0.001); m.position.y = i + s_ / 2; });
  // washing: flaps, flies off to the next county, or hangs pegged
  cloths.forEach((c, i) => {
    const C = S.cloth, t = cl01((f - (C.flyF + i * 9)) / 70, 0, 1.4);
    c.g.visible = C.vis && t < 1.4; if (!c.g.visible) return;
    if (t > 0) { c.g.position.set(c.x + t * 30, LINE_Y - t * 0.8 + t * t * 4 + Math.sin(t * 9 + i) * 0.9, LINE_Z + Math.sin(i * 2.1) * t * 6); c.g.rotation.set(t * 5, t * 3 + i, t * 9 + i); }
    else { c.g.position.set(c.x, LINE_Y, LINE_Z); c.g.rotation.set(0, 0, 0); }
    const pa = c.m.geometry.attributes.position, b = c.m.userData.base, A = C.amp;
    for (let k = 0; k < pa.count; k++) {
      const x = b[k * 3], y = b[k * 3 + 1], free = 1 - (y + 0.6) / 1.2;
      pa.setX(k, x + free * A * (0.55 + 0.35 * Math.sin(f * 0.42 + i * 1.3 + free * 3)) * 0.9);
      pa.setY(k, y + free * A * 0.12 * Math.sin(f * 0.42 + i));
      pa.setZ(k, Math.sin(f * 0.5 + x * 5 + i) * 0.1 * A * free);
    }
    pa.needsUpdate = true; c.m.geometry.computeVertexNormals();
  });
  pegs.forEach((p, k) => { p.visible = k < S.pegN; });
  // roofs lift off the first three houses
  for (let i = 0; i < 3; i++) { const p = S.roofs[i], r = houses[i].roof; r.visible = p < 1.15; r.position.set(p * p * 16 + p * 2, r.userData.y0 + p * 6 + Math.sin(p * 5) * 1.0, p * 3); r.rotation.set(0, p * 2, -p * 4); }
  windState(S.wind, f, S.wallH);
}

const hatState = (h) => {
  hat.visible = !!h; if (!h) return; const t = h.t;
  hat.position.set(3.5 + t * 18, 1.98 + t * 6 + Math.sin(t * 9) * 0.5, 12.5 - t * 3); hat.rotation.set(t * 6, t * 4, t * 9);
};

