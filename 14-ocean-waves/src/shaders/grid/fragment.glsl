varying vec2 vUv;
uniform float uTime;

void main()
{
    vec2 uv = vUv;

    // vec2 pos = fract(uv + vec2(.5) * uTime);
    vec2 pos = uv;
    gl_FragColor = vec4(pos, .5, 1.);
}