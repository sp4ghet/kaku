#version 410 core


out vec4 out_color; // out_color must be written in order to see anything

uniform vec4 resolution;
uniform float time;

uniform vec4 buttons[32];

uniform sampler1D fft;
uniform vec3 bass_integrated;
uniform vec3 bass;
uniform vec3 volume;
uniform float beat;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/sdf.glsl"

const vec3 up = vec3(0.,1.,0.);

void chsmin(inout vec4 a, in vec4 b, in float k){
    a.yzw = a.x < b.x ? a.yzw : b.yzw;
    a.x = smin(a.x, b.x, k);
}

vec4 map(vec3 q){
    vec3 p = q;
    vec4 d = vec4(1e5, 0,0,0);

    q.z = mod(q.z, 40) - 20;
    p = q;
    float tn = -box(p, vec3(5, 5, 50)) + .5;
    chmin(d, vec4(tn, 0,0,0));

    p = q;
    p.xy = abs(p.xy) - 5;
    float bx = box(p, vec3(1,1,4));
    p = q;
    p.x = abs(p.x) - 5.;
    bx = min(bx, box(p, vec3(.5, 4, .5)));
    p=q;
    p.y = abs(p.y) - 5;
    bx = min(bx, box(p, vec3(4, .5, .5)));
    chsmin(d, vec4(bx, 0,0,0), 1);

    p = q;
    p.xy *= r2d(PI * .25);
    p.x = abs(p.x) - 2.;
    p.z += 10;
    bx = box(p, vec3(.25, 7, .25));
    p.y = abs(p.y) - 2.;
    bx = min(bx, box(p, vec3(7, .25, .25)));
    chsmin(d, vec4(bx, 0,0,0), 1);

    p = q;
    p.y = abs(p.y) - 5;
    bx = box(p, vec3(1, .75, 40));
    chmax(d, vec4(-bx, 0,0,0));

    p=q;
    p.x = abs(p.x) - 5;
    bx = box(p, vec3(.5, .5, 40));
    chsmin(d, vec4(bx, 0,0,0), 1);

    p=q;
    p.z = abs(p.z) - 20;
    p.x = abs(p.x) - 5;
    bx = box(p, vec3(3, 6, 5));
    chsmin(d, vec4(bx,0,0,0), 1);

    p = q;
    p.z -= 10;
    p.x = abs(p.x) - 5;
    bx = box(p, vec3(4 + .75 * sin(beat), .5, .5));
    bx = min(bx, box(p, vec3(3, 1, 1)));
    bx = min(bx, box(p, vec3(1, 1.5, 1.5)));
    p.z += 5;
    bx = min(bx, box(p+vec3(2.5,0,0), vec3(.25, 7, .25)));
    chmin(d, vec4(bx,0,0,0));


    return d;
}

vec3 normal(vec3 p, vec2 e){
    return normalize( e.xyy*map( p + e.xyy).x +
                      e.yyx*map( p + e.yyx).x +
                      e.yxy*map( p + e.yxy).x +
                      e.xxx*map( p + e.xxx).x );
}


float calcSoftshadow(vec3 ro, vec3 rd, float mint, float tmax)
{
  float res = 1.;
  float t = mint;
  float ph = 1e10; // big, such that y = 0 on the first iteration

  for( int i=0; i<32; i++ )
  {
    vec3 p = ro + rd*t;
    float h = map(p).x;
    // use this if you are getting artifact on the first iteration, or unroll the
    // first iteration out of the loop
    // float y = (i==0) ? 0.0 : h*h/(2.0*ph);
    float y = h*h/(2.0*ph);
    float d = sqrt(h*h-y*y);
    res = min( res, 10.0*d/max(0.0,t-y) );
    ph = h;

    t += h * .8;
    if( res < 0.1 || t>tmax ) break;
  }
  return saturate(res);
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(0);

    vec3 ro = vec3(0., 0., -time);
    vec3 fo = ro + vec3(0,0,1);
    vec3 rov = normalize(fo - ro);
    vec3 cu = normalize(cross(rov, up));
    vec3 cv = cross(cu, rov);
    float ct = .5 + .5  * cos(PI * exp(-3 * buttons[19].y));
    pt *= r2d(PI *  ct);
    vec3 rd = mat3(cu,cv,rov) * normalize(vec3(pt, 1.));

    float t = 0.01;
    float maxt = 50.;
    vec4 d;
    vec3 p = ro;
    float precis = 0;

    for(int i=0; i<128; i++){
        p = ro + rd*t;
        d = map(p);
        t += d.x;
        precis = t * .001;
        if(abs(d.x) < precis || t > maxt){
            t = t >= maxt ? maxt : t;
            break;
        }
    }

    vec3 lp = ro + vec3(0,0,12);
    // vec3 l = normalize(vec3(.9, 1., .2));
    if(abs(d.x) <= precis){
        vec3 l = lp - p;
        float ld = length(l);
        float li = 20 / (sq(ld) + .01);
        l = normalize(l);
        vec3 n = normal(p, vec2(precis, -precis));
        vec3 albedo = vec3(.4, .8, .9);
        c += li * albedo * chi(n, l, .1);

        c *= dot(n,l) > 0 ? calcSoftshadow(p, l, 50 * precis, min(ld, 15.)) : .1;
        float ao=0;
        for(int i=1; i<=10; i++){
            float aot = .05 * i;
            ao += saturate(map(p+n*aot).x / aot);
        }
        ao /= 10;
        c *= ao;
    }

    vec3 fog = mix(vec3(.2, .6, .9), vec3(.3, .7, .99), rd.y);
    c = mix(fog, c, exp(-.025 * t));

    out_color = vec4(c, 1);
}
