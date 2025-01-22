varying vec2 vUv;

#include ../includes/simplexNoise3d.glsl;

uniform float uTime;
varying float vHeight;

void main()
{

    vec3 pos = position;

    float numCells = 15.;

    vec2 coord = floor(uv * numCells);

    // float noise = .5 * snoise(vec3(coord.x, coord.y, uTime * 1.8) * .1);
    float speed = 5.;
    float noise = .2 * sin(coord.x * .5 + uTime * 1. * speed) * sin(coord.y * .6 + uTime * .2 * speed);

    // noise = pow(noise, 3.);
    // noise *= 8.;
    noise = clamp(noise, -.3, 1.);

    pos.z += noise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
    vHeight = pos.z;
}