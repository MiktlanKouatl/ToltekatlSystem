import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap'; // Importar GSAP

import { AnilloMomentos } from './AnilloMomentos.js';
import { AnilloNumeral } from './AnilloNumeral.js';
import { AnilloTonal } from './AnilloTonal.js';
import { AnilloTonalpohualli } from './AnilloTonalpohualli.js';
import { AnilloXiuhpohualli } from './AnilloXiuhpohualli.js';
import { AnilloXiuhmolpilli } from './AnilloXiuhmolpilli.js';

// =======================================================================
// CONSTANTES DE COLOR
// =======================================================================
export const NEGRO = 0x000000;
export const ROJO = 0xff0000;
export const BLANCO = 0xffffff;
export const AZUL = 0x0000ff;

// =======================================================================
// CONFIGURACIÓN PROCEDURAL DEL DISEÑO
// =======================================================================
const LAYOUT_CONFIG = {
    INNER_RADIUS: 4.0, // Ajustado para dar más espacio
    RING_SPACING: 0.9, // Espacio entre anillos
    ORDER: ['momentos', 'numeral', 'tonal', 'tonalpohualli', 'xiuhpohualli', 'xiuhmolpilli'],
    DEFINITIONS: {
        momentos:      { class: AnilloMomentos,      tubeWidth: 0.2 },
        numeral:       { class: AnilloNumeral,       tubeWidth: 0.4 },
        tonal:         { class: AnilloTonal,         tubeWidth: 1.0 },
        tonalpohualli: { class: AnilloTonalpohualli, tubeWidth: 0.6 },
        xiuhpohualli:  { class: AnilloXiuhpohualli,  tubeWidth: 0.0 },
        xiuhmolpilli:  { class: AnilloXiuhmolpilli,  tubeWidth: 0.6 },
    }
};

// --- CONFIGURACIÓN DE ESCALA PARA VISTA DE MATRIZ ---
const MATRIX_VIEW_SCALE_OUTER_RINGS = 1.3; // Escala para los anillos exteriores


/**
 * Clase principal de la Vista. Se encarga de gestionar la escena de Three.js,
 * la cámara, el renderizador y todos los anillos que componen el artefacto.
 */
export class ArtefactoVisual {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30; // Alejar más la cámara para el nuevo tamaño

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.anillos = {};

        // this.crearPuntero();
        this.crearAnillos();
        this.setupInteraction(); // Añadir detector de interacciones
        this.iniciarAnimacion();
    }

    setupInteraction() {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('mousedown', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);

            const tonalpohualliRing = this.anillos.tonalpohualli;
            if (!tonalpohualliRing) return;

            const intersects = raycaster.intersectObject(tonalpohualliRing, true);

            if (intersects.length > 0) {
                const intersection = intersects[0];
                if (intersection.uv) {
                    // Ajustar la coordenada UV para que 0.25 (12 en punto) sea el inicio
                    const adjustedUvX = (intersection.uv.x - 0.25 + 1) % 1;
                    const segmentIndex = Math.floor(adjustedUvX * 52);
                    tonalpohualliRing.selectColumn(segmentIndex);
                }
            }
        });
    }

    crearPuntero() {
        const pointer = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 40, 0.1), // Más largo para cubrir todos los anillos
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        );
        pointer.position.z = 0.1;
        this.scene.add(pointer);
    }

    crearAnillos() {
        let nextInnerRadius = LAYOUT_CONFIG.INNER_RADIUS;

        for (const ringName of LAYOUT_CONFIG.ORDER) {
            const config = LAYOUT_CONFIG.DEFINITIONS[ringName];
            const tubeWidth = config.tubeWidth;
            
            const ringCenterRadius = nextInnerRadius + (tubeWidth / 2);

            const anillo = new config.class(ringCenterRadius, tubeWidth);
            this.anillos[ringName] = anillo;
            this.scene.add(anillo);

            nextInnerRadius = ringCenterRadius + (tubeWidth / 2) + LAYOUT_CONFIG.RING_SPACING;
        }
    }

    // --- NUEVA LÓGICA DE ANIMACIÓN GLOBAL DE LAYOUT ---
    toggleMatrixLayout(isMatrixView) {
        const tonalpohualliRing = this.anillos.tonalpohualli;
        const xiuhpohualliRing = this.anillos.xiuhpohualli;
        const xiuhmolpilliRing = this.anillos.xiuhmolpilli;

        if (isMatrixView) {
            // El anillo tonalpohualli no escala, solo sus glifos internos
            // Empujar anillos exteriores
            gsap.to(xiuhpohualliRing.scale, { duration: 0.8, x: MATRIX_VIEW_SCALE_OUTER_RINGS, y: MATRIX_VIEW_SCALE_OUTER_RINGS, ease: "back.out(1.7)" });
            gsap.to(xiuhmolpilliRing.scale, { duration: 0.8, x: MATRIX_VIEW_SCALE_OUTER_RINGS, y: MATRIX_VIEW_SCALE_OUTER_RINGS, ease: "back.out(1.7)" });
        } else {
            // Volver a la escala normal
            gsap.to(xiuhpohualliRing.scale, { duration: 0.6, x: 1, y: 1, ease: "power2.out" });
            gsap.to(xiuhmolpilliRing.scale, { duration: 0.6, x: 1, y: 1, ease: "power2.out" });
        }
    }

    actualizar(estado) {
        for (const anillo of Object.values(this.anillos)) {
            anillo.actualizar(estado);
        }
    }

    iniciarAnimacion(corazon) {
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (corazon) {
                corazon.latir();
            }

            // Actualiza las matrices del InstancedMesh si existe
            if (this.anillos.tonalpohualli && this.anillos.tonalpohualli.updateInstances) {
                this.anillos.tonalpohualli.updateInstances();
            }

            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}