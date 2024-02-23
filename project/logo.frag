#version 440
out vec4 out_color;
uniform vec4 resolution;
#define logo_res vec4(1280, 1280, 1, 1)

#include "lib/util.glsl"

vec2 cubic_bezier(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t){
    return cb(1.-t)*p0 + 3.*sq(1.-t)*t*p1 + 3.*(1.-t)*sq(t)*p2 + cb(t)*p3;
}

vec2 derivative(vec2 p0, vec2 p1, vec2 p2, vec2 p3, float t){
    return -3.*sq(1.-t)*p0 + (3.*sq(1.-t) - 6.*(1.-t)*t)*p1 + (6. * (1.-t) * t - 3. * sq(t))*p2 + 3. * sq(t) * p3;
}

const float SENTINEL = -197.98;
vec3 solveCubic(float a, float b, float c, float d){
    float p = (3. * a * c - sq(b)) / (3. * sq(a));
    float q = (2. * cb(b) - 9. * a * b * c + 27. * sq(a) * d) / (27. * cb(a));

    float offset = -b / (3.*a);
    if(abs(p) < 0.00001 && abs(q) < 0.00001){
        return vec3(offset, SENTINEL, SENTINEL);
    }
    float det = sq(q) / 4. + cb(p) / 27.;
    if(det == 0. && abs(p) > 0.00001){
        return vec3(3.*q / p + offset, - 1.5 * q / p + offset, SENTINEL);
    }
    if(det < 0. && abs(p) > 0.00001){
        float u = .333333333333333 * acos(1.5 * q * sqrt(-3.0 / p) / p);
        float v = 2. * sqrt(-(1. / 3.) * p);
        return vec3(v * cos(u), v * cos(u - (2./3.) * PI), v * cos(u - (4./3.) * PI)) + offset;
    }

    //https://fortran-lang.discourse.group/t/cardanos-solution-of-the-cubic-equation/111/7
    float tempa = -0.5 * q + sqrt(det),
    tempb = -0.5 * q - sqrt(det);
    float cardano = sign(tempa)*pow(abs(tempa), 0.333333) + sign(tempb)*pow(abs(tempb), 0.333333);

    return vec3(cardano + offset, SENTINEL, SENTINEL);
}

vec3 lineL(vec2 uv, vec2 p, float x, float y){
    vec2 to = vec2(x,y);
    float miny = min(p.y, to.y);
    float maxy = max(p.y, to.y);

    float wind = 0.;
    float t = (uv.y - p.y) / (to.y - p.y);
    float ix = mix(p, to, t).x;
    if(miny == maxy){
        ix = min(p.x, to.x);
        t = 0.;
    }
    if(t == saturate(t) && ix > uv.x){
        wind = -sign(to.y - p.y);
    }
    return vec3(x, y, wind);
}

// https://www.pokitec.com/research/FillingClosedBezierPaths.html
vec3 bezierC(vec2 uv, vec2 p, float x1, float y1, float x2, float y2, float x3, float y3){
    vec2 q = vec2(x1, y1);
    vec2 r = vec2(x2, y2);
    vec2 s = vec2(x3, y3);
    p/=logo_res.xy;
    q/=logo_res.xy;
    r/=logo_res.xy;
    s/=logo_res.xy;
    uv/=logo_res.xy;

    float miny = min(p.y, min(q.y, min(r.y, s.y)));
    float maxy = max(p.y, max(q.y, max(r.y, s.y)));
    float wind = 0.;
    if(uv.y > maxy || uv.y < miny){
        return vec3(vec2(x3, y3), wind);
    }

    float a = -p.y + 3. * q.y - 3. * r.y + s.y;
    float b = 3. * p.y - 6. * q.y + 3. * r.y;
    float c = -3. * p.y + 3. * q.y;
    float d = p.y;
    vec3 ts = solveCubic(a,b,c,d - uv.y);

    if(ts.x != SENTINEL && ts.x == saturate(ts.x) && cubic_bezier(p,q,r,s,ts.x).x > uv.x){
        vec2 df = derivative(p,q,r,s,ts.x);
        wind += sign(df.y / df.x);
    }
    if(ts.y != SENTINEL && ts.y == saturate(ts.y) && cubic_bezier(p,q,r,s,ts.y).x > uv.x){
        vec2 df = derivative(p,q,r,s,ts.y);
        wind += sign(df.y / df.x);
    }
    if(ts.z != SENTINEL && ts.z == saturate(ts.z) && cubic_bezier(p,q,r,s,ts.z).x > uv.x){
        vec2 df = derivative(p,q,r,s,ts.z);
        wind += sign(df.y / df.x);
    }

    return vec3(vec2(x3, y3), wind);
}


