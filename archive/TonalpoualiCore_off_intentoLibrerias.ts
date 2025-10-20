// src/core/TonalpoualiCore.ts (v21.2 - La Conexión Final)

// --- LA CORRECCIÓN DE IMPORTACIÓN DEFINITIVA ---
// Importamos todo el módulo y lo asignamos a la variable 'Astronomy'
import * as Astronomy from 'astronomy-engine';

export interface TonalpoualiQueryResult {
  gregorianDate: string;
  isNemontemi: boolean;
  tonalpoualiIndex: number | null;
  dayNumeral: number | null;
  dayTonal: string | null;
  nemontemiTonalIndex: number | null;
  nemontemiDayNumeral: number | null;
  nemontemiDayTonal: string | null;
  xiuhpoualliYear: string;
  xiuhpoualliDay: number;
}

const TONALLI_NAMES = [
  'Sipaktli',  'Ejekatl',   'Kali',      'Kuetspalin', 'Koatl',
  'Mikistli',  'Masatl',    'Tochtli',   'Atl',        'Itskuintli',
  'Osomatli',  'Malinali',  'Akatl',     'Oselotl',    'Kuautli',
  'Koskakuautli','Olin',    'Tekpatl',   'Kiauitl',    'Xochitl'
];

const BEARER_NAMES = ['Kali', 'Tochtli', 'Akatl', 'Tekpatl'];

export class TonalpoualiCore {
  // --- (Constantes de simulación como REF_YEAR, etc. permanecen igual) ---
  private readonly REF_YEAR_GREGORIAN = 2025;
  private readonly REF_YEAR_NUMERAL = 13;
  private readonly REF_YEAR_BEARER_INDEX = 0;
  private readonly REF_YEAR_START_GREGORIAN = new Date(Date.UTC(2025, 2, 15));
  private readonly REF_YEAR_START_TONAL_NUMERAL = 5;
  private readonly GREGORIAN_REF_DATE = new Date(1582, 9, 4);
  private readonly HISTORICAL_OFFSET_DAYS = 13;
  private readonly NEMONTEMI_REF_YEAR = 1611;
  private readonly NEMONTEMI_REF_TONAL_INDEX = 0;
  private readonly BEARER_START_TIMES = [
    { hour: 0, minute: 45 }, { hour: 6, minute: 45 }, { hour: 12, minute: 45 }, { hour: 18, minute: 45 }
  ];
  
  private readonly ANCHOR_POINTS = [
    { date: new Date('1521-08-23T12:00:00Z'), tonalIndex: 104 }, // 1 Koatl
    { date: new Date('1601-01-01T12:00:00Z'), tonalIndex: 76  }, // 12 Olin
    { date: new Date('1701-01-01T12:00:00Z'), tonalIndex: 195 }, // 1 Koskakuautli
    { date: new Date('1801-01-01T12:00:00Z'), tonalIndex: 54  }, // 3 Kuautli
    { date: new Date('1901-01-01T12:00:00Z'), tonalIndex: 173 }, // 5 Oselotl
    { date: new Date('2001-01-01T12:00:00Z'), tonalIndex: 33  }, // 8 Oselotl
  ];

