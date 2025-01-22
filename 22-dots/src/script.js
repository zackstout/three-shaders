import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";

/**
 * Base
 */
// Debug
// const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(16,24,65)");

// ============================================================
// Geometries
const gridGeometry = new THREE.PlaneGeometry(40, 20, 100, 100);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: gridVertexShader,
  fragmentShader: gridFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,

  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

// ============================================================
// Meshes
const grid = new THREE.Mesh(gridGeometry, gridMaterial);
grid.rotation.x = -Math.PI / 2;
scene.add(grid);

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
camera.position.set(0, 10, 2);
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
  // antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

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
