import { mat4, vec3 } from 'gl-matrix';
import { createProgram, createShader } from '../../utils/glUtils';
import vs from './shader.vs';
import fs from './shader.fs';
import { Cube } from '../../utils/model';
import { DirLightLoc, MaterialLoc, PointLightLoc } from '../../utils/type';
import {
    dirLights,
    modalMats,
    NR_DIR_LIGHTS,
    NR_POINT_LIGHTS,
    pointLights,
} from '../data';

const vertexSource = vs;
let fragmentSource = fs;
fragmentSource = String.prototype.replace.call(
    fragmentSource,
    'NR_DIR_LIGHTS 1',
    `NR_DIR_LIGHTS ${NR_DIR_LIGHTS}`,
);
fragmentSource = String.prototype.replace.call(
    fragmentSource,
    'NR_POINT_LIGHTS 1',
    `NR_POINT_LIGHTS ${NR_POINT_LIGHTS}`,
);

function getLocations(gl: WebGL2RenderingContext, program: WebGLProgram) {
    const positionLoc = gl.getAttribLocation(program, 'position');
    const normalLoc = gl.getAttribLocation(program, 'normal');
    const projectionLoc = gl.getUniformLocation(program, 'projection');
    const modelLoc = gl.getUniformLocation(program, 'model');
    const viewLoc = gl.getUniformLocation(program, 'view');
    // fs
    const eyePosLoc = gl.getUniformLocation(program, 'eyePos');
    const materialLoc: MaterialLoc = {
        ambient: gl.getUniformLocation(program, 'material.ambient'),
        diffuse: gl.getUniformLocation(program, 'material.diffuse'),
        specular: gl.getUniformLocation(program, 'material.specular'),
        shininess: gl.getUniformLocation(program, 'material.shininess'),
    };
    const dirLightsLoc: DirLightLoc[] = [];
    for (let i = 0; i < NR_DIR_LIGHTS; i++) {
        const dirLightLoc: DirLightLoc = {
            lightDir: gl.getUniformLocation(
                program,
                `dirLights[${i}].lightDir`,
            ),
            ambient: gl.getUniformLocation(program, `dirLights[${i}].ambient`),
            diffuse: gl.getUniformLocation(program, `dirLights[${i}].diffuse`),
            specular: gl.getUniformLocation(
                program,
                `dirLights[${i}].specular`,
            ),
        };
        dirLightsLoc.push(dirLightLoc);
    }
    const pointLightsLoc: PointLightLoc[] = [];
    for (let j = 0; j < NR_POINT_LIGHTS; j++) {
        const pointLightLoc: PointLightLoc = {
            lightPos: gl.getUniformLocation(
                program,
                `pointLights[${j}].lightPos`,
            ),
            constant: gl.getUniformLocation(
                program,
                `pointLights[${j}].constant`,
            ),
            linear: gl.getUniformLocation(program, `pointLights[${j}].linear`),
            quadratic: gl.getUniformLocation(
                program,
                `pointLights[${j}].quadratic`,
            ),
            ambient: gl.getUniformLocation(
                program,
                `pointLights[${j}].ambient`,
            ),
            diffuse: gl.getUniformLocation(
                program,
                `pointLights[${j}].diffuse`,
            ),
            specular: gl.getUniformLocation(
                program,
                `pointLights[${j}].specular`,
            ),
        };
        pointLightsLoc.push(pointLightLoc);
    }

    return {
        positionLoc,
        normalLoc,
        projectionLoc,
        modelLoc,
        viewLoc,
        eyePosLoc,
        materialLoc,
        dirLightsLoc,
        pointLightsLoc,
    };
}

export default function render() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get webgl2 rendering context');
        return;
    }

    // init shader and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        console.log('Fail tp link program');
        return;
    }

    const {
        positionLoc,
        normalLoc,
        projectionLoc,
        modelLoc,
        viewLoc,
        eyePosLoc,
        materialLoc,
        dirLightsLoc,
        pointLightsLoc,
    } = getLocations(gl, program);

    // data
    // uniform
    const material = {
        ambient: [0.19225, 0.19225, 0.19225],
        diffuse: [0.50754, 0.50754, 0.50754],
        specular: [0.508273, 0.508273, 0.508273],
        shininess: 0.4,
    };

    const cubeModel = new Cube(gl);
    cubeModel.load(positionLoc, normalLoc);

    // draw
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(program);

    // 投影矩阵
    const projection = mat4.create();
    mat4.perspective(
        projection,
        (60 * Math.PI) / 180,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100,
    );
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    // 材质加载
    gl.uniform3fv(materialLoc.ambient, material.ambient);
    gl.uniform3fv(materialLoc.diffuse, material.diffuse);
    gl.uniform3fv(materialLoc.specular, material.specular);
    gl.uniform1f(materialLoc.shininess, material.shininess);

    // 光照加载
    for (let i = 0; i < NR_DIR_LIGHTS; i++) {
        let lightLoc = dirLightsLoc[i];
        let light = dirLights[i];
        gl.uniform3fv(lightLoc.lightDir, light.lightDir);
        gl.uniform3fv(lightLoc.ambient, light.ambient);
        gl.uniform3fv(lightLoc.diffuse, light.diffuse);
        gl.uniform3fv(lightLoc.specular, light.specular);
    }
    for (let j = 0; j < NR_POINT_LIGHTS; j++) {
        let lightLoc = pointLightsLoc[j];
        let light = pointLights[j];
        gl.uniform3fv(lightLoc.lightPos, light.lightPos);
        gl.uniform1f(lightLoc.constant, light.constant);
        gl.uniform1f(lightLoc.linear, light.linear);
        gl.uniform1f(lightLoc.quadratic, light.quadratic);
        gl.uniform3fv(lightLoc.ambient, light.ambient);
        gl.uniform3fv(lightLoc.diffuse, light.diffuse);
        gl.uniform3fv(lightLoc.specular, light.specular);
    }

    const modifyEye = (angle: number) => {
        const T = 60;
        const offset_y = Math.sin((angle * Math.PI) / T) * 4;
        const rotate = mat4.create();
        mat4.rotateY(rotate, rotate, (angle * Math.PI) / 180);
        mat4.rotateX(rotate, rotate, -Math.PI / 8);
        const eyePos = vec3.fromValues(0, offset_y, 8);
        vec3.transformMat4(eyePos, eyePos, rotate);

        // 视线矩阵
        const view = mat4.create();
        mat4.lookAt(view, eyePos, [0, 0, 0], [0, 1, 0]);
        gl.uniformMatrix4fv(viewLoc, false, view);

        // 摄像机位置
        gl.uniform3fv(eyePosLoc, eyePos);
    };

    const drawObjects = (modelMats: mat4[]) => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        modelMats.forEach((model) => {
            gl.uniformMatrix4fv(modelLoc, false, model);
            cubeModel.draw();
        });
    };

    return (angle: number) => {
        modifyEye(angle);
        drawObjects(modalMats);
    };
}
