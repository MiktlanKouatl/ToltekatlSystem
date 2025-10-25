import * as THREE from 'three';
import { Apuntador } from './Apuntador';
import { RingHarmonizer } from './RingHarmonizer';

export class PointerController {
    private scene: THREE.Scene;
    private harmonizer: RingHarmonizer;
    private pointers: Apuntador[] = [];
    private activePointers: Apuntador[] = [];

    constructor(scene: THREE.Scene, harmonizer: RingHarmonizer) {
        this.scene = scene;
        this.harmonizer = harmonizer;
        this.createPointerPool();
    }

    private createPointerPool() {
        for (let i = 0; i < 13; i++) {
            const pointer = new Apuntador();
            this.scene.add(pointer.mesh);
            this.pointers.push(pointer);
        }
    }

    public hideActivePointers() {
        this.activePointers.forEach(p => p.hide());
        this.activePointers = [];
    }

    public setHarmonicsMode(startTonalIndex: number) {
        this.hideActivePointers();

        for (let i = 0; i < 13; i++) {
            const tonalIndex = (startTonalIndex + i * 8) % 20;
            const position = this.harmonizer.positions[tonalIndex];
            const pointer = this.pointers[i];

            // El radio del anillo se infiere de la propia posición
            const ringRadius = position.length();
            pointer.pointAt(position, ringRadius);
            
            if (i === 0) {
                pointer.setColor(0xFFD700); // Dorado para el tonal de inicio
            } else {
                pointer.setColor(0xADD8E6); // Azul claro para los armónicos
            }

            pointer.show();
            this.activePointers.push(pointer);
        }
    }
}
