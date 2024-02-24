#version 440

out vec4 v_color;
uniform int vertex_count;
uniform vec4 resolution;
uniform float time;
uniform float beat;
uniform vec4 buttons[32];
uniform float sliders[32];
uniform sampler1D samples;
uniform sampler1D spectrum;
uniform vec3 volume;

#include "lib/util.glsl"
#include "lib/rng.glsl"

void main(){
    int vid = (gl_VertexID + 1) / 2;
    int n = 100;
    if( (gl_VertexID + 2) % (2*n) == 0){
        vid += 1;
    }
    int z = vid % n;
    int particle_id = vid / n;
    int groups = vertex_count / (2*n);
    float t = float(z) / n;
    float w = float(particle_id) / groups;

    vec4 p = vec4(0,0,0,1);
    vec3 start = 3*cyclic_noise(vec3(w*3 + time + 5), 2);
    vec3 end = 3*cyclic_noise(vec3(w*4 + 2*time), 2);
    // end.y = -1;
    // start.y = 1;
    p.xyz = mix(start, end, t);
    // p.xyz *= r3d(time, vec3(1,0,1));
    p.xyz *= 2;

    mat4 view = mat4(vec4(1,0,0,0),
                     vec4(0,1,0,0),
                     vec4(0,0,1,0),
                     vec4(0,0,0,1));
    vec3 ro = vec3(0, 0, -3);
    mat3 camera = getOrthogonalBasis(normalize(-ro), vec3(0,1,0));
    view[0].xyz = camera[0];
    view[1].xyz = camera[1];
    view[2].xyz = camera[2];
    view[3].xyz = ro;

    const float far = 100;
    const float near = 0.001;
    mat4 proj = mat4(vec4(resolution.w, 0, 0, 0),
                     vec4(0, 1, 0, 0),
                     vec4(0, 0, - 2 / (far - near), 0),
                     vec4(0, 0, - (far+near) / (far-near), 1));
    mat4 vp = proj * view;
    p = vp * p;


    vec3 c = vec3(.2, .6, .9) * 10;

    gl_Position = p;
    v_color = vec4(c, 1);
}
