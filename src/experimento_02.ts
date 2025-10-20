import { AstroTime, Ecliptic, HelioVector, Body, SearchRelativeLongitude } from 'astronomy-engine';

console.log("--- INICIANDO EXPERIMENTO DE SINCRONIZACIÓN CON VENUS ---");

// --- FUNCIÓN AUXILIAR PARA ENCONTRAR LA CONJUNCIÓN INFERIOR MÁS CERCANA ---
function findNearestInferiorConjunction(targetDate: AstroTime): AstroTime {
    // La conjunción inferior ocurre cuando la longitud relativa entre Venus y la Tierra (vistas desde el Sol) es 0.
    // Buscamos hacia atrás y hacia adelante para encontrar la más cercana.
    const futureConjunction = SearchRelativeLongitude(Body.Venus, 0, targetDate);
    const pastConjunction = SearchRelativeLongitude(Body.Venus, 0, targetDate.AddDays(-300)); // Buscamos en el pasado cercano

    const diffFuture = Math.abs(futureConjunction.ut - targetDate.ut);
    const diffPast = Math.abs(pastConjunction.ut - targetDate.ut);

    return diffFuture < diffPast ? futureConjunction : pastConjunction;
}

// --- 1. ANÁLISIS DEL ANCLA HISTÓRICA (1522) ---
const inicioXiuhpoalli1522 = new AstroTime(new Date(Date.UTC(1522, 2, 12, 6, 45, 0)));
const conjuncionVenus1522 = findNearestInferiorConjunction(inicioXiuhpoalli1522);
const diferenciaDias1522 = inicioXiuhpoalli1522.ut - conjuncionVenus1522.ut;

console.log("Ancla Histórica (1522):");
console.log(`Inicio del Xiuhpohualli: ${inicioXiuhpoalli1522.toString()}`);
console.log(`Conjunción de Venus más cercana: ${conjuncionVenus1522.toString()}`);
console.log(`DIFERENCIA: El Xiuhpohualli comenzó ${diferenciaDias1522.toFixed(2)} días DESPUÉS de la conjunción.`);
console.log("-------------------------------------------------");


// --- 2. ANÁLISIS DEL ANCLA MODERNA (2025) ---
const inicioXiuhpoalli2025 = new AstroTime(new Date(Date.UTC(2025, 2, 15, 0, 45, 0)));
const conjuncionVenus2025 = findNearestInferiorConjunction(inicioXiuhpoalli2025);
const diferenciaDias2025 = inicioXiuhpoalli2025.ut - conjuncionVenus2025.ut;

console.log("Ancla Moderna (2025):");
console.log(`Inicio del Xiuhpohualli: ${inicioXiuhpoalli2025.toString()}`);
console.log(`Conjunción de Venus más cercana: ${conjuncionVenus2025.toString()}`);
console.log(`DIFERENCIA: El Xiuhpohualli comenzó ${diferenciaDias2025.toFixed(2)} días DESPUÉS de la conjunción.`);
console.log("-------------------------------------------------");

// --- 3. CONCLUSIÓN ---
const consistencia = Math.abs(diferenciaDias1522 - diferenciaDias2025);
console.log(`Consistencia del desfase (diferencia entre las dos mediciones): ${consistencia.toFixed(2)} días.`);
if (consistencia < 5) { // Si la diferencia es de unos pocos días en 500 años
    console.log("CONCLUSIÓN: ¡SINCRONIZACIÓN ENCONTRADA! La relación entre el inicio del Xiuhpohualli y la conjunción de Venus es notablemente consistente. Esto sugiere que Venus es un ancla fundamental del sistema.");
} else {
    console.log("CONCLUSIÓN: La relación con Venus no es constante en estas fechas. El anclaje principal podría ser puramente estacional (equinoccio) o estar relacionado con otro evento.");
}