varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);

// Thanks to https://www.youtube.com/watch?v=khblXafu7iA&t=4s&ab_channel=kishimisu


// ============ UTILITY FUNCTIONS ============
float opUnion(float d1, float d2){
    return min(d1, d2);
}

// Larger k means more smoothing
float opUnionSmooth(float d1, float d2, float k){
    float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
    return mix(d2, d1, h) - k * h * (1.0 - h);
}

float opUnionSmooth2(float a, float b, float k){
    float h = max(k - abs(a-b), 0.0) / k;
    return min(a,b) - h*h*h*k*(1.0/6.0);
}

float opIntersection(float d1, float d2){
    return max(d1, d2);
}

float opSubtraction(float d1, float d2){
    return max(d1, -d2);
}

// Cosine based palette, 4 vec3 params
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

mat2 rot2D(float angle){
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}


// ============ SHAPE FUNCTIONS ============

float sphereSdf(vec3 p, float r){
    return length(p) - r;
}

float boxSdf(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float octahedronSdf(vec3 p, float s){
    p = abs(p);
    // Huh, wonder what this number represents...
    return (p.x + p.y + p.z - s) * 0.57735027;

}

// ============ DISTANCE FUNCTIONS ============

float map(vec3 p){
    // Moving sphere!
    vec3 sphereCtr = vec3(0.) + vec3(sin(uTime),0.,0.);
    float movingSphere = sphereSdf(p - sphereCtr, .5);

    // Make a copy of vector to avoid modifying the original (and all the follows)
    vec3 q = p;
    // Omitting the z from swizzle means it rotates around z axis:
    q.xy *= rot2D(uTime * 0.5);

    float box = boxSdf(q, vec3(0.5));
    float boxSphereCombo = opUnionSmooth(movingSphere, box, 0.5);

    float ground = p.y + 0.5;

    return opUnionSmooth(ground, boxSphereCombo, 0.3);
}

float mapSecond(vec3 p){
    // vec3 q = p;
    p.z += uTime;
    // p = fract(p) - 0.5; // Space repetition condensed

    p.x = fract(p.x) - 0.5;
    p.y = fract(p.y) - 0.5;
    // Whoa this is weird
    // p.z = fract(p.z * 0.25) - 0.125;
    // Make objects closer together along z axis
    p.z = mod(p.z, 0.25) - 0.125;

    // Wow, using different sized octahedrons gives cool effect....
    float box = octahedronSdf(p, .15);
    float ground = p.y + 0.75;
    // return opUnionSmooth2(ground, box, 1.);
    return box;
}

// ============ MAIN FUNCTION ============

void main_original()
{
    vec2 uv = vUv;
    vec2 centeredUv = uv;
    centeredUv -= vec2(0.5);
    // Ahhh NICE, this makes up for fact that plane is 4x2 ... so we need to pass in aspect ratio... also need to offset ceneter.
    centeredUv.x *= 2.;

    // These lines effectively repeat the space. (Need to remove the above subtraction.)
    // centeredUv.x = fract(centeredUv.x * 10.);
    // centeredUv.y = fract(centeredUv.y * 10.);
    // // Have to do this AFTER the fract
    // centeredUv -= vec2(0.5);

    // Move the camera in a circle, why not?
    vec3 rayOrigin = vec3(0., 0., -3.) + vec3(sin(uTime), cos(uTime), 0.);
    vec3 rayDirection = normalize(vec3(centeredUv, 1.));
    float t = 0.;

    int i;
    for (i=0; i < 80; i++){
        vec3 p = rayOrigin + rayDirection * t;

        // Oh wow, we can wiggle the ray itself!
        p.y += sin(uTime) * .35;

        float d = mapSecond(p);
        t += d;

        if (d < 0.001){
            break;
        }
        if (d > 100.) {
            break;
        }
    }

    vec3 paletteA = vec3(0.5, 0.5, 0.5);
    vec3 paletteB = vec3(0.5, 0.5, 0.5);
    vec3 paletteC = vec3(1.0, 1.0, 1.0);
    vec3 paletteC2 = vec3(2., 1., 0.);
    vec3 paletteD = vec3(0.0, 0.1, 0.2);
    vec3 paletteD2 = vec3(0.263, 0.416, 0.557);
    vec3 paletteD3 = vec3(0., 0.33, 0.66);
    vec3 paletteD4 = vec3(0.5, .2, .25);

    // Whoa, scaling t down here gives super weird effects
    // Wowww yeah adding the i offset really adds sooo much depth.
    vec3 color = palette(t * 0.04 + float(i) * 0.005, paletteA, paletteB, paletteC, paletteD2);

    // Ahhh nice we had to make this scale value smaller to see further
    // gl_FragColor = vec4(vec3(t * 0.05), 1.0);

    gl_FragColor = vec4(color, 1.0);
}




// ============ SECOND MAIN FUNCTION ============

float mapThird(vec3 p) {

    float v = sphereSdf(p, .5);

    // Rotating wildly, thanks copilot lol
    for (int i=0; i < 5; i++){
        p.xz *= rot2D(uTime * 0.5);
        p.yz *= rot2D(uTime * 0.5);
        p.xy *= rot2D(uTime * 0.5);
    }
    for (int i=1; i < 4; i++){
        vec3 offset = vec3(sin(uTime + float(i) * 2.2), 0., 0.);
        float x = sphereSdf(p + offset, .3 / float(i));
        v = opUnionSmooth2(x, v, .5);
    }
    // float s1 = sphereSdf(p + vec3(sin(uTime), 0., 0.), .5);
    // float s2 = sphereSdf(p + vec3(sin(uTime - 1.), 0., 0.), .3);
    // float s3 = sphereSdf(p + vec3(sin(uTime - 1.), 0., 0.), .3);

    // return opUnionSmooth2(s1, s2, .5);

    return v;
}

void main() {
    vec2 uv = vUv;
    vec2 centeredUv = uv;
    centeredUv -= vec2(0.5);
    centeredUv.x *= 2.;

    vec3 rayOrigin = vec3(0., 0., -3.);
    vec3 rayDirection = normalize(vec3(centeredUv, 1.));
    float t = 0.;

    float glow_threshold = 0.05;

    int isGlowing = 0;

    int i;
    for (i=0; i < 80; i++){
        vec3 p = rayOrigin + rayDirection * t;

        float d = mapThird(p);
        t += d;

        // Ah cool, this seems to kind of work as intended. Easier to see when rotating the scene.
        if (d < glow_threshold){
            isGlowing += 1;
        }

        if (d < 0.001){
            break;
        }
        if (d > 100.) {
            break;
        }
    }


    // gl_FragColor = vec4(uv, .5, 1.0);

    // if (isGlowing == 1){
    //     gl_FragColor = magenta;
    //     return;
    // }

    vec3 c = vec3(t * 0.05) * -1. + 1.;



    gl_FragColor = vec4(mix(c, magenta.rgb, float(isGlowing) / 80.), 1.0);

}