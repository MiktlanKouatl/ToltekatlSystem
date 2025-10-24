/**
 * Clase Controlador.
 * Se encarga de manejar toda la interacción del usuario con la interfaz (botones).
 */
export class Controlador {
    /**
     * @param {SemanauakYolotl} corazon - Instancia del motor de tiempo.
     * @param {Artefacto} artefacto - Instancia del motor de cálculo.
     * @param {ArtefactoVisual} vista - Instancia de la vista principal para acceder a los anillos.
     */
    constructor(corazon, artefacto, vista) {
        this.corazon = corazon;
        this.artefacto = artefacto;
        this.vista = vista;
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');

        this.asignarControles();
        this.actualizarBotones();
    }

    asignarControles() {
        // Controles de animación
        this.playBtn.addEventListener('click', () => {
            this.corazon.play();
            this.actualizarBotones();
        });
        this.stopBtn.addEventListener('click', () => {
            this.corazon.stop();
            this.actualizarBotones();
        });

        // Controles de salto de tiempo
        document.getElementById('next-momento-btn').addEventListener('click', () => this.corazon.avanzarMomento());
        document.getElementById('prev-momento-btn').addEventListener('click', () => this.corazon.retrocederMomento());

        document.getElementById('next-tonal-btn').addEventListener('click', () => {
            const estado = this.artefacto.actualizar(this.corazon.momentoAbsoluto);
            const pulsosHoy = this.corazon.getPulsosDelDia(this.corazon.momentoAbsoluto);
            const saltos = pulsosHoy - estado.momentoDelDia;
            this.corazon.avanzarMomento(saltos === 0 ? pulsosHoy : saltos);
        });

        document.getElementById('prev-tonal-btn').addEventListener('click', () => {
            const estado = this.artefacto.actualizar(this.corazon.momentoAbsoluto);
            const momentoDiaAnterior = this.corazon.momentoAbsoluto - estado.momentoDelDia - 1;
            const pulsosAyer = this.corazon.getPulsosDelDia(momentoDiaAnterior);
            const saltos = estado.momentoDelDia + pulsosAyer;
            this.corazon.retrocederMomento(saltos);
        });

        document.getElementById('next-xiuhpohualli-btn').addEventListener('click', () => {
            const PULSOS_ANIO = 1461;
            const saltos = PULSOS_ANIO - (Math.floor(this.corazon.momentoAbsoluto) % PULSOS_ANIO);
            this.corazon.avanzarMomento(saltos);
        });
        
        document.getElementById('prev-xiuhpohualli-btn').addEventListener('click', () => {
            const PULSOS_ANIO = 1461;
            const saltos = (Math.floor(this.corazon.momentoAbsoluto) % PULSOS_ANIO) + 1;
            this.corazon.retrocederMomento(saltos);
        });

        // Controles de salto por Trecena
        document.getElementById('next-trecena-btn').addEventListener('click', () => this.corazon.avanzarTrecena());
        document.getElementById('prev-trecena-btn').addEventListener('click', () => this.corazon.retrocederTrecena());

        // Controles de salto por Veintena
        document.getElementById('next-veintena-btn').addEventListener('click', () => this.corazon.avanzarVeintena());
        document.getElementById('prev-veintena-btn').addEventListener('click', () => this.corazon.retrocederVeintena());

        // Controles de salto por Tonalpohualli (260 días)
        document.getElementById('next-tonalpohualli-btn').addEventListener('click', () => this.corazon.avanzarTonalpohualli());
        document.getElementById('prev-tonalpohualli-btn').addEventListener('click', () => this.corazon.retrocederTonalpohualli());

        // --- NUEVO CONTROL DE VISTA ---
        document.getElementById('toggle-matrix-btn').addEventListener('click', () => {
            const tonalpohualliRing = this.vista.anillos.tonalpohualli;
            if (tonalpohualliRing) {
                tonalpohualliRing.toggleMatrixView(); // Maneja la animación interna de los glifos
                this.vista.toggleMatrixLayout(tonalpohualliRing.isMatrixView); // Orquesta la escala global de los anillos
            }
        });
    }

    actualizarBotones() {
        this.playBtn.disabled = this.corazon.isAnimating;
        this.stopBtn.disabled = !this.corazon.isAnimating;
    }
}