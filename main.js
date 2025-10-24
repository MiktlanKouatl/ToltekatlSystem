import { SemanauakYolotl } from './SemanauakYolotl.js';
import { Artefacto } from './Artefacto.js';
import { ArtefactoVisual } from './src/ArtefactoVisual.js';
import { Controlador } from './src/Controlador.js';

/**
 * =======================================================================
 *  SEMANAUAK YOLOTL - EL CORAZÓN DEL UNIVERSO (v2.0 - Refactorizado)
 * =======================================================================
 * 
 *  main.js - El Director de Orquesta
 * 
 *  Responsabilidades:
 *  1. Crear las instancias principales del Modelo, la Vista y el Controlador.
 *  2. Conectar el "pulso" del Modelo con las actualizaciones de la Vista.
 *  3. Iniciar la simulación.
 * 
 * =======================================================================
 */

// --- 1. INICIALIZACIÓN DE MÓDULOS ---

// El Modelo: La lógica pura del tiempo y el calendario.
const corazon = new SemanauakYolotl();
const artefacto = new Artefacto();

// La Vista: El gestor de toda la representación visual en Three.js.
const vista = new ArtefactoVisual();

// El Controlador: El gestor de la interacción del usuario con los botones.
const controlador = new Controlador(corazon, artefacto, vista);


// --- 2. CONEXIÓN PRINCIPAL (MODELO -> VISTA) ---

const infoPanel = document.getElementById('readout');

// Escuchamos el evento 'pulso' del corazón.
corazon.addEventListener('pulso', () => {
    // Cuando el corazón late, actualizamos el modelo del artefacto.
    const estadoActual = artefacto.actualizar(corazon.momentoAbsoluto);
    
    // Pasamos el nuevo estado a la vista para que se actualice.
    vista.actualizar(estadoActual);

    // También actualizamos el panel de información directamente.
    infoPanel.innerHTML = `
        <b>MOMENTO ABSOLUTO:</b> ${Math.floor(corazon.momentoAbsoluto)}<br>
        <b>PULSO DEL DÍA:</b> ${estadoActual.momentoDelDia + 1} / ${corazon.getPulsosDelDia(corazon.momentoAbsoluto)}<hr>
        <b>TONAL:</b> ${artefacto.getTonalDisplay()}<br>
        <b>TRECENA:</b> ${artefacto.getTrecenaDisplay()}<br>
        <b>TONALPOHUALLI:</b> ${artefacto.getTonalpohualliCount()} / 260<hr>
        <b>VEINTENA:</b> ${artefacto.getVeintenaDisplay()}<br>
        <b>XIUHPOHUALLI:</b> ${artefacto.getAnioDisplay()}<br>
    `;
});


// --- 3. INICIO DE LA SIMULACIÓN ---

// Inicia el bucle de animación, pasándole el corazón para que lata en cada cuadro.
vista.iniciarAnimacion(corazon);

// Disparamos un pulso inicial para que la visualización muestre el estado del momento 0.
corazon.dispatchEvent({ type: 'pulso' });