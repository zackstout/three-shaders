varying vec2 vUv;
varying float vProgress;

uniform vec2 uResolution;
uniform float uSize;

uniform float uTime;

attribute float aSize;
attribute float aTimeMultiplier;

void main()
{

    vec3 newPosition = position;

    // Position it correctly on screen:
    newPosition.x *= .2;
    newPosition.z *= .4;
    newPosition.y *= .2;
    newPosition.z -= 1.;

    // newPosition.y -= uTime * 1.;

    // Final position
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Final size
    float finalSize = uSize * uResolution.y * aSize * 0.02;

    // Mess with scale on aTimeMultiplier, and the initial offset!!
    float scaledATimeMultiplier = aTimeMultiplier * 2.;
    float scl = 0.5 + sin((uTime + scaledATimeMultiplier) * 3.) * 1.;
    finalSize *= scl;

    gl_PointSize = finalSize;
    gl_PointSize *= 1.0 / - viewPosition.z;

    vUv = uv;
    vProgress = scaledATimeMultiplier;
}