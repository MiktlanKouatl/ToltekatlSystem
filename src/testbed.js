
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// =================================================================================
// ÁREA DE PRUEBAS
// =================================================================================
// 1. Importa el componente que quieres probar desde su ruta en 'src'.
//    Ejemplo:
//    import { AnilloTonal } from './AnilloTonal.js';
// =================================================================================


// --- Configuración básica de la escena (Normalmente no necesitas modificar esto) ---

// 1. Escena y Cámara
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

// 2. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 3. Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 4. Ejes de coordenadas (ayuda visual)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


// =================================================================================
// INICIALIZACIÓN DEL COMPONENTE
// =================================================================================
// 2. Crea una instancia de tu componente y añádelo a la escena.
//    Ejemplo:
//    const miAnillo = new AnilloTonal();
//    scene.add(miAnillo.mesh);
// =================================================================================


// --- Bucle de Animación (Puedes añadir lógica de actualización aquí) ---

function animate() {
    requestAnimationFrame(animate);

    // 3. Si tu componente tiene un método de actualización, llámalo aquí.
    //    Ejemplo:
    //    const tiempo = performance.now() / 1000;
    //    if (miAnillo && typeof miAnillo.update === 'function') {
    //        miAnillo.update(tiempo);
    //    }

    controls.update();
    renderer.render(scene, camera);
}

// --- Manejo de Redimensión ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar la animación
animate();
