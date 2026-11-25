import * as THREE from './skills/cartoon-audio-short/kit/vendor/three.module.js';

const INK = 0x241726;
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ecae6);
scene.fog = new THREE.Fog(0xcbe8f4, 40, 120);

const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 200);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8fb04a, 1.0));
const sun = new THREE.DirectionalLight(0xfff1d0, 2.0);
sun.position.set(-5, 9, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40});
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 0.04;
scene.add(sun);

const grad = (() => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 1;
  const g = c.getContext('2d');
  ['#8a8a8a', '#c4c4c4', '#ececec', '#ffffff'].forEach((col, i) => { g.fillStyle = col; g.fillRect(i, 0, 1, 1); });
  const t = new THREE.CanvasTexture(c);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
  return t;
})();
const toon = (color, extra = {}) => new THREE.MeshToonMaterial({color, gradientMap: grad, ...extra});
const hullMat = new THREE.MeshBasicMaterial({color: INK, side: THREE.BackSide});
const ink = new THREE.MeshBasicMaterial({color: INK});
const mix = (hex, to, t) => new THREE.Color(hex).lerp(new THREE.Color(to), t);

function solid(geo, color, {outline = 0.05, shadow = true, side} = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, toon(color, side ? {side} : {}));
  m.castShadow = shadow; m.receiveShadow = true;
  g.add(m);
  if (outline) {
    const h = new THREE.Mesh(geo, hullMat);
    h.scale.setScalar(1 + outline);
    g.add(h);
  }
  return g;
}

function limb(a, b, r, color) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), toon(color));
  m.castShadow = true;
  const h = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.03, r + 0.03, len + 0.06, 12), hullMat);
  g.add(h, m);
  g.position.copy(a).addScaledVector(dir, 0.5);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return g;
}

// ---- the skill's cast: same outfits and colours as kit/engine/roman.js ----
const OUTFITS = {
  civA:   {tunic: 0x4f7fb8, skin: 0xf5c9a0, hair: 0x5a3b2a},
  mayor:  {tunic: 0x7a2f3a, skin: 0xf5c9a0, cap: 0x2b2430, moustache: 0xd9d4c8, sash: 0xc9a23a, stout: true},
  farmer: {tunic: 0x7a8f3a, skin: 0xd9a37a, cap: 0xc9a86a, moustache: 0x5a3b2a},
  fisher: {tunic: 0x2f5d7c, skin: 0xe8c2a0, cap: 0xd9a441, beard: 0x8a5a3a},
};

function makeChar(O, pose = {}) {
  const c = new THREE.Group();
  const P = (x, y, z = 0) => new THREE.Vector3(x, y, z);
  const legCol = mix(O.tunic, 0x241726, 0.62);
  const armCol = mix(O.tunic, 0x241726, 0.5);
  const stout = O.stout ? 1.12 : 1;

  // legs: thin ink-coloured sticks and brown soles
  const step = pose.step ?? 0;
  for (const s of [-1, 1]) {
    const hip = P(s * 0.26, 1.35);
    const foot = P(s * 0.34, 0.1, s * step);
    c.add(limb(hip, foot, 0.055, legCol));
    const shoe = solid(new THREE.SphereGeometry(0.13, 16, 12), 0x5a3b2a, {outline: 0.12});
    shoe.scale.set(1.1, 0.5, 1.7); shoe.position.set(foot.x, 0.07, foot.z + 0.1); c.add(shoe);
  }

  // tunic: rounded blob, narrower at hips, with belt ring
  const body = solid(new THREE.CylinderGeometry(0.62 * stout, 0.5 * stout, 1.35, 32), O.tunic, {outline: 0.045});
  body.scale.z = 0.62; body.position.y = 1.95; c.add(body);
  const shoulder = solid(new THREE.SphereGeometry(0.62 * stout, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), O.tunic, {outline: 0.045});
  shoulder.scale.set(1, 0.4, 0.62); shoulder.position.y = 2.62; c.add(shoulder);
  const belt = solid(new THREE.TorusGeometry(0.53 * stout, 0.045, 10, 36), 0xd9b66a, {outline: 0.1});
  belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.62, 1); belt.position.y = 1.45; c.add(belt);
  if (O.sash) {
    const sash = limb(P(-0.5 * stout, 2.55, 0.4), P(0.45 * stout, 1.5, 0.4), 0.085, O.sash);
    sash.scale.z = 0.3; c.add(sash);
  }

  // arms: stick with round hands, hanging or reaching
  const reachL = pose.reachL, reachR = pose.reachR;
  for (const [s, reach] of [[-1, reachL], [1, reachR]]) {
    const sh = P(s * 0.62 * stout, 2.5);
    const el = P(s * 0.86 * stout, 2.0, 0.06);
    const hand = reach ?? P(s * 0.84 * stout, 1.42, 0.08);
    c.add(limb(sh, el, 0.045, armCol), limb(el, hand, 0.045, armCol));
    const h = solid(new THREE.SphereGeometry(0.1, 14, 12), 0x241726, {outline: 0});
    h.position.copy(hand); c.add(h);
  }

  // head: the skill's big bean head
  const head = new THREE.Group(); head.position.y = 3.65; head.scale.setScalar(1.18); c.add(head);
  const skull = solid(new THREE.SphereGeometry(0.62, 40, 28), O.skin, {outline: 0.05});
  skull.scale.set(1, 0.95, 0.92); head.add(skull);

  const fz = 0.57;
  for (const x of [-0.2, 0.2]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), ink);
    e.scale.set(1, 1.15, 0.4); e.position.set(x, 0.02, fz); head.add(e);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 6, 20, Math.PI), ink);
  smile.rotation.z = Math.PI; smile.position.set(0, -0.18, fz - 0.02); head.add(smile);

  // hair, cap, moustache, beard
  if (O.hair) {
    const hair = solid(new THREE.SphereGeometry(0.64, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.25), O.hair, {outline: 0.04});
    hair.scale.set(1, 0.95, 0.94); hair.position.y = 0.02; head.add(hair);
  }
  if (O.cap) {
    const cap = solid(new THREE.SphereGeometry(0.65, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.4), O.cap, {outline: 0.04});
    cap.scale.set(1, 0.95, 0.95); cap.position.y = 0.05; head.add(cap);
    const brim = solid(new THREE.TorusGeometry(0.58, 0.045, 8, 36), mix(O.cap, 0x000000, 0.25), {outline: 0.1});
    brim.rotation.x = Math.PI / 2; brim.scale.set(1, 1, 0.8); brim.position.set(0, 0.2, 0.02); head.add(brim);
  }
  if (O.moustache) {
    const m = solid(new THREE.SphereGeometry(0.11, 14, 10), O.moustache, {outline: 0.1});
    m.scale.set(1.9, 0.55, 0.6); m.position.set(0, -0.08, fz - 0.02); head.add(m);
  }
  if (O.beard) {
    const b = solid(new THREE.SphereGeometry(0.4, 24, 16, 0, Math.PI * 2, Math.PI / 2.2, Math.PI / 1.9), O.beard, {outline: 0.05});
    b.scale.set(1, 1, 0.8); b.position.set(0, -0.15, 0.2); head.add(b);
  }
  return c;
}

