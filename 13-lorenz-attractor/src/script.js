import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";

/**
 * Base
 */
// Debug
let gui;

// Canvas
const canvas = document.querySelector("canvas.webgl");

const PARTICLE_SIZE = 5;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(10,0,50)"); // Oh my that does look better!

// ============================================================
// Geometries
let particles;
let geometry;
let previousParticles;
let particlesMaterial;

const params = {
  sigma: 8,
  rho: 28,
  beta: 8 / 3,
  numberParticles: 500,
  timeStep: 0.01,
  particleSize: 0.5,
  particleSizeRandom: 0,
  rotationSpeed: 0.01,
  timeMultiplierScale: 2,
  timeMultiplierOffset: 0.5,
  timeMultiplierFreq: 3,
  timeMultiplierAmp: 1,
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

/**
 * Idea: Each particle will be associated with a point along the total path of the lorenz attractor.
 */
// const NUM_PARTICLES = 500;
const makeParticles = () => {
  const count = params.numberParticles;
  // Geometry
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);

  if (previousParticles) {
    scene.remove(previousParticles);
  }

  let lorPos = { x: 1, y: 0, z: 0 };

  // const dt = NUM_PARTICLES / 100_000;

  // whooooa going to 0.001 is kinda nuts.
  const dt = params.timeStep;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const dx = params.sigma * (lorPos.y - lorPos.x);
    const dy = lorPos.x * (params.rho - lorPos.z) - lorPos.y;
    const dz = lorPos.x * lorPos.y - params.beta * lorPos.z;
    lorPos.x += dx * dt;
    lorPos.y += dy * dt;
    lorPos.z += dz * dt;

    // Instead of just using math.random, we can put them on a sphere
    positionsArray[i3] = lorPos.x * 0.1;
    positionsArray[i3 + 1] = lorPos.y * 0.1;
    positionsArray[i3 + 2] = lorPos.z * 0.1;

    // sizesArray[i] = Math.random();
    // Yeah I think I kind of prefer it with uniform sizes..
    sizesArray[i] =
      params.particleSize + Math.random() * params.particleSizeRandom;
    // Allow us to animate based on how far along the curve this point is:
    timeMultipliersArray[i] = i / count;
  }

  // Recreate every time in this fn so that it gets the new values of params
  particlesMaterial = new THREE.ShaderMaterial({
    vertexShader: gridVertexShader,
    fragmentShader: gridFragmentShader,
    uniforms: {
      uTime: new THREE.Uniform(0),
      uSize: new THREE.Uniform(PARTICLE_SIZE),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTimeMultiplierScale: new THREE.Uniform(params.timeMultiplierScale),
      uTimeMultiplierOffset: new THREE.Uniform(params.timeMultiplierOffset),
      uTimeMultiplierFreq: new THREE.Uniform(params.timeMultiplierFreq),
      uTimeMultiplierAmp: new THREE.Uniform(params.timeMultiplierAmp),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  geometry = new THREE.BufferGeometry();
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

  // LOL! This is the problem, we were keeping this as THREE.Mesh rather than THREE.Points, oops -- interesting effect!
  particles = new THREE.Points(geometry, particlesMaterial);
  particles.rotation.y = -Math.PI / 2;

  // Wow you know.... it doesn't really affect performance too much if you don't remove... and kind of cool effect lol

  previousParticles = particles;

  particles.position.copy(new THREE.Vector3(0, 0, -1.5));
  scene.add(particles);
};

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

makeParticles();

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

// TODO: this is wrong... adds a bunch of them... should be another way to manually set the values... like just empty it, and add stuff again.
const makeGui = () => {
  gui = new GUI({ width: 340 });

  /**
   * GUI
   */
  gui
    .add(params, "numberParticles")
    .min(100)
    .max(20_000)
    .step(50)
    .onChange(makeParticles);
  gui
    .add(params, "timeStep")
    .min(0)
    .max(0.0314)
    .step(0.0001)
    .onChange(makeParticles);
  gui
    .add(params, "particleSize")
    .min(0)
    .max(2)
    .step(0.01)
    .onChange(makeParticles);
  gui
    .add(params, "particleSizeRandom")
    .min(0)
    .max(0.5)
    .step(0.01)
    .onChange(makeParticles);

  gui
    .add(params, "rotationSpeed")
    .min(0)
    .max(0.1)
    .step(0.001)
    .onChange(makeParticles);
  gui
    .add(params, "timeMultiplierScale")
    .min(0)
    .max(40)
    .step(0.1)
    .onChange(makeParticles);
  gui
    .add(params, "timeMultiplierOffset")
    .min(-5)
    .max(5)
    .step(0.1)
    .onChange(makeParticles);
  gui
    .add(params, "timeMultiplierFreq")
    .min(0)
    .max(20)
    .step(0.1)
    .onChange(makeParticles);
  gui
    .add(params, "timeMultiplierAmp")
    .min(0)
    .max(5)
    .step(0.1)
    .onChange(makeParticles);

  gui.add(params, "sigma").min(0).max(20).step(0.1).onChange(makeParticles);
  gui.add(params, "rho").min(0).max(30).step(0.1).onChange(makeParticles);
  gui.add(params, "beta").min(0).max(10).step(0.1).onChange(makeParticles);
};

makeGui();

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  particlesMaterial.uniforms.uTime.value = elapsedTime;

  if (particles) {
    particles.rotation.x += params.rotationSpeed;
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

window.onload = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  container.style.position = "absolute";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "50%";

  const configs = [
    {
      sigma: 8,
      rho: 28,
      beta: 2.6666666666666665,
      numberParticles: 15000,
      timeStep: 0.0025,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0.01,
      timeMultiplierScale: 2,
      timeMultiplierOffset: 0.5,
      timeMultiplierFreq: 3,
      timeMultiplierAmp: 1,
    },
    {
      sigma: 3,
      rho: 28,
      beta: 2.6666666666666665,
      numberParticles: 2600,
      timeStep: 0.0004,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0.098,
      timeMultiplierScale: 2,
      timeMultiplierOffset: 0.5,
      timeMultiplierFreq: 3,
      timeMultiplierAmp: 1,
    },
    { ...params, sigma: 3, numberParticles: 2600, timeStep: 0.0004 },
    {
      ...params,
      numberParticles: 3800,
      timeStep: 0.002,
      particleSize: 0.58,
      particleSizeRandom: 0.12,
      rotationSpeed: 0.01,
      timeMultiplierScale: 8.3,
      timeMultiplierOffset: -0.9,
      timeMultiplierFreq: 5.7,
      timeMultiplierAmp: 1.3,
      sigma: 9.7,
      rho: 20.1,
      beta: 4.1,
    },
    {
      ...params,
      numberParticles: 3800,
      timeStep: 0.0016,
      particleSize: 0.58,
      particleSizeRandom: 0.12,
      rotationSpeed: 0.01,
      timeMultiplierScale: 8.3,
      timeMultiplierOffset: 0,
      timeMultiplierFreq: 10,
      timeMultiplierAmp: 1.3,
      sigma: 9.7,
      rho: 20.1,
      beta: 4.1,
    },
    {
      ...params,
      numberParticles: 3800,
      timeStep: 0.016,
      particleSize: 0.58,
      particleSizeRandom: 0.12,
      rotationSpeed: 0.01,
      timeMultiplierScale: 8.3,
      timeMultiplierOffset: 0,
      timeMultiplierFreq: 10,
      timeMultiplierAmp: 1.3,
      sigma: 9.7,
      rho: 20.1,
      beta: 4.1,
    },
    {
      ...params,
      sigma: 6.3,
      numberParticles: 1700,
      timeStep: 0.001,
      timeMultiplierScale: 5.4,
      timeMultiplierOffset: 1.1,
      timeMultiplierFreq: 6.9,
      timeMultiplierAmp: 3.2,
    },
    {
      ...params,
      sigma: 6.3,
      numberParticles: 1700,
      timeStep: 0.001,
      timeMultiplierScale: 38,
      timeMultiplierOffset: 1.1,
      timeMultiplierFreq: 6.9,
      timeMultiplierAmp: 3.2,
    },
    {
      ...params,
      sigma: 6.3,
      numberParticles: 1700,
      timeStep: 0.001,
      timeMultiplierScale: 12.5,
      timeMultiplierOffset: -0.9,
      timeMultiplierFreq: 6.9,
      timeMultiplierAmp: 3.2,
    },
    {
      ...params,
      sigma: 2.9,
      numberParticles: 7100,
      timeStep: 0.004,
      timeMultiplierScale: 11.2,
      timeMultiplierOffset: -0.4,
      timeMultiplierFreq: 10.6,
      timeMultiplierAmp: 2,
    },
    {
      ...params,
      numberParticles: 3800,
      timeStep: 0.0009, // It is different from 0.001!
      particleSize: 0.58,
      particleSizeRandom: 0.08,
      rotationSpeed: 0.05,
      timeMultiplierScale: 8.3,
      timeMultiplierOffset: -0.9,
      timeMultiplierFreq: 5.7,
      timeMultiplierAmp: 1.3,
      sigma: 9.7,
      rho: 20.1,
      beta: 1.8,
    },
    {
      ...params,
      numberParticles: 3800,
      timeStep: 0.002,
      particleSize: 0.58,
      particleSizeRandom: 0.12,
      rotationSpeed: 0.001,
      timeMultiplierScale: 8.3,
      timeMultiplierOffset: -0.9,
      timeMultiplierFreq: 2.3,
      timeMultiplierAmp: 2,
      sigma: 9.7,
      rho: 25.7,
      beta: 5.4,
    },
    {
      ...params,
      numberParticles: 7100,
      timeStep: 0.004,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0.01,
      timeMultiplierScale: 20,
      timeMultiplierOffset: 1,
      timeMultiplierFreq: 20,
      timeMultiplierAmp: 1.5,
      sigma: 2.9,
      rho: 28,
      beta: 8 / 3,
    },
    {
      ...params,
      numberParticles: 7100,
      timeStep: 0.004,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0.01,
      timeMultiplierScale: 20,
      timeMultiplierOffset: 1,
      timeMultiplierFreq: 20,
      timeMultiplierAmp: 1.5,
      sigma: 2.9,
      rho: 28,
      beta: 1.6,
    },
    {
      ...params,
      numberParticles: 3150,
      timeStep: 0.0082,
      particleSize: 1.09,
      particleSizeRandom: 0.3,
      rotationSpeed: 0.02,
      timeMultiplierScale: 24.6,
      timeMultiplierOffset: 0,
      timeMultiplierFreq: 10,
      timeMultiplierAmp: 0.5,
      sigma: 8.6,
      rho: 27.5,
      beta: 2.7,
    },
    {
      ...params,

      sigma: 8.1,
      rho: 21.5,
      beta: 0.5,
      numberParticles: 2600,
      timeStep: 0.0004,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0.01,
      timeMultiplierScale: 36.7,
      timeMultiplierOffset: 1.2,
      timeMultiplierFreq: 3,
      timeMultiplierAmp: 0.5,
    },
    {
      sigma: 8,
      rho: 28,
      beta: 2.6666666666666665,
      numberParticles: 20000,
      timeStep: 0.0032,
      particleSize: 0.12,
      particleSizeRandom: 0,
      rotationSpeed: 0,
      timeMultiplierScale: 2,
      timeMultiplierOffset: 0.5,
      timeMultiplierFreq: 3,
      timeMultiplierAmp: 1,
    },
    {
      sigma: 8,
      rho: 28,
      beta: 2.6666666666666665,
      numberParticles: 20000,
      timeStep: 0.0023,
      particleSize: 0.12,
      particleSizeRandom: 0.04,
      rotationSpeed: 0,
      timeMultiplierScale: 22.5,
      timeMultiplierOffset: -1,
      timeMultiplierFreq: 5.4,
      timeMultiplierAmp: 3.6,
    },
    {
      sigma: 6.6,
      rho: 20.1,
      beta: 4.1,
      numberParticles: 18500,
      timeStep: 0.0084,
      particleSize: 0.15,
      particleSizeRandom: 0.12,
      rotationSpeed: 0.01,
      timeMultiplierScale: 13.5,
      timeMultiplierOffset: 0.2,
      timeMultiplierFreq: 8.6,
      timeMultiplierAmp: 0.6,
    },
    {
      sigma: 9.4,
      rho: 11.5,
      beta: 4.8,
      numberParticles: 3050,
      timeStep: 0.0025,
      particleSize: 0.12,
      particleSizeRandom: 0.2,
      rotationSpeed: 0.029,
      timeMultiplierScale: 33.9,
      timeMultiplierOffset: -0.1,
      timeMultiplierFreq: 8.1,
      timeMultiplierAmp: 1.1,
    },
    {
      sigma: 13.2,
      rho: 19.2,
      beta: 4.8,
      numberParticles: 3050,
      timeStep: 0.0047,
      particleSize: 0.41,
      particleSizeRandom: 0.31,
      rotationSpeed: 0.007,
      timeMultiplierScale: 40,
      timeMultiplierOffset: -0.5,
      timeMultiplierFreq: 8.1,
      timeMultiplierAmp: 1,
    },
    {
      sigma: 9.4,
      rho: 23.6,
      beta: 10,
      numberParticles: 6500,
      timeStep: 0.0145,
      particleSize: 0.5,
      particleSizeRandom: 0,
      rotationSpeed: 0,
      timeMultiplierScale: 37.3,
      timeMultiplierOffset: 1,
      timeMultiplierFreq: 2.3,
      timeMultiplierAmp: 0.5,
    },
    {
      sigma: 3.3,
      rho: 21,
      beta: 4.8,
      numberParticles: 5250,
      timeStep: 0.004,
      particleSize: 1.46,
      particleSizeRandom: 0,
      rotationSpeed: 0,
      timeMultiplierScale: 37.3,
      timeMultiplierOffset: 1,
      timeMultiplierFreq: 2.3,
      timeMultiplierAmp: 0.5,
    },
    {
      sigma: 3.3,
      rho: 21,
      beta: 2.5,
      numberParticles: 3250,
      timeStep: 0.0035,
      particleSize: 0.37,
      particleSizeRandom: 0,
      rotationSpeed: 0,
      timeMultiplierScale: 37.3,
      timeMultiplierOffset: 1,
      timeMultiplierFreq: 2.3,
      timeMultiplierAmp: 0.8,
    },
    {
      sigma: 4.6,
      rho: 24.7,
      beta: 4.8,
      numberParticles: 7450,
      timeStep: 0.016,
      particleSize: 0.58,
      particleSizeRandom: 0.12,
      rotationSpeed: 0,
      timeMultiplierScale: 9.5,
      timeMultiplierOffset: 0.1,
      timeMultiplierFreq: 6.3,
      timeMultiplierAmp: 0.6,
    },
  ];

  configs.forEach((config, idx) => {
    const btn = document.createElement("button");
    btn.innerText = `Preset ${idx + 1}`;
    btn.style.margin = "5px";
    btn.style.padding = "5px";

    container.appendChild(btn);
    btn.addEventListener("click", () => {
      Object.keys(config).forEach((key) => {
        params[key] = config[key];
      });
      makeParticles();
      makeGui();
    });
  });

  const btn = document.createElement("button");
  btn.innerText = "Copy Params";
  btn.style.margin = "5px";
  btn.style.padding = "5px";
  btn.addEventListener("click", () => {
    navigator?.clipboard?.writeText(JSON.stringify(params, null, 2));
  });
  container.appendChild(btn);
};

/**
 *
 * FOR HERE THERE IS NO PLACE THAT DOES NOT SEE YOU.
 *
 * YOU MUST CHANGE YOUR LIFE.
 *
 */
