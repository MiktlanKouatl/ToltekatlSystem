import { ToltekatlEngine, IToltecCoordinate, IGregorianCalibrationAnchor } from './tonalpohualli-system/ToltekatlEngine';
import { TONALES, YEAR_BEARERS, TonalName, YearBearerName } from './tonalpohualli-system/ToltekatlSystem';

// --- INICIALIZACIÓN DEL MOTOR ---

// 1. Definimos la coordenada Tolteca por defecto para el ancla.
const defaultToltecCoordinate: IToltecCoordinate = {
  tonal: { numeral: 1, name: 'Kouatl' },
  yearBearer: { numeral: 3, name: 'Kali' },
};

// 2. Definimos la fecha gregoriana por defecto para el ancla de calibración.
const defaultGregorianDate = new Date('1521-08-23T12:00:00Z'); // 23 de Agosto de 1521.

// 3. Creamos el ancla de calibración por defecto.
const defaultCalibrationAnchor: IGregorianCalibrationAnchor = {
  date: defaultGregorianDate,
  toltecCoordinate: defaultToltecCoordinate,
};

// 4. Creamos la instancia del motor con el ancla de calibración.
let engine = new ToltekatlEngine(defaultCalibrationAnchor);

// --- ELEMENTOS DE LA INTERFAZ ---

const anchorDateInput = document.getElementById('anchor-date') as HTMLInputElement;
const anchorTonalNumeralInput = document.getElementById('anchor-tonal-numeral') as HTMLInputElement;
const anchorTonalNameSelect = document.getElementById('anchor-tonal-name') as HTMLSelectElement;
const anchorYearBearerNumeralInput = document.getElementById('anchor-year-bearer-numeral') as HTMLInputElement;
const anchorYearBearerNameSelect = document.getElementById('anchor-year-bearer-name') as HTMLSelectElement;
const setAnchorBtn = document.getElementById('set-anchor') as HTMLButtonElement;

const jumpDateInput = document.getElementById('jump-date') as HTMLInputElement;
const jumpToDateBtn = document.getElementById('jump-to-date') as HTMLButtonElement;

const navButtons = {
    prevHour: document.getElementById('prev-hour') as HTMLButtonElement,
    nextHour: document.getElementById('next-hour') as HTMLButtonElement,
    prevDay: document.getElementById('prev-day') as HTMLButtonElement,
    nextDay: document.getElementById('next-day') as HTMLButtonElement,
    prevTrecena: document.getElementById('prev-trecena') as HTMLButtonElement,
    nextTrecena: document.getElementById('next-trecena') as HTMLButtonElement,
    prevVeintena: document.getElementById('prev-veintena') as HTMLButtonElement,
    nextVeintena: document.getElementById('next-veintena') as HTMLButtonElement,
    prevXiuhpouali: document.getElementById('prev-xiuhpouali') as HTMLButtonElement,
    nextXiuhpouali: document.getElementById('next-xiuhpouali') as HTMLButtonElement,
};

const currentTimeDisplay = document.getElementById('current-time-display') as HTMLSpanElement;
const stateOutput = document.getElementById('state-output') as HTMLPreElement;

// --- FUNCIÓN DE RENDERIZADO ---

function render() {
  const state = engine.getState();
  const currentTime = engine.getCurrentTime();

  // Actualiza la fecha actual en la UI
  currentTimeDisplay.textContent = currentTime ? currentTime.toISOString() : 'No calibrado';

  // Muestra el estado completo como un JSON formateado
  stateOutput.textContent = JSON.stringify(state, null, 2);
}

// --- LÓGICA DE EVENTOS ---

