varying vec2 vUv;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTime;

#include ../includes/perlinClassic3D.glsl

attribute float aSize;
attribute float aTimeMultiplier;

// There's no built-in lerp????
float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main()
{
    vec3 newPosition = position;

    newPosition.x *= 2.0;
    newPosition.z *= 2.0;

    // Fall downward
    newPosition.y -= 0.1 * aTimeMultiplier * uTime;
    newPosition.y = mod(newPosition.y + 1.0, 1.0);

    // Associate each point in 3d space with a noise-determined 3d vector
    float resolution = 0.9;

    float mag = perlinClassic3D(vec3(newPosition.zy * resolution, 1.0 + uTime * aTimeMultiplier * 0.1));
    float phi = perlinClassic3D(vec3(newPosition.zy * resolution, 0.5 + uTime * aTimeMultiplier * 0.1)) * 6.28;
    float theta = perlinClassic3D(vec3(newPosition.zy * resolution, 0.0 + uTime * aTimeMultiplier * 0.1)) * 6.28;

    float noiseScl = 1.0;

    newPosition.x += noiseScl * mag * cos(theta) * sin(phi);
    newPosition.x = mod(newPosition.x, 2.0);

    newPosition.z += noiseScl * mag * cos(phi);
    newPosition.z = mod(newPosition.z, 2.0);


    // newPosition.x = mod(newPosition.x + uTime + 0.1 * aTimeMultiplier, 2.0);
    // newPosition.z = mod(newPosition.z + uTime + 0.1 * aTimeMultiplier, 2.0);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Final size
    gl_PointSize = uSize * uResolution.y * aSize * 0.02;
    gl_PointSize *= 1.0 / - viewPosition.z;

    // Fix Windows issue
    if(gl_PointSize < 1.0)
        gl_Position = vec4(9999.9);


    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
}