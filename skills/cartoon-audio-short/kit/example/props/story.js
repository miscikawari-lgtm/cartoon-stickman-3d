// Prop showcase for worlds/studio: each of the 12 props gets 24 frames: assembled, then an exploded view, then assembled again.
// Render stills at frames i*24+3 (assembled) and i*24+16 (exploded) to inspect a prop: node render.mjs stills "3,16,27,40,..."
import { PROP_NAMES } from './props.js';
export const FPS = 30, DECK = 0;
const PER = 24, N = PROP_NAMES.length;
export const TOTAL = PER * N;
export const SHOTS = PROP_NAMES.map((id, i) => ({ id, a: i * PER, b: i * PER + PER - 1, light: 'studio' }));
export const shotAt = (f) => SHOTS[Math.min(N - 1, Math.floor(f / PER))];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const LIGHTS = { studio: { az: 140, el: 52, sky: '#dfe8f3', ground: '#a49c88', hemi: 1.2, sun: '#fff6e8', sunI: 2.6, fog: '#e6eef6', fogNear: 60, fogFar: 400, skyTop: '#cfe0f2', skyHor: '#e9f1f8', sat: 1.05, vig: 0.15, shadowExt: 6 } };
export const lightFor = (S) => ({ ...LIGHTS[S.light] });
export const camAt = (f) => ({ pos: [0, 3.0, 4.8], look: [0, 2.05, 0], fov: 42, roll: 0, flash: 0, shadowAt: [0, 1, 0] });
export const dofAt = () => ({ focus: 5, cinf: 0 });
export const worldAt = (f) => {
  const i = Math.min(N - 1, Math.floor(f / PER)), k = f - i * PER;
  const bgs = ['#d7e7f2', '#f2dfe6', '#dfeadf', '#efe6d2'];
  return { bg: bgs[i % bgs.length], props: [{ name: PROP_NAMES[i], scale: 1.15, ry: 0.55 + k * 0.03, explode: smooth((k - 7) / 8) * (1 - smooth((k - 18) / 5)) }] };
};
export const actorsAt = () => [];
export const fxAt = () => [];
