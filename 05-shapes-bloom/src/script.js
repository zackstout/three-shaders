import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import boxVertexShader from "./shaders/box/vertex.glsl";
import boxFragmentShader from "./shaders/box/fragment.glsl";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

// Ok... running into issues passing in color as uniform...
// And running into issues with applying light or grid shader to ConvexGeom.... likely bc of normals.

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

// ============================================================
// Geometries
// const gridGeometry = new THREE.PlaneGeometry(2, 2);

const points = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [1, 0, 0],
  [0, 0, 1],
  [0, 1, 1],
  [1, 1, 1],
  [1, 0, 1],
].map((a) => new THREE.Vector3(...a));
// const gridGeometry = new ConvexGeometry(points);

// Aha!!! The grid works if we use this, but not the Convex one... huh!
// Oooh I bet it didn't know about its normals... yeah that would make sense.
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

// Wow, the sphere looks great...
const sphereGeometry = new THREE.SphereGeometry(0.7, 20, 20);

const octahedronGeometry = new THREE.OctahedronGeometry(0.7, 0);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const boxMaterial = new THREE.ShaderMaterial({
  vertexShader: boxVertexShader,
  fragmentShader: boxFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Color(1.0, 0.0, 0.8),
  },
  // transparent: true,
  // depthWrite: false,
  // blending: THREE.AdditiveBlending,
});

// ============================================================
// Meshes
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.rotation.x = -Math.PI / 2;
scene.add(box);

const sphere = new THREE.Mesh(sphereGeometry, boxMaterial);
// sphere.rotation.x = -Math.PI / 2;
sphere.position.x = 1.5;
sphere.position.z = -1.5;
scene.add(sphere);

const octahedron = new THREE.Mesh(octahedronGeometry, boxMaterial);
// octahedron.rotation.x = -Math.PI / 2;
octahedron.position.x = -1.5;
octahedron.position.z = 1.5;
scene.add(octahedron);

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
const scl = 2.2;
camera.position.set(0.8 * scl, 0.8, 0.8 * scl);
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

  boxMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
