"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MotorToltekatl_1 = require("./tonalpohualli-system/MotorToltekatl");
// --- EJEMPLO DE USO DEL MOTOR ---
console.log("--- PROBANDO MODO DE CUENTA CONTINUA ---");
const motorContinuo = new MotorToltekatl_1.MotorToltekatl(MotorToltekatl_1.ModoDeCuenta.CONTINUA);
console.log("Día 0 (Inicio del ciclo):", motorContinuo.getState(0));
console.log("Día 365 (Inicio del segundo año):", motorContinuo.getState(365));
console.log("Día 18979 (Último día del ciclo):", motorContinuo.getState(18979));
console.log("\n--- PROBANDO MODO DE CUENTA TROPICA ---");
const motorTropico = new MotorToltekatl_1.MotorToltekatl(MotorToltekatl_1.ModoDeCuenta.TROPICA);
console.log("Día 0 (Inicio del ciclo):", motorTropico.getState(0.0));
console.log("Día 365 (Inicio del segundo año):", motorTropico.getState(365.0));
console.log("Día 18979 (Último día del ciclo):", motorTropico.getState(18979.0));
