import * as THREE from 'three';
import { Anillo } from './Anillo.js';

// Colores para los marcadores de días
const COLOR_DIA_NORMAL = 0x888888;
const COLOR_INICIO_VEINTENA = 0xff0000; // Rojo para el inicio de veintena
const COLOR_NEMONTEMI = 0x0000ff; // Azul para Nemontemi
const COLOR_ACTIVO = 0xffff00; // Amarillo para el día activo

const MARCADOR_RADIO = 0.08; // Radio de cada círculo de día

export class AnilloXiuhpohualli extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);

        this.marcadores = []; // Almacenará los 365 marcadores de días
        this.crearMarcadoresDias();
    }

    crearMarcadoresDias() {
        const anguloOffset = Math.PI / 2; // Empezar arriba (12 en punto)
        const totalDias = 365;
        const anguloPorDia = (Math.PI * 2) / totalDias;

        for (let i = 0; i < totalDias; i++) {
            const marcador = this.crearMarcadorDia(i);

            // Posicionar el marcador en el perímetro del anillo
            const angulo = anguloOffset - (i * anguloPorDia); // Sentido horario
            marcador.position.x = Math.cos(angulo) * this.radio;
            marcador.position.y = Math.sin(angulo) * this.radio;
            marcador.position.z = 0.1; // Ligeramente por encima del plano

            this.add(marcador);
            this.marcadores.push(marcador);
        }
    }

    crearMarcadorDia(dayIndex) {
        let color = COLOR_DIA_NORMAL;
        let scale = 1.0;

        // Es inicio de veintena (días 0, 20, 40, ..., 340)
        if (dayIndex % 20 === 0) {
            color = COLOR_INICIO_VEINTENA;
            scale = 1.3; // Un poco más grande
        }

        // Es día Nemontemi (días 360, 361, 362, 363, 364)
        if (dayIndex >= 360) {
            color = COLOR_NEMONTEMI;
            scale = 1.3; // También un poco más grande
        }

        const geometria = new THREE.CircleGeometry(MARCADOR_RADIO, 4);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const mesh = new THREE.Mesh(geometria, material);
        mesh.scale.set(scale, scale, 1);

        return mesh;
    }

    actualizar(estado) {
        const DEGREES_TO_RADIANS = Math.PI / 180;
        const diaActivoIndex = estado.diaDelAnio; // diaDelAnio va de 0 a 364

        // Rotar todo el anillo para alinear el día activo con el apuntador
        // Los marcadores se crean en sentido horario, así que la rotación debe ser positiva
        const anguloPorDia = 360 / 365;
        this.rotation.z = (diaActivoIndex * anguloPorDia) * DEGREES_TO_RADIANS;

        // Resaltar el marcador activo
        this.marcadores.forEach((marcador, i) => {
            const esActivo = (i === diaActivoIndex);
            marcador.material.color.set(esActivo ? COLOR_ACTIVO : this.getOriginalColor(i));
            marcador.scale.set(esActivo ? 1.5 : this.getOriginalScale(i), esActivo ? 1.5 : this.getOriginalScale(i), 1);
        });
    }

    // Métodos auxiliares para obtener el color y escala original de un marcador
    getOriginalColor(dayIndex) {
        if (dayIndex % 20 === 0) return COLOR_INICIO_VEINTENA;
        if (dayIndex >= 360) return COLOR_NEMONTEMI;
        return COLOR_DIA_NORMAL;
    }

    getOriginalScale(dayIndex) {
        if (dayIndex % 20 === 0 || dayIndex >= 360) return 1.3;
        return 1.0;
    }
}