  private isGregorianLeap(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  private getSipaktliIndex(numeral: number): number {
    const numeralIndex = numeral - 1;
    for (let i = 0; i < 13; i++) {
        const index = i * 20;
        if (index % 13 === numeralIndex) return index;
    }
    return 160;
  }

  private getYearData(gregorianYear: number) {
    const yearsPassedFromRef = gregorianYear - this.REF_YEAR_GREGORIAN;
    let daysDiff = 0;
    if (yearsPassedFromRef > 0) {
      for (let y = this.REF_YEAR_GREGORIAN; y < gregorianYear; y++) {
        daysDiff += this.isGregorianLeap(y) ? 366 : 365;
      }
    } else if (yearsPassedFromRef < 0) {
      for (let y = this.REF_YEAR_GREGORIAN - 1; y >= gregorianYear; y--) {
        daysDiff -= this.isGregorianLeap(y) ? 366 : 365;
      }
    }
    const startDate = new Date(this.REF_YEAR_START_GREGORIAN);
    startDate.setUTCDate(startDate.getUTCDate() + daysDiff);
    const yearNumeral = (this.REF_YEAR_NUMERAL - 1 + (yearsPassedFromRef % 13) + 13) % 13 + 1;
    const bearerIndex = (this.REF_YEAR_BEARER_INDEX + (yearsPassedFromRef % 4) + 4) % 4;
    return { year: gregorianYear, yearNumeral: yearNumeral, bearerIndex: bearerIndex, startDate: startDate };
  }

  private _calculateNemontemi(yearData: any, dayOfYear: number, originalDate: Date, gregorianYearOfNemontemi: number): TonalpoualiQueryResult {
      const yearStr = `${yearData.yearNumeral} ${BEARER_NAMES[yearData.bearerIndex]}`;
      const yearsPassed = gregorianYearOfNemontemi - this.NEMONTEMI_REF_YEAR;
      const nemontemiStartIndex = ((yearsPassed * 5) + this.NEMONTEMI_REF_TONAL_INDEX + 260 * 52) % 260;
      const nemontemiDayNum = dayOfYear - 359;
      const nemontemiTonalIndex = (nemontemiStartIndex + nemontemiDayNum - 1) % 260;
      const nemontemiDayNumeral = (nemontemiTonalIndex % 13) + 1;
      const nemontemiDayTonal = TONALLI_NAMES[nemontemiTonalIndex % 20];

      return {
          gregorianDate: originalDate.toISOString(), isNemontemi: true,
          tonalpoualiIndex: null, dayNumeral: null, dayTonal: null,
          nemontemiTonalIndex: nemontemiTonalIndex, nemontemiDayNumeral: nemontemiDayNumeral, nemontemiDayTonal: nemontemiDayTonal,
          xiuhpoualliYear: yearStr, xiuhpoualliDay: dayOfYear + 1,
      };
  }
  
  private calculateTonalpohualli(targetDate: Date): { index: number, numeral: number, tonal: string } {
    const targetJd = (Astronomy as any).DateToJD(targetDate);
    
    let closestAnchor = this.ANCHOR_POINTS[0];
    let minDiff = Math.abs(targetJd - (Astronomy as any).DateToJD(closestAnchor.date));

    for (const anchor of this.ANCHOR_POINTS) {
      const anchorJd = (Astronomy as any).DateToJD(anchor.date);
      const diff = Math.abs(targetJd - anchorJd);
      if (diff < minDiff) {
        minDiff = diff;
        closestAnchor = anchor;
      }
    }

    const anchorJd = (Astronomy as any).DateToJD(closestAnchor.date);
    const dayDifference = Math.round(targetJd - anchorJd);
    
    const tonalIndex = (closestAnchor.tonalIndex + dayDifference % 260 + 260) % 260;
    const numeral = (tonalIndex % 13) + 1;
    const tonal = TONALLI_NAMES[tonalIndex % 20];
    
    return { index: tonalIndex, numeral, tonal };
  }

  public calculate(gregorianDate: Date): TonalpoualiQueryResult {
      const yearDataForTimeCheck = this.getYearData(gregorianDate.getFullYear());
      const rolloverTime = this.BEARER_START_TIMES[yearDataForTimeCheck.bearerIndex];
      let targetDay = new Date(gregorianDate);
      if (gregorianDate.getHours() < rolloverTime.hour || (gregorianDate.getHours() === rolloverTime.hour && gregorianDate.getMinutes() < rolloverTime.minute)) {
          targetDay.setDate(targetDay.getDate() - 1);
      }
      
      const yearData = this.getYearData(targetDay.getFullYear());
      const startDateUTC = Date.UTC(yearData.startDate.getUTCFullYear(), yearData.startDate.getUTCMonth(), yearData.startDate.getUTCDate());
      const targetDayUTC = Date.UTC(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate());
      let dayOfYear = Math.floor((targetDayUTC - startDateUTC) / 86400000);
      
      if (targetDay < this.GREGORIAN_REF_DATE) {
          dayOfYear += this.HISTORICAL_OFFSET_DAYS;
      }

      const yearStr = `${yearData.yearNumeral} ${BEARER_NAMES[yearData.bearerIndex]}`;

      if (dayOfYear >= 360) {
          return this._calculateNemontemi(yearData, dayOfYear, gregorianDate, targetDay.getFullYear());
      }
      
      const tonalpohualliData = this.calculateTonalpohualli(targetDay);

      return {
          gregorianDate: gregorianDate.toISOString(),
          isNemontemi: false,
          tonalpoualiIndex: tonalpohualliData.index,
          dayNumeral: tonalpohualliData.numeral,
          dayTonal: tonalpohualliData.tonal,
          nemontemiTonalIndex: null,
          nemontemiDayNumeral: null,
          nemontemiDayTonal: null,
          xiuhpoualliYear: yearStr,
          xiuhpoualliDay: dayOfYear + 1,
      };
  }
}