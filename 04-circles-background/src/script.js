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

const params = {
  noiseFrequency: 5.0,
  noiseSmoothstepValue: 0.1,
  noiseSmoothstepOffset: 0.8,
  radius: 0.5,
  numCells: 50.0,
  noiseSpeed: 0.4,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries

let gridMaterial;

const gridGeometry = new THREE.PlaneGeometry(3.6, 2);

let previousGrid = null;

const generateGrid = () => {
  // Phew, yeah, this is needed!
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
      uNoiseFrequency: new THREE.Uniform(params.noiseFrequency),
      uNoiseSpeed: new THREE.Uniform(params.noiseSpeed),
      uNoiseSmoothstepValue: new THREE.Uniform(params.noiseSmoothstepValue),
      uNoiseSmoothstepOffset: new THREE.Uniform(params.noiseSmoothstepOffset),
      uNumCells: new THREE.Uniform(params.numCells),
      uRadius: new THREE.Uniform(params.radius),
    },
  });
  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  scene.add(grid);
  previousGrid = grid;
};

generateGrid();

// ============================================================
// Gui

gui
  .add(params, "noiseFrequency")
  .min(1)
  .max(50)
  .step(0.1)
  .onFinishChange(generateGrid);

gui
  .add(params, "noiseSmoothstepValue")
  .min(0)
  .max(1)
  .step(0.01)
  .onFinishChange(generateGrid);

gui
  .add(params, "noiseSmoothstepOffset")
  .min(0)
  .max(1)
  .step(0.01)
  .onFinishChange(generateGrid);

gui
  .add(params, "noiseSpeed")
  .min(0)
  .max(2)
  .step(0.01)
  .onFinishChange(generateGrid);

gui
  .add(params, "numCells")
  .min(1)
  .max(30)
  .step(0.1)
  .onFinishChange(generateGrid);

gui.add(params, "radius").min(0).max(1).step(0.01).onFinishChange(generateGrid);

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
camera.position.set(0, 1.3, 0);
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
