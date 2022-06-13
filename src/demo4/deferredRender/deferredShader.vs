#version 300 es
#pragma vscode_glsllint_stage : vert

in vec2 aPosition;
in vec2 aTexcoord; 

out vec2 texcoord;

void main() {
    texcoord = aTexcoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}