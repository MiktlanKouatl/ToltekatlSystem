"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ToltekatlEngine_1 = require("./src/tonalpohualli-system/ToltekatlEngine");
var coordinate = {
    tonal: { numeral: 13, name: 'Xochitl' },
    yearBearer: { numeral: 13, name: 'Kali' },
};
try {
    var engine = new ToltekatlEngine_1.ToltekatlEngine(coordinate);
    var state = engine.getState();
    console.log(JSON.stringify(state, null, 2));
}
catch (error) {
    console.error("Error al calcular el estado:", error.message);
}
