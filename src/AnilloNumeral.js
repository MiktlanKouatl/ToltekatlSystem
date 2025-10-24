import * as THREE from 'three';
import { Anillo } from './Anillo.js';

const ACTIVE_COLOR = 0xffffff;
const INACTIVE_COLOR = 0x666666;
const NUMERAL_SCALE = 2.0; // Multiplicador para el tamaño de los símbolos numerales

export class AnilloNumeral extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);

        this.simbolos = []; // Almacenará los 13 grupos de símbolos
        this.crearSimbolos();
    }

    crearSimbolos() {
        const anguloOffset = Math.PI / 2; // Empezar arriba (12 en punto)

        for (let i = 1; i <= 13; i++) {
            const simbolo = this.crearGeometriaSimbolo(i);

            // CORRECCIÓN 1: Usar '+' para disponer en sentido anti-horario
            const angulo = anguloOffset + ((i - 1) / 13) * Math.PI * 2;
            simbolo.position.x = Math.cos(angulo) * this.radio;
            simbolo.position.y = Math.sin(angulo) * this.radio;

            // CORRECCIÓN 2: Rotar el símbolo para que su base apunte al centro
            simbolo.rotation.z = angulo - Math.PI / 2;

            this.add(simbolo);
            this.simbolos.push(simbolo);
        }
    }

    crearGeometriaSimbolo(number) {
        const simboloGrupo = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: INACTIVE_COLOR });

        const bars = Math.floor(number / 5);
        const dots = number % 5;

        const barWidth = this.tubeWidth * 0.8;
        const barHeight = barWidth * 0.15;
        const dotRadius = barHeight / 2;
        const spacing = barHeight * 0.8;

        let currentY = 0;

        // Crear y posicionar barras desde abajo hacia arriba
        for (let i = 0; i < bars; i++) {
            const barGeo = new THREE.PlaneGeometry(barWidth, barHeight);
            const barMesh = new THREE.Mesh(barGeo, material);
            barMesh.position.y = currentY + (barHeight / 2);
            barMesh.position.z = 0.01; // Ligeramente por encima del plano
            simboloGrupo.add(barMesh);
            currentY += barHeight + spacing;
        }

        // Crear y posicionar puntos encima de las barras
        if (dots > 0) {
            const dotTotalWidth = (dots * dotRadius * 2) + ((dots - 1) * spacing);
            let currentX = -(dotTotalWidth / 2) + dotRadius;

            for (let i = 0; i < dots; i++) {
                const dotGeo = new THREE.CircleGeometry(dotRadius, 4);
                const dotMesh = new THREE.Mesh(dotGeo, material);
                dotMesh.position.x = currentX;
                dotMesh.position.y = currentY + dotRadius;
                simboloGrupo.add(dotMesh);
                currentX += (dotRadius * 2) + spacing;
            }
        }

        // Centrar el grupo de símbolos verticalmente
        const totalHeight = simboloGrupo.children.reduce((max, child) => Math.max(max, child.position.y), 0);
        simboloGrupo.children.forEach(child => {
            child.position.y -= totalHeight / 2;
        });

        // Aplicar la escala global al grupo
        simboloGrupo.scale.set(NUMERAL_SCALE, NUMERAL_SCALE, NUMERAL_SCALE);

        return simboloGrupo;
    }

    actualizar(estado) {
        const numeralIndex = (estado.diaDelTonalpohualli - 1) % 13;

        // Rotar todo el anillo para alinear
        const DEGREES_TO_RADIANS = Math.PI / 180;
        this.rotation.z = -(numeralIndex / 13) * 360 * DEGREES_TO_RADIANS;

        // Resaltar el símbolo activo
        this.simbolos.forEach((simbolo, i) => {
            const esActivo = (i === numeralIndex);
            simbolo.children.forEach(mesh => {
                mesh.material.color.set(esActivo ? ACTIVE_COLOR : INACTIVE_COLOR);
            });
        });
    }
}
