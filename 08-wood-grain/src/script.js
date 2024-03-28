import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

// Color palette
// https://www.color-hex.com/color-palette/64056

const params = {
  frequency: 5.0,
  speed: 0,
  numOctaves: 5,
  gain: 0.5,
  lacunarity: 2,
  woodNoiseAmplitude: 1.0,
  woodNoiseSecondFreq: 0.2,
  woodNoiseSecondAmplitude: 2.2,
  woodHoleSharpness: 3,
  woodDarkStart: 1, // 0.18
  woodDarkEnd: 0.9, // 0.32
  woodLightStart: 0.5,
  woodLightEnd: 0.95,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("rgb(10,0,50)");

let gridMaterial = null;
let previousGrid = null;

// ============================================================
// Geometries
const gridGeometry = new THREE.PlaneGeometry(2, 2);

function makeGrid() {
  if (previousGrid) {
    scene.remove(previousGrid);
  }

  // ============================================================
  // Materials
  // const gridMaterial = new THREE.MeshBasicMaterial()
  gridMaterial = new THREE.ShaderMaterial({
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uFrequency: new THREE.Uniform(params.frequency),
      uSpeed: new THREE.Uniform(params.speed),
      uGain: new THREE.Uniform(params.gain),
      uLacunarity: new THREE.Uniform(params.lacunarity),
      uNumOctaves: new THREE.Uniform(params.numOctaves),

      uWoodNoiseAmplitude: new THREE.Uniform(params.woodNoiseAmplitude),
      uWoodNoiseSecondFreq: new THREE.Uniform(params.woodNoiseSecondFreq),
      uWoodNoiseSecondAmplitude: new THREE.Uniform(
        params.woodNoiseSecondAmplitude
      ),
      uWoodHoleSharpness: new THREE.Uniform(params.woodHoleSharpness),
      uWoodDarkStart: new THREE.Uniform(params.woodDarkStart),
      uWoodDarkEnd: new THREE.Uniform(params.woodDarkEnd),
      uWoodLightStart: new THREE.Uniform(params.woodLightStart),
      uWoodLightEnd: new THREE.Uniform(params.woodLightEnd),
    },
  });

  // ============================================================
  // Meshes
  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 6;
  scene.add(grid);
  previousGrid = grid;
}

makeGrid();

// ============================================================
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// GUI

gui.add(params, "frequency").min(1).max(20).step(0.1).onChange(makeGrid);
gui.add(params, "gain").min(0).max(1).step(0.01).onChange(makeGrid);
gui.add(params, "speed").min(0).max(5).step(0.1).onChange(makeGrid);
gui.add(params, "numOctaves").min(1).max(12).step(1).onChange(makeGrid);
gui.add(params, "lacunarity").min(0.5).max(3).step(0.1).onChange(makeGrid);

gui
  .add(params, "woodNoiseAmplitude")
  .min(0)
  .max(5)
  .step(0.1)
  .onChange(makeGrid);
gui
  .add(params, "woodNoiseSecondFreq")
  .min(0)
  .max(2)
  .step(0.01)
  .onChange(makeGrid);
gui
  .add(params, "woodNoiseSecondAmplitude")
  .min(0)
  .max(5)
  .step(0.1)
  .onChange(makeGrid);
gui
  .add(params, "woodHoleSharpness")
  .min(0.5)
  .max(10)
  .step(0.1)
  .onChange(makeGrid);
gui.add(params, "woodDarkStart").min(0).max(1).step(0.01).onChange(makeGrid);
gui.add(params, "woodDarkEnd").min(0).max(1).step(0.01).onChange(makeGrid);

gui.add(params, "woodLightStart").min(0).max(1).step(0.01).onChange(makeGrid);
gui.add(params, "woodLightEnd").min(0).max(1).step(0.01).onChange(makeGrid);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0.5, 1);
scene.add(camera);
// camera.lookAt(water.position);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  gridMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
