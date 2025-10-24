// Artefacto.js - La Maquinaria Calendárica

export const TONALES = ['Sipaktli', 'Ejekatl', 'Kali', 'Kuetspalin', 'Kouatl', 'Mikistli', 'Masatl', 'Tochtli', 'Atl', 'Itskuintli', 'Osomatli', 'Malinali', 'Akatl', 'Oselotl', 'Kuautli', 'Koskakuautli', 'Olin', 'Tekpatl', 'Kiauitl', 'Xochitl'];
export const CARGADORES = ['Tochtli', 'Akatl', 'Tekpatl', 'Kali'];

export class Artefacto {
    constructor() {
        // Estado interno de la cuenta
        this.estado = {
            diaAbsoluto: 0,
            momentoDelDia: 0,
            diaDelAnio: 0,
            anio: 0,
            diaDelTonalpohualli: 1,
        };
        this.diaDelTonalpohualliCongelado = 1;
    }

    // El único método que recalcula el estado. Se llama cuando el corazón late.
    actualizar(momento) {
        const momentoInt = Math.floor(momento);
        const PULSOS_ANIO = 1461;

        const anio = Math.floor(momentoInt / PULSOS_ANIO);
        const momentoEnAnio = momentoInt % PULSOS_ANIO;

        let diaDelAnio;
        let momentoDelDia;

        // Los primeros 364 días (índice 0-363) tienen 4 pulsos. Total: 364 * 4 = 1456 pulsos.
        if (momentoEnAnio < 1456) {
            diaDelAnio = Math.floor(momentoEnAnio / 4);
            momentoDelDia = momentoEnAnio % 4;
        } else { // El último día (índice 364) tiene 5 pulsos.
            diaDelAnio = 364;
            momentoDelDia = momentoEnAnio - 1456;
        }

        const diaAbsoluto = (anio * 365) + diaDelAnio;
        const esNemontemi = (diaDelAnio + 1) > 360;
        
        let diaDelTonalpohualli;
        const diasCongeladosPrevios = anio * 5;
        const diaActivoParaTonal = diaAbsoluto - diasCongeladosPrevios;

        if (!esNemontemi) {
            diaDelTonalpohualli = diaActivoParaTonal % 260 + 1;
            this.diaDelTonalpohualliCongelado = diaDelTonalpohualli;
        } else {
            diaDelTonalpohualli = this.diaDelTonalpohualliCongelado;
        }

        // Almacena el nuevo estado
        this.estado = { diaAbsoluto, anio, diaDelAnio, momentoDelDia, diaDelTonalpohualli, esNemontemi };
        return this.estado;
    }

    // Métodos para obtener información formateada para la pantalla
    getTonalDisplay() {
        if (this.estado.esNemontemi) {
            const diaNemontemiAbsoluto = (this.estado.anio * 5) + (this.estado.diaDelAnio - 360);
            return `Nemontemi (${(diaNemontemiAbsoluto % 13) + 1} ${TONALES[diaNemontemiAbsoluto % 20]})`;
        } else {
            return `${(this.estado.diaDelTonalpohualli - 1) % 13 + 1} ${TONALES[(this.estado.diaDelTonalpohualli - 1) % 20]}`;
        }
    }

    getAnioDisplay() {
        const anioDelCiclo = this.estado.anio + 1;
        const anioNumeral = (this.estado.anio % 13) + 1;
        const cargadorNombre = CARGADORES[this.estado.anio % 4];
        return `${anioDelCiclo} (${anioNumeral} ${cargadorNombre})`;
    }

    getTrecenaDisplay() {
        if (this.estado.esNemontemi) return '-';
        return `${Math.floor((this.estado.diaDelTonalpohualli - 1) / 13) + 1}`;
    }

    getVeintenaDisplay() {
        if (this.estado.esNemontemi) return '-';
        return `${Math.floor((this.estado.diaDelAnio) / 20) + 1}`;
    }

    getTonalpohualliCount() {
        if (this.estado.esNemontemi) return '-';
        return `${this.estado.diaDelTonalpohualli}`;
    }

}
