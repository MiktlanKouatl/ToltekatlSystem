// src/core/RibbonManager.ts

import * as THREE from 'three';
import { RibbonLineGPU } from './RibbonLineGPU';
import { RibbonConfig, FadeStyle, RenderMode } from './RibbonLine';
import { RingHarmonizer } from './RingHarmonizer';

interface Tracer {
    ribbon: RibbonLineGPU;
    tonalIndex: number;
    speed: number;
    direction: number;
}

export class RibbonManager {
    private scene: THREE.Scene;
    private tracers: Tracer[] = [];
    private pathGenerator = new THREE.Path();
    private readonly baseTorusRadius = 0.5;

    constructor(scene: THREE.Scene, particleCount: number = 20, tracersPerTonal: number = 2) {
        this.scene = scene;

        const colors = [new THREE.Color(0x00ffff), new THREE.Color(0xff00ff)]; // Cian y Magenta

        for (let i = 0; i < particleCount; i++) {
            for (let j = 0; j < tracersPerTonal; j++) {
                
                const ribbonConfig: RibbonConfig = {
                    color: colors[j % colors.length],
                    width: 0.7,
                    maxLength: 15, // La resolución de nuestros círculos
                    fadeStyle: FadeStyle.FadeInOut,
                    fadeTransitionSize: 0.4,
                    renderMode: RenderMode.Glow,
                };

                const ribbon = new RibbonLineGPU([], ribbonConfig);
                
                this.scene.add(ribbon.mesh);

                this.tracers.push({
                    ribbon: ribbon,
                    tonalIndex: i,
                    speed: 0.4 + Math.random() * 0.3, // Velocidad aleatoria
                    direction: j % 2 === 0 ? 1 : -1, // Direcciones opuestas
                });
            }
        }
    }

    public update(harmonizer: RingHarmonizer, elapsedTime: number): void {
        const pathCache = new Map<number, THREE.Vector3[]>();

        for (const tracer of this.tracers) {
            const tonalIndex = tracer.tonalIndex;
            let circlePoints = pathCache.get(tonalIndex);

            // Si aún no hemos generado el camino para este tonal en este frame, lo creamos
            if (!circlePoints) {
                const pathGenerator = new THREE.Path(); // <-- LA SOLUCIÓN: Creamos un Path limpio aquí
                
                const position = harmonizer.positions[tonalIndex];
                const radius = harmonizer.scales[tonalIndex] * this.baseTorusRadius;
                
                pathGenerator.absarc(position.x, position.y, radius, 0, Math.PI * 2, false);
                circlePoints = pathGenerator.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0));
                pathCache.set(tonalIndex, circlePoints);
            }

            // Actualizamos el camino del trazador
            tracer.ribbon.updatePath(circlePoints);

            // Animamos su progreso
            let progress = (elapsedTime * tracer.speed * tracer.direction) % 1.0;
            if (progress < 0) progress += 1.0;
            
            tracer.ribbon.update(progress, 0.7); // (progreso, longitud del rastro)
        }
    }

}