#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];

uniform sampler2D post;
uniform sampler2D backbuffer;

#include "lib/util.glsl"
#include "lib/rng.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec2 pt = uv2pt(uv);
    pt += 0.03 * noise(vec4(pt*8, time, beat));
    vec2 tuv = pt2uv(pt);
    tuv = saturate(tuv);

    vec3 c = texture(post, uv).rgb;
    vec3 prev = texture(backbuffer, tuv).rgb;
    c = mix(c, prev, 0.8*buttons[7].x);

    if(toggle(buttons[31])){
      float t = fract(beat);
      t = 0.5 + 0.5 * cos(PI + TAU * pow(t, 4));
      c *= t;
    }

    out_color = vec4(c, 1.);
}