// ---- world ----
const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 48), toon(0x9bc255));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 80), toon(0xd8b982));
path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, -20); path.receiveShadow = true; scene.add(path);

function hill(x, z, r, h, color) {
  const g = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const m = solid(g, color, {outline: 0.01, shadow: false}); m.scale.y = h / r; m.position.set(x, 0, z); scene.add(m);
}
hill(-11, -20, 9, 3.5, 0x86b04a); hill(12, -22, 10, 4.2, 0x7ea845); hill(0, -34, 16, 5.5, 0x92b94f);
const mtn = solid(new THREE.ConeGeometry(9, 11, 6), 0x9aa7b4, {outline: 0.008, shadow: false});
mtn.position.set(1, 5.5, -48); scene.add(mtn);
const snow = solid(new THREE.ConeGeometry(3.2, 3.8, 6), 0xffffff, {outline: 0.01, shadow: false});
snow.position.set(1, 9.1, -48); scene.add(snow);

const house = new THREE.Group();
house.add(solid(new THREE.BoxGeometry(2.4, 1.6, 2), 0xf0dfb8));
const roof = solid(new THREE.ConeGeometry(2.0, 1.1, 4), 0xc9502f); roof.rotation.y = Math.PI / 4; roof.position.y = 1.35; house.add(roof);
const door = solid(new THREE.BoxGeometry(0.5, 0.9, 0.05), 0x8a5a3a, {outline: 0.05}); door.position.set(0.3, -0.35, 1.03); house.add(door);
house.position.set(6.2, 0.8, -11); house.rotation.y = -0.4; scene.add(house);

function palm(x, z, h, lean) {
  const g = new THREE.Group();
  g.add(limb(P0(), new THREE.Vector3(lean, h, 0), 0.14, 0x6b5560));
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    const leaf = solid(new THREE.ConeGeometry(0.2, 2.0, 6), 0x4f8f45, {outline: 0.05});
    leaf.scale.z = 0.25;
    leaf.position.set(lean + Math.cos(a) * 0.9, h - 0.2, Math.sin(a) * 0.9);
    leaf.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
    g.add(leaf);
  }
  g.position.set(x, 0, z); scene.add(g);
}
function P0() { return new THREE.Vector3(0, 0, 0); }
palm(-6.5, -4, 5, 0.5); palm(7, -6, 6, -0.4);

const sunMesh = new THREE.Mesh(new THREE.CircleGeometry(1.3, 32), new THREE.MeshBasicMaterial({color: 0xffd36e, fog: false}));
sunMesh.position.set(9, 14, -60); scene.add(sunMesh);

// ---- cast ----
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cast = [
  {o: OUTFITS.civA,   x: -2.45, z: 0.0, ry: 0.2,  pose: {step: 0.2, reachR: V(1.25, 1.95, 0.3)}},
  {o: OUTFITS.mayor,  x: 0,     z: -0.4, ry: 0,   pose: {step: -0.15, reachL: V(-1.25, 1.95, 0.3), reachR: V(1.25, 1.95, 0.3)}},
  {o: OUTFITS.farmer, x: 2.45,  z: 0.0, ry: -0.2, pose: {step: 0.15, reachL: V(-1.25, 1.95, 0.3)}},
];
for (const k of cast) {
  const ch = makeChar(k.o, k.pose);
  ch.position.set(k.x, 0, k.z); ch.rotation.y = k.ry; scene.add(ch);
  const s = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.13}));
  s.rotation.x = -Math.PI / 2; s.position.set(k.x, 0.02, k.z); scene.add(s);
}

function fit() {
  renderer.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight;
  cam.fov = cam.aspect < 0.8 ? 40 : 34;
  cam.position.set(0, 1.6, cam.aspect < 0.6 ? 25 : cam.aspect < 0.8 ? 19 : 12);
  cam.lookAt(0, 2.8, 0);
  cam.updateProjectionMatrix();
  renderer.render(scene, cam);
}
addEventListener('resize', fit);
fit();
document.body.dataset.ready = '1';
