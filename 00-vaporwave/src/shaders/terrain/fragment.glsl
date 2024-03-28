varying vec2 vUv;

uniform float uTime;

void main()
{
    vec2 uv = vUv;

    // vec4 gold = vec4(1.0, 0.8, 0.2, 1.0);
    // vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);
    // vec4 col = mix(gold, magenta, 0.85 - uv.y);

    uv.y += uTime * 0.05;


    float stripWidth = 0.02;
    float numStrips = 40.0;
    float strength = step(1.0 - stripWidth, mod(vUv.x * numStrips, 1.0));
    strength += step(1.0 - stripWidth, mod(vUv.y * numStrips, 1.0));

    // Gold
    vec3 col = vec3(1.0, 0.8, 0.2);

    // Teal
    vec3 col2 = vec3(0.1, 0.8, 0.96);
   
    gl_FragColor = vec4(col2 * strength, 1.0);
}