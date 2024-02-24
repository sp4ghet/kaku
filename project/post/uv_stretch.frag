#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float sliders[32];
uniform vec4 buttons[32];
uniform float time;
uniform float beat;

uniform vec3 bass_smooth;

uniform sampler1D spectrum;
uniform sampler2D render;

#include "lib/util.glsl"
#include "lib/rng.glsl"

float remap(float l, float r, float x){
    return (x - l) / (r - l);
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    if(isPress(buttons[3])){
        pt *= .98;
        pt += .05 * vec2(random(int(floor(time * 50))), random(int(floor(time * 50 + 30))));
        uv = pt2uv(pt);
    }

    vec4 c = texture(render, uv);


    out_color = c;
}
