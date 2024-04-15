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

// Canvas
const canvas = document.querySelector("canvas.webgl");

let gridMaterial = null;
let previousGrid = null;

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries
const gridGeometry = new THREE.PlaneGeometry(2, 2);

const config = {
  uNumIter: 7,
  uAmpStart: 0.8,
  uAmpScale: 0.3,
  uAmpSpeed: 0.8,
  uCoordOffset: 0.3,
  uSizeStart: 0.3,
  uSizeLength: 0.1,
  uLengthOffset: 0.5,
};

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()

// uniform float uNumIter;
// uniform float uAmpStart;
// uniform float uAmpScale;
// uniform float uAmpSpeed;
// uniform float uCoordOffset;
// uniform float uSizeStart;
// uniform float uSizeLength;
// uniform float uLengthOffset;

// ============================================================
// Meshes

const makeGrid = () => {
  if (previousGrid) {
    scene.remove(previousGrid);
  }

  gridMaterial = new THREE.ShaderMaterial({
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uNumIter: new THREE.Uniform(config.uNumIter),
      uAmpStart: new THREE.Uniform(config.uAmpStart),
      uAmpScale: new THREE.Uniform(config.uAmpScale),
      uAmpSpeed: new THREE.Uniform(config.uAmpSpeed),
      uCoordOffset: new THREE.Uniform(config.uCoordOffset),
      uSizeStart: new THREE.Uniform(config.uSizeStart),
      uSizeLength: new THREE.Uniform(config.uSizeLength),
      uLengthOffset: new THREE.Uniform(config.uLengthOffset),
    },
  });

  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  scene.add(grid);

  previousGrid = grid;
};

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
camera.position.set(0, 1.5, 0);
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

/**
 * Gui
 */
gui.add(config, "uNumIter").min(1).max(20).step(1).onChange(makeGrid);
gui.add(config, "uAmpStart").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uAmpScale").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uAmpSpeed").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uCoordOffset").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uLengthOffset").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uSizeStart").min(0).max(1).step(0.001).onChange(makeGrid);
gui.add(config, "uSizeLength").min(0).max(1).step(0.001).onChange(makeGrid);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  gridMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
