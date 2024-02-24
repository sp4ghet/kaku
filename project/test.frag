#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;

uniform sampler2D foreground;
uniform sampler2D osci;
uniform sampler2D waveform;
uniform sampler2D waterfall;
uniform sampler2D gather;
uniform sampler2D tunnel;
uniform sampler2D lissajous;
uniform sampler2D laser;

uniform vec4[32] buttons;
uniform float[32] sliders;
uniform sampler1D samples;
uniform vec3 volume;

uniform vec3 bass_smooth;
uniform vec3 mid_smooth;
uniform vec3 high_smooth;
uniform vec3 bass;
uniform vec3 mid;
uniform vec3 high;

#include "lib/util.glsl"
#include "lib/rng.glsl"
#include "lib/color.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);
    vec3 c = vec3(0.01);

    float tf = fract(beat);
    float ti = floor(beat);
    float anim = smoothstep(0., 1., tf);
    float a = 0.5 + 0.5 * cos(PI + TAU * pow(tf, 4));

    float bg = abs(cyclic_noise(vec3(uv, ti + anim), 8).g);
    if(toggle(buttons[0])){
        bg *= a;
    }
    if(toggle(buttons[8])){
        c += bg * 0.5;
    }


    float v = texture(gather, uv).r;
    if(toggle(buttons[1])){
        v *= a;
    }
    if(toggle(buttons[9])){
        c += v;
    }

    v = texture(foreground, uv).r;
    if(toggle(buttons[2])){
        v *= a;
    }
    if(toggle(buttons[10])){
        c += v;
    }

    v = 0;
    if(toggle(buttons[11])){
        if(sliders[9] > 0.01)
        {
            v = texture(waveform, uv).r;
        }
        v += texture(osci, uv).r;
    }
    if(toggle(buttons[3])){
        v *= a;
    }
    c += v;

    if(toggle(buttons[30])){
        c += texture(tunnel, uv).r;
    }

    if(toggle(buttons[24])){
        v = texture(lissajous, uv).b;
    }
    if(toggle(buttons[16])){
        v *= a;
    }
    c += v;

    if(toggle(buttons[25])){
        v = texture(laser, uv).b;
    }
    if(toggle(buttons[17])){
        v *= a;
    }
    c += v;

    out_color = vec4(c, 1.);
}
