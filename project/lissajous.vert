#version 440

out vec4 v_color;
uniform int vertex_count;
uniform vec4 resolution;
uniform float time;
uniform vec4 buttons[32];
uniform float sliders[32];
uniform sampler1D samples;

#include "lib/util.glsl"

void main(){
    int vid = (gl_VertexID + 1) / 2;
    if(abs(gl_VertexID * 2 - vertex_count) < 1){
        gl_Position = vec4(1. / 0.);
        return;
    }
    float x = 2.0 * vid / vertex_count;
    float t = x;
    if(t > 0.5){
        t =  (t - .5) * .5 + .5;
        t += time * .1;
    }else{
        t *= 0.5;
        t += time * .1;
    }
    t *= TAU;

    vec3 p = vec3(0);
    float x_freq = mod(7 + buttons[4].w, 10) + 1;
    float y_freq = mod(5 + buttons[4].w, 13) + 1;
    float z_freq = mod(3 + buttons[4].w, 11) + 1;
    p.x = sin(x_freq * t);
    p.y = cos(y_freq * t);
    p.xy += texture(samples, x).rg * (pow(10,sliders[7]*2) - 1);
    p.z = sin(z_freq * t + PI * 0.25);
    p *= r3d(time, vec3(1,1,1));
    p.z = (p.z + 1) / 2;
    p.z = saturate(p.z);
    p.x *= resolution.w;

    vec3 c = vec3(.2, .6, .9) * 10;

    gl_Position = vec4(p, 1);
    v_color = vec4(c , 1);
}
