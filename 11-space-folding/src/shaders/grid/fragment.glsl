varying vec2 vUv;

uniform float uTime;

vec4 magenta = vec4(1.0, 0.0, 0.8, 1.0);

// Thanks to http://roy.red/posts/folding-tilings/

void fold(inout vec2 p, vec2 dir,inout int n){
    float dt = dot(p,dir);
    if (dt<0.) {
        p-=2.*dt*dir;
        n++;
    }
}

// vec3 color(vec2 pt) {
//     int n=0;
//     fold(pt,normalize(vec2(1,0)),n);
//     fold(pt,normalize(vec2(0,1)),n);
//     return vec3(fract(float(n)/2.));
// }

vec2 cInverse(vec2 z, vec2 center, float radius){
    z -= center;
    return z*radius*radius/dot(z,z) + center;
}
void fold_circle(inout vec2 z, vec2 c, float r, inout int n) {
    if (distance(z,c)>r) return;
    z = cInverse(z,c,r);
    n++;
}
vec3 drawCircle(vec2 z,vec2 c,float r) {
    return vec3(smoothstep(distance(z,c)-r,.01,0.));
}


// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void doFolds(inout vec2 z, vec2 c, float r, inout int n){
    fold(z,vec2(1,0),n);
    fold(z,vec2(0,1),n);
    fold_circle(z,c,r,n);
}

vec3 color(vec2 pt) {
    int n=0;

    // effect 1
    vec2 invCent=vec2(1); 
    float invRad=1.122;

    // effect 2 (animated)
    // pt = cInverse(pt * 4.5, vec2(0), 1.);
    // vec2 invCent=vec2(sqrt(3.)/2.,.5);
    // invCent.x += mix(-0.011,0.035,sin(uTime));
    // float invRad=1.;

	vec3 color = drawCircle(pt,invCent,invRad);

    // Huh this is already pretty cool
    doFolds(pt,invCent,invRad,n);

    for (int i=0;i<19;i++) {
        doFolds(pt,invCent,invRad,n);
    }

    vec3 v = vec3(fract(float(n)/2.)/4.,1.,1.-float(n)/40.);
    // v.zx = v.xz;
    color *= hsv2rgb(v);

    // Make it blue instead of red/yellow
    color.rb = color.br;
    return color;
}



// ==========================================

// Thanks to https://github.com/HackerPoet/PySpace/blob/master/pyspace/frag.glsl

float rand(float s, float minV, float maxV) {
	float r = sin(s*s*27.12345 + 1000.9876 / (s*s + 1e-5));
	return (r + 1.0) * 0.5 * (maxV - minV) + minV;
}
float smin(float a, float b, float k) {
	float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0 );
	return mix(b, a, h) - k*h*(1.0 - h);
	//return -log(exp(-a/k) + exp(-b/k))*k;
}

//##########################################
//
//   Space folding functions
//
//##########################################
void planeFold(inout vec4 z, vec3 n, float d) {
	z.xyz -= 2.0 * min(0.0, dot(z.xyz, n) - d) * n;
}
void absFold(inout vec4 z, vec3 c) {
	z.xyz = abs(z.xyz - c) + c;
}
void sierpinskiFold(inout vec4 z) {
	z.xy -= min(z.x + z.y, 0.0);
	z.xz -= min(z.x + z.z, 0.0);
	z.yz -= min(z.y + z.z, 0.0);
}
void mengerFold(inout vec4 z) {
	float a = min(z.x - z.y, 0.0);
	z.x -= a;
	z.y += a;
	a = min(z.x - z.z, 0.0);
	z.x -= a;
	z.z += a;
	a = min(z.y - z.z, 0.0);
	z.y -= a;
	z.z += a;
}
void sphereFold(inout vec4 z, float minR, float maxR) {
	float r2 = dot(z.xyz, z.xyz);
	z *= max(maxR / max(minR, r2), 1.0);
}
void boxFold(inout vec4 z, vec3 r) {
	z.xyz = clamp(z.xyz, -r, r) * 2.0 - z.xyz;
}


float boxSdf(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}


// ==========================================



// Second attempt, from https://github.com/pedrotrschneider/shader-fractals/blob/main/3D/MengerSponge.glsl

float sierpinski3 (vec3 z) {
  float iterations = 5.0;
  float Scale = 2.0 + (sin (uTime / 2.0) + 1.0);
  vec3 Offset = 3.0 * vec3 (1.0, 1.0, 1.0);
  float bailout = 1000.0;

  float r = length (z);
  int n = 0;
  while (n < int (iterations) && r < bailout) {

    z.x = abs (z.x);
    z.y = abs (z.y);
    z.z = abs (z.z);

    if (z.x - z.y < 0.0) z.xy = z.yx; // fold 1
    if (z.x - z.z < 0.0) z.xz = z.zx; // fold 2
    if (z.y - z.z < 0.0) z.zy = z.yz; // fold 3

    z.x = z.x * Scale - Offset.x * (Scale - 1.0);
    z.y = z.y * Scale - Offset.y * (Scale - 1.0);
    z.z = z.z * Scale;

    if (z.z > 0.5 * Offset.z * (Scale - 1.0)) {
      z.z -= Offset.z * (Scale - 1.0);
    }

    r = length (z);

    n++;
  }

  return (length (z) - 2.0) * pow (Scale, -float (n));
}

