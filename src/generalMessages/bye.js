import messages from '../../config/messages.json' with { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const farewells = messages.farewells;

const farewellsSet = new Set(farewells.map(f => f.toLowerCase()));

// say goodbye
export function execute(msg, filteredMsg) {
    if (farewellsSet.has(filteredMsg)) {
        return farewells[randomInteger(farewells.length)];
    }

    return '';
}
