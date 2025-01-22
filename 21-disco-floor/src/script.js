import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gridVertexShader from "./shaders/grid/vertex.glsl";
import gridFragmentShader from "./shaders/grid/fragment.glsl";
import ballVertexShader from "./shaders/ball/vertex.glsl";
import ballFragmentShader from "./shaders/ball/fragment.glsl";
import ballOuterVertexShader from "./shaders/ballOuter/vertex.glsl";
import ballOuterFragmentShader from "./shaders/ballOuter/fragment.glsl";
import starVertexShader from "./shaders/star/vertex.glsl";
import starFragmentShader from "./shaders/star/fragment.glsl";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing//UnrealBloomPass.js";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader.js";

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
const planeWidth = 8;
const planeHeight = 2;

const gridGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

const ballGeometry = new THREE.IcosahedronGeometry(0.2, 7);
const ballGeometry2 = new THREE.IcosahedronGeometry(0.215, 7);

const starGeometry = new THREE.PlaneGeometry(0.5, 0.5);

// const ballGeometry = new THREE.SphereGeometry(0.1, 8, 8);

// ============================================================
// Materials
// const gridMaterial = new THREE.MeshBasicMaterial()
const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: gridVertexShader,
  fragmentShader: gridFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uAspect: new THREE.Uniform(planeWidth / planeHeight),
  },
  transparent: true,
});

const ballMaterial = new THREE.ShaderMaterial({
  vertexShader: ballVertexShader,
  fragmentShader: ballFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
});

const ballMaterial2 = new THREE.ShaderMaterial({
  vertexShader: ballOuterVertexShader,
  fragmentShader: ballOuterFragmentShader,
  side: THREE.BackSide,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
});

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

// ============================================================
// Meshes
const grid = new THREE.Mesh(gridGeometry, gridMaterial);
grid.rotation.x = -Math.PI / 2;
scene.add(grid);

const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.y = 0.6;
scene.add(ball);

const ball2 = new THREE.Mesh(ballGeometry2, ballMaterial2);
ball2.position.y = 0.6;
scene.add(ball2);

const NUM_STARS = 250;

// Hmm... all stars share exact same material... not sure how to pass attributes in..
for (let i = 0; i < NUM_STARS; i++) {
  const star = new THREE.Mesh(starGeometry, starMaterial);

  star.position.x = 0 + (Math.random() - 0.5) * 40;
  star.position.y = -5 + (Math.random() - 0.5) * 30;
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
camera.position.set(0, 0.4, 1);
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
 * Post processing
 */
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(sizes.width, sizes.height);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// Failed to load resource: the server responded with a status of 504 (Outdated Optimize Dep)
// const glitchPass = new GlitchPass();
// effectComposer.addPass(glitchPass);

const CopyShader = {
  name: "CopyShader",

  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

      float shift = 0.008;

			vec4 texel = texture2D( tDiffuse, vUv );
      vec4 texel2 = texture2D( tDiffuse, vUv + vec2(0, shift));
			vec4 texel3 = texture2D( tDiffuse, vUv + vec2(shift, 0));
			// vec4 texel4 = texture2D( tDiffuse, vUv + vec2(shift, shift));

      // texel = texel + texel2 + texel3;

      texel.r += texel2.r * .8;
      texel.b += texel3.b * .8;
      // texel.g += texel4.g;

			gl_FragColor = opacity * texel;

		}`,
};

// Nice, this works! Both RGB and custom.
// const rgbShiftPass = new ShaderPass(RGBShiftShader);
const rgbShiftPass = new ShaderPass(CopyShader);
effectComposer.addPass(rgbShiftPass);
// effectComposer.addPass(new ShaderPass(RGBShiftShader));

// Kind of works... too bright and expensive it seems though
// const bloomPass = new UnrealBloomPass();
// effectComposer.addPass(bloomPass);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update material
  gridMaterial.uniforms.uTime.value = elapsedTime;
  ballMaterial.uniforms.uTime.value = elapsedTime;
  ballMaterial2.uniforms.uTime.value = elapsedTime;
  starMaterial.uniforms.uTime.value = elapsedTime;

  ball.rotation.y += 0.004;

  // Update controls
  controls.update();

  // Render
  // renderer.render(scene, camera);
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

// TODO: Stars eveyrwhere
// TODO: Bloom post processing somehow
// TODO: a glow with backside sphere around the disco ball
