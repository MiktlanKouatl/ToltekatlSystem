const TONALLI = [
    'Cipactli', 'Ehecatl', 'Kalli', 'Cuetzpalin', 'Koatl', 'Miquiztli',
    'Mazatl', 'Tochtli', 'Atl', 'Itzcuintli', 'Ozomatli', 'Malinalli',
    'Akatl', 'Ocelotl', 'Kuauhtli', 'Kozkakuauhtli', 'Ollin',
    'Tekpatl', 'Kiahuitl', 'Xochitl'
];

/**
 * @function getTonalpohualliNumber
 * @description Convierte una fecha Tonal (número, nombre) a su día único (1-260).
 * @param {number} numero - El número del día (1-13).
 * @param {string} nombre - El nombre del signo.
 * @returns {number} - El número de día en el ciclo de 260 días.
 */
function getTonalpohualliNumber(numero: number, nombre: string): number {
    const signIndex = TONALLI.indexOf(nombre); // 0-19
    // Resolvemos el sistema de congruencias (Teorema Chino del Resto)
    // para encontrar el único día 'x' (1-260) que satisface las condiciones.
    for (let x = 1; x <= 260; x++) {
        if ((x - numero) % 13 === 0 && (x - (signIndex + 1)) % 20 === 0) {
            return x;
        }
    }
    return -1; // Error
}

/**
 * @function calibrarDesdeAncla
 * @description Usa el ancla histórica para encontrar la fecha de inicio del año 3 Kalli.
 */
function calibrarDesdeAncla() {
    console.log(`\n============== MODO CALIBRACIÓN: ANCLA 1 KOATL ==============`);

    // 1. DEFINIR EL ANCLA Y EL INICIO DEL AÑO
    const anclaGregoriana = new Date('1521-09-02T12:00:00Z');
    const anclaTonal = { numero: 1, nombre: 'Koatl' };
    const inicioAnioTonal = { numero: 3, nombre: 'Kalli' };

    console.log(`[1] Ancla: ${anclaGregoriana.toISOString().split('T')[0]} (Gregoriano) = ${anclaTonal.numero} ${anclaTonal.nombre}`);
    console.log(`[1.1] Buscando el inicio del año ${inicioAnioTonal.numero} ${inicioAnioTonal.nombre}`);

    // 2. CONVERTIR TONALES A NÚMEROS DE DÍA
    const diaAncla = getTonalpohualliNumber(anclaTonal.numero, anclaTonal.nombre);
    const diaInicioAnio = getTonalpohualliNumber(inicioAnioTonal.numero, inicioAnioTonal.nombre);
    console.log(`[2] Día del Ancla en el Tonalpohualli: ${diaAncla}`);
    console.log(`[2.1] Día de Inicio del Año en el Tonalpohualli: ${diaInicioAnio}`);

    // 3. CALCULAR DÍAS TRANSCURRIDOS
    let diasTranscurridos = diaAncla - diaInicioAnio;
    if (diasTranscurridos < 0) {
        diasTranscurridos += 260; // Ajustar si el ciclo da la vuelta
    }
    const diaDelAnio = diasTranscurridos + 1;
    console.log(`[3] El ancla corresponde al día número ${diaDelAnio} del Xiuhpohualli.`);

    // 4. CALCULAR LA FECHA DE INICIO
    const fechaInicioAnio = new Date(anclaGregoriana);
    fechaInicioAnio.setUTCDate(anclaGregoriana.getUTCDate() - diasTranscurridos);
    
    console.log(`\n============== RESULTADO DE LA CALIBRACIÓN ==============`);
    console.log(`La fecha de inicio calculada para el año 3 Kalli es:`);
    console.log(`\t ${fechaInicioAnio.toISOString().split('T')[0]} (Gregoriano)`);
    console.log(`=============================================================`);
}

// --- EJECUCIÓN DEL MODO CALIBRACIÓN ---
calibrarDesdeAncla();
