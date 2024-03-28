varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

uniform vec3 uColor;

#include ../includes/directionalLight.glsl

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);
vec3 teal = vec3(0.1, 0.8, 0.96);

float getGlow(float dist, float radius, float intensity){
    return pow(radius/dist, intensity);
}


// Feels like this is better!!
vec3 makeBloomGrid2(vec2 uv){
    vec3 col = vec3(0.0);
    float numStrips = 10.0;
    float stripDistance = 1.0 / numStrips;
    float vy = mod(uv.y, stripDistance);
    // Need to account for BOTH sides (0 and the max)
    float dy1 = abs(vy - stripDistance);
    float dy2 = abs(vy - 0.0);

    float vx = mod(uv.x, stripDistance);
    float dx1 = abs(vx - stripDistance);
    float dx2 = abs(vx - 0.0);

    float stripWidth = 0.002;
    float power = 1.0;

    // NOTE: Probably would be best to have this power (1.0 right now) depend on numStrips
    col += getGlow(dy1, stripWidth, power) * vec3(teal);
    col += getGlow(dy2, stripWidth, power) * vec3(teal);
    col += getGlow(dx1, stripWidth, power) * vec3(teal);
    col += getGlow(dx2, stripWidth, power) * vec3(teal);


    col += directionalLight(
        vec3(teal), // Light color
        1.0,       // Light intensity
        vNormal,  // Normal
        vec3(2.0, 2.0, 3.0) + vec3(sin(uTime * 2.0) * 2.0, 0.0, cos(uTime * 2.0) * 2.0) // Light position
        // vec3(2.0, 2.0, 3.0) // Light position
    );

    return col;
}

void main()
{
    vec2 uv = vUv;
    // gl_FragColor = magenta;
    vec3 col = makeBloomGrid2(uv);
    gl_FragColor = vec4(col, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}