float map(vec3 p){

    // Kinda works.... not very performant though.... Yeah even with their RayMarcher, it doesn't...work well
    // float d = sierpinski3(p);
    // return d;

    return boxSdf(p, vec3(.1));
}

float lerp (float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// Marches the ray in the scene
vec4 RayMarcher (vec3 ro, vec3 rd) {
  float steps = 0.0;
  float totalDistance = 0.0;
  float minDistToScene = 100.0;
  vec3 minDistToScenePos = ro;
  float minDistToOrigin = 100.0;
  vec3 minDistToOriginPos = ro;
  vec4 col = vec4 (0.0, 0.0, 0.0, 1.0);
  vec3 curPos = ro;
  bool hit = false;
  vec3 p = vec3 (0.0);

  for (steps = 0.0; steps < float (80); steps++) {
    p = ro + totalDistance * rd; // Current position of the ray
    float distance = map (p); // Distance from the current position to the scene
    curPos = ro + rd * totalDistance;
    if (minDistToScene > distance) {
      minDistToScene = distance;
      minDistToScenePos = curPos;
    }
    if (minDistToOrigin > length (curPos)) {
      minDistToOrigin = length (curPos);
      minDistToOriginPos = curPos;
    }
    totalDistance += distance; // Increases the total distance armched
    if (distance < 0.001) {
      hit = true;
      break; // If the ray marched more than the max steps or the max distance, breake out
    }
    else if (distance > 100.) {
      break;
    }
  }

  float iterations = float (steps) + log (log (100.)) / log (2.0) - log (log (dot (curPos, curPos))) / log (2.0);

  if (minDistToScene > 0.001) {

  }

  if (hit) {
    col.rgb = vec3 (0.8 + (length (curPos) / 8.0), 1.0, 0.8);
    col.rgb = hsv2rgb (col.rgb);

  }
  else {
    col.rgb = vec3 (0.8 + (length (minDistToScenePos) / 8.0), 1.0, 0.8);
    col.rgb = hsv2rgb (col.rgb);
    col.rgb *= 1.0 / pow (minDistToScene, 1.0);
    col.rgb /= 15.0 * lerp (sin (uTime * 3.0), -1.0, 1.0, 1.0, 3.0);
  }
  col.rgb /= iterations / 10.0; // Ambeint occlusion
  col.rgb /= pow (distance (ro, minDistToScenePos), 2.0);
  col.rgb *= 2000.0;

  return col;
}

vec2 ray_march(vec2 pt){
    vec3 rayOrigin = vec3(0., 0., -3.);
    vec3 rayDirection = normalize(vec3(pt, 1.));
    float t = 0.;

    int i;
    for (i=0; i < 80; i++){
        vec3 p = rayOrigin + rayDirection * t;
        float d = map(p);
        t += d;

        if (d < 0.001){
            break;
        }
        if (d > 100.) {
            break;
        }
    }
    return vec2(float(i) / 80., t);
}




// totally can't figure out Menger/Sierpinski folding.... I don't get it haha
void main(){
    vec2 uv = vUv;
    // uv = uv * 2.0 - 1.0;
    uv -= .5;
    // gl_FragColor = vec4(uv, .4,1.0);

    vec3 rayOrigin = vec3(0., 0., -3.);
    vec3 rayDirection = normalize(vec3(uv, 1.));
    vec4 col = RayMarcher(rayOrigin, rayDirection);

    // vec2 it = ray_march(uv);
    // gl_FragColor = vec4(vec3(it.y * 0.05), 1.);

    gl_FragColor = col;
}


// ==========================================


void mainWorking()
{
    vec2 uv = vUv;

    // Cool, first effect (hyperbolic Poincare disk stuff)
    //Hmm.. we're only seeing 1/4 of the image... Aha we fixed it! Double and subtract 1. 
    uv = uv * 2.0 -1.0;
    uv += 0.;
    gl_FragColor = vec4(color(uv),1.0);
}

// ==========================================

void mainFailed(){

    vec2 uv = vUv;

    // Attempt at second effect (Sierpinski stuff) -- a mess, nvm
    float zoom = 4.;
    uv  = uv * zoom - zoom * .5;

    vec2 invCent=vec2(sqrt(3.)/2.,.5);
    float invRad=1.;

    vec3 color = drawCircle(uv,invCent,invRad);
    // int n = 0;
    // Error: Constant value cannot be passed for 'out' or 'inout' parameters.
    // doFolds(uv,invCent,invRad,n);

    float n = 2.5;
    vec4 z = vec4(uv, n, 0.);
    // sierpinskiFold(z);
    // mengerFold(z);
    // sphereFold(z, 0.5, 1.0);

    // Ahhh yes we have to pull n out from z.... ok. Nah, not really working haha.
    n = z.z;


    // Ahhhh DUH this is the ENTIRE point to use value of n to color things.... Lol.
    color *= hsv2rgb(vec3(fract(float(n)/2.)/4.,1.,1.-float(n)/40.));

    // gl_FragColor = z;
    gl_FragColor = vec4(color, 1.);
}

// ==========================================

