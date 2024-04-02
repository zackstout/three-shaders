varying vec2 vUv;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

// vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition)
// {
//     vec3 lightDirection = normalize(lightPosition);
//     float shading = dot(normal, lightDirection);
//     // Prevent negative values    
//     shading = max(0.0, shading);
//     return lightColor * lightIntensity * shading;
// }

vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower)
{
    vec3 lightDirection = normalize(lightPosition);
    vec3 lightReflection = reflect(- lightDirection, normal);

    // Shading
    float shading = dot(normal, lightDirection);
    shading = max(0.0, shading);

    // Specular
    float specular = - dot(lightReflection, viewDirection);
    specular = max(0.0, specular);
    specular = pow(specular, specularPower);

    return lightColor * lightIntensity * (shading + specular);
}

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);

    vec2 uv = vUv;
    
    vec3 col = vec3(0.);
    col += directionalLight(
        vec3(1., 1., 1.),
        1., 
        normal, 
        vec3(1., 1., -2.), 
        viewDirection,
        15. // Specular power: Larger number reduces the strength of specular effect
        );

    gl_FragColor = vec4(col, 1.0);
}