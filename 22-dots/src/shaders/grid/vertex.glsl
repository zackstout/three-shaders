varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

void main()
{

    vec3 pos = position;

    // pos.z += sin(pos.x * 1. + uTime) * .2;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
    vNormal= normal;
}