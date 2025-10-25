import { MotorToltekatl, ModoDeCuenta } from './tonalpohualli-system/MotorToltekatl';

// --- EJEMPLO DE USO DEL MOTOR ---

console.log("--- PROBANDO MODO DE CUENTA CONTINUA ---");
const motorContinuo = new MotorToltekatl(ModoDeCuenta.CONTINUA);
console.log("Día 0 (Inicio del ciclo):", motorContinuo.getState(0.0));
console.log("Día 365 (Inicio del segundo año):", motorContinuo.getState(365.0));
console.log("Día 18979 (Último día del ciclo):", motorContinuo.getState(18979.0));

console.log("\n--- PROBANDO MODO DE CUENTA TROPICA ---");
const motorTropico = new MotorToltekatl(ModoDeCuenta.TROPICA);
console.log("Día 0 (Inicio del ciclo):", motorTropico.getState(0.0));
console.log("Día 365 (Inicio del segundo año):", motorTropico.getState(365.0));
console.log("Día 18979 (Último día del ciclo):", motorTropico.getState(18979.0));
