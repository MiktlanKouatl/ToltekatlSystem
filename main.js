// main.js - El Director de Orquesta Dual
import { SemanauakYolotl } from './SemanauakYolotl.js';
import { Artefacto } from './Artefacto.js';
import { ArtefactoVisual } from './src/ArtefactoVisual.js';
import { Controlador } from './src/Controlador.js';
import { AnclaGregoriana } from './AnclaGregoriana.js';
import { MotorAstronomico } from './MotorAstronomico.js'; // <-- IMPORTANTE: Importar el nuevo motor

// --- INICIALIZACIÓN DE TODOS LOS COMPONENTES ---
const corazon = new SemanauakYolotl();
const artefacto = new Artefacto();         // Motor 1 (Mecánico)
const motorAstro = new MotorAstronomico(); // Motor 2 (Astronómico)
const vista = new ArtefactoVisual();
const ancla = new AnclaGregoriana();
const controlador = new Controlador(corazon, artefacto, vista, ancla);

const infoPanel = document.getElementById('readout');
const PULSOS_ASTRONOMICOS = ['Noche (Yohualli)', 'Mañana (Tlanesi)', 'Tarde (Nepantla)', 'Atardecer (Tlapoyauak)'];

// --- BUCLE DE ACTUALIZACIÓN DUAL ---
corazon.addEventListener('pulso', () => {
    // 1. Calcular la fecha Gregoriana actual a partir del pulso mecánico
    const fechaActual = ancla.momentoAGregoriano(corazon.momentoAbsoluto);
    
    // 2. Actualizar y obtener datos del MOTOR 1 (MECÁNICO)
    const estadoMecanico = artefacto.actualizar(corazon.momentoAbsoluto);
    
    // 3. Actualizar y obtener datos del MOTOR 2 (ASTRONÓMICO)
    const estadoAstronomico = motorAstro.getEstado(fechaActual);

    // 4. Actualizar la VISTA con ambos datos
    vista.actualizar(estadoMecanico); // Mueve los anillos
    vista.actualizarMarcadorTierra(estadoAstronomico.anguloOrbital); // Mueve el nuevo marcador

    // 5. Actualizar el PANEL DE INFORMACIÓN para mostrar ambos motores
    infoPanel.innerHTML = `
        <b>--- Motor Mecánico (Cuenta Toltekatl) ---</b><br>
        <b>MOMENTO ABSOLUTO:</b> ${Math.floor(corazon.momentoAbsoluto)}<br>
        <b>PULSO DEL DÍA:</b> ${estadoMecanico.momentoDelDia + 1} / ${corazon.getPulsosDelDia(corazon.momentoAbsoluto)}<hr>
        <b>TONAL:</b> ${artefacto.getTonalDisplay()}<br>
        <b>TRECENA:</b> ${artefacto.getTrecenaDisplay()}<br>
        <b>TONALPOHUALLI:</b> ${artefacto.getTonalpohualliCount()} / 260<hr>
        <b>VEINTENA:</b> ${artefacto.getVeintenaDisplay()}<br>
        <b>XIUHPOHUALLI:</b> ${artefacto.getAnioDisplay()}<br>
        <b>DÍA DEL XIUHPOHUALLI:</b> ${estadoMecanico.diaDelAnio + 1} / 365<br>
        <hr style="border-top: 2px solid #fff;">
        <b>--- Motor Astronómico (Observación Real) ---</b><br>
        <b>FECHA UTC:</b> ${fechaActual.toUTCString()}<br>
        <b>PULSO OBSERVADO:</b> ${PULSOS_ASTRONOMICOS[estadoAstronomico.pulsoDelDia]}<br>
        <b>ÁNGULO ORBITAL:</b> ${estadoAstronomico.anguloOrbital.toFixed(4)}°<br>
        <b>Amanecer:</b> ${estadoAstronomico.momentosReales.amanecer.toLocaleTimeString()}<br>
        <b>Mediodía:</b> ${estadoAstronomico.momentosReales.mediodia.toLocaleTimeString()}<br>
        <b>Atardecer:</b> ${estadoAstronomico.momentosReales.atardecer.toLocaleTimeString()}
    `;
});

// --- INICIO DE LA SIMULACIÓN ---
vista.iniciarAnimacion(corazon);

// Sincronizar con la fecha de HOY al cargar para que la demo sea más clara
const hoy = new Date();
const momentoDeHoy = ancla.gregorianoAMomento(hoy);
corazon.momentoAbsoluto = momentoDeHoy;
corazon.dispatchEvent({ type: 'pulso' });
