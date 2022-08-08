import messages from '../../config/messages.json' assert { type: 'json' };
import { randomInteger } from '../lib/randomFunctions.js';

const christmas = messages.christmas,
    christmasEve = messages.christmasEve;

const christmasSet = new Set(christmas.map(c => c.toLowerCase())),
    christmasEveSet = new Set(christmasEve.map(c => c.toLowerCase()));

// wish a merry christmas
export function execute(msg, filteredMsg) {
    if (christmasSet.has(filteredMsg)) {
        return christmas[randomInteger(christmas.length)];
    }

    if (christmasEveSet.has(filteredMsg)) {
        return christmasEve[randomInteger(christmasEve.length)];
    }

    return '';
}
