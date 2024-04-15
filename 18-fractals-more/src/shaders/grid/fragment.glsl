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

vec2 rotate2d(vec2 _st, float _angle) {
    _st -= 0.5;
    _st =  mat2(cos(_angle),-sin(_angle),
                 sin(_angle),cos(_angle)) * _st;
    _st += 0.5;
    return _st;
}

void main()
{
    vec2 uv = vUv;

    for (float i=0.; i < uNumIter; i+= 1.)
    {
        // uv *= (uAmpStart + uAmpScale * sin(uTime * uAmpSpeed + i));
        // uv -= uCoordOffset;


        uv -= uCoordOffset;
        uv *=  uAmpStart;
        // uv = rotate2d(uv, uAmpScale * sin(uTime * uAmpSpeed + i));

        uv = rotate2d(uv, uAmpScale + i * i * i / 10.);

        uv = fract(uv);
    }

    float len = length(uv - uLengthOffset);
    float alpha = 1.0 - smoothstep(uSizeStart, uSizeStart + uSizeLength, len);
    gl_FragColor = vec4(uv, .9, alpha);
}