# Pasos para el Cálculo del Sistema Toltekatl

Este documento detalla los pasos para calcular el estado del calendario Toltekatl.

**Input Principal:** Una `IToltecCoordinate` que define un día específico en el calendario Tolteca (por ejemplo, Año 4 Kali, Tonal 1 Tochtli).

**Suposiciones Clave:**
*   El ciclo de 52 años (`Calendar Round`) tiene `18980` días (`52 * 365`).
*   El ciclo del Tonalpohualli es de 260 días.
*   El año trópico (Xiuhpohualli) tiene `365.25` días de duración.
*   Los portadores del año (`Year Bearers`) siguen el ciclo: Tochtli, Akatl, Tekpatl, Kali.
*   Las horas de inicio de los años portadores son fijas y representan el inicio del año para ese portador específico:
    *   Tochtli: 06:45 (6.75 horas)
    *   Akatl: 12:45 (12.75 horas)
    *   Tekpatl: 18:45 (18.75 horas)
    *   Kali: 00:45 (0.75 horas)

---

## Paso Inicial: Calcular `absoluteToltecDay` a partir de `IToltecCoordinate`

Dado que el motor recibe una `IToltecCoordinate` (que incluye el numeral y nombre del Tonal, y el numeral y nombre del Portador del Año), el primer paso es convertir esta coordenada a un `absoluteToltecDay` de punto flotante. Este `absoluteToltecDay` representará el inicio preciso de ese día Tolteca en el ciclo de 52 años, incluyendo su componente horario.

**Función:** `_calculateAbsoluteToltecDay(coordinate: IToltecCoordinate)`

1.  **Validar Tonal:** Buscar el `tonalIndex` del `coordinate.tonal.name` en el array `TONALES`. Si no se encuentra, lanzar un error.

2.  **Iterar Años Trópicos:** Recorrer cada posible `tropicalYearIndex` desde 0 hasta 51 (para cubrir el ciclo de 52 años).

3.  **Identificar Portador del Año:** Para cada `tropicalYearIndex`:
    *   Calcular `currentYearBearerName = YEAR_BEARERS[tropicalYearIndex % 4]`.
    *   Calcular `currentYearBearerNumeral = (tropicalYearIndex % 13) + 1`.

4.  **Coincidencia de Portador del Año:** Si `currentYearBearerName` y `currentYearBearerNumeral` coinciden con `coordinate.yearBearer.name` y `coordinate.yearBearer.numeral`:
    *   Hemos encontrado el año trópico correcto.
    *   Calcular `startOfThisTropicalYear_absoluteDays = tropicalYearIndex * 365.25`.
    *   Obtener `yearStartTime_hours` para `currentYearBearerName` de `YEAR_BEARER_START_TIMES`.
    *   Convertir `yearStartTime_hours` a una fracción de día: `yearStartTime_dayFraction = yearStartTime_hours / 24`.

5.  **Iterar Días del Año:** Recorrer cada `dayOfYear` desde 1 hasta 365 (los días enteros del año trópico).

6.  **Construir `candidateAbsoluteToltecDay`:** Para cada `dayOfYear`:
    *   Construir un `candidateAbsoluteToltecDay` de punto flotante que representa el inicio de este día específico, incluyendo el componente horario del inicio del año:
        `candidateAbsoluteToltecDay = startOfThisTropicalYear_absoluteDays + (dayOfYear - 1) + yearStartTime_dayFraction`.

7.  **Verificar Tonal y Numeral:** Calcular el Tonal y Numeral para este `candidateAbsoluteToltecDay`:
    *   `calculatedTonalIndex = Math.floor(candidateAbsoluteToltecDay) % 20`.
    *   `calculatedTonalNumeral = (Math.floor(candidateAbsoluteToltecDay) % 13) + 1`.

8.  **Coincidencia Final:** Si `calculatedTonalIndex` y `calculatedTonalNumeral` coinciden con `coordinate.tonal.name` y `coordinate.tonal.numeral`:
    *   Se ha encontrado el `absoluteToltecDay` preciso. Retornar `candidateAbsoluteToltecDay`.

9.  **Error:** Si después de todas las iteraciones no se encuentra una coincidencia, lanzar un error.

---

## Parte 1: Cálculo del Estado Continuo (Tonalpohualli - Ciclo de 260 días)

Esta parte se enfoca en la cuenta ininterrumpida de días y tonales, independiente de la hora de inicio del año trópico.

1.  **`continuousDay` (Número de Día Entero):**
    *   Toma la parte entera de `absoluteToltecDay`.
    *   `continuousDay = Math.floor(absoluteToltecDay)`
    *   *Ejemplo:* Si `absoluteToltecDay = 10.75`, entonces `continuousDay = 10`.

2.  **`tonalIndex` (0-19):**
    *   El índice del Tonal (ideograma) en el array `TONALES`.
    *   `tonalIndex = continuousDay % 20`
    *   *Ejemplo:* `10 % 20 = 10`.

3.  **`numeral` (1-13):**
    *   El número asociado con el Tonal.
    *   `numeral = (continuousDay % 13) + 1`
    *   *Ejemplo:* `(10 % 13) + 1 = 11`.

4.  **`dayOfTonalpouali` (1-260):**
    *   El número de día dentro del ciclo de 260 días.
    *   `dayOfTonalpouali = (continuousDay % 260) + 1`
    *   *Ejemplo:* `(10 % 260) + 1 = 11`.

