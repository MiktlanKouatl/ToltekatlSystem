import * as Astronomy from 'astronomy-engine';
import { CARGADORES } from './Artefacto.js';

// AnclaGregoriana.js - El puente entre dos cuentas

const PULSOS_POR_ANIO = 1461; // Representa 365.25 * 4. La duración de un "año tropical ideal" en pulsos.
const MS_POR_DIA = 1000 * 60 * 60 * 24;
const MS_POR_HORA = 1000 * 60 * 60;

// Tiempos de inicio de cada portador de año en un ciclo de 52 años.
// Estos valores representan la hora del día (en horas, con fracciones para minutos) en UTC.
const YEAR_BEARER_START_TIMES = {
    'Tochtli': 6 + 45 / 60,    // 06:45 UTC
    'Akatl': 12 + 45 / 60,   // 12:45 UTC
    'Tekpatl': 18 + 45 / 60,   // 18:45 UTC
    'Kali': 0 + 45 / 60,      // 00:45 UTC
};

// Offset para mapear un año gregoriano a un Portador del Año.
// Basado en experimento_04.ts: 2023 = Tekpatl (index 0 en CARGADORES), 2024 = Kalli (index 1), 2025 = Tochtli (index 2)
// CARGADORES = ['Tochtli', 'Akatl', 'Tekpatl', 'Kali'];
// Si 2023 es Tekpatl (index 2 en CARGADORES), entonces (2023 + OFFSET) % 4 = 2
// (2023 + 3) % 4 = 2026 % 4 = 2.  Entonces OFFSET = 3
const GREGORIAN_YEAR_TO_YEAR_BEARER_OFFSET = 3; 

export class AnclaGregoriana {
    constructor() {
        // Definimos un año ancla astronómico. Utilizaremos el equinoccio vernal de este año.
        const AstronomicalAnchorYear = 1558;
        this.AstronomicalAnchorYear = AstronomicalAnchorYear;
        
        // Calcular el equinoccio vernal (longitud solar 0 grados) del año ancla usando Astronomy.Seasons.
        const seasonsAnchor = Astronomy.Seasons(this.AstronomicalAnchorYear);
        const equinoxResult = seasonsAnchor.mar_equinox;

        if (!equinoxResult || !equinoxResult.date) {
            throw new Error(`No se pudo encontrar el equinoccio vernal para el año ${this.AstronomicalAnchorYear}`);
        }
        this.anchorEquinoxDate = equinoxResult.date;

        // MS_POR_ANIO_TROPICO_IDEAL se calcula como 365.25 * MS_POR_DIA
        // Esto es porque PULSOS_POR_ANIO (1461) representa 365.25 días * 4 pulsos/día
        const MS_POR_ANIO_TROPICO_IDEAL = MS_POR_DIA * 365.25;
        this.MS_POR_PULSO = MS_POR_ANIO_TROPICO_IDEAL / PULSOS_POR_ANIO;
        this.pulsosPorAnioTropical = PULSOS_POR_ANIO; // 1461 pulsos = 1 año tropical ideal

        // --- CALIBRACIÓN DEL MOMENTO ABSOLUTO CON LA REFERENCIA DEL USUARIO ---
        // Referencia del usuario: 12 de Marzo de 1558, 06:45 UTC (corresponde a 1 Tochtli, 1 Sipaktli)
        // Este es el momento absoluto 0 para el sistema Tolteca.
        this.anclaMomento = 0; 
        this.anclaGregoriana = new Date(Date.UTC(1558, 2, 12, 6, 45, 0)); // La fecha Gregoriana que corresponde a anclaMomento = 0

        console.log(`Puente calendárico anclado a la fecha gregoriana: ${this.anclaGregoriana.toUTCString()} (Momento Absoluto: ${this.anclaMomento})`);
    }

    /**
     * Determina el nombre del Portador del Año para un año gregoriano dado.
     * @param gregorianYear El año gregoriano.
     * @returns El nombre del Portador del Año.
     */
    getYearBearerName(gregorianYear) {
        // Ajustamos el offset para que el mapeo coincida con la secuencia de CARGADORES.
        // CARGADORES = ['Tochtli', 'Akatl', 'Tekpatl', 'Kali'];
        // Si 2023 es Tekpatl (index 2), entonces (2023 + OFFSET) % 4 = 2
        // (2023 + 3) % 4 = 2026 % 4 = 2.  Entonces OFFSET = 3
        const index = (gregorianYear + GREGORIAN_YEAR_TO_YEAR_BEARER_OFFSET) % 4;
        return CARGADORES[index];
    }

    /**
     * Convierte una fecha Gregoriana (Date) a un "momento absoluto" interno del sistema Toltekatl.
     * La conversión se basa en la duración del año tropical astronómico, anclado al equinoccio vernal.
     * Se considera el Portador del Año para ajustar el inicio del año Tolteca.
     * @param fecha La fecha Gregoriana a convertir.
     * @returns El momento absoluto correspondiente.
     */
    gregorianoAMomento(fecha) {
        const targetYear = fecha.getUTCFullYear();
        const currentYearBearerName = this.getYearBearerName(targetYear);

        // Calcular el equinoccio vernal del año de la fecha dada usando Astronomy.Seasons.
        const seasonsTarget = Astronomy.Seasons(targetYear);
        const targetEquinoxResult = seasonsTarget.mar_equinox;

        if (!targetEquinoxResult || !targetEquinoxResult.date) {
            throw new Error(`No se pudo encontrar el equinoccio vernal para el año ${targetYear}`);
        }
        const targetEquinoxDate = targetEquinoxResult.date;

        // Ajustar el equinoccio vernal con la hora de inicio del Portador del Año.
        const yearBearerStartTimeHours = YEAR_BEARER_START_TIMES[currentYearBearerName];
        const adjustedYearStartTimeMs = targetEquinoxDate.getTime() + (yearBearerStartTimeHours * MS_POR_HORA);
        const adjustedYearStartDate = new Date(adjustedYearStartTimeMs);

        // Calcular la diferencia en milisegundos entre la fecha dada y el inicio astronómico ajustado del año Tolteca.
        const diffMsFromAdjustedYearStartToFecha = fecha.getTime() - adjustedYearStartDate.getTime();
        const pulsosFromAdjustedYearStart = diffMsFromAdjustedYearStartToFecha / this.MS_POR_PULSO;

        // Calcular la diferencia en milisegundos entre el inicio astronómico ajustado del año Tolteca y la ancla Gregoriana.
        const diffMsFromAnchorToAdjustedYearStart = adjustedYearStartDate.getTime() - this.anclaGregoriana.getTime();
        const pulsosFromAnchorToAdjustedYearStart = diffMsFromAnchorToAdjustedYearStart / this.MS_POR_PULSO;

        return this.anclaMomento + pulsosFromAnchorToAdjustedYearStart + pulsosFromAdjustedYearStart;
    }

    /**
     * Convierte un "momento absoluto" interno del sistema Toltekatl a una fecha Gregoriana (Date).
     * @param momento El momento absoluto a convertir.
     * @returns La fecha Gregoriana correspondiente.
     */
    momentoAGregoriano(momento) {
        // Calcular la diferencia de pulsos desde el anclaMomento
        const diffPulsosFromAnchorMoment = momento - this.anclaMomento;
        const diffMsFromAnchorMoment = diffPulsosFromAnchorMoment * this.MS_POR_PULSO;

        // Sumar esta diferencia a la fecha de anclaje Gregoriana
        const nuevaFechaMs = this.anclaGregoriana.getTime() + diffMsFromAnchorMoment;
        return new Date(nuevaFechaMs);
    }
}
