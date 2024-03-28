varying vec2 vUv;

uniform float uTime;
uniform float uNoiseFrequency;
uniform float uNoiseSpeed;
uniform float uRadius;
uniform float uNoiseSmoothstepValue;
uniform float uNoiseSmoothstepOffset;
uniform float uNumCells;


vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);
vec3 cyan = vec3(0.0, 1.0, 1.0);

#include ../includes/perlinClassic3D.glsl

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    float numCells = uNumCells;
    float aspectRatio = 1.8;
    float numXCells = numCells * aspectRatio;
    vec2 gridUv = vec2(floor(vUv.x * numXCells) / numXCells, floor(vUv.y * numCells) / numCells);
    // float r = rand(gridUv);

    float freq = uNoiseFrequency;
    float speed = uNoiseSpeed;
    float r = perlinClassic3D(vec3(gridUv.x * freq + uTime * speed, gridUv.y * freq, 1.0));
    r += 0.5;
    // r *= 3.0;
    // gl_FragColor = vec4(r, r, r, 1.0);
    // gl_FragColor = vec4(cyan, r);


    // Damn actually pretty cool -- now they're like inchworm clouds lol.
    r = smoothstep(uNoiseSmoothstepOffset, uNoiseSmoothstepOffset + uNoiseSmoothstepValue, r);


    vec4 c1 = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 c2 = vec4(0.0, 0.7, 1.0, 1.0);

    vec4 final = mix(c2, c1, r);


    vec2 ctr = gridUv + vec2(0.5 / numXCells, 0.5 / numCells);
    float d = distance(vUv, ctr);
    float dCheck = 0.4;
    if (d > dCheck / numCells) 
    { 
        gl_FragColor = vec4(vec3(c2), 0.95);
    } else 
    {
        gl_FragColor = final;
    }

    // Cut out middle:
    // if (abs(vUv.y - 0.5) < 0.4) {
    //     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    // }

    // final = smoothstep(0.5 / numCells, 0.48 / numCells, d) * final;

    // gl_FragColor = final;
}