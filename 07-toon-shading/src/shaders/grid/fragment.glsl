varying vec2 vUv;

uniform float uTime;
varying vec3 vNormal;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);


vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition)
{
    vec3 lightDirection = normalize(lightPosition);
    float shading = dot(normal, lightDirection);
    // Prevent negative values    
    shading = max(0.0, shading);
    return lightColor * lightIntensity * shading;
}

void main()
{
    vec2 uv = vUv;

    vec3 col = vec3(0.0);
    vec3 offset = vec3(2.0 * sin(uTime * 1.0), 3.0 * sin(uTime * 2.0), 2.0  * cos(uTime * 1.0));

    vec3 light = directionalLight(vec3(1.0, 1.0, 1.0), 1.0, vNormal, vec3(1.0, 0.5, 1.0) + offset);

    float val = (light.r + light.g + light.b) / 3.0;


    // Huh ok.... not quite as obvious as I had hoped... Ok we're paring some things away...
    // Define the toon shading steps
    float nSteps = 5.0;
    float step = sqrt(val) * nSteps; // sqrt(val) not needed, can just use val

    // This is the key line for cutting the shadow into multiple distinct layers/shades
    step = (floor(step) + smoothstep(0.48, 0.52, fract(step))) / nSteps;

    // Calculate the surface color
    float surface_color = step * step; // step * step not needed, can just use step


    // val = smoothstep(0.8, 0.9, val);

    // Cool flashing effect (on the CUBE):
    // col += mod(light, 0.25);

    // col += val * vec3(1.0);

    gl_FragColor = vec4(surface_color * vec3(1.0), 1.0);

    // gl_FragColor = vec4(vNormal, 1.0);
}