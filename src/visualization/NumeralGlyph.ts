import * as THREE from 'three';

const DOT_RADIUS = 0.04;
const BAR_WIDTH = 0.25;
const BAR_HEIGHT = 0.06;
const PADDING = 0.02;

/**
 * Una clase que genera y muestra un glifo numérico mesoamericano (barras y puntos).
 * Se extiende de THREE.Group para que pueda ser añadido directamente a la escena.
 */
export class NumeralGlyph extends THREE.Group {
    private dotGeometry: THREE.CircleGeometry;
    private barGeometry: THREE.PlaneGeometry;
    private material: THREE.MeshBasicMaterial;

    constructor() {
        super();

        // Creamos una sola vez las geometrías y materiales para ser eficientes.
        this.dotGeometry = new THREE.CircleGeometry(DOT_RADIUS, 12);
        this.barGeometry = new THREE.PlaneGeometry(BAR_WIDTH, BAR_HEIGHT);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    }

    /**
     * Actualiza el glifo para mostrar un nuevo número.
     * @param numeral El número a mostrar (1-13).
     */
    public display(numeral: number): void {
        // 1. Limpiamos los objetos anteriores del grupo.
        this.clear();

        if (numeral < 1 || numeral > 13) {
            return; // No mostramos nada si el número está fuera de rango.
        }

        // 2. Calculamos el número de barras y puntos.
        const numBars = Math.floor(numeral / 5);
        const numDots = numeral % 5;

        let currentY = 0;

        // 3. Creamos y posicionamos las barras.
        if (numBars > 0) {
            const barYOffset = (numBars - 1) * (BAR_HEIGHT + PADDING) / -2;
            for (let i = 0; i < numBars; i++) {
                const bar = new THREE.Mesh(this.barGeometry, this.material);
                bar.position.y = barYOffset + i * (BAR_HEIGHT + PADDING);
                this.add(bar);
            }
            currentY = barYOffset + (numBars - 1) * (BAR_HEIGHT + PADDING) + BAR_HEIGHT / 2 + PADDING;
        }

        // 4. Creamos y posicionamos los puntos.
        if (numDots > 0) {
            const dotY = currentY + DOT_RADIUS;
            const totalDotsWidth = (numDots * DOT_RADIUS * 2) + (Math.max(0, numDots - 1) * PADDING);
            let currentX = -totalDotsWidth / 2 + DOT_RADIUS;

            for (let i = 0; i < numDots; i++) {
                const dot = new THREE.Mesh(this.dotGeometry, this.material);
                dot.position.x = currentX;
                dot.position.y = dotY;
                this.add(dot);
                currentX += (DOT_RADIUS * 2) + PADDING;
            }
        }
    }

    /** Libera recursos cuando el objeto ya no se necesite. */
    public dispose(): void {
        this.dotGeometry.dispose();
        this.barGeometry.dispose();
        this.material.dispose();
    }
}
