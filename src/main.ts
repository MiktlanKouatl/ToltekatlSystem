import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ToltekatlSystem } from './tonalpohualli-system/ToltekatlSystem';
import { RingHarmonizer } from './visualization/RingHarmonizer';
import { RingView } from './visualization/RingView';
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
const wheelGroup = new THREE.Group();
scene.add(wheelGroup);

// Creamos nuestra vista, que se encargará de todos los objetos 3D
const ringView = new RingView(wheelGroup);

// --- ESTADO Y LÓGICA DE ANIMACIÓN ---
const tonalScales = new Array(PARTICLE_COUNT).fill(1.0);
let highlightedIndex = 0;

// --- INTERACCIÓN ---
document.getElementById('prevBtn')?.addEventListener('click', () => { toltekaSystem.prevTonal(); updateVisuals(); });
document.getElementById('nextBtn')?.addEventListener('click', () => { toltekaSystem.nextTonal(); updateVisuals(); });

function updateVisuals() {
    const state = toltekaSystem.getState();
    highlightedIndex = state.tonal.index;
    
    gsap.killTweensOf(tonalScales); // Detenemos animaciones anteriores
    const targetScale = 1.5;
    const compensatedScale = (PARTICLE_COUNT - targetScale) / (PARTICLE_COUNT - 1);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const newScale = (i === highlightedIndex) ? targetScale : compensatedScale;
        gsap.to(tonalScales, {
            duration: 1.0,
            ease: 'power3.inOut',
            [i]: newScale,
        });
    }
}

// --- BUCLE DE ANIMACIÓN ---
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    // 1. El Armonizador (CPU) calcula la geometría ideal
    harmonizer.update(tonalScales);

    // 2. La Vista (GPU) recibe los datos y actualiza los objetos de Three.js
    ringView.update(harmonizer, elapsedTime, toltekaSystem.getState());
    
    // 3. Lógica de Rotación Precisa
    const markerAngle = Math.PI / 2;
    const actualTonalAngle = harmonizer.centerAngles[highlightedIndex];
    let targetRotationZ = -actualTonalAngle + markerAngle;

    const twoPi = Math.PI * 2;
    let delta = targetRotationZ - wheelGroup.rotation.z;
    if (delta > Math.PI) {
        targetRotationZ -= twoPi;
    } else if (delta < -Math.PI) {
        targetRotationZ += twoPi;
    }
    
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