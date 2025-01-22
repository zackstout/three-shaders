varying vec2 vUv;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;
uniform float uTime;

#include ../includes/simplexNoise3d.glsl;

void main()
{
    vec3 pos = position;

    pos.z += 0.13 * snoise(vec3(aCoordinates.xy * .03, uTime * 0.3));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = 15. * (1. / -mvPosition.z);

    vUv = uv;
    vCoordinates = aCoordinates.xy;
}