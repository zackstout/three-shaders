varying vec2 vUv;

uniform float uTime;
uniform float uAspect;

#include ../includes/simplexNoise3d.glsl;

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main()
{
    vec2 uv = vUv;

    float numCells = 40.;
    uv *= numCells;
    // Multiplying instead of dividing is cool too, narrow stripes
    uv.y /= uAspect;

    vec2 uvv = uv;
    uv = fract(uv);

    // Oh neat, using uvv instead of floor(uvv) is crazy 
    float hue = snoise(vec3(floor(uvv), 0.));

    // clamp into blue-magenta range
    hue = mix(.72, .92, hue);

    vec3 color = hsv2rgb(vec3(hue, .7, .9));


    float alpha1 = .5* sin(uTime * 3. + floor(uvv.x) + floor(uvv.y)) + .5;
    float alpha2 = .5* sin(uTime * 3. + snoise(vec3(floor(uvv * 3.), 1.))) + .5;
    float alpha3 = .5* sin(uTime * 3. + 8. * snoise(vec3(floor(uvv), 1.))) + .5;

    float t = abs(sin(uTime * .2));
    // float t2 = abs(sin(uTime * 3.));

    float alpha = alpha3;

    alpha = mix(alpha, alpha1, t);
    // alpha = mix(alpha, alpha2, t2);

    alpha = smoothstep(.1, .9, alpha);

    gl_FragColor = vec4(color, alpha);
}