import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const farewells = messages.farewells;

// say goodbye
export function execute(msg, filteredMsg) {
    for (let i = 0, n = farewells.length; i < n; i++) {
        if (filteredMsg === farewells[i].toLowerCase()) {
            return farewells[randomMath(n)];
        }
    }

    return '';
}
