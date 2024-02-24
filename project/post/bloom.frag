#version 440

out vec4 out_color;

uniform vec4 resolution;
uniform float delta_time;
uniform float time;
uniform float sliders[32];

uniform sampler2D render;

const float k[25] = float[](1.,4.,7.,4.,1., 4.,16.,26.,16.,4., 7.,26.,41.,26.,7., 4.,16.,26.,16.,4., 1.,4.,7.,4.,1.);
void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 c = texture(render, uv);
    vec4 orig = c;

    int a = 1, b = 4;
    for(int i=a; i<=b; i++){
        vec4 now = vec4(0);
        for(int x=-2; x <= 2; x++) for(int y=-2; y<=2; y++){
            vec2 st = (gl_FragCoord.xy + pow(2,i) * vec2(x,y)) / resolution.xy;
            int idx = int(y+2) * 5 + int(x+2);
            now += (k[idx]/273.) * textureLod(render, st, i);
        }
        c += now;
    }
    c /= (b-a+1);

    out_color = mix(orig, c, sliders[5]);
}
