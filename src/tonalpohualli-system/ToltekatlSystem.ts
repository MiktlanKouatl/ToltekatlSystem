// Definimos los tipos de datos para tener un código más limpio y seguro.
export type TonalName =
  | 'Sipaktli' | 'Ejekatl' | 'Kali' | 'Kuetspalin' | 'Kouatl'
  | 'Mikistli' | 'Masatl' | 'Tochtli' | 'Atl' | 'Itskuintli'
  | 'Osomatli' | 'Malinali' | 'Akatl' | 'Oselotl' | 'Kuautli'
  | 'Koskakuautli' | 'Olin' | 'Tekpatl' | 'Kiauitl' | 'Xochitl';

// Interfaz para la estructura de datos de cada Tonal
export interface ITonal {
  name: TonalName;
  configuration: string; // Ej: 'kali kali'
}

// Los cuatro elementos fundamentales.
export type YearBearerName = 'Tochtli' | 'Akatl' | 'Tekpatl' | 'Kali';
// Basado en que el año 0 es Tochtli, esta es nuestra secuencia de portadores.
export const YEAR_BEARERS: YearBearerName[] = ['Tochtli', 'Akatl', 'Tekpatl', 'Kali'];

// Nombres de las 18 Veintenas.
export const VEINTENA_NAMES: string[] = [
  "Atlakaualo", "Tlakaxipeualistli", "Tosostontli", "Uei Tosostli", "Toxkatl", 
  "Etsakualistli", "Tekuiluitontli", "Uei Tekuiluitl", "Tlaxochimako", 
  "Xokotl Uetsi", "Ochpanistli", "Teotleko", "Tepeiluitl", "Kecholi", 
  "Panketsalistli", "Atemostli", "Tititl", "Iskali"
];

// Interfaz para el objeto de estado que devolverá nuestro sistema.
export interface IToltekatlSystemState {
  absoluteDay: number;
  
  // Ciclos Largos
  tonalpoualiCycle: number; // El # de ciclo de 260 días en el que estamos
  xiuhpoualiCycle: number;  // El # de ciclo de 365 días (el año actual)

  // Información del Tonalpouali (260 días)
  tonal: { data: ITonal; index: number; }; // Objeto tonal enriquecido
  numeral: number;
  dayOfTonalpouali: number;
  trecena: number;
  dayOfTrecena: number;

  // Información del Xiuhpouali (365 días)
  yearBearer: { name: YearBearerName; numeral: number; };
  dayOfXiuhpouali: number;
  veintena: { index: number; name: string | null; }; // Puede ser null en Nemontemi
  isNemontemi: boolean;
}

/**
 * ToltekatlSystem es el motor principal y puro para la cuenta del tiempo Toltekatl.
 * No tiene conocimiento del calendario Gregoriano. Opera en su propio
 * sistema de ciclos y cuentas internas.
 */
export class ToltekatlSystem {
  // --- PROPIEDADES ---

  // El contador absoluto de días desde el inicio del tiempo. Es el corazón del sistema.
  private _absoluteDayCount: number;

  // Almacena el estado actual para no tener que recalcularlo en cada llamada a getState().
  private _currentState: IToltekatlSystemState;

  // Guardamos los 20 tonales en orden. Es estático para que no se regenere con cada instancia.
  public static readonly TONALES: ITonal[] = [
    { name: 'Sipaktli', configuration: 'kali kali' },
    { name: 'Ejekatl', configuration: 'placeholder' },
    { name: 'Kali', configuration: 'placeholder' },
    { name: 'Kuetspalin', configuration: 'placeholder' },
    { name: 'Kouatl', configuration: 'placeholder' },
    { name: 'Mikistli', configuration: 'placeholder' },
    { name: 'Masatl', configuration: 'placeholder' },
    { name: 'Tochtli', configuration: 'placeholder' },
    { name: 'Atl', configuration: 'placeholder' },
    { name: 'Itskuintli', configuration: 'placeholder' },
    { name: 'Osomatli', configuration: 'placeholder' },
    { name: 'Malinali', configuration: 'placeholder' },
    { name: 'Akatl', configuration: 'placeholder' },
    { name: 'Oselotl', configuration: 'placeholder' },
    { name: 'Kuautli', configuration: 'placeholder' },
    { name: 'Koskakuautli', configuration: 'placeholder' },
    { name: 'Olin', configuration: 'placeholder' },
    { name: 'Tekpatl', configuration: 'placeholder' },
    { name: 'Kiauitl', configuration: 'placeholder' },
    { name: 'Xochitl', configuration: 'placeholder' }
  ];

