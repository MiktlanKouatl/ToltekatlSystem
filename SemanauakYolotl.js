// SemanauakYolotl.js - El Corazón del Universo

// Un despachador de eventos simple para desacoplar la lógica.
class EventDispatcher {
    constructor() {
        this._listeners = {};
    }
    addEventListener(type, listener) {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }
        this._listeners[type].push(listener);
    }
    dispatchEvent(event) {
        if (!this._listeners[event.type]) return;
        this._listeners[event.type].forEach(listener => listener(event));
    }
}

export class SemanauakYolotl extends EventDispatcher {
    constructor() {
        super();
        this.momentoAbsoluto = 0;
        this.isAnimating = false;
        this.velocidad = 0.2;
    }

    // El latido principal del motor, llamado en cada cuadro de animación.
    latir() {
        if (!this.isAnimating) return;

        this.momentoAbsoluto += this.velocidad;
        this.dispatchEvent({ type: 'pulso' }); // Emite un pulso continuo
    }

    // Funciones de control que interactúan con el tiempo.
    play() { this.isAnimating = true; }
    stop() { this.isAnimating = false; }
    
    avanzarMomento(cantidad = 1) {
        this.stop();
        this.momentoAbsoluto += cantidad;
        this.dispatchEvent({ type: 'pulso' });
    }

    retrocederMomento(cantidad = 1) {
        this.stop();
        this.momentoAbsoluto = Math.max(0, this.momentoAbsoluto - cantidad);
        this.dispatchEvent({ type: 'pulso' });
    }

    // --- MÉTODOS DE SALTO POR UNIDAD CALENDÁRICA ---

    avanzarTrecena(cantidad = 1) {
        this.avanzarMomento(cantidad * 13 * 4); // 13 días * 4 pulsos/día
    }
    retrocederTrecena(cantidad = 1) {
        this.retrocederMomento(cantidad * 13 * 4);
    }

    avanzarVeintena(cantidad = 1) {
        this.avanzarMomento(cantidad * 20 * 4); // 20 días * 4 pulsos/día
    }
    retrocederVeintena(cantidad = 1) {
        this.retrocederMomento(cantidad * 20 * 4);
    }

    avanzarTonalpohualli(cantidad = 1) {
        this.avanzarMomento(cantidad * 260 * 4); // 260 días * 4 pulsos/día
    }
    retrocederTonalpohualli(cantidad = 1) {
        this.retrocederMomento(cantidad * 260 * 4);
    }

    // Le permite al artefacto decirle al corazón cuántos pulsos tiene el día actual.
    getPulsosDelDia(momento = this.momentoAbsoluto) {
        const momentoEnAnio = Math.floor(momento) % 1461;
        // Si el pulso está dentro de los primeros 1456 pulsos del año (364 días * 4 pulsos), el día tiene 4 pulsos.
        // De lo contrario, estamos en el último día, que tiene 5 pulsos.
        if (momentoEnAnio < 1456) {
            return 4;
        } else {
            return 5;
        }
    }
}
