import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import terrainVertexShader from "./shaders/terrain/vertex.glsl";
import terrainFragmentShader from "./shaders/terrain/fragment.glsl";

import { Sky } from "three/addons/objects/Sky.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

/**
 * Nice -- so we learn about ConvexHull from points, and LineGeometry from points.
 * And we play with l-system a bit for coral.
 *
 * Would love to wave the coral in the water/waves, and have some kind of ripply distortion effect.
 *
 */

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("rgb(10,0,50)");

// ============================================================
// Geometries

// NOTE: Changing the 3rd and 4th arguments alters how finely we draw the mesh. Can be triangular or like, wavy (with higher number).
const terrainGeometry = new THREE.PlaneGeometry(12, 12, 8, 8);

// Cube
// const vertices = [
//   { x: 0, y: 0, z: 0 },
//   { x: 2, y: 0, z: 0 },
//   { x: 0, y: 2, z: 0 },
//   { x: 2, y: 2, z: 0 },
//   { x: 0, y: 0, z: 2 },
//   { x: 2, y: 0, z: 2 },
//   { x: 0, y: 2, z: 2 },
//   { x: 2, y: 2, z: 2 },
// ];

// ============================================================

function makeStarfish(scl = 0.1) {
  const vertices = [{ x: 0, y: 1, z: 0 }];
  const otherVertices = [];
  // console.log("other verts...", otherVertices);

  // Won't work because this creates a ConvexHull.... which a starfish is not... hmm....
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const length = i % 2 === 0 ? 1 : 1;
    const x = length * Math.cos(angle);
    const z = length * Math.sin(angle);
    if (i % 2 === 0) {
      vertices.push({ x, y: 0.5, z });
      vertices.push({ x, y: 0, z });
    }
  }

  // Make arms
  for (let i = 0; i < 5; i++) {
    //   console.log("making arm...", i);
    const armVertices = [];
    for (let idx = i * 2; idx < i * 2 + 3; idx++) {
      // console.log("idx..", idx);
      const angle = (idx / 10) * Math.PI * 2;
      const length = idx % 2 === 0 ? 1 : 2;
      const height = idx % 2 === 0 ? 0.5 : 0.3;
      const x = length * Math.cos(angle);
      const z = length * Math.sin(angle);
      // console.log("Pushing onto", i, otherVertices[i].slice(0));
      armVertices.push({ x, y: height, z });
      armVertices.push({ x, y: 0, z });
    }
    otherVertices.push(armVertices);
  }

  const starfishGeometry = new ConvexGeometry(
    vertices.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z))
  );

  const starfishMesh = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const starfish = new THREE.Mesh(starfishGeometry, starfishMesh);
  starfish.scale.set(scl, scl, scl);

  const starfishArmGeometries = otherVertices.map((arm) => {
    //   console.log("Making arm", arm);
    return new ConvexGeometry(
      arm.map((pt) => new THREE.Vector3(pt.x, pt.y, pt.z))
    );
  });
  const starfishArms = starfishArmGeometries.map((geometry) => {
    const arm = new THREE.Mesh(geometry, starfishMesh);
    arm.scale.set(scl, scl, scl);
    return arm;
  });

  return { starfish, starfishArms };
}

// ============================================================

function makeFanCoral(numgenerations = 3, dampening = 0.8, scl = 1) {
  const config = {
    angle: 15,
    length: 0.5,
    numgenerations,
    dampening,
  };
  const lSystem = {
    axiom: "F",
    rules: {
      F: "F[-F][+F]",
    },
  };

  const expandSystem = (str) => {
    let newStr = "";
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (lSystem.rules[char]) {
        newStr += lSystem.rules[char];
      } else {
        newStr += char;
      }
    }
    return newStr;
  };

  const expandSystemNTimes = (str, n) => {
    let newStr = str;
    for (let i = 0; i < n; i++) {
      newStr = expandSystem(newStr);
    }
    return newStr;
  };

  const systemString = expandSystemNTimes(lSystem.axiom, config.numgenerations);

  const pos = { x: 0, y: 0 };
  let currentAngle = -Math.PI / 2;
  const stack = [];

  const configAngleRadians = (config.angle * Math.PI) / 180;

  const points = [];

  for (let i = 0; i < systemString.length; i++) {
    const char = systemString[i];
    switch (char) {
      case "F":
        const x1 = pos.x;
        const y1 = pos.y;
        // Make the rays shorter as we go deeper into the tree
        const length = config.length * Math.pow(config.dampening, stack.length);
        pos.x += length * Math.cos(currentAngle);
        pos.y += length * Math.sin(currentAngle);
        const x2 = pos.x;
        const y2 = pos.y;
        // ctx.beginPath();
        // ctx.moveTo(x1, y1);
        // ctx.lineTo(x2, y2);
        // ctx.stroke();
        points.push(new THREE.Vector3(x1, y1, 0));
        points.push(new THREE.Vector3(x2, y2, 0));

        break;
      case "+":
        currentAngle += configAngleRadians;
        break;
      case "-":
        currentAngle -= configAngleRadians;
        break;
      case "[":
        stack.push({ x: pos.x, y: pos.y, angle: currentAngle });
        break;
      case "]":
        const { x, y, angle } = stack.pop();
        pos.x = x;
        pos.y = y;
        currentAngle = angle;
        break;
      default:
        break;
    }
  }

  const coralGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const coralMesh = new THREE.LineBasicMaterial({
    color: 0xff00c1,
    linewidth: 2, // Doesn't seem to have any effect
  });
  const coral = new THREE.Line(coralGeometry, coralMesh);
  coral.scale.set(scl, scl, scl);
  return coral;
}

// ============================================================

for (let i = 0; i < 30; i++) {
  const scl = 0.05 + Math.random() * 0.05;
  const { starfish, starfishArms } = makeStarfish(scl);
  const x = Math.random() * 10 - 5;
  const z = Math.random() * 10 - 5;
  const y = -0.2;
  starfish.position.set(x, y, z);
  starfishArms.forEach((arm) => arm.position.set(x, y, z));
  scene.add(starfish);
  starfishArms.forEach((arm) => scene.add(arm));
}

for (let i = 0; i < 30; i++) {
  const x = Math.random() * 10 - 5;
  const y = -0.5;
  const z = Math.random() * 10 - 5;
  //   let numgenerations = 5;
  const ran = Math.random();
  //   if (ran > 0.6) numgenerations = 6;
  //   if (ran > 0.9) numgenerations = 8;
  const numgenerations = 6;
  let dampening = 0.8;
  if (ran > 0.5) dampening = 0.6;
  const scl = 0.8 + Math.random() * 0.2;
  const coral = makeFanCoral(numgenerations, dampening, scl);
  coral.position.set(x, y, z);
  coral.rotation.z = Math.PI;
  coral.rotation.y = Math.random() * 0.4;

  scene.add(coral);
}

// ============================================================
// Materials

// NOTE: Removing all the transparent and below props is interesting effect.
const terrainMaterial = new THREE.ShaderMaterial({
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
  },
  //   transparent: true,
  //   depthWrite: false,
  //   blending: THREE.AdditiveBlending,
  //   side: THREE.DoubleSide,
});

// ============================================================
// Meshes

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -0.255;
scene.add(terrain);

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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
