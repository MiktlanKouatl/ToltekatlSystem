// TonalRing.ts (Versión 4.0 - Renderizador Puro)

import * as THREE from 'three';
import vertexShader from '../shaders/tonalRing.vert.glsl?raw';
import fragmentShader from '../shaders/tonalRing.frag.glsl?raw';

export class TonalRing {
    public mesh: THREE.Mesh;
    public material: THREE.ShaderMaterial;
    private geometry: THREE.BufferGeometry;

    constructor(particleCount: number = 20, segmentsPerParticle: number = 16) {
        const totalSegments = particleCount * segmentsPerParticle;

        // 1. Crear la geometría "andamio"
        this.geometry = this.createScaffoldGeometry(totalSegments);

        // 2. Crear el material
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            uniforms: {
                // La textura con las posiciones vendrá de afuera
                uPositionTexture: { value: null }, 
                uControlPointsCount: { value: particleCount },
                uRibbonWidth: { value: 0.15 },
            },
            vertexShader,
            fragmentShader,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    private createScaffoldGeometry(totalSegments: number): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        const progress = new Float32Array(totalSegments * 2);
        const sides = new Float32Array(totalSegments * 2);

        for (let i = 0; i < totalSegments; i++) {
            const p = i / (totalSegments - 1);
            progress[i * 2] = p;
            progress[i * 2 + 1] = p;
            sides[i * 2] = -1;
            sides[i * 2 + 1] = 1;
        }

        geometry.setAttribute('a_progress', new THREE.BufferAttribute(progress, 1));
        geometry.setAttribute('a_side', new THREE.BufferAttribute(sides, 1));

        const indices = [];
        for (let i = 0; i < totalSegments - 1; i++) {
            const n = i * 2;
            indices.push(n, n + 1, n + 2);
            indices.push(n + 2, n + 1, n + 3);
        }
        geometry.setIndex(indices);
        return geometry;
    }

    public getTonalPosition(tonalIndex: number): THREE.Vector3 {
        // Asumimos 20 tonales distribuidos equitativamente en un círculo de radio 5.
        const angle = (tonalIndex / 20) * Math.PI * 2;
        const radius = 5;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Creamos el vector de posición local
        const localPosition = new THREE.Vector3(x, y, 0);
        
        // Aseguramos que la matriz mundial del mesh esté actualizada
        this.mesh.updateWorldMatrix(true, false);
        
        // Transformamos la posición local a coordenadas mundiales
        return localPosition.applyMatrix4(this.mesh.matrixWorld);
    }
}