import * as THREE from './skills/cartoon-audio-short/kit/vendor/three.module.js';

const OUT = 0x3f3247;
const renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ecae6);
scene.fog = new THREE.Fog(0xcbe8f4, 40, 120);

const cam = new THREE.PerspectiveCamera(42, innerWidth/innerHeight, 0.1, 200);
cam.position.set(0, 1.4, 12.5);
cam.lookAt(0, 2.0, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x8fb04a, 0.9));
const sun = new THREE.DirectionalLight(0xfff1d0, 2.2);
sun.position.set(-5, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left:-12, right:12, top:12, bottom:-12, near:1, far:40});
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 0.04;
scene.add(sun);

const grad = (() => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 1;
  const g = c.getContext('2d');
  ['#777','#bbb','#e8e8e8','#fff'].forEach((col,i)=>{ g.fillStyle = col; g.fillRect(i,0,1,1); });
  const t = new THREE.CanvasTexture(c);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false;
  return t;
})();
const toon = (color) => new THREE.MeshToonMaterial({color, gradientMap: grad});
const hullMat = new THREE.MeshBasicMaterial({color: OUT, side: THREE.BackSide});

function mesh(geo, color, {outline = 0.035, shadow = true} = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, toon(color));
  m.castShadow = shadow; m.receiveShadow = true;
  g.add(m);
  if (outline) {
    const h = new THREE.Mesh(geo, hullMat);
    h.onBeforeRender = () => {};
    const s = 1 + outline;
    h.scale.setScalar(s);
    g.add(h);
  }
  return g;
}

function tube(a, b, r, color) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(r, r * 0.8, len, 14);
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, toon(color)); m.castShadow = true;
  const h = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.025, r * 0.8 + 0.025, len + 0.05, 14), hullMat);
  g.add(m, h);
  g.position.copy(a).addScaledVector(dir, 0.5);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
  return g;
}

