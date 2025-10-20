// src/experimento.ts

// Importamos las herramientas astronómicas que necesitamos.
import { AstroTime, HelioVector, Ecliptic, Body } from 'astronomy-engine';

console.log("--- INICIANDO EXPERIMENTO ASTRONÓMICO (V2) ---");

// --- 1. MEDICIÓN DEL ANCLA MODERNA (2026) ---

// Ancla Moderna (Año 2026): 15 de marzo de 2026, a las 06:45, comienza el xiuitl 1 Tochtli.
const anclaModernaFecha = new Date(Date.UTC(2026, 2, 15, 6, 45, 0));
const anclaModernaTiempo = new AstroTime(anclaModernaFecha);

// Calculamos el ángulo orbital (longitud eclíptica heliocéntrica) para ese instante.
const vectorModerno = HelioVector(Body.EMB, anclaModernaTiempo);
const eclipticaModerna = Ecliptic(vectorModerno);
const anguloModerno = eclipticaModerna.elon;

console.log(`Ancla Moderna (15/Mar/2026 06:45):`);
console.log(`ÁNGULO ORBITAL MEDIDO: ${anguloModerno.toFixed(8)}°`);
console.log("-----------------------------------------");


// --- 2. MEDICIÓN DEL ANCLA HISTÓRICA (1522) ---

// Ancla Histórica (Año 1522): 12 de marzo de 1522, a las 06:45, comienza el Xiuitl 4 Tochtli.
const anclaHistoricaFecha = new Date(Date.UTC(1522, 2, 12, 6, 45, 0)); 
const anclaHistoricaTiempo = new AstroTime(anclaHistoricaFecha);

// Calculamos el ángulo orbital para ese día de inicio.
const vectorHistorico = HelioVector(Body.EMB, anclaHistoricaTiempo);
const eclipticaHistorica = Ecliptic(vectorHistorico);
const anguloHistorico = eclipticaHistorica.elon;

console.log(`Ancla Histórica (12/Mar/1522 06:45):`);
console.log(`Fecha: ${anclaHistoricaTiempo.toString()}`);
console.log(`ÁNGULO ORBITAL MEDIDO: ${anguloHistorico.toFixed(8)}°`);
console.log("-----------------------------------------");


// --- 3. ANÁLISIS DE RESULTADOS ---

const diferencia = Math.abs(anguloModerno - anguloHistorico);
console.log(`DIFERENCIA ABSOLUTA: ${diferencia.toFixed(8)}°`);

if (diferencia < 1.0) { // Si la diferencia es menor a 1 grado
    console.log("CONCLUSIÓN: Los ángulos son casi idénticos. Esto sugiere fuertemente un anclaje SIDERAL (cósmico).");
} else {
    console.log("CONCLUSIÓN: Los ángulos son significativamente diferentes. Esto sugiere fuertemente un anclaje TRÓPICO (estacional), influenciado por la precesión.");
}

console.log("--- FIN DEL EXPERIMENTO ---");
