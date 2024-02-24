#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;

uniform sampler2D backbuffer;
uniform sampler2D code;

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = texture(backbuffer, uv).rgb;

    out_color = vec4(c, 1.);
}
