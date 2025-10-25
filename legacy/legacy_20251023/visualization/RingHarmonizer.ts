// src/core/RingHarmonizer.ts

import * as THREE from 'three';

const PARTICLE_COUNT = 20;
const BASE_TORUS_RADIUS = 0.5;

export class RingHarmonizer {
    public positions: THREE.Vector3[] = [];
    public scales: number[] = [];
    public centerAngles: number[] = [];

    constructor() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            this.positions.push(new THREE.Vector3());
            this.scales.push(1.0);
            this.centerAngles.push(0);
        }
    }

    public update(tonalScales: number[]): void {
        const radii = tonalScales.map(scale => BASE_TORUS_RADIUS * scale);
        let totalDiameterSum = 0;
        radii.forEach(r => totalDiameterSum += r * 2);
        const newBaseRadius = totalDiameterSum / (2 * Math.PI);

        let totalAngleSum = 0;
        const uncorrectedAngles = radii.map(r => 2 * Math.asin(Math.min(1, r / newBaseRadius)));
        uncorrectedAngles.forEach(a => totalAngleSum += a);
        const correctionFactor = (2 * Math.PI) / totalAngleSum;

        let currentAngle = 0;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const correctedAngle = uncorrectedAngles[i] * correctionFactor;
            this.centerAngles[i] = currentAngle + correctedAngle / 2;
            
            this.positions[i].set(
                Math.cos(this.centerAngles[i]) * newBaseRadius,
                Math.sin(this.centerAngles[i]) * newBaseRadius,
                0
            );
            this.scales[i] = tonalScales[i];

            currentAngle += correctedAngle;
        }
    }
}