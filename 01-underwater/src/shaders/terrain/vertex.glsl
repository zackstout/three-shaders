#include ../includes/perlinClassic3D.glsl

varying vec2 vUv;

uniform float uTime;

void main()
{
    vec3 newPosition = position;

    float noiseStr = 3.0;
    float noiseResolution = 8.0;
    float zSlice = 1.2;
    float offset = 0.0;

    float noiseVal = perlinClassic3D(vec3(newPosition.x * noiseResolution, newPosition.y * noiseResolution + offset, zSlice)) * noiseStr;

    noiseVal = clamp(noiseVal, 0.0, 0.8);

    newPosition.z += noiseVal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}