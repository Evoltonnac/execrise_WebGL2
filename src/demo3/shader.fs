#version 300 es
#pragma vscode_glsllint_stage : frag
precision highp float;

in vec3 normalDir;
in vec3 fragPos;

// 材质属性
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

// 平行光源
struct DirLight {
    vec3 lightDir;
    
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// 点光源
struct PointLight {
    vec3 lightPos;
    
    // 点光源衰减参数：常量，线性系数，二次项系数
    float constant;
    float linear;
    float quadratic;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

// 预处理光源数量
#define NR_DIR_LIGHTS 1
#define NR_POINT_LIGHTS 3

uniform vec3 eyePos;
uniform Material material;
uniform DirLight dirLights[NR_DIR_LIGHTS];
uniform PointLight pointLights[NR_POINT_LIGHTS];

out vec4 outColor;

// 计算环境光
vec3 calcAmbient(Material material, vec3 color) {
    return material.ambient * color;
}

// 计算漫反射
vec3 calcDiffuse(Material material, vec3 normal, vec3 dir, vec3 color) {
    float diff = max(dot(normal, normalize(dir)), 0.0);
    return material.diffuse * color * diff;
}

// 计算镜面反射
vec3 calcSpecular(Material material, vec3 normal, vec3 eyeDir, vec3 dir, vec3 color) {
    if (dot(dir, normal) <= 0.0) {
        return vec3(0.0, 0.0, 0.0);
    }
    else {
        // vec3 reflectLightDir = reflect(-dir, normal);
        // float pointLight = pow(max(dot(reflectLightDir, eyeDir), 0.0), material.shininess * 128.0);
        vec3 halfDir = normalize(dir + eyeDir);
        float pointLight = pow(max(dot(normal, halfDir), 0.0), material.shininess * 128.0);
        return color * pointLight * material.specular;
    }
}

// 计算平行光
vec3 calcDirLight(Material material, DirLight dirLight, vec3 normal, vec3 eyeDir) {
    vec3 ambient = calcAmbient(material, dirLight.ambient);
    vec3 diffuse = calcDiffuse(material, normal, dirLight.lightDir, dirLight.diffuse);
    vec3 specular = calcSpecular(material, normal, eyeDir, dirLight.lightDir, dirLight.specular);
    return ambient + diffuse + specular;
}

// 计算点光
vec3 calcPointLight(Material material, PointLight pointLight, vec3 normal, vec3 eyeDir) {
    vec3 ambient = calcAmbient(material, pointLight.ambient);
    vec3 pointLightDir = normalize(pointLight.lightPos - fragPos);
    vec3 diffuse = calcDiffuse(material, normal, pointLightDir, pointLight.diffuse);
    vec3 specular = calcSpecular(material, normal, eyeDir, pointLightDir, pointLight.specular);
    
    float dist = distance(pointLight.lightPos, fragPos);
    float intensity = 1.0 / (pointLight.constant + dist * pointLight.linear + pow(dist, 2.0) * pointLight.quadratic);
    return (ambient + diffuse + specular) * intensity;
}

void main() {
    vec3 norm = normalize(normalDir);
    vec3 eyeDir = normalize(eyePos - fragPos);
    vec3 result = vec3(0.0);
    for(int i = 0; i < NR_DIR_LIGHTS; i++) {
        result += calcDirLight(material, dirLights[i], norm, eyeDir);
    }
    for(int j = 0; j < NR_POINT_LIGHTS; j++) {
        result += calcPointLight(material, pointLights[j], norm, eyeDir);
    }
    outColor = vec4(result, 1.0);
}