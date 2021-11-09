#version 300 es
#pragma vscode_glsllint_stage : vert

in vec4 position;
in vec3 normal;

uniform mat4 projection;
uniform mat4 model;
uniform mat4 view;
uniform vec4 color;

out vec3 v_normal;
out vec3 fragPos;

void main() {
    v_normal = normalize(mat3(transpose(inverse(model))) * normal);
    fragPos = vec3(model * position);

    gl_Position = projection * view * model * position;
}