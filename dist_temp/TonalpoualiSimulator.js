"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ToltekatlEngine_1 = require("./ToltekatlEngine");
// Main simulation logic
function runSimulation() {
    console.log("Starting Toltec Calendar Simulation (52-year cycle)");
    // Initialize the engine with a default anchor.
    // Let's use a coordinate that is easy to verify, e.g., Year 1 Tochtli, Tonal 1 Cipactli.
    const initialCoordinate = {
        tonal: { numeral: 1, name: 'Sipaktli' },
        yearBearer: { numeral: 1, name: 'Tochtli' },
    };
    const engine = new ToltekatlEngine_1.ToltekatlEngine(initialCoordinate);
    const totalDaysIn52YearCycle = Math.ceil(52 * 365.25); // Total integer days to simulate
    console.log(`Simulating ${totalDaysIn52YearCycle} days...`);
    for (let i = 0; i < totalDaysIn52YearCycle; i++) {
        const state = engine.getState();
        // Print state only at the start of each year or for specific days
        if (state.tropical.dayOfYear === 1 && state.tropical.numeral === 1 && state.tropical.tonal.data.name === 'Sipaktli') {
            console.log(`
--- Year Start: ${state.tropical.year} ${state.tropical.yearBearer.name} (${state.tropical.yearBearer.numeral}) ---
`);
            console.log(`-------------------------------------`);
        }
        else if (i < 10 || i > totalDaysIn52YearCycle - 10) { // Print first 10 and last 10 days
            console.log(`--- Absolute Day: ${state.absoluteDay.toFixed(4)} ---`);
            console.log(`Continuous Tonal: ${state.continuous.numeral} ${state.continuous.tonal.data.name}`);
            console.log(`Tropical Year: ${state.tropical.year} ${state.tropical.yearBearer.name} (${state.tropical.yearBearer.numeral})`);
            console.log(`Tropical Day of Year: ${state.tropical.dayOfYear}`);
            console.log(`Tropical Veintena: ${state.tropical.veintena.name} (Index: ${state.tropical.veintena.index})`);
            console.log(`Tropical Year Start Time: ${state.tropical.yearStartTime.toFixed(2)} hours`);
            console.log(`Is Nemontemi: ${state.tropical.isNemontemi}`);
            console.log(`-------------------------------------`);
        }
        engine.nextDay(); // Advance by one day
    }
}
runSimulation();