// Navegación
navButtons.prevHour.addEventListener('click', () => { engine.prevHour(); render(); });
navButtons.nextHour.addEventListener('click', () => { engine.nextHour(); render(); });
navButtons.prevDay.addEventListener('click', () => { engine.prevDay(); render(); });
navButtons.nextDay.addEventListener('click', () => { engine.nextDay(); render(); });
navButtons.prevTrecena.addEventListener('click', () => { engine.prevTrecena(); render(); });
navButtons.nextTrecena.addEventListener('click', () => { engine.nextTrecena(); render(); });
navButtons.prevVeintena.addEventListener('click', () => { engine.prevVeintena(); render(); });
navButtons.nextVeintena.addEventListener('click', () => { engine.nextVeintena(); render(); });
navButtons.prevXiuhpouali.addEventListener('click', () => { engine.prevXiuhpouali(); render(); });
navButtons.nextXiuhpouali.addEventListener('click', () => { engine.nextXiuhpouali(); render(); });

// Salto a fecha
jumpToDateBtn.addEventListener('click', () => {
  if (jumpDateInput.value) {
    engine.jumpToDate(new Date(jumpDateInput.value));
    render();
  }
});

// Fijar nueva ancla
setAnchorBtn.addEventListener('click', () => {
  if (anchorDateInput.value && anchorTonalNumeralInput.value && anchorTonalNameSelect.value && anchorYearBearerNumeralInput.value && anchorYearBearerNameSelect.value) {
    const newToltecCoordinate: IToltecCoordinate = {
      tonal: { numeral: parseInt(anchorTonalNumeralInput.value), name: anchorTonalNameSelect.value as TonalName },
      yearBearer: { numeral: parseInt(anchorYearBearerNumeralInput.value), name: anchorYearBearerNameSelect.value as YearBearerName },
    };
    const newCalibrationAnchor: IGregorianCalibrationAnchor = {
      date: new Date(anchorDateInput.value),
      toltecCoordinate: newToltecCoordinate,
    };
    engine = new ToltekatlEngine(newCalibrationAnchor); // Re-instanciar el motor con la nueva ancla
    render();
  }
});

// --- INICIALIZACIÓN DE LA UI ---

function initializeUI() {
    // Rellenar los selectores de nombres
    // Clear existing options first
    anchorTonalNameSelect.innerHTML = '';
    TONALES.forEach(tonal => {
        const option = document.createElement('option');
        option.value = tonal.name;
        option.textContent = tonal.name;
        anchorTonalNameSelect.appendChild(option);
    });

    anchorYearBearerNameSelect.innerHTML = '';
    YEAR_BEARERS.forEach(bearer => {
        const option = document.createElement('option');
        option.value = bearer;
        option.textContent = bearer;
        anchorYearBearerNameSelect.appendChild(option);
    });

    // Rellenar los campos del ancla con los valores por defecto
    const anchorDate = defaultCalibrationAnchor.date;
    const year = anchorDate.getFullYear();
    const month = (anchorDate.getMonth() + 1).toString().padStart(2, '0');
    const day = anchorDate.getDate().toString().padStart(2, '0');
    const hours = anchorDate.getHours().toString().padStart(2, '0');
    const minutes = anchorDate.getMinutes().toString().padStart(2, '0');
    
    anchorDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    anchorTonalNumeralInput.value = defaultToltecCoordinate.tonal.numeral.toString();
    anchorTonalNameSelect.value = defaultToltecCoordinate.tonal.name;
    anchorYearBearerNumeralInput.value = defaultToltecCoordinate.yearBearer.numeral.toString();
    anchorYearBearerNameSelect.value = defaultToltecCoordinate.yearBearer.name;

    // Poner la fecha actual del motor en el input de salto para conveniencia
    const currentEngineTime = engine.getCurrentTime();
    if (currentEngineTime) {
        const currentYear = currentEngineTime.getFullYear();
        const currentMonth = (currentEngineTime.getMonth() + 1).toString().padStart(2, '0');
        const currentDay = currentEngineTime.getDate().toString().padStart(2, '0');
        const currentHours = currentEngineTime.getHours().toString().padStart(2, '0');
        const currentMinutes = currentEngineTime.getMinutes().toString().padStart(2, '0');
        jumpDateInput.value = `${currentYear}-${currentMonth}-${currentDay}T${currentHours}:${currentMinutes}`;
    }

    // Renderizado inicial
    render();
}

initializeUI();