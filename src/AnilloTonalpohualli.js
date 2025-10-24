import * as THREE from 'three';
import { Anillo } from './Anillo.js';
import gsap from 'gsap';

// Configuración para el diseño de los glifos internos
const GLIFO_INTERNO_RADIO = 0.08;
const GLYPH_SCALE_MATRIX = 4; // Escala de los glifos en vista de matriz
const COLUMN_GLYPH_SPACING_FACTOR = 1.7; // Factor para ajustar la separación en la columna
const TOTAL_GLYPHS = 52 * 5;

export class AnilloTonalpohualli extends Anillo {
    constructor(radio, tubeWidth) {
        super(radio, tubeWidth);

        this.instancedMesh = null;
        this.dummy = new THREE.Object3D(); // Helper object for matrix updates
        this.instanceData = []; // Stores { position, scale } for each instance

        this.selectedIndex = null;
        this.isMatrixView = false;
        this.lastActiveInstanceIndex = null;

        this.crearBase();
        this.crearTodosLosGlifos();
    }

    crearBase() {
        const geometria = new THREE.TorusGeometry(this.radio, this.tubeWidth, 4, 52);
        const material = new THREE.MeshBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.25
        });
        const malla = new THREE.Mesh(geometria, material);

        // Rotar la base para alinear los UVs con los glifos para una detección de clic precisa
        const segmentWidthRadians = (Math.PI * 2) / 52;
        malla.rotation.z = -(segmentWidthRadians / 2);

        this.add(malla);
    }

    crearTodosLosGlifos() {
        const geometriaGlifo = new THREE.CircleGeometry(GLIFO_INTERNO_RADIO, 8);
        const materialGlifo = new THREE.MeshBasicMaterial(); // Color will be controlled by instance color

        this.instancedMesh = new THREE.InstancedMesh(geometriaGlifo, materialGlifo, TOTAL_GLYPHS);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Important for performance

        const anguloOffset = Math.PI / 2;
        const segmentWidthRadians = (Math.PI * 2) / 52;

        const quincunxOffset = this.tubeWidth * 0.25;
        const quincunxPositions = [
            new THREE.Vector2(-quincunxOffset, quincunxOffset),
            new THREE.Vector2(quincunxOffset, quincunxOffset),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(-quincunxOffset, -quincunxOffset),
            new THREE.Vector2(quincunxOffset, -quincunxOffset),
        ];

        let instanceIndex = 0;
        const Z_AXIS = new THREE.Vector3(0, 0, 1);

        for (let i = 0; i < 52; i++) { // 52 segments
            const segmentAngle = anguloOffset + (i * segmentWidthRadians);
            const segmentCenter = new THREE.Vector3(
                Math.cos(segmentAngle) * this.radio,
                Math.sin(segmentAngle) * this.radio,
                0
            );
            const segmentRotation = segmentAngle - Math.PI / 2;

            for (let j = 0; j < 5; j++) { // 5 glyphs per segment
                const localPos = quincunxPositions[j];
                const rotatedLocalPos = new THREE.Vector3(localPos.x, localPos.y, 0.1).applyAxisAngle(Z_AXIS, segmentRotation);
                const finalPos = rotatedLocalPos.add(segmentCenter);

                this.dummy.position.copy(finalPos);
                this.dummy.updateMatrix();

                this.instancedMesh.setMatrixAt(instanceIndex, this.dummy.matrix);
                this.instanceData.push({ position: finalPos.clone(), scale: new THREE.Vector3(1, 1, 1) });
                this.instancedMesh.setColorAt(instanceIndex, new THREE.Color(0xffffff));
                instanceIndex++;
            }
        }

        this.add(this.instancedMesh);
    }

    // --- ANIMATION & INTERACTION ---

    // This method should be called from the main animation loop
    updateInstances() {
        if (!this.instancedMesh) return;

        for (let i = 0; i < TOTAL_GLYPHS; i++) {
            const data = this.instanceData[i];
            this.dummy.position.copy(data.position);
            this.dummy.scale.copy(data.scale);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    selectColumn(index) {
        if (this.selectedIndex !== null) {
            this.animateToQuincunx(this.selectedIndex);
        }
        if (index === this.selectedIndex) {
            this.selectedIndex = null;
            return;
        }
        this.animateToColumn(index);
        this.selectedIndex = index;
        console.log(`Columna seleccionada: ${index}`);
    }

    toggleMatrixView() {
        this.isMatrixView = !this.isMatrixView;
        if (this.selectedIndex !== null) {
            this.animateToQuincunx(this.selectedIndex);
            this.selectedIndex = null;
        }
        for (let i = 0; i < 52; i++) {
            if (this.isMatrixView) {
                this.animateToColumn(i);
            } else {
                this.animateToQuincunx(i);
            }
        }
    }

    animateToColumn(index) {
        const segmentStartIndex = index * 5;
        const scaledTotalHeight = this.tubeWidth * 0.8 * GLYPH_SCALE_MATRIX;
        const scaledSpacing = (scaledTotalHeight / 4) * COLUMN_GLYPH_SPACING_FACTOR;

        const segmentAngle = (Math.PI / 2) + (index * (Math.PI * 2) / 52);
        const segmentPosX = Math.cos(segmentAngle) * this.radio;
        const segmentPosY = Math.sin(segmentAngle) * this.radio;
        const segmentRotation = segmentAngle - Math.PI / 2;

        for (let i = 0; i < 5; i++) {
            const instanceIndex = segmentStartIndex + i;
            if (!this.instanceData[instanceIndex]) continue;
            
            const data = this.instanceData[instanceIndex];

            const targetYLocal = (4 - i) * scaledSpacing;
            const targetPos = new THREE.Vector3(0, targetYLocal, 0.1)
                .applyAxisAngle(new THREE.Vector3(0, 0, 1), segmentRotation)
                .add(new THREE.Vector3(segmentPosX, segmentPosY, 0));

            gsap.to(data.position, {
                duration: 0.5,
                ease: 'back.out(1.7)',
                x: targetPos.x,
                y: targetPos.y,
            });
            gsap.to(data.scale, {
                duration: 0.5,
                x: GLYPH_SCALE_MATRIX,
                y: GLYPH_SCALE_MATRIX,
                z: GLYPH_SCALE_MATRIX,
                ease: 'back.out(1.7)'
            });
        }
    }

    animateToQuincunx(index) {
        const segmentStartIndex = index * 5;
        
        const segmentAngle = (Math.PI / 2) + (index * (Math.PI * 2) / 52);
        const segmentPosX = Math.cos(segmentAngle) * this.radio;
        const segmentPosY = Math.sin(segmentAngle) * this.radio;
        const segmentRotation = segmentAngle - Math.PI / 2;

        const quincunxOffset = this.tubeWidth * 0.25;
        const quincunxPositions = [
            new THREE.Vector2(-quincunxOffset, quincunxOffset),
            new THREE.Vector2(quincunxOffset, quincunxOffset),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(-quincunxOffset, -quincunxOffset),
            new THREE.Vector2(quincunxOffset, -quincunxOffset),
        ];

        for (let i = 0; i < 5; i++) {
            const instanceIndex = segmentStartIndex + i;
            if (!this.instanceData[instanceIndex]) continue;

            const data = this.instanceData[instanceIndex];
            
            const targetPos = new THREE.Vector3(quincunxPositions[i].x, quincunxPositions[i].y, 0.1)
                .applyAxisAngle(new THREE.Vector3(0, 0, 1), segmentRotation)
                .add(new THREE.Vector3(segmentPosX, segmentPosY, 0));

            gsap.to(data.position, {
                duration: 0.4,
                ease: 'power2.out',
                x: targetPos.x,
                y: targetPos.y,
            });
            gsap.to(data.scale, {
                duration: 0.4,
                x: 1,
                y: 1,
                z: 1,
                ease: 'power2.out'
            });
        }
    }

    actualizar(estado) {
        const DEGREES_TO_RADIANS = Math.PI / 180;
        const tonalDayIndex = estado.diaDelTonalpohualli - 1; // 0-259

        const activeCol = tonalDayIndex % 52; // Columna activa (0-51)
        const activeRow = Math.floor(tonalDayIndex / 52); // Fila activa (0-4)

        // 1. Rotar el anillo para alinear la columna activa con el apuntador
        const anguloPorSegmento = 360 / 52;
        this.rotation.z = -(activeCol * anguloPorSegmento) * DEGREES_TO_RADIANS;

        // 2. Resaltar el círculo activo dentro de la columna activa
        if (!this.instancedMesh) return;

        // Deseleccionar el círculo previamente activo si lo hay
        if (this.lastActiveInstanceIndex !== null) {
            this.instancedMesh.setColorAt(this.lastActiveInstanceIndex, new THREE.Color(0xffffff));
        }

        // CORRECTED LOGIC: Starts at the base (4) and moves up with each row.
        const glyphInSegmentIndex = 4 - activeRow;
        const activeInstanceIndex = activeCol * 5 + glyphInSegmentIndex;

        // Seleccionar el nuevo círculo activo
        if (this.instanceData[activeInstanceIndex]) {
            this.instancedMesh.setColorAt(activeInstanceIndex, new THREE.Color(0xffff00)); // Amarillo
        }

        this.lastActiveInstanceIndex = activeInstanceIndex;
        this.instancedMesh.instanceColor.needsUpdate = true;
    }
}
