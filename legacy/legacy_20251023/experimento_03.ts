// src/experimento.ts

import { AstroTime, Body, SearchMaxElongation } from 'astronomy-engine';

console.log("--- INICIANDO EXPERIMENTO DE RESONANCIA CON VENUS (Estrella Matutina) ---");

// --- FUNCIÓN AUXILIAR PARA ENCONTRAR LA MÁXIMA ELONGACIÓN MATUTINA MÁS CERCANA ---
function findNearestMorningElongation(targetDate: AstroTime): AstroTime {
    let searchDate = targetDate.AddDays(-200); // Empezar a buscar un poco antes
    let elongationEvent;
    
    // Buscamos el próximo evento de máxima elongación hasta encontrar uno que sea matutino
    while (true) {
        elongationEvent = SearchMaxElongation(Body.Venus, searchDate);
        if (elongationEvent.visibility === 'morning') {
            // Si el evento encontrado es matutino, lo usamos.
            break;
        }
        // Si no, avanzamos la fecha de búsqueda para encontrar el siguiente.
        searchDate = elongationEvent.time.AddDays(1);
    }
    return elongationEvent.time;
}

// --- 1. ANÁLISIS DEL ANCLA HISTÓRICA (1522) ---
const inicioXiuhpoalli1522 = new AstroTime(new Date(Date.UTC(1522, 2, 12, 6, 45, 0)));
const elongacionVenus1522 = findNearestMorningElongation(inicioXiuhpoalli1522);
const diferenciaDias1522 = inicioXiuhpoalli1522.ut - elongacionVenus1522.ut;

console.log("Ancla Histórica (1522):");
console.log(`Inicio del Xiuhpohualli: ${inicioXiuhpoalli1522.toString()}`);
console.log(`Máxima Elongación Matutina: ${elongacionVenus1522.toString()}`);
console.log(`DIFERENCIA: El Xiuhpohualli comenzó ${diferenciaDias1522.toFixed(2)} días DESPUÉS de la elongación.`);
console.log("-------------------------------------------------");


// --- 2. ANÁLISIS DEL ANCLA MODERNA (2025) ---
const inicioXiuhpoalli2025 = new AstroTime(new Date(Date.UTC(2025, 2, 15, 0, 45, 0)));
const elongacionVenus2025 = findNearestMorningElongation(inicioXiuhpoalli2025);
const diferenciaDias2025 = inicioXiuhpoalli2025.ut - elongacionVenus2025.ut;

console.log("Ancla Moderna (2025):");
console.log(`Inicio del Xiuhpohualli: ${inicioXiuhpoalli2025.toString()}`);
console.log(`Máxima Elongación Matutina: ${elongacionVenus2025.toString()}`);
console.log(`DIFERENCIA: El Xiuhpohualli comenzó ${diferenciaDias2025.toFixed(2)} días DESPUÉS de la elongación.`);
console.log("-------------------------------------------------");

// --- 3. CONCLUSIÓN ---
const consistencia = Math.abs(diferenciaDias1522 - diferenciaDias2025);
console.log(`Consistencia del desfase (diferencia entre las dos mediciones): ${consistencia.toFixed(2)} días.`);
if (consistencia < 5) { // Si la diferencia es de unos pocos días en 500 años
    console.log("CONCLUSIÓN: ¡SINCRONIZACIÓN ENCONTRADA! La relación con la máxima elongación de Venus es consistente. Venus es el ancla maestra.");
} else {
    console.log("CONCLUSIÓN: La relación con la máxima elongación de Venus no es constante. El anclaje principal debe ser puramente estacional (equinoccio).");
}