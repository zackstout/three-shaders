varying vec2 vUv;
varying vec3 vEyeVector;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform float uAspect;

#include ../includes/simplexNoise3d.glsl;

#define RANDOM_SCALE vec4(443.897, 441.423, .0973, .1099)

vec2 random2d(vec2 p) {
    vec3 p3 = fract(p.xyx * RANDOM_SCALE.xyz);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx + p3.yz) * p3.zy);
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main()
{
    vec2 uv = vUv;


    // vec3 color = hsv2rgb(vec3(n2, 1., 1.));

    // vec3 color = vec3(.05, .1, .4);

    // // float d = distance(vUv, vec2(.5));
    // float d = 4. * abs(vPosition.z);
    // // d *= d;
    // color = mix(color, vec3(1.), 1.-d);

    // gl_FragColor = vec4(color, 1. - d);


    float edgeAlpha = dot(vEyeVector, vNormal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    gl_FragColor = vec4(1., 1., 1., edgeAlpha);

}