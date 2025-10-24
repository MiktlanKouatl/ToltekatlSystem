
import { TONALES, VEINTENA_NAMES, YEAR_BEARERS, YEAR_BEARER_START_TIMES, ITonal, TonalName, YearBearerName } from './ToltekatlSystem';

// --- INTERFACES Y TIPOS ---

export interface IToltecCoordinate {
  tonal: { numeral: number; name: TonalName; };
  yearBearer: { numeral: number; name: YearBearerName; };
}

export interface IGregorianCalibrationAnchor {
  date: Date;
  toltecCoordinate: IToltecCoordinate;
}

export interface IContinuousState {
  tonal: { data: ITonal; index: number; };
  numeral: number;
  dayOfTonalpouali: number;
  trecena: number;
  dayOfTrecena: number;
  yearBearer: { name: YearBearerName; numeral: number; };
}

export interface ITropicalState {
  year: number;
  dayOfYear: number;
  yearStartTime: number;
  tonal: { data: ITonal; index: number; };
  numeral: number;
  veintena: { index: number; name: string | null; };
  isNemontemi: boolean;
  yearBearer: { name: YearBearerName; numeral: number; }; // Added this
}

export interface ICombinedState {
  absoluteDay: number; // Added this
  continuous: IContinuousState;
  tropical: ITropicalState;
}

export interface IAngularPositions {
  tonalAngle: number;
  numeralAngle: number;
  xiuhpoualliAngle: number;
}

const HOURS_IN_YEAR = 365 * 24;
const DAYS_IN_CALENDAR_ROUND = 18980; // 52 * 365
const HOURS_IN_DAY = 24;

/**
 * ToltekatlEngine es un motor de estudio con estado para la cuenta del tiempo Toltekatl.
 * Puede operar de forma abstracta (solo Tolteca) o calibrado con una fecha gregoriana.
 */
export class ToltekatlEngine {
  private _absoluteToltecDay: number; // Día absoluto en el ciclo de 52 años (0 a 18979)
  private _gregorianOffsetDays: number | null = null; // Diferencia entre _absoluteToltecDay y el día gregoriano 0
  private _currentTime: Date | null = null; // Fecha gregoriana actual, puede ser null
  private _currentState: ICombinedState;

