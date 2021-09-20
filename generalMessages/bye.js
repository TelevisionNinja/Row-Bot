import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const farewells = messages.farewells,
    farewellsLowerCase = farewells.map(f => f.toLowerCase());

const farewellsMap = new Map();

farewellsLowerCase.forEach(f => farewellsMap.set(f, true));

// say goodbye
export function execute(msg, filteredMsg) {
    if (farewellsMap.get(filteredMsg)) {
        return farewells[randomMath(farewells.length)];
    }

    return '';
}