function makeChar({body, accent, skin = 0xf6e7d0, hat, dots, pose}) {
  const c = new THREE.Group();
  const P = (x,y,z) => new THREE.Vector3(x,y,z);

  // legs
  const hipL = P(-0.2, 1.2, 0), hipR = P(0.2, 1.2, 0);
  const footL = P(-0.26 + pose.legL, 0.1, pose.stepL), footR = P(0.26 + pose.legR, 0.1, pose.stepR);
  c.add(tube(hipL, footL, 0.055, 0x4a3b3f), tube(hipR, footR, 0.055, 0x4a3b3f));
  for (const f of [footL, footR]) {
    const shoe = mesh(new THREE.SphereGeometry(0.11, 16, 12), 0x4a3b3f);
    shoe.scale.set(1, 0.6, 1.5); shoe.position.copy(f).add(P(0, 0, 0.05)); c.add(shoe);
  }

  // torso: wide at shoulders, narrow at hips
  const torsoGeo = new THREE.CylinderGeometry(0.56, 0.36, 1.15, 28, 1);
  const torso = mesh(torsoGeo, body, {outline: 0.04});
  torso.position.y = 1.75; c.add(torso);
  const shoulderCap = mesh(new THREE.SphereGeometry(0.56, 28, 12, 0, Math.PI*2, 0, Math.PI/2), body, {outline: 0.04});
  shoulderCap.scale.set(1, 0.35, 0.8); shoulderCap.position.y = 2.32; c.add(shoulderCap);
  torso.scale.z = 0.7;

  // sash or dots
  if (accent) {
    const sash = mesh(new THREE.TorusGeometry(0.46, 0.05, 10, 32), accent, {outline: 0.05});
    sash.rotation.x = Math.PI / 2; sash.scale.set(1, 0.7, 1); sash.position.y = 1.95; c.add(sash);
  }
  if (dots) {
    [[-0.2,2.05],[0.1,2.15],[0.22,1.85],[-0.05,1.8],[-0.25,1.65]].forEach(([x,y]) => {
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), toon(dots));
      d.position.set(x, y, 0.36 * 0.7 + 0.2 - 0.02); c.add(d);
    });
  }

  // arms
  const shL = P(-0.55, 2.2, 0), shR = P(0.55, 2.2, 0);
  const haL = pose.armL, haR = pose.armR;
  const elL = P(-0.8, 1.9, 0.1).add(P(0,0,0)), elR = P(0.8, 1.9, 0.1);
  c.add(tube(shL, elL, 0.045, 0x4a3b3f), tube(elL, haL, 0.045, 0x4a3b3f));
  c.add(tube(shR, elR, 0.045, 0x4a3b3f), tube(elR, haR, 0.045, 0x4a3b3f));
  for (const h of [haL, haR]) { const m = mesh(new THREE.SphereGeometry(0.1, 16, 12), skin); m.position.copy(h); c.add(m); }

  // neck + head
  c.add(tube(P(0,2.3,0), P(0,2.55,0), 0.05, 0x4a3b3f));
  const head = new THREE.Group(); head.position.y = 3.0; c.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.5, 40, 28), skin, {outline: 0.04});
  skull.scale.set(0.92, 1.12, 0.92);
  skull.children[0].receiveShadow = false;
  head.add(skull);
  // pointed top (bean/seed)
  const tip = mesh(new THREE.ConeGeometry(0.28, 0.26, 24), skin, {outline: 0.05});
  tip.position.y = 0.55; tip.scale.z = 0.8; head.add(tip);

  // face
  const fz = 0.455;
  for (const x of [-0.16, 0.16]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshBasicMaterial({color: OUT}));
    e.scale.z = 0.5; e.position.set(x, 0.05, fz); head.add(e);
    const ck = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({color: 0xf2a6a6}));
    ck.scale.set(1, 0.7, 0.3); ck.position.set(x * 1.45, -0.12, fz - 0.07); head.add(ck);
    const brow = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 6), new THREE.MeshBasicMaterial({color: OUT}));
    brow.rotation.z = Math.PI / 2 + (x < 0 ? 0.14 : -0.14); brow.position.set(x, 0.18, fz - 0.02); head.add(brow);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 20, Math.PI), new THREE.MeshBasicMaterial({color: OUT}));
  smile.rotation.z = Math.PI; smile.position.set(0, -0.1, fz - 0.01); head.add(smile);

  // hats
  if (hat === 'cone') {
    const h = mesh(new THREE.ConeGeometry(0.62, 0.55, 28, 1, true), 0xd9a92b, {outline: 0.04});
    h.material = undefined;
    h.children[0].material = new THREE.MeshToonMaterial({color: 0xd9a92b, gradientMap: grad, side: THREE.DoubleSide});
    h.position.y = 0.62; head.add(h);
  } else if (hat === 'cap') {
    const h = mesh(new THREE.SphereGeometry(0.53, 28, 16, 0, Math.PI*2, 0, Math.PI/2.4), 0x3a2e48, {outline: 0.04});
    h.scale.set(0.95, 1.18, 0.95); h.position.y = 0.04; head.add(h);
    const band = mesh(new THREE.TorusGeometry(0.47, 0.03, 8, 32), 0x9c7fb8, {outline: 0.05});
    band.rotation.x = Math.PI/2; band.position.y = 0.2; band.scale.set(1, 1, 1); head.add(band);
  }
  return c;
}

// ground
const ground = new THREE.Mesh(new THREE.CircleGeometry(60, 48), toon(0x9bc255));
ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
const path = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 60), toon(0xd8b982));
path.rotation.x = -Math.PI/2; path.position.set(0, 0.01, -14); path.receiveShadow = true; scene.add(path);

