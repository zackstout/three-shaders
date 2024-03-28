import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import vaporwaveVertexShader from "./shaders/grid/vertex.glsl";
import vaporwaveFragmentShader from "./shaders/grid/fragment.glsl";
import sunVertexShader from "./shaders/sun/vertex.glsl";
import sunFragmentShader from "./shaders/sun/fragment.glsl";
import starVertexShader from "./shaders/star/vertex.glsl";
import starFragmentShader from "./shaders/star/fragment.glsl";
import sunFlatVertexShader from "./shaders/sunFlat/vertex.glsl";
import sunFlatFragmentShader from "./shaders/sunFlat/fragment.glsl";
import terrainVertexShader from "./shaders/terrain/vertex.glsl";
import terrainFragmentShader from "./shaders/terrain/fragment.glsl";

import { Sky } from "three/addons/objects/Sky.js";

/**
 *
 * TODO: Add some kind of atmosphere/haze in the sky around the sun
 * TODO: Add nice looking stars (add shaders)
 * TODO: Try one where the sun casts some kind of nice reflection on the ground
 * TODO: Cuts from the sun
 * TODO: Noisy extruded plane for mountains (and try out different placements)
 *
 *
 * TODO: add some kind of face to the blue grid, some sheen to it or something.
 * would be incredible to reflect the sunlight....
 * I def want to explore normals somewhere... this might as well be the place....
 *
 * TODO: Really should put a lot of the props up in the config. That would be fun.
 * But also have a "hide config" button. Want to be able to just vibe out lol.
 * Maybe add music too.
 */

/**
 * Base
 */
// Debug
// const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries
const gridGeometry = new THREE.PlaneGeometry(6, 2);
const sunGeometry = new THREE.SphereGeometry(1.5);

// NOTE: Changing the 3rd and 4th arguments alters how finely we draw the mesh. Can be triangular or like, wavy (with higher number).
const terrainGeometry = new THREE.PlaneGeometry(6, 2, 8, 8);

const sunFlatGeometry = new THREE.PlaneGeometry(2, 2);

// Ah, using a plane is preferable in this case
// const starGeometry = new THREE.SphereGeometry(0.5, 24, 24);
const starGeometry = new THREE.PlaneGeometry(0.5, 0.5);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: vaporwaveVertexShader,
  fragmentShader: vaporwaveFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});
// const sphereMaterial = new THREE.MeshBasicMaterial({
//   color: new THREE.Color("rgb(255, 0, 0)"),
// });
const sunMaterial = new THREE.ShaderMaterial({
  vertexShader: sunVertexShader,
  fragmentShader: sunFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

// const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const starMaterial = new THREE.ShaderMaterial({
  vertexShader: starVertexShader,
  fragmentShader: starFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
  //   transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

// NOTE: Removing all the transparent and below props is interesting effect.
const terrainMaterial = new THREE.ShaderMaterial({
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
});

const sunFlatMaterial = new THREE.ShaderMaterial({
  vertexShader: sunFlatVertexShader,
  fragmentShader: sunFlatFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

// ============================================================
// Meshes
const grid = new THREE.Mesh(gridGeometry, gridMaterial);
grid.rotation.x = -Math.PI / 2;
grid.position.y = -0.25;
scene.add(grid);

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -0.255;
scene.add(terrain);

// const sun = new THREE.Mesh(sunGeometry, sunMaterial);
// sun.position.x = 0;
// sun.position.z = -4;
// sun.position.y = 1.7;
// sun.rotation.x = Math.PI * 0.08;
// scene.add(sun);

const sunFlat = new THREE.Mesh(sunFlatGeometry, sunFlatMaterial);
sunFlat.position.x = 0;
sunFlat.position.z = -2;
sunFlat.position.y = 1.2;
scene.add(sunFlat);

const NUM_STARS = 100;

for (let i = 0; i < NUM_STARS; i++) {
  const star = new THREE.Mesh(starGeometry, starMaterial);

  star.position.x = 0 + (Math.random() - 0.5) * 40;
  star.position.y = 5 + (Math.random() - 0.5) * 15;
  star.position.z = -10 + (Math.random() - 1.0) * 10;

  star.rotation.z = Math.random() * Math.PI;

  let scl = 0.05 * Math.random() + 0.95;
  scl = Math.pow(scl, 3);
  // scl *= 10;
  star.scale.x = scl;
  star.scale.y = scl;
  star.scale.z = scl;

  scene.add(star);
}

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
camera.position.set(0, -0.1, 1);
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

  // Update shader material uniforms
  gridMaterial.uniforms.uTime.value = elapsedTime;
  terrainMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
