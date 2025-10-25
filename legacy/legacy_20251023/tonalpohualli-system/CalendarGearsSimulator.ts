import { TONALES, YEAR_BEARERS, VEINTENA_NAMES, YEAR_BEARER_START_TIMES } from './ToltekatlSystem';

function runCalendarGearsSimulation() {
    console.log("Starting Array-based Calendar Gears Simulation (52-year cycle)");

    let currentTonalIndex = 0; // Sipaktli
    let currentNumeral = 1;    // Numeral 1

    let currentYearBearerIndex = 0; // Tochtli
    let currentYearNumeral = 1;     // Numeral 1

    let currentDayOfYear = 1;       // Day 1 of the year
    let currentVeintenaIndex = 0;   // Atlakaualo

    let absoluteDayCounter = 0; // Integer counter for days

    const totalYearsToSimulate = 52;
    const daysInNormalYear = 365;

    // Store the full sequence for later analysis
    const calendarSequence: any[] = [];

    for (let year = 1; year <= totalYearsToSimulate; year++) {
        // Determine the year bearer and its numeral for the current year
        const yearBearerName = YEAR_BEARERS[(year - 1) % 4];
        const yearBearerNumeral = ((year - 1) % 13) + 1;
        const yearStartTimeHours = YEAR_BEARER_START_TIMES[yearBearerName];

        for (let day = 1; day <= daysInNormalYear; day++) { // Simulate 365 days for each year
            const isNemontemi = day > 360;
            const veintenaName = isNemontemi ? null : VEINTENA_NAMES[Math.floor((day - 1) / 20)];

            calendarSequence.push({
                absoluteDay: absoluteDayCounter,
                year: year,
                yearBearer: `${yearBearerNumeral} ${yearBearerName}`,
                yearStartTime: yearStartTimeHours.toFixed(2) + 'h',
                dayOfYear: day,
                veintena: veintenaName,
                isNemontemi: isNemontemi,
                tonal: `${currentNumeral} ${TONALES[currentTonalIndex].name}`
            });

            // Advance Tonalpohualli gears
            currentTonalIndex = (currentTonalIndex + 1) % 20;
            currentNumeral = (currentNumeral % 13) + 1;
            if (currentNumeral === 0) currentNumeral = 13; // Wrap 13 to 1

            absoluteDayCounter++;
        }
        // After 365 days, the year ends. The 0.25 day is implicitly handled by the year start times.
        // The next year will start 6 hours later.
    }

    // Print the sequence (or parts of it)
    console.log("First 10 days:");
    for (let i = 0; i < 10; i++) {
        console.log(calendarSequence[i]);
    }

    console.log("\nLast 10 days of the 52-year cycle:");
    for (let i = calendarSequence.length - 10; i < calendarSequence.length; i++) {
        console.log(calendarSequence[i]);
    }

    // Find the specific day the user asked about: "13 Kali 13 Xochitl" as the last day of the 52-year cycle
    const lastDayOfSimulation = calendarSequence[calendarSequence.length - 1];
    console.log(`
Last day of the 52-year simulation:`)
    console.log(lastDayOfSimulation);

    // Check if the last day matches the user's expectation
    if (lastDayOfSimulation.yearBearer === '13 Kali' && lastDayOfSimulation.tonal === '13 Xochitl') {
        console.log(`
CONFIRMACIÓN: El último día de la simulación coincide con '13 Kali 13 Xochitl'.`);
    } else {
        console.log(`
DISCREPANCIA: El último día de la simulación es '${lastDayOfSimulation.tonal}' en un año '${lastDayOfSimulation.yearBearer}', no '13 Kali 13 Xochitl'.`);
    }
}

runCalendarGearsSimulation();
