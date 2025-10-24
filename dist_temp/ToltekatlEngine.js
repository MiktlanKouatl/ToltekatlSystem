"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToltekatlEngine = void 0;
const ToltekatlSystem_1 = require("./ToltekatlSystem");
const HOURS_IN_TROPICAL_YEAR = 365.25 * 24;
const DAYS_IN_CALENDAR_ROUND = 18993; // 52 * 365.25 = 18993
const HOURS_IN_DAY = 24;
/**
 * ToltekatlEngine es un motor de estudio con estado para la cuenta del tiempo Toltekatl.
 * Puede operar de forma abstracta (solo Tolteca) o calibrado con una fecha gregoriana.
 */
class ToltekatlEngine {
    constructor(anchor) {
        this._gregorianOffsetDays = null; // Diferencia entre _absoluteToltecDay y el día gregoriano 0
        this._currentTime = null; // Fecha gregoriana actual, puede ser null
        if ('date' in anchor) { // Es un IGregorianCalibrationAnchor
            this._absoluteToltecDay = this._calculateAbsoluteToltecDay(anchor.toltecCoordinate);
            this._gregorianOffsetDays = this._absoluteToltecDay - Math.floor(anchor.date.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
            this._currentTime = new Date(anchor.date);
        }
        else { // Es un IToltecCoordinate
            this._absoluteToltecDay = this._calculateAbsoluteToltecDay(anchor);
            this._gregorianOffsetDays = null;
            this._currentTime = null;
        }
        this._currentState = this._calculateStateFromAbsoluteToltecDay(this._absoluteToltecDay);
    }
    // --- MÉTODOS INTERNOS DE CÁLCULO ---
    /**
     * Convierte una coordenada Tolteca (Tonal y Portador del Año) a un día absoluto
     * dentro del ciclo de 52 años (0 a 18979).
     * Este es el corazón de la calibración Tolteca.
     */
    _calculateAbsoluteToltecDay(coordinate) {
        const tonalIndex = ToltekatlSystem_1.TONALES.findIndex(t => t.name === coordinate.tonal.name);
        if (tonalIndex === -1) {
            throw new Error("Coordenada Tolteca inválida: Tonal no encontrado.");
        }
        // Iterate through each possible tropical year in the 52-year cycle
        for (let tropicalYearIndex = 0; tropicalYearIndex < 52; tropicalYearIndex++) {
            const currentYearBearerName = ToltekatlSystem_1.YEAR_BEARERS[tropicalYearIndex % 4];
            const currentYearBearerNumeral = (tropicalYearIndex % 13) + 1;
            // Check if the year bearer matches the coordinate's year bearer
            if (currentYearBearerName === coordinate.yearBearer.name && currentYearBearerNumeral === coordinate.yearBearer.numeral) {
                // If the year bearer matches, iterate through each day of this tropical year
                const startOfThisTropicalYear_absoluteDays = tropicalYearIndex * 365.25;
                const yearStartTime_hours = ToltekatlSystem_1.YEAR_BEARER_START_TIMES[currentYearBearerName];
                const yearStartTime_dayFraction = yearStartTime_hours / HOURS_IN_DAY;
                // Iterate through the 365 days of the year (excluding the .25 fraction for now)
                for (let dayOfYear = 1; dayOfYear <= 365; dayOfYear++) {
                    // Construct the candidate absoluteToltecDay (float) for the start of this specific day
                    const candidateAbsoluteToltecDay = startOfThisTropicalYear_absoluteDays + (dayOfYear - 1) + yearStartTime_dayFraction;
                    // Calculate the tonal and numeral for this candidateAbsoluteToltecDay
                    const calculatedTonalIndex = Math.floor(candidateAbsoluteToltecDay) % 20;
                    const calculatedTonalNumeral = (Math.floor(candidateAbsoluteToltecDay) % 13) + 1;
                    // If the tonal and numeral match the coordinate's tonal and numeral
                    if (calculatedTonalIndex === tonalIndex && calculatedTonalNumeral === coordinate.tonal.numeral) {
                        return candidateAbsoluteToltecDay;
                    }
                }
            }
        }
        throw new Error("No se pudo encontrar el día absoluto para la coordenada Tolteca proporcionada.");
    }
    /**
     * Calcula el estado completo (continuo y trópico) a partir de un día absoluto Tolteca.
     */
    _calculateStateFromAbsoluteToltecDay(absoluteToltecDay) {
        // --- CÁLCULO DE LA CUENTA CONTINUA (ININTERRUMPIDA) ---
        const continuousDay = Math.floor(absoluteToltecDay);
        const continuousTonalIndex = continuousDay % 20;
        const continuousNumeral = (continuousDay % 13) + 1;
        const continuousXiuhpoualiCycle = Math.floor(continuousDay / 365) + 1;
        const continuousYearBearerIndex = Math.floor(continuousDay / 365) % 4;
        const continuousYearBearerNumeral = ((continuousXiuhpoualiCycle - 1) % 13) + 1;
        const continuousState = {
            tonal: { data: ToltekatlSystem_1.TONALES[continuousTonalIndex], index: continuousTonalIndex },
            numeral: continuousNumeral,
            dayOfTonalpouali: (continuousDay % 260) + 1,
            trecena: Math.floor((continuousDay % 260) / 13) + 1,
            dayOfTrecena: (continuousDay % 13) + 1,
            yearBearer: { name: ToltekatlSystem_1.YEAR_BEARERS[continuousYearBearerIndex], numeral: continuousYearBearerNumeral },
        };
        // --- CÁLCULO DE LA CUENTA TRÓPICA (ANUAL CON REINICIO) ---
        const tropicalYearIndex = Math.floor(absoluteToltecDay / 365.25);
        const daysIntoTropicalYear = absoluteToltecDay % 365.25;
        const dayOfYear = Math.floor(daysIntoTropicalYear) + 1;
        const yearBearerName = ToltekatlSystem_1.YEAR_BEARERS[tropicalYearIndex % 4];
        const yearStartTime = ToltekatlSystem_1.YEAR_BEARER_START_TIMES[yearBearerName];
        const isNemontemi = dayOfYear > 360;
        const veintenaIndex = isNemontemi ? 0 : Math.floor((dayOfYear - 1) / 20) + 1;
        const veintenaName = isNemontemi ? null : ToltekatlSystem_1.VEINTENA_NAMES[veintenaIndex - 1];
        const tropicalTonalIndex = (dayOfYear - 1) % 20;
        const tropicalState = {
            year: tropicalYearIndex + 1,
            dayOfYear: dayOfYear,
            yearStartTime: yearStartTime,
            tonal: continuousState.tonal,
            numeral: continuousState.numeral,
            veintena: { index: veintenaIndex, name: veintenaName },
            isNemontemi: isNemontemi,
            yearBearer: { name: yearBearerName, numeral: (tropicalYearIndex % 13) + 1 }, // Populate tropical yearBearer
        };
        return {
            absoluteDay: absoluteToltecDay, // Populate absoluteDay in ICombinedState
            continuous: continuousState,
            tropical: tropicalState,
        };
    }
    _updateState() {
        this._currentState = this._calculateStateFromAbsoluteToltecDay(this._absoluteToltecDay);
        if (this._gregorianOffsetDays !== null && this._currentTime) {
            const gregorianDay = this._absoluteToltecDay - this._gregorianOffsetDays;
            this._currentTime.setTime(gregorianDay * (1000 * 60 * 60 * HOURS_IN_DAY));
        }
    }
    // --- MÉTODOS DE NAVEGACIÓN Y CONTROL ---
    nextHour() {
        this._absoluteToltecDay += (1 / HOURS_IN_DAY);
        this._updateState();
    }
    prevHour() {
        this._absoluteToltecDay -= (1 / HOURS_IN_DAY);
        this._updateState();
    }
    nextDay() {
        this._absoluteToltecDay += 1;
        this._updateState();
    }
    prevDay() {
        this._absoluteToltecDay -= 1;
        this._updateState();
    }
    nextTrecena() {
        this._absoluteToltecDay += 13;
        this._updateState();
    }
    prevTrecena() {
        this._absoluteToltecDay -= 13;
        this._updateState();
    }
    nextVeintena() {
        this._absoluteToltecDay += 20;
        this._updateState();
    }
    prevVeintena() {
        this._absoluteToltecDay -= 20;
        this._updateState();
    }
    nextXiuhpouali() {
        this._absoluteToltecDay += 365.25; // Avanza un año trópico
        this._updateState();
    }
    prevXiuhpouali() {
        this._absoluteToltecDay -= 365.25; // Retrocede un año trópico
        this._updateState();
    }
    jumpToDate(date) {
        if (this._gregorianOffsetDays === null) {
            console.warn("El motor no está calibrado con una fecha gregoriana. Use setGregorianDate primero.");
            return;
        }
        const targetGregorianDay = Math.floor(date.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
        this._absoluteToltecDay = targetGregorianDay + this._gregorianOffsetDays;
        this._currentTime = new Date(date);
        this._updateState();
    }
    setGregorianDate(gregorianDate) {
        const gregorianDay = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
        this._gregorianOffsetDays = this._absoluteToltecDay - gregorianDay;
        this._currentTime = new Date(gregorianDate);
        this._updateState();
    }
    // --- MÉTODOS DE ACCESO Y ANÁLISIS ---
    getCurrentTime() { return this._currentTime ? new Date(this._currentTime) : null; }
    getState() { return this._currentState; }
    getContinuousState() { return this._currentState.continuous; }
    getTropicalState() { return this._currentState.tropical; }
    getAngularPositions() {
        // Normalizar _absoluteToltecDay para evitar números negativos muy grandes
        const normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;
        return {
            tonalAngle: ((normalizedAbsoluteToltecDay % 20) / 20) * 2 * Math.PI,
            numeralAngle: ((normalizedAbsoluteToltecDay % 13) / 13) * 2 * Math.PI,
            xiuhpoualliAngle: ((normalizedAbsoluteToltecDay % 365.25) / 365.25) * 2 * Math.PI,
        };
    }
    getCalendarRoundInfo() {
        const normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;
        const totalRounds = Math.floor(this._absoluteToltecDay / DAYS_IN_CALENDAR_ROUND);
        // Para calcular fechas gregorianas, necesitamos que el sistema esté calibrado
        let startDate = null;
        let endDate = null;
        if (this._gregorianOffsetDays !== null && this._currentTime) {
            const currentGregorianDay = Math.floor(this._currentTime.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
            const startOfCurrentRoundGregorianDay = currentGregorianDay - normalizedAbsoluteToltecDay;
            startDate = new Date(startOfCurrentRoundGregorianDay * (1000 * 60 * 60 * HOURS_IN_DAY));
            endDate = new Date((startOfCurrentRoundGregorianDay + DAYS_IN_CALENDAR_ROUND) * (1000 * 60 * 60 * HOURS_IN_DAY));
        }
        return {
            startDate: startDate,
            endDate: endDate,
            progress: (normalizedAbsoluteToltecDay / DAYS_IN_CALENDAR_ROUND) * 100,
            yearOfCycle: Math.floor(normalizedAbsoluteToltecDay / 365.25) + 1,
            roundNumber: totalRounds + 1, // El número de ciclo de 52 años
        };
    }
}
exports.ToltekatlEngine = ToltekatlEngine;
