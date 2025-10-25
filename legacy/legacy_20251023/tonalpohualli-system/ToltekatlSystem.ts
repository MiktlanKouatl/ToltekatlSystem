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

// Guardamos los 20 tonales en orden.
export const TONALES: ITonal[] = [
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

// Tiempos de inicio de cada portador de año en un ciclo de 52 años.
export const YEAR_BEARER_START_TIMES: { [key in YearBearerName]: number } = {
    'Tochtli': 6 + 45 / 60,    // 06:45
    'Akatl': 12 + 45 / 60,   // 12:45
    'Tekpatl': 18 + 45 / 60,   // 18:45
    'Kali': 0 + 45 / 60,      // 00:45
};
