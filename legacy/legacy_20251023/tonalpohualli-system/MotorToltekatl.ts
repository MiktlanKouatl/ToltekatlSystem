// =================================================================================
// MOTOR DE CÁLCULO PARA EL SISTEMA TOLTEKATL - VERSIÓN DUAL
// Colaboración: Miktlan Kouatl & Astronomía
// Este motor puede operar en dos modos:
// 1. CONTINUA: Un Tonalpohualli ininterrumpido que se desfasa con el año.
// 2. TROPICA: Un sistema donde la cuenta se sincroniza con el año trópico.
// =================================================================================

import { TONALES, YEAR_BEARERS, TonalName, YearBearerName } from './ToltekatlSystem';

// --- INTERFAZ DE ESTADO ---

// Define la estructura de datos que el motor devolverá para cualquier día.
export interface IEstadoToltekatl {
  diaAbsoluto: number;
  
  // Tonalpohualli (Ciclo de 260)
  tonal: { numeral: number; nombre: TonalName };
  diaDelTonalpohualli: number;

  // Xiuhpohualli (Ciclo de 365)
  diaDelAnio: number;
  esNemontemi: boolean;

  // Xiuhmolpilli (Ciclo de 52 Años)
  anio: { numeral: number; cargador: YearBearerName };
  anioDelCiclo: number; // El año de 1 a 52
}

// --- CONFIGURACIÓN DEL MOTOR ---

// Enumeración para seleccionar el modo de operación del motor.
export enum ModoDeCuenta {
  CONTINUA = 'continua',
  TROPICA = 'tropica'
}

// =================================================================================
// CLASE PRINCIPAL DEL MOTOR
// =================================================================================

export class MotorToltekatl {
  private modo: ModoDeCuenta;

  constructor(modo: ModoDeCuenta) {
    this.modo = modo;
    console.log(`Motor Toltekatl iniciado en modo: ${this.modo.toUpperCase()}`);
  }

  /**
   * La función pública principal. Delega el cálculo al método correcto según el modo.
   * @param diaAbsoluto El número de día a consultar.
   */
  public getState(diaAbsoluto: number): IEstadoToltekatl {
    if (diaAbsoluto < 0) {
      throw new Error("El día absoluto no puede ser negativo.");
    }

    if (this.modo === ModoDeCuenta.CONTINUA) {
      return this.calculateEstadoContinuo(diaAbsoluto);
    } else {
      return this.calculateEstadoTropico(diaAbsoluto);
    }
  }

  // --- MÉTODOS DE CÁLCULO PRIVADOS ---

  /**
   * Calcula el estado usando la lógica de la CUENTA CONTINUA.
   * El Tonalpohualli fluye sin interrupción. El punto de partida (Día 0)
   * se define como el día 1 Tochtli del año 1 Tochtli.
   */
  private calculateEstadoContinuo(diaAbsoluto: number): IEstadoToltekatl {
    // 1. CÁLCULO DEL AÑO (XIUHMOLPILLI)
    const anioTranscurrido = Math.floor(Math.floor(diaAbsoluto) / 365); // Usando 365 días por año
    const anioDelCiclo = anioTranscurrido + 1;
    const numeralAnio = (anioTranscurrido % 13) + 1;
    const indiceCargador = anioTranscurrido % 4;
    const cargadorAnio = YEAR_BEARERS[indiceCargador]; // Usando YEAR_BEARERS

    // 2. CÁLCULO DEL DÍA DEL AÑO (XIUHPOHUALLI)
    const diaDelAnio = (Math.floor(diaAbsoluto) % 365) + 1;
    const esNemontemi = diaDelAnio > 360;

    // 3. CÁLCULO DEL TONAL (TONALPOHUALLI)
    // Se necesita un offset porque el ciclo no empieza en 1 Sipaktli.
    // Nuestro Día 0 (1 Tochtli) es el día 1 del Tonalpohualli (1-indexado).
    // Por lo tanto, el offset es 0.
    const diaDelTonalpohualli = (Math.floor(diaAbsoluto) % 260) + 1;
    const numeralTonal = (diaDelTonalpohualli - 1) % 13 + 1;
    const indiceTonal = (diaDelTonalpohualli - 1) % 20;
    const nombreTonal = TONALES[indiceTonal].name;

    return {
      diaAbsoluto: diaAbsoluto,
      tonal: { numeral: numeralTonal, nombre: nombreTonal },
      diaDelTonalpohualli: diaDelTonalpohualli,
      diaDelAnio: diaDelAnio,
      esNemontemi: esNemontemi,
      anio: { numeral: numeralAnio, cargador: cargadorAnio },
      anioDelCiclo: anioDelCiclo
    };
  }

  /**
   * Calcula el estado usando la lógica de la CUENTA TROPICA.
   * La mecánica de esta cuenta necesita ser definida en detalle.
   */
  private calculateEstadoTropico(diaAbsoluto: number): IEstadoToltekatl {
    // 1. CÁLCULO DE CICLOS BASE ---
    const anioTranscurrido = Math.floor(diaAbsoluto / 365.25);
    const diaDelAnioFloat = (diaAbsoluto % 365.25);
    const diaDelAnio = Math.floor(diaDelAnioFloat) + 1;
    
    const esNemontemi = diaDelAnio > 360;

    // --- LÓGICA DEL EMBRAGUE ---
    let diaDelTonalpohualli;
    
    // Calculamos el total de días "congelados" en los años anteriores.
    const diasCongeladosPrevios = anioTranscurrido * 5.25;
    
    // El día "activo" para el Tonalpohualli es el día absoluto menos el tiempo congelado.
    const diaActivoParaTonal = diaAbsoluto - diasCongeladosPrevios;

    if (!esNemontemi) {
        // El embrague está activado. Usamos el día activo para calcular la posición.
        diaDelTonalpohualli = Math.floor(diaActivoParaTonal) % 260 + 1;
    } else {
        // Si estamos en Nemontemi, necesitamos el valor del Tonalpohualli del día 360 del año.
        // Calculamos el diaActivoParaTonal para el día 360 del año actual.
        const diaAbsolutoDia360 = (anioTranscurrido * 365.25) + 360;
        const diaActivoParaTonalDia360 = diaAbsolutoDia360 - diasCongeladosPrevios;
        diaDelTonalpohualli = Math.floor(diaActivoParaTonalDia360) % 260 + 1;
    }

    // --- LECTURAS DEL PANEL DE CONTROL ---
    const tonalNumeral = (diaDelTonalpohualli - 1) % 13 + 1;
    const indiceTonal = (diaDelTonalpohualli - 1) % 20;
    const nombreTonal = TONALES[indiceTonal].name;
    
    const anioDelCiclo = anioTranscurrido + 1;
    const indiceCargador = anioTranscurrido % 4;
    const cargadorAnio = YEAR_BEARERS[indiceCargador];
    const numeralAnio = (anioTranscurrido % 13) + 1;

    return {
      diaAbsoluto: diaAbsoluto,
      tonal: { numeral: numeralAnio, nombre: nombreTonal },
      diaDelTonalpohualli: diaDelTonalpohualli,
      diaDelAnio: diaDelAnio,
      esNemontemi: esNemontemi,
      anio: { numeral: numeralAnio, cargador: cargadorAnio },
      anioDelCiclo: anioDelCiclo
    };
  }
}
