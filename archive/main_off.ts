import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ToltekatlSystem } from './core/ToltekatlSystem';
import { RingHarmonizer } from './core/RingHarmonizer';
import { TracerSystem } from './core/TracerSystem'; // <-- El nuevo sistema de trazadores
import gsap from 'gsap';

// --- CONFIGURACIÓN BÁSICA ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101015);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12;
const controls = new OrbitControls(camera, renderer.domElement);

// --- SISTEMAS (Cerebro y Estratega) ---
const PARTICLE_COUNT = 20;
const toltekaSystem = new ToltekatlSystem();
const harmonizer = new RingHarmonizer();

// --- VISUALIZACIÓN (Músculo en GPU) ---
// 1. Los círculos base de los tonales
const circleGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 100);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const tonalMeshes = new THREE.InstancedMesh(circleGeometry, circleMaterial, PARTICLE_COUNT);

// 2. El sistema de trazadores de energía
const tracerSystem = new TracerSystem(PARTICLE_COUNT, 2); // 2 trazadores por tonal

// 3. El grupo que rota
const wheelGroup = new THREE.Group();
//wheelGroup.add(tonalMeshes);
wheelGroup.add(tracerSystem.mesh); // <-- Añadimos los trazadores al mismo grupo
scene.add(wheelGroup);

// --- ESTADO Y LÓGICA DE ANIMACIÓN ---
const tonalScales = new Array(PARTICLE_COUNT).fill(1.0);
let highlightedIndex = 0;

// --- INTERACCIÓN ---
document.getElementById('prevBtn')?.addEventListener('click', () => { toltekaSystem.prevTonal(); updateVisuals(); });
document.getElementById('nextBtn')?.addEventListener('click', () => { toltekaSystem.nextTonal(); updateVisuals(); });

function updateVisuals() {
    const state = toltekaSystem.getState();
    highlightedIndex = state.tonal.index;
    
    gsap.killTweensOf(tonalScales);
    const targetScale = 2.5;
    const compensatedScale = (PARTICLE_COUNT - targetScale) / (PARTICLE_COUNT - 1);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const newScale = (i === highlightedIndex) ? targetScale : compensatedScale;
        gsap.to(tonalScales, { duration: 1.0, ease: 'power3.inOut', [i]: newScale });
    }
}

// --- BUCLE DE ANIMACIÓN (El Director) ---
const dummy = new THREE.Object3D();
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    // 1. El Armonizador (CPU) calcula la geometría ideal
    harmonizer.update(tonalScales);

    // 2. Actualizamos la visualización con los datos del armonizador
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        dummy.position.copy(harmonizer.positions[i]);
        dummy.scale.set(harmonizer.scales[i], harmonizer.scales[i], harmonizer.scales[i]);
        dummy.updateMatrix();
        tonalMeshes.setMatrixAt(i, dummy.matrix);
    }
    tonalMeshes.instanceMatrix.needsUpdate = true;

    // 3. Actualizamos el sistema de trazadores (GPU)
    tracerSystem.update(harmonizer, elapsedTime);

    // 4. Lógica de Rotación Precisa
    const markerAngle = Math.PI / 2;
    const actualTonalAngle = harmonizer.centerAngles[highlightedIndex];
    let targetRotationZ = -actualTonalAngle + markerAngle;

    const twoPi = Math.PI * 2;
    let delta = targetRotationZ - wheelGroup.rotation.z;
    if (delta > Math.PI) targetRotationZ -= twoPi;
    else if (delta < -Math.PI) targetRotationZ += twoPi;
    
    wheelGroup.rotation.z = THREE.MathUtils.lerp(wheelGroup.rotation.z, targetRotationZ, 0.08);

    controls.update();
    renderer.render(scene, camera);
}

// --- INICIO ---
updateVisuals();
animate();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});





/* import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ToltekatlSystem } from './core/ToltekatlSystem';
import { RingHarmonizer } from './core/RingHarmonizer';
import { RibbonManager } from './core/RibbonManager'; // <-- Importamos el nuevo manager
import gsap from 'gsap';

// --- CONFIGURACIÓN BÁSICA ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101015);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12;
const controls = new OrbitControls(camera, renderer.domElement);

// --- SISTEMAS ---
const PARTICLE_COUNT = 20;
const toltekaSystem = new ToltekatlSystem();
const harmonizer = new RingHarmonizer();

// --- VISUALIZACIÓN ---
const circleGeometry = new THREE.TorusGeometry(0.5, 0.05, 16, 100);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const tonalMeshes = new THREE.InstancedMesh(circleGeometry, circleMaterial, PARTICLE_COUNT);
const wheelGroup = new THREE.Group();
wheelGroup.add(tonalMeshes);
scene.add(wheelGroup);

// ¡Creamos una instancia del RibbonManager y le pasamos la escena!
const ribbonManager = new RibbonManager(scene, PARTICLE_COUNT, 2); // 2 trazadores por tonal

// --- ESTADO Y LÓGICA DE ANIMACIÓN ---
const tonalScales = new Array(PARTICLE_COUNT).fill(1.0);
let highlightedIndex = 0;

// --- INTERACCIÓN ---
document.getElementById('prevBtn')?.addEventListener('click', () => { toltekaSystem.prevTonal(); updateVisuals(); });
document.getElementById('nextBtn')?.addEventListener('click', () => { toltekaSystem.nextTonal(); updateVisuals(); });

function updateVisuals(isInitial: boolean = false) {
    const state = toltekaSystem.getState();
    highlightedIndex = state.tonal.index;
    
    gsap.killTweensOf(tonalScales);
    const targetScale = 2.5;
    const compensatedScale = (PARTICLE_COUNT - targetScale) / (PARTICLE_COUNT - 1);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const newScale = (i === highlightedIndex) ? targetScale : compensatedScale;
        gsap.to(tonalScales, { duration: 1.0, ease: 'power3.inOut', [i]: newScale });
    }
    
    // El setTimeout para la rotación se queda como estaba, es correcto.
    setTimeout(() => {
        const markerAngle = Math.PI / 2;
        const actualTonalAngle = harmonizer.centerAngles[highlightedIndex];
        const targetRotationZ = -actualTonalAngle + markerAngle;

        gsap.to(wheelGroup.rotation, {
            duration: isInitial ? 0 : 1.2,
            ease: 'power2.inOut',
            z: targetRotationZ,
        });
    }, 16);
}

// --- BUCLE DE ANIMACIÓN ---
const dummy = new THREE.Object3D();
const clock = new THREE.Clock(); // El RibbonManager necesita el tiempo
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    // 1. El Armonizador calcula la geometría del anillo
    harmonizer.update(tonalScales);

    // 2. El RibbonManager actualiza todos los trazadores
    ribbonManager.update(harmonizer, elapsedTime);

    // 3. Actualizamos los círculos base
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        dummy.position.copy(harmonizer.positions[i]);
        dummy.scale.set(harmonizer.scales[i], harmonizer.scales[i], harmonizer.scales[i]);
        dummy.updateMatrix();
        tonalMeshes.setMatrixAt(i, dummy.matrix);
    }
    tonalMeshes.instanceMatrix.needsUpdate = true;

    // La lógica de rotación ya no es necesaria aquí, GSAP la maneja.
    
    controls.update();
    renderer.render(scene, camera);
}

// --- INICIO ---
updateVisuals(true);
animate();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}); */