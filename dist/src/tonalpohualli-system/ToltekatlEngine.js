"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToltekatlEngine = void 0;
var ToltekatlSystem_1 = require("./ToltekatlSystem");
var HOURS_IN_TROPICAL_YEAR = 365.25 * 24;
var DAYS_IN_CALENDAR_ROUND = 18980; // 52 * 365.25 = 18993. 52 * 365 + 13 = 18993. 73 * 260 = 18980. Let's use 18980 for the 52-year cycle.
var HOURS_IN_DAY = 24;
/**
 * ToltekatlEngine es un motor de estudio con estado para la cuenta del tiempo Toltekatl.
 * Puede operar de forma abstracta (solo Tolteca) o calibrado con una fecha gregoriana.
 */
var ToltekatlEngine = /** @class */ (function () {
    function ToltekatlEngine(anchor) {
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
    ToltekatlEngine.prototype._calculateAbsoluteToltecDay = function (coordinate) {
        var tonalIndex = ToltekatlSystem_1.TONALES.findIndex(function (t) { return t.name === coordinate.tonal.name; });
        if (tonalIndex === -1) {
            throw new Error("Coordenada Tolteca inválida: Tonal no encontrado.");
        }
        // Iterate through each possible tropical year in the 52-year cycle
        for (var tropicalYearIndex = 0; tropicalYearIndex < 52; tropicalYearIndex++) {
            var currentYearBearerName = ToltekatlSystem_1.YEAR_BEARERS[tropicalYearIndex % 4];
            var currentYearBearerNumeral = (tropicalYearIndex % 13) + 1;
            // Check if the year bearer matches the coordinate's year bearer
            if (currentYearBearerName === coordinate.yearBearer.name && currentYearBearerNumeral === coordinate.yearBearer.numeral) {
                // If the year bearer matches, iterate through each day of this tropical year
                var startOfThisTropicalYear_absoluteDays = tropicalYearIndex * 365.25;
                var yearStartTime_hours = ToltekatlSystem_1.YEAR_BEARER_START_TIMES[currentYearBearerName];
                var yearStartTime_dayFraction = yearStartTime_hours / HOURS_IN_DAY;
                // Iterate through the 365 days of the year (excluding the .25 fraction for now)
                for (var dayOfYear = 1; dayOfYear <= 365; dayOfYear++) {
                    // Construct the candidate absoluteToltecDay (float) for the start of this specific day
                    var candidateAbsoluteToltecDay = startOfThisTropicalYear_absoluteDays + (dayOfYear - 1) + yearStartTime_dayFraction;
                    // Calculate the tonal and numeral for this candidateAbsoluteToltecDay
                    var calculatedTonalIndex = Math.floor(candidateAbsoluteToltecDay) % 20;
                    var calculatedTonalNumeral = (Math.floor(candidateAbsoluteToltecDay) % 13) + 1;
                    // If the tonal and numeral match the coordinate's tonal and numeral
                    if (calculatedTonalIndex === tonalIndex && calculatedTonalNumeral === coordinate.tonal.numeral) {
                        return candidateAbsoluteToltecDay;
                    }
                }
            }
        }
        throw new Error("No se pudo encontrar el día absoluto para la coordenada Tolteca proporcionada.");
    };
    /**
     * Calcula el estado completo (continuo y trópico) a partir de un día absoluto Tolteca.
     */
    ToltekatlEngine.prototype._calculateStateFromAbsoluteToltecDay = function (absoluteToltecDay) {
        // --- CÁLCULO DE LA CUENTA CONTINUA (ININTERRUMPIDA) ---
        var continuousDay = Math.floor(absoluteToltecDay);
        var continuousTonalIndex = continuousDay % 20;
        var continuousNumeral = (continuousDay % 13) + 1;
        var continuousXiuhpoualiCycle = Math.floor(continuousDay / 365) + 1;
        var continuousYearBearerIndex = Math.floor(continuousDay / 365) % 4;
        var continuousYearBearerNumeral = ((continuousXiuhpoualiCycle - 1) % 13) + 1;
        var continuousState = {
            tonal: { data: ToltekatlSystem_1.TONALES[continuousTonalIndex], index: continuousTonalIndex },
            numeral: continuousNumeral,
            dayOfTonalpouali: (continuousDay % 260) + 1,
            trecena: Math.floor((continuousDay % 260) / 13) + 1,
            dayOfTrecena: (continuousDay % 13) + 1,
            yearBearer: { name: ToltekatlSystem_1.YEAR_BEARERS[continuousYearBearerIndex], numeral: continuousYearBearerNumeral },
        };
        // --- CÁLCULO DE LA CUENTA TRÓPICA (ANUAL CON REINICIO) ---
        var tropicalYearIndex = Math.floor(absoluteToltecDay / 365.25);
        var daysIntoTropicalYear = absoluteToltecDay % 365.25;
        var dayOfYear = Math.floor(daysIntoTropicalYear) + 1;
        var yearBearerName = ToltekatlSystem_1.YEAR_BEARERS[tropicalYearIndex % 4];
        var yearStartTime = ToltekatlSystem_1.YEAR_BEARER_START_TIMES[yearBearerName];
        var isNemontemi = dayOfYear > 360;
        var veintenaIndex = isNemontemi ? 0 : Math.floor((dayOfYear - 1) / 20) + 1;
        var veintenaName = isNemontemi ? null : ToltekatlSystem_1.VEINTENA_NAMES[veintenaIndex - 1];
        var tropicalTonalIndex = (dayOfYear - 1) % 20;
        var tropicalState = {
            year: tropicalYearIndex + 1,
            dayOfYear: dayOfYear,
            yearStartTime: yearStartTime,
            tonal: { data: ToltekatlSystem_1.TONALES[tropicalTonalIndex], index: tropicalTonalIndex },
            numeral: continuousNumeral, // El numeral fluye de la cuenta continua
            veintena: { index: veintenaIndex, name: veintenaName },
            isNemontemi: isNemontemi,
        };
        return {
            continuous: continuousState,
            tropical: tropicalState,
        };
    };
    ToltekatlEngine.prototype._updateState = function () {
        this._currentState = this._calculateStateFromAbsoluteToltecDay(this._absoluteToltecDay);
        if (this._gregorianOffsetDays !== null && this._currentTime) {
            var gregorianDay = this._absoluteToltecDay - this._gregorianOffsetDays;
            this._currentTime.setTime(gregorianDay * (1000 * 60 * 60 * HOURS_IN_DAY));
        }
    };
    // --- MÉTODOS DE NAVEGACIÓN Y CONTROL ---
    ToltekatlEngine.prototype.nextHour = function () {
        this._absoluteToltecDay += (1 / HOURS_IN_DAY);
        this._updateState();
    };
    ToltekatlEngine.prototype.prevHour = function () {
        this._absoluteToltecDay -= (1 / HOURS_IN_DAY);
        this._updateState();
    };
    ToltekatlEngine.prototype.nextDay = function () {
        this._absoluteToltecDay += 1;
        this._updateState();
    };
    ToltekatlEngine.prototype.prevDay = function () {
        this._absoluteToltecDay -= 1;
        this._updateState();
    };
    ToltekatlEngine.prototype.nextTrecena = function () {
        this._absoluteToltecDay += 13;
        this._updateState();
    };
    ToltekatlEngine.prototype.prevTrecena = function () {
        this._absoluteToltecDay -= 13;
        this._updateState();
    };
    ToltekatlEngine.prototype.nextVeintena = function () {
        this._absoluteToltecDay += 20;
        this._updateState();
    };
    ToltekatlEngine.prototype.prevVeintena = function () {
        this._absoluteToltecDay -= 20;
        this._updateState();
    };
    ToltekatlEngine.prototype.nextXiuhpouali = function () {
        this._absoluteToltecDay += 365.25; // Avanza un año trópico
        this._updateState();
    };
    ToltekatlEngine.prototype.prevXiuhpouali = function () {
        this._absoluteToltecDay -= 365.25; // Retrocede un año trópico
        this._updateState();
    };
    ToltekatlEngine.prototype.jumpToDate = function (date) {
        if (this._gregorianOffsetDays === null) {
            console.warn("El motor no está calibrado con una fecha gregoriana. Use setGregorianDate primero.");
            return;
        }
        var targetGregorianDay = Math.floor(date.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
        this._absoluteToltecDay = targetGregorianDay + this._gregorianOffsetDays;
        this._currentTime = new Date(date);
        this._updateState();
    };
    ToltekatlEngine.prototype.setGregorianDate = function (gregorianDate) {
        var gregorianDay = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
        this._gregorianOffsetDays = this._absoluteToltecDay - gregorianDay;
        this._currentTime = new Date(gregorianDate);
        this._updateState();
    };
    // --- MÉTODOS DE ACCESO Y ANÁLISIS ---
    ToltekatlEngine.prototype.getCurrentTime = function () { return this._currentTime ? new Date(this._currentTime) : null; };
    ToltekatlEngine.prototype.getState = function () { return this._currentState; };
    ToltekatlEngine.prototype.getContinuousState = function () { return this._currentState.continuous; };
    ToltekatlEngine.prototype.getTropicalState = function () { return this._currentState.tropical; };
    ToltekatlEngine.prototype.getAngularPositions = function () {
        // Normalizar _absoluteToltecDay para evitar números negativos muy grandes
        var normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;
        return {
            tonalAngle: ((normalizedAbsoluteToltecDay % 20) / 20) * 2 * Math.PI,
            numeralAngle: ((normalizedAbsoluteToltecDay % 13) / 13) * 2 * Math.PI,
            xiuhpoualliAngle: ((normalizedAbsoluteToltecDay % 365.25) / 365.25) * 2 * Math.PI,
        };
    };
    ToltekatlEngine.prototype.getCalendarRoundInfo = function () {
        var normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;
        var totalRounds = Math.floor(this._absoluteToltecDay / DAYS_IN_CALENDAR_ROUND);
        // Para calcular fechas gregorianas, necesitamos que el sistema esté calibrado
        var startDate = null;
        var endDate = null;
        if (this._gregorianOffsetDays !== null && this._currentTime) {
            var currentGregorianDay = Math.floor(this._currentTime.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
            var startOfCurrentRoundGregorianDay = currentGregorianDay - normalizedAbsoluteToltecDay;
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
    };
    return ToltekatlEngine;
}());
exports.ToltekatlEngine = ToltekatlEngine;
