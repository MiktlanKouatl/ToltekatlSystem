// MotorAstronomico.js (Híbrido: Lógica del usuario + Correcciones de depuración)
import * as Astronomy from 'astronomy-engine';

const OBSERVADOR = new Astronomy.Observer(19.69, -98.84, 0);

export class MotorAstronomico {
    constructor() {
        console.log("Espejo Astronómico (Motor 2) inicializado.");
    }

    getEstado(fecha) {
        // 1. CÁLCULO ORBITAL (Función que sabemos que existe)
        const anguloOrbital = Astronomy.EclipticLongitude(Astronomy.Body.Earth, fecha);

        // 2. CÁLCULO DE MOMENTOS (Lógica depurada)
        const mediodiaResult = Astronomy.SearchHourAngle(Astronomy.Body.Sun, OBSERVADOR, 0, fecha, +1);
        const mediodiaAnteriorResult = Astronomy.SearchHourAngle(Astronomy.Body.Sun, OBSERVADOR, 0, fecha, -1);

        // FIX from debug: SearchHourAngle devuelve { time: { date: ... } }
        const mediodia = mediodiaResult.time.date;
        const mediodiaAnterior = mediodiaAnteriorResult.time.date;

        const medianoche = new Date((mediodia.getTime() + mediodiaAnterior.getTime()) / 2);

        // FIX from debug: Usar +1/-1 para la dirección
        const amanecerResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, OBSERVADOR, +1, medianoche, 1);
        // FIX from debug: SearchRiseSet devuelve { date: ... }
        const amanecer = amanecerResult.date;

        const atardecerResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, OBSERVADOR, -1, amanecer, 1);
        const atardecer = atardecerResult.date;

        // Lógica de Pulso
        let pulsoDelDia;
        if (fecha >= medianoche && fecha < amanecer) {
            pulsoDelDia = 0;
        } else if (fecha >= amanecer && fecha < mediodia) {
            pulsoDelDia = 1;
        } else if (fecha >= mediodia && fecha < atardecer) {
            pulsoDelDia = 2;
        } else {
            pulsoDelDia = 3;
        }

        return {
            anguloOrbital: anguloOrbital,
            pulsoDelDia: pulsoDelDia,
            momentosReales: {
                medianoche,
                amanecer,
                mediodia: mediodia,
                atardecer
            }
        };
    }
}