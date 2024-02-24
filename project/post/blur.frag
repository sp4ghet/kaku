#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float delta_time;
uniform float time;
uniform vec4 buttons[32];

uniform sampler2D render;
uniform sampler2D post;

#include "lib/util.glsl"
#include "lib/rng.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = texture(render, uv);
    vec3 ns = cyclic_noise(vec3(10 * uv, time), 3);

    vec4 p = texture(post, uv + ns.xy*0.001);
    p *= isPress(buttons[10]) ? .99 : exp(-.5 * buttons[10].z);
    c = max(c,p);

    out_color = c;
}