// hills and mountain
function hill(x, z, r, h, color) {
  const g = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI*2, 0, Math.PI/2);
  const m = mesh(g, color, {outline: 0.01, shadow: false}); m.scale.y = h / r; m.position.set(x, 0, z); scene.add(m);
}
hill(-9, -18, 8, 3.2, 0x86b04a); hill(10, -20, 9, 4, 0x7ea845); hill(0, -30, 14, 5, 0x92b94f);
const mtn = mesh(new THREE.ConeGeometry(9, 11, 6), 0x9aa7b4, {outline: 0.008, shadow: false});
mtn.position.set(1, 5.5, -42); scene.add(mtn);
const snow = mesh(new THREE.ConeGeometry(3.2, 3.8, 6), 0xffffff, {outline: 0.01, shadow: false});
snow.position.set(1, 9.1, -42); scene.add(snow);

// house
const house = new THREE.Group();
house.add(Object.assign(mesh(new THREE.BoxGeometry(2.4, 1.6, 2), 0xf0dfb8), {}));
const roof = mesh(new THREE.ConeGeometry(2.0, 1.1, 4), 0xc9502f); roof.rotation.y = Math.PI/4; roof.position.y = 1.35; house.add(roof);
const door = mesh(new THREE.BoxGeometry(0.5, 0.9, 0.05), 0x8a5a3a, {outline: 0.05}); door.position.set(0.3, -0.35, 1.03); house.add(door);
const win = mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), 0x9fd4ec, {outline: 0.05}); win.position.set(-0.6, 0.1, 1.03); house.add(win);
house.position.set(5.2, 0.8, -9); house.rotation.y = -0.4; scene.add(house);

// palms
function palm(x, z, h, lean) {
  const g = new THREE.Group();
  const trunk = tube(new THREE.Vector3(0,0,0), new THREE.Vector3(lean, h, 0), 0.14, 0x6b5560); g.add(trunk);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    const leaf = mesh(new THREE.ConeGeometry(0.2, 2.0, 6), 0x4f8f45, {outline: 0.05});
    leaf.scale.z = 0.25;
    leaf.position.set(lean + Math.cos(a) * 0.9, h - 0.2, Math.sin(a) * 0.9);
    leaf.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
    g.add(leaf);
  }
  g.position.set(x, 0, z); scene.add(g);
}
palm(-4.6, -3, 5, 0.5); palm(5.4, -5, 6, -0.4); palm(-7.5, -9, 5.5, 0.6);

// sun
const sunMesh = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({color: 0xffd36e, fog: false}));
sunMesh.position.set(8, 13, -50); scene.add(sunMesh);

// characters
const P3 = (x,y,z) => new THREE.Vector3(x,y,z);
const a = makeChar({body: 0x5f9a4a, accent: 0xd9a92b, hat: 'cone',
  pose: {legL: 0, legR: 0.05, stepL: 0.25, stepR: -0.25, armL: P3(-0.95, 1.3, 0.25), armR: P3(1.0, 1.7, 0.45)}});
a.position.set(-1.35, 0, 0.4); a.rotation.y = 0.18; scene.add(a);
const b = makeChar({body: 0x8a5a3a, dots: 0xf08a3c, hat: 'cap',
  pose: {legL: 0, legR: 0, stepL: -0.25, stepR: 0.25, armL: P3(-1.0, 1.7, 0.45), armR: P3(0.95, 1.3, 0.25)}});
b.position.set(1.35, 0, -0.2); b.rotation.y = -0.2; scene.add(b);

// soft ground blobs under feet
for (const [x, z] of [[-1.35, 0.4], [1.35, -0.2]]) {
  const s = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: 0.12}));
  s.rotation.x = -Math.PI/2; s.position.set(x, 0.02, z); scene.add(s);
}

addEventListener('resize', () => fit());
function fit() {
  renderer.setSize(innerWidth, innerHeight);
  cam.aspect = innerWidth / innerHeight;
  cam.fov = cam.aspect < 0.8 ? 40 : 34;
  cam.position.z = cam.aspect < 0.6 ? 15.5 : 12.5;
  cam.updateProjectionMatrix();
  renderer.render(scene, cam);
}
fit();
document.body.dataset.ready = '1';