5.  **`trecena` (1-20):**
    *   El número de Trecena (período de 13 días).
    *   `trecena = Math.floor((continuousDay % 260) / 13) + 1`
    *   *Ejemplo:* `Math.floor((10 % 260) / 13) + 1 = 1`.

6.  **`dayOfTrecena` (1-13):**
    *   El número de día dentro de la Trecena actual (es el mismo que el `numeral`).
    *   `dayOfTrecena = (continuousDay % 13) + 1`
    *   *Ejemplo:* `(10 % 13) + 1 = 11`.

7.  **`continuousYearBearer` (para el día continuo):**
    *   Este es el portador del año asociado con el *día entero* de la cuenta continua, no necesariamente el portador del año trópico.
    *   `continuousYearIndex = Math.floor(continuousDay / 365) % 4`
    *   `continuousYearBearerName = YEAR_BEARERS[continuousYearIndex]`
    *   `continuousYearBearerNumeral = ((Math.floor(continuousDay / 365)) % 13) + 1`

---

## Parte 2: Cálculo del Estado Trópico (Xiuhpohualli - Año de 365.25 días)

Esta parte se enfoca en el ciclo anual, que tiene una hora de inicio variable y una duración de 365.25 días. Aquí es donde la hora del día es crucial para determinar el `dayOfYear` y el `tropicalTonalIndex`.

1.  **`tropicalYearIndex`:**
    *   El índice del año trópico actual desde el inicio del ciclo de 52 años.
    *   `tropicalYearIndex = Math.floor(absoluteToltecDay / 365.25)`
    *   *Ejemplo:* Si `absoluteToltecDay = 10.75`, `10.75 / 365.25 = 0.029...`, entonces `tropicalYearIndex = 0`.

2.  **`yearBearerName` (para el año trópico):**
    *   El nombre del portador del año para el *año trópico actual*.
    *   `yearBearerName = YEAR_BEARERS[tropicalYearIndex % 4]`
    *   *Ejemplo:* Si `tropicalYearIndex = 0`, y `YEAR_BEARERS[0]` es 'Tochtli', entonces `yearBearerName = 'Tochtli'`.

3.  **`yearStartTime_hours`:**
    *   La hora específica del día (en horas, por ejemplo, 6.75 para 06:45) en la que se supone que comienza el año de este `yearBearerName`.
    *   `yearStartTime_hours = YEAR_BEARER_START_TIMES[yearBearerName]`
    *   *Ejemplo:* Si `yearBearerName = 'Tochtli'`, entonces `yearStartTime_hours = 6.75`.

4.  **`startOfThisTropicalYear_absoluteDays`:**
    *   El día absoluto preciso (incluyendo horas fraccionarias) en el que comenzó el *año trópico actual*.
    *   `startOfThisTropicalYear_absoluteDays = tropicalYearIndex * 365.25`

5.  **`daysIntoYear_raw`:**
    *   Los días fraccionarios transcurridos desde el inicio matemático del año trópico.
    *   `daysIntoYear_raw = absoluteToltecDay - startOfThisTropicalYear_absoluteDays`

6.  **`yearStartTime_dayFraction`:**
    *   Convierte la hora de inicio del año (`yearStartTime_hours`) a una fracción de día.
    *   `yearStartTime_dayFraction = yearStartTime_hours / 24` (donde 24 es `HOURS_IN_DAY`)

7.  **`adjustedDaysIntoYear`:**
    *   Ajusta la línea de tiempo para que el año comience efectivamente en 0.0, teniendo en cuenta la hora de inicio específica del portador del año.
    *   `adjustedDaysIntoYear = daysIntoYear_raw - yearStartTime_dayFraction`

8.  **Manejo de Desbordamiento (Wrap-around):**
    *   Si `adjustedDaysIntoYear` es negativo (lo que significa que la hora actual es anterior a la hora de inicio del año en el primer día), se ajusta para que esté dentro del rango del año actual.
    *   `if (adjustedDaysIntoYear < 0) { adjustedDaysIntoYear += 365.25; }`

9.  **`dayOfYear` (1-365):**
    *   El número de día dentro del año trópico ajustado.
    *   `dayOfYear = Math.floor(adjustedDaysIntoYear) + 1`

10. **`isNemontemi`:**
    *   Indica si el día actual cae dentro de los 5 días `Nemontemi`.
    *   `isNemontemi = dayOfYear > 360`

11. **`veintenaIndex` y `veintenaName`:**
    *   El índice y el nombre de la Veintena actual.
    *   `veintenaIndex = isNemontemi ? 0 : Math.floor((dayOfYear - 1) / 20) + 1`
    *   `veintenaName = isNemontemi ? null : VEINTENA_NAMES[veintenaIndex - 1]`

12. **`tonal` y `numeral` del Estado Trópico:**
    *   Estos valores deben ser idénticos a los del Estado Continuo.
    *   `tonal = continuousState.tonal`
    *   `numeral = continuousState.numeral`

---

## Nomenclatura para la Cuenta Continua

El término 'sideral' en astronomía se refiere a mediciones basadas en las estrellas fijas. Si bien la cuenta continua (Tonalpohualli) es ininterrumpida y no se alinea con el año trópico, no está directamente ligada a las estrellas en el sentido astronómico.

Para evitar confusiones, se pueden considerar nombres como:
*   **Cuenta Ritual**
*   **Cuenta Abstracta**
*   **Cuenta del Tonalpohualli** (usando su nombre original)

Si 'sideral' te resulta más intuitivo para describir una cuenta ininterrumpida y fundamental en tu contexto, podemos usarlo. Por favor, indica tu preferencia para la documentación y el código.