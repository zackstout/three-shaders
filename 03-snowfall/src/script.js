import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import snowfallVertexShader from "./shaders/snowfall/vertex.glsl";
import snowfallFragmentShader from "./shaders/snowfall/fragment.glsl";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

let tween = null;
let snowMaterial = null;

// Canvas
const canvas = document.querySelector("canvas.webgl");

// let snowfallPosition = new THREE.Vector3(0, 0, 0);

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("rgb(10,0,50)");

const createSnowfall = ({ count, position, size, color }) => {
  // Geometry
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const position = new THREE.Vector3(
      Math.random(),
      Math.random(),
      Math.random()
    );

    // Instead of just using math.random, we can put them on a sphere
    positionsArray[i3] = position.x;
    positionsArray[i3 + 1] = position.y;
    positionsArray[i3 + 2] = position.z;

    sizesArray[i] = Math.random();
    timeMultipliersArray[i] = Math.random() + 1;
  }

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

  // Material
  // texture.flipY = false;

  snowMaterial = new THREE.ShaderMaterial({
    vertexShader: snowfallVertexShader,
    fragmentShader: snowfallFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      // uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
      uTime: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  function destroy() {
    console.log("destroy");
    scene.remove(snowfall);
    geometry.dispose();
    snowMaterial.dispose();
  }

  // Animate
  // tween = gsap.to(snowMaterial.uniforms.uProgress, {
  //   value: 1,
  //   duration: 10,
  //   ease: "linear",
  //   onComplete: destroy,
  // });
  // tween.destroy = destroy;

  // Points
  const snowfall = new THREE.Points(geometry, snowMaterial);
  // Ahhhhh this is where we use it!!! aha!
  snowfall.position.copy(position);
  scene.add(snowfall);
  // console.log("Adding snowfall", snowfall);
};

// ============================================================
// Geometries
const gridGeometry = new THREE.PlaneGeometry(2, 2);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: gridVertexShader,
  fragmentShader: gridFragmentShader,
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

// window.addEventListener("click", () => {
//   if (tween) {
//     tween.kill();
//     tween.destroy();
//   }
//   generateSnowfall();
// });

generateSnowfall();

// Should larger ones be faster or slower? Or just random?
function generateSnowfall() {
  createSnowfall({
    count: 5000,
    size: 2.0,
    // radius: 0.5,
    color: "rgb(255,255,255)",
    position: new THREE.Vector3(-1, 0, -1),
  });
}

// gui
//   .add(snowfallPosition, "z")
//   .min(-50)
//   .max(50)
//   .step(1)
//   .onFinishChange(generateSnowfall);

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

  snowMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
