const propCache = new Map();
function propInst(slot, name) {
  const key = slot + ':' + name;
  if (!propCache.has(key)) { const g = makeProp(name); g.visible = false; scene.add(g); propCache.set(key, g); }
  return propCache.get(key);
}
function worldState(S, f) {
  propCache.forEach((g) => { g.visible = false; });
  bgMat.color.set(S.bg || '#d7e7f2');
  (S.props || []).forEach((pr, i) => {
    const g = propInst(i, pr.name); g.visible = true;
    g.position.set(pr.x ?? 0, pr.y ?? 1.0, pr.z ?? 0);
    g.rotation.set(pr.rx || 0, pr.ry || 0, pr.rz || 0); g.scale.setScalar(pr.scale ?? 1);
    const ex = pr.explode || 0;
    for (const pt of g.userData.parts) pt.o.position.set(pt.b[0] + pt.dir[0] * ex, pt.b[1] + pt.dir[1] * ex, pt.b[2] + pt.dir[2] * ex);
  });
}
