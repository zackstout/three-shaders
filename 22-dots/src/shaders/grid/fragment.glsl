varying vec2 vUv;
varying vec3 vNormal;
uniform float uTime;

#include ../includes/simplexNoise3d.glsl;
#include ../includes/directionalLight.glsl;

#define RANDOM_SCALE vec4(.1031, .1030, .0973, .1099)


float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

// vec3 bgColor = vec3(30./255., 140./255., 95./255.);
vec3 bgColor = vec3(30./255., 40./255., 105./255.);
vec3 color = vec3(.65, .88, .98);

void main()
{
    float numCircles = 20.;
    vec2 uv = vUv;
    uv *= numCircles;
    // Account for aspect ratio of plane, which is 2:1
    uv.y *= .5; 

    // Make all circles move downwards
    uv.y += uTime * .3;

    // Copy this here so we can refer to it when computing noise
    vec2 uv2 = uv;

    // Repeat the circle
    uv = fract(uv);
    

    float d = distance(uv, vec2(.5));

    // Huh... strange pixellated effect...
    // float n = snoise(vec3(floor(uv * numCircles), uTime));

    // float n = snoise(vec3(floor(uv2) * 3., 2.)) * 1.5;

    float n = random(floor(uv2) * 1.);

    // An interesting thought, copilot!
    // if (n < .25) {
    //     d = 1.;
    // } else if (n < .5) {
    //     d = 1. - (n - .25) * 4.;
    // } else if (n < .75) {
    //     d = (n - .5) * 4.;
    // } else {
    //     d = 0.;
    // }


// Oh wait, it would be much easier to just rotate LOL

    if (n < .2) {
        if (uv.x < .5){
            d = 1.;
        }
    } else if (n < .4) {
        if (uv.x > .5){
            d = 1.;
        }
    } else if (n < .6) {
        if (uv.y < .5){
            d = 1.;
        }
    } else if (n < .8) {
        if (uv.y > .5){
            d = 1.;
        }
    } else {
        d = 1.;
    }
    

    // vec3 lColor = vec3(1.);
    // vec3 lightColor = directionalLight(lColor, 1., vNormal, vec3(1., 1., 1.));

 
    float alpha = .5 + .2 * sin(uTime * 1. * n * 3. + n * 45.);
    // alpha = clamp(alpha, .5,1.);

    vec3 c = mix(color, bgColor, step(.5, d));

    // c *= lightColor;

    gl_FragColor = vec4(c, alpha);
}