#version 300 es
#pragma vscode_glsllint_stage : frag
precision highp float;

in vec3 fragPos;
in vec3 normalDir;

// 材质属性
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material material;

layout (location = 0) out vec3 outPosition;
layout (location = 1) out vec3 outNormal;
layout (location = 2) out vec3 outDiffuse;
layout (location = 3) out vec3 outSpecular;
layout (location = 4) out vec4 outAmbientShininess;

void main() {
    outPosition = fragPos;
    outNormal = normalize(normalDir);
    outDiffuse = material.diffuse;
    outSpecular = material.specular;
    outAmbientShininess = vec4(material.ambient, material.shininess);
}