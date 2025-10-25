/*
 * MOTOR DE CÁLCULO PARA EL SISTEMA TOLTEKATL
 * Versión 1.0
 * Colaboración: Miktlan Kouatl & Astronomía
 *
 * Este script calcula el inicio del Xiuhpohualli basado en el
 * Equinoccio de Primavera como marcador de los Nemontemi.
 */

// --- Dependencia (se asume que 'astronomy-engine' está instalado) ---
// Para instalar: npm install astronomy-engine
import * as Astronomy from 'astronomy-engine';


// --- PARÁMETROS FIJOS ---
const teotihuacan = {
    latitude: 19.69,
    longitude: -98.84,
    elevation: 2280 // metros
};

const ANIO_GREGORIANO_A_CALCULAR = 2024;


/**
 * @function calcularInicioXiuhpohualli
 * @description Calcula la fecha de inicio del año mesoamericano (Xiuhpohualli)
 * basado en el equinoccio de primavera.
 * @param {number} year - El año gregoriano para el cual se hará el cálculo.
 * @returns {void} - Imprime los resultados directamente en la consola.
 */
function calcularInicioXiuhpohualli(year: number) {
    console.log(`\n============== CÁLCULO PARA EL AÑO ${year} ==============`);

    // 1. CALCULAR EL EQUINOCCIO DE PRIMAVERA
    // La librería devuelve el evento en Tiempo Universal (UTC).
    const seasons = Astronomy.Seasons(year);
    const equinoxUTC = seasons.mar_equinox.date;
    console.log(`[1] Equinoccio de Primavera (UTC): \t${equinoxUTC.toISOString()}`);

    // Convertir a la hora local de Teotihuacán (UTC-6) para referencia.
    // Ojo: JavaScript no maneja zonas horarias de forma nativa y robusta.
    // Esta es una simple resta de 6 horas para nuestra zona.
    const equinoxLocal = new Date(equinoxUTC.getTime() - (6 * 60 * 60 * 1000));
    console.log(`[1.1] Equinoccio (Local Teotihuacán, ~UTC-6): ${equinoxLocal.toLocaleString('es-MX')}`);


    // 2. DETERMINAR EL INICIO DE LOS NEMONTEMI Y DEL AÑO NUEVO
    // El día del equinoccio es el primer día de los Nemontemi.
    // Usamos la fecha UTC para mantener la precisión astronómica.
    const inicioNemontemi = new Date(equinoxUTC);
    // Para obtener la fecha del día, ignoramos la hora.
    inicioNemontemi.setUTCHours(0, 0, 0, 0);

    // Los Nemontemi duran 5 días. El año nuevo comienza 5 días después.
    const inicioXiuhpohualli = new Date(inicioNemontemi);
    inicioXiuhpohualli.setUTCDate(inicioNemontemi.getUTCDate() + 5);
    console.log(`\n[2] Inicio calculado del Xiuhpohualli (1 Cipactli): ${inicioXiuhpohualli.toISOString().split('T')[0]}`);


    // 3. ASIGNAR CARGADOR DEL AÑO Y HORA DE INICIO
    // Se necesita un año de referencia para anclar el ciclo de 4 cargadores.
    // Usaremos una referencia común: 2024 es 9 Tochtli (por lo tanto, año Tochtli).
    // El ciclo es Kalli, Tochtli, Akatl, Tekpatl.
    const cargadores = [
        { nombre: 'Tekpatl', hora: '18:45' }, // 2023
        { nombre: 'Kalli',   hora: '00:45' }, // 2022 (o 2026)
        { nombre: 'Tochtli', hora: '06:45' }, // 2024
        { nombre: 'Akatl',   hora: '12:45' }  // 2025
    ];
    
    // El operador módulo (%) nos da la posición en el ciclo.
    // Ajustamos el offset para que 2024 sea Tochtli. (2024 % 4 = 0, pero necesitamos índice 2)
    // (2024 + 2) % 4 = 2.  (Tochtli)
    // (2025 + 2) % 4 = 3.  (Akatl)
    // (2026 + 2) % 4 = 0. -> Error. Se corrige con (year - 2022) % 4
    const index = (year - 2022) % 4; // 2022 es Kalli (índice 1), pero el arreglo es 0-index. Se ajusta.
    const cargadorIndex = (year - 2023) % 4; // 2023 = Tekpatl (0), 2024 = Kalli (1), 2025 = Tochtli (2)
    const cargadorDelAnio = cargadores[(year - 2023 + 4) % 4]; // El +4 asegura un resultado positivo
    

    console.log(`\n[3] El año ${year} es un año: \t\t${cargadorDelAnio.nombre}`);
    console.log(`[3.1] La cuenta del año inicia a las: \t${cargadorDelAnio.hora} (hora local)`);

    console.log(`\n============== RESULTADO FINAL ==============`);
    console.log(`El año ${year} (${cargadorDelAnio.nombre}) comienza en la fecha gregoriana del ${inicioXiuhpohualli.toISOString().split('T')[0]}, a las ${cargadorDelAnio.hora}.`);
    console.log(`=============================================`);
}

// --- EJECUCIÓN DEL CÁLCULO ---
calcularInicioXiuhpohualli(ANIO_GREGORIANO_A_CALCULAR);
