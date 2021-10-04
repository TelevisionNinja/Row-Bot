import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const christmas = messages.christmas,
    christmasEve = messages.christmasEve;

const christmasSet = new Set(christmas.map(c => c.toLowerCase())),
    christmasEveSet = new Set(christmasEve.map(c => c.toLowerCase()));

// wish a merry christmas
export function execute(msg, filteredMsg) {
    if (christmasSet.has(filteredMsg)) {
        return christmas[randomMath(christmas.length)];
    }

    if (christmasEveSet.has(filteredMsg)) {
        return christmasEve[randomMath(christmasEve.length)];
    }

    return '';
}
