varying vec2 vUv;

uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;
uniform int uNumOctaves;
uniform float uGain;
uniform float uLacunarity;

uniform float uWoodNoiseAmplitude;
uniform float uWoodNoiseSecondFreq;
uniform float uWoodNoiseSecondAmplitude;
uniform float uWoodHoleSharpness;
uniform float uWoodDarkStart;
uniform float uWoodDarkEnd;
uniform float uWoodLightStart;
uniform float uWoodLightEnd;


vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);


vec3 lightbrown = vec3(0.6, 0.3, 0.12);
vec3 darkbrown = vec3(0.25, 0.12, 0.05);

#include ../includes/perlinClassic3D.glsl

// Just messing with this for fun -- it works!
vec3 fbm(vec2 uv){
    float freq = uFrequency;
    float n = perlinClassic3D(vec3(uv * freq, uTime * 0.1 * uSpeed));
    float gain = uGain;
    float amplitude = 0.5;

    vec3 p = vec3(uv * freq, uTime * 0.1 * uSpeed);

    for (int i = 0; i < uNumOctaves; i += 1) {
        n += amplitude * perlinClassic3D(p);
        p *= uLacunarity;
        amplitude *= gain;
        // gain *= uLacunarity;
    }

    vec3 col = mix(vec3(0.0), vec3(magenta), n);
    return col;
}`

vec3 woodgrain(vec2 uv){
    float xStretch = 10.0;
    float baseFreq = 2.0;

    // Jeez, this already looks super good..
    float n = uWoodNoiseAmplitude * perlinClassic3D(vec3(uv.x * baseFreq + uTime * 0.1 * uSpeed, uv.y * baseFreq * xStretch, 0.0));
    // vec3 col = mix(vec3(0.0), vec3(magenta), n);

    // Add another layer of noise (Note: if you don't add uTime offset here, it makes the waves animate as they move across screen)
    n += uWoodNoiseSecondAmplitude * perlinClassic3D(vec3((
        uv.x * baseFreq + uTime * 0.1 * uSpeed) * uWoodNoiseSecondFreq, 
        uv.y * baseFreq * xStretch * uWoodNoiseSecondFreq, 
        0.0
        ));

    // Accentuate some of the dark waves
    n += smoothstep(uWoodDarkStart, uWoodDarkEnd, n) / uWoodHoleSharpness;

    // Accentuate some of the light waves
    // n += smoothstep(0.3, 0.8, n) / 10.0;

    // Make some holes
    n -= smoothstep(uWoodLightStart, uWoodLightEnd, n);

    // Kind of washes out all the non-dark parts, smooshing them into a single color
    // n = smoothstep(0.1, 0.9, n);

    vec3 col = mix(lightbrown, darkbrown, n);
    // vec3 col = mix(darkbrown, lightbrown, n);

    return col;
}

void main()
{
    vec2 uv = vUv;

    // vec3 col = fbm(uv);

    vec3 col = woodgrain(uv);
    // gl_FragColor = magenta * n;
    gl_FragColor = vec4(col, 1.0);
}