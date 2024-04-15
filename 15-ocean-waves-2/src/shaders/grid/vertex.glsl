varying vec2 vUv;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/simplexNoise3d.glsl;
// #include ../includes/perlinClassic3d.glsl;


float waveElevation(vec3 pos){
    float elevation = 0.0;
    float noise = snoise(vec3(pos.x * 1., pos.y * 1., 0. + uTime * .5));
    float noiseStr = .05;
    elevation += noise * noiseStr;

    float effect = 0.8;
    float effectDecay = 0.8;

    for (int i=0; i < 8; i++){
        elevation += snoise(vec3(pos.x * 1. , pos.y * 1. , float(i) + uTime * .5)) * effect * noiseStr;
        effect *= effectDecay;
    }

    return elevation;
}

void main()
{
    vec3 pos = position;

    // Wait.... what's going on.... Oh I think it was z here because we hadn't multiplied by modelMatrix yet...
    // But the light is only obeying the ... y? So we get the banded effect? Even if this is applied.
    // pos.z += waveElevation(pos);

    // We must compute the normal here
    float shift = 0.01;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    
    vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
    // Use negative shift here because of cross product and RHR
    vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, - shift);

    // Elevation
    // Whoa, swizzling different orders from modelPosition is weird....
    float elevation = waveElevation(modelPosition.xyz);
    modelPosition.y += elevation;
    modelPositionA.y += waveElevation(modelPositionA);
    modelPositionB.y += waveElevation(modelPositionB);

    // Oh duh, we have to update the y position of neighbors first...
    vec3 toA = normalize(modelPositionA - modelPosition.xyz);
    vec3 toB = normalize(modelPositionB - modelPosition.xyz);
    vec3 computedNormal = cross(toA, toB);

    vec4 modelViewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * modelViewPosition;

    vUv = uv;
    // vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    // vNormal = modelNormal.xyz;
    vNormal = computedNormal;
    vPosition = modelPosition.xyz;
}