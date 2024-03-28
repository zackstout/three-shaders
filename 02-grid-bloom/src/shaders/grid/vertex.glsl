varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

#include ../../../../000-base/src/shaders/includes/perlinClassic3D.glsl

// Huh, I can't figure out how to make uTime relevant here, to make the "mountains" move...

void main()
{
    vec3 newPosition = position;

    float resolution = 0.5;
    float amplitude = 2.0;

    float noise = perlinClassic3D(vec3(position.xy * resolution , 1.0)) * amplitude;

    newPosition.z += noise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
    vNormal = normal;
}