varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;
varying vec3 vPosition;

uniform float uTime;

#include ../includes/simplexNoise3d.glsl;

void main()
{

    vec3 pos = position;

    // float noiseFreq = 3.;

    // float noise = 0.;
    // noise += 0.7 * snoise(vec3(pos.x * noiseFreq, pos.y * noiseFreq, uTime * 1.));

    // pos.z += noise;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vEyeVector = normalize((modelViewMatrix * vec4(pos, 1.0)).xyz - cameraPosition);
    vNormal= normal;
    vPosition = pos;
    vUv = uv;
}