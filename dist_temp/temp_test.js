"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ToltekatlEngine_1 = require("./src/tonalpohualli-system/ToltekatlEngine");
const coordinate = {
    tonal: { numeral: 13, name: 'Xochitl' },
    yearBearer: { numeral: 13, name: 'Kali' },
};
try {
    const engine = new ToltekatlEngine_1.ToltekatlEngine(coordinate);
    const state = engine.getState();
    console.log(JSON.stringify(state, null, 2));
}
catch (error) {
    console.error("Error al calcular el estado:", error.message);
}
