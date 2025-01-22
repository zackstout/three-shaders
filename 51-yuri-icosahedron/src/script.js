import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";
import fish from "./assets/fish.jpeg";
import sponge from "./assets/sponge.jpeg";

/**
 * Base
 */
// Debug
// const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("rgb(10,0,50)");

const loader = new THREE.TextureLoader();

// ============================================================
// Geometries
const gridGeometry = new THREE.IcosahedronGeometry(1, 1);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()

const fishTexture = loader.load(fish);
// Ah nice, needed for sure!
fishTexture.wrapS = fishTexture.wrapT = THREE.MirroredRepeatWrapping;

// Oh, cool, using wireframe: true with a shape and our default material is neat (rainbow skeleton).
const gridMaterial = new THREE.ShaderMaterial({
  extensions: {
    derivatives: "#extension GL_OES_standard_derivatives : enable",
  },
  side: THREE.DoubleSide,
  vertexShader: gridVertexShader,
  fragmentShader: gridFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uTexture: new THREE.Uniform(fishTexture),
  },
  // wireframe: true,
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
camera.position.set(1, 1, 1);
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

  grid.rotation.x += 0.003;
  grid.rotation.y += 0.003;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
