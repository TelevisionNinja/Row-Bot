import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const farewells = messages.farewells;

const farewellsSet = new Set(farewells.map(f => f.toLowerCase()));

// say goodbye
export function execute(msg, filteredMsg) {
    if (farewellsSet.has(filteredMsg)) {
        return farewells[randomMath(farewells.length)];
    }

    return '';
}
