import { mat4, vec3 } from 'gl-matrix';
import { createProgram, createShader, initTexture } from '../../utils/glUtils';
import postVs from './postShader.vs';
import deferredVs from './deferredShader.vs';
import postFs from './postShader.fs';
import initialDeferredFs from './deferredShader.fs';
import { Cube } from '../../utils/model';
import { DirLightLoc, MaterialLoc, PointLightLoc } from '../../utils/type';
import {
    dirLights,
    modalMats,
    NR_DIR_LIGHTS,
    NR_POINT_LIGHTS,
    pointLights,
} from '../data';

let deferredFs = initialDeferredFs;
deferredFs = String.prototype.replace.call(
    deferredFs,
    'NR_DIR_LIGHTS 1',
    `NR_DIR_LIGHTS ${NR_DIR_LIGHTS}`,
);
deferredFs = String.prototype.replace.call(
    deferredFs,
    'NR_POINT_LIGHTS 1',
    `NR_POINT_LIGHTS ${NR_POINT_LIGHTS}`,
);

function getLocations(
    gl: WebGL2RenderingContext,
    postProgram: WebGLProgram,
    deferredProgram: WebGLProgram,
) {
    const positionLoc = gl.getAttribLocation(postProgram, 'position');
    const normalLoc = gl.getAttribLocation(postProgram, 'normal');
    const projectionLoc = gl.getUniformLocation(postProgram, 'projection');
    const modelLoc = gl.getUniformLocation(postProgram, 'model');
    const viewLoc = gl.getUniformLocation(postProgram, 'view');
    // fs
    const eyePosLoc = gl.getUniformLocation(deferredProgram, 'eyePos');
    const materialLoc: MaterialLoc = {
        ambient: gl.getUniformLocation(postProgram, 'material.ambient'),
        diffuse: gl.getUniformLocation(postProgram, 'material.diffuse'),
        specular: gl.getUniformLocation(postProgram, 'material.specular'),
        shininess: gl.getUniformLocation(postProgram, 'material.shininess'),
    };
    const dirLightsLoc: DirLightLoc[] = [];
    for (let i = 0; i < NR_DIR_LIGHTS; i++) {
        const dirLightLoc: DirLightLoc = {
            lightDir: gl.getUniformLocation(
                deferredProgram,
                `dirLights[${i}].lightDir`,
            ),
            ambient: gl.getUniformLocation(
                deferredProgram,
                `dirLights[${i}].ambient`,
            ),
            diffuse: gl.getUniformLocation(
                deferredProgram,
                `dirLights[${i}].diffuse`,
            ),
            specular: gl.getUniformLocation(
                deferredProgram,
                `dirLights[${i}].specular`,
            ),
        };
        dirLightsLoc.push(dirLightLoc);
    }
    const pointLightsLoc: PointLightLoc[] = [];
    for (let j = 0; j < NR_POINT_LIGHTS; j++) {
        const pointLightLoc: PointLightLoc = {
            lightPos: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].lightPos`,
            ),
            constant: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].constant`,
            ),
            linear: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].linear`,
            ),
            quadratic: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].quadratic`,
            ),
            ambient: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].ambient`,
            ),
            diffuse: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].diffuse`,
            ),
            specular: gl.getUniformLocation(
                deferredProgram,
                `pointLights[${j}].specular`,
            ),
        };
        pointLightsLoc.push(pointLightLoc);
    }

    const aPositionLoc = gl.getAttribLocation(deferredProgram, 'aPosition');
    const aTexcoordLoc = gl.getAttribLocation(deferredProgram, 'aTexcoord');
    const gPositionLoc = gl.getUniformLocation(deferredProgram, 'gPosition');
    const gNormalLoc = gl.getUniformLocation(deferredProgram, 'gNormal');
    const gDiffuseLoc = gl.getUniformLocation(deferredProgram, 'gDiffuse');
    const gSpecularLoc = gl.getUniformLocation(deferredProgram, 'gSpecular');
    const gAmbientShininessLoc = gl.getUniformLocation(
        deferredProgram,
        'gAmbientShininess',
    );

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
        aPositionLoc,
        aTexcoordLoc,
        gPositionLoc,
        gNormalLoc,
        gDiffuseLoc,
        gSpecularLoc,
        gAmbientShininessLoc,
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
    const postVertexShader = createShader(gl, gl.VERTEX_SHADER, postVs);
    const postFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, postFs);
    const postProgram = createProgram(gl, postVertexShader, postFragmentShader);
    const deferredVertexShader = createShader(gl, gl.VERTEX_SHADER, deferredVs);
    const deferredFragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        deferredFs,
    );
    const deferredProgram = createProgram(
        gl,
        deferredVertexShader,
        deferredFragmentShader,
    );
    if (!postProgram || !deferredProgram) {
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
        aPositionLoc,
        aTexcoordLoc,
        gPositionLoc,
        gNormalLoc,
        gDiffuseLoc,
        gSpecularLoc,
        gAmbientShininessLoc,
    } = getLocations(gl, postProgram, deferredProgram);

    // data
    // uniform
    const material = {
        ambient: [0.19225, 0.19225, 0.19225],
        diffuse: [0.50754, 0.50754, 0.50754],
        specular: [0.508273, 0.508273, 0.508273],
        shininess: 0.4,
    };
    let eyePos: vec3 = [0, 0, 0];
    // 视线矩阵
    const view = mat4.create();

    const cubeModel = new Cube(gl);
    cubeModel.load(positionLoc, normalLoc);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(postProgram);

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

    gl.useProgram(deferredProgram);

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

    const deferredVertexArray = gl.createVertexArray();
    gl.bindVertexArray(deferredVertexArray);
    // 顶点纹理坐标缓冲
    const deferredPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, deferredPosBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);
    const deferredTexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, deferredTexBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(aTexcoordLoc);
    gl.vertexAttribPointer(aTexcoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindVertexArray(null);

    // 帧缓冲
    gl.getExtension('EXT_color_buffer_float');
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const attachments: number[] = [];

    // 帧缓冲渲染到纹理对象
    const textures: WebGLTexture[] = [];
    for (let i = 0; i < 5; i++) {
        const texture = initTexture(gl, gl.canvas.width, gl.canvas.height);
        textures.push(texture);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.TEXTURE_2D,
            texture,
            0,
        );
        attachments.push(gl.COLOR_ATTACHMENT0 + i);
    }

    // 深度缓冲
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        gl.canvas.width,
        gl.canvas.height,
    );
    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer,
    );

    gl.drawBuffers(attachments);

    const modifyEye = (angle: number) => {
        const T = 60;
        const offset_y = Math.sin((angle * Math.PI) / T) * 4;
        const rotate = mat4.create();
        mat4.rotateY(rotate, rotate, (angle * Math.PI) / 180);
        mat4.rotateX(rotate, rotate, -Math.PI / 8);
        eyePos = vec3.fromValues(0, offset_y, 8);
        vec3.transformMat4(eyePos, eyePos, rotate);
        gl.useProgram(deferredProgram);
        gl.uniform3fv(eyePosLoc, eyePos);

        mat4.lookAt(view, eyePos, [0, 0, 0], [0, 1, 0]);
        gl.useProgram(postProgram);
        gl.uniformMatrix4fv(viewLoc, false, view);
    };

    const drawObjectsBuffer = (modelMats: mat4[]) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(postProgram);
        modelMats.forEach((model) => {
            gl.uniformMatrix4fv(modelLoc, false, model);
            cubeModel.draw();
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };

    const drawObjects = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(deferredProgram);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindVertexArray(deferredVertexArray);
        const locs = [
            gPositionLoc,
            gNormalLoc,
            gDiffuseLoc,
            gSpecularLoc,
            gAmbientShininessLoc,
        ];
        textures.forEach((texture, index) => {
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(locs[index], index);
        });
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindVertexArray(null);
    };

    return (angle: number) => {
        modifyEye(angle);
        drawObjectsBuffer(modalMats);
        drawObjects();
    };
}
