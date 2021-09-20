import { default as messages } from '../messages.json';
import { randomMath } from '../lib/randomFunctions.js';

const valentines = messages.valentines,
    valentinesLowerCase = valentines.map(v => v.toLowerCase());

const valentinesMap = new Map();

valentinesLowerCase.forEach(v => valentinesMap.set(v, true));

// wish a happy valentine's day
export function execute(msg, filteredMsg) {
    if (valentinesMap.get(filteredMsg)) {
        return valentines[randomMath(valentines.length)];
    }

    return '';
}