  // --- MÉTODOS DE INICIALIZACIÓN ---

  constructor(startDay: number = 0) {
    this._absoluteDayCount = startDay;
    this._currentState = this.calculateState(startDay);
  }

  /**
   * El cerebro calculador. Toma un número de día absoluto y deriva
   * todo el estado del calendario a partir de él usando matemáticas modulares.
   * @param day El día absoluto para calcular el estado.
   * @returns El objeto de estado completo para ese día.
   */
  private calculateState(day: number): IToltekatlSystemState {
    // --- CÁLCULOS DEL TONALPOUALI (260) ---
    const dayOfTonalpouali = (day % 260);
    const tonalIndex = dayOfTonalpouali % 20;
    const numeral = (dayOfTonalpouali % 13) + 1;

    // --- CÁLCULOS DEL XIUHPOUALI (365) ---
    const xiuhpoualiCycle = Math.floor(day / 365) + 1;
    const dayOfXiuhpouali = (day % 365) + 1;
    const yearBearerIndex = Math.floor(day / 365) % 4;
    const yearBearerNumeral = ((xiuhpoualiCycle - 1) % 13) + 1;
    const isNemontemi = dayOfXiuhpouali > 360;

    // Lógica para obtener el nombre de la veintena.
    const veintenaIndex = isNemontemi ? 0 : Math.floor((dayOfXiuhpouali - 1) / 20) + 1;
    const veintenaName = isNemontemi ? null : VEINTENA_NAMES[veintenaIndex - 1];


    return {
      absoluteDay: day,
      tonalpoualiCycle: Math.floor(day / 260) + 1,
      xiuhpoualiCycle: xiuhpoualiCycle,
      tonal: {
        data: ToltekatlSystem.TONALES[tonalIndex],
        index: tonalIndex,
      },
      numeral: numeral,
      dayOfTonalpouali: dayOfTonalpouali + 1,
      trecena: Math.floor(dayOfTonalpouali / 13) + 1,
      dayOfTrecena: (day % 13) + 1,
      yearBearer: {
        name: YEAR_BEARERS[yearBearerIndex],
        numeral: yearBearerNumeral,
      },
      dayOfXiuhpouali: dayOfXiuhpouali,
      veintena: {
        index: veintenaIndex,
        name: veintenaName
      },
      isNemontemi: isNemontemi,
    };
  }

  // --- MÉTODOS DE NAVEGACIÓN (LA API PÚBLICA) ---

  /** Avanza el sistema un solo día. */
  public nextTonal(): void {
    this._absoluteDayCount++;
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  /** Retrocede el sistema un solo día. */
  public prevTonal(): void {
    this._absoluteDayCount = Math.max(0, this._absoluteDayCount - 1);
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  /** Salta a la siguiente trecena (avanza 13 días). */
  public nextTrecena(): void {
    this._absoluteDayCount += 13;
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  /** Retrocede a la trecena anterior (retrocede 13 días). */
  public prevTrecena(): void {
    this._absoluteDayCount = Math.max(0, this._absoluteDayCount - 13);
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  /**
   * Establece el sistema a un día absoluto específico.
   * @param day El número de día al que saltar.
   */
  public setToDay(day: number): void {
    if (day < 0) {
      console.warn("Day cannot be negative. Setting to 0.");
      this._absoluteDayCount = 0;
    } else {
      this._absoluteDayCount = day;
    }
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  // Nuevos métodos para navegar por el ciclo solar
  public nextXiuhpouali(): void {
    this._absoluteDayCount += 365;
    this._currentState = this.calculateState(this._absoluteDayCount);
  }

  public prevXiuhpouali(): void {
    this._absoluteDayCount = Math.max(0, this._absoluteDayCount - 365);
    this._currentState = this.calculateState(this._absoluteDayCount);
  }


  // --- MÉTODO DE ACCESO ---

  /**
   * Devuelve una copia del estado actual del sistema.
   * @returns Un objeto de solo lectura con toda la información del día actual.
   */
  public getState(): Readonly<IToltekatlSystemState> {
    return this._currentState;
  }
}

// --- EJEMPLO DE USO ---
/*
const toltekatlSystem = new ToltekatlSystem();
console.log("Día Inicial:", toltekatlSystem.getState());

toltekatlSystem.nextTonal();
console.log("Siguiente Tonal:", toltekatlSystem.getState());

toltekatlSystem.nextTrecena();
console.log("Siguiente Trecena:", toltekatlSystem.getState());

toltekatlSystem.setToDay(259);
console.log("Último día del Tonalpohuali:", toltekatlSystem.getState());
*/