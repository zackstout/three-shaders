varying vec2 vUv;

uniform float uTime;

void main()
{
    vec2 uv = vUv;
    gl_FragColor = vec4(uv, .5, 1.);
}