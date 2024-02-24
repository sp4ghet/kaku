#version 440
out vec4 out_color;

uniform float beat;
uniform float time;
uniform vec4 resolution;

uniform vec4[32] buttons;
uniform float[32] sliders;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/color.glsl"

uniform sampler2D render;

const float vk[9] = float[](1.,0.,-1.,2.,0.,-2.,1.,0.,-1.);
const float hk[9] = float[](1.,2.,1.,0.,0.,0.,-1.,-2.,-1.);
float sobel(vec2 uv, float width, sampler2D buf){
  vec2 xy = uv*resolution.xy;

  float vert = 0.,
        horz = 0.;

  for(int y = -1; y<=1; y++){
     for(int x=-1; x<=1; x++){
      if(x==0 && y==0){
        continue;
      }
      vec3 samp = texture(buf, (xy + vec2(x,y)*width) / resolution.xy).rgb;
      float s = gray(samp);
      int yy = y + 1, xx = x+1;
      vert += vk[yy*3 + xx] * s;
      horz += hk[yy*3 + xx] * s;
    }
  }
  return length(vec2(vert,horz));
}

vec2 jitterY(in vec2 uv, float amount, float subdiv){
  float y = lofi(uv.y, subdiv) + fract(26*time);
  uv.x += amount*random(int(y*subdiv));
  return uv;
}

vec2 scrollY(in vec2 uv, float mult, float speed){
  uv.y = fract(mult*uv.y + fract(mult*time*speed));
  return uv;
}

vec3 ACESFilm(vec3 x)
{
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return (x*(a*x+b))/(x*(c*x+d)+e);
}

// noby https://www.shadertoy.com/view/3sGSWV
float grain_src(vec3 x, float pitch, float strength){
    float center = value_noise(x);
    float hp = center - value_noise(x +  vec3(1, 0, 0)/pitch) + .5;
    float hm = center - value_noise(x + vec3(-1, 0, 0)/pitch) + .5;
    float vp = center - value_noise(x + vec3(0, 1, 0)/pitch) + .5;
    float vm = center - value_noise(x + vec3(0, -1, 0)/pitch) + .5;

    float tot = (hp + hm + vp + vm) * .25;
    return mix(1, .5 + tot, strength);
}

vec3 grain(vec3 c, vec2 uv, float pitch, float strength){
    uv *= resolution.xy;
    float t = time * 60.;
    float r = grain_src(vec3(uv, t), pitch, strength);
    float g = grain_src(vec3(uv, t + 9), pitch, strength);
    float b = grain_src(vec3(uv, t - 9), pitch, strength);
    vec3 gr = vec3(r,g,b);

    return max(mix(c*gr, c+(gr-1.0), .5), 0.0);
}

void main(){
    vec2 uv = vec2(gl_FragCoord.xy) / resolution.xy;

    vec3 c = texture(render, uv).rgb;

    c = grain(c, uv, 1, sliders[2]);

    c.rgb = ACESFilm(c.rgb);
    c = pow(c, vec3(.4545));
    // if(isPress(buttons[4])){
    //   c = fract(beat * 4) > 0.5 ? 1 - c : c;
    // }

    c = smoothstep(.01, 1.5, c);
    float lum = dot(c.rgb, vec3(.2126, .7152, .0722));
    float shad = smoothstep(.4, .01, lum);
    float high = smoothstep(.3, 1., lum);
    c.rgb = c.rgb*shad*vec3(.4, 1.2, 1.2) + c.rgb*(1-shad*high) + c.rgb*high*vec3(.99, .8,.8);


    out_color = vec4(c, 0);
}
