varying vec2 vUv;

uniform float uTime;
varying float vHeight;



void main()
{
    vec2 uv = vUv;
    // uv.x += sin(uTime) * 2.;

    vec3 blue = vec3(0.1, 0.1, 0.3);

    float d = distance(uv, vec2(0.5));
    float mask = smoothstep(0.1, .05, d);

    vec3 color = mix(blue, vec3(1.,0.,0.), vHeight);
    color = mix(color, vec3(1.), mask);

    gl_FragColor = vec4(color, 1.);
}