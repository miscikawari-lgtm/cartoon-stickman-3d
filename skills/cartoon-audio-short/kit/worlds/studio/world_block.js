// world: studio
// A neutral explainer stage: floor, curved backdrop (colour set per frame by worldAt().bg) and a wooden table (top at y = 1).
// Objects from props.js are placed on the table by worldAt().props. Cards (characters) stand on the floor at y = 0.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const floorM = toon({ color: '#ece7dc' });
add(new THREE.CircleGeometry(60, 48), floorM, 0, 0, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
const bgMat = toon({ color: '#d7e7f2', side: THREE.DoubleSide });
add(new THREE.CylinderGeometry(26, 26, 18, 56, 1, true), bgMat, 0, 9, 0, world, { cast: false });
const tableTop = toon({ color: '#c9a06a' });
add(box(3.6, 0.14, 1.9), tableTop, 0, 0.93, 0, world);
for (const [x, z] of [[-1.65, -0.8], [1.65, -0.8], [-1.65, 0.8], [1.65, 0.8]]) add(box(0.14, 0.93, 0.14), M.wood, x, 0.465, z, world);
const clouds = []; // the engine's render loop expects this array (no sky clouds in the studio)
