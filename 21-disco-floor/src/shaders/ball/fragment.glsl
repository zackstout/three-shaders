varying vec2 vUv;
varying vec3 vEyeVector;
varying vec3 vNormal;

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

    vec3 x = dFdx(vNormal);
    vec3 y = dFdy(vNormal);
    vec3 normal = normalize(cross(x, y));


    float diffuse = dot(normal, vec3(1.));

    vec2 rand = random2d(vec2(floor(diffuse * 20. + uTime * 4.)));

    normal += vec3(rand, 0.);

    // float n = snoise(vec3(vUv * .2, uTime * .1)) * .5 + .5;

    float n2 = refract(vEyeVector, normal, .05).y;

    n2 = mix(n2, 1., .4);


    gl_FragColor = vec4(.05, .1, .4, n2);
}