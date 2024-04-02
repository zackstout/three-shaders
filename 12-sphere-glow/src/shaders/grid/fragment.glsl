varying vec2 vUv;

uniform float uTime;

float rand(float s, float minV, float maxV) {
	float r = sin(s*s*27.12345 + 1000.9876 / (s*s + 1e-5));
	return (r + 1.0) * 0.5 * (maxV - minV) + minV;
}

void main()
{
    vec2 uv = vUv;
    vec2 ctr = uv - .5;
    float r = .1 + sin(uTime * 2.) * .1;
    vec3 c = vec3(0.);
    vec3 magenta = vec3(1., 0., .8);
    float radial = length(ctr);

    float whiteGlowWidth = .008;
    c += vec3(1.) * smoothstep(r - whiteGlowWidth * 2., r, radial);
    c += (1. - magenta) * (0. - smoothstep(r, r + whiteGlowWidth, radial));

    // Nice Fade to dark blue at edges!
    float glowRadius = .15;

    // Crazy unexpected flashing... Oh becauwe we're adding a large number, sure. Had to scale down.
    glowRadius += .1 * rand(sin(uTime * .2), cos(uTime * .2), 0.);

    // Whoa, pretty weird effect... Ah right I was doing uv. Not ctr.
    // Use -abs(ctr.y) because only one half works..
    glowRadius += .1 * rand(atan(ctr.x, -abs(ctr.y)), .2,.8);

    float blackAmt = smoothstep(r, r + glowRadius, radial);
    c = mix(c, vec3(0., 0., .2), blackAmt);

    // c *= .3 / pow (radial, 1.);

    gl_FragColor = vec4(c, 1.);
}



// void main() {
//     vec2 uv = vUv;
//     float r = .15;
//     vec3 black = vec3(0.);

// }