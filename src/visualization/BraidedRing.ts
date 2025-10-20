// BraidedRing.ts
import * as THREE from 'three';
import vertexShader from '../shaders/braidedRing.vert.glsl?raw'; // Usaremos un nuevo shader
import fragmentShader from '../shaders/braidedRing.frag.glsl?raw'; // Puede ser el mismo frag simple

export class BraidedRing {
    public outerMesh: THREE.Mesh;
    public innerMesh: THREE.Mesh;
    private outerMaterial: THREE.ShaderMaterial;
    private innerMaterial: THREE.ShaderMaterial;
    private geometry: THREE.BufferGeometry;

    constructor(particleCount: number = 20, segmentsPerParticle: number = 16) {
        const totalSegments = particleCount * segmentsPerParticle;
        this.geometry = this.createScaffoldGeometry(totalSegments);

        const uniforms = {
            uPositionTexture: { value: null }, 
            uControlPointsCount: { value: particleCount },
            uRibbonWidth: { value: 0.1 },
            uArcHeight: { value: 2.0 }, // ¡Nuevo! Controla qué tan "circulares" son los arcos
            uOffsetDirection: { value: 1.0 }, // Se sobreescribirá
        };

        // Material para la curva EXTERNA
        this.outerMaterial = new THREE.ShaderMaterial({
            side: THREE.DoubleSide, transparent: true, vertexShader, fragmentShader,
            uniforms: { ...THREE.UniformsUtils.clone(uniforms), uOffsetDirection: { value: 1.0 } }
        });
        this.outerMesh = new THREE.Mesh(this.geometry, this.outerMaterial);

        // Material para la curva INTERNA
        this.innerMaterial = new THREE.ShaderMaterial({
            side: THREE.DoubleSide, transparent: true, vertexShader, fragmentShader,
            uniforms: { ...THREE.UniformsUtils.clone(uniforms), uOffsetDirection: { value: -1.0 } }
        });
        this.innerMesh = new THREE.Mesh(this.geometry, this.innerMaterial);
    }
    
    public setPositionTexture(texture: THREE.Texture) {
        this.outerMaterial.uniforms.uPositionTexture.value = texture;
        this.innerMaterial.uniforms.uPositionTexture.value = texture;
    }

    // El método createScaffoldGeometry no cambia
    private createScaffoldGeometry(totalSegments: number): THREE.BufferGeometry {
        // ... (código idéntico al de TonalDualRibbon)
        const geometry = new THREE.BufferGeometry();
        const progress = new Float32Array(totalSegments * 2);
        const sides = new Float32Array(totalSegments * 2);
        for (let i = 0; i < totalSegments; i++) {
            const p = i / (totalSegments - 1);
            progress[i * 2] = p; progress[i * 2 + 1] = p;
            sides[i * 2] = -1; sides[i * 2 + 1] = 1;
        }
        geometry.setAttribute('a_progress', new THREE.BufferAttribute(progress, 1));
        geometry.setAttribute('a_side', new THREE.BufferAttribute(sides, 1));
        const indices = [];
        for (let i = 0; i < totalSegments - 1; i++) { const n = i * 2; indices.push(n, n + 1, n + 2); indices.push(n + 2, n + 1, n + 3); }
        geometry.setIndex(indices);
        return geometry;
    }
}