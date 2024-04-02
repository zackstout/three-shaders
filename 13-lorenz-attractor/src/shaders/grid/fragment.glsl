varying vec2 vUv;

uniform float uTime;

varying float vProgress;

vec3 ambientLight(vec3 lightColor, float lightIntensity)
{
    return lightColor * lightIntensity;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
    vec2 uv = gl_PointCoord;

    float distanceToCenter = length(uv - 0.5);
    float smallNumber = 0.05;
    float alpha = smallNumber / distanceToCenter - 2.0 * smallNumber;

    vec3 col = vec3(0.0);

    // vec3 lightColor = vec3(1.);

    vec3 lightColor = hsv2rgb(vec3(.5 + vProgress * .08, 1.0, 1.0));

    float lightIntensity = 1.0;

    // Get rid of that lit bulb at the beginning
    if (vProgress < .08){
        discard;
    }

    // Huh.. kind of interesting?
    // lightIntensity = step(lightIntensity, distance(uv, vec2(0.25)) + 0.65);

    col += ambientLight(lightColor, lightIntensity);

    gl_FragColor = vec4(col, alpha);
}