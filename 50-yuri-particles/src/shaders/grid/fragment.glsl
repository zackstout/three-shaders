varying vec2 vUv;
varying vec2 vCoordinates;

uniform float uTime;
uniform sampler2D uTexture;
uniform float uSize;

void main()
{
    vec2 uv = vUv;
    vec2 myUv = vCoordinates / uSize;
    // Try to match aspect ratio of image
    myUv.y *= 1.4;

    myUv.y -= uTime * .2;
    myUv.y = mod(myUv.y, 1.0);

    vec4 color = texture2D(uTexture, myUv);

    // gl_PointCoord stands in for the UV coordinates of the point
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;

    gl_FragColor = color;
}