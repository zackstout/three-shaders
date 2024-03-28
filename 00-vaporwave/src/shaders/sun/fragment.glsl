varying vec2 vUv;

void main()
{
    vec2 uv = vUv;

    if (uv.y < 0.5)
    {
        float width = 0.85 + 0.15 * pow(uv.y, 4.0);
        if (mod(uv.y * 15.0, 1.0) > width) {
            discard;
        }
    }
   

    vec3 gold = vec3(1.0, 0.8, 0.2);
    vec3 magenta = vec3(1.0, 0.0, 0.8);
    // vec4 col = vec4(1.0, 0.0, 0.5, 1.0);

    vec3 col = mix(gold, magenta, 0.85 - uv.y);
   
    gl_FragColor = vec4(col, 0.9);
}