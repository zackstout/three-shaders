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
// scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries
// const gridGeometry = new THREE.PlaneGeometry(2, 2);
let gridMaterial;
let grid;

const params = {
  sigma: 8,
  rho: 28,
  beta: 8 / 3,
};

/**
 * Idea: Each particle will be associated with a point along the total path of the lorenz attractor.
 */
const NUM_PARTICLES = 500;
const makeParticles = () => {
  const count = NUM_PARTICLES;
  // Geometry
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);

  let lorPos = { x: 1, y: 0, z: 0 };

  // let max = 0;

  // const dt = NUM_PARTICLES / 100_000;

  // whooooa going to 0.001 is kinda nuts.
  const dt = 0.01;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const dx = params.sigma * (lorPos.y - lorPos.x);
    const dy = lorPos.x * (params.rho - lorPos.z) - lorPos.y;
    const dz = lorPos.x * lorPos.y - params.beta * lorPos.z;
    lorPos.x += dx * dt;
    lorPos.y += dy * dt;
    lorPos.z += dz * dt;

    // if (lorPos.x > max) max = lorPos.x;
    // if (lorPos.y > max) max = lorPos.y;
    // if (lorPos.z > max) max = lorPos.z;

    // const position = new THREE.Vector3(
    //   Math.random(),
    //   Math.random(),
    //   Math.random()
    // );
    // const position = new THREE.Vector3(lorPos.x, lorPos.y, lorPos.z);

    // Instead of just using math.random, we can put them on a sphere
    positionsArray[i3] = lorPos.x * 0.1;
    positionsArray[i3 + 1] = lorPos.y * 0.1;
    positionsArray[i3 + 2] = lorPos.z * 0.1;

    // sizesArray[i] = Math.random();
    // Yeah I think I kind of prefer it with uniform sizes..
    sizesArray[i] = 0.5;
    // Allow us to animate based on how far along the curve this point is:
    timeMultipliersArray[i] = i / count;
  }

  // console.log("Max...", max);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positionsArray, 3)
  );
  geometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(sizesArray, 1)
  );
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.Float32BufferAttribute(timeMultipliersArray, 1)
  );

  const PARTICLE_SIZE = 5;

  // const gridMaterial = new THREE.MeshBasicMaterial()
  gridMaterial = new THREE.ShaderMaterial({
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uSize: new THREE.Uniform(PARTICLE_SIZE),
      uResolution: new THREE.Uniform(sizes.resolution),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // LOL! This is the problem, we were keeping this as THREE.Mesh rather than THREE.Points, oops -- interesting effect!
  grid = new THREE.Points(geometry, gridMaterial);
  grid.rotation.y = -Math.PI / 2;

  grid.position.copy(new THREE.Vector3(0, 0, -1.5));
  scene.add(grid);
};

// ============================================================
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
sizes.resolution = new THREE.Vector2(
  sizes.width * sizes.pixelRatio,
  sizes.height * sizes.pixelRatio
);

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.resolution.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

makeParticles(1000);

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
camera.position.set(0, 0, -2.8);
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

  if (grid) {
    grid.rotation.x += 0.01;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
