varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;

#include ../../../../000-base/src/shaders/includes/directionalLight.glsl

vec3 magenta = vec3(1.0, 0.0, 0.8);
vec3 teal = vec3(0.1, 0.8, 0.96);

float getGlow(float dist, float radius, float intensity){
    return pow(radius/dist, intensity);
}




// First attempt, poor performance
vec3 makeBloomGrid(vec2 uv){
    vec3 col = vec3(0.0);

    for (float i=0.1; i<1.0; i+=0.1){
        float dist = abs(uv.y - i);
        col += getGlow(dist, 0.002, 1.0) * vec3(1.0, 0.0, 0.8);
    }

    for (float i=0.1; i<1.0; i+=0.1){
        float dist = abs(uv.x - i);
        col += getGlow(dist, 0.002, 1.0) * vec3(1.0, 0.0, 0.8);
    }
    return col;
}

// Feels like this is better!!
vec3 makeBloomGrid2(vec2 uv){
    vec3 col = vec3(0.0);
    float numStrips = 30.0;
    float stripDistance = 1.0 / numStrips;
    float vy = mod(uv.y, stripDistance);
    // Need to account for BOTH sides (0 and the max)
    float dy1 = abs(vy - stripDistance);
    float dy2 = abs(vy - 0.0);

    float vx = mod(uv.x, stripDistance);
    float dx1 = abs(vx - stripDistance);
    float dx2 = abs(vx - 0.0);

    float stripWidth = 0.001;
    float power = 1.0;

    // NOTE: Probably would be best to have this power (1.0 right now) depend on numStrips
    col += getGlow(dy1, stripWidth, power) * teal;
    col += getGlow(dy2, stripWidth, power) * teal;
    col += getGlow(dx1, stripWidth, power) * teal;
    col += getGlow(dx2, stripWidth, power) * teal;


    col += directionalLight(
        vec3(0.1, 0.1, 0.1), // Light color
        1.0,       // Light intensity
        vNormal,  // Normal
        vec3(0.0,0.0, 3.0) // Light position
    );

    return col;
}

vec3 makeLine(vec2 uv){
    float dist = abs(uv.y - 0.4);
    return getGlow(dist, 0.002, 0.5) * vec3(1.0, 0.0, 0.8);
}

// Perfect! Bloom grid!
// But i get the feeling we could improve performance... likely by dropping the loop...
void main()
{
    vec2 uv = vUv;
    // vec3 col = makeLine(uv);
    // vec3 col = makeBloomGrid(uv);
    vec3 col = makeBloomGrid2(uv + vec2(uTime * 0.05, 0.0));
    gl_FragColor = vec4(col, 1.0);
}