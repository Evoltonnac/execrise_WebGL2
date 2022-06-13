import { mat4, vec3 } from 'gl-matrix';
import { DirLight, PointLight } from '../utils/type';

const genModalMats = (): mat4[] => {
    const mats: mat4[] = [];
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            for (let k = 0; k < 4; k++) {
                let x = 5 - i;
                let y = k;
                let z = 5 - j;
                const mat = mat4.create();
                mat4.translate(mat, mat, [x, y, z]);
                mat4.rotateY(mat, mat, (i * j * Math.PI) / 180);
                mat4.scale(mat, mat, [0.1, 0.1, 0.1]);
                mats.push(mat);
            }
        }
    }
    return mats;
};

const colors: vec3[] = [
    [0, 0, 1],
    [0, 1, 0],
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 1],
    [1, 1, 1],
];

const genDirLights = (count: number): DirLight[] => {
    if (count === 1) {
        return [
            {
                lightDir: [0, 0.5, 0],
                ambient: [0.01, 0.01, 0.01],
                diffuse: [0, 0, 1],
                specular: [0, 0, 1],
            },
        ];
    }
    const dirLights: DirLight[] = [];
    for (let i = 0; i < count; i++) {
        const rx = Math.random() * 2 - 1;
        const ry = Math.random() * 2 - 1;
        const rz = Math.random() * 2 - 1;
        const r = Math.min(Math.abs(rx * ry * rz) * 2, 1);
        dirLights.push({
            lightDir: [rx, ry, rz],
            ambient: [0.01, 0.01, 0.01],
            diffuse: colors[i % 6].map((v) => (v * 4) / 50) as vec3,
            specular: colors[i % 6].map((v) => v / 10) as vec3,
        });
    }
    return dirLights;
};

const genPointLights = (count: number): PointLight[] => {
    if (count === 1) {
        return [
            {
                lightPos: [0, 3, 5.5],
                constant: 1,
                linear: 2,
                quadratic: 1,
                ambient: [0.01, 0.01, 0.01],
                diffuse: [0.5, 0, 0],
                specular: [0.5, 0, 0],
            },
        ];
    }
    const pointLights: PointLight[] = [];
    for (let i = 0; i < count; i++) {
        const rx = Math.random() * 2 - 1;
        const ry = Math.random() * 2 - 1;
        const rz = Math.random() * 2 - 1;
        const r = Math.min(Math.abs(rx * ry * rz) * 2, 1);
        pointLights.push({
            lightPos: [rx * 5, ry * 2 + 2, rz * 5],
            constant: 1,
            linear: 2,
            quadratic: 1,
            ambient: [0.01, 0.01, 0.01],
            diffuse: colors[i % 6].map((v) => (Math.abs(v) * 4) / 5) as vec3,
            specular: colors[i % 6] as vec3,
        });
    }
    return pointLights;
};

const NR_DIR_LIGHTS = 2;
const NR_POINT_LIGHTS = 100;
const modalMats = genModalMats();
const dirLights = genDirLights(NR_DIR_LIGHTS);
const pointLights = genPointLights(NR_POINT_LIGHTS);
export { NR_DIR_LIGHTS, NR_POINT_LIGHTS, modalMats, dirLights, pointLights };
