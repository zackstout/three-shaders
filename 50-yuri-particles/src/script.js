import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";
import eel from "./assets/eel.jpeg";
import manta from "./assets/manta.png";

/**
 * Base
 */
// Debug
// const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
let geometry = null;
let material = null;
let mesh = null;
// scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries
// const gridGeometry = new THREE.PlaneGeometry(2, 2);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
// const gridMaterial = new THREE.ShaderMaterial({
//   vertexShader: gridVertexShader,
//   fragmentShader: gridFragmentShader,
//   uniforms: {
//     uTime: new THREE.Uniform(0),
//   },
// });

// ============================================================
// Meshes
// const grid = new THREE.Mesh(gridGeometry, gridMaterial);
// grid.rotation.x = -Math.PI / 2;
// scene.add(grid);

const eelTexture = new THREE.TextureLoader().load(manta);

const imageSize = 256;

function addMesh() {
  // Ah nice, easy to create many particles with 3rd and 4th params here
  // geometry = new THREE.PlaneGeometry(2, 2, 10, 10);

  geometry = new THREE.BufferGeometry();
  const count = imageSize;
  const positions = new THREE.BufferAttribute(
    new Float32Array(count * count * 3),
    3
  );
  const coordinates = new THREE.BufferAttribute(
    new Float32Array(count * count * 3),
    3
  );
  let index = 0;
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      // const index = i * count * 3 + j * 3;
      // positions[index + 0] = (i / count) * 2 - 1;
      // positions[index + 1] = 0;
      // positions[index + 2] = (j / count) * 2 - 1;

      positions.setXYZ(index, 2 * (i / count) - 1, 2 * (j / count) - 1, 0);
      coordinates.setXYZ(index, i, j, 0);
      index++;
    }
  }
  geometry.setAttribute("position", positions);
  geometry.setAttribute("aCoordinates", coordinates);

  // console.log(positions);

  // material = new THREE.MeshNormalMaterial();
  material = new THREE.ShaderMaterial({
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uTexture: new THREE.Uniform(eelTexture),
      uSize: new THREE.Uniform(imageSize),
    },
  });
  material.side = THREE.DoubleSide;
  // mesh = new THREE.Mesh(geometry, material);
  mesh = new THREE.Points(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);
}

addMesh();

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

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // mesh.rotation.x += 0.01;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
