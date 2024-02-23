#version 440
out vec4 out_color;

uniform vec4 resolution;
uniform float time;

uniform sampler2D backbuffer;
uniform sampler2D code;

vec3 rgb_to_ycbcr(vec3 rgb) {
    float y = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    float cb = (rgb.b - y) * 0.565;
    float cr = (rgb.r - y) * 0.713;

    return vec3(y, cb, cr);
}

// YCbCr to RGB
vec3 ycbcr_to_rgb(vec3 yuv) {
    return vec3(
        yuv.x + 1.403 * yuv.z,
        yuv.x - 0.344 * yuv.y - 0.714 * yuv.z,
        yuv.x + 1.770 * yuv.y
    );
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec3 c = texture(backbuffer, uv).rgb;


    // vec3 code = texture(code, uv).rgb;

    // vec3 bg = vec3(0., 0.1686, 0.211);
    // vec2 ck = rgb_to_ycbcr(bg).gb;
    // vec2 cp = rgb_to_ycbcr(code).gb;
    // float t = smoothstep(0.0, 0.12, length(ck - cp));
    // c = mix(c, code, t);

    out_color = vec4(c, 1.);
}
