varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

uniform float uTime;
uniform sampler2D uTexture;

#define RANDOM_SCALE vec4(443.897, 441.423, .0973, .1099)

vec2 random2d(vec2 p) {
    vec3 p3 = fract(p.xyx * RANDOM_SCALE.xyz);
    p3 += dot(p3, p3.yzx + 19.19);
    return fract((p3.xx + p3.yz) * p3.zy);
}

void main()
{
    float scl = 1.5;
    vec2 uv = gl_FragCoord.xy / vec2(500. * scl, 800. * scl);

    // Allows us to get normal of the face of the icosahedron
    vec3 x = dFdx(vNormal);
    vec3 y = dFdy(vNormal);
    vec3 normal = normalize(cross(x, y));


    float diffuse = dot(normal, vec3(1.));

    vec2 rand = random2d(vec2(floor(diffuse * 6.)));

    uv.x = (1. + (rand.x - .5)) * uv.x * .8;
    uv.y = (1. + (rand.y - .5)) * uv.y * .8;


    // SOO FREAKIN COOL
    vec3 refracted = refract(vEyeVector, normal, .3);
    uv += refracted.xy * .8;



    gl_FragColor = texture2D(uTexture, uv);

    // Huh, why didn't vec4(diffuse) work?
    // gl_FragColor = vec4(vec3(diffuse),1.);

    // gl_FragColor = vec4(vEyeVector, 1.);
}