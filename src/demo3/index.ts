import { mat4, vec3 } from 'gl-matrix';
import { createProgram, createShader } from '../utils/glUtils';
import vs from './shader.vs';
import fs from './shader.fs';
import {
    DirLight,
    DirLightLoc,
    MaterialLoc,
    PointLight,
    PointLightLoc,
} from './type';

(function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get webgl2 rendering context');
        return;
    }

    const vertexSource = vs;

    const NR_DIR_LIGHTS = 1;
    const NR_POINT_LIGHTS = 3;
    const fragmentSource = fs;

    // init shader and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        console.log('Fail tp link program');
        return;
    }

    // get location
    // vs
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

    // data
    // attribute
    const cubeVertexPositions = new Float32Array([
        1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
        -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1,
        -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1,
        -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
    ]);
    const cubeVertexNormals = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 0, -1,
    ]);
    const cubeVertexIndices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
        14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]);
    // uniform
    const eyePos = vec3.fromValues(0, 4.0, 4.0);
    const material = {
        ambient: [0.19225, 0.19225, 0.19225],
        diffuse: [0.50754, 0.50754, 0.50754],
        specular: [0.508273, 0.508273, 0.508273],
        shininess: 0.4,
    };
    const dirLights: DirLight[] = [
        {
            lightDir: [1, 2, 0.5],
            ambient: [0.05, 0.05, 0.05],
            diffuse: [0.4, 0.4, 0.4],
            specular: [0.5, 0.5, 0.5],
        },
    ];
    const pointLights: PointLight[] = [
        {
            lightPos: [0, -1, 1.5],
            constant: 1,
            linear: 0.01,
            quadratic: 0.005,
            ambient: [0.05, 0.05, 0.05],
            diffuse: [0.8, 0.4, 0.4],
            specular: [1, 0.5, 0.5],
        },
        {
            lightPos: [0, 2, 0],
            constant: 1,
            linear: 0.01,
            quadratic: 0.005,
            ambient: [0.05, 0.05, 0.05],
            diffuse: [0.4, 0.4, 0.8],
            specular: [0.5, 0.5, 1],
        },
        {
            lightPos: [-2, 0, 0],
            constant: 1,
            linear: 0.01,
            quadratic: 0.005,
            ambient: [0.05, 0.05, 0.05],
            diffuse: [0.4, 0.8, 0.4],
            specular: [0.5, 1, 0.5],
        },
    ];

    // vertexArray
    const cubeVertexArray = gl.createVertexArray();
    gl.bindVertexArray(cubeVertexArray);

    // buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexPositions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexNormals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    // draw
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(program);
    gl.bindVertexArray(cubeVertexArray);

    const projection = mat4.create();
    mat4.perspective(
        projection,
        (60 * Math.PI) / 180,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        10,
    );
    gl.uniformMatrix4fv(projectionLoc, false, projection);

    const view = mat4.create();
    mat4.lookAt(view, eyePos, [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv(viewLoc, false, view);

    gl.uniform3fv(eyePosLoc, eyePos);

    gl.uniform3fv(materialLoc.ambient, material.ambient);
    gl.uniform3fv(materialLoc.diffuse, material.diffuse);
    gl.uniform3fv(materialLoc.specular, material.specular);
    gl.uniform1f(materialLoc.shininess, material.shininess);

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

    const drawCube = function (angle: number) {
        const model = mat4.create();
        mat4.rotateY(model, model, (angle * Math.PI) / 180);
        gl.uniformMatrix4fv(modelLoc, false, model);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    };

    // drawCube(-45);
    let time = Date.now();
    const rate = 30;
    let angle = 0;
    function draw() {
        requestAnimationFrame(() => {
            const now = Date.now();
            const offset = now - time;
            angle += (offset / 1000) * rate;
            time = now;
            drawCube(angle);
            draw();
        });
    }
    draw();
})();
