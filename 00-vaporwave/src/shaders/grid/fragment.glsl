varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);
vec4 background_color = vec4(0.0, 0.1, 0.2, 1.0);
// vec4 grid_color = vec4(1.0, 0.5, 1.0, 1.0);

// Dang, how do I get it to smoothstep BOTH sides of the bar/strip...

void main()
{
    vec4 grid_color = magenta;

    vec2 uv = vUv;

    // Make it move -- doesn't look great, because of the lines competing with each other
    float speed = 0.2;
    uv.y += uTime * speed;

    float stripWidth = 0.05;
    float numStrips = 30.0;

    // Make color fade in and out
    // float whiteStrength = 1.0 + sin(uTime * 3.0) * 1.0;
    float whiteStrength = 1.0;

    float strength = mod(uv.x * numStrips, 1.0);
    float strength2 = abs(1.0 - strength);
    float val = stripWidth;
    val *= 0.05;
    float w = 0.02;
    strength = whiteStrength * (1.0 - smoothstep(val, val + w, strength));
    strength += whiteStrength * (1.0 - smoothstep(val, val + w, strength2));

    val *= 5.0;
    float strengthY = mod(uv.y * numStrips, 1.0);
    float strengthY2 = abs(1.0 - strengthY);
    strengthY = whiteStrength * (1.0 - smoothstep(val, val + w, strengthY));
    strengthY += whiteStrength * (1.0 - smoothstep(val, val + w, strengthY2));



    // Do this instead of adding them to avoid the white squares at intersections -- but maybe we want them??
    // strength = max(strength, strengthY);
    strength += strengthY;

    // strength += 1.0 - smoothstep(val, val + w * 2.0, strength2);
    // strength += 1.0 - smoothstep(val, val + w * 2.0, strength2);;

    // strength += 1.0 - smoothstep(val, val + w * 2.0, strength * 0.1);;

    // vec2 uv = vUv;

    // uv.y = 3.0 / (abs(uv.y + 0.1) + 0.05);
	// uv.x += 0.5;
    // // Commenting this out gives interesting effect -- could work for the sun..
    // uv.x *= uv.y * 1.0;

    // vec2 size = vec2(uv.y, uv.y * uv.y * 0.2) * 0.01;
    // uv = abs(fract(uv) - 0.5);
 	// vec2 lines = smoothstep(size, vec2(0.0), uv);
 	// lines += smoothstep(size * 5.0, vec2(0.0), uv) * 0.4;
    // float strength = clamp(lines.x + lines.y, 0.0, 3.0);

    vec4 col = background_color;
    col = mix(col, grid_color, strength);

    // gl_FragColor = vec4(0.5 * strength, 0.0, 1.0 * strength, 1.0);
    gl_FragColor = col;
}