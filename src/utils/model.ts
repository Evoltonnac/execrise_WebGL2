import { AttributeLoc, Loc, Material } from './type';

import cubeData from '../model/cube';

// 基础3D模型
abstract class Model {
    // WebGL上下文
    glContext: WebGL2RenderingContext;
    isLoaded: boolean = false;
    // 顶点数组
    vertexArray: WebGLVertexArrayObject;
    // 顶点位置数据
    vertexPositions: Float32Array;
    // 顶点法线数据
    vertexNormals: Float32Array;
    // 顶点索引数据
    vertexIndices: Uint16Array;

    constructor(
        glContext: WebGL2RenderingContext,
        vertexPositions: Float32Array,
        vertexNormals: Float32Array,
        vertexIndices: Uint16Array,
    ) {
        this.glContext = glContext;
        this.vertexArray = glContext.createVertexArray();
        this.vertexPositions = vertexPositions;
        this.vertexNormals = vertexNormals;
        this.vertexIndices = vertexIndices;
    }

    // 加载模型数据
    abstract load(...params: unknown[]): void;

    // 绘制模型
    abstract draw(...params: unknown[]): void;
}

// 基础正方体
export class Cube extends Model {
    constructor(glContext: WebGL2RenderingContext) {
        super(
            glContext,
            cubeData.positions,
            cubeData.normals,
            cubeData.indices,
        );
    }

    load(vertexPositionsLoc: AttributeLoc, vertexNormalsLoc: AttributeLoc) {
        if (this.isLoaded) {
            return;
        }
        const {
            glContext: gl,
            vertexArray,
            vertexPositions,
            vertexNormals,
            vertexIndices,
        } = this;
        gl.bindVertexArray(vertexArray);

        // 顶点位置缓冲
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(vertexPositionsLoc);
        gl.vertexAttribPointer(vertexPositionsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // 顶点法线缓冲
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(vertexNormalsLoc);
        gl.vertexAttribPointer(vertexNormalsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        // 顶点索引缓冲
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndices, gl.STATIC_DRAW);

        gl.bindVertexArray(null);
        this.isLoaded = true;
    }

    draw() {
        const { glContext: gl, vertexArray } = this;
        gl.bindVertexArray(vertexArray);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}
