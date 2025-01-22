varying vec2 vUv;
varying vec3 vPosition;
uniform float uTime;

#include ../includes/simplexNoise3d.glsl;

void main()
{
    vec2 uv = vUv;

    // Single light burst
    // float dist = (uv.x - 0.5) * (uv.x - 0.5) + (uv.y - 0.5) * (uv.y - 0.5);
    // float strength = 0.015 / dist;

    // 4-pointed star
    float strength = 0.15 / (distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5)));
    strength *= 0.15 / (distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5)));

    float offset = snoise(vec3(vPosition * 10.)) * 10.;

    strength *= (sin(uTime * .8 + offset) * 0.5 + 0.5);

    gl_FragColor = vec4(vec3(1.), strength);
}