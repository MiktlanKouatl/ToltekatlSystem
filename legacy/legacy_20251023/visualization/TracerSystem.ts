// src/core/TracerSystem.ts
import * as THREE from 'three';
import { RingHarmonizer } from './RingHarmonizer';
import vertexShader from '../shaders/tracer.vert.glsl?raw';
import fragmentShader from '../shaders/tracer.frag.glsl?raw'; // Un shader de fragmento simple

export class TracerSystem {
    public mesh: THREE.InstancedMesh;
    private material: THREE.ShaderMaterial;
    private tracerCount: number;

    constructor(particleCount: number = 20, tracersPerTonal: number = 2) {
        this.tracerCount = particleCount * tracersPerTonal;

        // La geometría base es la de una sola cinta, que se repetirá
        const ribbonMaxPoints = 15;
        const geometry = this.createRibbonGeometry(ribbonMaxPoints);
        
        // --- NUEVA LÓGICA DE ATRIBUTOS ---
        const customData = new Float32Array(this.tracerCount * 4); // 4 floats por instancia: r, g, b, direccion
        const colors = [new THREE.Color(0x00ffff), new THREE.Color(0xff00ff)]; // Cian y Magenta

        for (let i = 0; i < particleCount; i++) {
            for (let j = 0; j < tracersPerTonal; j++) {
                const index = i * tracersPerTonal + j;
                const color = colors[j % colors.length];
                
                customData[index * 4 + 0] = color.r;
                customData[index * 4 + 1] = color.g;
                customData[index * 4 + 2] = color.b;
                customData[index * 4 + 3] = (j % 2 === 0) ? 1.0 : -1.0; // Dirección
            }
        }
        // Añadimos el atributo a la geometría. El '4' es porque pasamos 4 números (r,g,b,dir).
        geometry.setAttribute('a_customData', new THREE.InstancedBufferAttribute(customData, 4));

        this.material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                u_time: { value: 0 },
                u_trailLength: { value: 0.4 },
            }
        });

        this.mesh = new THREE.InstancedMesh(geometry, this.material, this.tracerCount);
    }

    public update(harmonizer: RingHarmonizer, elapsedTime: number) {
        this.material.uniforms.u_time.value = elapsedTime;

        const dummy = new THREE.Object3D();
        let instanceIdx = 0;
        for (let i = 0; i < harmonizer.positions.length; i++) {
            // Para cada uno de los 2 trazadores de este tonal
            for (let j = 0; j < 2; j++) {
                // Usamos la matriz de instancia para pasar los datos del círculo
                const position = harmonizer.positions[i];
                const radius = harmonizer.scales[i] * 0.5; // El radio del círculo
                
                // Pasamos la posición y el radio usando la matriz
                dummy.position.copy(position);
                dummy.scale.set(radius, radius, radius); // El radio se pasa por la escala
                dummy.updateMatrix();
                this.mesh.setMatrixAt(instanceIdx, dummy.matrix);

                // Podríamos pasar más datos (color, velocidad) usando InstancedBufferAttribute
                instanceIdx++;
            }
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    private createRibbonGeometry(maxPoints: number): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        const indices = new Float32Array(maxPoints * 2);
        const sides = new Float32Array(maxPoints * 2);

        for (let i = 0; i < maxPoints; i++) {
            const progress = i / (maxPoints - 1);
            indices[i * 2] = progress;
            indices[i * 2 + 1] = progress;
            sides[i * 2] = -1;
            sides[i * 2 + 1] = 1;
        }
        geometry.setAttribute('a_progress', new THREE.BufferAttribute(indices, 1));
        geometry.setAttribute('a_side', new THREE.BufferAttribute(sides, 1));
        
        // No necesitamos 'position' porque se calcula en el shader
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((maxPoints*2)*3), 3));


        const indexBuffer = [];
        for (let i = 0; i < maxPoints - 1; i++) {
            const n = i * 2;
            indexBuffer.push(n, n + 1, n + 2, n + 2, n + 1, n + 3);
        }
        geometry.setIndex(indexBuffer);
        return geometry;
    }
}