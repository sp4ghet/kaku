#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec3 bass_smooth;
uniform vec3 volume;

uniform sampler2D post;

#include "lib/util.glsl"

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 pt = uv2pt(uv);

    float tm = 0.5 + 0.5 * cos(PI * exp(-5. * fract(beat)));
    // tm = beat * .25;
    pt *= r2d(PI * 0.5 * (floor(beat) + tm));
    float square = max(abs(pt.y), abs(pt.x));
    square = step(square, .51) * step(.5, square);

    pt = uv2pt(uv);
    pt *= 1.01;
    uv = pt2uv(pt);
    vec4 c = texture(post, uv);
    c *= 0.5;

    // c = mix(c, vec4(bass_smooth, 1), square);
    c = uv.y > 0.99 || uv.y < 0.01 ? vec4(0) : c;

    out_color = c;
}
