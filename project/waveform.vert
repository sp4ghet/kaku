#version 440

out vec4 v_color;

uniform sampler1D samples;
uniform vec4 resolution;
uniform int vertex_count;
uniform vec4 buttons[32];

uniform float sliders[32];

#pragma include "lib/util.glsl"

void main() {
    int vid = (gl_VertexID + 1) / 2;
    float x = float(vid) / vertex_count;
    x *= 2;
    vec2 samp = texture(samples, x).rg;

    vec3 c = vec3(1);

    float y = x * 2 * resolution.z - resolution.z;
    vec3 p = vec3(y, samp.r * sliders[9] * 3, 0.);
    p.x *= resolution.w;

    gl_Position = vec4(p, 1);
    gl_PointSize = 0.0;

    v_color = vec4(c, 1.);
}
