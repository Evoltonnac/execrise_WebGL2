#version 300 es
#pragma vscode_glsllint_stage : frag
precision highp float;

in vec3 v_normal;
in vec3 fragPos;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

struct DirLight {
    vec3 lightDir;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct PointLight {
    vec3 lightPos;
    
    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

#define NR_DIR_LIGHTS 1
#define NR_POINT_LIGHTS 1

uniform vec3 eyePos;
uniform Material material;
uniform DirLight dirLights[NR_DIR_LIGHTS];
uniform PointLight pointLight[NR_POINT_LIGHTS];

uniform vec3 lightColor;
uniform vec3 parallelLightDir;
uniform vec3 pointLightPos;
uniform vec3 pointLightColor;

out vec4 outColor;

vec3 ambientLight(vec3 lightColor) {
    return material.ambient;
}

vec3 diffuseLight(vec3 dir, vec3 color) {
    float diff = max(dot(v_normal, normalize(dir)), 0.0);
    return material.diffuse * color * diff;
}

vec3 specularLight(vec3 dir, vec3 color) {
    if (dot(dir, v_normal) <= 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }
    else {
        vec3 reflectLightDir = reflect(-dir, v_normal);
        vec3 eyeDir = normalize(eyePos - fragPos);
        float pointLight = pow(max(dot(reflectLightDir, eyeDir), 0.0), material.shininess * 128.0);
        return color * pointLight * material.specular;
    }
}

void main() {
    vec3 ambient = ambientLight(lightColor);
    vec3 diffuse = diffuseLight(parallelLightDir, lightColor);
    vec3 specular1 = specularLight(parallelLightDir, lightColor);

    vec3 pointLightDir = normalize(pointLightPos - fragPos);
    vec3 diffuse2 = diffuseLight(pointLightDir, pointLightColor);
    vec3 specular2 = specularLight(pointLightDir, pointLightColor);
    outColor = vec4(ambient + diffuse + specular1 + diffuse2 + specular2, 1.0);
}