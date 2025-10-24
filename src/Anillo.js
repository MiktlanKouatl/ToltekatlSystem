import * as THREE from 'three';

/**
 * Clase base para todos los anillos visuales del artefacto.
 * Extiende de THREE.Group para poder contener múltiples mallas (meshes)
 * y ser tratada como un único objeto en la escena.
 */
export class Anillo extends THREE.Group {
    /**
     * @param {number} radio - El radio principal del anillo.
     */
    constructor(radio, tubeWidth) {
        super();
        this.radio = radio;
        this.tubeWidth = tubeWidth;
    }

    /**
     * Método "abstracto" que debe ser implementado por cada clase de anillo específica.
     * Se encarga de actualizar la apariencia del anillo (rotación, colores, etc.)
     * basándose en el estado actual del calendario.
     * @param {object} estado - El objeto de estado proveniente de la clase Artefacto.
     */
    actualizar(estado) {
        throw new Error("El método 'actualizar' debe ser implementado por la clase hija");
    }

    /**
     * Función de utilidad para crear texturas a partir de un array de colores.
     * @param {number[]} colors - Un array de códigos de color hexadecimales.
     * @returns {THREE.CanvasTexture} Una textura de canvas lista para ser usada en un material.
     */
    crearTextura(colors) {
        const segments = colors.length;
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        const segWidth = canvas.width / segments;

        for (let i = 0; i < segments; i++) {
            context.fillStyle = new THREE.Color(colors[i]).getStyle();
            context.fillRect(i * segWidth, 0, segWidth, canvas.height);
        }
        return new THREE.CanvasTexture(canvas);
    }
}
