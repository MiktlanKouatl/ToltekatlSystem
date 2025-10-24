import * as THREE from 'three';
import { Anillo } from './Anillo.js';
import { NEGRO, ROJO, BLANCO, AZUL } from './ArtefactoVisual.js';

export class AnilloMomentos extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);

        // Geometría de Torus con 4 lados para un aspecto de disco plano
        const geometria = new THREE.TorusGeometry(this.radio, this.tubeWidth, 2, 30);
        const textura = this.crearTextura([NEGRO, ROJO, BLANCO, AZUL]);
        const material = new THREE.MeshBasicMaterial({ map: textura });
        const malla = new THREE.Mesh(geometria, material);

        // Rotar -45 grados para centrar el color rojo en la parte superior
        malla.rotation.z = -45 * (Math.PI / 180);

        this.add(malla);
    }

    actualizar(estado) {
        const DEGREES_TO_RADIANS = Math.PI / 180;
        const momentoOffsetAnual = estado.anio % 4;
        const momentoVisual = momentoOffsetAnual + estado.momentoDelDia;
        // La rotación de todo el grupo (this) mueve el anillo
        this.rotation.z = -(momentoVisual / 4) * 360 * DEGREES_TO_RADIANS;
    }
}