  constructor(anchor: IToltecCoordinate | IGregorianCalibrationAnchor) {
    if ('date' in anchor) { // Es un IGregorianCalibrationAnchor
      this._absoluteToltecDay = this._calculateAbsoluteToltecDay(anchor.toltecCoordinate);
      this._gregorianOffsetDays = this._absoluteToltecDay - Math.floor(anchor.date.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
      this._currentTime = new Date(anchor.date);
    } else { // Es un IToltecCoordinate
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
  private _calculateAbsoluteToltecDay(coordinate: IToltecCoordinate): number {
    const targetTonalIndex = TONALES.findIndex(t => t.name === coordinate.tonal.name);
    if (targetTonalIndex === -1) {
      throw new Error("Coordenada Tolteca inválida: Tonal no encontrado.");
    }

    // Iterate through each integer day in the 52-year cycle
    for (let continuousDay = 0; continuousDay < DAYS_IN_CALENDAR_ROUND; continuousDay++) {
        // For each continuousDay, we need to find the corresponding absoluteToltecDay (float).
        // The fractional part of absoluteToltecDay is determined by the year's start time.

        // First, determine the tropical year context for this continuousDay.
        const tropicalYearIndex = Math.floor(continuousDay / 365); // Using 365 for year length
        const currentYearBearerName = YEAR_BEARERS[tropicalYearIndex % 4];
        const currentYearBearerNumeral = (tropicalYearIndex % 13) + 1;

        // Check if the year bearer matches the coordinate's year bearer
        if (currentYearBearerName === coordinate.yearBearer.name && currentYearBearerNumeral === coordinate.yearBearer.numeral) {
            // We found a continuousDay that falls within a matching tropical year.
            // Now, let's construct the candidateAbsoluteToltecDay (float) for this continuousDay.
            const yearStartTime_hours = YEAR_BEARER_START_TIMES[currentYearBearerName];
            const yearStartTime_dayFraction = yearStartTime_hours / HOURS_IN_DAY;

            const candidateAbsoluteToltecDay = continuousDay + yearStartTime_dayFraction;

            // Now, check if the continuous tonal and numeral match the coordinate's tonal and numeral.
            const calculatedTonalIndex = Math.floor(candidateAbsoluteToltecDay) % 20;
            const calculatedTonalNumeral = (Math.floor(candidateAbsoluteToltecDay) % 13) + 1;

            if (calculatedTonalIndex === targetTonalIndex && calculatedTonalNumeral === coordinate.tonal.numeral) {
                return candidateAbsoluteToltecDay;
            }
        }
    }
    throw new Error("No se pudo encontrar el día absoluto para la coordenada Tolteca proporcionada.");
  }

  /**
   * Calcula el estado completo (continuo y trópico) a partir de un día absoluto Tolteca.
   */
  private _calculateStateFromAbsoluteToltecDay(absoluteToltecDay: number): ICombinedState {
    // --- CÁLCULO DE LA CUENTA CONTINUA (ININTERRUMPIDA) ---
    const continuousDay = Math.floor(absoluteToltecDay);
    const continuousTonalIndex = continuousDay % 20;
    const continuousNumeral = (continuousDay % 13) + 1;

    const continuousXiuhpoualiCycle = Math.floor(continuousDay / 365) + 1;
    const continuousYearBearerIndex = Math.floor(continuousDay / 365) % 4;
    const continuousYearBearerNumeral = ((continuousXiuhpoualiCycle - 1) % 13) + 1;

    const continuousState: IContinuousState = {
      tonal: { data: TONALES[continuousTonalIndex], index: continuousTonalIndex },
      numeral: continuousNumeral,
      dayOfTonalpouali: (continuousDay % 260) + 1,
      trecena: Math.floor((continuousDay % 260) / 13) + 1,
      dayOfTrecena: (continuousDay % 13) + 1,
      yearBearer: { name: YEAR_BEARERS[continuousYearBearerIndex], numeral: continuousYearBearerNumeral },
    };

    // --- CÁLCULO DE LA CUENTA TRÓPICA (ANUAL CON REINICIO) ---
    const tropicalYearIndex = Math.floor(absoluteToltecDay / 365);
    const daysIntoTropicalYear = absoluteToltecDay % 365;
    const dayOfYear = Math.floor(daysIntoTropicalYear) + 1;

    const yearBearerName = YEAR_BEARERS[tropicalYearIndex % 4];
    const yearStartTime = YEAR_BEARER_START_TIMES[yearBearerName];

    const isNemontemi = dayOfYear > 360;
    const veintenaIndex = isNemontemi ? 0 : Math.floor((dayOfYear - 1) / 20) + 1;
    const veintenaName = isNemontemi ? null : VEINTENA_NAMES[veintenaIndex - 1];

    const tropicalTonalIndex = (dayOfYear - 1) % 20;

    const tropicalState: ITropicalState = {
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

  private _updateState(): void {
    this._currentState = this._calculateStateFromAbsoluteToltecDay(this._absoluteToltecDay);
    if (this._gregorianOffsetDays !== null && this._currentTime) {
      const gregorianDay = this._absoluteToltecDay - this._gregorianOffsetDays;
      this._currentTime.setTime(gregorianDay * (1000 * 60 * 60 * HOURS_IN_DAY));
    }
  }

  // --- MÉTODOS DE NAVEGACIÓN Y CONTROL ---

  public nextHour(): void {
    this._absoluteToltecDay += (1 / HOURS_IN_DAY);
    this._updateState();
  }
  public prevHour(): void {
    this._absoluteToltecDay -= (1 / HOURS_IN_DAY);
    this._updateState();
  }

  public nextDay(): void {
    this._absoluteToltecDay += 1;
    this._updateState();
  }
  public prevDay(): void {
    this._absoluteToltecDay -= 1;
    this._updateState();
  }

  public nextTrecena(): void {
    this._absoluteToltecDay += 13;
    this._updateState();
  }
  public prevTrecena(): void {
    this._absoluteToltecDay -= 13;
    this._updateState();
  }

  public nextVeintena(): void {
    this._absoluteToltecDay += 20;
    this._updateState();
  }
  public prevVeintena(): void {
    this._absoluteToltecDay -= 20;
    this._updateState();
  }

  public nextXiuhpouali(): void {
    this._absoluteToltecDay += 365.25; // Avanza un año trópico
    this._updateState();
  }
  public prevXiuhpouali(): void {
    this._absoluteToltecDay -= 365.25; // Retrocede un año trópico
    this._updateState();
  }

  public jumpToDate(date: Date): void {
    if (this._gregorianOffsetDays === null) {
      console.warn("El motor no está calibrado con una fecha gregoriana. Use setGregorianDate primero.");
      return;
    }
    const targetGregorianDay = Math.floor(date.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
    this._absoluteToltecDay = targetGregorianDay + this._gregorianOffsetDays;
    this._currentTime = new Date(date);
    this._updateState();
  }

  public setGregorianDate(gregorianDate: Date): void {
    const gregorianDay = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * HOURS_IN_DAY));
    this._gregorianOffsetDays = this._absoluteToltecDay - gregorianDay;
    this._currentTime = new Date(gregorianDate);
    this._updateState();
  }

  // --- MÉTODOS DE ACCESO Y ANÁLISIS ---

  public getCurrentTime(): Date | null { return this._currentTime ? new Date(this._currentTime) : null; }

  public getState(): Readonly<ICombinedState> { return this._currentState; }

  public getContinuousState(): Readonly<IContinuousState> { return this._currentState.continuous; }

  public getTropicalState(): Readonly<ITropicalState> { return this._currentState.tropical; }

  public getAngularPositions(): IAngularPositions {
    // Normalizar _absoluteToltecDay para evitar números negativos muy grandes
    const normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;

    return {
        tonalAngle: ((normalizedAbsoluteToltecDay % 20) / 20) * 2 * Math.PI,
        numeralAngle: ((normalizedAbsoluteToltecDay % 13) / 13) * 2 * Math.PI,
        xiuhpoualliAngle: ((normalizedAbsoluteToltecDay % 365) / 365) * 2 * Math.PI,
    };
  }

  public getCalendarRoundInfo() {
    const normalizedAbsoluteToltecDay = (this._absoluteToltecDay % DAYS_IN_CALENDAR_ROUND + DAYS_IN_CALENDAR_ROUND) % DAYS_IN_CALENDAR_ROUND;
    const totalRounds = Math.floor(this._absoluteToltecDay / DAYS_IN_CALENDAR_ROUND);

    // Para calcular fechas gregorianas, necesitamos que el sistema esté calibrado
    let startDate: Date | null = null;
    let endDate: Date | null = null;

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
        yearOfCycle: Math.floor(normalizedAbsoluteToltecDay / 365) + 1,
        roundNumber: totalRounds + 1, // El número de ciclo de 52 años
    };
  }
}
