import { ToltekatlEngine } from './src/tonalpohualli-system/ToltekatlEngine';
import { IToltecCoordinate } from './src/tonalpohualli-system/ToltekatlEngine';

const coordinate: IToltecCoordinate = {
  tonal: { numeral: 13, name: 'Xochitl' },
  yearBearer: { numeral: 13, name: 'Kali' },
};

try {
  const engine = new ToltekatlEngine(coordinate);
  const state = engine.getState();
  console.log(JSON.stringify(state, null, 2));
} catch (error: any) {
  console.error("Error al calcular el estado:", error.message);
}