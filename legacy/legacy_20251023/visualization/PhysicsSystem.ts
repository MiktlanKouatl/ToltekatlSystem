import * as THREE from 'three';
import physicsFragmentShader from '../shaders/physics.frag.glsl?raw';

// Esta clase manejará el bucle de "ping-pong"
export class PhysicsSystem {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.OrthographicCamera;
    
    public particleStateA: THREE.WebGLRenderTarget;
    public particleStateB: THREE.WebGLRenderTarget;
    
    private physicsMaterial: THREE.ShaderMaterial;
    private particleCount: number;

    private defaultRadius = 5.0; // Guardamos el radio por defecto
    private readBuffer: Float32Array;


    constructor(renderer: THREE.WebGLRenderer, particleCount: number = 20, initialRadius: number = 5.0) {
        this.renderer = renderer;
        this.particleCount = particleCount;
        this.readBuffer = new Float32Array(this.particleCount * 4);

        const angleStep = (Math.PI * 2) / particleCount;
        const restLength = 2 * initialRadius * Math.sin(angleStep / 2);


        // 1. Crear las texturas (Render Targets) para el estado
        const options = {
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
        };
        this.particleStateA = new THREE.WebGLRenderTarget(particleCount, 1, options);
        this.particleStateB = new THREE.WebGLRenderTarget(particleCount, 1, options);
        const initialRadialLengths = new Float32Array(particleCount).fill(initialRadius);

        this.initializeState(this.particleStateA, initialRadius);

        this.physicsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                u_positions: { value: null },
                u_particleCount: { value: particleCount },
                u_restLength: { value: restLength },
                u_springStiffness: { value: 50.0 },
                u_damping: { value: 5.0 },
                u_deltaTime: { value: 0.0 },
                //u_radialStiffness: { value: 15.0 },
                //u_radialRestLengths: { value: initialRadialLengths },
            },
            fragmentShader: physicsFragmentShader,
        });
        
        // 3. Escena interna para correr el shader
        this.scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(2, 2);
        this.scene.add(new THREE.Mesh(geometry, this.physicsMaterial));
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    /* public highlightTonals(indices: number[], highlightRadius: number): void {
        const lengths = this.physicsMaterial.uniforms.u_radialRestLengths.value;
        
        if (indices.length === 0) {
            lengths.fill(this.defaultRadius);
            return;
        }

        const highlightCount = indices.length;
        const normalCount = this.particleCount - highlightCount;
        
        const angleStep = (Math.PI * 2) / this.particleCount;
        const defaultChordLength = 2 * this.defaultRadius * Math.sin(angleStep / 2);
        const totalCircumferenceApprox = this.particleCount * defaultChordLength;

        const highlightChordLength = 2 * highlightRadius * Math.sin(angleStep / 2);
        const highlightedCircumference = highlightCount * highlightChordLength;
        
        const remainingCircumference = totalCircumferenceApprox - highlightedCircumference;
        const newNormalChordLength = remainingCircumference / normalCount;
        const newNormalRadius = (newNormalChordLength / 2) / Math.sin(angleStep / 2);

        for (let i = 0; i < this.particleCount; i++) {
            lengths[i] = indices.includes(i) ? highlightRadius : newNormalRadius;
        }
    } */

    /* public setTonalRadius(index: number, radius: number) {
        const lengths = this.physicsMaterial.uniforms.u_radialRestLengths.value;
        for (let i = 0; i < this.particleCount; i++) {
            // Al tonal seleccionado le ponemos el nuevo radio,
            // a todos los demás los volvemos a su estado normal.
            lengths[i] = (i === index) ? radius : this.defaultRadius;
        }
    } */

    // Establece las posiciones iniciales de las partículas
    private initializeState(target: THREE.WebGLRenderTarget, radius: number) { // <-- 1. AÑADIR 'radius: number' AQUÍ
        const data = new Float32Array(this.particleCount * 4);
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (i / this.particleCount) * Math.PI * 2;
            data[i * 4 + 0] = Math.cos(angle) * radius; // <-- 2. USAR 'radius' EN LUGAR DE '5'
            data[i * 4 + 1] = Math.sin(angle) * radius; // <-- 3. Y AQUÍ TAMBIÉN
            // Z (pos) y W (vel) empiezan en 0
        }
        const texture = new THREE.DataTexture(data, this.particleCount, 1, THREE.RGBAFormat, THREE.FloatType);
        texture.needsUpdate = true;

        const tempScene = new THREE.Scene();
        const tempCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const tempMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.MeshBasicMaterial({ map: texture })
        );
        tempScene.add(tempMesh);

        this.renderer.setRenderTarget(target);
        this.renderer.render(tempScene, tempCam);
        this.renderer.setRenderTarget(null);
    }

    public readPositions(): THREE.Vector3[] {
        this.renderer.readRenderTargetPixels(this.particleStateA, 0, 0, this.particleCount, 1, this.readBuffer);
        const positions: THREE.Vector3[] = [];
        for (let i = 0; i < this.particleCount; i++) {
            positions.push(new THREE.Vector3(this.readBuffer[i * 4], this.readBuffer[i * 4 + 1], this.readBuffer[i * 4 + 2]));
        }
        return positions;
    }
    
    // El bucle de actualización
    public update(deltaTime: number) {
        this.physicsMaterial.uniforms.u_deltaTime.value = deltaTime;
        
        // --- LA LÍNEA QUE FALTABA ---
        // Le decimos al shader que LEA de la textura A (el estado anterior)
        this.physicsMaterial.uniforms.u_positions.value = this.particleStateA.texture;
        
        // Le decimos al renderizador que ESCRIBA en la textura B (el nuevo estado)
        this.renderer.setRenderTarget(this.particleStateB);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);

        // Hacemos el "ping-pong" para el siguiente frame
        [this.particleStateA, this.particleStateB] = [this.particleStateB, this.particleStateA];
    }
}