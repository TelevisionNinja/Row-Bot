import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const christmas = messages.christmas,
    christmasEve = messages.christmasEve,
    christmasLowerCase = christmas.map(c => c.toLowerCase()),
    christmasEveLowerCase = christmasEve.map(c => c.toLowerCase());

const christmasMap = new Map(),
    christmasEveMap = new Map();

christmasLowerCase.forEach(c => christmasMap.set(c, true));
christmasEveLowerCase.forEach(c => christmasEveMap.set(c, true));

// wish a merry christmas
export function execute(msg, filteredMsg) {
    if (christmasMap.get(filteredMsg)) {
        return christmas[randomMath(christmas.length)];
    }

    if (christmasEveMap.get(filteredMsg)) {
        return christmasEve[randomMath(christmasEve.length)];
    }

    return '';
}
