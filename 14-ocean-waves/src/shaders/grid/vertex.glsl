varying vec2 vUv;
uniform float uTime;

#include ../includes/simplexNoise3d.glsl;
// #include ../includes/perlinClassic3d.glsl;

void main()
{
    vec3 pos = position;
    // pos *= 0.1;

    // float noise = snoise(pos * 20.);
    float noise = snoise(vec3(pos.x * 2., pos.y * 2., 0. + uTime * .1));

    for (int i=2; i < 5; i++){
        noise += snoise(vec3(pos.x * 2. , pos.y * 2. , float(i) + uTime * .1 * float(i))) / float(i);
    }

    // Huh i was intending to alter height, which I guess is pos.z ... but this is cool too
    pos.y += noise * .5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    vUv = uv;
}