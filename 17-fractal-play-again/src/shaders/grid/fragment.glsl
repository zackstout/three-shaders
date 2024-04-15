varying vec2 vUv;

uniform float uTime;

uniform float uNumIter;
uniform float uAmpStart;
uniform float uAmpScale;
uniform float uAmpSpeed;
uniform float uCoordOffset;
uniform float uSizeStart;
uniform float uSizeLength;
uniform float uLengthOffset;

void main()
{
    vec2 uv = vUv;

    for (float i=0.; i < uNumIter; i+= 1.)
    {
        uv *= (uAmpStart + uAmpScale * sin(uTime * uAmpSpeed + i));
        uv -= uCoordOffset;
        uv = fract(uv);
    }

    float len = length(uv - uLengthOffset);
    float alpha = 1.0 - smoothstep(uSizeStart, uSizeStart + uSizeLength, len);
    gl_FragColor = vec4(uv, .9, alpha);
}