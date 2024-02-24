#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];
uniform float sliders[32];
uniform sampler2D render;

#include "lib/util.glsl"
void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    int kaleidoCount = isPress(buttons[12]) ? 1 : 0;
    kaleidoCount += isPress(buttons[13]) ? 3 : 0;
    kaleidoCount += isPress(buttons[14]) ? 5 : 0;
    kaleidoCount += isPress(buttons[15]) ? 7 : 0;
    // kaleidoCount += 1;

    for(int i=0; i<kaleidoCount; i++){
        pt = abs(pt);
        pt *= r2d(sliders[5] * PI);
        pt -= time * .1;
        pt = uv2pt(fract(pt2uv(pt)));
    }
    uv = pt2uv(pt);

    vec4 c = texture(render, uv);

    out_color = c;
}
