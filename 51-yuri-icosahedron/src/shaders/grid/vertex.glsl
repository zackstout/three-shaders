varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
    // Make normals follow the rotation of the object
    vNormal = normalize(normalMatrix * normal);
    vEyeVector = normalize((modelViewMatrix * vec4(position, 1.0)).xyz - cameraPosition);
}