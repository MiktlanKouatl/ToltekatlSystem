/**
 * Clase Controlador.
 * Se encarga de manejar toda la interacción del usuario con la interfaz (botones).
 */
export class Controlador {
    /**
     * @param {SemanauakYolotl} corazon - Instancia del motor de tiempo.
     * @param {Artefacto} artefacto - Instancia del motor de cálculo.
     * @param {ArtefactoVisual} vista - Instancia de la vista principal para acceder a los anillos.
     * @param {AnclaGregoriana} ancla - Instancia del ancla gregoriana.
     */
    constructor(corazon, artefacto, vista, ancla) { // <-- Recibir el ancla
        this.corazon = corazon;
        this.artefacto = artefacto;
        this.vista = vista;
        this.ancla = ancla; // <-- Guardar el ancla
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');

        this.asignarControles();
        this.actualizarBotones();
    }

    asignarControles() {
        // --- NUEVO BOTÓN DE SINCRONIZACIÓN ---
        const syncBtn = document.createElement('button');
        syncBtn.id = 'sync-btn';
        syncBtn.textContent = 'Sincronizar Hoy';
        document.querySelector('.control-group').prepend(syncBtn); // Añadirlo al primer grupo

        syncBtn.addEventListener('click', () => {
            console.log("Sincronizando con la fecha y hora actuales...");
            // const hoy = new Date(); // Old: Local timezone date
            const now = new Date();
            // Create a UTC Date object from the local date components
            const hoyUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()));
            // const momentoDeHoy = this.ancla.gregorianoAMomento(hoy); // Old: Using local date
            const momentoDeHoy = this.ancla.gregorianoAMomento(hoyUTC); // New: Using UTC date
            this.corazon.momentoAbsoluto = momentoDeHoy;
            this.corazon.dispatchEvent({ type: 'pulso' });
        });

        // --- BÚSQUEDA POR FECHA ---
        const searchInput = document.getElementById('date-search-input');
        const searchBtn = document.getElementById('date-search-btn');

        searchBtn.addEventListener('click', () => {
            const dateString = searchInput.value;
            if (!dateString) {
                console.log("Por favor, selecciona una fecha y hora.");
                return;
            }

            console.log(`Buscando la fecha: ${dateString}`);
            // const fechaBuscada = new Date(dateString); // Old: Parses in local timezone
            // To ensure UTC, we need to parse the string and construct a UTC date.
            // Assuming dateString format is YYYY-MM-DDTHH:mm (from datetime-local input)
            const [datePart, timePart] = dateString.split('T');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes] = timePart.split(':').map(Number);
            
            const fechaBuscadaUTC = new Date(Date.UTC(year, month - 1, day, hours, minutes)); // month is 0-indexed
            const momentoBuscado = this.ancla.gregorianoAMomento(fechaBuscadaUTC); // New: Using UTC date
            
            this.corazon.stop(); // Detener la animación para saltar a la fecha
            this.corazon.momentoAbsoluto = momentoBuscado;
            this.corazon.dispatchEvent({ type: 'pulso' });
            this.actualizarBotones(); // Actualizar estado de botones play/stop
        });

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