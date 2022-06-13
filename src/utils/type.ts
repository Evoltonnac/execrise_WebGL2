import { vec3 } from 'gl-matrix';

export type Material = {
    ambient: vec3;
    diffuse: vec3;
    specular: vec3;
    shininess: number;
};

export type DirLight = {
    lightDir: vec3;
    ambient: vec3;
    diffuse: vec3;
    specular: vec3;
};

export type PointLight = {
    lightPos: vec3;
    constant: number;
    linear: number;
    quadratic: number;
    ambient: vec3;
    diffuse: vec3;
    specular: vec3;
};

type Uniform<T> = {
    [key in keyof T]: WebGLUniformLocation;
};

export type MaterialLoc = Uniform<Material>;

export type DirLightLoc = Uniform<DirLight>;

export type PointLightLoc = Uniform<PointLight>;

export type AttributeLoc = number;
export type UniformLoc = WebGLUniformLocation;
export type Loc = AttributeLoc | UniformLoc;
