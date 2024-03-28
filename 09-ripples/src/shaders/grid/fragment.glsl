varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);

vec3 darkblue = vec3(15.0 / 255.0, 94.0 / 255.0, 156.0 / 255.0);
vec3 lightblue = vec3(116.0 / 255.0, 204.0 / 255.0, 244.0 / 255.0);

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float ripple(vec2 uv, vec2 ctr, float t)
{
    float d = distance(uv, ctr);

    float r = 0.2 + 0.1 * t;

    float v = 0.0;
    float smoothWidth = 0.008;
    float ringWidth = 0.000001;

    for (int i=0; i < 4; i++){
        v += smoothstep(r - smoothWidth, r, d);
        v -= smoothstep(r + ringWidth, r + ringWidth + smoothWidth, d);

        r -= 0.05;
    }


    return v;
}

void main()
{
    vec2 uv = vUv;

    // Ahhhh of course! We have to subtract to get to the past... adding goes to the future!
    // float v1 = ripple(uv, vec2(0.3, 0.7), uTime);
    // float v2 = ripple(uv, vec2(0.2, 0.3), uTime - 5.0);
    // float v3 = ripple(uv, vec2(0.8, 0.6), uTime - 2.0);
    // float v = v1 + v2 + v3;

    // Huh.... I really don't understand why this creates a ton of ripples... like a crazy ton... even when we don't do the loop..
    // Ooooh... because each pixel was doing it... or something... But why did first example work??? 
    // I really don't know. Something weird with the random function....????
    float v = 0.0;
    int totalRipples = 12;
    for (int i=0; i < totalRipples; i++){
        // float x = rand(vec2(float(i), uTime));
        // float y = rand(vec2(float(i), uTime + 1.0));

        float x = 0.5 + 0.4 * sin(float(i) * 3.14 / (float(totalRipples) * 0.5));
        float y = 0.5 + 0.4 * cos(float(i) * 3.14 / (float(totalRipples) * 0.5));

        int delayStart = 5;
        float delayBetween = 0.1;
        float t = uTime - float(i + delayStart) * delayBetween;
        v += ripple(uv, vec2(x, y), t);
    }

    // gl_FragColor = magenta * v;

    vec3 col = mix(darkblue, lightblue, v);

    gl_FragColor = vec4(col, 1.0);
}