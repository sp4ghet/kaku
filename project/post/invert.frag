#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float sliders[32];
uniform vec4 buttons[32];

uniform sampler2D render;

#include "lib/util.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = texture(render, uv);

    c.rgb = isPress(buttons[7]) ?  1. - c.rgb : c.rgb;

    out_color = c;
}
