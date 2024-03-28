varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);
vec3 gold = vec3(1.0, 0.8, 0.2);
vec3 teal = vec3(0.1, 0.8, 0.96);


// If light is red and object is blue, won't show up.
vec3 ambientLight(vec3 lightColor, float lightIntensity)
{
    return lightColor * lightIntensity;
}

void main()
{
    vec2 uv = gl_PointCoord;

    float distanceToCenter = length(uv - 0.5);
    float smallNumber = 0.05;
    float alpha = smallNumber / distanceToCenter - 2.0 * smallNumber;

    // Oh wow this looks pretty good. Falling stars!
    // Could make color depend on .... velocity....or something

    vec3 col = vec3(0.0);

    // vec3 lightColor = vec3(magenta.rgb);
    // vec3 lightColor = vec3(gold.rgb);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);

    float lightIntensity = 1.0;

    // lightIntensity = step(lightIntensity, distance(uv, vec2(0.25)) + 0.65);

    col += ambientLight(lightColor, lightIntensity);


    gl_FragColor = vec4(col, alpha);
}