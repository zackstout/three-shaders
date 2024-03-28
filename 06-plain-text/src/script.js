import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "../../05-shapes-bloom/src/shaders/box/vertex.glsl";
import gridFragmentShader from "../../05-shapes-bloom/src/shaders/box/fragment.glsl";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

let textGeometry = null;

// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: gridVertexShader,
  fragmentShader: gridFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

const loader = new FontLoader();
const font = loader.load(
  // resource URL
  "../assets/helvetiker_bold.typeface.json",

  // onLoad callback
  function (font) {
    // do something with the font
    console.log(font);
    textGeometry = new TextGeometry("Hello world!", {
      font: font,
      size: 0.7,
      height: 0.2,
      curveSegments: 4,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.015,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    // Ahhhh interesting. It has normal and position, but NOT uv, on the geoemetry's attributes.
    const convex = new ConvexGeometry(
      [
        [0, 0, 0],
        [0, 0, 1],
        [1, 0, 0],
      ].map((a) => new THREE.Vector3(...a))
    );

    // Ahhhh nice, Basic material not affected by lights! Need Phong
    const textMaterial = new THREE.MeshPhongMaterial({
      color: "rgb(200, 10, 80)",
    });
    const text = new THREE.Mesh(textGeometry, textMaterial);

    // Hmm.. doesn't seem to work...
    text.castShadow = true;
    // text.receiveShadow = true;
    // console.log(text, textGeometry, convex);

    // What about text wrap?
    text.position.z = -3;
    // How do we find width of text, to center it??
    text.position.x = -2.6;
    scene.add(text);
  },

  // onProgress callback
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },

  // onError callback
  function (err) {
    console.log("An error happened");
  }
);

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
const gridGeometry = new THREE.PlaneGeometry(2, 2);

// ============================================================

// ============================================================
// Meshes
const boxMaterial = new THREE.MeshPhongMaterial({ color: "green" });
const boxGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const box = new THREE.Mesh(boxGeom, boxMaterial);
box.position.z = -1;
box.position.y = -1;
// box.receiveShadow = true;
// box.castShadow = true;
scene.add(box);

const backMaterial = new THREE.MeshPhongMaterial({ color: "rgb(10,200,240)" });
const grid = new THREE.Mesh(gridGeometry, gridMaterial);
const backGrid = new THREE.Mesh(gridGeometry, backMaterial);
backGrid.position.z = -4;
backGrid.scale.set(5, 1.5, 1.5);
backGrid.receiveShadow = true;

// grid.rotation.x = -Math.PI / 2;
// scene.add(grid);
scene.add(backGrid);

const light = new THREE.PointLight(0xffffff, 10, 100);
light.position.set(0, 1, -1);
scene.add(light);

// const l = new THREE.DirectionalLight(0xffffff, 1);

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
camera.position.set(0, 0, 1);
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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
