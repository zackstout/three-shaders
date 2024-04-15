varying vec2 vUv;

uniform float uTime;

void main()
{
    vec2 uv = vUv;

    for (int i=0; i < 3; i++)
    {
        // uv.x += sin(uv.y * 10.0 + uTime) * 0.1;
        // uv.y += cos(uv.x * 10.0 + uTime) * 0.1;

        uv *= 2.0;
        uv -= 1.0;
        uv = fract(uv);
    }

    float len = length(uv - 0.5);
    float alpha = 1.0 - smoothstep(0.3, 0.4 + .1 * sin(uTime * 3.) + .1, len);
    gl_FragColor = vec4(uv, .5 * sin(uTime) + .5, alpha);
}