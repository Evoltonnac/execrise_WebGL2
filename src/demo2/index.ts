import { mat4 } from 'gl-matrix';

(function main() {
    let mata = mat4.create();
    let matb = mat4.create();
    mat4.ortho(mata, -2, 2, -2, 2, 2, 100);
    mat4.perspective(matb, Math.PI / 2, 1, 2, 100);
    mat4.multiply(mata, mata, [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 102, -1, 0, 0, 200, 0]);
    console.log(mata, matb);
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('Failed to get webgl rendering context');
        return;
    }
    const glProgram = gl.createProgram();
    // 画布背景色
    gl.clearColor(0.2, 0.2, 0.2, 1);

    // 顶点着色器
    const VSHADER_SOURCE = `#version 100
        #pragma vscode_glsllint_stage : vert
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        varying vec4 v_Color;
        uniform mat4 u_mat;
        void main() {
            gl_Position = u_mat * vec4(a_Position.x, a_Position.y, -6.0, 1.0);
            // gl_Position = u_mat * a_Position;
            v_Color = a_Color;
        }
    `;
    // 片元着色器
    const FSHADER_SOURCE = `#version 100
        #pragma vscode_glsllint_stage : frag
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec4 v_Color;
        void main() {
            gl_FragColor = v_Color;
        }
    `;

    // 初始化着色器程序
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, VSHADER_SOURCE);
    gl.compileShader(vShader);
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, FSHADER_SOURCE);
    gl.compileShader(fShader);
    gl.attachShader(glProgram, vShader);
    gl.attachShader(glProgram, fShader);
    gl.linkProgram(glProgram);
    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(glProgram);
        throw new Error('Could not compile WebGL program. \n\n' + info);
    }
    gl.useProgram(glProgram);

    gl.clear(gl.COLOR_BUFFER_BIT);

    const mvpMat = gl.getUniformLocation(glProgram, 'u_mat');
    const lookatmat = mat4.create();
    mat4.lookAt(lookatmat, [1, 0, -4], [0, 0, -6], [1, 1, 0]);
    mat4.multiply(lookatmat, matb, lookatmat);
    gl.uniformMatrix4fv(mvpMat, false, lookatmat);

    const a_Position = gl.getAttribLocation(glProgram, 'a_Position');
    const a_Color = gl.getAttribLocation(glProgram, 'a_Color');
    const myBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myBuffer);
    const myBufferData = new Float32Array([
        -0.5, 0.5, 1.0, 1.0, 0, 0.5, 0.5, 0, 1.0, 1.0, -0.5, -0.5, 1.0, 1.0, 1.0, 0.5, -0.5, 1.0, 0, 1.0,
    ]);
    const Fsize = myBufferData.BYTES_PER_ELEMENT;
    const n = 4;
    gl.bufferData(gl.ARRAY_BUFFER, myBufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Fsize * 5, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, Fsize * 5, Fsize * 2);
    gl.enableVertexAttribArray(a_Color);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
})();
