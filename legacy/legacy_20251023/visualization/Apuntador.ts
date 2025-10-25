import * as THREE from 'three';

export class Apuntador {
    public mesh: THREE.Mesh;

    constructor() {
        const geometry = new THREE.ConeGeometry(0.1, 0.5, 12);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0 });
        this.mesh = new THREE.Mesh(geometry, material);
        // Orientamos el cono para que la punta apunte en la dirección -Y local
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
        this.mesh.visible = false;
    }

    /**
     * Orienta el apuntador hacia una posición y lo coloca fuera del radio del anillo.
     * @param targetPosition La posición en el anillo a la que apuntar.
     * @param ringRadius El radio del anillo principal.
     */
    public pointAt(targetPosition: THREE.Vector3, ringRadius: number) {
        // La dirección desde el origen al punto del anillo
        const direction = targetPosition.clone().normalize();
        // La posición del apuntador, un poco más allá del anillo
        const pointerPosition = direction.clone().multiplyScalar(ringRadius + 0.5);
        this.mesh.position.copy(pointerPosition);

        // Hacemos que el apuntador mire hacia el punto en el anillo (su base apuntará al origen)
        this.mesh.lookAt(targetPosition);
    }

    public setColor(color: THREE.Color | number) {
        (this.mesh.material as THREE.MeshBasicMaterial).color.set(color);
    }

    public show() {
        this.mesh.visible = true;
        (this.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
    }

    public hide() {
        this.mesh.visible = false;
        (this.mesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }
}
