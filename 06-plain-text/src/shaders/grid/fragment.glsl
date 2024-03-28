varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);

void main()
{
    vec2 uv = vUv;
    gl_FragColor = magenta;
}