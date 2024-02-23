#version 440
out vec4 out_color;

uniform float beat;
uniform float time;
uniform vec4 resolution;

uniform sampler2D logo;
uniform sampler2D logo_res;
uniform sampler2D nyolfen;
uniform vec4 nyolfen_res;
uniform sampler2D draw_logo;
uniform vec4 draw_logo_res;

uniform vec4[32] buttons;
uniform float[32] sliders;
uniform vec3 volume;
uniform vec3 bass;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/color.glsl"

float rectSDF(vec2 st, vec2 size){
  return max(abs(st).x * size.x, abs(st).y * size.y);
}

float crossSDF(vec2 st, float s){
  vec2 size = vec2(.25, s);
  return min(rectSDF(st, size.xy),
    rectSDF(st, size.yx));
}

float fill(float x, float size){
  return 1.-step(size, x);
}

void main(){
    vec2 uv = vec2(gl_FragCoord.xy) / resolution.xy;
    vec2 pt = uv2pt(uv), st = pt;

    vec4 c = vec4(0);
    float v = 0;

    if(toggle(buttons[20])){
      float a = 1.0 - fract(beat);
      float thickness = 2.0 / resolution.y;
      float line = step(uv.y, a+thickness) * step(a-thickness, uv.y);

      v += line;
    }

    if(toggle(buttons[21])){
        float n = 5;
        st = lofi(pt, n);
        float r = hash(st * 100. + 0.01 * random(int(beat * 8)));
        st = fract(pt * 5)*2.0 - 1.0;

        st = abs(st);
        vec2 sz = vec2(.15, 1);
        float d = min(max(st.x * sz.x, st.y * sz.y), max(st.x * sz.y, st.y * sz.x));
        if(abs(r) < 0.1){
            v += step(d, .1);
        }
    }

    if(toggle(buttons[12])){
      v += texture(logo, pt2uv(pt * vec2(resolution.z, 1))).r;
    }
    if(toggle(buttons[13])){
      st = pt * 3 * resolution.xy / nyolfen_res.xy;
      v += texture(nyolfen, pt2uv(st)).r;
    }
    if(toggle(buttons[14])){
      st = pt;
      st -= vec2(0, -0.064);
      st = st * resolution.xy / draw_logo_res.xy;
      v += texture(draw_logo, pt2uv(st)).a;
    }

    if(toggle(buttons[15])){
      float n = 8;
      vec2 id = floor(uv * vec2(2,1) * n);

      st = mod(pt, 1.0 / n) - (0.5 / n);
      st *= n * 2;
      st *= 2. * resolution.xy / nyolfen_res.xy;
      float t = beat * n / 2;
      t = mod(t, 3*n);
      if(t < 2*n){
        if(mod(t, 2*n) > id.x){
          v += texture(nyolfen, pt2uv(st)).r;
        }
      }else{
        if(mod(t, n) > id.y){
          v += texture(nyolfen, pt2uv(st)).r;
        }
      }
      // v += id.x / (n*2);
      // v += id.y / (n);
    }


    float circle = length(pt);
    float ct = buttons[22].y;
    ct = 0.5 + 0.5 * cos(PI * exp(-3 * ct));
    ct *= 4.5;
    circle = graph(circle, ct, .01);
    v += circle;

    float pillars = 0;
    st = uv;
    float pid = floor(st.x * 4) / 3.0;
    float pit = 6*buttons[23].y;
    pit = pit > 2 ? clamp(pit-pid-1, 1.0, 2.5) : saturate(pit - pid);
    st = pt;
    st.x = mod(st.x + 1, .5) - .25;
    st.y += 4. * (pit - 1.);
    st *= r2d(pit * PI);
    pillars = fill(crossSDF(st, 1.), .03);
    v += pillars;

    c += saturate(v);

    out_color = c;
}
