import { mat4, vec3 } from 'gl-matrix';
import { createProgram, createShader } from '../utils/glUtils';
import vs from './shader.vs';
import fs from './shader.fs';

(function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get webgl2 rendering context');
        return;
    }

    const vertexSource = vs;
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
    const positionLoc = gl.getAttribLocation(program, 'position');
    const normalLoc = gl.getAttribLocation(program, 'normal');
    const projectionLoc = gl.getUniformLocation(program, 'projection');
    const modelLoc = gl.getUniformLocation(program, 'model');
    const viewLoc = gl.getUniformLocation(program, 'view');
    const eyePosLoc = gl.getUniformLocation(program, 'eyePos');
    const materialLoc = {
        amibientLoc: gl.getUniformLocation(program, 'material.ambient'),
        diffuseLoc: gl.getUniformLocation(program, 'material.diffuse'),
        specularLoc: gl.getUniformLocation(program, 'material.specular'),
        shininessLoc: gl.getUniformLocation(program, 'material.shininess'),
    };
    const lightColorLoc = gl.getUniformLocation(program, 'lightColor');
    const parallelLightDirLoc = gl.getUniformLocation(
        program,
        'parallelLightDir',
    );
    const pointLightPosLoc = gl.getUniformLocation(program, 'pointLightPos');
    const pointLightColorLoc = gl.getUniformLocation(
        program,
        'pointLightColor',
    );

    // data
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
    const eyePos = vec3.fromValues(0, 4.0, 4.0);
    const material = {
        ambient: [0.19225, 0.19225, 0.19225],
        diffuse: [0.50754, 0.50754, 0.50754],
        specular: [0.508273, 0.508273, 0.508273],
        shininess: 0.4,
    };
    const lightColor = [1.0, 1.0, 0.85];
    const parallelLightDir = [2.0, 1.0, 0];
    const pointLightPos = [-2, -2, 1];
    1;
    const pointLightColor = [1.0, 0, 0];
    const cubeVertexIndices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12,
        14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
    ]);

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

    gl.uniform3fv(materialLoc.amibientLoc, material.ambient);
    gl.uniform3fv(materialLoc.diffuseLoc, material.diffuse);
    gl.uniform3fv(materialLoc.specularLoc, material.specular);
    gl.uniform1f(materialLoc.shininessLoc, material.shininess);

    gl.uniform3fv(eyePosLoc, eyePos);
    gl.uniform3fv(lightColorLoc, lightColor);
    gl.uniform3fv(parallelLightDirLoc, parallelLightDir);
    gl.uniform3fv(pointLightPosLoc, pointLightPos);
    gl.uniform3fv(pointLightColorLoc, pointLightColor);

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