void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    vec3 c = vec3(0.);

    vec3 d = vec3(550.59,822.09, 0.);
    float wind = 0.;

    pt *= .5 * logo_res.xy;
    pt += .5 * logo_res.xy;
    pt.y = logo_res.y - pt.y;
    d = bezierC(pt, d.xy, 550.59, 822.09, 556.87, 813.02, 564.82, 802.22);
    wind += d.b;


    d = bezierC(pt, d.xy, 574.25, 789.42, 590.48, 776.34, 602.77, 772.15);
    wind += d.b;
    d = bezierC(pt, d.xy, 631.68, 762.30, 632.85, 744.93, 623.48, 735.64);
    wind += d.b;
    d = bezierC(pt, d.xy, 617.76, 729.98, 601.52, 728.20, 567.73, 734.65);
    wind += d.b;
    d = bezierC(pt, d.xy, 609.40, 706.37, 664.35, 717.76, 695.53, 728.41);
    wind += d.b;
    d = bezierC(pt, d.xy, 747.18, 746.05, 757.54, 680.54, 701.96, 673.1);
    wind += d.b;
    d = bezierC(pt, d.xy, 669.38, 668.74, 638.60, 669.54, 585.45, 698.79);
    wind += d.b;
    d = bezierC(pt, d.xy, 634.56, 648.48, 669.69, 653.65, 713.38, 595.32);
    wind += d.b;

    d = bezierC(pt, d.xy, 733.00, 566.46, 912.78, 302.02, 912.78, 302.02);
    wind += d.b;
    d = lineL(pt, d.xy, 691.92, 147.22);
    wind += d.b;
    d = lineL(pt, d.xy, 221.13,821.42);
    wind += d.b;
    d = lineL(pt, d.xy, 550.59,822.09);
    wind += d.b;
    float val = mod(wind,2.);


    wind = 0.;
    d.xy = vec2(808.85,526.73);
    d = bezierC(pt, d.xy, 808.85,526.73, 792.5,550.08, 776.05,573.68);
    wind += d.b;
    d = bezierC(pt, d.xy, 755.09,603.73, 739.13,611.38, 721.11,629.);
    wind += d.b;
    d = bezierC(pt, d.xy, 708.26,641.56, 706.28,656.8, 725.41,662.57);
    wind += d.b;
    d = bezierC(pt, d.xy, 813.93,689.27, 832.53,763.52, 755.45,756.48);
    wind += d.b;
    d = bezierC(pt, d.xy, 706.69,752.03, 634.97,768.56, 589.99,836.01);
    wind += d.b;
    d = lineL(pt, d.xy, 395.94,1111.69);
    wind += d.b;


    d = lineL(pt, d.xy, 739.05,1111.69);
    wind += d.b;
    d = lineL(pt, d.xy, 1033.54,685.8);
    wind += d.b;
    d = lineL(pt, d.xy, 808.85,526.73);
    wind += d.b;
    val += mod(wind,2.);

    c = vec3(val);


    // Output to screen
    out_color = vec4(c,1.0);
}
