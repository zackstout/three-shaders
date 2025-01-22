varying vec2 vUv;
varying vec3 vEye;
varying vec3 vNormal;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vEye = normalize((modelViewMatrix * vec4(position, 1.0)).xyz - cameraPosition);

    vUv = uv;
    vNormal = normal;
}