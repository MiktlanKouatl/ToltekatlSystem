import * as THREE from 'three';
import { Anillo } from './Anillo.js';
import { CARGADORES } from '../Artefacto.js';
import { NEGRO, ROJO, BLANCO, AZUL } from './ArtefactoVisual.js';

export class AnilloXiuhmolpilli extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);
        
        const geometria = new THREE.TorusGeometry(this.radio, this.tubeWidth, 4, 52);
        
        const xiuhmolpilliColors = Array(52).fill(0).map((_, i) => {
            const cargador = CARGADORES[i % 4];
            if (cargador === 'Tochtli') return ROJO;
            if (cargador === 'Akatl') return BLANCO;
            if (cargador === 'Tekpatl') return AZUL;
            return NEGRO;
        });

        const textura = this.crearTextura(xiuhmolpilliColors);
        const material = new THREE.MeshBasicMaterial({ map: textura });
        const malla = new THREE.Mesh(geometria, material);

        // Rotación inicial para centrar el Segmento 0 en el apuntador
        malla.rotation.z = 86.54 * (Math.PI / 180);

        this.add(malla);
    }

    actualizar(estado) {
        const DEGREES_TO_RADIANS = Math.PI / 180;
        this.rotation.z = -(estado.anio / 52) * 360 * DEGREES_TO_RADIANS;
    }
}