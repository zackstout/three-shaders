 float battery  = 0.2;
 float anchor  = -0.5;
 float speed_scale = 1.0;
 float fov = 0.1;
 vec4 background_color = vec4(0.0, 0.1, 0.2, 1.0);
 vec4 grid_color = vec4(1.0, 0.5, 1.0, 1.0);
 float TIME = 1.0;

 varying vec2 vUv;

float grid(vec2 uv, float batt) {
    vec2 size = vec2(uv.y, uv.y * uv.y * 0.2) * 0.01;
    uv += vec2(0.0, TIME * speed_scale * (batt + 0.05));
    uv = abs(fract(uv) - 0.5);
 	vec2 lines = smoothstep(size, vec2(0.0), uv);
 	lines += smoothstep(size * 5.0, vec2(0.0), uv) * 0.4 * batt;
    return clamp(lines.x + lines.y, 0.0, 3.0);
}

void main()
{
    vec2 uv = vUv;
	vec4 col = background_color;
    uv.y = 3.0 / (abs(uv.y + fov) + 0.05);
	uv.x += anchor;

    // Commenting this out gives interesting effect:
    uv.x *= uv.y * 1.0;
    float gridVal = grid(uv, battery);
    col = mix(background_color, grid_color, gridVal);

    gl_FragColor = col;
}