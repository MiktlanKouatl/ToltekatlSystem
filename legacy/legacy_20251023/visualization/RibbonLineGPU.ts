// src/core/RibbonLineGPU.ts

import * as THREE from 'three';
import { RibbonConfig, RenderMode } from './RibbonLine'; 
// Asegúrate de que los shaders existan en estas rutas
import proceduralVertexShader from '../shaders/proceduralCircle.vert.glsl?raw'; 
import fireFragmentShader from '../shaders/fire.frag.glsl?raw';

export class RibbonLineGPU {
    public mesh: THREE.Mesh;
    public material: THREE.ShaderMaterial;
    private geometry: THREE.BufferGeometry;

    constructor(config: RibbonConfig) {
        // --- 1. La Geometría Base es un "Andamio" Simple ---
        // Ya no necesita `pathPoints`, solo la resolución de la cinta.
        this.geometry = this.createRibbonScaffold(config.maxLength);

        // --- 2. El Material ahora es Procedural ---
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            blending: config.renderMode === RenderMode.Glow ? THREE.AdditiveBlending : THREE.NormalBlending,
            
            uniforms: {
                // Uniforms de estilo
                u_time: { value: 0 },
                u_color: { value: config.color },
                u_width: { value: config.width },

                // ¡NUEVOS UNIFORMS para el círculo procedural!
                // Estos serán actualizados desde fuera en cada fotograma.
                u_center: { value: new THREE.Vector3() },
                u_radius: { value: 1.0 },

                // Uniforms para el efecto de fuego (del fire.frag.glsl)
                u_noiseScale: { value: 3.5 },
                u_noiseSpeed: { value: 0.3 },
                u_distortionIntensity: { value: 0.03 },
            },
            vertexShader: proceduralVertexShader,
            fragmentShader: fireFragmentShader,
        }); 

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;
    }

    // Método para crear la geometría base de la cinta
    private createRibbonScaffold(maxPoints: number): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        // Usamos a_progress para saber en qué parte del círculo estamos (0.0 a 1.0)
        const progress = new Float32Array(maxPoints * 2);
        const sides = new Float32Array(maxPoints * 2);
        const uvs = new Float32Array(maxPoints * 2 * 2);

        for (let i = 0; i < maxPoints; i++) {
            const p = i / (maxPoints - 1);
            const i2 = i * 2;
            
            progress[i2] = p;
            progress[i2 + 1] = p;

            sides[i2] = -1;
            sides[i2 + 1] = 1;

            uvs[i2 * 2] = p;
            uvs[i2 * 2 + 1] = 0;
            uvs[(i2 + 1) * 2] = p;
            uvs[(i2 + 1) * 2 + 1] = 1;
        }

        geometry.setAttribute('a_progress', new THREE.BufferAttribute(progress, 1));
        geometry.setAttribute('a_side', new THREE.BufferAttribute(sides, 1));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

        const indexBuffer = [];
        for (let i = 0; i < maxPoints - 1; i++) {
            const n = i * 2;
            indexBuffer.push(n, n + 1, n + 2, n + 2, n + 1, n + 3);
        }
        geometry.setIndex(indexBuffer);
        return geometry;
    }

    // Los métodos updatePath y createPathTexture ya no son necesarios
    
    public dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
    }
}