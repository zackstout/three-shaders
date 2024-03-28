#include ../includes/perlinClassic3D.glsl

varying vec2 vUv;

uniform float uTime;

void main()
{
    vec3 newPosition = position;

    float parabolaScale = 1.0;
    float parabolaPower = 2.0;

    // float str = (2.0 * newPosition.x - 1.0);
    float str = newPosition.x * parabolaScale;
    float str2 = - newPosition.x * parabolaScale;

    float noiseStr = max(pow(str, parabolaPower), pow(str2, parabolaPower));


    // Cool-ass paraboloid effect:
    // newPosition.z += noiseStr;

    noiseStr *= 0.5;

    float noiseResolution = 3.0 + 3.0 * sin(uTime * 0.1);
    float zSlice = 1.0 + uTime * 0.1;
    float offset = 0.0;

    // float speed = 0.2;
    // float offset = uTime * 0.2;
    // float zSlice = 1.0;

    float noiseVal = 0.0 + perlinClassic3D(vec3(newPosition.x * noiseResolution, newPosition.y * noiseResolution + offset, zSlice)) * noiseStr;

    noiseVal = clamp(noiseVal, 0.0, 0.8);

    newPosition.z += noiseVal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}