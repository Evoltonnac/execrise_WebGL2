(function main() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('Failed to get webgl rendering context');
        return;
    }
    const glProgram = gl.createProgram();

    // 顶点着色器
    const VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main() {
            gl_Position = a_Position;
            gl_PointSize = 10.0;
        }
    `;
    // 片元着色器
    const FSHADER_SOURCE = `
        precision mediump float;
        uniform float u_Opacity;
        void main() {
            gl_FragColor = vec4(0.8, 0.4, u_Opacity, 1.0);
        }
    `;

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

    let points: Array<[number, number]> = [];
    function drawPoints(x: number, y: number) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        points.push([x, y]);
        const a_Position = gl.getAttribLocation(glProgram, 'a_Position');
        const u_Opacity = gl.getUniformLocation(glProgram, 'u_Opacity');
        points.forEach((point, index) => {
            gl.vertexAttrib2fv(a_Position, point);
            gl.uniform1f(u_Opacity, ((index % 40) + 1) / 40);
            gl.drawArrays(gl.POINTS, 0, 1);
        });
    }

    const mouseHandler = (e: MouseEvent) => {
        if (e.target) {
            const x = e.clientX;
            const y = e.clientY;
            const el_canvas = e.target as HTMLCanvasElement;
            const { left, top } = el_canvas.getBoundingClientRect();
            const { width, height } = canvas;
            drawPoints((2 * (x - left)) / width - 1, 1 - (2 * (y - top)) / height);
        }
    };
    // 鼠标点击
    canvas.addEventListener('click', mouseHandler);
    // 鼠标按下
    canvas.addEventListener('mousedown', () => {
        canvas.addEventListener('mousemove', mouseHandler);
    });

    // 鼠标抬起
    canvas.addEventListener('mouseup', () => {
        canvas.removeEventListener('mousemove', mouseHandler);
    });

    // 按下delete 清空画布和点数组
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete') {
            gl.clear(gl.COLOR_BUFFER_BIT);
            points = [];
        }
    });

    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
})();
