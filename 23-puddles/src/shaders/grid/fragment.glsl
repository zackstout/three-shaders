varying vec2 vUv;
varying vec3 vEye;
varying vec3 vNormal;

uniform float uTime;
uniform sampler2D uTexture;

#include ../includes/simplexNoise3d.glsl;
#include ../includes/directionalLight.glsl;

float noise(vec2 uv) {
    float n = 0.;

    n += snoise(vec3(uv, 0. + uTime * .01));

    uv *= 2.;
    n += .8 * snoise(vec3(uv, .2));

    uv *= 2.;
    n += .6 * snoise(vec3(uv, .4));

    return n;
}

void main()
{
    vec2 uv = vUv;
    uv.y += uTime * .05;
    uv = fract(uv * 1.);

    // Whoa, weird way of accidentally folding space
    // uv = sin(uv * 3.1415);

    float n = noise(uv * 3.);
    n = step(.2, n);

    vec3 bgColor = vec3(.6, .2, .2);

    bgColor.b = 0.;
    float bgn = snoise(vec3(uv * 4., 0.));
    // float bgn = noise(uv * 4.);
    bgColor.r = mix(.5, .7, bgn);
    bgColor.g = mix(.2, .4, bgn);


    
    uv.x += .003 * sin(uTime * 6. + cos(uv.y * 10.));
    uv.y += .001 * sin(uTime * 6. + cos(uv.y * 10.));

    vec3 light = directionalLight(vec3(1.), 1.5 + .3 * sin(uTime * .1), vNormal, vec3(1., 1., 1.), vEye, 2.);


    vec3 puddleColor = texture2D(uTexture, uv).rgb;

    puddleColor *= light;

    vec3 color = mix(bgColor, puddleColor, n);

    gl_FragColor = vec4(color, 1.);
}