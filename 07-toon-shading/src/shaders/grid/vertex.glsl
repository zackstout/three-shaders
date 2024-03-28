varying vec2 vUv;
varying vec3 vNormal;

void main()
{

    // Ahhh right we have to do something here to make it account for model's rotation when calculating normal and light...
    // Yeah see below

    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // vUv = uv;
    // vNormal = normal;


    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal -- remember, use this instead of "normal" in order to not have the light follow the models.
    // Remember, sending 0.0 as final parameter means "ignore translation".
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    vNormal = modelNormal.xyz;
}