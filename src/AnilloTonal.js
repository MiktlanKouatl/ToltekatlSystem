import * as THREE from 'three';
import { Anillo } from './Anillo.js';

import { NEGRO, ROJO, BLANCO, AZUL } from './ArtefactoVisual.js';

// --- CONFIGURACIÓN DE GLIFOS ---
const GLYPH_RADIUS = 0.8; // El radio total del glifo (círculo + borde)
const BORDER_THICKNESS = 0.2; // El grosor del borde negro

/**
 * Representa el anillo de los 20 tonales.
 * Consiste en una base con 4 zonas de color y 20 glifos (círculos)
 * que se posicionan encima.
 */
export class AnilloTonal extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);

        this.crearBase();
        this.crearGlifos();
    }

    /**
     * Crea el anillo base con las 4 zonas de color (Negro, Rojo, Blanco, Azul).
     */
    crearBase() {
        const geometria = new THREE.TorusGeometry(this.radio, this.tubeWidth, 2, 40);
        
        const colors = [
            ...Array(5).fill(NEGRO),  // Zona 1
            ...Array(5).fill(ROJO),   // Zona 2
            ...Array(5).fill(BLANCO), // Zona 3
            ...Array(5).fill(AZUL),   // Zona 4
        ];
        const textura = this.crearTextura(colors);

        const material = new THREE.MeshBasicMaterial({ map: textura });
        const malla = new THREE.Mesh(geometria, material);

        // --- AJUSTE DE ALINEACIÓN ---
        // Rotamos la malla base 90 grados (para alinear a las 12) - 9 grados (para centrar entre glifos).
        malla.rotation.z = (90 - 9) * (Math.PI / 180);

        this.add(malla);
    }

    /**
     * Crea los 20 glifos (círculos) que representan cada tonal.
     */
    crearGlifos() {
        this.glifos = []; // Contendrá los grupos (borde + relleno)
        this.glifoFills = []; // Contendrá solo los rellenos, para fácil acceso al color

        const GLYPH_RADIUS = 0.8; // El radio total del glifo (círculo + borde)
        const BORDER_THICKNESS = 0.2; // El grosor del borde negro

        const geometriaBorde = new THREE.CircleGeometry(GLYPH_RADIUS, 24);
        const materialBorde = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const geometriaRelleno = new THREE.CircleGeometry(GLYPH_RADIUS - BORDER_THICKNESS, 24);

        // --- AJUSTE DE ALINEACIÓN ---
        // El punto de partida es arriba (12 en punto), que corresponde a 90 grados (PI / 2).
        const anguloOffset = Math.PI / 2;

        for (let i = 0; i < 20; i++) {
            const glifoGrupo = new THREE.Group();

            const borde = new THREE.Mesh(geometriaBorde, materialBorde);
            glifoGrupo.add(borde);

            const materialRelleno = new THREE.MeshBasicMaterial({
                color: 0xffffff, // Color inicial blanco
                transparent: true,
                opacity: 0.9
            });
            const relleno = new THREE.Mesh(geometriaRelleno, materialRelleno);
            relleno.position.z = 0.01; // Ligeramente por encima del borde para evitar z-fighting
            glifoGrupo.add(relleno);

            // Posicionamos en el perímetro, comenzando desde el offset y avanzando en sentido horario.
            const angulo = anguloOffset - (i / 20) * Math.PI * 2;
            glifoGrupo.position.x = Math.cos(angulo) * (this.radio - this.tubeWidth * 0.2);
            glifoGrupo.position.y = Math.sin(angulo) * (this.radio - this.tubeWidth * 0.2);
            glifoGrupo.position.z = 0.5; // Por encima del anillo base

            this.add(glifoGrupo);
            this.glifos.push(glifoGrupo);
            this.glifoFills.push(relleno); // Guardar referencia al relleno
        }
    }

    /**
     * Actualiza la rotación del anillo y resalta el glifo activo.
     * @param {object} estado - El estado del calendario.
     */
    actualizar(estado) {
        const DEGREES_TO_RADIANS = Math.PI / 180;
        const tonalIndex = (estado.diaDelTonalpohualli - 1) % 20;

        // 1. Rota el grupo entero para alinear el puntero con el tonal actual
        this.rotation.z = -(tonalIndex / 20) * 360 * DEGREES_TO_RADIANS;

        // 2. Resalta el glifo activo en amarillo, el resto en blanco.
        this.glifoFills.forEach((relleno, i) => {
            // El glifo que termina en la parte superior es (20 - tonalIndex) % 20
            const glifoEnCima = (20 - tonalIndex) % 20;
            const esActivo = (i === glifoEnCima);
            
            relleno.material.color.set(esActivo ? 0xffff00 : 0xffffff);
            
            // Escalar el grupo completo para que el borde y el relleno crezcan juntos
            const glifoGrupo = this.glifos[i];
            glifoGrupo.scale.set(esActivo ? 1.3 : 1, esActivo ? 1.3 : 1, 1);
        });
    }
}
