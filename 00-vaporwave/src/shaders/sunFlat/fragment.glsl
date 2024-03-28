varying vec2 vUv;

void main()
{
    vec2 uv = vUv;


    float d = distance(vUv, vec2(0.5, 0.5));

    // if (d > 0.5)
    // {
    //     discard;
    // }

    if (uv.y < 0.4)
    {
        float width = 0.65 + 0.3 * pow(uv.y, 0.5);
        if (mod(uv.y * 16.0, 1.0) > width) {
            discard;
        }
    }
   

    vec3 gold = vec3(1.0, 0.8, 0.2);
    vec3 magenta = vec3(1.0, 0.0, 0.8);
    // vec4 col = vec4(1.0, 0.0, 0.5, 1.0);

    float mixStrength = 0.85 - uv.y;

    vec3 col = mix(gold, magenta, mixStrength);
   
   float alpha = 0.9;

   if (d > 0.5) {
    discard;
   }


    gl_FragColor = vec4(col, alpha);
}